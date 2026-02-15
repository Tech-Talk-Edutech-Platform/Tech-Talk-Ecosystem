import React, { useState } from 'react';
import { supabase } from '../supabase';
import { X, UserPlus, Shield } from 'lucide-react';
import Notification from './NotificationPopup'; 

export default function AddUserModal({ isOpen, onClose, onRefresh }) {
  const [formData, setFormData] = useState({ email: '', fullName: '', role: 'tutor' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ msg: null, type: 'error' }); // New state

  if (!isOpen) return null;

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ msg: null, type: 'error' });
    
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: 'TempPassword123!', 
      options: {
        data: {
          full_name: formData.fullName,
          role: formData.role,
        },
      },
    });

    if (error) {
      // Use the internal notification instead of browser alert
      setStatus({ msg: error.message, type: 'error' });
      setLoading(false);
    } else {
      setStatus({ msg: "User added successfully!", type: 'success' });
      setTimeout(() => {
        onRefresh();
        onClose();
        setLoading(false);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl animate-in zoom-in duration-200">
        
        {/* IN-APP NOTIFICATION LOGIC */}
        {status.msg && (
          <Notification 
            message={status.msg} 
            type={status.type} 
            onClose={() => setStatus({ msg: null, type: 'error' })} 
          />
        )}

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <UserPlus className="text-blue-600" size={20} />
            <h3 className="text-xl font-black text-slate-900">Add Team Member</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleAdd} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
            <input 
              required
              className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. John Doe"
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
            <input 
              required
              type="email"
              className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="john@example.com"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Assign Role</label>
            <select 
              className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="tutor">Tutor</option>
              <option value="operations_admin">Operations Admin</option>
              <option value="tech_sales_admin">Tech Sales Admin</option>
              <option value="student">Student</option>
              <option value="owner">Owner</option>
            </select>
          </div>

          <button 
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {loading ? "Processing..." : "Confirm & Add User"}
          </button>
        </form>
      </div>
    </div>
  );
}
// import React, { useState } from 'react';
// import { supabase } from '../supabase';
// import { X, UserPlus, Shield } from 'lucide-react';

// export default function AddUserModal({ isOpen, onClose, onRefresh }) {
//   const [formData, setFormData] = useState({ email: '', fullName: '', role: 'tutor' });
//   const [loading, setLoading] = useState(false);

//   if (!isOpen) return null;

//   const handleAdd = async (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     // This uses your SQL trigger handle_new_user()
//     const { data, error } = await supabase.auth.signUp({
//       email: formData.email,
//       password: 'TempPassword123!', // User can reset this via "Forgot Password"
//       options: {
//         data: {
//           full_name: formData.fullName,
//           role: formData.role,
//         },
//       },
//     });

//     if (error) {
//       alert(error.message);
//     } else {
//       alert("User invited successfully!");
//       onRefresh(); // Refresh the list in UserManagement
//       onClose();
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
//       <div className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl animate-in zoom-in duration-200">
//         <div className="flex justify-between items-center mb-6">
//           <h3 className="text-xl font-black text-slate-900">Add Team Member</h3>
//           <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
//             <X size={20} />
//           </button>
//         </div>

//         <form onSubmit={handleAdd} className="space-y-4">
//           <div className="space-y-1">
//             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
//             <input 
//               required
//               className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="e.g. John Doe"
//               onChange={(e) => setFormData({...formData, fullName: e.target.value})}
//             />
//           </div>

//           <div className="space-y-1">
//             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
//             <input 
//               required
//               type="email"
//               className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="john@example.com"
//               onChange={(e) => setFormData({...formData, email: e.target.value})}
//             />
//           </div>

//           <div className="space-y-1">
//             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Assign Role</label>
//             <select 
//               className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
//               value={formData.role}
//               onChange={(e) => setFormData({...formData, role: e.target.value})}
//             >
//               <option value="tutor">Tutor</option>
//               <option value="operations_admin">Operations Admin</option>
//               <option value="tech_sales_admin">Tech Sales Admin</option>
//               <option value="marketer">Marketer</option>
//             </select>
//           </div>

//           <button 
//             disabled={loading}
//             className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50"
//           >
//             {loading ? "Creating..." : "Confirm & Add User"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }