import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import Loader from '../../components/common/Loader';
import { formatPrice } from '../../utils/constants';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getBookings().then((res) => setBookings(res.data?.bookings || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="section-title mb-8">All Bookings</h1>
      <div className="space-y-3">
        {bookings.map((b) => (
          <div key={b.id} className="glass-card p-4 flex justify-between">
            <div>
              <p className="font-semibold">{b.event?.title}</p>
              <p className="text-sm text-gray-500">{b.user?.name} • {b.bookingCode}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500">{b.status}</span>
              <p className="font-bold">{formatPrice(b.totalAmount)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
