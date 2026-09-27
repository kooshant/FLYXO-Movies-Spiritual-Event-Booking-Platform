// Use /api in dev so Vite proxy forwards to backend (avoids CORS issues)
export const API_URL = import.meta.env.VITE_API_URL || '/api';

export const CATEGORIES = [
  { id: 'MOVIE', label: 'Movies', icon: '🎬', color: 'from-rose-500 to-pink-600' },
  { id: 'JAGRAN', label: 'Jagran', icon: '🪔', color: 'from-amber-500 to-orange-600' },
  { id: 'RAMLEELA', label: 'Ramleela', icon: '🏹', color: 'from-orange-500 to-red-600' },
  { id: 'BHAGWAT_KATHA', label: 'Bhagwat Katha', icon: '📿', color: 'from-yellow-500 to-amber-600' },
  { id: 'TEMPLE', label: 'Temple Events', icon: '🛕', color: 'from-amber-600 to-yellow-700' },
  { id: 'SATSANG', label: 'Satsang', icon: '🧘', color: 'from-violet-500 to-purple-600' },
  { id: 'CONCERT', label: 'Concerts', icon: '🎵', color: 'from-fuchsia-500 to-purple-600' },
  { id: 'CULTURAL', label: 'Cultural', icon: '🎭', color: 'from-emerald-500 to-teal-600' },
];

export const SPIRITUAL_CATEGORIES = ['JAGRAN', 'RAMLEELA', 'BHAGWAT_KATHA', 'TEMPLE', 'SATSANG', 'SPIRITUAL'];

export const formatPrice = (price) => (price === 0 ? 'Free' : `₹${price}`);

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const getCategoryLabel = (cat) => CATEGORIES.find((c) => c.id === cat)?.label || cat;

export const isSpiritual = (cat) => SPIRITUAL_CATEGORIES.includes(cat);
