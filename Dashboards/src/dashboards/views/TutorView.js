import React, { useEffect, useState } from "react";
import { Calendar, Clock, Users, AlertCircle } from "lucide-react"; 
import StatCard from "../../components/StatCard";
// import ClassList from "../../components/ClassList";
import StudentList from "../../components/StudentProgress";
import QuickActions from "../../components/QuickActions";
// import StudentAssignments from "../../components/StudentAssignments";
// import Messages from "../../Utils/fetchMessage";
import UpcomingClasses from "../../components/UpcomingClasses";

// ADD: Import RaiseIssue
import RaiseIssue from "./RaiseIssue"; // adjust path

import { supabase } from "../../supabase";
import QuickActions2 from "../../components/QuickActions2";

export default function TutorView({ userId, stats: initialStats = {}, user, fetchAll }) {
  // Ensure default values to avoid undefined
  const [stats, setStats] = useState({
    classesToday: 0,
    upcoming: initialStats.upcoming || 0,
    activeStudents: initialStats.activeStudents || 0,
    pendingReviews: initialStats.pendingReviews || 0,
  });

  const [upcomingClasses, setUpcomingClasses] = useState([]);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!userId) return;

      try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const { data, error } = await supabase
          .from("calendar_events")
          .select("*")
          .eq("tutor_id", userId)
          .gte("start_time", todayStart.toISOString())
          .order("start_time", { ascending: true });

        if (error) throw error;

        // Count today's classes
        const todayClasses = data.filter(
          item => new Date(item.start_time) >= todayStart && new Date(item.start_time) <= todayEnd
        );

        setStats(prev => ({ ...prev, classesToday: todayClasses.length }));

        // Keep next 3 upcoming classes (including today)
        setUpcomingClasses(data.slice(0, 3));

      } catch (err) {
        console.error("Fetch Classes Error:", err.message);
        setStats(prev => ({ ...prev, classesToday: 0 }));
        setUpcomingClasses([]);
      }
    };
    const fetchStudentCount = async () => {
  if (!userId) return;

  const { count, error } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("assigned_tutor_id", userId);

  if (error) {
    console.error("Student count error:", error);
  } else {
    setStats(prev => ({ ...prev, activeStudents: count || 0 }));
  }
};


    fetchClasses();
    fetchStudentCount();
  }, [userId]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Today's Classes" value={stats.classesToday} color="blue" icon={Calendar} />
        <StatCard title="Upcoming Classes" value={stats.upcoming} color="purple" icon={Clock} />
        <StatCard title="My Students" value={stats.activeStudents} color="amber" icon={Users} />
        <StatCard title="Pending Reviews" value={stats.pendingReviews} color="green" icon={AlertCircle} />
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 xl:col-span-5 flex flex-col gap-8">
          <QuickActions2 userId={userId} role="tutor" />
           {/* <ClassList tutorId={userId} /> */}
           {/* <StudentAssignments tutorId={userId} /> */}
           
        </div>
        <div className="col-span-12 lg:col-span-7 xl:col-span-4 flex flex-col gap-8">
           <StudentList tutorId={userId} />
           {/* <Messages tutorId={userId} /> */}
        </div>
        <div className="col-span-12 lg:col-span-5 xl:col-span-3 flex flex-col gap-8">
           <QuickActions tutorId={userId} role="tutor" />
           
           <UpcomingClasses tutorId={userId} classes={upcomingClasses} /> 

           {/* Raise Issue Component */}
           <RaiseIssue user={user} fetchAll={fetchAll} />
        </div>
      </div>
    </>
  );
}
