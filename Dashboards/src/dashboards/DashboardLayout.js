"use client";

import React, { useState } from "react";

import {
  Award,
  BarChart3,
  BookMarked,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  HelpCircle,
  Layers,
  Layers3,
  LayoutDashboard,
  MessageSquareQuote,
  Newspaper,
  Settings,
  ShoppingBag,
  Users,
  Users2,
  Video,
} from "lucide-react";
import AdminPricingPage from "./views/admin/AdminPricingPage";
// Shared Views
import GlobalScheduleView from "./views/GlobalScheduleView";
import ClassRecordingsManager from "./views/ClassRecordingsManager";

// Student Views
import StudentCoursesView from "./views/student/StudentCoursesView";
import ExamPage from "./views/student/StudentExam";
import StudentGradesView from "./views/student/StudentGradesView";
import SharedSupportView from "./views/student/SharedSupportView";
import StudentSettingsView from "./views/student/StudentSettingsView";
import StudentHomeView from "./views/student/StudentHomeView";

// Tutor Views
import TutorHomeView from "./views/tutor/TutorHomeView";
import TutorStudentsView from "./views/tutor/TutorStudentsView";
import TutorCourseAssignmentView from "./views/tutor/TutorCourseAssignmentView";

// Admin Views
import AdminHomeView from "./views/admin/AdminHomeView";
import AdminUsersView from "./views/admin/AdminUsersView";
import AdminCoursesView from "./views/admin/AdminCoursesView";
import AdminAnalyticsView from "./views/admin/AdminAnalyticsView";
import AdminSettingsView from "./views/admin/AdminSettingsView";
import AdminProgramsPage from "./views/admin/AdminProgramsPage";
import AdminShopPage from "./views/admin/AdminShopPage";
import AdminBlogPage from "./views/admin/AdminBlogPage";
import AdminTestimonialsPage from "./views/admin/AdminTestimonialsPage";

function SidebarButton({
  icon: Icon,
  label,
  view,
  activeView,
  setActiveView,
  isCollapsed,
}) {
  const isActive = activeView === view;

  return (
    <button
      type="button"
      onClick={() => setActiveView(view)}
      title={isCollapsed ? label : ""}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
        isActive
          ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
      }`}
    >
      <Icon
        size={18}
        className="shrink-0"
      />

      {!isCollapsed && (
        <span className="whitespace-nowrap">
          {label}
        </span>
      )}
    </button>
  );
}

function SidebarGroup({
  title,
  children,
  isCollapsed,
}) {
  return (
    <div>
      {!isCollapsed && (
        <p className="mb-2 px-4 text-[10px] font-black uppercase tracking-wider text-gray-400">
          {title}
        </p>
      )}

      <div className="space-y-1">{children}</div>
    </div>
  );
}

export default function DashboardLayout({
  role,
  user,
  children,
}) {
  const [activeView, setActiveView] =
    useState("dashboard");

  const [isCollapsed, setIsCollapsed] =
    useState(false);

  const isAdmin = [
    "operations_admin",
    "owner",
    "tech_admin",
  ].includes(role);

  if (!user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-900 font-sans text-white">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />

        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Signing out...
        </p>
      </div>
    );
  }

  function renderMainContent() {
    // Shared support
    if (activeView === "support") {
      return <SharedSupportView user={user} />;
    }

    // Role-specific settings
    if (activeView === "settings") {
      if (isAdmin) {
        return (
          <AdminSettingsView
            userId={user.id}
            role={role}
          />
        );
      }

      return <StudentSettingsView user={user} />;
    }

    // Shared recordings manager
    if (activeView === "recordings") {
      return <ClassRecordingsManager />;
    }

    // Student views
    if (role === "student") {
      switch (activeView) {
        case "courses":
          return (
            <StudentCoursesView
              userId={user.id}
              courseId={user.assigned_course_id}
            />
          );

        case "exams":
          return <ExamPage user={user} />;

        case "grades":
          return (
            <StudentGradesView
              userId={user.id}
            />
          );

        case "dashboard":
        default:
          return (
            <StudentHomeView
              userId={user.id}
            />
          );
      }
    }

    // Tutor views
    if (role === "tutor") {
      switch (activeView) {
        case "students":
          return (
            <TutorStudentsView
              userId={user.id}
            />
          );

        case "schedule":
          return <GlobalScheduleView />;

        case "course-assignment":
          return (
            <TutorCourseAssignmentView
              userId={user.id}
            />
          );

        case "dashboard":
        default:
          return (
            <TutorHomeView
              userId={user.id}
              courseId={user.assigned_course_id}
              user={user}
            />
          );
      }
    }

    // Admin views
    if (isAdmin) {
      switch (activeView) {
        case "users":
          return (
            <AdminUsersView
              userId={user.id}
              role={role}
            />
          );

        case "programs":
          return <AdminProgramsPage />;

        case "courses-hub":
          return (
            <AdminCoursesView
              userId={user.id}
              role={role}
            />
          );

        case "analytics":
          return (
            <AdminAnalyticsView
              userId={user.id}
              role={role}
            />
          );

        case "global-schedule":
          return <GlobalScheduleView />;

        case "shop":
          return <AdminShopPage />;

        case "blog":
          return (
            <AdminBlogPage
              userId={user.id}
              role={role}
            />
          );

        case "testimonials":
          return (
            <AdminTestimonialsPage
              userId={user.id}
              role={role}
            />
          );
      case "pricing":
        return (
          <AdminPricingPage
            userId={user.id}
            role={role}
          />
        );
        case "dashboard":
        default:
          return (
            <AdminHomeView
              userId={user.id}
              role={role}
            />
          );
      }
    }

    return <div className="p-6">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-gray-900 transition-colors duration-300 dark:bg-[#0b1020] dark:text-white">
      {/* Sidebar */}
      <aside
        className={`relative flex min-h-screen shrink-0 flex-col border-r border-gray-100 bg-white p-5 transition-all duration-300 dark:border-white/10 dark:bg-white/5 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Collapse button */}
        <button
          type="button"
          onClick={() =>
            setIsCollapsed((current) => !current)
          }
          className="absolute -right-3 top-7 z-10 rounded-full bg-purple-600 p-1 text-white shadow-md transition hover:bg-purple-700"
          title={
            isCollapsed
              ? "Expand Sidebar"
              : "Collapse Sidebar"
          }
        >
          {isCollapsed ? (
            <ChevronRight size={14} />
          ) : (
            <ChevronLeft size={14} />
          )}
        </button>

        {/* Sidebar heading */}
        {!isCollapsed && (
          <div className="mb-6 overflow-hidden px-2">
            <h1 className="whitespace-nowrap bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-xl font-black tracking-tight text-transparent">
              Tech Talk Hub
            </h1>

            <div className="mt-0.5 whitespace-nowrap text-xs font-medium capitalize text-gray-400">
              {role?.replaceAll("_", " ")} Portal 🚀
            </div>
          </div>
        )}

        {/* Sidebar navigation */}
        <nav className="flex-1 space-y-6 overflow-y-auto overflow-x-hidden">
          {/* Overview */}
          <SidebarGroup
            title="Overview"
            isCollapsed={isCollapsed}
          >
            <SidebarButton
              icon={LayoutDashboard}
              label="Dashboard"
              view="dashboard"
              activeView={activeView}
              setActiveView={setActiveView}
              isCollapsed={isCollapsed}
            />
          </SidebarGroup>

          {/* Student navigation */}
          {role === "student" && (
            <SidebarGroup
              title="Learning"
              isCollapsed={isCollapsed}
            >
              <SidebarButton
                icon={BookOpen}
                label="My Courses"
                view="courses"
                activeView={activeView}
                setActiveView={setActiveView}
                isCollapsed={isCollapsed}
              />

              <SidebarButton
                icon={BookMarked}
                label="Exams"
                view="exams"
                activeView={activeView}
                setActiveView={setActiveView}
                isCollapsed={isCollapsed}
              />

              <SidebarButton
                icon={Award}
                label="Grades"
                view="grades"
                activeView={activeView}
                setActiveView={setActiveView}
                isCollapsed={isCollapsed}
              />
            </SidebarGroup>
          )}

          {/* Tutor navigation */}
          {role === "tutor" && (
            <SidebarGroup
              title="Teaching"
              isCollapsed={isCollapsed}
            >
              <SidebarButton
                icon={Users}
                label="My Students"
                view="students"
                activeView={activeView}
                setActiveView={setActiveView}
                isCollapsed={isCollapsed}
              />

              <SidebarButton
                icon={Calendar}
                label="Master Schedule"
                view="schedule"
                activeView={activeView}
                setActiveView={setActiveView}
                isCollapsed={isCollapsed}
              />

              <SidebarButton
                icon={Layers}
                label="Course Assignment"
                view="course-assignment"
                activeView={activeView}
                setActiveView={setActiveView}
                isCollapsed={isCollapsed}
              />

              <SidebarButton
                icon={Video}
                label="Class Recordings"
                view="recordings"
                activeView={activeView}
                setActiveView={setActiveView}
                isCollapsed={isCollapsed}
              />
            </SidebarGroup>
          )}

          {/* E-commerce */}
          {isAdmin && (
            <SidebarGroup
              title="E-Commerce"
              isCollapsed={isCollapsed}
            >
              <SidebarButton
                icon={ShoppingBag}
                label="Shop Management"
                view="shop"
                activeView={activeView}
                setActiveView={setActiveView}
                isCollapsed={isCollapsed}
              />
            </SidebarGroup>
          )}

          {/* Website */}
          {isAdmin && (
            <SidebarGroup
              title="Website"
              isCollapsed={isCollapsed}
            >
              <SidebarButton
                icon={Newspaper}
                label="Blog Management"
                view="blog"
                activeView={activeView}
                setActiveView={setActiveView}
                isCollapsed={isCollapsed}
              />
            <SidebarButton
              icon={CreditCard}
              label="Pricing Plans"
              view="pricing"
              activeView={activeView}
              setActiveView={setActiveView}
              isCollapsed={isCollapsed}
            />
            <SidebarButton
                icon={MessageSquareQuote}
                label="Testimonials"
                view="testimonials"
                activeView={activeView}
                setActiveView={setActiveView}
                isCollapsed={isCollapsed}
              />
            </SidebarGroup>
          )}

          {/* Admin management */}
          {isAdmin && (
            <SidebarGroup
              title="Management"
              isCollapsed={isCollapsed}
            >
              <SidebarButton
                icon={Users2}
                label="Users & Staff"
                view="users"
                activeView={activeView}
                setActiveView={setActiveView}
                isCollapsed={isCollapsed}
              />

              <SidebarButton
                icon={Layers3}
                label="Programs"
                view="programs"
                activeView={activeView}
                setActiveView={setActiveView}
                isCollapsed={isCollapsed}
              />

              <SidebarButton
                icon={BookOpen}
                label="Courses Hub"
                view="courses-hub"
                activeView={activeView}
                setActiveView={setActiveView}
                isCollapsed={isCollapsed}
              />

              <SidebarButton
                icon={BarChart3}
                label="Analytics"
                view="analytics"
                activeView={activeView}
                setActiveView={setActiveView}
                isCollapsed={isCollapsed}
              />

              <SidebarButton
                icon={Calendar}
                label="Global Schedule"
                view="global-schedule"
                activeView={activeView}
                setActiveView={setActiveView}
                isCollapsed={isCollapsed}
              />

              <SidebarButton
                icon={Video}
                label="Recordings Manager"
                view="recordings"
                activeView={activeView}
                setActiveView={setActiveView}
                isCollapsed={isCollapsed}
              />
            </SidebarGroup>
          )}

          {/* System */}
          <SidebarGroup
            title="System"
            isCollapsed={isCollapsed}
          >
            <SidebarButton
              icon={HelpCircle}
              label="Help & Support"
              view="support"
              activeView={activeView}
              setActiveView={setActiveView}
              isCollapsed={isCollapsed}
            />

            <SidebarButton
              icon={Settings}
              label="Settings"
              view="settings"
              activeView={activeView}
              setActiveView={setActiveView}
              isCollapsed={isCollapsed}
            />
          </SidebarGroup>
        </nav>
      </aside>

      {/* Dynamic content */}
      <main className="min-w-0 flex-1 overflow-y-auto">
        {renderMainContent()}
      </main>
    </div>
  );
}
// import React, { useState } from "react";

// import {
//   Award,
//   BarChart3,
//   BookMarked,
//   BookOpen,
//   Calendar,
//   ChevronLeft,
//   ChevronRight,
//   HelpCircle,
//   Layers,
//   Layers3,
//   LayoutDashboard,
//   Newspaper,
//   Settings,
//   ShoppingBag,
//   Users,
//   Users2,
//   Video,
// } from "lucide-react";

// // Shared Views
// import GlobalScheduleView from "./views/GlobalScheduleView";
// import ClassRecordingsManager from "./views/ClassRecordingsManager";

// // Student Views
// import StudentCoursesView from "./views/student/StudentCoursesView";
// import ExamPage from "./views/student/StudentExam";
// import StudentGradesView from "./views/student/StudentGradesView";
// import SharedSupportView from "./views/student/SharedSupportView";
// import StudentSettingsView from "./views/student/StudentSettingsView";
// import StudentHomeView from "./views/student/StudentHomeView";

// // Tutor Views
// import TutorHomeView from "./views/tutor/TutorHomeView";
// import TutorStudentsView from "./views/tutor/TutorStudentsView";
// import TutorCourseAssignmentView from "./views/tutor/TutorCourseAssignmentView";

// // Admin Views
// import AdminHomeView from "./views/admin/AdminHomeView";
// import AdminUsersView from "./views/admin/AdminUsersView";
// import AdminCoursesView from "./views/admin/AdminCoursesView";
// import AdminAnalyticsView from "./views/admin/AdminAnalyticsView";
// import AdminSettingsView from "./views/admin/AdminSettingsView";
// import AdminProgramsPage from "./views/admin/AdminProgramsPage";
// import AdminShopPage from "./views/admin/AdminShopPage";
// import AdminBlogPage from "./views/admin/AdminBlogPage";

// function SidebarButton({
//   icon: Icon,
//   label,
//   view,
//   activeView,
//   setActiveView,
//   isCollapsed,
// }) {
//   const isActive = activeView === view;

//   return (
//     <button
//       type="button"
//       onClick={() => setActiveView(view)}
//       title={isCollapsed ? label : ""}
//       className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
//         isActive
//           ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
//           : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
//       }`}
//     >
//       <Icon
//         size={18}
//         className="shrink-0"
//       />

//       {!isCollapsed && (
//         <span className="whitespace-nowrap">
//           {label}
//         </span>
//       )}
//     </button>
//   );
// }

// function SidebarGroup({
//   title,
//   children,
//   isCollapsed,
// }) {
//   return (
//     <div>
//       {!isCollapsed && (
//         <p className="mb-2 px-4 text-[10px] font-black uppercase tracking-wider text-gray-400">
//           {title}
//         </p>
//       )}

//       <div className="space-y-1">
//         {children}
//       </div>
//     </div>
//   );
// }

// export default function DashboardLayout({
//   role,
//   user,
//   children,
// }) {
//   const [activeView, setActiveView] =
//     useState("dashboard");

//   const [isCollapsed, setIsCollapsed] =
//     useState(false);

//   const isAdmin = [
//     "operations_admin",
//     "owner",
//     "tech_admin",
//   ].includes(role);

//   if (!user) {
//     return (
//       <div className="flex h-screen flex-col items-center justify-center bg-gray-900 font-sans text-white">
//         <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />

//         <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
//           Signing out...
//         </p>
//       </div>
//     );
//   }

//   function renderMainContent() {
//     // Shared support
//     if (activeView === "support") {
//       return <SharedSupportView user={user} />;
//     }

//     // Role-specific settings
//     if (activeView === "settings") {
//       if (isAdmin) {
//         return (
//           <AdminSettingsView
//             userId={user.id}
//             role={role}
//           />
//         );
//       }

//       return <StudentSettingsView user={user} />;
//     }

//     // Shared recordings manager
//     if (activeView === "recordings") {
//       return <ClassRecordingsManager />;
//     }

//     // Student views
//     if (role === "student") {
//       switch (activeView) {
//         case "courses":
//           return (
//             <StudentCoursesView
//               userId={user.id}
//               courseId={user.assigned_course_id}
//             />
//           );

//         case "exams":
//           return <ExamPage user={user} />;

//         case "grades":
//           return (
//             <StudentGradesView
//               userId={user.id}
//             />
//           );

//         case "dashboard":
//         default:
//           return (
//             <StudentHomeView
//               userId={user.id}
//             />
//           );
//       }
//     }

//     // Tutor views
//     if (role === "tutor") {
//       switch (activeView) {
//         case "students":
//           return (
//             <TutorStudentsView
//               userId={user.id}
//             />
//           );

//         case "schedule":
//           return <GlobalScheduleView />;

//         case "course-assignment":
//           return (
//             <TutorCourseAssignmentView
//               userId={user.id}
//             />
//           );

//         case "dashboard":
//         default:
//           return (
//             <TutorHomeView
//               userId={user.id}
//               courseId={user.assigned_course_id}
//               user={user}
//             />
//           );
//       }
//     }

//     // Admin and management views
//     if (isAdmin) {
//       switch (activeView) {
//         case "users":
//           return (
//             <AdminUsersView
//               userId={user.id}
//               role={role}
//             />
//           );

//         case "programs":
//           return <AdminProgramsPage />;

//         case "courses-hub":
//           return (
//             <AdminCoursesView
//               userId={user.id}
//               role={role}
//             />
//           );

//         case "analytics":
//           return (
//             <AdminAnalyticsView
//               userId={user.id}
//               role={role}
//             />
//           );

//         case "global-schedule":
//           return <GlobalScheduleView />;

//         case "shop":
//           return <AdminShopPage />;

//         case "blog":
//           return (
//             <AdminBlogPage
//               userId={user.id}
//               role={role}
//             />
//           );

//         case "dashboard":
//         default:
//           return (
//             <AdminHomeView
//               userId={user.id}
//               role={role}
//             />
//           );
//       }
//     }

//     return <div className="p-6">{children}</div>;
//   }

//   return (
//     <div className="flex min-h-screen bg-[#F8FAFC] text-gray-900 transition-colors duration-300 dark:bg-[#0b1020] dark:text-white">
//       {/* Sidebar */}
//       <aside
//         className={`relative flex min-h-screen shrink-0 flex-col border-r border-gray-100 bg-white p-5 transition-all duration-300 dark:border-white/10 dark:bg-white/5 ${
//           isCollapsed ? "w-20" : "w-64"
//         }`}
//       >
//         {/* Collapse button */}
//         <button
//           type="button"
//           onClick={() =>
//             setIsCollapsed((current) => !current)
//           }
//           className="absolute -right-3 top-7 z-10 rounded-full bg-purple-600 p-1 text-white shadow-md transition hover:bg-purple-700"
//           title={
//             isCollapsed
//               ? "Expand Sidebar"
//               : "Collapse Sidebar"
//           }
//         >
//           {isCollapsed ? (
//             <ChevronRight size={14} />
//           ) : (
//             <ChevronLeft size={14} />
//           )}
//         </button>

//         {/* Sidebar heading */}
//         {!isCollapsed && (
//           <div className="mb-6 overflow-hidden px-2">
//             <h1 className="whitespace-nowrap bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-xl font-black tracking-tight text-transparent">
//               Tech Talk Hub
//             </h1>

//             <div className="mt-0.5 whitespace-nowrap text-xs font-medium capitalize text-gray-400">
//               {role?.replaceAll("_", " ")} Portal 🚀
//             </div>
//           </div>
//         )}

//         {/* Sidebar navigation */}
//         <nav className="flex-1 space-y-6 overflow-y-auto overflow-x-hidden">
//           {/* Overview */}
//           <SidebarGroup
//             title="Overview"
//             isCollapsed={isCollapsed}
//           >
//             <SidebarButton
//               icon={LayoutDashboard}
//               label="Dashboard"
//               view="dashboard"
//               activeView={activeView}
//               setActiveView={setActiveView}
//               isCollapsed={isCollapsed}
//             />
//           </SidebarGroup>

//           {/* Student navigation */}
//           {role === "student" && (
//             <SidebarGroup
//               title="Learning"
//               isCollapsed={isCollapsed}
//             >
//               <SidebarButton
//                 icon={BookOpen}
//                 label="My Courses"
//                 view="courses"
//                 activeView={activeView}
//                 setActiveView={setActiveView}
//                 isCollapsed={isCollapsed}
//               />

//               <SidebarButton
//                 icon={BookMarked}
//                 label="Exams"
//                 view="exams"
//                 activeView={activeView}
//                 setActiveView={setActiveView}
//                 isCollapsed={isCollapsed}
//               />

//               <SidebarButton
//                 icon={Award}
//                 label="Grades"
//                 view="grades"
//                 activeView={activeView}
//                 setActiveView={setActiveView}
//                 isCollapsed={isCollapsed}
//               />
//             </SidebarGroup>
//           )}

//           {/* Tutor navigation */}
//           {role === "tutor" && (
//             <SidebarGroup
//               title="Teaching"
//               isCollapsed={isCollapsed}
//             >
//               <SidebarButton
//                 icon={Users}
//                 label="My Students"
//                 view="students"
//                 activeView={activeView}
//                 setActiveView={setActiveView}
//                 isCollapsed={isCollapsed}
//               />

//               <SidebarButton
//                 icon={Calendar}
//                 label="Master Schedule"
//                 view="schedule"
//                 activeView={activeView}
//                 setActiveView={setActiveView}
//                 isCollapsed={isCollapsed}
//               />

//               <SidebarButton
//                 icon={Layers}
//                 label="Course Assignment"
//                 view="course-assignment"
//                 activeView={activeView}
//                 setActiveView={setActiveView}
//                 isCollapsed={isCollapsed}
//               />

//               <SidebarButton
//                 icon={Video}
//                 label="Class Recordings"
//                 view="recordings"
//                 activeView={activeView}
//                 setActiveView={setActiveView}
//                 isCollapsed={isCollapsed}
//               />
//             </SidebarGroup>
//           )}

//           {/* E-commerce */}
//           {isAdmin && (
//             <SidebarGroup
//               title="E-Commerce"
//               isCollapsed={isCollapsed}
//             >
//               <SidebarButton
//                 icon={ShoppingBag}
//                 label="Shop Management"
//                 view="shop"
//                 activeView={activeView}
//                 setActiveView={setActiveView}
//                 isCollapsed={isCollapsed}
//               />
//             </SidebarGroup>
//           )}

//           {/* Website content */}
//           {isAdmin && (
//             <SidebarGroup
//               title="Website"
//               isCollapsed={isCollapsed}
//             >
//               <SidebarButton
//                 icon={Newspaper}
//                 label="Blog Management"
//                 view="blog"
//                 activeView={activeView}
//                 setActiveView={setActiveView}
//                 isCollapsed={isCollapsed}
//               />
//             </SidebarGroup>
//           )}

//           {/* Admin management */}
//           {isAdmin && (
//             <SidebarGroup
//               title="Management"
//               isCollapsed={isCollapsed}
//             >
//               <SidebarButton
//                 icon={Users2}
//                 label="Users & Staff"
//                 view="users"
//                 activeView={activeView}
//                 setActiveView={setActiveView}
//                 isCollapsed={isCollapsed}
//               />

//               <SidebarButton
//                 icon={Layers3}
//                 label="Programs"
//                 view="programs"
//                 activeView={activeView}
//                 setActiveView={setActiveView}
//                 isCollapsed={isCollapsed}
//               />

//               <SidebarButton
//                 icon={BookOpen}
//                 label="Courses Hub"
//                 view="courses-hub"
//                 activeView={activeView}
//                 setActiveView={setActiveView}
//                 isCollapsed={isCollapsed}
//               />

//               <SidebarButton
//                 icon={BarChart3}
//                 label="Analytics"
//                 view="analytics"
//                 activeView={activeView}
//                 setActiveView={setActiveView}
//                 isCollapsed={isCollapsed}
//               />

//               <SidebarButton
//                 icon={Calendar}
//                 label="Global Schedule"
//                 view="global-schedule"
//                 activeView={activeView}
//                 setActiveView={setActiveView}
//                 isCollapsed={isCollapsed}
//               />

//               <SidebarButton
//                 icon={Video}
//                 label="Recordings Manager"
//                 view="recordings"
//                 activeView={activeView}
//                 setActiveView={setActiveView}
//                 isCollapsed={isCollapsed}
//               />
//             </SidebarGroup>
//           )}

//           {/* System */}
//           <SidebarGroup
//             title="System"
//             isCollapsed={isCollapsed}
//           >
//             <SidebarButton
//               icon={HelpCircle}
//               label="Help & Support"
//               view="support"
//               activeView={activeView}
//               setActiveView={setActiveView}
//               isCollapsed={isCollapsed}
//             />

//             <SidebarButton
//               icon={Settings}
//               label="Settings"
//               view="settings"
//               activeView={activeView}
//               setActiveView={setActiveView}
//               isCollapsed={isCollapsed}
//             />
//           </SidebarGroup>
//         </nav>
//       </aside>

//       {/* Dynamic content */}
//       <main className="min-w-0 flex-1 overflow-y-auto">
//         {renderMainContent()}
//       </main>
//     </div>
//   );
// }
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import UserMenu from "./UserMenu";
// // Schedule View Import
// import GlobalScheduleView from "./views/GlobalScheduleView"; 
// // Recordings Manager Import
// import ClassRecordingsManager from "./views/ClassRecordingsManager";
// import AdminProgramsPage from "./views/admin/AdminProgramsPage";
// import AdminBlogPage from "./views/admin/AdminBlogPage";

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
//   Layers3,
//   Users2,
//   BarChart3,
//   Video,
//   Newspaper,
//   ShoppingBag
// } from "lucide-react";

// // 1. Student View Imports
// import StudentCoursesView from "./views/student/StudentCoursesView";
// import ExamPage from "./views/student/StudentExam";
// import StudentGradesView from "./views/student/StudentGradesView";
// import SharedSupportView from "./views/student/SharedSupportView";
// import StudentSettingsView from "./views/student/StudentSettingsView";
// import StudentHomeView from "./views/student/StudentHomeView";

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
// import AdminShopPage from "./views/admin/AdminShopPage"; // Adjust path as needed

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

//     // Shared / Role-specific view routing for recordings
//     if (activeView === "recordings") {
//       return <ClassRecordingsManager />;
//     }

//     // Student Role Views
//     if (role === "student") {
//       switch (activeView) {
//         case "courses":
//           return <StudentCoursesView userId={user?.id} courseId={user?.assigned_course_id} />;
//         case "exams":
//           return <ExamPage user={user} />;
//         case "grades":
//           return <StudentGradesView userId={user?.id} />;
//         case "dashboard":
//         default:
//           return <StudentHomeView userId={user.id} />;
//       }
//     }

//     // Tutor Role Views
//     if (role === "tutor") {
//       switch (activeView) {
//         case "students":
//           return <TutorStudentsView userId={user?.id} />;
//         case "schedule":
//           return <GlobalScheduleView />; 
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

//         case "programs":
//           return <AdminProgramsPage />;
//         case "courses-hub":
//           return <AdminCoursesView userId={user?.id} role={role} />;
//         case "analytics":
//           return <AdminAnalyticsView userId={user?.id} role={role} />;
//         case "global-schedule":
//           return <GlobalScheduleView />;
//         case "shop":
//           return <AdminShopPage />;
//         case "blog":
//           return (
//           <AdminBlogPage
//           userId={user?.id}
//           role={role}
//           />
//         );
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
//                   {!isCollapsed && <span>Master Schedule</span>}
//                 </button>
//                 <button
//                   onClick={() => setActiveView("course-assignment")}
//                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "course-assignment" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
//                 >
//                   <Layers size={18} className="shrink-0" />
//                   {!isCollapsed && <span>Course Assignment</span>}
//                 </button>
//                 <button
//                   onClick={() => setActiveView("recordings")}
//                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "recordings" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
//                 >
//                   <Video size={18} className="shrink-0" />
//                   {!isCollapsed && <span>Class Recordings</span>}
//                 </button>
//               </div>
//             </div>
//           )}
// {isAdmin && (
//   <div>
//     {!isCollapsed && (
//       <p className="px-4 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">
//         E-Commerce
//       </p>
//     )}
//     <div className="space-y-1">
//       <button
//         onClick={() => setActiveView("shop")}
//         title={isCollapsed ? "Shop Management" : ""}
//         className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
//           activeView === "shop"
//             ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
//             : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
//         }`}
//       >
//         <ShoppingBag size={18} className="shrink-0" />
//         {!isCollapsed && <span className="whitespace-nowrap">Shop Management</span>}
//       </button>
//     </div>
//   </div>
// )}
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
// <button
//   onClick={() => setActiveView("programs")}
//   title={isCollapsed ? "Programs" : ""}
//   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
//     activeView === "programs"
//       ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
//       : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
//   }`}
// >
//   <Layers3 size={18} className="shrink-0" />
//   {!isCollapsed && (
//     <span className="whitespace-nowrap">Programs</span>
//   )}
// </button>
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

//                 <button
//                   onClick={() => setActiveView("global-schedule")}
//                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "global-schedule" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
//                 >
//                   <Calendar size={18} className="shrink-0" />
//                   {!isCollapsed && <span>Global Schedule</span>}
//                 </button>

//                 <button
//                   onClick={() => setActiveView("recordings")}
//                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "recordings" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
//                 >
//                   <Video size={18} className="shrink-0" />
//                   {!isCollapsed && <span>Recordings Manager</span>}
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

//       </aside>

//       {/* Dynamic Content Display */}
//       <main className="flex-1 overflow-y-auto">
//         {renderMainContent()}
//       </main>
//     </div>
//   );
// }
// // import React, { useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import UserMenu from "./UserMenu";
// // // Schedule View Import
// // import GlobalScheduleView from "./views/GlobalScheduleView"; 
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
// // import StudentCoursesView from "./views/student/StudentCoursesView";
// // import ExamPage from "./views/student/StudentExam";
// // import StudentGradesView from "./views/student/StudentGradesView";
// // import SharedSupportView from "./views/student/SharedSupportView";
// // import StudentSettingsView from "./views/student/StudentSettingsView";
// // import StudentHomeView from "./views/student/StudentHomeView";

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

// //   // If the user logs out while this component is mounted, prevent rendering broken user IDs
// //   if (!user) {
// //     return (
// //       <div className="h-screen bg-gray-900 flex flex-col items-center justify-center text-white font-sans">
// //         <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
// //         <p className="text-gray-400 font-bold tracking-widest uppercase text-xs">Signing out...</p>
// //       </div>
// //     );
// //   }

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
// //         case "exams":
// //           return <ExamPage user={user} />;
// //         case "grades":
// //           return <StudentGradesView userId={user?.id} />;
// //         case "dashboard":
// //         default:
// //           return <StudentHomeView userId={user.id} />;
// //       }
// //     }

// //     // Tutor Role Views
// //     if (role === "tutor") {
// //       switch (activeView) {
// //         case "students":
// //           return <TutorStudentsView userId={user?.id} />;
// //         case "schedule":
// //           return <GlobalScheduleView />; 
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
// //         case "global-schedule":
// //           return <GlobalScheduleView />;
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
// //                   {!isCollapsed && <span>Master Schedule</span>}
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

// //                 <button
// //                   onClick={() => setActiveView("global-schedule")}
// //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "global-schedule" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// //                 >
// //                   <Calendar size={18} className="shrink-0" />
// //                   {!isCollapsed && <span>Global Schedule</span>}
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
// // // // Schedule View Import
// // // import GlobalScheduleView from "./views/GlobalScheduleView"; 
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
// // //   BarChart3
// // // } from "lucide-react";

// // // // 1. Student View Imports
// // // import StudentCoursesView from "./views/student/StudentCoursesView";
// // // import ExamPage from "./views/student/StudentExam";
// // // import StudentGradesView from "./views/student/StudentGradesView";
// // // import SharedSupportView from "./views/student/SharedSupportView";
// // // import StudentSettingsView from "./views/student/StudentSettingsView";
// // // import StudentHomeView from "./views/student/StudentHomeView";

// // // // 2. Tutor View Imports
// // // import TutorHomeView from "./views/tutor/TutorHomeView";
// // // import TutorStudentsView from "./views/tutor/TutorStudentsView";
// // // import TutorScheduleView from "./views/tutor/TutorScheduleView";
// // // import TutorCourseAssignmentView from "./views/tutor/TutorCourseAssignmentView";

// // // // 3. Admin View Imports
// // // import AdminHomeView from "./views/admin/AdminHomeView";
// // // import AdminUsersView from "./views/admin/AdminUsersView";
// // // import AdminCoursesView from "./views/admin/AdminCoursesView";
// // // import AdminAnalyticsView from "./views/admin/AdminAnalyticsView";
// // // import AdminSettingsView from "./views/admin/AdminSettingsView";

// // // export default function DashboardLayout({ role, user, children }) {
// // //   const navigate = useNavigate();
// // //   const [activeView, setActiveView] = useState("dashboard");
// // //   const [isCollapsed, setIsCollapsed] = useState(false);

// // //   // Helper check for management/admin roles
// // //   const isAdmin = role === "operations_admin" || role === "owner" || role === "tech_admin";

// // //   // If the user logs out while this component is mounted, prevent rendering broken user IDs
// // //   if (!user) {
// // //     return (
// // //       <div className="h-screen bg-gray-900 flex flex-col items-center justify-center text-white font-sans">
// // //         <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
// // //         <p className="text-gray-400 font-bold tracking-widest uppercase text-xs">Signing out...</p>
// // //       </div>
// // //     );
// // //   }

// // //   // Render correct component based on activeView and user role
// // //   // const renderMainContent = () => {
// // //   //   if (activeView === "support") {
// // //   //     return <SharedSupportView user={user} />;
// // //   //   }

// // //   //   if (activeView === "settings") {
// // //   //     if (isAdmin) {
// // //   //       return <AdminSettingsView userId={user?.id} role={role} />;
// // //   //     }
// // //   //     return <StudentSettingsView user={user} />;
// // //   //   }

// // //   //   // Student Role Views
// // //   //   if (role === "student") {
// // //   //     switch (activeView) {
// // //   //       case "courses":
// // //   //         return <StudentCoursesView userId={user?.id} courseId={user?.assigned_course_id} />;
// // //   //       case "exams":
// // //   //         return <ExamPage user={user} />;
// // //   //       case "grades":
// // //   //         return <StudentGradesView userId={user?.id} />;
// // //   //       case "dashboard":
// // //   //       default:
// // //   //         return <StudentHomeView userId={user.id} />;
// // //   //     }
// // //   //   }

// // //   //   // Tutor Role Views
// // //   //   if (role === "tutor") {
// // //   //     switch (activeView) {
// // //   //       case "students":
// // //   //         return <TutorStudentsView userId={user?.id} />;
// // //   //       case "schedule":
// // //   //         return <TutorScheduleView userId={user?.id} />;
// // //   //       case "course-assignment":
// // //   //         return <TutorCourseAssignmentView userId={user?.id} />;
// // //   //       case "dashboard":
// // //   //       default:
// // //   //         return <TutorHomeView userId={user?.id} courseId={user?.assigned_course_id} user={user} />;
// // //   //     }
// // //   //   }

// // //   //   // Admin / Management Role Views
// // //   //   if (isAdmin) {
// // //   //     switch (activeView) {
// // //   //       case "users":
// // //   //         return <AdminUsersView userId={user?.id} role={role} />;
// // //   //       case "courses-hub":
// // //   //         return <AdminCoursesView userId={user?.id} role={role} />;
// // //   //       case "analytics":
// // //   //         return <AdminAnalyticsView userId={user?.id} role={role} />;
// // //   //       case "dashboard":
// // //   //       default:
// // //   //         return <AdminHomeView userId={user?.id} role={role} />;
// // //   //     }
// // //   //   }

// // //   //   return <div className="p-6">{children}</div>;
// // //   // };
// // // const renderMainContent = () => {
// // //     if (activeView === "support") {
// // //       return <SharedSupportView user={user} />;
// // //     }

// // //     if (activeView === "settings") {
// // //       if (isAdmin) {
// // //         return <AdminSettingsView userId={user?.id} role={role} />;
// // //       }
// // //       return <StudentSettingsView user={user} />;
// // //     }

// // //     // Student Role Views
// // //     if (role === "student") {
// // //       switch (activeView) {
// // //         case "courses":
// // //           return <StudentCoursesView userId={user?.id} courseId={user?.assigned_course_id} />;
// // //         case "exams":
// // //           return <ExamPage user={user} />;
// // //         case "grades":
// // //           return <StudentGradesView userId={user?.id} />;
// // //         case "dashboard":
// // //         default:
// // //           return <StudentHomeView userId={user.id} />;
// // //       }
// // //     }

// // //     // Tutor Role Views
// // //     if (role === "tutor") {
// // //       switch (activeView) {
// // //         case "students":
// // //           return <TutorStudentsView userId={user?.id} />;
// // //         case "schedule":
// // //           // Option 1: Map tutor's schedule view to your new FullCalendar component
// // //           return <GlobalScheduleView />; 
// // //         case "course-assignment":
// // //           return <TutorCourseAssignmentView userId={user?.id} />;
// // //         case "dashboard":
// // //         default:
// // //           return <TutorHomeView userId={user?.id} courseId={user?.assigned_course_id} user={user} />;
// // //       }
// // //       <button
// // //   onClick={() => setActiveView("schedule")}
// // //   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "schedule" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // // >
// // //   <Calendar size={18} className="shrink-0" />
// // //   {!isCollapsed && <span>Master Schedule</span>}
// // // </button>
// // //     }

// // //     // Admin / Management Role Views
// // //     if (isAdmin) {
// // //       switch (activeView) {
// // //         case "users":
// // //           return <AdminUsersView userId={user?.id} role={role} />;
// // //         case "courses-hub":
// // //           return <AdminCoursesView userId={user?.id} role={role} />;
// // //         case "analytics":
// // //           return <AdminAnalyticsView userId={user?.id} role={role} />;
// // //         case "global-schedule":
// // //           // Option 2: Add it as a dedicated admin management tool
// // //           return <GlobalScheduleView />;
// // //         case "dashboard":
// // //         default:
// // //           return <AdminHomeView userId={user?.id} role={role} />;
// // //       }
// // //     }

// // //     return <div className="p-6">{children}</div>;
// // //     <button
// // //   onClick={() => setActiveView("global-schedule")}
// // //   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "global-schedule" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // // >
// // //   <Calendar size={18} className="shrink-0" />
// // //   {!isCollapsed && <span>Global Schedule</span>}
// // // </button>
// // //   };

// // //   return (
// // //     <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0b1020] text-gray-900 dark:text-white flex transition-colors duration-300">
// // //       {/* Sidebar Navigation */}
// // //       <aside className={`bg-white dark:bg-white/5 border-r border-gray-100 dark:border-white/10 min-h-screen p-5 flex flex-col shrink-0 transition-all duration-300 relative ${isCollapsed ? 'w-20' : 'w-64'}`}>

// // //         {/* Collapse Toggle Button */}
// // //         <button
// // //           onClick={() => setIsCollapsed((prev) => !prev)}
// // //           className="absolute -right-3 top-7 bg-purple-600 hover:bg-purple-700 text-white p-1 rounded-full shadow-md z-10 transition-transform"
// // //           title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
// // //         >
// // //           {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
// // //         </button>

// // //         {/* Sidebar Header */}
// // //         {!isCollapsed && (
// // //           <div className="mb-6 px-2 overflow-hidden">
// // //             <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent whitespace-nowrap">
// // //               Tech Talk Hub
// // //             </h1>
// // //             <div className="text-xs text-gray-400 font-medium mt-0.5 capitalize whitespace-nowrap">
// // //               <span>{role} Portal 🚀</span>
// // //             </div>
// // //           </div>
// // //         )}

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
// // //                 {!isCollapsed && <span className="whitespace-nowrap">Dashboard</span>}
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
// // //                   {!isCollapsed && <span>My Courses</span>}
// // //                 </button>

// // //                 <button
// // //                   onClick={() => setActiveView("exams")}
// // //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "exams" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //                 >
// // //                   <BookMarked size={18} className="shrink-0" />
// // //                   {!isCollapsed && <span>Exams</span>}
// // //                 </button>

// // //                 <button
// // //                   onClick={() => setActiveView("grades")}
// // //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "grades" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //                 >
// // //                   <Award size={18} className="shrink-0" />
// // //                   {!isCollapsed && <span>Grades</span>}
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
// // //                   {!isCollapsed && <span>My Students</span>}
// // //                 </button>
// // //                 <button
// // //                   onClick={() => setActiveView("schedule")}
// // //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "schedule" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //                 >
// // //                   <Calendar size={18} className="shrink-0" />
// // //                   {!isCollapsed && <span>Class Schedule</span>}
// // //                 </button>
// // //                 <button
// // //                   onClick={() => setActiveView("course-assignment")}
// // //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "course-assignment" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //                 >
// // //                   <Layers size={18} className="shrink-0" />
// // //                   {!isCollapsed && <span>Course Assignment</span>}
// // //                 </button>
// // //               </div>
// // //             </div>
// // //           )}

// // //           {/* Admin / Management Specific Navigation */}
// // //           {isAdmin && (
// // //             <div>
// // //               {!isCollapsed && <p className="px-4 text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Management</p>}
// // //               <div className="space-y-1">
// // //                 <button
// // //                   onClick={() => setActiveView("users")}
// // //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "users" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //                 >
// // //                   <Users2 size={18} className="shrink-0" />
// // //                   {!isCollapsed && <span>Users & Staff</span>}
// // //                 </button>

// // //                 <button
// // //                   onClick={() => setActiveView("courses-hub")}
// // //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "courses-hub" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //                 >
// // //                   <BookOpen size={18} className="shrink-0" />
// // //                   {!isCollapsed && <span>Courses Hub</span>}
// // //                 </button>

// // //                 <button
// // //                   onClick={() => setActiveView("analytics")}
// // //                   className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "analytics" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //                 >
// // //                   <BarChart3 size={18} className="shrink-0" />
// // //                   {!isCollapsed && <span>Analytics</span>}
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
// // //                 {!isCollapsed && <span>Help & Support</span>}
// // //               </button>
// // //               <button
// // //                 onClick={() => setActiveView("settings")}
// // //                 className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeView === "settings" ? "bg-purple-600 text-white shadow-md shadow-purple-500/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}`}
// // //               >
// // //                 <Settings size={18} className="shrink-0" />
// // //                 {!isCollapsed && <span>Settings</span>}
// // //               </button>
// // //             </div>
// // //           </div>
// // //         </nav>

// // //       </aside>

// // //       {/* Dynamic Content Display */}
// // //       <main className="flex-1 overflow-y-auto">
// // //         {renderMainContent()}
// // //       </main>
// // //     </div>
// // //   );
// // // }
