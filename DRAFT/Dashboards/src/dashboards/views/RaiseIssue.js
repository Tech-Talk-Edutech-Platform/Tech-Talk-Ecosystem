import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabase";
import { Send, Clock, CheckCircle, ChevronLeft, Edit3, Save } from "lucide-react";

export default function RaiseIssue({ user, fetchAll, isLocked }) {
  if (isLocked) {
    return (
      <div className="p-4 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold border border-amber-200">
        Ticket is {status}. Please wait for a resolution before opening a new one.
      </div>
    );
  }
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("normal");
  const [history, setHistory] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from("issues")
      .select("id, title, description, status, created_at, priority")
      .eq("reported_by", user.id)
      .order("created_at", { ascending: false });
    if (data) setHistory(data);
  }, [user?.id]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // const handleUpdate = async () => {
  //   const { error } = await supabase
  //     .from("issues")
  //     .update({ title: selectedTicket.title, description: selectedTicket.description })
  //     .eq("id", selectedTicket.id);
  //   if (error) alert(error.message);
  //   else { setIsEditing(false); fetchHistory(); }
  // };
  const handleUpdate = async () => {
    // 1. Check if the specific ticket is already resolved or in progress
    if (selectedTicket.status !== 'open') {
      alert("You cannot edit a ticket that is already in progress or resolved.");
      setIsEditing(false); // Close edit mode
      return;
    }

    const { error } = await supabase
      .from("issues")
      .update({ title: selectedTicket.title, description: selectedTicket.description })
      .eq("id", selectedTicket.id);

    if (error) {
      alert(error.message);
    } else {
      setIsEditing(false);
      fetchHistory();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await supabase.from("issues").insert([{ title, description, priority, reported_by: user.id }]);
    if (error) alert(error.message);
    else { setTitle(""); setDescription(""); setPriority("normal"); fetchHistory(); if (fetchAll) fetchAll(); }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {selectedTicket ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          <button onClick={() => { setSelectedTicket(null); setIsEditing(false); }} className="text-[10px] flex items-center gap-1 font-bold text-slate-400 hover:text-blue-600">
            <ChevronLeft size={12} /> BACK
          </button>
          
          {/* Detail/Edit View */}
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              {isEditing ? (
                <input className="font-bold text-sm border-b w-full" value={selectedTicket.title} onChange={(e) => setSelectedTicket({...selectedTicket, title: e.target.value})} />
              ) : (
                <h3 className="font-black text-slate-800 text-sm text-left">{selectedTicket.title}</h3>
              )}
          {selectedTicket.status === 'open' && (
  <button 
    onClick={() => isEditing ? handleUpdate() : setIsEditing(true)} 
    className="text-blue-600"
  >
    {isEditing ? <Save size={16} /> : <Edit3 size={16} />}
  </button>
)}
            </div>
            
            {isEditing ? (
              <textarea className="w-full text-xs text-slate-500 border rounded p-2" value={selectedTicket.description} onChange={(e) => setSelectedTicket({...selectedTicket, description: e.target.value})} />
            ) : (
              <p className="text-xs text-slate-500 text-left">{selectedTicket.description}</p>
            )}
          </div>
        </div>
      ) : (
        /* Form View */
        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="w-full p-2.5 bg-slate-50 border-none rounded-xl text-sm" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <textarea className="w-full p-2.5 bg-slate-50 border-none rounded-xl text-sm min-h-[80px]" placeholder="Description..." value={description} onChange={(e) => setDescription(e.target.value)} />
          <button disabled={isLocked} className="w-full bg-red-500 text-white p-2.5 rounded-xl font-bold text-sm">Send Ticket</button>
        </form>
      )}

      {!selectedTicket && (
        <div className="border-t border-slate-100 pt-4">
          <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3 text-left">Recent Tickets</h4>
          <div className="space-y-2">
            {(showAll ? history : history.slice(0, 3)).map((h) => (
              <button key={h.id} onClick={() => setSelectedTicket(h)} className="w-full flex justify-between items-center p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border text-left">
                <span className="font-semibold text-xs text-slate-700 truncate w-3/4">{h.title}</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${h.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{h.status}</span>
              </button>
            ))}
            {history.length > 3 && (
              <button onClick={() => setShowAll(!showAll)} className="w-full text-[10px] font-bold text-blue-600 py-2 text-left uppercase">{showAll ? "Show Less" : "View More"}</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
// import React, { useState, useEffect, useCallback } from "react";
// import { supabase } from "../../supabase";
// import { Send, Clock, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";

// export default function RaiseIssue({ user, fetchAll }) {
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [priority, setPriority] = useState("normal");
//   const [history, setHistory] = useState([]);
//   const [isSubmitting, setIsSubmitting] = useState(false);
  
//   // New States for Interaction
//   const [selectedTicket, setSelectedTicket] = useState(null);
//   const [showAll, setShowAll] = useState(false);

//   const fetchHistory = useCallback(async () => {
//     if (!user?.id) return;
//     const { data } = await supabase
//       .from("issues")
//       .select("id, title, description, status, created_at, priority")
//       .eq("reported_by", user.id)
//       .order("created_at", { ascending: false });
//     if (data) setHistory(data);
//   }, [user?.id]);

//   useEffect(() => { fetchHistory(); }, [fetchHistory]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     const { error } = await supabase.from("issues").insert([{ title, description, priority, reported_by: user.id }]);
//     if (error) alert(error.message);
//     else { setTitle(""); setDescription(""); setPriority("normal"); fetchHistory(); if (fetchAll) fetchAll(); }
//     setIsSubmitting(false);
//   };

//   // Logic to show only 3 or all
//   const displayedHistory = showAll ? history : history.slice(0, 3);

//   return (
//     <div className="space-y-6">
//       {/* Detail View Overlay */}
//       {selectedTicket ? (
//         <div className="space-y-4 animate-in fade-in zoom-in duration-200">
//           <button onClick={() => setSelectedTicket(null)} className="text-[10px] flex items-center gap-1 font-bold text-blue-600 hover:underline">
//             <ChevronLeft size={12} /> BACK TO LIST
//           </button>
//           <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
//             <h3 className="font-bold text-slate-800 text-sm">{selectedTicket.title}</h3>
//             <p className="text-xs text-slate-500 mt-2 leading-relaxed">{selectedTicket.description || "No description provided."}</p>
//             <div className="flex gap-2 mt-4">
//               <span className="text-[9px] px-2 py-1 rounded bg-slate-200 uppercase font-bold">{selectedTicket.priority}</span>
//               <span className="text-[9px] px-2 py-1 rounded bg-amber-100 text-amber-700 uppercase font-bold">{selectedTicket.status}</span>
//             </div>
//           </div>
//         </div>
//       ) : (
//         /* Form View */
//         <form onSubmit={handleSubmit} className="space-y-3">
//           <input className="w-full p-2.5 bg-slate-50 border-none rounded-xl text-sm placeholder:text-slate-400" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
//           <textarea className="w-full p-2.5 bg-slate-50 border-none rounded-xl text-sm placeholder:text-slate-400 min-h-[80px]" placeholder="Description..." value={description} onChange={(e) => setDescription(e.target.value)} />
//           <select className="w-full p-2.5 bg-slate-50 border-none rounded-xl text-sm text-slate-600" value={priority} onChange={(e) => setPriority(e.target.value)}>
//             <option value="low">Low</option>
//             <option value="normal">Normal</option>
//             <option value="high">High</option>
//           </select>
//           <button disabled={isSubmitting} className="w-full bg-red-500 text-white p-2.5 rounded-xl font-bold text-sm hover:bg-red-600 disabled:opacity-50">
//             {isSubmitting ? "Sending..." : "Send Ticket"}
//           </button>
//         </form>
//       )}

//       {/* History List */}
//       {!selectedTicket && (
//         <div className="border-t border-slate-100 pt-4">
//           <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-wider">Recent Tickets</h4>
//           <div className="space-y-2">
//             {displayedHistory.map((h) => (
//               <button key={h.id} onClick={() => setSelectedTicket(h)} className="w-full flex justify-between items-center p-2 rounded-lg bg-slate-50 hover:bg-blue-50 transition-colors border border-slate-100">
//                 <span className="font-semibold text-xs text-slate-700 truncate w-3/4">{h.title}</span>
//                 <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${h.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
//                   {h.status}
//                 </span>
//               </button>
//             ))}
//             {history.length > 3 && (
//               <button onClick={() => setShowAll(!showAll)} className="w-full text-[10px] font-bold text-blue-600 py-2 uppercase hover:underline">
//                 {showAll ? "Show Less" : `View ${history.length - 3} More`}
//               </button>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// // import React, { useState, useEffect, useCallback } from "react";
// // import { supabase } from "../../supabase";
// // import { Send, Clock, CheckCircle } from "lucide-react";

// // export default function RaiseIssue({ user, fetchAll }) {
// //   const [title, setTitle] = useState("");
// //   const [description, setDescription] = useState("");
// //   const [priority, setPriority] = useState("normal");
// //   const [history, setHistory] = useState([]);
// //   const [isSubmitting, setIsSubmitting] = useState(false);

// //   // Memoized fetch function so it can be called from multiple places
// //   const fetchHistory = useCallback(async () => {
// //     if (!user?.id) return;
// //     const { data } = await supabase
// //       .from("issues")
// //       .select("title, status, created_at")
// //       .eq("reported_by", user.id)
// //       .order("created_at", { ascending: false });
// //     if (data) setHistory(data);
// //   }, [user?.id]);

// //   useEffect(() => {
// //     fetchHistory();
// //   }, [fetchHistory]);

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setIsSubmitting(true);
    
// //     const { error } = await supabase.from("issues").insert([{ 
// //       title, 
// //       description, 
// //       priority, 
// //       reported_by: user.id 
// //     }]);

// //     if (error) {
// //       alert("Error: " + error.message);
// //     } else {
// //       setTitle("");
// //       setDescription("");
// //       setPriority("normal");
// //       fetchHistory(); // Refresh the list
// //       if (fetchAll) fetchAll(); // Refresh parent stats if needed
// //     }
// //     setIsSubmitting(false);
// //   };

// //   return (
// //     <div className="space-y-6">
// //       <form onSubmit={handleSubmit} className="space-y-3">
// //         <input 
// //           className="w-full p-2.5 bg-slate-50 border-none rounded-xl text-sm placeholder:text-slate-400" 
// //           placeholder="Issue Title" 
// //           value={title} 
// //           onChange={(e) => setTitle(e.target.value)} 
// //           required 
// //         />
// //         <textarea 
// //           className="w-full p-2.5 bg-slate-50 border-none rounded-xl text-sm placeholder:text-slate-400 min-h-[80px]" 
// //           placeholder="Detailed description..." 
// //           value={description} 
// //           onChange={(e) => setDescription(e.target.value)} 
// //         />
// //         <select 
// //           className="w-full p-2.5 bg-slate-50 border-none rounded-xl text-sm text-slate-600" 
// //           value={priority} 
// //           onChange={(e) => setPriority(e.target.value)}
// //         >
// //           <option value="low">Low Priority</option>
// //           <option value="normal">Normal Priority</option>
// //           <option value="high">High Priority</option>
// //         </select>
        
// //         <button 
// //           disabled={isSubmitting}
// //           className="w-full bg-red-500 text-white p-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50"
// //         >
// //           {isSubmitting ? "Sending..." : <><Send size={14} /> Send Ticket</>}
// //         </button>
// //       </form>

// //       {/* Scrollable Ticket History Section */}
// //       <div className="border-t border-slate-100 pt-4">
// //         <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-wider">Recent Tickets</h4>
// //         <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
// //           {history.length > 0 ? (
// //             history.map((h, i) => (
// //               <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
// //                 <span className="font-semibold text-xs text-slate-700 truncate w-3/4">{h.title}</span>
// //                 <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${h.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
// //                   {h.status === 'open' ? <Clock size={9} className="inline mr-1"/> : <CheckCircle size={9} className="inline mr-1"/>}
// //                   {h.status}
// //                 </span>
// //               </div>
// //             ))
// //           ) : (
// //             <p className="text-[10px] text-slate-400 italic">No tickets yet.</p>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
// // import React, { useState, useEffect } from "react";
// // import { supabase } from "../../supabase";

// // export default function RaiseIssue({ user, fetchAll }) {
// //   const [title, setTitle] = useState("");
// //   const [description, setDescription] = useState("");
// //   const [priority, setPriority] = useState("normal");
// //   const [history, setHistory] = useState([]);

// //   // Fetch history on load
// //   useEffect(() => {
// //     const fetchHistory = async () => {
// //       const { data } = await supabase
// //         .from("issues")
// //         .select("title, status, created_at")
// //         .eq("reported_by", user.id)
// //         .order("created_at", { ascending: false });
// //       if (data) setHistory(data);
// //     };
// //     fetchHistory();
// //   }, [user.id]);

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     const { error } = await supabase.from("issues").insert([{ title, description, priority, reported_by: user.id }]);
// //     if (error) return alert(error.message);
    
// //     // Reset and refresh
// //     setTitle(""); setDescription("");
// //     // Re-fetch history
// //     // (Logic to refresh history here)
// //     alert("Ticket sent!");
// //   };

// //   return (
// //     <div className="space-y-6">
// //       <form onSubmit={handleSubmit} className="space-y-3">
// //         <input className="w-full p-2 border rounded-lg text-sm" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
// //         <textarea className="w-full p-2 border rounded-lg text-sm" placeholder="Description..." value={description} onChange={(e) => setDescription(e.target.value)} />
// //         <select className="w-full p-2 border rounded-lg text-sm" value={priority} onChange={(e) => setPriority(e.target.value)}>
// //           <option value="low">Low</option>
// //           <option value="normal">Normal</option>
// //           <option value="high">High</option>
// //         </select>
// //         <button className="w-full bg-red-500 text-white p-2 rounded-lg font-bold text-sm">Submit Ticket</button>
// //       </form>

// //       {/* Ticket History Section */}
// //       <div className="border-t pt-4">
// //         <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2">My Recent Tickets</h4>
// //         <div className="space-y-2">
// //           {history.map((h, i) => (
// //             <div key={i} className="flex justify-between items-center text-xs">
// //               <span className="font-semibold text-slate-700 truncate">{h.title}</span>
// //               <span className={`px-2 py-0.5 rounded-full text-[9px] ${h.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
// //                 {h.status}
// //               </span>
// //             </div>
// //           ))}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
// // import React, { useState } from "react";
// // import { supabase } from "../../supabase";

// // export default function RaiseIssue({ user, fetchAll }) {
// //   const [title, setTitle] = useState("");
// //   const [description, setDescription] = useState("");
// //   const [priority, setPriority] = useState("normal"); // Default value

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     const { error } = await supabase.from("issues").insert([
// //       { 
// //         title, 
// //         description, 
// //         priority, // This comes from the dropdown
// //         reported_by: user.id 
// //       }
// //     ]);

// //     if (error) {
// //       alert("Error: " + error.message);
// //     } else {
// //       setTitle("");
// //       setDescription("");
// //       setPriority("normal");
// //       alert("Ticket submitted!");
// //       if (fetchAll) fetchAll();
// //     }
// //   };

// //   return (
// //     <form onSubmit={handleSubmit} className="space-y-3">
// //       <input 
// //         className="w-full p-2 border rounded-lg text-sm" 
// //         placeholder="Issue Title" 
// //         value={title} 
// //         onChange={(e) => setTitle(e.target.value)} 
// //         required 
// //       />
// //       <textarea 
// //         className="w-full p-2 border rounded-lg text-sm" 
// //         placeholder="Describe the problem..." 
// //         value={description} 
// //         onChange={(e) => setDescription(e.target.value)} 
// //       />
      
// //       {/* PRIORITY DROPDOWN */}
// //       <select 
// //         className="w-full p-2 border rounded-lg text-sm bg-white" 
// //         value={priority} 
// //         onChange={(e) => setPriority(e.target.value)}
// //       >
// //         <option value="low">Low Priority</option>
// //         <option value="normal">Normal Priority</option>
// //         <option value="high">High Priority</option>
// //         <option value="critical">Critical</option>
// //       </select>

// //       <button className="w-full bg-red-500 text-white p-2 rounded-lg font-bold text-sm hover:bg-red-600">
// //         Submit Ticket
// //       </button>
// //     </form>
// //   );
// // }
// // // // RaiseIssue.jsx
// // // import { useState } from "react";
// // // import { toast } from "react-hot-toast";
// // // import { supabase } from "../../supabase"; // adjust path as needed

// // // export default function RaiseIssue({ user, fetchAll }) {
// // //   const [newIssue, setNewIssue] = useState("");

// // //   // Safely check role; default to empty string if undefined
// // //   const role = user?.role || "";

// // //   // Only show if user is a tutor
// // //   if (role !== "tutor") return null;

// // //   const handleSubmit = async () => {
// // //     if (!newIssue) return;
// // //     const { error } = await supabase
// // //       .from("issues")
// // //       .insert({ title: newIssue, reported_by: user.id });

// // //     if (error) {
// // //       toast.error("Failed to report issue");
// // //       console.error(error);
// // //       return;
// // //     }

// // //     toast.success("Issue reported!");
// // //     setNewIssue("");
// // //     if (typeof fetchAll === "function") fetchAll(); // refresh issues
// // //   };

// // //   return (
// // //     <div className="mt-6 p-4 border rounded-2xl bg-slate-50">
// // //       <h4 className="font-bold mb-2">Report an Issue</h4>
// // //       <input
// // //         type="text"
// // //         placeholder="Issue title"
// // //         value={newIssue}
// // //         onChange={e => setNewIssue(e.target.value)}
// // //         className="w-full p-2 mb-2 rounded-lg border"
// // //       />
// // //       <button
// // //         onClick={handleSubmit}
// // //         className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
// // //       >
// // //         Submit
// // //       </button>
// // //     </div>
// // //   );
// // // }
