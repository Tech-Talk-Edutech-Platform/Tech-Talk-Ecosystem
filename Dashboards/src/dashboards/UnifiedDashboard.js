import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from '../supabase';
import DashboardLayout from './DashboardLayout';

export default function UnifiedDashboard() {
  const { role: urlRole } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndRole = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          navigate("/", { replace: true });
          return;
        }

        const { data: dbData } = await supabase
          .from('users')
          .select('role, assigned_course_id, assigned_tutor_id, full_name, email')
          .eq('id', authUser.id)
          .single();

        const dbRole = dbData?.role || 'student';
        setRole(dbRole);
        setUser({ ...authUser, ...dbData });

        // Enforce correct URL matching actual DB role
        if (urlRole && urlRole !== dbRole) {
          navigate(`/${dbRole}`, { replace: true });
        }
      } catch (err) {
        console.error("Unexpected error in fetchUserAndRole:", err);
        navigate("/", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndRole();
  }, [urlRole, navigate]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0b1020] text-gray-900 dark:text-white font-black text-xl">
        LOADING... 🚀
      </div>
    );
  }

  if (!user || !role) return null;

  return <DashboardLayout role={role} user={user} />;
}