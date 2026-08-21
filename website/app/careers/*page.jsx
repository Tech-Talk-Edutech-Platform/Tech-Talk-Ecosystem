"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Globe, BookOpen, HeartHandshake, ArrowRight, CheckCircle2, MapPin, Clock } from "lucide-react";

const openRoles = [
  {
    id: 1,
    title: "Full-Stack Engineer",
    department: "Engineering",
    location: "Nairobi, Kenya (Hybrid / Remote)",
    type: "Full-Time",
    description: "Scale our core learning platform, optimize our student dashboards, and build out automated backend workflows.",
  },
  {
    id: 2,
    title: "Lead Tech Instructor",
    department: "Education",
    location: "Nairobi, Kenya (Hybrid / Remote)",
    type: "Full-Time",
    description: "Deliver our live technical curricula, mentor cohorts of learners, and help iterate on our hands-on teaching frameworks.",
  },
  {
    id: 3,
    title: "Growth & Community Lead",
    department: "Marketing & Community",
    location: "Nairobi, Kenya",
    type: "Full-Time / Contract",
    description: "Drive user acquisition, expand our local developer partnerships, and manage community engagement and events.",
  },
];

const perks = [
  {
    icon: Globe,
    title: "Flexible Local Work",
    description: "Collaborate from our Nairobi base or remote on your own schedule. Total ownership over your hours.",
  },
  {
    icon: Sparkles,
    title: "Growing Team",
    description: "Join a battle-tested team that has been building and shipping in the Kenyan tech space for 4 years.",
  },
  {
    icon: HeartHandshake,
    title: "Real Hands-On Impact",
    description: "Your code, content, and initiatives directly influence thousands of students and our ongoing growth.",
  },
  {
    icon: BookOpen,
    title: "Rapid Learning Curve",
    description: "Take ownership of major projects and tackle challenging engineering and educational hurdles every day.",
  },
];

export default function CareersPage() {
  const [selectedDepartment, setSelectedDepartment] = useState("All");

  const departments = ["All", "Engineering", "Education", "Marketing & Community"];

  const filteredRoles = selectedDepartment === "All"
    ? openRoles
    : openRoles.filter((role) => role.department === selectedDepartment);

  return (
    <main className="min-h-screen bg-background text-text selection:bg-secondary/20">

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-gray-100 dark:border-gray-800/60">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary font-semibold text-xs uppercase tracking-widest mb-6 border border-secondary/20 shadow-sm">
            <Sparkles size={14} /> Karibu Team • 4 Years Strong
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-text tracking-tight leading-[1.1]">
            Help Us Scale Tech Talk Hub <span className="text-secondary bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">To the Next Level</span>
          </h1>
          <p className="text-text/70 mt-6 text-lg sm:text-xl max-w-2xl mx-auto font-normal leading-relaxed">
            Having built and refined our platform in Nairobi over the last 4 years, we are expanding our team. If you want to build practical tech education that makes a difference, let&apos;s talk.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-text/60">
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-secondary"/> 4 Years in Operations</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-secondary"/> Core Team Expansion</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-secondary"/> Nairobi & Remote</span>
          </div>
        </div>
      </section>

      {/* Perks Section */}
      <section className="py-20 bg-text/[0.01]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight">What to Expect Joining Us</h2>
            <p className="text-text/60 mt-3 text-base">No corporate fluff. Just real building and scaling.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {perks.map((perk, idx) => {
              const IconComponent = perk.icon;
              return (
                <div 
                  key={idx} 
                  className="group bg-background p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-secondary/30 transition-all duration-300 flex flex-col items-start relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
                  <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-6 shadow-sm">
                    <IconComponent size={24} />
                  </div>
                  <h3 className="font-bold text-lg text-text mb-2">{perk.title}</h3>
                  <p className="text-text/60 text-sm leading-relaxed">{perk.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open Positions Section */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-secondary font-semibold text-xs uppercase tracking-widest bg-secondary/10 px-3 py-1 rounded-md">Open Roles</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-text mt-3 tracking-tight">
              Open Positions
            </h2>
          </div>

          {/* Department Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  selectedDepartment === dept
                    ? "bg-secondary text-background shadow-md shadow-secondary/20"
                    : "bg-text/5 text-text/80 hover:bg-text/10"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Roles List */}
        <div className="space-y-4">
          {filteredRoles.map((role) => (
            <div
              key={role.id}
              className="group bg-background border border-gray-100 dark:border-gray-800 p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-xl hover:border-secondary/30 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider bg-secondary/10 px-3 py-1 rounded-full">
                    {role.department}
                  </span>
                  <span className="text-xs font-medium text-text/70 bg-text/5 px-3 py-1 rounded-full flex items-center gap-1">
                    <MapPin size={12} /> {role.location}
                  </span>
                  <span className="text-xs font-medium text-text/70 bg-text/5 px-3 py-1 rounded-full flex items-center gap-1">
                    <Clock size={12} /> {role.type}
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold text-text group-hover:text-secondary transition-colors">
                  {role.title}
                </h3>
                
                <p className="text-text/70 text-sm leading-relaxed max-w-2xl">
                  {role.description}
                </p>
              </div>

              <button
                onClick={() => alert(`Thanks for your interest! Reach out to us directly at founders@techtalkhub.com`)}
                className="bg-secondary text-background hover:opacity-95 px-6 py-3.5 rounded-2xl font-bold text-sm shadow-md shadow-secondary/20 transition-all duration-300 whitespace-nowrap active:scale-95 flex items-center gap-2 group-hover:gap-3"
              >
                Apply Now <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* General Application Note */}
        <div className="mt-20 bg-gradient-to-br from-secondary/10 via-background to-secondary/5 border border-secondary/20 rounded-3xl p-8 md:p-12 text-center max-w-4xl mx-auto shadow-sm relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />
          
          <h3 className="text-2xl md:text-3xl font-extrabold text-text">Want to build alongside us?</h3>
          <p className="text-text/70 text-base mt-3 max-w-xl mx-auto">
            We are always looking for resourceful builders who want to scale education. Drop us an email and tell us what you love building.
          </p>
          <a
            href="mailto:founders@techtalkhub.com"
            className="inline-flex items-center gap-2 mt-8 bg-secondary text-background px-8 py-4 rounded-2xl font-bold text-sm shadow-md shadow-secondary/20 hover:opacity-95 transition-all active:scale-95"
          >
            Reach Out <ArrowRight size={16} />
          </a>
        </div>
      </section>
    </main>
  );
}
// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { Sparkles, Globe, BookOpen, HeartHandshake, ArrowRight, CheckCircle2, MapPin, Clock } from "lucide-react";

// const openRoles = [
//   {
//     id: 1,
//     title: "Full-Stack Engineer",
//     department: "Engineering",
//     location: "Nairobi, Kenya (Hybrid / Remote)",
//     type: "Full-Time",
//     description: "Scale our core learning platform, optimize our student dashboards, and build out automated backend workflows.",
//   },
//   {
//     id: 2,
//     title: "Lead Tech Instructor",
//     department: "Education",
//     location: "Nairobi, Kenya (Hybrid / Remote)",
//     type: "Full-Time",
//     description: "Deliver our live technical curricula, mentor cohorts of learners, and help iterate on our hands-on teaching frameworks.",
//   },
//   {
//     id: 3,
//     title: "Growth & Community Lead",
//     department: "Marketing & Community",
//     location: "Nairobi, Kenya",
//     type: "Full-Time / Contract",
//     description: "Drive user acquisition, expand our local developer partnerships, and manage community engagement and events.",
//   },
// ];

// const perks = [
//   {
//     icon: Globe,
//     title: "Flexible Local Work",
//     description: "Collaborate from our Nairobi base or remote on your own schedule. Total ownership over your hours.",
//   },
//   {
//     icon: Sparkles,
//     title: "Growing Team",
//     description: "Join a battle-tested team that has been building and shipping in the Kenyan tech space for 4 years.",
//   },
//   {
//     icon: HeartHandshake,
//     title: "Real Hands-On Impact",
//     description: "Your code, content, and initiatives directly influence thousands of students and our ongoing growth.",
//   },
//   {
//     icon: BookOpen,
//     title: "Rapid Learning Curve",
//     description: "Take ownership of major projects and tackle challenging engineering and educational hurdles every day.",
//   },
// ];

// export default function CareersPage() {
//   const [selectedDepartment, setSelectedDepartment] = useState("All");

//   const departments = ["All", "Engineering", "Education", "Marketing & Community"];

//   const filteredRoles = selectedDepartment === "All"
//     ? openRoles
//     : openRoles.filter((role) => role.department === selectedDepartment);

//   return (
//     <main className="min-h-screen bg-background text-text selection:bg-secondary/20">

//       {/* Hero Section */}
//       <section className="relative pt-20 pb-24 overflow-hidden border-b border-gray-100 dark:border-gray-800/60">
//         <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

//         <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
//           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary font-semibold text-xs uppercase tracking-widest mb-6 border border-secondary/20 shadow-sm">
//             <Sparkles size={14} /> Karibu Team • 4 Years Strong
//           </div>
//           <h1 className="text-4xl sm:text-6xl font-black text-text tracking-tight leading-[1.1]">
//             Help Us Scale Tech Talk Hub <span className="text-secondary bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">To the Next Level</span>
//           </h1>
//           <p className="text-text/70 mt-6 text-lg sm:text-xl max-w-2xl mx-auto font-normal leading-relaxed">
//             Having built and refined our platform in Nairobi over the last 4 years, we are expanding our team. If you want to build practical tech education that makes a difference, let&apos;s talk.
//           </p>

//           <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-text/60">
//             <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-secondary"/> 4 Years in Operations</span>
//             <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-secondary"/> Core Team Expansion</span>
//             <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-secondary"/> Nairobi & Remote</span>
//           </div>
//         </div>
//       </section>

//       {/* Perks Section */}
//       <section className="py-20 bg-text/[0.01]">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="text-center max-w-2xl mx-auto mb-16">
//             <h2 className="text-3xl font-extrabold tracking-tight">What to Expect Joining Us</h2>
//             <p className="text-text/60 mt-3 text-base">No corporate fluff. Just real building and scaling.</p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             {perks.map((perk, idx) => {
//               const IconComponent = perk.icon;
//               return (
//                 <div 
//                   key={idx} 
//                   className="group bg-background p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-secondary/30 transition-all duration-300 flex flex-col items-start relative overflow-hidden"
//                 >
//                   <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
//                   <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-6 shadow-sm">
//                     <IconComponent size={24} />
//                   </div>
//                   <h3 className="font-bold text-lg text-text mb-2">{perk.title}</h3>
//                   <p className="text-text/60 text-sm leading-relaxed">{perk.description}</p>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </section>

//       {/* Open Positions Section */}
//       <section className="py-24 max-w-7xl mx-auto px-6">
//         <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
//           <div>
//             <span className="text-secondary font-semibold text-xs uppercase tracking-widest bg-secondary/10 px-3 py-1 rounded-md">Open Openings</span>
//             <h2 className="text-3xl md:text-4xl font-extrabold text-text mt-3 tracking-tight">
//               Open Positions
//             </h2>
//           </div>

//           {/* Department Filter Pills */}
//           <div className="flex flex-wrap gap-2">
//             {departments.map((dept) => (
//               <button
//                 key={dept}
//                 onClick={() => setSelectedDepartment(dept)}
//                 className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
//                   selectedDepartment === dept
//                     ? "bg-secondary text-background shadow-md shadow-secondary/20"
//                     : "bg-text/5 text-text/80 hover:bg-text/10"
//                 }`}
//               >
//                 {dept}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Roles List */}
//         <div className="space-y-4">
//           {filteredRoles.map((role) => (
//             <div
//               key={role.id}
//               className="group bg-background border border-gray-100 dark:border-gray-800 p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-xl hover:border-secondary/30 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
//             >
//               <div className="space-y-3 max-w-3xl">
//                 <div className="flex flex-wrap items-center gap-2.5">
//                   <span className="text-xs font-bold text-secondary uppercase tracking-wider bg-secondary/10 px-3 py-1 rounded-full">
//                     {role.department}
//                   </span>
//                   <span className="text-xs font-medium text-text/70 bg-text/5 px-3 py-1 rounded-full flex items-center gap-1">
//                     <MapPin size={12} /> {role.location}
//                   </span>
//                   <span className="text-xs font-medium text-text/70 bg-text/5 px-3 py-1 rounded-full flex items-center gap-1">
//                     <Clock size={12} /> {role.type}
//                   </span>
//                 </div>
                
//                 <h3 className="text-2xl font-bold text-text group-hover:text-secondary transition-colors">
//                   {role.title}
//                 </h3>
                
//                 <p className="text-text/70 text-sm leading-relaxed max-w-2xl">
//                   {role.description}
//                 </p>
//               </div>

//               <button
//                 onClick={() => alert(`Thanks for your interest! Reach out to us directly at founders@techtalkhub.com`)}
//                 className="bg-secondary text-background hover:opacity-95 px-6 py-3.5 rounded-2xl font-bold text-sm shadow-md shadow-secondary/20 transition-all duration-300 whitespace-nowrap active:scale-95 flex items-center gap-2 group-hover:gap-3"
//               >
//                 Apply Now <ArrowRight size={16} />
//               </button>
//             </div>
//           ))}
//         </div>

//         {/* General Application Note */}
//         <div className="mt-20 bg-gradient-to-br from-secondary/10 via-background to-secondary/5 border border-secondary/20 rounded-3xl p-8 md:p-12 text-center max-w-4xl mx-auto shadow-sm relative overflow-hidden">
//           <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />
          
//           <h3 className="text-2xl md:text-3xl font-extrabold text-text">Want to build alongside us?</h3>
//           <p className="text-text/70 text-base mt-3 max-w-xl mx-auto">
//             We are always looking for resourceful builders who want to scale education. Drop us an email and tell us what you love building.
//           </p>
//           <a
//             href="mailto:founders@techtalkhub.com"
//             className="inline-flex items-center gap-2 mt-8 bg-secondary text-background px-8 py-4 rounded-2xl font-bold text-sm shadow-md shadow-secondary/20 hover:opacity-95 transition-all active:scale-95"
//           >
//             Reach Out <ArrowRight size={16} />
//           </a>
//         </div>
//       </section>
//     </main>
//   );
// }
// // "use client";

// // import { useState } from "react";
// // import Link from "next/link";
// // import { Sparkles, Globe, BookOpen, HeartHandshake, ArrowRight, CheckCircle2, MapPin, Clock } from "lucide-react";

// // const openRoles = [
// //   {
// //     id: 1,
// //     title: "Full-Stack Engineer",
// //     department: "Engineering",
// //     location: "Nairobi, Kenya (Hybrid / Remote)",
// //     type: "Full-Time",
// //     description: "Scale our core learning platform, optimize our student dashboards, and build out automated backend workflows.",
// //   },
// //   {
// //     id: 2,
// //     title: "Lead Tech Instructor",
// //     department: "Education",
// //     location: "Nairobi, Kenya (Hybrid / Remote)",
// //     type: "Full-Time",
// //     description: "Deliver our live technical curricula, mentor cohorts of learners, and help iterate on our hands-on teaching frameworks.",
// //   },
// //   {
// //     id: 3,
// //     title: "Growth & Community Lead",
// //     department: "Marketing & Community",
// //     location: "Nairobi, Kenya",
// //     type: "Full-Time / Contract",
// //     description: "Drive user acquisition, expand our local developer partnerships, and manage community engagement and events.",
// //   },
// // ];

// // const perks = [
// //   {
// //     icon: Globe,
// //     title: "Flexible Local Work",
// //     description: "Collaborate from our Nairobi base or remote on your own schedule. Total ownership over your hours.",
// //   },
// //   {
// //     icon: Sparkles,
// //     title: "Growing Team",
// //     description: "Join a battle-tested team that has been building and shipping in the Kenyan tech space for 4 years.",
// //   },
// //   {
// //     icon: HeartHandshake,
// //     title: "Real Hands-On Impact",
// //     description: "Your code, content, and initiatives directly influence thousands of students and our ongoing growth.",
// //   },
// //   {
// //     icon: BookOpen,
// //     title: "Rapid Learning Curve",
// //     description: "Take ownership of major projects and tackle challenging engineering and educational hurdles every day.",
// //   },
// // ];

// // export default function CareersPage() {
// //   const [selectedDepartment, setSelectedDepartment] = useState("All");

// //   const departments = ["All", "Engineering", "Education", "Marketing & Community"];

// //   const filteredRoles = selectedDepartment === "All"
// //     ? openRoles
// //     : openRoles.filter((role) => role.department === selectedDepartment);

// //   return (
// //     <main className="min-h-screen bg-background text-text selection:bg-secondary/20">

// //       {/* Hero Section */}
// //       <section className="relative pt-20 pb-24 overflow-hidden border-b border-gray-100 dark:border-gray-800/60">
// //         <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

// //         <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
// //           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary font-semibold text-xs uppercase tracking-widest mb-6 border border-secondary/20 shadow-sm">
// //             <Sparkles size={14} /> Karibu Team • 4 Years Strong
// //           </div>
// //           <h1 className="text-4xl sm:text-6xl font-black text-text tracking-tight leading-[1.1]">
// //             Help Us Scale Tech Talk Hub <span className="text-secondary bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">To the Next Level</span>
// //           </h1>
// //           <p className="text-text/70 mt-6 text-lg sm:text-xl max-w-2xl mx-auto font-normal leading-relaxed">
// //             Having built and refined our platform in Nairobi over the last 4 years, we are expanding our team. If you want to build practical tech education that makes a difference, let's talk.
// //           </p>

// //           <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-text/60">
// //             <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-secondary"/> 4 Years in Operations</span>
// //             <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-secondary"/> Core Team Expansion</span>
// //             <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-secondary"/> Nairobi & Remote</span>
// //           </div>
// //         </div>
// //       </section>

// //       {/* Perks Section */}
// //       <section className="py-20 bg-text/[0.01]">
// //         <div className="max-w-7xl mx-auto px-6">
// //           <div className="text-center max-w-2xl mx-auto mb-16">
// //             <h2 className="text-3xl font-extrabold tracking-tight">What to Expect Joining Us</h2>
// //             <p className="text-text/60 mt-3 text-base">No corporate fluff. Just real building and scaling.</p>
// //           </div>

// //           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
// //             {perks.map((perk, idx) => {
// //               const IconComponent = perk.icon;
// //               return (
// //                 <div 
// //                   key={idx} 
// //                   className="group bg-background p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-secondary/30 transition-all duration-300 flex flex-col items-start relative overflow-hidden"
// //                 >
// //                   <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
// //                   <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-6 shadow-sm">
// //                     <IconComponent size={24} />
// //                   </div>
// //                   <h3 className="font-bold text-lg text-text mb-2">{perk.title}</h3>
// //                   <p className="text-text/60 text-sm leading-relaxed">{perk.description}</p>
// //                 </div>
// //               );
// //             })}
// //           </div>
// //         </div>
// //       </section>

// //       {/* Open Positions Section */}
// //       <section className="py-24 max-w-7xl mx-auto px-6">
// //         <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
// //           <div>
// //             <span className="text-secondary font-semibold text-xs uppercase tracking-widest bg-secondary/10 px-3 py-1 rounded-md">Open Openings</span>
// //             <h2 className="text-3xl md:text-4xl font-extrabold text-text mt-3 tracking-tight">
// //               Open Positions
// //             </h2>
// //           </div>

// //           {/* Department Filter Pills */}
// //           <div className="flex flex-wrap gap-2">
// //             {departments.map((dept) => (
// //               <button
// //                 key={dept}
// //                 onClick={() => setSelectedDepartment(dept)}
// //                 className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
// //                   selectedDepartment === dept
// //                     ? "bg-secondary text-background shadow-md shadow-secondary/20"
// //                     : "bg-text/5 text-text/80 hover:bg-text/10"
// //                 }`}
// //               >
// //                 {dept}
// //               </button>
// //             ))}
// //           </div>
// //         </div>

// //         {/* Roles List */}
// //         <div className="space-y-4">
// //           {filteredRoles.map((role) => (
// //             <div
// //               key={role.id}
// //               className="group bg-background border border-gray-100 dark:border-gray-800 p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-xl hover:border-secondary/30 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
// //             >
// //               <div className="space-y-3 max-w-3xl">
// //                 <div className="flex flex-wrap items-center gap-2.5">
// //                   <span className="text-xs font-bold text-secondary uppercase tracking-wider bg-secondary/10 px-3 py-1 rounded-full">
// //                     {role.department}
// //                   </span>
// //                   <span className="text-xs font-medium text-text/70 bg-text/5 px-3 py-1 rounded-full flex items-center gap-1">
// //                     <MapPin size={12} /> {role.location}
// //                   </span>
// //                   <span className="text-xs font-medium text-text/70 bg-text/5 px-3 py-1 rounded-full flex items-center gap-1">
// //                     <Clock size={12} /> {role.type}
// //                   </span>
// //                 </div>
                
// //                 <h3 className="text-2xl font-bold text-text group-hover:text-secondary transition-colors">
// //                   {role.title}
// //                 </h3>
                
// //                 <p className="text-text/70 text-sm leading-relaxed max-w-2xl">
// //                   {role.description}
// //                 </p>
// //               </div>

// //               <button
// //                 onClick={() => alert(`Thanks for your interest! Reach out to us directly at founders@techtalkhub.com`)}
// //                 className="bg-secondary text-background hover:opacity-95 px-6 py-3.5 rounded-2xl font-bold text-sm shadow-md shadow-secondary/20 transition-all duration-300 whitespace-nowrap active:scale-95 flex items-center gap-2 group-hover:gap-3"
// //               >
// //                 Apply Now <ArrowRight size={16} />
// //               </button>
// //             </div>
// //           ))}
// //         </div>

// //         {/* General Application Note */}
// //         <div className="mt-20 bg-gradient-to-br from-secondary/10 via-background to-secondary/5 border border-secondary/20 rounded-3xl p-8 md:p-12 text-center max-w-4xl mx-auto shadow-sm relative overflow-hidden">
// //           <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />
          
// //           <h3 className="text-2xl md:text-3xl font-extrabold text-text">Want to build alongside us?</h3>
// //           <p className="text-text/70 text-base mt-3 max-w-xl mx-auto">
// //             We are always looking for resourceful builders who want to scale education. Drop us an email and tell us what you love building.
// //           </p>
// //           <a
// //             href="mailto:founders@techtalkhub.com"
// //             className="inline-flex items-center gap-2 mt-8 bg-secondary text-background px-8 py-4 rounded-2xl font-bold text-sm shadow-md shadow-secondary/20 hover:opacity-95 transition-all active:scale-95"
// //           >
// //             Reach Out <ArrowRight size={16} />
// //           </a>
// //         </div>
// //       </section>
// //     </main>
// //   );
// // }
// // // "use client";

// // // import { useState } from "react";
// // // import Link from "next/link";
// // // import { Sparkles, Globe, BookOpen, HeartHandshake, ArrowRight, CheckCircle2, MapPin, Clock } from "lucide-react";

// // // const openRoles = [
// // //   {
// // //     id: 1,
// // //     title: "Founding Full-Stack Engineer",
// // //     department: "Engineering",
// // //     location: "Nairobi, Kenya (Hybrid / Remote)",
// // //     type: "Full-Time",
// // //     description: "Work directly with the founders to build our core learning platform and student dashboards from scratch.",
// // //   },
// // //   {
// // //     id: 2,
// // //     title: "Founding Lead Tech Instructor",
// // //     department: "Education",
// // //     location: "Nairobi, Kenya (Hybrid / Remote)",
// // //     type: "Full-Time",
// // //     description: "Shape our initial curriculum, lead our first live cohorts, and help refine our teaching methodology.",
// // //   },
// // //   {
// // //     id: 3,
// // //     title: "Growth & Community Lead",
// // //     department: "Marketing & Community",
// // //     location: "Nairobi, Kenya",
// // //     type: "Part-Time / Contract",
// // //     description: "Help spread the word across local tech communities, coordinate early meetups, and engage our first students.",
// // //   },
// // // ];

// // // const perks = [
// // //   {
// // //     icon: Globe,
// // //     title: "Flexible Local Work",
// // //     description: "Collaborate from our Nairobi base or remote on your own schedule. Total ownership over your hours.",
// // //   },
// // //   {
// // //     icon: Sparkles,
// // //     title: "Early-Stage Stake",
// // //     description: "Join at ground zero and help build and grow this venture from the ground up.",
// // //   },
// // //   {
// // //     icon: HeartHandshake,
// // //     title: "Real Hands-On Impact",
// // //     description: "Every line of code and every student interaction directly shapes whether we succeed or fail.",
// // //   },
// // //   {
// // //     icon: BookOpen,
// // //     title: "Rapid Learning Curve",
// // //     description: "Wear many hats and tackle hard startup challenges every day alongside a dedicated founding team.",
// // //   },
// // // ];

// // // export default function CareersPage() {
// // //   const [selectedDepartment, setSelectedDepartment] = useState("All");

// // //   const departments = ["All", "Engineering", "Education", "Marketing & Community"];

// // //   const filteredRoles = selectedDepartment === "All"
// // //     ? openRoles
// // //     : openRoles.filter((role) => role.department === selectedDepartment);

// // //   return (
// // //     <main className="min-h-screen bg-background text-text selection:bg-secondary/20">

// // //       {/* Hero Section */}
// // //       <section className="relative pt-15 pb-24 overflow-hidden border-b border-gray-100 dark:border-gray-800/60">
// // //         <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

// // //         <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
// // //           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary font-semibold text-xs uppercase tracking-widest mb-6 border border-secondary/20 shadow-sm">
// // //             <Sparkles size={14} /> Karibu Team • Early Stage
// // //           </div>
// // //           <h1 className="text-4xl sm:text-6xl font-black text-text tracking-tight leading-[1.1]">
// // //             Help Us Build Tech Talk Hub <span className="text-secondary bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">From the Ground Up</span>
// // //           </h1>
// // //           <p className="text-text/70 mt-6 text-lg sm:text-xl max-w-2xl mx-auto font-normal leading-relaxed">
// // //             We are a bootstrap startup in Nairobi taking things step by step. It is gritty, demanding, and experimental—if you want to build something real from scratch, let's talk.
// // //           </p>

// // //           <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-text/60">
// // //             <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-secondary"/> Early-Stage Startup</span>
// // //             <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-secondary"/> Core Founding Team</span>
// // //             <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-secondary"/> Nairobi & Remote</span>
// // //           </div>
// // //         </div>
// // //       </section>

// // //       {/* Perks Section */}
// // //       <section className="py-20 bg-text/[0.01]">
// // //         <div className="max-w-7xl mx-auto px-6">
// // //           <div className="text-center max-w-2xl mx-auto mb-16">
// // //             <h2 className="text-3xl font-extrabold tracking-tight">What to Expect Joining Early</h2>
// // //             <p className="text-text/60 mt-3 text-base">No corporate fluff. Just real startup building.</p>
// // //           </div>

// // //           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
// // //             {perks.map((perk, idx) => {
// // //               const IconComponent = perk.icon;
// // //               return (
// // //                 <div 
// // //                   key={idx} 
// // //                   className="group bg-background p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-secondary/30 transition-all duration-300 flex flex-col items-start relative overflow-hidden"
// // //                 >
// // //                   <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
// // //                   <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-6 shadow-sm">
// // //                     <IconComponent size={24} />
// // //                   </div>
// // //                   <h3 className="font-bold text-lg text-text mb-2">{perk.title}</h3>
// // //                   <p className="text-text/60 text-sm leading-relaxed">{perk.description}</p>
// // //                 </div>
// // //               );
// // //             })}
// // //           </div>
// // //         </div>
// // //       </section>

// // //       {/* Open Positions Section */}
// // //       <section className="py-24 max-w-7xl mx-auto px-6">
// // //         <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
// // //           <div>
// // //             <span className="text-secondary font-semibold text-xs uppercase tracking-widest bg-secondary/10 px-3 py-1 rounded-md">Founding Roles</span>
// // //             <h2 className="text-3xl md:text-4xl font-extrabold text-text mt-3 tracking-tight">
// // //               Open Positions
// // //             </h2>
// // //           </div>

// // //           {/* Department Filter Pills */}
// // //           <div className="flex flex-wrap gap-2">
// // //             {departments.map((dept) => (
// // //               <button
// // //                 key={dept}
// // //                 onClick={() => setSelectedDepartment(dept)}
// // //                 className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
// // //                   selectedDepartment === dept
// // //                     ? "bg-secondary text-background shadow-md shadow-secondary/20"
// // //                     : "bg-text/5 text-text/80 hover:bg-text/10"
// // //                 }`}
// // //               >
// // //                 {dept}
// // //               </button>
// // //             ))}
// // //           </div>
// // //         </div>

// // //         {/* Roles List */}
// // //         <div className="space-y-4">
// // //           {filteredRoles.map((role) => (
// // //             <div
// // //               key={role.id}
// // //               className="group bg-background border border-gray-100 dark:border-gray-800 p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-xl hover:border-secondary/30 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
// // //             >
// // //               <div className="space-y-3 max-w-3xl">
// // //                 <div className="flex flex-wrap items-center gap-2.5">
// // //                   <span className="text-xs font-bold text-secondary uppercase tracking-wider bg-secondary/10 px-3 py-1 rounded-full">
// // //                     {role.department}
// // //                   </span>
// // //                   <span className="text-xs font-medium text-text/70 bg-text/5 px-3 py-1 rounded-full flex items-center gap-1">
// // //                     <MapPin size={12} /> {role.location}
// // //                   </span>
// // //                   <span className="text-xs font-medium text-text/70 bg-text/5 px-3 py-1 rounded-full flex items-center gap-1">
// // //                     <Clock size={12} /> {role.type}
// // //                   </span>
// // //                 </div>
                
// // //                 <h3 className="text-2xl font-bold text-text group-hover:text-secondary transition-colors">
// // //                   {role.title}
// // //                 </h3>
                
// // //                 <p className="text-text/70 text-sm leading-relaxed max-w-2xl">
// // //                   {role.description}
// // //                 </p>
// // //               </div>

// // //               <button
// // //                 onClick={() => alert(`Thanks for your interest in joining early! Reach out to us directly at founders@techtalkhub.com`)}
// // //                 className="bg-secondary text-background hover:opacity-95 px-6 py-3.5 rounded-2xl font-bold text-sm shadow-md shadow-secondary/20 transition-all duration-300 whitespace-nowrap active:scale-95 flex items-center gap-2 group-hover:gap-3"
// // //               >
// // //                 Apply Now <ArrowRight size={16} />
// // //               </button>
// // //             </div>
// // //           ))}
// // //         </div>

// // //         {/* General Application Note */}
// // //         <div className="mt-20 bg-gradient-to-br from-secondary/10 via-background to-secondary/5 border border-secondary/20 rounded-3xl p-8 md:p-12 text-center max-w-4xl mx-auto shadow-sm relative overflow-hidden">
// // //           <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />
          
// // //           <h3 className="text-2xl md:text-3xl font-extrabold text-text">Want to build alongside us?</h3>
// // //           <p className="text-text/70 text-base mt-3 max-w-xl mx-auto">
// // //             We are looking for resourceful, pragmatic builders who want to shape something early. Drop us an email and tell us what you love building.
// // //           </p>
// // //           <a
// // //             href="mailto:founders@techtalkhub.com"
// // //             className="inline-flex items-center gap-2 mt-8 bg-secondary text-background px-8 py-4 rounded-2xl font-bold text-sm shadow-md shadow-secondary/20 hover:opacity-95 transition-all active:scale-95"
// // //           >
// // //             Reach Out <ArrowRight size={16} />
// // //           </a>
// // //         </div>
// // //       </section>
// // //     </main>
// // //   );
// // // }
// // // // "use client";

// // // // import { useState } from "react";
// // // // import Link from "next/link";

// // // // const openRoles = [
// // // //   {
// // // //     id: 1,
// // // //     title: "Senior Full-Stack Instructor",
// // // //     department: "Education",
// // // //     location: "Remote (Global)",
// // // //     type: "Full-Time",
// // // //     description: "Lead live cohort-based classes, mentor aspiring software engineers, and help shape our next-generation curriculum.",
// // // //   },
// // // //   {
// // // //     id: 2,
// // // //     title: "Frontend Engineer (Next.js / React)",
// // // //     department: "Engineering",
// // // //     location: "Remote / Hybrid",
// // // //     type: "Full-Time",
// // // //     description: "Build fast, highly responsive user interfaces across our web platform and student dashboard ecosystems.",
// // // //   },
// // // //   {
// // // //     id: 3,
// // // //     title: "Developer Community Manager",
// // // //     department: "Marketing & Community",
// // // //     location: "Remote (US / Europe)",
// // // //     type: "Part-Time / Contract",
// // // //     description: "Grow and engage our global community of tech learners, manage hackathons, and coordinate developer events.",
// // // //   },
// // // //   {
// // // //     id: 4,
// // // //     title: "Technical Content Writer & Curriculum Developer",
// // // //     department: "Content",
// // // //     location: "Remote",
// // // //     type: "Full-Time",
// // // //     description: "Create engaging blog articles, system design guides, and interactive coding challenges for our students.",
// // // //   },
// // // // ];

// // // // const perks = [
// // // //   {
// // // //     icon: "🌍",
// // // //     title: "100% Remote Flexibility",
// // // //     description: "Work from anywhere in the world with flexible hours designed around your peak productivity.",
// // // //   },
// // // //   {
// // // //     icon: "📚",
// // // //     title: "Continuous Learning Budget",
// // // //     description: "Annual stipend for courses, books, conferences, and technical certifications to keep your skills sharp.",
// // // //   },
// // // //   {
// // // //     icon: "💡",
// // // //     title: "Real Impact",
// // // //     description: "Empower the next generation of global software engineers and fund free tech education worldwide.",
// // // //   },
// // // //   {
// // // //     icon: "🚀",
// // // //     title: "Competitive Compensation",
// // // //     description: "Top-tier salary bands, equity options, and comprehensive wellness and health benefits.",
// // // //   },
// // // // ];

// // // // export default function CareersPage() {
// // // //   const [selectedDepartment, setSelectedDepartment] = useState("All");

// // // //   const departments = ["All", "Education", "Engineering", "Marketing & Community", "Content"];

// // // //   const filteredRoles = selectedDepartment === "All"
// // // //     ? openRoles
// // // //     : openRoles.filter((role) => role.department === selectedDepartment);

// // // //   return (
// // // //     <main className="min-h-screen bg-background text-text">

// // // //       {/* Hero Section */}
// // // //       <section className="pt-32 pb-20 relative overflow-hidden">
// // // //         <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

// // // //         <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
// // // //           <span className="text-secondary font-semibold text-sm uppercase tracking-widest bg-secondary/10 px-3 py-1 rounded-full">
// // // //             Join Our Mission
// // // //           </span>
// // // //           <h1 className="text-4xl md:text-6xl font-extrabold text-text mt-4 tracking-tight">
// // // //             Build the Future of <span className="text-secondary">Tech Education</span>
// // // //           </h1>
// // // //           <p className="text-text/70 mt-6 text-lg max-w-2xl mx-auto">
// // // //             We are on a mission to make world-class tech education accessible to everyone, everywhere. Come build something impactful with us.
// // // //           </p>
// // // //         </div>
// // // //       </section>

// // // //       {/* Perks Section */}
// // // //       <section className="py-16 bg-text/[0.02] border-y border-gray-100 dark:border-gray-800">
// // // //         <div className="max-w-7xl mx-auto px-6">
// // // //           <div className="text-center max-w-xl mx-auto mb-12">
// // // //             <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Why Tech Talk Hub?</h2>
// // // //             <p className="text-text/60 mt-2">We take care of our team so our team can take care of our students.</p>
// // // //           </div>

// // // //           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
// // // //             {perks.map((perk, idx) => (
// // // //               <div 
// // // //                 key={idx} 
// // // //                 className="bg-background p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-start"
// // // //               >
// // // //                 <span className="text-3xl mb-4">{perk.icon}</span>
// // // //                 <h3 className="font-bold text-lg text-text mb-2">{perk.title}</h3>
// // // //                 <p className="text-text/60 text-sm leading-relaxed">{perk.description}</p>
// // // //               </div>
// // // //             ))}
// // // //           </div>
// // // //         </div>
// // // //       </section>

// // // //       {/* Open Positions Section */}
// // // //       <section className="py-24 max-w-7xl mx-auto px-6">
// // // //         <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
// // // //           <div>
// // // //             <span className="text-secondary font-semibold text-sm uppercase tracking-widest">Open Positions</span>
// // // //             <h2 className="text-3xl md:text-4xl font-extrabold text-text mt-2 tracking-tight">
// // // //               Find Your Role
// // // //             </h2>
// // // //           </div>

// // // //           {/* Department Filter Pills */}
// // // //           <div className="flex flex-wrap gap-2">
// // // //             {departments.map((dept) => (
// // // //               <button
// // // //                 key={dept}
// // // //                 onClick={() => setSelectedDepartment(dept)}
// // // //                 className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
// // // //                   selectedDepartment === dept
// // // //                     ? "bg-secondary text-background shadow-sm"
// // // //                     : "bg-text/5 text-text/80 hover:bg-text/10"
// // // //                 }`}
// // // //               >
// // // //                 {dept}
// // // //               </button>
// // // //             ))}
// // // //           </div>
// // // //         </div>

// // // //         {/* Roles List */}
// // // //         <div className="space-y-4">
// // // //           {filteredRoles.map((role) => (
// // // //             <div
// // // //               key={role.id}
// // // //               className="group bg-background border border-gray-100 dark:border-gray-800 p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
// // // //             >
// // // //               <div className="space-y-2 max-w-2xl">
// // // //                 <div className="flex flex-wrap items-center gap-3">
// // // //                   <span className="text-xs font-semibold text-secondary uppercase tracking-wider bg-secondary/10 px-2.5 py-1 rounded-md">
// // // //                     {role.department}
// // // //                   </span>
// // // //                   <span className="text-xs font-medium text-text/60 bg-text/5 px-2.5 py-1 rounded-md">
// // // //                     {role.location}
// // // //                   </span>
// // // //                   <span className="text-xs font-medium text-text/60 bg-text/5 px-2.5 py-1 rounded-md">
// // // //                     {role.type}
// // // //                   </span>
// // // //                 </div>
// // // //                 <h3 className="text-xl font-bold text-text group-hover:text-secondary transition-colors">
// // // //                   {role.title}
// // // //                 </h3>
// // // //                 <p className="text-text/70 text-sm leading-relaxed">
// // // //                   {role.description}
// // // //                 </p>
// // // //               </div>

// // // //               <button
// // // //                 onClick={() => alert(`Thank you for your interest in the ${role.title} position! Please send your resume to careers@techtalkhub.com`)}
// // // //                 className="bg-secondary/10 hover:bg-secondary text-secondary hover:text-background px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 whitespace-nowrap active:scale-95"
// // // //               >
// // // //                 Apply Now
// // // //               </button>
// // // //             </div>
// // // //           ))}
// // // //         </div>

// // // //         {/* General Application Note */}
// // // //         <div className="mt-16 bg-secondary/5 border border-secondary/20 rounded-2xl p-8 text-center max-w-3xl mx-auto">
// // // //           <h3 className="text-xl font-bold text-text">Don&apos;t see your exact role?</h3>
// // // //           <p className="text-text/70 text-sm mt-2">
// // // //             We are always looking for exceptional talent. If you believe you can add value to our mission, drop us a line anyway!
// // // //           </p>
// // // //           <a
// // // //             href="mailto:careers@techtalkhub.com"
// // // //             className="inline-block mt-6 bg-secondary text-background px-6 py-3 rounded-xl font-bold text-sm shadow-sm hover:opacity-95 transition"
// // // //           >
// // // //             Send Open Application
// // // //           </a>
// // // //         </div>
// // // //       </section>
// // // //     </main>
// // // //   );
// // // // }