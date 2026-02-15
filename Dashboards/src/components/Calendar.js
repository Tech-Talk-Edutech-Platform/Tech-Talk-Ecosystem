// // // // import React, { useEffect, useState, useCallback, useRef } from "react";
// // // // import FullCalendar from "@fullcalendar/react";
// // // // import dayGridPlugin from "@fullcalendar/daygrid";
// // // // import timeGridPlugin from "@fullcalendar/timegrid";
// // // // import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
// // // // import { supabase } from "../supabase";
// // // // import { useNavigate } from "react-router-dom";
// // // // import { ArrowLeft } from "lucide-react";
// // // // import toast, { Toaster } from "react-hot-toast";
// // // // import "../../src/fullcalendar.css";

// // // // export default function FullCalendarView() {
// // // //   const navigate = useNavigate();
// // // //   const calendarRef = useRef(null);
// // // //   const sidebarRef = useRef(null);

// // // //   const [events, setEvents] = useState([]);
// // // //   const [students, setStudents] = useState([]);
// // // //   const [unassignedStudents, setUnassignedStudents] = useState([]);
// // // //   const [userRole, setUserRole] = useState(null);
// // // //   const [currentUserId, setCurrentUserId] = useState(null);
// // // //   const [unsavedSlots, setUnsavedSlots] = useState([]);
// // // //   const [assignModal, setAssignModal] = useState({ open: false, slotId: null });
// // // //   const [confirmDelete, setConfirmDelete] = useState({ open: false, slotId: null });

// // // //   // ---------------- Helper: Tutor colors ----------------
// // // //   const getTutorColor = (id) => {
// // // //     const colors = ["#eab308", "#3b82f6", "#10b981", "#8b5cf6", "#f43f5e", "#0ea5e9"];
// // // //     if (!id) return colors[0];
// // // //     return colors[id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length];
// // // //   };

// // // //   // ---------------- Fetch events and students ----------------
// // // //   const fetchEvents = useCallback(async () => {
// // // //     const { data: { user } } = await supabase.auth.getUser();
// // // //     if (!user) return;

// // // //     setCurrentUserId(user.id);

// // // //     // Get user role
// // // //     const { data: profile } = await supabase
// // // //       .from("users")
// // // //       .select("role, full_name")
// // // //       .eq("id", user.id)
// // // //       .single();

// // // //     setUserRole(profile?.role);

// // // //     // Get students
// // // //     const { data: studentData } = await supabase.from("students").select("id, full_name, tutor_id");
// // // //     const studentsArray = studentData || [];
// // // //     setStudents(studentsArray);
// // // //     setUnassignedStudents(studentsArray.filter(s => !s.tutor_id));

// // // //     // Get calendar events
// // // //     let query = supabase
// // // //       .from("calendar_events")
// // // //       .select(`
// // // //         id,
// // // //         title,
// // // //         start_time,
// // // //         end_time,
// // // //         tutor_id,
// // // //         assigned,
// // // //         users!calendar_events_tutor_id_fkey(full_name),
// // // //         event_attendance!event_attendance_event_id_fkey(
// // // //           id,
// // // //           student_id,
// // // //           students!event_attendance_student_id_fkey(full_name)
// // // //         )
// // // //       `);

// // // //     if (profile?.role === "tutor") query = query.eq("tutor_id", user.id);
// // // //     if (profile?.role === "student") query = query.eq("event_attendance.student_id", user.id);

// // // //     const { data, error } = await query;
// // // //     if (error) return console.error(error);

// // // //     const fullEvents = [];
// // // //     data.forEach(e => {
// // // //       const tutorColor = getTutorColor(e.tutor_id);
// // // //       const studentNames = e.event_attendance?.map(a => a.students?.full_name).filter(Boolean) || [];
// // // //       const isFree = studentNames.length === 0 && !e.assigned;

// // // //       fullEvents.push({
// // // //         id: e.id,
// // // //         title: e.title,
// // // //         start: e.start_time,
// // // //         end: e.end_time,
// // // //         backgroundColor: isFree ? "#fde68a" : tutorColor,
// // // //         borderColor: isFree ? "#facc15" : tutorColor,
// // // //         textColor: isFree ? "#854d0e" : "#fff",
// // // //         extendedProps: {
// // // //           tutorId: e.tutor_id,
// // // //           studentNames,
// // // //           assigned: !isFree,
// // // //         },
// // // //       });

// // // //       // Add 15-min break after each slot
// // // //       const breakStart = new Date(e.end_time);
// // // //       const breakEnd = new Date(breakStart.getTime() + 15 * 60 * 1000);
// // // //       fullEvents.push({
// // // //         id: "break-" + e.id,
// // // //         title: "Break",
// // // //         start: breakStart,
// // // //         end: breakEnd,
// // // //         display: "background",
// // // //         backgroundColor: "#e5e7eb",
// // // //         extendedProps: { isTempBreak: true },
// // // //       });
// // // //     });

// // // //     setEvents(fullEvents);
// // // //   }, []);

// // // //   useEffect(() => { fetchEvents(); }, [fetchEvents]);

// // // //   // ---------------- Utility: Check for conflicts ----------------
// // // //   const hasConflict = (start, end) => {
// // // //     const buffer = 15 * 60 * 1000;
// // // //     return [...events, ...unsavedSlots].some(e => {
// // // //       if (e.extendedProps?.isTempBreak) return false;
// // // //       if (e.id.toString().startsWith("break-")) return false;
// // // //       const es = new Date(e.start).getTime();
// // // //       const ee = new Date(e.end).getTime();
// // // //       return start.getTime() < ee + buffer && end.getTime() > es - buffer;
// // // //     });
// // // //   };

// // // //   // ---------------- Event handlers ----------------
// // // //   const handleEventClick = ({ event }) => {
// // // //     const isAdmin = ["owner", "tech_admin", "operations_admin"].includes(userRole);
// // // //     const isOwner = event.extendedProps.tutorId === currentUserId;

// // // //     if (event.id.startsWith("temp-")) {
// // // //       setUnsavedSlots(p => p.filter(s => s.id !== event.id));
// // // //       return;
// // // //     }

// // // //     if (isAdmin && !event.extendedProps.assigned) {
// // // //       setAssignModal({ open: true, slotId: event.id });
// // // //       return;
// // // //     }

// // // //     if (isOwner && userRole === "tutor" && !event.extendedProps.assigned) {
// // // //       setConfirmDelete({ open: true, slotId: event.id });
// // // //     }
// // // //   };

// // // //   const handleEventDrop = async ({ event }) => {
// // // //     const isAdmin = ["owner", "tech_admin", "operations_admin"].includes(userRole);
// // // //     if (!isAdmin) return;

// // // //     const start = new Date(event.start);
// // // //     const end = new Date(event.end);
// // // //     if (hasConflict(start, end)) {
// // // //       toast.error("Cannot move: conflicts with other slot or break");
// // // //       fetchEvents();
// // // //       return;
// // // //     }

// // // //     const { error } = await supabase.from("calendar_events")
// // // //       .update({ start_time: start.toISOString(), end_time: end.toISOString() })
// // // //       .eq("id", event.id);

// // // //     if (!error) toast.success("Slot rescheduled");
// // // //     else toast.error("Reschedule failed");

// // // //     fetchEvents();
// // // //   };

// // // //   const handleEventReceive = async (info) => {
// // // //     const studentId = info.draggedEl.dataset.id;
// // // //     const slotId = info.event.id;

// // // //     const { error } = await supabase.from("event_attendance").insert({ student_id: studentId, event_id: slotId });
// // // //     if (!error) toast.success("Student assigned via drag");
// // // //     else toast.error("Assignment failed");

// // // //     fetchEvents();
// // // //   };

// // // //   const handleSaveSlots = async () => {
// // // //     for (const s of unsavedSlots) {
// // // //       if ((new Date(s.end) - new Date(s.start)) !== 3600000) {
// // // //         toast.error("Each slot must be exactly 1 hour");
// // // //         return;
// // // //       }
// // // //     }

// // // //     const { error } = await supabase.from("calendar_events").insert(
// // // //       unsavedSlots.map(s => ({
// // // //         title: s.title,
// // // //         start_time: s.start,
// // // //         end_time: s.end,
// // // //         tutor_id: currentUserId,
// // // //       }))
// // // //     );

// // // //     if (!error) {
// // // //       setUnsavedSlots([]);
// // // //       fetchEvents();
// // // //       toast.success("Saved");
// // // //     } else toast.error("Save failed");
// // // //   };

// // // //   // ---------------- Scroll to current time ----------------
// // // //   const scrollToNow = () => {
// // // //     if (calendarRef.current) {
// // // //       const calendarApi = calendarRef.current.getApi();
// // // //       const now = new Date();
// // // //       calendarApi.scrollToTime(`${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}:00`);
// // // //     }
// // // //   };
// // // //   useEffect(() => scrollToNow(), [events]);

// // // //   // ---------------- Enable draggable students ----------------
// // // //   useEffect(() => {
// // // //     if (sidebarRef.current) {
// // // //       new Draggable(sidebarRef.current, {
// // // //         itemSelector: ".fc-draggable-student",
// // // //         eventData: el => ({ id: el.dataset.id, title: el.innerText }),
// // // //       });
// // // //     }
// // // //   }, [unassignedStudents]);

// // // //   // ---------------- Render ----------------
// // // //   return (
// // // //     <div className="flex min-h-screen bg-slate-50">
// // // //       <Toaster />

// // // //       {["owner","tech_admin","operations_admin"].includes(userRole) && (
// // // //         <div ref={sidebarRef} className="w-72 bg-white p-4 border-r overflow-y-auto">
// // // //           <h2 className="font-bold text-lg mb-2">Unassigned Students</h2>
// // // //           {unassignedStudents.map(s => (
// // // //             <div key={s.id} className="fc-draggable-student p-2 mb-2 rounded-lg bg-purple-400 text-white cursor-pointer hover:bg-purple-500" data-id={s.id}>
// // // //               {s.full_name}
// // // //             </div>
// // // //           ))}
// // // //         </div>
// // // //       )}

// // // //       <div className="flex-1 p-4">
// // // //         <div className="sticky top-0 z-50 bg-slate-50 mb-2">
// // // //           <div className="flex justify-between items-center py-2 px-4">
// // // //             <div className="flex gap-3 items-center">
// // // //               <button onClick={() => navigate(-1)} className="p-2 bg-white border rounded-lg shadow-sm">
// // // //                 <ArrowLeft size={18} />
// // // //               </button>
// // // //               <h1 className="text-xl font-bold">Global Schedule</h1>
// // // //             </div>
// // // //             <div className="flex gap-4 bg-white px-4 py-1.5 rounded-xl border">
// // // //               <span className="text-green-600 font-bold">Free {events.filter(e => !e.extendedProps?.assigned && !e.id.startsWith("break-")).length}</span>
// // // //               <span className="text-blue-600 font-bold">Booked {events.filter(e => e.extendedProps?.assigned).length}</span>
// // // //               <span className="text-amber-600 font-bold">Unsaved {unsavedSlots.length}</span>
// // // //               {unsavedSlots.length > 0 && (
// // // //                 <button onClick={handleSaveSlots} className="bg-blue-600 text-white px-3 rounded-lg text-xs">Save</button>
// // // //               )}
// // // //             </div>
// // // //           </div>
// // // //         </div>

// // // //         <div className="bg-white p-4 rounded-2xl border">
// // // //           <FullCalendar
// // // //             ref={calendarRef}
// // // //             plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
// // // //             initialView="timeGridWeek"
// // // //             events={[...events, ...unsavedSlots]}
// // // //             slotDuration="00:15:00"
// // // //             slotLabelInterval="01:00"
// // // //             nowIndicator
// // // //             selectable={userRole === "tutor"}
// // // //             editable={["tutor","owner","tech_admin","operations_admin"].includes(userRole)}
// // // //             allDaySlot={false}
// // // //             select={(info) => {
// // // //               if (userRole !== "tutor") return;
// // // //               const end = new Date(info.start.getTime() + 3600000);
// // // //               if (hasConflict(info.start, end)) return toast.error("15-min break required");
// // // //               setUnsavedSlots(p => [...p, {
// // // //                 id: "temp-" + Date.now(),
// // // //                 title: "Free Slot",
// // // //                 start: info.start,
// // // //                 end,
// // // //                 backgroundColor: "#fde68a",
// // // //                 extendedProps: { tutorId: currentUserId }
// // // //               }]);
// // // //             }}
// // // //             eventClick={handleEventClick}
// // // //             eventDrop={handleEventDrop}
// // // //             eventReceive={handleEventReceive}
// // // //           />
// // // //         </div>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }

// // // // import React, { useEffect, useState, useCallback, useRef } from "react";
// // // // import timeGridPlugin from "@fullcalendar/timegrid";
// // // // import FullCalendar from "@fullcalendar/react";
// // // // import dayGridPlugin from "@fullcalendar/daygrid";
// // // // import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
// // // // import { supabase } from "../supabase";
// // // // import { useNavigate } from "react-router-dom";
// // // // import { ArrowLeft } from "lucide-react";
// // // // import toast, { Toaster } from "react-hot-toast";
// // // // import "../../src/fullcalendar.css";

// // // // export default function FullCalendarView() {
// // // //   const navigate = useNavigate();
// // // //   const calendarRef = useRef(null);
// // // //   const sidebarRef = useRef(null);

// // // //   const [events, setEvents] = useState([]);
// // // //   const [userRole, setUserRole] = useState(null);
// // // //   const [currentUserId, setCurrentUserId] = useState(null);
// // // //   const [students, setStudents] = useState([]);
// // // //   const [unsavedSlots, setUnsavedSlots] = useState([]);
// // // //   const [assignModal, setAssignModal] = useState({ open: false, slotId: null });
// // // //   const [confirmDelete, setConfirmDelete] = useState({ open: false, slotId: null });
// // // //   const [unassignedStudents, setUnassignedStudents] = useState([]);

// // // //   const getTutorColor = (id) => {
// // // //     const colors = ["#eab308", "#3b82f6", "#10b981", "#8b5cf6", "#f43f5e", "#0ea5e9"];
// // // //     if (!id) return colors[0];
// // // //     return colors[id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length];
// // // //   };

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

// // // //     // ✅ Safe fetch: default to empty array
// // // //     const { data: studentData } = await supabase.from("students").select("id, full_name, tutor_id");
// // // //     const studentsArray = studentData || [];
// // // //     setStudents(studentsArray);
// // // //     setUnassignedStudents(studentsArray.filter(s => !s.tutor_id));

// // // //     let query = supabase
// // // //       .from("calendar_events")
// // // //       .select(`
// // // //         id,
// // // //         title,
// // // //         start_time,
// // // //         end_time,
// // // //         tutor_id,
// // // //         assigned,
// // // //         users!calendar_events_tutor_id_fkey(full_name),
// // // //         event_attendance!event_attendance_event_id_fkey(
// // // //           id,
// // // //           student_id,
// // // //           students!event_attendance_student_id_fkey(full_name)
// // // //         )
// // // //       `);

// // // //     if (profile?.role === "tutor") query = query.eq("tutor_id", user.id);
// // // //     if (profile?.role === "student") query = query.eq("event_attendance.student_id", user.id);

// // // //     const { data, error } = await query;
// // // //     if (error) return console.error(error);

// // // //     const fullEvents = [];
// // // //     data.forEach(e => {
// // // //       const tutorColor = getTutorColor(e.tutor_id);
// // // //       const studentNames = e.event_attendance?.map(a => a.students?.full_name).filter(Boolean) || [];
// // // //       const isFree = studentNames.length === 0 && !e.assigned;

// // // //       fullEvents.push({
// // // //         id: e.id,
// // // //         title: e.title,
// // // //         start: e.start_time,
// // // //         end: e.end_time,
// // // //         backgroundColor: isFree ? "#fde68a" : tutorColor,
// // // //         borderColor: isFree ? "#facc15" : tutorColor,
// // // //         textColor: isFree ? "#854d0e" : "#fff",
// // // //         extendedProps: {
// // // //           tutorId: e.tutor_id,
// // // //           studentNames,
// // // //           assigned: !isFree
// // // //         }
// // // //       });

// // // //       const breakStart = new Date(e.end_time);
// // // //       const breakEnd = new Date(breakStart.getTime() + 15 * 60 * 1000);
// // // //       fullEvents.push({
// // // //         id: "break-" + e.id,
// // // //         title: "Break",
// // // //         start: breakStart,
// // // //         end: breakEnd,
// // // //         display: "background",
// // // //         backgroundColor: "#e5e7eb",
// // // //         extendedProps: { isTempBreak: true }
// // // //       });
// // // //     });

// // // //     setEvents(fullEvents);
// // // //   }, []);

// // // //   useEffect(() => { fetchEvents(); }, [fetchEvents]);

// // // //   const hasConflict = (start, end) => {
// // // //     const buffer = 15 * 60 * 1000;
// // // //     return [...events, ...unsavedSlots].some(e => {
// // // //       if (e.extendedProps?.isTempBreak) return false;
// // // //       if (e.id.toString().startsWith("break-")) return false;
// // // //       const es = new Date(e.start).getTime();
// // // //       const ee = new Date(e.end).getTime();
// // // //       return start.getTime() < ee + buffer && end.getTime() > es - buffer;
// // // //     });
// // // //   };

// // // //   // ... rest of your handlers remain unchanged ...
// // // //   // handleSaveSlots, handleEventClick, handleDeleteConfirmed, handleEventDrop, etc.

// // // //   return (
// // // //     <div className="flex min-h-screen bg-slate-50">
// // // //       <Toaster />
// // // //       {["owner","tech_admin","operations_admin"].includes(userRole) && (
// // // //         <div ref={sidebarRef} className="w-72 bg-white p-4 border-r overflow-y-auto">
// // // //           <h2 className="font-bold text-lg mb-2">Unassigned Students</h2>
// // // //           {unassignedStudents.map(s => (
// // // //             <div key={s.id} className="fc-draggable-student p-2 mb-2 rounded-lg bg-purple-400 text-white cursor-pointer hover:bg-purple-500" data-id={s.id}>
// // // //               {s.full_name}
// // // //             </div>
// // // //           ))}
// // // //         </div>
// // // //       )}

// // // //       <div className="flex-1 p-4">
// // // //         <div className="sticky top-0 z-50 bg-slate-50 mb-2">
// // // //           <div className="flex justify-between items-center py-2 px-4">
// // // //             <div className="flex gap-3 items-center">
// // // //               <button onClick={() => navigate(-1)} className="p-2 bg-white border rounded-lg shadow-sm">
// // // //                 <ArrowLeft size={18} />
// // // //               </button>
// // // //               <h1 className="text-xl font-bold">Global Schedule</h1>
// // // //             </div>
// // // //             <div className="flex gap-4 bg-white px-4 py-1.5 rounded-xl border">
// // // //               <span className="text-green-600 font-bold">Free {events.filter(e => !e.extendedProps?.assigned && !e.id.startsWith("break-")).length}</span>
// // // //               <span className="text-blue-600 font-bold">Booked {events.filter(e => e.extendedProps?.assigned).length}</span>
// // // //               <span className="text-amber-600 font-bold">Unsaved {unsavedSlots.length}</span>
// // // //               {unsavedSlots.length > 0 && (
// // // //                 <button onClick={handleSaveSlots} className="bg-blue-600 text-white px-3 rounded-lg text-xs">Save</button>
// // // //               )}
// // // //             </div>
// // // //           </div>
// // // //         </div>

// // // //         <div className="bg-white p-4 rounded-2xl border">
// // // //           <FullCalendar
// // // //             ref={calendarRef}
// // // //             plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
// // // //             initialView="timeGridWeek"
// // // //             events={[...events, ...unsavedSlots]}
// // // //             slotDuration="00:15:00"
// // // //             slotLabelInterval="01:00"
// // // //             nowIndicator
// // // //             selectable={userRole === "tutor"}
// // // //             editable={["tutor","owner","tech_admin","operations_admin"].includes(userRole)}
// // // //             allDaySlot={false}
// // // //             select={(info) => {
// // // //               if (userRole !== "tutor") return;
// // // //               const end = new Date(info.start.getTime() + 3600000);
// // // //               if (hasConflict(info.start, end)) return toast.error("15-min break required");
// // // //               setUnsavedSlots(p => [...p, {
// // // //                 id: "temp-" + Date.now(),
// // // //                 title: "Free Slot",
// // // //                 start: info.start,
// // // //                 end,
// // // //                 backgroundColor: "#fde68a",
// // // //                 extendedProps: { tutorId: currentUserId }
// // // //               }]);
// // // //             }}
// // // //             eventClick={handleEventClick}
// // // //             eventDrop={handleEventDrop}
// // // //             eventReceive={handleEventReceive}
// // // //           />
// // // //         </div>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }
// // // // ======================================THE MAIN========================================
// // // // import React, { useEffect, useState, useCallback, useRef } from "react";
// // // // import FullCalendar from "@fullcalendar/react";
// // // // import dayGridPlugin from "@fullcalendar/daygrid";
// // // // import timeGridPlugin from "@fullcalendar/timegrid";
// // // // import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
// // // // import { supabase } from "../supabase";
// // // // import { useNavigate } from "react-router-dom";
// // // // import { ArrowLeft } from "lucide-react";
// // // // import toast, { Toaster } from "react-hot-toast";
// // // // import "../../src/fullcalendar.css";

// // // // export default function FullCalendarView() {
// // // //   const navigate = useNavigate();
// // // //   const calendarRef = useRef(null);
// // // //   const sidebarRef = useRef(null);

// // // //   const [events, setEvents] = useState([]);
// // // //   const [userRole, setUserRole] = useState(null);
// // // //   const [currentUserId, setCurrentUserId] = useState(null);
// // // //   const [students, setStudents] = useState([]);
// // // //   const [unsavedSlots, setUnsavedSlots] = useState([]);
// // // //   const [confirmDelete, setConfirmDelete] = useState({ open: false, slotId: null });
// // // //   const [unassignedStudents, setUnassignedStudents] = useState([]);

// // // //   const isAdminRole = (role) =>
// // // //     ["owner", "tech_admin", "operations_admin"].includes(role);

// // // //   const getTutorColor = (id) => {
// // // //     const colors = ["#eab308", "#3b82f6", "#10b981", "#8b5cf6", "#f43f5e", "#0ea5e9"];
// // // //     if (!id) return colors[0];
// // // //     return colors[
// // // //       id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length
// // // //     ];
// // // //   };

// // // //   const fetchEvents = useCallback(async () => {
// // // //     const {
// // // //       data: { user },
// // // //     } = await supabase.auth.getUser();
// // // //     if (!user) return;

// // // //     setCurrentUserId(user.id);

// // // //     const { data: profile } = await supabase
// // // //       .from("users")
// // // //       .select("role")
// // // //       .eq("id", user.id)
// // // //       .single();

// // // //     setUserRole(profile?.role);

// // // //     /* ---------------- STUDENTS ---------------- */
// // // //     const { data: studentData } = await supabase
// // // //       .from("students")
// // // //       .select("id, full_name, tutor_id");

// // // //     const safeStudents = studentData ?? [];
// // // //     setStudents(safeStudents);
// // // //     setUnassignedStudents(safeStudents.filter((s) => !s.tutor_id));

// // // //     /* ---------------- EVENTS ---------------- */
// // // //     let query = supabase.from("calendar_events").select(`
// // // //         id,
// // // //         title,
// // // //         start_time,
// // // //         end_time,
// // // //         tutor_id,
// // // //         users!calendar_events_tutor_id_fkey(full_name),
// // // //         event_attendance(
// // // //           id,
// // // //           student_id,
// // // //           students(full_name)
// // // //         )
// // // //       `);

// // // //     if (profile?.role === "tutor") {
// // // //       query = query.eq("tutor_id", user.id);
// // // //     }

// // // //     const { data, error } = await query;
// // // //     if (error) {
// // // //       console.error(error);
// // // //       return;
// // // //     }

// // // //     const fullEvents = [];

// // // //     data.forEach((e) => {
// // // //       const tutorColor = getTutorColor(e.tutor_id);

// // // //       const studentNames =
// // // //         e.event_attendance?.map((a) => a.students?.full_name).filter(Boolean) ||
// // // //         [];

// // // //       const isFree = studentNames.length === 0;

// // // //       fullEvents.push({
// // // //         id: e.id,
// // // //         title: isFree ? "Free Slot" : studentNames.join(", "),
// // // //         start: e.start_time,
// // // //         end: e.end_time,
// // // //         backgroundColor: isFree ? "#fde68a" : tutorColor,
// // // //         borderColor: isFree ? "#facc15" : tutorColor,
// // // //         textColor: isFree ? "#854d0e" : "#ffffff",
// // // //         extendedProps: {
// // // //           tutorId: e.tutor_id,
// // // //           assigned: !isFree,
// // // //         },
// // // //       });

// // // //       /* ---------- AUTO BREAK ---------- */
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
// // // //   }, []);

// // // //   useEffect(() => {
// // // //     fetchEvents();
// // // //   }, [fetchEvents]);

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
// // // //     const { error } = await supabase
// // // //       .from("calendar_events")
// // // //       .delete()
// // // //       .eq("id", confirmDelete.slotId);

// // // //     if (error) toast.error("Delete failed");
// // // //     else toast.success("Slot deleted");

// // // //     setConfirmDelete({ open: false, slotId: null });
// // // //     fetchEvents();
// // // //   };

// // // //   /* ---------------- DRAG STUDENT ---------------- */
// // // //   useEffect(() => {
// // // //     if (sidebarRef.current) {
// // // //       new Draggable(sidebarRef.current, {
// // // //         itemSelector: ".fc-draggable-student",
// // // //         eventData: (el) => ({
// // // //           id: el.dataset.id,
// // // //           title: el.innerText,
// // // //         }),
// // // //       });
// // // //     }
// // // //   }, [unassignedStudents]);

// // // //   const handleEventReceive = async (info) => {
// // // //     const studentId = info.draggedEl.dataset.id;
// // // //     const slotId = info.event.id;

// // // //     const { error } = await supabase
// // // //       .from("event_attendance")
// // // //       .insert({ student_id: studentId, event_id: slotId });

// // // //     if (error) toast.error("Assignment failed");
// // // //     else toast.success("Student assigned");

// // // //     fetchEvents();
// // // //   };

// // // //   /* ---------------- UI ---------------- */
// // // //   return (
// // // //     <div className="flex min-h-screen bg-slate-50">
// // // //       <Toaster />

// // // //       {isAdminRole(userRole) && (
// // // //         <div
// // // //           ref={sidebarRef}
// // // //           className="w-72 bg-white p-4 border-r overflow-y-auto"
// // // //         >
// // // //           <h2 className="font-bold text-lg mb-3">Unassigned Students</h2>

// // // //           {unassignedStudents.map((s) => (
// // // //             <div
// // // //               key={s.id}
// // // //               data-id={s.id}
// // // //               className="fc-draggable-student p-2 mb-2 rounded-lg bg-purple-500 text-white cursor-pointer hover:bg-purple-600"
// // // //             >
// // // //               {s.full_name}
// // // //             </div>
// // // //           ))}
// // // //         </div>
// // // //       )}

// // // //       <div className="flex-1 p-4">
// // // //         <div className="flex justify-between items-center mb-3">
// // // //           <div className="flex gap-3 items-center">
// // // //             <button
// // // //               onClick={() => navigate(-1)}
// // // //               className="p-2 bg-white border rounded-lg shadow-sm"
// // // //             >
// // // //               <ArrowLeft size={18} />
// // // //             </button>
// // // //             <h1 className="text-xl font-bold">Global Schedule</h1>
// // // //           </div>

// // // //           {unsavedSlots.length > 0 && (
// // // //             <button
// // // //               onClick={handleSaveSlots}
// // // //               className="bg-blue-600 text-white px-4 py-1.5 rounded-lg"
// // // //             >
// // // //               Save Slots
// // // //             </button>
// // // //           )}
// // // //         </div>

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
// // // //             allDaySlot={false}
// // // //             select={(info) => {
// // // //               if (userRole !== "tutor") return;

// // // //               const end = new Date(info.start.getTime() + 3600000);

// // // //               if (hasConflict(info.start, end)) {
// // // //                 toast.error("15-min break required");
// // // //                 return;
// // // //               }

// // // //               setUnsavedSlots((prev) => [
// // // //                 ...prev,
// // // //                 {
// // // //                   id: "temp-" + Date.now(),
// // // //                   title: "Free Slot",
// // // //                   start: info.start,
// // // //                   end,
// // // //                   backgroundColor: "#fde68a",
// // // //                 },
// // // //               ]);
// // // //             }}
// // // //             eventReceive={handleEventReceive}
// // // //           />
// // // //         </div>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }
// // // // ==============================================================
// // // // --------------------------------------------------------
// // // // import React, { useEffect, useState, useCallback, useRef } from "react";
// // // // import FullCalendar from "@fullcalendar/react";
// // // // import dayGridPlugin from "@fullcalendar/daygrid";
// // // // import timeGridPlugin from "@fullcalendar/timegrid";
// // // // import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
// // // // import { supabase } from "../supabase";
// // // // import { useNavigate } from "react-router-dom";
// // // // import { ArrowLeft, UserPlus } from "lucide-react";
// // // // import toast, { Toaster } from "react-hot-toast";
// // // // import "../../src/fullcalendar.css";

// // // // export default function FullCalendarView() {
// // // // //   const { data: studentData } = supabase.from("students").select("id, full_name, tutor_id");
// // // // // const studentsArray = studentData || [];
// // // // // setStudents(studentsArray);
// // // // // setUnassignedStudents(studentsArray.filter(s => !s.tutor_id));

// // // //   const navigate = useNavigate();
// // // //   const calendarRef = useRef(null);
// // // //   const sidebarRef = useRef(null);

// // // //   const [events, setEvents] = useState([]);
// // // //   const [userRole, setUserRole] = useState(null);
// // // //   const [currentUserId, setCurrentUserId] = useState(null);
// // // //   const [students, setStudents] = useState([]);
// // // //   const [unsavedSlots, setUnsavedSlots] = useState([]);
// // // //   const [assignModal, setAssignModal] = useState({ open: false, slotId: null });
// // // //   const [confirmDelete, setConfirmDelete] = useState({ open: false, slotId: null });
// // // //   const [unassignedStudents, setUnassignedStudents] = useState([]);

// // // //   const getTutorColor = (id) => {
// // // //     const colors = ["#eab308", "#3b82f6", "#10b981", "#8b5cf6", "#f43f5e", "#0ea5e9"];
// // // //     if (!id) return colors[0];
// // // //     return colors[id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length];
// // // //   };

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

// // // //     // const { data: studentData } = await supabase.from("students").select("id, full_name, tutor_id");
// // // //     // setStudents(studentData || []);
// // // //     // setUnassignedStudents(studentData.filter(s => !s.tutor_id));
// // // //     const { data: studentData, error: studentError } = await supabase
// // // //   .from("students")
// // // //   .select("id, full_name, tutor_id");

// // // // if (studentError) {
// // // //   console.error("Students fetch error:", studentError);
// // // //   setStudents([]);
// // // //   setUnassignedStudents([]);
// // // // } else {
// // // //   const safeStudents = studentData ?? [];
// // // //   setStudents(safeStudents);
// // // //   setUnassignedStudents(safeStudents.filter(s => !s.tutor_id));
// // // // }


// // // //     let query = supabase
// // // //       .from("calendar_events")
// // // //       .select(`
// // // //         id,
// // // //         title,
// // // //         start_time,
// // // //         end_time,
// // // //         tutor_id,
// // // //         // assigned,
// // // //         users!calendar_events_tutor_id_fkey(full_name),
// // // //         event_attendance!event_attendance_event_id_fkey(
// // // //           id,
// // // //           student_id,
// // // //           students!event_attendance_student_id_fkey(full_name)
// // // //         )
// // // //       `);

// // // //     if (profile?.role === "tutor") query = query.eq("tutor_id", user.id);
// // // //     if (profile?.role === "student") query = query.eq("event_attendance.student_id", user.id);
// // // // const studentNames =
// // // //   e.event_attendance?.map(a => a.students?.full_name).filter(Boolean) || [];

// // // // const isFree = studentNames.length === 0;
// // // // extendedProps: {
// // // //   tutorId: e.tutor_id,
// // // //   studentNames,
// // // //   assigned: studentNames.length > 0
// // // // }

// // // //     const { data, error } = await query;
// // // //     if (error) return console.error(error);

// // // //     const fullEvents = [];
// // // //     data.forEach(e => {
// // // //       const tutorColor = getTutorColor(e.tutor_id);
// // // //       const studentNames = e.event_attendance?.map(a => a.students?.full_name).filter(Boolean) || [];
// // // //       const isFree = studentNames.length === 0 && !e.assigned;

// // // //       fullEvents.push({
// // // //         id: e.id,
// // // //         title: e.title,
// // // //         start: e.start_time,
// // // //         end: e.end_time,
// // // //         backgroundColor: isFree ? "#fde68a" : tutorColor,
// // // //         borderColor: isFree ? "#facc15" : tutorColor,
// // // //         textColor: isFree ? "#854d0e" : "#fff",
// // // //         extendedProps: {
// // // //           tutorId: e.tutor_id,
// // // //           studentNames,
// // // //           assigned: !isFree
// // // //         }
// // // //       });

// // // //       const breakStart = new Date(e.end_time);
// // // //       const breakEnd = new Date(breakStart.getTime() + 15*60*1000);
// // // //       fullEvents.push({
// // // //         id: "break-" + e.id,
// // // //         title: "Break",
// // // //         start: breakStart,
// // // //         end: breakEnd,
// // // //         display: "background",
// // // //         backgroundColor: "#e5e7eb",
// // // //         extendedProps: { isTempBreak: true }
// // // //       });
// // // //     });

// // // //     setEvents(fullEvents);
// // // //   }, []);

// // // //   useEffect(() => { fetchEvents(); }, [fetchEvents]);

// // // //   const hasConflict = (start, end) => {
// // // //     const buffer = 15 * 60 * 1000;
// // // //     return [...events, ...unsavedSlots].some(e => {
// // // //       if (e.extendedProps?.isTempBreak) return false;
// // // //       if (e.id.toString().startsWith("break-")) return false;
// // // //       const es = new Date(e.start).getTime();
// // // //       const ee = new Date(e.end).getTime();
// // // //       return start.getTime() < ee + buffer && end.getTime() > es - buffer;
// // // //     });
// // // //   };

// // // //   const handleSaveSlots = async () => {
// // // //     for (const s of unsavedSlots) {
// // // //       if ((new Date(s.end) - new Date(s.start)) !== 3600000) {
// // // //         toast.error("Each slot must be exactly 1 hour");
// // // //         return;
// // // //       }
// // // //     }
// // // //     const { error } = await supabase.from("calendar_events").insert(
// // // //       unsavedSlots.map(s => ({
// // // //         title: s.title,
// // // //         start_time: s.start,
// // // //         end_time: s.end,
// // // //         tutor_id: currentUserId
// // // //       }))
// // // //     );
// // // //     if (!error) {
// // // //       setUnsavedSlots([]);
// // // //       fetchEvents();
// // // //       toast.success("Saved");
// // // //     } else toast.error("Save failed");
// // // //   };

// // // //   const handleEventClick = ({ event }) => {
// // // //     const isAdmin = ["owner","tech_admin","operations_admin"].includes(userRole);
// // // //     const isOwner = event.extendedProps.tutorId === currentUserId;

// // // //     if (event.id.startsWith("temp-")) {
// // // //       setUnsavedSlots(p => p.filter(s => s.id !== event.id));
// // // //       return;
// // // //     }

// // // //     if (isAdmin && !event.extendedProps.assigned) {
// // // //       setAssignModal({ open: true, slotId: event.id });
// // // //       return;
// // // //     }

// // // //     if (isOwner && userRole === "tutor" && !event.extendedProps.assigned) {
// // // //       setConfirmDelete({ open: true, slotId: event.id });
// // // //     }
// // // //   };

// // // //   const handleDeleteConfirmed = async () => {
// // // //     const { error } = await supabase.from("calendar_events").delete().eq("id", confirmDelete.slotId);
// // // //     if (!error) toast.success("Slot deleted");
// // // //     else toast.error("Delete failed");
// // // //     setConfirmDelete({ open: false, slotId: null });
// // // //     fetchEvents();
// // // //   };

// // // //   const scrollToNow = () => {
// // // //     if (calendarRef.current) {
// // // //       const calendarApi = calendarRef.current.getApi();
// // // //       const now = new Date();
// // // //       calendarApi.scrollToTime(`${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}:00`);
// // // //     }
// // // //   };

// // // //   useEffect(() => scrollToNow(), [events]);

// // // //   const handleEventDrop = async ({ event }) => {
// // // //     const isAdmin = ["owner","tech_admin","operations_admin"].includes(userRole);
// // // //     if (!isAdmin) return;

// // // //     const start = new Date(event.start);
// // // //     const end = new Date(event.end);
// // // //     if (hasConflict(start, end)) {
// // // //       toast.error("Cannot move: conflicts with other slot or break");
// // // //       fetchEvents();
// // // //       return;
// // // //     }

// // // //     const { error } = await supabase.from("calendar_events")
// // // //       .update({ start_time: start.toISOString(), end_time: end.toISOString() })
// // // //       .eq("id", event.id);

// // // //     if (!error) toast.success("Slot rescheduled");
// // // //     else toast.error("Reschedule failed");

// // // //     fetchEvents();
// // // //   };

// // // //   useEffect(() => {
// // // //     if (sidebarRef.current) {
// // // //       new Draggable(sidebarRef.current, {
// // // //         itemSelector: ".fc-draggable-student",
// // // //         eventData: el => ({ id: el.dataset.id, title: el.innerText })
// // // //       });
// // // //     }
// // // //   }, [unassignedStudents]);

// // // //   const handleEventReceive = async (info) => {
// // // //     const studentId = info.draggedEl.dataset.id;
// // // //     const slotId = info.event.id;

// // // //     // Assign student to slot
// // // //     const { error } = await supabase.from("event_attendance").insert({ student_id: studentId, event_id: slotId });
// // // //     if (!error) toast.success("Student assigned via drag");
// // // //     else toast.error("Assignment failed");

// // // //     fetchEvents();
// // // //   };

// // // //   return (
// // // //     <div className="flex min-h-screen bg-slate-50">
// // // //       <Toaster />

// // // //       {/* Sidebar for Admin */}
// // // //       {["owner","tech_admin","operations_admin"].includes(userRole) && (
// // // //         <div ref={sidebarRef} className="w-72 bg-white p-4 border-r overflow-y-auto">
// // // //           <h2 className="font-bold text-lg mb-2">Unassigned Students</h2>
// // // //           {unassignedStudents.map(s => (
// // // //             <div key={s.id} className="fc-draggable-student p-2 mb-2 rounded-lg bg-purple-400 text-white cursor-pointer hover:bg-purple-500" data-id={s.id}>
// // // //               {s.full_name}
// // // //             </div>
// // // //           ))}
// // // //         </div>
// // // //       )}

// // // //       <div className="flex-1 p-4">
// // // //         <div className="sticky top-0 z-50 bg-slate-50 mb-2">
// // // //           <div className="flex justify-between items-center py-2 px-4">
// // // //             <div className="flex gap-3 items-center">
// // // //               <button onClick={() => navigate(-1)} className="p-2 bg-white border rounded-lg shadow-sm">
// // // //                 <ArrowLeft size={18} />
// // // //               </button>
// // // //               <h1 className="text-xl font-bold">Global Schedule</h1>
// // // //             </div>

// // // //             <div className="flex gap-4 bg-white px-4 py-1.5 rounded-xl border">
// // // //               <span className="text-green-600 font-bold">Free {events.filter(e => !e.extendedProps?.assigned && !e.id.startsWith("break-")).length}</span>
// // // //               <span className="text-blue-600 font-bold">Booked {events.filter(e => e.extendedProps?.assigned).length}</span>
// // // //               <span className="text-amber-600 font-bold">Unsaved {unsavedSlots.length}</span>
// // // //               {unsavedSlots.length > 0 && (
// // // //                 <button onClick={handleSaveSlots} className="bg-blue-600 text-white px-3 rounded-lg text-xs">Save</button>
// // // //               )}
// // // //             </div>
// // // //           </div>
// // // //         </div>

// // // //         <div className="bg-white p-4 rounded-2xl border">
// // // //           <FullCalendar
// // // //             ref={calendarRef}
// // // //             plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
// // // //             initialView="timeGridWeek"
// // // //             events={[...events, ...unsavedSlots]}
// // // //             slotDuration="00:15:00"
// // // //             slotLabelInterval="01:00"
// // // //             nowIndicator
// // // //             selectable={userRole === "tutor"}
// // // //             editable={["tutor","owner","tech_admin","operations_admin"].includes(userRole)}
// // // //             allDaySlot={false}
// // // //             select={(info) => {
// // // //               if (userRole !== "tutor") return;
// // // //               const end = new Date(info.start.getTime() + 3600000);
// // // //               if (hasConflict(info.start, end)) return toast.error("15-min break required");
// // // //               setUnsavedSlots(p => [...p, {
// // // //                 id: "temp-" + Date.now(),
// // // //                 title: "Free Slot",
// // // //                 start: info.start,
// // // //                 end,
// // // //                 backgroundColor: "#fde68a",
// // // //                 extendedProps: { tutorId: currentUserId }
// // // //               }]);
// // // //             }}
// // // //             eventClick={handleEventClick}
// // // //             eventDrop={handleEventDrop}
// // // //             eventReceive={handleEventReceive} // Drag student into slot
// // // //           />
// // // //         </div>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }
// // // // --------------------------------------------------------
// // // // import React, { useEffect, useState, useCallback, useRef } from "react";
// // // // import FullCalendar from "@fullcalendar/react";
// // // // import dayGridPlugin from "@fullcalendar/daygrid";
// // // // import timeGridPlugin from "@fullcalendar/timegrid";
// // // // import interactionPlugin from "@fullcalendar/interaction";
// // // // import { supabase } from "../supabase";
// // // // import { useNavigate } from "react-router-dom";
// // // // import { ArrowLeft, UserPlus } from "lucide-react";
// // // // import toast, { Toaster } from "react-hot-toast";
// // // // import "../../src/fullcalendar.css";

// // // // export default function FullCalendarView() {
// // // //   const navigate = useNavigate();
// // // //   const calendarRef = useRef(null);

// // // //   const [events, setEvents] = useState([]);
// // // //   const [userRole, setUserRole] = useState(null);
// // // //   const [currentUserId, setCurrentUserId] = useState(null);
// // // //   const [currentUserName, setCurrentUserName] = useState("");
// // // //   const [unsavedSlots, setUnsavedSlots] = useState([]);
// // // //   const [students, setStudents] = useState([]);
// // // //   const [assignModal, setAssignModal] = useState({ open: false, slotId: null });
// // // //   const [confirmDelete, setConfirmDelete] = useState({ open: false, slotId: null });

// // // //   const getTutorColor = (id) => {
// // // //     const colors = ["#eab308", "#3b82f6", "#10b981", "#8b5cf6", "#f43f5e", "#0ea5e9"];
// // // //     if (!id) return colors[0];
// // // //     return colors[id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length];
// // // //   };

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
// // // //     setCurrentUserName(profile?.full_name || "Tutor");

// // // //     const { data: studentData } = await supabase.from("students").select("id, full_name");
// // // //     setStudents(studentData || []);

// // // //     let query = supabase
// // // //       .from("calendar_events")
// // // //       .select(`
// // // //         id,
// // // //         title,
// // // //         start_time,
// // // //         end_time,
// // // //         tutor_id,
// // // //         users!calendar_events_tutor_id_fkey(full_name),
// // // //         event_attendance!event_attendance_event_id_fkey(
// // // //           id,
// // // //           student_id,
// // // //           students!event_attendance_student_id_fkey(full_name)
// // // //         )
// // // //       `);

// // // //     if (profile?.role === "tutor") query = query.eq("tutor_id", user.id);
// // // //     if (profile?.role === "student") query = query.eq("event_attendance.student_id", user.id);

// // // //     const { data, error } = await query;
// // // //     if (error) return console.error(error);

// // // //     const fullEvents = [];

// // // //     data.forEach(e => {
// // // //       const tutorColor = getTutorColor(e.tutor_id);
// // // //       const studentNames = e.event_attendance?.map(a => a.students?.full_name).filter(Boolean) || [];
// // // //       const isFree = studentNames.length === 0;

// // // //       fullEvents.push({
// // // //         id: e.id,
// // // //         title: e.title,
// // // //         start: e.start_time,
// // // //         end: e.end_time,
// // // //         backgroundColor: isFree ? "#fefce8" : tutorColor,
// // // //         borderColor: tutorColor,
// // // //         textColor: isFree ? "#854d0e" : "#fff",
// // // //         extendedProps: {
// // // //           tutorId: e.tutor_id,
// // // //           tutorName: e.users?.full_name || "Tutor",
// // // //           studentNames,
// // // //           assigned: !isFree
// // // //         }
// // // //       });

// // // //       const breakStart = new Date(e.end_time);
// // // //       const breakEnd = new Date(breakStart.getTime() + 15 * 60 * 1000);

// // // //       fullEvents.push({
// // // //         id: "break-" + e.id,
// // // //         title: "Break",
// // // //         start: breakStart,
// // // //         end: breakEnd,
// // // //         display: "background",
// // // //         backgroundColor: "#e5e7eb",
// // // //         extendedProps: { isTempBreak: true }
// // // //       });
// // // //     });

// // // //     setEvents(fullEvents);
// // // //   }, []);
// // // // const fullEvents = data.map(e => ({
// // // //   id: e.id,
// // // //   title: e.title,
// // // //   start: e.start_time,
// // // //   end: e.end_time,
// // // //   backgroundColor: e.assigned ? getTutorColor(e.tutor_id) : "#fde68a", // yellow for unassigned
// // // //   borderColor: e.assigned ? getTutorColor(e.tutor_id) : "#facc15",
// // // //   textColor: e.assigned ? "#fff" : "#854d0e",
// // // //   extendedProps: { ...e, assigned: !!e.assigned }
// // // // }));

// // // //   useEffect(() => { fetchEvents(); }, [fetchEvents]);

// // // //   const hasConflict = (start, end) => {
// // // //     const buffer = 15 * 60 * 1000;
// // // //     return [...events, ...unsavedSlots].some(e => {
// // // //       if (e.extendedProps?.isTempBreak) return false;
// // // //       if (e.id.toString().startsWith("break-")) return false;
// // // //       const es = new Date(e.start).getTime();
// // // //       const ee = new Date(e.end).getTime();
// // // //       return start.getTime() < ee + buffer && end.getTime() > es - buffer;
// // // //     });
// // // //   };

// // // //   const handleSaveSlots = async () => {
// // // //     for (const s of unsavedSlots) {
// // // //       if ((new Date(s.end) - new Date(s.start)) !== 3600000) {
// // // //         toast.error("Each slot must be exactly 1 hour");
// // // //         return;
// // // //       }
// // // //     }

// // // //     const { error } = await supabase.from("calendar_events").insert(
// // // //       unsavedSlots.map(s => ({
// // // //         title: s.title,
// // // //         start_time: s.start,
// // // //         end_time: s.end,
// // // //         tutor_id: currentUserId
// // // //       }))
// // // //     );

// // // //     if (!error) {
// // // //       setUnsavedSlots([]);
// // // //       fetchEvents();
// // // //       toast.success("Saved");
// // // //     } else {
// // // //       toast.error("Save failed");
// // // //     }
// // // //   };

// // // //   const handleEventClick = ({ event }) => {
// // // //     if (event.id.startsWith("temp-")) {
// // // //       setUnsavedSlots(p => p.filter(s => s.id !== event.id));
// // // //       return;
// // // //     }

// // // //     const isOwner = event.extendedProps.tutorId === currentUserId;
// // // //     const isAdmin = ["owner", "tech_admin", "operations_admin"].includes(userRole);

// // // //     if (isOwner && userRole === "tutor" && !event.extendedProps.assigned) {
// // // //       setConfirmDelete({ open: true, slotId: event.id });
// // // //     }

// // // //     if (isAdmin && !event.extendedProps.assigned) {
// // // //       setAssignModal({ open: true, slotId: event.id });
// // // //     }
// // // //   };

// // // //   const handleDeleteConfirmed = async () => {
// // // //     const { error } = await supabase.from("calendar_events").delete().eq("id", confirmDelete.slotId);
// // // //     if (!error) toast.success("Slot deleted");
// // // //     else toast.error("Delete failed");
// // // //     setConfirmDelete({ open: false, slotId: null });
// // // //     fetchEvents();
// // // //   };

// // // //   // Always scroll to current time on render
// // // //   const scrollToNow = () => {
// // // //     if (calendarRef.current) {
// // // //       const calendarApi = calendarRef.current.getApi();
// // // //       const now = new Date();
// // // //       const hours = now.getHours().toString().padStart(2, "0");
// // // //       const minutes = now.getMinutes().toString().padStart(2, "0");
// // // //       calendarApi.scrollToTime(`${hours}:${minutes}:00`);
// // // //     }
// // // //   };

// // // //   useEffect(() => {
// // // //     scrollToNow();
// // // //   }, [events]);

// // // //   return (
// // // //     <div className="p-4 bg-slate-50 min-h-screen">
// // // //       <Toaster />

// // // //       <div className="sticky top-0 z-50 bg-slate-50">
// // // //         <div className="flex justify-between items-center py-2 px-4">
// // // //           <div className="flex gap-3 items-center">
// // // //             <button onClick={() => navigate(-1)} className="p-2 bg-white border rounded-lg shadow-sm">
// // // //               <ArrowLeft size={18} />
// // // //             </button>
// // // //             <h1 className="text-xl font-bold">Global Schedule</h1>
// // // //           </div>

// // // //           <div className="flex gap-4 bg-white px-4 py-1.5 rounded-xl border">
// // // //             <span className="text-green-600 font-bold">Free {events.filter(e => !e.extendedProps?.assigned && !e.id.startsWith("break-")).length}</span>
// // // //             <span className="text-blue-600 font-bold">Booked {events.filter(e => e.extendedProps?.assigned).length}</span>
// // // //             <span className="text-amber-600 font-bold">Unsaved {unsavedSlots.length}</span>
// // // //             {unsavedSlots.length > 0 && (
// // // //               <button onClick={handleSaveSlots} className="bg-blue-600 text-white px-3 rounded-lg text-xs">Save</button>
// // // //             )}
// // // //           </div>
// // // //         </div>
// // // //       </div>

// // // //       {/* Assignment Modal */}
// // // //       {assignModal.open && (
// // // //         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
// // // //           <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
// // // //             <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
// // // //               <UserPlus size={22} className="text-blue-500" /> Assign Student
// // // //             </h2>
// // // //             <select 
// // // //               className="w-full p-4 border border-slate-200 rounded-2xl mb-4 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
// // // //               defaultValue="" 
// // // //               onChange={e => {
// // // //                 if(e.target.value) {
// // // //                   supabase.from("event_attendance").insert({
// // // //                     event_id: assignModal.slotId,
// // // //                     student_id: e.target.value
// // // //                   }).then(({error}) => {
// // // //                     if (!error) {
// // // //                       toast.success("Student Assigned");
// // // //                       setAssignModal({ open: false, slotId: null });
// // // //                       fetchEvents();
// // // //                     } else {
// // // //                       toast.error("Assignment failed");
// // // //                     }
// // // //                   });
// // // //                 }
// // // //               }}
// // // //             >
// // // //               <option value="">Select a student...</option>
// // // //               {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
// // // //             </select>
// // // //             <button onClick={() => setAssignModal({ open: false, slotId: null })} className="w-full py-3 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl">Cancel</button>
// // // //           </div>
// // // //         </div>
// // // //       )}

// // // //       {/* Delete Modal */}
// // // //       {confirmDelete.open && (
// // // //         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
// // // //           <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
// // // //             <p className="mb-4 text-slate-800 font-semibold">Delete this availability?</p>
// // // //             <div className="flex gap-4 justify-end">
// // // //               <button 
// // // //                 className="px-4 py-2 rounded-lg border" 
// // // //                 onClick={() => setConfirmDelete({ open: false, slotId: null })}
// // // //               >
// // // //                 Cancel
// // // //               </button>
// // // //               <button
// // // //                 className="px-4 py-2 rounded-lg bg-red-600 text-white"
// // // //                 onClick={handleDeleteConfirmed}
// // // //               >
// // // //                 Delete
// // // //               </button>
// // // //             </div>
// // // //           </div>
// // // //         </div>
// // // //       )}

// // // //       <div className="bg-white p-4 rounded-2xl border">
// // // //         <FullCalendar
// // // //           ref={calendarRef}
// // // //           plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
// // // //           initialView="timeGridWeek"
// // // //           events={[...events, ...unsavedSlots]}
// // // //           slotDuration="00:15:00"
// // // //           slotLabelInterval="01:00"
// // // //           nowIndicator
// // // //           selectable={userRole === "tutor"}
// // // //           editable={userRole === "tutor"}
// // // //           allDaySlot={false}
// // // //           select={(info) => {
// // // //             if (userRole !== "tutor") return;
// // // //             const end = new Date(info.start.getTime() + 3600000);
// // // //             if (hasConflict(info.start, end)) return toast.error("15-min break required");
// // // //             setUnsavedSlots(p => [...p, {
// // // //               id: "temp-" + Date.now(),
// // // //               title: "Free Slot",
// // // //               start: info.start,
// // // //               end,
// // // //               backgroundColor: "#fefce8",
// // // //               extendedProps: { tutorId: currentUserId }
// // // //             }]);
// // // //           }}
// // // //           eventClick={handleEventClick}
// // // //         />
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }

// // // import React, { useEffect, useState, useCallback } from "react";
// // // import FullCalendar from "@fullcalendar/react";
// // // import dayGridPlugin from "@fullcalendar/daygrid";
// // // import timeGridPlugin from "@fullcalendar/timegrid";
// // // import interactionPlugin from "@fullcalendar/interaction";
// // // import { supabase } from "../supabase";
// // // import { useNavigate } from "react-router-dom";
// // // import { ArrowLeft, UserPlus } from "lucide-react";
// // // import toast, { Toaster } from "react-hot-toast";
// // // import "../../src/fullcalendar.css";

// // // export default function FullCalendarView() {
// // //   const navigate = useNavigate();
// // //   const [events, setEvents] = useState([]);
// // //   const [userRole, setUserRole] = useState(null);
// // //   const [currentUserId, setCurrentUserId] = useState(null);
// // //   const [currentUserName, setCurrentUserName] = useState("");
// // //   const [unsavedSlots, setUnsavedSlots] = useState([]);
// // //   const [students, setStudents] = useState([]);
// // //   const [assignModal, setAssignModal] = useState({ open: false, slotId: null });
// // //   const [confirmDelete, setConfirmDelete] = useState({ open: false, slotId: null });

// // //   const getTutorColor = (id) => {
// // //     const colors = ["#eab308", "#3b82f6", "#10b981", "#8b5cf6", "#f43f5e", "#0ea5e9"];
// // //     if (!id) return colors[0];
// // //     return colors[id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length];
// // //   };

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
// // //     setCurrentUserName(profile?.full_name || "Tutor");

// // //     const { data: studentData } = await supabase.from("students").select("id, full_name");
// // //     setStudents(studentData || []);

// // //     let query = supabase
// // //       .from("calendar_events")
// // //       .select(`
// // //         id,
// // //         title,
// // //         start_time,
// // //         end_time,
// // //         tutor_id,
// // //         users!calendar_events_tutor_id_fkey(full_name),
// // //         event_attendance!event_attendance_event_id_fkey(
// // //           id,
// // //           student_id,
// // //           students!event_attendance_student_id_fkey(full_name)
// // //         )
// // //       `);

// // //     // Role-based visibility
// // //     if (profile?.role === "tutor") query = query.eq("tutor_id", user.id);
// // //     if (profile?.role === "student") query = query.eq("event_attendance.student_id", user.id);

// // //     const { data, error } = await query;
// // //     if (error) return console.error(error);

// // //     const fullEvents = [];

// // //     data.forEach(e => {
// // //       const tutorColor = getTutorColor(e.tutor_id);
// // //       const studentNames = e.event_attendance?.map(a => a.students?.full_name).filter(Boolean) || [];
// // //       const isFree = studentNames.length === 0;

// // //       fullEvents.push({
// // //         id: e.id,
// // //         title: e.title,
// // //         start: e.start_time,
// // //         end: e.end_time,
// // //         backgroundColor: isFree ? "#fefce8" : tutorColor,
// // //         borderColor: tutorColor,
// // //         textColor: isFree ? "#854d0e" : "#fff",
// // //         extendedProps: {
// // //           tutorId: e.tutor_id,
// // //           tutorName: e.users?.full_name || "Tutor",
// // //           studentNames,
// // //           assigned: !isFree
// // //         }
// // //       });

// // //       const breakStart = new Date(e.end_time);
// // //       const breakEnd = new Date(breakStart.getTime() + 15 * 60 * 1000);

// // //       fullEvents.push({
// // //         id: "break-" + e.id,
// // //         title: "Break",
// // //         start: breakStart,
// // //         end: breakEnd,
// // //         display: "background",
// // //         backgroundColor: "#e5e7eb",
// // //         extendedProps: { isTempBreak: true }
// // //       });
// // //     });

// // //     setEvents(fullEvents);
// // //   }, []);

// // //   useEffect(() => { fetchEvents(); }, [fetchEvents]);

// // //   const hasConflict = (start, end) => {
// // //     const buffer = 15 * 60 * 1000;
// // //     return [...events, ...unsavedSlots].some(e => {
// // //       if (e.extendedProps?.isTempBreak) return false;
// // //       if (e.id.toString().startsWith("break-")) return false;
// // //       const es = new Date(e.start).getTime();
// // //       const ee = new Date(e.end).getTime();
// // //       return start.getTime() < ee + buffer && end.getTime() > es - buffer;
// // //     });
// // //   };

// // //   const handleSaveSlots = async () => {
// // //     for (const s of unsavedSlots) {
// // //       if ((new Date(s.end) - new Date(s.start)) !== 3600000) {
// // //         toast.error("Each slot must be exactly 1 hour");
// // //         return;
// // //       }
// // //     }

// // //     const { error } = await supabase.from("calendar_events").insert(
// // //       unsavedSlots.map(s => ({
// // //         title: s.title,
// // //         start_time: s.start,
// // //         end_time: s.end,
// // //         tutor_id: currentUserId
// // //       }))
// // //     );

// // //     if (!error) {
// // //       setUnsavedSlots([]);
// // //       fetchEvents();
// // //       toast.success("Saved");
// // //     } else {
// // //       toast.error("Save failed");
// // //     }
// // //   };

// // //   const handleEventClick = ({ event }) => {
// // //     // Remove temp slots
// // //     if (event.id.startsWith("temp-")) {
// // //       setUnsavedSlots(p => p.filter(s => s.id !== event.id));
// // //       return;
// // //     }

// // //     const isOwner = event.extendedProps.tutorId === currentUserId;
// // //     const isAdmin = ["owner", "tech_admin", "operations_admin"].includes(userRole);

// // //     // Tutors can delete their own unassigned slots
// // //     if (isOwner && userRole === "tutor" && !event.extendedProps.assigned) {
// // //       setConfirmDelete({ open: true, slotId: event.id });
// // //     }

// // //     // Admins can only assign
// // //     if (isAdmin && !event.extendedProps.assigned) {
// // //       setAssignModal({ open: true, slotId: event.id });
// // //     }
// // //   };

// // //   const handleDeleteConfirmed = async () => {
// // //     const { error } = await supabase.from("calendar_events").delete().eq("id", confirmDelete.slotId);
// // //     if (!error) toast.success("Slot deleted");
// // //     else toast.error("Delete failed");
// // //     setConfirmDelete({ open: false, slotId: null });
// // //     fetchEvents();
// // //   };

// // //   return (
// // //     <div className="p-4 bg-slate-50 min-h-screen">
// // //       <Toaster />

// // //       {/* Sticky Header */}
// // //       <div className="sticky top-0 z-50 bg-slate-50">
// // //         <div className="flex justify-between items-center py-2 px-4">
// // //           <div className="flex gap-3 items-center">
// // //             <button onClick={() => navigate(-1)} className="p-2 bg-white border rounded-lg shadow-sm">
// // //               <ArrowLeft size={18} />
// // //             </button>
// // //             <h1 className="text-xl font-bold">Global Schedule</h1>
// // //           </div>

// // //           <div className="flex gap-4 bg-white px-4 py-1.5 rounded-xl border">
// // //             <span className="text-green-600 font-bold">Free {events.filter(e => !e.extendedProps?.assigned && !e.id.startsWith("break-")).length}</span>
// // //             <span className="text-blue-600 font-bold">Booked {events.filter(e => e.extendedProps?.assigned).length}</span>
// // //             <span className="text-amber-600 font-bold">Unsaved {unsavedSlots.length}</span>
// // //             {unsavedSlots.length > 0 && (
// // //               <button onClick={handleSaveSlots} className="bg-blue-600 text-white px-3 rounded-lg text-xs">Save</button>
// // //             )}
// // //           </div>
// // //         </div>
// // //       </div>

// // //       {/* Assignment Modal */}
// // //       {assignModal.open && (
// // //         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
// // //           <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
// // //             <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
// // //               <UserPlus size={22} className="text-blue-500" /> Assign Student
// // //             </h2>
// // //             <select 
// // //               className="w-full p-4 border border-slate-200 rounded-2xl mb-4 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
// // //               defaultValue="" 
// // //               onChange={e => {
// // //                 if(e.target.value) {
// // //                   supabase.from("event_attendance").insert({
// // //                     event_id: assignModal.slotId,
// // //                     student_id: e.target.value
// // //                   }).then(({error}) => {
// // //                     if (!error) {
// // //                       toast.success("Student Assigned");
// // //                       setAssignModal({ open: false, slotId: null });
// // //                       fetchEvents();
// // //                     } else {
// // //                       toast.error("Assignment failed");
// // //                     }
// // //                   });
// // //                 }
// // //               }}
// // //             >
// // //               <option value="">Select a student...</option>
// // //               {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
// // //             </select>
// // //             <button onClick={() => setAssignModal({ open: false, slotId: null })} className="w-full py-3 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl">Cancel</button>
// // //           </div>
// // //         </div>
// // //       )}

// // //       {/* Delete Modal */}
// // //       {confirmDelete.open && (
// // //         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
// // //           <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
// // //             <p className="mb-4 text-slate-800 font-semibold">Delete this availability?</p>
// // //             <div className="flex gap-4 justify-end">
// // //               <button 
// // //                 className="px-4 py-2 rounded-lg border" 
// // //                 onClick={() => setConfirmDelete({ open: false, slotId: null })}
// // //               >
// // //                 Cancel
// // //               </button>
// // //               <button
// // //                 className="px-4 py-2 rounded-lg bg-red-600 text-white"
// // //                 onClick={handleDeleteConfirmed}
// // //               >
// // //                 Delete
// // //               </button>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       )}

// // //       <div className="bg-white p-4 rounded-2xl border">
// // //         <FullCalendar
// // //           plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
// // //           initialView="timeGridWeek"
// // //           events={[...events, ...unsavedSlots]}
// // //           slotDuration="00:15:00"
// // //           slotLabelInterval="01:00"
// // //           nowIndicator
// // //           selectable={userRole === "tutor"}
// // //           editable={userRole === "tutor"}
// // //           allDaySlot={false}
// // //           select={(info) => {
// // //             if (userRole !== "tutor") return;
// // //             const end = new Date(info.start.getTime() + 3600000);
// // //             if (hasConflict(info.start, end)) return toast.error("15-min break required");
// // //             setUnsavedSlots(p => [...p, {
// // //               id: "temp-" + Date.now(),
// // //               title: "Free Slot",
// // //               start: info.start,
// // //               end,
// // //               backgroundColor: "#fefce8",
// // //               extendedProps: { tutorId: currentUserId }
// // //             }]);
// // //           }}
// // //           eventClick={handleEventClick}
// // //         />
// // //       </div>
// // //     </div>
// // //   );
// // // }
// // import React, {
// //   useEffect,
// //   useState,
// //   useCallback,
// //   useRef,
// // } from "react";
// // import FullCalendar from "@fullcalendar/react";
// // import dayGridPlugin from "@fullcalendar/daygrid";
// // import timeGridPlugin from "@fullcalendar/timegrid";
// // import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
// // import { supabase } from "../supabase";
// // import { useNavigate } from "react-router-dom";
// // import { ArrowLeft, UserPlus } from "lucide-react";
// // import toast, { Toaster } from "react-hot-toast";
// // import "../../src/fullcalendar.css";

// // export default function FullCalendarView() {
// //   const navigate = useNavigate();
// //   const calendarRef = useRef(null);
// //   const sidebarRef = useRef(null);

// //   const [events, setEvents] = useState([]);
// //   const [userRole, setUserRole] = useState(null);
// //   const [currentUserId, setCurrentUserId] = useState(null);
// //   const [unsavedSlots, setUnsavedSlots] = useState([]);
// //   const [students, setStudents] = useState([]);
// //   const [unassignedStudents, setUnassignedStudents] = useState([]);
// //   const [assignModal, setAssignModal] = useState({ open: false, slotId: null });
// //   const [confirmDelete, setConfirmDelete] = useState({ open: false, slotId: null });

// //   const isAdminRole = (role) =>
// //     ["owner", "tech_admin", "operations_admin"].includes(role);

// //   /* ---------------- COLOR SYSTEM ---------------- */
// //   const getTutorColor = (id) => {
// //     const colors = [
// //       "#eab308",
// //       "#3b82f6",
// //       "#10b981",
// //       "#8b5cf6",
// //       "#f43f5e",
// //       "#0ea5e9",
// //     ];
// //     if (!id) return colors[0];
// //     return colors[
// //       id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) %
// //         colors.length
// //     ];
// //   };

// //   /* ---------------- FETCH ---------------- */
// //   const fetchEvents = useCallback(async () => {
// //     const {
// //       data: { user },
// //     } = await supabase.auth.getUser();
// //     if (!user) return;

// //     setCurrentUserId(user.id);

// //     const { data: profile } = await supabase
// //       .from("users")
// //       .select("role, full_name")
// //       .eq("id", user.id)
// //       .single();

// //     setUserRole(profile?.role);

// //     /* -------- STUDENTS -------- */
// //     const { data: studentData } = await supabase
// //       .from("students")
// //       .select("id, full_name, tutor_id");

// //     const safeStudents = studentData ?? [];
// //     setStudents(safeStudents);
// //     setUnassignedStudents(
// //       safeStudents.filter((s) => !s.tutor_id)
// //     );

// //     /* -------- EVENTS -------- */
// //     let query = supabase.from("calendar_events").select(`
// //         id,
// //         title,
// //         start_time,
// //         end_time,
// //         tutor_id,
// //         users!calendar_events_tutor_id_fkey(full_name),
// //         event_attendance(
// //           id,
// //           student_id,
// //           students(full_name)
// //         )
// //       `);

// //     if (profile?.role === "tutor") {
// //       query = query.eq("tutor_id", user.id);
// //     }

// //     const { data, error } = await query;
// //     if (error) return console.error(error);

// //     const fullEvents = [];

// //     data.forEach((e) => {
// //       const tutorColor = getTutorColor(e.tutor_id);

// //       const studentNames =
// //         e.event_attendance
// //           ?.map((a) => a.students?.full_name)
// //           .filter(Boolean) || [];

// //       // const isFree = studentNames.length === 0;

// //       // fullEvents.push({
// //       //   id: e.id,
// //       //   title: isFree
// //       //     ? "Free Slot"
// //       //     : studentNames.join(", "),
// //       //   start: e.start_time,
// //       //   end: e.end_time,
// //       //   backgroundColor: isFree
// //       //     ? "#fefce8"
// //       //     : tutorColor,
// //       //   borderColor: tutorColor,
// //       //   textColor: isFree ? "#854d0e" : "#ffffff",
// //       //   extendedProps: {
// //       //     tutorId: e.tutor_id,
// //       //     assigned: !isFree,
// //       //   },
// //       // });
// // const isFree = studentNames.length === 0;

// // // make lighter version of tutor color for free slot
// // const lightColor = tutorColor + "33"; // adds transparency

// // fullEvents.push({
// //   id: e.id,
// //   title: isFree ? "Free Slot" : studentNames.join(", "),
// //   start: e.start_time,
// //   end: e.end_time,
// //   backgroundColor: isFree ? lightColor : tutorColor,
// //   borderColor: tutorColor,
// //   textColor: isFree ? tutorColor : "#ffffff",
// //   extendedProps: {
// //     tutorId: e.tutor_id,
// //     assigned: !isFree,
// //   },
// // });

// //       /* ---- AUTO BREAK ---- */
// //       const breakStart = new Date(e.end_time);
// //       const breakEnd = new Date(
// //         breakStart.getTime() + 15 * 60 * 1000
// //       );

// //       fullEvents.push({
// //         id: "break-" + e.id,
// //         start: breakStart,
// //         end: breakEnd,
// //         display: "background",
// //         backgroundColor: "#e5e7eb",
// //         extendedProps: { isTempBreak: true },
// //       });
// //     });

// //     setEvents(fullEvents);
// //   }, []);

// //   useEffect(() => {
// //     fetchEvents();
// //   }, [fetchEvents]);

// //   /* ---------------- CONFLICT CHECK ---------------- */
// //   const hasConflict = (start, end) => {
// //     const buffer = 15 * 60 * 1000;

// //     return [...events, ...unsavedSlots].some((e) => {
// //       if (e.extendedProps?.isTempBreak) return false;
// //       if (e.id.toString().startsWith("break-"))
// //         return false;

// //       const es = new Date(e.start).getTime();
// //       const ee = new Date(e.end).getTime();

// //       return (
// //         start.getTime() < ee + buffer &&
// //         end.getTime() > es - buffer
// //       );
// //     });
// //   };

// //   /* ---------------- SAVE SLOT ---------------- */
// //   const handleSaveSlots = async () => {
// //     for (const s of unsavedSlots) {
// //       if (
// //         new Date(s.end) - new Date(s.start) !==
// //         3600000
// //       ) {
// //         toast.error(
// //           "Each slot must be exactly 1 hour"
// //         );
// //         return;
// //       }
// //     }

// //     const { error } = await supabase
// //       .from("calendar_events")
// //       .insert(
// //         unsavedSlots.map((s) => ({
// //           title: "Free Slot",
// //           start_time: s.start,
// //           end_time: s.end,
// //           tutor_id: currentUserId,
// //         }))
// //       );

// //     if (error) toast.error("Save failed");
// //     else {
// //       toast.success("Saved");
// //       setUnsavedSlots([]);
// //       fetchEvents();
// //     }
// //   };

// //   /* ---------------- DELETE ---------------- */
// //   const handleDeleteConfirmed = async () => {
// //     const { error } = await supabase
// //       .from("calendar_events")
// //       .delete()
// //       .eq("id", confirmDelete.slotId);

// //     if (error) toast.error("Delete failed");
// //     else toast.success("Slot deleted");

// //     setConfirmDelete({ open: false, slotId: null });
// //     fetchEvents();
// //   };

// //   /* ---------------- DRAG STUDENTS ---------------- */
// //   useEffect(() => {
// //     if (sidebarRef.current) {
// //       new Draggable(sidebarRef.current, {
// //         itemSelector: ".fc-draggable-student",
// //         eventData: (el) => ({
// //           id: el.dataset.id,
// //           title: el.innerText,
// //         }),
// //       });
// //     }
// //   }, [unassignedStudents]);

// //   const handleEventReceive = async (info) => {
// //     const studentId =
// //       info.draggedEl.dataset.id;
// //     const slotId = info.event.id;

// //     const { error } = await supabase
// //       .from("event_attendance")
// //       .insert({
// //         student_id: studentId,
// //         event_id: slotId,
// //       });

// //     if (error) toast.error("Assignment failed");
// //     else toast.success("Student assigned");

// //     fetchEvents();
// //   };

// //   /* ---------------- EVENT CLICK ---------------- */
// //   const handleEventClick = ({ event }) => {
// //     if (event.id.startsWith("temp-")) {
// //       setUnsavedSlots((p) =>
// //         p.filter((s) => s.id !== event.id)
// //       );
// //       return;
// //     }

// //     const isOwner =
// //       event.extendedProps.tutorId ===
// //       currentUserId;

// //     if (
// //       isOwner &&
// //       userRole === "tutor" &&
// //       !event.extendedProps.assigned
// //     ) {
// //       setConfirmDelete({
// //         open: true,
// //         slotId: event.id,
// //       });
// //     }

// //     if (
// //       isAdminRole(userRole) &&
// //       !event.extendedProps.assigned
// //     ) {
// //       setAssignModal({
// //         open: true,
// //         slotId: event.id,
// //       });
// //     }
// //   };

// //   /* ---------------- UI ---------------- */
// //   return (
// //     <div className="flex min-h-screen bg-slate-50">
// //       <Toaster />

// //       {/* -------- ADMIN SIDEBAR -------- */}
// //       {isAdminRole(userRole) && (
// //         <div
// //           ref={sidebarRef}
// //           className="w-72 bg-white p-4 border-r overflow-y-auto"
// //         >
// //           <h2 className="font-bold text-lg mb-3">
// //             Unassigned Students
// //           </h2>

// //           {unassignedStudents.map((s) => (
// //             <div
// //               key={s.id}
// //               data-id={s.id}
// //               className="fc-draggable-student p-2 mb-2 rounded-lg bg-purple-500 text-white cursor-pointer hover:bg-purple-600"
// //             >
// //               {s.full_name}
// //             </div>
// //           ))}
// //         </div>
// //       )}

// //       {/* -------- MAIN -------- */}
// //       <div className="flex-1 p-4">
// //         <div className="sticky top-0 z-50 bg-slate-50 mb-3">
// //           <div className="flex justify-between items-center">
// //             <div className="flex gap-3 items-center">
// //               <button
// //                 onClick={() => navigate(-1)}
// //                 className="p-2 bg-white border rounded-lg shadow-sm"
// //               >
// //                 <ArrowLeft size={18} />
// //               </button>
// //               <h1 className="text-xl font-bold">
// //                 Global Schedule
// //               </h1>
// //             </div>

// //             {unsavedSlots.length > 0 && (
// //               <button
// //                 onClick={handleSaveSlots}
// //                 className="bg-blue-600 text-white px-4 py-1.5 rounded-lg"
// //               >
// //                 Save Slots
// //               </button>
// //             )}
// //           </div>
// //         </div>

// //         <div className="bg-white p-4 rounded-2xl border">
// //           <FullCalendar
// //             ref={calendarRef}
// //             plugins={[
// //               dayGridPlugin,
// //               timeGridPlugin,
// //               interactionPlugin,
// //             ]}
// //             initialView="timeGridWeek"
// //             events={[...events, ...unsavedSlots]}
// //             slotDuration="00:15:00"
// //             nowIndicator
// //             selectable={userRole === "tutor"}
// //             editable={
// //               isAdminRole(userRole) ||
// //               userRole === "tutor"
// //             }
// //             droppable={isAdminRole(userRole)}
// //             allDaySlot={false}
// //             select={(info) => {
// //               if (userRole !== "tutor") return;

// //               const end = new Date(
// //                 info.start.getTime() + 3600000
// //               );

// //               if (
// //                 hasConflict(info.start, end)
// //               ) {
// //                 toast.error(
// //                   "15-min break required"
// //                 );
// //                 return;
// //               }

// //               setUnsavedSlots((prev) => [
// //                 ...prev,
// //                 {
// //                   id:
// //                     "temp-" + Date.now(),
// //                   title: "Free Slot",
// //                   start: info.start,
// //                   end,
// //                   backgroundColor:
// //                     "#fefce8",
// //                 },
// //               ]);
// //             }}
// //             eventClick={handleEventClick}
// //             eventReceive={handleEventReceive}
// //           />
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
// // import React, { useEffect, useState, useCallback, useRef } from "react";
// // import FullCalendar from "@fullcalendar/react";
// // import dayGridPlugin from "@fullcalendar/daygrid";
// // import timeGridPlugin from "@fullcalendar/timegrid";
// // import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
// // import { supabase } from "../supabase";
// // import { useNavigate } from "react-router-dom";
// // import { ArrowLeft, UserPlus } from "lucide-react";
// // import toast, { Toaster } from "react-hot-toast";
// // import "../../src/fullcalendar.css";

// // export default function FullCalendarView() {
// //   const navigate = useNavigate();
// //   const calendarRef = useRef(null);
// //   const sidebarRef = useRef(null);

// //   const [events, setEvents] = useState([]);
// //   const [userRole, setUserRole] = useState(null);
// //   const [currentUserId, setCurrentUserId] = useState(null);
// //   const [unsavedSlots, setUnsavedSlots] = useState([]);
// //   const [students, setStudents] = useState([]);
// //   const [unassignedStudents, setUnassignedStudents] = useState([]);
// //   const [assignModal, setAssignModal] = useState({ open: false, slotId: null });
// //   const [confirmDelete, setConfirmDelete] = useState({ open: false, slotId: null });
// //   const [tutorSummary, setTutorSummary] = useState([]);

// //   const isAdminRole = (role) => ["owner", "tech_admin", "operations_admin"].includes(role);

// //   /* ---------------- COLOR SYSTEM ---------------- */
// //   const getTutorColor = (id) => {
// //     const colors = ["#eab308","#3b82f6","#10b981","#8b5cf6","#f43f5e","#0ea5e9"];
// //     if (!id) return colors[0];
// //     return colors[id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length];
// //   };

// //   /* ---------------- FETCH ---------------- */
// //   const fetchEvents = useCallback(async () => {
// //     const { data: { user } } = await supabase.auth.getUser();
// //     if (!user) return;
// //     setCurrentUserId(user.id);

// //     const { data: profile } = await supabase
// //       .from("users")
// //       .select("role, full_name")
// //       .eq("id", user.id)
// //       .single();

// //     setUserRole(profile?.role);

// //     // ---- STUDENTS ----
// //     const { data: studentData } = await supabase
// //       .from("students")
// //       .select("id, full_name, tutor_id");

// //     const safeStudents = studentData ?? [];
// //     setStudents(safeStudents);
// //     setUnassignedStudents(safeStudents.filter((s) => !s.tutor_id));

// //     // ---- EVENTS ----
// //     let query = supabase.from("calendar_events").select(`
// //       id,
// //       title,
// //       start_time,
// //       end_time,
// //       tutor_id,
// //       users!calendar_events_tutor_id_fkey(full_name),
// //       event_attendance(
// //         id,
// //         student_id,
// //         students(full_name)
// //       )
// //     `);

// //     if (profile?.role === "tutor") query = query.eq("tutor_id", user.id);

// //     const { data, error } = await query;
// //     if (error) return console.error(error);

// //     const fullEvents = [];
// //     const summary = {};

// //     data.forEach((e) => {
// //       const tutorColor = getTutorColor(e.tutor_id);
// //       const studentNames = e.event_attendance?.map((a) => a.students?.full_name).filter(Boolean) || [];
// //       const isFree = studentNames.length === 0;

// //       // Update summary per tutor
// //       if (!summary[e.tutor_id]) summary[e.tutor_id] = { name: e.users?.full_name || "Tutor", free: 0, booked: 0, color: tutorColor };
// //       if (isFree) summary[e.tutor_id].free += 1;
// //       else summary[e.tutor_id].booked += 1;

// //       // Push main event
// //       // const lightColor = tutorColor + "33";
// //       // tutorColor is hex, e.g., "#3b82f6"
// // const hexToRgba = (hex, alpha = 0.3) => {
// //   const r = parseInt(hex.slice(1,3),16);
// //   const g = parseInt(hex.slice(3,5),16);
// //   const b = parseInt(hex.slice(5,7),16);
// //   return `rgba(${r},${g},${b},${alpha})`;
// // };

// // const lightColor = hexToRgba(tutorColor, 0.3);

// //       fullEvents.push({
// //         id: e.id,
// //         title: isFree ? "Free Slot" : studentNames.join(", "),
// //         start: e.start_time,
// //         end: e.end_time,
// //         backgroundColor: isFree ? lightColor : tutorColor,
// //         borderColor: tutorColor,
// //         textColor: isFree ? tutorColor : "#ffffff",
// //         extendedProps: { tutorId: e.tutor_id, assigned: !isFree },
// //       });

// //       // Push auto-break
// //       const breakStart = new Date(e.end_time);
// //       const breakEnd = new Date(breakStart.getTime() + 15 * 60 * 1000);
// //       fullEvents.push({
// //         id: "break-" + e.id,
// //         start: breakStart,
// //         end: breakEnd,
// //         display: "background",
// //         backgroundColor: "#e5e7eb",
// //         extendedProps: { isTempBreak: true },
// //       });
// //     });

// //     setEvents(fullEvents);
// //     setTutorSummary(Object.values(summary));
// //   }, []);

// //   useEffect(() => { fetchEvents(); }, [fetchEvents]);

// //   /* ---------------- CONFLICT CHECK ---------------- */
// //   const hasConflict = (start, end) => {
// //     const buffer = 15 * 60 * 1000;
// //     return [...events, ...unsavedSlots].some((e) => {
// //       if (e.extendedProps?.isTempBreak) return false;
// //       if (e.id.toString().startsWith("break-")) return false;
// //       const es = new Date(e.start).getTime();
// //       const ee = new Date(e.end).getTime();
// //       return start.getTime() < ee + buffer && end.getTime() > es - buffer;
// //     });
// //   };

// //   /* ---------------- SAVE SLOT ---------------- */
// //   const handleSaveSlots = async () => {
// //     for (const s of unsavedSlots) {
// //       if (new Date(s.end) - new Date(s.start) !== 3600000) {
// //         toast.error("Each slot must be exactly 1 hour");
// //         return;
// //       }
// //     }

// //     const { error } = await supabase.from("calendar_events").insert(
// //       unsavedSlots.map((s) => ({
// //         title: "Free Slot",
// //         start_time: s.start,
// //         end_time: s.end,
// //         tutor_id: currentUserId,
// //       }))
// //     );

// //     if (error) toast.error("Save failed");
// //     else {
// //       toast.success("Saved");
// //       setUnsavedSlots([]);
// //       fetchEvents();
// //     }
// //   };

// //   /* ---------------- DELETE SLOT ---------------- */
// //   const handleDeleteConfirmed = async () => {
// //     const { error } = await supabase.from("calendar_events").delete().eq("id", confirmDelete.slotId);
// //     if (error) toast.error("Delete failed");
// //     else toast.success("Slot deleted");
// //     setConfirmDelete({ open: false, slotId: null });
// //     fetchEvents();
// //   };

// //   /* ---------------- DRAG STUDENTS ---------------- */
// //   useEffect(() => {
// //     if (sidebarRef.current) {
// //       new Draggable(sidebarRef.current, {
// //         itemSelector: ".fc-draggable-student",
// //         eventData: (el) => ({ id: el.dataset.id, title: el.innerText }),
// //       });
// //     }
// //   }, [unassignedStudents]);

// //   const handleEventReceive = async (info) => {
// //     const studentId = info.draggedEl.dataset.id;
// //     const slotId = info.event.id;
// //     const { error } = await supabase.from("event_attendance").insert({ student_id: studentId, event_id: slotId });
// //     if (error) toast.error("Assignment failed");
// //     else toast.success("Student assigned");
// //     fetchEvents();
// //   };

// //   /* ---------------- EVENT CLICK ---------------- */
// //   const handleEventClick = ({ event }) => {
// //     if (event.id.startsWith("temp-")) {
// //       setUnsavedSlots((p) => p.filter((s) => s.id !== event.id));
// //       return;
// //     }
// //     const isOwner = event.extendedProps.tutorId === currentUserId;
// //     if (isOwner && userRole === "tutor" && !event.extendedProps.assigned) {
// //       setConfirmDelete({ open: true, slotId: event.id });
// //     }
// //     if (isAdminRole(userRole) && !event.extendedProps.assigned) {
// //       setAssignModal({ open: true, slotId: event.id });
// //     }
// //   };

// //   /* ---------------- UI ---------------- */
// //   return (
// //     <div className="flex min-h-screen bg-slate-50">
// //       <Toaster />

// //       {/* -------- ADMIN SIDEBAR -------- */}
// //       {isAdminRole(userRole) && (
// //         <div ref={sidebarRef} className="w-72 bg-white p-4 border-r overflow-y-auto">
// //           <h2 className="font-bold text-lg mb-3">Unassigned Students</h2>
// //           {unassignedStudents.map((s) => (
// //             <div key={s.id} data-id={s.id} className="fc-draggable-student p-2 mb-2 rounded-lg bg-purple-500 text-white cursor-pointer hover:bg-purple-600">
// //               {s.full_name}
// //             </div>
// //           ))}
// //         </div>
// //       )}

// //       {/* -------- MAIN -------- */}
// //       <div className="flex-1 p-4">
// //         {/* ---- TUTOR SUMMARY WITH COLORS ---- */}
// //         {isAdminRole(userRole) && (
// //           <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
// //             {tutorSummary.map((t) => (
// //               <div key={t.name} className="p-3 rounded-xl shadow flex flex-col text-white" style={{ backgroundColor: t.color }}>
// //                 <span className="font-bold text-lg">{t.name}</span>
// //                 <span>Free: {t.free}</span>
// //                 <span>Booked: {t.booked}</span>
// //               </div>
// //             ))}
// //           </div>
// //         )}

// //         {/* ---- HEADER ---- */}
// //         <div className="sticky top-0 z-50 bg-slate-50 mb-3 flex justify-between items-center">
// //           <div className="flex gap-3 items-center">
// //             <button onClick={() => navigate(-1)} className="p-2 bg-white border rounded-lg shadow-sm">
// //               <ArrowLeft size={18} />
// //             </button>
// //             <h1 className="text-xl font-bold">Global Schedule</h1>
// //           </div>
// //           {unsavedSlots.length > 0 && (
// //             <button onClick={handleSaveSlots} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg">Save Slots</button>
// //           )}
// //         </div>

// //         {/* ---- CALENDAR ---- */}
// //         <div className="bg-white p-4 rounded-2xl border">
// //           <FullCalendar
// //             ref={calendarRef}
// //             plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
// //             initialView="timeGridWeek"
// //             events={[...events, ...unsavedSlots]}
// //             slotDuration="00:15:00"
// //             nowIndicator
// //             selectable={userRole === "tutor"}
// //             editable={isAdminRole(userRole) || userRole === "tutor"}
// //             droppable={isAdminRole(userRole)}
// //             allDaySlot={false}
// //             select={(info) => {
// //               if (userRole !== "tutor") return;
// //               const end = new Date(info.start.getTime() + 3600000);
// //               if (hasConflict(info.start, end)) { toast.error("15-min break required"); return; }
// //               setUnsavedSlots((prev) => [...prev, { id: "temp-"+Date.now(), title: "Free Slot", start: info.start, end, backgroundColor: "#fefce8" }]);
// //             }}
// //             eventClick={handleEventClick}
// //             eventReceive={handleEventReceive}
// //           />
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
// import React, { useEffect, useState, useCallback, useRef } from "react";
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import timeGridPlugin from "@fullcalendar/timegrid";
// import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
// import { supabase } from "../supabase";
// import { useNavigate } from "react-router-dom";
// import { ArrowLeft, UserPlus, X } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import "../../src/fullcalendar.css";

// export default function FullCalendarView() {
//   const navigate = useNavigate();
//   const calendarRef = useRef(null);
//   const sidebarRef = useRef(null);

//   const [events, setEvents] = useState([]);
//   const [userRole, setUserRole] = useState(null);
//   const [currentUserId, setCurrentUserId] = useState(null);
//   const [unsavedSlots, setUnsavedSlots] = useState([]);
//   const [students, setStudents] = useState([]);
//   const [unassignedStudents, setUnassignedStudents] = useState([]);
//   const [assignModal, setAssignModal] = useState({ open: false, slotId: null });
//   const [confirmDelete, setConfirmDelete] = useState({ open: false, slotId: null });
//   const [tutorSummary, setTutorSummary] = useState([]);
//   const [sidebarOpen, setSidebarOpen] = useState(true);

//   const isAdminRole = (role) => ["owner", "tech_admin", "operations_admin"].includes(role);

//   const getTutorColor = (id) => {
//     const colors = ["#eab308","#3b82f6","#10b981","#8b5cf6","#f43f5e","#0ea5e9"];
//     if (!id) return colors[0];
//     return colors[id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length];
//   };

//   const hexToRgba = (hex, alpha = 0.3) => {
//     const r = parseInt(hex.slice(1,3),16);
//     const g = parseInt(hex.slice(3,5),16);
//     const b = parseInt(hex.slice(5,7),16);
//     return `rgba(${r},${g},${b},${alpha})`;
//   };

//   /* ---------------- FETCH EVENTS & STUDENTS ---------------- */
//   const fetchEvents = useCallback(async () => {
//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) return;
//     setCurrentUserId(user.id);

//     const { data: profile } = await supabase
//       .from("users")
//       .select("role, full_name")
//       .eq("id", user.id)
//       .single();

//     setUserRole(profile?.role);

//     // Fetch students
//     const { data: studentData } = await supabase
//       .from("students")
//       .select("id, full_name, assigned_tutor_id, grade, parent_phone");

//     const safeStudents = studentData ?? [];
//     setStudents(safeStudents);
//     setUnassignedStudents(safeStudents.filter((s) => !s.assigned_tutor_id));

//     // Fetch calendar events
//     let query = supabase.from("calendar_events").select(`
//       id,
//       title,
//       start_time,
//       end_time,
//       tutor_id,
//       users!calendar_events_tutor_id_fkey(full_name),
//       event_attendance(
//         id,
//         student_id,
//         students(full_name)
//       )
//     `);

//     if (profile?.role === "tutor") query = query.eq("tutor_id", user.id);

//     const { data, error } = await query;
//     if (error) return console.error(error);

//     const fullEvents = [];
//     const summary = {};

//     data.forEach((e) => {
//       const tutorColor = getTutorColor(e.tutor_id);
//       const studentNames = e.event_attendance?.map((a) => a.students?.full_name).filter(Boolean) || [];
//       const isFree = studentNames.length === 0;

//       if (!summary[e.tutor_id]) summary[e.tutor_id] = { name: e.users?.full_name || "Tutor", free: 0, booked: 0, color: tutorColor };
//       if (isFree) summary[e.tutor_id].free += 1;
//       else summary[e.tutor_id].booked += 1;

//       fullEvents.push({
//         id: e.id,
//         title: isFree ? "Free Slot" : studentNames.join(", "),
//         start: e.start_time,
//         end: e.end_time,
//         backgroundColor: isFree ? hexToRgba(tutorColor, 0.3) : tutorColor,
//         borderColor: tutorColor,
//         textColor: isFree ? tutorColor : "#ffffff",
//         extendedProps: { tutorId: e.tutor_id, assigned: !isFree },
//       });

//       // Auto break
//       const breakStart = new Date(e.end_time);
//       const breakEnd = new Date(breakStart.getTime() + 15 * 60 * 1000);
//       fullEvents.push({
//         id: "break-" + e.id,
//         start: breakStart,
//         end: breakEnd,
//         display: "background",
//         backgroundColor: "#e5e7eb",
//         extendedProps: { isTempBreak: true },
//       });
//     });

//     setEvents(fullEvents);
//     setTutorSummary(Object.values(summary));
//   }, []);

//   useEffect(() => { fetchEvents(); }, [fetchEvents]);

//   /* ---------------- CONFLICT CHECK ---------------- */
//   const hasConflict = (start, end) => {
//     const buffer = 15 * 60 * 1000;
//     return [...events, ...unsavedSlots].some((e) => {
//       if (e.extendedProps?.isTempBreak) return false;
//       if (e.id.toString().startsWith("break-")) return false;
//       const es = new Date(e.start).getTime();
//       const ee = new Date(e.end).getTime();
//       return start.getTime() < ee + buffer && end.getTime() > es - buffer;
//     });
//   };

//   /* ---------------- SAVE SLOT ---------------- */
//   const handleSaveSlots = async () => {
//     for (const s of unsavedSlots) {
//       if (new Date(s.end) - new Date(s.start) !== 3600000) {
//         toast.error("Each slot must be exactly 1 hour");
//         return;
//       }
//     }

//     const { error } = await supabase.from("calendar_events").insert(
//       unsavedSlots.map((s) => ({
//         title: "Free Slot",
//         start_time: s.start,
//         end_time: s.end,
//         tutor_id: currentUserId,
//       }))
//     );

//     if (error) toast.error("Save failed");
//     else {
//       toast.success("Saved");
//       setUnsavedSlots([]);
//       fetchEvents();
//     }
//   };

//   /* ---------------- DELETE SLOT ---------------- */
//   const handleDeleteConfirmed = async () => {
//     const { error } = await supabase.from("calendar_events").delete().eq("id", confirmDelete.slotId);
//     if (error) toast.error("Delete failed");
//     else toast.success("Slot deleted");
//     setConfirmDelete({ open: false, slotId: null });
//     fetchEvents();
//   };

//   /* ---------------- ADMIN ASSIGN STUDENT ---------------- */
//   const assignStudentToTutor = async (studentId, tutorId, slotId) => {
//     try {
//       // Assign in students table
//       await supabase.from("students").update({ assigned_tutor_id: tutorId }).eq("id", studentId);
//       // Assign in event_attendance
//       await supabase.from("event_attendance").insert({ event_id: slotId, student_id: studentId });
//       toast.success("Student assigned");
//       fetchEvents();
//     } catch (err) {
//       console.error(err);
//       toast.error("Assignment failed");
//     }
//   };

//   /* ---------------- UNASSIGN TUTOR ---------------- */
//   const unassignTutor = async (studentId) => {
//     try {
//       // Remove assigned tutor in students table
//       await supabase.from("students").update({ assigned_tutor_id: null }).eq("id", studentId);
//       // Remove event attendance
//       await supabase.from("event_attendance").delete().eq("student_id", studentId);
//       toast.success("Tutor unassigned");
//       fetchEvents();
//     } catch (err) {
//       console.error(err);
//       toast.error("Unassign failed");
//     }
//   };

//   /* ---------------- EVENT CLICK ---------------- */
//   const handleEventClick = ({ event }) => {
//     if (event.id.startsWith("temp-")) {
//       setUnsavedSlots((p) => p.filter((s) => s.id !== event.id));
//       return;
//     }
//     const isOwner = event.extendedProps.tutorId === currentUserId;
//     if (isOwner && userRole === "tutor" && !event.extendedProps.assigned) {
//       setConfirmDelete({ open: true, slotId: event.id });
//     }
//     if (isAdminRole(userRole) && !event.extendedProps.assigned) {
//       setAssignModal({ open: true, slotId: event.id });
//     }
//   };

//   /* ---------------- DRAGGABLE STUDENTS ---------------- */
//   useEffect(() => {
//     if (sidebarRef.current) {
//       new Draggable(sidebarRef.current, {
//         itemSelector: ".fc-draggable-student",
//         eventData: (el) => ({ id: el.dataset.id, title: el.innerText }),
//       });
//     }
//   }, [unassignedStudents]);

//   const handleEventReceive = async (info) => {
//     const studentId = info.draggedEl.dataset.id;
//     const slotId = info.event.id;
//     await assignStudentToTutor(studentId, info.event.extendedProps.tutorId, slotId);
//   };

//   /* ---------------- UI ---------------- */
//   return (
//     <div className="flex min-h-screen bg-slate-50 relative">
//       <Toaster />

//       {/* -------- SIDEBAR -------- */}
//       {isAdminRole(userRole) && sidebarOpen && (
//         <div ref={sidebarRef} className="absolute left-0 top-0 bottom-0 w-72 bg-white p-4 border-r shadow-lg z-50 overflow-y-auto transition-transform">
//           <div className="flex justify-between items-center mb-3">
//             <h2 className="font-bold text-lg">Unassigned Students</h2>
//             <button onClick={() => setSidebarOpen(false)}><X size={18} /></button>
//           </div>
//           {unassignedStudents.map((s) => (
//             <div key={s.id} className="fc-draggable-student p-2 mb-2 rounded-lg bg-purple-500 text-white cursor-pointer hover:bg-purple-600 flex justify-between items-center">
//               <span>{s.full_name}</span>
//               <button onClick={() => unassignTutor(s.id)} className="ml-2 bg-red-600 p-1 rounded hover:bg-red-700 text-white">Unassign</button>
//             </div>
//           ))}
//         </div>
//       )}

//       {isAdminRole(userRole) && !sidebarOpen && (
//         <button onClick={() => setSidebarOpen(true)} className="absolute left-0 top-20 z-50 bg-purple-500 text-white p-2 rounded-r">Open Students</button>
//       )}

//       {/* -------- MAIN -------- */}
//       <div className={`flex-1 p-4 ${sidebarOpen ? "ml-72" : ""} transition-all`}>
//         {/* Tutor Summary */}
//         {isAdminRole(userRole) && (
//           <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
//             {tutorSummary.map((t) => (
//               <div key={t.name} className="p-3 rounded-xl shadow flex flex-col text-white" style={{ backgroundColor: t.color }}>
//                 <span className="font-bold text-lg">{t.name}</span>
//                 <span>Free: {t.free}</span>
//                 <span>Booked: {t.booked}</span>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Header */}
//         <div className="sticky top-0 z-50 bg-slate-50 mb-3 flex justify-between items-center">
//           <div className="flex gap-3 items-center">
//             <button onClick={() => navigate(-1)} className="p-2 bg-white border rounded-lg shadow-sm">
//               <ArrowLeft size={18} />
//             </button>
//             <h1 className="text-xl font-bold">Global Schedule</h1>
//           </div>
//           {unsavedSlots.length > 0 && (
//             <button onClick={handleSaveSlots} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg">Save Slots</button>
//           )}
//         </div>

//         {/* Calendar */}
//         <div className="bg-white p-4 rounded-2xl border">
//           <FullCalendar
//             ref={calendarRef}
//             plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//             initialView="timeGridWeek"
//             events={[...events, ...unsavedSlots]}
//             slotDuration="00:15:00"
//             nowIndicator
//             selectable={userRole === "tutor"}
//             editable={isAdminRole(userRole) || userRole === "tutor"}
//             droppable={isAdminRole(userRole)}
//             allDaySlot={false}
//             select={(info) => {
//               if (userRole !== "tutor") return;
//               const end = new Date(info.start.getTime() + 3600000);
//               if (hasConflict(info.start, end)) { toast.error("15-min break required"); return; }
//               setUnsavedSlots((prev) => [...prev, { id: "temp-"+Date.now(), title: "Free Slot", start: info.start, end, backgroundColor: "#fefce8" }]);
//             }}
//             eventClick={handleEventClick}
//             eventReceive={handleEventReceive}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useEffect, useState, useCallback, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import "../../src/fullcalendar.css";

export default function FullCalendarView() {
  const navigate = useNavigate();
  const calendarRef = useRef(null);
  const sidebarRef = useRef(null);

  const [events, setEvents] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [unsavedSlots, setUnsavedSlots] = useState([]);
  const [students, setStudents] = useState([]);
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [assignModal, setAssignModal] = useState({ open: false, slotId: null });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, slotId: null });
  const [tutorSummary, setTutorSummary] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Student prefs & available tutors
  const [studentPrefs, setStudentPrefs] = useState([]); 
  const [availableTutorsMap, setAvailableTutorsMap] = useState({}); 

  const isAdminRole = (role) => ["owner", "tech_admin", "operations_admin"].includes(role);

  const getTutorColor = (id) => {
    const colors = ["#eab308","#3b82f6","#10b981","#8b5cf6","#f43f5e","#0ea5e9"];
    if (!id) return colors[0];
    return colors[id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length];
  };

  const hexToRgba = (hex, alpha = 0.3) => {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  /* ---------------- FETCH EVENTS & STUDENTS ---------------- */
  const fetchEvents = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);

    const { data: profile } = await supabase
      .from("users")
      .select("role, full_name")
      .eq("id", user.id)
      .single();

    setUserRole(profile?.role);

    // Fetch students
    const { data: studentData } = await supabase
      .from("students")
      .select("id, full_name, assigned_tutor_id, grade, parent_phone");

    const safeStudents = studentData ?? [];
    setStudents(safeStudents);
    setUnassignedStudents(safeStudents.filter((s) => !s.assigned_tutor_id));

    // Fetch calendar events
    let query = supabase.from("calendar_events").select(`
      id,
      title,
      start_time,
      end_time,
      tutor_id,
      users!calendar_events_tutor_id_fkey(full_name),
      event_attendance(
        id,
        student_id,
        students(full_name)
      )
    `);

    if (profile?.role === "tutor") query = query.eq("tutor_id", user.id);

    const { data, error } = await query;
    if (error) return console.error(error);

    const fullEvents = [];
    const summary = {};

    data.forEach((e) => {
      const tutorColor = getTutorColor(e.tutor_id);
      const studentNames = e.event_attendance?.map((a) => a.students?.full_name).filter(Boolean) || [];
      const isFree = studentNames.length === 0;

      if (!summary[e.tutor_id]) summary[e.tutor_id] = { name: e.users?.full_name || "Tutor", free: 0, booked: 0, color: tutorColor };
      if (isFree) summary[e.tutor_id].free += 1;
      else summary[e.tutor_id].booked += 1;

      fullEvents.push({
        id: e.id,
        title: isFree ? "Free Slot" : studentNames.join(", "),
        start: e.start_time,
        end: e.end_time,
        backgroundColor: isFree ? hexToRgba(tutorColor, 0.3) : tutorColor,
        borderColor: tutorColor,
        textColor: isFree ? tutorColor : "#ffffff",
        extendedProps: { tutorId: e.tutor_id, assigned: !isFree },
      });

      // Auto break
      const breakStart = new Date(e.end_time);
      const breakEnd = new Date(breakStart.getTime() + 15 * 60 * 1000);
      fullEvents.push({
        id: "break-" + e.id,
        start: breakStart,
        end: breakEnd,
        display: "background",
        backgroundColor: "#e5e7eb",
        extendedProps: { isTempBreak: true },
      });
    });

    setEvents(fullEvents);
    setTutorSummary(Object.values(summary));
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  /* ---------------- FETCH STUDENT PREFS & AVAILABLE TUTORS ---------------- */
  useEffect(() => {
    const fetchStudentPrefs = async () => {
      const { data: leadsData } = await supabase
        .from("leads")
        .select("id, student_name, class_date, class_time, phone, assigned_tutor_id, students(id)")
        .is("assigned_tutor_id", null);

      if (!leadsData) return;

      setStudentPrefs(leadsData);

      const tutorsMap = {};
      for (const lead of leadsData) {
        const desiredTime = new Date(`${lead.class_date}T${lead.class_time}`);
        const { data: freeTutors } = await supabase.rpc("get_available_tutors", { desired_time: desiredTime.toISOString() });
        tutorsMap[lead.students.id] = freeTutors || [];
      }

      setAvailableTutorsMap(tutorsMap);
    };

    if (isAdminRole(userRole)) fetchStudentPrefs();
  }, [students, userRole]);

  /* ---------------- CONFLICT CHECK ---------------- */
  const hasConflict = (start, end) => {
    const buffer = 15 * 60 * 1000;
    return [...events, ...unsavedSlots].some((e) => {
      if (e.extendedProps?.isTempBreak) return false;
      if (e.id.toString().startsWith("break-")) return false;
      const es = new Date(e.start).getTime();
      const ee = new Date(e.end).getTime();
      return start.getTime() < ee + buffer && end.getTime() > es - buffer;
    });
  };

  /* ---------------- SAVE SLOT ---------------- */
  const handleSaveSlots = async () => {
    for (const s of unsavedSlots) {
      if (new Date(s.end) - new Date(s.start) !== 3600000) {
        toast.error("Each slot must be exactly 1 hour");
        return;
      }
    }

    const { error } = await supabase.from("calendar_events").insert(
      unsavedSlots.map((s) => ({
        title: "Free Slot",
        start_time: s.start,
        end_time: s.end,
        tutor_id: currentUserId,
      }))
    );

    if (error) toast.error("Save failed");
    else {
      toast.success("Saved");
      setUnsavedSlots([]);
      fetchEvents();
    }
  };

  /* ---------------- DELETE SLOT ---------------- */
  const handleDeleteConfirmed = async () => {
    const { error } = await supabase.from("calendar_events").delete().eq("id", confirmDelete.slotId);
    if (error) toast.error("Delete failed");
    else toast.success("Slot deleted");
    setConfirmDelete({ open: false, slotId: null });
    fetchEvents();
  };

  /* ---------------- ASSIGN / UNASSIGN ---------------- */
  const assignStudentToTutor = async (studentId, tutorId, slotId) => {
    try {
      await supabase.from("students").update({ assigned_tutor_id: tutorId }).eq("id", studentId);
      if (slotId) await supabase.from("event_attendance").insert({ event_id: slotId, student_id: studentId });
      toast.success("Student assigned");
      fetchEvents();
    } catch (err) {
      console.error(err);
      toast.error("Assignment failed");
    }
  };

  const unassignTutor = async (studentId) => {
    try {
      await supabase.from("students").update({ assigned_tutor_id: null }).eq("id", studentId);
      await supabase.from("event_attendance").delete().eq("student_id", studentId);
      toast.success("Tutor unassigned");
      fetchEvents();
    } catch (err) {
      console.error(err);
      toast.error("Unassign failed");
    }
  };

  /* ---------------- EVENT CLICK ---------------- */
  const handleEventClick = ({ event }) => {
    if (event.id.startsWith("temp-")) {
      setUnsavedSlots((p) => p.filter((s) => s.id !== event.id));
      return;
    }
    const isOwner = event.extendedProps.tutorId === currentUserId;
    if (isOwner && userRole === "tutor" && !event.extendedProps.assigned) {
      setConfirmDelete({ open: true, slotId: event.id });
    }
    if (isAdminRole(userRole) && !event.extendedProps.assigned) {
      setAssignModal({ open: true, slotId: event.id });
    }
  };

  /* ---------------- DRAGGABLE STUDENTS ---------------- */
  useEffect(() => {
    if (sidebarRef.current) {
      new Draggable(sidebarRef.current, {
        itemSelector: ".fc-draggable-student",
        eventData: (el) => ({ id: el.dataset.id, title: el.innerText }),
      });
    }
  }, [unassignedStudents]);

  const handleEventReceive = async (info) => {
    const studentId = info.draggedEl.dataset.id;
    const slotId = info.event.id;
    await assignStudentToTutor(studentId, info.event.extendedProps.tutorId, slotId);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="flex min-h-screen bg-slate-50 relative">
      <Toaster />

      {/* -------- SIDEBAR -------- */}
      {isAdminRole(userRole) && sidebarOpen && (
        <div ref={sidebarRef} className="absolute left-0 top-0 bottom-0 w-80 bg-white p-4 border-r shadow-lg z-50 overflow-y-auto transition-transform">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-lg">Unassigned Students</h2>
            <button onClick={() => setSidebarOpen(false)}><X size={18} /></button>
          </div>

          {studentPrefs.map((s) => (
            <div key={s.students.id} className="p-2 mb-3 rounded-lg border bg-gray-50">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold">{s.student_name}</span>
                <button onClick={() => unassignTutor(s.students.id)} className="ml-2 bg-red-600 p-1 rounded hover:bg-red-700 text-white text-sm">Unassign</button>
              </div>
              <div className="text-xs text-gray-600 mb-2">
                Preferred: {s.class_date} {s.class_time}
              </div>
              <div className="flex flex-wrap gap-1">
                {(availableTutorsMap[s.students.id] || []).map((tutor) => (
                  <button
                    key={tutor.id}
                    onClick={() => assignStudentToTutor(s.students.id, tutor.id, null)}
                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-xs"
                  >
                    {tutor.full_name}
                  </button>
                ))}
                {!(availableTutorsMap[s.students.id]?.length) && (
                  <span className="text-gray-400 text-xs">No tutors free</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isAdminRole(userRole) && !sidebarOpen && (
        <button onClick={() => setSidebarOpen(true)} className="absolute left-0 top-20 z-50 bg-purple-500 text-white p-2 rounded-r">Open Students</button>
      )}

      {/* -------- MAIN -------- */}
      <div className={`flex-1 p-4 ${sidebarOpen ? "ml-80" : ""} transition-all`}>
        {/* Tutor Summary */}
        {isAdminRole(userRole) && (
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {tutorSummary.map((t) => (
              <div key={t.name} className="p-3 rounded-xl shadow flex flex-col text-white" style={{ backgroundColor: t.color }}>
                <span className="font-bold text-lg">{t.name}</span>
                <span>Free: {t.free}</span>
                <span>Booked: {t.booked}</span>
              </div>
            ))}
          </div>
        )}

        {/* Header */}
        <div className="sticky top-0 z-50 bg-slate-50 mb-3 flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <button onClick={() => navigate(-1)} className="p-2 bg-white border rounded-lg shadow-sm">
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-xl font-bold">Global Schedule</h1>
          </div>
          {unsavedSlots.length > 0 && (
            <button onClick={handleSaveSlots} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg">Save Slots</button>
          )}
        </div>

        {/* Calendar */}
        <div className="bg-white p-4 rounded-2xl border">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            events={[...events, ...unsavedSlots]}
            slotDuration="00:15:00"
            nowIndicator
            selectable={userRole === "tutor"}
            editable={isAdminRole(userRole) || userRole === "tutor"}
            droppable={isAdminRole(userRole)}
            allDaySlot={false}
            select={(info) => {
              if (userRole !== "tutor") return;
              const end = new Date(info.start.getTime() + 3600000);
              if (hasConflict(info.start, end)) { toast.error("15-min break required"); return; }
              setUnsavedSlots((prev) => [...prev, { id: "temp-"+Date.now(), title: "Free Slot", start: info.start, end, backgroundColor: "#fefce8" }]);
            }}
            eventClick={handleEventClick}
            eventReceive={handleEventReceive}
          />
        </div>
      </div>
    </div>
  );
}
