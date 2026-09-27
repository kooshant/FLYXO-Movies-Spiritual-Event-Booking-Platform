/**
 * Update banners on existing events without full re-seed.
 * Run: node prisma/updateBanners.js
 */
import { PrismaClient } from '@prisma/client';
import { EVENT_BANNERS } from './eventBanners.js';

const prisma = new PrismaClient();

const titleMap = [
  { match: /pushpa/i, banner: EVENT_BANNERS.PUSHPA_2 },
  { match: /kantara/i, banner: EVENT_BANNERS.KANTARA },
  { match: /stree/i, banner: EVENT_BANNERS.STREE_2 },
  { match: /jagran/i, banner: EVENT_BANNERS.JAGRAN },
  { match: /ramleela/i, banner: EVENT_BANNERS.RAMLEELA },
  { match: /bhagwat/i, banner: EVENT_BANNERS.BHAGWAT },
  { match: /shivratri|temple/i, banner: EVENT_BANNERS.TEMPLE },
  { match: /satsang/i, banner: EVENT_BANNERS.SATSANG },
  { match: /rahman/i, banner: EVENT_BANNERS.AR_RAHMAN },
  { match: /surajkund|mela/i, banner: EVENT_BANNERS.CULTURAL },
];

async function main() {
  const events = await prisma.event.findMany();
  for (const e of events) {
    const rule = titleMap.find((r) => r.match.test(e.title));
    if (rule) {
      await prisma.event.update({
        where: { id: e.id },
        data: { banner: rule.banner },
      });
      console.log('Updated:', e.title);
    }
  }
  console.log('✅ Banners updated');
}

main().finally(() => prisma.$disconnect());
