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
  Crown,
} from "lucide-react";

import { supabase } from "../../supabase";
import QuickActions2 from "../../components/QuickActions2";

export default function StudentView({ tutorId, userId, courseId }) {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [results, setResults] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [upcomingClass, setUpcomingClass] = useState(null);
  const [messages, setMessages] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [expandedFeedback, setExpandedFeedback] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (userId) {
      const fetchDashboard = async () => {
        try {
          setLoading(true);

          // 1. Core Profile Details
          const { data: studentData } = await supabase
            .from("users")
            .select("*")
            .eq("id", userId)
            .single();
          setStudent(studentData);

          const currentStudentName = studentData?.full_name;

          if (currentStudentName) {
            const firstName = currentStudentName.trim().split(" ")[0];

            const { data: resultsData, error: resultsError } = await supabase
              .from("student_results")
              .select("*")
              .ilike("student_name", `%${firstName}%`)
              .order("created_at", { ascending: false });

            if (resultsError) {
              console.error("Error pulling student results:", resultsError.message);
            } else {
              setResults(resultsData || []);
            }
          }

          // 3. Task Tracks
          const { data: assignmentsData } = await supabase
            .from("student_assignments")
            .select("*")
            .eq("student_id", userId)
            .order("created_at", { ascending: false });
          setAssignments(assignmentsData || []);

          // 4. Live Windows & Class Schedules
          // const { data: classData } = await supabase
          //   .from("classes")
          //   .select("*")
          //   .eq("student_id", userId)
          //   .gte("scheduled_at", new Date().toISOString())
          //   .order("scheduled_at", { ascending: true })
          //   .limit(1)
          //   .maybeSingle();
          // setUpcomingClass(classData);
// // 4. Live Windows & Class Schedules
// const { data: classData, error: classError } = await supabase
//   .from("classes")
//   .select(`
//     *,
//     calendar_events (
//       meet_link
//     )
//   `)
//   .eq("student_id", userId)
//   .gte("scheduled_at", new Date().toISOString())
//   .order("scheduled_at", { ascending: true })
//   .limit(1)
//   .maybeSingle();

// setUpcomingClass(classData);
          // Ensure this matches the foreign key relationship name exactly
// const { data: classData, error: classError } = await supabase
//   .from("classes")
//   .select(`
//     *,
//     calendar_events (
//       meet_link
//     )
//   `)
//   .eq("student_id", userId)
//   .gte("scheduled_at", new Date().toISOString())
//   .order("scheduled_at", { ascending: true })
//   .limit(1)
//   .maybeSingle();

// console.log("Debug Class Data:", classData); 
// setUpcomingClass(classData);
          const { data: classData, error: classError } = await supabase
  .from("classes")
  .select(`
    *,
    calendar_events (
      meet_link
    )
  `)
  .eq("student_id", userId) // Keep only this filter for testing
  .limit(1);

console.log("Raw Class Data (No date filter):", classData);
console.log("Error (if any):", classError);

          // 5. Communications
          const { data: messagesData } = await supabase
            .from("messages")
            .select("*")
            .eq("receiver_id", userId)
            .order("created_at", { ascending: false })
            .limit(5);
          setMessages(messagesData || []);
        } catch (err) {
          console.error("Student layout context error:", err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchDashboard();
    }
  }, [userId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const latestResult = results.length > 0 ? results[0] : null;
  const overallScore = latestResult?.overall_score ?? 0;
  const completedAssignments = assignments.filter((a) => a.status === "completed").length;
  const pendingAssignments = assignments.filter((a) => a.status === "pending").length;
  const totalAssignments = completedAssignments + pendingAssignments;

  const progress = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;
  const level = Math.floor(progress / 10) + 1;
  const streak = Math.min(completedAssignments * 2, 30);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[30px] p-8 text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
          <h2 className="text-white text-xl font-bold">Loading Dashboard...</h2>
          <p className="text-gray-400 mt-2">Preparing your learning world 🚀</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7ff] dark:bg-[#0b1020] text-gray-900 dark:text-white overflow-hidden transition-colors duration-300">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/20 dark:bg-purple-600/20 blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/20 dark:bg-blue-600/20 blur-[140px]" />
      </div>

      <div className="relative z-10 p-4 md:p-6">
        <div className="bg-white dark:bg-white/5 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[25px] sm:rounded-[30px] md:rounded-[35px] p-4 sm:p-6 md:p-8 mb-6 shadow-xl">
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 text-white">
                  <Rocket size={26} />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent tracking-tight">
                    Tech Talk Hub
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400">Learn. Build. Grow 🚀</p>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black">
                Hello,{" "}
                <span className="bg-gradient-to-r from-pink-500 to-purple-500 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
                  {student?.full_name?.split(" ")[0] || "Student"}
                </span>{" "}
                👋
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-3 max-w-xl">
                Continue building amazing coding projects and level up your developer skills today.
              </p>

              <div className="flex flex-wrap gap-3 mt-6">
                <div className="bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 px-4 py-3 rounded-2xl flex items-center gap-2">
                  <Flame className="text-orange-500 dark:text-orange-400" size={18} />
                  <span className="font-bold text-gray-700 dark:text-gray-200">{streak} Day Streak</span>
                </div>
                <div className="bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 px-4 py-3 rounded-2xl flex items-center gap-2">
                  <Crown className="text-yellow-600 dark:text-yellow-400" size={18} />
                  <span className="font-bold text-gray-700 dark:text-gray-200">Level {level}</span>
                </div>
                <div className="bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 px-4 py-3 rounded-2xl flex items-center gap-2">
                  <Sparkles className="text-pink-500 dark:text-pink-400" size={18} />
                  <span className="font-bold text-gray-700 dark:text-gray-200">{overallScore}% Score</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center sm:items-start gap-4">
              <div className="text-left sm:text-right">
                <h3 className="font-bold text-xl">{student?.full_name || "Active Student"}</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {student?.subscription_tier || "Starter"} Plan
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-purple-500 blur-xl opacity-40 rounded-full" />
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-gray-200 dark:border-white/20">
                  {latestResult?.avatar_url ? (
                    <img src={latestResult.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl text-white">
                      👩🏽
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="bg-gray-200 dark:bg-white/10 p-4 rounded-2xl transition hover:scale-105"
              >
                {darkMode ? "☀️" : "🌙"}
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 p-4 rounded-2xl transition text-white"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

          <div className="mt-8 relative overflow-hidden rounded-[35px] border border-gray-200 dark:border-white/10 bg-gradient-to-r from-purple-600/10 via-indigo-500/10 to-pink-500/10 dark:from-purple-600/30 dark:via-indigo-500/20 dark:to-pink-500/20 p-8">
            
            <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-8">
             
             {/* Magic Skill Jar */}
    <div className="shrink-0">
      <GlassCard>
        <h2 className="font-black text-xl mb-5">Magic Skill Jar</h2>
        <div className="flex flex-col items-center">
          <div className="relative w-36 h-44">
            <div className="absolute inset-0 bg-yellow-200 blur-3xl opacity-30 rounded-full" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-gradient-to-b from-yellow-700 to-yellow-500 rounded-full z-20" />
            <div className="absolute top-4 w-full h-36 rounded-[2.5rem] bg-gradient-to-b from-blue-100 to-indigo-200 border-[6px] border-white shadow-2xl overflow-hidden">
              <div className="absolute left-4 top-4 w-5 h-24 bg-white/40 rounded-full" />
              <div className="absolute top-7 left-6 text-2xl animate-bounce">⚙️</div>
              <div className="absolute top-10 right-5 text-xl animate-pulse">💡</div>
              <div className="absolute bottom-10 left-7 text-2xl animate-bounce">🎮</div>
              <div className="absolute bottom-7 right-7 text-xl animate-pulse">🚀</div>
              <div className="absolute top-16 left-1/2 -translate-x-1/2 text-lg animate-spin">⭐</div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
              <div>
                <div className="inline-flex items-center gap-2 bg-purple-500/10 dark:bg-white/10 text-purple-700 dark:text-purple-200 px-4 py-2 rounded-full text-sm font-bold mb-5">
                  <Star size={16} />
                  CURRENT COURSE
                </div>
                <h2 className="text-3xl md:text-4xl font-black mb-4">
                  {latestResult?.course_name || "Scratch Programming"}
                </h2>
                <p className="text-gray-600 dark:text-purple-100 max-w-lg leading-relaxed">
                  You are doing amazing! Continue learning and building incredible coding projects.
                </p>
                <button className="mt-6 bg-purple-600 dark:bg-white text-white dark:text-black hover:scale-105 transition px-6 py-4 rounded-2xl font-black flex items-center gap-3">
                  Continue Learning
                  <Rocket size={20} />
                </button>
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52">
                  <div className="absolute inset-0 rounded-full border-[18px] border-gray-200 dark:border-white/10" />
                  <div
                    className="absolute inset-0 rounded-full border-[18px] border-purple-500 dark:border-purple-400"
                    style={{ clipPath: `inset(${100 - overallScore}% 0 0 0)` }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black">{overallScore}%</h2>
                    <p className="text-purple-600 dark:text-purple-200 font-bold mt-2">
                      {latestResult?.performance_label || "Excellent"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            <GlassCard>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-black">Quick Actions</h2>
                <Sparkles className="text-purple-500 dark:text-purple-400" />
              </div>
              <QuickActions2 userId={userId} role="student" courseId={courseId} />
            </GlassCard>

            <GlassCard>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-black">Learning Stats</h2>
                <BookOpen className="text-blue-500 dark:text-blue-400" />
              </div>
              <div className="space-y-5 text-white">
                <StatCard icon={<Trophy />} title="Completed" value={completedAssignments} color="from-yellow-500 to-orange-500" />
                <StatCard icon={<Clock />} title="Pending" value={pendingAssignments} color="from-blue-500 to-indigo-500" />
                <StatCard icon={<Target />} title="Progress" value={`${progress}%`} color="from-pink-500 to-purple-500" />
              </div>
            </GlassCard>

            

            <GlassCard>
              <h2 className="text-2xl font-black mb-5">Achievements</h2>
              <div className="grid grid-cols-3 gap-3">
                <BadgeCard icon="🏆" title="Winner" />
                <BadgeCard icon="🚀" title="Builder" />
                <BadgeCard icon="💡" title="Creative" />
              </div>
              <div className="mt-6">
                <div className="flex justify-between mb-3">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">XP Progress</span>
                  <span className="font-bold">{progress}%</span>
                </div>
                <div className="w-full h-4 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-8 xl:col-span-6 space-y-6">
            <GlassCard>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-black">Performance Analytics</h2>
                <div className="bg-green-500/10 text-green-600 dark:text-green-300 px-4 py-2 rounded-full text-sm font-bold border border-green-500/20">
                  LIVE
                </div>
              </div>
              <div className="space-y-6">
                <ProgressLine label="Theory" value={latestResult?.theory_score || 0} />
                <ProgressLine label="Practical" value={latestResult?.practical_score || 0} />
                <ProgressLine label="Problem Solving" value={latestResult?.problem_solving_score || 0} />
                <ProgressLine label="Creativity" value={latestResult?.creativity_score || 0} />
                <ProgressLine label="Assignments" value={progress} />
              </div>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-black">Project Showcase</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                {results?.slice(0, 6).map((item) => (
                  <a
                    key={item.id}
                    href={item.project_url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="group rounded-[28px] overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition"
                  >
                    <div className="h-40 bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-blue-500/10 dark:from-purple-500/40 dark:via-pink-500/20 dark:to-blue-500/20 flex items-center justify-center text-6xl relative overflow-hidden">
                      🎮
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-black text-lg text-gray-800 dark:text-white line-clamp-2">
                          {item.exam_title || "Scratch Project"}
                        </h3>
                        <div className="bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 text-sm px-3 py-1 rounded-full font-bold">
                          {item.overall_score || 0}%
                        </div>
                      </div>
                      <p className="text-gray-505 dark:text-gray-400 text-sm mt-2">
                        {item.course_name || "Scratch Programming"}
                      </p>
                      <button className="mt-5 w-full bg-white dark:bg-white/10 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 border border-gray-200 dark:border-white/10">
                        <PlayCircle size={18} className="text-purple-500 dark:text-white" />
                        <span className="text-gray-700 dark:text-white">Open Project</span>
                      </button>
                    </div>
                  </a>
                ))}
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-12 xl:col-span-3 space-y-6">
            <GlassCard>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-black">Upcoming Class</h2>
                <Calendar className="text-blue-500 dark:text-blue-400" />
              </div>
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border border-gray-200 dark:border-white/10 rounded-[28px] p-5">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center mb-5 text-blue-600 dark:text-blue-400">
                  <Calendar size={28} />
                </div>
                <h3 className="font-black text-xl">
                  {upcomingClass ? new Date(upcomingClass.scheduled_at).toLocaleDateString() : "No upcoming class"}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  {upcomingClass ? new Date(upcomingClass.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Schedule coming soon"}
                </p>
               
                <button 
  onClick={() => {
    // Access the nested meet_link from the joined calendar_events array
    const meetLink = upcomingClass?.calendar_events?.[0]?.meet_link;
    
    if (meetLink) {
      window.open(meetLink, "_blank");
    } else {
      alert("Meeting link not available yet.");
    }
  }}
  className="mt-6 w-full bg-purple-600 dark:bg-white text-white dark:text-black py-4 rounded-2xl font-black hover:scale-[1.02] transition-transform"
>
  {upcomingClass?.calendar_events?.[0]?.meet_link ? "Join Class" : "No Link Available"}
</button>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center gap-3 mb-5">
                <MessageSquare className="text-pink-500 dark:text-pink-400" />
                <h2 className="text-2xl font-black">Tutor Feedback</h2>
              </div>
              <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[28px] p-5">
                <p className={`text-base text-gray-600 dark:text-gray-300 leading-relaxed ${!expandedFeedback ? "line-clamp-3" : ""}`}>
                  {latestResult?.tutor_feedback || "Amazing work! Continue practicing and building more projects."}
                </p>
                {(latestResult?.tutor_feedback || "").length > 120 && (
                  <button
                    onClick={() => setExpandedFeedback(!expandedFeedback)}
                    className="mt-2 text-sm font-bold text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    {expandedFeedback ? "Read Less" : "Read More"}
                  </button>
                )}
                <div className="mt-5 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-black text-white">
                    {latestResult?.tutor_name ? latestResult.tutor_name[0] : "T"}
                  </div>
                  <div>
                    <p className="font-bold">{latestResult?.tutor_name || "Your Instructor"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Coding Instructor</p>
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <h2 className="text-2xl font-black mb-5">Learning Path</h2>
              <div className="space-y-4">
                <PathItem icon={<CheckCircle2 size={20} />} title="Scratch Basics" done={true} />
                <PathItem icon={<Target size={20} />} title="Scratch Advanced" done={false} />
                <PathItem icon={<Award size={20} />} title="Web Design" done={false} />
                <PathItem icon={<Rocket size={20} />} title="Python" done={false} />
              </div>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-black">Messages</h2>
                <div className="w-10 h-10 rounded-full bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold">
                  {messages.length}
                </div>
              </div>
              <div className="space-y-4">
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <div key={msg.id} className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{msg.message}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                        {new Date(msg.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-500">No messages yet</div>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}

const GlassCard = ({ children }) => (
  <div className="bg-white dark:bg-white/5 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[35px] p-4 sm:p-5 md:p-6 shadow-xl">
    {children}
  </div>
);

const StatCard = ({ icon, title, value, color }) => (
  <div className={`bg-gradient-to-r ${color} rounded-[24px] p-5`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/80 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-black mt-2 text-white">{value}</h3>
      </div>
      <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white">
        {icon}
      </div>
    </div>
  </div>
);

const BadgeCard = ({ icon, title }) => (
  <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[24px] p-4 text-center">
    <div className="text-4xl md:text-5xl">{icon}</div>
    <p className="font-bold mt-3 text-xs md:text-sm text-gray-700 dark:text-gray-200 line-clamp-1">{title}</p>
  </div>
);

const ProgressLine = ({ label, value }) => (
  <div>
    <div className="flex justify-between mb-2">
      <span className="font-semibold text-gray-600 dark:text-gray-300">{label}</span>
      <span className="font-black text-gray-800 dark:text-white">{value}%</span>
    </div>
    <div className="w-full h-4 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
      <div
        className="h-4 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 transition-all duration-700"
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const PathItem = ({ icon, title, done }) => (
  <div className="flex items-center gap-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4">
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
        done
          ? "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400"
          : "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300"
      }`}
    >
      {icon}
    </div>
    <div>
      <p className="font-bold text-gray-800 dark:text-white">{title}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{done ? "Completed" : "In Progress"}</p>
    </div>
  </div>
);