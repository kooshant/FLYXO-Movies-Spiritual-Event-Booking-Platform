import prisma from '../config/db.js';
import { success, error, paginate } from '../utils/apiResponse.js';
import { generateBookingCode } from '../utils/bookingCode.js';
import { generateTicketQR } from '../services/qrService.js';
import { sendBookingConfirmation } from '../services/emailService.js';
import { notifyBookingConfirmed } from '../services/notificationService.js';
import { getRazorpay } from '../config/razorpay.js';
import { getHoldExpiry, HOLD_MINUTES } from '../services/holdService.js';
import { validateCoupon, applyCouponUsage } from '../services/couponService.js';

export const getSeats = async (req, res) => {
  const now = new Date();
  const seats = await prisma.seat.findMany({
    where: { eventId: req.params.eventId },
    orderBy: [{ row: 'asc' }, { number: 'asc' }],
    select: {
      id: true,
      row: true,
      number: true,
      label: true,
      isBooked: true,
      heldByUserId: true,
      heldUntil: true,
    },
  });

  const mapped = seats.map((s) => ({
    ...s,
    isHeld: !s.isBooked && s.heldUntil && s.heldUntil > now,
    isHeldByMe: s.heldByUserId === req.user?.id && s.heldUntil && s.heldUntil > now,
  }));
  return success(res, mapped);
};

/** Hold seats for 10 minutes while user completes payment */
export const holdSeats = async (req, res) => {
  const { eventId, seatIds } = req.body;
  const userId = req.user.id;
  const holdUntil = getHoldExpiry();
  const now = new Date();

  const seats = await prisma.seat.findMany({
    where: {
      id: { in: seatIds },
      eventId,
      isBooked: false,
    },
  });

  const unavailable = seats.filter(
    (s) => s.heldUntil && s.heldUntil > now && s.heldByUserId !== userId
  );
  if (unavailable.length > 0) {
    return error(res, 'Some seats are held by another user', 400);
  }
  if (seats.length !== seatIds.length) {
    return error(res, 'Invalid seat selection', 400);
  }

  await prisma.seat.updateMany({
    where: { id: { in: seatIds } },
    data: { heldUntil: holdUntil, heldByUserId: userId },
  });

  const io = req.app.get('io');
  if (io) io.to(`event-${eventId}`).emit('seatsUpdated', { eventId });

  return success(res, { holdUntil, holdMinutes: HOLD_MINUTES }, 'Seats held');
};

export const createBookingOrder = async (req, res) => {
  const { eventId, seatIds, donationAmount = 0, couponCode } = req.body;
  const userId = req.user.id;
  const now = new Date();

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.status !== 'APPROVED') return error(res, 'Event not available', 400);

  const seats = await prisma.seat.findMany({
    where: { id: { in: seatIds }, eventId, isBooked: false },
  });

  const blocked = seats.filter(
    (s) => s.heldUntil && s.heldUntil > now && s.heldByUserId !== userId
  );
  if (blocked.length > 0) return error(res, 'Seat hold expired or taken. Select again.', 400);
  if (seats.length !== seatIds.length) {
    return error(res, 'Some seats are already booked', 400);
  }

  const ticketTotal = seats.length * event.ticketPrice;
  let discountAmount = 0;
  let appliedCoupon = null;

  if (couponCode) {
    const couponResult = await validateCoupon(couponCode, ticketTotal);
    if (!couponResult.valid) return error(res, couponResult.message, 400);
    discountAmount = couponResult.discount;
    appliedCoupon = couponResult.coupon.code;
  }

  const subtotal = ticketTotal - discountAmount + parseFloat(donationAmount || 0);
  const totalAmount = Math.max(0, subtotal);
  const holdExpiresAt = getHoldExpiry();

  const booking = await prisma.booking.create({
    data: {
      bookingCode: generateBookingCode(),
      userId,
      eventId,
      totalAmount,
      donationAmount: parseFloat(donationAmount || 0),
      discountAmount,
      couponCode: appliedCoupon,
      status: 'PENDING',
      holdExpiresAt,
    },
    include: { event: true, user: true },
  });

  // Reserve seats temporarily (linked to pending booking)
  await prisma.seat.updateMany({
    where: { id: { in: seatIds } },
    data: { isBooked: true, bookingId: booking.id, heldUntil: null, heldByUserId: null },
  });

  await prisma.event.update({
    where: { id: eventId },
    data: { availableSeats: { decrement: seats.length } },
  });

  // Free events — confirm immediately without Razorpay
  if (totalAmount === 0) {
    const qrCode = await generateTicketQR({ ...booking, seats });
    const confirmed = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'CONFIRMED', qrCode },
      include: { event: true, seats: true, user: { select: { id: true, name: true, email: true } } },
    });
    await prisma.payment.create({
      data: { userId, bookingId: booking.id, amount: 0, status: 'SUCCESS' },
    });
    if (appliedCoupon) await applyCouponUsage(appliedCoupon);
    await notifyBookingConfirmed(userId, event.title, booking.bookingCode);
    sendBookingConfirmation(booking.user, confirmed, event).catch(console.error);
    return success(res, { booking: confirmed, free: true }, 'Free booking confirmed', 201);
  }

  let order;
  try {
    order = await getRazorpay().orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: booking.bookingCode,
      notes: { bookingId: booking.id, eventId, userId },
    });
  } catch (err) {
    // Roll back seat reservation on payment gateway failure
    await prisma.seat.updateMany({
      where: { bookingId: booking.id },
      data: { isBooked: false, bookingId: null },
    });
    await prisma.event.update({
      where: { id: eventId },
      data: { availableSeats: { increment: seats.length } },
    });
    await prisma.booking.delete({ where: { id: booking.id } });
    return error(res, err.message || 'Payment gateway error. Check Razorpay keys in .env', 502);
  }

  await prisma.payment.create({
    data: {
      userId,
      bookingId: booking.id,
      razorpayOrderId: order.id,
      amount: totalAmount,
      type: 'BOOKING',
      status: 'PENDING',
    },
  });

  return success(res, {
    booking,
    order: { id: order.id, amount: order.amount, currency: order.currency },
    key: process.env.RAZORPAY_KEY_ID,
    holdExpiresAt,
    holdMinutes: HOLD_MINUTES,
  }, 'Order created', 201);
};

/** Cancel confirmed booking & release seats */
export const cancelBooking = async (req, res) => {
  const booking = await prisma.booking.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: { seats: true, payment: true, event: true },
  });

  if (!booking) return error(res, 'Booking not found', 404);
  if (booking.status === 'CANCELLED') return error(res, 'Already cancelled', 400);
  if (booking.status !== 'CONFIRMED' && booking.status !== 'PENDING') {
    return error(res, 'Cannot cancel this booking', 400);
  }

  if (booking.event.startDate < new Date()) {
    return error(res, 'Cannot cancel — event already started', 400);
  }

  await prisma.$transaction([
    prisma.seat.updateMany({
      where: { bookingId: booking.id },
      data: { isBooked: false, bookingId: null, heldUntil: null, heldByUserId: null },
    }),
    prisma.event.update({
      where: { id: booking.eventId },
      data: { availableSeats: { increment: booking.seats.length } },
    }),
    prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'CANCELLED' },
    }),
    ...(booking.payment
      ? [
          prisma.payment.update({
            where: { id: booking.payment.id },
            data: { status: 'REFUNDED' },
          }),
        ]
      : []),
  ]);

  const io = req.app.get('io');
  if (io) io.to(`event-${booking.eventId}`).emit('seatsUpdated', { eventId: booking.eventId });

  return success(res, null, 'Booking cancelled. Refund will be processed in 5-7 days.');
};

export const getMyBookings = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where: { userId: req.user.id },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        event: { select: { id: true, title: true, banner: true, startDate: true, venue: true, city: true, category: true } },
        seats: { select: { label: true, row: true, number: true } },
      },
    }),
    prisma.booking.count({ where: { userId: req.user.id } }),
  ]);

  return success(res, { bookings, pagination: paginate(page, limit, total) });
};

export const getBookingById = async (req, res) => {
  const booking = await prisma.booking.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: { event: true, seats: true, payment: true },
  });
  if (!booking) return error(res, 'Booking not found', 404);
  return success(res, booking);
};

export const getOrganizerBookings = async (req, res) => {
  const organizer = await prisma.organizer.findUnique({ where: { userId: req.user.id } });
  if (!organizer) return error(res, 'Organizer not found', 404);

  const bookings = await prisma.booking.findMany({
    where: { event: { organizerId: organizer.id }, status: 'CONFIRMED' },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      event: { select: { title: true } },
      seats: { select: { label: true } },
    },
  });
  return success(res, bookings);
};

export const getOrganizerAnalytics = async (req, res) => {
  const organizer = await prisma.organizer.findUnique({ where: { userId: req.user.id } });
  if (!organizer) return error(res, 'Organizer not found', 404);

  const bookings = await prisma.booking.findMany({
    where: { event: { organizerId: organizer.id }, status: 'CONFIRMED' },
    select: { totalAmount: true, donationAmount: true, createdAt: true, eventId: true },
  });

  const totalRevenue = bookings.reduce((s, b) => s + b.totalAmount, 0);
  const totalDonations = bookings.reduce((s, b) => s + b.donationAmount, 0);
  const eventCount = await prisma.event.count({ where: { organizerId: organizer.id } });

  return success(res, {
    totalRevenue,
    totalDonations,
    totalBookings: bookings.length,
    eventCount,
    recentBookings: bookings.slice(0, 10),
  });
};

export const createDonation = async (req, res) => {
  const { amount, templeName } = req.body;

  let order;
  try {
    order = await getRazorpay().orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `DON-${Date.now()}`,
      notes: { type: 'donation', templeName },
    });
  } catch (err) {
    return error(res, err.message || 'Payment gateway error', 502);
  }

  const payment = await prisma.payment.create({
    data: {
      userId: req.user.id,
      razorpayOrderId: order.id,
      amount,
      type: 'DONATION',
      status: 'PENDING',
      metadata: { templeName },
    },
  });

  return success(res, { order, payment, key: process.env.RAZORPAY_KEY_ID }, 'Donation order created', 201);
};
