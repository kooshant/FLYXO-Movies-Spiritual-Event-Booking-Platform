import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Sun, Moon, Search, User, Heart, Bell, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function MainLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/events?search=${encodeURIComponent(search.trim())}`);
  };

  const dashboardLink =
    user?.role === 'ADMIN' ? '/admin' : user?.role === 'ORGANIZER' ? '/organizer' : '/profile';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-flyxo-dark/80 border-b border-gray-200/50 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link
            to="/"
            title="Home"
            className="font-display text-2xl font-extrabold bg-gradient-to-r from-flyxo-primary to-flyxo-secondary bg-clip-text text-transparent flex-shrink-0 hover:opacity-90 transition"
          >
            FLYXO
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search movies, jagran, concerts..."
                className="input-field pl-10 py-2"
              />
            </div>
          </form>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <Link to="/" className="hover:text-flyxo-primary transition">Home</Link>
            <Link to="/events" className="hover:text-flyxo-primary transition">Events</Link>
            <Link to="/events?category=MOVIE" className="hover:text-flyxo-primary transition">Movies</Link>
            <Link to="/events?spiritual=true" className="hover:text-flyxo-spiritual transition">Spiritual</Link>
            <Link to="/donate" className="hover:text-flyxo-primary transition">Donate</Link>
          </nav>

          <div className="flex items-center gap-2 ml-auto">
            <button onClick={toggle} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition">
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {isAuthenticated ? (
              <>
                <Link to="/wishlist" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 hidden sm:block">
                  <Heart size={20} />
                </Link>
                <Link to={dashboardLink} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 hidden sm:block">
                  <LayoutDashboard size={20} />
                </Link>
                <div className="relative hidden sm:block group">
                  <button className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10">
                    <User size={20} />
                    <span className="text-sm font-medium">{user?.name?.split(' ')[0]}</span>
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-48 glass-card opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2">
                    {user?.role === 'ADMIN' && (
                      <Link to="/admin" className="block px-4 py-2 hover:bg-white/10 text-sm text-flyxo-primary font-semibold">
                        Admin Panel
                      </Link>
                    )}
                    {user?.role === 'ORGANIZER' && (
                      <Link to="/organizer" className="block px-4 py-2 hover:bg-white/10 text-sm text-flyxo-primary font-semibold">
                        Organizer Hub
                      </Link>
                    )}
                    <Link to="/profile" className="block px-4 py-2 hover:bg-white/10 text-sm">Profile</Link>
                    <Link to="/bookings" className="block px-4 py-2 hover:bg-white/10 text-sm">My Bookings</Link>
                    <button onClick={logout} className="w-full text-left px-4 py-2 hover:bg-white/10 text-sm text-red-400 flex items-center gap-2">
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block text-sm font-semibold hover:text-flyxo-primary">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 hidden sm:block">Sign Up</Link>
              </>
            )}

            <button className="lg:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {menuOpen && (
  <div className="lg:hidden border-t border-white/10 px-4 py-4 space-y-3">

    <form onSubmit={handleSearch}>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
        className="input-field"
      />
    </form>

    <div className="flex flex-col gap-4 text-lg font-medium">

      <Link
        to="/"
        onClick={() => setMenuOpen(false)}
        className="block py-2"
      >
        Home
      </Link>

      <Link
        to="/events"
        onClick={() => setMenuOpen(false)}
        className="block py-2"
      >
        Events
      </Link>

      <Link
        to="/events?category=MOVIE"
        onClick={() => setMenuOpen(false)}
        className="block py-2"
      >
        Movies
      </Link>

      <Link
        to="/events?spiritual=true"
        onClick={() => setMenuOpen(false)}
        className="block py-2"
      >
        Spiritual
      </Link>

      <Link
        to="/donate"
        onClick={() => setMenuOpen(false)}
        className="block py-2"
      >
        Donate
      </Link>

      {isAuthenticated ? (
        <>
          <Link
            to="/wishlist"
            onClick={() => setMenuOpen(false)}
            className="block py-2"
          >
            ❤️ Wishlist
          </Link>

          <Link
            to={dashboardLink}
            onClick={() => setMenuOpen(false)}
            className="block py-2"
          >
            🔲 Dashboard
          </Link>

          <Link
            to="/profile"
            onClick={() => setMenuOpen(false)}
            className="block py-2"
          >
            👤 Profile
          </Link>

          <Link
            to="/bookings"
            onClick={() => setMenuOpen(false)}
            className="block py-2"
          >
            🎟️ My Bookings
          </Link>

          <button
            onClick={() => {
              logout();
              setMenuOpen(false);
            }}
            className="text-left py-2 text-red-400"
          >
            🚪 Logout
          </button>
        </>
      ) : (
        <>
          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="block py-2"
          >
            Login
          </Link>

          <Link
            to="/register"
            onClick={() => setMenuOpen(false)}
            className="btn-primary block text-center"
          >
            Sign Up
          </Link>
        </>
      )}

    </div>
  </div>
)}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-gray-400 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-display text-2xl font-bold text-white mb-2">FLYXO</h3>
            <p className="text-sm">India's premier platform for movies, spiritual events, and cultural experiences.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/events?category=MOVIE" className="hover:text-white">Movies</Link></li>
              <li><Link to="/events?category=JAGRAN" className="hover:text-white">Jagran</Link></li>
              <li><Link to="/events?category=CONCERT" className="hover:text-white">Concerts</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-white">Login</Link></li>
              <li><Link to="/register" className="hover:text-white">Register</Link></li>
              <li><Link to="/bookings" className="hover:text-white">My Bookings</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Contact</h4>
            <p className="text-sm">support@flyxo.com</p>
            <p className="text-sm mt-1">+91 1800-FLYXO</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center text-sm">
          © 2026 FLYXO. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
