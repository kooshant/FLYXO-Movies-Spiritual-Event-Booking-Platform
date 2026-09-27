import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { eventService } from '../services/eventService';
import EventCard from '../components/events/EventCard';
import CategoryFilter from '../components/events/CategoryFilter';
import Loader from '../components/common/Loader';
import { CATEGORIES } from '../utils/constants';

export default function Home() {
  const [trending, setTrending] = useState([]);
  const [spiritual, setSpiritual] = useState([]);


  const [movies, setMovies] = useState([]);
    const [concerts, setConcerts] = useState([]);
  const [cultural, setCultural] = useState([]);

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');

  useEffect(() => {
    Promise.all([
      eventService.getTrending(),
      eventService.getSpiritual(),
      eventService.getMovies(),
      eventService.getAll(),

    
      
    ])
      .then(([t, s, m, all]) => {

  setTrending(t.data || []);
  setSpiritual(s.data || []);
  setMovies(m.data || []);
  setConcerts(
    t.data.filter((e) => e.category === "CONCERT")
  );
 setCultural(
  all.data.events.filter(
    (e) => e.category === "CULTURAL"
  )
);

  

})

      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center bg-hero-gradient overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-amber-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-rose-500 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-20 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-1.5 rounded-full text-sm text-white mb-6">
              <Sparkles size={16} /> Movies • Jagran • Concerts • Temple Events
            </span>
            <h1 className="font-display text-5xl md:text-7xl font-extrabold text-white leading-tight">
              Book Movies &<br />
              <span className="text-amber-300">Spiritual Events</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl mt-6 max-w-xl">
              India's first platform combining blockbuster movies with Jagran, Ramleela, Bhagwat Katha, and cultural celebrations.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link to="/events" className="btn-primary flex items-center gap-2">
                Explore Events <ArrowRight size={18} />
              </Link>
              <Link to="/events?spiritual=true" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-xl transition flex items-center gap-2">
                🪔 Spiritual Events
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.slice(0, 4).map((cat, i) => (
            <Link
              key={cat.id}
              to={`/events?category=${cat.id}`}
              className={`glass-card p-6 text-center hover:scale-105 transition-all bg-gradient-to-br ${cat.color} bg-opacity-20`}
            >
              <span className="text-4xl">{cat.icon}</span>
              <p className="font-semibold mt-2">{cat.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="section-title">🔥 Trending Now</h2>
          <Link to="/events?trending=true" className="text-flyxo-primary font-semibold hover:underline flex items-center gap-1">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trending.map((e, i) => <EventCard key={e.id} event={e} index={i} />)}
        </div>
      </section>

      {/* Spiritual */}
      <section className="bg-spiritual-gradient/10 py-16">
        <div className="max-w-7xl mx-auto px-4">
        <h2 className="section-title mb-3">🪔 Upcoming Spiritual Events</h2>
          <p className="text-gray-500 mb-8">Jagran, Ramleela, Bhagwat Katha & Temple celebrations</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {spiritual.map((e, i) => <EventCard key={e.id} event={e} index={i} />)}
          </div>
        </div>
      </section>

      {/* Movies */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="section-title mb-8">🎬 Movie Recommendations</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {movies.map((e, i) => <EventCard key={e.id} event={e} index={i} />)}
        </div>
      </section>
      
{/* Concerts */}
<section className="bg-spiritual-gradient/10 py-16">
  <div className="max-w-7xl mx-auto px-4">

    <h2 className="section-title mb-3 ">
      🎵 Upcoming Concerts
    </h2>

    <p className="text-gray-500 mb-8">
      Live music concerts & performances
    </p>

    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {concerts.map((e, i) => (
        <EventCard
          key={e.id}
          event={e}
          index={i}
        />
      ))}
    </div>

  </div>
</section>
{/* Cultural Events */}
<section className="bg-spiritual-gradient/10 py-16">
  <div className="max-w-7xl mx-auto px-4">

    <h2 className="section-title mb-3">
      🎭 Cultural Events
    </h2>

    <p className="text-gray-500 mb-8">
      Traditional festivals, art & cultural performances
    </p>

    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cultural.map((e, i) => (
        <EventCard
          key={e.id}
          event={e}
          index={i}
        />
      ))}
    </div>

  </div>
</section>
      {/* Browse by category */}
      <section className="max-w-7xl mx-auto px-4 py-8 pb-20">
        <h2 className="section-title mb-6">Browse by Category</h2>
        <CategoryFilter selected={category} onChange={setCategory} />
        {category && (
          <Link to={`/events?category=${category}`} className="btn-primary inline-block mt-6">
            View {CATEGORIES.find((c) => c.id === category)?.label} Events
          </Link>
        )}
      </section>
    </div>
  );
}
