import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, BarChart3, Ticket, Settings, Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const adminLinks = [
  { to: '/admin', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/events', icon: Calendar, label: 'Events' },
  { to: '/admin/bookings', icon: Ticket, label: 'Bookings' },
];

const organizerLinks = [
  { to: '/organizer', icon: BarChart3, label: 'Dashboard' },
  { to: '/organizer/events', icon: Calendar, label: 'My Events' },
  { to: '/organizer/bookings', icon: Ticket, label: 'Bookings' },
  { to: '/organizer/create', icon: Settings, label: 'Create Event' },
];

export default function DashboardLayout({ type = 'organizer' }) {
  const location = useLocation();
  const { user } = useAuth();
  const links = type === 'admin' ? adminLinks : organizerLinks;

  return (
    <div className="flex flex-col lg:flex-row gap-4 max-w-7xl mx-auto px-4 py-4">
      <aside className="w-full lg:w-64 glass-card p-4 flex-shrink-0 lg:sticky lg:top-24 lg:self-start">
        <Link
          to="/"
          className="flex items-center justify-center gap-2 w-full mb-4 px-4 py-3 rounded-xl bg-flyxo-primary text-white font-semibold hover:bg-rose-600 transition shadow-lg shadow-rose-500/25"
        >
          <Home size={18} />
          Back to Home
        </Link>

        <h2 className="font-display font-bold text-lg mb-4 px-2">
          {type === 'admin' ? 'Admin Panel' : 'Organizer Hub'}
        </h2>

        <nav className="space-y-1">
          {links.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                location.pathname === to
                  ? 'bg-flyxo-primary text-white'
                  : 'hover:bg-white/10'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        {user?.role === 'ADMIN' && type === 'admin' && (
          <Link
            to="/organizer"
            className="flex items-center gap-3 px-4 py-3 mt-4 rounded-xl border border-white/10 hover:bg-white/10 text-sm"
          >
            <LayoutDashboard size={18} />
            Organizer Hub
          </Link>
        )}
        {user?.role === 'ADMIN' && type === 'organizer' && (
          <Link
            to="/admin"
            className="flex items-center gap-3 px-4 py-3 mt-4 rounded-xl border border-white/10 hover:bg-white/10 text-sm"
          >
            <LayoutDashboard size={18} />
            Admin Panel
          </Link>
        )}
      </aside>

      <div className="flex-1 min-w-0 pb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-flyxo-primary mb-4 lg:hidden transition"
        >
          <ArrowLeft size={16} />
          Home
        </Link>
        <Outlet />
      </div>
    </div>
  );
}
