import prisma from '../config/db.js';
import { success, error } from '../utils/apiResponse.js';

export const addReview = async (req, res) => {
  const { eventId, rating, comment } = req.body;

  const existing = await prisma.review.findUnique({
    where: { userId_eventId: { userId: req.user.id, eventId } },
  });
  if (existing) return error(res, 'You already reviewed this event', 400);

  const review = await prisma.review.create({
    data: { userId: req.user.id, eventId, rating, comment },
    include: { user: { select: { name: true, avatar: true } } },
  });

  const stats = await prisma.review.aggregate({
    where: { eventId },
    _avg: { rating: true },
    _count: true,
  });

  await prisma.event.update({
    where: { id: eventId },
    data: { rating: stats._avg.rating || 0, reviewCount: stats._count },
  });

  return success(res, review, 'Review added', 201);
};

export const getEventReviews = async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { eventId: req.params.eventId },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, avatar: true } } },
  });
  return success(res, reviews);
};
