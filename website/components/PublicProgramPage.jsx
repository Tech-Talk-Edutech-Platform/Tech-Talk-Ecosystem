"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Sparkles,
} from "lucide-react";

import { supabase } from "../lib/supabase";

export default function PublicProgramPage({ slug }) {
  const [program, setProgram] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCourse, setOpenCourse] = useState(null);

  useEffect(() => {
    fetchProgram();
  }, [slug]);

  async function fetchProgram() {
    setLoading(true);

    // Get program
    const { data: programData, error: programError } =
      await supabase
        .from("programs")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

    if (programError) {
      console.error("Failed to load program:", programError);
      setLoading(false);
      return;
    }

    setProgram(programData);

    // Get courses attached to program
    const { data: links, error: linksError } =
      await supabase
        .from("program_courses")
        .select(`
          id,
          display_order,
          course:courses (
            id,
            title,
            description,
            thumbnail_url,
            duration_lessons,
            is_active
          )
        `)
        .eq("program_id", programData.id)
        .order("display_order", { ascending: true });

    if (linksError) {
      console.error("Failed to load program courses:", linksError);
      setLoading(false);
      return;
    }

    const activeCourses = (links || [])
      .map((item) => item.course)
      .filter((course) => course?.is_active);

    if (!activeCourses.length) {
      setCourses([]);
      setLoading(false);
      return;
    }

    // Fetch public phases for every course
    const courseIds = activeCourses.map((course) => course.id);

    const { data: phases, error: phaseError } =
      await supabase
        .from("course_phases")
        .select(`
          id,
          course_id,
          phase_number,
          title,
          focus
        `)
        .in("course_id", courseIds)
        .order("phase_number", { ascending: true });

    if (phaseError) {
      console.error("Failed to load phases:", phaseError);
    }

    const withPhases = activeCourses.map((course) => ({
      ...course,
      phases: (phases || []).filter(
        (phase) => phase.course_id === course.id
      ),
    }));

    setCourses(withPhases);

    if (withPhases.length) {
      setOpenCourse(withPhases[0].id);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <h1 className="text-3xl font-black text-slate-900">
          Program not found
        </h1>

        <Link
          href="/"
          className="mt-5 font-semibold text-primary"
        >
          Return Home →
        </Link>
      </div>
    );
  }

  return (
    <main className="bg-white">

      {/* ===================================================
          HERO
      ==================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-purple-50/40 to-purple-100/60 pt-28">
        <div className="pointer-events-none absolute -right-32 top-10 h-[420px] w-[420px] rounded-full bg-purple-300/20 blur-[110px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 pb-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">

          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-primary shadow-sm">
              <Sparkles size={14} />
              {program.age_range}
            </span>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-[3.5rem]">
              {program.name}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              {program.description}
            </p>

            <div className="mt-7 flex flex-wrap gap-5 text-sm font-semibold text-slate-600">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-primary" />
                Expert-led learning
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-primary" />
                Hands-on projects
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-primary" />
                Personalized progress
              </span>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/book-class"
                className="inline-flex items-center gap-2 rounded-xl bg-secondary px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-secondary/20 transition hover:-translate-y-0.5"
              >
                Book a Free Trial
                <ArrowRight size={16} />
              </Link>

              <a
                href="#curriculum"
                className="rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-purple-50"
              >
                Explore Curriculum
              </a>
            </div>
          </div>

          {/* Right visual */}
          <div className="relative mx-auto flex w-full max-w-lg items-center justify-center">
            <div className="absolute h-[300px] w-[300px] rounded-full bg-purple-300/20 blur-[80px]" />

            <div className="relative flex min-h-[300px] w-full flex-col justify-center rounded-[32px] border border-white/80 bg-white/75 p-8 shadow-2xl shadow-purple-900/10 backdrop-blur-xl">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary">
                Learning Journey
              </p>

              <h2 className="mt-3 text-2xl font-black text-slate-900">
                Learn → Build → Create
              </h2>

              <div className="mt-6 space-y-4">
                <JourneyItem
                  number="01"
                  text="Build strong foundations"
                />
                <JourneyItem
                  number="02"
                  text="Practice through projects"
                />
                <JourneyItem
                  number="03"
                  text="Progress to real-world skills"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          COURSES + PHASES
      ==================================================== */}
      <section
        id="curriculum"
        className="scroll-mt-24 bg-slate-50 py-16 md:py-20"
      >
        <div className="mx-auto max-w-6xl px-6">

          <div className="mx-auto mb-10 max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-secondary">
              Curriculum
            </span>

            <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
              Courses Inside This Program
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Explore the courses and learning phases your child can
              progress through. Full lesson content is available to
              enrolled learners.
            </p>
          </div>

          {courses.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-slate-300" />

              <h3 className="mt-4 font-bold text-slate-700">
                Curriculum coming soon
              </h3>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => {
                const isOpen = openCourse === course.id;

                return (
                  <div
                    key={course.id}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                  >
                    {/* Course Header */}
                    <button
                      type="button"
                      onClick={() =>
                        setOpenCourse(
                          isOpen ? null : course.id
                        )
                      }
                      className="flex w-full items-center gap-5 p-5 text-left sm:p-6"
                    >
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-purple-50">
                        {course.thumbnail_url ? (
                          <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <BookOpen
                            size={22}
                            className="text-primary"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-secondary">
                          Course
                        </p>

                        <h3 className="mt-1 text-xl font-extrabold text-slate-900">
                          {course.title}
                        </h3>

                        {course.description && (
                          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                            {course.description}
                          </p>
                        )}
                      </div>

                      <ChevronDown
                        size={20}
                        className={`shrink-0 text-slate-400 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Phases */}
                    {isOpen && (
                      <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
                        {course.phases?.length ? (
                          <div className="grid gap-3 md:grid-cols-2">
                            {course.phases.map(
                              (phase, index) => (
                                <div
                                  key={phase.id}
                                  className="rounded-2xl border border-slate-200 bg-white p-5"
                                >
                                  <div className="flex items-start gap-4">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-xs font-black text-primary">
                                      {String(
                                        phase.phase_number ||
                                          index + 1
                                      ).padStart(2, "0")}
                                    </div>

                                    <div>
                                      <h4 className="font-bold text-slate-900">
                                        {phase.title}
                                      </h4>

                                      {phase.focus && (
                                        <p className="mt-1 text-sm leading-6 text-slate-500">
                                          {phase.focus}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400">
                            Phases coming soon.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Locked content note */}
          <div className="mt-10 rounded-3xl border border-purple-100 bg-purple-50/60 p-6 text-center">
            <p className="font-bold text-slate-900">
              Lessons, projects, quizzes and learning resources are
              available inside the student dashboard.
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Start with a free trial to find the right learning path.
            </p>

            <Link
              href="/book-class"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white"
            >
              Book a Free Trial
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function JourneyItem({ number, text }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-xs font-black text-primary">
        {number}
      </span>

      <span className="text-sm font-bold text-slate-700">
        {text}
      </span>
    </div>
  );
}