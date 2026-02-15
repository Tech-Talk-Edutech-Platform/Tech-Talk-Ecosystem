import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Messages({ tutorId }) {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    if (!tutorId) return;

    const fetchMessages = async () => {
      // Fetching messages where Nancy is the receiver
      const { data, error } = await supabase
        .from("messages")
        .select(`
          id,
          content,
          created_at,
          is_read,
          sender:students ( full_name )
        `)
        .eq("receiver_id", tutorId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (!error && data) {
        const formatted = data.map(m => ({
          name: m.sender?.full_name || "Unknown Student",
          msg: m.content,
          time: m.is_read ? "Read" : "Unread",
          type: "View",
          statusColor: "bg-blue-600"
        }));
        setChats(formatted);
      }
    };

    fetchMessages();
  }, [tutorId]);

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