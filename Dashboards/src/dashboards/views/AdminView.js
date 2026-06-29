import React, { useEffect, useState, useCallback } from "react";
import {
  ShieldAlert, BarChart3, Globe, TrendingUp, Users2, FileText,
  Plus, X, Search, Clock, CheckCircle2, Mail, Phone, MoreVertical, Settings, Activity, ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabase";
import { notifyTutor } from "../../Utils/adminActions";
import StatCard from "../../components/StatCard";
import AddUserModal from "../../features/accounts/AddUserModal";
import toast, { Toaster } from "react-hot-toast";
import Messages from "../../Utils/fetchMessage";
import SalesPipelineModal from "../../features/commerce/SalesPipelineModal";
import AnalyticsDashboard from "../../features/commerce/Analytics";
import QuickActions2 from "../../components/QuickActions2";

/* =========================
   SHARED UI HELPERS
========================= */
const Loading = ({ label }) => (
  <div className="flex flex-col items-center justify-center p-24 text-center space-y-4">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
    <p className="text-xs font-black tracking-widest text-slate-500 uppercase animate-pulse">
      {label || "LOADING DATA..."}
    </p>
  </div>
);

const ModalShell = ({ title, icon: Icon, children, onClose }) => (
  <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xl z-[1000] flex items-center justify-center p-4 transition-all duration-300">
    <div className="bg-white rounded-[32px] w-full max-w-5xl max-h-[88vh] overflow-hidden shadow-2xl shadow-slate-950/20 flex flex-col font-sans border border-slate-100 transform transition-all duration-300 scale-100">
      <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-3">
            {Icon && (
              <div className="p-2.5 bg-gradient-to-tr from-blue-50 to-indigo-50 text-blue-600 rounded-2xl border border-blue-100/50 shadow-xs">
                <Icon size={22} />
              </div>
            )} 
            {title}
          </h2>
        </div>
        <button 
          onClick={onClose} 
          className="p-2.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all duration-200 border border-slate-100"
        >
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white">
        {children}
      </div>
    </div>
  </div>
);
const IssueActionModal = ({ issue, isOpen, onClose, onUpdate }) => {
    const [status, setStatus] = useState(issue?.status || 'open');
    const [loading, setLoading] = useState(false);
    const handleSave = async () => {
      setLoading(true);
      await supabase.from("issues").update({ status }).eq("id", issue.id);
      onUpdate(); onClose(); setLoading(false);
    };
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 w-full max-w-sm border border-slate-100 shadow-2xl">
          <h3 className="font-black mb-4">Update Issue Status</h3>
          <select className="w-full p-4 bg-slate-50 rounded-xl mb-4 font-bold border" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <button onClick={handleSave} className="w-full py-3 bg-blue-600 text-white rounded-xl font-black">Save Status</button>
        </div>
      </div>
    );
  };
/* =========================
   AUDIT LOGS MODAL
========================= */
const AuditLogsModal = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [query, setQuery] = useState("");
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoadingLogs(true);
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
        setLoadingLogs(false);
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
          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 focus:bg-white rounded-2xl border border-slate-200/60 focus:border-blue-500 outline-none font-bold text-sm transition-all shadow-xs placeholder:text-slate-400 text-slate-800 focus:ring-4 focus:ring-blue-500/10"
          placeholder="Search logs by student or class name..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>
      
      {loadingLogs ? (
        <Loading label="FETCHING ARCHIVED LOGS..." />
      ) : filteredLogs.length === 0 ? (
        <div className="p-12 text-center font-bold text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          No audit logs match your search.
        </div>
      ) : (
        <div className="space-y-3 pr-1 max-h-[50vh] overflow-y-auto custom-scrollbar">
          {filteredLogs.map(log => (
            <div key={log.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md hover:shadow-slate-100/80 transition-all duration-200 hover:border-slate-200 group">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-colors ${
                  log.status === 'present' 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                    : 'bg-amber-50 text-amber-600 border border-amber-100'
                }`}>
                  {log.status === 'present' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm leading-tight group-hover:text-blue-600 transition-colors">{log.students?.full_name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 flex items-center gap-1.5">
                    <span className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-md font-extrabold">{log.calendar_events?.title}</span>
                    • 
                    <span className="text-slate-500 font-medium">{log.calendar_events?.tutors?.full_name}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-slate-800">{new Date(log.calendar_events?.start_time).toLocaleDateString()}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100/80">
                  Logged {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
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
  const [stats, setStats] = useState({ revenue: 0, tutors: 0, students: 0, conversion: 0, issues: 0 });
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState([]);
  const [showAudit, setShowAudit] = useState(false);
  const [showSales, setShowSales] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const nowTime = new Date();

  const fetchIssues = async () => {
    const { data } = await supabase
      .from("issues")
      .select(`id, title, status, priority, created_at, users:reported_by(full_name)`)
      .order("created_at", { ascending: false });
    setIssues(data || []);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
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
          .from("calendar_events")
          .select(`*, tutors:tutor_id(full_name), event_attendance(id, students(full_name))`)
          .or(`and(start_time.gte.${startOfToday.toISOString()},start_time.lte.${endOfToday.toISOString()}),and(end_time.gte.${startOfToday.toISOString()},end_time.lte.${endOfToday.toISOString()})`)
          .order("start_time")
      ]);

      setStats({
        revenue: payments?.reduce((s, p) => s + p.amount, 0) || 0,
        tutors: tutors || 0,
        students: students || 0,
        conversion: leads ? ((converted / leads) * 100).toFixed(1) : 0,
        issues: issuesCount || 0
      });

      setUpcoming(classes || []);
    } catch (error) {
      toast.error("Failed to fetch fresh dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    fetchIssues();
  }, [fetchAll]);

  if (loading) return <Loading label="COMPILING ADMINISTRATIVE METRICS..." />;

  return (
    <div className="pb-20 max-w-[1600px] mx-auto px-4 sm:px-6 transition-all duration-300">
      <Toaster position="top-right" />

      {/* STATS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-8">
        {role === "owner" && (
          <StatCard
            title="Total Revenue"
            value={`KES ${stats.revenue.toLocaleString()}`}
            color="emerald"
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

      <div className="grid grid-cols-12 gap-6 lg:gap-8">
        {/* MAIN OPERATIONS HUB */}
        <div className="col-span-12 xl:col-span-8 flex flex-col gap-6 lg:gap-8">
          <QuickActions2 userId={userId} role="owner" />

          {/* REPORTED SYSTEM ISSUES */}
          {(role === "owner" || role === "tech_admin") && (
            <div className="bg-white rounded-[28px] p-6 md:p-8 border border-slate-100 shadow-xs hover:shadow-xl hover:shadow-slate-100/50 transition-all duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2.5">
                  <div className="p-2.5 bg-rose-50 text-rose-500 rounded-xl border border-rose-100/60 shadow-2xs">
                    <ShieldAlert size={20} />
                  </div> 
                  Reported Technical Issues
                </h3>
                {issues.length > 0 && (
                  <span className="bg-rose-50 border border-rose-100 text-rose-600 px-3 py-1 rounded-full text-xs font-black">
                    {issues.length} Pending
                  </span>
                )}
              </div>
              
              {issues.length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-sm font-bold bg-gradient-to-br from-slate-50/50 to-white rounded-2xl border border-dashed border-slate-200">
                  No open infrastructure issues 🎉
                </div>
              ) : (
                <div className="space-y-3">
                  {issues.slice(0, 5).map(issue => (
                    <div key={issue.id} 
                    onClick={() => { setSelectedIssue(issue); setShowIssueModal(true); }}
                    className="p-4 cursor-pointer rounded-2xl border border-slate-100 flex justify-between items-center bg-gradient-to-r from-white to-slate-50/30 hover:from-slate-50/50 hover:to-slate-50/80 transition-all duration-200">
                      <div>
                        <p className="font-black text-slate-900 text-sm tracking-tight">{issue.title}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1.5 flex items-center gap-2">
                          <span className="text-slate-600 font-extrabold">{issue.users?.full_name || "Unknown Staff"}</span>
                          • 
                          <span className={`px-2 py-0.5 rounded-sm font-black ${issue.priority === 'high' ? 'bg-rose-50 text-rose-600 border border-rose-100/40' : 'bg-slate-100 text-slate-500'}`}>
                            {issue.priority || "normal"} priority
                          </span>
                        </p>
                      </div>
                      <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border shadow-2xs ${
                        issue.status === "resolved" 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                          : "bg-rose-50 text-rose-600 border-rose-100 animate-pulse"
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
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-6 lg:gap-8">
          
          {/* NAVIGATION AND SYSTEM LINKOUTS */}
          <div className="bg-slate-900 p-6 md:p-8 rounded-[28px] text-white shadow-xl shadow-slate-950/20 relative overflow-hidden group border border-slate-800">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500"></div>
            <div className="flex items-center gap-2 mb-6 text-blue-400 font-black uppercase text-[10px] tracking-widest">
              <Settings size={16} className="text-blue-500" /> Operations Command Center
            </div>
            
            <div className="space-y-3 relative z-10">
              <Link to="/calendar" className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-blue-950/40 border border-blue-500/30">
                <span>📅 Open Global Calendar</span>
                <Plus size={14} />
              </Link>
              {(role === "owner" || role === "tech_admin" || role === "marketer") && (
                <Link to="/admin/referrals" className="w-full flex items-center justify-between p-4 bg-slate-900 border border-slate-800 hover:bg-slate-800/60 active:scale-[0.99] rounded-xl text-xs font-semibold text-slate-300 transition-all group">
                  <span>🎟️ Sales Referral Pipeline</span>
                  <ChevronRight size={14} className="text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}
              <button onClick={() => setShowAudit(true)} className="w-full p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 active:scale-[0.99] flex justify-between items-center text-xs font-bold transition-all text-slate-200 hover:text-white">
                <span>🕵️ Audit Daily Class Logs</span>
                <FileText size={14} className="text-slate-400" />
              </button>
              
              {(role === "owner" || role === "tech_admin") && (
                <button onClick={() => setShowSales(true)} className="w-full p-4 rounded-2xl border border-amber-500/10 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 active:scale-[0.99] flex justify-between items-center text-xs font-bold transition-all">
                  <span>📈 Sales & Leads Pipeline</span>
                  <TrendingUp size={14} />
                </button>
              )}
              
              {role === "owner" && (
                <button onClick={() => setShowAnalytics(true)} className="w-full p-4 rounded-2xl border border-purple-500/10 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 active:scale-[0.99] flex justify-between items-center text-xs font-bold transition-all">
                  <span>📊 Core Metrics & Analytics</span>
                  <BarChart3 size={14} />
                </button>
              )}
            </div>
          </div>
{/* REFINED LIVE CLASS MONITOR */}
<div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-xs hover:shadow-xl hover:shadow-slate-100/50 transition-all duration-300">
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
      <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg border border-blue-100/50">
        <Activity size={15} className="animate-pulse" />
      </div> 
      Live Class Monitor
    </h3>
  </div>
  
  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
    {upcoming.length === 0 ? (
      <p className="text-xs text-slate-400 font-bold italic p-4 bg-slate-50/50 rounded-xl text-center border border-dashed border-slate-200">
        No classes scheduled for today.
      </p>
    ) : (
      upcoming.map(c => {
        const isLive = new Date(c.start_time) <= nowTime && new Date(c.end_time) >= nowTime;
        const isLate = (new Date(c.start_time) < new Date(nowTime.getTime() - 5 * 60000)) && (!c.event_attendance || c.event_attendance.length === 0);
        const attendanceCount = c.event_attendance?.length || 0;

        return (
          <div key={c.id} className={`p-4 border rounded-2xl transition-all duration-200 ${isLate ? 'bg-rose-50 border-rose-200 shadow-sm' : isLive ? 'bg-rose-50/30 border-rose-100 shadow-xs shadow-rose-100/50' : 'border-slate-100 bg-slate-50/30 hover:bg-slate-50'}`}>
            <div className="flex justify-between items-start gap-2">
              <div>
                <p className="font-black text-slate-900 text-xs leading-snug flex items-center flex-wrap gap-1.5">
                  {c.title}
                  {isLive && <span className="inline-flex items-center text-[8px] px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full font-black uppercase tracking-wider border border-rose-200 animate-pulse">Live</span>}
                  {isLate && <span className="inline-flex items-center text-[8px] px-2 py-0.5 bg-rose-500 text-white rounded-full font-black uppercase tracking-wider">Late</span>}
                </p>
                <p className="text-[10px] font-bold text-blue-600 mt-1.5 uppercase tracking-wider flex items-center gap-1">
                  <span className="text-slate-700 bg-white shadow-3xs border border-slate-100 px-1 rounded-sm font-extrabold">{new Date(c.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  • <span className="text-slate-500">{c.tutors?.full_name}</span>
                </p>
              </div>
              <button onClick={() => { notifyTutor(c.tutor_id, `Confirmed: ${c.title}`); toast.success("Tutor status check pinged!"); }} className="p-2 bg-white hover:bg-emerald-50 text-emerald-600 rounded-xl transition-all border border-slate-100 shadow-3xs hover:border-emerald-200 flex-shrink-0" title="Notify Tutor">
                <CheckCircle2 size={14} />
              </button>
            </div>
            
            <div className="mt-3">
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${Math.min((attendanceCount / 5) * 100, 100)}%` }} />
              </div>
              <p className="text-[9px] font-black text-slate-400 mt-1.5">{attendanceCount} / 5 Students Present</p>
            </div>
          </div>
        );
      })
    )}
  </div>
</div>

          {/* MESSAGES SYSTEM CARD */}
          <Messages userId={userId} isAdmin={true} />
        </div>
      </div>

      {/* SYSTEM CONTROLLERS / SLIDEOVER MODALS */}
      <AuditLogsModal isOpen={showAudit} onClose={() => setShowAudit(false)} />
      <SalesPipelineModal isOpen={showSales} onClose={() => setShowSales(false)} />
      <AnalyticsDashboard isOpen={showAnalytics} onClose={() => setShowAnalytics(false)} />
      <IssueActionModal isOpen={showIssueModal} issue={selectedIssue} onClose={() => setShowIssueModal(false)} onUpdate={fetchIssues} />
    </div>
  );
}