import prisma from '../config/db.js';

/** Create in-app notification */
export const createNotification = async (userId, title, message, type = 'info') => {
  return prisma.notification.create({
    data: { userId, title, message, type },
  });
};

/** Notify booking confirmation */
export const notifyBookingConfirmed = async (userId, eventTitle, bookingCode) => {
  return createNotification(
    userId,
    'Booking Confirmed!',
    `Your tickets for "${eventTitle}" are confirmed. Code: ${bookingCode}`,
    'booking'
  );
};
