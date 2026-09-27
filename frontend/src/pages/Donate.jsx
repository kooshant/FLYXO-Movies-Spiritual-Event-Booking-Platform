import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CreditCard } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import { useRazorpay } from '../hooks/useRazorpay';

const TEMPLES = ['Kashi Vishwanath', 'Tirupati Balaji', 'Golden Temple', 'Somnath Temple', 'General Seva Fund'];

export default function Donate() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { openPayment } = useRazorpay();
  const [amount, setAmount] = useState(101);
  const [temple, setTemple] = useState(TEMPLES[0]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleDonate = async () => {
    if (!isAuthenticated) return navigate('/login');
    if (amount < 1) return toast.error('Minimum donation ₹1');
    setLoading(true);
    try {
      const res = await bookingService.donate({ amount: parseFloat(amount), templeName: temple });
      const { order, payment } = res.data;

      await openPayment({
        order,
        paymentId: payment.id,
        user,
        description: `Donation: ${temple}`,
        onSuccess: () => {
          setDone(true);
          toast.success('Thank you for your donation! 🙏');
          setLoading(false);
        },
        onFailure: () => setLoading(false),
      });
    } catch (err) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <span className="text-6xl">🙏</span>
        <h1 className="section-title mt-4 text-emerald-500">Donation Successful</h1>
        <p className="text-gray-500 mt-2">Thank you for supporting {temple}</p>
        <button onClick={() => navigate('/')} className="btn-primary mt-8">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <span className="text-5xl">🙏</span>
        <h1 className="section-title mt-4">Temple Donation</h1>
        <p className="text-gray-500">Support temple maintenance and community seva</p>
      </div>
      <div className="glass-card p-8 space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Select Temple</label>
          <select value={temple} onChange={(e) => setTemple(e.target.value)} className="input-field">
            {TEMPLES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Donation Amount (₹)</label>
          <div className="flex gap-2 mb-3 flex-wrap">
            {[51, 101, 501, 1001].map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAmount(a)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  amount === a ? 'bg-flyxo-primary text-white' : 'bg-white/10'
                }`}
              >
                ₹{a}
              </button>
            ))}
          </div>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field"
          />
        </div>
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <CreditCard size={14} /> Pay securely with Razorpay
        </p>
        <button onClick={handleDonate} disabled={loading} className="btn-primary w-full">
          {loading ? 'Opening payment...' : `Donate ₹${amount}`}
        </button>
      </div>
    </div>
  );
}
