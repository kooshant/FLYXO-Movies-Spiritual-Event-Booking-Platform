import { useEffect, useState } from 'react';
import { bookingService } from '../../services/bookingService';
import Loader from '../../components/common/Loader';
import { formatPrice } from '../../utils/constants';

export default function OrganizerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingService.getOrganizerBookings().then((res) => setBookings(res.data || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="section-title mb-8">Event Bookings</h1>
      <div className="space-y-3">
        {bookings.map((b) => (
          <div key={b.id} className="glass-card p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold">{b.event?.title}</p>
              <p className="text-sm text-gray-500">{b.user?.name} • {b.user?.email}</p>
              <p className="text-xs font-mono text-flyxo-primary">{b.bookingCode}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">{formatPrice(b.totalAmount)}</p>
              <p className="text-xs text-gray-500">{b.seats?.map((s) => s.label).join(', ')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
