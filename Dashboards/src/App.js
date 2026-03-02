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

