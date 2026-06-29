import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Calendar, List, ChevronRight, User, ExternalLink, Award, BookOpen } from "lucide-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

export default function UpcomingClasses({ classes = [], loading, allEvents = [] }) {
  const [view, setView] = useState("list");
  const [selectedClass, setSelectedClass] = useState(null);

  if (loading) return <div className="p-5 bg-white rounded-2xl animate-pulse h-48"></div>;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          {selectedClass ? "Class Details" : (view === 'list' ? "Next Up" : "Schedule")}
        </h3>
        {!selectedClass && (
          <button onClick={() => setView(view === 'list' ? 'calendar' : 'list')} className="text-slate-400 hover:text-blue-600">
            {view === 'list' ? <Calendar size={16} /> : <List size={16} />}
          </button>
        )}
      </div>

      {selectedClass ? (
        <div className="space-y-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Class</p>
              <h4 className="font-bold text-sm text-slate-800">{selectedClass.title}</h4>
            </div>
            
            {/* Student Details Section */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Student</p>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <User size={14} className="text-blue-500"/>
                  {selectedClass.student_name || "N/A"}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Grade</p>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Award size={14} className="text-amber-500"/>
                  {selectedClass.grade || "N/A"}
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Time</p>
              <p className="text-sm font-semibold text-slate-700">{new Date(selectedClass.start_time).toLocaleString()}</p>
            </div>
            
            {selectedClass.meet_link && (
              <a href={selectedClass.meet_link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 font-bold text-sm underline pt-2">
                Join Meeting <ExternalLink size={14}/>
              </a>
            )}
          </div>
          <button onClick={() => setSelectedClass(null)} className="w-full text-[10px] font-bold uppercase text-slate-400 border border-slate-200 py-2 rounded-lg hover:bg-slate-50">
            Back to List
          </button>
        </div>
      ) : view === 'list' ? (
        <div className="space-y-3">
          {classes.length > 0 ? (
            classes.map((item) => (
              <div key={item.id} onClick={() => setSelectedClass(item)} className="cursor-pointer group flex items-center justify-between p-3 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:border-blue-100 transition-all">
                <div>
                  <p className="text-sm font-bold text-slate-800 leading-none">{item.title}</p>
                  <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-[10px] text-center text-slate-400 py-6 uppercase font-bold">No upcoming classes</p>
          )}
          <Link to="/calendar" className="flex items-center justify-center text-[10px] font-black uppercase text-blue-600 pt-2 hover:underline">
            Full Schedule <ChevronRight size={12} />
          </Link>
        </div>
      ) : (
        <div className="h-48 overflow-hidden rounded-xl border border-slate-100">
         
           

          <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{ left: 'prev', center: 'title', right: 'next' }}
          events={allEvents}
          height="100%"
          dayHeaderFormat={{ weekday: 'narrow' }}
          
        />

        </div>
      )}
    </div>
  );
}
// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import { Clock, Calendar, List, ChevronRight, User, ExternalLink } from "lucide-react";
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";

// export default function UpcomingClasses({ classes = [], loading, tutorId, onDelete }) {
//   const [view, setView] = useState("list");
//   const [selectedClass, setSelectedClass] = useState(null);

//   if (loading) return <div className="p-5 bg-white rounded-2xl animate-pulse h-48"></div>;

//   return (
//     <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all duration-300">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
//           {selectedClass ? "Class Details" : (view === 'list' ? "Next Up" : "Schedule")}
//         </h3>
//         {!selectedClass && (
//           <button onClick={() => setView(view === 'list' ? 'calendar' : 'list')} className="text-slate-400 hover:text-blue-600">
//             {view === 'list' ? <Calendar size={16} /> : <List size={16} />}
//           </button>
//         )}
//       </div>

//       {/* Conditional Rendering */}
//       {selectedClass ? (
//         <div className="space-y-4 animate-in fade-in zoom-in duration-200">
//           <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
//             <div>
//               <p className="text-[10px] uppercase font-bold text-slate-400">Class</p>
//               <h4 className="font-bold text-sm text-slate-800">{selectedClass.title}</h4>
//             </div>
//             <div>
//               <p className="text-[10px] uppercase font-bold text-slate-400">Student</p>
//               <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
//                 <User size={14} className="text-blue-500"/>
//                 {selectedClass.student_name || "N/A"}
//               </div>
//             </div>
//             <div>
//               <p className="text-[10px] uppercase font-bold text-slate-400">Time</p>
//               <p className="text-sm font-semibold text-slate-700">{new Date(selectedClass.start_time).toLocaleString()}</p>
//             </div>
//             {selectedClass.meet_link && (
//               <a href={selectedClass.meet_link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 font-bold text-sm underline pt-2">
//                 Join Meeting <ExternalLink size={14}/>
//               </a>
//             )}
//           </div>
//           <button onClick={() => setSelectedClass(null)} className="w-full text-[10px] font-bold uppercase text-slate-400 border border-slate-200 py-2 rounded-lg hover:bg-slate-50">
//             Back to List
//           </button>
//         </div>
//       ) : view === 'list' ? (
//         <div className="space-y-3">
//           {classes.length > 0 ? (
//             classes.map((item) => (
//               <div key={item.id} onClick={() => setSelectedClass(item)} className="cursor-pointer group flex items-center justify-between p-3 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:border-blue-100 transition-all">
//                 <div>
//                   <p className="text-sm font-bold text-slate-800 leading-none">{item.title}</p>
//                   <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
//                     <Clock size={10} />
//                     {new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                   </p>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <p className="text-[10px] text-center text-slate-400 py-6 uppercase font-bold">No upcoming classes</p>
//           )}
//           <Link to="/calendar" className="flex items-center justify-center text-[10px] font-black uppercase text-blue-600 pt-2 hover:underline">
//             Full Schedule <ChevronRight size={12} />
//           </Link>
//         </div>
//       ) : (
//         <div className="h-48 overflow-hidden rounded-xl border border-slate-100">
//           <FullCalendar
//             plugins={[dayGridPlugin]}
//             initialView="dayGridMonth"
//             headerToolbar={{ left: 'prev', center: 'title', right: 'next' }}
//             dayCellContent={(arg) => arg.date.getDate()}
//             height="auto"
//             contentHeight="auto"
//             fixedWeekCount={false}
//           />
//         </div>
//       )}
//     </div>
//   );
// }
// // import React, { useState } from "react";
// // import { Link } from "react-router-dom";
// // import { Clock, Calendar, List, ChevronRight } from "lucide-react";
// // import FullCalendar from "@fullcalendar/react";
// // import dayGridPlugin from "@fullcalendar/daygrid";

// // export default function UpcomingClasses({ classes = [], loading, tutorId, onDelete }) {
// //   const [view, setView] = useState("list"); // 'list' or 'calendar'

// //   if (loading) return <div className="p-5 bg-white rounded-2xl animate-pulse h-48"></div>;

// //   return (
// //      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all duration-300">
// //       {/* Header with Toggle */}
// //       <div className="flex items-center justify-between mb-1">
// //         <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
// //           {view === 'list' ? <Clock size={14} /> : <Calendar size={14} />} 
// //           {view === 'list' ? "Next Up" : "Schedule View"}
// //         </h3>
// //         <button 
// //           onClick={() => setView(view === 'list' ? 'calendar' : 'list')}
// //           className="text-slate-400 hover:text-blue-600 transition-colors"
// //         >
// //           {view === 'list' ? <Calendar size={16} /> : <List size={16} />}
// //         </button>
// //       </div>

// //       {/* View Switcher */}
// //       {view === 'list' ? (
// //         <div className="space-y-3">
// //           {classes.length > 0 ? (
// //             classes.map((item) => (
// //               <div key={item.id} className="group flex items-center justify-between p-3 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:border-blue-100 transition-all">
// //                 <div>
// //                   <p className="text-sm font-bold text-slate-800 leading-none">{item.title}</p>
// //                   <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
// //                     <Clock size={10} />
// //                     {new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
// //                   </p>
// //                 </div>
// //                 {tutorId && (
// //                   <button onClick={() => onDelete(item.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 text-xl">&times;</button>
// //                 )}
// //               </div>
// //             ))
// //           ) : (
// //             <p className="text-[10px] text-center text-slate-400 py-6 uppercase font-bold">No upcoming classes</p>
// //           )}
// //           <Link to="/calendar" className="flex items-center justify-center text-[10px] font-black uppercase text-blue-600 pt-2 hover:underline">
// //             Full Schedule <ChevronRight size={12} />
// //           </Link>
// //         </div>
// //       ) : (
// //         <div className="h-48 overflow-hidden rounded-xl border border-slate-100">
       

// //           <FullCalendar
// //   plugins={[dayGridPlugin]}
// //   initialView="dayGridMonth"
// //   headerToolbar={{ 
// //     left: 'prev', 
// //     center: 'title', 
// //     right: 'next' 
// //   }}
// //   // Add these for ultimate compactness
// //   dayCellContent={(arg) => arg.date.getDate()}
// //   dayHeaderFormat={{ weekday: 'narrow' }}
// //   fixedWeekCount={false} // Crucial: removes the extra empty rows at the bottom
// //   height="auto"          // Crucial: shrinks to fit content
// //   contentHeight="auto"
// // />
// //         </div>
// //       )}
// //     </div>
// //   );
// // }
// // // import React from "react";
// // // import FullCalendar from "@fullcalendar/react";
// // // import dayGridPlugin from "@fullcalendar/daygrid";

// // // export default function UpcomingClasses({ classes, loading, allEvents = [] }) {
// // //   if (loading) return <div>Loading...</div>;

// // //   // If classes exist, show the list
// // //   if (classes && classes.length > 0) {
// // //     return (
// // //       <div className="space-y-4">
// // //         <h2 className="font-bold text-lg">Upcoming Classes</h2>
// // //         {classes.map((c) => (
// // //           <div key={c.id} className="p-4 border rounded-xl bg-slate-50">
// // //             <p className="font-bold">{c.title}</p>
// // //             <p className="text-xs text-slate-500">{new Date(c.start_time).toLocaleString()}</p>
// // //           </div>
// // //         ))}
// // //       </div>
// // //     );
// // //   }

// // //   // If no classes, show the mini calendar
// // //   return (
// // //     <div className="space-y-4">
// // //       <h2 className="font-bold text-lg text-slate-400">No upcoming classes</h2>
// // //       <div className="h-64 overflow-hidden border border-slate-200 rounded-xl opacity-70">
// // //         <FullCalendar
// // //           plugins={[dayGridPlugin]}
// // //           initialView="dayGridMonth"
// // //           headerToolbar={{ left: '', center: 'title', right: '' }}
// // //           events={allEvents}
// // //           height="100%"
// // //           dayHeaderFormat={{ weekday: 'narrow' }}
// // //         />
// // //       </div>
// // //       <p className="text-xs text-slate-400 text-center">Your calendar is currently clear.</p>
// // //     </div>
// // //   );
// // // }

// // // // import React, { useEffect, useState } from "react";
// // // // import { supabase } from "../supabase";
// // // // import { Link } from "react-router-dom";
// // // // import { Calendar, Clock } from "lucide-react";

// // // // // Accept either tutorId OR studentId
// // // // export default function UpcomingClasses({ tutorId, studentId }) {
// // // //   const [upcoming, setUpcoming] = useState([]);
// // // //   const [loading, setLoading] = useState(true);

// // // //   useEffect(() => {
// // // //     const fetchUpcoming = async () => {
// // // //       // 1. Identify which ID we are using
// // // //       const targetId = tutorId || studentId;
// // // //       const targetColumn = tutorId ? "tutor_id" : "student_id";

// // // //       if (!targetId) return;

// // // //       setLoading(true);
// // // //       try {
// // // //         // const { data, error } = await supabase
// // // //         //   .from("calendar_events")
// // // //         //   .select("*")
// // // //         //   .eq(targetColumn, targetId) // Properly connects to your schema
// // // //         //   .gte("start_time", new Date().toISOString())
// // // //         //   .order('start_time', { ascending: true })
// // // //         //   .limit(3);
// // // //         const { data, error } = await supabase
// // // //           .from("calendar_events")
// // // //           .select(`
// // // //     *,
// // // //     classes!inner (
// // // //       student_id
// // // //     )
// // // //   `)
// // // //           .eq("classes.student_id", studentId) // Filter via the joined class
// // // //           .gte("start_time", new Date().toISOString())
// // // //           .order("start_time", { ascending: true });

// // // //         if (error) throw error;
// // // //         setUpcoming(data || []);
// // // //       } catch (err) {
// // // //         console.error("Agenda Fetch Error:", err.message);
// // // //       } finally {
// // // //         setLoading(false);
// // // //       }
// // // //     };

// // // //     fetchUpcoming();
// // // //   }, [tutorId, studentId]);

// // // //   if (loading) {
// // // //     return (
// // // //       <div className="p-6 bg-white rounded-3xl border border-slate-50 shadow-sm animate-pulse">
// // // //         <div className="h-4 w-20 bg-slate-100 rounded mb-4"></div>
// // // //         <div className="space-y-3">
// // // //           <div className="h-10 bg-slate-50 rounded-xl"></div>
// // // //           <div className="h-10 bg-slate-50 rounded-xl"></div>
// // // //         </div>
// // // //       </div>
// // // //     );
// // // //   }

// // // //   return (
// // // //     <div className="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm transition-all hover:shadow-md">
// // // //       <div className="flex justify-between items-center mb-6">
// // // //         <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">My Agenda</h3>
// // // //         <Calendar className="w-4 h-4 text-blue-500" />
// // // //       </div>

// // // //       <div className="flex flex-col gap-5">
// // // //         {upcoming.length > 0 ? (
// // // //           upcoming.map((item) => (
// // // //             <div key={item.id} className="flex gap-4 group cursor-pointer">
// // // //               <div className="flex flex-col items-center">
// // // //                 <span className="text-[10px] font-black text-blue-600 leading-none">
// // // //                   {new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
// // // //                 </span>
// // // //                 <div className="w-[2px] h-full bg-slate-100 my-1 group-last:hidden"></div>
// // // //               </div>

// // // //               <div className="flex-1 pb-4">
// // // //                 <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
// // // //                   {item.title}
// // // //                 </p>
// // // //                 <div className="flex items-center gap-2 mt-1">
// // // //                   <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-tighter ${item.class_type === 'trial' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
// // // //                     }`}>
// // // //                     {item.class_type}
// // // //                   </span>
// // // //                 </div>
// // // //               </div>
// // // //             </div>
// // // //           ))
// // // //         ) : (
// // // //           <div className="text-center py-4">
// // // //             <Clock className="mx-auto text-slate-200 mb-2" size={24} />
// // // //             <p className="text-xs text-slate-400 font-medium italic">No classes today.</p>
// // // //           </div>
// // // //         )}
// // // //       </div>

// // // //       <Link to="/calendar" className="block w-full">
// // // //         <button className="w-full text-blue-600 text-[10px] font-black uppercase tracking-widest pt-5 mt-2 border-t border-slate-50 text-center hover:underline">
// // // //           Full Schedule
// // // //         </button>
// // // //       </Link>
// // // //     </div>
// // // //   );
// // // // }