"use client";

import { supabase } from "../../utils/supabase";
import "../../app/globals.css";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export const dynamic = 'force-dynamic';

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

export default function BookClassPage() {
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
        setSuccess(true);
      } else {
        router.push("/error");
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
      
      <div className="flex items-center justify-center relative w-full mb-8">
        <div className="absolute left-0">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="h-10 w-10 rounded-full object-cover border border-gray-200 shadow-sm" 
          />
        </div>
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
            Give Your Child a Confident Start in Coding 🚀
          </h1>
          <p className="text-gray-600 mt-2">Book a free 1-on-1 coding trial with a certified tutor.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 w-full max-w-6xl items-start">
        
        <div className="md:col-span-2 relative flex justify-center mb-10 md:mb-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-gradient-to-br from-purple-300 via-pink-300 to-yellow-200 rounded-full opacity-50 animate-pulse delay-1000"></div>
          <img src="/girl-code.png" alt="Child coding" className="relative z-50 w-full md:w-[32rem] object-cover rounded-3xl shadow-2xl" />
        </div>

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

// "use client";

// import { supabase } from "../../utils/supabase";
// import "../../app/globals.css";
// import { useRouter } from "next/navigation";
// import { useEffect, useState, useRef } from "react";

// export const dynamic = 'force-dynamic';

// export const metadata = {
//   title: "Book a Free Coding Trial Class | Tech Talk Hub",
//   description: "Book a free 1-on-1 coding trial with a certified tutor for your child.",
//   openGraph: {
//     title: "Book a Free Coding Trial Class 🚀",
//     description: "Give your child a confident start in coding with a free 1-on-1 trial.",
//     images: [{ url: '/girl-code.png', width: 800, height: 600, alt: 'Child coding trial' }],
//   },
// };

// const Counter = ({ end, duration = 2000 }) => {
//   const [count, setCount] = useState(0);
//   const countRef = useRef(null);

//   useEffect(() => {
//     const observer = new IntersectionObserver(([entry]) => {
//       if (entry.isIntersecting) {
//         let start = 0;
//         const stepTime = Math.abs(Math.floor(duration / parseInt(end)));
//         const timer = setInterval(() => {
//           start += 1;
//           setCount(start);
//           if (start >= parseInt(end)) clearInterval(timer);
//         }, stepTime);
//         observer.disconnect();
//       }
//     });
//     if (countRef.current) observer.observe(countRef.current);
//     return () => observer.disconnect();
//   }, [end, duration]);

//   return <span ref={countRef}>{count}+</span>;
// };

// export default function BookClassPage() {
//   const today = new Date().toISOString().split("T")[0];
//   const router = useRouter();
//   const [form, setForm] = useState({
//     parent_name: "",
//     parent_email: "",
//     student_name: "",
//     phone: "",
//     grade: "",
//     preferred_date: today,
//     preferred_time: "00:00",
//     country: "",
//     lead_source: "landing_page",
//     referral_code: "",
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
//     let code = "";
//     if (country === "Kenya") code = "+254";
//     else if (country === "Uganda") code = "+256";
//     else if (country === "Tanzania") code = "+255";
//     else if (country === "Nigeria") code = "+234";
//     else if (country === "South Africa") code = "+27";

//     setForm({ ...form, country, phone: code });
//     setErrors({ ...errors, country: false });
//   };

//   const submitForm = async (e) => {
//     e.preventDefault();
//     let newErrors = {};
//     ["parent_name","parent_email","student_name","phone","grade","country","preferred_date","preferred_time"].forEach(f => {
//       if (!form[f]) newErrors[f] = true;
//     });
//     if (Object.keys(newErrors).length) {
//       setErrors(newErrors);
//       return;
//     }
//     setLoading(true);
//     try {
//       const { error } = await supabase.from("leads").insert([{
//         parent_name: form.parent_name,
//         student_name: form.student_name,
//         email: form.parent_email,
//         phone: form.phone,
//         grade: form.grade,
//         country: form.country,
//         class_date: form.preferred_date,
//         class_time: form.preferred_time.length === 5 ? form.preferred_time + ":00" : form.preferred_time,
//         lead_source: form.lead_source || "landing_page",
//         referal_code: form.referral_code,
//         status: "new"
//       }]);
      
//       if (!error) {
//         setSuccess(true);
//       } else {
//         router.push("/error");
//       }
//     } catch (err) {
//       router.push("/error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const grades = ["K", ...Array.from({ length: 12 }, (_, i) => (i + 1).toString())];
//   const countryOptions = [
//     { name: "Kenya", code: "+254", flag: "🇰🇪" },
//     { name: "Uganda", code: "+256", flag: "🇺🇬" },
//     { name: "Tanzania", code: "+255", flag: "🇹🇿" },
//     { name: "Nigeria", code: "+234", flag: "🇳🇬" },
//     { name: "South Africa", code: "+27", flag: "🇿🇦" },
//   ];

//   const baseInputClass = "w-full border rounded-xl px-4 py-3 outline-none transition-all duration-300 focus:ring-2 focus:ring-purple-400 focus:shadow-lg focus:shadow-purple-300/30";
//   const getInputClass = (name) => `${baseInputClass} ${errors[name] ? "border-red-500" : "border-purple-400"}`;

//   return (
//     <section className="min-h-screen bg-gray-50 relative overflow-hidden flex flex-col items-center justify-start py-12 px-6 md:px-20">
      
//       {/* WRAPPER FOR LOGO + HEADER */}
//       <div className="flex items-center justify-center relative w-full mb-8">
//         <div className="absolute left-0">
//           <img 
//             src="/logo.png" 
//             alt="Logo" 
//             className="h-10 w-10 rounded-full object-cover border border-gray-200 shadow-sm" 
//           />
//         </div>
//         <div className="text-center">
//           <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
//             Give Your Child a Confident Start in Coding 🚀
//           </h1>
//           <p className="text-gray-600 mt-2">Book a free 1-on-1 coding trial with a certified tutor.</p>
//         </div>
//       </div>

//       {/* MAIN CONTENT GRID */}
//       <div className="grid grid-cols-1 md:grid-cols-5 gap-8 w-full max-w-6xl items-start">
        
//         {/* LEFT IMAGE */}
//         <div className="md:col-span-2 relative flex justify-center mb-10 md:mb-0">
//           <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-60 animate-pulse"></div>
//           <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-gradient-to-br from-purple-300 via-pink-300 to-yellow-200 rounded-full opacity-50 animate-pulse delay-1000"></div>
//           <img src="/girl-code.png" alt="Child coding" className="relative z-50 w-full md:w-[32rem] object-cover rounded-3xl shadow-2xl" />
//         </div>

//         {/* RIGHT FORM */}
//         <div className="md:col-span-2 relative">
//           {success ? (
//             <div className="bg-green-50 border border-green-200 p-8 rounded-3xl text-center">
//               <h3 className="text-2xl font-bold text-green-800">Booking Confirmed!</h3>
//               <p className="text-green-700 mt-2">We’ll contact you shortly with trial details.</p>
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

//               <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl shadow-lg hover:opacity-90">
//                 {loading ? "Booking..." : "Book Free Trial"}
//               </button>
//             </form>
//           )}
//         </div>

//         {/* SUMMARY */}
//         <div className="md:col-span-1 bg-indigo-900 p-6 rounded-3xl text-white shadow-2xl h-full">
//           <h3 className="font-bold border-b border-indigo-700 pb-2 mb-4">Summary</h3>
//           <div className="space-y-3 text-xs">
//             <p className="flex justify-between"><span>Parent:</span> <span className="font-bold truncate ml-2">{form.parent_name || "-"}</span></p>
//             <p className="flex justify-between"><span>Email:</span> <span className="font-bold truncate ml-2">{form.parent_email || "-"}</span></p>
//             <p className="flex justify-between"><span>Student:</span> <span className="font-bold truncate ml-2">{form.student_name || "-"}</span></p>
//             <p className="flex justify-between"><span>Grade:</span> <span className="font-bold truncate ml-2">{form.grade || "-"}</span></p>
//             <p className="flex justify-between"><span>Country:</span> <span className="font-bold truncate ml-2">{form.country || "-"}</span></p>
//             <p className="flex justify-between"><span>Phone:</span> <span className="font-bold truncate ml-2">{form.phone || "-"}</span></p>
//             <p className="flex justify-between"><span>Date:</span> <span className="font-bold truncate ml-2">{form.preferred_date || "-"}</span></p>
//             <p className="flex justify-between"><span>Time:</span> <span className="font-bold truncate ml-2">{form.preferred_time || "-"}</span></p>
//           </div>
//         </div>
//       </div>

//       {/* FOOTER METRICS */}
//       <div className="w-full mt-20 py-16 bg-white border-y border-gray-100">
//         <div className="max-w-6xl mx-auto px-6 text-center">
//           <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs mb-12">
//             Trusted by Parents from Top Schools
//           </p>

//           <div className="flex flex-wrap justify-center gap-12 md:gap-24">
//             <div className="text-center">
//               <span className="block text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-purple-600 mb-2">
//                 <Counter end="500" />
//               </span>
//               <span className="text-gray-500 font-medium text-sm tracking-wide uppercase">Students</span>
//             </div>

//             <div className="text-center">
//               <span className="block text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-purple-600 mb-2">
//                 4.9/5
//               </span>
//               <span className="text-gray-500 font-medium text-sm tracking-wide uppercase">Parent Rating</span>
//             </div>

//             <div className="text-center">
//               <span className="block text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-purple-600 mb-2">
//                 <Counter end="12" />
//               </span>
//               <span className="text-gray-500 font-medium text-sm tracking-wide uppercase">Courses</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }