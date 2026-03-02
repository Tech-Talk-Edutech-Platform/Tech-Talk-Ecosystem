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
