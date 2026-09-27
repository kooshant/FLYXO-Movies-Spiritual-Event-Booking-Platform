import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { eventService } from '../../services/eventService';
import Loader from '../../components/common/Loader';
import { formatDate, getCategoryLabel } from '../../utils/constants';

export default function OrganizerEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => eventService.getOrganizerEvents().then((res) => setEvents(res.data || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      await eventService.delete(id);
      toast.success('Event deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="section-title">My Events</h1>
        <Link to="/organizer/create" className="btn-primary">+ Create Event</Link>
      </div>
      <div className="space-y-4">
        {events.map((e) => (
          <div key={e.id} className="glass-card p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <h3 className="font-bold">{e.title}</h3>
              <p className="text-sm text-gray-500">{getCategoryLabel(e.category)} • {formatDate(e.startDate)}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                e.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' :
                e.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
              }`}>{e.status}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm">{e._count?.bookings || 0} bookings</span>
              <button onClick={() => handleDelete(e.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
