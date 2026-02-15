import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "../src/Utils/LandingPage"; // <-- import your landing page
import Login from "./Utils/login";
import UnifiedDashboard from "./dashboards/UnifiedDashboard";
import FullCalendarView from "./components/Calendar";
import RoleGate from "./auth/RoleGate";
import LandingOrDashboard from "./LandingOrDashboard";

export default function App() {
  const allRoles = ['tutor', 'owner', 'operations_admin', 'tech_admin', 'student'];

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        {/* <Route path="/" element={<LandingPage />} />   Landing page is public */}
        <Route path="/" element={<LandingOrDashboard />} />
        <Route path="/login" element={<Login />} /> 




        {/* AUTHENTICATED HUB */}
        <Route 
          path="/:role" 
          element={
            <RoleGate allowedRoles={allRoles}>
              <UnifiedDashboard />
            </RoleGate>
          } 
        />

        {/* SPECIALTY ROUTES */}
        <Route 
          path="/calendar" 
          element={
            <RoleGate allowedRoles={allRoles}>
              <FullCalendarView />
            </RoleGate>
          } 
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}


// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import Login from "./Utils/login";
// import UnifiedDashboard from "./dashboards/UnifiedDashboard";
// import FullCalendarView from "./components/Calendar";
// import RoleGate from "./auth/RoleGate";

// export default function App() {
//   const allRoles = ['tutor', 'owner', 'operations_admin', 'tech_admin', 'student'];

//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* PUBLIC ROUTE */}
//         <Route path="/" element={<Login />} />

//         {/* THE MAIN HUB: URL matches the role (e.g., /owner, /tutor) */}
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

//         {/* Fallback to login */}
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }


// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import Login from "./Utils/login";
// import UnifiedDashboard from "./dashboards/UnifiedDashboard"; // Your new "Brain"
// import FullCalendarView from "./components/Calendar";
// import RoleGate from "./auth/RoleGate";

// export default function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* PUBLIC ROUTE */}
//         <Route path="/" element={<Login />} />

//         {/* THE MAIN HUB: Everyone goes here after login */}
//         <Route 
//           path="/:role" 
//           element={
//             <RoleGate allowedRoles={['tutor', 'owner', 'operations_admin', 'tech_admin', 'student']}>
//               <UnifiedDashboard />
//             </RoleGate>
//           } 
//         />

//         {/* SPECIALTY ROUTES */}
//         <Route 
//   path="/calendar" 
//   element={
//     <RoleGate allowedRoles={['tutor', 'owner', 'operations_admin', 'tech_admin', 'student']}>
//       <FullCalendarView />
//     </RoleGate>
//   } 
// />

//         {/* Fallback */}
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }
// // import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
// // import { useEffect } from "react";
// // import { supabase } from "./supabase";
// // import Login from "./Utils/login";
// // import TutorDashboard from "./dashboards/TutorDashboard";
// // import FullCalendarView from "./components/Calendar";
// // import RoleGate from "./auth/RoleGate";

// // // Internal component to handle the logic since hooks like useNavigate 
// // // must be inside a <BrowserRouter>
// // function AuthManager({ children }) {
// //   const navigate = useNavigate();
// //   const location = useLocation();

// //   useEffect(() => {
// //     const checkSessionAndRedirect = async () => {
// //       const { data: { user } } = await supabase.auth.getUser();
      
// //       // If user is already logged in and tries to access the Login page ("/")
// //       if (user && location.pathname === "/") {
// //         const { data, error } = await supabase
// //           .from("users")
// //           .select("role")
// //           .eq("id", user.id)
// //           .single();

// //         if (!error && data) {
// //           if (data.role === 'operations_admin') navigate("/operations_admin");
// //           else if (data.role === 'owner') navigate("/owner");
// //           else if (data.role === 'tutor') navigate("/tutor");
// //           else navigate("/student");
// //         }
// //       }
// //     };
// //     checkSessionAndRedirect();
// //   }, [navigate, location]);

// //   return children;
// // }

// // export default function App() {
// //   return (
// //     <BrowserRouter>
// //       <AuthManager>
// //         <Routes>
// //           {/* PUBLIC ROUTE: The landing page is now Login */}
// //           <Route path="/" element={<Login />} />

// //           {/* PROTECTED ROUTES */}
// //           <Route 
// //             path="/tutor" 
// //             element={
// //               <RoleGate allowedRoles={['tutor', 'founder']}>
// //                 <TutorDashboard />
// //               </RoleGate>
// //             } 
// //           />

// //           <Route 
// //             path="/calendar" 
// //             element={
// //               <RoleGate allowedRoles={['tutor', 'founder', 'operations_admin']}>
// //                 <FullCalendarView />
// //               </RoleGate>
// //             } 
// //           />

// //           {/* Fallback for unknown routes */}
// //           <Route path="*" element={<Navigate to="/" replace />} />
// //         </Routes>
// //       </AuthManager>
// //     </BrowserRouter>
// //   );
// // }