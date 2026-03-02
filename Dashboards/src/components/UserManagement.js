import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { updateUserRole } from '../Utils/adminActions';
import { Search, Loader2, UserCheck, ShieldAlert, MoreVertical } from 'lucide-react';
import AddUserModal from './AddUserModal';

export default function UserManagement({ viewerRole, showAdmins }) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // 1. Fetch Users Logic
  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query = supabase.from('users').select('*');

      // Filter: Only Owners can see other Admins/Owners
      if (!showAdmins) {
        query = query.not('role', 'in', '("owner","tech_admin","operations_admin")');
      }

      // Search filter
      if (searchTerm) {
        query = query.ilike('full_name', `%${searchTerm}%`);
      }

      const { data, error } = await query.order('full_name', { ascending: true }).limit(20);
      
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Debounced Search (Wait 300ms after typing stops)
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 3. Update Role Logic
  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert("Failed to update role: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header + Add User Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Manage Users</h2>
          <p className="text-sm text-slate-400 font-medium">
            Create and manage platform users
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all"
        >
          <UserCheck size={16} />
          Add User
        </button>
      </div>

      {/* Search Input */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Search name (e.g. Nancy or Student)..."
          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all font-medium text-slate-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* User Table/List */}
      <div className="bg-slate-50/50 rounded-3xl p-2 border border-slate-100">
        {loading && users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-blue-500" size={32} />
            <p className="text-slate-400 font-bold text-sm">Accessing Database...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {users.map((u) => (
              <div 
                key={u.id} 
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-50 hover:border-blue-100 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center font-black text-white ${
                    u.role === 'owner' ? 'bg-rose-500' : u.role.includes('admin') ? 'bg-blue-500' : 'bg-slate-300'
                  }`}>
                    {u.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 leading-tight">{u.full_name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest ${
                        u.role === 'student' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {updatingId === u.id ? (
                    <Loader2 className="animate-spin text-blue-500" size={18} />
                  ) : (
                    <select
                      value={u.role}
                      disabled={u.id === supabase.auth.getUser()?.id} // Don't let user change their own role
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="text-xs font-black bg-slate-50 border-none rounded-xl py-2 px-3 focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <option value="student">Student</option>
                      <option value="tutor">Tutor</option>
                      <option value="operations_admin">Ops Admin</option>
                      {viewerRole === 'owner' && <option value="tech_admin">Tech Admin</option>}
                      {viewerRole === 'owner' && <option value="owner">Owner</option>}
                    </select>
                  )}
                </div>
              </div>
            ))}
            
            {!loading && users.length === 0 && (
              <div className="text-center py-20">
                <ShieldAlert className="mx-auto text-slate-200 mb-2" size={48} />
                <p className="text-slate-400 font-bold">No users found.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <AddUserModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onRefresh={fetchUsers} 
      />
    </div>
  );
}