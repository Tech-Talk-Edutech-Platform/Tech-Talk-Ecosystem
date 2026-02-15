// import { useEffect, useState } from "react";
// import { supabase } from "../supabase";

// export default function ClassList({ tutorId, studentId }) {
//   const [classes, setClasses] = useState([]);
//   const [expandedClassId, setExpandedClassId] = useState(null);
//   const [notes, setNotes] = useState({});

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

//       if (!error && data) {
//         setClasses(data);

//         // preload notes
//         const notesMap = {};
//         data.forEach((c) => {
//           notesMap[c.id] = c.notes || "";
//         });
//         setNotes(notesMap);
//       }
//     };

//     fetchClasses();
//   }, [tutorId, studentId]);

//   const handleSaveNotes = async (classId) => {
//     const { error } = await supabase
//       .from("classes")
//       .update({ notes: notes[classId] })
//       .eq("id", classId);

//     if (!error) {
//       alert("Notes saved ✅");
//       setExpandedClassId(null);
//     } else {
//       alert("Error saving notes");
//     }
//   };

//   return (
//     <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
//       <div className="space-y-5">
//         {classes.length > 0 ? (
//           classes.map((c) => (
//             <div key={c.id}>
//               {/* Main Row */}
//               <div className="flex gap-4 items-center group">
//                 <span className="text-[11px] font-black text-slate-400 w-14 uppercase">
//                   {new Date(c.scheduled_at).toLocaleTimeString([], {
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   })}
//                 </span>

//                 <div className="flex-1 flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group-hover:border-blue-200 transition-colors">
                  
//                   {/* Student Info */}
//                   <div className="flex items-center gap-3">
//                     <img
//                       src={`https://ui-avatars.com/api/?name=${c.student_name}&background=random`}
//                       className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
//                       alt="avatar"
//                     />
//                     <div>
//                       <p className="text-sm font-bold text-slate-800">
//                         {c.student_name}
//                       </p>
//                       <p className="text-[10px] font-semibold text-slate-400 uppercase">
//                         {c.class_type || "Course"}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Buttons */}
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() =>
//                         setExpandedClassId(
//                           expandedClassId === c.id ? null : c.id
//                         )
//                       }
//                       className="px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                     >
//                       Notes
//                     </button>

//                     <button className="px-3 py-1 text-xs font-semibold bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300">
//                       Edit
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* Expandable Notes Section */}
//               {expandedClassId === c.id && (
//                 <div className="ml-14 mt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
//                   <textarea
//                     value={notes[c.id] || ""}
//                     onChange={(e) =>
//                       setNotes({ ...notes, [c.id]: e.target.value })
//                     }
//                     placeholder="Write class notes here..."
//                     className="w-full p-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     rows="4"
//                   />

//                   <div className="flex justify-end mt-3">
//                     <button
//                       onClick={() => handleSaveNotes(c.id)}
//                       className="px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700"
//                     >
//                       Save Notes
//                     </button>
//                   </div>
//                 </div>
//               )}
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

import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function ClassList({ tutorId, studentId }) {
  const [classes, setClasses] = useState([]);
  const [activeTab, setActiveTab] = useState("Classes");
  const [classTypeFilter, setClassTypeFilter] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!tutorId && !studentId) return;

      let query = supabase
        .from("classes")
        .select("*")
        .order("scheduled_at", { ascending: true });

      if (tutorId) query = query.eq("tutor_id", tutorId);
      if (studentId) query = query.eq("student_id", studentId);

      const { data, error } = await query;

      if (error) {
        console.error("Fetch Classes Error:", error.message);
        setClasses([]);
      } else {
        setClasses(data || []);
      }
    };

    fetchClasses();
  }, [tutorId, studentId]);

  // Filter classes by type
  const filteredClasses = classTypeFilter
    ? classes.filter((c) => c.class_type === classTypeFilter)
    : classes;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 border-b border-slate-50 pb-2">
          {["Today", "Classes", "Month"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setClassTypeFilter(null);
              }}
              className={`text-sm font-bold transition-all ${
                activeTab === tab
                  ? "text-blue-600 border-b-2 border-blue-600 pb-2"
                  : "text-slate-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm">
          + Add Class
        </button>
      </div>

      {/* Trial / Course Buttons (Only in Classes Tab) */}
      {activeTab === "Classes" && (
        <div className="flex gap-3 mb-5">
          <button
            onClick={() => setClassTypeFilter("trial")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              classTypeFilter === "trial"
                ? "bg-blue-600 text-white shadow"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Trial Classes
          </button>

          <button
            onClick={() => setClassTypeFilter("course")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              classTypeFilter === "course"
                ? "bg-purple-600 text-white shadow"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Course Classes
          </button>

          <button
            onClick={() => setClassTypeFilter(null)}
            className="px-4 py-2 rounded-full text-xs font-bold bg-slate-200 text-slate-700 hover:bg-slate-300"
          >
            All
          </button>
        </div>
      )}

      {/* Class List */}
      <div className="space-y-5">
        {filteredClasses.length > 0 ? (
          filteredClasses.map((c) => (
            <div key={c.id} className="flex gap-4 items-start group">
              <span className="text-[11px] font-black text-slate-400 w-14 pt-3 uppercase tracking-tighter">
                {new Date(c.scheduled_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>

              <div className="flex-1 flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group-hover:border-blue-200 transition-colors">
                <img
                  src={`https://ui-avatars.com/api/?name=${c.student_name}&background=random`}
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                  alt="avatar"
                />
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {c.student_name}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">
                    {c.class_type || "Course Class"}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-slate-400 text-sm py-4 italic">
            No classes found.
          </p>
        )}
      </div>
    </div>
  );
}

// // import { useEffect, useState } from "react";
// // import { supabase } from "../supabase";
// // import ClassList from "../../components/ClassList";


// // export default function ClassList({ tutorId, studentId }) {
// //   const [classes, setClasses] = useState([]);
// //   const [activeTab, setActiveTab] = useState('Classes');

// //   useEffect(() => {
// //     const fetchClasses = async () => {
// //       if (!tutorId && !studentId) return;

// //       let query = supabase
// //         .from("classes")
// //         .select("*")
// //         .order("scheduled_at", { ascending: true });

// //       if (tutorId) query = query.eq("tutor_id", tutorId);
// //       if (studentId) query = query.eq("student_id", studentId);

// //       const { data, error } = await query;

// //       if (error) {
// //         console.error("Fetch Classes Error:", error.message);
// //         setClasses([]);
// //       } else {
// //         setClasses(data || []);
// //       }
// //     };

// //     fetchClasses();
// //   }, [tutorId, studentId]);

// //   return (
// //     <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
// //       <div className="flex justify-between items-center mb-6">
// //         <div className="flex gap-4 border-b border-slate-50 pb-2">
// //           {["Today", "Classes", "Month"].map((tab) => (
// //             <button 
// //               key={tab} 
// //               onClick={() => setActiveTab(tab)}
// //               className={`text-sm font-bold transition-all ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600 pb-2' : 'text-slate-400'}`}
// //             >
// //               {tab}
// //             </button>
// //           ))}
// //         </div>
// //         <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm">+ Add Class</button>
// //       </div>

// //       <div className="space-y-5">
// //         {classes.length > 0 ? classes.map((c) => (
// //           <div key={c.id} className="flex gap-4 items-start group">
// //             <span className="text-[11px] font-black text-slate-400 w-14 pt-3 uppercase tracking-tighter">
// //               {new Date(c.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
// //             </span>
// //             <div className="flex-1 flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group-hover:border-blue-200 transition-colors">
// //               <img 
// //                 src={`https://ui-avatars.com/api/?name=${c.student_name}&background=random`} 
// //                 className="w-10 h-10 rounded-full border-2 border-white shadow-sm" 
// //                 alt="avatar" 
// //               />
// //               <div>
// //                 <p className="text-sm font-bold text-slate-800">{c.student_name}</p>
// //                 <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">{c.class_type || "Scratch Beginners"}</p>
// //               </div>
// //             </div>
// //           </div>
// //         )) : (
// //           <p className="text-center text-slate-400 text-sm py-4 italic">No classes found.</p>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// // // import { useEffect, useState } from "react";
// // // import { supabase } from "../supabase";

// // // export default function ClassList({ tutorId }) {
// // //   const [classes, setClasses] = useState([]);
// // //   const [activeTab, setActiveTab] = useState('Classes');

// // //   useEffect(() => {
// // //     const fetchClasses = async () => {
// // //       const { data } = await supabase
// // //         .from("classes")
// // //         .select("*")
// // //         .eq("tutor_id", tutorId)
// // //         .order("scheduled_at", { ascending: true });
// // //       if (data) setClasses(data);
// // //     };
// // //     if (tutorId) fetchClasses();
// // //   }, [tutorId]);

// // //   return (
// // //     <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
// // //       <div className="flex justify-between items-center mb-6">
// // //         <div className="flex gap-4 border-b border-slate-50 pb-2">
// // //           {["Today", "Classes", "Month"].map((tab) => (
// // //             <button 
// // //               key={tab} 
// // //               onClick={() => setActiveTab(tab)}
// // //               className={`text-sm font-bold transition-all ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600 pb-2' : 'text-slate-400'}`}
// // //             >
// // //               {tab}
// // //             </button>
// // //           ))}
// // //         </div>
// // //         <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm">+ Add Class</button>
// // //       </div>

// // //       <div className="space-y-5">
// // //         {classes.length > 0 ? classes.map((c) => (
// // //           <div key={c.id} className="flex gap-4 items-start group">
// // //             <span className="text-[11px] font-black text-slate-400 w-14 pt-3 uppercase tracking-tighter">
// // //               {new Date(c.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
// // //             </span>
// // //             <div className="flex-1 flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group-hover:border-blue-200 transition-colors">
// // //               <img 
// // //                 src={`https://ui-avatars.com/api/?name=${c.student_name}&background=random`} 
// // //                 className="w-10 h-10 rounded-full border-2 border-white shadow-sm" 
// // //                 alt="avatar" 
// // //               />
// // //               <div>
// // //                 <p className="text-sm font-bold text-slate-800">{c.student_name}</p>
// // //                 <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">{c.class_type || "Scratch Beginners"}</p>
// // //               </div>
// // //             </div>
// // //           </div>
// // //         )) : (
// // //           <p className="text-center text-slate-400 text-sm py-4 italic">No classes found.</p>
// // //         )}
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // import { supabase } from "../supabase"; // Ensure this matches your config file

// // // export default function ClassList({ tutorId }) {
// // //   const [classes, setClasses] = useState([]);
// // //   const [loading, setLoading] = useState(true);

// // //   useEffect(() => {
// // //     const fetchClasses = async () => {
// // //       setLoading(true);
      
// // //       // Supabase query: Select all where tutor_id matches
// // //       const { data, error } = await supabase
// // //         .from("classes")
// // //         .select("*")
// // //         .eq("tutor_id", tutorId)
// // //         .order("scheduled_at", { ascending: true }); // Sort by time

// // //       if (!error) {
// // //         setClasses(data);
// // //       }
// // //       setLoading(false);
// // //     };

// // //     if (tutorId) fetchClasses();
// // //   }, [tutorId]);

// // //   if (loading) return <p className="text-gray-400 animate-pulse py-4">Fetching schedule...</p>;

// // //   return (
// // //     <div className="mt-4">
// // //       <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
// // //         Upcoming Classes ({classes.length})
// // //       </h3>

// // //       {classes.length > 0 ? (
// // //         <div className="space-y-3">
// // //           {classes.map((c) => (
// // //             <div 
// // //               key={c.id} 
// // //               className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all group"
// // //             >
// // //               <div className="flex flex-col">
// // //                 <span className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
// // //                   {c.student_name}
// // //                 </span>
// // //                 <span className="text-xs text-gray-400 font-medium uppercase tracking-tighter">
// // //                   {c.class_type || "Standard Session"}
// // //                 </span>
// // //               </div>

// // //               <div className="text-right">
// // //                 <div className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-sm font-bold">
// // //                   🕒 {new Date(c.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
// // //                 </div>
// // //                 <p className="text-[10px] text-gray-400 mt-1 font-semibold">
// // //                   {new Date(c.scheduled_at).toLocaleDateString()}
// // //                 </p>
// // //               </div>
// // //             </div>
// // //           ))}
// // //         </div>
// // //       ) : (
// // //         <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-2xl">
// // //           <p className="text-gray-400 italic">No classes scheduled.</p>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // }
