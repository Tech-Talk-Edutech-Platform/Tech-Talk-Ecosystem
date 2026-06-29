import React, { useEffect, useState, useCallback } from "react";
import { Calendar, Clock, Users, AlertCircle, ShieldAlert } from "lucide-react";
import { supabase } from "../../supabase";
import QuickActions2 from "../../components/QuickActions2";
import StudentList from "../../features/assessments/results/StudentProgress";
import UpcomingClasses from "../../components/UpcomingClasses";
import RaiseIssue from "./RaiseIssue"; 

export default function TutorView({ userId, courseId, user, fetchAll, stats: initialStats = {} }) {
  const [loading, setLoading] = useState(true);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [activeIssue, setActiveIssue] = useState(null);
  const [stats, setStats] = useState({
    classesToday: 0,
    upcoming: initialStats.upcoming || 0,
    activeStudents: initialStats.activeStudents || 0,
    pendingReviews: initialStats.pendingReviews || 1,
  });

  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
const { data: issues } = await supabase
  .from("issues")
  .select("status")
  .eq("reported_by", userId)
  .order("created_at", { ascending: false })
  .limit(1);

setActiveIssue(issues?.[0]);
      const [calendarRes, studentRes] = await Promise.all([
        supabase
          .from("calendar_events")
          .select(`
            *,
            classes (
              student_name,
              students (full_name, grade)
            )
          `)
          .eq("tutor_id", userId)
          .gte("start_time", todayStart.toISOString())
          .order("start_time", { ascending: true }),
        supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("assigned_tutor_id", userId)
      ]);

      if (calendarRes.error) throw calendarRes.error;

      const events = calendarRes.data || [];
      const studentCount = studentRes.count || 0;

      // Flatten nested structure for the component
      const formattedEvents = events.map(e => ({
        ...e,
        student_name: e.classes?.students?.full_name || e.classes?.student_name || "N/A",
        grade: e.classes?.students?.grade || "N/A"
      }));

      setStats(prev => ({
        ...prev,
        classesToday: events.filter(e => new Date(e.start_time) < new Date(todayStart.getTime() + 86400000)).length,
        upcoming: events.length,
        activeStudents: studentCount
      }));

      setUpcomingClasses(formattedEvents);
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Today's Classes" value={stats.classesToday} color="blue" icon={<Calendar size={20} />} />
        <StatCard title="Upcoming Classes" value={stats.upcoming} color="purple" icon={<Clock size={20} />} />
        <StatCard title="My Students" value={stats.activeStudents} color="amber" icon={<Users size={20} />} />
        <StatCard title="Pending Reviews" value={stats.pendingReviews} color="green" icon={<AlertCircle size={20} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          <QuickActions2 userId={userId} role="tutor" courseId={courseId} />
          <GlassCard>
            <div className="flex items-center gap-2 mb-4 text-red-500">
              <ShieldAlert size={20} />
              <h2 className="text-lg font-black">Support Ticket</h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">Having technical trouble? Send a ticket.</p>
            {!user ? (
              <p className="text-red-500 text-xs">Please log in to send a ticket.</p>
            ) : (
              <RaiseIssue user={user} fetchAll={fetchData} 
              isLocked={activeIssue?.status === 'in_progress' || activeIssue?.status === 'resolved'}
              />
            )}
          </GlassCard>
        </div>

        <div className="lg:col-span-8 xl:col-span-6">
          <StudentList tutorId={userId} />
        </div>

        <div className="lg:col-span-12 xl:col-span-3">
          <GlassCard>
            <UpcomingClasses classes={upcomingClasses} loading={loading} />
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

const GlassCard = ({ children }) => (
  <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
    {children}
  </div>
);

const StatCard = ({ icon, title, value, color }) => {
  const colors = {
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    amber: "bg-amber-500",
    green: "bg-emerald-500"
  };
  return (
    <div className={`${colors[color]} rounded-[24px] p-5 text-white flex items-center justify-between shadow-lg`}>
      <div>
        <p className="text-white/80 text-[10px] font-bold uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-black">{value}</h3>
      </div>
      <div className="opacity-80">{icon}</div>
    </div>
  );
};
// import React, { useEffect, useState, useCallback } from "react";
// import { 
//   Calendar, 
//   Clock, 
//   Users, 
//   AlertCircle, 
//   Sparkles, 
//   ShieldAlert 
// } from "lucide-react";

// import { supabase } from "../../supabase";
// import QuickActions2 from "../../components/QuickActions2";
// import StudentList from "../../components/StudentProgress";
// import UpcomingClasses from "../../components/UpcomingClasses";
// import RaiseIssue from "./RaiseIssue"; 

// export default function TutorView({ userId, courseId, user, fetchAll, stats: initialStats = {} }) {
//   const [loading, setLoading] = useState(true);
//   const [upcomingClasses, setUpcomingClasses] = useState([]);
//   const [stats, setStats] = useState({
//     classesToday: 0,
//     upcoming: initialStats.upcoming || 0,
//     activeStudents: initialStats.activeStudents || 0,
//     pendingReviews: initialStats.pendingReviews || 1,
//   });

//   // const fetchData = useCallback(async () => {
//   //   if (!userId) return;
//   //   setLoading(true);

//   //   try {
//   //     const todayStart = new Date();
//   //     todayStart.setHours(0, 0, 0, 0);
//   //     const todayEnd = new Date();
//   //     todayEnd.setHours(23, 59, 59, 999);

//   //     // Fetch calendar events
//   //     const { data: calendarData } = await supabase
//   //       .from("calendar_events")
//   //       .select("*")
//   //       .eq("tutor_id", userId)
//   //       .gte("start_time", todayStart.toISOString())
//   //       .order("start_time", { ascending: true });

//   //     // Fetch student count
//   //     const { count } = await supabase
//   //       .from("users")
//   //       .select("*", { count: "exact", head: true })
//   //       .eq("assigned_tutor_id", userId);

//   //     if (calendarData) {
//   //       const todayClasses = calendarData.filter(item => 
//   //         new Date(item.start_time) >= todayStart && new Date(item.start_time) <= todayEnd
//   //       );

//   //       setStats(prev => ({
//   //         ...prev,
//   //         classesToday: todayClasses.length,
//   //         upcoming: calendarData.length,
//   //         activeStudents: count || prev.activeStudents
//   //       }));
//   //       setUpcomingClasses(calendarData.slice(0, 4));
//   //     }
//   //   } catch (err) {
//   //     console.error("Dashboard Sync Error:", err);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // }, [userId]);
//   const fetchData = useCallback(async () => {
//     // 1. Critical guard: Stop if no userId
//     if (!userId) {
//       console.warn("fetchData: No userId provided, skipping.");
//       setLoading(false);
//       return;
//     }

//     setLoading(true);

//     try {
//       const todayStart = new Date();
//       todayStart.setHours(0, 0, 0, 0);

//       // // Fetch calendar and students in parallel for speed
//       // const [calendarRes, studentRes] = await Promise.all([
//       //   supabase
//       //     .from("calendar_events")
//       //     .select("*")
//       //     .eq("tutor_id", userId)
//       //     .gte("start_time", todayStart.toISOString())
//       //     .order("start_time", { ascending: true }),
//       //   supabase
//       //     .from("users")
//       //     .select("*", { count: "exact", head: true })
//       //     .eq("assigned_tutor_id", userId)
//       // ]);


//       if (calendarRes.error) throw calendarRes.error;

//       const events = calendarRes.data || [];
//       const studentCount = studentRes.count || 0;

//       // Update State
//       setStats(prev => ({
//         ...prev,
//         classesToday: events.filter(e => new Date(e.start_time) < new Date(todayStart.getTime() + 86400000)).length,
//         upcoming: events.length,
//         activeStudents: studentCount
//       }));

//       setUpcomingClasses(events.slice(0, 4));
//     } catch (err) {
//       console.error("Dashboard Sync Error:", err);
//     } finally {
//       // 2. This ALWAYS runs, turning off the loading spinner
//       setLoading(false);
//     }
//   }, [userId]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   return (
//     <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
//       {/* Metric Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
//         <StatCard title="Today's Classes" value={stats.classesToday} color="blue" icon={<Calendar size={20} />} />
//         <StatCard title="Upcoming Classes" value={stats.upcoming} color="purple" icon={<Clock size={20} />} />
//         <StatCard title="My Students" value={stats.activeStudents} color="amber" icon={<Users size={20} />} />
//         <StatCard title="Pending Reviews" value={stats.pendingReviews} color="green" icon={<AlertCircle size={20} />} />
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
//         {/* Left Column: Actions & Support */}
//         <div className="lg:col-span-4 xl:col-span-3 space-y-6">
    
            
//             <QuickActions2 userId={userId} role="tutor" courseId={courseId} />
       

      
//      <GlassCard>
//   <div className="flex items-center gap-2 mb-4 text-red-500">
//     <ShieldAlert size={20} />
//     <h2 className="text-lg font-black">Support Ticket</h2>
//   </div>
//   <p className="text-xs text-gray-500 mb-4">Having technical trouble? Send a ticket.</p>
  
//   {/* Render only this conditional block */}
//   {!user ? (
//     <p className="text-red-500 text-xs">Please log in to send a ticket.</p>
//   ) : (
//     <RaiseIssue user={user} fetchAll={fetchData} />
//   )}
// </GlassCard>
//         </div>

//         {/* Center: Roster */}
//         <div className="lg:col-span-8 xl:col-span-6">
         
//             <StudentList tutorId={userId} />
         
//         </div>

//         {/* Right: Schedule */}
//         <div className="lg:col-span-12 xl:col-span-3">
//           <GlassCard>
//             <UpcomingClasses classes={upcomingClasses} loading={loading} />
//           </GlassCard>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Sub-components to keep the main view readable
// const GlassCard = ({ children }) => (
//   <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
//     {children}
//   </div>
// );

// const StatCard = ({ icon, title, value, color }) => {
//   const colors = {
//     blue: "bg-blue-500",
//     purple: "bg-purple-500",
//     amber: "bg-amber-500",
//     green: "bg-emerald-500"
//   };
//   return (
//     <div className={`${colors[color]} rounded-[24px] p-5 text-white flex items-center justify-between shadow-lg`}>
//       <div>
//         <p className="text-white/80 text-[10px] font-bold uppercase tracking-wider">{title}</p>
//         <h3 className="text-2xl font-black">{value}</h3>
//       </div>
//       <div className="opacity-80">{icon}</div>
//     </div>
//   );
// };
