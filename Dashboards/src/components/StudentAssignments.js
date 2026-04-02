// import React, { useEffect, useState } from "react";
// import { supabase } from "../supabase";

// export default function StudentAssignments({ tutorId, students, courses }) {
//   const [assignments, setAssignments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);

//   const [newAssignment, setNewAssignment] = useState({
//     student_id: "",
//     task_name: "",
//     category: "",
//     description: "",
//     course_id: "",
//     submission_link: "",
//   });

//   const getStatusStyles = (status) => {
//     switch (status?.toLowerCase()) {
//       case "submitted":
//         return "bg-amber-100 text-amber-700 border-amber-200";
//       case "pending":
//         return "bg-blue-100 text-blue-700 border-blue-200";
//       case "completed":
//         return "bg-emerald-100 text-emerald-700 border-emerald-200";
//       default:
//         return "bg-slate-100 text-slate-700 border-slate-200";
//     }
//   };

//   // Fetch assignments
//   const fetchAssignments = async () => {
//     if (!tutorId) return;
//     setLoading(true);

//     const { data, error } = await supabase
//       .from("student_assignments")
//       .select(`
//         id,
//         task_name,
//         status,
//         category,
//         description,
//         submission_text,
//         submission_link,
//         student:student_id ( full_name ),
//         course:course_id ( title )
//       `)
//       .eq("tutor_id", tutorId)
//       .order("created_at", { ascending: false });

//     if (!error && data) {
//       setAssignments(
//         data.map((item) => ({
//           id: item.id,
//           student: item.student?.full_name || "Unknown",
//           task: item.task_name,
//           course: item.course?.title || "",
//           description: item.description,
//           category: item.category,
//           submission_text: item.submission_text,
//           submission_link: item.submission_link,
//           status: item.status,
//         }))
//       );
//     } else {
//       setAssignments([]);
//     }

//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchAssignments();
//   }, [tutorId]);

//   const markCompleted = async (id) => {
//     if (!id) return;
//     const { error } = await supabase
//       .from("student_assignments")
//       .update({ status: "completed", grade: "Reviewed" })
//       .eq("id", id);
//     if (!error) fetchAssignments();
//   };

//   const handleCreateAssignment = async () => {
//     if (!newAssignment.student_id || !newAssignment.task_name) return;

//     const { error } = await supabase.from("student_assignments").insert([
//       {
//         tutor_id: tutorId,
//         student_id: newAssignment.student_id,
//         course_id: newAssignment.course_id || null,
//         task_name: newAssignment.task_name,
//         category: newAssignment.category,
//         description: newAssignment.description,
//         submission_link: newAssignment.submission_link || null,
//         status: "pending",
//       },
//     ]);

//     if (!error) {
//       setShowModal(false);
//       setNewAssignment({
//         student_id: "",
//         task_name: "",
//         category: "",
//         description: "",
//         course_id: "",
//         submission_link: "",
//       });
//       fetchAssignments();
//     }
//   };

//   return (
//     <>
//       <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-6">
//         <div className="flex justify-between mb-6 items-center">
//           <h3 className="font-bold text-slate-800">Assignments</h3>
//           <button
//             onClick={() => setShowModal(true)}
//             className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black hover:bg-blue-700"
//           >
//             + New Assignment
//           </button>
//         </div>

//         {loading ? (
//           <p className="text-xs text-slate-400">Loading...</p>
//         ) : assignments.length === 0 ? (
//           <p className="text-xs text-slate-400 italic text-center py-4">
//             No assignments found.
//           </p>
//         ) : (
//           <div className="space-y-4">
//             {assignments.map((item) => (
//               <div
//                 key={item.id}
//                 className="p-4 border rounded-xl bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
//               >
//                 {/* Left: Task Info */}
//                 <div className="flex-1">
//                   <p className="font-bold text-sm">{item.student}</p>
//                   <p className="text-xs text-slate-500">
//                     {item.task} {item.course && `- ${item.course}`}
//                   </p>
//                   <p className="text-xs text-slate-500 mt-1">{item.description}</p>
//                 </div>

//                 {/* Right: Status & Submission */}
//                 <div className="flex flex-col items-end gap-2 sm:w-40">
//                   <span
//                     className={`text-[9px] font-bold px-2 py-1 rounded border ${getStatusStyles(
//                       item.status
//                     )}`}
//                   >
//                     {item.status}
//                   </span>

//                   {item.submission_text && (
//                     <div className="bg-slate-50 p-2 rounded w-full">
//                       <p className="text-[10px] text-slate-400 font-bold">Submission</p>
//                       <p className="text-sm truncate">{item.submission_text}</p>
//                       {item.status === "submitted" && (
//                         <button
//                           onClick={() => markCompleted(item.id)}
//                           className="mt-1 bg-green-600 text-white px-2 py-1 rounded text-xs"
//                         >
//                           Mark Reviewed
//                         </button>
//                       )}
//                     </div>
//                   )}

//                   {item.submission_link && (
//                     <button
//                       onClick={() => window.open(item.submission_link, "_blank")}
//                       className="mt-1 text-xs text-blue-600 underline"
//                     >
//                       Open Link
//                     </button>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Loader2, MessageSquare, CheckCircle, ExternalLink, Star } from "lucide-react";
import toast from "react-hot-toast";

export default function StudentAssignments({ tutorId, students, courses }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Track both text feedback and star rating
  const [feedbackInputs, setFeedbackInputs] = useState({});
  const [ratingInputs, setRatingInputs] = useState({});

  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case "submitted":
        return "bg-amber-500 text-white border-amber-600 shadow-sm animate-pulse";
      case "pending":
        return "bg-slate-100 text-slate-500 border-slate-200";
      case "completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-50 text-slate-400 border-slate-100";
    }
  };

  const fetchAssignments = async () => {
    if (!tutorId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("student_assignments")
      .select(`
        id, task_name, status, category, description, 
        submission_text, submission_link, tutor_feedback, grade,
        student:student_id ( full_name ),
        course:course_id ( title )
      `)
      .eq("tutor_id", tutorId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setAssignments(data.map((item) => ({
        ...item,
        student: item.student?.full_name || "Unknown",
        course: item.course?.title || "",
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchAssignments(); }, [tutorId]);

  const markCompleted = async (id) => {
    const feedback = feedbackInputs[id] || "Great job!";
    const rating = ratingInputs[id] || 5;

    const { error } = await supabase
      .from("student_assignments")
      .update({
        status: "completed",
        grade: `${rating} Stars`, // Store rating in the grade column
        tutor_feedback: feedback
      })
      .eq("id", id);

    if (error) {
      toast.error("Update failed");
    } else {
      toast.success("Review sent to student!");
      fetchAssignments();
    }
  };

  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm mb-6">
      <div className="flex justify-between mb-8 items-center">
        <h3 className="font-black text-2xl text-slate-900 tracking-tight">Active Assignments</h3>
        <button onClick={() => setShowModal(true)} className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black hover:bg-blue-700 shadow-lg active:scale-95 transition-all">+ New Task</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-200" size={40} /></div>
      ) : (
        <div className="space-y-4">
          {assignments.map((item) => (
            <div key={item.id} className={`p-6 border-2 rounded-[28px] bg-white transition-all ${item.status === 'submitted' ? 'border-amber-200 bg-amber-50/10' : 'border-slate-50'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-black text-slate-900 text-lg">{item.student}</p>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{item.task} • {item.course}</p>
                </div>
                <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border uppercase tracking-widest ${getStatusStyles(item.status)}`}>{item.status}</span>
              </div>

              {item.submission_text && (
                <div className="mt-2 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                  <div className="p-4 bg-slate-50/50">
                    <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Submission</p>
                    <p className="text-sm font-medium text-slate-700 italic">"{item.submission_text}"</p>
                  </div>

                  {item.status === "submitted" ? (
                    <div className="p-4 border-t border-slate-100 space-y-4">
                      {/* Rating Selector */}
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Rate Performance</p>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setRatingInputs({ ...ratingInputs, [item.id]: star })}
                              className="transition-transform active:scale-125"
                            >
                              <Star
                                size={24}
                                className={`${(ratingInputs[item.id] || 5) >= star ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <textarea
                        placeholder="Feedback note..."
                        className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-200 transition"
                        rows={2}
                        value={feedbackInputs[item.id] || ""}
                        onChange={(e) => setFeedbackInputs({ ...feedbackInputs, [item.id]: e.target.value })}
                      />
                      <button
                        onClick={() => markCompleted(item.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={14} /> Send Review
                      </button>
                    </div>
                  ) : (
                    item.tutor_feedback && (
                      <div className="p-4 border-t border-slate-100 bg-emerald-50/30 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] text-emerald-600 font-black uppercase mb-1">Your Feedback</p>
                          <p className="text-sm font-bold text-emerald-800">{item.tutor_feedback}</p>
                        </div>
                        <div className="flex gap-0.5">
                          {/* Display result stars */}
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={12} className={item.grade?.includes(s) || (parseInt(item.grade) >= s) ? "fill-emerald-500 text-emerald-500" : "text-emerald-200"} />
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Assignment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-[320px]">
            <h3 className="font-bold mb-4">New Assignment</h3>

            <select
              className="w-full mb-2 p-2 border rounded"
              value={newAssignment.student_id}
              onChange={(e) =>
                setNewAssignment({ ...newAssignment, student_id: e.target.value })
              }
            >
              <option value="">Select Student</option>
              {students?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name}
                </option>
              ))}
            </select>

            <select
              className="w-full mb-2 p-2 border rounded"
              value={newAssignment.course_id}
              onChange={(e) =>
                setNewAssignment({ ...newAssignment, course_id: e.target.value })
              }
            >
              <option value="">Select Course</option>
              {courses?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} {/* ✅ fixed: show title */}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Task Name"
              className="w-full mb-2 p-2 border rounded"
              value={newAssignment.task_name}
              onChange={(e) =>
                setNewAssignment({ ...newAssignment, task_name: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Category"
              className="w-full mb-2 p-2 border rounded"
              value={newAssignment.category}
              onChange={(e) =>
                setNewAssignment({ ...newAssignment, category: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Submission Link"
              className="w-full mb-2 p-2 border rounded"
              value={newAssignment.submission_link}
              onChange={(e) =>
                setNewAssignment({ ...newAssignment, submission_link: e.target.value })
              }
            />

            <textarea
              placeholder="Description"
              className="w-full mb-4 p-2 border rounded"
              value={newAssignment.description}
              onChange={(e) =>
                setNewAssignment({ ...newAssignment, description: e.target.value })
              }
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 bg-slate-200 rounded text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAssignment}
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

    </div>

  );
}
// import React, { useEffect, useState } from "react";
// import { supabase } from "../supabase";

// export default function StudentAssignments({ tutorId, students, courses }) {
//   const [assignments, setAssignments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);

//   const [newAssignment, setNewAssignment] = useState({
//     student_id: "",
//     task_name: "",
//     category: "",
//     description: "",
//     course_id: "",
//     submission_link: "",
//   });

//   // Status badge styles
//   const getStatusStyles = (status) => {
//     switch (status?.toLowerCase()) {
//       case "submitted":
//         return "bg-amber-100 text-amber-700 border-amber-200";
//       case "pending":
//         return "bg-blue-100 text-blue-700 border-blue-200";
//       case "completed":
//         return "bg-emerald-100 text-emerald-700 border-emerald-200";
//       default:
//         return "bg-slate-100 text-slate-700 border-slate-200";
//     }
//   };

//   // Fetch assignments
//   const fetchAssignments = async () => {
//     if (!tutorId) return;

//     setLoading(true);

//     const { data, error } = await supabase
//       .from("student_assignments")
//       .select(`
//         id,
//         task_name,
//         status,
//         category,
//         description,
//         submission_text,
//         submission_link,
//         student:student_id ( full_name ),
//         course:course_id ( title )
//       `)
//       .eq("tutor_id", tutorId)
//       .order("created_at", { ascending: false });

//     if (!error && Array.isArray(data)) {
//       const formatted = data.map((item) => ({
//         id: item.id,
//         name: item.student?.full_name || "Unknown Student",
//         course: item.course?.title || "",
//         task: item.task_name,
//         description: item.description,
//         category: item.category,
//         submission_text: item.submission_text,
//         submission_link: item.submission_link,
//         icon:
//           item.category === "Python"
//             ? "🐍"
//             : item.category === "Web Dev"
//               ? "🎨"
//               : "📘",
//         status: item.status,
//       }));
//       setAssignments(formatted);
//     } else {
//       setAssignments([]);
//       if (error) console.log("Fetch Error:", error.message);
//     }

//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchAssignments();
//   }, [tutorId]);

//   // Mark assignment completed
//   const markCompleted = async (id) => {
//     if (!id) return;

//     const { error } = await supabase
//       .from("student_assignments")
//       .update({ status: "completed", grade: "Reviewed" })
//       .eq("id", id);

//     if (!error) fetchAssignments();
//     else console.log("Mark Completed Error:", error.message);
//   };

//   // Create assignment
//   const handleCreateAssignment = async () => {
//     if (!tutorId || !newAssignment.student_id || !newAssignment.task_name) {
//       console.log("Missing required fields");
//       return;
//     }

//     const { error } = await supabase.from("student_assignments").insert([
//       {
//         tutor_id: tutorId,
//         student_id: newAssignment.student_id,
//         course_id: newAssignment.course_id || null,
//         task_name: newAssignment.task_name,
//         category: newAssignment.category,
//         description: newAssignment.description,
//         submission_link: newAssignment.submission_link || null,
//         status: "pending",
//       },
//     ]);

//     if (error) {
//       console.log("Insert Error:", error.message);
//       return;
//     }

//     fetchAssignments();
//     setShowModal(false);
//     setNewAssignment({
//       student_id: "",
//       task_name: "",
//       category: "",
//       description: "",
//       course_id: "",
//       submission_link: "",
//     });
//   };

//   return (
//     <>
//       {/* Assignment Box */}
//       <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-6">
//         <div className="flex justify-between mb-6 items-center">
//           <h3 className="font-bold text-slate-800">Assignments</h3>
//           <button
//             onClick={() => setShowModal(true)}
//             className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black hover:bg-blue-700"
//           >
//             + New Assignment
//           </button>
//         </div>

//         {loading ? (
//           <p className="text-xs text-slate-400">Loading...</p>
//         ) : !Array.isArray(assignments) || assignments.length === 0 ? (
//           <p className="text-xs text-slate-400 italic text-center py-4">
//             No assignments found.
//           </p>
//         ) : (
//           <div className="space-y-4">
//             {assignments.map((item) => (
//               <div key={item.id} className="p-4 border rounded-xl bg-white">
//                 <div className="flex justify-between items-center">
//                   <div>
//                     <p className="font-bold text-sm">{item.name}</p>
//                     <p className="text-xs text-slate-500">
//                       {item.course ? `${item.task} - ${item.course}` : item.task}
//                     </p>
//                   </div>

//                   <span
//                     className={`text-[9px] font-bold px-2 py-1 rounded border ${getStatusStyles(
//                       item.status
//                     )}`}
//                   >
//                     {item.status}
//                   </span>
//                 </div>

//                 <p className="text-xs text-slate-500 mt-2">{item.description}</p>

//                 {item.submission_text && (
//                   <div className="bg-slate-50 p-3 rounded mt-3">
//                     <p className="text-[10px] text-slate-400 font-bold">
//                       Student Submission
//                     </p>
//                     <p className="text-sm">{item.submission_text}</p>
//                     {item.status === "submitted" && (
//                       <button
//                         onClick={() => markCompleted(item.id)}
//                         className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-xs"
//                       >
//                         Mark Reviewed
//                       </button>
//                     )}
//                   </div>
//                 )}

//                 {item.submission_link && (
//                   <button
//                     onClick={() => window.open(item.submission_link, "_blank")}
//                     className="mt-2 text-xs text-blue-600 underline"
//                   >
//                     Open Submission Link
//                   </button>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Create Assignment Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-2xl w-[320px]">
//             <h3 className="font-bold mb-4">New Assignment</h3>

//             {/* Student Dropdown */}
//             <select
//               className="w-full mb-2 p-2 border rounded"
//               value={newAssignment.student_id}
//               onChange={(e) =>
//                 setNewAssignment({ ...newAssignment, student_id: e.target.value })
//               }
//             >
//               <option value="">Select Student</option>
//               {students?.map((s) => (
//                 <option key={s.id} value={s.id}>
//                   {s.full_name}
//                 </option>
//               ))}
//             </select>

//             {/* Course Dropdown */}
//             <select
//               className="w-full mb-2 p-2 border rounded"
//               value={newAssignment.course_id}
//               onChange={(e) =>
//                 setNewAssignment({ ...newAssignment, course_id: e.target.value })
//               }
//             >
//               <option value="">Select Course</option>
//               {courses?.map((c) => (
//                 <option key={c.id} value={c.id}>
//                   {c.title}
//                 </option>
//               ))}
//             </select>

//             <input
//               type="text"
//               placeholder="Task Name"
//               className="w-full mb-2 p-2 border rounded"
//               value={newAssignment.task_name}
//               onChange={(e) =>
//                 setNewAssignment({ ...newAssignment, task_name: e.target.value })
//               }
//             />

//             <input
//               type="text"
//               placeholder="Category"
//               className="w-full mb-2 p-2 border rounded"
//               value={newAssignment.category}
//               onChange={(e) =>
//                 setNewAssignment({ ...newAssignment, category: e.target.value })
//               }
//             />

//             <input
//               type="text"
//               placeholder="Submission Link"
//               className="w-full mb-2 p-2 border rounded"
//               value={newAssignment.submission_link}
//               onChange={(e) =>
//                 setNewAssignment({ ...newAssignment, submission_link: e.target.value })
//               }
//             />

//             <textarea
//               placeholder="Description"
//               className="w-full mb-4 p-2 border rounded"
//               value={newAssignment.description}
//               onChange={(e) =>
//                 setNewAssignment({ ...newAssignment, description: e.target.value })
//               }
//             />

//             <div className="flex justify-end gap-2">
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="px-3 py-1 bg-slate-200 rounded text-xs"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleCreateAssignment}
//                 className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
//               >
//                 Create
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
// // import React, { useEffect, useState } from "react";
// // import { supabase } from "../supabase";

// // export default function StudentAssignments({ tutorId, students }) {
// //   const [assignments, setAssignments] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [showModal, setShowModal] = useState(false);

// //   const [newAssignment, setNewAssignment] = useState({
// //     student_id: "",
// //     task_name: "",
// //     category: "",
// //     description: "",
// //   });

// //   // Status badge styles
// //   const getStatusStyles = (status) => {
// //     switch (status?.toLowerCase()) {
// //       case "submitted":
// //         return "bg-amber-100 text-amber-700 border-amber-200";
// //       case "pending":
// //         return "bg-blue-100 text-blue-700 border-blue-200";
// //       case "completed":
// //         return "bg-emerald-100 text-emerald-700 border-emerald-200";
// //       default:
// //         return "bg-slate-100 text-slate-700 border-slate-200";
// //     }
// //   };

// //   // Fetch assignments
// //   const fetchAssignments = async () => {
// //     if (!tutorId) return;

// //     setLoading(true);

// //     const { data, error } = await supabase
// //       .from("student_assignments")
// //       // .select(`
// //       //   id,
// //       //   task_name,
// //       //   status,
// //       //   category,
// //       //   description,
// //       //   submission_text,
// //       //   submission_link,
// //       //   students ( full_name )
// //       // `)
// //       .select(`
// //   id,
// //   task_name,
// //   status,
// //   category,
// //   description,
// //   submission_text,
// //   submission_link,
// //   users:student_id ( full_name )
// // `)
// //       .eq("tutor_id", tutorId)
// //       .order("created_at", { ascending: false });

// //     if (!error && Array.isArray(data)) {
// //       const formatted = data.map((item) => ({
// //         id: item.id,
// //         // name: item.students?.full_name || "Unknown Student",
// //         name: item.users?.full_name || "Unknown Student",
// //         task: item.task_name,
// //         description: item.description,
// //         category: item.category,
// //         submission_text: item.submission_text,
// //         submission_link: item.submission_link,
// //         icon:
// //           item.category === "Python"
// //             ? "🐍"
// //             : item.category === "Web Dev"
// //               ? "🎨"
// //               : "📘",
// //         status: item.status,
// //       }));
// //       setAssignments(formatted);
// //     } else {
// //       setAssignments([]); // fallback if data is null
// //     }

// //     setLoading(false);
// //   };

// //   useEffect(() => {
// //     fetchAssignments();
// //   }, [tutorId]);

// //   // Mark assignment completed
// //   const markCompleted = async (id) => {
// //     const { error } = await supabase
// //       .from("student_assignments")
// //       .update({
// //         status: "completed",
// //         grade: "Reviewed",
// //       })
// //       .eq("id", id);

// //     if (!error) fetchAssignments();
// //   };

// //   // Create assignment
// //   const handleCreateAssignment = async () => {
// //     if (!newAssignment.student_id || !newAssignment.task_name) return;

// //     const { error } = await supabase.from("student_assignments").insert({
// //       tutor_id: tutorId,
// //       student_id: newAssignment.student_id,
// //       task_name: newAssignment.task_name,
// //       category: newAssignment.category,
// //       description: newAssignment.description,
// //       status: "pending",
// //     });

// //     if (!error) {
// //       fetchAssignments();
// //       setShowModal(false);
// //       setNewAssignment({
// //         student_id: "",
// //         task_name: "",
// //         category: "",
// //         description: "",
// //       });
// //     }
// //   };

// //   return (
// //     <>
// //       {/* Assignment Box */}
// //       <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-6">
// //         <div className="flex justify-between mb-6 items-center">
// //           <h3 className="font-bold text-slate-800">Assignments</h3>
// //           <button
// //             onClick={() => setShowModal(true)}
// //             className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black hover:bg-blue-700"
// //           >
// //             + New Assignment
// //           </button>
// //         </div>

// //         {loading ? (
// //           <p className="text-xs text-slate-400">Loading...</p>
// //         ) : !Array.isArray(assignments) || assignments.length === 0 ? (
// //           <p className="text-xs text-slate-400 italic text-center py-4">
// //             No assignments found.
// //           </p>
// //         ) : (
// //           <div className="space-y-4">
// //             {assignments.map((item) => (
// //               <div key={item.id} className="p-4 border rounded-xl bg-white">
// //                 <div className="flex justify-between items-center">
// //                   <div>
// //                     <p className="font-bold text-sm">{item.name}</p>
// //                     <p className="text-xs text-slate-500">{item.task}</p>
// //                   </div>

// //                   <span
// //                     className={`text-[9px] font-bold px-2 py-1 rounded border ${getStatusStyles(
// //                       item.status
// //                     )}`}
// //                   >
// //                     {item.status}
// //                   </span>
// //                 </div>

// //                 <p className="text-xs text-slate-500 mt-2">
// //                   {item.description}
// //                 </p>

// //                 {item.submission_text && (
// //                   <div className="bg-slate-50 p-3 rounded mt-3">
// //                     <p className="text-[10px] text-slate-400 font-bold">
// //                       Student Submission
// //                     </p>
// //                     <p className="text-sm">{item.submission_text}</p>
// //                     {item.status === "submitted" && (
// //                       <button
// //                         onClick={() => markCompleted(item.id)}
// //                         className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-xs"
// //                       >
// //                         Mark Reviewed
// //                       </button>
// //                     )}
// //                   </div>
// //                 )}

// //                 {item.submission_link && (
// //                   <button
// //                     onClick={() =>
// //                       window.open(item.submission_link, "_blank")
// //                     }
// //                     className="mt-2 text-xs text-blue-600 underline"
// //                   >
// //                     Open Submission Link
// //                   </button>
// //                 )}
// //               </div>
// //             ))}
// //           </div>
// //         )}
// //       </div>

// //       {/* Create Assignment Modal */}
// //       {showModal && (
// //         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
// //           <div className="bg-white p-6 rounded-2xl w-[320px]">
// //             <h3 className="font-bold mb-4">New Assignment</h3>

// //             <select
// //               className="w-full mb-2 p-2 border rounded"
// //               value={newAssignment.student_id}
// //               onChange={(e) =>
// //                 setNewAssignment({ ...newAssignment, student_id: e.target.value })
// //               }
// //             >
// //               <option value="">Select Student</option>
// //               {students?.map((s) => (
// //                 <option key={s.id} value={s.id}>
// //                   {s.full_name}
// //                 </option>
// //               ))}
// //             </select>

// //             <input
// //               type="text"
// //               placeholder="Task Name"
// //               className="w-full mb-2 p-2 border rounded"
// //               value={newAssignment.task_name}
// //               onChange={(e) =>
// //                 setNewAssignment({ ...newAssignment, task_name: e.target.value })
// //               }
// //             />

// //             <input
// //               type="text"
// //               placeholder="Category"
// //               className="w-full mb-2 p-2 border rounded"
// //               value={newAssignment.category}
// //               onChange={(e) =>
// //                 setNewAssignment({ ...newAssignment, category: e.target.value })
// //               }
// //             />

// //             <textarea
// //               placeholder="Description"
// //               className="w-full mb-4 p-2 border rounded"
// //               value={newAssignment.description}
// //               onChange={(e) =>
// //                 setNewAssignment({ ...newAssignment, description: e.target.value })
// //               }
// //             />

// //             <div className="flex justify-end gap-2">
// //               <button
// //                 onClick={() => setShowModal(false)}
// //                 className="px-3 py-1 bg-slate-200 rounded text-xs"
// //               >
// //                 Cancel
// //               </button>
// //               <button
// //                 onClick={handleCreateAssignment}
// //                 className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
// //               >
// //                 Create
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </>
// //   );
// // }
