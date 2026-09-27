import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import Loader from '../../components/common/Loader';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => adminService.getUsers().then((res) => setUsers(res.data?.users || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const updateUser = async (id, data) => {
    try {
      await adminService.updateUser(id, data);
      toast.success('User updated');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="section-title mb-8">Manage Users</h1>
      <div className="overflow-x-auto">
        <table className="w-full glass-card rounded-2xl overflow-hidden">
          <thead>
            <tr className="border-b border-white/10 text-left text-sm text-gray-500">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-white/5">
                <td className="p-4 font-medium">{u.name}</td>
                <td className="p-4 text-sm text-gray-500">{u.email}</td>
                <td className="p-4">
                  <select value={u.role} onChange={(e) => updateUser(u.id, { role: e.target.value })} className="bg-transparent border border-white/20 rounded px-2 py-1 text-sm">
                    <option value="USER">USER</option>
                    <option value="ORGANIZER">ORGANIZER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td className="p-4">
                  <span className={u.isActive ? 'text-emerald-400' : 'text-red-400'}>{u.isActive ? 'Active' : 'Inactive'}</span>
                </td>
                <td className="p-4">
                  <button onClick={() => updateUser(u.id, { isActive: !u.isActive })} className="text-sm text-flyxo-primary hover:underline">
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
