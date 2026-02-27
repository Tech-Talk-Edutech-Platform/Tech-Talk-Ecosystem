
// import { useEffect, useState } from "react";
// import { supabase } from "../supabase";

// export default function ClassList({ tutorId, studentId }) {
//   const [classes, setClasses] = useState([]);
//   const [activeTab, setActiveTab] = useState("Classes");
//   const [classTypeFilter, setClassTypeFilter] = useState(null);

//   useEffect(() => {
//     const fetchClasses = async () => {
//       if (!tutorId && !studentId) return;

//       let query = supabase
//         .from("classes")
//         .select("*")
//         .order("scheduled_at", { ascending: true });

//       if (tutorId) query = query.eq("tutor_id", tutorId);
//       if (studentId) query = query.eq("student_id", studentId);

//       const { data, error } = await query;

//       if (error) {
//         console.error("Fetch Classes Error:", error.message);
//         setClasses([]);
//       } else {
//         setClasses(data || []);
//       }
//     };

//     fetchClasses();
//   }, [tutorId, studentId]);

//   // Filter classes by type
//   const filteredClasses = classTypeFilter
//     ? classes.filter((c) => c.class_type === classTypeFilter)
//     : classes;

//   return (
//     <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <div className="flex gap-4 border-b border-slate-50 pb-2">
//           {["Today", "Classes", "Month"].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => {
//                 setActiveTab(tab);
//                 setClassTypeFilter(null);
//               }}
//               className={`text-sm font-bold transition-all ${
//                 activeTab === tab
//                   ? "text-blue-600 border-b-2 border-blue-600 pb-2"
//                   : "text-slate-400"
//               }`}
//             >
//               {tab}
//             </button>
//           ))}
//         </div>

//         <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm">
//           + Add Class
//         </button>
//       </div>

//       {/* Trial / Course Buttons (Only in Classes Tab) */}
//       {activeTab === "Classes" && (
//         <div className="flex gap-3 mb-5">
//           <button
//             onClick={() => setClassTypeFilter("trial")}
//             className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
//               classTypeFilter === "trial"
//                 ? "bg-blue-600 text-white shadow"
//                 : "bg-slate-100 text-slate-600 hover:bg-slate-200"
//             }`}
//           >
//             Trial Classes
//           </button>

//           <button
//             onClick={() => setClassTypeFilter("course")}
//             className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
//               classTypeFilter === "course"
//                 ? "bg-purple-600 text-white shadow"
//                 : "bg-slate-100 text-slate-600 hover:bg-slate-200"
//             }`}
//           >
//             Course Classes
//           </button>

//           <button
//             onClick={() => setClassTypeFilter(null)}
//             className="px-4 py-2 rounded-full text-xs font-bold bg-slate-200 text-slate-700 hover:bg-slate-300"
//           >
//             All
//           </button>
//         </div>
//       )}

//       {/* Class List */}
//       <div className="space-y-5">
//         {filteredClasses.length > 0 ? (
//           filteredClasses.map((c) => (
//             <div key={c.id} className="flex gap-4 items-start group">
//               <span className="text-[11px] font-black text-slate-400 w-14 pt-3 uppercase tracking-tighter">
//                 {new Date(c.scheduled_at).toLocaleTimeString([], {
//                   hour: "2-digit",
//                   minute: "2-digit",
//                 })}
//               </span>

//               <div className="flex-1 flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group-hover:border-blue-200 transition-colors">
//                 <img
//                   src={`https://ui-avatars.com/api/?name=${c.student_name}&background=random`}
//                   className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
//                   alt="avatar"
//                 />
//                 <div>
//                   <p className="text-sm font-bold text-slate-800">
//                     {c.student_name}
//                   </p>
//                   <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">
//                     {c.class_type || "Course Class"}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           ))
//         ) : (
//           <p className="text-center text-slate-400 text-sm py-4 italic">
//             No classes found.
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }
