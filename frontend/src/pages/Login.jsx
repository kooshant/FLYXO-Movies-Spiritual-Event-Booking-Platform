import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success('Welcome back!');
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'ORGANIZER') navigate('/organizer');
      else navigate('/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="glass-card w-full max-w-md p-8">
        <h1 className="font-display text-3xl font-bold text-center mb-2">Welcome Back</h1>
        <p className="text-center text-gray-500 mb-8">Login to your FLYXO account</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="input-field" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="input-field" required />
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-flyxo-primary hover:underline">Forgot password?</Link>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-gray-500">
          Don't have an account? <Link to="/register" className="text-flyxo-primary font-semibold">Sign Up</Link>
        </p>
        <div className="mt-6 p-4 bg-white/5 rounded-xl text-xs text-gray-500 space-y-1">
          <p><strong>Demo:</strong> user@flyxo.com / user123</p>
          <p>organizer@flyxo.com / organizer123</p>
          <p>admin@flyxo.com / admin123</p>
        </div>
      </div>
    </div>
  );
}
