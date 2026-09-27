import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.coupon.upsert({
    where: { code: 'FLYXO10' },
    update: { isActive: true },
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
    update: { isActive: true },
    create: {
      code: 'FLYXO50',
      description: '₹50 off',
      discountAmount: 50,
      minOrderAmount: 200,
      maxUses: 500,
    },
  });
  console.log('✅ Coupons FLYXO10, FLYXO50 ready');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
