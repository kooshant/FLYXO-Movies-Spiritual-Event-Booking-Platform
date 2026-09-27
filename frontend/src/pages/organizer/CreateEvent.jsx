import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { eventService } from '../../services/eventService';
import { CATEGORIES } from '../../utils/constants';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', category: 'JAGRAN', venue: '', address: '', city: '',
    startDate: '', ticketPrice: 0, totalSeats: 100, latitude: '', longitude: '',
    bannerUrl: '',
    isLiveStream: false, liveStreamUrl: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (banner) fd.append('banner', banner);

    try {
      await eventService.create(fd);
      toast.success('Event created! Pending admin approval.');
      navigate('/organizer/events');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => setForm({ ...form, [k]: v });

  return (
    <div className="max-w-2xl">
      <h1 className="section-title mb-8">Create Event</h1>
      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
        <input value={form.title} onChange={(e) => set('title', e.target.value)} className="input-field" placeholder="Event Title" required />
        <textarea value={form.description} onChange={(e) => set('description', e.target.value)} className="input-field min-h-[100px]" placeholder="Description" required />
        <select value={form.category} onChange={(e) => set('category', e.target.value)} className="input-field">
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <div>
          <label className="text-sm text-gray-500 mb-1 block">Banner Image URL (Amazon, Google, etc.)</label>
          <input
            type="url"
            value={form.bannerUrl}
            onChange={(e) => set('bannerUrl', e.target.value)}
            placeholder="https://m.media-amazon.com/images/..."
            className="input-field"
          />
          <p className="text-xs text-gray-500 mt-1">Ya neeche file upload karo — URL priority pehle</p>
        </div>
        <input type="file" accept="image/*" onChange={(e) => setBanner(e.target.files[0])} className="input-field" />
        <div className="grid grid-cols-2 gap-4">
          <input value={form.venue} onChange={(e) => set('venue', e.target.value)} className="input-field" placeholder="Venue" required />
          <input value={form.city} onChange={(e) => set('city', e.target.value)} className="input-field" placeholder="City" required />
        </div>
        <input value={form.address} onChange={(e) => set('address', e.target.value)} className="input-field" placeholder="Full Address" required />
        <input type="datetime-local" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} className="input-field" required />
        <div className="grid grid-cols-2 gap-4">
          <input type="number" value={form.ticketPrice} onChange={(e) => set('ticketPrice', e.target.value)} className="input-field" placeholder="Ticket Price (₹)" />
          <input type="number" value={form.totalSeats} onChange={(e) => set('totalSeats', e.target.value)} className="input-field" placeholder="Total Seats" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input value={form.latitude} onChange={(e) => set('latitude', e.target.value)} className="input-field" placeholder="Latitude" />
          <input value={form.longitude} onChange={(e) => set('longitude', e.target.value)} className="input-field" placeholder="Longitude" />
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.isLiveStream} onChange={(e) => set('isLiveStream', e.target.checked)} />
          Enable Live Stream
        </label>
        {form.isLiveStream && (
          <input value={form.liveStreamUrl} onChange={(e) => set('liveStreamUrl', e.target.value)} className="input-field" placeholder="Live Stream URL" />
        )}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating...' : 'Submit for Approval'}
        </button>
      </form>
    </div>
  );
}
