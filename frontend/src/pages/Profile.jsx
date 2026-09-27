import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.updateProfile(form);
      updateUser(res.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      await authService.changePassword(passwords);
      toast.success('Password changed');
      setPasswords({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="section-title mb-8">My Profile</h1>
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-flyxo-primary to-flyxo-secondary flex items-center justify-center text-2xl font-bold text-white">
            {user?.name?.[0]}
          </div>
          <div>
            <p className="font-bold text-lg">{user?.name}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <div className="flex flex-wrap gap-2 mt-1">
              <span className="text-xs bg-flyxo-primary/20 text-flyxo-primary px-2 py-0.5 rounded-full">{user?.role}</span>
              {user?.emailVerified ? (
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">✓ Verified</span>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await authService.resendVerification();
                      toast.success('Verification link sent — check email or backend console');
                    } catch (err) {
                      toast.error(err.message);
                    }
                  }}
                  className="text-xs text-amber-400 hover:underline"
                >
                  Verify email
                </button>
              )}
            </div>
          </div>
        </div>
        <form onSubmit={saveProfile} className="space-y-4">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Name" />
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="Phone" />
          <button type="submit" disabled={loading} className="btn-primary">Save Changes</button>
        </form>
      </div>
      <div className="glass-card p-6">
        <h2 className="font-semibold mb-4">Change Password</h2>
        <form onSubmit={changePassword} className="space-y-4">
          <input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} className="input-field" placeholder="Current Password" required />
          <input type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} className="input-field" placeholder="New Password" required minLength={6} />
          <button type="submit" className="btn-outline">Update Password</button>
        </form>
      </div>
    </div>
  );
}
