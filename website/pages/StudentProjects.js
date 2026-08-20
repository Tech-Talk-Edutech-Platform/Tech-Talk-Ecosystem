"use client";

import { useState } from "react";
import { ExternalLink, Code2, Sparkles, User, Award } from "lucide-react";

const studentProjects = [
  {
    id: 1,
    title: "Premier League Hub",
    student: "Coulibaly Oleg Arni Doutuan",
    grade: "Grade 10",
    category: "Website Development",
    description: "An interactive web platform tracking live match stats and league standings built with modern web technologies.",
    image: "/projects/premier-league.jpg", // Replace with actual project screenshot path
  },
  {
    id: 2,
    title: "Dance Party Animation",
    student: "Syeda Hiba Sikandar",
    grade: "Grade 3",
    category: "Animation & Scratch",
    description: "A vibrant, rhythmic interactive dance animation featuring custom sprite mechanics and synchronized music logic.",
    image: "/projects/dance-party.jpg",
  },
  {
    id: 3,
    title: "Knowing About Animals",
    student: "Megha Rae",
    grade: "Grade 6",
    category: "Interactive Quiz Game",
    description: "An educational quiz game designed to teach children about wildlife facts through block-based programming logic.",
    image: "/projects/animals.jpg",
  },
];

export default function StudentProjects() {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <section className="py-24 bg-background border-t border-gray-100 dark:border-gray-800/60 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary font-semibold text-xs uppercase tracking-widest mb-4 border border-secondary/20 shadow-sm">
            <Sparkles size={14} /> Student Showcase
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-text tracking-tight">
            See Amazing Projects <span className="text-secondary bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Created By Our Students</span>
          </h2>
          <p className="text-text/70 mt-4 text-base sm:text-lg">
            From interactive games to full web applications, see what young minds build after joining our hands-on coding classes.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {studentProjects.map((project) => (
            <div
              key={project.id}
              className="group bg-background border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-secondary/30 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Thumbnail Header Area */}
              <div className="relative h-48 bg-gradient-to-br from-secondary/10 via-primary/5 to-secondary/20 flex items-center justify-center p-6 overflow-hidden">
                <div className="absolute inset-0 bg-text/5 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center">
                  <Code2 size={48} className="text-secondary/40" />
                </div>
                <span className="absolute top-4 left-4 bg-background/90 backdrop-blur-md text-secondary text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-gray-100 dark:border-gray-800">
                  {project.category}
                </span>
              </div>

              {/* Content Area */}
              <div className="p-6 md:p-8 flex flex-col flex-grow justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-text/60">
                    <span className="flex items-center gap-1.5 text-secondary">
                      <User size={14} /> {project.student}
                    </span>
                    <span className="bg-text/5 px-2.5 py-1 rounded-md">{project.grade}</span>
                  </div>

                  <h3 className="text-xl font-bold text-text group-hover:text-secondary transition-colors">
                    {project.title}
                  </h3>

                  <p className="text-text/70 text-sm leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => alert(`Viewing live demo for ${project.title}`)}
                  className="w-full mt-auto bg-text/5 hover:bg-secondary hover:text-background text-text font-bold py-3 px-4 rounded-2xl text-sm transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                >
                  View Project <ExternalLink size={16} className="transition-transform group-hover/btn:translate-x-0.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
// import React from "react";
// import Image from "next/image";
// import { FaInfoCircle } from "react-icons/fa";

// const projects = [
//   {
//     id: 1,
//     name: "Coulibaly Oleg Arni Doutuan",
//     grade: "Grade 10",
//     type: "Website development",
//     title: "Premier league",
//     img: "/projects/premier_league.jpeg",
//     avatar: "/avatars/student1.jpeg",
//   },
//   {
//     id: 2,
//     name: "Syeda Hiba Sikandar",
//     grade: "Grade 3",
//     type: "Animation",
//     title: "Dance party",
//     img: "/projects/danceparty.jpeg",
//     avatar: "/avatars/student2.jpeg",
//   },
//   {
//     id: 3,
//     name: "Megha Rae",
//     grade: "Grade 6",
//     type: "Scratch",
//     title: "Knowing About Animals",
//     img: "/projects/animals.jpeg",
//     avatar: "/avatars/student3.jpeg",
//   },
// ];

// export default function StudentProjects() {
//   return (
//     <section className="bg-background py-16 px-6 md:px-20 font-poppins">
//       <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary">
//         See amazing projects{" "}
//         <span className="text-secondary">created by our students</span>
//       </h2>

//       {/* Grid layout */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//         {projects.map((p) => (
//           <div
//             key={p.id}
//             className="bg-white shadow-card rounded-xl overflow-hidden flex flex-col hover:shadow-lg transition duration-300"
//           >
//             {/* Project preview */}
//             <div className="relative w-full h-48">
//               <Image
//                 src={p.img}
//                 alt={p.title}
//                 fill
//                 sizes="(max-width: 768px) 100vw, 33vw"
//                 className="object-cover"
//               />
//               {/* Avatar bottom-left inside image container */}
//               <div className="absolute -bottom-6 left-4 z-10 w-16 h-16">
//                 <Image
//                   src={p.avatar}
//                   alt={p.name}
//                   fill
//                   sizes="64px"
//                   className="rounded-full border-4 border-white shadow-md object-cover"
//                 />
//               </div>
//             </div>

//             {/* Content */}
//             <div className="pt-10 pb-6 px-4 flex flex-col flex-1">
//               <p className="font-bold text-primary">{p.name}</p>
//               <p className="text-gray-500 text-sm mb-3">{p.grade}</p>

//               <p className="text-sm text-text">{p.type}</p>
//               <p className="font-semibold text-text flex items-center gap-1 mt-1">
//                 {p.title}
//                 <FaInfoCircle className="text-gray-400 text-sm" />
//               </p>

//               <button className="mt-6 bg-secondary text-white font-semibold py-2 rounded-xl shadow-btn hover:bg-primary transition w-full">
//                 View project
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }
// // import React from "react";
// // import { FaInfoCircle } from "react-icons/fa";

// // const projects = [
// //   {
// //     id: 1,
// //     name: "Coulibaly Oleg Arni Doutuan",
// //     grade: "Grade 10",
// //     type: "Website development",
// //     title: "Premier league",
// //     img: "/projects/premier_league.jpeg",
// //     avatar: "/avatars/student1.jpeg",
// //   },
// //   {
// //     id: 2,
// //     name: "Syeda Hiba Sikandar",
// //     grade: "Grade 3",
// //     type: "Animation",
// //     title: "Dance party",
// //     img: "/projects/danceparty.jpeg",
// //     avatar: "/avatars/student2.jpeg",
// //   },
// //   {
// //     id: 3,
// //     name: "Megha Rae",
// //     grade: "Grade 6",
// //     type: "Scratch",
// //     title: "Knowing About Animals",
// //     img: "/projects/animals.jpeg",
// //     avatar: "/avatars/student3.jpeg",
// //   },
// // ];

// // export default function StudentProjects() {
// //   return (
// //     <section className="bg-background py-16 px-6 md:px-20 font-poppins">
// //       <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary">
// //         See amazing projects{" "}
// //         <span className="text-secondary">created by our students</span>
// //       </h2>

// //       {/* Grid layout */}
// //       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
// //         {projects.map((p) => (
// //           <div
// //             key={p.id}
// //             className="bg-white shadow-card rounded-xl overflow-hidden flex flex-col hover:shadow-lg transition duration-300 h-full"
// //           >
// //             {/* Project preview */}
// //             <div className="relative">
// //               <img
// //                 src={p.img}
// //                 alt={p.title}
// //                 className="w-full h-48 object-cover"
// //               />
// //               {/* Avatar bottom-left inside image */}
// //               <div className="absolute -bottom-6 left-4">
// //                 <img
// //                   src={p.avatar}
// //                   alt={p.name}
// //                   className="w-16 h-16 rounded-full border-4 border-white shadow-md object-cover"
// //                 />
// //               </div>
// //             </div>

// //             {/* Content Container */}
// //             <div className="pt-10 pb-6 px-5 flex flex-col flex-grow">
// //               <div className="flex-grow">
// //                 <p className="font-bold text-primary text-base line-clamp-1">{p.name}</p>
// //                 <p className="text-gray-500 text-sm mb-3">{p.grade}</p>

// //                 <p className="text-xs font-semibold text-accent tracking-wider uppercase mb-0.5">{p.type}</p>
// //                 <p className="font-semibold text-text flex items-center gap-1.5 text-base">
// //                   {p.title}
// //                   <FaInfoCircle className="text-gray-400 text-sm flex-shrink-0" />
// //                 </p>
// //               </div>

// //               <button className="mt-6 bg-secondary text-white font-semibold py-2.5 rounded-xl shadow-btn hover:bg-primary transition w-full">
// //                 View project
// //               </button>
// //             </div>
// //           </div>
// //         ))}
// //       </div>
// //     </section>
// //   );
// // }