import Link from "next/link";

import {
  ArrowRight,
  Code2,
  Globe2,
  Sparkles,
} from "lucide-react";

export default function AboutHighlight() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-purple-100 bg-gradient-to-br from-[#F8F5FF] via-white to-[#FFF3F8] px-6 py-12 shadow-sm sm:px-10 lg:px-14 lg:py-14">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-purple-300/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-28 right-0 h-72 w-72 rounded-full bg-pink-300/20 blur-3xl" />

      <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Main content */}
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/90 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-primary shadow-sm">
            <Sparkles className="h-4 w-4 text-secondary" />

            Who We Are
          </div>

          <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-[2.8rem]">
            Helping young Africans become{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              creators of technology.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg lg:mx-0">
            Tech Talk Hub is an online education company
            helping children and teenagers build practical
            coding skills through live, personalized and
            hands-on lessons.
          </p>

          <Link
            href="/about"
            className="group mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-7 py-3.5 font-bold text-white shadow-lg shadow-pink-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-pink-600 hover:shadow-xl"
          >
            Discover Our Story

            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Highlights */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-2xl border border-white/80 bg-white/85 p-5 shadow-md shadow-purple-900/5 backdrop-blur">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-primary">
              <Code2 className="h-5 w-5" />
            </span>

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              Practical Learning
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Learners create games, websites, applications
              and real-world technology projects.
            </p>
          </div>

          <div className="rounded-2xl border border-white/80 bg-white/85 p-5 shadow-md shadow-purple-900/5 backdrop-blur">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-100 text-secondary">
              <Globe2 className="h-5 w-5" />
            </span>

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              Built for Africa
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Flexible online learning designed to make
              quality technology education more accessible.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
// "use client"; // Marked client side since it handles user clicks

// import { useRouter } from "next/navigation";

// export default function AboutHighlight() {
//   const router = useRouter();

//   return (
//     <section className="py-8 px-3 md:px-20 text-center bg-white text-text font-poppins">
//       <h2 className="text-3xl font-bold text-primary mb-4">Who We Are</h2>
//       <p className="max-w-2xl mx-auto mb-6 text-lg">
//         We’re an online edtech company empowering Africa’s next generation of digital creators through fun, hands-on coding lessons for kids and teens.
//       </p>
//       <button
//         onClick={() => router.push("/about")}
//         className="bg-secondary text-white px-6 py-3 rounded-xl shadow-btn hover:bg-primary transition"
//       >
//         Learn More →
//       </button>
//     </section>
//   );
// }