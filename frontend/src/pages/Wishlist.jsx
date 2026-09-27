import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import EventCard from '../components/events/EventCard';
import Loader from '../components/common/Loader';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/wishlist').then((res) => setItems(res.data || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="section-title mb-8">My Wishlist</h1>
      {items.length === 0 ? (
        <div className="text-center py-20 glass-card">
          <p className="text-gray-500 mb-4">No saved events</p>
          <Link to="/events" className="btn-primary">Browse Events</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => <EventCard key={item.id} event={item.event} index={i} />)}
        </div>
      )}
    </div>
  );
}
