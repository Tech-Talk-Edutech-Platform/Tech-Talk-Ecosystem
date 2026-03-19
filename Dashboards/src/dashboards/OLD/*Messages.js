
export default function NewMessages() {
  const chats = [
    { name: "Brian Kamau", msg: "Ms. Nancy, I got stuck with loops...", time: "Unread", type: "View", statusColor: "bg-blue-600" },
    { name: "Amina Otieno", msg: "Does my Python homework look okay?", time: "1 hour ago", type: "Call", statusColor: "bg-emerald-500" },
    { name: "Lucy Mathenge", msg: "Thank you for today's class!", time: "Yesterday", type: "Email", statusColor: "bg-slate-500" }
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex justify-between mb-6">
        <h3 className="font-bold text-slate-800">Recent Messages</h3>
        <button className="text-blue-600 text-xs font-bold hover:underline">View All &gt;</button>
      </div>
      <div className="space-y-4">
        {chats.map((chat, i) => (
          <div key={i} className="flex items-center justify-between gap-4 p-2 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-center mb-0.5">
                <p className="text-sm font-bold text-slate-800 leading-none">{chat.name}</p>
                <span className={`text-[9px] font-bold text-white px-2 py-0.5 rounded-full ${chat.time === 'Unread' ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`}>
                  {chat.time}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-1">{chat.msg}</p>
            </div>
            <button className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-white shadow-sm active:scale-95 transition-all ${chat.statusColor}`}>
              {chat.type}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
// // import React from "react";
// // import { supabase } from "../supabase";
// // import toast from "react-hot-toast";

// // export default function QuickActions({ tutorId }) {
  
// //   const handleMessagePrompt = async () => {
// //     const studentId = window.prompt("Enter Student UUID (or select from list in real UI):");
// //     const message = window.prompt("Enter your message to the student:");

// //     if (studentId && message) {
// //       const { error } = await supabase.from("messages").insert([
// //         { 
// //           sender_id: tutorId, 
// //           receiver_id: studentId, 
// //           content: message,
// //           is_read: false 
// //         }
// //       ]);

// //       if (error) toast.error("Failed to send message");
// //       else toast.success("Message sent to student!");
// //     }
// //   };

// //   const actions = [
// //     { label: "Start Next Class", color: "bg-blue-600 hover:bg-blue-700", icon: "🚀", onClick: () => {} },
// //     { label: "Add Assignment", color: "bg-indigo-600 hover:bg-indigo-700", icon: "📝", onClick: () => {} },
// //     { label: "Message Student", color: "bg-slate-800 hover:bg-slate-900", icon: "💬", onClick: handleMessagePrompt }
// //   ];

// //   return (
// //     <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
// //       <h3 className="font-bold text-slate-800 mb-5">Quick Actions</h3>
// //       <div className="space-y-3">
// //         {actions.map((btn) => (
// //           <button 
// //             key={btn.label}
// //             onClick={btn.onClick}
// //             className={`w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-md flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:scale-95 ${btn.color}`}
// //           >
// //             <span className="text-lg">{btn.icon}</span>
// //             {btn.label}
// //           </button>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }