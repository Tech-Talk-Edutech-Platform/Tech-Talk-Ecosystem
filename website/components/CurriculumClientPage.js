"use client";

import { useState } from "react";
import {
  BarChart3,
  ClipboardCheck,
  Trophy,
} from "lucide-react";

import CurriculumCard from "./CurriculumCard";
import LeadMagnetForm from "./LeadMagnetForm";

const features = [
  {
    icon: BarChart3,
    title: "Unified Dashboard",
    description:
      "A personalized space where learners can follow lessons, assignments and progress.",
  },
  {
    icon: ClipboardCheck,
    title: "Smart Assessments",
    description:
      "Interactive assessments with timely feedback to strengthen understanding.",
  },
  {
    icon: Trophy,
    title: "Gamified Progress",
    description:
      "XP, achievements and milestones that keep learners motivated.",
  },
];

export default function CurriculumClientPage({
  initialLevels = [],
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="bg-slate-50">
      {/* Programs */}
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-purple-50/30 to-purple-100/40">
          <div className="mx-auto max-w-7xl px-6 pb-12 pt-12 text-center">
            <span className="inline-flex rounded-full border border-purple-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-primary shadow-sm">
              Premium Coding Pathways
            </span>

            <h2 className="mx-auto mt-5 max-w-4xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              Learn. Build. Grow.{" "}
              <span className="text-secondary">
                One Stage at a Time.
              </span>
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Structured learning pathways designed to grow
              with every learner — from their first line of
              code to advanced real-world projects.
            </p>

            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">
              Every learner begins with a placement assessment
              so they start at the right challenge level.
            </p>
          </div>
        </div>

        {/* Program cards */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {initialLevels.slice(0, 3).map((level) => (
            <CurriculumCard
              key={level._id}
              level={level}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="mt-10 flex flex-col justify-center gap-4 text-center sm:flex-row">
          <a
            href="/book-class"
            className="rounded-xl bg-secondary px-8 py-3.5 font-bold text-white shadow-lg shadow-secondary/20 transition hover:-translate-y-0.5"
          >
            Book a Placement Assessment
          </a>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="rounded-xl border border-slate-200 bg-white px-8 py-3.5 font-bold text-slate-700 shadow-sm transition hover:border-purple-200 hover:bg-purple-50"
          >
            Download Full Roadmap
          </button>
        </div>
      </div>

      {/* Roadmap modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="roadmap-modal-title"
            className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowModal(false)}
              aria-label="Close roadmap form"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-2xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              &times;
            </button>

            <h3
              id="roadmap-modal-title"
              className="mb-4 text-xl font-bold text-slate-900"
            >
              Get the Roadmap PDF
            </h3>

            <LeadMagnetForm
              onClose={() => setShowModal(false)}
            />
          </div>
        </div>
      )}

      {/* Tech Talk Advantage */}
      <section className="border-t border-slate-100 bg-white px-4 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-secondary">
              Why Tech Talk Hub
            </span>

            <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
              The Tech Talk Advantage
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
              Learning tools designed to keep every child
              supported, motivated and progressing.
            </p>

            <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-secondary" />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="rounded-3xl border border-slate-100 bg-white p-7 text-center shadow-[0_12px_35px_rgba(30,41,59,0.07)] transition duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-[0_18px_45px_rgba(41,71,199,0.10)]"
                >
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-primary">
                    <Icon
                      className="h-7 w-7"
                      strokeWidth={2}
                    />
                  </span>

                  <h3 className="mt-5 text-xl font-bold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
// "use client";

// import { useState } from "react";
// import CurriculumCard from "./CurriculumCard";
// import PlatformFeatureCard from "./PlatformFeatureCard";
// import LeadMagnetForm from "./LeadMagnetForm";

// export default function CurriculumClientPage({
//   initialLevels = [],
// }) {
//   const [showModal, setShowModal] = useState(false);
//   const [activeFeature, setActiveFeature] = useState(null);

//   return (
//     <div className="bg-slate-50">

//       {/* Programs */}
//       <div className="mx-auto max-w-6xl px-4 pb-12 pt-8">

//         {/* Header */}
//         <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-purple-50/30 to-purple-100/40">
//           <div className="mx-auto max-w-7xl px-6 pb-12 pt-12 text-center">

//             <span className="inline-flex rounded-full border border-purple-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-primary shadow-sm">
//               Premium Coding Pathways
//             </span>

//             <h2 className="mx-auto mt-5 max-w-4xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
//               Learn. Build. Grow.{" "}
//               <span className="text-secondary">
//                 One Stage at a Time.
//               </span>
//             </h2>

//             <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
//               Structured learning pathways designed to grow with every
//               learner — from their first line of code to advanced
//               real-world projects.
//             </p>

//             <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">
//               Every learner begins with a placement assessment so they
//               start at the right challenge level.
//             </p>
//           </div>
//         </div>

//         {/* Program Cards */}
//         <div className="mt-8 grid gap-6 md:grid-cols-3">
//           {initialLevels.slice(0, 3).map((level) => (
//             <CurriculumCard
//               key={level._id}
//               level={level}
//             />
//           ))}
//         </div>

//         {/* Actions */}
//         <div className="mt-10 flex flex-col justify-center gap-4 text-center sm:flex-row">
//           <a
//             href="/book-class"
//             className="rounded-xl bg-secondary px-8 py-3.5 font-bold text-white shadow-lg shadow-secondary/20 transition hover:-translate-y-0.5"
//           >
//             Book a Placement Assessment
//           </a>

//           <button
//             onClick={() => setShowModal(true)}
//             className="rounded-xl border border-slate-200 bg-white px-8 py-3.5 font-bold text-slate-700 shadow-sm transition hover:border-purple-200 hover:bg-purple-50"
//           >
//             Download Full Roadmap
//           </button>
//         </div>
//       </div>

//       {/* Roadmap Modal */}
//       {showModal && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
//           onClick={() => setShowModal(false)}
//         >
//           <div
//             className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
//             onClick={(event) => event.stopPropagation()}
//           >
//             <button
//               onClick={() => setShowModal(false)}
//               className="absolute right-4 top-4 text-2xl text-slate-400"
//             >
//               &times;
//             </button>

//             <h3 className="mb-4 text-xl font-bold">
//               Get the Roadmap PDF
//             </h3>

//             <LeadMagnetForm
//               onClose={() => setShowModal(false)}
//             />
//           </div>
//         </div>
//       )}

//       {/* Feature Modal */}
//       {activeFeature && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
//           onClick={() => setActiveFeature(null)}
//         >
//           <div
//             className="w-full max-w-2xl rounded-3xl bg-white p-8"
//             onClick={(event) => event.stopPropagation()}
//           >
//             <h2 className="mb-4 text-2xl font-bold capitalize">
//               {activeFeature} Preview
//             </h2>

//             <div className="mb-6 flex h-64 items-center justify-center rounded-xl bg-slate-100">
//               <p className="text-slate-400">
//                 Illustration of {activeFeature} goes here
//               </p>
//             </div>

//             <button
//               onClick={() => setActiveFeature(null)}
//               className="w-full rounded-xl bg-slate-900 py-3 font-bold text-white"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Tech Talk Advantage */}
//       <section className="bg-white px-4 py-16">
//         <div className="mx-auto max-w-5xl">

//           <div className="mb-10 text-center">
//             <span className="text-xs font-bold uppercase tracking-[0.15em] text-secondary">
//               Why Tech Talk Hub
//             </span>

//             <h2 className="mt-2 text-3xl font-black text-slate-900">
//               The Tech Talk Advantage
//             </h2>

//             <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-secondary" />
//           </div>

//           <div className="grid gap-8 md:grid-cols-3">
//             <PlatformFeatureCard
//               icon="📊"
//               title="Unified Dashboard"
//               description="A personalized hub for students to track progress."
//               onClick={() => setActiveFeature("dashboard")}
//             />

//             <PlatformFeatureCard
//               icon="📝"
//               title="Automated Exams"
//               description="Real-time assessments that provide instant feedback."
//               onClick={() => setActiveFeature("exams")}
//             />

//             <PlatformFeatureCard
//               icon="🏆"
//               title="Gamified Rewards"
//               description="Earn XP and celebrate learning milestones."
//               onClick={() => setActiveFeature("results")}
//             />
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }
// 'use client';
// import { useState } from 'react';
// import CurriculumCard from './CurriculumCard';
// import PlatformFeatureCard from './PlatformFeatureCard';
// import LeadMagnetForm from './LeadMagnetForm';

// export default function CurriculumClientPage({ initialLevels }) {
//   const [showModal, setShowModal] = useState(false);
// const [activeFeature, setActiveFeature] = useState(null);
//   return (
//     <div className="bg-slate-50 min-h-screen">
//       <div className="max-w-6xl mx-auto pt-8 pb-12 px-4">
//        <div className="relative overflow-hidden bg-gradient-to-br from-white via-purple-50/30 to-purple-100/40">
//   <div className="mx-auto max-w-7xl px-6 pb-14 pt-14 text-center">

//     <span className="inline-flex rounded-full border border-purple-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-primary shadow-sm">
//       Premium Coding Pathways
//     </span>

//     <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
//       Learn. Build. Grow.{" "}
//       <span className="text-secondary">
//         One Stage at a Time.
//       </span>
//     </h1>

//     <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
//       Structured learning pathways designed to grow with every learner —
//       from their first line of code to advanced real-world projects.
//     </p>

//     <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">
//       Every learner begins with a placement assessment so they start at
//       the right challenge level.
//     </p>

//   </div>
// </div>
//         <p className="text-center text-slate-500 mb-10 text-sm max-w-2xl mx-auto italic">
//           Our roadmap is a guide, not a cage. Every student begins with a placement assessment to ensure they start at the right challenge level.
//         </p>
        
//         <div className="grid md:grid-cols-3 gap-6">
//           {initialLevels.map((level) => (
//             <CurriculumCard key={level._id} level={level} />
//           ))}
//         </div>
        
//         <div className="text-center mt-12 flex flex-col md:flex-row justify-center gap-4">
//           <a href="/book-class" className="bg-pink-600 text-white px-8 py-3 rounded-full font-bold hover:bg-pink-700 transition shadow-lg">
//             Book a Placement Assessment
//           </a>
//           <button 
//             onClick={() => setShowModal(true)} 
//             className="bg-white text-slate-800 px-8 py-3 rounded-full font-bold border-2 border-slate-200 hover:border-pink-600 transition shadow-sm"
//           >
//             Download Full Roadmap (PDF)
//           </button>
//         </div>
//       </div>

//       {showModal && (
//         <div 
//           className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
//           onClick={() => setShowModal(false)}
//         >
//           <div 
//             className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl relative"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <button 
//               onClick={() => setShowModal(false)}
//               className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl"
//             >
//               &times;
//             </button>

//             <h3 className="text-xl font-bold mb-4">Get the Roadmap PDF</h3>
//             <LeadMagnetForm onClose={() => setShowModal(false)} />
            
//             <button 
//               onClick={() => setShowModal(false)} 
//               className="mt-4 w-full text-sm text-gray-400 hover:text-gray-600"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}

// {activeFeature && (
//   <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setActiveFeature(null)}>
//     <div className="bg-white p-8 rounded-3xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
//       <h2 className="text-2xl font-bold mb-4 capitalize">{activeFeature} Preview</h2>
//       <div className="bg-slate-100 h-64 rounded-xl flex items-center justify-center mb-6">
//         {/* Replace this div with your <Image /> or illustration */}
//         <p className="text-slate-400">Illustration of {activeFeature} goes here</p>
//       </div>
//       <button onClick={() => setActiveFeature(null)} className="w-full bg-slate-900 text-white py-3 rounded-full font-bold">
//         Close
//       </button>
//     </div>
//   </div>
// )}
//       {/* The Tech Talk Advantage Section */}
//       <section className="py-16 px-4 bg-white">
//         <div className="max-w-5xl mx-auto">
//           <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
//             The Tech Talk Advantage
//             <div className="w-12 h-1 bg-pink-500 mx-auto mt-2 rounded-full"></div>
//           </h2>
          
//           <div className="grid md:grid-cols-3 gap-8">
          
//           <PlatformFeatureCard 
//   icon="📊" 
//   title="Unified Dashboard" 
//   description="A personalized hub for students to track progress." 
//   onClick={() => setActiveFeature('dashboard')}
// />
//             <PlatformFeatureCard 
//               icon="📝" 
//               title="Automated Exams" 
//               description="Real-time assessments that provide instant feedback." 
//               onClick={() => setActiveFeature('exams')}
//             />
//             <PlatformFeatureCard 
//               icon="🏆" 
//               title="Gamified Rewards" 
//               description="Earn XP and climb the leaderboard."
//               onClick={() => setActiveFeature('results')} 
//             />
//           </div>
//         </div>
//       </section>

//     </div>
//   );
// }