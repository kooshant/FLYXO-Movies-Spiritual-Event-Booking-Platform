/** Fallback & override images when DB banner fails to load */
const BANNERS = {
  pushpa: 'https://m.media-amazon.com/images/M/MV5BZjllNTdiM2QtYjQ0Ni00ZGM1LWFlYmUtNWY0YjMzYWIxOTYxXkEyXkFqcGc@._V1_.jpg',
  kantara: 'https://upload.wikimedia.org/wikipedia/en/5/54/Kantara_%28film%29.jpg',
  stree: 'https://upload.wikimedia.org/wikipedia/en/4/4e/Stree_2_film_poster.jpg',
  jagran: 'https://images.unsplash.com/photo-1605647540914-852290f6bfea?w=800&auto=format&fit=crop&q=85',
  ramleela: 'https://images.unsplash.com/photo-1576092761541-8352934cb538?w=800&auto=format&fit=crop&q=85',
  bhagwat: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop&q=85',
  temple: 'https://images.unsplash.com/photo-1564489568509-066321392bcd?w=800&auto=format&fit=crop&q=85',
  satsang: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=85',
  concert: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&auto=format&fit=crop&q=85',
  rahman: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop&q=85',
  cultural: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=85',
  movie: 'https://images.unsplash.com/photo-1536440136628-849c667e2339?w=800&auto=format&fit=crop&q=85',
  default: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=85',
};

const matchBanner = (title = '', category = '') => {
  const t = title.toLowerCase();
  if (t.includes('pushpa')) return BANNERS.pushpa;
  if (t.includes('kantara')) return BANNERS.kantara;
  if (t.includes('stree')) return BANNERS.stree;
  if (t.includes('war 2') || t.includes('war2')) return BANNERS.war;
  if (t.includes('rahman')) return BANNERS.rahman;
  if (t.includes('jagran')) return BANNERS.jagran;
  if (t.includes('ramleela') || t.includes('ram leela')) return BANNERS.ramleela;
  if (t.includes('bhagwat')) return BANNERS.bhagwat;
  if (t.includes('shivratri') || t.includes('temple')) return BANNERS.temple;
  if (t.includes('satsang')) return BANNERS.satsang;
  if (t.includes('surajkund') || t.includes('mela') || category === 'CULTURAL') return BANNERS.cultural;
  if (category === 'CONCERT') return BANNERS.concert;
  if (category === 'MOVIE') return BANNERS.movie;
  return BANNERS.default;
};

/** Resolve best banner URL for an event card */
export const getEventBanner = (event, useFallbackOnly = false) => {
  if (!useFallbackOnly && event?.banner?.startsWith('http')) {
    return event.banner;
  }
  return matchBanner(event?.title, event?.category);
};
