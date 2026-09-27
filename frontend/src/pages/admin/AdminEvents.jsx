import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { eventService } from '../../services/eventService';
import Loader from '../../components/common/Loader';
import { formatDate, getCategoryLabel } from '../../utils/constants';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => eventService.getPending().then((res) => setEvents(res.data || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    try {
      await eventService.approve(id, status);
      toast.success(`Event ${status.toLowerCase()}`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="section-title mb-8">Pending Event Approvals</h1>
      {events.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No pending events</p>
      ) : (
        <div className="space-y-4">
          {events.map((e) => (
            <div key={e.id} className="glass-card p-6 flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg">{e.title}</h3>
                <p className="text-sm text-gray-500">{getCategoryLabel(e.category)} • {e.organizer?.orgName}</p>
                <p className="text-sm text-gray-500">{formatDate(e.startDate)} • {e.city}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleStatus(e.id, 'APPROVED')} className="btn-primary text-sm py-2">Approve</button>
                <button onClick={() => handleStatus(e.id, 'REJECTED')} className="bg-red-500/20 text-red-400 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-500/30">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
