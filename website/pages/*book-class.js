// import { supabase } from "../utils/supabase";
// import "../app/globals.css";
// import { useEffect, useState, useRef } from "react";

// const Counter = ({ end, duration = 2000 }) => {
//   const [count, setCount] = useState(0);
//   const countRef = useRef(null);

//   useEffect(() => {
//     const observer = new IntersectionObserver(([entry]) => {
//       if (entry.isIntersecting) {
//         let start = 0;
//         const endVal = parseInt(end);
//         const stepTime = Math.max(1, Math.floor(duration / endVal));
//         const timer = setInterval(() => {
//           start += 1;
//           setCount(start);
//           if (start >= endVal) clearInterval(timer);
//         }, stepTime);
//         observer.disconnect();
//       }
//     });
//     if (countRef.current) observer.observe(countRef.current);
//     return () => observer.disconnect();
//   }, [end, duration]);

//   return <span ref={countRef}>{count}+</span>;
// };

// export default function LandingPage() {
//   const today = new Date().toISOString().split("T")[0];
//   const [form, setForm] = useState({
//     parent_name: "", parent_email: "", student_name: "", phone: "", grade: "",
//     preferred_date: today, preferred_time: "00:00", country: "",
//     lead_source: "landing_page", referral_code: "",
//   });

//   const [loading, setLoading] = useState(false);
//   const [success, setSuccess] = useState(false);
//   const [errors, setErrors] = useState({});

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//     setErrors({ ...errors, [e.target.name]: false });
//   };

//   const handleCountryChange = (e) => {
//     const country = e.target.value;
//     const codes = { "Kenya": "+254", "Uganda": "+256", "Tanzania": "+255", "Nigeria": "+234", "South Africa": "+27" };
//     setForm({ ...form, country, phone: codes[country] || "" });
//     setErrors({ ...errors, country: false });
//   };

//   const submitForm = async (e) => {
//     e.preventDefault();
//     let newErrors = {};
//     ["parent_name", "parent_email", "student_name", "phone", "grade", "country", "preferred_date", "preferred_time"].forEach(f => {
//       if (!form[f]) newErrors[f] = true;
//     });
//     if (Object.keys(newErrors).length) return setErrors(newErrors);

//     setLoading(true);
//     const { error } = await supabase.from("leads").insert([{
//       parent_name: form.parent_name, student_name: form.student_name,
//       email: form.parent_email, phone: form.phone, grade: form.grade,
//       country: form.country, class_date: form.preferred_date,
//       class_time: form.preferred_time, status: "new"
//     }]);
//     setLoading(false);
//     if (!error) setSuccess(true);
//     else alert("Something went wrong. Try again.");
//   };

//   const grades = ["K", ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())];
//   const countryOptions = [
//     { name: "Kenya", code: "+254", flag: "🇰🇪" }, { name: "Uganda", code: "+256", flag: "🇺🇬" },
//     { name: "Tanzania", code: "+255", flag: "🇹🇿" }, { name: "Nigeria", code: "+234", flag: "🇳🇬" },
//     { name: "South Africa", code: "+27", flag: "🇿🇦" },
//   ];

//   const getInputClass = (name) => `w-full border rounded-xl px-4 py-3 outline-none transition-all duration-300 focus:ring-2 focus:ring-purple-400 ${errors[name] ? "border-red-500" : "border-purple-400"}`;

//   // Reusable Summary Component
//   const Summary = () => (
//     <div className="bg-indigo-900 p-6 rounded-3xl text-white shadow-2xl">
//       <h3 className="font-bold border-b border-indigo-700 pb-2 mb-4">Summary</h3>
//       <div className="space-y-2 text-xs">
//         {Object.entries({ Parent: form.parent_name, Email: form.parent_email, Student: form.student_name, Grade: form.grade, Country: form.country, Phone: form.phone, Date: form.preferred_date, Time: form.preferred_time }).map(([k, v]) => (
//           <p key={k} className="flex justify-between"><span>{k}:</span> <span className="font-bold truncate ml-2">{v || "-"}</span></p>
//         ))}
//       </div>
//     </div>
//   );

//   return (
//     // <section className="min-h-screen bg-gray-50 py-12 px-6 md:px-20 overflow-hidden">
//     <section className="min-h-screen bg-gray-50 py-6 px-6 md:px-20 overflow-hidden">
//       <div className="flex items-center justify-center relative w-full mb-12">
//         <div className="absolute left-0"><img src="/logo.png" alt="Logo" className="h-10 w-10 rounded-full object-cover border border-gray-200 shadow-sm" /></div>
//         <div className="text-center">
//           <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">Give Your Child a Confident Start in Coding 🚀</h1>
//           <p className="text-gray-600 mt-2">Book a free 1-on-1 coding trial with a certified tutor.</p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-5 gap-8 w-full max-w-6xl items-start mx-auto">
//         <div className="md:col-span-2 order-1 md:order-none relative">
//           {success ? (
//             <div className="bg-green-50 border border-green-200 p-8 rounded-3xl text-center">
//               <h3 className="text-2xl font-bold text-green-800">Booking Confirmed!</h3>
//             </div>
//           ) : (
//             <form onSubmit={submitForm} className="space-y-4 bg-white/50 backdrop-blur-sm p-6 md:p-10 rounded-3xl shadow-lg border border-gray-100">
//               <input name="parent_name" placeholder="Parent name" value={form.parent_name} onChange={handleChange} className={getInputClass("parent_name")} />
//               <input name="parent_email" type="email" placeholder="Parent email" value={form.parent_email} onChange={handleChange} className={getInputClass("parent_email")} />
//               <input name="student_name" placeholder="Student name" value={form.student_name} onChange={handleChange} className={getInputClass("student_name")} />
//               <div className="flex gap-2 items-center">
//                 <select name="country" value={form.country} onChange={handleCountryChange} className={getInputClass("country") + " w-36"}>
//                   <option value="">🌍 Country</option>
//                   {countryOptions.map((c) => <option key={c.name} value={c.name}>{c.flag} {c.name}</option>)}
//                 </select>
//                 <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className={getInputClass("phone")} />
//                 <select name="grade" value={form.grade} onChange={handleChange} className={getInputClass("grade") + " w-24"}>
//                   <option value="" disabled>Grade</option>
//                   {grades.map((g) => <option key={g} value={g}>{g}</option>)}
//                 </select>
//               </div>
//               <div className="flex gap-2">
//                 <input type="date" name="preferred_date" value={form.preferred_date} onChange={handleChange} className={getInputClass("preferred_date")} />
//                 <input type="time" name="preferred_time" value={form.preferred_time} onChange={handleChange} className={getInputClass("preferred_time")} />
//               </div>
              
//               {/* Summary shown inside form on mobile, hidden on desktop */}
//               <div className="block md:hidden"><Summary /></div>

//               <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl shadow-lg hover:opacity-90">
//                 {loading ? "Booking..." : "Book Free Trial"}
//               </button>
//             </form>
//           )}
//         </div>

//         {/* Desktop Summary Sidebar */}
//         <div className="hidden md:block md:col-span-1 order-2"><Summary /></div>

//         <div className="md:col-span-2 order-3 md:order-none relative flex justify-center mb-10 md:mb-0">
//           <img src="/girl-code.png" alt="Child coding" className="relative z-50 w-full md:w-[32rem] object-cover rounded-3xl shadow-2xl" />
//         </div>
//       </div>
//     </section>
//   );
// }
// import { supabase } from "../utils/supabase";
// import "../app/globals.css";
// import { useEffect, useState, useRef } from "react";

// const Counter = ({ end, duration = 2000 }) => {
//   const [count, setCount] = useState(0);
//   const countRef = useRef(null);

//   useEffect(() => {
//     const observer = new IntersectionObserver(([entry]) => {
//       if (entry.isIntersecting) {
//         let start = 0;
//         const endVal = parseInt(end);
//         const stepTime = Math.max(1, Math.floor(duration / endVal));
//         const timer = setInterval(() => {
//           start += 1;
//           setCount(start);
//           if (start >= endVal) clearInterval(timer);
//         }, stepTime);
//         observer.disconnect();
//       }
//     });
//     if (countRef.current) observer.observe(countRef.current);
//     return () => observer.disconnect();
//   }, [end, duration]);

//   return <span ref={countRef}>{count}+</span>;
// };

// export default function LandingPage() {
//   const today = new Date().toISOString().split("T")[0];
//   const [form, setForm] = useState({
//     parent_name: "", parent_email: "", student_name: "", phone: "", grade: "",
//     preferred_date: today, preferred_time: "00:00", country: "",
//     lead_source: "landing_page", referral_code: "",
//   });

//   const [loading, setLoading] = useState(false);
//   const [success, setSuccess] = useState(false);
//   const [errors, setErrors] = useState({});

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//     setErrors({ ...errors, [e.target.name]: false });
//   };

//   const handleCountryChange = (e) => {
//     const country = e.target.value;
//     const codes = { "Kenya": "+254", "Uganda": "+256", "Tanzania": "+255", "Nigeria": "+234", "South Africa": "+27" };
//     setForm({ ...form, country, phone: codes[country] || "" });
//     setErrors({ ...errors, country: false });
//   };

//   const submitForm = async (e) => {
//     e.preventDefault();
//     let newErrors = {};
//     ["parent_name", "parent_email", "student_name", "phone", "grade", "country", "preferred_date", "preferred_time"].forEach(f => {
//       if (!form[f]) newErrors[f] = true;
//     });
//     if (Object.keys(newErrors).length) return setErrors(newErrors);

//     setLoading(true);
//     const { error } = await supabase.from("leads").insert([{
//       parent_name: form.parent_name, student_name: form.student_name,
//       email: form.parent_email, phone: form.phone, grade: form.grade,
//       country: form.country, class_date: form.preferred_date,
//       class_time: form.preferred_time, status: "new"
//     }]);
//     setLoading(false);
//     if (!error) setSuccess(true);
//     else alert("Something went wrong. Try again.");
//   };

//   const grades = ["K", ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())];
//   const countryOptions = [
//     { name: "Kenya", code: "+254", flag: "🇰🇪" }, { name: "Uganda", code: "+256", flag: "🇺🇬" },
//     { name: "Tanzania", code: "+255", flag: "🇹🇿" }, { name: "Nigeria", code: "+234", flag: "🇳🇬" },
//     { name: "South Africa", code: "+27", flag: "🇿🇦" },
//   ];

//   const getInputClass = (name) => `w-full border rounded-xl px-4 py-3 outline-none transition-all duration-300 focus:ring-2 focus:ring-purple-400 ${errors[name] ? "border-red-500" : "border-purple-400"}`;

//   return (
//     <section className="min-h-screen bg-gray-50 py-12 px-6 md:px-20 overflow-hidden">
//       {/* Header Section */}
//       <div className="flex items-center justify-center relative w-full mb-12">
//         <div className="absolute left-0">
//           <img src="/logo.png" alt="Logo" className="h-10 w-10 rounded-full object-cover border border-gray-200 shadow-sm" />
//         </div>
//         <div className="text-center">
//           <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">Give Your Child a Confident Start in Coding 🚀</h1>
//           <p className="text-gray-600 mt-2">Book a free 1-on-1 coding trial with a certified tutor.</p>
//         </div>
//       </div>

//       {/* Main Content Grid with Mobile Ordering */}
//       <div className="grid grid-cols-1 md:grid-cols-5 gap-8 w-full max-w-6xl items-start mx-auto">
        
//         {/* FORM - Mobile First */}
//         <div className="md:col-span-2 order-1 md:order-none relative">
//           {success ? (
//             <div className="bg-green-50 border border-green-200 p-8 rounded-3xl text-center">
//               <h3 className="text-2xl font-bold text-green-800">Booking Confirmed!</h3>
//             </div>
//           ) : (
//             <form onSubmit={submitForm} className="space-y-4 bg-white/50 backdrop-blur-sm p-6 md:p-10 rounded-3xl shadow-lg border border-gray-100">
//               <input name="parent_name" placeholder="Parent name" value={form.parent_name} onChange={handleChange} className={getInputClass("parent_name")} />
//               <input name="parent_email" type="email" placeholder="Parent email" value={form.parent_email} onChange={handleChange} className={getInputClass("parent_email")} />
//               <input name="student_name" placeholder="Student name" value={form.student_name} onChange={handleChange} className={getInputClass("student_name")} />
//               <div className="flex gap-2 items-center">
//                 <select name="country" value={form.country} onChange={handleCountryChange} className={getInputClass("country") + " w-36"}>
//                   <option value="">🌍 Country</option>
//                   {countryOptions.map((c) => <option key={c.name} value={c.name}>{c.flag} {c.name}</option>)}
//                 </select>
//                 <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className={getInputClass("phone")} />
//                 <select name="grade" value={form.grade} onChange={handleChange} className={getInputClass("grade") + " w-24"}>
//                   <option value="" disabled>Grade</option>
//                   {grades.map((g) => <option key={g} value={g}>{g}</option>)}
//                 </select>
//               </div>
//               <div className="flex gap-2">
//                 <input type="date" name="preferred_date" value={form.preferred_date} onChange={handleChange} className={getInputClass("preferred_date")} />
//                 <input type="time" name="preferred_time" value={form.preferred_time} onChange={handleChange} className={getInputClass("preferred_time")} />
//               </div>
//               <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl hover:opacity-90">
//                 {loading ? "Booking..." : "Book Free Trial"}
//               </button>
//             </form>
//           )}
//         </div>

//         {/* SUMMARY */}
//         <div className="md:col-span-1 order-2 md:order-none bg-indigo-900 p-6 rounded-3xl text-white shadow-2xl h-full">
//           <h3 className="font-bold border-b border-indigo-700 pb-2 mb-4">Summary</h3>
//           <div className="space-y-3 text-xs">
//             {Object.entries({ Parent: form.parent_name, Email: form.parent_email, Student: form.student_name, Grade: form.grade, Country: form.country, Phone: form.phone, Date: form.preferred_date, Time: form.preferred_time }).map(([k, v]) => (
//               <p key={k} className="flex justify-between"><span>{k}:</span> <span className="font-bold truncate ml-2">{v || "-"}</span></p>
//             ))}
//           </div>
//         </div>

//         {/* IMAGE */}
//         <div className="md:col-span-2 order-3 md:order-none relative flex justify-center mb-10 md:mb-0">
//           <img src="/girl-code.png" alt="Child coding" className="relative z-50 w-full md:w-[32rem] object-cover rounded-3xl shadow-2xl" />
//         </div>
//       </div>

//       {/* FOOTER METRICS */}
//       <div className="w-full mt-20 py-16 bg-white border-y border-gray-100">
//         <div className="max-w-6xl mx-auto px-6 text-center">
//           <div className="flex flex-wrap justify-center gap-12 md:gap-24">
//             <div className="text-center"><span className="block text-4xl font-extrabold text-purple-600"><Counter end="500" /></span><span className="text-gray-500 text-sm uppercase">Students</span></div>
//             <div className="text-center"><span className="block text-4xl font-extrabold text-purple-600">4.9/5</span><span className="text-gray-500 text-sm uppercase">Rating</span></div>
//             <div className="text-center"><span className="block text-4xl font-extrabold text-purple-600"><Counter end="12" /></span><span className="text-gray-500 text-sm uppercase">Courses</span></div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

import { supabase } from "../utils/supabase";
import "../app/globals.css";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

const Counter = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const stepTime = Math.abs(Math.floor(duration / parseInt(end)));
        const timer = setInterval(() => {
          start += 1;
          setCount(start);
          if (start >= parseInt(end)) clearInterval(timer);
        }, stepTime);
        observer.disconnect();
      }
    });
    if (countRef.current) observer.observe(countRef.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={countRef}>{count}+</span>;
};

export default function LandingPage() {
  const today = new Date().toISOString().split("T")[0];
  const router = useRouter();
  const [form, setForm] = useState({
    parent_name: "",
    parent_email: "",
    student_name: "",
    phone: "",
    grade: "",
    preferred_date: today,
    preferred_time: "00:00",
    country: "",
    lead_source: "landing_page",
    referral_code: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: false });
  };

  const handleCountryChange = (e) => {
    const country = e.target.value;
    let code = "";
    if (country === "Kenya") code = "+254";
    else if (country === "Uganda") code = "+256";
    else if (country === "Tanzania") code = "+255";
    else if (country === "Nigeria") code = "+234";
    else if (country === "South Africa") code = "+27";

    setForm({ ...form, country, phone: code });
    setErrors({ ...errors, country: false });
  };

  // const submitForm = async (e) => {
  //   e.preventDefault();
  //   let newErrors = {};
  //   ["parent_name","parent_email","student_name","phone","grade","country","preferred_date","preferred_time"].forEach(f => {
  //     if (!form[f]) newErrors[f] = true;
  //   });
  //   if (Object.keys(newErrors).length) {
  //     setErrors(newErrors);
  //     return;
  //   }
  //   setLoading(true);
  //   try {
  //     const { error } = await supabase.from("leads").insert([{
  //       parent_name: form.parent_name,
  //       student_name: form.student_name,
  //       email: form.parent_email,
  //       phone: form.phone,
  //       grade: form.grade,
  //       country: form.country,
  //       class_date: form.preferred_date,
  //       class_time: form.preferred_time.length === 5 ? form.preferred_time + ":00" : form.preferred_time,
  //       lead_source: form.lead_source || "landing_page",
  //       referal_code: form.referral_code,
  //       status: "new"
  //     }]);
  //     setLoading(false);
  //     if (!error) {
  //       setSuccess(true);
  //       setForm({ ...form, parent_name: "", parent_email: "", student_name: "", phone: "", grade: "", preferred_date: today, preferred_time: "00:00", country: "" });
  //     } else {
  //       alert("Something went wrong. Try again.");
  //     }
  //   } catch (err) {
  //     setLoading(false);
  //     alert("Something went wrong. Try again.");
  //   }
  // };
    const submitForm = async (e) => {
    e.preventDefault();
    let newErrors = {};
    ["parent_name","parent_email","student_name","phone","grade","country","preferred_date","preferred_time"].forEach(f => {
      if (!form[f]) newErrors[f] = true;
    });
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("leads").insert([{
        parent_name: form.parent_name,
        student_name: form.student_name,
        email: form.parent_email,
        phone: form.phone,
        grade: form.grade,
        country: form.country,
        class_date: form.preferred_date,
        class_time: form.preferred_time.length === 5 ? form.preferred_time + ":00" : form.preferred_time,
        lead_source: form.lead_source || "landing_page",
        referal_code: form.referral_code,
        status: "new"
      }]);
      
      if (!error) {
        router.push("/success"); // Redirect to your success page
      } else {
        router.push("/error"); // Redirect to your error page
      }
    } catch (err) {
      router.push("/error");
    } finally {
      setLoading(false);
    }
  };

  const grades = ["K", ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())];
  const countryOptions = [
    { name: "Kenya", code: "+254", flag: "🇰🇪" },
    { name: "Uganda", code: "+256", flag: "🇺🇬" },
    { name: "Tanzania", code: "+255", flag: "🇹🇿" },
    { name: "Nigeria", code: "+234", flag: "🇳🇬" },
    { name: "South Africa", code: "+27", flag: "🇿🇦" },
  ];

  const baseInputClass = "w-full border rounded-xl px-4 py-3 outline-none transition-all duration-300 focus:ring-2 focus:ring-purple-400 focus:shadow-lg focus:shadow-purple-300/30";
  const getInputClass = (name) => `${baseInputClass} ${errors[name] ? "border-red-500" : "border-purple-400"}`;

  return (
    <section className="min-h-screen bg-gray-50 relative overflow-hidden flex flex-col items-center justify-start py-12 px-6 md:px-20">
      

    {/* WRAPPER FOR LOGO + HEADER */}
<div className="flex items-center justify-center relative w-full mb-8">
  


  {/* LOGO (Positioned absolutely inside the relative flex container) */}
  <div className="absolute left-0">
    <img 
      src="/logo.png" 
      alt="Logo" 
      className="h-10 w-10 rounded-full object-cover border border-gray-200 shadow-sm" 
    />
  </div>

  {/* HEADER */}
  <div className="text-center">
    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
      Give Your Child a Confident Start in Coding 🚀
    </h1>
    <p className="text-gray-600 mt-2">Book a free 1-on-1 coding trial with a certified tutor.</p>
  </div>
</div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 w-full max-w-6xl items-start">
        
        {/* LEFT IMAGE WITH EFFECTS */}
        <div className="md:col-span-2 relative flex justify-center mb-10 md:mb-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-gradient-to-br from-purple-300 via-pink-300 to-yellow-200 rounded-full opacity-50 animate-pulse delay-1000"></div>
          <img src="/girl-code.png" alt="Child coding" className="relative z-50 w-full md:w-[32rem] object-cover rounded-3xl shadow-2xl" />
        </div>

        {/* RIGHT FORM */}
        <div className="md:col-span-2 relative">
          {success ? (
            <div className="bg-green-50 border border-green-200 p-8 rounded-3xl text-center">
              <h3 className="text-2xl font-bold text-green-800">Booking Confirmed!</h3>
              <p className="text-green-700 mt-2">We’ll contact you shortly with trial details.</p>
            </div>
          ) : (
            <form onSubmit={submitForm} className="space-y-4 bg-white/50 backdrop-blur-sm p-6 md:p-10 rounded-3xl shadow-lg border border-gray-100">
              <input name="parent_name" placeholder="Parent name" value={form.parent_name} onChange={handleChange} className={getInputClass("parent_name")} />
              <input name="parent_email" type="email" placeholder="Parent email" value={form.parent_email} onChange={handleChange} className={getInputClass("parent_email")} />
              <input name="student_name" placeholder="Student name" value={form.student_name} onChange={handleChange} className={getInputClass("student_name")} />

              <div className="flex gap-2 items-center">
                <select name="country" value={form.country} onChange={handleCountryChange} className={getInputClass("country") + " w-36"}>
                  <option value="">🌍 Country</option>
                  {countryOptions.map((c) => <option key={c.name} value={c.name}>{c.flag} {c.name}</option>)}
                </select>
                <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className={getInputClass("phone")} />
                <select name="grade" value={form.grade} onChange={handleChange} className={getInputClass("grade") + " w-24"}>
                  <option value="" disabled>Grade</option>
                  {grades.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div className="flex gap-2">
                <input type="date" name="preferred_date" value={form.preferred_date} onChange={handleChange} className={getInputClass("preferred_date")} />
                <input type="time" name="preferred_time" value={form.preferred_time} onChange={handleChange} className={getInputClass("preferred_time")} />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl shadow-lg hover:opacity-90">
                {loading ? "Booking..." : "Book Free Trial"}
              </button>
            </form>
          )}
        </div>

        {/* SUMMARY */}
        <div className="md:col-span-1 bg-indigo-900 p-6 rounded-3xl text-white shadow-2xl h-full">
          <h3 className="font-bold border-b border-indigo-700 pb-2 mb-4">Summary</h3>
         <div className="space-y-3 text-xs">
    <p className="flex justify-between"><span>Parent:</span> <span className="font-bold truncate ml-2">{form.parent_name || "-"}</span></p>
    <p className="flex justify-between"><span>Email:</span> <span className="font-bold truncate ml-2">{form.parent_email || "-"}</span></p>
    <p className="flex justify-between"><span>Student:</span> <span className="font-bold truncate ml-2">{form.student_name || "-"}</span></p>
    <p className="flex justify-between"><span>Grade:</span> <span className="font-bold truncate ml-2">{form.grade || "-"}</span></p>
    <p className="flex justify-between"><span>Country:</span> <span className="font-bold truncate ml-2">{form.country || "-"}</span></p>
    <p className="flex justify-between"><span>Phone:</span> <span className="font-bold truncate ml-2">{form.phone || "-"}</span></p>
    <p className="flex justify-between"><span>Date:</span> <span className="font-bold truncate ml-2">{form.preferred_date || "-"}</span></p>
    <p className="flex justify-between"><span>Time:</span> <span className="font-bold truncate ml-2">{form.preferred_time || "-"}</span></p>
  </div>
        </div>
      </div>


      {/* FOOTER METRICS */}
    
<div className="w-full mt-20 py-16 bg-white border-y border-gray-100">
  <div className="max-w-6xl mx-auto px-6 text-center">
    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs mb-12">
      Trusted by Parents from Top Schools
    </p>

    <div className="flex flex-wrap justify-center gap-12 md:gap-24">
      <div className="text-center">
        <span className="block text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-purple-600 mb-2">
          <Counter end="500" />
        </span>
        <span className="text-gray-500 font-medium text-sm tracking-wide uppercase">Students</span>
      </div>

      <div className="text-center">
        <span className="block text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-purple-600 mb-2">
          4.9/5
        </span>
        <span className="text-gray-500 font-medium text-sm tracking-wide uppercase">Parent Rating</span>
      </div>

      <div className="text-center">
        <span className="block text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-purple-600 mb-2">
          <Counter end="12" />
        </span>
        <span className="text-gray-500 font-medium text-sm tracking-wide uppercase">Courses</span>
      </div>
    </div>
  </div>
</div>
    </section>
  );
}
// // // import { supabase } from "../utils/supabase";
// // // import "../app/globals.css";
// // // import { useState } from "react";

// // // export default function LandingPage() {
// // //   const today = new Date().toISOString().split("T")[0];
// // //   const [form, setForm] = useState({
// // //     parent_name: "",
// // //     parent_email: "",
// // //     student_name: "",
// // //     phone: "",
// // //     grade: "",
// // //     preferred_date: today,
// // //     preferred_time: "00:00",
// // //     country: "",
// // //     lead_source: "landing_page",
// // //     referral_code: "",
// // //   });

// // //   const [loading, setLoading] = useState(false);
// // //   const [success, setSuccess] = useState(false);
// // //   const [errors, setErrors] = useState({});

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
// // //     let newErrors = {};
// // //     ["parent_name", "parent_email", "student_name", "phone", "grade", "country", "preferred_date", "preferred_time"].forEach(f => {
// // //       if (!form[f]) newErrors[f] = true;
// // //     });
// // //     if (Object.keys(newErrors).length) {
// // //       setErrors(newErrors);
// // //       return;
// // //     }

// // //     setLoading(true);
// // //     try {
// // //       const { error } = await supabase.from("leads").insert([{
// // //         parent_name: form.parent_name,
// // //         student_name: form.student_name,
// // //         email: form.parent_email,
// // //         phone: form.phone,
// // //         grade: form.grade,
// // //         country: form.country,
// // //         class_date: form.preferred_date,
// // //         class_time: form.preferred_time.length === 5 ? form.preferred_time + ":00" : form.preferred_time,
// // //         lead_source: form.lead_source || "landing_page",
// // //         referal_code: form.referral_code,
// // //         status: "new"
// // //       }]);

// // //       setLoading(false);
// // //       if (!error) {
// // //         setSuccess(true);
// // //       } else {
// // //         alert("Something went wrong. Try again.");
// // //       }
// // //     } catch (err) {
// // //       setLoading(false);
// // //       alert("Something went wrong. Try again.");
// // //     }
// // //   };

// // //   const grades = ["K", ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())];
// // //   const countryOptions = [
// // //     { name: "Kenya", flag: "🇰🇪" }, { name: "Uganda", flag: "🇺🇬" },
// // //     { name: "Tanzania", flag: "🇹🇿" }, { name: "Nigeria", flag: "🇳🇬" },
// // //     { name: "South Africa", flag: "🇿🇦" },
// // //   ];

// // //   const baseInputClass = "w-full border rounded-xl px-4 py-3 outline-none transition-all duration-300 focus:ring-2 focus:ring-purple-400 focus:shadow-lg focus:shadow-purple-300/30";
// // //   const getInputClass = (name) => `${baseInputClass} ${errors[name] ? "border-red-500" : "border-purple-400"}`;

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
// // //         <p className="text-gray-600 mt-2">Book a free 1-on-1 coding trial with a certified tutor.</p>
// // //       </div>

// // //       {/* MAIN GRID */}
// // //       <div className="grid grid-cols-1 md:grid-cols-5 gap-8 w-full max-w-6xl items-start relative">
        
// // //         {/* LEFT IMAGE WITH EFFECTS */}
// // //         <div className="md:col-span-2 relative flex justify-center">
// // //           <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-60 animate-rotate-slow"></div>
// // //           <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-gradient-to-br from-purple-300 via-pink-300 to-yellow-200 rounded-full opacity-50 animate-rotate-slow reverse"></div>
// // //           <img src="/girl-code.png" alt="Child coding" className="relative z-50 w-full object-cover rounded-3xl shadow-2xl" />
// // //         </div>

// // //         {/* RIGHT FORM */}
// // //         <div className="md:col-span-2 relative z-10">
// // //           {/* ... (Your form code remains here) ... */}
// // //         </div>

// // //         {/* SUMMARY */}
// // //         <div className="md:col-span-1 bg-indigo-900 p-6 rounded-3xl text-white shadow-xl h-full">
// // //           {/* ... (Your summary code remains here) ... */}
// // //         </div>
// // //       </div>
// // //     </section>
// // //   );
// // // }
// // // // import { supabase } from "../utils/supabase";
// // // // import "../app/globals.css";
// // // // import { useState } from "react";

// // // // export default function LandingPage() {
// // // //   const today = new Date().toISOString().split("T")[0];
// // // //   const [form, setForm] = useState({
// // // //     parent_name: "",
// // // //     parent_email: "",
// // // //     student_name: "",
// // // //     phone: "",
// // // //     grade: "",
// // // //     preferred_date: today,
// // // //     preferred_time: "00:00",
// // // //     country: "",
// // // //     lead_source: "landing_page",
// // // //     referral_code: "",
// // // //   });

// // // //   const [loading, setLoading] = useState(false);
// // // //   const [success, setSuccess] = useState(false);
// // // //   const [errors, setErrors] = useState({});

// // // //   const handleChange = (e) => {
// // // //     setForm({ ...form, [e.target.name]: e.target.value });
// // // //     setErrors({ ...errors, [e.target.name]: false });
// // // //   };

// // // //   const handleCountryChange = (e) => {
// // // //     const country = e.target.value;
// // // //     let code = "";
// // // //     if (country === "Kenya") code = "+254";
// // // //     else if (country === "Uganda") code = "+256";
// // // //     else if (country === "Tanzania") code = "+255";
// // // //     else if (country === "Nigeria") code = "+234";
// // // //     else if (country === "South Africa") code = "+27";

// // // //     setForm({ ...form, country, phone: code });
// // // //     setErrors({ ...errors, country: false });
// // // //   };

// // // //   const submitForm = async (e) => {
// // // //     e.preventDefault();
// // // //     let newErrors = {};
// // // //     ["parent_name", "parent_email", "student_name", "phone", "grade", "country", "preferred_date", "preferred_time"].forEach(f => {
// // // //       if (!form[f]) newErrors[f] = true;
// // // //     });
// // // //     if (Object.keys(newErrors).length) {
// // // //       setErrors(newErrors);
// // // //       return;
// // // //     }

// // // //     setLoading(true);
// // // //     try {
// // // //       const { error } = await supabase.from("leads").insert([{
// // // //         parent_name: form.parent_name,
// // // //         student_name: form.student_name,
// // // //         email: form.parent_email,
// // // //         phone: form.phone,
// // // //         grade: form.grade,
// // // //         country: form.country,
// // // //         class_date: form.preferred_date,
// // // //         class_time: form.preferred_time.length === 5 ? form.preferred_time + ":00" : form.preferred_time,
// // // //         lead_source: form.lead_source || "landing_page",
// // // //         referal_code: form.referral_code,
// // // //         status: "new"
// // // //       }]);

// // // //       setLoading(false);
// // // //       if (!error) {
// // // //         setSuccess(true);
// // // //         setForm({ ...form, parent_name: "", parent_email: "", student_name: "", phone: "", grade: "", country: "" });
// // // //       } else {
// // // //         console.error(error);
// // // //         alert("Something went wrong. Try again.");
// // // //       }
// // // //     } catch (err) {
// // // //       console.error(err);
// // // //       setLoading(false);
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

// // // //   const baseInputClass = "w-full border rounded-xl px-4 py-3 outline-none transition-all duration-300 focus:ring-2 focus:ring-purple-400 focus:shadow-lg focus:shadow-purple-300/30";
// // // //   const getInputClass = (name) => `${baseInputClass} ${errors[name] ? "border-red-500" : "border-purple-400"}`;

// // // //   return (
// // // //     <section className="min-h-screen bg-gray-50 relative overflow-hidden flex flex-col items-center justify-start py-12 px-6 md:px-20">
      
// // // //       <div className="absolute top-6 left-6 md:top-8 md:left-12 z-50">
// // // //         <img src="/TechTalkBrand.png" alt="Logo" className="h-12 md:h-14" />
// // // //       </div>

// // // //       <div className="text-center mb-8 mt-6 md:mt-0 z-50 relative">
// // // //         <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
// // // //           Give Your Child a Confident Start in Coding 🚀
// // // //         </h1>
// // // //         <p className="text-gray-600 mt-2">Book a free 1-on-1 coding trial with a certified tutor.</p>
// // // //       </div>

// // // //       <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start w-full max-w-6xl">
// // // //         <div className="md:col-span-2 relative">
// // // //           <img src="/girl-code.png" alt="Child coding" className="relative z-50 w-full object-cover rounded-3xl shadow-2xl" />
// // // //         </div>

// // // //         <div className="md:col-span-2">
// // // //           {success ? (
// // // //             <div className="bg-green-50 border border-green-200 p-8 rounded-3xl text-center">
// // // //               <h3 className="text-2xl font-bold text-green-800">Booking Confirmed!</h3>
// // // //               <p className="text-green-700 mt-2">We’ll contact you shortly with trial details.</p>
// // // //             </div>
// // // //           ) : (
// // // //             <form onSubmit={submitForm} className="space-y-4 bg-white md:bg-transparent md:backdrop-blur-sm md:bg-opacity-50 p-6 md:p-10 rounded-3xl shadow-lg border border-gray-100">
// // // //               <input name="parent_name" placeholder="Parent name" value={form.parent_name} onChange={handleChange} className={getInputClass("parent_name")} />
// // // //               <input name="parent_email" type="email" placeholder="Parent email" value={form.parent_email} onChange={handleChange} className={getInputClass("parent_email")} />
// // // //               <input name="student_name" placeholder="Student name" value={form.student_name} onChange={handleChange} className={getInputClass("student_name")} />

// // // //               <div className="flex gap-2 items-center">
// // // //                 <div className="relative w-36">
// // // //                   {form.country && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl">{countryOptions.find(c => c.name === form.country)?.flag}</span>}
// // // //                   <select name="country" value={form.country} onChange={handleCountryChange} className={`w-full border rounded-xl px-10 py-3 ${errors.country ? "border-red-500" : "border-purple-400"} bg-white`}>
// // // //                     <option value="">🌍</option>
// // // //                     {countryOptions.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
// // // //                   </select>
// // // //                 </div>
// // // //                 <input name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange} className={getInputClass("phone")} />
// // // //                 <select name="grade" value={form.grade} onChange={handleChange} className={`w-24 border rounded-xl px-4 py-3 ${errors.grade ? "border-red-500" : "border-purple-400"} bg-white`}>
// // // //                   <option value="" disabled>Grade</option>
// // // //                   {grades.map((g) => <option key={g} value={g}>{g}</option>)}
// // // //                 </select>
// // // //               </div>

// // // //               <div className="flex gap-2">
// // // //                 <input type="date" min={today} name="preferred_date" value={form.preferred_date} onChange={handleChange} className={`${baseInputClass} ${errors.preferred_date ? "border-red-500" : "border-purple-400"}`} />
// // // //                 <input type="time" name="preferred_time" value={form.preferred_time} onChange={handleChange} className={`${baseInputClass} ${errors.preferred_time ? "border-red-500" : "border-purple-400"}`} />
// // // //               </div>

// // // //               <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl shadow-lg">
// // // //                 {loading ? "Booking..." : "Book Free Trial"}
// // // //               </button>
// // // //             </form>
// // // //           )}
// // // //         </div>

// // // //         <div className="md:col-span-1 bg-indigo-900 p-6 rounded-3xl text-white shadow-xl h-full">
// // // //           <h3 className="font-bold border-b border-indigo-700 pb-2 mb-4">Summary</h3>
// // // //           <div className="space-y-3 text-xs">
// // // //             <p className="flex justify-between"><span>Parent:</span> <span className="font-bold">{form.parent_name || "-"}</span></p>
// // // //             <p className="flex justify-between"><span>Student:</span> <span className="font-bold">{form.student_name || "-"}</span></p>
// // // //             <p className="flex justify-between"><span>Grade:</span> <span className="font-bold">{form.grade || "-"}</span></p>
// // // //             <p className="flex justify-between"><span>Country:</span> <span className="font-bold">{form.country || "-"}</span></p>
// // // //             <p className="flex justify-between"><span>Phone:</span> <span className="font-bold">{form.phone || "-"}</span></p>
// // // //             <p className="flex justify-between"><span>Date:</span> <span className="font-bold">{form.preferred_date}</span></p>
// // // //             <p className="flex justify-between"><span>Time:</span> <span className="font-bold">{form.preferred_time}</span></p>
// // // //           </div>
// // // //         </div>
// // // //       </div>

// // // //       <div className="w-full bg-gray-50 py-12 mt-16 border-t border-gray-100">
// // // //         <div className="max-w-6xl mx-auto px-6 text-center">
// // // //           <p className="text-gray-400 font-semibold uppercase tracking-widest text-sm mb-8">Trusted by Parents from Top Schools</p>
// // // //           {/* Metrics section ... */}
// // // //         </div>
// // // //       </div>
// // // //     </section>
// // // //   );
// // // // }
// // // // // import { supabase } from "../utils/supabase";
// // // // // import "../app/globals.css";
// // // // // import { useState } from "react";

// // // // // export default function LandingPage() {
// // // // //   const today = new Date().toISOString().split("T")[0];
// // // // //   const [form, setForm] = useState({
// // // // //     parent_name: "",
// // // // //     parent_email: "",
// // // // //     student_name: "",
// // // // //     phone: "",
// // // // //     grade: "",
// // // // //     preferred_date: today,
// // // // //     preferred_time: "00:00",
// // // // //     country: "",
// // // // //     lead_source: "landing_page",
// // // // //     referral_code: "",
// // // // //   });

  
// // // // //   const [loading, setLoading] = useState(false);
// // // // //   const [success, setSuccess] = useState(false);
// // // // //   const [errors, setErrors] = useState({});

// // // // //   const handleChange = (e) => {
// // // // //     setForm({ ...form, [e.target.name]: e.target.value });
// // // // //     setErrors({ ...errors, [e.target.name]: false });
// // // // //   };

// // // // //   const handleCountryChange = (e) => {
// // // // //     const country = e.target.value;
// // // // //     let code = "";
// // // // //     if (country === "Kenya") code = "+254";
// // // // //     else if (country === "Uganda") code = "+256";
// // // // //     else if (country === "Tanzania") code = "+255";
// // // // //     else if (country === "Nigeria") code = "+234";
// // // // //     else if (country === "South Africa") code = "+27";

// // // // //     setForm({ ...form, country, phone: code });
// // // // //     setErrors({ ...errors, country: false });
// // // // //   };

// // // // // const submitForm = async (e) => {
// // // // //   e.preventDefault();

// // // // //   // Basic validation
// // // // //   let newErrors = {};
// // // // //   ["parent_name","parent_email","student_name","phone","grade","country","preferred_date","preferred_time"].forEach(f => {
// // // // //     if (!form[f]) newErrors[f] = true;
// // // // //   });
// // // // //   if (Object.keys(newErrors).length) {
// // // // //     setErrors(newErrors);
// // // // //     return;
// // // // //   }

// // // // //   setLoading(true);

// // // // //   try {
// // // // //     const { error } = await supabase.from("leads").insert([{
// // // // //       parent_name: form.parent_name,
// // // // //       student_name: form.student_name,
// // // // //       email: form.parent_email,
// // // // //       phone: form.phone,
// // // // //       grade: form.grade,
// // // // //       country: form.country,
// // // // //       class_date: form.preferred_date,
// // // // //       class_time: form.preferred_time.length === 5 ? form.preferred_time + ":00" : form.preferred_time,
// // // // //       lead_source: form.lead_source || "landing_page",
// // // // //       referal_code: form.referral_code,
// // // // //       status: "new"
// // // // //     }]);

// // // // //     setLoading(false);

// // // // //     if (!error) {
// // // // //       setSuccess(true);
// // // // //       setForm({
// // // // //         parent_name: "",
// // // // //         parent_email: "",
// // // // //         student_name: "",
// // // // //         phone: "",
// // // // //         grade: "",
// // // // //         preferred_date: today,
// // // // //         preferred_time: "00:00",
// // // // //         country: "",
// // // // //         lead_source: "landing_page",
// // // // //         referral_code: "",
// // // // //       });
// // // // //     } else {
// // // // //       console.error(error);
// // // // //       alert("Something went wrong. Try again.");
// // // // //     }

// // // // //   } catch (err) {
// // // // //     console.error(err);
// // // // //     setLoading(false);
// // // // //     alert("Something went wrong. Try again.");
// // // // //   }
// // // // // };


// // // // //   const grades = ["K", ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())];

// // // // //   const countryOptions = [
// // // // //     { name: "Kenya", code: "+254", flag: "🇰🇪" },
// // // // //     { name: "Uganda", code: "+256", flag: "🇺🇬" },
// // // // //     { name: "Tanzania", code: "+255", flag: "🇹🇿" },
// // // // //     { name: "Nigeria", code: "+234", flag: "🇳🇬" },
// // // // //     { name: "South Africa", code: "+27", flag: "🇿🇦" },
// // // // //   ];

// // // // //   const baseInputClass =
// // // // //     "w-full border rounded-xl px-4 py-3 outline-none transition-all duration-300 focus:ring-2 focus:ring-purple-400 focus:shadow-lg focus:shadow-purple-300/30";

// // // // //   const getInputClass = (name) =>
// // // // //     `${baseInputClass} ${errors[name] ? "border-red-500" : "border-purple-400"}`;

// // // // //   return (
// // // // //     <section className="min-h-screen bg-gray-50 relative overflow-hidden flex flex-col items-center justify-start py-12 px-6 md:px-20">
      
// // // // //       {/* LOGO */}
// // // // //       <div className="absolute top-6 left-6 md:top-8 md:left-12 z-50">
// // // // //         <img src="/TechTalkBrand.png" alt="Logo" className="h-12 md:h-14" />
// // // // //       </div>

// // // // //       {/* HEADER */}
// // // // //       <div className="text-center mb-8 mt-6 md:mt-0 z-50 relative">
// // // // //         <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
// // // // //           Give Your Child a Confident Start in Coding 🚀
// // // // //         </h1>
// // // // //         <p className="text-gray-600 mt-2">
// // // // //           Book a free 1-on-1 coding trial with a certified tutor.
// // // // //         </p>
// // // // //       </div>

// // // // //       {/* MAIN CONTENT */}
// // // // //       // <div className="flex flex-col md:flex-row items-center w-full max-w-6xl gap-12">
// // // // //       <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">

// // // // //         {/* LEFT IMAGE */}
// // // // //         // <div className="relative w-full md:w-1/2 flex justify-center mb-10 md:mb-0">
// // // // //           // <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-60 animate-rotate-slow"></div>
// // // // //           // <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-gradient-to-br from-purple-300 via-pink-300 to-yellow-200 rounded-full opacity-50 animate-rotate-slow reverse"></div>
// // // // // <div className="md:col-span-2 relative">
// // // // //           <img
// // // // //             src="/girl-code.png"
// // // // //             alt="Child coding"
// // // // //             className="relative z-50 w-80 md:w-[28rem] lg:w-[32rem] object-cover rounded-3xl shadow-2xl"
// // // // //           />
// // // // //         </div>

// // // // //         {/* RIGHT FORM */}
// // // // //         // <div className="w-full md:w-1/2 relative">
// // // // //         <div className="md:col-span-2">
// // // // //           {success ? (
// // // // //             <div className="bg-green-50 border border-green-200 p-8 rounded-3xl text-center">
// // // // //               <h3 className="text-2xl font-bold text-green-800">Booking Confirmed!</h3>
// // // // //               <p className="text-green-700 mt-2">We’ll contact you shortly with trial details.</p>
// // // // //             </div>
// // // // //           ) : (
// // // // //             <form 
// // // // //               onSubmit={submitForm} 
// // // // //               className="space-y-4 bg-white md:bg-transparent md:backdrop-blur-sm md:bg-opacity-50 p-6 md:p-10 rounded-3xl shadow-lg border border-gray-100"
// // // // //             >
// // // // //               <input
// // // // //                 name="parent_name"
// // // // //                 placeholder="Parent name"
// // // // //                 value={form.parent_name}
// // // // //                 onChange={handleChange}
// // // // //                 className={getInputClass("parent_name")}
// // // // //               />
// // // // //               <input
// // // // //                 name="parent_email"
// // // // //                 type="email"
// // // // //                 placeholder="Parent email"
// // // // //                 value={form.parent_email}
// // // // //                 onChange={handleChange}
// // // // //                 className={getInputClass("parent_email")}
// // // // //               />
// // // // //               <input
// // // // //                 name="student_name"
// // // // //                 placeholder="Student name"
// // // // //                 value={form.student_name}
// // // // //                 onChange={handleChange}
// // // // //                 className={getInputClass("student_name")}
// // // // //               />

// // // // //               {/* COUNTRY + FLAG + PHONE + GRADE */}
// // // // //               <div className="flex gap-2 items-center">
// // // // //                 <div className="relative w-36">
// // // // //                   {form.country && (
// // // // //                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl">{countryOptions.find(c => c.name === form.country)?.flag}</span>
// // // // //                   )}
// // // // //                   <select
// // // // //                     name="country"
// // // // //                     value={form.country}
// // // // //                     onChange={handleCountryChange}
// // // // //                     className={`w-full border rounded-xl px-10 py-3 outline-none transition-all duration-300 focus:ring-2 focus:ring-purple-400 focus:shadow-lg focus:shadow-purple-300/30 ${errors.country ? "border-red-500" : "border-purple-400"} bg-white`}
// // // // //                   >
// // // // //                     <option value="">🌍</option>
// // // // //                     {countryOptions.map((c) => (
// // // // //                       <option key={c.name} value={c.name}>{c.name}</option>
// // // // //                     ))}
// // // // //                   </select>
// // // // //                 </div>

// // // // //                 <input
// // // // //                   name="phone"
// // // // //                   placeholder="Phone number"
// // // // //                   value={form.phone}
// // // // //                   onChange={handleChange}
// // // // //                   className={getInputClass("phone")}
// // // // //                 />

// // // // //                 <select
// // // // //                   name="grade"
// // // // //                   value={form.grade}
// // // // //                   onChange={handleChange}
// // // // //                   className={`w-24 border rounded-xl px-4 py-3 outline-none transition-all duration-300 focus:ring-2 focus:ring-purple-400 focus:shadow-lg focus:shadow-purple-300/30 ${errors.grade ? "border-red-500" : "border-purple-400"} bg-white`}
// // // // //                 >
// // // // //                   <option value="" disabled>Grade</option>
// // // // //                   {grades.map((g) => (
// // // // //                     <option key={g} value={g}>{g}</option>
// // // // //                   ))}
// // // // //                 </select>
// // // // //               </div>

// // // // //               <div className="flex gap-2">
// // // // //                 <input
// // // // //                   type="date"
// // // // //                   min={today}
// // // // //                   name="preferred_date"
// // // // //                   value={form.preferred_date}
// // // // //                   onChange={handleChange}
// // // // //                   className={`${baseInputClass} ${errors.preferred_date ? "border-red-500" : "border-purple-400"}`}
// // // // //                 />
// // // // //                 <input
// // // // //                   type="time"
// // // // //                   step="3600"   // ⏱️ 1 hour
// // // // //                   name="preferred_time"
// // // // //                   value={form.preferred_time}
// // // // //                   onChange={handleChange}
// // // // //                   className={`${baseInputClass} ${errors.preferred_time ? "border-red-500" : "border-purple-400"}`}
// // // // //                 />
// // // // //               </div>

// // // // //               <button
// // // // //                 type="submit"
// // // // //                 disabled={loading}
// // // // //                 className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
// // // // //               >
// // // // //                 {loading ? "Booking..." : "Book Free Trial"}
// // // // //               </button>
// // // // //             </form>
// // // // //           )}
// // // // //         </div>
// // // // //        </div>
// // // // //         {/* Updated Booking Summary Section */}
// // // // // // <div className="mt-8 p-6 bg-gradient-to-br from-blue-900 to-indigo-900 rounded-3xl text-white shadow-2xl">
// // // // // //   <h3 className="text-lg font-semibold mb-4 border-b border-blue-700 pb-2">Booking Summary</h3>
// // // // // //   <div className="space-y-3 text-sm">
// // // // //         <div className="md:col-span-1 bg-indigo-900 p-6 rounded-3xl text-white shadow-xl h-full">
// // // // //             <h3 className="font-bold border-b border-indigo-700 pb-2 mb-4">Summary</h3>
// // // // //             <div className="space-y-3 text-xs">
// // // // //     <p className="flex justify-between"><span>Parent:</span> <span className="font-bold">{form.parent_name || "-"}</span></p>
// // // // //     <p className="flex justify-between"><span>Student:</span> <span className="font-bold">{form.student_name || "-"}</span></p>
// // // // //     <p className="flex justify-between"><span>Grade:</span> <span className="font-bold">{form.grade || "-"}</span></p>
// // // // //     {/* Added Country and Phone fields here */}
// // // // //     <p className="flex justify-between"><span>Country:</span> <span className="font-bold">{form.country || "-"}</span></p>
// // // // //     <p className="flex justify-between"><span>Phone:</span> <span className="font-bold">{form.phone || "-"}</span></p>
// // // // //     <p className="flex justify-between"><span>Date:</span> <span className="font-bold">{form.preferred_date}</span></p>
// // // // //     <p className="flex justify-between"><span>Time:</span> <span className="font-bold">{form.preferred_time}</span></p>
// // // // //   </div>
// // // // // </div>
// // // // //        </div>
// // // // //       {/* TRUST / METRICS */}
// // // // //       <div className="w-full bg-gray-50 py-12 mt-16 border-t border-gray-100">
// // // // //          <div className="max-w-6xl mx-auto px-6 text-center">
// // // // //            <p className="text-gray-400 font-semibold uppercase tracking-widest text-sm mb-8">
// // // // //              Trusted by Parents from Top Schools
// // // // //            </p>
// // // // //            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 transition-all">
// // // // //              <img src="/school1.png" alt="School Name" className="h-10 md:h-12 hover:scale-105 transition-transform" />
// // // // //              <img src="/school2.jpeg" alt="School Name" className="h-10 md:h-12 hover:scale-105 transition-transform" />
// // // // //              <img src="/school3.jpeg" alt="School Name" className="h-10 md:h-12 hover:scale-105 transition-transform" />
// // // // //             <img src="/tech-partner.jpeg" alt="Partner Name" className="h-10 md:h-12 hover:scale-105 transition-transform" />
// // // // //            </div>
// // // // //            <div className="mt-10 flex flex-col md:flex-row justify-center items-center gap-8 border-t border-gray-200 pt-10">
// // // // //              <div className="text-center">
// // // // //                <span className="block text-3xl font-bold text-gray-800">500+</span>
// // // // //                <span className="text-gray-500 text-sm">Active Students</span>
// // // // //              </div>
// // // // //              <div className="hidden md:block w-px h-10 bg-gray-300"></div>
// // // // //              <div className="text-center">
// // // // //                <span className="block text-3xl font-bold text-gray-800">4.9/5</span>
// // // // //                <span className="text-gray-500 text-sm">Parent Rating</span>
// // // // //              </div>
// // // // //              <div className="hidden md:block w-px h-10 bg-gray-300"></div>
// // // // //              <div className="text-center">
// // // // //                <span className="block text-3xl font-bold text-gray-800">12+</span>
// // // // //                <span className="text-gray-500 text-sm">Coding Courses</span>
// // // // //              </div>
// // // // //            </div>
// // // // //          </div>
// // // // //          </div>
// // // // //     </section>
// // // // //   );
// // // // // }



// // // // // // import React, { useState, useEffect } from "react";
// // // // // // import { useRouter } from "next/router";
// // // // // // import { DateTime } from "luxon";
// // // // // // import { parsePhoneNumberFromString } from "libphonenumber-js";
// // // // // // import { confirmBooking } from "../utils/booking";
// // // // // // import "../app/globals.css";
// // // // // // const countries = [
// // // // // //   { code: "KE", name: "Kenya", dial: "+254", tz: "Africa/Nairobi", flag: "🇰🇪" },
// // // // // //   { code: "UG", name: "Uganda", dial: "+256", tz: "Africa/Kampala", flag: "🇺🇬" },
// // // // // //   { code: "TZ", name: "Tanzania", dial: "+255", tz: "Africa/Dar_es_Salaam", flag: "🇹🇿" },
// // // // // //   { code: "NG", name: "Nigeria", dial: "+234", tz: "Africa/Lagos", flag: "🇳🇬" },
// // // // // //   { code: "ZA", name: "South Africa", dial: "+27", tz: "Africa/Johannesburg", flag: "🇿🇦" },
// // // // // // ];

// // // // // // export default function BookClassPage() {
// // // // // //   const router = useRouter();
// // // // // //   const [selectedDay, setSelectedDay] = useState(null);
// // // // // //   const [selectedSlot, setSelectedSlot] = useState(null);
// // // // // //   const [country, setCountry] = useState(countries[0]);
// // // // // //   const [formData, setFormData] = useState({
// // // // // //     studentName: "",
// // // // // //     studentGrade: "",
// // // // // //     parentName: "",
// // // // // //     email: "",
// // // // // //     whatsapp: "",
// // // // // //   });
// // // // // //   const [touched, setTouched] = useState({ email: false, whatsapp: false });
// // // // // //   const [loading, setLoading] = useState(false);

// // // // // //   const slots = ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];
  
// // // // // //   // Safe instantiation to avoid NextJS dynamic date generation hydration mismatch
// // // // // //   const [days, setDays] = useState([]);
// // // // // //   useEffect(() => {
// // // // // //     const generatedDays = Array.from({ length: 7 }, (_, i) => {
// // // // // //       const d = new Date();
// // // // // //       d.setDate(d.getDate() + i);
// // // // // //       return d;
// // // // // //     });
// // // // // //     setDays(generatedDays);
// // // // // //     setSelectedDay(generatedDays[0]);
// // // // // //   }, []);

// // // // // //   const handleInput = (e) => {
// // // // // //     const { name, value } = e.target;
// // // // // //     if (name === "studentName" || name === "parentName") {
// // // // // //       if (!/^[a-zA-Z\s]*$/.test(value)) return;
// // // // // //     }
// // // // // //     setFormData({ ...formData, [name]: value });
// // // // // //   };

// // // // // //   const formatSlot = (slot) => {
// // // // // //     if (!selectedDay) return slot;
// // // // // //     const [h, m] = slot.split(":");
// // // // // //     return DateTime.fromObject(
// // // // // //       {
// // // // // //         year: selectedDay.getFullYear(),
// // // // // //         month: selectedDay.getMonth() + 1,
// // // // // //         day: selectedDay.getDate(),
// // // // // //         hour: parseInt(h),
// // // // // //         minute: parseInt(m),
// // // // // //       },
// // // // // //       { zone: "Africa/Nairobi" }
// // // // // //     )
// // // // // //       .setZone(country.tz)
// // // // // //       .toFormat("HH:mm");
// // // // // //   };

// // // // // //   const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// // // // // //   const validPhone = () => {
// // // // // //     try {
// // // // // //       const fullNumber = country.dial + formData.whatsapp;
// // // // // //       const parsed = parsePhoneNumberFromString(fullNumber);
// // // // // //       return parsed && parsed.isValid();
// // // // // //     } catch {
// // // // // //       return false;
// // // // // //     }
// // // // // //   };

// // // // // //   const isValidForm =
// // // // // //     formData.studentName &&
// // // // // //     formData.studentGrade &&
// // // // // //     formData.parentName &&
// // // // // //     isValidEmail(formData.email) &&
// // // // // //     validPhone() &&
// // // // // //     selectedSlot;

// // // // // //   const handleConfirm = async () => {
// // // // // //     try {
// // // // // //       setLoading(true);
// // // // // //       const dataToSave = {
// // // // // //         ...formData,
// // // // // //         country,
// // // // // //         date: selectedDay.toISOString().split("T")[0],
// // // // // //         time: selectedSlot,
// // // // // //       };
// // // // // //       await confirmBooking(dataToSave, "trial");

// // // // // //       setFormData({
// // // // // //         studentName: "",
// // // // // //         studentGrade: "",
// // // // // //         parentName: "",
// // // // // //         email: "",
// // // // // //         whatsapp: "",
// // // // // //       });
// // // // // //       setSelectedSlot(null);
// // // // // //       router.push("/success");
// // // // // //     } catch (error) {
// // // // // //       console.error(error);
// // // // // //       router.push("/error");
// // // // // //     } finally {
// // // // // //       setLoading(false);
// // // // // //     }
// // // // // //   };

// // // // // //   return (
// // // // // //     <div className="min-h-screen bg-background p-4 md:p-10 font-poppins">
// // // // // //       <button
// // // // // //         className="mb-6 text-primary font-semibold hover:underline"
// // // // // //         onClick={() => router.back()}
// // // // // //       >
// // // // // //         ← Back
// // // // // //       </button>

// // // // // //       <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
// // // // // //         {/* LEFT FORM */}
// // // // // //         <div className="md:col-span-2 space-y-6">
// // // // // //           <div className="bg-white shadow-card rounded-xl p-6">
// // // // // //             <h2 className="text-2xl font-bold text-primary mb-4">Book a Trial Class</h2>
// // // // // //             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
// // // // // //               <input
// // // // // //                 name="studentName"
// // // // // //                 placeholder="Student Name"
// // // // // //                 className="border rounded-lg p-2 w-full text-black"
// // // // // //                 value={formData.studentName}
// // // // // //                 onChange={handleInput}
// // // // // //               />
// // // // // //               <select
// // // // // //                 name="studentGrade"
// // // // // //                 className="border rounded-lg p-2 w-full text-black"
// // // // // //                 value={formData.studentGrade}
// // // // // //                 onChange={handleInput}
// // // // // //               >
// // // // // //                 <option value="">Select Grade</option>
// // // // // //                 <option value="K-2">K-2</option>
// // // // // //                 <option value="3-5">Grade 3-5</option>
// // // // // //                 <option value="6-8">Grade 6-8</option>
// // // // // //                 <option value="9-12">High School (9-12)</option>
// // // // // //               </select>
// // // // // //               <input
// // // // // //                 name="parentName"
// // // // // //                 placeholder="Parent Name"
// // // // // //                 className="border rounded-lg p-2 w-full text-black"
// // // // // //                 value={formData.parentName}
// // // // // //                 onChange={handleInput}
// // // // // //               />
// // // // // //               <input
// // // // // //                 name="email"
// // // // // //                 placeholder="Parent Email"
// // // // // //                 type="email"
// // // // // //                 className={`border rounded-lg p-2 w-full text-black ${
// // // // // //                   touched.email && !isValidEmail(formData.email) ? "border-red-500" : ""
// // // // // //                 }`}
// // // // // //                 value={formData.email}
// // // // // //                 onChange={handleInput}
// // // // // //                 onBlur={() => setTouched({ ...touched, email: true })}
// // // // // //               />
// // // // // //               <div className={`flex border rounded-lg overflow-hidden w-full text-black ${
// // // // // //                 touched.whatsapp && !validPhone() ? "border-red-500" : ""
// // // // // //               }`}>
// // // // // //                 <select
// // // // // //                   className="bg-gray-100 px-2"
// // // // // //                   value={country.code}
// // // // // //                   onChange={(e) => setCountry(countries.find((c) => c.code === e.target.value))}
// // // // // //                 >
// // // // // //                   {countries.map((c) => (
// // // // // //                     <option key={c.code} value={c.code}>
// // // // // //                       {c.flag} {c.dial}
// // // // // //                     </option>
// // // // // //                   ))}
// // // // // //                 </select>
// // // // // //                 <input
// // // // // //                   name="whatsapp"
// // // // // //                   placeholder="WhatsApp Number"
// // // // // //                   className="flex-1 p-2"
// // // // // //                   value={formData.whatsapp}
// // // // // //                   onChange={handleInput}
// // // // // //                   onBlur={() => setTouched({ ...touched, whatsapp: true })}
// // // // // //                 />
// // // // // //               </div>
// // // // // //             </div>
// // // // // //           </div>

// // // // // //           {/* Calendar Section */}
// // // // // //           <div className="bg-white shadow-card rounded-xl p-6 text-black">
// // // // // //             <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-6">
// // // // // //               <div className="flex overflow-x-auto gap-2 md:gap-3 pb-2 md:pb-0 w-full md:w-auto">
// // // // // //                 {days.map((d, i) => {
// // // // // //                   const label = d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
// // // // // //                   return (
// // // // // //                     <button
// // // // // //                       key={i}
// // // // // //                       type="button"
// // // // // //                       onClick={() => { setSelectedDay(d); setSelectedSlot(null); }}
// // // // // //                       className={`px-3 py-2 rounded-lg shadow-btn text-sm flex-shrink-0 ${
// // // // // //                         selectedDay?.toDateString() === d.toDateString() ? "bg-primary text-white" : "bg-gray-100 text-text"
// // // // // //                       }`}
// // // // // //                     >
// // // // // //                       {label}
// // // // // //                     </button>
// // // // // //                   );
// // // // // //                 })}
// // // // // //               </div>
// // // // // //               <div className="flex flex-col">
// // // // // //                 <span className="font-semibold text-text">Timezone: {country.name}</span>
// // // // // //                 <span className="text-sm text-gray-500">{country.tz}</span>
// // // // // //               </div>
// // // // // //             </div>

// // // // // //             <div className="mt-4 flex overflow-x-auto gap-2 sm:gap-3 pb-2">
// // // // // //               {slots.map((s, i) => (
// // // // // //                 <button
// // // // // //                   key={i}
// // // // // //                   type="button"
// // // // // //                   onClick={() => setSelectedSlot(s)}
// // // // // //                   className={`px-3 py-2 rounded-lg text-sm flex-shrink-0 ${
// // // // // //                     selectedSlot === s ? "bg-secondary text-white" : "bg-gray-100 text-text"
// // // // // //                   }`}
// // // // // //                 >
// // // // // //                   {formatSlot(s)}
// // // // // //                 </button>
// // // // // //               ))}
// // // // // //             </div>
// // // // // //           </div>
// // // // // //         </div>

// // // // // //         {/* SUMMARY BAR */}
// // // // // //         <div className="bg-primary text-white rounded-xl shadow-card p-6 h-fit">
// // // // // //           <h2 className="text-xl font-bold mb-4">Booking Summary</h2>
// // // // // //           <p><strong>Student:</strong> {formData.studentName || "—"}</p>
// // // // // //           <p><strong>Grade:</strong> {formData.studentGrade || "—"}</p>
// // // // // //           <p><strong>Parent:</strong> {formData.parentName || "—"}</p>
// // // // // //           <p><strong>Email:</strong> {formData.email || "—"}</p>
// // // // // //           <p>
// // // // // //             <strong>WhatsApp:</strong>{" "}
// // // // // //             {formData.whatsapp ? `${country.flag} ${country.dial} ${formData.whatsapp}` : "—"}
// // // // // //           </p>
// // // // // //           <p><strong>Date:</strong> {selectedSlot && selectedDay ? selectedDay.toDateString() : "—"}</p>
// // // // // //           <p><strong>Time:</strong> {selectedSlot ? formatSlot(selectedSlot) : "—"}</p>
// // // // // //           <p><strong>Timezone:</strong> {selectedSlot ? `${country.name} (${country.tz})` : "—"}</p>
// // // // // //           <p><strong>Duration:</strong> {selectedSlot ? "1 hour" : "—"}</p>

// // // // // //           <button
// // // // // //             className="w-full mt-4 py-2 rounded-lg bg-accent font-semibold disabled:opacity-50 text-white"
// // // // // //             disabled={!isValidForm || loading}
// // // // // //             onClick={handleConfirm}
// // // // // //           >
// // // // // //             {loading ? "Booking…" : "Confirm Booking"}
// // // // // //           </button>
// // // // // //         </div>
// // // // // //       </div>
// // // // // //     </div>
// // // // // //   );
// // // // // // }