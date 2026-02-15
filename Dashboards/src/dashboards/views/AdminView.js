import React, { useEffect, useState, useCallback } from "react";
import {
  ShieldAlert, BarChart3, Users2, Globe, UserCog, TrendingUp,
  Plus, UserMinus, MoveHorizontal, Trash2, FileText, X,
  Search, Clock, CheckCircle2, Mail, Phone, MoreVertical, Settings
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabase";
import { notifyTutor } from "../../Utils/adminActions";
import StatCard from "../../components/StatCard";
import UserManagement from "../../components/UserManagement";
import AddUserModal from "../../components/AddUserModal";
import toast, { Toaster } from "react-hot-toast";
import Messages from "../../Utils/fetchMessage";
import SalesPipelineModal from "./SalesPipelineModal";
import AnalyticsDashboard from "./Analytics";
import StudentAssignmentManager from "../../components/StudentAssignmentManager";

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
   SALES PIPELINE MODAL
========================= */
// const SalesPipelineModal = ({ isOpen, onClose }) => {
//   const [leads, setLeads] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!isOpen) return;
//     const fetchLeads = async () => {
//       setLoading(true);
//       const { data } = await supabase
//         .from("leads")
//         .select("*")
//         .order("created_at", { ascending: false });
//       setLeads(data || []);
//       setLoading(false);
//     };
//     fetchLeads();
//   }, [isOpen]);

//   if (!isOpen) return null;

//   return (
//     <ModalShell title="Sales & Leads Pipeline" icon={TrendingUp} onClose={onClose}>
//       {loading ? (
//         <Loading label="SYNCING PIPELINE..." />
//       ) : (
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {leads.map(l => (
//             <div key={l.id} className="p-6 rounded-[32px] border border-slate-100 bg-white hover:shadow-xl transition-all group">
//               <div className="flex justify-between items-start mb-4">
//                 <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
//                   l.status === "converted" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
//                 }`}>
//                   {l.status || "NEW LEAD"}
//                 </span>
//                 <button className="text-slate-300 group-hover:text-slate-900"><MoreVertical size={16}/></button>
//               </div>
//               <h4 className="font-black text-slate-900 mb-1">{l.full_name || "Unknown Lead"}</h4>
//               <p className="text-xs font-bold text-slate-400 mb-4">{l.email}</p>
//               <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-50">
//                 <button className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-500"><Mail size={14}/></button>
//                 <button className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-emerald-500"><Phone size={14}/></button>
//                 <div className="ml-auto text-[10px] font-bold text-slate-300">
//                   {new Date(l.created_at).toLocaleDateString()}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </ModalShell>
//   );
// };

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
                  {log.status === 'present' ? <CheckCircle2 size={20}/> : <Clock size={20}/>}
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchIssues = async () => {
    const { data } = await supabase
      .from("issues")
      .select(`id, title, status, priority, created_at, users:reported_by(full_name)`)
      .order("created_at", { ascending: false });
    setIssues(data || []);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const now = new Date().toISOString();

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
        .gte("end_time", now)
        .order("start_time")
        .limit(8)
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

      {/* STATS BAR
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        {role === "owner" && (
          <StatCard title="Total Revenue" value={`KES ${stats.revenue.toLocaleString()}`} color="green" icon={BarChart3} />
        )}
        <StatCard title="Active Tutors" value={stats.tutors} color="blue" icon={Users2} />
        <StatCard title="Active Students" value={stats.students} color="sky" icon={Globe} />
        {(role === "owner" || role === "tech_admin") && (
          <StatCard title="Lead Conv %" value={`${stats.conversion}%`} color="amber" icon={TrendingUp} />
        )}
        {(role === "owner" || role === "tech_admin") && (
          <StatCard title="Open Issues" value={stats.issues} color={stats.issues > 0 ? "rose" : "emerald"} icon={ShieldAlert} />
        )}
      </div> */}
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
          
          {/* USER MANAGEMENT */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl text-white"><UserCog size={20} /></div>
                <h3 className="text-xl font-black text-slate-900">User Management</h3>
              </div>
              {role === "owner" && (
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg">
                  <Plus size={14} /> Add User
                </button>
              )}
            </div>
            <UserManagement key={refreshKey} viewerRole={role} showAdmins={role === "owner"} />
          </div>

              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
  <StudentAssignmentManager />
</div>

          {/* REPORTED ISSUES (TECH ADMIN & OWNER) */}
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
                      <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${
                        issue.status === "resolved" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                      }`}>
                        {issue.status || "open"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* UPCOMING CLASSES MONITORING */}
          {/* <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-6">Upcoming Classes Monitoring</h3>
            <div className="space-y-4">
              {upcoming.map(c => (
                <div key={c.id} className="p-6 border border-slate-50 rounded-[32px] hover:bg-slate-50/50 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-black text-slate-900 text-lg">{c.title}</p>
                      <p className="text-xs font-bold text-blue-600 uppercase">
                        {c.tutors?.full_name} • {new Date(c.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        notifyTutor(c.tutor_id, `Confirmed: ${c.title}`);
                        toast.success("Tutor notified");
                      }}
                      className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all"
                    >
                      <CheckCircle2 size={20} />
                    </button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {c.event_attendance.map(a => (
                      <span key={a.id} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-600 uppercase">
                        {a.students?.full_name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div> */}
          {/* </div> */}
        </div>

      {/* SIDEBAR COMMAND CENTER */}
<div className="col-span-12 xl:col-span-4 flex flex-col gap-8">
  
  {/* COMMAND CENTER */}
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
          <div key={c.id} className="p-4 border border-slate-50 rounded-2xl bg-slate-50/30">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-black text-slate-900 text-xs leading-tight">{c.title}</p>
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

      <AddUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={handleRefresh} />
      <AuditLogsModal isOpen={showAudit} onClose={() => setShowAudit(false)} />
      <SalesPipelineModal isOpen={showSales} onClose={() => setShowSales(false)} />
      <AnalyticsDashboard isOpen={showAnalytics} onClose={() => setShowAnalytics(false)}/>
    </div>
  );
}

// import React, { useEffect, useState, useCallback } from "react";
// import { 
//   ShieldAlert, BarChart3, Users2, Settings, Globe, 
//   UserCog, CheckCircle, TrendingUp, Plus, UserMinus, 
//   MoveHorizontal, Trash2, FileText, X, Search, Clock, 
//   CheckCircle2, Filter, Mail, Phone, MoreVertical
// } from "lucide-react";
// import { supabase } from "../../supabase";
// import { notifyTutor } from "../../Utils/adminActions";
// import { Link } from "react-router-dom";
// import StatCard from "../../components/StatCard";
// import Messages from "../../Utils/fetchMessage";
// import UserManagement from "../../components/UserManagement";
// import AddUserModal from "../../components/AddUserModal"; 
// import toast, { Toaster } from 'react-hot-toast';

// // --- SALES PIPELINE MODAL ---
// const SalesPipelineModal = ({ isOpen, onClose }) => {
//   const [leads, setLeads] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (isOpen) {
//       const fetchLeads = async () => {
//         setLoading(true);
//         const { data, error } = await supabase
//           .from('leads')
//           .select('*')
//           .order('created_at', { ascending: false });
//         if (!error) setLeads(data);
//         setLoading(false);
//       };
//       fetchLeads();
//     }
//   }, [isOpen]);

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
//       <div className="bg-white rounded-[40px] w-full max-w-5xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col font-sans">
//         <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-amber-50/30">
//           <div>
//             <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
//               <TrendingUp className="text-amber-500" /> Sales & Leads Pipeline
//             </h2>
//             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Conversion Tracking</p>
//           </div>
//           <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-all"><X size={24} /></button>
//         </div>
        
//         <div className="flex-1 overflow-y-auto p-8">
//           {loading ? (
//             <div className="p-20 text-center font-black text-slate-300 animate-pulse">SYNCING PIPELINE...</div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {leads.map((lead) => (
//                 <div key={lead.id} className="p-6 rounded-[32px] border border-slate-100 bg-white hover:shadow-xl transition-all group">
//                   <div className="flex justify-between items-start mb-4">
//                     <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
//                       lead.status === 'converted' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
//                     }`}>
//                       {lead.status || 'NEW LEAD'}
//                     </div>
//                     <button className="text-slate-300 group-hover:text-slate-900"><MoreVertical size={16}/></button>
//                   </div>
//                   <h4 className="font-black text-slate-900 mb-1">{lead.full_name || "Unknown Lead"}</h4>
//                   <p className="text-xs font-bold text-slate-400 mb-4">{lead.email}</p>
                  
//                   <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-50">
//                     <button className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-500 transition-colors"><Mail size={14}/></button>
//                     <button className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-emerald-500 transition-colors"><Phone size={14}/></button>
//                     <div className="ml-auto text-[10px] font-bold text-slate-300">
//                       {new Date(lead.created_at).toLocaleDateString()}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- AUDIT LOGS MODAL ---
// const AuditLogsModal = ({ isOpen, onClose }) => {
//   const [logs, setLogs] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (isOpen) {
//       const fetchLogs = async () => {
//         setLoading(true);
//         const { data, error } = await supabase
//           .from('event_attendance')
//           .select(`
//             id, status, created_at,
//             students ( full_name ),
//             calendar_events ( title, start_time, tutors:tutor_id ( full_name ) )
//           `)
//           .order('created_at', { ascending: false });
//         if (!error) setLogs(data);
//         setLoading(false);
//       };
//       fetchLogs();
//     }
//   }, [isOpen]);

//   const filteredLogs = logs.filter(log => 
//     log.students?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     log.calendar_events?.title?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
//       <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
//         <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
//           <div>
//             <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
//               <FileText className="text-blue-600" /> Audit Class Logs
//             </h2>
//             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Historical Records</p>
//           </div>
//           <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-all"><X size={24} /></button>
//         </div>
//         <div className="p-6 border-b border-slate-100 bg-white">
//           <div className="relative">
//             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//             <input 
//               type="text" placeholder="Search logs..." 
//               className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-blue-500 outline-none font-bold transition-all"
//               value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
//         </div>
//         <div className="flex-1 overflow-y-auto p-6 space-y-3">
//           {loading ? (
//             <div className="p-20 text-center font-black text-slate-300 animate-pulse">LOADING ARCHIVES...</div>
//           ) : filteredLogs.map((log) => (
//             <div key={log.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-3xl hover:shadow-md transition-all">
//               <div className="flex items-center gap-4">
//                 <div className={`p-3 rounded-2xl ${log.status === 'present' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
//                   {log.status === 'present' ? <CheckCircle2 size={20}/> : <Clock size={20}/>}
//                 </div>
//                 <div>
//                   <h4 className="font-black text-slate-900 text-sm">{log.students?.full_name}</h4>
//                   <p className="text-[10px] font-bold text-slate-400 uppercase">
//                     {log.calendar_events?.title} • {log.calendar_events?.tutors?.full_name}
//                   </p>
//                 </div>
//               </div>
//               <div className="text-right">
//                 <p className="text-xs font-black text-slate-900">{new Date(log.calendar_events?.start_time).toLocaleDateString()}</p>
//                 <p className="text-[9px] font-bold text-slate-400 uppercase italic">Logged {new Date(log.created_at).toLocaleTimeString()}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- MAIN COMPONENT ---
// export default function AdminView({ userId, role }) {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isAuditOpen, setIsAuditOpen] = useState(false);
//   const [isSalesOpen, setIsSalesOpen] = useState(false);
//   const [refreshKey, setRefreshKey] = useState(0); 
//   const [adminStats, setAdminStats] = useState({
//     tutors: 0, issues: 0, totalRevenue: 0, students: 0, conversionRate: 0
//   });
//   const [upcomingClasses, setUpcomingClasses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [transferringStudent, setTransferringStudent] = useState(null);

//   const fetchAdminData = useCallback(async (showLoading = true) => {
//     if (showLoading) setLoading(true);
//     try {
//       const nowISO = new Date().toISOString();
      
//       const [
//         { data: revenueData }, { count: tutors }, { count: students }, 
//         { count: leads }, { count: paidLeads }, { count: issues }
//       ] = await Promise.all([
//         supabase.from('payments').select('amount').eq('status', 'paid'),
//         supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'tutor'),
//         supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
//         supabase.from('leads').select('*', { count: 'exact', head: true }),
//         supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'converted'),
//         supabase.from('issues').select('*', { count: 'exact', head: true }).eq('status', 'open')
//       ]);

//       const totalRev = revenueData?.reduce((sum, p) => sum + p.amount, 0) || 0;
//       const convRate = leads ? ((paidLeads / leads) * 100).toFixed(1) : 0;

//       setAdminStats({ totalRevenue: totalRev, tutors: tutors || 0, students: students || 0, conversionRate: convRate, issues: issues || 0 });

//       const { data: classData } = await supabase
//         .from('calendar_events')
//         .select(`*, tutors:tutor_id(full_name), event_attendance ( id, student_id, students ( full_name ) )`)
//         .gte('end_time', nowISO)
//         .order('start_time', { ascending: true })
//         .limit(8);
      
//       setUpcomingClasses(classData || []);
//     } catch (error) {
//       console.error("Error fetching admin data:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => { fetchAdminData(); }, [fetchAdminData]);

//   const handleRefresh = () => { setRefreshKey(prev => prev + 1); fetchAdminData(false); };

//   const handleRemoveStudent = async (attendanceId) => {
//     if(!window.confirm("Remove student from this session?")) return;
//     const { error } = await supabase.from('event_attendance').delete().eq('id', attendanceId);
//     if (!error) { toast.success("Student removed"); fetchAdminData(false); }
//   };

//   const handleBulkClear = async (eventId) => {
//     if (!window.confirm("Clear all students from this class?")) return;
//     const { error } = await supabase.from('event_attendance').delete().eq('event_id', eventId);
//     if (!error) { toast.success("Class roster cleared"); fetchAdminData(false); }
//   };

//   const handleTransferExecute = async (targetEventId, targetStart, targetEnd) => {
//     const { data: conflict } = await supabase
//       .from('event_attendance')
//       .select('id, calendar_events!inner(start_time, end_time)')
//       .eq('student_id', transferringStudent.studentId)
//       .lt('calendar_events.start_time', targetEnd)
//       .gt('calendar_events.end_time', targetStart);

//     if (conflict && conflict.length > 0) {
//       setTransferringStudent(null);
//       return toast.error("CONFLICT: Student already has a class at this time.");
//     }

//     const { error } = await supabase
//       .from('event_attendance')
//       .update({ event_id: targetEventId })
//       .eq('id', transferringStudent.attendanceId);

//     if (!error) {
//       toast.success(`Moved ${transferringStudent.name} successfully`);
//       setTransferringStudent(null);
//       fetchAdminData(false);
//     }
//   };

//   const handleConfirmClass = (cls) => {
//     const names = cls.event_attendance?.map(a => a.students?.full_name).join(", ") || "Guest";
//     notifyTutor(cls.tutor_id, `Confirmed: ${cls.title} with ${names}`);
//     toast.success("Tutor notified!");
//   };

//   if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400">LOADING METRICS...</div>;

//   return (
//     <div className="animate-in fade-in duration-500 pb-20">
//       <Toaster position="top-right" />
      
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
//         {role === 'owner' && (
//            <StatCard title="Total Revenue" value={`KES ${adminStats.totalRevenue.toLocaleString()}`} color="green" icon={BarChart3} />
//         )}
//         <StatCard title="Active Tutors" value={adminStats.tutors} color="blue" icon={Users2} />
//         <StatCard title="Active Students" value={adminStats.students} color="sky" icon={Globe} />
//         {(role === 'owner' || (role === 'tech_admin' && userId)) && (
//           <StatCard title="Lead Conv %" value={`${adminStats.conversionRate}%`} color="amber" icon={TrendingUp} />
//         )}
//         {(role === 'owner' || role === 'operations_admin') && (
//           <StatCard title="Open Issues" value={adminStats.issues} color={adminStats.issues > 0 ? "rose" : "emerald"} icon={ShieldAlert} />
//         )}
//       </div>

//       <div className="grid grid-cols-12 gap-8">
//         <div className="col-span-12 xl:col-span-8 flex flex-col gap-8">
//            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
//              <div className="flex justify-between items-center mb-6">
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 bg-blue-600 rounded-xl text-white"><UserCog size={20} /></div>
//                   <h3 className="text-xl font-black text-slate-900 font-sans">User Management</h3>
//                 </div>
//                 {role === 'owner' && (
//                   <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg">
//                     <Plus size={14} /> Add User
//                   </button>
//                 )}
//              </div>
//              <UserManagement key={refreshKey} viewerRole={role} showAdmins={role === 'owner'} /> 
//            </div>

//            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
//               <div className="p-8 border-b border-slate-50 flex justify-between items-center">
//                 <h3 className="text-xl font-black text-slate-900 font-sans">Live Class Monitoring</h3>
//                 {transferringStudent && (
//                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black animate-pulse">
//                      <MoveHorizontal size={12} /> MOVING: {transferringStudent.name.toUpperCase()}
//                    </div>
//                 )}
//               </div>
//               <ul className="divide-y divide-slate-50">
//                 {upcomingClasses.length > 0 ? upcomingClasses.map(cls => {
//                   const attendees = cls.event_attendance || [];
//                   const now = new Date();
//                   const isLive = now >= new Date(cls.start_time) && now <= new Date(cls.end_time);

//                   return (
//                     <li key={cls.id} className={`p-6 flex justify-between items-start transition-all ${transferringStudent ? 'cursor-pointer hover:bg-blue-50 ring-2 ring-inset ring-transparent hover:ring-blue-500' : 'hover:bg-slate-50/50'}`}
//                       onClick={() => transferringStudent && handleTransferExecute(cls.id, cls.start_time, cls.end_time)}>
//                       <div className="flex flex-col gap-2">
//                         <div className="flex flex-wrap gap-2">
//                           {attendees.map(att => (
//                             <div key={att.id} className="group relative flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
//                               <span className="text-[10px] font-bold text-slate-600">{att.students?.full_name}</span>
//                               <div className="hidden group-hover:flex items-center gap-1 ml-1 border-l pl-1 border-slate-100">
//                                 <button onClick={(e) => { e.stopPropagation(); setTransferringStudent({ attendanceId: att.id, studentId: att.student_id, name: att.students.full_name }); }} className="text-blue-500 p-0.5"><MoveHorizontal size={12}/></button>
//                                 <button onClick={(e) => { e.stopPropagation(); handleRemoveStudent(att.id); }} className="text-red-500 p-0.5"><UserMinus size={12}/></button>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                         <p className="text-xs font-black text-slate-900 uppercase">{cls.title} <span className="text-slate-300 mx-2">|</span> {cls.tutors?.full_name}</p>
//                       </div>
//                       <div className="flex items-center gap-3">
//                         <div className="text-right">
//                            <p className="text-xs font-black">{new Date(cls.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
//                            {isLive ? (
//                              <span className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase animate-pulse">
//                                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full"></span> Live Now
//                              </span>
//                            ) : <p className="text-[9px] font-bold text-blue-500 uppercase">Upcoming</p>}
//                         </div>
//                         <button onClick={(e) => { e.stopPropagation(); handleBulkClear(cls.id); }} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
//                         <button onClick={() => handleConfirmClass(cls)} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100"><CheckCircle size={20} /></button>
//                       </div>
//                     </li>
//                   );
//                 }) : <li className="p-12 text-center text-slate-400 font-bold">No upcoming classes.</li>}
//               </ul>
//            </div>
//         </div>

//         <div className="col-span-12 xl:col-span-4 flex flex-col gap-8">
//            <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-xl">
//              <div className="flex items-center gap-2 mb-6 text-blue-400 font-bold uppercase text-[10px] tracking-widest"><Settings size={18}/> Command Center</div>
//              <div className="space-y-3">
//                <Link to="/calendar" className="w-full flex items-center justify-between p-4 bg-blue-600 hover:bg-blue-700 rounded-2xl text-xs font-black uppercase tracking-widest transition-all mb-4">
//                  <span>📅 Global Calendar</span>
//                  <Plus size={14} />
//                </Link>

//                <button onClick={() => setIsAuditOpen(true)} className="w-full text-left p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold transition-all border border-white/5 flex justify-between items-center group">
//                  <span>🕵️ Audit Class Logs</span>
//                  <FileText size={14} className="opacity-0 group-hover:opacity-100 transition-opacity"/>
//                </button>
               
//                {role === 'owner' && (
//                  <button className="w-full text-left p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl text-xs font-bold border border-emerald-500/10 flex items-center justify-between group">
//                    💰 Business Financial Report <TrendingUp size={14}/>
//                  </button>
//                )}

//                {role === 'tech_admin' && (
//                  <button onClick={() => setIsSalesOpen(true)} className="w-full text-left p-4 bg-amber-500/10 text-amber-400 rounded-2xl text-xs font-bold border border-amber-500/10 flex items-center gap-2 group">
//                    <TrendingUp size={14} className="group-hover:animate-bounce"/> 📈 Sales & Leads Pipeline
//                  </button>
//                )}
//              </div>
//            </div>
//            <Messages userId={userId} isAdmin={true} />
//         </div>
//       </div>

//       <AddUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={handleRefresh} />
//       <AuditLogsModal isOpen={isAuditOpen} onClose={() => setIsAuditOpen(false)} />
//       <SalesPipelineModal isOpen={isSalesOpen} onClose={() => setIsSalesOpen(false)} />
//     </div>
//   );
// }
// // import React, { useEffect, useState, useCallback } from "react";
// // import { 
// //   ShieldAlert, BarChart3, Users2, Settings, Globe, 
// //   UserCog, CheckCircle, TrendingUp, Plus, UserMinus, 
// //   MoveHorizontal, Trash2, FileText, Wrench, AlertTriangle,
// //   X, Search, Clock, CheckCircle2
// // } from "lucide-react";
// // import { supabase } from "../../supabase";
// // import { notifyTutor } from "../../Utils/adminActions";
// // import { Link } from "react-router-dom";
// // import StatCard from "../../components/StatCard";
// // import Messages from "../../Utils/fetchMessage";
// // import UserManagement from "../../components/UserManagement";
// // import AddUserModal from "../../components/AddUserModal"; 
// // import toast, { Toaster } from 'react-hot-toast';

// // // --- AUDIT LOGS MODAL ---
// // const AuditLogsModal = ({ isOpen, onClose }) => {
// //   const [logs, setLogs] = useState([]);
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     if (isOpen) {
// //       const fetchLogs = async () => {
// //         setLoading(true);
// //         const { data, error } = await supabase
// //           .from('event_attendance')
// //           .select(`
// //             id, status, created_at,
// //             students ( full_name ),
// //             calendar_events ( title, start_time, tutors:tutor_id ( full_name ) )
// //           `)
// //           .order('created_at', { ascending: false });
// //         if (!error) setLogs(data);
// //         setLoading(false);
// //       };
// //       fetchLogs();
// //     }
// //   }, [isOpen]);

// //   const filteredLogs = logs.filter(log => 
// //     log.students?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //     log.calendar_events?.title?.toLowerCase().includes(searchTerm.toLowerCase())
// //   );

// //   if (!isOpen) return null;

// //   return (
// //     <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
// //       <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
// //         <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
// //           <div>
// //             <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
// //               <FileText className="text-blue-600" /> Audit Class Logs
// //             </h2>
// //             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Historical Records</p>
// //           </div>
// //           <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-all"><X size={24} /></button>
// //         </div>
// //         <div className="p-6 border-b border-slate-100 bg-white">
// //           <div className="relative">
// //             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
// //             <input 
// //               type="text" placeholder="Search logs..." 
// //               className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-blue-500 outline-none font-bold transition-all"
// //               value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
// //             />
// //           </div>
// //         </div>
// //         <div className="flex-1 overflow-y-auto p-6 space-y-3">
// //           {loading ? (
// //             <div className="p-20 text-center font-black text-slate-300 animate-pulse">LOADING ARCHIVES...</div>
// //           ) : filteredLogs.map((log) => (
// //             <div key={log.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-3xl hover:shadow-md transition-all">
// //               <div className="flex items-center gap-4">
// //                 <div className={`p-3 rounded-2xl ${log.status === 'present' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
// //                   {log.status === 'present' ? <CheckCircle2 size={20}/> : <Clock size={20}/>}
// //                 </div>
// //                 <div>
// //                   <h4 className="font-black text-slate-900 text-sm">{log.students?.full_name}</h4>
// //                   <p className="text-[10px] font-bold text-slate-400 uppercase">
// //                     {log.calendar_events?.title} • {log.calendar_events?.tutors?.full_name}
// //                   </p>
// //                 </div>
// //               </div>
// //               <div className="text-right">
// //                 <p className="text-xs font-black text-slate-900">{new Date(log.calendar_events?.start_time).toLocaleDateString()}</p>
// //                 <p className="text-[9px] font-bold text-slate-400 uppercase italic">Logged {new Date(log.created_at).toLocaleTimeString()}</p>
// //               </div>
// //             </div>
// //           ))}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // // --- MAIN COMPONENT ---
// // export default function AdminView({ userId, role }) {
// //   const [isModalOpen, setIsModalOpen] = useState(false);
// //   const [isAuditOpen, setIsAuditOpen] = useState(false);
// //   const [refreshKey, setRefreshKey] = useState(0); 
// //   const [adminStats, setAdminStats] = useState({
// //     tutors: 0, issues: 0, totalRevenue: 0, students: 0, conversionRate: 0
// //   });
// //   const [upcomingClasses, setUpcomingClasses] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [transferringStudent, setTransferringStudent] = useState(null);

// //   const fetchAdminData = useCallback(async (showLoading = true) => {
// //     if (showLoading) setLoading(true);
// //     try {
// //       const nowISO = new Date().toISOString();
      
// //       // Fetch core counts
// //       const [
// //         { data: revenueData }, { count: tutors }, { count: students }, 
// //         { count: leads }, { count: paidLeads }, { count: issues }
// //       ] = await Promise.all([
// //         supabase.from('payments').select('amount').eq('status', 'paid'),
// //         supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'tutor'),
// //         supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
// //         supabase.from('leads').select('*', { count: 'exact', head: true }),
// //         supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'converted'),
// //         supabase.from('issues').select('*', { count: 'exact', head: true }).eq('status', 'open')
// //       ]);

// //       const totalRev = revenueData?.reduce((sum, p) => sum + p.amount, 0) || 0;
// //       const convRate = leads ? ((paidLeads / leads) * 100).toFixed(1) : 0;

// //       setAdminStats({ totalRevenue: totalRev, tutors: tutors || 0, students: students || 0, conversionRate: convRate, issues: issues || 0 });

// //       // Live Class Feed: Only classes ending in the future
// //       const { data: classData } = await supabase
// //         .from('calendar_events')
// //         .select(`*, tutors:tutor_id(full_name), event_attendance ( id, student_id, students ( full_name ) )`)
// //         .gte('end_time', nowISO)
// //         .order('start_time', { ascending: true })
// //         .limit(8);
      
// //       setUpcomingClasses(classData || []);
// //     } catch (error) {
// //       console.error("Error fetching admin data:", error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, []);

// //   useEffect(() => { fetchAdminData(); }, [fetchAdminData]);

// //   const handleRefresh = () => { setRefreshKey(prev => prev + 1); fetchAdminData(false); };

// //   const handleRemoveStudent = async (attendanceId) => {
// //     if(!window.confirm("Remove student from this session?")) return;
// //     const { error } = await supabase.from('event_attendance').delete().eq('id', attendanceId);
// //     if (!error) { toast.success("Student removed"); fetchAdminData(false); }
// //   };

// //   const handleBulkClear = async (eventId) => {
// //     if (!window.confirm("Clear all students from this class?")) return;
// //     const { error } = await supabase.from('event_attendance').delete().eq('event_id', eventId);
// //     if (!error) { toast.success("Class roster cleared"); fetchAdminData(false); }
// //   };

// //   const handleTransferExecute = async (targetEventId, targetStart, targetEnd) => {
// //     const { data: conflict } = await supabase
// //       .from('event_attendance')
// //       .select('id, calendar_events!inner(start_time, end_time)')
// //       .eq('student_id', transferringStudent.studentId)
// //       .lt('calendar_events.start_time', targetEnd)
// //       .gt('calendar_events.end_time', targetStart);

// //     if (conflict && conflict.length > 0) {
// //       setTransferringStudent(null);
// //       return toast.error("CONFLICT: Student already has a class at this time.");
// //     }

// //     const { error } = await supabase
// //       .from('event_attendance')
// //       .update({ event_id: targetEventId })
// //       .eq('id', transferringStudent.attendanceId);

// //     if (!error) {
// //       toast.success(`Moved ${transferringStudent.name} successfully`);
// //       setTransferringStudent(null);
// //       fetchAdminData(false);
// //     }
// //   };

// //   const handleConfirmClass = (cls) => {
// //     const names = cls.event_attendance?.map(a => a.students?.full_name).join(", ") || "Guest";
// //     notifyTutor(cls.tutor_id, `Confirmed: ${cls.title} with ${names}`);
// //     toast.success("Tutor notified!");
// //   };

// //   if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400">LOADING METRICS...</div>;

// //   return (
// //     <div className="animate-in fade-in duration-500 pb-20">
// //       <Toaster position="top-right" />
      
// //       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
// //         {/* REVENUE: Restricted to Owner Only */}
// //         {role === 'owner' && (
// //            <StatCard title="Total Revenue" value={`KES ${adminStats.totalRevenue.toLocaleString()}`} color="green" icon={BarChart3} />
// //         )}

// //         <StatCard title="Active Tutors" value={adminStats.tutors} color="blue" icon={Users2} />
// //         <StatCard title="Active Students" value={adminStats.students} color="sky" icon={Globe} />

// //         {/* CONVERSION: Restricted to Owner OR Current Tech Admin ID */}
// //         {(role === 'owner' || (role === 'tech_admin' && userId)) && (
// //           <StatCard title="Lead Conv %" value={`${adminStats.conversionRate}%`} color="amber" icon={TrendingUp} />
// //         )}

// //         {/* ISSUES: Restricted to Owner and Operations */}
// //         {(role === 'owner' || role === 'operations_admin') && (
// //           <StatCard title="Open Issues" value={adminStats.issues} color={adminStats.issues > 0 ? "rose" : "emerald"} icon={ShieldAlert} />
// //         )}
// //       </div>

// //       <div className="grid grid-cols-12 gap-8">
// //         <div className="col-span-12 xl:col-span-8 flex flex-col gap-8">
// //            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
// //              <div className="flex justify-between items-center mb-6">
// //                 <div className="flex items-center gap-3">
// //                   <div className="p-2 bg-blue-600 rounded-xl text-white"><UserCog size={20} /></div>
// //                   <h3 className="text-xl font-black text-slate-900 font-sans">User Management</h3>
// //                 </div>
// //                 {role === 'owner' && (
// //                   <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg">
// //                     <Plus size={14} /> Add User
// //                   </button>
// //                 )}
// //              </div>
// //              <UserManagement key={refreshKey} viewerRole={role} showAdmins={role === 'owner'} /> 
// //            </div>

// //            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
// //               <div className="p-8 border-b border-slate-50 flex justify-between items-center">
// //                 <h3 className="text-xl font-black text-slate-900 font-sans">Live Class Monitoring</h3>
// //                 {transferringStudent && (
// //                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black animate-pulse">
// //                      <MoveHorizontal size={12} /> MOVING: {transferringStudent.name.toUpperCase()}
// //                    </div>
// //                 )}
// //               </div>
// //               <ul className="divide-y divide-slate-50">
// //                 {upcomingClasses.length > 0 ? upcomingClasses.map(cls => {
// //                   const attendees = cls.event_attendance || [];
// //                   const now = new Date();
// //                   const isLive = now >= new Date(cls.start_time) && now <= new Date(cls.end_time);

// //                   return (
// //                     <li key={cls.id} className={`p-6 flex justify-between items-start transition-all ${transferringStudent ? 'cursor-pointer hover:bg-blue-50 ring-2 ring-inset ring-transparent hover:ring-blue-500' : 'hover:bg-slate-50/50'}`}
// //                       onClick={() => transferringStudent && handleTransferExecute(cls.id, cls.start_time, cls.end_time)}>
// //                       <div className="flex flex-col gap-2">
// //                         <div className="flex flex-wrap gap-2">
// //                           {attendees.map(att => (
// //                             <div key={att.id} className="group relative flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
// //                               <span className="text-[10px] font-bold text-slate-600">{att.students?.full_name}</span>
// //                               <div className="hidden group-hover:flex items-center gap-1 ml-1 border-l pl-1 border-slate-100">
// //                                 <button onClick={(e) => { e.stopPropagation(); setTransferringStudent({ attendanceId: att.id, studentId: att.student_id, name: att.students.full_name }); }} className="text-blue-500 p-0.5"><MoveHorizontal size={12}/></button>
// //                                 <button onClick={(e) => { e.stopPropagation(); handleRemoveStudent(att.id); }} className="text-red-500 p-0.5"><UserMinus size={12}/></button>
// //                               </div>
// //                             </div>
// //                           ))}
// //                         </div>
// //                         <p className="text-xs font-black text-slate-900 uppercase">{cls.title} <span className="text-slate-300 mx-2">|</span> {cls.tutors?.full_name}</p>
// //                       </div>
// //                       <div className="flex items-center gap-3">
// //                         <div className="text-right">
// //                            <p className="text-xs font-black">{new Date(cls.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
// //                            {isLive ? (
// //                              <span className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase animate-pulse">
// //                                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full"></span> Live Now
// //                              </span>
// //                            ) : <p className="text-[9px] font-bold text-blue-500 uppercase">Upcoming</p>}
// //                         </div>
// //                         <button onClick={(e) => { e.stopPropagation(); handleBulkClear(cls.id); }} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
// //                         <button onClick={() => handleConfirmClass(cls)} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100"><CheckCircle size={20} /></button>
// //                       </div>
// //                     </li>
// //                   );
// //                 }) : <li className="p-12 text-center text-slate-400 font-bold">No upcoming classes.</li>}
// //               </ul>
// //            </div>
// //         </div>

// //         <div className="col-span-12 xl:col-span-4 flex flex-col gap-8">
// //            <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-xl">
// //              <div className="flex items-center gap-2 mb-6 text-blue-400 font-bold uppercase text-[10px] tracking-widest"><Settings size={18}/> Command Center</div>
// //              <div className="space-y-3">
// //                <Link to="/calendar" className="w-full flex items-center justify-between p-4 bg-blue-600 hover:bg-blue-700 rounded-2xl text-xs font-black uppercase tracking-widest transition-all mb-4">
// //                  <span>📅 Global Calendar</span>
// //                  <Plus size={14} />
// //                </Link>

// //                <button onClick={() => setIsAuditOpen(true)} className="w-full text-left p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold transition-all border border-white/5 flex justify-between items-center group">
// //                  <span>🕵️ Audit Class Logs</span>
// //                  <FileText size={14} className="opacity-0 group-hover:opacity-100 transition-opacity"/>
// //                </button>
               
// //                {role === 'owner' && (
// //                  <button className="w-full text-left p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl text-xs font-bold border border-emerald-500/10 flex items-center justify-between group">
// //                    💰 Business Financial Report <TrendingUp size={14}/>
// //                  </button>
// //                )}

// //                {role === 'operations_admin' && (
// //                  <button className="w-full text-left p-4 bg-blue-500/10 text-blue-400 rounded-2xl text-xs font-bold border border-blue-500/10 flex items-center gap-2">
// //                    <FileText size={14}/> 📊 Operational Summary
// //                  </button>
// //                )}

// //                {role === 'tech_admin' && (
// //                  <button className="w-full text-left p-4 bg-amber-500/10 text-amber-400 rounded-2xl text-xs font-bold border border-amber-500/10 flex items-center gap-2 group">
// //                    <TrendingUp size={14} className="group-hover:animate-bounce"/> 📈 Sales & Leads Pipeline
// //                  </button>
// //                )}
// //              </div>
// //            </div>
// //            <Messages userId={userId} isAdmin={true} />
// //         </div>
// //       </div>

// //       <AddUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={handleRefresh} />
// //       <AuditLogsModal isOpen={isAuditOpen} onClose={() => setIsAuditOpen(false)} />
// //     </div>
// //   );
// // }
