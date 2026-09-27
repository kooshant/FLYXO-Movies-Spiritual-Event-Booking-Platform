/**
 * Reset demo account passwords (admin login fix).
 * Run: node prisma/resetPasswords.js
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const accounts = [
  { email: 'admin@flyxo.com', password: 'admin123', role: 'ADMIN', name: 'FLYXO Admin' },
  { email: 'user@flyxo.com', password: 'user123', role: 'USER', name: 'Rahul Sharma' },
  { email: 'organizer@flyxo.com', password: 'organizer123', role: 'ORGANIZER', name: 'Priya Events' },
];

async function main() {
  for (const acc of accounts) {
    const hashed = await bcrypt.hash(acc.password, 12);
    await prisma.user.upsert({
      where: { email: acc.email },
      update: { password: hashed, role: acc.role, name: acc.name, isActive: true },
      create: {
        email: acc.email,
        password: hashed,
        role: acc.role,
        name: acc.name,
        isActive: true,
      },
    });
    console.log(`✅ ${acc.email} → password: ${acc.password} (${acc.role})`);
  }
  console.log('\nDone! Try login again.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
