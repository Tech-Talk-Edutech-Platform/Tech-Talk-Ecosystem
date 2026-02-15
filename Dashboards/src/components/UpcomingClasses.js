
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
}// import React, { useEffect, useState } from "react";
// import { supabase } from "../supabase"; 
// import { Link } from "react-router-dom";
// import { Calendar } from "lucide-react";

// export default function UpcomingClasses({ tutorId }) {
//   const [upcoming, setUpcoming] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchUpcoming = async () => {
//       if (!tutorId) return;
      
//       setLoading(true);
//       const { data } = await supabase
//         .from("calendar_events")
//         .select("*")
//         .eq("tutor_id", tutorId)
//         .gte("start_time", new Date().toISOString())
//         .order('start_time', { ascending: true })
//         .limit(3);

//       if (data) setUpcoming(data);
//       setLoading(false);
//     };

//     fetchUpcoming();
//   }, [tutorId]);

//   if (loading) {
//     return <p className="animate-pulse text-slate-400 text-[10px] font-bold uppercase tracking-widest p-4">Loading agenda...</p>;
//   }

//   return (
//     <div className="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm">
//       <div className="flex justify-between items-center mb-6">
//         <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Agenda</h3>
//         <Calendar className="w-4 h-4 text-blue-500" />
//       </div>

//       <div className="flex flex-col gap-4">
//         {upcoming.length > 0 ? (
//           upcoming.map((item) => (
//             <div key={item.id} className="group cursor-pointer">
//               <p className="text-[10px] font-black text-blue-600 uppercase mb-1">
//                 {new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//               </p>
//               <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
//                 {item.title}
//               </p>
//             </div>
//           ))
//         ) : (
//           <p className="text-xs text-slate-400 font-medium italic">No classes scheduled yet.</p>
//         )}
//       </div>

//       <Link to="/calendar" className="block w-full">
//         <button className="w-full text-blue-600 text-[10px] font-black uppercase tracking-widest pt-5 mt-4 border-t border-slate-50 text-center hover:underline">
//           View Full Calendar
//         </button>
//       </Link>
//     </div>
//   );
// }
// // import { useState } from "react";
// // import { Link } from "react-router-dom";

// // export default function UpcomingClasses() {
// //   const [upcoming] = useState([
// //     { time: "Tomorrow, 10:00 AM", title: "Python Basics", subtitle: "Kevin Wambui, Grade 6", color: "bg-blue-500" },
// //     { time: "Tomorrow, 2:45 PM", title: "Scratch Beginners", subtitle: "Amina Otieno, Grade 4", color: "bg-emerald-500" },
// //     { time: "Thursday, 11:00 AM", title: "HTML/CSS", subtitle: "Lucy Mathenge, Grade 7", color: "bg-amber-500" }
// //   ]);

// //   return (
// //     <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
// //       <h3 className="font-bold text-slate-800 mb-6">Upcoming Lessons</h3>
// //       <div className="space-y-6">
// //         {upcoming.map((item, i) => (
// //           <div key={i} className="flex items-center justify-between group cursor-pointer">
// //             <div className="flex flex-col">
// //               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
// //                 {item.time}
// //               </span>
// //               <div className="flex items-center gap-2">
// //                 <div className={`w-2 h-2 rounded-full shadow-sm ${item.color}`}></div>
// //                 <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
// //                   {item.title}
// //                 </p>
// //               </div>
// //               <p className="text-[10px] font-medium text-slate-400 ml-4 mt-0.5">{item.subtitle}</p>
// //             </div>
// //             <div className="text-slate-300 group-hover:text-blue-500 transition-colors">
// //               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
// //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
// //               </svg>
// //             </div>
// //           </div>
// //         ))}
// //       </div>
// //       <Link to="/calendar" className="block w-full">
// //       <button className="w-full text-blue-600 text-[10px] font-black uppercase tracking-widest pt-5 mt-4 border-t border-slate-50 text-center hover:underline">
// //         View Full Calendar
// //       </button>
// //       </Link>
// //     </div>
// //   );
// // }
