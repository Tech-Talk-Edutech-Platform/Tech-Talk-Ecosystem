import React, { useEffect, useState, useCallback } from "react";
import {
  ShieldAlert, BarChart3, Globe, TrendingUp, Users2, FileText,
  Plus, X, Search, Clock, CheckCircle2, Mail, Phone, MoreVertical, Settings
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabase";
import { notifyTutor } from "../../Utils/adminActions";
import StatCard from "../../components/StatCard";
import AddUserModal from "../../components/AddUserModal";
import toast, { Toaster } from "react-hot-toast";
import Messages from "../../Utils/fetchMessage";
import SalesPipelineModal from "./SalesPipelineModal";
import AnalyticsDashboard from "./Analytics";
// import StudentAssignmentManager from "../../components/StudentAssignmentManager";
import QuickActions2 from "../../components/QuickActions2";

/* =========================
   SHARED UI HELPERS
========================= */
const Loading = ({ label }) => (
  <div className="p-20 text-center font-black animate-pulse text-slate-400">
    {label}
  </div>
);

const ModalShell = ({ title, icon: Icon, children, onClose }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
    <div className="bg-white rounded-[40px] w-full max-w-5xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col font-sans">
      <div className="p-8 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            {Icon && <Icon className="text-blue-600" />} {title}
          </h2>
        </div>
        <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-all"><X size={24} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-8">
        {children}
      </div>
    </div>
  </div>
);

/* =========================
   AUDIT LOGS MODAL
========================= */
const AuditLogsModal = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    supabase
      .from("event_attendance")
      .select(`
        id, status, created_at,
        students(full_name),
        calendar_events(title, start_time, tutors:tutor_id(full_name))
      `)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setLogs(data || []);
        setLoading(false);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter(log =>
    log.students?.full_name?.toLowerCase().includes(query.toLowerCase()) ||
    log.calendar_events?.title?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <ModalShell title="Audit Class Logs" icon={FileText} onClose={onClose}>
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-blue-500 outline-none font-bold transition-all"
          placeholder="Search logs..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>
      {loading ? (
        <Loading label="LOADING ARCHIVES..." />
      ) : (
        <div className="space-y-3">
          {filteredLogs.map(log => (
            <div key={log.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-3xl hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${log.status === 'present' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {log.status === 'present' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">{log.students?.full_name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase italic">
                    {log.calendar_events?.title} • {log.calendar_events?.tutors?.full_name}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-slate-900">{new Date(log.calendar_events?.start_time).toLocaleDateString()}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase italic">Logged {new Date(log.created_at).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </ModalShell>
  );
};

/* =========================
   MAIN ADMIN VIEW
========================= */
export default function AdminView({ userId, role }) {
  const [stats, setStats] = useState({});
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState([]);
  const [showAudit, setShowAudit] = useState(false);
  const [showSales, setShowSales] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchIssues = async () => {
    const { data } = await supabase
      .from("issues")
      .select(`id, title, status, priority, created_at, users:reported_by(full_name)`)
      .order("created_at", { ascending: false });
    setIssues(data || []);
  };

  // const fetchAll = useCallback(async () => {
  //   setLoading(true);
  //   const now = new Date().toISOString();

  //   const [
  //     { data: payments },
  //     { count: tutors },
  //     { count: students },
  //     { count: leads },
  //     { count: converted },
  //     { count: issuesCount },
  //     { data: classes }
  //   ] = await Promise.all([
  //     supabase.from("payments").select("amount").eq("status", "paid"),
  //     supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "tutor"),
  //     supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "student"),
  //     supabase.from("leads").select("*", { count: "exact", head: true }),
  //     supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "converted"),
  //     supabase.from("issues").select("*", { count: "exact", head: true }).eq("status", "open"),
  //     supabase
  //       .from("calendar_events")
  //       .select(`*, tutors:tutor_id(full_name), event_attendance(id, students(full_name))`)
  //       // .gte("end_time", now)
  //       // .order("start_time")
  //       // .limit(8)
  //       .gte("start_time", startOfToday.toISOString())
  //       .lte("start_time", endOfToday.toISOString())
  //       .order("start_time")
  //   ]);

  //   setStats({
  //     revenue: payments?.reduce((s, p) => s + p.amount, 0) || 0,
  //     tutors,
  //     students,
  //     conversion: leads ? ((converted / leads) * 100).toFixed(1) : 0,
  //     issues: issuesCount
  //   });

  //   setUpcoming(classes || []);
  //   setLoading(false);
  // }, []);
  const fetchAll = useCallback(async () => {
    setLoading(true);

    // Define today's range
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [
      { data: payments },
      { count: tutors },
      { count: students },
      { count: leads },
      { count: converted },
      { count: issuesCount },
      { data: classes }
    ] = await Promise.all([
      supabase.from("payments").select("amount").eq("status", "paid"),
      supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "tutor"),
      supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "student"),
      supabase.from("leads").select("*", { count: "exact", head: true }),
      supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "converted"),
      supabase.from("issues").select("*", { count: "exact", head: true }).eq("status", "open"),
      supabase
        // .from("calendar_events")
        // .select(`*, tutors:tutor_id(full_name), event_attendance(id, students(full_name))`)
        // .gte("start_time", startOfToday.toISOString()) // class starts today or later
        // .lte("start_time", endOfToday.toISOString())   // only today
        // .order("start_time", { ascending: true })
        .from("calendar_events")
        .select(`*, tutors:tutor_id(full_name), event_attendance(id, students(full_name))`)
        .or(
          `and(start_time.gte.${startOfToday.toISOString()},start_time.lte.${endOfToday.toISOString()}),and(end_time.gte.${startOfToday.toISOString()},end_time.lte.${endOfToday.toISOString()})`
        )
        .order("start_time")
    ]);

    setStats({
      revenue: payments?.reduce((s, p) => s + p.amount, 0) || 0,
      tutors,
      students,
      conversion: leads ? ((converted / leads) * 100).toFixed(1) : 0,
      issues: issuesCount
    });

    setUpcoming(classes || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    fetchIssues();
  }, [fetchAll]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    fetchAll();
  };

  if (loading) return <Loading label="LOADING ADMIN METRICS..." />;

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <Toaster position="top-right" />

      {/* STATS BAR */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6 mb-10">
        {role === "owner" && (
          <StatCard
            title="Total Revenue"
            value={`KES ${stats.revenue.toLocaleString()}`}
            color="green"
            icon={BarChart3}
          />
        )}
        <StatCard title="Active Tutors" value={stats.tutors} color="blue" icon={Users2} />
        <StatCard title="Active Students" value={stats.students} color="sky" icon={Globe} />
        {(role === "owner" || role === "tech_admin") && (
          <StatCard title="Lead Conv %" value={`${stats.conversion}%`} color="amber" icon={TrendingUp} />
        )}
        {(role === "owner" || role === "tech_admin") && (
          <StatCard
            title="Open Issues"
            value={stats.issues}
            color={stats.issues > 0 ? "rose" : "emerald"}
            icon={ShieldAlert}
          />
        )}
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 xl:col-span-8 flex flex-col gap-8">
          <QuickActions2 userId={userId} role="owner" />

          {/* <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
            <StudentAssignmentManager />
          </div> */}

          {/* REPORTED ISSUES */}
          {(role === "owner" || role === "tech_admin") && (
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="text-rose-500" size={24} /> Reported Issues
                </h3>
              </div>
              {issues.length === 0 ? (
                <div className="p-10 text-center text-slate-400 font-bold bg-slate-50 rounded-2xl">No open issues 🎉</div>
              ) : (
                <div className="space-y-3">
                  {issues.slice(0, 5).map(issue => (
                    <div key={issue.id} className="p-5 rounded-3xl border border-slate-100 flex justify-between items-center hover:bg-slate-50 transition-all">
                      <div>
                        <p className="font-black text-slate-900">{issue.title}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {issue.users?.full_name || "Unknown"} • {issue.priority || "normal"}
                        </p>
                      </div>
                      <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${issue.status === "resolved" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                        }`}>
                        {issue.status || "open"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* SIDEBAR COMMAND CENTER */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-8">
          <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-xl">
            <div className="flex items-center gap-2 mb-6 text-blue-400 font-bold uppercase text-[10px] tracking-widest">
              <Settings size={18} /> Command Center
            </div>
            <div className="space-y-3">
              <Link to="/calendar" className="w-full flex items-center justify-between p-4 bg-blue-600 hover:bg-blue-700 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                <span>📅 Global Calendar</span>
                <Plus size={14} />
              </Link>
              <button onClick={() => setShowAudit(true)} className="w-full p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 flex justify-between items-center text-xs font-bold transition-all">
                <span>🕵️ Audit Class Logs</span>
                <FileText size={14} />
              </button>
              {(role === "owner" || role === "tech_admin") && (
                <button onClick={() => setShowSales(true)} className="w-full p-4 rounded-2xl border border-amber-500/10 bg-amber-500/10 text-amber-400 hover:bg-amber-100/10 flex justify-between items-center text-xs font-bold transition-all">
                  <span>📈 Sales & Leads Pipeline</span>
                  <TrendingUp size={14} />
                </button>
              )}
              {(role === "owner") && (
                <button onClick={() => setShowAnalytics(true)} className="w-full p-4 rounded-2xl border border-purple-500/10 bg-purple-500/10 text-purple-400 hover:bg-purple-100/10 flex justify-between items-center text-xs font-bold transition-all">
                  <span>📊 View Analytics</span>
                  <TrendingUp size={14} />
                </button>
              )}
            </div>
          </div>

          {/* REFINED CLASS MONITORING */}
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
              <Clock size={16} className="text-blue-500" /> Live Class Monitor
            </h3>
            <div className="space-y-3">
              {upcoming.length === 0 ? (
                <p className="text-[10px] text-slate-400 font-bold italic">No classes scheduled.</p>
              ) : (
                upcoming.map(c => (
                  // <div key={c.id} className="p-4 border border-slate-50 rounded-2xl bg-slate-50/30">
                  //   <div className="flex justify-between items-start">
                  //     <div>
                  //       <p className="font-black text-slate-900 text-xs leading-tight">{c.title}</p>
                  //       <p className="text-[10px] font-bold text-blue-600 mt-1 uppercase">
                  //         {new Date(c.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {c.tutors?.full_name}
                  //       </p>
                  //     </div>
                  //     <button
                  //       onClick={() => {
                  //         notifyTutor(c.tutor_id, `Confirmed: ${c.title}`);
                  //         toast.success("Tutor notified");
                  //       }}
                  //       className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all"
                  //     >
                  //       <CheckCircle2 size={14} />
                  //     </button>
                  //   </div>
                  //   <div className="flex gap-1 mt-2 flex-wrap">
                  //     {c.event_attendance.map(a => (
                  //       <span key={a.id} className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[8px] font-black text-slate-500 uppercase">
                  //         {a.students?.full_name?.split(' ')[0]}
                  //       </span>
                  //     ))}
                  //   </div>
                  // </div>
                  <div key={c.id} className="p-4 border border-slate-50 rounded-2xl bg-slate-50/30">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-black text-slate-900 text-xs leading-tight">
                          {c.title}{" "}
                          {new Date(c.start_time) <= new Date() && new Date(c.end_time) >= new Date() && (
                            <span className="ml-2 text-[8px] px-2 py-0.5 bg-red-100 text-red-600 rounded-full uppercase font-black">Happening Now</span>
                          )}
                        </p>
                        <p className="text-[10px] font-bold text-blue-600 mt-1 uppercase">
                          {new Date(c.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {c.tutors?.full_name}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          notifyTutor(c.tutor_id, `Confirmed: ${c.title}`);
                          toast.success("Tutor notified");
                        }}
                        className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all"
                      >
                        <CheckCircle2 size={14} />
                      </button>
                    </div>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {c.event_attendance.map(a => (
                        <span key={a.id} className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[8px] font-black text-slate-500 uppercase">
                          {a.students?.full_name?.split(' ')[0]}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Messages userId={userId} isAdmin={true} />
        </div>
      </div>

      <AuditLogsModal isOpen={showAudit} onClose={() => setShowAudit(false)} />
      <SalesPipelineModal isOpen={showSales} onClose={() => setShowSales(false)} />
      <AnalyticsDashboard isOpen={showAnalytics} onClose={() => setShowAnalytics(false)} />
    </div>
  );
}