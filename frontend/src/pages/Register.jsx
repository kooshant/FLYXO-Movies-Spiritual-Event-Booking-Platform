import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'USER' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await register(form);
      toast.success('Account created! Check email to verify.');
      if (data?.verifyLink) {
        console.log('Verify link:', data.verifyLink);
        toast('Dev: verification link in browser console', { icon: '📧' });
      }
      if (data.user.role === 'ORGANIZER') navigate('/organizer');
      else navigate('/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="glass-card w-full max-w-md p-8">
        <h1 className="font-display text-3xl font-bold text-center mb-8">Join FLYXO</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full Name" className="input-field" required />
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="input-field" required />
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="input-field" />
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password (min 6 chars)" className="input-field" required minLength={6} />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field">
            <option value="USER">Book Events (User)</option>
            <option value="ORGANIZER">Organize Events (Organizer)</option>
          </select>
          <p className="text-xs text-gray-500">
            Admin account signup se nahi banta — niche <strong>Login</strong> par demo admin use karo.
          </p>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center mt-6 text-sm">
          Already have an account? <Link to="/login" className="text-flyxo-primary font-semibold">Login</Link>
        </p>
        <div className="mt-4 p-4 bg-white/5 rounded-xl text-xs text-gray-500 space-y-1">
          <p className="font-semibold text-gray-400">Demo logins (Login page):</p>
          <p>User: user@flyxo.com / user123</p>
          <p>Organizer: organizer@flyxo.com / organizer123</p>
          <p className="text-flyxo-primary">Admin: admin@flyxo.com / admin123</p>
        </div>
      </div>
    </div>
  );
}
