
import React, { useEffect, useState } from "react";
import { supabase } from "../supabase"; 
import { Link } from "react-router-dom";
import { Calendar, Clock } from "lucide-react";

// Accept either tutorId OR studentId
export default function UpcomingClasses({ tutorId, studentId }) {
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcoming = async () => {
      // 1. Identify which ID we are using
      const targetId = tutorId || studentId;
      const targetColumn = tutorId ? "tutor_id" : "student_id";

      if (!targetId) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("calendar_events")
          .select("*")
          .eq(targetColumn, targetId) // Properly connects to your schema
          .gte("start_time", new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(3);

        if (error) throw error;
        setUpcoming(data || []);
      } catch (err) {
        console.error("Agenda Fetch Error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcoming();
  }, [tutorId, studentId]);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-3xl border border-slate-50 shadow-sm animate-pulse">
        <div className="h-4 w-20 bg-slate-100 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-10 bg-slate-50 rounded-xl"></div>
          <div className="h-10 bg-slate-50 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm transition-all hover:shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">My Agenda</h3>
        <Calendar className="w-4 h-4 text-blue-500" />
      </div>

      <div className="flex flex-col gap-5">
        {upcoming.length > 0 ? (
          upcoming.map((item) => (
            <div key={item.id} className="flex gap-4 group cursor-pointer">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-blue-600 leading-none">
                  {new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                </span>
                <div className="w-[2px] h-full bg-slate-100 my-1 group-last:hidden"></div>
              </div>
              
              <div className="flex-1 pb-4">
                <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-tighter ${
                    item.class_type === 'trial' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {item.class_type}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <Clock className="mx-auto text-slate-200 mb-2" size={24} />
            <p className="text-xs text-slate-400 font-medium italic">No classes today.</p>
          </div>
        )}
      </div>

      <Link to="/calendar" className="block w-full">
        <button className="w-full text-blue-600 text-[10px] font-black uppercase tracking-widest pt-5 mt-2 border-t border-slate-50 text-center hover:underline">
          Full Schedule
        </button>
      </Link>
    </div>
  );
}