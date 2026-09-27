import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventService } from '../services/eventService';
import EventCard from '../components/events/EventCard';
import CategoryFilter from '../components/events/CategoryFilter';
import Loader from '../components/common/Loader';

export default function Events() {
  const [params, setParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);

  const category = params.get('category') || '';
  const search = params.get('search') || '';
  const city = params.get('city') || '';

  useEffect(() => {
    setLoading(true);
    const query = {
      page: params.get('page') || 1,
      ...(category && { category }),
      ...(search && { search }),
      ...(city && { city }),
      ...(params.get('trending') && { trending: 'true' }),
      ...(params.get('spiritual') && { upcoming: 'true' }),
    };

    if (params.get('spiritual') === 'true') {
      eventService.getSpiritual().then((res) => {
        setEvents(res.data || []);
        setPagination(null);
      }).finally(() => setLoading(false));
    } else {
      eventService.getAll(query).then((res) => {
        setEvents(res.data?.events || []);
        setPagination(res.data?.pagination);
      }).finally(() => setLoading(false));
    }
  }, [params]);

  const setCategory = (cat) => {
    const p = new URLSearchParams(params);
    if (cat) p.set('category', cat);
    else p.delete('category');
    setParams(p);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="section-title mb-2">Discover Events</h1>
      <p className="text-gray-500 mb-8">
        {search ? `Results for "${search}"` : 'Movies, spiritual gatherings, concerts & more'}
      </p>

      <CategoryFilter selected={category} onChange={setCategory} />

      {loading ? (
        <Loader />
      ) : events.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No events found. Try different filters.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {events.map((e, i) => <EventCard key={e.id} event={e} index={i} />)}
        </div>
      )}

      {pagination?.hasNext && (
        <div className="text-center mt-8">
          <button
            onClick={() => {
              const p = new URLSearchParams(params);
              p.set('page', String(pagination.page + 1));
              setParams(p);
            }}
            className="btn-outline"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
