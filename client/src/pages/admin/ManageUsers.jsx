import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Users, ShieldAlert, CheckCircle2, Ban } from 'lucide-react';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/toggle-block`);
      await fetchUsers();
    } catch (err) {
      alert('Failed to update user status.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading user directory..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Users className="w-7 h-7 text-rose-500" />
            <span>User Accounts & Security</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage customer permissions, security, and suspension status
          </p>
        </div>

        <div className="text-xs text-slate-400">
          Total Customers: <span className="font-bold text-white">{users.length}</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">User</th>
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4">Phone</th>
              <th className="py-3.5 px-4">Registered Date</th>
              <th className="py-3.5 px-4">Account Status</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 font-bold text-white flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                    {u.name?.charAt(0) || 'U'}
                  </div>
                  <span>{u.name}</span>
                </td>
                <td className="py-3 px-4 text-slate-300">{u.email}</td>
                <td className="py-3 px-4 text-slate-400">{u.phone || 'N/A'}</td>
                <td className="py-3 px-4 text-slate-400">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      u.isBlocked
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {u.isBlocked ? 'SUSPENDED' : 'ACTIVE'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleToggleBlock(u._id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      u.isBlocked
                        ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                        : 'bg-red-950/60 hover:bg-red-900/60 text-red-400 border border-red-800/60'
                    }`}
                  >
                    {u.isBlocked ? 'Reactivate' : 'Suspend'}
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
