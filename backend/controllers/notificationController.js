import prisma from '../config/db.js';
import { success, error } from '../utils/apiResponse.js';

export const getNotifications = async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return success(res, notifications);
};

export const markAsRead = async (req, res) => {
  await prisma.notification.update({
    where: { id: req.params.id, userId: req.user.id },
    data: { isRead: true },
  });
  return success(res, null, 'Marked as read');
};

export const markAllRead = async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, isRead: false },
    data: { isRead: true },
  });
  return success(res, null, 'All notifications marked as read');
};

export const getUnreadCount = async (req, res) => {
  const count = await prisma.notification.count({
    where: { userId: req.user.id, isRead: false },
  });
  return success(res, { count });
};
