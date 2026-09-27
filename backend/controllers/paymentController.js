import crypto from 'crypto';
import prisma from '../config/db.js';
import { getRazorpay } from '../config/razorpay.js';
import { success, error } from '../utils/apiResponse.js';
import { generateTicketQR } from '../services/qrService.js';
import { sendBookingConfirmation } from '../services/emailService.js';
import { notifyBookingConfirmed } from '../services/notificationService.js';
import { applyCouponUsage } from '../services/couponService.js';

/** Verify Razorpay signature */
const verifySignature = (orderId, paymentId, signature) => {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expected === signature;
};

/** Public key for frontend checkout */
export const getPaymentConfig = async (req, res) => {
  if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('placeholder')) {
    return error(res, 'Razorpay not configured. Add keys in backend/.env', 503);
  }
  return success(res, {
    keyId: process.env.RAZORPAY_KEY_ID,
    currency: 'INR',
  });
};

/** After Razorpay success — confirm ticket booking */
export const verifyBookingPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

  if (!verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    return error(res, 'Payment verification failed', 400);
  }

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId: req.user.id },
    include: { event: true, user: true, seats: true },
  });
  if (!booking) return error(res, 'Booking not found', 404);
  if (booking.status === 'CONFIRMED') {
    return success(res, booking, 'Already confirmed');
  }

  const qrCode = await generateTicketQR(booking);

  const updatedBooking = await prisma.$transaction(async (tx) => {
    const b = await tx.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED', qrCode },
      include: {
        event: true,
        seats: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
    await tx.payment.update({
      where: { bookingId },
      data: {
        status: 'SUCCESS',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
    });
    return b;
  });

  if (updatedBooking.couponCode) await applyCouponUsage(updatedBooking.couponCode);

  await notifyBookingConfirmed(booking.userId, booking.event.title, booking.bookingCode);
  sendBookingConfirmation(booking.user, updatedBooking, booking.event).catch(console.error);

  const io = req.app.get('io');
  if (io) io.to(`event-${booking.eventId}`).emit('seatsUpdated', { eventId: booking.eventId });

  return success(res, updatedBooking, 'Payment verified. Booking confirmed!');
};

/** After Razorpay success — confirm temple donation */
export const verifyDonationPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

  if (!verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    return error(res, 'Payment verification failed', 400);
  }

  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, userId: req.user.id, type: 'DONATION' },
  });
  if (!payment) return error(res, 'Payment record not found', 404);

  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: 'SUCCESS',
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    },
  });

  await notifyBookingConfirmed(
    req.user.id,
    'Temple Donation',
    `DON-${paymentId.slice(0, 8).toUpperCase()}`
  );

  return success(res, updated, 'Donation successful. Thank you! 🙏');
};
