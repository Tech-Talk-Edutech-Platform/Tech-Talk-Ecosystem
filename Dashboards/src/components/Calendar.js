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
    if(userRole !== "tutor") return;
    const start = info.start;
    const end = new Date(start.getTime() + 3600000); // 1 hour
    const breakStart = new Date(end.getTime());
    const breakEnd = new Date(breakStart.getTime() + 15*60*1000);

    // Conflict check
    const hasConflict = events.some(e=>!e.extendedProps.isTempBreak && start < new Date(e.end) && end > new Date(e.start));
    if(hasConflict){ toast.error("Cannot create slot: conflict or break required"); return; }

    // Insert slot
    supabase.from("calendar_events").insert({
      title: "Free Slot",
      start_time: start,
      end_time: end,
      tutor_id: currentUser.id
    }).then(({ error }) => {
      if(error) toast.error("Slot creation failed");
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
            const borderClass = freeTutors.length===0?"border-red-500":"border-gray-300";
            const tooltip = `${s.preferred_date||s.class_date||""} ${s.preferred_time||s.class_time||""}`;
            return (
              <div key={s.id} className={`p-3 mb-3 rounded-lg border shadow-sm ${borderClass} bg-gray-50`} title={tooltip}>
                <div className="flex justify-between items-center">
                  <span>{showTrial?s.student_name:s.full_name}</span>
                  <ChevronDown size={16}/>
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
            plugins={[dayGridPlugin,timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            events={events}
            editable={false}
            selectable={userRole==="tutor"}
            select={handleSelect}
            allDaySlot={false}
            nowIndicator
          />
        </div>
      </div>
    </div>
  );
}
// import React, { useEffect, useState, useCallback } from "react";
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import timeGridPlugin from "@fullcalendar/timegrid";
// import { supabase } from "../supabase";
// import { useNavigate } from "react-router-dom";
// import { ArrowLeft, X, ChevronDown } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import "../../src/fullcalendar.css";

// export default function FullCalendarView() {
//   const navigate = useNavigate();

//   const [events, setEvents] = useState([]);
//   const [students, setStudents] = useState([]);
//   const [trialLeads, setTrialLeads] = useState([]);
//   const [tutors, setTutors] = useState([]);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [showTrial, setShowTrial] = useState(true);

//   const isAdminRole = (role) =>
//     ["owner", "tech_admin", "operations_admin"].includes(role);

//   const getTutorColor = (id) => {
//     const colors = ["#eab308","#3b82f6","#10b981","#8b5cf6","#ee692c","#f472b6"];
//     return id ? colors[id.split("").reduce((a,c)=>a+c.charCodeAt(0),0)%colors.length] : colors[0];
//   };

//   const fetchData = useCallback(async () => {
//     // Tutors
//     const { data: tutorsData } = await supabase.from("users").select("id, full_name").in("role", ["tutor"]);
//     setTutors(tutorsData || []);

//     // Students (accounts)
//     const { data: studentsData } = await supabase.from("students").select("id, full_name, assigned_tutor_id, preferred_time, preferred_date");
//     setStudents(studentsData || []);

//     // Leads (trial)
//     const { data: leadsData } = await supabase.from("leads").select("id, student_name, assigned_tutor_id, class_date, class_time");
//     setTrialLeads(leadsData || []);

//     // Calendar events
//     const { data: calendarData } = await supabase.from("calendar_events").select(`
//       id, start_time, end_time, tutor_id, event_attendance(student_id, students(full_name))
//     `);

//     // Map existing events
//     const mappedEvents = calendarData.map((e) => {
//       const studentNames = e.event_attendance?.map(a=>a.students?.full_name) || [];
//       const isFree = studentNames.length === 0;
//       const tutorName = tutorsData?.find(t=>t.id===e.tutor_id)?.full_name;
//       const tutorColor = getTutorColor(e.tutor_id);
//       return {
//         id: e.id,
//         title: isFree?`Free - ${tutorName}`:studentNames.join(", "),
//         start: e.start_time,
//         end: e.end_time,
//         backgroundColor: isFree?"#f1f5f9":tutorColor,
//         borderColor: tutorColor,
//         textColor: isFree?"#334155":"#fff",
//         extendedProps: { tutorId: e.tutor_id, tutorName, assigned:!isFree, type:"course" },
//       };
//     });

//     // Map trial events
//     const trialEvents = (leadsData||[]).filter(l=>!studentsData?.some(s=>s.id===l.id) && l.assigned_tutor_id)
//       .map((l)=>{
//         const tutorColor = getTutorColor(l.assigned_tutor_id);
//         const start = new Date(`${l.class_date}T${l.class_time}`);
//         const end = new Date(start.getTime()+3600000); // 1 hour
//         return {
//           id:"trial-"+l.id,
//           title:l.student_name,
//           start,
//           end,
//           backgroundColor:tutorColor,
//           borderColor:tutorColor,
//           textColor:"#fff",
//           extendedProps:{ tutorId:l.assigned_tutor_id, tutorName:tutorsData?.find(t=>t.id===l.assigned_tutor_id)?.full_name, assigned:true, type:"trial" }
//         }
//       });

//     // Add 15-minute break slots automatically for each free tutor slot
//     const breakEvents = [];
//     mappedEvents.forEach(e=>{
//       if(!e.extendedProps.assigned){
//         const breakStart = new Date(e.end);
//         const breakEnd = new Date(breakStart.getTime()+15*60*1000);
//         breakEvents.push({
//           id: `break-${e.id}`,
//           title: "Break",
//           start: breakStart,
//           end: breakEnd,
//           backgroundColor: "#cbd5e1",
//           borderColor: "#94a3b8",
//           textColor: "#475569",
//           extendedProps: { tutorId: e.extendedProps.tutorId, assigned:true, type:"break" },
//         });
//       }
//     });

//     setEvents([...(mappedEvents||[]), ...(trialEvents||[]), ...breakEvents]);
//   }, []);

//   useEffect(()=>{ fetchData(); }, [fetchData]);

//   const handleAssign = async (studentId, tutorId, type) => {
//     if(!tutorId) return;
//     try {
//       if(type==="trial"){
//         await supabase.from("leads").update({assigned_tutor_id:tutorId}).eq("id", studentId);
//       } else {
//         const slot = events.find(e=>e.extendedProps.tutorId===tutorId && !e.extendedProps.assigned && e.extendedProps.type==="course");
//         if(!slot){ toast.error("No free slot for this tutor"); return; }
//         await supabase.from("students").update({assigned_tutor_id:tutorId}).eq("id", studentId);
//         await supabase.from("event_attendance").insert({student_id:studentId,event_id:slot.id});
//       }
//       toast.success("Assigned successfully");
//       fetchData();
//     } catch(err){ console.error(err); toast.error("Assignment failed"); }
//   };

//   const availableStudents = showTrial ? trialLeads.filter(l=>!l.assigned_tutor_id) : students.filter(s=>!s.assigned_tutor_id);

//   const getFreeTutorsForStudent = (student) => {
//     const desiredStart = new Date(`${student.class_date||student.preferred_date||""}T${student.class_time||student.preferred_time||"08:00"}`);
//     const desiredEnd = new Date(desiredStart.getTime()+3600000);
//     return tutors.filter(t=>{
//       const booked = events.filter(e=>e.extendedProps.tutorId===t.id && e.extendedProps.assigned && e.extendedProps.type!=="break");
//       return !booked.some(b=>desiredStart<new Date(b.end) && desiredEnd>new Date(b.start));
//     });
//   };

//   const tutorSummary = tutors.map(t=>{
//     const booked = events.filter(e=>e.extendedProps.tutorId===t.id && e.extendedProps.assigned && e.extendedProps.type!=="break").length;
//     const free = events.filter(e=>e.extendedProps.tutorId===t.id && !e.extendedProps.assigned).length;
//     return {...t, booked, free, color:getTutorColor(t.id)};
//   });

//   return (
//     <div className="flex min-h-screen bg-slate-50 relative">
//       <Toaster />

//       {/* Sidebar */}
//       {sidebarOpen && (
//         <div className="absolute left-0 top-0 bottom-0 w-80 bg-white p-4 border-r shadow-lg z-50 overflow-y-auto">
//           <div className="flex justify-between mb-4">
//             <h2 className="font-bold">Students</h2>
//             <button onClick={()=>setSidebarOpen(false)}><X size={18}/></button>
//           </div>

//           {/* Toggle Trial / Course */}
//           <div className="flex gap-2 mb-4">
//             <button className={`px-3 py-1 rounded ${showTrial?"bg-blue-500 text-white":"bg-gray-200"}`} onClick={()=>setShowTrial(true)}>Trial</button>
//             <button className={`px-3 py-1 rounded ${!showTrial?"bg-blue-500 text-white":"bg-gray-200"}`} onClick={()=>setShowTrial(false)}>Course</button>
//           </div>

//           {availableStudents.map((s)=>{
//             const freeTutors = getFreeTutorsForStudent(s);
//             const borderClass = freeTutors.length===0?"border-red-500":"border-gray-300";
//             const tooltip = `${s.preferred_date||s.class_date||""} ${s.preferred_time||s.class_time||""}`;
//             return (
//               <div key={s.id} className={`p-3 mb-3 rounded-lg border shadow-sm ${borderClass} bg-gray-50`} title={tooltip}>
//                 <div className="flex justify-between items-center">
//                   <span>{showTrial?s.student_name:s.full_name}</span>
//                   <ChevronDown size={16}/>
//                 </div>
//                 <select className="mt-2 w-full border rounded p-1" onChange={e=>handleAssign(s.id,e.target.value,showTrial?"trial":"course")} defaultValue="">
//                   <option value="" disabled>{freeTutors.length?"Select tutor":"No tutors available"}</option>
//                   {freeTutors.map(t=><option key={t.id} value={t.id}>{t.full_name}</option>)}
//                 </select>
//               </div>
//             )
//           })}
//         </div>
//       )}

//       {!sidebarOpen && <button onClick={()=>setSidebarOpen(true)} className="absolute left-0 top-20 z-50 bg-purple-600 text-white px-3 py-2 rounded-r">Students</button>}

//       {/* Main */}
//       <div className={`flex-1 p-4 ${sidebarOpen?"ml-80":""}`}>
//         {/* Tutor summary */}
//         <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
//           {tutorSummary.map((t,i)=>(
//             <div key={i} className="p-3 rounded-xl shadow text-white flex flex-col" style={{backgroundColor:t.color}}>
//               <span className="font-bold">{t.full_name}</span>
//               <span>Free: {t.free}</span>
//               <span>Booked: {t.booked}</span>
//             </div>
//           ))}
//         </div>

//         {/* Header */}
//         <div className="flex items-center gap-3 mb-4">
//           <button onClick={()=>navigate(-1)} className="p-2 bg-white border rounded"><ArrowLeft size={18}/></button>
//           <h1 className="text-xl font-bold">Global Schedule</h1>
//         </div>

//         {/* Calendar */}
//         <div className="bg-white p-4 rounded-xl border">
//           <FullCalendar
//             plugins={[dayGridPlugin,timeGridPlugin]}
//             initialView="timeGridWeek"
//             events={events}
//             editable={false}
//             allDaySlot={false}
//             nowIndicator={true}
//           />
//         </div>
//       </div>
//     </div>
//   )
// }
// // import React, { useEffect, useState, useCallback } from "react";
// // import FullCalendar from "@fullcalendar/react";
// // import dayGridPlugin from "@fullcalendar/daygrid";
// // import timeGridPlugin from "@fullcalendar/timegrid";
// // import { supabase } from "../supabase";
// // import { useNavigate } from "react-router-dom";
// // import { ArrowLeft, X, ChevronDown } from "lucide-react";
// // import toast, { Toaster } from "react-hot-toast";
// // import "../../src/fullcalendar.css";

// // export default function FullCalendarView() {
// //   const navigate = useNavigate();

// //   const [events, setEvents] = useState([]);
// //   const [students, setStudents] = useState([]);
// //   const [trialLeads, setTrialLeads] = useState([]);
// //   const [tutors, setTutors] = useState([]);
// //   const [sidebarOpen, setSidebarOpen] = useState(false);
// //   const [showTrial, setShowTrial] = useState(true);

// //   const isAdminRole = (role) =>
// //     ["owner", "tech_admin", "operations_admin"].includes(role);

// //   const getTutorColor = (id) => {
// //     const colors = ["#eab308","#3b82f6","#10b981","#8b5cf6","#ee692c","#f472b6"];
// //     return id ? colors[id.split("").reduce((a,c)=>a+c.charCodeAt(0),0)%colors.length] : colors[0];
// //   };

// //   const fetchData = useCallback(async () => {
// //     // Tutors
// //     const { data: tutorsData } = await supabase.from("users").select("id, full_name").in("role", ["tutor"]);
// //     setTutors(tutorsData || []);

// //     // Students (accounts)
// //     const { data: studentsData } = await supabase.from("students").select("id, full_name, assigned_tutor_id, preferred_time, preferred_date");
// //     setStudents(studentsData || []);

// //     // Leads (trial)
// //     const { data: leadsData } = await supabase.from("leads").select("id, student_name, assigned_tutor_id, class_date, class_time");
// //     setTrialLeads(leadsData || []);

// //     // Calendar events
// //     const { data: calendarData } = await supabase.from("calendar_events").select(`
// //       id, start_time, end_time, tutor_id, event_attendance(student_id, students(full_name))
// //     `);

// //     const mappedEvents = calendarData.map((e) => {
// //       const studentNames = e.event_attendance?.map(a=>a.students?.full_name) || [];
// //       const isFree = studentNames.length === 0;
// //       const tutorName = tutorsData?.find(t=>t.id===e.tutor_id)?.full_name;
// //       const tutorColor = getTutorColor(e.tutor_id);
// //       return {
// //         id: e.id,
// //         title: isFree?`Free - ${tutorName}`:studentNames.join(", "),
// //         start: e.start_time,
// //         end: e.end_time,
// //         backgroundColor: isFree?"#f1f5f9":tutorColor,
// //         borderColor: tutorColor,
// //         textColor: isFree?"#334155":"#fff",
// //         extendedProps: { tutorId: e.tutor_id, tutorName, assigned:!isFree, type:"course" },
// //       };
// //     });

// //     const trialEvents = (leadsData||[]).filter(l=>!studentsData?.some(s=>s.id===l.id) && l.assigned_tutor_id)
// //       .map((l)=>{
// //         const tutorColor = getTutorColor(l.assigned_tutor_id);
// //         const start = new Date(`${l.class_date}T${l.class_time}`);
// //         const end = new Date(start.getTime()+3600000);
// //         return {
// //           id:"trial-"+l.id,
// //           title:l.student_name,
// //           start,
// //           end,
// //           backgroundColor:tutorColor,
// //           borderColor:tutorColor,
// //           textColor:"#fff",
// //           extendedProps:{ tutorId:l.assigned_tutor_id, tutorName:tutorsData?.find(t=>t.id===l.assigned_tutor_id)?.full_name, assigned:true, type:"trial" }
// //         }
// //       });

// //     setEvents([...(mappedEvents||[]), ...(trialEvents||[])]);
// //   }, []);

// //   useEffect(()=>{ fetchData(); }, [fetchData]);

// //   const handleAssign = async (studentId, tutorId, type) => {
// //     if(!tutorId) return;
// //     try {
// //       if(type==="trial"){
// //         await supabase.from("leads").update({assigned_tutor_id:tutorId}).eq("id", studentId);
// //       } else {
// //         const slot = events.find(e=>e.extendedProps.tutorId===tutorId && !e.extendedProps.assigned);
// //         if(!slot){ toast.error("No free slot for this tutor"); return; }
// //         await supabase.from("students").update({assigned_tutor_id:tutorId}).eq("id", studentId);
// //         await supabase.from("event_attendance").insert({student_id:studentId,event_id:slot.id});
// //       }
// //       toast.success("Assigned successfully");
// //       fetchData();
// //     } catch(err){ console.error(err); toast.error("Assignment failed"); }
// //   };

// //   const availableStudents = showTrial ? trialLeads.filter(l=>!l.assigned_tutor_id) : students.filter(s=>!s.assigned_tutor_id);

// //   const getFreeTutorsForStudent = (student) => {
// //     const desiredStart = new Date(`${student.class_date||student.preferred_date||""}T${student.class_time||student.preferred_time||"08:00"}`);
// //     const desiredEnd = new Date(desiredStart.getTime()+3600000);
// //     return tutors.filter(t=>{
// //       const booked = events.filter(e=>e.extendedProps.tutorId===t.id && e.extendedProps.assigned);
// //       return !booked.some(b=>desiredStart<new Date(b.end) && desiredEnd>new Date(b.start));
// //     });
// //   };

// //   const tutorSummary = tutors.map(t=>{
// //     const booked = events.filter(e=>e.extendedProps.tutorId===t.id && e.extendedProps.assigned).length;
// //     const free = events.filter(e=>e.extendedProps.tutorId===t.id && !e.extendedProps.assigned).length;
// //     return {...t, booked, free, color:getTutorColor(t.id)};
// //   });

// //   return (
// //     <div className="flex min-h-screen bg-slate-50 relative">
// //       <Toaster />

// //       {/* Sidebar */}
// //       {sidebarOpen && (
// //         <div className="absolute left-0 top-0 bottom-0 w-80 bg-white p-4 border-r shadow-lg z-50 overflow-y-auto">
// //           <div className="flex justify-between mb-4">
// //             <h2 className="font-bold">Students</h2>
// //             <button onClick={()=>setSidebarOpen(false)}><X size={18}/></button>
// //           </div>

// //           {/* Toggle Trial / Course */}
// //           <div className="flex gap-2 mb-4">
// //             <button className={`px-3 py-1 rounded ${showTrial?"bg-blue-500 text-white":"bg-gray-200"}`} onClick={()=>setShowTrial(true)}>Trial</button>
// //             <button className={`px-3 py-1 rounded ${!showTrial?"bg-blue-500 text-white":"bg-gray-200"}`} onClick={()=>setShowTrial(false)}>Course</button>
// //           </div>

// //           {availableStudents.map((s)=>{
// //             const freeTutors = getFreeTutorsForStudent(s);
// //             const borderClass = freeTutors.length===0?"border-red-500":"border-gray-300";
// //             const tooltip = `${s.preferred_date||s.class_date||""} ${s.preferred_time||s.class_time||""}`;
// //             return (
// //               <div key={s.id} className={`p-3 mb-3 rounded-lg border shadow-sm ${borderClass} bg-gray-50`} title={tooltip}>
// //                 <div className="flex justify-between items-center">
// //                   <span>{showTrial?s.student_name:s.full_name}</span>
// //                   <ChevronDown size={16}/>
// //                 </div>
// //                 <select className="mt-2 w-full border rounded p-1" onChange={e=>handleAssign(s.id,e.target.value,showTrial?"trial":"course")} defaultValue="">
// //                   <option value="" disabled>{freeTutors.length?"Select tutor":"No tutors available"}</option>
// //                   {freeTutors.map(t=><option key={t.id} value={t.id}>{t.full_name}</option>)}
// //                 </select>
// //               </div>
// //             )
// //           })}
// //         </div>
// //       )}

// //       {!sidebarOpen && <button onClick={()=>setSidebarOpen(true)} className="absolute left-0 top-20 z-50 bg-purple-600 text-white px-3 py-2 rounded-r">Students</button>}

// //       {/* Main */}
// //       <div className={`flex-1 p-4 ${sidebarOpen?"ml-80":""}`}>
// //         {/* Tutor summary */}
// //         <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
// //           {tutorSummary.map((t,i)=>(
// //             <div key={i} className="p-3 rounded-xl shadow text-white flex flex-col" style={{backgroundColor:t.color}}>
// //               <span className="font-bold">{t.full_name}</span>
// //               <span>Free: {t.free}</span>
// //               <span>Booked: {t.booked}</span>
// //             </div>
// //           ))}
// //         </div>

// //         {/* Header */}
// //         <div className="flex items-center gap-3 mb-4">
// //           <button onClick={()=>navigate(-1)} className="p-2 bg-white border rounded"><ArrowLeft size={18}/></button>
// //           <h1 className="text-xl font-bold">Global Schedule</h1>
// //         </div>

// //         {/* Calendar */}
// //         <div className="bg-white p-4 rounded-xl border">
// //           <FullCalendar
// //             plugins={[dayGridPlugin,timeGridPlugin]}
// //             initialView="timeGridWeek"
// //             events={events}
// //             editable={false}
// //             allDaySlot={false}
// //             nowIndicator={true} // Red now line restored
// //           />
// //         </div>
// //       </div>
// //     </div>
// //   )
// // }
// // import React, { useEffect, useState, useCallback, useRef } from "react";
// // import FullCalendar from "@fullcalendar/react";
// // import dayGridPlugin from "@fullcalendar/daygrid";
// // import timeGridPlugin from "@fullcalendar/timegrid";
// // import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
// // import { supabase } from "../supabase";
// // import { useNavigate } from "react-router-dom";
// // import { ArrowLeft, X } from "lucide-react";
// // import toast, { Toaster } from "react-hot-toast";
// // import "../../src/fullcalendar.css";

// // export default function FullCalendarView() {
// //   const navigate = useNavigate();
// //   const calendarRef = useRef(null);
// //   const sidebarRef = useRef(null);

// //   const [events, setEvents] = useState([]);
// //   const [students, setStudents] = useState([]);
// //   const [trialLeads, setTrialLeads] = useState([]);
// //   const [tutorMap, setTutorMap] = useState({});
// //   const [sidebarOpen, setSidebarOpen] = useState(false);
// //   const [showTrial, setShowTrial] = useState(true);
// //   const [confirmData, setConfirmData] = useState(null);

// //   const isAdminRole = (role) =>
// //     ["owner", "tech_admin", "operations_admin"].includes(role);

// //   const getTutorColor = (id) => {
// //     const colors = [
// //       "#eab308",
// //       "#3b82f6",
// //       "#10b981",
// //       "#8b5cf6",
// //       "#ee692c",
// //       "#f472b6",
// //     ];
// //     return colors[
// //       id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length
// //     ];
// //   };

// //   /* ---------------- FETCH ---------------- */

// //   const fetchData = useCallback(async () => {
// //     const { data: tutors } = await supabase
// //       .from("users")
// //       .select("id, full_name")
// //       .in("role", ["tutor"]);

// //     const tutorLookup = {};
// //     tutors?.forEach((t) => (tutorLookup[t.id] = t.full_name));
// //     setTutorMap(tutorLookup);

// //     const { data: studentsData } = await supabase
// //       .from("students")
// //       .select("id, full_name, assigned_tutor_id");

// //     const { data: leadsData } = await supabase
// //       .from("leads")
// //       .select("id, student_name, assigned_tutor_id, class_date, class_time");

// //     setStudents(studentsData || []);
// //     setTrialLeads(leadsData || []);

// //     const { data: calendarData } = await supabase.from("calendar_events").select(`
// //       id,
// //       start_time,
// //       end_time,
// //       tutor_id,
// //       event_attendance(student_id, students(full_name))
// //     `);

// //     const mapped = calendarData.map((e) => {
// //       const tutorColor = getTutorColor(e.tutor_id);
// //       const studentNames =
// //         e.event_attendance?.map((a) => a.students?.full_name) || [];
// //       const isFree = studentNames.length === 0;

// //       return {
// //         id: e.id,
// //         title: isFree
// //           ? `Free - ${tutorLookup[e.tutor_id] || "Tutor"}`
// //           : studentNames.join(", "),
// //         start: e.start_time,
// //         end: e.end_time,
// //         backgroundColor: isFree ? "#f1f5f9" : tutorColor,
// //         borderColor: tutorColor,
// //         textColor: isFree ? "#334155" : "#fff",
// //         extendedProps: {
// //           tutorId: e.tutor_id,
// //           tutorName: tutorLookup[e.tutor_id],
// //           assigned: !isFree,
// //           type: "course",
// //         },
// //       };
// //     });

// //     const trialEvents = leadsData
// //       ?.filter((l) => l.assigned_tutor_id)
// //       .map((l) => {
// //         const tutorColor = getTutorColor(l.assigned_tutor_id);
// //         const start = new Date(`${l.class_date}T${l.class_time}`);
// //         const end = new Date(start.getTime() + 3600000);

// //         return {
// //           id: "trial-" + l.id,
// //           title: l.student_name,
// //           start,
// //           end,
// //           backgroundColor: tutorColor,
// //           borderColor: tutorColor,
// //           textColor: "#fff",
// //           extendedProps: {
// //             tutorId: l.assigned_tutor_id,
// //             tutorName: tutorLookup[l.assigned_tutor_id],
// //             assigned: true,
// //             type: "trial",
// //           },
// //         };
// //       });

// //     setEvents([...(mapped || []), ...(trialEvents || [])]);
// //   }, []);

// //   useEffect(() => {
// //     fetchData();
// //   }, [fetchData]);

// //   /* ---------------- DOUBLE BOOKING ---------------- */

// //   const hasConflict = (start, end, tutorId) => {
// //     return events.some((e) => {
// //       if (e.extendedProps.tutorId !== tutorId) return false;
// //       const es = new Date(e.start).getTime();
// //       const ee = new Date(e.end).getTime();
// //       return start.getTime() < ee && end.getTime() > es;
// //     });
// //   };

// //   /* ---------------- ASSIGN ---------------- */

// //   const confirmAssignment = async () => {
// //     if (!confirmData) return;

// //     const { studentId, tutorId, slotId, type } = confirmData;

// //     if (type === "trial") {
// //       await supabase
// //         .from("leads")
// //         .update({ assigned_tutor_id: tutorId })
// //         .eq("id", studentId);
// //     } else {
// //       await supabase
// //         .from("students")
// //         .update({ assigned_tutor_id: tutorId })
// //         .eq("id", studentId);

// //       await supabase.from("event_attendance").insert({
// //         event_id: slotId,
// //         student_id: studentId,
// //       });
// //     }

// //     toast.success("Assigned successfully");
// //     setConfirmData(null);
// //     fetchData();
// //   };

// //   /* ---------------- DRAG ---------------- */

// //   useEffect(() => {
// //     if (sidebarRef.current) {
// //       new Draggable(sidebarRef.current, {
// //         itemSelector: ".fc-draggable",
// //         eventData: (el) => ({
// //           id: el.dataset.id,
// //           type: el.dataset.type,
// //         }),
// //       });
// //     }
// //   }, [students, trialLeads, showTrial]);

// //   const handleEventReceive = (info) => {
// //     const slot = info.event;

// //     if (slot.extendedProps.assigned) {
// //       toast.error("Slot already booked");
// //       info.revert();
// //       return;
// //     }

// //     const studentId = info.draggedEl.dataset.id;
// //     const type = info.draggedEl.dataset.type;
// //     const tutorId = slot.extendedProps.tutorId;

// //     const start = new Date(slot.start);
// //     const end = new Date(slot.end);

// //     if (hasConflict(start, end, tutorId)) {
// //       toast.error("Tutor already booked at this time");
// //       info.revert();
// //       return;
// //     }

// //     setConfirmData({
// //       studentId,
// //       tutorId,
// //       slotId: slot.id,
// //       type,
// //     });

// //     info.revert();
// //   };

// //   /* ---------------- FILTER SIDEBAR ---------------- */

// //   const availableStudents = showTrial
// //     ? trialLeads.filter((l) => !l.assigned_tutor_id)
// //     : students.filter((s) => !s.assigned_tutor_id);

// //   /* ---------------- UI ---------------- */

// //   return (
// //     <div className="flex min-h-screen bg-slate-50 relative">
// //       <Toaster />

// //       {/* Sidebar */}
// //       {sidebarOpen && (
// //         <div
// //           ref={sidebarRef}
// //           className="absolute left-0 top-0 bottom-0 w-80 bg-white p-4 border-r shadow-lg z-50 overflow-y-auto"
// //         >
// //           <div className="flex justify-between mb-4">
// //             <h2 className="font-bold">Students</h2>
// //             <button onClick={() => setSidebarOpen(false)}>
// //               <X size={18} />
// //             </button>
// //           </div>

// //           <div className="flex gap-2 mb-4">
// //             <button
// //               className={`px-3 py-1 rounded ${
// //                 showTrial ? "bg-blue-500 text-white" : "bg-gray-200"
// //               }`}
// //               onClick={() => setShowTrial(true)}
// //             >
// //               Trial
// //             </button>
// //             <button
// //               className={`px-3 py-1 rounded ${
// //                 !showTrial ? "bg-blue-500 text-white" : "bg-gray-200"
// //               }`}
// //               onClick={() => setShowTrial(false)}
// //             >
// //               Course
// //             </button>
// //           </div>

// //           {availableStudents.map((s) => (
// //             <div
// //               key={s.id}
// //               data-id={s.id}
// //               data-type={showTrial ? "trial" : "course"}
// //               className={`fc-draggable p-3 mb-3 rounded-lg cursor-move border shadow-sm ${
// //                 showTrial
// //                   ? "bg-yellow-100 border-yellow-400"
// //                   : "bg-gray-100"
// //               }`}
// //             >
// //               {showTrial ? s.student_name : s.full_name}
// //             </div>
// //           ))}
// //         </div>
// //       )}

// //       {!sidebarOpen && (
// //         <button
// //           onClick={() => setSidebarOpen(true)}
// //           className="absolute left-0 top-20 z-50 bg-purple-600 text-white px-3 py-2 rounded-r"
// //         >
// //           Students
// //         </button>
// //       )}

// //       {/* Main */}
// //       <div className={`flex-1 p-4 ${sidebarOpen ? "ml-80" : ""}`}>
// //         <div className="flex items-center gap-3 mb-4">
// //           <button
// //             onClick={() => navigate(-1)}
// //             className="p-2 bg-white border rounded"
// //           >
// //             <ArrowLeft size={18} />
// //           </button>
// //           <h1 className="text-xl font-bold">Global Schedule</h1>
// //         </div>

// //         <div className="bg-white p-4 rounded-xl border">
// //           <FullCalendar
// //             ref={calendarRef}
// //             plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
// //             initialView="timeGridWeek"
// //             events={events}
// //             editable={false}
// //             droppable={true}
// //             eventReceive={handleEventReceive}
// //             allDaySlot={false}
// //           />
// //         </div>
// //       </div>

// //       {/* Confirmation Modal */}
// //       {confirmData && (
// //         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
// //           <div className="bg-white p-6 rounded-xl shadow-xl w-96">
// //             <h2 className="font-bold mb-4">Confirm Assignment</h2>
// //             <p className="mb-6">
// //               Assign this student to{" "}
// //               <strong>{tutorMap[confirmData.tutorId]}</strong>?
// //             </p>
// //             <div className="flex justify-end gap-3">
// //               <button
// //                 onClick={() => setConfirmData(null)}
// //                 className="px-4 py-2 bg-gray-200 rounded"
// //               >
// //                 Cancel
// //               </button>
// //               <button
// //                 onClick={confirmAssignment}
// //                 className="px-4 py-2 bg-blue-600 text-white rounded"
// //               >
// //                 Confirm
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }
// // // import React, { useEffect, useState, useCallback, useRef } from "react";
// // // import FullCalendar from "@fullcalendar/react";
// // // import dayGridPlugin from "@fullcalendar/daygrid";
// // // import timeGridPlugin from "@fullcalendar/timegrid";
// // // import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
// // // import { supabase } from "../supabase";
// // // import { useNavigate } from "react-router-dom";
// // // import { ArrowLeft, UserPlus, X } from "lucide-react";
// // // import toast, { Toaster } from "react-hot-toast";
// // // import "../../src/fullcalendar.css";

// // // export default function FullCalendarView() {
// // //   const navigate = useNavigate();
// // //   const calendarRef = useRef(null);
// // //   const sidebarRef = useRef(null);

// // //   const [events, setEvents] = useState([]);
// // //   const [userRole, setUserRole] = useState(null);
// // //   const [currentUserId, setCurrentUserId] = useState(null);
// // //   const [unsavedSlots, setUnsavedSlots] = useState([]);
// // //   const [students, setStudents] = useState([]);
// // //   const [leads, setLeads] = useState([]);
// // //   const [assignModal, setAssignModal] = useState({ open: false, slotId: null });
// // //   const [confirmDelete, setConfirmDelete] = useState({ open: false, slotId: null });
// // //   const [tutorSummary, setTutorSummary] = useState([]);
// // //   const [sidebarOpen, setSidebarOpen] = useState(true);
// // //   const [availableTutorsMap, setAvailableTutorsMap] = useState({}); 

// // //   const isAdminRole = (role) => ["owner", "tech_admin", "operations_admin"].includes(role);

// // //   const getTutorColor = (id) => {
// // //     const colors = ["#eab308","#3b82f6","#10b981","#8b5cf6","#ee692c","rgba(248, 100, 191, 0.66)"];
// // //     if (!id) return colors[0];
// // //     return colors[id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length];
// // //   };

// // //   const hexToRgba = (hex, alpha = 0.3) => {
// // //     const r = parseInt(hex.slice(1,3),16);
// // //     const g = parseInt(hex.slice(3,5),16);
// // //     const b = parseInt(hex.slice(5,7),16);
// // //     return `rgba(${r},${g},${b},${alpha})`;
// // //   };

// // //   /* ---------------- FETCH EVENTS ---------------- */
// // //   const fetchEvents = useCallback(async () => {
// // //     const { data: { user } } = await supabase.auth.getUser();
// // //     if (!user) return;
// // //     setCurrentUserId(user.id);

// // //     const { data: profile } = await supabase
// // //       .from("users")
// // //       .select("role, full_name")
// // //       .eq("id", user.id)
// // //       .single();
// // //     setUserRole(profile?.role);

// // //     // Fetch students (course bookings)
// // //     const { data: studentData } = await supabase
// // //       .from("students")
// // //       .select("id, full_name, assigned_tutor_id");

// // //     setStudents(studentData || []);

// // //     // Fetch leads (trial bookings)
// // //     const { data: leadsData } = await supabase
// // //       .from("leads")
// // //       .select("id, student_name, class_date, class_time, assigned_tutor_id");
// // //     setLeads(leadsData || []);

// // //     // Fetch calendar events
// // //     let query = supabase.from("calendar_events").select(`
// // //       id,
// // //       title,
// // //       start_time,
// // //       end_time,
// // //       tutor_id,
// // //       users!calendar_events_tutor_id_fkey(full_name),
// // //       event_attendance(
// // //         id,
// // //         student_id,
// // //         meet_link,
// // //         students(full_name)
// // //       )
// // //     `);
// // //     if (profile?.role === "tutor") query = query.eq("tutor_id", user.id);
// // //     const { data, error } = await query;
// // //     if (error) return console.error(error);

// // //     const fullEvents = [];
// // //     const summary = {};

// // //     data.forEach((e) => {
// // //       const tutorColor = getTutorColor(e.tutor_id);
// // //       const studentNames = e.event_attendance?.map((a) => a.students?.full_name).filter(Boolean) || [];
// // //       const isFree = studentNames.length === 0;

// // //       if (!summary[e.tutor_id]) summary[e.tutor_id] = { name: e.users?.full_name || "Tutor", free: 0, booked: 0, color: tutorColor };
// // //       if (isFree) summary[e.tutor_id].free += 1;
// // //       else summary[e.tutor_id].booked += 1;

// // //       fullEvents.push({
// // //         id: e.id,
// // //         title: isFree ? "Free Slot" : studentNames.join(", "),
// // //         start: e.start_time,
// // //         end: e.end_time,
// // //         backgroundColor: isFree ? hexToRgba(tutorColor, 0.3) : tutorColor,
// // //         borderColor: tutorColor,
// // //         textColor: isFree ? tutorColor : "#ffffff",
// // //         extendedProps: { tutorId: e.tutor_id, assigned: !isFree },
// // //       });

// // //       // Auto break
// // //       const breakStart = new Date(e.end_time);
// // //       const breakEnd = new Date(breakStart.getTime() + 15 * 60 * 1000);
// // //       fullEvents.push({
// // //         id: "break-" + e.id,
// // //         start: breakStart,
// // //         end: breakEnd,
// // //         display: "background",
// // //         backgroundColor: "#e5e7eb",
// // //         extendedProps: { isTempBreak: true },
// // //       });
// // //     });

// // //     setEvents(fullEvents);
// // //     setTutorSummary(Object.values(summary));
// // //   }, []);

// // //   useEffect(() => { fetchEvents(); }, [fetchEvents]);

// // //   /* ---------------- ASSIGN / UNASSIGN ---------------- */
// // //   const assignStudentToTutor = async (studentId, tutorId, slotId) => {
// // //     try {
// // //       // Determine if this is a lead or student
// // //       const isLead = leads.find((l) => l.id === studentId);
// // //       if (isLead) {
// // //         await supabase.from("leads").update({ assigned_tutor_id: tutorId }).eq("id", studentId);
// // //         if (slotId) await supabase.from("event_attendance").insert({ event_id: slotId, student_id: studentId });
// // //       } else {
// // //         await supabase.from("students").update({ assigned_tutor_id: tutorId }).eq("id", studentId);
// // //         if (slotId) await supabase.from("event_attendance").insert({ event_id: slotId, student_id: studentId });
// // //       }
// // //       toast.success("Assigned successfully");
// // //       fetchEvents();
// // //     } catch (err) {
// // //       console.error(err);
// // //       toast.error("Assignment failed");
// // //     }
// // //   };

// // //   const unassignTutor = async (studentId) => {
// // //     try {
// // //       const isLead = leads.find((l) => l.id === studentId);
// // //       if (isLead) await supabase.from("leads").update({ assigned_tutor_id: null }).eq("id", studentId);
// // //       else await supabase.from("students").update({ assigned_tutor_id: null }).eq("id", studentId);
// // //       await supabase.from("event_attendance").delete().eq("student_id", studentId);
// // //       toast.success("Unassigned successfully");
// // //       fetchEvents();
// // //     } catch (err) {
// // //       console.error(err);
// // //       toast.error("Unassign failed");
// // //     }
// // //   };

// // //   const handleEventClick = ({ event }) => {
// // //     if (event.id.startsWith("temp-")) {
// // //       setUnsavedSlots((p) => p.filter((s) => s.id !== event.id));
// // //       return;
// // //     }
// // //     const isOwner = event.extendedProps.tutorId === currentUserId;
// // //     if (isOwner && userRole === "tutor" && !event.extendedProps.assigned) {
// // //       setConfirmDelete({ open: true, slotId: event.id });
// // //     }
// // //     if (isAdminRole(userRole) && !event.extendedProps.assigned) {
// // //       setAssignModal({ open: true, slotId: event.id });
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     if (sidebarRef.current) {
// // //       new Draggable(sidebarRef.current, {
// // //         itemSelector: ".fc-draggable-student",
// // //         eventData: (el) => ({ id: el.dataset.id, title: el.innerText }),
// // //       });
// // //     }
// // //   }, [leads]);

// // //   const handleEventReceive = async (info) => {
// // //     const studentId = info.draggedEl.dataset.id;
// // //     const slotId = info.event.id;
// // //     await assignStudentToTutor(studentId, info.event.extendedProps.tutorId, slotId);
// // //   };

// // //   /* ---------------- SAVE SLOT ---------------- */
// // //   const handleSaveSlots = async () => {
// // //     for (const s of unsavedSlots) {
// // //       if (new Date(s.end) - new Date(s.start) !== 3600000) {
// // //         toast.error("Each slot must be exactly 1 hour");
// // //         return;
// // //       }
// // //     }

// // //     const { error } = await supabase.from("calendar_events").insert(
// // //       unsavedSlots.map((s) => ({
// // //         title: "Free Slot",
// // //         start_time: s.start,
// // //         end_time: s.end,
// // //         tutor_id: currentUserId,
// // //       }))
// // //     );

// // //     if (error) toast.error("Save failed");
// // //     else {
// // //       toast.success("Saved");
// // //       setUnsavedSlots([]);
// // //       fetchEvents();
// // //     }
// // //   };

// // //   const handleDeleteConfirmed = async () => {
// // //     const { error } = await supabase.from("calendar_events").delete().eq("id", confirmDelete.slotId);
// // //     if (error) toast.error("Delete failed");
// // //     else toast.success("Slot deleted");
// // //     setConfirmDelete({ open: false, slotId: null });
// // //     fetchEvents();
// // //   };

// // //   /* ---------------- UI ---------------- */
// // //   return (
// // //     <div className="flex min-h-screen bg-slate-50 relative">
// // //       <Toaster />
// // //       {isAdminRole(userRole) && sidebarOpen && (
// // //         <div ref={sidebarRef} className="absolute left-0 top-0 bottom-0 w-80 bg-white p-4 border-r shadow-lg z-50 overflow-y-auto transition-transform">
// // //           <div className="flex justify-between items-center mb-3">
// // //             <h2 className="font-bold text-lg">Unassigned Leads</h2>
// // //             <button onClick={() => setSidebarOpen(false)}><X size={18} /></button>
// // //           </div>

// // //           {leads.map((s) => (
// // //             <div key={s.id} className="p-2 mb-3 rounded-lg border bg-gray-50">
// // //               <div className="flex justify-between items-center mb-1">
// // //                 <span className="font-semibold">{s.student_name}</span>
// // //                 <button onClick={() => unassignTutor(s.id)} className="ml-2 bg-red-600 p-1 rounded hover:bg-red-700 text-white text-sm">Unassign</button>
// // //               </div>
// // //               <div className="text-xs text-gray-600 mb-2">
// // //                 Preferred: {s.class_date} {s.class_time}
// // //               </div>
// // //             </div>
// // //           ))}
// // //         </div>
// // //       )}

// // //       {isAdminRole(userRole) && !sidebarOpen && (
// // //         <button onClick={() => setSidebarOpen(true)} className="absolute left-0 top-20 z-50 bg-purple-500 text-white p-2 rounded-r">Open Leads</button>
// // //       )}

// // //       <div className={`flex-1 p-4 ${sidebarOpen ? "ml-80" : ""} transition-all`}>
// // //         {isAdminRole(userRole) && (
// // //           <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
// // //             {tutorSummary.map((t) => (
// // //               <div key={t.name} className="p-3 rounded-xl shadow flex flex-col text-white" style={{ backgroundColor: t.color }}>
// // //                 <span className="font-bold text-lg">{t.name}</span>
// // //                 <span>Free: {t.free}</span>
// // //                 <span>Booked: {t.booked}</span>
// // //               </div>
// // //             ))}
// // //           </div>
// // //         )}

// // //         <div className="sticky top-0 z-50 bg-slate-50 mb-3 flex justify-between items-center">
// // //           <div className="flex gap-3 items-center">
// // //             <button onClick={() => navigate(-1)} className="p-2 bg-white border rounded-lg shadow-sm">
// // //               <ArrowLeft size={18} />
// // //             </button>
// // //             <h1 className="text-xl font-bold">Global Schedule</h1>
// // //           </div>
// // //           {unsavedSlots.length > 0 && (
// // //             <button onClick={handleSaveSlots} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg">Save Slots</button>
// // //           )}
// // //         </div>

// // //         <div className="bg-white p-4 rounded-2xl border">
// // //           <FullCalendar
// // //             ref={calendarRef}
// // //             plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
// // //             initialView="timeGridWeek"
// // //             events={[...events, ...unsavedSlots]}
// // //             slotDuration="00:15:00"
// // //             nowIndicator
// // //             selectable={userRole === "tutor"}
// // //             editable={isAdminRole(userRole) || userRole === "tutor"}
// // //             droppable={isAdminRole(userRole)}
// // //             allDaySlot={false}
// // //             select={(info) => {
// // //               if (userRole !== "tutor") return;
// // //               const end = new Date(info.start.getTime() + 3600000);
// // //               const buffer = 15 * 60 * 1000;
// // //               if ([...events, ...unsavedSlots].some((e) => new Date(e.start) < end + buffer && new Date(e.end) > info.start - buffer)) {
// // //                 toast.error("15-min break required");
// // //                 return;
// // //               }
// // //               setUnsavedSlots((prev) => [...prev, { id: "temp-"+Date.now(), title: "Free Slot", start: info.start, end, backgroundColor: "#fefce8" }]);
// // //             }}
// // //             eventClick={handleEventClick}
// // //             eventReceive={handleEventReceive}
// // //           />
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }// import React, { useEffect, useState, useCallback, useRef } from "react";
// // // // import FullCalendar from "@fullcalendar/react";
// // // // import dayGridPlugin from "@fullcalendar/daygrid";
// // // // import timeGridPlugin from "@fullcalendar/timegrid";
// // // // import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
// // // // import { supabase } from "../supabase";
// // // // import { useNavigate } from "react-router-dom";
// // // // import { ArrowLeft, UserPlus, X } from "lucide-react";
// // // // import toast, { Toaster } from "react-hot-toast";
// // // // import "../../src/fullcalendar.css";

// // // // export default function FullCalendarView() {
// // // //   const navigate = useNavigate();
// // // //   const calendarRef = useRef(null);
// // // //   const sidebarRef = useRef(null);

// // // //   const [events, setEvents] = useState([]);
// // // //   const [userRole, setUserRole] = useState(null);
// // // //   const [currentUserId, setCurrentUserId] = useState(null);
// // // //   const [unsavedSlots, setUnsavedSlots] = useState([]);
// // // //   const [students, setStudents] = useState([]);
// // // //   const [unassignedStudents, setUnassignedStudents] = useState([]);
// // // //   const [assignModal, setAssignModal] = useState({ open: false, slotId: null });
// // // //   const [confirmDelete, setConfirmDelete] = useState({ open: false, slotId: null });
// // // //   const [tutorSummary, setTutorSummary] = useState([]);
// // // //   const [sidebarOpen, setSidebarOpen] = useState(true);

// // // //   // Student prefs & available tutors
// // // //   const [studentPrefs, setStudentPrefs] = useState([]); 
// // // //   const [availableTutorsMap, setAvailableTutorsMap] = useState({}); 

// // // //   const isAdminRole = (role) => ["owner", "tech_admin", "operations_admin"].includes(role);

// // // //   const getTutorColor = (id) => {
// // // //     const colors = ["#eab308","#3b82f6","#10b981","#8b5cf6","#ee692c","rgba(248, 100, 191, 0.66)"];
// // // //     if (!id) return colors[0];
// // // //     return colors[id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length];
// // // //   };

// // // //   const hexToRgba = (hex, alpha = 0.3) => {
// // // //     const r = parseInt(hex.slice(1,3),16);
// // // //     const g = parseInt(hex.slice(3,5),16);
// // // //     const b = parseInt(hex.slice(5,7),16);
// // // //     return `rgba(${r},${g},${b},${alpha})`;
// // // //   };

// // // //   /* ---------------- FETCH EVENTS & STUDENTS ---------------- */
// // // //   const fetchEvents = useCallback(async () => {
// // // //     const { data: { user } } = await supabase.auth.getUser();
// // // //     if (!user) return;
// // // //     setCurrentUserId(user.id);

// // // //     const { data: profile } = await supabase
// // // //       .from("users")
// // // //       .select("role, full_name")
// // // //       .eq("id", user.id)
// // // //       .single();

// // // //     setUserRole(profile?.role);

// // // //     // Fetch students
// // // //     const { data: studentData } = await supabase
// // // //       .from("students")
// // // //       .select("id, full_name, assigned_tutor_id, grade, parent_phone");

// // // //     const safeStudents = studentData ?? [];
// // // //     setStudents(safeStudents);
// // // //     setUnassignedStudents(safeStudents.filter((s) => !s.assigned_tutor_id));

// // // //     // Fetch calendar events
// // // //     let query = supabase.from("calendar_events").select(`
// // // //       id,
// // // //       title,
// // // //       start_time,
// // // //       end_time,
// // // //       tutor_id,
// // // //       users!calendar_events_tutor_id_fkey(full_name),
// // // //       event_attendance(
// // // //         id,
// // // //         student_id,
// // // //         meet_link,
// // // //         students(full_name)
// // // //       )
// // // //     `);

// // // //     if (profile?.role === "tutor") query = query.eq("tutor_id", user.id);

// // // //     const { data, error } = await query;
// // // //     if (error) return console.error(error);

// // // //     const fullEvents = [];
// // // //     const summary = {};

// // // //     data.forEach((e) => {
// // // //       const tutorColor = getTutorColor(e.tutor_id);
// // // //       const studentNames = e.event_attendance?.map((a) => a.students?.full_name).filter(Boolean) || [];
// // // //       const isFree = studentNames.length === 0;

// // // //       if (!summary[e.tutor_id]) summary[e.tutor_id] = { name: e.users?.full_name || "Tutor", free: 0, booked: 0, color: tutorColor };
// // // //       if (isFree) summary[e.tutor_id].free += 1;
// // // //       else summary[e.tutor_id].booked += 1;

// // // //       fullEvents.push({
// // // //         id: e.id,
// // // //         title: isFree ? "Free Slot" : studentNames.join(", "),
// // // //         start: e.start_time,
// // // //         end: e.end_time,
// // // //         backgroundColor: isFree ? hexToRgba(tutorColor, 0.3) : tutorColor,
// // // //         borderColor: tutorColor,
// // // //         textColor: isFree ? tutorColor : "#ffffff",
// // // //         extendedProps: { tutorId: e.tutor_id, assigned: !isFree },
// // // //       });

// // // //       // Auto break
// // // //       const breakStart = new Date(e.end_time);
// // // //       const breakEnd = new Date(breakStart.getTime() + 15 * 60 * 1000);
// // // //       fullEvents.push({
// // // //         id: "break-" + e.id,
// // // //         start: breakStart,
// // // //         end: breakEnd,
// // // //         display: "background",
// // // //         backgroundColor: "#e5e7eb",
// // // //         extendedProps: { isTempBreak: true },
// // // //       });
// // // //     });

// // // //     setEvents(fullEvents);
// // // //     setTutorSummary(Object.values(summary));
// // // //   }, []);

// // // //   useEffect(() => { fetchEvents(); }, [fetchEvents]);

// // // //   /* ---------------- FETCH STUDENT PREFS & AVAILABLE TUTORS ---------------- */
// // // //   useEffect(() => {
// // // //     const fetchStudentPrefs = async () => {
// // // //       const { data: leadsData } = await supabase
// // // //         .from("leads")
// // // //         .select("id, student_name, class_date, class_time, phone, assigned_tutor_id, students(id)")
// // // //         .is("assigned_tutor_id", null);

// // // //       if (!leadsData) return;

// // // //       setStudentPrefs(leadsData);

// // // //       const tutorsMap = {};
// // // //       for (const lead of leadsData) {
// // // //         const desiredTime = new Date(`${lead.class_date}T${lead.class_time}`);
// // // //         const { data: freeTutors } = await supabase.rpc("get_available_tutors", { desired_time: desiredTime.toISOString() });
// // // //         tutorsMap[lead.students.id] = freeTutors || [];
// // // //       }

// // // //       setAvailableTutorsMap(tutorsMap);
// // // //     };

// // // //     if (isAdminRole(userRole)) fetchStudentPrefs();
// // // //   }, [students, userRole]);

// // // //   /* ---------------- CONFLICT CHECK ---------------- */
// // // //   const hasConflict = (start, end) => {
// // // //     const buffer = 15 * 60 * 1000;
// // // //     return [...events, ...unsavedSlots].some((e) => {
// // // //       if (e.extendedProps?.isTempBreak) return false;
// // // //       if (e.id.toString().startsWith("break-")) return false;
// // // //       const es = new Date(e.start).getTime();
// // // //       const ee = new Date(e.end).getTime();
// // // //       return start.getTime() < ee + buffer && end.getTime() > es - buffer;
// // // //     });
// // // //   };

// // // //   /* ---------------- SAVE SLOT ---------------- */
// // // //   const handleSaveSlots = async () => {
// // // //     for (const s of unsavedSlots) {
// // // //       if (new Date(s.end) - new Date(s.start) !== 3600000) {
// // // //         toast.error("Each slot must be exactly 1 hour");
// // // //         return;
// // // //       }
// // // //     }

// // // //     const { error } = await supabase.from("calendar_events").insert(
// // // //       unsavedSlots.map((s) => ({
// // // //         title: "Free Slot",
// // // //         start_time: s.start,
// // // //         end_time: s.end,
// // // //         tutor_id: currentUserId,
// // // //       }))
// // // //     );

// // // //     if (error) toast.error("Save failed");
// // // //     else {
// // // //       toast.success("Saved");
// // // //       setUnsavedSlots([]);
// // // //       fetchEvents();
// // // //     }
// // // //   };

// // // //   /* ---------------- DELETE SLOT ---------------- */
// // // //   const handleDeleteConfirmed = async () => {
// // // //     const { error } = await supabase.from("calendar_events").delete().eq("id", confirmDelete.slotId);
// // // //     if (error) toast.error("Delete failed");
// // // //     else toast.success("Slot deleted");
// // // //     setConfirmDelete({ open: false, slotId: null });
// // // //     fetchEvents();
// // // //   };

// // // //   /* ---------------- ASSIGN / UNASSIGN ---------------- */
// // // //   const assignStudentToTutor = async (studentId, tutorId, slotId) => {
// // // //     try {
// // // //       await supabase.from("students").update({ assigned_tutor_id: tutorId }).eq("id", studentId);
// // // //       if (slotId) await supabase.from("event_attendance").insert({ event_id: slotId, student_id: studentId });
// // // //       toast.success("Student assigned");
// // // //       fetchEvents();
// // // //     } catch (err) {
// // // //       console.error(err);
// // // //       toast.error("Assignment failed");
// // // //     }
// // // //   };

// // // //   const unassignTutor = async (studentId) => {
// // // //     try {
// // // //       await supabase.from("students").update({ assigned_tutor_id: null }).eq("id", studentId);
// // // //       await supabase.from("event_attendance").delete().eq("student_id", studentId);
// // // //       toast.success("Tutor unassigned");
// // // //       fetchEvents();
// // // //     } catch (err) {
// // // //       console.error(err);
// // // //       toast.error("Unassign failed");
// // // //     }
// // // //   };

// // // //   /* ---------------- EVENT CLICK ---------------- */
// // // //   const handleEventClick = ({ event }) => {
// // // //     if (event.id.startsWith("temp-")) {
// // // //       setUnsavedSlots((p) => p.filter((s) => s.id !== event.id));
// // // //       return;
// // // //     }
// // // //     const isOwner = event.extendedProps.tutorId === currentUserId;
// // // //     if (isOwner && userRole === "tutor" && !event.extendedProps.assigned) {
// // // //       setConfirmDelete({ open: true, slotId: event.id });
// // // //     }
// // // //     if (isAdminRole(userRole) && !event.extendedProps.assigned) {
// // // //       setAssignModal({ open: true, slotId: event.id });
// // // //     }
// // // //   };

// // // //   /* ---------------- DRAGGABLE STUDENTS ---------------- */
// // // //   useEffect(() => {
// // // //     if (sidebarRef.current) {
// // // //       new Draggable(sidebarRef.current, {
// // // //         itemSelector: ".fc-draggable-student",
// // // //         eventData: (el) => ({ id: el.dataset.id, title: el.innerText }),
// // // //       });
// // // //     }
// // // //   }, [unassignedStudents]);

// // // //   const handleEventReceive = async (info) => {
// // // //     const studentId = info.draggedEl.dataset.id;
// // // //     const slotId = info.event.id;
// // // //     await assignStudentToTutor(studentId, info.event.extendedProps.tutorId, slotId);
// // // //   };

// // // //   /* ---------------- UI ---------------- */
// // // //   return (
// // // //     <div className="flex min-h-screen bg-slate-50 relative">
// // // //       <Toaster />

// // // //       {/* -------- SIDEBAR -------- */}
// // // //       {isAdminRole(userRole) && sidebarOpen && (
// // // //         <div ref={sidebarRef} className="absolute left-0 top-0 bottom-0 w-80 bg-white p-4 border-r shadow-lg z-50 overflow-y-auto transition-transform">
// // // //           <div className="flex justify-between items-center mb-3">
// // // //             <h2 className="font-bold text-lg">Unassigned Students</h2>
// // // //             <button onClick={() => setSidebarOpen(false)}><X size={18} /></button>
// // // //           </div>

// // // //           {studentPrefs.map((s) => (
// // // //             <div key={s.students.id} className="p-2 mb-3 rounded-lg border bg-gray-50">
// // // //               <div className="flex justify-between items-center mb-1">
// // // //                 <span className="font-semibold">{s.student_name}</span>
// // // //                 <button onClick={() => unassignTutor(s.students.id)} className="ml-2 bg-red-600 p-1 rounded hover:bg-red-700 text-white text-sm">Unassign</button>
// // // //               </div>
// // // //               <div className="text-xs text-gray-600 mb-2">
// // // //                 Preferred: {s.class_date} {s.class_time}
// // // //               </div>
// // // //               <div className="flex flex-wrap gap-1">
// // // //                 {(availableTutorsMap[s.students.id] || []).map((tutor) => (
// // // //                   <button
// // // //                     key={tutor.id}
// // // //                     onClick={() => assignStudentToTutor(s.students.id, tutor.id, null)}
// // // //                     className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-xs"
// // // //                   >
// // // //                     {tutor.full_name}
// // // //                   </button>
// // // //                 ))}
// // // //                 {!(availableTutorsMap[s.students.id]?.length) && (
// // // //                   <span className="text-gray-400 text-xs">No tutors free</span>
// // // //                 )}
// // // //               </div>
// // // //             </div>
// // // //           ))}
// // // //         </div>
// // // //       )}

// // // //       {isAdminRole(userRole) && !sidebarOpen && (
// // // //         <button onClick={() => setSidebarOpen(true)} className="absolute left-0 top-20 z-50 bg-purple-500 text-white p-2 rounded-r">Open Students</button>
// // // //       )}

// // // //       {/* -------- MAIN -------- */}
// // // //       <div className={`flex-1 p-4 ${sidebarOpen ? "ml-80" : ""} transition-all`}>
// // // //         {/* Tutor Summary */}
// // // //         {isAdminRole(userRole) && (
// // // //           <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
// // // //             {tutorSummary.map((t) => (
// // // //               <div key={t.name} className="p-3 rounded-xl shadow flex flex-col text-white" style={{ backgroundColor: t.color }}>
// // // //                 <span className="font-bold text-lg">{t.name}</span>
// // // //                 <span>Free: {t.free}</span>
// // // //                 <span>Booked: {t.booked}</span>
// // // //               </div>
// // // //             ))}
// // // //           </div>
// // // //         )}

// // // //         {/* Header */}
// // // //         <div className="sticky top-0 z-50 bg-slate-50 mb-3 flex justify-between items-center">
// // // //           <div className="flex gap-3 items-center">
// // // //             <button onClick={() => navigate(-1)} className="p-2 bg-white border rounded-lg shadow-sm">
// // // //               <ArrowLeft size={18} />
// // // //             </button>
// // // //             <h1 className="text-xl font-bold">Global Schedule</h1>
// // // //           </div>
// // // //           {unsavedSlots.length > 0 && (
// // // //             <button onClick={handleSaveSlots} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg">Save Slots</button>
// // // //           )}
// // // //         </div>

// // // //         {/* Calendar */}
// // // //         <div className="bg-white p-4 rounded-2xl border">
// // // //           <FullCalendar
// // // //             ref={calendarRef}
// // // //             plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
// // // //             initialView="timeGridWeek"
// // // //             events={[...events, ...unsavedSlots]}
// // // //             slotDuration="00:15:00"
// // // //             nowIndicator
// // // //             selectable={userRole === "tutor"}
// // // //             editable={isAdminRole(userRole) || userRole === "tutor"}
// // // //             droppable={isAdminRole(userRole)}
// // // //             allDaySlot={false}
// // // //             select={(info) => {
// // // //               if (userRole !== "tutor") return;
// // // //               const end = new Date(info.start.getTime() + 3600000);
// // // //               if (hasConflict(info.start, end)) { toast.error("15-min break required"); return; }
// // // //               setUnsavedSlots((prev) => [...prev, { id: "temp-"+Date.now(), title: "Free Slot", start: info.start, end, backgroundColor: "#fefce8" }]);
// // // //             }}
// // // //             eventClick={handleEventClick}
// // // //             eventReceive={handleEventReceive}
// // // //           />
// // // //         </div>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }
