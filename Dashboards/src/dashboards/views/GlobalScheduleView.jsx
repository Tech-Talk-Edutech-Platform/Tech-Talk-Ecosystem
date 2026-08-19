import React, { useEffect, useState, useCallback, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { supabase } from "../../supabase";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import "../../../src/fullcalendar.css";

export default function GlobalScheduleView() {
  const navigate = useNavigate();
  const calendarRef = useRef(null);
  const [reassignEvent, setReassignEvent] = useState(null);
  const [selectedNewTutor, setSelectedNewTutor] = useState("");

  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [trialLeads, setTrialLeads] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTrial, setShowTrial] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const isAdminRole = (role) => ["owner", "tech_admin", "operations_admin"].includes(role);

  const getTutorColor = (id) => {
    const colors = ["#eab308", "#3b82f6", "#10b981", "#8b5cf6", "#ee692c", "#f472b6"];
    return id ? colors[id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length] : colors[0];
  };

  const fetchUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUser(user);
    const { data: profile } = await supabase
      .from("users")
      .select("id, role, full_name")
      .eq("id", user.id)
      .single();
    setUserRole(profile?.role);
  }, []);

  const fetchData = useCallback(async () => {
    if (!currentUser) return;

    const { data: tutorsData } = await supabase.from("users").select("id, full_name").in("role", ["tutor"]);
    setTutors(tutorsData || []);

    const { data: subscribedData } = await supabase.from("users").select("id, full_name, subscription_tier, personal_meet_link").eq("role", "student");
    setStudents(subscribedData || []);

    const { data: leadsData } = await supabase.from("leads").select("id, student_name, assigned_tutor_id, class_date, class_time, personal_meet_link");
    setTrialLeads(leadsData || []);

    const { data: calendarData } = await supabase.from("calendar_events").select(`
      id, start_time, end_time, tutor_id, meet_link, event_type, title, event_attendance(student_id)
    `);

    const mappedEvents = (calendarData || []).map((e) => {
      // Logic: Admins see everything. Tutors only see their own slots.
      if (userRole === "tutor" && e.tutor_id !== currentUser.id) return null;

      const isBooked = e.event_attendance && e.event_attendance.length > 0;
      const tutorName = tutorsData?.find(t => t.id === e.tutor_id)?.full_name || "Tutor";
      const tutorColor = getTutorColor(e.tutor_id);

      const mainEvent = {
        id: e.id,
        title: isBooked ? (e.title || "Booked Class") : `Free - ${tutorName}`,
        start: e.start_time,
        end: e.end_time,
        backgroundColor: isBooked ? tutorColor : "#f1f5f9",
        borderColor: tutorColor,
        textColor: isBooked ? "#fff" : "#334155",
        extendedProps: {
          tutorId: e.tutor_id,
          assigned: isBooked,
          type: e.event_type,
          meet_link: e.meet_link
        },
      };

      const breakEvent = {
        id: `break-${e.id}`,
        start: e.end_time,
        end: new Date(new Date(e.end_time).getTime() + 15 * 60 * 1000).toISOString(),
        display: "background",
        backgroundColor: "#f3f4f6",
        extendedProps: { isTempBreak: true },
      };

      return [mainEvent, breakEvent];
    }).flat().filter(Boolean);

    setEvents(mappedEvents);
  }, [currentUser, userRole]);

  useEffect(() => { fetchUser(); }, [fetchUser]);
  useEffect(() => { if (currentUser) fetchData(); }, [fetchData, currentUser]);

  const handleSelect = async (info) => {
    if (userRole !== "tutor") return;

    const start = info.startStr;
    const end = new Date(new Date(info.startStr).getTime() + 3600000).toISOString();

    const { error } = await supabase.from("calendar_events").insert({
      title: "Free Slot",
      start_time: start,
      end_time: end,
      tutor_id: currentUser.id
    });

    if (error) {
      toast.error("Failed to create slot");
    } else {
      toast.success("Slot created");
      fetchData();
    }
  };

  const handleAssign = async (studentId, tutorId, type) => {
    if (!tutorId) return;
    try {
      let studentMeetLink = "";

      if (type === "trial") {
        const lead = trialLeads.find(l => l.id === studentId);
        studentMeetLink = lead?.personal_meet_link;
        
        if (!studentMeetLink) {
          toast.error("Student/Trial lead has no personal meet link specified!");
          return;
        }

        const start = `${lead.class_date}T${lead.class_time}`;
        const { data: newEv } = await supabase.from("calendar_events").insert({
          tutor_id: tutorId, 
          start_time: start, 
          end_time: new Date(new Date(start).getTime() + 3600000).toISOString(),
          meet_link: studentMeetLink, 
          event_type: 'trial', 
          title: `Trial: ${lead.student_name}`
        }).select().single();

        await supabase.from("leads").update({ assigned_tutor_id: tutorId }).eq("id", studentId);
        await supabase.from("event_attendance").insert({ student_id: studentId, event_id: newEv.id });
      } else {
        const studentRecord = students.find(s => s.id === studentId);
        studentMeetLink = studentRecord?.personal_meet_link;

        if (!studentMeetLink) {
          toast.error("Student has no personal meet link specified!");
          return;
        }

        const slot = events.find(e => e.extendedProps.tutorId === tutorId && !e.extendedProps.assigned && !e.extendedProps.isTempBreak);
        if (!slot) { toast.error("No free slot available."); return; }
        
        const sName = studentRecord?.full_name;
        await supabase.from("calendar_events").update({ 
          meet_link: studentMeetLink, 
          event_type: 'regular', 
          title: `Class: ${sName}` 
        }).eq("id", slot.id);
        
        await supabase.from("event_attendance").insert({ student_id: studentId, event_id: slot.id });
      }
      toast.success("Assigned with student's personal meet link!");
      fetchData();
    } catch (err) { toast.error("Error assignment failed"); }
  };

  const tutorSummary = tutors.map(t => ({
    ...t,
    booked: events.filter(e => e.extendedProps?.tutorId === t.id && e.extendedProps?.assigned).length,
    free: events.filter(e => e.extendedProps?.tutorId === t.id && !e.extendedProps?.assigned && !e.extendedProps?.isTempBreak).length,
    color: getTutorColor(t.id)
  }));

  return (
    <div className="flex min-h-screen bg-slate-50 relative">
      <Toaster />

      {sidebarOpen && isAdminRole(userRole) && (
        <div className="absolute left-0 top-0 bottom-0 w-80 bg-white p-4 border-r shadow-lg z-50 overflow-y-auto">
          <div className="flex justify-between mb-4"><h2 className="font-bold">Students</h2><button onClick={() => setSidebarOpen(false)}><X size={18} /></button></div>
          <div className="flex gap-2 mb-4">
            <button className={`flex-1 px-3 py-1 rounded ${showTrial ? "bg-blue-500 text-white" : "bg-gray-200"}`} onClick={() => setShowTrial(true)}>Trials</button>
            <button className={`flex-1 px-3 py-1 rounded ${!showTrial ? "bg-blue-500 text-white" : "bg-gray-200"}`} onClick={() => setShowTrial(false)}>Subscribers</button>
          </div>
          {(showTrial ? trialLeads.filter(l => !l.assigned_tutor_id) : students).map((s) => (
            <div key={s.id} className="p-3 mb-3 border rounded bg-gray-50 shadow-sm">
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-sm">{showTrial ? s.student_name : s.full_name}</span>
                <span className="text-[10px] bg-blue-100 px-2 rounded">{showTrial ? "Trial" : s.subscription_tier}</span>
              </div>
              <div className="text-[11px] text-slate-500 mb-1 truncate">
                Meet Link: {s.personal_meet_link ? <span className="text-green-600 font-semibold">Configured</span> : <span className="text-red-500 font-semibold">Missing</span>}
              </div>
              <select className="mt-2 w-full border rounded p-1 text-xs" onChange={e => handleAssign(s.id, e.target.value, showTrial ? "trial" : "regular")} defaultValue=""><option value="" disabled>Select Tutor</option>{tutors.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}</select>
            </div>
          ))}
        </div>
      )}

      <div className={`flex-1 p-4 ${sidebarOpen ? "ml-80" : ""}`}>
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {tutorSummary.map((t) => (
            <div key={t.id} className="p-3 rounded-xl text-white shadow" style={{ backgroundColor: t.color }}>
              <span className="font-bold">{t.full_name}</span>
              <div className="text-xs">Free: {t.free} | Booked: {t.booked}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-4">
          {!sidebarOpen && isAdminRole(userRole) && <button onClick={() => setSidebarOpen(true)} className="bg-purple-600 text-white px-3 py-2 rounded shadow">Students</button>}
          <button onClick={() => navigate(-1)} className="p-2 bg-white border rounded"><ArrowLeft size={18} /></button>
          <h1 className="text-xl font-bold">Global Schedule</h1>
        </div>

        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <FullCalendar
            key={`${userRole}-${events.length}`}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            events={events}
            nowIndicator={true}
            allDaySlot={false}
            height="auto"
            slotMinTime="07:00:00"
            editable={userRole === "tutor"}
            selectable={userRole === "tutor"}
            select={handleSelect}
            eventClick={async (info) => {
              if (info.event.extendedProps.isTempBreak) return;
              const isBooked = info.event.extendedProps.assigned;
              if (isBooked && info.event.extendedProps.meet_link) {
                if (window.confirm("Join class?")) window.open(info.event.extendedProps.meet_link, "_blank");
              } else if (userRole === "tutor" && window.confirm("Delete slot?")) {
                await supabase.from("calendar_events").delete().eq("id", info.event.id);
                fetchData();
              } else if (isAdminRole(userRole) && isBooked) {
                setReassignEvent(info.event);
                setSelectedNewTutor(info.event.extendedProps.tutorId);
              }
            }}
          />
        </div>
      </div>

      {reassignEvent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
          <div className="bg-white p-6 rounded-2xl w-96 shadow-xl">
            <h2 className="font-bold mb-4">Reassign Tutor</h2>
            <select value={selectedNewTutor} onChange={(e) => setSelectedNewTutor(e.target.value)} className="w-full border rounded p-2 mb-4">{tutors.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}</select>
            <div className="flex justify-end gap-3"><button onClick={() => setReassignEvent(null)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button><button onClick={async () => { await supabase.from("calendar_events").update({ tutor_id: selectedNewTutor }).eq("id", reassignEvent.id); setReassignEvent(null); fetchData(); }} className="px-4 py-2 bg-purple-600 text-white rounded">Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
}