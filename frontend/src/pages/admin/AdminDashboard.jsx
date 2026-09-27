import { useEffect, useState } from 'react';
import { Users, Calendar, Ticket, IndianRupee } from 'lucide-react';
import { adminService } from '../../services/adminService';
import Loader from '../../components/common/Loader';
import { getCategoryLabel } from '../../utils/constants';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStats().then((res) => setStats(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const cards = [
    { label: 'Users', value: stats?.users, icon: Users },
    { label: 'Organizers', value: stats?.organizers, icon: Users },
    { label: 'Events', value: stats?.events, icon: Calendar },
    { label: 'Bookings', value: stats?.bookings, icon: Ticket },
    { label: 'Revenue', value: `₹${stats?.totalRevenue?.toLocaleString('en-IN')}`, icon: IndianRupee },
    { label: 'Pending Events', value: stats?.pendingEvents, icon: Calendar },
  ];

  return (
    <div>
      <h1 className="section-title mb-8">Platform Analytics</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="glass-card p-6">
            <Icon className="text-flyxo-primary mb-3" size={28} />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>
      {stats?.categoryBreakdown?.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="font-semibold mb-4">Events by Category</h2>
          <div className="space-y-2">
            {stats.categoryBreakdown.map((c) => (
              <div key={c.category} className="flex justify-between items-center">
                <span>{getCategoryLabel(c.category)}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-flyxo-primary rounded-full" style={{ width: `${(c._count / stats.events) * 100}%` }} />
                  </div>
                  <span className="text-sm font-bold">{c._count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
