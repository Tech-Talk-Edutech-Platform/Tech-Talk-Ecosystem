import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { urlFor } from "../lib/sanity";

export default function CurriculumCard({ level }) {
  const getHref = () => {
    const title = (level.title || "").toLowerCase();

    if (title.includes("junior")) {
      return "/courses/junior-coders";
    }

    if (title.includes("future")) {
      return "/courses/future-developers";
    }

    if (title.includes("tech professional")) {
      return "/courses/tech-professionals";
    }

    return "/book-class";
  };

  return (
    <Link
      href={getHref()}
      className="group flex h-full flex-col rounded-3xl border border-slate-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-purple-200 hover:shadow-xl"
    >
      {/* Icon */}
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 transition group-hover:bg-purple-50">
        {level.levelImage && (
          <img
            src={urlFor(level.levelImage)
              .width(128)
              .height(128)
              .fit("crop")
              .url()}
            alt={level.title || "Coding program"}
            className="h-9 w-9 object-contain"
          />
        )}
      </div>

      {/* Tags */}
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600">
          {level.difficultyLevel || "Beginner"}
        </span>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
          {level.duration || "Flexible"}
        </span>
      </div>

      {/* Title */}
      <h3 className="mb-3 text-2xl font-extrabold text-slate-900 transition group-hover:text-primary">
        {level.title || "Learning Path"}
      </h3>

      {/* Description */}
      <p className="mb-6 flex-grow text-sm leading-relaxed text-slate-500">
        {level.description || "No description provided."}
      </p>

      {/* Skills */}
      <div className="mb-6">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Key Skills
        </p>

        <div className="flex flex-wrap gap-2">
          {(level.skills || []).slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-secondary">
          Explore Program
        </p>

        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50 text-primary transition group-hover:bg-primary group-hover:text-white">
          <ArrowRight size={15} />
        </span>
      </div>
    </Link>
  );
}
// import Link from "next/link";
// import { ArrowRight } from "lucide-react";
// import { urlFor } from "../lib/sanity";

// export default function CurriculumCard({ level }) {
//   const getHref = () => {
//     const title = (level.title || "").toLowerCase();

//     if (title.includes("junior")) {
//       return "/courses/junior-coders";
//     }

//     if (title.includes("future")) {
//       return "/courses/future-developers";
//     }

//     if (title.includes("tech professional")) {
//       return "/courses/tech-professionals";
//     }

//     return "/book-class";
//   };

//   return (
//     <Link
//       href={getHref()}
//       className="group flex flex-col rounded-3xl border border-slate-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-purple-200 hover:shadow-xl"
//     >
//       {/* Icon */}
//       <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 transition group-hover:bg-purple-50">
//         {level.levelImage && (
//           <img
//             src={urlFor(level.levelImage)
//               .width(128)
//               .height(128)
//               .fit("crop")
//               .url()}
//             alt={level.title || "Coding program"}
//             className="h-9 w-9 object-contain"
//           />
//         )}
//       </div>

//       {/* Tags */}
//       <div className="mb-4 flex flex-wrap gap-2">
//         <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600">
//           {level.difficultyLevel || "Beginner"}
//         </span>

//         <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
//           {level.duration || "Flexible"}
//         </span>
//       </div>

//       {/* Title */}
//       <h3 className="mb-3 text-2xl font-extrabold text-slate-900 transition group-hover:text-primary">
//         {level.title || "Untitled Track"}
//       </h3>

//       {/* Description */}
//       <p className="mb-6 flex-grow text-sm leading-relaxed text-slate-500">
//         {level.description || "No description provided."}
//       </p>

//       {/* Skills */}
//       <div className="mb-6">
//         <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
//           Key Skills
//         </p>

//         <div className="flex flex-wrap gap-2">
//           {(level.skills || []).slice(0, 4).map((skill) => (
//             <span
//               key={skill}
//               className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600"
//             >
//               {skill}
//             </span>
//           ))}
//         </div>
//       </div>

//       {/* Footer */}
//       <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-5">
//         <p className="text-[11px] font-bold uppercase tracking-wider text-secondary">
//           {level.activityCount
//             ? `${level.activityCount}+ Hands-on Activities`
//             : "Customized Learning"}
//         </p>

//         <span className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50 text-primary transition group-hover:bg-primary group-hover:text-white">
//           <ArrowRight size={15} />
//         </span>
//       </div>
//     </Link>
//   );
// }