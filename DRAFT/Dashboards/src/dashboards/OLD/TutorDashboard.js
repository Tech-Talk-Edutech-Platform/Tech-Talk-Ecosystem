import React, { useEffect, useState } from "react";
import { supabase } from '../supabase';
import { Calendar, Clock, Users, AlertCircle } from "lucide-react";

// Utility Imports
import { getPendingAssignmentsCount } from "../Utils/nonGradedAssignments";
import { getPendingClassReviewsCount } from "../Utils/pastUncompletedClasses";

// Component Imports
import StatCard from "../components/StatCard"; 
import ClassList from "../components/ClassList";
import StudentList from "../components/StudentProgress";
import QuickActions from "../components/QuickActions";
import StudentAssignments from "../components/StudentAssignments";
import Messages from "../Utils/fetchMessage";
import UpcomingClasses from "../components/UpcomingClasses";

export default function TutorDashboard() {
  const [tutorId, setTutorId] = useState(null);
  const [userName, setUserName] = useState("Tutor");
  const [userRole, setUserRole] = useState("Tutor");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [stats, setStats] = useState({
    classesToday: 0,
    upcoming: 0,
    activeStudents: 0,
    pendingReviews: 0,
  });

  // 1. Get Logged-in User Info & Role
  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setTutorId(user.id);
        setUserName(user.user_metadata?.full_name || "Nancy Mwangi");

        // Fetch the actual role from your public users table
        const { data: dbUser } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (dbUser) setUserRole(dbUser.role);
      }
    };
    getUserData();
  }, []);

  // 2. Fetch All Live Stats
  useEffect(() => {
    if (!tutorId) return;

    const fetchDashboardStats = async () => {
      const now = new Date();
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      
      const endOfToday = new Date(startOfToday);
      endOfToday.setDate(startOfToday.getDate() + 1);

      try {
        // Fetch Today's Classes Count
        const { count: todayCount } = await supabase
          .from("calendar_events")
          .select("*", { count: 'exact', head: true })
          .eq("tutor_id", tutorId)
          .gte("start_time", startOfToday.toISOString())
          .lt("start_time", endOfToday.toISOString());

        // Fetch Total Upcoming Classes
        const { count: upcomingCount } = await supabase
          .from("calendar_events")
          .select("*", { count: 'exact', head: true })
          .eq("tutor_id", tutorId)
          .gt("start_time", now.toISOString());

        // Fetch Active Students Count
        const { count: studentCount } = await supabase
          .from("students")
          .select("*", { count: 'exact', head: true })
          .eq("assigned_tutor_id", tutorId);

        // --- PENDING REVIEWS (Auto-detect ID inside these functions) ---
        const assignmentCount = await getPendingAssignmentsCount(); 
        const classReviewCount = await getPendingClassReviewsCount();

        setStats({
          classesToday: todayCount || 0,
          upcoming: upcomingCount || 0,
          activeStudents: studentCount || 0,
          pendingReviews: assignmentCount + classReviewCount, 
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      }
    };

    fetchDashboardStats();
  }, [tutorId]);

  // 3. Notification Subscription Logic
  const enableNotifications = async () => {
    if (!('serviceWorker' in navigator)) return;
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const register = await navigator.serviceWorker.register('/sw.js');
        const subscription = await register.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'BM33z_coWxflPv0G1yHrco8qopsqCsl3nyinqH-aNKKoPneM3rBdneK5ejUJlk6RCXNS-VRoK-a3p6RxYMf_4Co' 
        });

        await supabase
          .from('users')
          .update({ push_subscription: JSON.stringify(subscription) })
          .eq('id', tutorId);

        setIsSubscribed(true);
      }
    } catch (err) {
      console.error("Push Error:", err);
    }
  };

  return (
    <div className="p-8 bg-[#F8DAFC] min-h-screen font-sans text-slate-900">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src={`https://i.pravatar.cc/150?u=${tutorId}`} 
              alt="Tutor" 
              className="w-14 h-14 rounded-2xl border-2 border-white shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">{userName}</h2>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{userRole}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-sm font-bold text-slate-700">
              📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          <button 
            onClick={enableNotifications}
            className={`flex items-center gap-2 text-[10px] font-bold px-4 py-2.5 rounded-2xl transition-all shadow-sm ${
              isSubscribed 
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                : 'bg-white text-slate-600 border border-slate-100 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            {isSubscribed ? '✅ Alerts Active' : '🔔 Enable Desktop Alerts'}
          </button>
        </div>
      </header>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Today's Classes" value={stats.classesToday} color="blue" icon={Calendar} />
        <StatCard title="Upcoming Classes" value={stats.upcoming} color="purple" icon={Clock} />
        <StatCard title="My Students" value={stats.activeStudents} color="amber" icon={Users} />
        <StatCard title="Pending Reviews" value={stats.pendingReviews} color="green" icon={AlertCircle} />
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 xl:col-span-5 flex flex-col gap-8">
           <ClassList tutorId={tutorId} />
           <StudentAssignments tutorId={tutorId} />
        </div>

        <div className="col-span-12 lg:col-span-7 xl:col-span-4 flex flex-col gap-8">
           <StudentList tutorId={tutorId} />
           <Messages tutorId={tutorId} />
        </div>

        <div className="col-span-12 lg:col-span-5 xl:col-span-3 flex flex-col gap-8">
           <QuickActions tutorId={tutorId} />
           <UpcomingClasses tutorId={tutorId} />
        </div>
      </div>

      <footer className="mt-12 text-center border-t border-slate-100 pt-8 pb-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          • Tech Talk Hub • Nairobi •
        </p>
      </footer>
    </div>
  );
}