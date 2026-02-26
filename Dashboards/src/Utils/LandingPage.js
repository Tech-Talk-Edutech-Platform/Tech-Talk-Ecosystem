import React, { useEffect, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import "../../src/fullcalendar.css";

export default function FullCalendarView({ user }) {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [trialLeads, setTrialLeads] = useState([]);
  const [students, setStudents] = useState([]);

  const isAdmin = ["owner", "tech_admin", "operations_admin"].includes(user?.role);
  const isTutor = user?.role === "tutor";
  const isStudent = user?.role === "student";

  const getTutorColor = (id) => {
    const colors = ["#eab308", "#3b82f6", "#10b981", "#8b5cf6", "#ee692c", "#f472b6"];
    return id ? colors[id.split("").reduce((a,c)=>a+c.charCodeAt(0),0)%colors.length] : colors[0];
  };

  const fetchData = useCallback(async () => {
    const { data: tutorsData } = await supabase.from("users").select("id, full_name").in("role", ["tutor"]);
    setTutors(tutorsData || []);

    const { data: studentsData } = await supabase.from("students").select("id, full_name, assigned_tutor_id, preferred_time, preferred_date");
    setStudents(studentsData || []);

    const { data: leadsData } = await supabase.from("leads").select("id, student_name, assigned_tutor_id, class_date, class_time");
    setTrialLeads(leadsData || []);

    const { data: calendarData } = await supabase.from("calendar_events").select(`
      id, start_time, end_time, tutor_id, event_attendance(student_id, students(full_name))
    `);

    // Map calendar events
    const mappedEvents = calendarData.map(e => {
      const studentNames = e.event_attendance?.map(a=>a.students?.full_name) || [];
      const isFree = studentNames.length === 0;
      const tutorColor = getTutorColor(e.tutor_id);
      return {
        id: e.id,
        title: isFree ? `Free - ${tutorsData?.find(t=>t.id===e.tutor_id)?.full_name}` : studentNames.join(", "),
        start: e.start_time,
        end: e.end_time,
        backgroundColor: isFree ? "#f1f5f9" : tutorColor,
        borderColor: tutorColor,
        textColor: isFree ? "#334155" : "#fff",
        extendedProps: { tutorId: e.tutor_id, assigned: !isFree, type: "course" }
      };
    });

    const trialEvents = (leadsData||[])
      .filter(l=>!l.assigned_tutor_id)
      .map(l=>({
        id: "trial-"+l.id,
        title: l.student_name,
        start: new Date(`${l.class_date}T${l.class_time}`),
        end: new Date(new Date(`${l.class_date}T${l.class_time}`).getTime()+3600000),
        backgroundColor: "#f1f5f9",
        borderColor: "#cbd5e1",
        textColor: "#334155",
        extendedProps: { assigned: false, type: "trial" }
      }));

    let combinedEvents = [...mappedEvents, ...trialEvents];

    if(isTutor) combinedEvents = combinedEvents.filter(e=>e.extendedProps.tutorId===user.id);
    else if(isStudent) combinedEvents = combinedEvents.filter(e=>e.title===user.full_name || e.id.toString().includes("trial"));

    setEvents(combinedEvents);
  }, [user]);

  useEffect(()=>{ fetchData(); }, [fetchData]);

  const handleDateSelect = async (selectInfo) => {
    if(!isTutor) return;

    const start = new Date(selectInfo.start);
    const end = new Date(start.getTime()+60*60*1000); // 1 hour slot
    const breakAfter = 15*60*1000; // 15 min break after

    try {
      await supabase.from("calendar_events").insert([{
        tutor_id: user.id,
        start_time: start.toISOString(),
        end_time: end.toISOString()
      }]);

      toast.success("1-hour slot created!");
      fetchData();
    } catch(err){
      console.error(err);
      toast.error("Failed to create slot");
    }
  };

  const handleEventClick = async (clickInfo) => {
    if(!isTutor) return;
    if(clickInfo.event.extendedProps.assigned){
      toast.error("Cannot delete assigned slot");
      return;
    }

    if(!window.confirm("Delete this slot?")) return;

    try {
      await supabase.from("calendar_events").delete().eq("id", clickInfo.event.id);
      toast.success("Slot deleted");
      fetchData();
    } catch(err){
      console.error(err);
      toast.error("Failed to delete slot");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative">
      <Toaster />
      <div className="flex items-center gap-3 p-4">
        <button onClick={()=>navigate(-1)} className="p-2 bg-white border rounded"><ArrowLeft size={18}/></button>
        <h1 className="text-xl font-bold">My Schedule</h1>
      </div>

      {isAdmin && (
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 px-4">
          {tutors.map(t=>{
            const booked = events.filter(e=>e.extendedProps.tutorId===t.id && e.extendedProps.assigned).length;
            const free = events.filter(e=>e.extendedProps.tutorId===t.id && !e.extendedProps.assigned).length;
            return (
              <div key={t.id} className="p-3 rounded-xl shadow text-white flex flex-col" style={{backgroundColor:getTutorColor(t.id)}}>
                <span className="font-bold">{t.full_name}</span>
                <span>Free: {free}</span>
                <span>Booked: {booked}</span>
              </div>
            )
          })}
        </div>
      )}

      <div className="bg-white p-4 rounded-xl border m-4">
        <FullCalendar
          plugins={[dayGridPlugin,timeGridPlugin,interactionPlugin]}
          initialView="timeGridWeek"
          selectable={isTutor}
          selectMirror={true}
          select={handleDateSelect}
          events={events}
          editable={false}
          eventClick={handleEventClick}
          allDaySlot={false}
          nowIndicator={true}
        />
      </div>
    </div>
  )
}
// import React, { useEffect, useState, useCallback } from "react";
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import timeGridPlugin from "@fullcalendar/timegrid";
// import { supabase } from "../supabase";
// import { useNavigate } from "react-router-dom";
// import { ArrowLeft } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import "../../src/fullcalendar.css";

// export default function FullCalendarView({ user }) {
//   const navigate = useNavigate();
//   const [events, setEvents] = useState([]);
//   const [tutors, setTutors] = useState([]);
//   const [students, setStudents] = useState([]);
//   const [trialLeads, setTrialLeads] = useState([]);

//   const isAdmin = ["owner", "tech_admin", "operations_admin"].includes(user?.role);
//   const isTutor = user?.role === "tutor";
//   const isStudent = user?.role === "student";

//   const getTutorColor = (id) => {
//     const colors = ["#eab308", "#3b82f6", "#10b981", "#8b5cf6", "#ee692c", "#f472b6"];
//     return id ? colors[id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length] : colors[0];
//   };

//   const fetchData = useCallback(async () => {
//     // Tutors
//     const { data: tutorsData } = await supabase.from("users").select("id, full_name").in("role", ["tutor"]);
//     setTutors(tutorsData || []);

//     // Students
//     const { data: studentsData } = await supabase.from("students").select("id, full_name, assigned_tutor_id, preferred_time, preferred_date");
//     setStudents(studentsData || []);

//     // Trial leads
//     const { data: leadsData } = await supabase.from("leads").select("id, student_name, assigned_tutor_id, class_date, class_time");
//     setTrialLeads(leadsData || []);

//     // Calendar events
//     const { data: calendarData } = await supabase.from("calendar_events").select(`
//       id, start_time, end_time, tutor_id, event_attendance(student_id, students(full_name))
//     `);

//     // Map calendar events
//     const mappedEvents = calendarData.map((e) => {
//       const studentNames = e.event_attendance?.map(a => a.students?.full_name) || [];
//       const isFree = studentNames.length === 0;
//       const tutorName = tutorsData?.find(t => t.id === e.tutor_id)?.full_name;
//       const tutorColor = getTutorColor(e.tutor_id);

//       return {
//         id: e.id,
//         title: isFree ? `Free - ${tutorName}` : studentNames.join(", "),
//         start: e.start_time,
//         end: e.end_time,
//         backgroundColor: isFree ? "#f1f5f9" : tutorColor,
//         borderColor: tutorColor,
//         textColor: isFree ? "#334155" : "#fff",
//         extendedProps: { tutorId: e.tutor_id, assigned: !isFree, type: "course" }
//       };
//     });

//     // Map trial leads that are unassigned
//     const trialEvents = (leadsData || [])
//       .filter(l => !l.assigned_tutor_id) // unassigned only
//       .map(l => ({
//         id: "trial-" + l.id,
//         title: l.student_name,
//         start: new Date(`${l.class_date}T${l.class_time}`),
//         end: new Date(new Date(`${l.class_date}T${l.class_time}`).getTime() + 3600000),
//         backgroundColor: "#f1f5f9",
//         borderColor: "#cbd5e1",
//         textColor: "#334155",
//         extendedProps: { assigned: false, type: "trial" }
//       }));

//     // Combine events
//     let combinedEvents = [...mappedEvents, ...trialEvents];

//     // Filter for tutors/students
//     if (isTutor) {
//       combinedEvents = combinedEvents.filter(e => e.extendedProps.tutorId === user.id);
//     } else if (isStudent) {
//       combinedEvents = combinedEvents.filter(e => e.title === user.full_name || e.id.toString().includes("trial"));
//     }

//     setEvents(combinedEvents);
//   }, [user]);

//   useEffect(() => { fetchData(); }, [fetchData]);

//   return (
//     <div className="flex flex-col min-h-screen bg-slate-50 relative">
//       <Toaster />
//       <div className="flex items-center gap-3 p-4">
//         <button onClick={() => navigate(-1)} className="p-2 bg-white border rounded"><ArrowLeft size={18} /></button>
//         <h1 className="text-xl font-bold">My Schedule</h1>
//       </div>

//       {/* Tutor summary only for admins */}
//       {isAdmin && (
//         <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 px-4">
//           {tutors.map(t => {
//             const booked = events.filter(e => e.extendedProps.tutorId === t.id && e.extendedProps.assigned).length;
//             const free = events.filter(e => e.extendedProps.tutorId === t.id && !e.extendedProps.assigned).length;
//             return (
//               <div key={t.id} className="p-3 rounded-xl shadow text-white flex flex-col" style={{ backgroundColor: getTutorColor(t.id) }}>
//                 <span className="font-bold">{t.full_name}</span>
//                 <span>Free: {free}</span>
//                 <span>Booked: {booked}</span>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* Calendar */}
//       <div className="bg-white p-4 rounded-xl border m-4">
//         <FullCalendar
//           plugins={[dayGridPlugin, timeGridPlugin]}
//           initialView="timeGridWeek"
//           events={events}
//           editable={false}
//           allDaySlot={false}
//           nowIndicator={true}
//         />
//       </div>
//     </div>
//   );
// }
// // import { useState } from "react";
// // import { supabase } from "../supabase";

// // export default function LandingPage() {
// //   const today = new Date().toISOString().split("T")[0];
// //   const [form, setForm] = useState({
// //     parent_name: "",
// //     parent_email: "",
// //     student_name: "",
// //     phone: "",
// //     grade: "",
// //     preferred_date: today,
// //     preferred_time: "00:00",
// //     country: "",
// //     lead_source: "landing_page",
// //     referral_code: "",
// //   });

  
// //   const [loading, setLoading] = useState(false);
// //   const [success, setSuccess] = useState(false);
// //   const [errors, setErrors] = useState({});

// //   const handleChange = (e) => {
// //     setForm({ ...form, [e.target.name]: e.target.value });
// //     setErrors({ ...errors, [e.target.name]: false });
// //   };

// //   const handleCountryChange = (e) => {
// //     const country = e.target.value;
// //     let code = "";
// //     if (country === "Kenya") code = "+254";
// //     else if (country === "Uganda") code = "+256";
// //     else if (country === "Tanzania") code = "+255";
// //     else if (country === "Nigeria") code = "+234";
// //     else if (country === "South Africa") code = "+27";

// //     setForm({ ...form, country, phone: code });
// //     setErrors({ ...errors, country: false });
// //   };

// //   // const submitForm = async (e) => {
// //   //   e.preventDefault();

// //   //   // Validation
// //   //   let newErrors = {};
// //   //   if (!form.parent_name) newErrors.parent_name = true;
// //   //   if (!form.parent_email) newErrors.parent_email = true;
// //   //   if (!form.student_name) newErrors.student_name = true;
// //   //   if (!form.phone) newErrors.phone = true;
// //   //   if (!form.grade) newErrors.grade = true;
// //   //   if (!form.country) newErrors.country = true;
// //   //   if (!form.preferred_date) newErrors.preferred_date = true;
// //   //   if (!form.preferred_time) newErrors.preferred_time = true;

// //   //   if (Object.keys(newErrors).length) {
// //   //     setErrors(newErrors);
// //   //     return;
// //   //   }

// //   //   setLoading(true);

// //   //   const { error } = await supabase.from("leads").insert([{
// //   //     parent_name: form.parent_name,
// //   //     email: form.parent_email,
// //   //     phone: form.phone,
// //   //     country: form.country,
// //   //     class_date: form.preferred_date,
// //   //     class_time: form.preferred_time,
// //   //     lead_source: form.lead_source,
// //   //     referal_code: form.referral_code
// //   //   }]);

// //   //   setLoading(false);

// //   //   if (!error) {
// //   //     setSuccess(true);
// //   //     setForm({
// //   //       parent_name: "",
// //   //       parent_email: "",
// //   //       student_name: "",
// //   //       phone: "",
// //   //       grade: "",
// //   //       preferred_date: "",
// //   //       preferred_time: "",
// //   //       country: "",
// //   //       lead_source: "landing_page",
// //   //       referral_code: "",
// //   //     });
// //   //   } else {
// //   //     alert("Something went wrong. Try again.");
// //   //   }
// //   // };

// // //   const submitForm = async (e) => {
// // //   e.preventDefault();

// // //   // Basic validation
// // //   let newErrors = {};
// // //   ["parent_name","parent_email","student_name","phone","grade","country","preferred_date","preferred_time"].forEach(f => {
// // //     if (!form[f]) newErrors[f] = true;
// // //   });
// // //   if (Object.keys(newErrors).length) {
// // //     setErrors(newErrors);
// // //     return;
// // //   }

// // //   setLoading(true);

// // //   try {
// // //     // Convert date+time into timestamptz for tutor availability
// // //     const scheduledAt = new Date(`${form.preferred_date}T${form.preferred_time}:00`);

// // //     // 1. Check if this phone already has a booking at this date+time
// // //     const { data: existing, error: existingError } = await supabase
// // //       .from("leads")
// // //       .select("*")
// // //       .eq("phone", form.phone)
// // //       .eq("class_date", form.preferred_date)
// // //       .eq("class_time", form.preferred_time.length === 5 ? form.preferred_time + ":00" : form.preferred_time)
// // //       .single();

// // //     if (existingError && existingError.code !== "PGRST116") {
// // //       console.error("Error checking existing leads:", existingError);
// // //       alert("Error checking existing bookings.");
// // //       setLoading(false);
// // //       return;
// // //     }

// // //     if (existing) {
// // //       setLoading(false);
// // //       alert("This phone already has a booking at this date and time.");
// // //       return;
// // //     }

// // //     // 2. Auto-assign tutor if available
// // //     const { data: freeTutors, error: tutorError } = await supabase.rpc(
// // //       "get_available_tutors",
// // //       { desired_time: scheduledAt.toISOString() }
// // //     );

// // //     if (tutorError) {
// // //       console.error("Error fetching available tutors:", tutorError);
// // //     }

// // //     const assignedTutorId = freeTutors?.[0]?.id || null;

// // //     // 3. Insert into leads table
// // //     const { error } = await supabase.from("leads").insert([{
// // //       parent_name: form.parent_name,
// // //       email: form.parent_email,
// // //       phone: form.phone,
// // //       grade: form.grade,
// // //       country: form.country,
// // //       class_date: form.preferred_date,
// // //       class_time: form.preferred_time.length === 5 ? form.preferred_time + ":00" : form.preferred_time,
// // //       assigned_tutor_id: assignedTutorId,
// // //       status: assignedTutorId ? "assigned" : "new",
// // //       lead_source: form.lead_source || "landing_page",
// // //       referal_code: form.referral_code // matches DB column
// // //     }]);

// // //     setLoading(false);

// // //     if (!error) {
// // //       setSuccess(true);
// // //       setForm({
// // //         parent_name: "",
// // //         parent_email: "",
// // //         student_name: "",
// // //         phone: "",
// // //         grade: "",
// // //         preferred_date: today,
// // //         preferred_time: "00:00",
// // //         country: "",
// // //         lead_source: "landing_page",
// // //         referral_code: "",
// // //       });
// // //     } else {
// // //       console.error("Error inserting lead:", error);
// // //       alert(error.message || "Something went wrong. Try again.");
// // //     }

// // //   } catch (err) {
// // //     console.error("Unexpected error:", err);
// // //     setLoading(false);
// // //     alert("Something went wrong. Try again.");
// // //   }
// // // };
// // const submitForm = async (e) => {
// //   e.preventDefault();

// //   // Basic validation
// //   let newErrors = {};
// //   ["parent_name","parent_email","student_name","phone","grade","country","preferred_date","preferred_time"].forEach(f => {
// //     if (!form[f]) newErrors[f] = true;
// //   });
// //   if (Object.keys(newErrors).length) {
// //     setErrors(newErrors);
// //     return;
// //   }

// //   setLoading(true);

// //   try {
// //     const { error } = await supabase.from("leads").insert([{
// //       parent_name: form.parent_name,
// //       student_name: form.student_name,
// //       email: form.parent_email,
// //       phone: form.phone,
// //       grade: form.grade,
// //       country: form.country,
// //       class_date: form.preferred_date,
// //       class_time: form.preferred_time.length === 5 ? form.preferred_time + ":00" : form.preferred_time,
// //       lead_source: form.lead_source || "landing_page",
// //       referal_code: form.referral_code,
// //       status: "new"
// //     }]);

// //     setLoading(false);

// //     if (!error) {
// //       setSuccess(true);
// //       setForm({
// //         parent_name: "",
// //         parent_email: "",
// //         student_name: "",
// //         phone: "",
// //         grade: "",
// //         preferred_date: today,
// //         preferred_time: "00:00",
// //         country: "",
// //         lead_source: "landing_page",
// //         referral_code: "",
// //       });
// //     } else {
// //       console.error(error);
// //       alert("Something went wrong. Try again.");
// //     }

// //   } catch (err) {
// //     console.error(err);
// //     setLoading(false);
// //     alert("Something went wrong. Try again.");
// //   }
// // };
// // // const submitForm = async (e) => {
// // //   e.preventDefault();

// // //   // 1️⃣ Basic validation
// // //   let newErrors = {};
// // //   ["parent_name","parent_email","student_name","phone","grade","country","preferred_date","preferred_time"].forEach(f => {
// // //     if (!form[f]) newErrors[f] = true;
// // //   });
// // //   if (Object.keys(newErrors).length) {
// // //     setErrors(newErrors);
// // //     return;
// // //   }

// // //   setLoading(true);

// // //   try {
// // //     const scheduledAt = new Date(`${form.preferred_date}T${form.preferred_time}:00`);
// // //     const scheduledEnd = new Date(scheduledAt.getTime() + 60*60*1000); // 1 hour duration

// // //     // 2️⃣ Check if this phone already has a booking at this date+time
// // //     const { data: existing } = await supabase
// // //       .from("leads")
// // //       .select("*")
// // //       .eq("phone", form.phone)
// // //       .eq("class_date", form.preferred_date)
// // //       .eq("class_time", form.preferred_time.length === 5 ? form.preferred_time + ":00" : form.preferred_time)
// // //       .single();

// // //     if (existing) {
// // //       setLoading(false);
// // //       alert("This phone already has a booking at this date and time.");
// // //       return;
// // //     }

// // //     // 3️⃣ Auto-assign tutor if available
// // //     const { data: freeTutors } = await supabase.rpc(
// // //       "get_available_tutors",
// // //       { desired_time: scheduledAt.toISOString() }
// // //     );
// // //     const assignedTutor = freeTutors?.[0] || null;

// // //     // 4️⃣ Create student entry
// // //     // const { data: studentData, error: studentError } = await supabase.from("students").insert([{
// // //     //   full_name: form.student_name,
// // //     //   parent_name: form.parent_name,
// // //     //   parent_phone: form.phone,
// // //     //   grade: parseInt(form.grade),
// // //     //   assigned_tutor_id: assignedTutor?.id || null,
// // //     // }]).select().single();

// // //     // if (studentError) throw studentError;

// // //     // const studentId = studentData.id;

// // //     // 5️⃣ Create lead entry
// // //     const { error: leadError } = await supabase.from("leads").insert([{
// // //       parent_name: form.parent_name,
// // //       student_name: form.student_name,
// // //       email: form.parent_email,
// // //       phone: form.phone,
// // //       grade: form.grade,
// // //       country: form.country,
// // //       class_date: form.preferred_date,
// // //       class_time: form.preferred_time.length === 5 ? form.preferred_time + ":00" : form.preferred_time,
// // //       assigned_tutor_id: assignedTutor?.id || null,
// // //       status: assignedTutor ? "assigned" : "new",
// // //       lead_source: form.lead_source || "landing_page",
// // //       referal_code: form.referral_code
// // //     }]);

// // //     if (leadError) throw leadError;

// // //     // 6️⃣ Create calendar event + attendance if tutor exists
// // //     if (assignedTutor) {
// // //       const { data: eventData, error: eventError } = await supabase.from("calendar_events").insert([{
// // //         title: "Trial: " + form.student_name,
// // //         start_time: scheduledAt.toISOString(),
// // //         end_time: scheduledEnd.toISOString(),
// // //         tutor_id: assignedTutor.id,
// // //         class_type: "trial",
// // //       }]).select().single();

// // //       if (eventError) throw eventError;

// // //       // link student to event
// // //       const { error: attendanceError } = await supabase.from("event_attendance").insert([{
// // //         event_id: eventData.id,
// // //         student_id: studentId
// // //       }]);

// // //       if (attendanceError) throw attendanceError;
// // //     }

// // //     // ✅ Success
// // //     setLoading(false);
// // //     setSuccess(true);
// // //     setForm({
// // //       parent_name: "",
// // //       parent_email: "",
// // //       student_name: "",
// // //       phone: "",
// // //       grade: "",
// // //       preferred_date: today,
// // //       preferred_time: "00:00",
// // //       country: "",
// // //       lead_source: "landing_page",
// // //       referral_code: "",
// // //     });

// // //   } catch (err) {
// // //     console.error("Booking error:", err);
// // //     setLoading(false);
// // //     alert(err.message || "Something went wrong. Try again.");
// // //   }
// // // };


// // //   const submitForm = async (e) => {
// // //   e.preventDefault();

// // //   // Basic validation
// // //   let newErrors = {};
// // //   ["parent_name","parent_email","student_name","phone","grade","country","preferred_date","preferred_time"].forEach(f => {
// // //     if (!form[f]) newErrors[f] = true;
// // //   });
// // //   if (Object.keys(newErrors).length) {
// // //     setErrors(newErrors);
// // //     return;
// // //   }

// // //   setLoading(true);

// // //   // Convert date+time into timestamptz
// // //   const scheduledAt = new Date(`${form.preferred_date}T${form.preferred_time}:00`);

// // //   // 1. Check if this phone already has a booking at this time
// // //   const { data: existing } = await supabase
// // //     .from("leads")
// // //     .select("*")
// // //     .eq("phone", form.phone)
// // //     .eq("class_date", form.preferred_date)
// // //     .eq("class_time", form.preferred_time)
// // //     .single();

// // //   if (existing) {
// // //     setLoading(false);
// // //     alert("This phone already has a booking at this time.");
// // //     return;
// // //   }

// // //   // 2. Auto-assign tutor if available
// // //   const { data: freeTutors } = await supabase.rpc("get_available_tutors", { desired_time: scheduledAt.toISOString() });

// // //   const assignedTutorId = freeTutors?.[0]?.id || null; // assign first free tutor or null

// // //   // 3. Insert into leads table
// // //   const { error } = await supabase.from("leads").insert([{
// // //     parent_name: form.parent_name,
// // //     email: form.parent_email,
// // //     phone: form.phone,
// // //     grade: form.grade,
// // //     country: form.country,
// // //     class_date: form.preferred_date,
// // //     class_time: form.preferred_time,
// // //     assigned_tutor_id: assignedTutorId,
// // //     status: assignedTutorId ? "assigned" : "new",
// // //     lead_source: "landing_page",
// // //   }]);

// // //   setLoading(false);

// // //   if (!error) {
// // //     setSuccess(true);
// // //     setForm({
// // //       parent_name: "",
// // //       parent_email: "",
// // //       student_name: "",
// // //       phone: "",
// // //       grade: "",
// // //       preferred_date: "",
// // //       preferred_time: "",
// // //       country: "",
// // //     });
// // //   } else {
// // //     alert("Something went wrong. Try again.");
// // //   }
// // // };

// //   const grades = ["K", ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())];

// //   const countryOptions = [
// //     { name: "Kenya", code: "+254", flag: "🇰🇪" },
// //     { name: "Uganda", code: "+256", flag: "🇺🇬" },
// //     { name: "Tanzania", code: "+255", flag: "🇹🇿" },
// //     { name: "Nigeria", code: "+234", flag: "🇳🇬" },
// //     { name: "South Africa", code: "+27", flag: "🇿🇦" },
// //   ];

// //   const baseInputClass =
// //     "w-full border rounded-xl px-4 py-3 outline-none transition-all duration-300 focus:ring-2 focus:ring-purple-400 focus:shadow-lg focus:shadow-purple-300/30";

// //   const getInputClass = (name) =>
// //     `${baseInputClass} ${errors[name] ? "border-red-500" : "border-purple-400"}`;

// //   return (
// //     <section className="min-h-screen bg-gray-50 relative overflow-hidden flex flex-col items-center justify-start py-12 px-6 md:px-20">
      
// //       {/* LOGO */}
// //       <div className="absolute top-6 left-6 md:top-8 md:left-12 z-50">
// //         <img src="/TechTalkBrand.png" alt="Logo" className="h-12 md:h-14" />
// //       </div>

// //       {/* HEADER */}
// //       <div className="text-center mb-8 mt-6 md:mt-0 z-50 relative">
// //         <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
// //           Give Your Child a Confident Start in Coding 🚀
// //         </h1>
// //         <p className="text-gray-600 mt-2">
// //           Book a free 1-on-1 coding trial with a certified tutor.
// //         </p>
// //       </div>

// //       {/* MAIN CONTENT */}
// //       <div className="flex flex-col md:flex-row items-center w-full max-w-6xl gap-12">

// //         {/* LEFT IMAGE */}
// //         <div className="relative w-full md:w-1/2 flex justify-center mb-10 md:mb-0">
// //           <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-60 animate-rotate-slow"></div>
// //           <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-gradient-to-br from-purple-300 via-pink-300 to-yellow-200 rounded-full opacity-50 animate-rotate-slow reverse"></div>

// //           <img
// //             src="/girl-code.png"
// //             alt="Child coding"
// //             className="relative z-50 w-80 md:w-[28rem] lg:w-[32rem] object-cover rounded-3xl shadow-2xl"
// //           />
// //         </div>

// //         {/* RIGHT FORM */}
// //         <div className="w-full md:w-1/2 relative">
// //           {success ? (
// //             <div className="bg-green-50 border border-green-200 p-8 rounded-3xl text-center">
// //               <h3 className="text-2xl font-bold text-green-800">Booking Confirmed!</h3>
// //               <p className="text-green-700 mt-2">We’ll contact you shortly with trial details.</p>
// //             </div>
// //           ) : (
// //             <form 
// //               onSubmit={submitForm} 
// //               className="space-y-4 bg-white md:bg-transparent md:backdrop-blur-sm md:bg-opacity-50 p-6 md:p-10 rounded-3xl shadow-lg border border-gray-100"
// //             >
// //               <input
// //                 name="parent_name"
// //                 placeholder="Parent name"
// //                 value={form.parent_name}
// //                 onChange={handleChange}
// //                 className={getInputClass("parent_name")}
// //               />
// //               <input
// //                 name="parent_email"
// //                 type="email"
// //                 placeholder="Parent email"
// //                 value={form.parent_email}
// //                 onChange={handleChange}
// //                 className={getInputClass("parent_email")}
// //               />
// //               <input
// //                 name="student_name"
// //                 placeholder="Student name"
// //                 value={form.student_name}
// //                 onChange={handleChange}
// //                 className={getInputClass("student_name")}
// //               />

// //               {/* COUNTRY + FLAG + PHONE + GRADE */}
// //               <div className="flex gap-2 items-center">
// //                 <div className="relative w-36">
// //                   {form.country && (
// //                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl">{countryOptions.find(c => c.name === form.country)?.flag}</span>
// //                   )}
// //                   <select
// //                     name="country"
// //                     value={form.country}
// //                     onChange={handleCountryChange}
// //                     className={`w-full border rounded-xl px-10 py-3 outline-none transition-all duration-300 focus:ring-2 focus:ring-purple-400 focus:shadow-lg focus:shadow-purple-300/30 ${errors.country ? "border-red-500" : "border-purple-400"} bg-white`}
// //                   >
// //                     <option value="">🌍</option>
// //                     {countryOptions.map((c) => (
// //                       <option key={c.name} value={c.name}>{c.name}</option>
// //                     ))}
// //                   </select>
// //                 </div>

// //                 <input
// //                   name="phone"
// //                   placeholder="Phone number"
// //                   value={form.phone}
// //                   onChange={handleChange}
// //                   className={getInputClass("phone")}
// //                 />

// //                 <select
// //                   name="grade"
// //                   value={form.grade}
// //                   onChange={handleChange}
// //                   className={`w-24 border rounded-xl px-4 py-3 outline-none transition-all duration-300 focus:ring-2 focus:ring-purple-400 focus:shadow-lg focus:shadow-purple-300/30 ${errors.grade ? "border-red-500" : "border-purple-400"} bg-white`}
// //                 >
// //                   <option value="" disabled>Grade</option>
// //                   {grades.map((g) => (
// //                     <option key={g} value={g}>{g}</option>
// //                   ))}
// //                 </select>
// //               </div>

// //               <div className="flex gap-2">
// //                 <input
// //                   type="date"
// //                   min={today}
// //                   name="preferred_date"
// //                   value={form.preferred_date}
// //                   onChange={handleChange}
// //                   className={`${baseInputClass} ${errors.preferred_date ? "border-red-500" : "border-purple-400"}`}
// //                 />
// //                 <input
// //                   type="time"
// //                   step="3600"   // ⏱️ 1 hour
// //                   name="preferred_time"
// //                   value={form.preferred_time}
// //                   onChange={handleChange}
// //                   className={`${baseInputClass} ${errors.preferred_time ? "border-red-500" : "border-purple-400"}`}
// //                 />
// //               </div>

// //               <button
// //                 type="submit"
// //                 disabled={loading}
// //                 className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
// //               >
// //                 {loading ? "Booking..." : "Book Free Trial"}
// //               </button>
// //             </form>
// //           )}
// //         </div>
// //         </div>
      
// //       {/* TRUST / METRICS */}
// //       <div className="w-full bg-gray-50 py-12 mt-16 border-t border-gray-100">
// //          <div className="max-w-6xl mx-auto px-6 text-center">
// //            <p className="text-gray-400 font-semibold uppercase tracking-widest text-sm mb-8">
// //              Trusted by Parents from Top Schools
// //            </p>
// //            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 transition-all">
// //              <img src="/school1.png" alt="School Name" className="h-10 md:h-12 hover:scale-105 transition-transform" />
// //              <img src="/school2.jpeg" alt="School Name" className="h-10 md:h-12 hover:scale-105 transition-transform" />
// //              <img src="/school3.jpeg" alt="School Name" className="h-10 md:h-12 hover:scale-105 transition-transform" />
// //             <img src="/tech-partner.jpeg" alt="Partner Name" className="h-10 md:h-12 hover:scale-105 transition-transform" />
// //            </div>
// //            <div className="mt-10 flex flex-col md:flex-row justify-center items-center gap-8 border-t border-gray-200 pt-10">
// //              <div className="text-center">
// //                <span className="block text-3xl font-bold text-gray-800">500+</span>
// //                <span className="text-gray-500 text-sm">Active Students</span>
// //              </div>
// //              <div className="hidden md:block w-px h-10 bg-gray-300"></div>
// //              <div className="text-center">
// //                <span className="block text-3xl font-bold text-gray-800">4.9/5</span>
// //                <span className="text-gray-500 text-sm">Parent Rating</span>
// //              </div>
// //              <div className="hidden md:block w-px h-10 bg-gray-300"></div>
// //              <div className="text-center">
// //                <span className="block text-3xl font-bold text-gray-800">12+</span>
// //                <span className="text-gray-500 text-sm">Coding Courses</span>
// //              </div>
// //            </div>
// //          </div>
// //          </div>
// //     </section>
// //   );
// // }

// // // import { useState } from "react";
// // // import { supabase } from "../supabase";

// // // export default function LandingPage() {
// // //   const [form, setForm] = useState({
// // //     parent_name: "",
// // //     parent_email: "",
// // //     student_name: "",
// // //     phone: "",
// // //     grade: "",
// // //     preferred_date: "",
// // //     preferred_time: "",
// // //     country: "",
// // //   });

// // //   const [loading, setLoading] = useState(false);
// // //   const [success, setSuccess] = useState(false);
// // //   const [errors, setErrors] = useState({}); // Track errors

// // //   const handleChange = (e) => {
// // //     setForm({ ...form, [e.target.name]: e.target.value });
// // //     setErrors({ ...errors, [e.target.name]: false });
// // //   };

// // //   const handleCountryChange = (e) => {
// // //     const country = e.target.value;
// // //     let code = "";
// // //     if (country === "Kenya") code = "+254";
// // //     else if (country === "Uganda") code = "+256";
// // //     else if (country === "Tanzania") code = "+255";
// // //     else if (country === "Nigeria") code = "+234";
// // //     else if (country === "South Africa") code = "+27";

// // //     setForm({ ...form, country, phone: code });
// // //     setErrors({ ...errors, country: false });
// // //   };

// // //   const submitForm = async (e) => {
// // //     e.preventDefault();

// // //     // Basic front-end validation
// // //     let newErrors = {};
// // //     if (!form.parent_name) newErrors.parent_name = true;
// // //     if (!form.parent_email) newErrors.parent_email = true;
// // //     if (!form.student_name) newErrors.student_name = true;
// // //     if (!form.phone) newErrors.phone = true;
// // //     if (!form.grade) newErrors.grade = true;
// // //     if (!form.country) newErrors.country = true;

// // //     if (Object.keys(newErrors).length) {
// // //       setErrors(newErrors);
// // //       return;
// // //     }

// // //     setLoading(true);
// // //     const { error } = await supabase.from("trial_leads").insert([form]);
// // //     setLoading(false);

// // //     if (!error) {
// // //       setSuccess(true);
// // //       setForm({
// // //         parent_name: "",
// // //         parent_email: "",
// // //         student_name: "",
// // //         phone: "",
// // //         grade: "",
// // //         preferred_date: "",
// // //         preferred_time: "",
// // //         country: "",
// // //       });
// // //     } else {
// // //       alert("Something went wrong. Try again.");
// // //     }
// // //   };

// // //   const grades = ["K", ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())];

// // //   const countryOptions = [
// // //     { name: "Kenya", code: "+254", flag: "🇰🇪" },
// // //     { name: "Uganda", code: "+256", flag: "🇺🇬" },
// // //     { name: "Tanzania", code: "+255", flag: "🇹🇿" },
// // //     { name: "Nigeria", code: "+234", flag: "🇳🇬" },
// // //     { name: "South Africa", code: "+27", flag: "🇿🇦" },
// // //   ];

// // //   // Base classes for input/select
// // //   const baseInputClass =
// // //     "w-full border rounded-xl px-4 py-3 outline-none transition-all duration-300 focus:ring-2 focus:ring-purple-400 focus:shadow-lg focus:shadow-purple-300/30";

// // //   const getInputClass = (name) =>
// // //     `${baseInputClass} ${errors[name] ? "border-red-500" : "border-purple-400"}`;

// // //   return (
// // //     <section className="min-h-screen bg-gray-50 relative overflow-hidden flex flex-col items-center justify-start py-12 px-6 md:px-20">
      
// // //       {/* LOGO */}
// // //       <div className="absolute top-6 left-6 md:top-8 md:left-12 z-50">
// // //         <img src="/TechTalkBrand.png" alt="Logo" className="h-12 md:h-14" />
// // //       </div>

// // //       {/* HEADER */}
// // //       <div className="text-center mb-8 mt-6 md:mt-0 z-50 relative">
// // //         <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
// // //           Give Your Child a Confident Start in Coding 🚀
// // //         </h1>
// // //         <p className="text-gray-600 mt-2">
// // //           Book a free 1-on-1 coding trial with a certified tutor.
// // //         </p>
// // //       </div>

// // //       {/* MAIN CONTENT */}
// // //       <div className="flex flex-col md:flex-row items-center w-full max-w-6xl gap-12">

// // //         {/* LEFT IMAGE */}
// // //         <div className="relative w-full md:w-1/2 flex justify-center mb-10 md:mb-0">
// // //           <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-60 animate-rotate-slow"></div>
// // //           <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-gradient-to-br from-purple-300 via-pink-300 to-yellow-200 rounded-full opacity-50 animate-rotate-slow reverse"></div>

// // //           <img
// // //             src="/girl-code.png"
// // //             alt="Child coding"
// // //             className="relative z-50 w-80 md:w-[28rem] lg:w-[32rem] object-cover rounded-3xl shadow-2xl"
// // //           />
// // //         </div>

// // //         {/* RIGHT FORM */}
// // //         <div className="w-full md:w-1/2 relative">
// // //           {success ? (
// // //             <div className="bg-green-50 border border-green-200 p-8 rounded-3xl text-center">
// // //               <h3 className="text-2xl font-bold text-green-800">Booking Confirmed!</h3>
// // //               <p className="text-green-700 mt-2">We’ll contact you shortly with trial details.</p>
// // //             </div>
// // //           ) : (
// // //             <form 
// // //               onSubmit={submitForm} 
// // //               className="space-y-4 bg-white md:bg-transparent md:backdrop-blur-sm md:bg-opacity-50 p-6 md:p-10 rounded-3xl shadow-lg border border-gray-100"
// // //             >
// // //               <input
// // //                 name="parent_name"
// // //                 placeholder="Parent name"
// // //                 value={form.parent_name}
// // //                 onChange={handleChange}
// // //                 className={getInputClass("parent_name")}
// // //               />
// // //               <input
// // //                 name="parent_email"
// // //                 type="email"
// // //                 placeholder="Parent email"
// // //                 value={form.parent_email}
// // //                 onChange={handleChange}
// // //                 className={getInputClass("parent_email")}
// // //               />
// // //               <input
// // //                 name="student_name"
// // //                 placeholder="Student name"
// // //                 value={form.student_name}
// // //                 onChange={handleChange}
// // //                 className={getInputClass("student_name")}
// // //               />

// // //               {/* COUNTRY + FLAG + PHONE + GRADE */}
// // //               <div className="flex gap-2 items-center">
// // //                 <div className="relative w-36">
// // //                   {form.country && (
// // //                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl">{countryOptions.find(c => c.name === form.country)?.flag}</span>
// // //                   )}
// // //                   <select
// // //                     name="country"
// // //                     value={form.country}
// // //                     onChange={handleCountryChange}
// // //                     className={`w-full border rounded-xl px-10 py-3 outline-none transition-all duration-300 focus:ring-2 focus:ring-purple-400 focus:shadow-lg focus:shadow-purple-300/30 ${errors.country ? "border-red-500" : "border-purple-400"} bg-white`}
// // //                   >
// // //                     <option value="">🌍</option>
// // //                     {countryOptions.map((c) => (
// // //                       <option key={c.name} value={c.name}>{c.name}</option>
// // //                     ))}
// // //                   </select>
// // //                 </div>

// // //                 <input
// // //                   name="phone"
// // //                   placeholder="Phone number"
// // //                   value={form.phone}
// // //                   onChange={handleChange}
// // //                   className={getInputClass("phone")}
// // //                 />

// // //                 <select
// // //                   name="grade"
// // //                   value={form.grade}
// // //                   onChange={handleChange}
// // //                   className={`w-24 border rounded-xl px-4 py-3 outline-none transition-all duration-300 focus:ring-2 focus:ring-purple-400 focus:shadow-lg focus:shadow-purple-300/30 ${errors.grade ? "border-red-500" : "border-purple-400"} bg-white`}
// // //                 >
// // //                   <option value="" disabled>Grade</option>
// // //                   {grades.map((g) => (
// // //                     <option key={g} value={g}>{g}</option>
// // //                   ))}
// // //                 </select>
// // //               </div>

// // //               <div className="flex gap-2">
// // //                 <input
// // //                   type="date"
// // //                   name="preferred_date"
// // //                   value={form.preferred_date}
// // //                   onChange={handleChange}
// // //                   className={baseInputClass}
// // //                 />
// // //                 <input
// // //                   type="time"
// // //                   name="preferred_time"
// // //                   value={form.preferred_time}
// // //                   onChange={handleChange}
// // //                   className={baseInputClass}
// // //                 />
// // //               </div>

// // //               <button
// // //                 type="submit"
// // //                 disabled={loading}
// // //                 className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
// // //               >
// // //                 {loading ? "Booking..." : "Book Free Trial"}
// // //               </button>
// // //             </form>
// // //           )}
// // //         </div>
// // //       </div>

// // //       {/* TRUST / METRICS */}
// // //       <div className="w-full bg-gray-50 py-12 mt-16 border-t border-gray-100">
// // //         <div className="max-w-6xl mx-auto px-6 text-center">
// // //           <p className="text-gray-400 font-semibold uppercase tracking-widest text-sm mb-8">
// // //             Trusted by Parents from Top Schools
// // //           </p>
// // //           <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 transition-all">
// // //             <img src="/school1.png" alt="School Name" className="h-10 md:h-12 hover:scale-105 transition-transform" />
// // //             <img src="/school2.jpeg" alt="School Name" className="h-10 md:h-12 hover:scale-105 transition-transform" />
// // //             <img src="/school3.jpeg" alt="School Name" className="h-10 md:h-12 hover:scale-105 transition-transform" />
// // //             <img src="/tech-partner.jpeg" alt="Partner Name" className="h-10 md:h-12 hover:scale-105 transition-transform" />
// // //           </div>

// // //           <div className="mt-10 flex flex-col md:flex-row justify-center items-center gap-8 border-t border-gray-200 pt-10">
// // //             <div className="text-center">
// // //               <span className="block text-3xl font-bold text-gray-800">500+</span>
// // //               <span className="text-gray-500 text-sm">Active Students</span>
// // //             </div>
// // //             <div className="hidden md:block w-px h-10 bg-gray-300"></div>
// // //             <div className="text-center">
// // //               <span className="block text-3xl font-bold text-gray-800">4.9/5</span>
// // //               <span className="text-gray-500 text-sm">Parent Rating</span>
// // //             </div>
// // //             <div className="hidden md:block w-px h-10 bg-gray-300"></div>
// // //             <div className="text-center">
// // //               <span className="block text-3xl font-bold text-gray-800">12+</span>
// // //               <span className="text-gray-500 text-sm">Coding Courses</span>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </section>
// // //   );
// // // }

// // // // import { useState } from "react";
// // // // import { supabase } from "../supabase";

// // // // export default function LandingPage() {
// // // //   const [form, setForm] = useState({
// // // //     parent_name: "",
// // // //     parent_email: "",
// // // //     student_name: "",
// // // //     phone: "",
// // // //     grade: "",
// // // //     preferred_date: "",
// // // //     preferred_time: "",
// // // //     country: "",
// // // //   });

// // // //   const [loading, setLoading] = useState(false);
// // // //   const [success, setSuccess] = useState(false);

// // // //   const handleChange = (e) =>
// // // //     setForm({ ...form, [e.target.name]: e.target.value });

// // // //   const handleCountryChange = (e) => {
// // // //     const country = e.target.value;
// // // //     let code = "";
// // // //     if (country === "Kenya") code = "+254";
// // // //     else if (country === "Uganda") code = "+256";
// // // //     else if (country === "Tanzania") code = "+255";
// // // //     else if (country === "Nigeria") code = "+234";
// // // //     else if (country === "South Africa") code = "+27";

// // // //     setForm({ ...form, country, phone: code });
// // // //   };

// // // //   const submitForm = async (e) => {
// // // //     e.preventDefault();
// // // //     setLoading(true);

// // // //     const { error } = await supabase.from("trial_leads").insert([form]);
// // // //     setLoading(false);

// // // //     if (!error) {
// // // //       setSuccess(true);
// // // //       setForm({
// // // //         parent_name: "",
// // // //         parent_email: "",
// // // //         student_name: "",
// // // //         phone: "",
// // // //         grade: "",
// // // //         preferred_date: "",
// // // //         preferred_time: "",
// // // //         country: "",
// // // //       });
// // // //     } else {
// // // //       alert("Something went wrong. Try again.");
// // // //     }
// // // //   };

// // // //   const grades = ["K", ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())];

// // // //   const countryOptions = [
// // // //     { name: "Kenya", code: "+254", flag: "🇰🇪" },
// // // //     { name: "Uganda", code: "+256", flag: "🇺🇬" },
// // // //     { name: "Tanzania", code: "+255", flag: "🇹🇿" },
// // // //     { name: "Nigeria", code: "+234", flag: "🇳🇬" },
// // // //     { name: "South Africa", code: "+27", flag: "🇿🇦" },
// // // //   ];

// // // //   const inputClasses = "w-full border border-purple-400 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-400 outline-none transition-all duration-300";

// // // //   return (
// // // //     <section className="min-h-screen bg-gray-50 relative overflow-hidden flex flex-col items-center justify-start py-12 px-6 md:px-20">
      
// // // //       {/* LOGO */}
// // // //       <div className="absolute top-6 left-6 md:top-8 md:left-12 z-50">
// // // //         <img src="/TechTalkBrand.png" alt="Logo" className="h-12 md:h-14" />
// // // //       </div>

// // // //       {/* HEADER */}
// // // //       <div className="text-center mb-8 mt-6 md:mt-0 z-50 relative">
// // // //         <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
// // // //           Give Your Child a Confident Start in Coding 🚀
// // // //         </h1>
// // // //         <p className="text-gray-600 mt-2">
// // // //           Book a free 1-on-1 coding trial with a certified tutor.
// // // //         </p>
// // // //       </div>

// // // //       {/* MAIN CONTENT */}
// // // //       <div className="flex flex-col md:flex-row items-center w-full max-w-6xl gap-12">

// // // //         {/* LEFT IMAGE */}
// // // //         <div className="relative w-full md:w-1/2 flex justify-center mb-10 md:mb-0">
// // // //           <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-60 animate-rotate-slow"></div>
// // // //           <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-gradient-to-br from-purple-300 via-pink-300 to-yellow-200 rounded-full opacity-50 animate-rotate-slow reverse"></div>

// // // //           <img
// // // //             src="/girl-code.png"
// // // //             alt="Child coding"
// // // //             className="relative z-50 w-80 md:w-[28rem] lg:w-[32rem] object-cover rounded-3xl shadow-2xl"
// // // //           />
// // // //         </div>

// // // //         {/* RIGHT FORM */}
// // // //         <div className="w-full md:w-1/2 relative">
// // // //           {success ? (
// // // //             <div className="bg-green-50 border border-green-200 p-8 rounded-3xl text-center">
// // // //               <h3 className="text-2xl font-bold text-green-800">Booking Confirmed!</h3>
// // // //               <p className="text-green-700 mt-2">We’ll contact you shortly with trial details.</p>
// // // //             </div>
// // // //           ) : (
// // // //             <form 
// // // //               onSubmit={submitForm} 
// // // //               className="space-y-4 bg-white md:bg-transparent md:backdrop-blur-sm md:bg-opacity-50 p-6 md:p-10 rounded-3xl shadow-lg border border-gray-100"
// // // //             >
// // // //               <input
// // // //                 name="parent_name"
// // // //                 placeholder="Parent name"
// // // //                 value={form.parent_name}
// // // //                 onChange={handleChange}
// // // //                 required
// // // //                 className={inputClasses}
// // // //               />
// // // //               <input
// // // //                 name="parent_email"
// // // //                 type="email"
// // // //                 placeholder="Parent email"
// // // //                 value={form.parent_email}
// // // //                 onChange={handleChange}
// // // //                 required
// // // //                 className={inputClasses}
// // // //               />
// // // //               <input
// // // //                 name="student_name"
// // // //                 placeholder="Student name"
// // // //                 value={form.student_name}
// // // //                 onChange={handleChange}
// // // //                 required
// // // //                 className={inputClasses}
// // // //               />

// // // //               {/* COUNTRY + FLAG + PHONE + GRADE */}
// // // //               <div className="flex gap-2 items-center">
// // // //                 <div className="relative w-36">
// // // //                   {form.country && (
// // // //                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl">{countryOptions.find(c => c.name === form.country)?.flag}</span>
// // // //                   )}
// // // //                   <select
// // // //                     name="country"
// // // //                     value={form.country}
// // // //                     onChange={handleCountryChange}
// // // //                     className={`w-full border border-purple-400 rounded-xl px-10 py-3 focus:ring-2 focus:ring-purple-400 outline-none transition-all duration-300 bg-white`}
// // // //                   >
// // // //                     <option value="">Select Country</option>
// // // //                     {countryOptions.map((c) => (
// // // //                       <option key={c.name} value={c.name}>{c.name}</option>
// // // //                     ))}
// // // //                   </select>
// // // //                 </div>

// // // //                 <input
// // // //                   name="phone"
// // // //                   placeholder="Phone number"
// // // //                   value={form.phone}
// // // //                   onChange={handleChange}
// // // //                   required
// // // //                   className="flex-1 border border-purple-400 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-400 outline-none transition-all duration-300"
// // // //                 />

// // // //                 <select
// // // //                   name="grade"
// // // //                   value={form.grade}
// // // //                   onChange={handleChange}
// // // //                   required
// // // //                   className="w-24 border border-purple-400 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-400 outline-none transition-all duration-300 bg-white"
// // // //                 >
// // // //                   <option value="" disabled>Grade</option>
// // // //                   {grades.map((g) => (
// // // //                     <option key={g} value={g}>{g}</option>
// // // //                   ))}
// // // //                 </select>
// // // //               </div>

// // // //               <div className="flex gap-2">
// // // //                 <input
// // // //                   type="date"
// // // //                   name="preferred_date"
// // // //                   value={form.preferred_date}
// // // //                   onChange={handleChange}
// // // //                   className="flex-1 border border-purple-400 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-400 outline-none transition-all duration-300"
// // // //                 />
// // // //                 <input
// // // //                   type="time"
// // // //                   name="preferred_time"
// // // //                   value={form.preferred_time}
// // // //                   onChange={handleChange}
// // // //                   className="flex-1 border border-purple-400 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-400 outline-none transition-all duration-300"
// // // //                 />
// // // //               </div>

// // // //               <button
// // // //                 type="submit"
// // // //                 disabled={loading}
// // // //                 className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
// // // //               >
// // // //                 {loading ? "Booking..." : "Book Free Trial"}
// // // //               </button>
// // // //             </form>
// // // //           )}
// // // //         </div>
// // // //       </div>
// // // //     </section>
// // // //   );
// // // // }
