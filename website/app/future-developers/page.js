"use client";

import Link from "next/link";
import {
  ArrowRight,
  Braces,
  Code2,
  Cpu,
  Rocket,
  Sparkles,
} from "lucide-react";

import ProgramShop from "../../components/ProgramShop";

export default function FutureDevelopersPage() {
  return (
    <main className="min-h-screen bg-white text-[#101936]">

      {/* =========================
          FUTURE DEVELOPERS HERO
      ========================== */}

      <section className="relative overflow-hidden border-b border-purple-100">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-indigo-50/40 to-purple-100/60" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-2 lg:px-8 lg:py-20">

          {/* LEFT */}
          <div className="max-w-xl">

            <span className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary shadow-sm">
              <Sparkles size={14} />
              Future Developers
            </span>

            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem]">
              Build ideas.
              <br />

              <span className="bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
                Create the future.
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600">
              Coding books, developer kits, projects and creative
              technology resources designed for young learners ready
              to move from exploring technology to building with it.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">

              <a
                href="#future-developer-products"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20"
              >
                Explore Resources
                <ArrowRight size={16} />
              </a>

              <Link
                href="/book-class"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-purple-300 hover:bg-purple-50"
              >
                Book a Free Trial
              </Link>

            </div>

          </div>


          {/* RIGHT */}
          <div className="relative hidden min-h-[300px] items-center justify-center md:flex">

            <div className="absolute h-[300px] w-[300px] rounded-full bg-indigo-300/20 blur-3xl" />

            <div className="relative flex h-[270px] w-[270px] items-center justify-center rounded-full border border-purple-100 bg-white shadow-2xl">

              {/* Main developer icon */}
              <div className="flex h-40 w-40 items-center justify-center rounded-[35px] bg-gradient-to-br from-indigo-950 via-primary to-purple-700 text-white shadow-xl">
                <Code2 size={75} />
              </div>

              {/* Floating icons */}

              <div className="absolute -left-6 top-10 rounded-2xl bg-white p-4 shadow-xl">
                <Braces
                  className="text-secondary"
                  size={28}
                />
              </div>

              <div className="absolute -right-5 bottom-12 rounded-2xl bg-white p-4 shadow-xl">
                <Cpu
                  className="text-primary"
                  size={28}
                />
              </div>

              <div className="absolute right-3 top-0 rounded-2xl bg-white p-3 shadow-xl">
                <Rocket
                  className="text-orange-500"
                  size={25}
                />
              </div>

            </div>

          </div>

        </div>
      </section>


      {/* =========================
          FUTURE DEVELOPERS SHOP
      ========================== */}

      <div id="future-developer-products">

        <ProgramShop
          program="future-developers"
          title="Future Developers Collection"
          subtitle="Build. Experiment. Create."
          searchPlaceholder="Search Future Developers..."
        />

      </div>


      {/* =========================
          CTA
      ========================== */}

      <section className="pb-16">

        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-primary to-secondary px-7 py-9 text-white md:flex md:items-center md:justify-between md:px-10">

            <div>

              <p className="text-sm font-bold text-white/70">
                GO BEYOND THE BASICS
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Ready to start building real projects?
              </h2>

              <p className="mt-2 max-w-xl text-sm text-white/80">
                Join Future Developers and learn to build with Python,
                web technologies, game development and more.
              </p>

            </div>

            <Link
              href="/book-class"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-primary shadow-lg md:mt-0"
            >
              Book a Free Trial
              <ArrowRight size={16} />
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}