import React, { useEffect, useState, useCallback, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X, ChevronDown } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import "../../src/fullcalendar.css";

export default function FullCalendarView() {
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
    const colors = ["#eab308","#3b82f6","#10b981","#8b5cf6","#ee692c","#f472b6"];
    return id ? colors[id.split("").reduce((a,c)=>a+c.charCodeAt(0),0)%colors.length] : colors[0];
  };

  // Fetch user info
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
    // Tutors
    const { data: tutorsData } = await supabase.from("users").select("id, full_name").in("role", ["tutor"]);
    setTutors(tutorsData || []);

    // Students
    const { data: studentsData } = await supabase.from("students").select("id, full_name, assigned_tutor_id, preferred_time, preferred_date");
    setStudents(studentsData || []);

    // Leads (trial)
    const { data: leadsData } = await supabase.from("leads").select("id, student_name, assigned_tutor_id, class_date, class_time");
    setTrialLeads(leadsData || []);

    // Calendar events
    const { data: calendarData } = await supabase.from("calendar_events").select(`
      id, start_time, end_time, tutor_id, event_attendance(student_id, students(full_name))
    `);

    const mappedEvents = calendarData.map((e) => {
      const studentNames = e.event_attendance?.map(a=>a.students?.full_name) || [];
      const isFree = studentNames.length === 0;
      const tutorName = tutorsData?.find(t=>t.id===e.tutor_id)?.full_name;
      const tutorColor = getTutorColor(e.tutor_id);

      // Only show events relevant to current user
      if (userRole === "tutor" && e.tutor_id !== currentUser?.id) return null;
      if (userRole === "student" && !studentNames.includes(studentsData?.find(s=>s.id===currentUser?.id)?.full_name)) return null;

      // Add break after each free or booked slot
      const breakEvents = [];
      const endTime = new Date(e.end_time);
      if (isFree || studentNames.length>0) {
        const breakStart = new Date(endTime);
        const breakEnd = new Date(breakStart.getTime() + 15 * 60 * 1000);
        breakEvents.push({
          id: "break-" + e.id,
          start: breakStart,
          end: breakEnd,
          display: "background",
          backgroundColor: "#f3f4f6",
          extendedProps: { isTempBreak: true },
        });
      }

      return [
        {
          id: e.id,
          title: isFree ? `Free - ${tutorName}` : studentNames.join(", "),
          start: e.start_time,
          end: e.end_time,
          backgroundColor: isFree ? "#f1f5f9" : tutorColor,
          borderColor: tutorColor,
          textColor: isFree ? "#334155" : "#fff",
          extendedProps: { tutorId: e.tutor_id, tutorName, assigned: !isFree, type: "course" },
        },
        ...breakEvents
      ];
    }).flat().filter(Boolean);

    const trialEvents = (leadsData||[]).filter(l=>!studentsData?.some(s=>s.id===l.id) && l.assigned_tutor_id)
      .map((l)=>{
        const tutorColor = getTutorColor(l.assigned_tutor_id);
        const start = new Date(`${l.class_date}T${l.class_time}`);
        const end = new Date(start.getTime()+3600000);
        const breakStart = new Date(end.getTime());
        const breakEnd = new Date(breakStart.getTime() + 15 * 60 * 1000);

        // Only show to relevant tutor/student
        if (userRole === "tutor" && l.assigned_tutor_id !== currentUser?.id) return null;
        if (userRole === "student" && l.id !== currentUser?.id) return null;

        return [
          {
            id:"trial-"+l.id,
            title:l.student_name,
            start,
            end,
            backgroundColor:tutorColor,
            borderColor:tutorColor,
            textColor:"#fff",
            extendedProps:{ tutorId:l.assigned_tutor_id, tutorName:tutorsData?.find(t=>t.id===l.assigned_tutor_id)?.full_name, assigned:true, type:"trial" }
          },
          {
            id:"break-trial-"+l.id,
            start: breakStart,
            end: breakEnd,
            display: "background",
            backgroundColor: "#f3f4f6",
            extendedProps: { isTempBreak: true },
          }
        ];
      }).flat().filter(Boolean);

    setEvents([...(mappedEvents||[]), ...(trialEvents||[])]);
  }, [currentUser, userRole]);

  useEffect(()=>{ fetchUser(); }, [fetchUser]);
  useEffect(()=>{ if(currentUser) fetchData(); }, [fetchData, currentUser]);

  // Assign student to tutor
  const handleAssign = async (studentId, tutorId, type) => {
    if(!tutorId) return;
    try {
      if(type==="trial"){
        await supabase.from("leads").update({assigned_tutor_id:tutorId}).eq("id", studentId);
      } else {
        const slot = events.find(e=>e.extendedProps.tutorId===tutorId && !e.extendedProps.assigned && !e.extendedProps.isTempBreak);
        if(!slot){ toast.error("No free slot for this tutor"); return; }
        await supabase.from("students").update({assigned_tutor_id:tutorId}).eq("id", studentId);
        await supabase.from("event_attendance").insert({student_id:studentId,event_id:slot.id});
      }
      toast.success("Assigned successfully");
      fetchData();
    } catch(err){ console.error(err); toast.error("Assignment failed"); }
  };

  // Students available
  const availableStudents = showTrial ? trialLeads.filter(l=>!l.assigned_tutor_id) : students.filter(s=>!s.assigned_tutor_id);

  const getFreeTutorsForStudent = (student) => {
    const desiredStart = new Date(`${student.class_date||student.preferred_date||""}T${student.class_time||student.preferred_time||"08:00"}`);
    const desiredEnd = new Date(desiredStart.getTime()+3600000);
    return tutors.filter(t=>{
      const booked = events.filter(e=>e.extendedProps.tutorId===t.id && e.extendedProps.assigned);
      return !booked.some(b=>desiredStart<new Date(b.end) && desiredEnd>new Date(b.start));
    });
  };

  const tutorSummary = tutors.map(t=>{
    const booked = events.filter(e=>e.extendedProps.tutorId===t.id && e.extendedProps.assigned).length;
    const free = events.filter(e=>e.extendedProps.tutorId===t.id && !e.extendedProps.assigned).length;
    return {...t, booked, free, color:getTutorColor(t.id)};
  });

  // Tutors creating slots

const handleSelect = (info) => {
  if (userRole !== "tutor") return;

  const start = info.start;
  const end = new Date(start.getTime() + 3600000);

  const hasConflict = events.some(e =>
    e.extendedProps?.tutorId === currentUser.id &&
    !e.extendedProps?.isTempBreak &&
    start < new Date(e.end) &&
    end > new Date(e.start)
  );

  if (hasConflict) {
    toast.error("Cannot create slot: time conflict");
    return;
  }

  supabase.from("calendar_events").insert({
    title: "Free Slot",
    start_time: start,
    end_time: end,
    tutor_id: currentUser.id
  }).then(({ error }) => {
    if (error) toast.error("Slot creation failed");
    else toast.success("Slot created");
    fetchData();
  });
};

  return (
    <div className="flex min-h-screen bg-slate-50 relative">
      <Toaster />

      {/* Sidebar */}
      {sidebarOpen && isAdminRole(userRole) && (
        <div className="absolute left-0 top-0 bottom-0 w-80 bg-white p-4 border-r shadow-lg z-50 overflow-y-auto">
          <div className="flex justify-between mb-4">
            <h2 className="font-bold">Students</h2>
            <button onClick={()=>setSidebarOpen(false)}><X size={18}/></button>
          </div>
          <div className="flex gap-2 mb-4">
            <button className={`px-3 py-1 rounded ${showTrial?"bg-blue-500 text-white":"bg-gray-200"}`} onClick={()=>setShowTrial(true)}>Trial</button>
            <button className={`px-3 py-1 rounded ${!showTrial?"bg-blue-500 text-white":"bg-gray-200"}`} onClick={()=>setShowTrial(false)}>Course</button>
          </div>

          {availableStudents.map((s)=>{
            const freeTutors = getFreeTutorsForStudent(s);
            const borderClass = freeTutors.length===0?"border-orange-500":"border-gray-300";
            const tooltip = `${s.preferred_date||s.class_date||""} ${s.preferred_time||s.class_time||""}`;
            return (
              
              <div key={s.id} className={`p-3 mb-3 rounded-lg border shadow-sm ${borderClass} bg-gray-50`} title={tooltip}>
                {/* <div className="flex justify-between items-center">
                  <span>{showTrial?s.student_name:s.full_name}</span>
                </div> */}
                <div className="flex justify-between items-center">
  <div>
    <div className="text-[11px] text-slate-500 font-semibold">
      {s.preferred_date || s.class_date} {s.preferred_time || s.class_time}
    </div>
   
     <div className="flex justify-between items-center">
                  <span>{showTrial?s.student_name:s.full_name}</span>
                </div>
  </div>
</div>
                <select className="mt-2 w-full border rounded p-1" onChange={e=>handleAssign(s.id,e.target.value,showTrial?"trial":"course")} defaultValue="">
                  <option value="" disabled>{freeTutors.length?"Select tutor":"No tutors available"}</option>
                  {freeTutors.map(t=><option key={t.id} value={t.id}>{t.full_name}</option>)}
                </select>
              </div>
            )
          })}
        </div>
      )}

      {!sidebarOpen && isAdminRole(userRole) && <button onClick={()=>setSidebarOpen(true)} className="absolute left-0 top-20 z-50 bg-purple-600 text-white px-3 py-2 rounded-r">Students</button>}

      {/* Main */}
      <div className={`flex-1 p-4 ${sidebarOpen?"ml-80":""}`}>
        {/* Tutor summary */}
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {tutorSummary.map((t,i)=>(
            <div key={i} className="p-3 rounded-xl shadow text-white flex flex-col" style={{backgroundColor:t.color}}>
              <span className="font-bold">{t.full_name}</span>
              <span>Free: {t.free}</span>
              <span>Booked: {t.booked}</span>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={()=>navigate(-1)} className="p-2 bg-white border rounded"><ArrowLeft size={18}/></button>
          <h1 className="text-xl font-bold">Global Schedule</h1>
        </div>

        {/* Calendar */}
        <div className="bg-white p-4 rounded-xl border">
          <FullCalendar
  ref={calendarRef}
  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
  initialView="timeGridWeek"
  events={events}
  editable={userRole === "tutor"}
  eventStartEditable={userRole === "tutor"}
  eventDurationEditable={userRole === "tutor"}
  selectable={userRole === "tutor"}
  select={handleSelect}
  allDaySlot={false}
  nowIndicator

  eventDrop={async (info) => {
    const isBooked = info.event.extendedProps.assigned;

    if (isBooked) {
      toast.error("Cannot move booked slot");
      info.revert();
      return;
    }

    await supabase
      .from("calendar_events")
      .update({
        start_time: info.event.start,
        end_time: info.event.end
      })
      .eq("id", info.event.id);

    toast.success("Slot moved");
    fetchData();
  }}

  eventClick={async (info) => {
    const isBooked = info.event.extendedProps.assigned;

    // ===== TUTOR DELETE FREE SLOT =====
    if (userRole === "tutor") {
      if (isBooked) {
        toast.error("Cannot delete booked slot");
        return;
      }

      if (window.confirm("Delete this free slot?")) {
        await supabase
          .from("calendar_events")
          .delete()
          .eq("id", info.event.id);

        toast.success("Slot deleted");
        fetchData();
      }
    }

    // ===== ADMIN REASSIGN =====
    if (isAdminRole(userRole) && isBooked) {
      setReassignEvent(info.event);
      setSelectedNewTutor(info.event.extendedProps.tutorId);
    }
  }}
/>
        </div>
      </div>

      {reassignEvent && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-2xl w-96 shadow-xl">
      <h2 className="text-lg font-bold mb-4">Reassign Tutor</h2>

      <select
        value={selectedNewTutor}
        onChange={(e) => setSelectedNewTutor(e.target.value)}
        className="w-full border rounded p-2 mb-4"
      >
        {tutors.map((t) => (
          <option key={t.id} value={t.id}>
            {t.full_name}
          </option>
        ))}
      </select>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setReassignEvent(null)}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Cancel
        </button>

        <button
          onClick={async () => {
            await supabase
              .from("calendar_events")
              .update({ tutor_id: selectedNewTutor })
              .eq("id", reassignEvent.id);

            toast.success("Tutor reassigned");
            setReassignEvent(null);
            fetchData();
          }}
          className="px-4 py-2 bg-purple-600 text-white rounded"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
