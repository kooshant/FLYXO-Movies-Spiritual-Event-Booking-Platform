import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Calendar } from 'lucide-react';
import { formatPrice, formatDate, getCategoryLabel, isSpiritual } from '../../utils/constants';
import EventBannerImage from './EventBannerImage';

export default function EventCard({ event, index = 0 }) {
  const spiritual = isSpiritual(event.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <Link to={`/events/${event.id}`} className="block">
        <div className={`glass-card overflow-hidden hover:scale-[1.02] transition-all duration-300 ${spiritual ? 'hover:shadow-amber-500/20' : 'hover:shadow-rose-500/20'} hover:shadow-2xl`}>
          <div className="relative h-48 overflow-hidden">
            <EventBannerImage
              event={event}
              className="group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            {event.isTrending && (
              <span className="absolute top-3 left-3 bg-flyxo-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                TRENDING
              </span>
            )}
            {spiritual && (
              <span className="absolute top-3 right-3 bg-flyxo-spiritual text-white text-xs font-bold px-2 py-1 rounded-full">
                🪔 Spiritual
              </span>
            )}
            <span className="absolute bottom-3 left-3 text-white text-sm font-medium bg-black/50 px-2 py-0.5 rounded">
              {getCategoryLabel(event.category)}
            </span>
          </div>
          <div className="p-4">
            <h3 className="font-display font-bold text-lg line-clamp-1 group-hover:text-flyxo-primary transition-colors">
              {event.title}
            </h3>
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
              <MapPin size={14} />
              <span className="line-clamp-1">{event.venue}, {event.city}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
              <Calendar size={14} />
              <span>{formatDate(event.startDate)}</span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="font-bold text-flyxo-primary">{formatPrice(event.ticketPrice)}</span>
              {event.rating > 0 && (
                <span className="flex items-center gap-1 text-sm text-amber-500">
                  <Star size={14} fill="currentColor" />
                  {event.rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
