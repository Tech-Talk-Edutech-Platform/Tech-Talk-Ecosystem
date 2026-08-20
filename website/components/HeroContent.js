"use client";

import Link from "next/link";
import { CheckCircle2, Sparkles, ArrowRight } from "lucide-react";

export default function HeroContent() {
  const benefits = [
    "Learn from the comfort of home",
    "1-on-1 sessions with expert mentors",
    "Personalized learning paths",
    "Flexible scheduling from anywhere",
  ];

  return (
    <div className="mx-auto w-full max-w-xl text-center md:mx-0 md:text-left">

      {/* Badge */}
      <div className="-mt-3 mb-4 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/70 px-4 py-2 text-sm font-semibold text-primary shadow-sm backdrop-blur">
        <Sparkles className="h-4 w-4 text-secondary" />
        <span>Live, Personalized Online Coding Classes</span>
      </div>

      {/* Heading */}
      <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-primary sm:text-5xl lg:text-[3rem] xl:text-[3.5rem]">
        Turning Young Minds Into{" "}
        <span className="text-secondary">Creators.</span>
      </h1>

      {/* Description */}
      <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-slate-600 md:mx-0">
        Expert-led coding classes for kids aged{" "}
        <span className="font-semibold text-primary">5–17</span> — building
        skills, confidence and creativity.
      </p>

      {/* Benefits */}
      <div className="mx-auto mt-5 grid max-w-lg gap-2.5 text-left md:mx-0">
        {benefits.map((item) => (
          <div key={item} className="flex items-center gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </span>

            <span className="text-base font-medium text-slate-700">
              {item}
            </span>
          </div>
        ))}
      </div>

      {/* CTA Buttons */}
      <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row md:justify-start">
        <Link
          href="/book-class"
          className="group inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-7 py-3.5 font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
        >
          Book a Free Trial
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>

        <Link
          href="/courses"
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white/70 px-7 py-3.5 font-semibold text-primary transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
        >
          Explore Courses
        </Link>
      </div>

      {/* Trust Note */}
      <p className="mt-4 text-sm text-slate-500">
        ✓ No commitment required
        <span className="mx-2">•</span>
        Start with a free trial
      </p>
    </div>
  );
}
// "use client";

// import Link from "next/link";
// import { CheckCircle2, Sparkles, ArrowRight } from "lucide-react";

// export default function HeroContent() {
//   const benefits = [
//     "Learn from the comfort of home",
//     "1-on-1 sessions with expert mentors",
//     "Personalized learning paths",
//     "Flexible scheduling from anywhere",
//   ];

//   return (
//     <div className="mx-auto w-full max-w-xl text-center md:mx-0 md:text-left">

//       {/* Badge */}
//       <div className="-mt-6 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/70 px-4 py-2 text-sm font-semibold text-primary shadow-sm backdrop-blur">
//         <Sparkles className="h-4 w-4 text-secondary" />
//         <span>Live, Personalized Online Coding Classes</span>
//       </div>

//       {/* Heading */}
//       <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-primary sm:text-5xl lg:text-[3rem] xl:text-[3.5rem]">
//         Turning Young Minds Into{" "}
//         <span className="text-secondary">Creators.</span>
//       </h1>

//       {/* Description */}
//       <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-slate-600 md:mx-0">
//         Expert-led coding classes for kids aged{" "}
//         <span className="font-semibold text-primary">5–17</span> — building
//         skills, confidence and creativity.
//       </p>

//       {/* Benefits */}
//       <div className="mx-auto mt-5 grid max-w-lg gap-2.5 text-left md:mx-0">
//         {benefits.map((item) => (
//           <div key={item} className="flex items-center gap-3">
//             <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100">
//               <CheckCircle2 className="h-4 w-4 text-primary" />
//             </span>

//             <span className="text-base font-medium text-slate-700">
//               {item}
//             </span>
//           </div>
//         ))}
//       </div>

//       {/* CTA Buttons */}
//       <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row md:justify-start">
//         <Link
//           href="/book-class"
//           className="group inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-7 py-3.5 font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
//         >
//           Book a Free Trial
//           <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
//         </Link>

//         <Link
//           href="/courses"
//           className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white/70 px-7 py-3.5 font-semibold text-primary transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
//         >
//           Explore Courses
//         </Link>
//       </div>

//       {/* Trust Note */}
//       <p className="mt-2 text-sm text-slate-500">
//         ✓ No commitment required
//         <span className="mx-2">•</span>
//         Start with a free trial
//       </p>
//     </div>
//   );
// }
// // "use client";

// // import Link from "next/link";
// // import { CheckCircle2, Sparkles, ArrowRight } from "lucide-react";

// // export default function HeroContent() {
// //   return (
// //     <div className="mx-auto max-w-xl text-center md:mx-0 md:text-left">

// //       {/* Small badge */}

// //     <div className="-mt-30 mb-3 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/70 px-4 py-2 text-sm font-semibold text-primary shadow-sm backdrop-blur">
       
// //         <Sparkles className="h-4 w-4 text-secondary" />
// //         Live, Personalized Online Coding Classes
// //       </div>

// //       {/* Heading */}
// //       {/*<h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-primary sm:text-5xl lg:text-5xl"> */}
// //       <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-primary sm:text-5xl lg:text-[3rem] xl:text-[3.5rem]">
// //         Unlock your child&apos;s
// //         <span className="block">
// //           potential with{" "}
// //           <span className="text-secondary">expert-led </span>
// //             coding classes
// //         </span>
       
// //       </h1>

// //       {/* Subtitle */}
// //       <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-slate-600 md:mx-0">
// //         Fun, focused and personalized learning that helps kids aged{" "}
// //         <span className="font-semibold text-primary">5–17</span> build real
// //         coding skills and confidence.
// //       </p>

// //       {/* Benefits */}
// //       <div className="mx-auto mt-6 grid max-w-lg gap-3 text-left md:mx-0">
// //         {[
// //           "Learn from the comfort of home",
// //           "1-on-1 sessions with expert mentors",
// //           "Personalized learning paths",
// //           "Flexible scheduling from anywhere",
// //         ].map((item) => (
// //           <div key={item} className="flex items-center gap-3">
// //             <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100">
// //               <CheckCircle2 className="h-4 w-4 text-primary" />
// //             </span>

// //             <span className="text-base font-medium text-slate-700">
// //               {item}
// //             </span>
// //           </div>
// //         ))}
// //       </div>

// //       {/* CTA */}
// //       <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row md:justify-start">
// //         <Link
// //           href="/book-class"
// //           className="group inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-7 py-3.5 font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
// //         >
// //           Book a Free Trial
// //           <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
// //         </Link>

// //         <Link
// //           href="/courses"
// //           className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white/70 px-7 py-3.5 font-semibold text-primary transition hover:bg-white hover:shadow-md"
// //         >
// //           Explore Courses
// //         </Link>
// //       </div>

// //       {/* Trust note */}
// //       <p className="mt-5 text-sm text-slate-500">
// //         ✓ No commitment required &nbsp; • &nbsp; Start with a free trial
// //       </p>
// //     </div>
// //   );
// // }
// // // "use client";

// // // import Link from "next/link";

// // // export default function HeroContent() {
// // //   return (
// // //     <div className="md:max-w-lg text-center md:text-left">
// // //       <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">
// // //         Unlock your child’s potential with{" "}
// // //         <span className="text-secondary">expert-led</span> coding classes
// // //       </h1>
// // //       <p className="text-text text-lg mb-2">
// // //         Live, personalized online sessions for kids aged 5–17:
// // //       </p>
// // //       <ul className="text-text text-base mb-6 space-y-2 list-inside text-left inline-block md:block">
// // //         <li>💻 Learn from the comfort of home</li>
// // //         <li>🎓 1-on-1 sessions with expert mentors</li>
// // //         <li>🤖 AI-powered, adaptive learning paths</li>
// // //         <li>📅 Flexible scheduling from anywhere</li>
// // //       </ul>
// // //       <div>
// // //         <Link href="/book-class">
// // //           <button className="bg-secondary text-background px-6 py-3 rounded-xl font-bold shadow-btn hover:bg-secondary-dark transition">
// // //             Book a Free Trial
// // //           </button>
// // //         </Link>
// // //       </div>
// // //     </div>
// // //   );
// // // }