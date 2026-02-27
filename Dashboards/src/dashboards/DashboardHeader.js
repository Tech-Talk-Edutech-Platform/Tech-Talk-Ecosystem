import React from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import { 
  LogOut, 
  Bell, 
  Search, 
  User, 
  ShieldCheck, 
  Zap 
} from "lucide-react";

export default function DashboardHeader({ user, role }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // Logic to determine badge color based on role
  const getRoleStyle = (userRole) => {
    switch (userRole) {
      case 'owner': return "bg-rose-500 text-white";
      case 'tech_admin': return "bg-blue-600 text-white";
      case 'operations_admin': return "bg-amber-500 text-white";
      case 'tutor': return "bg-indigo-500 text-white";
      case 'student': return "bg-orange-500 text-white";
      default: return "bg-emerald-500 text-white";
    }
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/80 backdrop-blur-md p-2 rounded-[30px] border border-white/20 shadow-xl shadow-grey-200/20">
      
      {/* 1. BRAND & SEARCH */}
      {/* <div className="flex items-center gap-6 flex-1">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="bg-slate-900 p-2.5 rounded-2xl group-hover:rotate-12 transition-transform">
            <Zap className="text-yellow-400 fill-yellow-400" size={20} />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-slate-900 font-sans">
            TECH TALK <span className="text-blue-600">HUB</span>
          </h1>
        </div>

        <div className="hidden lg:flex items-center flex-1 max-w-md relative group">
          <Search className="absolute left-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
          />
        </div>
      </div> */}
      {/* 1. BRAND & SEARCH */}
      <div className="flex items-center gap-6">
   <div className="flex items-center gap-2 group cursor-pointer">
  <div className="w-12 h-12 rounded-full overflow-hidden border border-blue-600 group-hover:rotate-12 transition-transform">
    <img src="TechTalkBrand.png" alt="Tech Talk Hub" className="w-full h-full object-cover" />
  </div>
  <h1 className="text-xl font-black tracking-tighter text-slate-900 font-sans">
    TECH TALK <span className="text-blue-600">HUB</span>
  </h1>
</div>

{/* <div className="flex items-center gap-2 group cursor-pointer">
  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-900 group-hover:rotate-12 transition-transform">
    <img src="TechTalkBrand.png" alt="Tech Talk Hub" className="w-full h-full object-cover" />
  </div>
  <h1 className="text-xl font-black tracking-tighter text-slate-900 font-sans">
    TECH TALK <span className="text-blue-600">HUB</span>
  </h1>
</div> */}


{/* <div className="flex items-center gap-6">
  <div className="flex items-center gap-2 group cursor-pointer">
    <div className="p-2.5 rounded-2xl bg-slate-900 group-hover:rotate-12 transition-transform">
      <img src="favicon.png" alt="Tech Talk Hub" className="h-6 w-6 object-contain" />
    </div>
    <h1 className="text-xl font-black tracking-tighter text-slate-900 font-sans">
      TECH TALK <span className="text-blue-600">HUB</span>
    </h1>
  </div> */}

  <div className="hidden lg:flex items-center max-w-md relative group">
    {/* <Search className="absolute left-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
    <input 
      type="text" 
      placeholder="Search anything..." 
      className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
    /> */}
  </div>
</div>


      {/* 2. USER PROFILE & ACTIONS */}
      <div className="flex items-center justify-between md:justify-end gap-4">
        
        {/* Notifications */}
        <button className="relative p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-10 w-[1px] bg-slate-100 mx-2 hidden md:block"></div>

        {/* User Info */}
        <div className="flex items-center gap-3 bg-slate-50 pr-4 pl-2 py-2 rounded-2xl border border-slate-100">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-lg ${getRoleStyle(role)}`}>
            {role === 'owner' || role.includes('admin') ? <ShieldCheck size={20} /> : <User size={20} />}
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs font-black text-slate-900 leading-tight truncate max-w-[120px]">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              {role?.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 hover:scale-105 active:scale-95 transition-all"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}