import React, { useEffect, useState } from "react";
import { BookOpen, CheckCircle, Star, Clock } from "lucide-react";
import StatCard from "../../components/StatCard";
import StudentAssignments from "../../components/StudentAssignments"; // Shows "My Homework"
import Messages from "../../Utils/fetchMessage"; // Chat
import UpcomingClasses from "../../components/UpcomingClasses";
import QuickActions2 from "../../components/QuickActions2";
import { supabase } from "../../supabase";
import QuickActions from "../../components/QuickActions";

// export default function StudentView({ tutorId, userId, initialStats = {} }) {

export default function StudentView({ tutorId, userId, courseId, initialStats = {} }) {
  const [stats, setStats] = useState({
    lessonsCount: 4,
    pendingTasks: 0,
    points: 80,
    nextLessonTime: "TBD",
    ...initialStats
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;

      try {
        // 1️⃣ Lessons attended
        const { count: lessonsCount } = await supabase
          .from("classes")
          .select("*", { count: "exact", head: true })
          .eq("student_id", userId)
          .eq("completed", true);

        // 2️⃣ Next lesson
        const { data: nextLessonData } = await supabase
          .from("classes")
          .select("scheduled_at")
          .eq("student_id", userId)
          .gte("scheduled_at", new Date().toISOString())
          .order("scheduled_at", { ascending: true })
          .limit(1);

        // 3️⃣ Pending assignments
        const { count: pendingTasks } = await supabase
          .from("student_assignments")
          .select("*", { count: "exact", head: true })
          .eq("student_id", userId)
          .eq("status", "pending");

        setStats(prev => ({
          ...prev,
          lessonsCount: lessonsCount || 4,
          pendingTasks: pendingTasks || 0,
          nextLessonTime: nextLessonData?.[0]?.scheduled_at
            ? new Date(nextLessonData[0].scheduled_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
            : "TBD"
        }));
      } catch (err) {
        console.error("Student Stats Fetch Error:", err.message);
      }
    };

    fetchStats();
  }, [userId]);

  return (
    <>
      {/* 1. TOP STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Lessons Attended" value={stats.lessonsCount} color="blue" icon={CheckCircle} />
        <StatCard title="Homework Pending" value={stats.pendingTasks} color="purple" icon={BookOpen} />
        <StatCard title="My Points" value={stats.points} color="amber" icon={Star} />
        <StatCard title="Next Lesson" value={stats.nextLessonTime} color="green" icon={Clock} />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* LEFT COLUMN */}
        <div className="col-span-12 xl:col-span-5 flex flex-col gap-8">
          {/* <ClassList studentId={userId} role="student" /> */}
          {/* <StudentAssignments studentId={userId} role="student" /> */}
          <QuickActions2 userId={userId} role="student" courseId={courseId} />
        </div>

        {/* MIDDLE COLUMN */}
        <div className="col-span-12 lg:col-span-7 xl:col-span-4 flex flex-col gap-8">
          <UpcomingClasses studentId={userId} />
          <Messages userId={userId} role="student" />
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-12 lg:col-span-5 xl:col-span-3 flex flex-col gap-8">
          {/* <QuickActions userId={userId} role="student" /> */}
          <QuickActions tutorId={tutorId} studentId={userId} role="student" />
        </div>
      </div>
    </>
  );
}
