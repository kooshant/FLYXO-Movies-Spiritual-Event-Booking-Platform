import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CreditCard, Tag, Clock } from 'lucide-react';
import { eventService } from '../services/eventService';
import { bookingService } from '../services/bookingService';
import { couponService } from '../services/couponService';
import { useAuth } from '../context/AuthContext';
import { useRazorpay } from '../hooks/useRazorpay';
import { useSeatSocket } from '../hooks/useSeatSocket';
import SeatMap from '../components/booking/SeatMap';
import QRTicket from '../components/booking/QRTicket';
import Loader from '../components/common/Loader';
import { formatPrice } from '../utils/constants';

export default function Booking() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { openPayment } = useRazorpay();

  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [donation, setDonation] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  const loadSeats = useCallback(() => {
    bookingService.getSeats(eventId).then((res) => setSeats(res.data || []));
  }, [eventId]);

  useSeatSocket(eventId, loadSeats);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    Promise.all([eventService.getById(eventId), bookingService.getSeats(eventId)])
      .then(([e, s]) => {
        setEvent(e.data);
        setSeats(s.data || []);
      })
      .finally(() => setLoading(false));
  }, [eventId, isAuthenticated, navigate]);

  useEffect(() => {
    if (selected.length === 0) return;
    const t = setTimeout(() => {
      bookingService.holdSeats({ eventId, seatIds: selected }).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [selected, eventId]);

  const ticketTotal = selected.length * (event?.ticketPrice || 0);
  const total = Math.max(0, ticketTotal - discount + parseFloat(donation || 0));

  const applyCoupon = async () => {
    if (!couponCode.trim()) return toast.error('Enter coupon code');
    try {
      const res = await couponService.validate(couponCode, ticketTotal);
      setDiscount(res.data.discount);
      toast.success(`Coupon applied! Saved ₹${res.data.discount}`);
    } catch (err) {
      setDiscount(0);
      toast.error(err.message);
    }
  };

  const handleBook = async () => {
    if (selected.length === 0) return toast.error('Select at least one seat');
    setProcessing(true);
    try {
      const res = await bookingService.createOrder({
        eventId,
        seatIds: selected,
        donationAmount: donation,
        couponCode: discount > 0 ? couponCode : undefined,
      });

      const { booking, order, free } = res.data;

      if (free) {
        setConfirmed(booking);
        toast.success('Booking confirmed!');
        setProcessing(false);
        return;
      }

      await openPayment({
        order,
        bookingId: booking.id,
        user,
        description: `Tickets: ${event?.title}`,
        onSuccess: (confirmedBooking) => {
          setConfirmed(confirmedBooking);
          toast.success('Payment successful!');
          setProcessing(false);
        },
        onFailure: () => setProcessing(false),
      });
    } catch (err) {
      toast.error(err.message);
      setProcessing(false);
    }
  };

  if (loading) return <Loader />;

  if (confirmed) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="section-title text-emerald-500 mb-8">🎉 Booking Confirmed!</h1>
        <QRTicket booking={confirmed} />
        <button onClick={() => navigate('/bookings')} className="btn-primary mt-8">
          View All Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="section-title mb-2">Select Seats</h1>
      <p className="text-gray-500 mb-2 flex items-center gap-2">
        <Clock size={14} /> Seats held for 10 min while you pay
      </p>
      <p className="text-gray-500 mb-8">{event?.title} — {formatPrice(event?.ticketPrice)} per seat</p>

      <div className="glass-card p-8 mb-8">
        <SeatMap seats={seats} selected={selected} onSelect={setSelected} />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Tag size={18} /> Coupon Code
          </h3>
          <div className="flex gap-2">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="FLYXO10 or FLYXO50"
              className="input-field flex-1"
            />
            <button type="button" onClick={applyCoupon} className="btn-outline whitespace-nowrap">
              Apply
            </button>
          </div>
          <h3 className="font-semibold">🙏 Donation (Optional)</h3>
          <input
            type="number"
            min="0"
            value={donation}
            onChange={(e) => setDonation(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4">Booking Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>{selected.length} seat(s)</span>
              <span>{formatPrice(ticketTotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Coupon discount</span>
                <span>-₹{discount}</span>
              </div>
            )}
            {donation > 0 && (
              <div className="flex justify-between">
                <span>Donation</span>
                <span>₹{donation}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/10">
              <span>Total</span>
              <span className="text-flyxo-primary">{formatPrice(total)}</span>
            </div>
          </div>
          {total > 0 && (
            <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
              <CreditCard size={14} /> Razorpay — UPI, Card, Netbanking
            </p>
          )}
          <button
            onClick={handleBook}
            disabled={processing || selected.length === 0}
            className="btn-primary w-full mt-6 disabled:opacity-50"
          >
            {processing ? 'Processing...' : total === 0 ? 'Confirm Free' : `Pay ${formatPrice(total)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
