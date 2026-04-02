import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { supabase } from "../supabase";
import { Loader2, CheckCircle, Clock, Send, MessageSquare, Star } from "lucide-react";

export default function MyHomework({ studentId }) {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  useEffect(() => {
    if (studentId) fetchAssignments();
  }, [studentId]);

  async function fetchAssignments() {
    const { data, error } = await supabase
      .from("student_assignments")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (error) console.error("Fetch error:", error);
    setAssignments(data || []);
  }

  async function submitAssignment(id) {
    const text = submissions[id];
    if (!text) return toast.error("Please write your response first");

    setSubmittingId(id);

    try {
      const { error } = await supabase
        .from("student_assignments")
        .update({
          submission_text: text,
          status: "submitted",
          submitted_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Homework sent!");

      // Optimistic UI Update
      setAssignments(prev => prev.map(a =>
        a.id === id
          ? { ...a, status: 'submitted', submission_text: text, submitted_at: new Date().toISOString() }
          : a
      ));

      setSubmissions(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

      fetchAssignments();
    } catch (err) {
      toast.error(`Submit failed: ${err.message}`);
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4">
      {assignments.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
          <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <CheckCircle className="text-slate-200" size={32} />
          </div>
          <p className="text-slate-400 font-bold">All caught up! No pending homework.</p>
        </div>
      ) : (
        assignments.map((a) => {
          const isSubmitting = submittingId === a.id;
          const isCompleted = a.status === 'completed';

          return (
            <div
              key={a.id}
              className={`group bg-white border-2 rounded-[32px] p-6 transition-all duration-300 ${a.status === 'pending'
                ? 'border-slate-100 hover:border-indigo-100'
                : isCompleted ? 'border-emerald-100 bg-emerald-50/10' : 'border-transparent bg-slate-50/50'
                }`}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-xl text-slate-900 tracking-tight">{a.task_name}</h3>
                    {a.status !== 'pending' && (
                      <CheckCircle size={18} className={isCompleted ? "text-emerald-500" : "text-blue-500"} />
                    )}
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">{a.description}</p>
                </div>

                <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm ${a.status === 'pending' ? 'bg-white text-amber-600 border border-amber-100' :
                  a.status === 'submitted' ? 'bg-blue-600 text-white' :
                    'bg-emerald-600 text-white'
                  }`}>
                  {a.status === 'pending' ? <Clock size={12} className="animate-pulse" /> : <CheckCircle size={12} />}
                  {a.status}
                </span>
              </div>

              {/* Interaction Area */}
              {a.status === "pending" ? (
                <div className="space-y-3 mt-4">
                  <textarea
                    disabled={isSubmitting}
                    className="w-full border-none bg-slate-50 p-5 rounded-[24px] focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium text-slate-700 text-sm placeholder:text-slate-300 disabled:opacity-50"
                    placeholder="Write your answer or link your work here..."
                    rows={4}
                    value={submissions[a.id] || ""}
                    onChange={(e) => setSubmissions({ ...submissions, [a.id]: e.target.value })}
                  />

                  <button
                    disabled={isSubmitting || !submissions[a.id]}
                    onClick={() => submitAssignment(a.id)} // FIXED: used a.id instead of id
                    className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg ${isSubmitting ? 'bg-blue-600 text-white cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-100 disabled:text-slate-300'
                      }`}
                  >
                    {isSubmitting ? <><Loader2 className="animate-spin" size={18} /> Syncing...</> : <><Send size={16} /> Submit Homework</>}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Student's Submission */}
                  <div className="mt-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Your Work</p>
                    <p className="text-sm text-slate-700 font-medium whitespace-pre-wrap italic border-l-2 border-slate-100 pl-4">
                      "{a.submission_text}"
                    </p>
                  </div>

                  {/* Tutor's Feedback */}
                  {isCompleted && (a.tutor_feedback || a.grade) && (
                    <div className="p-5 bg-emerald-600 text-white rounded-2xl shadow-lg animate-in zoom-in duration-300">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare size={16} />
                        <p className="text-[10px] font-black uppercase tracking-widest">Tutor Feedback</p>
                      </div>
                      <p className="text-sm font-bold leading-relaxed mb-3">
                        {a.tutor_feedback || "Great job! Your work has been reviewed."}
                      </p>

                      {/* Star Rating Display */}
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={14}
                              className={parseInt(a.grade) >= s ? "fill-white text-white" : "text-emerald-400"}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-tight">Grade: {a.grade}</span>
                      </div>
                    </div>
                  )}

                  {!isCompleted && (
                    <div className="mt-2 pt-3 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400">Status: Waiting for Review</span>
                      <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
// import React, { useState, useEffect } from "react";
// import toast from "react-hot-toast";
// import { supabase } from "../supabase";
// import { Loader2, CheckCircle, Clock, Send, MessageSquare, Star } from "lucide-react";

// export default function MyHomework({ studentId }) {
//   const [assignments, setAssignments] = useState([]);
//   const [submissions, setSubmissions] = useState({});
//   const [submittingId, setSubmittingId] = useState(null);

//   useEffect(() => {
//     if (studentId) fetchAssignments();
//   }, [studentId]);

//   async function fetchAssignments() {
//     const { data, error } = await supabase
//       .from("student_assignments")
//       .select("*")
//       .eq("student_id", studentId)
//       .order("created_at", { ascending: false });

//     if (error) console.error("Fetch error:", error);
//     setAssignments(data || []);
//   }

//   async function submitAssignment(id) {
//     const text = submissions[id];
//     if (!text) return toast.error("Please write your response first");

//     setSubmittingId(id);

//     try {
//       const { error } = await supabase
//         .from("student_assignments")
//         .update({
//           submission_text: text,
//           status: "submitted",
//           submitted_at: new Date().toISOString(),
//         })
//         .eq("id", id);

//       if (error) throw error;

//       toast.success("Homework sent!");

//       // Optimistic UI Update
//       setAssignments(prev => prev.map(a =>
//         a.id === id
//           ? { ...a, status: 'submitted', submission_text: text, submitted_at: new Date().toISOString() }
//           : a
//       ));

//       setSubmissions(prev => {
//         const next = { ...prev };
//         delete next[id];
//         return next;
//       });

//       fetchAssignments();
//     } catch (err) {
//       toast.error(`Submit failed: ${err.message}`);
//     } finally {
//       setSubmittingId(null);
//     }
//   }

//   return (
//     <div className="space-y-6 max-w-2xl mx-auto p-4">
//       {assignments.length === 0 ? (
//         <div className="text-center py-16 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
//           <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
//             <CheckCircle className="text-slate-200" size={32} />
//           </div>
//           <p className="text-slate-400 font-bold">All caught up! No pending homework.</p>
//         </div>
//       ) : (
//         assignments.map((a) => {
//           const isSubmitting = submittingId === a.id;
//           const isCompleted = a.status === 'completed';

//           return (
//             <div
//               key={a.id}
//               className={`group bg-white border-2 rounded-[32px] p-6 transition-all duration-300 ${a.status === 'pending'
//                 ? 'border-slate-100 hover:border-indigo-100'
//                 : isCompleted ? 'border-emerald-100 bg-emerald-50/10' : 'border-transparent bg-slate-50/50'
//                 }`}
//             >
//               {/* Header */}
//               <div className="flex justify-between items-start mb-4">
//                 <div className="space-y-1">
//                   <div className="flex items-center gap-2">
//                     <h3 className="font-black text-xl text-slate-900 tracking-tight">{a.task_name}</h3>
//                     {a.status !== 'pending' && <CheckCircle size={18} className={isCompleted ? "text-emerald-500" : "text-blue-500"} />}
//                   </div>
//                   <p className="text-slate-500 text-sm leading-relaxed">{a.description}</p>
//                 </div>

//                 <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm ${a.status === 'pending' ? 'bg-white text-amber-600 border border-amber-100' :
//                   a.status === 'submitted' ? 'bg-blue-600 text-white' :
//                     'bg-emerald-600 text-white'
//                   }`}>
//                   {a.status === 'pending' ? <Clock size={12} className="animate-pulse" /> : <CheckCircle size={12} />}
//                   {a.status}
//                 </span>
//               </div>

//               {/* Interaction Area */}
//               {a.status === "pending" ? (
//                 <div className="space-y-3 mt-4">
//                   <textarea
//                     disabled={isSubmitting}
//                     className="w-full border-none bg-slate-50 p-5 rounded-[24px] focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium text-slate-700 text-sm placeholder:text-slate-300 disabled:opacity-50"
//                     placeholder="Write your answer or link your work here..."
//                     rows={4}
//                     value={submissions[a.id] || ""}
//                     onChange={(e) => setSubmissions({ ...submissions, [a.id]: e.target.value })}
//                   />

//                   <button
//                     disabled={isSubmitting || !submissions[a.id]}
//                     onClick={() => submitAssignment(id)}
//                     className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg ${isSubmitting ? 'bg-blue-600 text-white cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-100 disabled:text-slate-300'
//                       }`}
//                   >
//                     {isSubmitting ? <><Loader2 className="animate-spin" size={18} /> Syncing...</> : <><Send size={16} /> Submit Homework</>}
//                   </button>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {/* Student's Submission */}
//                   <div className="mt-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
//                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Your Work</p>
//                     <p className="text-sm text-slate-700 font-medium whitespace-pre-wrap italic border-l-2 border-slate-100 pl-4">
//                       "{a.submission_text}"
//                     </p>
//                   </div>

//                   {/* Tutor's Feedback (Shows only when completed/reviewed) */}
//                   {isCompleted && (a.tutor_feedback || a.grade) && (
//                     <div className="p-5 bg-emerald-600 text-white rounded-2xl shadow-lg animate-in zoom-in duration-300">
//                       <div className="flex items-center gap-2 mb-2">
//                         <MessageSquare size={16} />
//                         <p className="text-[10px] font-black uppercase tracking-widest">Tutor Feedback</p>
//                       </div>
//                       <p className="text-sm font-bold leading-relaxed mb-3">
//                         {a.tutor_feedback || "Great job! Your work has been reviewed."}
//                       </p>
//                       {a.grade && (
//                         <div className="inline-flex items-center gap-1.5 bg-emerald-500 px-3 py-1 rounded-full border border-emerald-400/50">
//                           <Star size={12} className="fill-white" />
//                           <span className="text-[10px] font-black uppercase tracking-tight">Grade: {a.grade}</span>
//                         </div>
//                       )}
//                     </div>
//                   )}

//                   {!isCompleted && (
//                     <div className="mt-2 pt-3 border-t border-slate-50 flex items-center justify-between">
//                       <span className="text-[10px] font-bold text-slate-400">Status: Waiting for Review</span>
//                       <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           );
//         })
//       )}
//     </div>
//   );
// }
// import React, { useState, useEffect } from "react";
// import toast from "react-hot-toast";
// import { supabase } from "../supabase";
// import { Loader2, CheckCircle, Clock, Send, ArrowRight } from "lucide-react";

// export default function MyHomework({ studentId }) {
//   const [assignments, setAssignments] = useState([]);
//   const [submissions, setSubmissions] = useState({});
//   const [submittingId, setSubmittingId] = useState(null); // Track specific assignment being sent

//   useEffect(() => {
//     if (studentId) fetchAssignments();
//   }, [studentId]);

//   async function fetchAssignments() {
//     const { data, error } = await supabase
//       .from("student_assignments")
//       .select("*")
//       .eq("student_id", studentId)
//       .order("created_at", { ascending: false });

//     if (error) console.error("Fetch error:", error);
//     setAssignments(data || []);
//   }

//   async function submitAssignment(id) {
//     const text = submissions[id];
//     if (!text) return toast.error("Please write your response first");

//     setSubmittingId(id); // Start loading for this specific card

//     try {
//       const { error } = await supabase
//         .from("student_assignments")
//         .update({
//           submission_text: text,
//           status: "submitted",
//           submitted_at: new Date().toISOString(),
//         })
//         .eq("id", id);

//       if (error) throw error;

//       toast.success("Homework sent!");

//       // Local state cleanup
//       setSubmissions(prev => {
//         const next = { ...prev };
//         delete next[id];
//         return next;
//       });

//       // Brief delay so the user sees the "Success" state before the list re-orders
//       setTimeout(() => {
//         fetchAssignments();
//         setSubmittingId(null);
//       }, 800);

//     } catch (err) {
//       toast.error(`Submit failed: ${err.message}`);
//       setSubmittingId(null);
//     }
//   }

//   return (
//     <div className="space-y-6 max-w-2xl mx-auto p-4">
//       {assignments.length === 0 ? (
//         <div className="text-center py-16 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
//           <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
//             <CheckCircle className="text-slate-200" size={32} />
//           </div>
//           <p className="text-slate-400 font-bold">All caught up! No pending homework.</p>
//         </div>
//       ) : (
//         assignments.map((a) => {
//           const isSubmitting = submittingId === a.id;

//           return (
//             <div key={a.id} className={`group bg-white border-2 rounded-[32px] p-6 transition-all duration-300 ${a.status === 'pending' ? 'border-slate-100 hover:border-indigo-100' : 'border-transparent bg-slate-50/50'
//               }`}>

//               {/* Header with Status Badge */}
//               <div className="flex justify-between items-start mb-4">
//                 <div className="space-y-1">
//                   <div className="flex items-center gap-2">
//                     <h3 className="font-black text-xl text-slate-900 tracking-tight">{a.task_name}</h3>
//                     {a.status === 'submitted' && <CheckCircle size={18} className="text-blue-500 animate-in zoom-in" />}
//                   </div>
//                   <p className="text-slate-500 text-sm leading-relaxed">{a.description}</p>
//                 </div>

//                 <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm ${a.status === 'pending' ? 'bg-white text-amber-600 border border-amber-100' :
//                   a.status === 'submitted' ? 'bg-blue-600 text-white' :
//                     'bg-emerald-500 text-white'
//                   }`}>
//                   {a.status === 'pending' ? <Clock size={12} className="animate-pulse" /> : <CheckCircle size={12} />}
//                   {a.status}
//                 </span>
//               </div>

//               {/* Interaction Area */}
//               {a.status === "pending" ? (
//                 <div className="space-y-3 mt-4">
//                   <textarea
//                     disabled={isSubmitting}
//                     className="w-full border-none bg-slate-50 p-5 rounded-[24px] focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium text-slate-700 text-sm placeholder:text-slate-300"
//                     placeholder="Write your answer or link your work here..."
//                     rows={4}
//                     value={submissions[a.id] || ""}
//                     onChange={(e) => setSubmissions({ ...submissions, [a.id]: e.target.value })}
//                   />

//                   <button
//                     disabled={isSubmitting || !submissions[a.id]}
//                     onClick={() => submitAssignment(a.id)}
//                     className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg ${isSubmitting
//                       ? 'bg-blue-600 text-white cursor-wait'
//                       : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none'
//                       }`}
//                   >
//                     {isSubmitting ? (
//                       <><Loader2 className="animate-spin" size={18} /> Syncing Work...</>
//                     ) : (
//                       <><Send size={16} /> Submit Homework</>
//                     )}
//                   </button>
//                 </div>
//               ) : (
//                 /* Post-Submission View */
//                 <div className="mt-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
//                   <div className="flex items-center justify-between mb-3">
//                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Work</p>
//                     {a.submitted_at && (
//                       <p className="text-[9px] font-bold text-slate-300 flex items-center gap-1">
//                         <Clock size={10} /> {new Date(a.submitted_at).toLocaleDateString()}
//                       </p>
//                     )}
//                   </div>
//                   <p className="text-sm text-slate-700 font-medium whitespace-pre-wrap italic">"{a.submission_text}"</p>

//                   <div className="mt-4 pt-4 border-t border-slate-50 flex items-center text-blue-600 gap-2">
//                     <CheckCircle size={14} />
//                     <span className="text-[10px] font-bold uppercase tracking-tight">Assignment successfully recorded</span>
//                   </div>
//                 </div>
//               )}
//             </div>
//           );
//         })
//       )}
//     </div>
//   );
// }
// import React, { useState, useEffect } from "react";
// import toast from "react-hot-toast";
// import { supabase } from "../supabase";

// export default function MyHomework({ studentId }) {
//   const [assignments, setAssignments] = useState([]);
//   const [submissions, setSubmissions] = useState({});

//   useEffect(() => {
//     fetchAssignments();
//   }, [studentId]);

//   async function fetchAssignments() {
//     const { data } = await supabase
//       .from("student_assignments")
//       .select("*")
//       .eq("student_id", studentId) // Ensure this matches the ID in your users table
//       .order("created_at", { ascending: false });
//     setAssignments(data || []);
//   }

//   async function submitAssignment(id) {
//     const text = submissions[id];
//     if (!text) return toast.error("Please write your response first");

//     const { error } = await supabase
//       .from("student_assignments")
//       .update({
//         submission_text: text,
//         status: "submitted",
//         submitted_at: new Date(),
//       })
//       .eq("id", id);

//     if (!error) {
//       toast.success("Homework submitted successfully!");
//       fetchAssignments();
//     }
//   }

//   return (
//     <div className="space-y-4 max-w-2xl mx-auto">
//       {assignments.length === 0 ? (
//         <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed">
//           <p className="text-slate-400">No homework assigned yet. Keep up the good work!</p>
//         </div>
//       ) : (
//         assignments.map((a) => (
//           <div key={a.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
//             <div className="flex justify-between items-start mb-2">
//               <h3 className="font-bold text-lg text-slate-800">{a.task_name}</h3>
//               <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${a.status === 'pending' ? 'bg-amber-100 text-amber-700' :
//                 a.status === 'submitted' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
//                 }`}>
//                 {a.status}
//               </span>
//             </div>
//             <p className="text-slate-600 text-sm mb-4">{a.description}</p>

//             {a.status === "pending" && (
//               <div className="space-y-3">
//                 <textarea
//                   className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
//                   placeholder="Type your answer or paste a link here..."
//                   rows={4}
//                   value={submissions[a.id] || ""}
//                   onChange={(e) => setSubmissions({ ...submissions, [a.id]: e.target.value })}
//                 />
//                 <button
//                   onClick={() => submitAssignment(a.id)}
//                   className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl transition"
//                 >
//                   Submit Assignment
//                 </button>
//               </div>
//             )}

//             {a.status !== "pending" && a.submission_text && (
//               <div className="mt-3 p-3 bg-slate-50 rounded-lg">
//                 <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Your Submission:</p>
//                 <p className="text-sm text-slate-700">{a.submission_text}</p>
//               </div>
//             )}
//           </div>
//         ))
//       )}
//     </div>
//   );
// }
// // import { useEffect, useState } from "react";
// // import { supabase } from "../supabase";

// // export default function MyHomework({ studentId }) {
// //   const [assignments, setAssignments] = useState([]);
// //   const [submissions, setSubmissions] = useState({});

// //   useEffect(() => {
// //     fetchAssignments();
// //   }, []);

// //   async function fetchAssignments() {
// //     const { data } = await supabase
// //       .from("student_assignments")
// //       .select("*")
// //       .eq("student_id", studentId)
// //       .order("created_at", { ascending: false });

// //     setAssignments(data || []); // always an array
// //   }

// //   async function submitAssignment(id) {
// //     const text = submissions[id];

// //     if (!text) return alert("Write your answer first");

// //     const { error } = await supabase
// //       .from("student_assignments")
// //       .update({
// //         submission_text: text,
// //         status: "submitted",
// //         submitted_at: new Date(),
// //       })
// //       .eq("id", id);

// //     if (!error) {
// //       alert("Homework submitted!");
// //       fetchAssignments();
// //     }
// //   }

// //   if (assignments.length === 0) {
// //     return (
// //       <p className="text-center text-slate-400 italic mt-4">
// //         No assignments yet.
// //       </p>
// //     );
// //   }

// //   return (
// //     <div className="space-y-4">
// //       {assignments.map((a) => (
// //         <div key={a.id} className="border p-4 rounded-xl">
// //           <h3 className="font-bold">{a.task_name}</h3>
// //           <p className="text-sm text-gray-600">{a.description}</p>

// //           <p className="text-xs mt-2 font-bold">Status: {a.status}</p>

// //           {a.status === "pending" && (
// //             <>
// //               <textarea
// //                 className="w-full border p-2 mt-2 rounded"
// //                 placeholder="Write your answer..."
// //                 value={submissions[a.id] || ""}
// //                 onChange={(e) =>
// //                   setSubmissions({ ...submissions, [a.id]: e.target.value })
// //                 }
// //               />

// //               <button
// //                 onClick={() => submitAssignment(a.id)}
// //                 className="mt-2 bg-blue-600 text-white px-3 py-2 rounded"
// //               >
// //                 Submit Homework
// //               </button>
// //             </>
// //           )}

// //           {a.status === "submitted" && (
// //             <p className="text-amber-600 text-sm mt-2">
// //               Submitted. Waiting for tutor review.
// //             </p>
// //           )}

// //           {a.status === "completed" && (
// //             <p className="text-green-600 text-sm mt-2">Reviewed by tutor</p>
// //           )}
// //         </div>
// //       ))}
// //     </div>
// //   );
// // }
