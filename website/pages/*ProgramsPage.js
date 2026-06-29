"use client";
import React from "react";
import { FaCheckCircle, FaUserGraduate, FaBookOpen, FaClock, FaTasks } from "react-icons/fa";

const programs = [
  {
    title: "AI & Coding Grandmaster: Master Coding Skills",
    age: "Age 5-15",
    grade: "Grade 1-10",
    activities: "350+ Activities",
    lessons: "144 Lessons",
    duration: "12-18 months",
    description:
      "Explore 144 interactive lessons to become a master of AI and coding. Choose a guided path or personalize your journey.",
    outcomes: [
      "Build apps, games, and websites",
      "Master AI and coding skills",
      "Engage in project-based learning",
      "Earn an AI & Coding Grandmaster certificate, accredited by STEM.org",
    ],
    curriculumLink: "#",
    trialLink: "#",
    image: "https://placehold.co/600x300/3F51B5/fff?text=Grandmaster",
  },
  {
    title: "AI & Coding Prodigy: Code Like a Pro",
    age: "Age 5-17",
    grade: "Grade 1-12",
    activities: "184+ Activities",
    lessons: "96 Lessons",
    duration: "9-12 months",
    description:
      "A 96-lesson curriculum for kids and teens to master AI, coding, and real-world applications through projects.",
    outcomes: [
      "Learn to code like a pro",
      "Create amazing apps and games",
      "Earn AI & Coding Prodigy certificate (STEM.org Accredited)",
      "Master problem-solving skills",
    ],
    curriculumLink: "#",
    trialLink: "#",
    image: "https://placehold.co/600x300/FF4081/fff?text=Prodigy",
  },
  {
    title: "AI & Coding Champion: Learn to Code",
    age: "Age 5-17",
    grade: "Grade 1-12",
    activities: "50+ Activities",
    lessons: "48 Lessons",
    duration: "4-6 months",
    description:
      "Kickstart AI & coding for kids and teens with 48 fun lessons and hands-on projects that build skills and creativity.",
    outcomes: [
      "Kickstart your AI & coding journey",
      "Build amazing apps, games & websites",
      "Earn AI & Coding Champion certificate (STEM.org Accredited)",
      "Unlock problem-solving superpowers",
    ],
    curriculumLink: "#",
    trialLink: "#",
    image: "https://placehold.co/600x300/00BFA5/fff?text=Champion",
  },
  {
    title: "Scratch Programming with AI: Unleash Your Creativity",
    age: "Age 5-14",
    grade: "Grade 1-8",
    activities: "50+ Activities",
    lessons: "36 Lessons",
    duration: "2-4 months",
    description:
      "Master AI and coding with Scratch: create games, animations, explore AI, and unlock endless creative potential.",
    outcomes: [
      "Learn block-based coding",
      "Create fun animations & games",
      "Explore the basics of Artificial Intelligence",
      "Design interactive stories & digital art",
    ],
    curriculumLink: "#",
    trialLink: "#",
    image: "https://placehold.co/600x300/FFC107/333?text=Scratch+AI",
  },
];

export default function ProgramsPage() {
  return (
    <div className="bg-background min-h-screen py-12 px-6 md:px-16 w-full">
      <h1 className="text-3xl font-bold text-center mb-12 font-poppins text-primary">
        Choose an{" "}
        <span className="text-secondary">AI & Coding Course</span> that excites
        your child
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl mx-auto items-stretch">
        {programs.map((program, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border-2 border-transparent shadow-card p-4 flex flex-col hover:border-primary hover:shadow-lg hover:scale-[1.02] transition-all duration-300 h-full"
          >
            {/* Image + Ribbon */}
            <div className="relative">
              <img
                src={program.image}
                alt={program.title}
                className="rounded-md w-full h-40 object-cover"
              />
              {/* AI Tag - Red */}
              <span className="absolute top-2 left-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-r-lg shadow-md">
                AI
              </span>
              {/* Age Badge Transparent */}
              <span className="absolute top-2 right-2 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded">
                {program.age}
              </span>
            </div>

            {/* Text */}
            <h2 className="text-lg font-semibold mt-3 text-primary line-clamp-2">
              {program.title}
            </h2>

            {/* Info with icons (smaller font) */}
            <div className="text-[12px] sm:text-[13px] text-gray-600 grid grid-cols-2 gap-y-2 mt-3 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-1.5">
                <FaUserGraduate className="text-secondary text-xs flex-shrink-0" />{" "}
                <span>{program.grade}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FaTasks className="text-accent text-xs flex-shrink-0" />{" "}
                <span>{program.activities}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FaBookOpen className="text-primary text-xs flex-shrink-0" />{" "}
                <span>{program.lessons}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FaClock className="text-funPop text-xs flex-shrink-0" />{" "}
                <span>{program.duration}</span>
              </div>
            </div>

            <p className="text-sm text-gray-700 mt-3 line-clamp-3">{program.description}</p>

            {/* Outcomes with ticks */}
            <div className="mt-4 mb-6 flex-grow">
              <h3 className="text-sm font-semibold text-primary mb-2">
                Learning outcomes
              </h3>
              <ul className="space-y-1.5">
                {program.outcomes.map((outcome, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs sm:text-sm text-gray-700"
                  >
                    <FaCheckCircle className="text-accent text-sm flex-shrink-0 mt-[2px]" />
                    <span className="line-clamp-2">{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Buttons (stick bottom) */}
            <div className="mt-auto flex flex-col gap-3 pt-2">
              <a
                href={program.curriculumLink}
                className="text-secondary text-sm font-semibold hover:underline flex items-center justify-center gap-1"
              >
                📘 <span>Download curriculum</span>
              </a>
              <a
                href={program.trialLink}
                className="bg-secondary text-white text-center py-2.5 rounded-xl shadow-btn font-semibold hover:bg-pink-600 transition duration-200"
              >
                🎉 Try a free lesson
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
// "use client";
// import React from "react";
// import { FaCheckCircle, FaUserGraduate, FaBookOpen, FaClock, FaTasks } from "react-icons/fa";

// const programs = [
//   {
//     title: "AI & Coding Grandmaster: Master Coding Skills",
//     age: "Age 5-15",
//     grade: "Grade 1-10",
//     activities: "350+ Activities",
//     lessons: "144 Lessons",
//     duration: "12-18 months",
//     description:
//       "Explore 144 interactive lessons to become a master of AI and coding. Choose a guided path or personalize your journey.",
//     outcomes: [
//       "Build apps, games, and websites",
//       "Master AI and coding skills",
//       "Engage in project-based learning",
//       "Earn an AI & Coding Grandmaster certificate, accredited by STEM.org",
//     ],
//     curriculumLink: "#",
//     trialLink: "#",
//     image: "https://placehold.co/600x300/3F51B5/fff?text=Grandmaster",
//   },
//   {
//     title: "AI & Coding Prodigy: Code Like a Pro",
//     age: "Age 5-17",
//     grade: "Grade 1-12",
//     activities: "184+ Activities",
//     lessons: "96 Lessons",
//     duration: "9-12 months",
//     description:
//       "A 96-lesson curriculum for kids and teens to master AI, coding, and real-world applications through projects.",
//     outcomes: [
//       "Learn to code like a pro",
//       "Create amazing apps and games",
//       "Earn AI & Coding Prodigy certificate (STEM.org Accredited)",
//       "Master problem-solving skills",
//     ],
//     curriculumLink: "#",
//     trialLink: "#",
//     image: "https://placehold.co/600x300/FF4081/fff?text=Prodigy",
//   },
//   {
//     title: "AI & Coding Champion: Learn to Code",
//     age: "Age 5-17",
//     grade: "Grade 1-12",
//     activities: "50+ Activities",
//     lessons: "48 Lessons",
//     duration: "4-6 months",
//     description:
//       "Kickstart AI & coding for kids and teens with 48 fun lessons and hands-on projects that build skills and creativity.",
//     outcomes: [
//       "Kickstart your AI & coding journey",
//       "Build amazing apps, games & websites",
//       "Earn AI & Coding Champion certificate (STEM.org Accredited)",
//       "Unlock problem-solving superpowers",
//     ],
//     curriculumLink: "#",
//     trialLink: "#",
//     image: "https://placehold.co/600x300/00BFA5/fff?text=Champion",
//   },
//   {
//     title: "Scratch Programming with AI: Unleash Your Creativity",
//     age: "Age 5-14",
//     grade: "Grade 1-8",
//     activities: "50+ Activities",
//     lessons: "36 Lessons",
//     duration: "2-4 months",
//     description:
//       "Master AI and coding with Scratch: create games, animations, explore AI, and unlock endless creative potential.",
//     outcomes: [
//       "Learn block-based coding",
//       "Create fun animations & games",
//       "Explore the basics of Artificial Intelligence",
//       "Design interactive stories & digital art",
//     ],
//     curriculumLink: "#",
//     trialLink: "#",
//     image: "https://placehold.co/600x300/FFC107/333?text=Scratch+AI",
//   },
// ];

// export default function ProgramsPage() {
//   return (
//     <div className="bg-background min-h-screen py-12 px-6 md:px-16">
//       <h1 className="text-3xl font-bold text-center mb-12 font-poppins text-primary">
//         Choose an{" "}
//         <span className="text-secondary">AI & Coding Course</span> that excites
//         your child
//       </h1>

// //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
// <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl mx-auto">
//         {programs.map((program, i) => (
//           <div
//             key={i}
//             className="bg-white rounded-xl border-2 border-transparent shadow-card p-4 flex flex-col hover:border-primary hover:shadow-lg hover:scale-[1.02] transition-transform duration-300 h-full"
//           >
//             {/* Image + Ribbon */}
//             <div className="relative">
//               <img
//                 src={program.image}
//                 alt={program.title}
//                 className="rounded-md w-full h-40 object-cover"
//               />
//               {/* AI Tag - Red */}
//               <span className="absolute top-2 left-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-r-lg shadow-md">
//                 AI
//               </span>
//               {/* Age Badge Transparent */}
//               <span className="absolute top-2 right-2 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded">
//                 {program.age}
//               </span>
//             </div>

//             {/* Text */}
//             <h2 className="text-lg font-semibold mt-3 text-primary">
//               {program.title}
//             </h2>

//             {/* Info with icons (smaller font) */}
//             <div className="text-[12px] sm:text-[13px] text-gray-600 grid grid-cols-2 gap-y-1 mt-2">
//               <div className="flex items-center gap-1.5">
//                 <FaUserGraduate className="text-secondary text-xs" /> {program.grade}
//               </div>
//               <div className="flex items-center gap-1.5">
//                 <FaTasks className="text-accent text-xs" /> {program.activities}
//               </div>
//               <div className="flex items-center gap-1.5">
//                 <FaBookOpen className="text-primary text-xs" /> {program.lessons}
//               </div>
//               <div className="flex items-center gap-1.5">
//                 <FaClock className="text-funPop text-xs" /> {program.duration}
//               </div>
//             </div>

//             <p className="text-sm text-gray-700 mt-2 flex-grow">{program.description}</p>

//             {/* Outcomes with ticks */}
//             <div className="mt-3 flex-grow">
//               <h3 className="text-sm font-semibold text-primary mb-2">
//                 Learning outcomes
//               </h3>
//               <ul className="space-y-1">
//                 {program.outcomes.map((outcome, idx) => (
//                   <li
//                     key={idx}
//                     className="flex items-start gap-2 text-sm text-gray-700"
//                   >
//                     <FaCheckCircle className="text-accent text-sm flex-shrink-0 mt-[2px]" />
//                     <span>{outcome}</span>
//                   </li>
//                 ))}
//               </ul>
//             </div>

//             {/* Buttons (stick bottom) */}
//             <div className="mt-auto flex flex-col gap-2">
//               <a
//                 href={program.curriculumLink}
//                 className="text-secondary text-sm font-semibold hover:underline"
//               >
//                 📘 Download curriculum
//               </a>
//               <a
//                 href={program.trialLink}
//                 className="bg-secondary text-white text-center py-2 rounded-xl shadow-btn font-semibold hover:bg-pink-600 transition"
//               >
//                 🎉 Try a free lesson
//               </a>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const plans = [
//   {
//     name: "Starter",
//     classes: "1 class/week",
//     monthly: { kes: 6000, usd: 45 },
//     quarterly: { kes: 17100, usd: 128 },
//     yearly: { kes: 64800, usd: 486 },
//     features: [
//       "1 personalized live class/week (45 mins each)",
//       "Flexible scheduling tailored for your child",
//       "Personalized attention in every class",
//       "Unlimited rescheduling at student’s convenience",
//     ],
//   },
//   {
//     name: "Pro",
//     classes: "2 classes/week",
//     monthly: { kes: 10000, usd: 75 },
//     quarterly: { kes: 28500, usd: 214 },
//     yearly: { kes: 108000, usd: 810 },
//     features: [
//       "2 personalized live classes/week (45 mins each)",
//       "8+ fun & engaging classes per month",
//       "More focused attention",
//       "Unlimited rescheduling at student’s convenience",
//     ],
//   },
//   {
//     name: "Elite",
//     classes: "3 classes/week",
//     monthly: { kes: 13000, usd: 97 },
//     quarterly: { kes: 37050, usd: 277 },
//     yearly: { kes: 140400, usd: 1053 },
//     popular: true,
//     features: [
//       "3 engaging live classes/week (60 mins each)",
//       "12+ fun & engaging classes per month",
//       "Balanced attention and group interaction",
//       "Priority rescheduling available",
//     ],
//   },
//   {
//     name: "Ultimate",
//     classes: "4 classes/week",
//     monthly: { kes: 15500, usd: 116 },
//     quarterly: { kes: 44175, usd: 330 },
//     yearly: { kes: 167400, usd: 1256 },
//     features: [
//       "4 intensive live classes/week (60 mins each)",
//       "16+ fun & engaging classes per month",
//       "Maximum attention and progress",
//       "Limited rescheduling options",
//     ],
//   },
// ];

// export default function Pricing() {
//   const [currency, setCurrency] = useState("kes");
//   const [billing, setBilling] = useState("monthly");
//   const navigate = useNavigate();

//   const getDiscount = (billing) => {
//     if (billing === "quarterly") return 5;
//     if (billing === "yearly") return 10;
//     return 0;
//   };

//   return (
//     <div className="bg-background min-h-screen py-12 px-4 font-poppins">
//       <div className="max-w-7xl mx-auto text-center">
//         <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8">
//           Subscription Plans (1:1 + Full Playground)
//         </h1>

//         {/* Toggles */}
//         <div className="flex flex-col md:flex-row justify-center gap-4 mb-12">
//           {/* Currency Toggle */}
//           <div className="flex border rounded-xl overflow-hidden">
//             <button
//               onClick={() => setCurrency("kes")}
//               className={`px-4 py-2 ${
//                 currency === "kes"
//                   ? "bg-primary text-white"
//                   : "bg-white text-text"
//               }`}
//             >
//               KES
//             </button>
//             <button
//               onClick={() => setCurrency("usd")}
//               className={`px-4 py-2 ${
//                 currency === "usd"
//                   ? "bg-primary text-white"
//                   : "bg-white text-text"
//               }`}
//             >
//               USD
//             </button>
//           </div>

//           {/* Billing Toggle */}
//           <div className="flex border rounded-xl overflow-hidden">
//             {["monthly", "quarterly", "yearly"].map((b) => (
//               <button
//                 key={b}
//                 onClick={() => setBilling(b)}
//                 className={`px-4 py-2 capitalize ${
//                   billing === b ? "bg-secondary text-white" : "bg-white text-text"
//                 }`}
//               >
//                 {b}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Plans Grid */}
//         <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           {plans.map((plan) => {
//             const discount = getDiscount(billing);
//             const price =
//               currency === "kes"
//                 ? plan[billing].kes.toLocaleString()
//                 : plan[billing].usd;

//             let oldPrice = null;
//             if (discount > 0) {
//               const base = currency === "kes" ? plan.monthly.kes : plan.monthly.usd;
//               const factor = billing === "quarterly" ? 3 : 12;
//               oldPrice = base * factor;
//             }

//             return (
//               <div
//                 key={plan.name}
//                 className={`relative bg-white shadow-card rounded-2xl p-6 flex flex-col hover:shadow-xl transition-transform duration-300 ${
//                   plan.popular ? "border-2 border-primary scale-105 z-10" : ""
//                 }`}
//               >
//                 {plan.popular && (
//                   <div className="absolute -top-3 left-1/2 -translate-x-1/2">
//                     <span className="bg-secondary text-white text-xs font-semibold px-3 py-1 rounded-full shadow animate-pulse">
//                       ⭐ Most Popular
//                     </span>
//                   </div>
//                 )}

//                 <h2 className="text-xl font-bold text-secondary mb-1">{plan.name}</h2>
//                 <p className="text-sm text-gray-600 mb-4">{plan.classes}</p>

//                 {/* Price */}
//                 <div className="mb-4">
//                   <p className="text-2xl font-bold text-primary">
//                     {currency === "kes" ? `KES ${price}` : `$${price}`}
//                   </p>

//                   {oldPrice && (
//                     <div className="flex items-center justify-center gap-2 mt-1">
//                       <span className="line-through text-gray-400 text-sm">
//                         {currency === "kes"
//                           ? `KES ${oldPrice.toLocaleString()}`
//                           : `$${oldPrice}`}
//                       </span>
//                       <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
//                         {discount}% off
//                       </span>
//                     </div>
//                   )}

//                   <p className="text-sm text-gray-500 capitalize mt-1">
//                     per {billing}
//                   </p>
//                 </div>

//                 {/* CTA */}
//                 <button
//                   onClick={() =>
//                     navigate("/pay", {
//                       state: {
//                         amount: currency === "kes" ? plan[billing].kes : plan[billing].usd,
//                         currency: currency === "kes" ? "KES" : "USD", // force uppercase
//                         planName: plan.name,
//                         planClasses: plan.classes,
//                       },
//                     })
//                   }
//                   className={`mb-6 w-full py-2 rounded-xl font-medium transition ${
//                     plan.popular
//                       ? "bg-secondary text-white animate-pulse"
//                       : "bg-gradient-to-r from-primary to-secondary text-white"
//                   }`}
//                 >
//                   Enroll
//                 </button>

//                 {/* Features */}
//                 <ul className="text-left text-sm space-y-2 mt-auto">
//                   {plan.features.map((f, i) => (
//                     <li key={i} className="flex items-start gap-2">
//                       <span className="text-accent font-bold">✔</span>
//                       <span>{f}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }
// import React from "react";
// import { FaInfoCircle } from "react-icons/fa";

// const projects = [
//   {
//     id: 1,
//     name: "Coulibaly Oleg Arni Doutuan",
//     grade: "Grade 10",
//     type: "Website development",
//     title: "Premier league",
//     img: "/projects/premier_league.jpeg",
//     avatar: "/avatars/student1.jpeg",
//   },
//   {
//     id: 2,
//     name: "Syeda Hiba Sikandar",
//     grade: "Grade 3",
//     type: "Animation",
//     title: "Dance party",
//     img: "/projects/danceparty.jpeg",
//     avatar: "/avatars/student2.jpeg",
//   },
//   {
//     id: 3,
//     name: "Megha Rae",
//     grade: "Grade 6",
//     type: "Scratch",
//     title: "Knowing About Animals",
//     img: "/projects/animals.jpeg",
//     avatar: "/avatars/student3.jpeg",
//   },
// ];

// export default function StudentProjects() {
//   return (
//     <section className="bg-background py-16 px-6 md:px-20 font-poppins">
//       <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary">
//         See amazing projects{" "}
//         <span className="text-secondary">created by our students</span>
//       </h2>

//       {/* Grid layout */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//         {projects.map((p) => (
//           <div
//             key={p.id}
//             className="bg-white shadow-card rounded-xl overflow-hidden flex flex-col hover:shadow-lg transition duration-300"
//           >
//             {/* Project preview */}
//             <div className="relative">
//               <img
//                 src={p.img}
//                 alt={p.title}
//                 className="w-full h-48 object-cover"
//               />
//               {/* Avatar bottom-left inside image */}
//               <div className="absolute -bottom-6 left-4">
//                 <img
//                   src={p.avatar}
//                   alt={p.name}
//                   className="w-16 h-16 rounded-full border-4 border-white shadow-md"
//                 />
//               </div>
//             </div>

//             {/* Content */}
//             <div className="pt-10 pb-6 px-4 flex flex-col flex-1">
//               <p className="font-bold text-primary">{p.name}</p>
//               <p className="text-gray-500 text-sm mb-3">{p.grade}</p>

//               <p className="text-sm text-text">{p.type}</p>
//               <p className="font-semibold text-text flex items-center gap-1 mt-1">
//                 {p.title}
//                 <FaInfoCircle className="text-gray-400 text-sm" />
//               </p>

//               <button className="mt-6 bg-secondary text-white font-semibold py-2 rounded-xl shadow-btn hover:bg-primary transition w-full">
//                 View project
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }
// // src/pages/TermsPage.js
// import React from "react";

// export default function TermsPage() {
//   const sections = [
//     {
//       title: "Acceptance of Terms",
//       content: "By using our platform, users agree to follow the rules outlined here.",
//     },
//     {
//       title: "Services Provided",
//       content:
//         "We offer online courses, trial classes, and digital learning resources for children and teens.",
//     },
//     {
//       title: "User Accounts",
//       content:
//         "Parents or guardians must create accounts for their children. Users are responsible for maintaining account confidentiality.",
//     },
//     {
//       title: "Payments and Refunds",
//       content:
//         "Course fees must be paid upfront. Refunds follow the policy stated on the site.",
//     },
//     {
//       title: "Content Usage",
//       content:
//         "All course content is for personal use only. No redistribution or commercial use without permission.",
//     },
//     {
//       title: "Privacy",
//       content:
//         "We collect basic info (name, email, phone) for course registration. Data will not be shared with third parties without consent.",
//     },
//     {
//       title: "Disclaimers",
//       content:
//         "We do our best to provide accurate educational content but are not liable for any outcomes from using the service.",
//     },
//     {
//       title: "Modifications",
//       content:
//         "We may update these terms at any time; continued use means acceptance of changes.",
//     },
//     {
//       title: "Governing Law",
//       content: "Specify your country/state laws that govern the terms.",
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-background font-poppins py-10 px-4 md:px-10">
//       <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-card">
//         <h1 className="text-4xl font-bold text-primary mb-6 text-center">
//           Terms & Conditions
//         </h1>
//         {sections.map((section, idx) => (
//           <div key={idx} className="mb-6">
//             <h2 className="text-2xl font-semibold text-accent mb-2">
//               {section.title}
//             </h2>
//             <p className="text-text leading-relaxed">{section.content}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
// import React from "react";

// // Dummy avatars
// const testimonials = [
//   {
//     name: "Sarah M.",
//     feedback: "My son absolutely loves Tech Talk Hub! He now builds his own mini-games.",
//     avatar: "/avatars/sarah.jpeg",
//     stars: 5,
//   },
//   {
//     name: "James O.",
//     feedback: "The lessons are simple but powerful. My daughter feels confident coding.",
//     avatar: "/avatars/james.jpeg",
//     stars: 4,
//   },
//   {
//     name: "Emily T.",
//     feedback: "We love the personalized mentorship. It’s fun, engaging, and effective!",
//     avatar: "/avatars/emily.jpeg",
//     stars: 5,
//   },
// ];

// export default function TestimonialsPage() {
//   return (
//     <div className="bg-background py-20 px-6 md:px-10 font-poppins">
//       <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start gap-10">
//         
//         {/* Left title/description section */}
//         <div className="flex-1 space-y-4">
//           <h2 className="text-3xl md:text-4xl font-bold text-primary">
//             What Our Customers Say
//           </h2>
//           <p className="text-text text-sm md:text-base">
//             Trusted by hundreds of families. Here’s what parents are saying about our live, personalized coding classes.
//           </p>
//           <button className="bg-secondary text-white font-bold px-5 py-2 rounded-xl shadow-btn hover:opacity-90 transition animate-smoothPulse">
//             View More
//           </button>
//         </div>

//         {/* Testimonial cards */}
//         <div className="flex-1 space-y-6">
//           {testimonials.map((t, idx) => (
//             <div
//               key={idx}
//               className={`bg-white shadow-card rounded-xl p-6 flex items-start gap-4 relative ${
//                 idx === 1 ? "border-l-4 border-secondary bg-background" : ""
//               }`}
//             >
//               <img
//                 src={t.avatar}
//                 alt={t.name}
//                 className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-accent"
//               />
//               <div className="flex-1">
//                 <p className="text-text italic mb-2">“{t.feedback}”</p>
//                 <div className="flex items-center justify-between">
//                   <p className="font-semibold text-primary">{t.name}</p>
//                   <div className="flex gap-1">
//                     {[...Array(t.stars)].map((_, i) => (
//                       <svg
//                         key={i}
//                         className="w-4 h-4 text-funPop"
//                         fill="currentColor"
//                         viewBox="0 0 20 20"
//                       >
//                         <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.3a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.033a1 1 0 00-.364 1.118l1.07 3.3c.3.921-.755 1.688-1.54 1.118l-2.8-2.033a1 1 0 00-1.176 0l-2.8 2.033c-.784.57-1.838-.197-1.539-1.118l1.07-3.3a1 1 0 00-.364-1.118L2.38 8.727c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.3z" />
//                       </svg>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//       </div>
//     </div>
//   );
// }
// // import React from "react";
// // import { FaCheckCircle, FaUserGraduate, FaBookOpen, FaClock, FaTasks } from "react-icons/fa";

// // const programs = [
// //   {
// //     title: "AI & Coding Grandmaster: Master Coding Skills",
// //     age: "Age 5-15",
// //     grade: "Grade 1-10",
// //     activities: "350+ Activities",
// //     lessons: "144 Lessons",
// //     duration: "12-18 months",
// //     description:
// //       "Explore 144 interactive lessons to become a master of AI and coding. Choose a guided path or personalize your journey.",
// //     outcomes: [
// //       "Build apps, games, and websites",
// //       "Master AI and coding skills",
// //       "Engage in project-based learning",
// //       "Earn an AI & Coding Grandmaster certificate, accredited by STEM.org",
// //     ],
// //     curriculumLink: "#",
// //     trialLink: "#",
// //     image: "https://placehold.co/600x300/3F51B5/fff?text=Grandmaster",
// //   },
// //   {
// //     title: "AI & Coding Prodigy: Code Like a Pro",
// //     age: "Age 5-17",
// //     grade: "Grade 1-12",
// //     activities: "184+ Activities",
// //     lessons: "96 Lessons",
// //     duration: "9-12 months",
// //     description:
// //       "A 96-lesson curriculum for kids and teens to master AI, coding, and real-world applications through projects.",
// //     outcomes: [
// //       "Learn to code like a pro",
// //       "Create amazing apps and games",
// //       "Earn AI & Coding Prodigy certificate (STEM.org Accredited)",
// //       "Master problem-solving skills",
// //     ],
// //     curriculumLink: "#",
// //     trialLink: "#",
// //     image: "https://placehold.co/600x300/FF4081/fff?text=Prodigy",
// //   },
// //   {
// //     title: "AI & Coding Champion: Learn to Code",
// //     age: "Age 5-17",
// //     grade: "Grade 1-12",
// //     activities: "50+ Activities",
// //     lessons: "48 Lessons",
// //     duration: "4-6 months",
// //     description:
// //       "Kickstart AI & coding for kids and teens with 48 fun lessons and hands-on projects that build skills and creativity.",
// //     outcomes: [
// //       "Kickstart your AI & coding journey",
// //       "Build amazing apps, games & websites",
// //       "Earn AI & Coding Champion certificate (STEM.org Accredited)",
// //       "Unlock problem-solving superpowers",
// //     ],
// //     curriculumLink: "#",
// //     trialLink: "#",
// //     image: "https://placehold.co/600x300/00BFA5/fff?text=Champion",
// //   },
// //   {
// //     title: "Scratch Programming with AI: Unleash Your Creativity",
// //     age: "Age 5-14",
// //     grade: "Grade 1-8",
// //     activities: "50+ Activities",
// //     lessons: "36 Lessons",
// //     duration: "2-4 months",
// //     description:
// //       "Master AI and coding with Scratch: create games, animations, explore AI, and unlock endless creative potential.",
// //     outcomes: [
// //       "Learn block-based coding",
// //       "Create fun animations & games",
// //       "Explore the basics of Artificial Intelligence",
// //       "Design interactive stories & digital art",
// //     ],
// //     curriculumLink: "#",
// //     trialLink: "#",
// //     image: "https://placehold.co/600x300/FFC107/333?text=Scratch+AI",
// //   },
// // ];

// // export default function ProgramsPage() {
// //   return (
// //     <div className="bg-background min-h-screen py-12 px-6 md:px-16">
// //       <h1 className="text-3xl font-bold text-center mb-12 font-poppins text-primary">
// //         Choose an{" "}
// //         <span className="text-secondary">AI & Coding Course</span> that excites
// //         your child
// //       </h1>

// //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
// //         {programs.map((program, i) => (
// //           <div
// //             key={i}
// //             className="bg-white rounded-xl border-2 border-transparent shadow-card p-4 flex flex-col hover:border-primary hover:shadow-lg hover:scale-[1.02] transition-transform duration-300 h-full"
// //           >
// //             {/* Image + Ribbon */}
// //             <div className="relative">
// //               <img
// //                 src={program.image}
// //                 alt={program.title}
// //                 className="rounded-md w-full h-40 object-cover"
// //               />
// //               {/* AI Tag - Red */}
// //               <span className="absolute top-2 left-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-r-lg shadow-md">
// //                 AI
// //               </span>
// //               {/* Age Badge Transparent */}
// //               <span className="absolute top-2 right-2 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded">
// //                 {program.age}
// //               </span>
// //             </div>

// //             {/* Text */}
// //             <h2 className="text-lg font-semibold mt-3 text-primary">
// //               {program.title}
// //             </h2>

// //             {/* Info with icons (smaller font) */}
// //             <div className="text-[12px] sm:text-[13px] text-gray-600 grid grid-cols-2 gap-y-1 mt-2">
// //               <div className="flex items-center gap-1.5">
// //                 <FaUserGraduate className="text-secondary text-xs" /> {program.grade}
// //               </div>
// //               <div className="flex items-center gap-1.5">
// //                 <FaTasks className="text-accent text-xs" /> {program.activities}
// //               </div>
// //               <div className="flex items-center gap-1.5">
// //                 <FaBookOpen className="text-primary text-xs" /> {program.lessons}
// //               </div>
// //               <div className="flex items-center gap-1.5">
// //                 <FaClock className="text-funPop text-xs" /> {program.duration}
// //               </div>
// //             </div>

// //             <p className="text-sm text-gray-700 mt-2 flex-grow">{program.description}</p>

// //             {/* Outcomes with ticks */}
// //             <div className="mt-3 flex-grow">
// //               <h3 className="text-sm font-semibold text-primary mb-2">
// //                 Learning outcomes
// //               </h3>
// //               <ul className="space-y-1">
// //                 {program.outcomes.map((outcome, idx) => (
// //                   <li
// //                     key={idx}
// //                     className="flex items-start gap-2 text-sm text-gray-700"
// //                   >
// //                     <FaCheckCircle className="text-accent text-sm flex-shrink-0 mt-[2px]" />
// //                     <span>{outcome}</span>
// //                   </li>
// //                 ))}
// //               </ul>
// //             </div>

// //             {/* Buttons (stick bottom) */}
// //             <div className="mt-6 flex flex-col gap-2">
// //               <a
// //                 href={program.curriculumLink}
// //                 className="text-secondary text-sm font-semibold hover:underline"
// //               >
// //                 📘 Download curriculum
// //               </a>
// //               <a
// //                 href={program.trialLink}
// //                 className="bg-secondary text-white text-center py-2 rounded-xl shadow-btn font-semibold hover:bg-pink-600 transition"
// //               >
// //                 🎉 Try a free lesson
// //               </a>
// //             </div>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }