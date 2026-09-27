import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      if (res.data?.devOtp) setDevOtp(res.data.devOtp);
      toast.success('OTP sent to your email');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="glass-card w-full max-w-md p-8">
        <h1 className="font-display text-2xl font-bold mb-2">Forgot Password</h1>
        <p className="text-gray-500 text-sm mb-6">We'll send a 6-digit OTP to your email</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="input-field"
            required
          />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
        {devOtp && (
          <p className="mt-4 p-3 bg-amber-500/20 rounded-xl text-sm text-center">
            <strong>DEV OTP:</strong> {devOtp}
          </p>
        )}
        <p className="text-center mt-6 text-sm">
          <Link to="/reset-password" className="text-flyxo-primary font-semibold">Enter OTP</Link>
          {' · '}
          <Link to="/login" className="text-gray-500">Login</Link>
        </p>
      </div>
    </div>
  );
}
