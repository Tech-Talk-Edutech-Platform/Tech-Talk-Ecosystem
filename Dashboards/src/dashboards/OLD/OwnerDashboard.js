import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

const OwnerDashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    tutors: 0,
    students: 0,
    conversionRate: 0,
    issues: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [
      { data: revenue }, 
      { count: tutors }, 
      { count: students }, 
      { count: leads }, 
      { count: paidLeads }, 
      { count: issues }
    ] = await Promise.all([
        supabase.from('payments').select('amount').eq('status', 'paid'),
        supabase.from('tutors').select('*', { count: 'exact', head: true }).eq('active', true),
        supabase.from('students').select('*', { count: 'exact', head: true }).eq('active', true),
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'converted'),
        supabase.from('issues').select('*', { count: 'exact', head: true }).eq('status', 'open')
      ]);

    const totalRevenue = revenue?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const conversionRate = leads ? ((paidLeads / leads) * 100).toFixed(1) : 0;

    setStats({
      totalRevenue,
      tutors: tutors || 0,
      students: students || 0,
      conversionRate,
      issues: issues || 0
    });
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Owner Dashboard</h1>
        <p className="text-slate-500 font-medium mt-2 text-lg">Business overview & growth tracking</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <Card 
          title="Total Revenue" 
          value={`KES ${stats.totalRevenue.toLocaleString()}`} 
          color="indigo" 
          detail="All-time earnings"
        />
        <Card 
          title="Active Tutors" 
          value={stats.tutors} 
          color="emerald" 
          detail="Verified staff"
        />
        <Card 
          title="Active Students" 
          value={stats.students} 
          color="sky" 
          detail="Enrolled learners"
        />
        <Card 
          title="Lead Conv. %" 
          value={`${stats.conversionRate}%`} 
          color="violet" 
          detail="Efficiency"
        />
        <Card 
          title="Open Issues" 
          value={stats.issues} 
          color={stats.issues > 0 ? "rose" : "emerald"} 
          detail="Action required"
        />
      </div>
    </div>
  );
};

const Card = ({ title, value, color, detail }) => {
  const themes = {
    indigo: "border-indigo-100 bg-white text-indigo-600 shadow-indigo-100",
    emerald: "border-emerald-100 bg-white text-emerald-600 shadow-emerald-100",
    sky: "border-sky-100 bg-white text-sky-600 shadow-sky-100",
    violet: "border-violet-100 bg-white text-violet-600 shadow-violet-100",
    rose: "border-rose-100 bg-rose-50 text-rose-600 shadow-rose-100 animate-pulse",
  };

  return (
    <div className={`p-6 border-2 rounded-2xl shadow-xl transition-all hover:-translate-y-1 ${themes[color]}`}>
      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">{title}</h4>
      <div className="flex items-baseline gap-2">
        <h2 className="text-3xl font-black tracking-tight text-slate-900">{value ?? 0}</h2>
      </div>
      <p className="text-[10px] font-bold mt-4 uppercase opacity-60 tracking-tighter">{detail}</p>
    </div>
  );
};

export default OwnerDashboard;
