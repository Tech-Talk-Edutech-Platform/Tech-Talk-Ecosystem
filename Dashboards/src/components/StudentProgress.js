import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function StudentList({ tutorId }) {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      const { data } = await supabase
        .from("students")
        .select("*")
        .eq("assigned_tutor_id", tutorId);
      if (data) setStudents(data);
    };
    if (tutorId) fetchStudents();
  }, [tutorId]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-800 tracking-tight">Student Progress</h3>
        <button className="text-blue-600 text-xs font-bold hover:underline">View All &gt;</button>
      </div>
      <div className="space-y-6">
        {students.length > 0 ? students.map((s) => (
          <div key={s.id} className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={s.avatar_url || `https://ui-avatars.com/api/?name=${s.full_name}&background=random`} 
                className="w-11 h-11 rounded-full border-2 border-slate-50 shadow-sm"
                alt="avatar" 
              />
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${s.online ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between mb-1.5 items-end">
                <div>
                  <p className="text-sm font-bold text-slate-800 leading-none">{s.full_name}</p>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-tight">{s.course_name || 'Scratch Beginners'}</p>
                </div>
                <span className="text-[11px] font-black text-slate-600 leading-none">{s.progress || 0}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(59,130,246,0.3)]" 
                  style={{ width: `${s.progress}%`, backgroundColor: s.progress_color || '#3b82f6' }}
                />
              </div>
            </div>
          </div>
        )) : (
          <p className="text-center text-slate-400 text-sm py-2">No active students.</p>
        )}
      </div>
    </div>
  );
}
