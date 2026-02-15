import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function StudentAssignments({ tutorId, students }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state for new assignment
  const [newAssignment, setNewAssignment] = useState({
    student_id: "",
    task_name: "",
    category: "",
    description: "",
  });

  // Badge styles
  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case "submitted":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "pending":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Fetch assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!tutorId) return;

      setLoading(true);
      const { data, error } = await supabase
        .from("student_assignments")
        .select(`
          id, task_name, status, category, description, submission_link,
          students ( full_name )
        `)
        .eq("tutor_id", tutorId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (!error && data) {
        setAssignments(
          data.map((item) => ({
            id: item.id,
            name: item.students?.full_name || "Unknown Student",
            task: item.task_name,
            description: item.description,
            category: item.category,
            icon:
              item.category === "Python"
                ? "🐍"
                : item.category === "Web Dev"
                ? "🎨"
                : "🎮",
            status: item.status,
            submission_link: item.submission_link,
          }))
        );
      }
      setLoading(false);
    };

    fetchAssignments();
  }, [tutorId]);

  // Handle creating a new assignment
  const handleCreateAssignment = async () => {
    if (!newAssignment.student_id || !newAssignment.task_name) return;

    const { data, error } = await supabase
      .from("student_assignments")
      .insert({
        tutor_id: tutorId,
        student_id: newAssignment.student_id,
        task_name: newAssignment.task_name,
        category: newAssignment.category,
        description: newAssignment.description,
        status: "pending",
      });

    if (!error && data) {
      setAssignments((prev) => [data[0], ...prev]);
      setShowModal(false);
      setNewAssignment({ student_id: "", task_name: "", category: "", description: "" });
    } else {
      alert("Error creating assignment: " + error.message);
    }
  };

  return (
    <>
      {/* Assignment Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-6">
        <div className="flex justify-between mb-6 items-center">
          <h3 className="font-bold text-slate-800">Assignments</h3>
          {/* <button
            onClick={() => setShowModal(true)}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black hover:bg-blue-700 transition"
          >
            + New Assignment
          </button> */}
        </div>

        {loading ? (
          <div className="space-y-2">
            <div className="p-4 bg-slate-50 rounded-2xl animate-pulse h-12 w-full"></div>
            <div className="p-4 bg-slate-50 rounded-2xl animate-pulse h-12 w-full"></div>
          </div>
        ) : assignments.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">No assignments found.</p>
        ) : (
          <div className="space-y-4">
            {assignments.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 p-2 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-800 leading-tight">{item.name}</p>
                      <span
                        className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md border ${getStatusStyles(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{item.task}</p>
                    <p className="text-[9px] text-slate-500 truncate">{item.description}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (item.submission_link) window.open(item.submission_link, "_blank");
                  }}
                  className={`px-3 py-1.5 border rounded-lg uppercase tracking-tighter font-black text-[10px] transition-all
                    ${
                      item.status === "submitted"
                        ? "bg-white border-slate-200 hover:bg-slate-900 hover:text-white text-slate-600"
                        : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
                    }`}
                >
                  {item.status === "submitted" ? "Review" : "View"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for New Assignment */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-[300px]">
            <h3 className="font-bold text-slate-800 mb-4">New Assignment</h3>
            <select
              className="w-full mb-2 p-2 border rounded"
              value={newAssignment.student_id}
              onChange={(e) => setNewAssignment({ ...newAssignment, student_id: e.target.value })}
            >
              <option value="">Select Student</option>
              {students?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Task Name"
              className="w-full mb-2 p-2 border rounded"
              value={newAssignment.task_name}
              onChange={(e) => setNewAssignment({ ...newAssignment, task_name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Category (Python, Web Dev, etc.)"
              className="w-full mb-2 p-2 border rounded"
              value={newAssignment.category}
              onChange={(e) => setNewAssignment({ ...newAssignment, category: e.target.value })}
            />
            <textarea
              placeholder="Description"
              className="w-full mb-4 p-2 border rounded"
              value={newAssignment.description}
              onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 bg-slate-200 rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAssignment}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// import React, { useEffect, useState } from "react";
// import { supabase } from "../supabase";

// export default function StudentAssignments({ tutorId }) {
//   const [assignments, setAssignments] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Helper to define badge styles based on status
//   const getStatusStyles = (status) => {
//     switch (status?.toLowerCase()) {
//       case 'submitted':
//         return 'bg-amber-100 text-amber-700 border-amber-200';
//       case 'pending':
//         return 'bg-blue-100 text-blue-700 border-blue-200';
//       case 'completed':
//         return 'bg-emerald-100 text-emerald-700 border-emerald-200';
//       default:
//         return 'bg-slate-100 text-slate-700 border-slate-200';
//     }
//   };

//   useEffect(() => {
//     const fetchAssignments = async () => {
//       if (!tutorId) return;

//       const { data, error } = await supabase
//         .from("student_assignments")
//         .select(`
//           id, task_name, status, category,
//           students ( full_name )
//         `)
//         .eq("tutor_id", tutorId)
//         .order('created_at', { ascending: false })
//         .limit(5);

//       if (!error && data) {
//         setAssignments(data.map(item => ({
//           id: item.id,
//           name: item.students?.full_name || "Unknown Student",
//           task: item.task_name,
//           icon: item.category === "Python" ? "🐍" : item.category === "Web Dev" ? "🎨" : "🎮",
//           status: item.status
//         })));
//       }
//       setLoading(false);
//     };

//     fetchAssignments();
//   }, [tutorId]);

//   // if (loading) return (
//   //   <div className="flex justify-between mb-6">
//   //       <h3 className="font-bold text-slate-800">Homework</h3>
//   //       <div className="p-6 bg-white rounded-2xl animate-pulse">Loading Tasks...</div>;
//   //   </div>
//   // )

//   {loading ? (
//   <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-6">
//     <div className="flex justify-between mb-6">
//       <h3 className="font-bold text-slate-800">Homework</h3>
//       <span className="text-xs font-bold text-slate-400">Loading &hellip;</span>
//     </div>
//     <div className="space-y-2">
//       <div className="p-4 bg-slate-50 rounded-2xl animate-pulse h-12 w-full"></div>
//       <div className="p-4 bg-slate-50 rounded-2xl animate-pulse h-12 w-full"></div>
//       <div className="p-4 bg-slate-50 rounded-2xl animate-pulse h-12 w-full"></div>
//     </div>
//   </div>
// ) : (
//   <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-6">
//     <div className="flex justify-between mb-6">
//       <h3 className="font-bold text-slate-800">Homework</h3>
//       <button className="text-blue-600 text-xs font-bold hover:underline">View All &gt;</button>
//     </div>
//     <div className="space-y-4">
//       {assignments
//         .map(task => {
//           const today = new Date();
//           const deadline = new Date(task.deadline);
//           let status = "Upcoming";
//           let color = "bg-blue-500";
//           let pulse = "";

//           if (deadline < today.setHours(0, 0, 0, 0)) {
//             status = "Overdue";
//             color = "bg-red-500";
//             pulse = "animate-pulse"; // add pulse for overdue
//           } else if (deadline.toDateString() === new Date().toDateString()) {
//             status = "Today";
//             color = "bg-green-500";
//           }

//           return { ...task, status, statusColor: `${color} ${pulse}`, deadline };
//         })
//         .sort((a, b) => {
//           // group by status first: Overdue < Today < Upcoming
//           const statusOrder = { Overdue: 0, Today: 1, Upcoming: 2 };
//           if (statusOrder[a.status] !== statusOrder[b.status]) {
//             return statusOrder[a.status] - statusOrder[b.status];
//           }
//           // within each group, sort by deadline ascending
//           return a.deadline - b.deadline;
//         })
//         .map((task, i) => (
//           <div
//             key={i}
//             className="flex items-center justify-between gap-4 p-2 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
//           >
//             <div className="flex-1 overflow-hidden">
//               <p className="text-sm font-bold text-slate-800 truncate">{task.title}</p>
//               <p className="text-xs text-slate-500 truncate mt-1">{task.description}</p>
//             </div>
//             <span
//               className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-white shadow-sm ${task.statusColor}`}
//             >
//               {task.status}
//             </span>
//           </div>
//         ))}
//     </div>
//   </div>
// )}

// // if (loading) return (
// //   <div className="mb-6">
// //     <div className="flex justify-between items-center mb-4">
// //       <h3 className="font-bold text-slate-800 text-lg">Homework</h3>
// //     </div>
// //     <div className="p-6 bg-white rounded-2xl animate-pulse text-center text-slate-400">
// //       Loading Tasks...
// //     </div>
// //   </div>
// // );

//   return (
//     <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
//       <div className="flex justify-between items-center mb-6">
//         <h3 className="font-bold text-slate-800">Student Assignments</h3>
//         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Activity</span>
//       </div>

//       <div className="space-y-4">
//         {assignments.length === 0 ? (
//           <p className="text-xs text-slate-400 italic text-center py-4">No assignments found.</p>
//         ) : (
//           assignments.map((item) => (
//             <div key={item.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100 group">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
//                   {item.icon}
//                 </div>
//                 <div>
//                   <div className="flex items-center gap-2">
//                     <p className="text-sm font-bold text-slate-800 leading-tight">{item.name}</p>
//                     {/* STATUS BADGE */}
//                     <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md border ${getStatusStyles(item.status)}`}>
//                       {item.status}
//                     </span>
//                   </div>
//                   <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{item.task}</p>
//                 </div>
//               </div>
              
//               {/* <button className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-900 hover:text-white text-slate-600 text-[10px] font-black rounded-lg transition-all uppercase tracking-tighter">
//                 {item.status === 'submitted' ? 'Review' : 'View'}
//               </button>

//               // In the Tutor's view:
// <button 
//   onClick={() => window.open(item.submission_link, "_blank")}
//   className="text-blue-600 font-bold"
// >
//   Open Link
// </button> */}

// <button
//   onClick={() => {
//     if (item.submission_link) window.open(item.submission_link, "_blank");
//     // You can add extra logic for "Review" if needed
//   }}
//   className={`px-3 py-1.5 border rounded-lg uppercase tracking-tighter font-black text-[10px] transition-all
//     ${item.status === "submitted" ? "bg-white border-slate-200 hover:bg-slate-900 hover:text-white text-slate-600" : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"}`}
// >
//   {item.status === "submitted" ? "Review" : "View"}
// </button>

//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }
// // import React, { useEffect, useState } from "react";
// // import { supabase } from "../supabase";

// // export default function StudentAssignments({ tutorId }) {
// //   const [assignments, setAssignments] = useState([]);
// //   const [loading, setLoading] = useState(true);

// //   // Helper to define badge styles based on status
// //   const getStatusStyles = (status) => {
// //     switch (status?.toLowerCase()) {
// //       case 'submitted':
// //         return 'bg-amber-100 text-amber-700 border-amber-200';
// //       case 'pending':
// //         return 'bg-blue-100 text-blue-700 border-blue-200';
// //       case 'completed':
// //         return 'bg-emerald-100 text-emerald-700 border-emerald-200';
// //       default:
// //         return 'bg-slate-100 text-slate-700 border-slate-200';
// //     }
// //   };

// //   useEffect(() => {
// //     const fetchAssignments = async () => {
// //       if (!tutorId) return;

// //       const { data, error } = await supabase
// //         .from("student_assignments")
// //         .select(`
// //           id, task_name, status, category,
// //           students ( full_name )
// //         `)
// //         .eq("tutor_id", tutorId)
// //         .order('created_at', { ascending: false })
// //         .limit(5);

// //       if (!error && data) {
// //         setAssignments(data.map(item => ({
// //           id: item.id,
// //           name: item.students?.full_name || "Unknown Student",
// //           task: item.task_name,
// //           icon: item.category === "Python" ? "🐍" : item.category === "Web Dev" ? "🎨" : "🎮",
// //           status: item.status
// //         })));
// //       }
// //       setLoading(false);
// //     };

// //     fetchAssignments();
// //   }, [tutorId]);

// //   // if (loading) return (
// //   //   <div className="flex justify-between mb-6">
// //   //       <h3 className="font-bold text-slate-800">Homework</h3>
// //   //       <div className="p-6 bg-white rounded-2xl animate-pulse">Loading Tasks...</div>;
// //   //   </div>
// //   // )

// //   {loading ? (
// //   <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-6">
// //     <div className="flex justify-between mb-6">
// //       <h3 className="font-bold text-slate-800">Homework</h3>
// //       <span className="text-xs font-bold text-slate-400">Loading &hellip;</span>
// //     </div>
// //     <div className="space-y-2">
// //       <div className="p-4 bg-slate-50 rounded-2xl animate-pulse h-12 w-full"></div>
// //       <div className="p-4 bg-slate-50 rounded-2xl animate-pulse h-12 w-full"></div>
// //       <div className="p-4 bg-slate-50 rounded-2xl animate-pulse h-12 w-full"></div>
// //     </div>
// //   </div>
// // ) : (
// //   <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-6">
// //     <div className="flex justify-between mb-6">
// //       <h3 className="font-bold text-slate-800">Homework</h3>
// //       <button className="text-blue-600 text-xs font-bold hover:underline">View All &gt;</button>
// //     </div>
// //     <div className="space-y-4">
// //       {tasks
// //         .map(task => {
// //           const today = new Date();
// //           const deadline = new Date(task.deadline);
// //           let status = "Upcoming";
// //           let color = "bg-blue-500";
// //           let pulse = "";

// //           if (deadline < today.setHours(0, 0, 0, 0)) {
// //             status = "Overdue";
// //             color = "bg-red-500";
// //             pulse = "animate-pulse"; // add pulse for overdue
// //           } else if (deadline.toDateString() === new Date().toDateString()) {
// //             status = "Today";
// //             color = "bg-green-500";
// //           }

// //           return { ...task, status, statusColor: `${color} ${pulse}`, deadline };
// //         })
// //         .sort((a, b) => {
// //           // group by status first: Overdue < Today < Upcoming
// //           const statusOrder = { Overdue: 0, Today: 1, Upcoming: 2 };
// //           if (statusOrder[a.status] !== statusOrder[b.status]) {
// //             return statusOrder[a.status] - statusOrder[b.status];
// //           }
// //           // within each group, sort by deadline ascending
// //           return a.deadline - b.deadline;
// //         })
// //         .map((task, i) => (
// //           <div
// //             key={i}
// //             className="flex items-center justify-between gap-4 p-2 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
// //           >
// //             <div className="flex-1 overflow-hidden">
// //               <p className="text-sm font-bold text-slate-800 truncate">{task.title}</p>
// //               <p className="text-xs text-slate-500 truncate mt-1">{task.description}</p>
// //             </div>
// //             <span
// //               className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-white shadow-sm ${task.statusColor}`}
// //             >
// //               {task.status}
// //             </span>
// //           </div>
// //         ))}
// //     </div>
// //   </div>
// // )}

// // // if (loading) return (
// // //   <div className="mb-6">
// // //     <div className="flex justify-between items-center mb-4">
// // //       <h3 className="font-bold text-slate-800 text-lg">Homework</h3>
// // //     </div>
// // //     <div className="p-6 bg-white rounded-2xl animate-pulse text-center text-slate-400">
// // //       Loading Tasks...
// // //     </div>
// // //   </div>
// // // );

// //   return (
// //     <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
// //       <div className="flex justify-between items-center mb-6">
// //         <h3 className="font-bold text-slate-800">My Assignments</h3>
// //         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Activity</span>
// //       </div>

// //       <div className="space-y-4">
// //         {assignments.length === 0 ? (
// //           <p className="text-xs text-slate-400 italic text-center py-4">No assignments found.</p>
// //         ) : (
// //           assignments.map((item) => (
// //             <div key={item.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100 group">
// //               <div className="flex items-center gap-3">
// //                 <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
// //                   {item.icon}
// //                 </div>
// //                 <div>
// //                   <div className="flex items-center gap-2">
// //                     <p className="text-sm font-bold text-slate-800 leading-tight">{item.name}</p>
// //                     {/* STATUS BADGE */}
// //                     <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md border ${getStatusStyles(item.status)}`}>
// //                       {item.status}
// //                     </span>
// //                   </div>
// //                   <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{item.task}</p>
// //                 </div>
// //               </div>
              
// //               <button className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-900 hover:text-white text-slate-600 text-[10px] font-black rounded-lg transition-all uppercase tracking-tighter">
// //                 {item.status === 'submitted' ? 'Review' : 'View'}
// //               </button>
// //             </div>
// //           ))
// //         )}
// //       </div>
// //     </div>
// //   );
// // }