import React, { useEffect, useState } from "react";
import {
  Trophy,
  LogOut,
  Rocket,
  Calendar,
  MessageSquare,
  CheckCircle2,
  PlayCircle,
  Target,
  Award,
  Sparkles,
  BookOpen,
  Star,
  Clock,
  Flame,
  Crown
} from "lucide-react";

import { supabase } from "../../supabase";
import QuickActions2 from "../../components/QuickActions2";

export default function StudentView({
  tutorId,
  userId,
  courseId
}) {
  const [loading, setLoading] = useState(true);

  const [student, setStudent] = useState(null);
  const [results, setResults] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [upcomingClass, setUpcomingClass] = useState(null);
  const [messages, setMessages] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [expandedFeedback, setExpandedFeedback] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      darkMode
    );
  }, [darkMode]);

  useEffect(() => {
    if (userId) {
      fetchDashboard();
    }
  }, [userId]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      // =========================
      // STUDENT INFO
      // =========================
      const { data: studentData } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      setStudent(studentData);

      // =========================
      // RESULTS
      // =========================
     
      // const { data: resultsData } = await supabase
        // .from("student_results")
        // .select("*")
        // .eq("student_id", userId)
        // .order("created_at", { ascending: false });
      const { data: resultsData } = await supabase
        .from("student_results")
        .select("*")
        // .ilike(
        //   "student_name",
        //   `%${studentData?.full_name || ""}%`
        // )
        .order("created_at", { ascending: false });

      setResults(resultsData || []);
      console.log("resultsData:", resultsData);
      console.log("studentData:", studentData);
      // =========================
      // ASSIGNMENTS
      // =========================
      const { data: assignmentsData } = await supabase
        .from("student_assignments")
        .select("*")
        .eq("student_id", userId)
        .order("created_at", { ascending: false });

      setAssignments(assignmentsData || []);

      // =========================
      // UPCOMING CLASS
      // =========================
      const { data: classData } = await supabase
        .from("classes")
        .select("*")
        .eq("student_id", userId)
        .gte("scheduled_at", new Date().toISOString())
        .order("scheduled_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      setUpcomingClass(classData);

      // =========================
      // MESSAGES
      // =========================
      const { data: messagesData } = await supabase
        .from("messages")
        .select("*")
        .eq("receiver_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      setMessages(messagesData || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  // =========================
  // CALCULATIONS
  // =========================
  
  // const latestResult = results?.[0];

  // const overallScore = latestResult?.overall_score || 0;
  const latestResult = results.length > 0 ? results[0] : null;
  const overallScore = latestResult?.overall_score ?? 0;
  const completedAssignments = assignments.filter(
    (a) => a.status === "completed"
  ).length;

  const pendingAssignments = assignments.filter(
    (a) => a.status === "pending"
  ).length;

  const progress =
    completedAssignments + pendingAssignments > 0
      ? Math.round(
        (completedAssignments /
          (completedAssignments + pendingAssignments)) *
        100
      )
      : 0;

  const level = Math.floor(progress / 10) + 1;

  const streak = Math.min(
    completedAssignments * 2,
    30
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[30px] p-8 text-center">

          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />

          <h2 className="text-white text-xl font-bold">
            Loading Dashboard...
          </h2>

          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Preparing your learning world 🚀
          </p>
        </div>
      </div>
    );
  }

  return (
    // <div className="min-h-screen bg-[#0b1020] text-white overflow-hidden">
    <div className="min-h-screen bg-[#f5f7ff] dark:bg-[#0b1020] text-gray-900 dark:text-white overflow-hidden transition-colors duration-300">
      {/* BACKGROUND */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">

        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/20 blur-[140px]" />

        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[140px]" />

        <div className="absolute top-[30%] left-[40%] w-[300px] h-[300px] bg-pink-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 p-4 md:p-6">

        {/* ================= HEADER ================= */}
        {/* <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[35px] p-6 md:p-8 mb-6 shadow-2xl"> */}
        <div className="bg-gray-100 dark:bg-white/5 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[25px] sm:rounded-[30px] md:rounded-[35px] p-4 sm:p-6 md:p-8 mb-6 shadow-xl transition-all duration-300">
          <div className="flex flex-col lg:flex-row justify-between gap-6">

            <div>

              <div className="flex items-center gap-3 mb-4">

                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Rocket size={26} />
                </div>

                <div>
                  {/* <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
                    Tech Talk Hub
                  </h1> */}
                  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent tracking-tight">
                    Tech Talk Hub
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400">
                    Learn. Build. Grow 🚀
                  </p>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black">
                Hello,{" "}
                <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  {student?.full_name?.split(" ")[0]}
                </span>
                👋
              </h2>

              <p className="text-gray-600 dark:text-gray-300 mt-3 max-w-xl">
                Continue building amazing coding projects and level up your developer skills today.
              </p>

              <div className="flex flex-wrap gap-3 mt-6">

                <div className="bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 px-4 py-3 rounded-2xl flex items-center gap-2">
                  <Flame className="text-orange-400" size={18} />
                  <span className="font-bold">
                    {streak} Day Streak
                  </span>
                </div>

                <div className="bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 px-4 py-3 rounded-2xl flex items-center gap-2">
                  <Crown className="text-yellow-400" size={18} />
                  <span className="font-bold">
                    Level {level}
                  </span>
                </div>

                <div className="bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 px-4 py-3 rounded-2xl flex items-center gap-2">
                  <Sparkles className="text-pink-400" size={18} />
                  <span className="font-bold">
                    {overallScore}% Score
                  </span>
                </div>
              </div>
            </div>

            {/* PROFILE */}
            {/* <div className="flex items-start gap-4"> */}
            <div className="flex flex-wrap sm:flex-nowrap items-center sm:items-start gap-4">
              <div className="text-right">

                <h3 className="font-bold text-xl">
                  {student?.full_name}
                </h3>

                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {student?.subscription_tier || "Starter"} Plan
                </p>
              </div>

              <div className="relative">

                <div className="absolute inset-0 bg-purple-500 blur-xl opacity-40 rounded-full" />

                <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white/20">

                  {latestResult?.avatar_url ? (
                    <img
                      src={latestResult.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl">
                      👩🏽
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="bg-white/10 dark:bg-white/10 bg-gray-200 p-4 rounded-2xl transition"
              >
                {darkMode ? "☀️" : "🌙"}
              </button>
              
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 p-4 rounded-2xl transition"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

          {/* HERO CARD */}
          <div className="mt-8 relative overflow-hidden rounded-[35px] border border-white/10 bg-gradient-to-r from-purple-600/30 via-indigo-500/20 to-pink-500/20 p-8">

            <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-pink-500/20 blur-[100px]" />

            <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-8">

              <div>

                <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 px-4 py-2 rounded-full text-sm font-bold mb-5">
                  <Star size={16} />
                  CURRENT COURSE
                </div>

                <h2 className="text-4xl font-black mb-4">
                  {latestResult?.course_name ||
                    "Scratch Programming"}
                </h2>

                <p className="text-purple-100 max-w-lg leading-relaxed">
                  You are doing amazing! Continue learning and building incredible coding projects.
                </p>

                <button className="mt-6 bg-white text-black hover:scale-105 transition px-6 py-4 rounded-2xl font-black flex items-center gap-3">
                  Continue Learning
                  <Rocket size={20} />
                </button>
              </div>

              {/* SCORE */}
              <div className="flex flex-col items-center justify-center">

                {/* <div className="relative w-52 h-52"> */}
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52">
                  <div className="absolute inset-0 rounded-full border-[18px] border-white/10" />

                  <div
                    className="absolute inset-0 rounded-full border-[18px] border-purple-400"
                    style={{
                      clipPath: `inset(${100 - overallScore}% 0 0 0)`
                    }}
                  />

                  <div className="absolute inset-0 flex flex-col items-center justify-center">

                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black">
                      {overallScore}%
                    </h2>

                    <p className="text-purple-200 font-bold mt-2">
                      {latestResult?.performance_label ||
                        "Excellent"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= GRID ================= */}
        {/* <div className="grid grid-cols-1 xl:grid-cols-12 gap-6"> */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          {/* ================= LEFT ================= */}
          <div className="lg:col-span-3 xl:col-span-3 space-y-6">

            {/* QUICK ACTIONS */}
            <GlassCard>
              <div className="flex items-center justify-between mb-5">

                <h2 className="text-2xl font-black">
                  Quick Actions
                </h2>

                <Sparkles className="text-purple-400" />
              </div>

              <QuickActions2
                userId={userId}
                role="student"
                courseId={courseId}
              />
            </GlassCard>

            {/* LEARNING STATS */}
            <GlassCard>

              <div className="flex items-center justify-between mb-5">

                <h2 className="text-2xl font-black">
                  Learning Stats
                </h2>

                <BookOpen className="text-blue-400" />
              </div>

              <div className="space-y-5">

                <StatCard
                  icon={<Trophy />}
                  title="Completed"
                  value={completedAssignments}
                  color="from-yellow-500 to-orange-500"
                />

                <StatCard
                  icon={<Clock />}
                  title="Pending"
                  value={pendingAssignments}
                  color="from-blue-500 to-indigo-500"
                />

                <StatCard
                  icon={<Target />}
                  title="Progress"
                  value={`${progress}%`}
                  color="from-pink-500 to-purple-500"
                />
              </div>
            </GlassCard>

            {/* BADGES */}
            <GlassCard>

              <h2 className="text-2xl font-black mb-5">
                Achievements
              </h2>

              <div className="grid grid-cols-3 gap-4">

                <BadgeCard
                  icon="🏆"
                  title="Winner"
                />

                <BadgeCard
                  icon="🚀"
                  title="Builder"
                />

                <BadgeCard
                  icon="💡"
                  title="Creative"
                />
              </div>

              <div className="mt-6">

                <div className="flex justify-between mb-3">
                  <span className="text-gray-600 dark:text-gray-300">
                    XP Progress
                  </span>

                  <span className="font-bold">
                    {progress}%
                  </span>
                </div>

                <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">

                  <div
                    className="h-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </GlassCard>
          </div>

          {/* ================= CENTER ================= */}
          <div className="xl:col-span-6 space-y-6">

            {/* RESULTS */}
            <GlassCard>

              <div className="flex items-center justify-between mb-6">

                <h2 className="text-3xl font-black">
                  Performance Analytics
                </h2>

                <div className="bg-green-500/10 text-green-300 px-4 py-2 rounded-full text-sm font-bold border border-green-500/20">
                  LIVE
                </div>
              </div>

              <div className="space-y-6">

                <ProgressLine
                  label="Theory"
                  value={latestResult?.theory_score || 0}
                />

                <ProgressLine
                  label="Practical"
                  value={
                    latestResult?.practical_score || 0
                  }
                />

                <ProgressLine
                  label="Problem Solving"
                  value={
                    latestResult?.problem_solving_score ||
                    0
                  }
                />

                <ProgressLine
                  label="Creativity"
                  value={
                    latestResult?.creativity_score || 0
                  }
                />

                <ProgressLine
                  label="Assignments"
                  value={progress}
                />
              </div>
            </GlassCard>

            {/* PROJECTS */}
            <GlassCard>

              <div className="flex items-center justify-between mb-6">

                <h2 className="text-3xl font-black">
                  Project Showcase
                </h2>

                <button className="text-purple-300 font-bold">
                  View All
                </button>
              </div>

              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-5"> */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                {results?.slice(0, 6).map((item) => (
                  <a
                    key={item.id}
                    href={item.project_url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="group rounded-[28px] overflow-hidden border border-white/10 bg-gray-100 dark:bg-white/5 hover:bg-white/10 transition"
                  >

                    <div className="h-40 bg-gradient-to-br from-purple-500/40 via-pink-500/20 to-blue-500/20 flex items-center justify-center text-6xl relative overflow-hidden">

                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent)]" />

                      🎮
                    </div>

                    <div className="p-5">

                      <div className="flex items-center justify-between">

                        <h3 className="font-black text-lg line-clamp-2">
                          {item.exam_title ||
                            "Scratch Project"}
                        </h3>

                        <div className="bg-purple-500/20 text-purple-300 text-sm px-3 py-1 rounded-full font-bold">
                          {item.overall_score || 0}%
                        </div>
                      </div>

                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                        {item.course_name ||
                          "Scratch Programming"}
                      </p>

                      <button className="mt-5 w-full bg-white/10 hover:bg-white/20 border border-white/10 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition">

                        <PlayCircle size={18} />
                        Open Project
                      </button>
                    </div>
                  </a>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* ================= RIGHT ================= */}
          <div className="lg:col-span-3 xl:col-span-3 space-y-6">

            {/* UPCOMING */}
            <GlassCard>

              <div className="flex items-center justify-between mb-5">

                <h2 className="text-2xl font-black">
                  Upcoming Class
                </h2>

                <Calendar className="text-blue-400" />
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 rounded-[28px] p-5">

                <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-5">
                  <Calendar size={28} />
                </div>

                <h3 className="font-black text-xl">
                  {upcomingClass
                    ? new Date(
                      upcomingClass.scheduled_at
                    ).toLocaleDateString()
                    : "No upcoming class"}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  {upcomingClass
                    ? new Date(
                      upcomingClass.scheduled_at
                    ).toLocaleTimeString()
                    : "Schedule coming soon"}
                </p>

                <button className="mt-6 w-full bg-white text-black hover:scale-[1.02] transition py-4 rounded-2xl font-black">
                  Join Class
                </button>
              </div>
            </GlassCard>

            {/* FEEDBACK */}
            <GlassCard>

              <div className="flex items-center gap-3 mb-5">

                <MessageSquare className="text-pink-400" />

                <h2 className="text-2xl font-black">
                  Tutor Feedback
                </h2>
              </div>

              <div className="bg-gray-100 dark:bg-white/5 border border-white/10 rounded-[28px] p-5">

                {/* <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {latestResult?.tutor_feedback ||
                    "Amazing work! Continue practicing and building more projects."}
                </p> */}
                <div>
                  <p
                    className={`text-base text-gray-600 dark:text-gray-300 leading-relaxed ${!expandedFeedback ? "line-clamp-3" : ""
                      }`}
                  >
                    {latestResult?.tutor_feedback ||
                      "Amazing work! Continue practicing and building more projects."}
                  </p>

                  {(latestResult?.tutor_feedback || "").length > 120 && (
                    <button
                      onClick={() =>
                        setExpandedFeedback(!expandedFeedback)
                      }
                      className="mt-2 text-sm font-bold text-purple-500 hover:text-purple-600"
                    >
                      {expandedFeedback ? "Read Less" : "Read More"}
                    </button>
                  )}
                </div>
                <div className="mt-5 flex items-center gap-3">

                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-black">
                    J
                  </div>

                  <div>

                    <p className="font-bold">
                      {latestResult?.tutor_name ||
                        "Tutor Justin"}
                    </p>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Coding Instructor
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* LEARNING PATH */}
            <GlassCard>

              <h2 className="text-2xl font-black mb-5">
                Learning Path
              </h2>

              <div className="space-y-4">

                <PathItem
                  icon={<CheckCircle2 size={20} />}
                  title="Scratch Basics"
                  // done
                />

                <PathItem
                  icon={<Target size={20} />}
                  title="Scratch Advanced"
                />

                <PathItem
                  icon={<Award size={20} />}
                  title="Web Design"
                />

                <PathItem
                  icon={<Rocket size={20} />}
                  title="Python"
                />
              </div>
            </GlassCard>

            {/* MESSAGES */}
            <GlassCard>

              <div className="flex items-center justify-between mb-5">

                <h2 className="text-2xl font-black">
                  Messages
                </h2>

                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center font-bold">
                  {messages.length}
                </div>
              </div>

              <div className="space-y-4">

                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="bg-gray-100 dark:bg-white/5 border border-white/10 rounded-2xl p-4"
                    >

                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                        {msg.message}
                      </p>

                      <p className="text-xs text-gray-500 mt-3">
                        {new Date(
                          msg.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No messages yet
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

// const GlassCard = ({ children }) => (
//   <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[35px] p-6 shadow-2xl">
//     {children}
//   </div>
// );
const GlassCard = ({ children }) => (
  <div className="bg-white dark:bg-white/5 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[35px] p-4 sm:p-5 md:p-6 shadow-xl transition-all duration-300">
    {children}
  </div>
);
const StatCard = ({
  icon,
  title,
  value,
  color
}) => (
  <div
    className={`bg-gradient-to-r ${color} rounded-[24px] p-5`}
  >

    <div className="flex items-center justify-between">

      <div>

        <p className="text-white/80 text-sm">
          {title}
        </p>

        <h3 className="text-3xl font-black mt-2">
          {value}
        </h3>
      </div>

      <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
        {icon}
      </div>
    </div>
  </div>
);

const BadgeCard = ({ icon, title }) => (
  <div className="bg-gray-100 dark:bg-white/5 border border-white/10 rounded-[24px] p-4 text-center hover:bg-white/10 transition">

    <div className="text-5xl">
      {icon}
    </div>

    <p className="font-bold mt-3 text-sm">
      {title}
    </p>
  </div>
);

const ProgressLine = ({ label, value }) => (
  <div>

    <div className="flex justify-between mb-3">

      <span className="font-semibold text-gray-600 dark:text-gray-300">
        {label}
      </span>

      <span className="font-black">
        {value}%
      </span>
    </div>

    <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">

      <div
        className="h-4 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 transition-all duration-700"
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const PathItem = ({
  icon,
  title,
  done
}) => (
  <div className="flex items-center gap-4 bg-gray-100 dark:bg-white/5 border border-white/10 rounded-2xl p-4">

    <div
      className={`w-14 h-14 rounded-2xl flex items-center justify-center ${done
          ? "bg-green-500/20 text-green-400"
          : "bg-purple-500/20 text-purple-300"
        }`}
    >
      {icon}
    </div>

    <div>

      <p className="font-bold">
        {title}
      </p>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {done ? "Completed" : "In Progress"}
      </p>
    </div>
  </div>
);
// import React, { useEffect, useState } from "react";
// import {
//   Trophy,
//   LogOut,
//   Rocket,
//   Calendar,
//   MessageSquare,
//   CheckCircle2,
//   PlayCircle,
//   Target,
//   Award
// } from "lucide-react";

// import { supabase } from "../../supabase";
// import QuickActions2 from "../../components/QuickActions2";

// export default function StudentView({
//   tutorId,
//   userId,
//   courseId
// }) {
//   const [loading, setLoading] = useState(true);

//   const [student, setStudent] = useState(null);
//   const [results, setResults] = useState([]);
//   const [assignments, setAssignments] = useState([]);
//   const [upcomingClass, setUpcomingClass] = useState(null);
//   const [messages, setMessages] = useState([]);

//   useEffect(() => {
//     if (userId) {
//       fetchDashboard();
//     }
//   }, [userId]);

//   const fetchDashboard = async () => {
//     try {
//       setLoading(true);

//       // =========================
//       // STUDENT INFO
//       // =========================
//       const { data: studentData } = await supabase
//         .from("users")
//         .select("*")
//         .eq("id", userId)
//         .single();

//       setStudent(studentData);

//       // =========================
//       // RESULTS
//       // =========================
//       const { data: resultsData } = await supabase
//         .from("student_results")
//         .select("*")
//         .ilike(
//           "student_name",
//           `%${studentData?.full_name || ""}%`
//         )
//         .order("created_at", { ascending: false });

//       setResults(resultsData || []);

//       // =========================
//       // ASSIGNMENTS
//       // =========================
//       const { data: assignmentsData } = await supabase
//         .from("student_assignments")
//         .select("*")
//         .eq("student_id", userId)
//         .order("created_at", { ascending: false });

//       setAssignments(assignmentsData || []);

//       // =========================
//       // UPCOMING CLASS
//       // =========================
//       const { data: classData } = await supabase
//         .from("classes")
//         .select("*")
//         .eq("student_id", userId)
//         .gte("scheduled_at", new Date().toISOString())
//         .order("scheduled_at", { ascending: true })
//         .limit(1)
//         .maybeSingle();

//       setUpcomingClass(classData);

//       // =========================
//       // MESSAGES
//       // =========================
//       const { data: messagesData } = await supabase
//         .from("messages")
//         .select("*")
//         .eq("receiver_id", userId)
//         .order("created_at", { ascending: false })
//         .limit(5);

//       setMessages(messagesData || []);
//     } catch (err) {
//       console.error(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // =========================
//   // LOGOUT
//   // =========================
//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     window.location.href = "/login";
//   };

//   // =========================
//   // CALCULATIONS
//   // =========================
//   const latestResult = results?.[0];

//   const overallScore = latestResult?.overall_score || 0;

//   const completedAssignments = assignments.filter(
//     (a) => a.status === "completed"
//   ).length;

//   const pendingAssignments = assignments.filter(
//     (a) => a.status === "pending"
//   ).length;

//   const progress =
//     completedAssignments + pendingAssignments > 0
//       ? Math.round(
//         (completedAssignments /
//           (completedAssignments + pendingAssignments)) *
//         100
//       )
//       : 0;

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#f6f7fb]">
//         <div className="bg-white px-6 py-5 rounded-3xl shadow-sm border text-center">
//           <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

//           <p className="text-gray-600 font-medium">
//             Loading dashboard...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     // <div className="min-h-screen bg-[#f6f7fb] p-4 md:p-6">
//     <div className="p-8 bg-[#F8DAFC] min-h-screen">
//       <div className="max-w-7xl mx-auto space-y-6">

//         {/* ================= HEADER ================= */}
//         <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm p-5 md:p-7">

//           <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

//             <div>
//               <h1 className="text-3xl md:text-4xl font-black text-gray-900">
//                 My Coding Journey
//               </h1>

//               <p className="text-gray-500 mt-2">
//                 Welcome back,{" "}
//                 {student?.full_name?.split(" ")[0]}
//               </p>
//             </div>

//             <div className="flex items-center gap-4">

//               <div className="text-right">
//                 <h2 className="font-bold text-gray-900">
//                   {student?.full_name}
//                 </h2>

//                 <p className="text-sm text-gray-500">
//                   {student?.subscription_tier || "Starter"} Plan
//                 </p>
//               </div>

//               <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-orange-200 bg-orange-100">
//                 {latestResult?.avatar_url ? (
//                   <img
//                     src={latestResult.avatar_url}
//                     alt=""
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center text-2xl">
//                     👩🏽
//                   </div>
//                 )}
//               </div>

//               <button
//                 onClick={handleLogout}
//                 className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-2xl transition"
//               >
//                 <LogOut size={18} />
//               </button>
//             </div>
//           </div>

//           {/* WELCOME CARD */}
//           <div className="mt-7 bg-gradient-to-r from-blue-100 to-indigo-50 rounded-[28px] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

//             <div>
//               <h2 className="text-2xl font-black text-gray-900">
//                 👋 Welcome Back,{" "}
//                 {student?.full_name?.split(" ")[0]}!
//               </h2>

//               <p className="text-blue-700 mt-2 font-medium">
//                 Continue building amazing coding projects 🚀
//               </p>
//             </div>

//             <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 transition">
//               Continue Course
//               <Rocket size={18} />
//             </button>
//           </div>
//         </div>

//         {/* ================= MAIN GRID ================= */}
//         <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

//           {/* ================= LEFT ================= */}
//           <div className="xl:col-span-3 space-y-6">

//             {/* QUICK ACTIONS */}
//             <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm p-3">

//               {/* <h2 className="font-black text-xl mb-5">
//                 Quick Access
                
//               </h2> */}

//               <QuickActions2
//                 userId={userId}
//                 role="student"
//                 courseId={courseId}
//               />
//             </div>

//             {/* MAGIC JAR */}
//             <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm p-5">

//               <h2 className="font-black text-xl mb-5">
//                 Magic Skill Jar
//               </h2>

//               <div className="flex flex-col items-center">

//                 <div className="relative w-36 h-44">

//                   {/* Glow */}
//                   <div className="absolute inset-0 bg-yellow-200 blur-3xl opacity-30 rounded-full" />

//                   {/* Lid */}
//                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-gradient-to-b from-yellow-700 to-yellow-500 rounded-full z-20" />

//                   {/* Jar */}
//                   <div className="absolute top-4 w-full h-36 rounded-[2.5rem] bg-gradient-to-b from-blue-100 to-indigo-200 border-[6px] border-white shadow-2xl overflow-hidden">

//                     <div className="absolute left-4 top-4 w-5 h-24 bg-white/40 rounded-full" />

//                     <div className="absolute top-7 left-6 text-2xl animate-bounce">
//                       ⚙️
//                     </div>

//                     <div className="absolute top-10 right-5 text-xl animate-pulse">
//                       💡
//                     </div>

//                     <div className="absolute bottom-10 left-7 text-2xl animate-bounce">
//                       🎮
//                     </div>

//                     <div className="absolute bottom-7 right-7 text-xl animate-pulse">
//                       🚀
//                     </div>

//                     <div className="absolute top-16 left-1/2 -translate-x-1/2 text-lg animate-spin">
//                       ⭐
//                     </div>
//                   </div>
//                 </div>

//                 <h3 className="font-bold mt-5">
//                   Core Coding Skills
//                 </h3>

//                 <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mt-5">
//                   <div
//                     className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
//                     style={{ width: `${progress}%` }}
//                   />
//                 </div>

//                 <p className="text-sm text-gray-500 mt-2">
//                   {progress}% Progress
//                 </p>
//               </div>
//             </div>

//             {/* BADGES */}
//             <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm p-5">

//               <h2 className="font-black text-xl mb-5">
//                 Badges & Challenges
//               </h2>

//               <div className="grid grid-cols-3 gap-3">

//                 <BadgeCard icon="🏆" title="Logic" />
//                 <BadgeCard icon="💡" title="Creative" />
//                 <BadgeCard icon="🚀" title="Builder" />
//               </div>

//               <div className="mt-6 space-y-5">

//                 <ChallengeBar
//                   title="Assignments Completed"
//                   value={completedAssignments}
//                   total={assignments.length || 1}
//                 />

//                 <ChallengeBar
//                   title="Overall Progress"
//                   value={progress}
//                   total={100}
//                   percentage
//                 />
//               </div>
//             </div>
//           </div>

//           {/* ================= CENTER ================= */}
//           <div className="xl:col-span-6 space-y-6">

//             {/* RESULTS */}
//             <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm p-5">

//               <h2 className="font-black text-2xl mb-6">
//                 Exam & Project Results
//               </h2>

//               <div className="grid md:grid-cols-2 gap-8">

//                 {/* SCORE */}
//                 <div className="flex flex-col items-center justify-center">

//                   <div className="w-44 h-44 rounded-full border-[14px] border-green-500 flex items-center justify-center">

//                     <div className="text-center">
//                       <div className="text-5xl font-black">
//                         {overallScore}%
//                       </div>

//                       <div className="text-green-600 font-bold mt-1">
//                         Outstanding
//                       </div>
//                     </div>
//                   </div>

//                   <div className="mt-5 bg-green-100 text-green-700 px-4 py-2 rounded-xl font-bold">
//                     {latestResult?.performance_label ||
//                       "Excellent Work"}
//                   </div>
//                 </div>

//                 {/* BREAKDOWN */}
//                 <div className="space-y-5">

//                   <ProgressLine
//                     label="Theory"
//                     value={latestResult?.theory_score || 0}
//                   />

//                   <ProgressLine
//                     label="Creative"
//                     value={
//                       latestResult?.creativity_score || 0
//                     }
//                   />

//                   <ProgressLine
//                     label="Logic"
//                     value={
//                       latestResult?.problem_solving_score || 0
//                     }
//                   />

//                   <ProgressLine
//                     label="Practical"
//                     value={
//                       latestResult?.practical_score || 0
//                     }
//                   />

//                   <ProgressLine
//                     label="Assignments"
//                     value={progress}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* PROJECTS */}
//             <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm p-5">

//               <div className="flex items-center justify-between mb-5">

//                 <h2 className="font-black text-2xl">
//                   Project Showcase
//                 </h2>

//                 <button className="text-blue-600 font-bold">
//                   View All
//                 </button>
//               </div>

//               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

//                 {results?.slice(0, 6).map((item) => (
//                   <a
//                     key={item.id}
//                     href={item.project_url || "#"}
//                     target="_blank"
//                     rel="noreferrer"
//                     className="rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition bg-white"
//                   >

//                     <div className="h-28 bg-gradient-to-br from-indigo-200 to-purple-200 flex items-center justify-center text-5xl">
//                       🎮
//                     </div>

//                     <div className="p-3">

//                       <h3 className="font-bold text-sm line-clamp-2">
//                         {item.exam_title ||
//                           "Scratch Project"}
//                       </h3>

//                       <div className="flex items-center justify-between mt-3 text-xs text-gray-500">

//                         <span className="font-bold">
//                           {item.overall_score || 0}%
//                         </span>

//                         <span className="flex items-center gap-1">
//                           <PlayCircle size={12} />
//                           Open
//                         </span>
//                       </div>
//                     </div>
//                   </a>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* ================= RIGHT ================= */}
//           <div className="xl:col-span-3 space-y-6">

//             {/* FEEDBACK */}
//             <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm p-5">

//               <h2 className="font-black text-2xl mb-5">
//                 Tutor Feedback
//               </h2>

//               <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5">

//                 <div className="flex items-center gap-2 font-bold mb-3">
//                   <MessageSquare size={18} />
//                   Notes From Tutor
//                 </div>

//                 <p className="text-gray-700 leading-relaxed text-sm">
//                   {latestResult?.tutor_feedback ||
//                     "Amazing work! Keep practicing and building more projects."}
//                 </p>
//               </div>
//             </div>

//             {/* UPCOMING CLASS */}
//             <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm p-5">

//               <h2 className="font-black text-2xl mb-5">
//                 Upcoming Class
//               </h2>

//               <div className="flex items-start gap-4">

//                 <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
//                   <Calendar size={20} />
//                 </div>

//                 <div>
//                   <p className="font-bold text-sm">
//                     {upcomingClass
//                       ? new Date(
//                         upcomingClass.scheduled_at
//                       ).toLocaleDateString()
//                       : "No upcoming class"}
//                   </p>

//                   <p className="text-xs text-gray-500 mt-1">
//                     {upcomingClass
//                       ? new Date(
//                         upcomingClass.scheduled_at
//                       ).toLocaleTimeString()
//                       : "Schedule coming soon"}
//                   </p>
//                 </div>
//               </div>

//               <button className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-bold transition">
//                 Join Class
//               </button>
//             </div>

//             {/* LEARNING PATH */}
//             <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm p-5">

//               <h2 className="font-black text-2xl mb-5">
//                 Learning Pathway
//               </h2>

//               <div className="space-y-4">

//                 <PathItem
//                   icon={<CheckCircle2 size={20} />}
//                   title="Scratch Basics"
//                   done
//                 />

//                 <PathItem
//                   icon={<Target size={20} />}
//                   title="Scratch Advanced"
//                 />

//                 <PathItem
//                   icon={<Award size={20} />}
//                   title="Web Design"
//                 />

//                 <PathItem
//                   icon={<Rocket size={20} />}
//                   title="Python"
//                 />
//               </div>
//             </div>

//             {/* MESSAGES */}
//             <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm p-5">

//               <div className="flex items-center justify-between mb-5">

//                 <h2 className="font-black text-2xl">
//                   Messages
//                 </h2>

//                 <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
//                   {messages.length}
//                 </div>
//               </div>

//               <div className="space-y-4">

//                 {messages.length > 0 ? (
//                   messages.map((msg) => (
//                     <div
//                       key={msg.id}
//                       className="border border-gray-100 rounded-2xl p-4"
//                     >

//                       <p className="text-sm text-gray-700 line-clamp-3">
//                         {msg.message}
//                       </p>

//                       <p className="text-xs text-gray-400 mt-2">
//                         {new Date(
//                           msg.created_at
//                         ).toLocaleDateString()}
//                       </p>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="text-center py-6 text-sm text-gray-400">
//                     No messages yet
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ================= COMPONENTS ================= */

// const BadgeCard = ({ icon, title }) => (
//   <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-4 text-center border border-orange-100">

//     <div className="text-4xl">
//       {icon}
//     </div>

//     <p className="font-bold text-sm mt-2 text-gray-800">
//       {title}
//     </p>
//   </div>
// );

// const ProgressLine = ({ label, value }) => (
//   <div>

//     <div className="flex justify-between mb-2 text-sm">
//       <span className="font-semibold text-gray-700">
//         {label}
//       </span>

//       <span className="font-bold text-gray-900">
//         {value}%
//       </span>
//     </div>

//     <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">

//       <div
//         className="h-4 bg-gradient-to-r from-blue-500 to-green-400 rounded-full transition-all duration-500"
//         style={{ width: `${value}%` }}
//       />
//     </div>
//   </div>
// );

// const ChallengeBar = ({
//   title,
//   value,
//   total,
//   percentage
// }) => {
//   const width = percentage
//     ? value
//     : Math.round((value / total) * 100);

//   return (
//     <div>

//       <div className="flex justify-between text-sm mb-2">

//         <span className="font-medium text-gray-700">
//           {title}
//         </span>

//         <span className="font-bold text-gray-900">
//           {percentage
//             ? `${value}%`
//             : `${value}/${total}`}
//         </span>
//       </div>

//       <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">

//         <div
//           className="h-3 bg-purple-500 rounded-full transition-all duration-500"
//           style={{ width: `${width}%` }}
//         />
//       </div>
//     </div>
//   );
// };

// const PathItem = ({
//   icon,
//   title,
//   done
// }) => (
//   <div className="flex items-center gap-4">

//     <div
//       className={`w-12 h-12 rounded-2xl flex items-center justify-center ${done
//         ? "bg-green-100 text-green-600"
//         : "bg-blue-100 text-blue-600"
//         }`}
//     >
//       {icon}
//     </div>

//     <div>
//       <p className="font-bold text-gray-900">
//         {title}
//       </p>

//       <p className="text-xs text-gray-500">
//         {done ? "Completed" : "In Progress"}
//       </p>
//     </div>
//   </div>
// );

// // import React, { useEffect, useState } from "react";
// // import {
// //   BookOpen,
// //   CheckCircle,
// //   Star,
// //   Clock,
// //   Trophy,
// //   Rocket,
// //   Brain,
// //   Code,
// //   Sparkles,
// //   Target,
// //   PlayCircle,
// //   Award,
// //   Flame
// // } from "lucide-react";

// // import { supabase } from "../../supabase";
// // import QuickActions2 from "../../components/QuickActions2";
// // import UpcomingClasses from "../../components/UpcomingClasses";
// // import Messages from "../../Utils/fetchMessage";

// // export default function StudentView({
// //   tutorId,
// //   userId,
// //   courseId,
// //   initialStats = {}
// // }) {
// //   const [stats, setStats] = useState({
// //     lessonsCount: 0,
// //     pendingTasks: 0,
// //     points: 120,
// //     nextLessonTime: "TBD",
// //     studentName: "Nela",
// //     overallScore: 82,
// //     theory: 92,
// //     creativity: 96,
// //     logic: 68,
// //     practical: 58,
// //     collaboration: 74,
// //     tutorFeedback:
// //       "Amazing creativity and logical thinking. Keep building projects consistently and challenge yourself more.",
// //     ...initialStats
// //   });

// //   useEffect(() => {
// //     const fetchStats = async () => {
// //       if (!userId) return;

// //       try {
// //         // LESSONS
// //         const { count: lessonsCount } = await supabase
// //           .from("classes")
// //           .select("*", { count: "exact", head: true })
// //           .eq("student_id", userId)
// //           .eq("completed", true);

// //         // NEXT LESSON
// //         const { data: nextLessonData } = await supabase
// //           .from("classes")
// //           .select("scheduled_at")
// //           .eq("student_id", userId)
// //           .gte("scheduled_at", new Date().toISOString())
// //           .order("scheduled_at", { ascending: true })
// //           .limit(1);

// //         // PENDING
// //         const { count: pendingTasks } = await supabase
// //           .from("student_assignments")
// //           .select("*", { count: "exact", head: true })
// //           .eq("student_id", userId)
// //           .eq("status", "pending");

// //         // RESULT DATA
// //         const { data: resultData } = await supabase
// //           .from("student_results")
// //           .select("*")
// //           .eq("student_id", userId)
// //           .order("created_at", { ascending: false })
// //           .limit(1)
// //           .maybeSingle();

// //         setStats(prev => ({
// //           ...prev,
// //           lessonsCount: lessonsCount || 0,
// //           pendingTasks: pendingTasks || 0,
// //           nextLessonTime: nextLessonData?.[0]?.scheduled_at
// //             ? new Date(
// //               nextLessonData[0].scheduled_at
// //             ).toLocaleString([], {
// //               hour: "2-digit",
// //               minute: "2-digit",
// //               month: "short",
// //               day: "numeric"
// //             })
// //             : "TBD",

// //           studentName:
// //             resultData?.student_name?.split(" ")[0] || "Student",

// //           overallScore: resultData?.overall_score || 82,
// //           theory: resultData?.theory_score || 92,
// //           creativity: resultData?.creativity_score || 96,
// //           logic: resultData?.problem_solving_score || 68,
// //           practical: resultData?.practical_score || 58,
// //           tutorFeedback:
// //             resultData?.tutor_feedback ||
// //             prev.tutorFeedback
// //         }));
// //       } catch (err) {
// //         console.error(err.message);
// //       }
// //     };

// //     fetchStats();
// //   }, [userId]);

// //   return (
// //     <div className="min-h-screen bg-[#f6f1e8] p-4 md:p-8 rounded-3xl">

// //       {/* HEADER */}
// //       <div className="flex items-center justify-between mb-6">
// //         <div>
// //           <h1 className="text-2xl md:text-3xl font-black text-gray-900">
// //             My Coding Journey - {stats.studentName}'s Dashboard
// //           </h1>
// //         </div>

// //         <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm">
// //           <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-2xl">
// //             👩🏽
// //           </div>

// //           <div>
// //             <p className="font-bold text-sm">{stats.studentName}</p>
// //             <p className="text-xs text-gray-500">Student</p>
// //           </div>
// //         </div>
// //       </div>

// //       {/* WELCOME */}
// //       <div className="bg-gradient-to-r from-blue-100 to-slate-100 rounded-3xl p-6 mb-8 border border-blue-200 shadow-sm">
// //         <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
// //           <div>
// //             <h2 className="text-2xl font-black text-gray-900 mb-2">
// //               👋 Welcome Back, {stats.studentName}! Let's build something amazing today!
// //             </h2>

// //             <button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-bold transition">
// //               Continue Scratch Programming Course →
// //             </button>
// //           </div>

// //           <div className="hidden md:flex">
// //             <Rocket className="w-20 h-20 text-blue-500" />
// //           </div>
// //         </div>
// //       </div>

// //       {/* MAIN GRID */}
// //       <div className="grid grid-cols-12 gap-6">

// //         {/* LEFT */}
// //         <div className="col-span-12 xl:col-span-3 space-y-6">

// //           {/* MAGIC JAR */}
// //           <div className="bg-white rounded-3xl p-5 shadow-sm border">
// //             <h2 className="font-black text-xl mb-4">
// //               Magic Skill Jar
// //             </h2>

// //             <div className="bg-gradient-to-b from-yellow-50 to-indigo-50 rounded-3xl p-6 text-center border">
// //               <div className="text-8xl mb-4">🫙</div>

// //               <h3 className="font-black text-lg">
// //                 Core Coding Skills
// //               </h3>

// //               <div className="mt-4">
// //                 <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
// //                   <div
// //                     className="h-full bg-blue-500 rounded-full"
// //                     style={{ width: `${stats.overallScore}% ` }}
// //                   />
// //                 </div>

// //                 <div className="mt-2 text-sm text-gray-600 font-semibold">
// //                   {stats.overallScore}% Progress
// //                 </div>
// //               </div>
// //             </div>
// //           </div>

// //           {/* BADGES */}
// //           <div className="bg-white rounded-3xl p-5 shadow-sm border">
// //             <h2 className="font-black text-xl mb-5">
// //               Badges & Challenges
// //             </h2>

// //             <div className="grid grid-cols-3 gap-3 mb-5">
// //               <BadgeCard icon="🏆" label="Logic Leader" />
// //               <BadgeCard icon="💡" label="Theory Trailblazer" />
// //               <BadgeCard icon="🚀" label="Creative Coder" />
// //             </div>

// //             <div className="space-y-4">

// //               <ProgressItem
// //                 title="Completes Challenges"
// //                 progress={82}
// //                 color="bg-blue-500"
// //               />

// //               <ProgressItem
// //                 title="XP Points"
// //                 progress={35}
// //                 color="bg-purple-500"
// //               />

// //             </div>
// //           </div>
// //         </div>

// //         {/* CENTER */}
// //         <div className="col-span-12 xl:col-span-5 space-y-6">

// //           {/* RESULTS */}
// //           <div className="bg-white rounded-3xl p-5 shadow-sm border">
// //             <h2 className="font-black text-2xl mb-5">
// //               Exam & Project Results
// //             </h2>

// //             <div className="grid md:grid-cols-2 gap-6">

// //               {/* SCORE CIRCLE */}
// //               <div className="flex flex-col items-center justify-center">

// //                 <div className="relative w-44 h-44 flex items-center justify-center">

// //                   <div className="absolute inset-0 rounded-full border-[14px] border-green-500"></div>

// //                   <div className="text-center">
// //                     <div className="text-5xl font-black">
// //                       {stats.overallScore}%
// //                     </div>

// //                     <div className="text-green-600 font-bold mt-2">
// //                       Outstanding!
// //                     </div>
// //                   </div>
// //                 </div>

// //                 <div className="mt-4 bg-green-100 text-green-700 px-4 py-2 rounded-2xl font-bold">
// //                   Overall: Excellent
// //                 </div>
// //               </div>

// //               {/* BREAKDOWN */}
// //               <div className="space-y-5">

// //                 <ResultBar
// //                   label="Theory"
// //                   score={stats.theory}
// //                   color="bg-blue-500"
// //                 />

// //                 <ResultBar
// //                   label="Creative"
// //                   score={stats.creativity}
// //                   color="bg-purple-500"
// //                 />

// //                 <ResultBar
// //                   label="Logic / Problem Solving"
// //                   score={stats.logic}
// //                   color="bg-yellow-500"
// //                 />

// //                 <ResultBar
// //                   label="Practical Application"
// //                   score={stats.practical}
// //                   color="bg-green-500"
// //                 />

// //                 <ResultBar
// //                   label="Collaboration"
// //                   score={stats.collaboration}
// //                   color="bg-emerald-500"
// //                 />
// //               </div>
// //             </div>
// //           </div>

// //           {/* PROJECTS */}
// //           <div className="bg-white rounded-3xl p-5 shadow-sm border">
// //             <div className="flex items-center justify-between mb-5">
// //               <h2 className="font-black text-2xl">
// //                 Project Showcase
// //               </h2>

// //               <button className="text-blue-600 font-bold text-sm">
// //                 View All
// //               </button>
// //             </div>

// //             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

// //               <ProjectCard
// //                 title="Space Explorer"
// //                 emoji="🚀"
// //               />

// //               <ProjectCard
// //                 title="Planet Defense"
// //                 emoji="🪐"
// //               />

// //               <ProjectCard
// //                 title="Maze Runner"
// //                 emoji="🎮"
// //               />

// //               <ProjectCard
// //                 title="Music App"
// //                 emoji="🎵"
// //               />

// //               <ProjectCard
// //                 title="Math Quiz"
// //                 emoji="📊"
// //               />

// //               <ProjectCard
// //                 title="Fire Game"
// //                 emoji="🔥"
// //               />
// //             </div>
// //           </div>
// //         </div>

// //         {/* RIGHT */}
// //         <div className="col-span-12 xl:col-span-4 space-y-6">

// //           {/* FEEDBACK */}
// //           <div className="bg-white rounded-3xl p-5 shadow-sm border">
// //             <h2 className="font-black text-2xl mb-4">
// //               Tutor Feedback
// //             </h2>

// //             <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border">
// //               <div className="flex items-center gap-2 font-black mb-3">
// //                 <Brain className="text-purple-600" />
// //                 Tutor Justin's Notes
// //               </div>

// //               <p className="text-gray-700 leading-relaxed text-sm">
// //                 {stats.tutorFeedback}
// //               </p>
// //             </div>
// //           </div>

// //           {/* LEARNING PATH */}
// //           <div className="bg-white rounded-3xl p-5 shadow-sm border">
// //             <h2 className="font-black text-2xl mb-5">
// //               Learning Pathway
// //             </h2>

// //             <div className="space-y-5">

// //               <PathItem
// //                 icon={<CheckCircle />}
// //                 title="Scratch Basics"
// //                 subtitle="Completed"
// //                 color="green"
// //               />

// //               <PathItem
// //                 icon={<Code />}
// //                 title="Scratch Advanced"
// //                 subtitle="Current"
// //                 color="blue"
// //               />

// //               <PathItem
// //                 icon={<Rocket />}
// //                 title="Game Development"
// //                 subtitle="Upcoming"
// //                 color="purple"
// //               />

// //               <PathItem
// //                 icon={<Sparkles />}
// //                 title="Web Design"
// //                 subtitle="Future"
// //                 color="orange"
// //               />

// //             </div>
// //           </div>

// //           {/* QUICK ACTIONS */}
// //           <div className="bg-white rounded-3xl p-5 shadow-sm border">
// //             <h2 className="font-black text-2xl mb-4">
// //               Quick Access
// //             </h2>

// //             <QuickActions2
// //               userId={userId}
// //               role="student"
// //               courseId={courseId}
// //             />
// //           </div>
// //         </div>
// //       </div>

// //       {/* BOTTOM */}
// //       <div className="grid grid-cols-12 gap-6 mt-8">

// //         <div className="col-span-12 lg:col-span-6">
// //           <div className="bg-white rounded-3xl p-5 shadow-sm border">
// //             <UpcomingClasses studentId={userId} />
// //           </div>
// //         </div>

// //         <div className="col-span-12 lg:col-span-6">
// //           <div className="bg-white rounded-3xl p-5 shadow-sm border">
// //             <Messages userId={userId} role="student" />
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // /* ---------------- COMPONENTS ---------------- */

// // const BadgeCard = ({ icon, label }) => (
// //   <div className="bg-gradient-to-b from-blue-50 to-orange-50 border rounded-2xl p-4 text-center">
// //     <div className="text-4xl mb-2">{icon}</div>
// //     <div className="text-xs font-black leading-tight">
// //       {label}
// //     </div>
// //   </div>
// // );

// // const ResultBar = ({ label, score, color }) => (
// //   <div>
// //     <div className="flex justify-between mb-1 text-sm font-bold">
// //       <span>{label}</span>
// //       <span>{score}%</span>
// //     </div>

// //     <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
// //       <div
// //         className={`${color} h - full rounded - full`}
// //         style={{ width: `${score}% ` }}
// //       />
// //     </div>
// //   </div>
// // );

// // const ProjectCard = ({ title, emoji }) => (
// //   <div className="bg-gray-50 border rounded-2xl p-3 hover:scale-105 transition cursor-pointer">
// //     <div className="h-24 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-5xl mb-3">
// //       {emoji}
// //     </div>

// //     <div className="font-black text-sm">
// //       {title}
// //     </div>

// //     <div className="text-xs text-gray-500 mt-1">
// //       Student Project
// //     </div>
// //   </div>
// // );

// // const ProgressItem = ({ title, progress, color }) => (
// //   <div>
// //     <div className="flex justify-between mb-1 text-sm font-semibold">
// //       <span>{title}</span>
// //       <span>{progress}%</span>
// //     </div>

// //     <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
// //       <div
// //         className={`${color} h - full rounded - full`}
// //         style={{ width: `${progress}% ` }}
// //       />
// //     </div>
// //   </div>
// // );

// // const PathItem = ({ icon, title, subtitle, color }) => {
// //   const colors = {
// //     green: "bg-green-100 text-green-600",
// //     blue: "bg-blue-100 text-blue-600",
// //     purple: "bg-purple-100 text-purple-600",
// //     orange: "bg-orange-100 text-orange-600"
// //   };

// //   return (
// //     <div className="flex items-center gap-4">
// //       <div className={`w - 14 h - 14 rounded - 2xl flex items - center justify - center ${colors[color]} `}>
// //         {icon}
// //       </div>

// //       <div>
// //         <div className="font-black">
// //           {title}
// //         </div>

// //         <div className="text-sm text-gray-500">
// //           {subtitle}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };


// // // import React, { useEffect, useState } from "react";
// // // import { BookOpen, CheckCircle, Star, Clock } from "lucide-react";
// // // import StatCard from "../../components/StatCard";
// // // import StudentAssignments from "../../components/StudentAssignments"; // Shows "My Homework"
// // // import Messages from "../../Utils/fetchMessage"; // Chat
// // // import UpcomingClasses from "../../components/UpcomingClasses";
// // // import QuickActions2 from "../../components/QuickActions2";
// // // import { supabase } from "../../supabase";
// // // import QuickActions from "../../components/QuickActions";

// // // // export default function StudentView({ tutorId, userId, initialStats = {} }) {

// // // export default function StudentView({ tutorId, userId, courseId, initialStats = {} }) {
// // //   const [stats, setStats] = useState({
// // //     lessonsCount: 0,
// // //     pendingTasks: 0,
// // //     points: 0,
// // //     nextLessonTime: "TBD",
// // //     ...initialStats
// // //   });

// // //   useEffect(() => {
// // //     const fetchStats = async () => {
// // //       if (!userId) return;

// // //       try {
// // //         // 1️⃣ Lessons attended
// // //         const { count: lessonsCount } = await supabase
// // //           .from("classes")
// // //           .select("*", { count: "exact", head: true })
// // //           .eq("student_id", userId)
// // //           .eq("completed", true);

// // //         // 2️⃣ Next lesson
// // //         const { data: nextLessonData } = await supabase
// // //           .from("classes")
// // //           .select("scheduled_at")
// // //           .eq("student_id", userId)
// // //           .gte("scheduled_at", new Date().toISOString())
// // //           .order("scheduled_at", { ascending: true })
// // //           .limit(1);

// // //         // 3️⃣ Pending assignments
// // //         const { count: pendingTasks } = await supabase
// // //           .from("student_assignments")
// // //           .select("*", { count: "exact", head: true })
// // //           .eq("student_id", userId)
// // //           .eq("status", "pending");

// // //         setStats(prev => ({
// // //           ...prev,
// // //           lessonsCount: lessonsCount || 0,
// // //           pendingTasks: pendingTasks || 0,
// // //           nextLessonTime: nextLessonData?.[0]?.scheduled_at
// // //             ? new Date(nextLessonData[0].scheduled_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
// // //             : "TBD"
// // //         }));
// // //       } catch (err) {
// // //         console.error("Student Stats Fetch Error:", err.message);
// // //       }
// // //     };

// // //     fetchStats();
// // //   }, [userId]);

// // //   return (
// // //     <>
// // //       {/* 1. TOP STATS */}
// // //       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
// // //         <StatCard title="Lessons Attended" value={stats.lessonsCount} color="blue" icon={CheckCircle} />
// // //         <StatCard title="Homework Pending" value={stats.pendingTasks} color="purple" icon={BookOpen} />
// // //         <StatCard title="My Points" value={stats.points} color="amber" icon={Star} />
// // //         <StatCard title="Next Lesson" value={stats.nextLessonTime} color="green" icon={Clock} />
// // //       </div>

// // //       <div className="grid grid-cols-12 gap-8">
// // //         {/* LEFT COLUMN */}
// // //         <div className="col-span-12 xl:col-span-5 flex flex-col gap-8">
// // //           {/* <ClassList studentId={userId} role="student" /> */}
// // //           {/* <StudentAssignments studentId={userId} role="student" /> */}
// // //           <QuickActions2 userId={userId} role="student" courseId={courseId} />
// // //         </div>

// // //         {/* MIDDLE COLUMN */}
// // //         <div className="col-span-12 lg:col-span-7 xl:col-span-4 flex flex-col gap-8">
// // //           <UpcomingClasses studentId={userId} />
// // //           <Messages userId={userId} role="student" />
// // //         </div>

// // //         {/* RIGHT COLUMN */}
// // //         <div className="col-span-12 lg:col-span-5 xl:col-span-3 flex flex-col gap-8">
// // //           {/* <QuickActions userId={userId} role="student" /> */}
// // //           <QuickActions tutorId={tutorId} studentId={userId} role="student" />
// // //         </div>
// // //       </div>
// // //     </>
// // //   );
// // // }
