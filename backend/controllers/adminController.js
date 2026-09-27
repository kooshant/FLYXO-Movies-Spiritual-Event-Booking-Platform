import prisma from '../config/db.js';
import { success, error, paginate } from '../utils/apiResponse.js';

export const getDashboardStats = async (req, res) => {
  const [users, organizers, events, bookings, revenue] = await Promise.all([
    prisma.user.count(),
    prisma.organizer.count(),
    prisma.event.count(),
    prisma.booking.count({ where: { status: 'CONFIRMED' } }),
    prisma.booking.aggregate({
      where: { status: 'CONFIRMED' },
      _sum: { totalAmount: true },
    }),
  ]);

  const pendingEvents = await prisma.event.count({ where: { status: 'PENDING' } });
  const categoryBreakdown = await prisma.event.groupBy({
    by: ['category'],
    _count: true,
    where: { status: 'APPROVED' },
  });

  return success(res, {
    users,
    organizers,
    events,
    bookings,
    pendingEvents,
    totalRevenue: revenue._sum.totalAmount || 0,
    categoryBreakdown,
  });
};

export const getAllUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: { select: { bookings: true } },
      },
    }),
    prisma.user.count(),
  ]);

  return success(res, { users, pagination: paginate(page, limit, total) });
};

export const updateUser = async (req, res) => {
  const { role, isActive } = req.body;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      ...(role && { role }),
      ...(typeof isActive === 'boolean' && { isActive }),
    },
    select: { id: true, email: true, name: true, role: true, isActive: true },
  });
  return success(res, user, 'User updated');
};

export const getAllOrganizers = async (req, res) => {
  const organizers = await prisma.organizer.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, isActive: true } },
      _count: { select: { events: true } },
    },
  });
  return success(res, organizers);
};

export const verifyOrganizer = async (req, res) => {
  const organizer = await prisma.organizer.update({
    where: { id: req.params.id },
    data: { isVerified: true },
    include: { user: { select: { name: true, email: true } } },
  });
  return success(res, organizer, 'Organizer verified');
};

export const getAllBookings = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        event: { select: { title: true, category: true } },
        seats: { select: { label: true } },
      },
    }),
    prisma.booking.count(),
  ]);

  return success(res, { bookings, pagination: paginate(page, limit, total) });
};
