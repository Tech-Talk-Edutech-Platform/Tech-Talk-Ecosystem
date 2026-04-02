import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabase"; // Ensure this points to your supabase.js file

// Component Imports
import LandingPage from "./Utils/LandingPage";
import Login from "./Utils/login";
import UnifiedDashboard from "./dashboards/UnifiedDashboard";
import FullCalendarView from "./components/Calendar";
import RoleGate from "./auth/RoleGate";
import LandingOrDashboard from "./LandingOrDashboard";
import LearningPage from "./components/pages/Learning";
import "./index.css";
import UserManagement from "./components/UserManagement";
import { useParams } from "react-router-dom";
import AdminNotesManager from "./components/AdminNotesManager";
import StudentAssignmentManager from "./components/StudentAssignmentManager";

const UserManagementPage = () => {
  const { role } = useParams();
  return <UserManagement viewerRole={role} />;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const allRoles = ['tutor', 'owner', 'operations_admin', 'tech_admin', 'student'];


  useEffect(() => {
    // Check for an existing session when the app loads
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();


    // Listen for Auth changes (Login, Logout, Token Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Show a loading screen while Supabase checks if the user is logged in
  if (loading) {
    return (

      <div className="h-screen bg-gray-900 flex flex-col items-center justify-center text-white font-sans">

        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-bold tracking-widest uppercase text-xs">Initializing Session</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        {/* <Route path="/" element={<LandingOrDashboard user={user} />} /> */}
        {/* <Route path="/" element={<Login />} /> */}
        <Route
          path="/"
          element={user ? <Navigate to={`/${user.user_metadata.role}`} /> : <Login />}
        />
        {/* AUTHENTICATED DASHBOARD */}
        <Route
          path="/:role"
          element={
            <RoleGate allowedRoles={allRoles} user={user}>
              <UnifiedDashboard user={user} />
            </RoleGate>
          }
        />
        <Route path="/users" element={<UserManagementPage />} />
        <Route path="/upload-notes" element={<AdminNotesManager />} />
        <Route path="/student-assignment" element={<StudentAssignmentManager />} />
        {/* CALENDAR */}
        < Route
          path="/calendar"
          element={
            <RoleGate allowedRoles={allRoles} user={user}>
              <FullCalendarView user={user} />
            </RoleGate>
          }
        />

        {/* LEARNING SYSTEM - Note the :id for URL Parameters */}
        <Route
          path="/learning/:id"
          element={<LearningPage user={user} />}
        />

        {/* FALLBACK: Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import LandingPage from "../src/Utils/LandingPage"; // <-- import your landing page
// import Login from "./Utils/login";
// import UnifiedDashboard from "./dashboards/UnifiedDashboard";
// import FullCalendarView from "./components/Calendar";
// import RoleGate from "./auth/RoleGate";
// import LandingOrDashboard from "./LandingOrDashboard";
// import LearningPage from "./components/pages/Learning";

// export default function App() {
//   const allRoles = ['tutor', 'owner', 'operations_admin', 'tech_admin', 'student'];

//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* PUBLIC ROUTES */}
//         {/* <Route path="/" element={<LandingPage />} />   Landing page is public */}
//         <Route path="/" element={<LandingOrDashboard />} />
//         <Route path="/login" element={<Login />} />




//         {/* AUTHENTICATED HUB */}
//         <Route
//           path="/:role"
//           element={
//             <RoleGate allowedRoles={allRoles}>
//               <UnifiedDashboard />
//             </RoleGate>
//           }
//         />

//         {/* SPECIALTY ROUTES */}
//         <Route
//           path="/calendar"
//           element={
//             <RoleGate allowedRoles={allRoles}>
//               <FullCalendarView />
//             </RoleGate>
//           }
//         />
//         {/* <Route path="/learning" element={<LearningPage />} /> */}
//         <Route path="/learning/:id" element={<LearningPage user={user} />} />

//         {/* FALLBACK */}
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

