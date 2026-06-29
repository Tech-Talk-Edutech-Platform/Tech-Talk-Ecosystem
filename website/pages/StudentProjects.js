import React from "react";
import Image from "next/image";
import { FaInfoCircle } from "react-icons/fa";

const projects = [
  {
    id: 1,
    name: "Coulibaly Oleg Arni Doutuan",
    grade: "Grade 10",
    type: "Website development",
    title: "Premier league",
    img: "/projects/premier_league.jpeg",
    avatar: "/avatars/student1.jpeg",
  },
  {
    id: 2,
    name: "Syeda Hiba Sikandar",
    grade: "Grade 3",
    type: "Animation",
    title: "Dance party",
    img: "/projects/danceparty.jpeg",
    avatar: "/avatars/student2.jpeg",
  },
  {
    id: 3,
    name: "Megha Rae",
    grade: "Grade 6",
    type: "Scratch",
    title: "Knowing About Animals",
    img: "/projects/animals.jpeg",
    avatar: "/avatars/student3.jpeg",
  },
];

export default function StudentProjects() {
  return (
    <section className="bg-background py-16 px-6 md:px-20 font-poppins">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-primary">
        See amazing projects{" "}
        <span className="text-secondary">created by our students</span>
      </h2>

      {/* Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {projects.map((p) => (
          <div
            key={p.id}
            className="bg-white shadow-card rounded-xl overflow-hidden flex flex-col hover:shadow-lg transition duration-300"
          >
            {/* Project preview */}
            <div className="relative w-full h-48">
              <Image
                src={p.img}
                alt={p.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
              {/* Avatar bottom-left inside image container */}
              <div className="absolute -bottom-6 left-4 z-10 w-16 h-16">
                <Image
                  src={p.avatar}
                  alt={p.name}
                  fill
                  sizes="64px"
                  className="rounded-full border-4 border-white shadow-md object-cover"
                />
              </div>
            </div>

            {/* Content */}
            <div className="pt-10 pb-6 px-4 flex flex-col flex-1">
              <p className="font-bold text-primary">{p.name}</p>
              <p className="text-gray-500 text-sm mb-3">{p.grade}</p>

              <p className="text-sm text-text">{p.type}</p>
              <p className="font-semibold text-text flex items-center gap-1 mt-1">
                {p.title}
                <FaInfoCircle className="text-gray-400 text-sm" />
              </p>

              <button className="mt-6 bg-secondary text-white font-semibold py-2 rounded-xl shadow-btn hover:bg-primary transition w-full">
                View project
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
// import React from "react";
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
//             className="bg-white shadow-card rounded-xl overflow-hidden flex flex-col hover:shadow-lg transition duration-300 h-full"
//           >
//             {/* Project preview */}
//             <div className="relative">
//               <img
//                 src={p.img}
//                 alt={p.title}
//                 className="w-full h-48 object-cover"
//               />
//               {/* Avatar bottom-left inside image */}
//               <div className="absolute -bottom-6 left-4">
//                 <img
//                   src={p.avatar}
//                   alt={p.name}
//                   className="w-16 h-16 rounded-full border-4 border-white shadow-md object-cover"
//                 />
//               </div>
//             </div>

//             {/* Content Container */}
//             <div className="pt-10 pb-6 px-5 flex flex-col flex-grow">
//               <div className="flex-grow">
//                 <p className="font-bold text-primary text-base line-clamp-1">{p.name}</p>
//                 <p className="text-gray-500 text-sm mb-3">{p.grade}</p>

//                 <p className="text-xs font-semibold text-accent tracking-wider uppercase mb-0.5">{p.type}</p>
//                 <p className="font-semibold text-text flex items-center gap-1.5 text-base">
//                   {p.title}
//                   <FaInfoCircle className="text-gray-400 text-sm flex-shrink-0" />
//                 </p>
//               </div>

//               <button className="mt-6 bg-secondary text-white font-semibold py-2.5 rounded-xl shadow-btn hover:bg-primary transition w-full">
//                 View project
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }