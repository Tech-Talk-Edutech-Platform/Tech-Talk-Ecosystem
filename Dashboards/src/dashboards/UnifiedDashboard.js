import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from '../supabase';
import TutorView from "./views/TutorView";
import StudentView from "./views/StudentView";
import AdminView from "./views/AdminView";
import DashboardHeader from "./DashboardHeader";

export default function UnifiedDashboard() {
  const { role: urlRole } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase.from('users').select('role').eq('id', user.id).single();
        const dbRole = data?.role || 'student';
        setRole(dbRole);

        // SYNC URL: If url doesn't match the database role, fix it
        if (urlRole !== dbRole) {
          navigate(`/${dbRole}`, { replace: true });
        }
      } else {
        navigate("/");
      }
      setLoading(false);
    };
    fetchUserAndRole();
  }, [urlRole, navigate]);

  if (loading) return <div className="h-screen flex items-center justify-center font-black">LOADING...</div>;

  return (
    <div className="p-8 bg-[#F8DAFC] min-h-screen">
      <DashboardHeader user={user} role={role} />
      <main className="mt-10">
        {role === 'student' && <StudentView userId={user.id} />}
        {role === 'tutor' && <TutorView userId={user.id} />}
        {['owner', 'tech_admin', 'operations_admin'].includes(role) && (
          <AdminView userId={user.id} role={role} />
        )}
      </main>
    </div>
  );
}
// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { supabase } from '../supabase';
// import TutorView from "./views/TutorView";
// import StudentView from "./views/StudentView";
// import DashboardHeader from "./DashboardHeader";
// import AdminView from "./views/AdminView";

// export default function UnifiedDashboard() {
//   const { role: urlRole } = useParams();
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   const [role, setRole] = useState(null);
//   const [loading, setLoading] = useState(true);
  
//   const [stats, setStats] = useState({
//     classesToday: 0,
//     upcoming: 0,
//     activeStudents: 0,
//     pendingReviews: 0
//   });

//   useEffect(() => {
//     const getSession = async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (user) {
//         setUser(user);
//         const { data } = await supabase.from('users').select('role').eq('id', user.id).single();
//         const actualRole = data?.role || 'student';
//         setRole(actualRole);

//         // FIX: If the URL (/tutor) doesn't match the database role (/owner), redirect
//         if (urlRole !== actualRole) {
//           navigate(`/${actualRole}`, { replace: true });
//         }
//       } else {
//         navigate("/");
//       }
//       setLoading(false);
//     };
//     getSession();
//   }, [urlRole, navigate]);

//   if (loading) return <div className="h-screen flex items-center justify-center font-black">LOADING DASHBOARD...</div>;

//   return (
//     <div className="p-8 bg-[#F8DAFC] min-h-screen">
//       <DashboardHeader user={user} role={role} />
//       <main className="mt-10">
//         {role === 'student' && <StudentView userId={user.id} stats={stats} />}
//         {role === 'tutor' && <TutorView userId={user.id} stats={stats} />}
//         {['owner', 'tech_admin', 'operations_admin'].includes(role) && (
//           <AdminView userId={user.id} role={role} stats={stats} />
//         )}
//       </main>
//     </div>
//   );
// }
// import React, { useEffect, useState } from "react";
// import { supabase } from '../supabase';
// import TutorView from "./views/TutorView";
// import StudentView from "./views/StudentView";
// import DashboardHeader from "./DashboardHeader";
// import AdminView from "./views/AdminView";

// export default function UnifiedDashboard() {
//   const [user, setUser] = useState(null);
//   const [role, setRole] = useState("null");
//   const [loading, setLoading] = useState(true);
  
//   // The "Brain" lives here
//   const [stats, setStats] = useState({
//     classesToday: 0,
//     upcoming: 0,
//     activeStudents: 0,
//     pendingReviews: 0
//   });

//   useEffect(() => {
//     const getSession = async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (user) {
//         setUser(user);
//         const { data } = await supabase.from('users').select('role').eq('id', user.id).single();
//         setRole(data?.role || 'student');
//         // NOTE: You would call your fetchStats(user.id) function here to fill the setStats
//       }
//       setLoading(false);
//     };
//     getSession();
//   }, []);

//   if (loading) return <div className="h-screen">Loading...</div>;

//   return (
//     <div className="p-8 bg-[#F8DAFC] min-h-screen">
//       <DashboardHeader user={user} role={role} />
//       <main className="mt-10">
//   {role === 'student' && <StudentView userId={user.id} stats={stats} />}
//   {role === 'tutor' && <TutorView userId={user.id} stats={stats} />}
  
//   {/* Add this line to show the AdminView for all admin roles */}
//   {['owner', 'tech_admin', 'operations_admin'].includes(role) && (
//     <AdminView userId={user.id} role={role} stats={stats} />
//   )}
  
// </main>
//     </div>
//   );
// }
// // import React from "react";
// // // 1. Icons must be imported here
// // import { Calendar, Clock, Users, AlertCircle } from "lucide-react"; 

// // // 2. All components used in the grid must be imported here
// // import StatCard from "../../components/StatCard";
// // import ClassList from "../../components/ClassList";
// // import StudentList from "../../components/StudentProgress";
// // import QuickActions from "../../components/QuickActions";
// // import StudentAssignments from "../../components/StudentAssignments";
// // import UpcomingClasses from "../../components/UpcomingClasses"; // WAS MISSING
// // import Messages from "../../Utils/fetchMessage";
// // // In Parent (UnifiedDashboard.js), ensure state looks like this:
// // const [stats, setStats] = useState({
// //   classesToday: 0,
// //   upcoming: 0,
// //   activeStudents: 0,
// //   pendingReviews: 0
// // });
// // export default function TutorView({ userId, stats }) {
// //   return (
// //     <>
// //       {/* STATS ROW */}
// //       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
// //         <StatCard title="Today's Classes" value={stats.classesToday} color="blue" icon={Calendar} />
// //         <StatCard title="Upcoming Classes" value={stats.upcoming} color="purple" icon={Clock} />
// //         <StatCard title="My Students" value={stats.activeStudents} color="amber" icon={Users} />
// //         <StatCard title="Pending Reviews" value={stats.pendingReviews} color="green" icon={AlertCircle} />
// //       </div>

// //       {/* CONTENT GRID */}
// //       <div className="grid grid-cols-12 gap-8">
// //         <div className="col-span-12 xl:col-span-5 flex flex-col gap-8">
// //            <ClassList tutorId={userId} />
// //            <StudentAssignments tutorId={userId} />
// //         </div>
        
// //         <div className="col-span-12 lg:col-span-7 xl:col-span-4 flex flex-col gap-8">
// //            <StudentList tutorId={userId} />
// //            <Messages tutorId={userId} />
// //         </div>
        
// //         <div className="col-span-12 lg:col-span-5 xl:col-span-3 flex flex-col gap-8">
// //            <QuickActions tutorId={userId} role="tutor" />
// //            {/* 3. Added the missing component tag below */}
// //            <UpcomingClasses tutorId={userId} /> 
// //         </div>
// //       </div>
// //     </>
// //   );
// // }
// // // import React, { useEffect, useState } from "react";
// // // import { supabase } from '../supabase';

// // // // Role-Specific Component Imports
// // // import TutorView from "./views/TutorView";
// // // import StudentView from "./views/StudentView";
// // // import AdminView from "./views/AdminView";
// // // import DashboardHeader from "./layout/DashboardHeader";

// // // export default function UnifiedDashboard() {
// // //   const [user, setUser] = useState(null);
// // //   const [role, setRole] = useState(null);
// // //   const [loading, setLoading] = useState(true);

// // //   useEffect(() => {
// // //     const getSession = async () => {
// // //       const { data: { user } } = await supabase.auth.getUser();
// // //       if (user) {
// // //         setUser(user);
// // //         const { data } = await supabase.from('users').select('role').eq('id', user.id).single();
// // //         setRole(data?.role || 'tutor');
// // //       }
// // //       setLoading(false);
// // //     };
// // //     getSession();
// // //   }, []);

// // //   if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse text-slate-400">LOADING HUB...</div>;

// // //   return (
// // //     <div className="p-8 bg-[#F8DAFC] min-h-screen font-sans text-slate-900">
// // //       {/* 1. Shared Header */}
// // //       <DashboardHeader user={user} role={role} />

// // //       {/* 2. Dynamic View Selection */}
// // //       <main className="mt-10">
// // //         {role === 'student' && <StudentView userId={user.id} />}
// // //         {(role === 'tutor') && <TutorView userId={user.id} />}
// // //         {role === 'admin' && <AdminView userId={user.id} />}
// // //         {(role === 'owner') && <OwnerView userId={user.id} />}
// // //       </main>

// // //       {/* 3. Shared Footer */}
// // //       <footer className="mt-12 text-center border-t border-slate-100 pt-8 pb-4">
// // //         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">• Tech Talk Hub •</p>
// // //       </footer>
// // //     </div>
// // //   );
// // // }