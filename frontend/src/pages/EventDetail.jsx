import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Star, Heart, Ticket, Radio } from 'lucide-react';
import toast from 'react-hot-toast';
import { eventService } from '../services/eventService';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CountdownTimer from '../components/events/CountdownTimer';
import Loader from '../components/common/Loader';
import EventBannerImage from '../components/events/EventBannerImage';
import { formatPrice, formatDate, getCategoryLabel, isSpiritual } from '../utils/constants';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventService.getById(id).then((res) => setEvent(res.data)).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (isAuthenticated) {
      api.get(`/wishlist/check/${id}`).then((res) => setWishlisted(res.data?.isWishlisted));
    }
  }, [id, isAuthenticated]);

  const toggleWishlist = async () => {
    if (!isAuthenticated) return navigate('/login');
    try {
      if (wishlisted) {
        await api.delete(`/wishlist/${id}`);
        setWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await api.post('/wishlist', { eventId: id });
        setWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Loader />;
  if (!event) return <div className="text-center py-20">Event not found</div>;

  const spiritual = isSpiritual(event.category);

  return (
    <div>
      <div className={`relative h-64 md:h-96 ${spiritual ? 'bg-spiritual-gradient' : 'bg-hero-gradient'}`}>
        <EventBannerImage event={event} height="h-full" className="opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-flyxo-dark via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto">
          <span className="text-sm bg-white/20 px-3 py-1 rounded-full">{getCategoryLabel(event.category)}</span>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-white mt-2">{event.title}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-6">
            <h2 className="font-display font-bold text-xl mb-4">About</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{event.description}</p>
          </div>

          {event.isLiveStream && (
            <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-flyxo-primary">
              <Radio className="text-flyxo-primary" />
              <div>
                <p className="font-semibold">Live Stream Available</p>
                <a href={event.liveStreamUrl} target="_blank" rel="noreferrer" className="text-flyxo-primary text-sm hover:underline">
                  Watch Live →
                </a>
              </div>
            </div>
          )}

          <div className="glass-card p-6">
            <h2 className="font-display font-bold text-xl mb-4">Venue</h2>
            <div className="flex items-start gap-3">
              <MapPin className="text-flyxo-primary mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold">{event.venue}</p>
                <p className="text-gray-500">{event.address}, {event.city}</p>
              </div>
            </div>
            {event.latitude && (
              <div className="mt-4 h-48 bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-500">
                <a
                  href={`https://www.google.com/maps?q=${event.latitude},${event.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-outline text-sm"
                >
                  Open in Google Maps
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 sticky top-24">
            <div className="flex items-center gap-2 text-gray-500 mb-4">
              <Calendar size={18} />
              {formatDate(event.startDate)}
            </div>

            <CountdownTimer targetDate={event.startDate} />

            <div className="mt-6 space-y-3">
              <div className="flex justify-between">
                <span>Ticket Price</span>
                <span className="font-bold text-flyxo-primary text-xl">{formatPrice(event.ticketPrice)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Available Seats</span>
                <span>{event.availableSeats} / {event.totalSeats}</span>
              </div>
              {event.rating > 0 && (
                <div className="flex items-center gap-1 text-amber-500">
                  <Star size={16} fill="currentColor" />
                  <span>{event.rating.toFixed(1)} ({event.reviewCount} reviews)</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={toggleWishlist} className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-flyxo-primary transition">
                <Heart size={20} className={wishlisted ? 'fill-flyxo-primary text-flyxo-primary' : ''} />
              </button>
              <button
                onClick={() => navigate(`/book/${id}`)}
                disabled={event.availableSeats === 0}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Ticket size={18} /> Book Tickets
              </button>
            </div>

            {event.organizer && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-sm text-gray-500">Organized by</p>
                <p className="font-semibold">{event.organizer.orgName}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
