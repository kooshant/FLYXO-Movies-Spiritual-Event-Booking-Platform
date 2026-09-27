import prisma from '../config/db.js';
import { success, error } from '../utils/apiResponse.js';

export const getWishlist = async (req, res) => {
  const items = await prisma.wishlist.findMany({
    where: { userId: req.user.id },
    include: {
      event: {
        include: { organizer: { select: { orgName: true } } },
      },
    },
  });
  return success(res, items);
};

export const addToWishlist = async (req, res) => {
  const { eventId } = req.body;
  try {
    const item = await prisma.wishlist.create({
      data: { userId: req.user.id, eventId },
      include: { event: true },
    });
    return success(res, item, 'Added to wishlist', 201);
  } catch {
    return error(res, 'Already in wishlist', 400);
  }
};

export const removeFromWishlist = async (req, res) => {
  await prisma.wishlist.delete({
    where: { userId_eventId: { userId: req.user.id, eventId: req.params.eventId } },
  });
  return success(res, null, 'Removed from wishlist');
};

export const checkWishlist = async (req, res) => {
  const item = await prisma.wishlist.findUnique({
    where: { userId_eventId: { userId: req.user.id, eventId: req.params.eventId } },
  });
  return success(res, { isWishlisted: !!item });
};
