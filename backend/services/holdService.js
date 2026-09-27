import prisma from '../config/db.js';

const HOLD_MINUTES = parseInt(process.env.SEAT_HOLD_MINUTES || '10');

/** Release expired seat holds and stale pending bookings */
export const releaseExpiredHolds = async (io) => {
  const now = new Date();

  const expiredSeats = await prisma.seat.updateMany({
    where: { heldUntil: { lt: now }, isBooked: false },
    data: { heldUntil: null, heldByUserId: null },
  });

  const staleBookings = await prisma.booking.findMany({
    where: { status: 'PENDING', holdExpiresAt: { lt: now } },
    include: { seats: true },
  });

  for (const b of staleBookings) {
    await prisma.$transaction([
      prisma.seat.updateMany({
        where: { bookingId: b.id },
        data: { isBooked: false, bookingId: null, heldUntil: null, heldByUserId: null },
      }),
      prisma.event.update({
        where: { id: b.eventId },
        data: { availableSeats: { increment: b.seats.length } },
      }),
      prisma.booking.update({ where: { id: b.id }, data: { status: 'CANCELLED' } }),
    ]);
    if (io) io.to(`event-${b.eventId}`).emit('seatsUpdated', { eventId: b.eventId });
  }

  if (expiredSeats.count > 0 || staleBookings.length > 0) {
    console.log(`[Hold] Released ${expiredSeats.count} seats, ${staleBookings.length} stale bookings`);
  }
};

export const getHoldExpiry = () => new Date(Date.now() + HOLD_MINUTES * 60 * 1000);

export { HOLD_MINUTES };
