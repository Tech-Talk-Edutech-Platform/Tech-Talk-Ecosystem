import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import toast from "react-hot-toast";
import { X, Send, FilePlus, ChevronRight, Video, RotateCcw } from "lucide-react";

export default function QuickActions({ tutorId }) {
  const [modalType, setModalType] = useState(null); 
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Form States
  const [message, setMessage] = useState("");
  const [taskName, setTaskName] = useState("");
  const [category, setCategory] = useState("Scratch");
  const [taskUrl, setTaskUrl] = useState("");

  // Check if Nancy already clicked "Start" during this session
  useEffect(() => {
    const sessionActive = localStorage.getItem("class_in_progress");
    if (sessionActive === "true") setHasStarted(true);
  }, []);

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from("students")
      .select("id, full_name")
      .eq("assigned_tutor_id", tutorId);
    
    if (!error) setStudents(data);
  };

  const handleStartClass = async () => {
    if (!tutorId) return;

    setLoading(true);
    const now = new Date();
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60000).toISOString();
    
    // 1. Fetch the next/current class
    const { data, error } = await supabase
      .from("calendar_events")
      .select("meeting_link, title, start_time, end_time")
      .eq("tutor_id", tutorId)
      .lte("start_time", tenMinutesFromNow) // Class starts within next 10 mins OR has already started
      .gt("end_time", now.toISOString())    // Class has not ended yet
      .order("start_time", { ascending: true })
      .limit(1)
      .single();

    if (error || !data) {
      toast.error("No class scheduled within the next 10 minutes.");
      setLoading(false);
      return;
    }

    // 2. Time Validation: If it's too early (more than 10 mins before start)
    const startTime = new Date(data.start_time);
    const diffInMinutes = (startTime - now) / 60000;

    if (diffInMinutes > 10) {
      toast.error(`Too early! You can start this class in ${Math.round(diffInMinutes - 10)} minutes.`);
      setLoading(false);
      return;
    }

    // 3. Open Meet link and update UI
    if (data.meeting_link) {
      window.open(data.meeting_link, "_blank");
      localStorage.setItem("class_in_progress", "true");
      setHasStarted(true);
      toast.success(hasStarted ? "Rejoining class..." : `Starting: ${data.title}`);
    } else {
      toast.error("No meeting link found for this class.");
    }
    setLoading(false);
  };

  const handleOpenModal = (type) => {
    setModalType(type);
    fetchStudents();
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedStudent(null);
    setMessage("");
    setTaskName("");
    setTaskUrl("");
  };

  const handleAddAssignment = async () => {
    if (!selectedStudent || !taskName.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("student_assignments").insert([
      { tutor_id: tutorId, student_id: selectedStudent.id, task_name: taskName, category, task_url: taskUrl, status: "pending" }
    ]);
    if (error) toast.error("Failed to add assignment");
    else { toast.success(`Task assigned!`); closeModal(); }
    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!selectedStudent || !message.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("messages").insert([
      { sender_id: tutorId, receiver_id: selectedStudent.id, content: message, is_read: false }
    ]);
    if (error) toast.error("Message failed");
    else { toast.success("Message sent!"); closeModal(); }
    setLoading(false);
  };

  const actions = [
    { 
      label: hasStarted ? "Rejoin Class" : "Start Next Class", 
      color: "bg-blue-600 hover:bg-blue-700", 
      icon: hasStarted ? "🔄" : "🚀", 
      onClick: handleStartClass 
    },
    { label: "Add Assignment", color: "bg-indigo-600 hover:bg-indigo-700", icon: "📝", onClick: () => handleOpenModal('assignment') },
    { label: "Message Student", color: "bg-slate-800 hover:bg-slate-900", icon: "💬", onClick: () => handleOpenModal('message') }
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative">
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-bold text-slate-800 text-lg">Quick Actions</h3>
        {hasStarted && (
          <button 
            onClick={() => { localStorage.removeItem("class_in_progress"); setHasStarted(false); }}
            className="text-[10px] font-bold text-slate-400 hover:text-red-500 flex items-center gap-1 uppercase"
          >
            <RotateCcw size={12} /> Reset Status
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        {actions.map((btn) => (
          <button 
            key={btn.label}
            onClick={btn.onClick}
            disabled={loading && btn.label.includes("Class")}
            className={`w-full py-4 rounded-xl text-white font-bold text-sm shadow-md flex items-center justify-center gap-3 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 ${btn.color}`}
          >
            <span className="text-xl">{btn.icon}</span>
            {btn.label}
          </button>
        ))}
      </div>

      {/* --- UNIFIED MODAL --- */}
      {modalType && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-900">
                {modalType === 'message' ? 'Send Message' : 'Create Assignment'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {!selectedStudent ? (
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Choose a Student</p>
                {students.map(s => (
                  <button key={s.id} onClick={() => setSelectedStudent(s)} className="w-full text-left p-4 rounded-2xl border border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all font-bold flex justify-between items-center">
                    {s.full_name} <ChevronRight size={16} className="text-blue-500" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <button onClick={() => setSelectedStudent(null)} className="text-blue-600 text-xs font-bold mb-2 block">← Change Student</button>
                {modalType === 'message' ? (
                  <>
                    <textarea className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm h-32 resize-none" placeholder="Type your message..." value={message} onChange={(e) => setMessage(e.target.value)} />
                    <button disabled={loading || !message.trim()} onClick={handleSendMessage} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2">
                      <Send size={18} /> {loading ? "SENDING..." : "SEND MESSAGE"}
                    </button>
                  </>
                ) : (
                  <>
                    <input type="text" placeholder="Task Name" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" value={taskName} onChange={(e) => setTaskName(e.target.value)} />
                    <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="Scratch">Scratch</option>
                      <option value="Python">Python</option>
                      <option value="Web Dev">Web Dev</option>
                    </select>
                    <input type="url" placeholder="Resource URL (Optional)" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" value={taskUrl} onChange={(e) => setTaskUrl(e.target.value)} />
                    <button disabled={loading || !taskName.trim()} onClick={handleAddAssignment} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2">
                      <FilePlus size={18} /> {loading ? "CREATING..." : "ASSIGN TASK"}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}