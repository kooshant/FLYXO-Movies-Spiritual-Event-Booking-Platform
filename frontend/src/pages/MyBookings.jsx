import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { bookingService } from '../services/bookingService';
import QRTicket from '../components/booking/QRTicket';
import Loader from '../components/common/Loader';
import { formatDate, formatPrice } from '../utils/constants';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = () =>
    bookingService.getMyBookings().then((res) => setBookings(res.data?.bookings || []));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking? Refund in 5-7 days.')) return;
    try {
      await bookingService.cancelBooking(id);
      toast.success('Booking cancelled');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Loader />;

  if (selected) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button onClick={() => setSelected(null)} className="text-flyxo-primary mb-6 hover:underline">← Back to bookings</button>
        <QRTicket booking={selected} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="section-title mb-8">My Bookings</h1>
      {bookings.length === 0 ? (
        <div className="text-center py-20 glass-card">
          <p className="text-gray-500 mb-4">No bookings yet</p>
          <Link to="/events" className="btn-primary">Explore Events</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="glass-card p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex gap-4">
                <img src={b.event?.banner || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=200'} alt="" className="w-20 h-28 object-cover rounded-xl" />
                <div>
                  <h3 className="font-bold">{b.event?.title}</h3>
                  <p className="text-sm text-gray-500">{formatDate(b.event?.startDate)}</p>
                  <p className="text-sm text-gray-500">{b.event?.venue}</p>
                  <p className="font-mono text-sm text-flyxo-primary mt-1">{b.bookingCode}</p>
                  <div className="flex gap-1 mt-1">
                    {b.seats?.map((s) => (
                      <span key={s.label} className="text-xs bg-white/10 px-2 py-0.5 rounded">{s.label}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs px-3 py-1 rounded-full ${b.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {b.status}
                </span>
                <p className="font-bold mt-2">{formatPrice(b.totalAmount)}</p>
                <div className="flex flex-col gap-2 mt-2">
                  {b.status === 'CONFIRMED' && b.qrCode && (
                    <button onClick={() => setSelected(b)} className="btn-primary text-sm py-1.5 px-4">
                      View Ticket
                    </button>
                  )}
                  {b.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleCancel(b.id)}
                      className="text-sm text-red-400 hover:underline"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
