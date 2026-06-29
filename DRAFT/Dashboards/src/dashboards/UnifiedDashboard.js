import React, { useEffect, useState, useCallback } from "react";
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

  // 1. Memoized fetch handler avoids component thrashing
  const fetchUserAndRole = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (authUser) {
        const { data: dbData } = await supabase
          .from('users')
          .select('role, assigned_course_id, assigned_tutor_id')
          .eq('id', authUser.id)
          .single();

        const dbRole = dbData?.role || 'student';

        setRole(dbRole);
        setUser({
          ...authUser,
          assigned_course_id: dbData?.assigned_course_id,
          assigned_tutor_id: dbData?.assigned_tutor_id
        });

        // Sync route parameters with DB role settings
        if (urlRole !== dbRole) {
          navigate(`/${dbRole}`, { replace: true });
        }
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Dashboard core error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [urlRole, navigate]);

  // 2. Trigger data fetch on layout lifecycle load
  useEffect(() => {
    fetchUserAndRole();
  }, [fetchUserAndRole]);

  if (loading) {
    return <div className="h-screen flex items-center justify-center font-black">LOADING...</div>;
  }

  // 3. Early render window for student users
  if (role === "student" && user) {
    return (
      <StudentView
        userId={user.id}
        courseId={user.assigned_course_id}
        tutorId={user.assigned_tutor_id}
      />
    );
  }

  // 4. Staff layouts (Tutor & Admin windows)
  return (
    <div className="p-8 bg-[#F8DAFC] min-h-screen">
      <DashboardHeader user={user} role={role} />

      <main className="mt-10">
        {/* TUTOR PANEL */}
        {role === 'tutor' && user && (
          <TutorView
            userId={user.id}
            user={user}
            fetchAll={fetchUserAndRole}
          />
        )}

        {/* MANAGEMENT PANEL */}
        {['owner', 'tech_admin', 'operations_admin', 'tech_sales_admin'].includes(role) && user && (
          <AdminView userId={user.id} role={role} />
        )}
      </main>
    </div>
  );
}
// // import React, { useEffect, useState, useCallback } from "react";
// // import { useParams, useNavigate } from "react-router-dom";
// // import { supabase } from '../supabase';
// // import TutorView from "./views/TutorView";
// // import StudentView from "./views/StudentView";
// // import AdminView from "./views/AdminView";
// // import DashboardHeader from "./DashboardHeader";

// // export default function UnifiedDashboard() {
// //   const { role: urlRole } = useParams();
// //   const navigate = useNavigate();
// //   const [user, setUser] = useState(null);
// //   const [role, setRole] = useState(null);
// //   const [loading, setLoading] = useState(true);

// //   // 1. Move function OUTSIDE useEffect so it is available to the return block
// //   // We use useCallback to prevent unnecessary re-renders
// //   const fetchUserAndRole = useCallback(async () => {
// //     const { data: { user: authUser } } = await supabase.auth.getUser();

// //     if (authUser) {
// //       const { data: dbData } = await supabase
// //         .from('users')
// //         .select('role, assigned_course_id, assigned_tutor_id')
// //         .eq('id', authUser.id)
// //         .single();

// //       const dbRole = dbData?.role || 'student';

// //       setRole(dbRole);
// //       setUser({
// //         ...authUser,
// //         assigned_course_id: dbData?.assigned_course_id,
// //         assigned_tutor_id: dbData?.assigned_tutor_id
// //       });

// //       // SYNC URL
// //       if (urlRole && urlRole !== dbRole) {
// //         navigate(`/${dbRole}`, { replace: true });
// //       }
// //     } else {
// //       navigate("/");
// //     }
// //     setLoading(false);
// //   }, [urlRole, navigate]);

// //   // 2. The useEffect now just triggers the function on load
// //   useEffect(() => {
// //     fetchUserAndRole();
// //   }, [fetchUserAndRole]);

// //   if (loading) return (
// //     <div className="h-screen flex items-center justify-center font-black bg-[#F8DAFC]">
// //       LOADING...
// //     </div>
// //   );
// //   if (role === "student" && user) {
// //     return (
// //       <StudentView
// //         userId={user.id}
// //         courseId={user.assigned_course_id}
// //         tutorId={user.assigned_tutor_id}
// //       />
// //     );
// //   }

// //   return (
// //     <div className="p-8 bg-[#F8DAFC] min-h-screen">
// //       <DashboardHeader user={user} role={role} />

// //       <main className="mt-10">
// //         {/* STUDENT VIEW */}
// //         {/* {role === 'student' && user && (
// //           <StudentView
// //             userId={user.id}
// //             courseId={user.assigned_course_id}
// //             tutorId={user.assigned_tutor_id}
// //           />
// //         )} */}

// //         {/* TUTOR VIEW - fetchAll now points to the function defined above */}
// //         {role === 'tutor' && user && (
// //           <TutorView
// //             userId={user.id}
// //             user={user}
// //             fetchAll={fetchUserAndRole}
// //           />
// //         )}

// //         {/* ADMIN VIEW */}
// //         {['owner', 'tech_admin', 'operations_admin'].includes(role) && user && (
// //           <AdminView userId={user.id} role={role} />
// //         )}
// //       </main>
// //     </div>
// //   );
// // }
// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { supabase } from '../supabase';
// import TutorView from "./views/TutorView";
// import StudentView from "./views/StudentView";
// import AdminView from "./views/AdminView";
// import DashboardHeader from "./DashboardHeader";

// export default function UnifiedDashboard() {
//   const { role: urlRole } = useParams();
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   const [role, setRole] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchUserAndRole = async () => {
//       // 1. Get Auth User
//       const { data: { user: authUser } } = await supabase.auth.getUser();

//       if (authUser) {
//         // 2. Get DB details (Role, Course, Tutor)
//         const { data: dbData } = await supabase
//           .from('users')
//           .select('role, assigned_course_id, assigned_tutor_id')
//           .eq('id', authUser.id)
//           .single();

//         const dbRole = dbData?.role || 'student';

//         // 3. Merge Auth and DB data into one state
//         setRole(dbRole);
//         setUser({
//           ...authUser,
//           assigned_course_id: dbData?.assigned_course_id,
//           assigned_tutor_id: dbData?.assigned_tutor_id
//         });

//         // SYNC URL
//         if (urlRole !== dbRole) {
//           navigate(`/${dbRole}`, { replace: true });
//         }
//       } else {
//         navigate("/");
//       }
//       setLoading(false);
//     };

//     fetchUserAndRole();
//   }, [urlRole, navigate]);

//   if (loading) return <div className="h-screen flex items-center justify-center font-black">LOADING...</div>;
//   if (role === "student" && user) {
//     return (
//       // <div className="p-8 bg-[#F8DAFC] min-h-screen">
//       <StudentView
//         userId={user.id}
//         courseId={user.assigned_course_id}
//         tutorId={user.assigned_tutor_id}
//       />
//       // </div>
//     );
//   }
//   return (
//     <div className="p-8 bg-[#F8DAFC] min-h-screen">
//       <DashboardHeader user={user} role={role} />

//       {/* <main className="mt-10"> */}
//       {/* STUDENT VIEW - Passing the required Course and Tutor IDs */}
//       {/* {role === 'student' && user && (
//           <StudentView
//             userId={user.id}
//             courseId={user.assigned_course_id}
//             tutorId={user.assigned_tutor_id}
//           />
//         )} */}

//       {/* TUTOR VIEW */}
//       {role === 'tutor' && user && (
//         <TutorView
//           // userId={user.id}
//           // courseId={user.assigned_course_id}
//           // tutorId={user.assigned_tutor_id}
//           userId={user.id}
//           user={user}
//           fetchAll={fetchUserAndRole}
//         />
//       )}

//       {/* ADMIN VIEW */}
//       {['owner', 'tech_admin', 'operations_admin'].includes(role) && user && (
//         <AdminView userId={user.id} role={role} />
//       )}
//       {/* </main> */}
//     </div >
//   );
// }
// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { supabase } from '../supabase';
// import TutorView from "./views/TutorView";
// import StudentView from "./views/StudentView";
// import AdminView from "./views/AdminView";
// import DashboardHeader from "./DashboardHeader";

// export default function UnifiedDashboard() {
//   const { role: urlRole } = useParams();
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   const [role, setRole] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Inside UnifiedDashboard.js -> fetchUserAndRole
//   const { data, error } = await supabase
//     .from('users')
//     .select('role, assigned_course_id, assigned_tutor_id') // ADD THESE
//     .eq('id', user.id)
//     .single();

//   if (data) {
//     // Store the whole data object so you have access to everything
//     setRole(data.role || 'student');
//     setUser({ ...user, ...data }); // This merges the Auth user with DB fields
//   }

//   useEffect(() => {
//     const fetchUserAndRole = async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (user) {
//         setUser(user);
//         const { data } = await supabase.from('users').select('role').eq('id', user.id).single();
//         const dbRole = data?.role || 'student';
//         setRole(dbRole);

//         // SYNC URL: If url doesn't match the database role, fix it
//         if (urlRole !== dbRole) {
//           navigate(`/${dbRole}`, { replace: true });
//         }
//       } else {
//         navigate("/");
//       }
//       setLoading(false);
//     };
//     fetchUserAndRole();
//   }, [urlRole, navigate]);

//   if (loading) return <div className="h-screen flex items-center justify-center font-black">LOADING...</div>;

//   return (
//     <div className="p-8 bg-[#F8DAFC] min-h-screen">
//       <DashboardHeader user={user} role={role} />
//       <main className="mt-10">
//         {/* {role === 'student' && <StudentView userId={user.id} />} */}
//         // Inside the return block of UnifiedDashboard.js
//         {role === 'student' && (
//           <StudentView
//             userId={user.id}
//             courseId={user.assigned_course_id}
//             tutorId={user.assigned_tutor_id}
//           />
//         )}
//         {role === 'tutor' && <TutorView userId={user.id} />}
//         {['owner', 'tech_admin', 'operations_admin'].includes(role) && (
//           <AdminView userId={user.id} role={role} />
//         )}
//       </main>
//     </div>
//   );
// }
