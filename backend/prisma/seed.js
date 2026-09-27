import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { EVENT_BANNERS } from './eventBanners.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding FLYXO database...');

  const adminPass = await bcrypt.hash('admin123', 12);
  const userPass = await bcrypt.hash('user123', 12);
  const orgPass = await bcrypt.hash('organizer123', 12);

  await prisma.user.upsert({
    where: { email: 'admin@flyxo.com' },
    update: {
      password: adminPass,
      name: 'FLYXO Admin',
      role: 'ADMIN',
      isActive: true,
      emailVerified: true,
    },
    create: {
      email: 'admin@flyxo.com',
      password: adminPass,
      name: 'FLYXO Admin',
      role: 'ADMIN',
      phone: '9999999999',
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@flyxo.com' },
    update: { password: userPass, role: 'USER', isActive: true, emailVerified: true },
    create: {
      email: 'user@flyxo.com',
      password: userPass,
      name: 'Rahul Sharma',
      role: 'USER',
      phone: '9876543210',
    },
  });

  const orgUser = await prisma.user.upsert({
    where: { email: 'organizer@flyxo.com' },
    update: { password: orgPass, role: 'ORGANIZER', isActive: true, emailVerified: true },
    create: {
      email: 'organizer@flyxo.com',
      password: orgPass,
      name: 'Priya Events',
      role: 'ORGANIZER',
      phone: '9123456789',
    },
  });

  const organizer = await prisma.organizer.upsert({
    where: { userId: orgUser.id },
    update: {},
    create: {
      userId: orgUser.id,
      orgName: 'Divine Events India',
      description: 'Premium spiritual and cultural event organizer',
      isVerified: true,
    },
  });

  // Clear old events (fixes duplicate cards + broken images on re-seed)
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.event.deleteMany();

  const events = [
    {
      title: 'Pushpa 2: The Rule',
      description: 'The epic conclusion to Pushpa Raj saga. All India blockbuster.',
      category: 'MOVIE',
      banner: EVENT_BANNERS.PUSHPA_2,
      venue: 'PVR Phoenix',
      address: 'Lower Parel, Mumbai',
      city: 'Mumbai',
      latitude: 19.0176,
      longitude: 72.8562,
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      ticketPrice: 350,
      totalSeats: 80,
      availableSeats: 80,
      isTrending: true,
      isFeatured: true,
      status: 'APPROVED',
      rating: 4.5,
      reviewCount: 120,
    },
    {
      title: 'Kantara: A Legend Chapter 1',
      description: 'Rishab Shetty returns in this supernatural thriller sequel.',
      category: 'MOVIE',
      banner: EVENT_BANNERS.KANTARA,
      venue: 'INOX Megaplex',
      address: 'Andheri West, Mumbai',
      city: 'Mumbai',
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      ticketPrice: 280,
      totalSeats: 100,
      availableSeats: 100,
      isTrending: true,
      status: 'APPROVED',
      rating: 4.7,
      reviewCount: 89,
    },
    {
      title: 'Stree 2: Sarkate Ka Aatank',
      description: 'Horror-comedy sequel with Shraddha Kapoor & Rajkummar Rao.',
      category: 'MOVIE',
      banner: EVENT_BANNERS.STREE_2,
      venue: 'Cinepolis',
      address: 'DLF Mall, Gurgaon',
      city: 'Gurgaon',
      startDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      ticketPrice: 300,
      totalSeats: 90,
      availableSeats: 90,
      isFeatured: true,
      status: 'APPROVED',
      rating: 4.3,
    },
    {
      title: 'Maha Jagran - Hanuman Chalisa',
      description: 'All-night devotional jagran with renowned bhajan singers.',
      category: 'JAGRAN',
      banner: EVENT_BANNERS.JAGRAN,
      venue: 'Shri Ram Mandir Ground',
      address: 'Karol Bagh, Delhi',
      city: 'Delhi',
      latitude: 28.6519,
      longitude: 77.1909,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ticketPrice: 0,
      totalSeats: 500,
      availableSeats: 500,
      isTrending: true,
      status: 'APPROVED',
      rating: 4.9,
    },
    {
      title: 'Ramleela 2026 - Ayodhya Edition',
      description: 'Grand Ramleela performance with 200+ artists.',
      category: 'RAMLEELA',
      banner: EVENT_BANNERS.RAMLEELA,
      venue: 'Ram Katha Park',
      address: 'Ayodhya, UP',
      city: 'Ayodhya',
      latitude: 26.7922,
      longitude: 82.1998,
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      ticketPrice: 150,
      totalSeats: 300,
      availableSeats: 300,
      isFeatured: true,
      status: 'APPROVED',
      rating: 4.8,
    },
    {
      title: '7-Day Bhagwat Katha',
      description: 'Sacred Bhagwat Katha by Pujya Maharaj Ji.',
      category: 'BHAGWAT_KATHA',
      banner: EVENT_BANNERS.BHAGWAT,
      venue: 'ISKCON Temple',
      address: 'Vrindavan, Mathura',
      city: 'Vrindavan',
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
      ticketPrice: 0,
      totalSeats: 1000,
      availableSeats: 1000,
      status: 'APPROVED',
      rating: 5.0,
    },
    {
      title: 'Shivratri Temple Celebration',
      description: 'Special Maha Shivratri abhishek and aarti at ancient temple.',
      category: 'TEMPLE',
      banner: EVENT_BANNERS.TEMPLE,
      venue: 'Kashi Vishwanath Temple',
      address: 'Varanasi, UP',
      city: 'Varanasi',
      startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      ticketPrice: 0,
      totalSeats: 2000,
      availableSeats: 2000,
      status: 'APPROVED',
      rating: 4.9,
    },
    {
      title: 'Art of Living Satsang',
      description: 'Guided meditation and wisdom session.',
      category: 'SATSANG',
      banner: EVENT_BANNERS.SATSANG,
      venue: 'Bangalore Ashram',
      address: 'Kanakapura Road, Bangalore',
      city: 'Bangalore',
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      ticketPrice: 200,
      totalSeats: 150,
      availableSeats: 150,
      status: 'APPROVED',
      rating: 4.7,
    },
    {
      title: 'AR Rahman Live in Concert',
      description: 'Legendary composer live with full orchestra.',
      category: 'CONCERT',
      banner: EVENT_BANNERS.AR_RAHMAN,
      venue: 'DY Patil Stadium',
      address: 'Nerul, Navi Mumbai',
      city: 'Mumbai',
      startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      ticketPrice: 2500,
      totalSeats: 120,
      availableSeats: 120,
      isTrending: true,
      isFeatured: true,
      status: 'APPROVED',
      rating: 4.9,
      isLiveStream: true,
      liveStreamUrl: 'https://flyxo.live/arrahman',
    },
    {
      title: 'Surajkund International Crafts Mela',
      description: 'Traditional handicrafts, folk dance, and cultural performances.',
      category: 'CULTURAL',
      banner: EVENT_BANNERS.CULTURAL,
      venue: 'Surajkund Mela Ground',
      address: 'Faridabad, Haryana',
      city: 'Faridabad',
      startDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      ticketPrice: 100,
      totalSeats: 400,
      availableSeats: 400,
      status: 'APPROVED',
      rating: 4.4,
    },
  ];

  for (const e of events) {
    const event = await prisma.event.create({
      data: { ...e, organizerId: organizer.id },
    });

    const rows = 8;
    const seatsPerRow = Math.ceil(event.totalSeats / rows);
    const rowLabels = 'ABCDEFGH'.split('');
    const seats = [];
    let count = 0;
    for (let r = 0; r < rows && count < event.totalSeats; r++) {
      for (let n = 1; n <= seatsPerRow && count < event.totalSeats; n++) {
        seats.push({
          eventId: event.id,
          row: rowLabels[r],
          number: n,
          label: `${rowLabels[r]}${n}`,
        });
        count++;
      }
    }
    await prisma.seat.createMany({ data: seats });
  }

  await prisma.coupon.upsert({
    where: { code: 'FLYXO10' },
    update: {},
    create: {
      code: 'FLYXO10',
      description: '10% off on tickets',
      discountPercent: 10,
      minOrderAmount: 100,
      maxUses: 1000,
    },
  });
  await prisma.coupon.upsert({
    where: { code: 'FLYXO50' },
    update: {},
    create: {
      code: 'FLYXO50',
      description: '₹50 off',
      discountAmount: 50,
      minOrderAmount: 200,
      maxUses: 500,
    },
  });

  console.log('✅ Seed complete! (10 events + coupons FLYXO10, FLYXO50)');
  console.log('   Admin: admin@flyxo.com / admin123');
  console.log('   User:  user@flyxo.com / user123');
  console.log('   Org:   organizer@flyxo.com / organizer123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
