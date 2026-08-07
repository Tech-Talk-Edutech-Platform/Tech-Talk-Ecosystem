// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import UserMenu from "./UserMenu";
// import {
//   BookOpen,
//   LayoutDashboard,
//   Users,
//   Calendar,
//   HelpCircle,
//   Settings,
//   ChevronLeft,
//   ChevronRight,
//   FileText,
//   Award,
//   BookMarked,
//   Layers,
//   Users2,
//   BarChart3
// } from "lucide-react";

// // 1. Student View Imports
// import StudentHomeView from "./views/student/StudentHomeView";
// import StudentCoursesView from "./views/student/StudentCoursesView";
// import StudentHomeworkView from "./views/student/StudentHomeworkView";
// import ExamPage from "./views/student/StudentExam";
// import StudentGradesView from "./views/student/StudentGradesView";
// import SharedSupportView from "./views/student/SharedSupportView";
// import StudentSettingsView from "./views/student/StudentSettingsView";

// // 2. Tutor View Imports
// import TutorHomeView from "./views/tutor/TutorHomeView";
// import TutorStudentsView from "./views/tutor/TutorStudentsView";
// import TutorScheduleView from "./views/tutor/TutorScheduleView";
// import TutorCourseAssignmentView from "./views/tutor/TutorCourseAssignmentView";

// // 3. Admin View Imports
// import AdminHomeView from "./views/admin/AdminHomeView";
// import AdminUsersView from "./views/admin/AdminUsersView";
// import AdminCoursesView from "./views/admin/AdminCoursesView";
// import AdminAnalyticsView from "./views/admin/AdminAnalyticsView";
// import AdminSettingsView from "./views/admin/AdminSettingsView";

// export default function DashboardLayout({ role, user, children }) {
//   const navigate = useNavigate();
//   const [activeView, setActiveView] = useState("dashboard");
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   // Helper check for management/admin roles
//   const isAdmin = role === "operations_admin" || role === "owner" || role === "tech_admin";

//   // If the user logs out while this component is mounted, prevent rendering broken user IDs
//   if (!user) {
//     return (
//       <div className="h-screen bg-gray-900 flex flex-col items-center justify-center text-white font-sans">
//         <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
//         <p className="text-gray-400 font-bold tracking-widest uppercase text-xs">Signing out...</p>
//       </div>
//     );
//   }

//   // Render correct component based on activeView and user role
//   const renderMainContent = () => {
//     if (activeView === "support") {
//       return <SharedSupportView user={user} />;
//     }

//     if (activeView === "settings") {
//       if (isAdmin) {
//         return <AdminSettingsView userId={user?.id} role={role} />;
//       }
//       return <StudentSettingsView user={user} />;
//     }

//     // Student Role Views
//     if (role === "student") {
//       switch (activeView) {
//         case "courses":
//           return <StudentCoursesView userId={user?.id} courseId={user?.assigned_course_id} />;
//         case "homework":
//           return <StudentHomeworkView userId={user?.id} />;
//         case "exams":
//           return <ExamPage user={user} />;
//         case "grades":
//           return <StudentGradesView userId={user?.id} />;
//         case "dashboard":
//         default:
//           return <StudentHomeView userId={user?.id} tutorId={user?.assigned_tutor_id} />;
//       }
//     }

//     // Tutor Role Views
//     if (role === "tutor") {
//       switch (activeView) {
//         case "students":
//           return <TutorStudentsView userId={user?.id} />;
//         case "schedule":
//           return <TutorScheduleView userId={user?.id} />;
//         case "course-assignment":
//           return <TutorCourseAssignmentView userId={user?.id} />;
//         case "dashboard":
//         default:
//           return <TutorHomeView userId={user?.id} courseId={user?.assigned_course_id} user={user} />;
//       }
//     }

//     // Admin / Management Role Views
//     if (isAdmin) {
//       switch (activeView) {
//         case "users":
//           return <AdminUsersView userId={user?.id} role={role} />;
//         case "courses-hub":
//           return <AdminCoursesView userId={user?.id} role={role} />;
//         case "analytics":
//           return <AdminAnalyticsView userId={user?.id} role={role} />;
//         case "dashboard":
//         default:
//           return <AdminHomeView userId={user?.id} role={role} />;
//       }
//     }

//     return <div className="p-6">{children}</div>;
//   };

//   return (
//     <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0b1020] text-gray-900 dark:text-white flex transition-colors duration-300">
//       {/* Sidebar Navigation */}
//       <aside className={`bg-white dark:bg-white/5 border-r border-gray-100 dark:border-white/10 min-h-screen p-5 flex flex-col shrink-0 transition-all duration-300 relative ${isCollapsed ? 'w-20' : 'w-64'}`}>

//         {/* Collapse Toggle Button */}
//         <button
//           onClick={() => setIsCollapsed((prev) => !prev)}
//           className="absolute -right-3 top-7 bg-purple-600 hover:bg-purple-700 text-white p-1 rounded-full shadow-md z-10 transition-transform"
//           title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
//         >
//           {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
//         </button>

//         {/* Sidebar Header */}
//         {!isCollapsed && (
//           <div className="mb-6 px-2 overflow-hidden">
//             <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent whitespace-nowrap">
//               Tech Talk Hub
//             </h1>
//             <div className="text-xs text-gray-400 font-medium mt-0.5 capitalize whitespace-nowrap">
//               <span>{role} Portal 🚀</span>
//             </div>
//           </div>
//         )}

//         {/* Sidebar Menu Items */}
//         <nav className="space-y-6 flex-1 overflow-y-auto overflow-x-hidden">

//           {/* Overview Group */}
//           <div>
//             {!isCollapsed && (
//               <p className="px-4 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Overview</p>
//             )}
//             <div className="space-y-1">
//               <button
//                 onClick={() => setActiveView("dashboard")}
//                 title={isCollapsed ? "Dashboard" : ""}
//                 className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
//                   activeView === "dashboard"
//                     ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
//                     : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
//                 }`}
//               >
//                 <LayoutDashboard size={18} className="shrink-0" />
//                 {!isCollapsed && <span className="whitespace-nowrap">Dashboard</span>}
//               </button>
//             </div>
//           </div>

//           {/* Student Specific Navigation */}
//           {role === "student" && (
//             <div>
//               {!isCollapsed && <p className="px-4 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Learning</p>}
//               <div className="space-y-1">
//                 <button
//                   onClick={() => setActiveView("courses")}
//                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "courses" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
//                 >
//                   <BookOpen size={18} className="shrink-0" />
//                   {!isCollapsed && <span>My Courses</span>}
//                 </button>

//                 <button
//                   onClick={() => setActiveView("homework")}
//                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "homework" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
//                 >
//                   <FileText size={18} className="shrink-0" />
//                   {!isCollapsed && <span>Homework</span>}
//                 </button>

//                 <button
//                   onClick={() => setActiveView("exams")}
//                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "exams" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
//                 >
//                   <BookMarked size={18} className="shrink-0" />
//                   {!isCollapsed && <span>Exams</span>}
//                 </button>

//                 <button
//                   onClick={() => setActiveView("grades")}
//                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "grades" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
//                 >
//                   <Award size={18} className="shrink-0" />
//                   {!isCollapsed && <span>Grades</span>}
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Tutor Specific Navigation */}
//           {role === "tutor" && (
//             <div>
//               {!isCollapsed && <p className="px-4 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Teaching</p>}
//               <div className="space-y-1">
//                 <button
//                   onClick={() => setActiveView("students")}
//                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "students" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
//                 >
//                   <Users size={18} className="shrink-0" />
//                   {!isCollapsed && <span>My Students</span>}
//                 </button>
//                 <button
//                   onClick={() => setActiveView("schedule")}
//                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "schedule" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
//                 >
//                   <Calendar size={18} className="shrink-0" />
//                   {!isCollapsed && <span>Class Schedule</span>}
//                 </button>
//                 <button
//                   onClick={() => setActiveView("course-assignment")}
//                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "course-assignment" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
//                 >
//                   <Layers size={18} className="shrink-0" />
//                   {!isCollapsed && <span>Course Assignment</span>}
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Admin / Management Specific Navigation */}
//           {isAdmin && (
//             <div>
//               {!isCollapsed && <p className="px-4 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Management</p>}
//               <div className="space-y-1">
//                 <button
//                   onClick={() => setActiveView("users")}
//                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "users" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
//                 >
//                   <Users2 size={18} className="shrink-0" />
//                   {!isCollapsed && <span>Users & Staff</span>}
//                 </button>

//                 <button
//                   onClick={() => setActiveView("courses-hub")}
//                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "courses-hub" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
//                 >
//                   <BookOpen size={18} className="shrink-0" />
//                   {!isCollapsed && <span>Courses Hub</span>}
//                 </button>

//                 <button
//                   onClick={() => setActiveView("analytics")}
//                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "analytics" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
//                 >
//                   <BarChart3 size={18} className="shrink-0" />
//                   {!isCollapsed && <span>Analytics</span>}
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* System Group */}
//           <div>
//             {!isCollapsed && <p className="px-4 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">System</p>}
//             <div className="space-y-1">
//               <button
//                 onClick={() => setActiveView("support")}
//                 className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "support" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
//               >
//                 <HelpCircle size={18} className="shrink-0" />
//                 {!isCollapsed && <span>Help & Support</span>}
//               </button>
//               <button
//                 onClick={() => setActiveView("settings")}
//                 className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "settings" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
//               >
//                 <Settings size={18} className="shrink-0" />
//                 {!isCollapsed && <span>Settings</span>}
//               </button>
//             </div>
//           </div>
//         </nav>

//         {/* User Footer Profile Menu */}
//         <div className={`pt-4 border-t border-gray-100 dark:border-white/10 ${isCollapsed ? 'items-center flex justify-center' : ''}`}>
//           <UserMenu user={user} role={role} collapsed={isCollapsed} />
//         </div>
//       </aside>

//       {/* Dynamic Content Display */}
//       <main className="flex-1 overflow-y-auto">
//         {renderMainContent()}
//       </main>
//     </div>
//   );
// }
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserMenu from "./UserMenu";
import {
  BookOpen,
  LayoutDashboard,
  Users,
  Calendar,
  HelpCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  FileText,
  Award,
  BookMarked,
  Layers,
  Users2,
  BarChart3
} from "lucide-react";

// 1. Student View Imports
import StudentHomeView from "./views/student/StudentHomeView";
import StudentCoursesView from "./views/student/StudentCoursesView";
import StudentHomeworkView from "./views/student/StudentHomeworkView";
import ExamPage from "./views/student/StudentExam";
import StudentGradesView from "./views/student/StudentGradesView";
import SharedSupportView from "./views/student/SharedSupportView";
import StudentSettingsView from "./views/student/StudentSettingsView";

// 2. Tutor View Imports
import TutorHomeView from "./views/tutor/TutorHomeView";
import TutorStudentsView from "./views/tutor/TutorStudentsView";
import TutorScheduleView from "./views/tutor/TutorScheduleView";
import TutorCourseAssignmentView from "./views/tutor/TutorCourseAssignmentView";

// 3. Admin View Imports
import AdminHomeView from "./views/admin/AdminHomeView";
import AdminUsersView from "./views/admin/AdminUsersView";
import AdminCoursesView from "./views/admin/AdminCoursesView";
import AdminAnalyticsView from "./views/admin/AdminAnalyticsView";
import AdminSettingsView from "./views/admin/AdminSettingsView";

export default function DashboardLayout({ role, user, children }) {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("dashboard");
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Helper check for management/admin roles
  const isAdmin = role === "operations_admin" || role === "owner" || role === "tech_admin";

  // If the user logs out while this component is mounted, prevent rendering broken user IDs
  if (!user) {
    return (
      <div className="h-screen bg-gray-900 flex flex-col items-center justify-center text-white font-sans">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 font-bold tracking-widest uppercase text-xs">Signing out...</p>
      </div>
    );
  }

  // Render correct component based on activeView and user role
  const renderMainContent = () => {
    if (activeView === "support") {
      return <SharedSupportView user={user} />;
    }

    if (activeView === "settings") {
      if (isAdmin) {
        return <AdminSettingsView userId={user?.id} role={role} />;
      }
      return <StudentSettingsView user={user} />;
    }

    // Student Role Views
    if (role === "student") {
      switch (activeView) {
        case "courses":
          return <StudentCoursesView userId={user?.id} courseId={user?.assigned_course_id} />;
        case "homework":
          return <StudentHomeworkView userId={user?.id} />;
        case "exams":
          return <ExamPage user={user} />;
        case "grades":
          return <StudentGradesView userId={user?.id} />;
        case "dashboard":
        default:
          return <StudentHomeView userId={user.id} />
          // return <StudentHomeView userId={user?.id} tutorId={user?.assigned_tutor_id} />;
      }
    }

    // Tutor Role Views
    if (role === "tutor") {
      switch (activeView) {
        case "students":
          return <TutorStudentsView userId={user?.id} />;
        case "schedule":
          return <TutorScheduleView userId={user?.id} />;
        case "course-assignment":
          return <TutorCourseAssignmentView userId={user?.id} />;
        case "dashboard":
        default:
          return <TutorHomeView userId={user?.id} courseId={user?.assigned_course_id} user={user} />;
      }
    }

    // Admin / Management Role Views
    if (isAdmin) {
      switch (activeView) {
        case "users":
          return <AdminUsersView userId={user?.id} role={role} />;
        case "courses-hub":
          return <AdminCoursesView userId={user?.id} role={role} />;
        case "analytics":
          return <AdminAnalyticsView userId={user?.id} role={role} />;
        case "dashboard":
        default:
          return <AdminHomeView userId={user?.id} role={role} />;
      }
    }

    return <div className="p-6">{children}</div>;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0b1020] text-gray-900 dark:text-white flex transition-colors duration-300">
      {/* Sidebar Navigation */}
      <aside className={`bg-white dark:bg-white/5 border-r border-gray-100 dark:border-white/10 min-h-screen p-5 flex flex-col shrink-0 transition-all duration-300 relative ${isCollapsed ? 'w-20' : 'w-64'}`}>

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="absolute -right-3 top-7 bg-purple-600 hover:bg-purple-700 text-white p-1 rounded-full shadow-md z-10 transition-transform"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Sidebar Header */}
        {!isCollapsed && (
          <div className="mb-6 px-2 overflow-hidden">
            <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent whitespace-nowrap">
              Tech Talk Hub
            </h1>
            <div className="text-xs text-gray-400 font-medium mt-0.5 capitalize whitespace-nowrap">
              <span>{role} Portal 🚀</span>
            </div>
          </div>
        )}

        {/* Sidebar Menu Items */}
        <nav className="space-y-6 flex-1 overflow-y-auto overflow-x-hidden">

          {/* Overview Group */}
          <div>
            {!isCollapsed && (
              <p className="px-4 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Overview</p>
            )}
            <div className="space-y-1">
              <button
                onClick={() => setActiveView("dashboard")}
                title={isCollapsed ? "Dashboard" : ""}
                className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  activeView === "dashboard"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <LayoutDashboard size={18} className="shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap">Dashboard</span>}
              </button>
            </div>
          </div>

          {/* Student Specific Navigation */}
          {role === "student" && (
            <div>
              {!isCollapsed && <p className="px-4 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Learning</p>}
              <div className="space-y-1">
                <button
                  onClick={() => setActiveView("courses")}
                  className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "courses" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
                >
                  <BookOpen size={18} className="shrink-0" />
                  {!isCollapsed && <span>My Courses</span>}
                </button>

                <button
                  onClick={() => setActiveView("homework")}
                  className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "homework" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
                >
                  <FileText size={18} className="shrink-0" />
                  {!isCollapsed && <span>Homework</span>}
                </button>

                <button
                  onClick={() => setActiveView("exams")}
                  className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "exams" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
                >
                  <BookMarked size={18} className="shrink-0" />
                  {!isCollapsed && <span>Exams</span>}
                </button>

                <button
                  onClick={() => setActiveView("grades")}
                  className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "grades" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
                >
                  <Award size={18} className="shrink-0" />
                  {!isCollapsed && <span>Grades</span>}
                </button>
              </div>
            </div>
          )}

          {/* Tutor Specific Navigation */}
          {role === "tutor" && (
            <div>
              {!isCollapsed && <p className="px-4 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Teaching</p>}
              <div className="space-y-1">
                <button
                  onClick={() => setActiveView("students")}
                  className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "students" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
                >
                  <Users size={18} className="shrink-0" />
                  {!isCollapsed && <span>My Students</span>}
                </button>
                <button
                  onClick={() => setActiveView("schedule")}
                  className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "schedule" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
                >
                  <Calendar size={18} className="shrink-0" />
                  {!isCollapsed && <span>Class Schedule</span>}
                </button>
                <button
                  onClick={() => setActiveView("course-assignment")}
                  className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "course-assignment" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
                >
                  <Layers size={18} className="shrink-0" />
                  {!isCollapsed && <span>Course Assignment</span>}
                </button>
              </div>
            </div>
          )}

          {/* Admin / Management Specific Navigation */}
          {isAdmin && (
            <div>
              {!isCollapsed && <p className="px-4 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Management</p>}
              <div className="space-y-1">
                <button
                  onClick={() => setActiveView("users")}
                  className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "users" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
                >
                  <Users2 size={18} className="shrink-0" />
                  {!isCollapsed && <span>Users & Staff</span>}
                </button>

                <button
                  onClick={() => setActiveView("courses-hub")}
                  className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "courses-hub" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
                >
                  <BookOpen size={18} className="shrink-0" />
                  {!isCollapsed && <span>Courses Hub</span>}
                </button>

                <button
                  onClick={() => setActiveView("analytics")}
                  className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "analytics" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
                >
                  <BarChart3 size={18} className="shrink-0" />
                  {!isCollapsed && <span>Analytics</span>}
                </button>
              </div>
            </div>
          )}

          {/* System Group */}
          <div>
            {!isCollapsed && <p className="px-4 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">System</p>}
            <div className="space-y-1">
              <button
                onClick={() => setActiveView("support")}
                className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "support" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
              >
                <HelpCircle size={18} className="shrink-0" />
                {!isCollapsed && <span>Help & Support</span>}
              </button>
              <button
                onClick={() => setActiveView("settings")}
                className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "settings" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
              >
                <Settings size={18} className="shrink-0" />
                {!isCollapsed && <span>Settings</span>}
              </button>
            </div>
          </div>
        </nav>

        {/* User Footer Profile Menu */}
        <div className={`pt-4 border-t border-gray-100 dark:border-white/10 ${isCollapsed ? 'items-center flex justify-center' : ''}`}>
          <UserMenu user={user} role={role} collapsed={isCollapsed} />
        </div>
      </aside>

      {/* Dynamic Content Display */}
      <main className="flex-1 overflow-y-auto">
        {renderMainContent()}
      </main>
    </div>
  );
}
// // import React, { useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import UserMenu from "./UserMenu";
// // import {
// //   BookOpen,
// //   LayoutDashboard,
// //   Users,
// //   Calendar,
// //   HelpCircle,
// //   Settings,
// //   ChevronLeft,
// //   ChevronRight,
// //   FileText,
// //   Award,
// //   BookMarked,
// //   Layers,
// //   Users2,
// //   BarChart3
// // } from "lucide-react";

// // // 1. Student View Imports
// // import StudentHomeView from "./views/student/StudentHomeView";
// // import StudentCoursesView from "./views/student/StudentCoursesView";
// // import StudentHomeworkView from "./views/student/StudentHomeworkView";
// // import ExamPage from "./views/student/StudentExam";
// // import StudentGradesView from "./views/student/StudentGradesView";
// // import SharedSupportView from "./views/student/SharedSupportView";
// // import StudentSettingsView from "./views/student/StudentSettingsView";

// // // 2. Tutor View Imports
// // import TutorHomeView from "./views/tutor/TutorHomeView";
// // import TutorStudentsView from "./views/tutor/TutorStudentsView";
// // import TutorScheduleView from "./views/tutor/TutorScheduleView";
// // import TutorCourseAssignmentView from "./views/tutor/TutorCourseAssignmentView";

// // // 3. Admin View Imports
// // import AdminHomeView from "./views/admin/AdminHomeView";
// // import AdminUsersView from "./views/admin/AdminUsersView";
// // import AdminCoursesView from "./views/admin/AdminCoursesView";
// // import AdminAnalyticsView from "./views/admin/AdminAnalyticsView";
// // import AdminSettingsView from "./views/admin/AdminSettingsView";

// // export default function DashboardLayout({ role, user, children }) {
// //   const navigate = useNavigate();
// //   const [activeView, setActiveView] = useState("dashboard");
// //   const [isCollapsed, setIsCollapsed] = useState(false);

// //   // Helper check for management/admin roles
// //   const isAdmin = role === "operations_admin" || role === "owner" || role === "tech_admin";

// //   // Render correct component based on activeView and user role
// //   const renderMainContent = () => {
// //     if (activeView === "support") {
// //       return <SharedSupportView user={user} />;
// //     }

// //     if (activeView === "settings") {
// //       if (isAdmin) {
// //         return <AdminSettingsView userId={user?.id} role={role} />;
// //       }
// //       return <StudentSettingsView user={user} />;
// //     }

// //     // Student Role Views
// //     if (role === "student") {
// //       switch (activeView) {
// //         case "courses":
// //           return <StudentCoursesView userId={user?.id} courseId={user?.assigned_course_id} />;
// //         case "homework":
// //           return <StudentHomeworkView userId={user?.id} />;
// //         case "exams":
// //           return <ExamPage user={user} />;
// //         case "grades":
// //           return <StudentGradesView userId={user?.id} />;
// //         case "dashboard":
// //         default:
// //           return <StudentHomeView userId={user?.id} tutorId={user?.assigned_tutor_id} />;
// //       }
// //     }

// //     // Tutor Role Views
// //     if (role === "tutor") {
// //       switch (activeView) {
// //         case "students":
// //           return <TutorStudentsView userId={user?.id} />;
// //         case "schedule":
// //           return <TutorScheduleView userId={user?.id} />;
// //         case "course-assignment":
// //           return <TutorCourseAssignmentView userId={user?.id} />;
// //         case "dashboard":
// //         default:
// //           return <TutorHomeView userId={user?.id} courseId={user?.assigned_course_id} user={user} />;
// //       }
// //     }

// //     // Admin / Management Role Views
// //     if (isAdmin) {
// //       switch (activeView) {
// //         case "users":
// //           return <AdminUsersView userId={user?.id} role={role} />;
// //         case "courses-hub":
// //           return <AdminCoursesView userId={user?.id} role={role} />;
// //         case "analytics":
// //           return <AdminAnalyticsView userId={user?.id} role={role} />;
// //         case "dashboard":
// //         default:
// //           return <AdminHomeView userId={user?.id} role={role} />;
// //       }
// //     }

// //     return <div className="p-6">{children}</div>;
// //   };

// //   return (
// //     <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0b1020] text-gray-900 dark:text-white flex transition-colors duration-300">
// //       {/* Sidebar Navigation */}
// //       <aside className={`bg-white dark:bg-white/5 border-r border-gray-100 dark:border-white/10 min-h-screen p-5 flex flex-col shrink-0 transition-all duration-300 relative ${isCollapsed ? 'w-20' : 'w-64'}`}>

// //         {/* Collapse Toggle Button */}
// //         <button
// //           onClick={() => setIsCollapsed((prev) => !prev)}
// //           className="absolute -right-3 top-7 bg-purple-600 hover:bg-purple-700 text-white p-1 rounded-full shadow-md z-10 transition-transform"
// //           title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
// //         >
// //           {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
// //         </button>

// //         {/* Sidebar Header */}
// //         {!isCollapsed && (
// //           <div className="mb-6 px-2 overflow-hidden">
// //             <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent whitespace-nowrap">
// //               Tech Talk Hub
// //             </h1>
// //             <div className="text-xs text-gray-400 font-medium mt-0.5 capitalize whitespace-nowrap">
// //               <span>{role} Portal 🚀</span>
// //             </div>
// //           </div>
// //         )}

// //         {/* Sidebar Menu Items */}
// //         <nav className="space-y-6 flex-1 overflow-y-auto overflow-x-hidden">

// //           {/* Overview Group */}
// //           <div>
// //             {!isCollapsed && (
// //               <p className="px-4 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Overview</p>
// //             )}
// //             <div className="space-y-1">
// //               <button
// //                 onClick={() => setActiveView("dashboard")}
// //                 title={isCollapsed ? "Dashboard" : ""}
// //                 className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
// //                   activeView === "dashboard"
// //                     ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
// //                     : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
// //                 }`}
// //               >
// //                 <LayoutDashboard size={18} className="shrink-0" />
// //                 {!isCollapsed && <span className="whitespace-nowrap">Dashboard</span>}
// //               </button>
// //             </div>
// //           </div>

// //           {/* Student Specific Navigation */}
// //           {role === "student" && (
// //             <div>
// //               {!isCollapsed && <p className="px-4 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Learning</p>}
// //               <div className="space-y-1">
// //                 <button
// //                   onClick={() => setActiveView("courses")}
// //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "courses" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// //                 >
// //                   <BookOpen size={18} className="shrink-0" />
// //                   {!isCollapsed && <span>My Courses</span>}
// //                 </button>

// //                 <button
// //                   onClick={() => setActiveView("homework")}
// //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "homework" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// //                 >
// //                   <FileText size={18} className="shrink-0" />
// //                   {!isCollapsed && <span>Homework</span>}
// //                 </button>

// //                 <button
// //                   onClick={() => setActiveView("exams")}
// //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "exams" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// //                 >
// //                   <BookMarked size={18} className="shrink-0" />
// //                   {!isCollapsed && <span>Exams</span>}
// //                 </button>

// //                 <button
// //                   onClick={() => setActiveView("grades")}
// //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "grades" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// //                 >
// //                   <Award size={18} className="shrink-0" />
// //                   {!isCollapsed && <span>Grades</span>}
// //                 </button>
// //               </div>
// //             </div>
// //           )}

// //           {/* Tutor Specific Navigation */}
// //           {role === "tutor" && (
// //             <div>
// //               {!isCollapsed && <p className="px-4 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Teaching</p>}
// //               <div className="space-y-1">
// //                 <button
// //                   onClick={() => setActiveView("students")}
// //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "students" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// //                 >
// //                   <Users size={18} className="shrink-0" />
// //                   {!isCollapsed && <span>My Students</span>}
// //                 </button>
// //                 <button
// //                   onClick={() => setActiveView("schedule")}
// //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "schedule" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// //                 >
// //                   <Calendar size={18} className="shrink-0" />
// //                   {!isCollapsed && <span>Class Schedule</span>}
// //                 </button>
// //                 <button
// //                   onClick={() => setActiveView("course-assignment")}
// //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "course-assignment" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// //                 >
// //                   <Layers size={18} className="shrink-0" />
// //                   {!isCollapsed && <span>Course Assignment</span>}
// //                 </button>
// //               </div>
// //             </div>
// //           )}

// //           {/* Admin / Management Specific Navigation */}
// //           {isAdmin && (
// //             <div>
// //               {!isCollapsed && <p className="px-4 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Management</p>}
// //               <div className="space-y-1">
// //                 <button
// //                   onClick={() => setActiveView("users")}
// //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "users" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// //                 >
// //                   <Users2 size={18} className="shrink-0" />
// //                   {!isCollapsed && <span>Users & Staff</span>}
// //                 </button>

// //                 <button
// //                   onClick={() => setActiveView("courses-hub")}
// //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "courses-hub" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// //                 >
// //                   <BookOpen size={18} className="shrink-0" />
// //                   {!isCollapsed && <span>Courses Hub</span>}
// //                 </button>

// //                 <button
// //                   onClick={() => setActiveView("analytics")}
// //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "analytics" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// //                 >
// //                   <BarChart3 size={18} className="shrink-0" />
// //                   {!isCollapsed && <span>Analytics</span>}
// //                 </button>
// //               </div>
// //             </div>
// //           )}

// //           {/* System Group */}
// //           <div>
// //             {!isCollapsed && <p className="px-4 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">System</p>}
// //             <div className="space-y-1">
// //               <button
// //                 onClick={() => setActiveView("support")}
// //                 className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "support" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// //               >
// //                 <HelpCircle size={18} className="shrink-0" />
// //                 {!isCollapsed && <span>Help & Support</span>}
// //               </button>
// //               <button
// //                 onClick={() => setActiveView("settings")}
// //                 className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "settings" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// //               >
// //                 <Settings size={18} className="shrink-0" />
// //                 {!isCollapsed && <span>Settings</span>}
// //               </button>
// //             </div>
// //           </div>
// //         </nav>

// //         {/* User Footer Profile Menu */}
// //         <div className={`pt-4 border-t border-gray-100 dark:border-white/10 ${isCollapsed ? 'items-center flex justify-center' : ''}`}>
// //           <UserMenu user={user} role={role} collapsed={isCollapsed} />
// //         </div>
// //       </aside>

// //       {/* Dynamic Content Display */}
// //       <main className="flex-1 overflow-y-auto">
// //         {renderMainContent()}
// //       </main>
// //     </div>
// //   );
// // }
// // // import React, { useState } from "react";
// // // import { useNavigate } from "react-router-dom";
// // // import UserMenu from "./UserMenu"; 
// // // import { 
// // //   BookOpen, 
// // //   LayoutDashboard,
// // //   Users,
// // //   Calendar,
// // //   HelpCircle,
// // //   Settings,
// // //   ChevronLeft,
// // //   ChevronRight,
// // //   FileText,
// // //   Award,
// // //   BookMarked,
// // //   Layers,
// // //   Users2,
// // //   BarChart3,
// // //   ShieldAlert
// // // } from "lucide-react";

// // // // 1. Student View Imports
// // // import StudentHomeView from "./views/student/StudentHomeView";
// // // import StudentCoursesView from "./views/student/StudentCoursesView";
// // // import StudentHomeworkView from "./views/student/StudentHomeworkView";
// // // import ExamPage from "./views/student/StudentExam";
// // // import StudentGradesView from "./views/student/StudentGradesView";
// // // import SharedSupportView from "./views/student/SharedSupportView";
// // // import StudentSettingsView from "./views/student/StudentSettingsView";

// // // // 2. Tutor View Imports
// // // import TutorHomeView from "./views/tutor/TutorHomeView";
// // // import TutorStudentsView from "./views/tutor/TutorStudentsView";
// // // import TutorScheduleView from "./views/tutor/TutorScheduleView";
// // // import TutorCourseAssignmentView from "./views/tutor/TutorCourseAssignmentView";

// // // // 3. Admin View Imports (New Modular Sub-Views)
// // // import AdminHomeView from "./views/admin/AdminHomeView";
// // // import AdminUsersView from "./views/admin/AdminUsersView";
// // // import AdminCoursesView from "./views/admin/AdminCoursesView";
// // // import AdminAnalyticsView from "./views/admin/AdminAnalyticsView";
// // // import AdminSettingsView from "./views/admin/AdminSettingsView";

// // // export default function DashboardLayout({ role, user, children }) {
// // //   const navigate = useNavigate();
// // //   const [activeView, setActiveView] = useState("dashboard");
// // //   const [isCollapsed, setIsCollapsed] = useState(false);

// // //   // Render correct component based on activeView and user role
// // //   const renderMainContent = () => {
// // //     // Shared views across supported roles (Support fallback)
// // //     if (activeView === "support") {
// // //       return <SharedSupportView user={user} />;
// // //     }
    
// // //     // Role-specific Settings view
// // //     if (activeView === "settings") {
// // //       if (role === "operations_admin" || role === "owner" || role === "tech_admin") {
// // //         return <AdminSettingsView userId={user?.id} role={role} />;
// // //       }
// // //       return <StudentSettingsView user={user} />;
// // //     }

// // //     // Student Role Views
// // //     if (role === "student") {
// // //       switch (activeView) {
// // //         case "courses":
// // //           return <StudentCoursesView userId={user?.id} courseId={user?.assigned_course_id} />;
// // //         case "homework":
// // //           return <StudentHomeworkView userId={user?.id} />;
// // //         case "exams":
// // //           return <ExamPage user={user} />; 
// // //         case "grades":
// // //           return <StudentGradesView userId={user?.id} />;
// // //         case "dashboard":
// // //         default:
// // //           return <StudentHomeView userId={user?.id} tutorId={user?.assigned_tutor_id} />;
// // //       }
// // //     }

// // //     // Tutor Role Views
// // //     if (role === "tutor") {
// // //       switch (activeView) {
// // //         case "students":
// // //           return <TutorStudentsView userId={user?.id} />;
// // //         case "schedule":
// // //           return <TutorScheduleView userId={user?.id} />;
// // //         case "course-assignment":
// // //           return <TutorCourseAssignmentView userId={user?.id} />;
// // //         case "dashboard":
// // //         default:
// // //           return <TutorHomeView userId={user?.id} courseId={user?.assigned_course_id} user={user} />;
// // //       }
// // //     }

// // //     // Admin / Management Role Views
// // //     if (role === "operations_admin" || role === "owner" || role === "tech_admin") {
// // //       switch (activeView) {
// // //         case "users":
// // //           return <AdminUsersView userId={user?.id} role={role} />;
// // //         case "courses-hub":
// // //           return <AdminCoursesView userId={user?.id} role={role} />;
// // //         case "analytics":
// // //           return <AdminAnalyticsView userId={user?.id} role={role} />;
// // //         case "dashboard":
// // //         default:
// // //           return <AdminHomeView userId={user?.id} role={role} />;
// // //       }
// // //     }
    
// // //     return <div className="p-6">{children}</div>;
// // //   };

// // //   return (
// // //     <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0b1020] text-gray-900 dark:text-white flex transition-colors duration-300">
// // //       {/* Sidebar Navigation */}
// // //       <aside className={`bg-white dark:bg-white/5 border-r border-gray-100 dark:border-white/10 min-h-screen p-5 flex flex-col shrink-0 transition-all duration-300 relative ${isCollapsed ? 'w-20' : 'w-64'}`}>
        
// // //         {/* Collapse Toggle Button */}
// // //         <button 
// // //           onClick={() => setIsCollapsed(!isCollapsed)}
// // //           className="absolute -right-3 top-7 bg-purple-600 hover:bg-purple-700 text-white p-1 rounded-full shadow-md z-10 transition-transform"
// // //           title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
// // //         >
// // //           {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
// // //         </button>

// // //         {/* Sidebar Header */}
// // //         <div className={`mb-6 px-2 overflow-hidden transition-all ${isCollapsed ? 'opacity-0 h-0 mb-0 px-0' : 'opacity-100'}`}>
// // //           <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent whitespace-nowrap">
// // //             Tech Talk Hub
// // //           </h1>
// // //           <div className="text-xs text-gray-400 font-medium mt-0.5 capitalize whitespace-nowrap">
// // //             {role} Portal 🚀
// // //           </div>
// // //         </div>

// // //         {/* Sidebar Menu Items */}
// // //         <nav className="space-y-6 flex-1 overflow-y-auto overflow-x-hidden">
          
// // //           {/* Overview Group */}
// // //           <div>
// // //             {!isCollapsed && (
// // //               <p className="px-4 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Overview</p>
// // //             )}
// // //             <div className="space-y-1">
// // //               <button 
// // //                 onClick={() => setActiveView("dashboard")} 
// // //                 title={isCollapsed ? "Dashboard" : ""}
// // //                 className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
// // //                   activeView === "dashboard"
// // //                     ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
// // //                     : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
// // //                 }`}
// // //               >
// // //                 <LayoutDashboard size={18} className="shrink-0" />
// // //                 <span className={`whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>Dashboard</span>
// // //               </button>
// // //             </div>
// // //           </div>

// // //           {/* Student Specific Navigation */}
// // //           {role === "student" && (
// // //             <div>
// // //               {!isCollapsed && <p className="px-4 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Learning</p>}
// // //               <div className="space-y-1">
// // //                 <button 
// // //                   onClick={() => setActiveView("courses")} 
// // //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "courses" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //                 >
// // //                   <BookOpen size={18} className="shrink-0" />
// // //                   <span className={`${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>My Courses</span>
// // //                 </button>

// // //                 <button 
// // //                   onClick={() => setActiveView("homework")} 
// // //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "homework" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //                 >
// // //                   <FileText size={18} className="shrink-0" />
// // //                   <span className={`${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>Homework</span>
// // //                 </button>

// // //                 <button 
// // //                   onClick={() => setActiveView("exams")} 
// // //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "exams" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //                 >
// // //                   <BookMarked size={18} className="shrink-0" />
// // //                   <span className={`${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>Exams</span>
// // //                 </button>

// // //                 <button 
// // //                   onClick={() => setActiveView("grades")} 
// // //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "grades" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //                 >
// // //                   <Award size={18} className="shrink-0" />
// // //                   <span className={`${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>Grades</span>
// // //                 </button>
// // //               </div>
// // //             </div>
// // //           )}

// // //           {/* Tutor Specific Navigation */}
// // //           {role === "tutor" && (
// // //             <div>
// // //               {!isCollapsed && <p className="px-4 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Teaching</p>}
// // //               <div className="space-y-1">
// // //                 <button 
// // //                   onClick={() => setActiveView("students")} 
// // //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "students" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //                 >
// // //                   <Users size={18} className="shrink-0" />
// // //                   <span className={`${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>My Students</span>
// // //                 </button>
// // //                 <button 
// // //                   onClick={() => setActiveView("schedule")} 
// // //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "schedule" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //                 >
// // //                   <Calendar size={18} className="shrink-0" />
// // //                   <span className={`${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>Class Schedule</span>
// // //                 </button>
// // //                 <button 
// // //                   onClick={() => setActiveView("course-assignment")} 
// // //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "course-assignment" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //                 >
// // //                   <Layers size={18} className="shrink-0" />
// // //                   <span className={`${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>Course Assignment</span>
// // //                 </button>
// // //               </div>
// // //             </div>
// // //           )}

// // //           {/* Admin / Management Specific Navigation */}
// // //           {(role === "operations_admin" || role === "owner" || role === "tech_admin") && (
// // //             <div>
// // //               {!isCollapsed && <p className="px-4 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Management</p>}
// // //               <div className="space-y-1">
// // //                 <button 
// // //                   onClick={() => setActiveView("users")} 
// // //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "users" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //                 >
// // //                   <Users2 size={18} className="shrink-0" />
// // //                   <span className={`${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>Users & Staff</span>
// // //                 </button>

// // //                 <button 
// // //                   onClick={() => setActiveView("courses-hub")} 
// // //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "courses-hub" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //                 >
// // //                   <BookOpen size={18} className="shrink-0" />
// // //                   <span className={`${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>Courses Hub</span>
// // //                 </button>

// // //                 <button 
// // //                   onClick={() => setActiveView("analytics")} 
// // //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "analytics" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //                 >
// // //                   <BarChart3 size={18} className="shrink-0" />
// // //                   <span className={`${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>Analytics</span>
// // //                 </button>
// // //               </div>
// // //             </div>
// // //           )}

// // //           {/* System Group */}
// // //           <div>
// // //             {!isCollapsed && <p className="px-4 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">System</p>}
// // //             <div className="space-y-1">
// // //               <button 
// // //                 onClick={() => setActiveView("support")} 
// // //                 className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "support" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //               >
// // //                 <HelpCircle size={18} className="shrink-0" />
// // //                 <span className={`${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>Help & Support</span>
// // //               </button>
// // //               <button 
// // //                 onClick={() => setActiveView("settings")} 
// // //                 className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "settings" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //               >
// // //                 <Settings size={18} className="shrink-0" />
// // //                 <span className={`${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>Settings</span>
// // //               </button>
// // //             </div>
// // //           </div>
// // //         </nav>

// // //         {/* User Footer Profile Menu */}
// // //         <div className={`pt-4 border-t border-gray-100 dark:border-white/10 ${isCollapsed ? 'items-center flex justify-center' : ''}`}>
// // //           <UserMenu user={user} role={role} collapsed={isCollapsed} />
// // //         </div>
// // //       </aside>

// // //       {/* Dynamic Content Display */}
// // //       <main className="flex-1 overflow-y-auto">
// // //         {renderMainContent()}
// // //       </main>
// // //     </div>
// // //   );
// // // }