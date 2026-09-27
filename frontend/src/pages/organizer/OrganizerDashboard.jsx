import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IndianRupee, Ticket, Calendar, TrendingUp } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import Loader from '../../components/common/Loader';

export default function OrganizerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingService.getAnalytics().then((res) => setStats(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const cards = [
    { label: 'Total Revenue', value: `₹${stats?.totalRevenue?.toLocaleString('en-IN') || 0}`, icon: IndianRupee, color: 'text-emerald-400' },
    { label: 'Donations', value: `₹${stats?.totalDonations?.toLocaleString('en-IN') || 0}`, icon: TrendingUp, color: 'text-amber-400' },
    { label: 'Bookings', value: stats?.totalBookings || 0, icon: Ticket, color: 'text-flyxo-primary' },
    { label: 'Events', value: stats?.eventCount || 0, icon: Calendar, color: 'text-flyxo-secondary' },
  ];

  return (
    <div>
      <h1 className="section-title mb-8">Organizer Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card p-6">
            <Icon className={`${color} mb-3`} size={28} />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>
      <Link to="/organizer/create" className="btn-primary inline-block">+ Create New Event</Link>
    </div>
  );
}
