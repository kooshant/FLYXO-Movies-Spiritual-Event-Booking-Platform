import prisma from '../config/db.js';
import { success, error, paginate } from '../utils/apiResponse.js';
import { generateSeatsForEvent } from '../services/seatService.js';

const eventInclude = {
  organizer: { include: { user: { select: { name: true, email: true } } } },
  _count: { select: { reviews: true, bookings: true } },
};

/** Build filter from query params */
const buildEventFilter = (query) => {
  const where = { status: 'APPROVED' };
  if (query.category) where.category = query.category;
  if (query.city) where.city = { contains: query.city, mode: 'insensitive' };
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
      { venue: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  if (query.trending === 'true') where.isTrending = true;
  if (query.featured === 'true') where.isFeatured = true;
  if (query.upcoming === 'true') where.startDate = { gte: new Date() };
  return where;
};

export const getEvents = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;
  const where = buildEventFilter(req.query);

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      skip,
      take: limit,
      orderBy: { startDate: 'asc' },
      include: eventInclude,
    }),
    prisma.event.count({ where }),
  ]);

  return success(res, { events, pagination: paginate(page, limit, total) });
};

export const getEventById = async (req, res) => {
  const event = await prisma.event.findUnique({
    where: { id: req.params.id },
    include: {
      ...eventInclude,
      reviews: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, avatar: true } } },
      },
    },
  });
  if (!event) return error(res, 'Event not found', 404);
  return success(res, event);
};

export const getTrending = async (req, res) => {
  const events = await prisma.event.findMany({
    where: { status: 'APPROVED', isTrending: true },
    take: 8,
    orderBy: { rating: 'desc' },
    include: eventInclude,
  });
  return success(res, events);
};

export const getUpcomingSpiritual = async (req, res) => {
  const spiritualCategories = ['JAGRAN', 'RAMLEELA', 'BHAGWAT_KATHA', 'TEMPLE', 'SATSANG', 'SPIRITUAL'];
  const events = await prisma.event.findMany({
    where: {
      status: 'APPROVED',
      category: { in: spiritualCategories },
      startDate: { gte: new Date() },
    },
    take: 8,
    orderBy: { startDate: 'asc' },
    include: eventInclude,
  });
  return success(res, events);
};

export const getMovieRecommendations = async (req, res) => {
  const events = await prisma.event.findMany({
    where: { status: 'APPROVED', category: 'MOVIE' },
    take: 8,
    orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
    include: eventInclude,
  });
  return success(res, events);
};

export const getNearbyEvents = async (req, res) => {
  const { lat, lng, radius = 50 } = req.query;
  if (!lat || !lng) return error(res, 'Latitude and longitude required', 400);

  const events = await prisma.event.findMany({
    where: {
      status: 'APPROVED',
      latitude: { not: null },
      longitude: { not: null },
      startDate: { gte: new Date() },
    },
    include: eventInclude,
  });

  // Simple haversine distance filter (km)
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const nearby = events.filter((e) => {
    const dLat = toRad(e.latitude - parseFloat(lat));
    const dLng = toRad(e.longitude - parseFloat(lng));
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(parseFloat(lat))) * Math.cos(toRad(e.latitude)) * Math.sin(dLng / 2) ** 2;
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return dist <= parseFloat(radius);
  });

  return success(res, nearby);
};

export const createEvent = async (req, res) => {
  const organizer = await prisma.organizer.findUnique({ where: { userId: req.user.id } });
  if (!organizer) return error(res, 'Organizer profile not found', 404);

  const data = {
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    venue: req.body.venue,
    address: req.body.address,
    city: req.body.city,
    startDate: new Date(req.body.startDate),
    endDate: req.body.endDate ? new Date(req.body.endDate) : null,
    ticketPrice: parseFloat(req.body.ticketPrice) || 0,
    totalSeats: parseInt(req.body.totalSeats) || 100,
    availableSeats: parseInt(req.body.totalSeats) || 100,
    latitude: req.body.latitude ? parseFloat(req.body.latitude) : null,
    longitude: req.body.longitude ? parseFloat(req.body.longitude) : null,
    isLiveStream: req.body.isLiveStream === 'true' || req.body.isLiveStream === true,
    liveStreamUrl: req.body.liveStreamUrl || null,
    organizerId: organizer.id,
    status: 'PENDING',
  };
  if (req.file) {
    data.banner = `/uploads/${req.file.filename}`;
  } else if (req.body.bannerUrl?.startsWith('http')) {
    data.banner = req.body.bannerUrl.trim();
  }

  const event = await prisma.event.create({ data, include: eventInclude });
  await generateSeatsForEvent(event.id, event.totalSeats);

  return success(res, event, 'Event created and pending approval', 201);
};

export const updateEvent = async (req, res) => {
  const event = await prisma.event.findFirst({
    where: { id: req.params.id, organizer: { userId: req.user.id } },
  });
  if (!event) return error(res, 'Event not found or unauthorized', 404);

  const data = { ...req.body };
  if (req.file) {
    data.banner = `/uploads/${req.file.filename}`;
  } else if (req.body.bannerUrl?.startsWith('http')) {
    data.banner = req.body.bannerUrl.trim();
  }
  delete data.bannerUrl;

  const updated = await prisma.event.update({
    where: { id: req.params.id },
    data,
    include: eventInclude,
  });
  return success(res, updated, 'Event updated');
};

export const deleteEvent = async (req, res) => {
  const event = await prisma.event.findFirst({
    where: { id: req.params.id, organizer: { userId: req.user.id } },
  });
  if (!event) return error(res, 'Event not found or unauthorized', 404);

  await prisma.event.delete({ where: { id: req.params.id } });
  return success(res, null, 'Event deleted');
};

export const getOrganizerEvents = async (req, res) => {
  const organizer = await prisma.organizer.findUnique({ where: { userId: req.user.id } });
  if (!organizer) return error(res, 'Organizer profile not found', 404);

  const events = await prisma.event.findMany({
    where: { organizerId: organizer.id },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { bookings: true, seats: true } },
    },
  });
  return success(res, events);
};

export const approveEvent = async (req, res) => {
  const { status } = req.body;
  const event = await prisma.event.update({
    where: { id: req.params.id },
    data: { status },
    include: eventInclude,
  });
  return success(res, event, `Event ${status.toLowerCase()}`);
};

export const getPendingEvents = async (req, res) => {
  const events = await prisma.event.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    include: eventInclude,
  });
  return success(res, events);
};
