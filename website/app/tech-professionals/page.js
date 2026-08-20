"use client";

import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  Code2,
  Database,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import ProgramShop from "../../components/ProgramShop";

export default function TechProfessionalsPage() {
  return (
    <main className="min-h-screen bg-white text-[#101936]">

      {/* =========================
          TECH PROFESSIONALS HERO
      ========================== */}
      <section className="relative overflow-hidden border-b border-purple-100">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-indigo-100/60" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-2 lg:px-8 lg:py-20">

          {/* LEFT */}
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary shadow-sm">
              <Sparkles size={14} />
              Tech Professionals
            </span>

            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem]">
              Learn deeper.
              <br />

              <span className="bg-gradient-to-r from-primary via-indigo-600 to-secondary bg-clip-text text-transparent">
                Build professionally.
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600">
              Advanced coding resources, project tools and technology
              materials for young developers ready to build real-world
              skills and prepare for the future of technology.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#tech-professional-products"
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
            <div className="absolute h-[300px] w-[300px] rounded-full bg-indigo-400/20 blur-3xl" />

            <div className="relative flex h-[270px] w-[270px] items-center justify-center rounded-full border border-indigo-100 bg-white shadow-2xl">

              {/* Main Icon */}
              <div className="flex h-40 w-40 items-center justify-center rounded-[35px] bg-gradient-to-br from-slate-950 via-indigo-950 to-primary text-white shadow-xl">
                <Code2 size={75} />
              </div>

              {/* Floating Icons */}
              <div className="absolute -left-6 top-10 rounded-2xl bg-white p-4 shadow-xl">
                <Database
                  className="text-secondary"
                  size={28}
                />
              </div>

              <div className="absolute -right-5 bottom-12 rounded-2xl bg-white p-4 shadow-xl">
                <BrainCircuit
                  className="text-primary"
                  size={28}
                />
              </div>

              <div className="absolute right-3 top-0 rounded-2xl bg-white p-3 shadow-xl">
                <ShieldCheck
                  className="text-emerald-500"
                  size={25}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          TECH PROFESSIONALS SHOP
      ========================== */}
      <div id="tech-professional-products">
        <ProgramShop
          program="tech-professionals"
          title="Tech Professionals Collection"
          subtitle="Tools for serious young creators."
          searchPlaceholder="Search Tech Professionals..."
        />
      </div>

      {/* =========================
          CTA
      ========================== */}
      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-900 to-primary px-7 py-9 text-white md:flex md:items-center md:justify-between md:px-10">

            <div>
              <p className="text-sm font-bold text-white/70">
                BUILD REAL-WORLD SKILLS
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Ready to take technology seriously?
              </h2>

              <p className="mt-2 max-w-xl text-sm text-white/80">
                Join Tech Professionals and develop advanced skills
                through practical projects, modern technologies and
                real-world problem solving.
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