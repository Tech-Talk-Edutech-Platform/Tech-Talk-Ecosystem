import React, { useEffect, useState } from "react";
import {
  BookOpen,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Circle,
  Layers,
  AlertCircle,
  FileText,
  Sparkles
} from "lucide-react";
import { supabase } from "../../../supabase";
import toast from "react-hot-toast";

export default function StudentCoursesView({ userId, courseId }) {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [activeCourse, setActiveCourse] = useState(null);

  // Structured Phase -> Lessons state
  const [phases, setPhases] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());

  // Track open/collapsed phases by phase ID
  const [openPhases, setOpenPhases] = useState({});

  // Quiz state for active lesson
  const [lessonQuiz, setLessonQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // Homework state for active lesson
  const [lessonAssignment, setLessonAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submittingHomework, setSubmittingHomework] = useState(false);
  const [homeworkOpen, setHomeworkOpen] = useState(false);

  // Overall student homework stats for sidebar
  const [homeworkStats, setHomeworkStats] = useState({
    pending: 0,
    submitted: 0,
    needs_revision: 0,
    completed: 0,
  });

  useEffect(() => {
    if (userId) {
      initialLoad();
      fetchHomeworkStats();
    }
  }, [userId, courseId]);

  useEffect(() => {
    if (selectedLesson) {
      setLessonQuiz(null);
      setQuizAnswers({});
      setQuizResult(null);
      setLessonAssignment(null);
      setSubmissionText("");
      setHomeworkOpen(false);
      fetchLessonData(selectedLesson.id);
      fetchLessonHomework(selectedLesson.id);
    }
  }, [selectedLesson?.id]);

  const initialLoad = async () => {
    try {
      setLoading(true);

      // Support multiple course enrollments via student_enrollments table
      const { data: enrollments, error: enrollError } = await supabase
        .from("student_enrollments")
        .select("course_id, courses (*)")
        .eq("student_id", userId);

      if (enrollError) throw enrollError;

      let assignedCourses = (enrollments || []).map((e) => e.courses).filter(Boolean);

      // Fallback check if student_enrollments is empty but assigned_course_id exists on user table
      if (assignedCourses.length === 0) {
        const { data: userData } = await supabase
          .from("users")
          .select("assigned_course_id, courses:assigned_course_id (*)")
          .eq("id", userId)
          .single();

        if (userData?.courses) {
          assignedCourses = [userData.courses];
        }
      }

      setCourses(assignedCourses);

      const defaultCourse = assignedCourses[0] || null;
      setActiveCourse(defaultCourse);

      if (defaultCourse) {
        const completedIds = await fetchLessonProgress();
        await fetchCourseSyllabus(defaultCourse.id, completedIds);
      }
    } catch (err) {
      console.error("Error fetching student data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHomeworkStats = async () => {
    try {
      const { data, error } = await supabase
        .from("student_assignments")
        .select("status")
        .eq("student_id", userId);

      if (error) throw error;

      const stats = {
        pending: 0,
        submitted: 0,
        needs_revision: 0,
        completed: 0,
      };

      (data || []).forEach((item) => {
        const st = item.status || "pending";
        if (stats[st] !== undefined) {
          stats[st]++;
        } else if (st === "pending") {
          stats.pending++;
        }
      });

      setHomeworkStats(stats);
    } catch (err) {
      console.error("Error fetching homework stats:", err.message);
    }
  };

  const fetchLessonProgress = async () => {
    try {
      const { data: progressData, error } = await supabase
        .from("student_lesson_progress")
        .select("lesson_id, status")
        .eq("student_id", userId)
        .eq("status", "completed");

      if (error) throw error;

      const completedSet = new Set(progressData.map((p) => p.lesson_id));
      setCompletedLessonIds(completedSet);
      return completedSet;
    } catch (err) {
      console.error("Error fetching progress:", err.message);
      return new Set();
    }
  };

  const fetchCourseSyllabus = async (targetCourseId, completedIds = completedLessonIds) => {
    try {
      const { data: phaseData, error } = await supabase
        .from("course_phases")
        .select(`
          id,
          phase_number,
          title,
          focus,
          course_lessons (
            id,
            title,
            position,
            created_at
          )
        `)
        .eq("course_id", targetCourseId)
        .order("phase_number", { ascending: true });

      if (error) throw error;

      const { data: notesData } = await supabase
        .from("notes")
        .select("*")
        .eq("course_id", targetCourseId);

      const structuredPhases = (phaseData || []).map((phase) => ({
        ...phase,
        course_lessons: (phase.course_lessons || [])
          .sort((a, b) => (a.position || 0) - (b.position || 0))
          .map((lesson) => {
            const matchingNote = (notesData || []).find(
              (n) => n.lesson_id === lesson.id || (n.title && n.title.toLowerCase() === lesson.title.toLowerCase())
            );
            return {
              ...lesson,
              content: matchingNote?.content || "",
              video_url: matchingNote?.video_url || ""
            };
          })
      }));

      setPhases(structuredPhases);

      const activePhase =
        structuredPhases.find((phase) =>
          phase.course_lessons?.some((lesson) => !completedIds.has(lesson.id))
        ) || structuredPhases[0];

      const initialOpenState = {};
      structuredPhases.forEach((p) => {
        initialOpenState[p.id] = p.id === activePhase?.id;
      });

      setOpenPhases(initialOpenState);

      const firstIncompleteLesson =
        activePhase?.course_lessons?.find((l) => !completedIds.has(l.id)) ||
        activePhase?.course_lessons?.[0] ||
        null;

      setSelectedLesson(firstIncompleteLesson);
    } catch (err) {
      console.error("Error fetching syllabus:", err.message);
    }
  };

  const fetchLessonHomework = async (lessonId) => {
    try {
      const { data, error } = await supabase
        .from("student_assignments")
        .select("*")
        .eq("student_id", userId)
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (error) throw error;
      setLessonAssignment(data || null);
      setSubmissionText(data?.submission_link || "");
    } catch (err) {
      console.error("Error fetching lesson homework:", err.message);
    }
  };

  const fetchLessonData = async (lessonId) => {
    try {
      const { data: quizData, error: qErr } = await supabase
        .from("quizzes")
        .select("*, quiz_questions(*)")
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (qErr) throw qErr;
      setLessonQuiz(quizData || null);

      if (quizData) {
        const { data: attempts, error: attErr } = await supabase
          .from("student_quiz_attempts")
          .select("*")
          .eq("student_id", userId)
          .eq("quiz_id", quizData.id)
          .order("completed_at", { ascending: false });

        if (!attErr && attempts && attempts.length > 0) {
          const latestAttempt = attempts[0];
          setQuizResult({
            score: latestAttempt.score,
            passed: latestAttempt.passed,
            attemptsCount: attempts.length
          });
        }
      }
    } catch (err) {
      console.error("Error fetching lesson data:", err.message);
      setLessonQuiz(null);
    }
  };

  const markLessonComplete = async (lessonId) => {
    try {
      const { error } = await supabase.from("student_lesson_progress").upsert(
        {
          student_id: userId,
          lesson_id: lessonId,
          status: "completed",
          completed_at: new Date().toISOString()
        },
        { onConflict: "student_id,lesson_id" }
      );

      if (error) throw error;

      setCompletedLessonIds((prev) => {
        const next = new Set(prev);
        next.add(lessonId);
        return next;
      });
    } catch (err) {
      console.error("Error marking lesson complete:", err.message);
    }
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    if (!lessonQuiz || !lessonQuiz.quiz_questions) return;

    setSubmittingQuiz(true);
    try {
      const questions = lessonQuiz.quiz_questions;
      let correctCount = 0;

      questions.forEach((q, idx) => {
        if (quizAnswers[idx] === q.correct_option_index) {
          correctCount++;
        }
      });

      const score = Math.round((correctCount / questions.length) * 100);
      const passingScore = lessonQuiz.passing_score || 70;
      const passed = score >= passingScore;

      await supabase.from("student_quiz_attempts").insert({
        student_id: userId,
        quiz_id: lessonQuiz.id,
        score,
        passed
      });

      setQuizResult({ score, passed, attemptsCount: 1 });

      if (passed) {
        await markLessonComplete(selectedLesson.id);
        toast.success(`Passed! You got ${score}% 🎉`);
      } else {
        toast.error(`You got ${score}%. Assessment failed.`);
      }
    } catch (err) {
      toast.error("Failed to submit quiz: " + err.message);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleSubmitHomework = async (e) => {
    e.preventDefault();
    if (!lessonAssignment) return;

    try {
      setSubmittingHomework(true);
      const timestamp = new Date().toISOString();

      const { error } = await supabase
        .from("student_assignments")
        .update({
          submission_link: submissionText,
          status: "submitted",
          updated_at: timestamp,
          submitted_at: timestamp,
        })
        .eq("id", lessonAssignment.id);

      if (error) throw error;

      setLessonAssignment((prev) => ({
        ...prev,
        submission_link: submissionText,
        status: "submitted",
        submitted_at: timestamp,
        updated_at: timestamp,
      }));

      fetchHomeworkStats();
      toast.success("Homework submitted successfully! 🎉");
    } catch (err) {
      console.error("Error submitting homework:", err.message);
      toast.error("Failed to submit homework. Please try again.");
    } finally {
      setSubmittingHomework(false);
    }
  };

  const handleSelectCourse = (course) => {
    setOpenPhases({});
    setSelectedLesson(null);
    setActiveCourse(course);
    fetchCourseSyllabus(course.id);
  };

  const togglePhaseAccordion = (phaseId) => {
    setOpenPhases((prev) => ({
      ...prev,
      [phaseId]: !prev[phaseId]
    }));
  };

  const isPhaseCompleted = (phase) => {
    if (!phase.course_lessons || phase.course_lessons.length === 0) return false;
    return phase.course_lessons.every((lesson) => completedLessonIds.has(lesson.id));
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white/10 dark:bg-white/[0.04] backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[30px] p-8 text-center shadow-xl">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
          <h2 className="text-gray-900 dark:text-white text-xl font-bold">
            Loading Learning Workspace...
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            Fetching your interactive curriculum 🚀
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8 text-gray-900 dark:text-white max-w-7xl mx-auto">
      {courses.length > 0 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {courses.map((course) => {
            const isSelected = activeCourse?.id === course.id;
            return (
              <button
                key={course.id}
                onClick={() => handleSelectCourse(course)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-left shrink-0 transition-all ${
                  isSelected
                    ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20"
                    : "bg-white dark:bg-white/[0.04] border-gray-200 dark:border-white/10 hover:border-purple-500/40 text-gray-700 dark:text-gray-200"
                }`}
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-purple-500/20 shrink-0 flex items-center justify-center font-bold text-xs">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen size={16} className={isSelected ? "text-white" : "text-purple-500"} />
                  )}
                </div>
                <span className="font-bold text-sm max-w-[180px] truncate">
                  {course.title}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {courses.length === 0 ? (
        <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-[32px] p-12 text-center shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            🎓
          </div>
          <h3 className="text-xl font-bold">No Registered Courses Found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto text-sm">
            You are not currently enrolled in any active courses. Please contact your administrator or instructor.
          </p>
        </div>
      ) : (
        activeCourse && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Sidebar: Syllabus */}
            <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-6">
              <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[28px] p-4 shadow-xl">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <FileText size={14} className="text-blue-500" /> Homework Stats
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5 p-2.5 rounded-xl">
                    <p className="text-[10px] text-gray-400 font-medium">Pending</p>
                    <p className="font-black text-sm text-orange-500">{homeworkStats.pending}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5 p-2.5 rounded-xl">
                    <p className="text-[10px] text-gray-400 font-medium">Submitted</p>
                    <p className="font-black text-sm text-blue-500">{homeworkStats.submitted}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5 p-2.5 rounded-xl">
                    <p className="text-[10px] text-gray-400 font-medium">Revision</p>
                    <p className="font-black text-sm text-amber-500">{homeworkStats.needs_revision}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5 p-2.5 rounded-xl">
                    <p className="text-[10px] text-gray-400 font-medium">Done</p>
                    <p className="font-black text-sm text-emerald-500">{homeworkStats.completed}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[28px] overflow-hidden shadow-xl p-5">
                <div className="relative h-36 rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
                  {activeCourse.thumbnail_url ? (
                    <img
                      src={activeCourse.thumbnail_url}
                      alt={activeCourse.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <BookOpen size={36} className="text-white/80 mx-auto mb-1" />
                      <span className="text-xs font-bold text-white/70 uppercase tracking-widest">
                        Course Track
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <h2 className="absolute bottom-3 left-4 right-4 font-black text-white text-lg line-clamp-1">
                    {activeCourse.title}
                  </h2>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 px-1">
                  <span className="flex items-center gap-1.5">
                    <Layers size={14} className="text-purple-500" />
                    {phases.length} Phases
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    {completedLessonIds.size} Lessons Done
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[28px] p-4 shadow-xl space-y-3 max-h-[calc(100vh-380px)] overflow-y-auto">
                <h3 className="text-base font-black px-2 text-gray-900 dark:text-white flex items-center gap-2">
                  Course Syllabus
                </h3>

                <div className="space-y-2">
                  {phases.map((phase) => {
                    const isOpen = !!openPhases[phase.id];
                    const phaseDone = isPhaseCompleted(phase);

                    return (
                      <div
                        key={phase.id}
                        className="border border-gray-200/80 dark:border-white/10 rounded-2xl overflow-hidden transition-all bg-gray-50/50 dark:bg-white/[0.02]"
                      >
                        <button
                          onClick={() => togglePhaseAccordion(phase.id)}
                          className="w-full text-left p-3.5 flex items-center justify-between hover:bg-purple-500/5 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 pr-2">
                            {phaseDone ? (
                              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-purple-500/40 shrink-0" />
                            )}
                            <div>
                              <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">
                                Phase {phase.phase_number}
                              </span>
                              <h4 className="font-bold text-xs md:text-sm text-gray-900 dark:text-white line-clamp-1">
                                {phase.title}
                              </h4>
                            </div>
                          </div>

                          {isOpen ? (
                            <ChevronDown size={16} className="text-gray-400 shrink-0" />
                          ) : (
                            <ChevronRight size={16} className="text-gray-400 shrink-0" />
                          )}
                        </button>

                        {isOpen && (
                          <div className="p-2 pt-0 space-y-1.5 border-t border-gray-200/50 dark:border-white/5">
                            {phase.course_lessons?.map((lesson) => {
                              const isSelected = selectedLesson?.id === lesson.id;
                              const isDone = completedLessonIds.has(lesson.id);

                              return (
                                <button
                                  key={lesson.id}
                                  onClick={() => setSelectedLesson(lesson)}
                                  className={`w-full text-left rounded-xl p-2.5 transition-all flex items-center justify-between border ${
                                    isSelected
                                      ? "bg-purple-600 text-white border-transparent shadow-md"
                                      : "bg-white dark:bg-white/[0.03] border-gray-200/60 dark:border-white/5 hover:border-purple-500/30"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0 pr-2">
                                    {isDone ? (
                                      <CheckCircle2
                                        size={15}
                                        className={isSelected ? "text-white" : "text-emerald-500"}
                                      />
                                    ) : (
                                      <Circle
                                        size={15}
                                        className={isSelected ? "text-white/70" : "text-gray-400"}
                                      />
                                    )}
                                    <span
                                      className={`text-xs font-bold truncate ${
                                        isSelected
                                          ? "text-white"
                                          : "text-gray-800 dark:text-gray-200"
                                      }`}
                                    >
                                      {lesson.title}
                                    </span>
                                  </div>
                                  <ChevronRight
                                    size={13}
                                    className={isSelected ? "text-white/80" : "text-gray-400"}
                                  />
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Main Panel: Active Lesson Content */}
            <div className="lg:col-span-8">
              <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[32px] p-6 md:p-8 shadow-xl">
                {selectedLesson ? (
                  <div>
                    <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                      <div>
                        <span className="text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
                          Active Lesson
                        </span>
                        <h2 className="text-2xl md:text-3xl font-black mt-2 text-gray-900 dark:text-white">
                          {selectedLesson.title}
                        </h2>
                      </div>

                      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border ${
                        completedLessonIds.has(selectedLesson.id)
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      }`}>
                        {completedLessonIds.has(selectedLesson.id) ? (
                          <>
                            <CheckCircle2 size={16} /> Completed (Passed)
                          </>
                        ) : (
                          <>
                            <AlertCircle size={16} /> Quiz Required to Complete
                          </>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-white/[0.08] pt-6 space-y-6">
                      {selectedLesson.video_url && (
                        <div className="relative rounded-2xl overflow-hidden aspect-video bg-black shadow-lg border border-gray-200/20 dark:border-white/10">
                          <iframe
                            src={selectedLesson.video_url}
                            title="Lesson Video"
                            className="w-full h-full border-0"
                            allowFullScreen
                          />
                        </div>
                      )}

                      {quizResult && (
                        <div className={`p-4 rounded-xl border text-xs md:text-sm font-bold flex items-center gap-2.5 ${
                          quizResult.passed 
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300" 
                            : "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300"
                        }`}>
                          {quizResult.passed ? (
                            <span>🎉 You passed!</span>
                          ) : (
                            <span>⚠️ You did not pass. Please review the material and retake.</span>
                          )}
                        </div>
                      )}

                      {selectedLesson.content ? (
                        <div className="bg-gray-50/80 dark:bg-white/[0.02] p-5 md:p-6 rounded-2xl border border-gray-200/60 dark:border-white/5 space-y-3">
                          <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                            {selectedLesson.content}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-400">
                          <p className="text-sm">No notes or study materials specified for this lesson yet.</p>
                        </div>
                      )}

                      {/* Homework Toggle Section */}
                      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/10">
                        {lessonAssignment ? (
                          <div className="space-y-4">
                            <button
                              onClick={() => setHomeworkOpen(!homeworkOpen)}
                              className="w-full py-3.5 px-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white rounded-2xl font-black text-sm flex items-center justify-between shadow-lg shadow-purple-500/20 transition"
                            >
                              <span className="flex items-center gap-2">
                                <FileText size={18} />
                                Homework: {lessonAssignment.task_name}
                              </span>
                              <span>{homeworkOpen ? "Hide" : "View & Submit"}</span>
                            </button>

                            {homeworkOpen && (
                              <div className="bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-6 space-y-4">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {lessonAssignment.description || lessonAssignment.instructions || "Complete the task and submit your link."}
                                </p>

                                {lessonAssignment.status === "needs_revision" && (
                                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                                    ⚠️ Revision Requested: Please update your submission based on tutor feedback.
                                  </div>
                                )}

                                <form onSubmit={handleSubmitHomework} className="space-y-3">
                                  <input
                                    type="url"
                                    placeholder="Paste your project URL..."
                                    value={submissionText}
                                    onChange={(e) => setSubmissionText(e.target.value)}
                                    required
                                    className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                                  />
                                  <button
                                    type="submit"
                                    disabled={submittingHomework}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm shadow-md transition"
                                  >
                                    {submittingHomework ? "Submitting..." : "Submit Homework"}
                                  </button>
                                </form>

                                {lessonAssignment.tutor_feedback && (
                                  <div className="mt-4 p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-1">
                                    <p className="text-xs font-bold text-purple-600 dark:text-purple-300 flex items-center gap-1">
                                      <Sparkles size={14} /> Tutor Feedback
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                                      {lessonAssignment.tutor_feedback}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-full py-3.5 px-5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-center text-gray-400 text-sm font-bold">
                            No homework for this lesson
                          </div>
                        )}
                      </div>

                      {/* Lesson Quiz Section */}
                      {lessonQuiz && lessonQuiz.quiz_questions && (
                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/10">
                          <div className="bg-purple-50/50 dark:bg-purple-500/5 border border-purple-100 dark:border-purple-500/20 rounded-2xl p-6 space-y-4">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white">
                              {lessonQuiz.title}
                            </h3>
                            <form onSubmit={handleQuizSubmit} className="space-y-4">
                              {lessonQuiz.quiz_questions.map((q, qIndex) => (
                                <div key={q.id} className="space-y-2">
                                  <p className="font-bold text-sm">
                                    {qIndex + 1}. {q.question_text}
                                  </p>
                                  <div className="space-y-1.5 pl-2">
                                    {q.options.map((opt, optIndex) => (
                                      <label
                                        key={optIndex}
                                        className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 cursor-pointer hover:border-purple-500 transition-all text-xs"
                                      >
                                        <input
                                          type="radio"
                                          name={`question-${qIndex}`}
                                          checked={quizAnswers[qIndex] === optIndex}
                                          onChange={() =>
                                            setQuizAnswers((prev) => ({
                                              ...prev,
                                              [qIndex]: optIndex,
                                            }))
                                          }
                                          className="text-purple-600"
                                        />
                                        <span>{opt}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              ))}
                              <button
                                type="submit"
                                disabled={submittingQuiz}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold text-sm shadow-md transition"
                              >
                                {submittingQuiz ? "Submitting Quiz..." : "Submit Quiz Assessment"}
                              </button>
                            </form>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 text-gray-400">
                    <BookOpen size={48} className="mx-auto mb-3 opacity-40" />
                    <p className="font-bold">Select a lesson from the sidebar to begin.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
// import React, { useEffect, useState } from "react";
// import {
//   BookOpen,
//   ChevronRight,
//   ChevronDown,
//   CheckCircle2,
//   Circle,
//   Layers,
//   AlertCircle,
//   RotateCcw,
//   Check,
//   X,
//   Lock,
//   Lightbulb,
//   FileText,
//   Clock,
//   Sparkles
// } from "lucide-react";
// import { supabase } from "../../../supabase";
// import toast from "react-hot-toast";

// export default function StudentCoursesView({ userId, courseId }) {
//   const [loading, setLoading] = useState(true);
//   const [courses, setCourses] = useState([]);
//   const [activeCourse, setActiveCourse] = useState(null);

//   // Structured Phase -> Lessons state
//   const [phases, setPhases] = useState([]);
//   const [selectedLesson, setSelectedLesson] = useState(null);
//   const [completedLessonIds, setCompletedLessonIds] = useState(new Set());

//   // Track open/collapsed phases by phase ID
//   const [openPhases, setOpenPhases] = useState({});

//   // Quiz state for active lesson
//   const [lessonQuiz, setLessonQuiz] = useState(null);
//   const [quizAnswers, setQuizAnswers] = useState({});
//   const [submittingQuiz, setSubmittingQuiz] = useState(false);
//   const [quizResult, setQuizResult] = useState(null); // { score, passed, attemptsCount }
//   const [quizAccordionOpen, setQuizAccordionOpen] = useState(false); // Closed by default

//   // Homework state for active lesson
//   const [lessonAssignment, setLessonAssignment] = useState(null);
//   const [submissionText, setSubmissionText] = useState("");
//   const [submittingHomework, setSubmittingHomework] = useState(false);
//   const [homeworkOpen, setHomeworkOpen] = useState(false);

//   // Overall student homework stats for sidebar
//   const [homeworkStats, setHomeworkStats] = useState({
//     pending: 0,
//     submitted: 0,
//     needs_revision: 0,
//     completed: 0,
//   });

//   useEffect(() => {
//     if (userId) {
//       initialLoad();
//       fetchHomeworkStats();
//     }
//   }, [userId, courseId]);

//   useEffect(() => {
//     if (selectedLesson) {
//       setLessonQuiz(null);
//       setQuizAnswers({});
//       setQuizResult(null);
//       setQuizAccordionOpen(false); // Closed by default on lesson change
//       setLessonAssignment(null);
//       setSubmissionText("");
//       setHomeworkOpen(false);
//       fetchLessonData(selectedLesson.id);
//       fetchLessonHomework(selectedLesson.id);
//     }
//   }, [selectedLesson?.id]);

//   const initialLoad = async () => {
//     try {
//       setLoading(true);

//       const { data: userData, error: userError } = await supabase
//         .from("users")
//         .select(`
//           assigned_course_id,
//           courses:assigned_course_id (*)
//         `)
//         .eq("id", userId)
//         .single();

//       if (userError) throw userError;

//       const assignedCourse = userData?.courses ? [userData.courses] : [];
//       setCourses(assignedCourse);

//       const defaultCourse = assignedCourse[0] || null;
//       setActiveCourse(defaultCourse);

//       if (defaultCourse) {
//         const completedIds = await fetchLessonProgress();
//         await fetchCourseSyllabus(defaultCourse.id, completedIds);
//       }
//     } catch (err) {
//       console.error("Error fetching student data:", err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchHomeworkStats = async () => {
//     try {
//       const { data, error } = await supabase
//         .from("student_assignments")
//         .select("status")
//         .eq("student_id", userId);

//       if (error) throw error;

//       const stats = {
//         pending: 0,
//         submitted: 0,
//         needs_revision: 0,
//         completed: 0,
//       };

//       (data || []).forEach((item) => {
//         const st = item.status || "pending";
//         if (stats[st] !== undefined) {
//           stats[st]++;
//         } else if (st === "pending") {
//           stats.pending++;
//         }
//       });

//       setHomeworkStats(stats);
//     } catch (err) {
//       console.error("Error fetching homework stats:", err.message);
//     }
//   };

//   const fetchLessonProgress = async () => {
//     try {
//       const { data: progressData, error } = await supabase
//         .from("student_lesson_progress")
//         .select("lesson_id, status")
//         .eq("student_id", userId)
//         .eq("status", "completed");

//       if (error) throw error;

//       const completedSet = new Set(progressData.map((p) => p.lesson_id));
//       setCompletedLessonIds(completedSet);
//       return completedSet;
//     } catch (err) {
//       console.error("Error fetching progress:", err.message);
//       return new Set();
//     }
//   };

//   const fetchCourseSyllabus = async (targetCourseId, completedIds = completedLessonIds) => {
//     try {
//       const { data: phaseData, error } = await supabase
//         .from("course_phases")
//         .select(`
//           id,
//           phase_number,
//           title,
//           focus,
//           course_lessons (
//             id,
//             title,
//             position,
//             created_at
//           )
//         `)
//         .eq("course_id", targetCourseId)
//         .order("phase_number", { ascending: true });

//       if (error) throw error;

//       const { data: notesData } = await supabase
//         .from("notes")
//         .select("*")
//         .eq("course_id", targetCourseId);

//       const structuredPhases = (phaseData || []).map((phase) => ({
//         ...phase,
//         course_lessons: (phase.course_lessons || [])
//           .sort((a, b) => (a.position || 0) - (b.position || 0))
//           .map((lesson) => {
//             const matchingNote = (notesData || []).find(
//               (n) => n.title.toLowerCase() === lesson.title.toLowerCase()
//             );
//             return {
//               ...lesson,
//               content: matchingNote?.content || "",
//               video_url: matchingNote?.video_url || ""
//             };
//           })
//       }));

//       setPhases(structuredPhases);

//       const activePhase =
//         structuredPhases.find((phase) =>
//           phase.course_lessons?.some((lesson) => !completedIds.has(lesson.id))
//         ) || structuredPhases[0];

//       const initialOpenState = {};
//       structuredPhases.forEach((p) => {
//         initialOpenState[p.id] = p.id === activePhase?.id;
//       });

//       setOpenPhases(initialOpenState);

//       const firstIncompleteLesson =
//         activePhase?.course_lessons?.find((l) => !completedIds.has(l.id)) ||
//         activePhase?.course_lessons?.[0] ||
//         null;

//       setSelectedLesson(firstIncompleteLesson);
//     } catch (err) {
//       console.error("Error fetching syllabus:", err.message);
//     }
//   };

//   const fetchLessonHomework = async (lessonId) => {
//     try {
//       const { data, error } = await supabase
//         .from("student_assignments")
//         .select("*")
//         .eq("student_id", userId)
//         .eq("lesson_id", lessonId)
//         .maybeSingle();

//       if (error) throw error;
//       setLessonAssignment(data || null);
//       setSubmissionText(data?.submission_link || "");
//     } catch (err) {
//       console.error("Error fetching lesson homework:", err.message);
//     }
//   };

//   const fetchLessonData = async (lessonId) => {
//     try {
//       const { data: quizData, error: qErr } = await supabase
//         .from("quizzes")
//         .select("*, quiz_questions(*)")
//         .eq("lesson_id", lessonId)
//         .maybeSingle();

//       if (qErr) throw qErr;
//       setLessonQuiz(quizData || null);

//       if (quizData) {
//         const { data: attempts, error: attErr } = await supabase
//           .from("student_quiz_attempts")
//           .select("*")
//           .eq("student_id", userId)
//           .eq("quiz_id", quizData.id)
//           .order("completed_at", { ascending: false });

//         if (!attErr && attempts && attempts.length > 0) {
//           const latestAttempt = attempts[0];
//           setQuizResult({
//             score: latestAttempt.score,
//             passed: latestAttempt.passed,
//             attemptsCount: attempts.length
//           });
//         }
//       }
//     } catch (err) {
//       console.error("Error fetching lesson data:", err.message);
//       setLessonQuiz(null);
//     }
//   };

//   const markLessonComplete = async (lessonId) => {
//     try {
//       const { error } = await supabase.from("student_lesson_progress").upsert(
//         {
//           student_id: userId,
//           lesson_id: lessonId,
//           status: "completed",
//           completed_at: new Date().toISOString()
//         },
//         { onConflict: "student_id,lesson_id" }
//       );

//       if (error) throw error;

//       setCompletedLessonIds((prev) => {
//         const next = new Set(prev);
//         next.add(lessonId);
//         return next;
//       });
//     } catch (err) {
//       console.error("Error marking lesson complete:", err.message);
//     }
//   };

//   const handleQuizSubmit = async (e) => {
//     e.preventDefault();
//     if (!lessonQuiz || !lessonQuiz.quiz_questions) return;

//     setSubmittingQuiz(true);
//     try {
//       const questions = lessonQuiz.quiz_questions;
//       let correctCount = 0;

//       questions.forEach((q, idx) => {
//         if (quizAnswers[idx] === q.correct_option_index) {
//           correctCount++;
//         }
//       });

//       const score = Math.round((correctCount / questions.length) * 100);
//       const passingScore = lessonQuiz.passing_score || 70;
//       const passed = score >= passingScore;

//       await supabase.from("student_quiz_attempts").insert({
//         student_id: userId,
//         quiz_id: lessonQuiz.id,
//         score,
//         passed
//       });

//       setQuizResult({ score, passed, attemptsCount: 1 });

//       if (passed) {
//         await markLessonComplete(selectedLesson.id);
//         toast.success(`Passed! You got ${score}% 🎉`);
//       } else {
//         toast.error(`You got ${score}%. Assessment failed. Locked until Saturday morning retake.`);
//       }
//     } catch (err) {
//       toast.error("Failed to submit quiz: " + err.message);
//     } finally {
//       setSubmittingQuiz(false);
//     }
//   };

//   const handleSubmitHomework = async (e) => {
//     e.preventDefault();
//     if (!lessonAssignment) return;

//     try {
//       setSubmittingHomework(true);
//       const timestamp = new Date().toISOString();

//       const { error } = await supabase
//         .from("student_assignments")
//         .update({
//           submission_link: submissionText,
//           status: "submitted",
//           updated_at: timestamp,
//           submitted_at: timestamp,
//         })
//         .eq("id", lessonAssignment.id);

//       if (error) throw error;

//       setLessonAssignment((prev) => ({
//         ...prev,
//         submission_link: submissionText,
//         status: "submitted",
//         submitted_at: timestamp,
//         updated_at: timestamp,
//       }));

//       fetchHomeworkStats();
//       toast.success("Homework submitted successfully! 🎉");
//     } catch (err) {
//       console.error("Error submitting homework:", err.message);
//       toast.error("Failed to submit homework. Please try again.");
//     } finally {
//       setSubmittingHomework(false);
//     }
//   };

//   const handleSelectCourse = (course) => {
//     setOpenPhases({});
//     setSelectedLesson(null);
//     setActiveCourse(course);
//     fetchCourseSyllabus(course.id);
//   };

//   const togglePhaseAccordion = (phaseId) => {
//     setOpenPhases((prev) => ({
//       ...prev,
//       [phaseId]: !prev[phaseId]
//     }));
//   };

//   const isPhaseCompleted = (phase) => {
//     if (!phase.course_lessons || phase.course_lessons.length === 0) return false;
//     return phase.course_lessons.every((lesson) => completedLessonIds.has(lesson.id));
//   };

//   const isSaturdayMorning = () => {
//     const now = new Date();
//     const day = now.getDay();
//     const hour = now.getHours();
//     return day === 6 && hour < 12;
//   };

//   if (loading) {
//     return (
//       <div className="min-h-[60vh] flex items-center justify-center">
//         <div className="bg-white/10 dark:bg-white/[0.04] backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[30px] p-8 text-center shadow-xl">
//           <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
//           <h2 className="text-gray-900 dark:text-white text-xl font-bold">
//             Loading Learning Workspace...
//           </h2>
//           <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
//             Fetching your interactive curriculum 🚀
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 p-4 md:p-8 text-gray-900 dark:text-white max-w-7xl mx-auto">
//       {courses.length > 0 && (
//         <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
//           {courses.map((course) => {
//             const isSelected = activeCourse?.id === course.id;
//             return (
//               <button
//                 key={course.id}
//                 onClick={() => handleSelectCourse(course)}
//                 className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-left shrink-0 transition-all ${
//                   isSelected
//                     ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20"
//                     : "bg-white dark:bg-white/[0.04] border-gray-200 dark:border-white/10 hover:border-purple-500/40 text-gray-700 dark:text-gray-200"
//                 }`}
//               >
//                 <div className="w-8 h-8 rounded-lg overflow-hidden bg-purple-500/20 shrink-0 flex items-center justify-center font-bold text-xs">
//                   {course.thumbnail_url ? (
//                     <img
//                       src={course.thumbnail_url}
//                       alt={course.title}
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     <BookOpen size={16} className={isSelected ? "text-white" : "text-purple-500"} />
//                   )}
//                 </div>
//                 <span className="font-bold text-sm max-w-[180px] truncate">
//                   {course.title}
//                 </span>
//               </button>
//             );
//           })}
//         </div>
//       )}

//       {courses.length === 0 ? (
//         <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-[32px] p-12 text-center shadow-lg">
//           <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
//             🎓
//           </div>
//           <h3 className="text-xl font-bold">No Registered Courses Found</h3>
//           <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto text-sm">
//             You are not currently enrolled in any active courses. Please contact your administrator or instructor.
//           </p>
//         </div>
//       ) : (
//         activeCourse && (
//           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
//             {/* Left Sidebar: Syllabus */}
//             <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-6">
//               {/* Homework Stats Widget */}
//               <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[28px] p-4 shadow-xl">
//                 <div className="flex items-center justify-between mb-3 px-1">
//                   <span className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
//                     <FileText size={14} className="text-blue-500" /> Homework Stats
//                   </span>
//                 </div>
//                 <div className="grid grid-cols-4 gap-2 text-center">
//                   <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5 p-2.5 rounded-xl">
//                     <p className="text-[10px] text-gray-400 font-medium">Pending</p>
//                     <p className="font-black text-sm text-orange-500">{homeworkStats.pending}</p>
//                   </div>
//                   <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5 p-2.5 rounded-xl">
//                     <p className="text-[10px] text-gray-400 font-medium">Submitted</p>
//                     <p className="font-black text-sm text-blue-500">{homeworkStats.submitted}</p>
//                   </div>
//                   <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5 p-2.5 rounded-xl">
//                     <p className="text-[10px] text-gray-400 font-medium">Revision</p>
//                     <p className="font-black text-sm text-amber-500">{homeworkStats.needs_revision}</p>
//                   </div>
//                   <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5 p-2.5 rounded-xl">
//                     <p className="text-[10px] text-gray-400 font-medium">Done</p>
//                     <p className="font-black text-sm text-emerald-500">{homeworkStats.completed}</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[28px] overflow-hidden shadow-xl p-5">
//                 <div className="relative h-36 rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
//                   {activeCourse.thumbnail_url ? (
//                     <img
//                       src={activeCourse.thumbnail_url}
//                       alt={activeCourse.title}
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     <div className="text-center p-4">
//                       <BookOpen size={36} className="text-white/80 mx-auto mb-1" />
//                       <span className="text-xs font-bold text-white/70 uppercase tracking-widest">
//                         Course Track
//                       </span>
//                     </div>
//                   )}
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
//                   <h2 className="absolute bottom-3 left-4 right-4 font-black text-white text-lg line-clamp-1">
//                     {activeCourse.title}
//                   </h2>
//                 </div>

//                 <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 px-1">
//                   <span className="flex items-center gap-1.5">
//                     <Layers size={14} className="text-purple-500" />
//                     {phases.length} Phases
//                   </span>
//                   <span className="flex items-center gap-1.5">
//                     <CheckCircle2 size={14} className="text-emerald-500" />
//                     {completedLessonIds.size} Lessons Done
//                   </span>
//                 </div>
//               </div>

//               <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[28px] p-4 shadow-xl space-y-3 max-h-[calc(100vh-380px)] overflow-y-auto">
//                 <h3 className="text-base font-black px-2 text-gray-900 dark:text-white flex items-center gap-2">
//                   Course Syllabus
//                 </h3>

//                 <div className="space-y-2">
//                   {phases.map((phase) => {
//                     const isOpen = !!openPhases[phase.id];
//                     const phaseDone = isPhaseCompleted(phase);

//                     return (
//                       <div
//                         key={phase.id}
//                         className="border border-gray-200/80 dark:border-white/10 rounded-2xl overflow-hidden transition-all bg-gray-50/50 dark:bg-white/[0.02]"
//                       >
//                         <button
//                           onClick={() => togglePhaseAccordion(phase.id)}
//                           className="w-full text-left p-3.5 flex items-center justify-between hover:bg-purple-500/5 transition-colors"
//                         >
//                           <div className="flex items-center gap-2.5 pr-2">
//                             {phaseDone ? (
//                               <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
//                             ) : (
//                               <div className="w-4 h-4 rounded-full border-2 border-purple-500/40 shrink-0" />
//                             )}
//                             <div>
//                               <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">
//                                 Phase {phase.phase_number}
//                               </span>
//                               <h4 className="font-bold text-xs md:text-sm text-gray-900 dark:text-white line-clamp-1">
//                                 {phase.title}
//                               </h4>
//                             </div>
//                           </div>

//                           {isOpen ? (
//                             <ChevronDown size={16} className="text-gray-400 shrink-0" />
//                           ) : (
//                             <ChevronRight size={16} className="text-gray-400 shrink-0" />
//                           )}
//                         </button>

//                         {isOpen && (
//                           <div className="p-2 pt-0 space-y-1.5 border-t border-gray-200/50 dark:border-white/5">
//                             {phase.course_lessons?.map((lesson) => {
//                               const isSelected = selectedLesson?.id === lesson.id;
//                               const isDone = completedLessonIds.has(lesson.id);

//                               return (
//                                 <button
//                                   key={lesson.id}
//                                   onClick={() => setSelectedLesson(lesson)}
//                                   className={`w-full text-left rounded-xl p-2.5 transition-all flex items-center justify-between border ${
//                                     isSelected
//                                       ? "bg-purple-600 text-white border-transparent shadow-md"
//                                       : "bg-white dark:bg-white/[0.03] border-gray-200/60 dark:border-white/5 hover:border-purple-500/30"
//                                   }`}
//                                 >
//                                   <div className="flex items-center gap-2 min-w-0 pr-2">
//                                     {isDone ? (
//                                       <CheckCircle2
//                                         size={15}
//                                         className={isSelected ? "text-white" : "text-emerald-500"}
//                                       />
//                                     ) : (
//                                       <Circle
//                                         size={15}
//                                         className={isSelected ? "text-white/70" : "text-gray-400"}
//                                       />
//                                     )}
//                                     <span
//                                       className={`text-xs font-bold truncate ${
//                                         isSelected
//                                           ? "text-white"
//                                           : "text-gray-800 dark:text-gray-200"
//                                       }`}
//                                     >
//                                       {lesson.title}
//                                     </span>
//                                   </div>
//                                   <ChevronRight
//                                     size={13}
//                                     className={isSelected ? "text-white/80" : "text-gray-400"}
//                                   />
//                                 </button>
//                               );
//                             })}
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             </div>

//             {/* Right Main Panel: Active Lesson Content */}
//             <div className="lg:col-span-8">
//               <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[32px] p-6 md:p-8 shadow-xl">
//                 {selectedLesson ? (
//                   <div>
//                     <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
//                       <div>
//                         <span className="text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
//                           Active Lesson
//                         </span>
//                         <h2 className="text-2xl md:text-3xl font-black mt-2 text-gray-900 dark:text-white">
//                           {selectedLesson.title}
//                         </h2>
//                       </div>

//                       <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border ${
//                         completedLessonIds.has(selectedLesson.id)
//                           ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
//                           : "bg-amber-500/10 text-amber-500 border-amber-500/20"
//                       }`}>
//                         {completedLessonIds.has(selectedLesson.id) ? (
//                           <>
//                             <CheckCircle2 size={16} /> Completed (Passed)
//                           </>
//                         ) : (
//                           <>
//                             <AlertCircle size={16} /> Quiz Required to Complete
//                           </>
//                         )}
//                       </div>
//                     </div>

//                     <div className="border-t border-gray-100 dark:border-white/[0.08] pt-6 space-y-6">
//                       {selectedLesson.video_url && (
//                         <div className="relative rounded-2xl overflow-hidden aspect-video bg-black shadow-lg border border-gray-200/20 dark:border-white/10">
//                           <iframe
//                             src={selectedLesson.video_url}
//                             title="Lesson Video"
//                             className="w-full h-full border-0"
//                             allowFullScreen
//                           />
//                         </div>
//                       )}

//                       {/* Dynamic Result Message Banner */}
//                       {quizResult && (
//                         <div className={`p-4 rounded-xl border text-xs md:text-sm font-bold flex items-center gap-2.5 ${
//                           quizResult.passed 
//                             ? "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300" 
//                             : "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300"
//                         }`}>
//                           {quizResult.passed ? (
//                             <span>🎉 You passed! Please wait for your teacher to unlock your next lesson.</span>
//                           ) : (
//                             <span>⚠️ You did not pass. Please review the material above and retake the exam.</span>
//                           )}
//                         </div>
//                       )}

//                       {selectedLesson.content ? (
//                         <div className="bg-gray-50/80 dark:bg-white/[0.02] p-5 md:p-6 rounded-2xl border border-gray-200/60 dark:border-white/5 space-y-3">
//                           <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
//                             {selectedLesson.content}
//                           </p>
//                         </div>
//                       ) : (
//                         <div className="text-center py-6 text-gray-400">
//                           <p className="text-sm">No notes or study materials specified for this lesson yet.</p>
//                         </div>
//                       )}

//                       {/* Homework Toggle Section */}
//                       <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/10">
//                         {lessonAssignment ? (
//                           <div className="space-y-4">
//                        <button
//   onClick={() => setHomeworkOpen(!homeworkOpen)}
//   className="w-full py-3.5 px-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white rounded-2xl font-black text-sm flex items-center justify-between shadow-lg shadow-purple-500/20 transition"
// >
//   <span className="flex items-center gap-2">
//     <FileText size={18} />
//     Homework: {lessonAssignment.task_name}
//   </span>
//   <span>{homeworkOpen ? "Hide" : "View & Submit"}</span>
// </button>

//                             {homeworkOpen && (
//                               <div className="bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-6 space-y-4">
//                                 <p className="text-sm text-gray-600 dark:text-gray-300">
//                                   {lessonAssignment.description || lessonAssignment.instructions || "Complete the task and submit your link."}
//                                 </p>

//                                 {lessonAssignment.status === "needs_revision" && (
//                                   <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-amber-700 dark:text-amber-300 text-xs font-semibold">
//                                     ⚠️ Revision Requested: Please update your submission based on tutor feedback.
//                                   </div>
//                                 )}

//                                 <form onSubmit={handleSubmitHomework} className="space-y-3">
//                                   <input
//                                     type="url"
//                                     placeholder="Paste your project URL..."
//                                     value={submissionText}
//                                     onChange={(e) => setSubmissionText(e.target.value)}
//                                     required
//                                     className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
//                                   />
//                                   <button
//                                     type="submit"
//                                     disabled={submittingHomework}
//                                     className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm shadow-md transition"
//                                   >
//                                     {submittingHomework ? "Submitting..." : "Submit Homework"}
//                                   </button>
//                                 </form>

//                                 {lessonAssignment.tutor_feedback && (
//                                   <div className="mt-4 p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-1">
//                                     <p className="text-xs font-bold text-purple-600 dark:text-purple-300 flex items-center gap-1">
//                                       <Sparkles size={14} /> Tutor Feedback
//                                     </p>
//                                     <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
//                                       {lessonAssignment.tutor_feedback}
//                                     </p>
//                                   </div>
//                                 )}
//                               </div>
//                             )}
//                           </div>
//                         ) : (
//                           <div className="w-full py-3.5 px-5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-center text-gray-400 text-sm font-bold">
//                             No homework for this lesson
//                           </div>
//                         )}
//                       </div>

//                       {/* LESSON QUIZ ASSESSMENT SECTION (Closed by default) */}
//                       {lessonQuiz && lessonQuiz.quiz_questions && lessonQuiz.quiz_questions.length > 0 ? (
//                         <div className="mt-8 border border-purple-100 dark:border-purple-500/20 rounded-2xl overflow-hidden bg-purple-50/40 dark:bg-purple-500/5">
//                           {/* Quiz Accordion Header */}
//                           <button
//                             onClick={() => setQuizAccordionOpen(!quizAccordionOpen)}
//                             className="w-full p-4 flex items-center justify-between text-left hover:bg-purple-500/5 transition-colors"
//                           >
//                             <div className="flex items-center gap-3">
//                               <span className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
//                                 📝
//                               </span>
//                               <div>
//                                 <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
//                                   Lesson Assessment
//                                 </span>
//                                 <h3 className="text-sm md:text-base font-black text-gray-900 dark:text-white">
//                                   {lessonQuiz.title}
//                                 </h3>
//                               </div>
//                             </div>
//                             <div className="flex items-center gap-2">
//                               {quizResult && (
//                                 <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
//                                   quizResult.passed ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
//                                 }`}>
//                                   Score: {quizResult.score}%
//                                 </span>
//                               )}
//                               {quizAccordionOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
//                             </div>
//                           </button>

//                           {/* Quiz Accordion Body */}
//                           {quizAccordionOpen && (
//                             <div className="p-6 pt-0 border-t border-purple-100 dark:border-purple-500/20 space-y-6 mt-4">
//                               {quizResult && (
//                                 <div className="space-y-3">
//                                   <div className={`p-4 rounded-xl border flex items-center justify-between ${
//                                     quizResult.passed 
//                                       ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
//                                       : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
//                                   }`}>
//                                     <div className="flex items-center gap-2.5 font-bold text-sm">
//                                       {quizResult.passed ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
//                                       <span>
//                                         {quizResult.passed 
//                                           ? `Passed! You scored ${quizResult.score}%` 
//                                           : `You scored ${quizResult.score}%. Lesson progress is locked.`}
//                                       </span>
//                                     </div>
//                                     {!quizResult.passed && (
//                                       isSaturdayMorning() ? (
//                                         <button
//                                           onClick={() => setQuizResult(null)}
//                                           className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-rose-700 transition-all"
//                                         >
//                                           <RotateCcw size={14} /> Retake Quiz
//                                         </button>
//                                       ) : (
//                                         <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
//                                           <Lock size={12} /> Retakes available Saturday mornings only
//                                         </span>
//                                       )
//                                     )}
//                                   </div>

//                                   {/* Tutor Feedback / Study Hint Card */}
//                                   {!quizResult.passed && (
//                                     <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs space-y-2">
//                                       <div className="flex items-center gap-1.5 font-bold">
//                                         <Lightbulb size={16} className="text-amber-500 shrink-0" />
//                                         <span>Tutor Guidance & Study Hint</span>
//                                       </div>
//                                       <p className="leading-relaxed">
//                                         You did not reach the passing threshold for this assessment. Please thoroughly review the study notes and video content above. Your progress is temporarily locked until your tutor reviews your attempt during your next scheduled live session, or you may retake it during the Saturday morning window.
//                                       </p>
//                                     </div>
//                                   )}
//                                 </div>
//                               )}

//                               <form onSubmit={handleQuizSubmit} className="space-y-6">
//                                 {lessonQuiz.quiz_questions.map((q, qIdx) => {
//                                   const selectedOpt = quizAnswers[qIdx];
//                                   const isSubmitted = !!quizResult;
//                                   const isCorrectOption = selectedOpt === q.correct_option_index;

//                                   return (
//                                     <div key={q.id || qIdx} className="space-y-3 p-4 bg-white dark:bg-slate-900/40 rounded-xl border border-gray-200/60 dark:border-white/10">
//                                       <div className="flex items-center justify-between">
//                                         <p className="text-sm font-bold text-gray-900 dark:text-white">
//                                           {qIdx + 1}. {q.question_text}
//                                         </p>
//                                       </div>

//                                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//                                         {q.options.map((opt, optIdx) => {
//                                           let btnStyle = "bg-gray-50/50 dark:bg-white/[0.02] border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200";
                                          
//                                           if (selectedOpt === optIdx) {
//                                             btnStyle = "bg-purple-600 text-white border-purple-600 shadow-sm";
//                                           }

//                                           if (isSubmitted) {
//                                             if (optIdx === q.correct_option_index) {
//                                               btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold";
//                                             } else if (selectedOpt === optIdx && !isCorrectOption) {
//                                               btnStyle = "bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300 font-bold";
//                                             }
//                                           }

//                                           return (
//                                             <label
//                                               key={optIdx}
//                                               className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${btnStyle}`}
//                                             >
//                                               <input
//                                                 type="radio"
//                                                 name={`question-${qIdx}`}
//                                                 checked={selectedOpt === optIdx}
//                                                 onChange={() => setQuizAnswers({ ...quizAnswers, [qIdx]: optIdx })}
//                                                 disabled={isSubmitted}
//                                                 className="hidden"
//                                               />
//                                               <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 text-[10px] font-bold">
//                                                 {String.fromCharCode(65 + optIdx)}
//                                               </span>
//                                               <span className="flex-1">{opt}</span>
//                                             </label>
//                                           );
//                                         })}
//                                       </div>
//                                     </div>
//                                   );
//                                 })}

//                                 {!quizResult && (
//                                   <div className="flex justify-end pt-2">
//                                     <button
//                                       type="submit"
//                                       disabled={submittingQuiz}
//                                       className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-purple-500/20 transition-all disabled:opacity-50"
//                                     >
//                                       {submittingQuiz ? "Evaluating..." : "Submit Assessment"}
//                                     </button>
//                                   </div>
//                                 )}
//                               </form>
//                             </div>
//                           )}
//                         </div>
//                       ) : (
//                         <div className="mt-8 p-6 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5 rounded-2xl text-center">
//                           <p className="text-xs text-gray-400">No assessment quiz published for this lesson yet.</p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="text-center py-20 text-gray-400">
//                     <BookOpen size={48} className="mx-auto mb-4 opacity-40 text-purple-500" />
//                     <p className="text-base font-bold text-gray-700 dark:text-gray-300">
//                       Select a lesson from the syllabus sidebar to begin learning.
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )
//       )}
//     </div>
//   );
// }
// // import React, { useEffect, useState } from "react";
// // import {
// //   BookOpen,
// //   ChevronRight,
// //   ChevronDown,
// //   CheckCircle2,
// //   Circle,
// //   Layers,
// //   AlertCircle,
// //   RotateCcw,
// //   Check,
// //   X,
// //   Lock,
// //   Lightbulb,
// //   FileText
// // } from "lucide-react";
// // import { supabase } from "../../../supabase";
// // import toast from "react-hot-toast";

// // export default function StudentCoursesView({ userId, courseId }) {
// //   const [loading, setLoading] = useState(true);
// //   const [courses, setCourses] = useState([]);
// //   const [activeCourse, setActiveCourse] = useState(null);

// //   // Structured Phase -> Lessons state
// //   const [phases, setPhases] = useState([]);
// //   const [selectedLesson, setSelectedLesson] = useState(null);
// //   const [completedLessonIds, setCompletedLessonIds] = useState(new Set());

// //   // Track open/collapsed phases by phase ID
// //   const [openPhases, setOpenPhases] = useState({});

// //   // Quiz state for active lesson
// //   const [lessonQuiz, setLessonQuiz] = useState(null);
// //   const [quizAnswers, setQuizAnswers] = useState({});
// //   const [submittingQuiz, setSubmittingQuiz] = useState(false);
// //   const [quizResult, setQuizResult] = useState(null); // { score, passed, attemptsCount }
// //   const [quizAccordionOpen, setQuizAccordionOpen] = useState(false); // Closed by default

// //   // Homework state for active lesson
// //   const [lessonAssignment, setLessonAssignment] = useState(null);
// //   const [submissionText, setSubmissionText] = useState("");
// //   const [submittingHomework, setSubmittingHomework] = useState(false);
// //   const [homeworkOpen, setHomeworkOpen] = useState(false);

// //   useEffect(() => {
// //     if (userId) {
// //       initialLoad();
// //     }
// //   }, [userId, courseId]);

// //   useEffect(() => {
// //     if (selectedLesson) {
// //       setLessonQuiz(null);
// //       setQuizAnswers({});
// //       setQuizResult(null);
// //       setQuizAccordionOpen(false); // Closed by default on lesson change
// //       setLessonAssignment(null);
// //       setSubmissionText("");
// //       setHomeworkOpen(false);
// //       fetchLessonData(selectedLesson.id);
// //       fetchLessonHomework(selectedLesson.id);
// //     }
// //   }, [selectedLesson?.id]);

// //   const initialLoad = async () => {
// //     try {
// //       setLoading(true);

// //       const { data: userData, error: userError } = await supabase
// //         .from("users")
// //         .select(`
// //           assigned_course_id,
// //           courses:assigned_course_id (*)
// //         `)
// //         .eq("id", userId)
// //         .single();

// //       if (userError) throw userError;

// //       const assignedCourse = userData?.courses ? [userData.courses] : [];
// //       setCourses(assignedCourse);

// //       const defaultCourse = assignedCourse[0] || null;
// //       setActiveCourse(defaultCourse);

// //       if (defaultCourse) {
// //         const completedIds = await fetchLessonProgress();
// //         await fetchCourseSyllabus(defaultCourse.id, completedIds);
// //       }
// //     } catch (err) {
// //       console.error("Error fetching student data:", err.message);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const fetchLessonProgress = async () => {
// //     try {
// //       const { data: progressData, error } = await supabase
// //         .from("student_lesson_progress")
// //         .select("lesson_id, status")
// //         .eq("student_id", userId)
// //         .eq("status", "completed");

// //       if (error) throw error;

// //       const completedSet = new Set(progressData.map((p) => p.lesson_id));
// //       setCompletedLessonIds(completedSet);
// //       return completedSet;
// //     } catch (err) {
// //       console.error("Error fetching progress:", err.message);
// //       return new Set();
// //     }
// //   };

// //   const fetchCourseSyllabus = async (targetCourseId, completedIds = completedLessonIds) => {
// //     try {
// //       const { data: phaseData, error } = await supabase
// //         .from("course_phases")
// //         .select(`
// //           id,
// //           phase_number,
// //           title,
// //           focus,
// //           course_lessons (
// //             id,
// //             title,
// //             position,
// //             created_at
// //           )
// //         `)
// //         .eq("course_id", targetCourseId)
// //         .order("phase_number", { ascending: true });

// //       if (error) throw error;

// //       const { data: notesData } = await supabase
// //         .from("notes")
// //         .select("*")
// //         .eq("course_id", targetCourseId);

// //       const structuredPhases = (phaseData || []).map((phase) => ({
// //         ...phase,
// //         course_lessons: (phase.course_lessons || [])
// //           .sort((a, b) => (a.position || 0) - (b.position || 0))
// //           .map((lesson) => {
// //             const matchingNote = (notesData || []).find(
// //               (n) => n.title.toLowerCase() === lesson.title.toLowerCase()
// //             );
// //             return {
// //               ...lesson,
// //               content: matchingNote?.content || "",
// //               video_url: matchingNote?.video_url || ""
// //             };
// //           })
// //       }));

// //       setPhases(structuredPhases);

// //       const activePhase =
// //         structuredPhases.find((phase) =>
// //           phase.course_lessons?.some((lesson) => !completedIds.has(lesson.id))
// //         ) || structuredPhases[0];

// //       const initialOpenState = {};
// //       structuredPhases.forEach((p) => {
// //         initialOpenState[p.id] = p.id === activePhase?.id;
// //       });

// //       setOpenPhases(initialOpenState);

// //       const firstIncompleteLesson =
// //         activePhase?.course_lessons?.find((l) => !completedIds.has(l.id)) ||
// //         activePhase?.course_lessons?.[0] ||
// //         null;

// //       setSelectedLesson(firstIncompleteLesson);
// //     } catch (err) {
// //       console.error("Error fetching syllabus:", err.message);
// //     }
// //   };

// //   const fetchLessonHomework = async (lessonId) => {
// //     try {
// //       const { data, error } = await supabase
// //         .from("student_assignments")
// //         .select("*")
// //         .eq("student_id", userId)
// //         .eq("lesson_id", lessonId)
// //         .maybeSingle();

// //       if (error) throw error;
// //       setLessonAssignment(data || null);
// //       setSubmissionText(data?.submission_link || "");
// //     } catch (err) {
// //       console.error("Error fetching lesson homework:", err.message);
// //     }
// //   };

// //   const fetchLessonData = async (lessonId) => {
// //     try {
// //       const { data: quizData, error: qErr } = await supabase
// //         .from("quizzes")
// //         .select("*, quiz_questions(*)")
// //         .eq("lesson_id", lessonId)
// //         .maybeSingle();

// //       if (qErr) throw qErr;
// //       setLessonQuiz(quizData || null);

// //       if (quizData) {
// //         const { data: attempts, error: attErr } = await supabase
// //           .from("student_quiz_attempts")
// //           .select("*")
// //           .eq("student_id", userId)
// //           .eq("quiz_id", quizData.id)
// //           .order("completed_at", { ascending: false });

// //         if (!attErr && attempts && attempts.length > 0) {
// //           const latestAttempt = attempts[0];
// //           setQuizResult({
// //             score: latestAttempt.score,
// //             passed: latestAttempt.passed,
// //             attemptsCount: attempts.length
// //           });
// //         }
// //       }
// //     } catch (err) {
// //       console.error("Error fetching lesson data:", err.message);
// //       setLessonQuiz(null);
// //     }
// //   };

// //   const markLessonComplete = async (lessonId) => {
// //     try {
// //       const { error } = await supabase.from("student_lesson_progress").upsert(
// //         {
// //           student_id: userId,
// //           lesson_id: lessonId,
// //           status: "completed",
// //           completed_at: new Date().toISOString()
// //         },
// //         { onConflict: "student_id,lesson_id" }
// //       );

// //       if (error) throw error;

// //       setCompletedLessonIds((prev) => {
// //         const next = new Set(prev);
// //         next.add(lessonId);
// //         return next;
// //       });
// //     } catch (err) {
// //       console.error("Error marking lesson complete:", err.message);
// //     }
// //   };

// //   const handleQuizSubmit = async (e) => {
// //     e.preventDefault();
// //     if (!lessonQuiz || !lessonQuiz.quiz_questions) return;

// //     setSubmittingQuiz(true);
// //     try {
// //       const questions = lessonQuiz.quiz_questions;
// //       let correctCount = 0;

// //       questions.forEach((q, idx) => {
// //         if (quizAnswers[idx] === q.correct_option_index) {
// //           correctCount++;
// //         }
// //       });

// //       const score = Math.round((correctCount / questions.length) * 100);
// //       const passingScore = lessonQuiz.passing_score || 70;
// //       const passed = score >= passingScore;

// //       await supabase.from("student_quiz_attempts").insert({
// //         student_id: userId,
// //         quiz_id: lessonQuiz.id,
// //         score,
// //         passed
// //       });

// //       setQuizResult({ score, passed, attemptsCount: 1 });

// //       if (passed) {
// //         await markLessonComplete(selectedLesson.id);
// //         toast.success(`Passed! You got ${score}% 🎉`);
// //       } else {
// //         toast.error(`You got ${score}%. Assessment failed. Locked until Saturday morning retake.`);
// //       }
// //     } catch (err) {
// //       toast.error("Failed to submit quiz: " + err.message);
// //     } finally {
// //       setSubmittingQuiz(false);
// //     }
// //   };

// //   const handleSubmitHomework = async (e) => {
// //     e.preventDefault();
// //     if (!lessonAssignment) return;

// //     try {
// //       setSubmittingHomework(true);
// //       const timestamp = new Date().toISOString();

// //       const { error } = await supabase
// //         .from("student_assignments")
// //         .update({
// //           submission_link: submissionText,
// //           status: "submitted",
// //           updated_at: timestamp,
// //           submitted_at: timestamp,
// //         })
// //         .eq("id", lessonAssignment.id);

// //       if (error) throw error;

// //       setLessonAssignment((prev) => ({
// //         ...prev,
// //         submission_link: submissionText,
// //         status: "submitted",
// //         submitted_at: timestamp,
// //         updated_at: timestamp,
// //       }));

// //       toast.success("Homework submitted successfully! 🎉");
// //     } catch (err) {
// //       console.error("Error submitting homework:", err.message);
// //       toast.error("Failed to submit homework. Please try again.");
// //     } finally {
// //       setSubmittingHomework(false);
// //     }
// //   };

// //   const handleSelectCourse = (course) => {
// //     setOpenPhases({});
// //     setSelectedLesson(null);
// //     setActiveCourse(course);
// //     fetchCourseSyllabus(course.id);
// //   };

// //   const togglePhaseAccordion = (phaseId) => {
// //     setOpenPhases((prev) => ({
// //       ...prev,
// //       [phaseId]: !prev[phaseId]
// //     }));
// //   };

// //   const isPhaseCompleted = (phase) => {
// //     if (!phase.course_lessons || phase.course_lessons.length === 0) return false;
// //     return phase.course_lessons.every((lesson) => completedLessonIds.has(lesson.id));
// //   };

// //   const isSaturdayMorning = () => {
// //     const now = new Date();
// //     const day = now.getDay();
// //     const hour = now.getHours();
// //     return day === 6 && hour < 12;
// //   };

// //   if (loading) {
// //     return (
// //       <div className="min-h-[60vh] flex items-center justify-center">
// //         <div className="bg-white/10 dark:bg-white/[0.04] backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[30px] p-8 text-center shadow-xl">
// //           <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
// //           <h2 className="text-gray-900 dark:text-white text-xl font-bold">
// //             Loading Learning Workspace...
// //           </h2>
// //           <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
// //             Fetching your interactive curriculum 🚀
// //           </p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="space-y-6 p-4 md:p-8 text-gray-900 dark:text-white max-w-7xl mx-auto">
// //       {courses.length > 0 && (
// //         <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
// //           {courses.map((course) => {
// //             const isSelected = activeCourse?.id === course.id;
// //             return (
// //               <button
// //                 key={course.id}
// //                 onClick={() => handleSelectCourse(course)}
// //                 className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-left shrink-0 transition-all ${
// //                   isSelected
// //                     ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20"
// //                     : "bg-white dark:bg-white/[0.04] border-gray-200 dark:border-white/10 hover:border-purple-500/40 text-gray-700 dark:text-gray-200"
// //                 }`}
// //               >
// //                 <div className="w-8 h-8 rounded-lg overflow-hidden bg-purple-500/20 shrink-0 flex items-center justify-center font-bold text-xs">
// //                   {course.thumbnail_url ? (
// //                     <img
// //                       src={course.thumbnail_url}
// //                       alt={course.title}
// //                       className="w-full h-full object-cover"
// //                     />
// //                   ) : (
// //                     <BookOpen size={16} className={isSelected ? "text-white" : "text-purple-500"} />
// //                   )}
// //                 </div>
// //                 <span className="font-bold text-sm max-w-[180px] truncate">
// //                   {course.title}
// //                 </span>
// //               </button>
// //             );
// //           })}
// //         </div>
// //       )}

// //       {courses.length === 0 ? (
// //         <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-[32px] p-12 text-center shadow-lg">
// //           <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
// //             🎓
// //           </div>
// //           <h3 className="text-xl font-bold">No Registered Courses Found</h3>
// //           <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto text-sm">
// //             You are not currently enrolled in any active courses. Please contact your administrator or instructor.
// //           </p>
// //         </div>
// //       ) : (
// //         activeCourse && (
// //           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
// //             {/* Left Sidebar: Syllabus */}
// //             <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-6">
// //               <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[28px] overflow-hidden shadow-xl p-5">
// //                 <div className="relative h-36 rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
// //                   {activeCourse.thumbnail_url ? (
// //                     <img
// //                       src={activeCourse.thumbnail_url}
// //                       alt={activeCourse.title}
// //                       className="w-full h-full object-cover"
// //                     />
// //                   ) : (
// //                     <div className="text-center p-4">
// //                       <BookOpen size={36} className="text-white/80 mx-auto mb-1" />
// //                       <span className="text-xs font-bold text-white/70 uppercase tracking-widest">
// //                         Course Track
// //                       </span>
// //                     </div>
// //                   )}
// //                   <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
// //                   <h2 className="absolute bottom-3 left-4 right-4 font-black text-white text-lg line-clamp-1">
// //                     {activeCourse.title}
// //                   </h2>
// //                 </div>

// //                 <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 px-1">
// //                   <span className="flex items-center gap-1.5">
// //                     <Layers size={14} className="text-purple-500" />
// //                     {phases.length} Phases
// //                   </span>
// //                   <span className="flex items-center gap-1.5">
// //                     <CheckCircle2 size={14} className="text-emerald-500" />
// //                     {completedLessonIds.size} Lessons Done
// //                   </span>
// //                 </div>
// //               </div>

// //               <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[28px] p-4 shadow-xl space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
// //                 <h3 className="text-base font-black px-2 text-gray-900 dark:text-white flex items-center gap-2">
// //                   Course Syllabus
// //                 </h3>

// //                 <div className="space-y-2">
// //                   {phases.map((phase) => {
// //                     const isOpen = !!openPhases[phase.id];
// //                     const phaseDone = isPhaseCompleted(phase);

// //                     return (
// //                       <div
// //                         key={phase.id}
// //                         className="border border-gray-200/80 dark:border-white/10 rounded-2xl overflow-hidden transition-all bg-gray-50/50 dark:bg-white/[0.02]"
// //                       >
// //                         <button
// //                           onClick={() => togglePhaseAccordion(phase.id)}
// //                           className="w-full text-left p-3.5 flex items-center justify-between hover:bg-purple-500/5 transition-colors"
// //                         >
// //                           <div className="flex items-center gap-2.5 pr-2">
// //                             {phaseDone ? (
// //                               <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
// //                             ) : (
// //                               <div className="w-4 h-4 rounded-full border-2 border-purple-500/40 shrink-0" />
// //                             )}
// //                             <div>
// //                               <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">
// //                                 Phase {phase.phase_number}
// //                               </span>
// //                               <h4 className="font-bold text-xs md:text-sm text-gray-900 dark:text-white line-clamp-1">
// //                                 {phase.title}
// //                               </h4>
// //                             </div>
// //                           </div>

// //                           {isOpen ? (
// //                             <ChevronDown size={16} className="text-gray-400 shrink-0" />
// //                           ) : (
// //                             <ChevronRight size={16} className="text-gray-400 shrink-0" />
// //                           )}
// //                         </button>

// //                         {isOpen && (
// //                           <div className="p-2 pt-0 space-y-1.5 border-t border-gray-200/50 dark:border-white/5">
// //                             {phase.course_lessons?.map((lesson) => {
// //                               const isSelected = selectedLesson?.id === lesson.id;
// //                               const isDone = completedLessonIds.has(lesson.id);

// //                               return (
// //                                 <button
// //                                   key={lesson.id}
// //                                   onClick={() => setSelectedLesson(lesson)}
// //                                   className={`w-full text-left rounded-xl p-2.5 transition-all flex items-center justify-between border ${
// //                                     isSelected
// //                                       ? "bg-purple-600 text-white border-transparent shadow-md"
// //                                       : "bg-white dark:bg-white/[0.03] border-gray-200/60 dark:border-white/5 hover:border-purple-500/30"
// //                                   }`}
// //                                 >
// //                                   <div className="flex items-center gap-2 min-w-0 pr-2">
// //                                     {isDone ? (
// //                                       <CheckCircle2
// //                                         size={15}
// //                                         className={isSelected ? "text-white" : "text-emerald-500"}
// //                                       />
// //                                     ) : (
// //                                       <Circle
// //                                         size={15}
// //                                         className={isSelected ? "text-white/70" : "text-gray-400"}
// //                                       />
// //                                     )}
// //                                     <span
// //                                       className={`text-xs font-bold truncate ${
// //                                         isSelected
// //                                           ? "text-white"
// //                                           : "text-gray-800 dark:text-gray-200"
// //                                       }`}
// //                                     >
// //                                       {lesson.title}
// //                                     </span>
// //                                   </div>
// //                                   <ChevronRight
// //                                     size={13}
// //                                     className={isSelected ? "text-white/80" : "text-gray-400"}
// //                                   />
// //                                 </button>
// //                               );
// //                             })}
// //                           </div>
// //                         )}
// //                       </div>
// //                     );
// //                   })}
// //                 </div>
// //               </div>
// //             </div>

// //             {/* Right Main Panel: Active Lesson Content */}
// //             <div className="lg:col-span-8">
// //               <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[32px] p-6 md:p-8 shadow-xl">
// //                 {selectedLesson ? (
// //                   <div>
// //                     <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
// //                       <div>
// //                         <span className="text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
// //                           Active Lesson
// //                         </span>
// //                         <h2 className="text-2xl md:text-3xl font-black mt-2 text-gray-900 dark:text-white">
// //                           {selectedLesson.title}
// //                         </h2>
// //                       </div>

// //                       <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border ${
// //                         completedLessonIds.has(selectedLesson.id)
// //                           ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
// //                           : "bg-amber-500/10 text-amber-500 border-amber-500/20"
// //                       }`}>
// //                         {completedLessonIds.has(selectedLesson.id) ? (
// //                           <>
// //                             <CheckCircle2 size={16} /> Completed (Passed)
// //                           </>
// //                         ) : (
// //                           <>
// //                             <AlertCircle size={16} /> Quiz Required to Complete
// //                           </>
// //                         )}
// //                       </div>
// //                     </div>

// //                     <div className="border-t border-gray-100 dark:border-white/[0.08] pt-6 space-y-6">
// //                       {selectedLesson.video_url && (
// //                         <div className="relative rounded-2xl overflow-hidden aspect-video bg-black shadow-lg border border-gray-200/20 dark:border-white/10">
// //                           <iframe
// //                             src={selectedLesson.video_url}
// //                             title="Lesson Video"
// //                             className="w-full h-full border-0"
// //                             allowFullScreen
// //                           />
// //                         </div>
// //                       )}

// //                       {/* Dynamic Result Message Banner */}
// //                       {quizResult && (
// //                         <div className={`p-4 rounded-xl border text-xs md:text-sm font-bold flex items-center gap-2.5 ${
// //                           quizResult.passed 
// //                             ? "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300" 
// //                             : "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300"
// //                         }`}>
// //                           {quizResult.passed ? (
// //                             <span>🎉 You passed! Please wait for your teacher to unlock your next lesson.</span>
// //                           ) : (
// //                             <span>⚠️ You did not pass. Please review the material above and retake the exam.</span>
// //                           )}
// //                         </div>
// //                       )}

// //                       {selectedLesson.content ? (
// //                         <div className="bg-gray-50/80 dark:bg-white/[0.02] p-5 md:p-6 rounded-2xl border border-gray-200/60 dark:border-white/5 space-y-3">
// //                           <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
// //                             {selectedLesson.content}
// //                           </p>
// //                         </div>
// //                       ) : (
// //                         <div className="text-center py-6 text-gray-400">
// //                           <p className="text-sm">No notes or study materials specified for this lesson yet.</p>
// //                         </div>
// //                       )}

// //                       {/* Homework Toggle Section */}
// //                       <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/10">
// //                         {lessonAssignment ? (
// //                           <div className="space-y-4">
// //                             <button
// //                               onClick={() => setHomeworkOpen(!homeworkOpen)}
// //                               className="w-full py-3.5 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white rounded-2xl font-black text-sm flex items-center justify-between shadow-lg shadow-blue-500/20 transition"
// //                             >
// //                               <span className="flex items-center gap-2">
// //                                 <FileText size={18} />
// //                                 Homework: {lessonAssignment.task_name}
// //                               </span>
// //                               <span>{homeworkOpen ? "Hide" : "View & Submit"}</span>
// //                             </button>

// //                             {homeworkOpen && (
// //                               <div className="bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-6 space-y-4">
// //                                 <p className="text-sm text-gray-600 dark:text-gray-300">
// //                                   {lessonAssignment.description || lessonAssignment.instructions || "Complete the task and submit your link."}
// //                                 </p>

// //                                 <form onSubmit={handleSubmitHomework} className="space-y-3">
// //                                   <input
// //                                     type="url"
// //                                     placeholder="Paste your project URL..."
// //                                     value={submissionText}
// //                                     onChange={(e) => setSubmissionText(e.target.value)}
// //                                     required
// //                                     className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
// //                                   />
// //                                   <button
// //                                     type="submit"
// //                                     disabled={submittingHomework}
// //                                     className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm shadow-md transition"
// //                                   >
// //                                     {submittingHomework ? "Submitting..." : "Submit Homework"}
// //                                   </button>
// //                                 </form>
// //                               </div>
// //                             )}
// //                           </div>
// //                         ) : (
// //                           <div className="w-full py-3.5 px-5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-center text-gray-400 text-sm font-bold">
// //                             No homework for this lesson
// //                           </div>
// //                         )}
// //                       </div>

// //                       {/* LESSON QUIZ ASSESSMENT SECTION (Closed by default) */}
// //                       {lessonQuiz && lessonQuiz.quiz_questions && lessonQuiz.quiz_questions.length > 0 ? (
// //                         <div className="mt-8 border border-purple-100 dark:border-purple-500/20 rounded-2xl overflow-hidden bg-purple-50/40 dark:bg-purple-500/5">
// //                           {/* Quiz Accordion Header */}
// //                           <button
// //                             onClick={() => setQuizAccordionOpen(!quizAccordionOpen)}
// //                             className="w-full p-4 flex items-center justify-between text-left hover:bg-purple-500/5 transition-colors"
// //                           >
// //                             <div className="flex items-center gap-3">
// //                               <span className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
// //                                 📝
// //                               </span>
// //                               <div>
// //                                 <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
// //                                   Lesson Assessment
// //                                 </span>
// //                                 <h3 className="text-sm md:text-base font-black text-gray-900 dark:text-white">
// //                                   {lessonQuiz.title}
// //                                 </h3>
// //                               </div>
// //                             </div>
// //                             <div className="flex items-center gap-2">
// //                               {quizResult && (
// //                                 <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
// //                                   quizResult.passed ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
// //                                 }`}>
// //                                   Score: {quizResult.score}%
// //                                 </span>
// //                               )}
// //                               {quizAccordionOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
// //                             </div>
// //                           </button>

// //                           {/* Quiz Accordion Body */}
// //                           {quizAccordionOpen && (
// //                             <div className="p-6 pt-0 border-t border-purple-100 dark:border-purple-500/20 space-y-6 mt-4">
// //                               {quizResult && (
// //                                 <div className="space-y-3">
// //                                   <div className={`p-4 rounded-xl border flex items-center justify-between ${
// //                                     quizResult.passed 
// //                                       ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
// //                                       : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
// //                                   }`}>
// //                                     <div className="flex items-center gap-2.5 font-bold text-sm">
// //                                       {quizResult.passed ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
// //                                       <span>
// //                                         {quizResult.passed 
// //                                           ? `Passed! You scored ${quizResult.score}%` 
// //                                           : `You scored ${quizResult.score}%. Lesson progress is locked.`}
// //                                       </span>
// //                                     </div>
// //                                     {!quizResult.passed && (
// //                                       isSaturdayMorning() ? (
// //                                         <button
// //                                           onClick={() => setQuizResult(null)}
// //                                           className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-rose-700 transition-all"
// //                                         >
// //                                           <RotateCcw size={14} /> Retake Quiz
// //                                         </button>
// //                                       ) : (
// //                                         <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
// //                                           <Lock size={12} /> Retakes available Saturday mornings only
// //                                         </span>
// //                                       )
// //                                     )}
// //                                   </div>

// //                                   {/* Tutor Feedback / Study Hint Card */}
// //                                   {!quizResult.passed && (
// //                                     <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs space-y-2">
// //                                       <div className="flex items-center gap-1.5 font-bold">
// //                                         <Lightbulb size={16} className="text-amber-500 shrink-0" />
// //                                         <span>Tutor Guidance & Study Hint</span>
// //                                       </div>
// //                                       <p className="leading-relaxed">
// //                                         You did not reach the passing threshold for this assessment. Please thoroughly review the study notes and video content above. Your progress is temporarily locked until your tutor reviews your attempt during your next scheduled live session, or you may retake it during the Saturday morning window.
// //                                       </p>
// //                                     </div>
// //                                   )}
// //                                 </div>
// //                               )}

// //                               <form onSubmit={handleQuizSubmit} className="space-y-6">
// //                                 {lessonQuiz.quiz_questions.map((q, qIdx) => {
// //                                   const selectedOpt = quizAnswers[qIdx];
// //                                   const isSubmitted = !!quizResult;
// //                                   const isCorrectOption = selectedOpt === q.correct_option_index;

// //                                   return (
// //                                     <div key={q.id || qIdx} className="space-y-3 p-4 bg-white dark:bg-slate-900/40 rounded-xl border border-gray-200/60 dark:border-white/10">
// //                                       <div className="flex items-center justify-between">
// //                                         <p className="text-sm font-bold text-gray-900 dark:text-white">
// //                                           {qIdx + 1}. {q.question_text}
// //                                         </p>
// //                                       </div>

// //                                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
// //                                         {q.options.map((opt, optIdx) => {
// //                                           let btnStyle = "bg-gray-50/50 dark:bg-white/[0.02] border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200";
                                          
// //                                           if (selectedOpt === optIdx) {
// //                                             btnStyle = "bg-purple-600 text-white border-purple-600 shadow-sm";
// //                                           }

// //                                           if (isSubmitted) {
// //                                             if (optIdx === q.correct_option_index) {
// //                                               btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold";
// //                                             } else if (selectedOpt === optIdx && !isCorrectOption) {
// //                                               btnStyle = "bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300 font-bold";
// //                                             }
// //                                           }

// //                                           return (
// //                                             <label
// //                                               key={optIdx}
// //                                               className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${btnStyle}`}
// //                                             >
// //                                               <input
// //                                                 type="radio"
// //                                                 name={`question-${qIdx}`}
// //                                                 checked={selectedOpt === optIdx}
// //                                                 onChange={() => setQuizAnswers({ ...quizAnswers, [qIdx]: optIdx })}
// //                                                 disabled={isSubmitted}
// //                                                 className="hidden"
// //                                               />
// //                                               <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 text-[10px] font-bold">
// //                                                 {String.fromCharCode(65 + optIdx)}
// //                                               </span>
// //                                               <span className="flex-1">{opt}</span>
// //                                             </label>
// //                                           );
// //                                         })}
// //                                       </div>
// //                                     </div>
// //                                   );
// //                                 })}

// //                                 {!quizResult && (
// //                                   <div className="flex justify-end pt-2">
// //                                     <button
// //                                       type="submit"
// //                                       disabled={submittingQuiz}
// //                                       className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-purple-500/20 transition-all disabled:opacity-50"
// //                                     >
// //                                       {submittingQuiz ? "Evaluating..." : "Submit Assessment"}
// //                                     </button>
// //                                   </div>
// //                                 )}
// //                               </form>
// //                             </div>
// //                           )}
// //                         </div>
// //                       ) : (
// //                         <div className="mt-8 p-6 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5 rounded-2xl text-center">
// //                           <p className="text-xs text-gray-400">No assessment quiz published for this lesson yet.</p>
// //                         </div>
// //                       )}
// //                     </div>
// //                   </div>
// //                 ) : (
// //                   <div className="text-center py-20 text-gray-400">
// //                     <BookOpen size={48} className="mx-auto mb-4 opacity-40 text-purple-500" />
// //                     <p className="text-base font-bold text-gray-700 dark:text-gray-300">
// //                       Select a lesson from the syllabus sidebar to begin learning.
// //                     </p>
// //                   </div>
// //                 )}
// //               </div>
// //             </div>
// //           </div>
// //         )
// //       )}
// //     </div>
// //   );
// // }

// // // import React, { useEffect, useState } from "react";
// // // import {
// // //   BookOpen,
// // //   ChevronRight,
// // //   ChevronDown,
// // //   CheckCircle2,
// // //   Circle,
// // //   Layers,
// // //   AlertCircle,
// // //   RotateCcw,
// // //   Check,
// // //   X,
// // //   Lock,
// // //   Lightbulb
// // // } from "lucide-react";
// // // import { supabase } from "../../../supabase";
// // // import toast from "react-hot-toast";
// // // import StudentHomeworkView from "./StudentHomeworkView"; // Adjust path as needed
// // // export default function StudentCoursesView({ userId, courseId }) {
// // //   const [loading, setLoading] = useState(true);
// // //   const [courses, setCourses] = useState([]);
// // //   const [activeCourse, setActiveCourse] = useState(null);

// // //   // Structured Phase -> Lessons state
// // //   const [phases, setPhases] = useState([]);
// // //   const [selectedLesson, setSelectedLesson] = useState(null);
// // //   const [completedLessonIds, setCompletedLessonIds] = useState(new Set());

// // //   // Track open/collapsed phases by phase ID
// // //   const [openPhases, setOpenPhases] = useState({});

// // //   // Quiz state for active lesson
// // //   const [lessonQuiz, setLessonQuiz] = useState(null);
// // //   const [quizAnswers, setQuizAnswers] = useState({});
// // //   const [submittingQuiz, setSubmittingQuiz] = useState(false);
// // //   const [quizResult, setQuizResult] = useState(null); // { score, passed, attemptsCount }
// // //   const [quizAccordionOpen, setQuizAccordionOpen] = useState(false); // Closed by default

// // //   const [lessonAssignment, setLessonAssignment] = useState(null);
// // // const [submissionText, setSubmissionText] = useState("");
// // // const [submittingHomework, setSubmittingHomework] = useState(false);
// // // const [homeworkOpen, setHomeworkOpen] = useState(false);

// // //   useEffect(() => {
// // //     if (userId) {
// // //       initialLoad();
// // //     }
// // //   }, [userId, courseId]);

// // //   useEffect(() => {
// // //     if (selectedLesson) {
// // //       setLessonQuiz(null);
// // //       setQuizAnswers({});
// // //       setQuizResult(null);
// // //       setQuizAccordionOpen(false); // Closed by default on lesson change
// // //       fetchLessonData(selectedLesson.id);
// // //     }
// // //   }, [selectedLesson?.id]);

// // //   const initialLoad = async () => {
// // //     try {
// // //       setLoading(true);

// // //       const { data: userData, error: userError } = await supabase
// // //         .from("users")
// // //         .select(`
// // //           assigned_course_id,
// // //           courses:assigned_course_id (*)
// // //         `)
// // //         .eq("id", userId)
// // //         .single();

// // //       if (userError) throw userError;

// // //       const assignedCourse = userData?.courses ? [userData.courses] : [];
// // //       setCourses(assignedCourse);

// // //       const defaultCourse = assignedCourse[0] || null;
// // //       setActiveCourse(defaultCourse);

// // //       if (defaultCourse) {
// // //         const completedIds = await fetchLessonProgress();
// // //         await fetchCourseSyllabus(defaultCourse.id, completedIds);
// // //       }
// // //     } catch (err) {
// // //       console.error("Error fetching student data:", err.message);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   const fetchLessonProgress = async () => {
// // //     try {
// // //       const { data: progressData, error } = await supabase
// // //         .from("student_lesson_progress")
// // //         .select("lesson_id, status")
// // //         .eq("student_id", userId)
// // //         .eq("status", "completed");

// // //       if (error) throw error;

// // //       const completedSet = new Set(progressData.map((p) => p.lesson_id));
// // //       setCompletedLessonIds(completedSet);
// // //       return completedSet;
// // //     } catch (err) {
// // //       console.error("Error fetching progress:", err.message);
// // //       return new Set();
// // //     }
// // //   };

// // //   const fetchCourseSyllabus = async (targetCourseId, completedIds = completedLessonIds) => {
// // //     try {
// // //       const { data: phaseData, error } = await supabase
// // //         .from("course_phases")
// // //         .select(`
// // //           id,
// // //           phase_number,
// // //           title,
// // //           focus,
// // //           course_lessons (
// // //             id,
// // //             title,
// // //             position,
// // //             created_at
// // //           )
// // //         `)
// // //         .eq("course_id", targetCourseId)
// // //         .order("phase_number", { ascending: true });

// // //       if (error) throw error;

// // //       const { data: notesData } = await supabase
// // //         .from("notes")
// // //         .select("*")
// // //         .eq("course_id", targetCourseId);

// // //       const structuredPhases = (phaseData || []).map((phase) => ({
// // //         ...phase,
// // //         course_lessons: (phase.course_lessons || [])
// // //           .sort((a, b) => (a.position || 0) - (b.position || 0))
// // //           .map((lesson) => {
// // //             const matchingNote = (notesData || []).find(
// // //               (n) => n.title.toLowerCase() === lesson.title.toLowerCase()
// // //             );
// // //             return {
// // //               ...lesson,
// // //               content: matchingNote?.content || "",
// // //               video_url: matchingNote?.video_url || ""
// // //             };
// // //           })
// // //       }));

// // //       setPhases(structuredPhases);

// // //       const activePhase =
// // //         structuredPhases.find((phase) =>
// // //           phase.course_lessons?.some((lesson) => !completedIds.has(lesson.id))
// // //         ) || structuredPhases[0];

// // //       const initialOpenState = {};
// // //       structuredPhases.forEach((p) => {
// // //         initialOpenState[p.id] = p.id === activePhase?.id;
// // //       });

// // //       setOpenPhases(initialOpenState);

// // //       const firstIncompleteLesson =
// // //         activePhase?.course_lessons?.find((l) => !completedIds.has(l.id)) ||
// // //         activePhase?.course_lessons?.[0] ||
// // //         null;

// // //       setSelectedLesson(firstIncompleteLesson);
// // //     } catch (err) {
// // //       console.error("Error fetching syllabus:", err.message);
// // //     }
// // //   };
// // // const fetchLessonHomework = async (lessonId) => {
// // //   try {
// // //     const { data, error } = await supabase
// // //       .from("student_assignments")
// // //       .select("*")
// // //       .eq("student_id", userId)
// // //       .eq("lesson_id", lessonId)
// // //       .maybeSingle();

// // //     if (error) throw error;
// // //     setLessonAssignment(data || null);
// // //     setSubmissionText(data?.submission_link || "");
// // //   } catch (err) {
// // //     console.error("Error fetching lesson homework:", err.message);
// // //   }
// // // };
// // //   const fetchLessonData = async (lessonId) => {
// // //     try {
// // //       const { data: quizData, error: qErr } = await supabase
// // //         .from("quizzes")
// // //         .select("*, quiz_questions(*)")
// // //         .eq("lesson_id", lessonId)
// // //         .maybeSingle();

// // //       if (qErr) throw qErr;
// // //       setLessonQuiz(quizData || null);

// // //       if (quizData) {
// // //         const { data: attempts, error: attErr } = await supabase
// // //           .from("student_quiz_attempts")
// // //           .select("*")
// // //           .eq("student_id", userId)
// // //           .eq("quiz_id", quizData.id)
// // //           .order("completed_at", { ascending: false });

// // //         if (!attErr && attempts && attempts.length > 0) {
// // //           const latestAttempt = attempts[0];
// // //           setQuizResult({
// // //             score: latestAttempt.score,
// // //             passed: latestAttempt.passed,
// // //             attemptsCount: attempts.length
// // //           });

// // //           // Pre-populate answers from the latest attempt if stored, or leave empty
// // //         }
// // //       }
// // //     } catch (err) {
// // //       console.error("Error fetching lesson data:", err.message);
// // //       setLessonQuiz(null);
// // //     }
// // //   };

// // //   const markLessonComplete = async (lessonId) => {
// // //     try {
// // //       const { error } = await supabase.from("student_lesson_progress").upsert(
// // //         {
// // //           student_id: userId,
// // //           lesson_id: lessonId,
// // //           status: "completed",
// // //           completed_at: new Date().toISOString()
// // //         },
// // //         { onConflict: "student_id,lesson_id" }
// // //       );

// // //       if (error) throw error;

// // //       setCompletedLessonIds((prev) => {
// // //         const next = new Set(prev);
// // //         next.add(lessonId);
// // //         return next;
// // //       });
// // //     } catch (err) {
// // //       console.error("Error marking lesson complete:", err.message);
// // //     }
// // //   };

// // //   const handleQuizSubmit = async (e) => {
// // //     e.preventDefault();
// // //     if (!lessonQuiz || !lessonQuiz.quiz_questions) return;

// // //     setSubmittingQuiz(true);
// // //     try {
// // //       const questions = lessonQuiz.quiz_questions;
// // //       let correctCount = 0;

// // //       questions.forEach((q, idx) => {
// // //         if (quizAnswers[idx] === q.correct_option_index) {
// // //           correctCount++;
// // //         }
// // //       });

// // //       const score = Math.round((correctCount / questions.length) * 100);
// // //       const passingScore = lessonQuiz.passing_score || 70;
// // //       const passed = score >= passingScore;

// // //       await supabase.from("student_quiz_attempts").insert({
// // //         student_id: userId,
// // //         quiz_id: lessonQuiz.id,
// // //         score,
// // //         passed
// // //       });

// // //       setQuizResult({ score, passed, attemptsCount: 1 });

// // //       if (passed) {
// // //         await markLessonComplete(selectedLesson.id);
// // //         toast.success(`Passed! You got ${score}% 🎉`);
// // //       } else {
// // //         toast.error(`You got ${score}%. Assessment failed. Locked until Saturday morning retake.`);
// // //       }
// // //     } catch (err) {
// // //       toast.error("Failed to submit quiz: " + err.message);
// // //     } finally {
// // //       setSubmittingQuiz(false);
// // //     }
// // //   };

// // //   const handleSelectCourse = (course) => {
// // //     setOpenPhases({});
// // //     setSelectedLesson(null);
// // //     setActiveCourse(course);
// // //     fetchCourseSyllabus(course.id);
// // //   };

// // //   const togglePhaseAccordion = (phaseId) => {
// // //     setOpenPhases((prev) => ({
// // //       ...prev,
// // //       [phaseId]: !prev[phaseId]
// // //     }));
// // //   };

// // //   const isPhaseCompleted = (phase) => {
// // //     if (!phase.course_lessons || phase.course_lessons.length === 0) return false;
// // //     return phase.course_lessons.every((lesson) => completedLessonIds.has(lesson.id));
// // //   };

// // //   const isSaturdayMorning = () => {
// // //     const now = new Date();
// // //     const day = now.getDay(); // 6 is Saturday
// // //     const hour = now.getHours();
// // //     return day === 6 && hour < 12;
// // //   };

// // //   if (loading) {
// // //     return (
// // //       <div className="min-h-[60vh] flex items-center justify-center">
// // //         <div className="bg-white/10 dark:bg-white/[0.04] backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[30px] p-8 text-center shadow-xl">
// // //           <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
// // //           <h2 className="text-gray-900 dark:text-white text-xl font-bold">
// // //             Loading Learning Workspace...
// // //           </h2>
// // //           <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
// // //             Fetching your interactive curriculum 🚀
// // //           </p>
// // //         </div>
// // //       </div>
// // //     );
// // //   }

// // //   return (
// // //     <div className="space-y-6 p-4 md:p-8 text-gray-900 dark:text-white max-w-7xl mx-auto">
// // //       {courses.length > 0 && (
// // //         <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
// // //           {courses.map((course) => {
// // //             const isSelected = activeCourse?.id === course.id;
// // //             return (
// // //               <button
// // //                 key={course.id}
// // //                 onClick={() => handleSelectCourse(course)}
// // //                 className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-left shrink-0 transition-all ${
// // //                   isSelected
// // //                     ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20"
// // //                     : "bg-white dark:bg-white/[0.04] border-gray-200 dark:border-white/10 hover:border-purple-500/40 text-gray-700 dark:text-gray-200"
// // //                 }`}
// // //               >
// // //                 <div className="w-8 h-8 rounded-lg overflow-hidden bg-purple-500/20 shrink-0 flex items-center justify-center font-bold text-xs">
// // //                   {course.thumbnail_url ? (
// // //                     <img
// // //                       src={course.thumbnail_url}
// // //                       alt={course.title}
// // //                       className="w-full h-full object-cover"
// // //                     />
// // //                   ) : (
// // //                     <BookOpen size={16} className={isSelected ? "text-white" : "text-purple-500"} />
// // //                   )}
// // //                 </div>
// // //                 <span className="font-bold text-sm max-w-[180px] truncate">
// // //                   {course.title}
// // //                 </span>
// // //               </button>
// // //             );
// // //           })}
// // //         </div>
// // //       )}

// // //       {courses.length === 0 ? (
// // //         <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-[32px] p-12 text-center shadow-lg">
// // //           <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
// // //             🎓
// // //           </div>
// // //           <h3 className="text-xl font-bold">No Registered Courses Found</h3>
// // //           <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto text-sm">
// // //             You are not currently enrolled in any active courses. Please contact your administrator or instructor.
// // //           </p>
// // //         </div>
// // //       ) : (
// // //         activeCourse && (
// // //           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
// // //             {/* Left Sidebar: Syllabus */}
// // //             <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-6">
// // //               <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[28px] overflow-hidden shadow-xl p-5">
// // //                 <div className="relative h-36 rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
// // //                   {activeCourse.thumbnail_url ? (
// // //                     <img
// // //                       src={activeCourse.thumbnail_url}
// // //                       alt={activeCourse.title}
// // //                       className="w-full h-full object-cover"
// // //                     />
// // //                   ) : (
// // //                     <div className="text-center p-4">
// // //                       <BookOpen size={36} className="text-white/80 mx-auto mb-1" />
// // //                       <span className="text-xs font-bold text-white/70 uppercase tracking-widest">
// // //                         Course Track
// // //                       </span>
// // //                     </div>
// // //                   )}
// // //                   <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
// // //                   <h2 className="absolute bottom-3 left-4 right-4 font-black text-white text-lg line-clamp-1">
// // //                     {activeCourse.title}
// // //                   </h2>
// // //                 </div>

// // //                 <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 px-1">
// // //                   <span className="flex items-center gap-1.5">
// // //                     <Layers size={14} className="text-purple-500" />
// // //                     {phases.length} Phases
// // //                   </span>
// // //                   <span className="flex items-center gap-1.5">
// // //                     <CheckCircle2 size={14} className="text-emerald-500" />
// // //                     {completedLessonIds.size} Lessons Done
// // //                   </span>
// // //                 </div>
// // //               </div>

// // //               <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[28px] p-4 shadow-xl space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
// // //                 <h3 className="text-base font-black px-2 text-gray-900 dark:text-white flex items-center gap-2">
// // //                   Course Syllabus
// // //                 </h3>

// // //                 <div className="space-y-2">
// // //                   {phases.map((phase) => {
// // //                     const isOpen = !!openPhases[phase.id];
// // //                     const phaseDone = isPhaseCompleted(phase);

// // //                     return (
// // //                       <div
// // //                         key={phase.id}
// // //                         className="border border-gray-200/80 dark:border-white/10 rounded-2xl overflow-hidden transition-all bg-gray-50/50 dark:bg-white/[0.02]"
// // //                       >
// // //                         <button
// // //                           onClick={() => togglePhaseAccordion(phase.id)}
// // //                           className="w-full text-left p-3.5 flex items-center justify-between hover:bg-purple-500/5 transition-colors"
// // //                         >
// // //                           <div className="flex items-center gap-2.5 pr-2">
// // //                             {phaseDone ? (
// // //                               <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
// // //                             ) : (
// // //                               <div className="w-4 h-4 rounded-full border-2 border-purple-500/40 shrink-0" />
// // //                             )}
// // //                             <div>
// // //                               <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">
// // //                                 Phase {phase.phase_number}
// // //                               </span>
// // //                               <h4 className="font-bold text-xs md:text-sm text-gray-900 dark:text-white line-clamp-1">
// // //                                 {phase.title}
// // //                               </h4>
// // //                             </div>
// // //                           </div>

// // //                           {isOpen ? (
// // //                             <ChevronDown size={16} className="text-gray-400 shrink-0" />
// // //                           ) : (
// // //                             <ChevronRight size={16} className="text-gray-400 shrink-0" />
// // //                           )}
// // //                         </button>

// // //                         {isOpen && (
// // //                           <div className="p-2 pt-0 space-y-1.5 border-t border-gray-200/50 dark:border-white/5">
// // //                             {phase.course_lessons?.map((lesson) => {
// // //                               const isSelected = selectedLesson?.id === lesson.id;
// // //                               const isDone = completedLessonIds.has(lesson.id);

// // //                               return (
// // //                                 <button
// // //                                   key={lesson.id}
// // //                                   onClick={() => setSelectedLesson(lesson)}
// // //                                   className={`w-full text-left rounded-xl p-2.5 transition-all flex items-center justify-between border ${
// // //                                     isSelected
// // //                                       ? "bg-purple-600 text-white border-transparent shadow-md"
// // //                                       : "bg-white dark:bg-white/[0.03] border-gray-200/60 dark:border-white/5 hover:border-purple-500/30"
// // //                                   }`}
// // //                                 >
// // //                                   <div className="flex items-center gap-2 min-w-0 pr-2">
// // //                                     {isDone ? (
// // //                                       <CheckCircle2
// // //                                         size={15}
// // //                                         className={isSelected ? "text-white" : "text-emerald-500"}
// // //                                       />
// // //                                     ) : (
// // //                                       <Circle
// // //                                         size={15}
// // //                                         className={isSelected ? "text-white/70" : "text-gray-400"}
// // //                                       />
// // //                                     )}
// // //                                     <span
// // //                                       className={`text-xs font-bold truncate ${
// // //                                         isSelected
// // //                                           ? "text-white"
// // //                                           : "text-gray-800 dark:text-gray-200"
// // //                                       }`}
// // //                                     >
// // //                                       {lesson.title}
// // //                                     </span>
// // //                                   </div>
// // //                                   <ChevronRight
// // //                                     size={13}
// // //                                     className={isSelected ? "text-white/80" : "text-gray-400"}
// // //                                   />
// // //                                 </button>
// // //                               );
// // //                             })}
// // //                           </div>
// // //                         )}
// // //                       </div>
// // //                     );
// // //                   })}
// // //                 </div>
// // //               </div>
// // //             </div>

// // //             {/* Right Main Panel: Active Lesson Content */}
// // //             <div className="lg:col-span-8">
// // //               <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[32px] p-6 md:p-8 shadow-xl">
// // //                 {selectedLesson ? (
// // //                   <div>
// // //                     <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
// // //                       <div>
// // //                         <span className="text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
// // //                           Active Lesson
// // //                         </span>
// // //                         <h2 className="text-2xl md:text-3xl font-black mt-2 text-gray-900 dark:text-white">
// // //                           {selectedLesson.title}
// // //                         </h2>
// // //                       </div>

// // //                       <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border ${
// // //                         completedLessonIds.has(selectedLesson.id)
// // //                           ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
// // //                           : "bg-amber-500/10 text-amber-500 border-amber-500/20"
// // //                       }`}>
// // //                         {completedLessonIds.has(selectedLesson.id) ? (
// // //                           <>
// // //                             <CheckCircle2 size={16} /> Completed (Passed)
// // //                           </>
// // //                         ) : (
// // //                           <>
// // //                             <AlertCircle size={16} /> Quiz Required to Complete
// // //                           </>
// // //                         )}
// // //                       </div>
// // //                     </div>

// // //                     <div className="border-t border-gray-100 dark:border-white/[0.08] pt-6 space-y-6">
// // //                       {selectedLesson.video_url && (
// // //                         <div className="relative rounded-2xl overflow-hidden aspect-video bg-black shadow-lg border border-gray-200/20 dark:border-white/10">
// // //                           <iframe
// // //                             src={selectedLesson.video_url}
// // //                             title="Lesson Video"
// // //                             className="w-full h-full border-0"
// // //                             allowFullScreen
// // //                           />
// // //                         </div>
// // //                       )}
// // // {/* Dynamic Result Message Banner */}
// // // {quizResult && (
// // //   <div className={`p-4 rounded-xl border text-xs md:text-sm font-bold flex items-center gap-2.5 ${
// // //     quizResult.passed 
// // //       ? "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300" 
// // //       : "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300"
// // //   }`}>
// // //     {quizResult.passed ? (
// // //       <span>🎉 You passed! Please wait for your teacher to unlock your next lesson.</span>
// // //     ) : (
// // //       <span>⚠️ You did not pass. Please review the material above and retake the exam.</span>
// // //     )}
// // //   </div>
// // // )}
// // //                       {selectedLesson.content ? (
// // //                         <div className="bg-gray-50/80 dark:bg-white/[0.02] p-5 md:p-6 rounded-2xl border border-gray-200/60 dark:border-white/5 space-y-3">
// // //                           <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
// // //                             {selectedLesson.content}
// // //                           </p>
// // //                         </div>
// // //                       ) : (
// // //                         <div className="text-center py-6 text-gray-400">
// // //                           <p className="text-sm">No notes or study materials specified for this lesson yet.</p>
// // //                         </div>
// // //                       )}
// // //  {/* Homework Toggle Section */}
// // // <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/10">
// // //   {lessonAssignment ? (
// // //     <div className="space-y-4">
// // //       <button
// // //         onClick={() => setHomeworkOpen(!homeworkOpen)}
// // //         className="w-full py-3.5 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white rounded-2xl font-black text-sm flex items-center justify-between shadow-lg shadow-blue-500/20 transition"
// // //       >
// // //         <span className="flex items-center gap-2">
// // //           <FileText size={18} />
// // //           Homework: {lessonAssignment.task_name}
// // //         </span>
// // //         <span>{homeworkOpen ? "Hide" : "View & Submit"}</span>
// // //       </button>

// // //       {homeworkOpen && (
// // //         <div className="bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-6 space-y-4">
// // //           <p className="text-sm text-gray-600 dark:text-gray-300">
// // //             {lessonAssignment.description || lessonAssignment.instructions || "Complete the task and submit your link."}
// // //           </p>

// // //           <form onSubmit={handleSubmitHomework} className="space-y-3">
// // //             <input
// // //               type="url"
// // //               placeholder="Paste your project URL..."
// // //               value={submissionText}
// // //               onChange={(e) => setSubmissionText(e.target.value)}
// // //               required
// // //               className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
// // //             />
// // //             <button
// // //               type="submit"
// // //               disabled={submittingHomework}
// // //               className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm shadow-md transition"
// // //             >
// // //               {submittingHomework ? "Submitting..." : "Submit Homework"}
// // //             </button>
// // //           </form>
// // //         </div>
// // //       )}
// // //     </div>
// // //   ) : (
// // //     <div className="w-full py-3.5 px-5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-center text-gray-400 text-sm font-bold">
// // //       No homework for this lesson
// // //     </div>
// // //   )}
// // // </div>

// // //                       {/* LESSON QUIZ ASSESSMENT SECTION (Closed by default) */}
// // //                       {lessonQuiz && lessonQuiz.quiz_questions && lessonQuiz.quiz_questions.length > 0 ? (
// // //                         <div className="mt-8 border border-purple-100 dark:border-purple-500/20 rounded-2xl overflow-hidden bg-purple-50/40 dark:bg-purple-500/5">
// // //                           {/* Quiz Accordion Header */}
// // //                           <button
// // //                             onClick={() => setQuizAccordionOpen(!quizAccordionOpen)}
// // //                             className="w-full p-4 flex items-center justify-between text-left hover:bg-purple-500/5 transition-colors"
// // //                           >
// // //                             <div className="flex items-center gap-3">
// // //                               <span className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
// // //                                 📝
// // //                               </span>
// // //                               <div>
// // //                                 <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
// // //                                   Lesson Assessment
// // //                                 </span>
// // //                                 <h3 className="text-sm md:text-base font-black text-gray-900 dark:text-white">
// // //                                   {lessonQuiz.title}
// // //                                 </h3>
// // //                               </div>
// // //                             </div>
// // //                             <div className="flex items-center gap-2">
// // //                               {quizResult && (
// // //                                 <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
// // //                                   quizResult.passed ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
// // //                                 }`}>
// // //                                   Score: {quizResult.score}%
// // //                                 </span>
// // //                               )}
// // //                               {quizAccordionOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
// // //                             </div>
// // //                           </button>

// // //                           {/* Quiz Accordion Body */}
// // //                           {quizAccordionOpen && (
// // //                             <div className="p-6 pt-0 border-t border-purple-100 dark:border-purple-500/20 space-y-6 mt-4">
// // //                               {quizResult && (
// // //                                 <div className="space-y-3">
// // //                                   <div className={`p-4 rounded-xl border flex items-center justify-between ${
// // //                                     quizResult.passed 
// // //                                       ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
// // //                                       : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
// // //                                   }`}>
// // //                                     <div className="flex items-center gap-2.5 font-bold text-sm">
// // //                                       {quizResult.passed ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
// // //                                       <span>
// // //                                         {quizResult.passed 
// // //                                           ? `Passed! You scored ${quizResult.score}%` 
// // //                                           : `You scored ${quizResult.score}%. Lesson progress is locked.`}
// // //                                       </span>
// // //                                     </div>
// // //                                     {!quizResult.passed && (
// // //                                       isSaturdayMorning() ? (
// // //                                         <button
// // //                                           onClick={() => setQuizResult(null)}
// // //                                           className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-rose-700 transition-all"
// // //                                         >
// // //                                           <RotateCcw size={14} /> Retake Quiz
// // //                                         </button>
// // //                                       ) : (
// // //                                         <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
// // //                                           <Lock size={12} /> Retakes available Saturday mornings only
// // //                                         </span>
// // //                                       )
// // //                                     )}
// // //                                   </div>

// // //                                   {/* Tutor Feedback / Study Hint Card */}
// // //                                   {!quizResult.passed && (
// // //                                     <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs space-y-2">
// // //                                       <div className="flex items-center gap-1.5 font-bold">
// // //                                         <Lightbulb size={16} className="text-amber-500 shrink-0" />
// // //                                         <span>Tutor Guidance & Study Hint</span>
// // //                                       </div>
// // //                                       <p className="leading-relaxed">
// // //                                         You did not reach the passing threshold for this assessment. Please thoroughly review the study notes and video content above. Your progress is temporarily locked until your tutor reviews your attempt during your next scheduled live session, or you may retake it during the Saturday morning window.
// // //                                       </p>
// // //                                     </div>
// // //                                   )}
// // //                                 </div>
// // //                               )}

// // //                               <form onSubmit={handleQuizSubmit} className="space-y-6">
// // //                                 {lessonQuiz.quiz_questions.map((q, qIdx) => {
// // //                                   const selectedOpt = quizAnswers[qIdx];
// // //                                   const isSubmitted = !!quizResult;
// // //                                   const isCorrectOption = selectedOpt === q.correct_option_index;

                      
// // //                                           return (
// // //   <div key={q.id || qIdx} className="space-y-3 p-4 bg-white dark:bg-slate-900/40 rounded-xl border border-gray-200/60 dark:border-white/10">
// // //     <div className="flex items-center justify-between">
// // //       <p className="text-sm font-bold text-gray-900 dark:text-white">
// // //         {qIdx + 1}. {q.question_text}
// // //       </p>
// // //     </div>

// // //     <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
// // //       {q.options.map((opt, optIdx) => {
// // //         let btnStyle = "bg-gray-50/50 dark:bg-white/[0.02] border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200";
        
// // //         if (selectedOpt === optIdx) {
// // //           btnStyle = "bg-purple-600 text-white border-purple-600 shadow-sm";
// // //         }

// // //         // Highlight correct/wrong after submission
// // //         if (isSubmitted) {
// // //           if (optIdx === Number(q.correct_option_index)) {
// // //             btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold";
// // //           } else if (selectedOpt === optIdx && !isCorrectOption) {
// // //             btnStyle = "bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300 font-bold";
// // //           }
// // //         }

// // //                                           return (
// // //                                             <label
// // //                                               key={optIdx}
// // //                                               className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${btnStyle}`}
// // //                                             >
// // //                                               <input
// // //                                                 type="radio"
// // //                                                 name={`question-${qIdx}`}
// // //                                                 checked={selectedOpt === optIdx}
// // //                                                 onChange={() => setQuizAnswers({ ...quizAnswers, [qIdx]: optIdx })}
// // //                                                 disabled={isSubmitted}
// // //                                                 className="hidden"
// // //                                               />
// // //                                               <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 text-[10px] font-bold">
// // //                                                 {String.fromCharCode(65 + optIdx)}
// // //                                               </span>
// // //                                               <span className="flex-1">{opt}</span>
// // //                                             </label>
// // //                                           );
// // //                                         })}
// // //                                       </div>
// // //                                     </div>
// // //                                   );
// // //                                 })}

// // //                                 {!quizResult && (
// // //                                   <div className="flex justify-end pt-2">
// // //                                     <button
// // //                                       type="submit"
// // //                                       disabled={submittingQuiz}
// // //                                       className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-purple-500/20 transition-all disabled:opacity-50"
// // //                                     >
// // //                                       {submittingQuiz ? "Evaluating..." : "Submit Assessment"}
// // //                                     </button>
// // //                                   </div>
// // //                                 )}
// // //                               </form>
// // //                             </div>
// // //                           )}
// // //                         </div>
// // //                       ) : (
// // //                         <div className="mt-8 p-6 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5 rounded-2xl text-center">
// // //                           <p className="text-xs text-gray-400">No assessment quiz published for this lesson yet.</p>
// // //                         </div>
// // //                       )}
// // //                     </div>
// // //                   </div>
// // //                 ) : (
// // //                   <div className="text-center py-20 text-gray-400">
// // //                     <BookOpen size={48} className="mx-auto mb-4 opacity-40 text-purple-500" />
// // //                     <p className="text-base font-bold text-gray-700 dark:text-gray-300">
// // //                       Select a lesson from the syllabus sidebar to begin learning.
// // //                     </p>
// // //                   </div>
// // //                 )}
// // //               </div>
// // //             </div>
// // //           </div>
// // //         )
// // //       )}
// // //     </div>
// // //   );
// // // }
// // // // import React, { useEffect, useState } from "react";
// // // // import {
// // // //   BookOpen,
// // // //   ChevronRight,
// // // //   ChevronDown,
// // // //   CheckCircle2,
// // // //   Circle,
// // // //   Layers,
// // // //   Rocket,
// // // //   FileText,
// // // //   HelpCircle,
// // // //   AlertCircle,
// // // //   RotateCcw
// // // // } from "lucide-react";
// // // // import { supabase } from "../../../supabase";
// // // // import toast from "react-hot-toast";

// // // // export default function StudentCoursesView({ userId, courseId }) {
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [courses, setCourses] = useState([]);
// // // //   const [activeCourse, setActiveCourse] = useState(null);

// // // //   // Structured Phase -> Lessons state
// // // //   const [phases, setPhases] = useState([]);
// // // //   const [selectedLesson, setSelectedLesson] = useState(null);
// // // //   const [completedLessonIds, setCompletedLessonIds] = useState(new Set());

// // // //   // Track open/collapsed phases by phase ID
// // // //   const [openPhases, setOpenPhases] = useState({});

// // // //   // Quiz state for active lesson
// // // //   const [lessonQuiz, setLessonQuiz] = useState(null);
// // // //   const [quizAnswers, setQuizAnswers] = useState({});
// // // //   const [submittingQuiz, setSubmittingQuiz] = useState(false);
// // // //   const [quizResult, setQuizResult] = useState(null); // { score, passed, passing_score }

// // // //   useEffect(() => {
// // // //     if (userId) {
// // // //       fetchStudentCoursesData();
// // // //     }
// // // //   }, [userId, courseId]);

// // // //   // Whenever selectedLesson changes, fetch its quiz and reset quiz state
// // // //   useEffect(() => {
// // // //     if (selectedLesson) {
// // // //       fetchLessonQuiz(selectedLesson.id);
// // // //       setQuizAnswers({});
// // // //       setQuizResult(null);
// // // //     }
// // // //   }, [selectedLesson]);

// // // //   const fetchStudentCoursesData = async () => {
// // // //     try {
// // // //       setLoading(true);

// // // //       // 1. Fetch the user's assigned course from the users table
// // // //       const { data: userData, error: userError } = await supabase
// // // //         .from("users")
// // // //         .select(`
// // // //           assigned_course_id,
// // // //           courses:assigned_course_id (*)
// // // //         `)
// // // //         .eq("id", userId)
// // // //         .single();

// // // //       if (userError) throw userError;

// // // //       const assignedCourse = userData?.courses ? [userData.courses] : [];
// // // //       setCourses(assignedCourse);

// // // //       const defaultCourse = assignedCourse[0] || null;
// // // //       setActiveCourse(defaultCourse);

// // // //       if (defaultCourse) {
// // // //         const completedIds = await fetchLessonProgress();
// // // //         await fetchCourseSyllabus(defaultCourse.id, completedIds);
// // // //       }
// // // //     } catch (err) {
// // // //       console.error("Error fetching student data:", err.message);
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   const fetchLessonProgress = async () => {
// // // //     try {
// // // //       const { data: progressData, error } = await supabase
// // // //         .from("student_lesson_progress")
// // // //         .select("lesson_id, status")
// // // //         .eq("student_id", userId)
// // // //         .eq("status", "completed");

// // // //       if (error) throw error;

// // // //       const completedSet = new Set(progressData.map((p) => p.lesson_id));
// // // //       setCompletedLessonIds(completedSet);
// // // //       return completedSet;
// // // //     } catch (err) {
// // // //       console.error("Error fetching progress:", err.message);
// // // //       return new Set();
// // // //     }
// // // //   };

// // // //   const fetchCourseSyllabus = async (targetCourseId, completedIds = completedLessonIds) => {
// // // //     try {
// // // //       const { data: phaseData, error } = await supabase
// // // //         .from("course_phases")
// // // //         .select(`
// // // //           id,
// // // //           phase_number,
// // // //           title,
// // // //           focus,
// // // //           course_lessons (
// // // //             id,
// // // //             title,
// // // //             position,
// // // //             created_at
// // // //           )
// // // //         `)
// // // //         .eq("course_id", targetCourseId)
// // // //         .order("phase_number", { ascending: true });

// // // //       if (error) throw error;

// // // //       const { data: notesData } = await supabase
// // // //         .from("notes")
// // // //         .select("*")
// // // //         .eq("course_id", targetCourseId);

// // // //       const structuredPhases = (phaseData || []).map((phase) => ({
// // // //         ...phase,
// // // //         course_lessons: (phase.course_lessons || [])
// // // //           .sort((a, b) => (a.position || 0) - (b.position || 0))
// // // //           .map((lesson) => {
// // // //             const matchingNote = (notesData || []).find(
// // // //               (n) => n.title.toLowerCase() === lesson.title.toLowerCase()
// // // //             );
// // // //             return {
// // // //               ...lesson,
// // // //               content: matchingNote?.content || "",
// // // //               video_url: matchingNote?.video_url || ""
// // // //             };
// // // //           })
// // // //       }));

// // // //       setPhases(structuredPhases);

// // // //       const activePhase =
// // // //         structuredPhases.find((phase) =>
// // // //           phase.course_lessons?.some((lesson) => !completedIds.has(lesson.id))
// // // //         ) || structuredPhases[0];

// // // //       const initialOpenState = {};
// // // //       structuredPhases.forEach((p) => {
// // // //         initialOpenState[p.id] = p.id === activePhase?.id;
// // // //       });

// // // //       setOpenPhases(initialOpenState);

// // // //       const firstIncompleteLesson =
// // // //         activePhase?.course_lessons?.find((l) => !completedIds.has(l.id)) ||
// // // //         activePhase?.course_lessons?.[0] ||
// // // //         null;

// // // //       setSelectedLesson(firstIncompleteLesson);
// // // //     } catch (err) {
// // // //       console.error("Error fetching syllabus:", err.message);
// // // //     }
// // // //   };

// // // //   const fetchLessonQuiz = async (lessonId) => {
// // // //     try {
// // // //       const { data: quizData, error } = await supabase
// // // //         .from("quizzes")
// // // //         .select("*, quiz_questions(*)")
// // // //         .eq("lesson_id", lessonId)
// // // //         .maybeSingle();

// // // //       if (error) throw error;
// // // //       setLessonQuiz(quizData || null);
// // // //     } catch (err) {
// // // //       console.error("Error fetching lesson quiz:", err.message);
// // // //       setLessonQuiz(null);
// // // //     }
// // // //   };

// // // //   const markLessonComplete = async (lessonId) => {
// // // //     try {
// // // //       const { error } = await supabase.from("student_lesson_progress").upsert(
// // // //         {
// // // //           student_id: userId,
// // // //           lesson_id: lessonId,
// // // //           status: "completed",
// // // //           completed_at: new Date().toISOString()
// // // //         },
// // // //         { onConflict: "student_id,lesson_id" }
// // // //       );

// // // //       if (error) throw error;

// // // //       setCompletedLessonIds((prev) => {
// // // //         const next = new Set(prev);
// // // //         next.add(lessonId);
// // // //         return next;
// // // //       });
// // // //     } catch (err) {
// // // //       console.error("Error marking lesson complete:", err.message);
// // // //     }
// // // //   };

// // // //   const handleQuizSubmit = async (e) => {
// // // //     e.preventDefault();
// // // //     if (!lessonQuiz || !lessonQuiz.quiz_questions) return;

// // // //     setSubmittingQuiz(true);
// // // //     try {
// // // //       const questions = lessonQuiz.quiz_questions;
// // // //       let correctCount = 0;

// // // //       questions.forEach((q, idx) => {
// // // //         if (quizAnswers[idx] === q.correct_option_index) {
// // // //           correctCount++;
// // // //         }
// // // //       });

// // // //       const score = Math.round((correctCount / questions.length) * 100);
// // // //       const passingScore = lessonQuiz.passing_score || 70;
// // // //       const passed = score >= passingScore;

// // // //       // Save attempt log
// // // //       await supabase.from("student_quiz_attempts").insert({
// // // //         student_id: userId,
// // // //         quiz_id: lessonQuiz.id,
// // // //         score,
// // // //         passed
// // // //       });

// // // //       setQuizResult({ score, passed, passing_score: passingScore });

// // // //       if (passed) {
// // // //         await markLessonComplete(selectedLesson.id);
// // // //         toast.success(`Passed! Score: ${score}% 🎉`);
// // // //       } else {
// // // //         toast.error(`Score: ${score}%. Required passing score is ${passingScore}%. Try again!`);
// // // //       }
// // // //     } catch (err) {
// // // //       toast.error("Failed to submit quiz: " + err.message);
// // // //     } finally {
// // // //       setSubmittingQuiz(false);
// // // //     }
// // // //   };

// // // //   const handleSelectCourse = (course) => {
// // // //     setOpenPhases({});
// // // //     setSelectedLesson(null);
// // // //     setActiveCourse(course);
// // // //     fetchCourseSyllabus(course.id);
// // // //   };

// // // //   const togglePhaseAccordion = (phaseId) => {
// // // //     setOpenPhases((prev) => ({
// // // //       ...prev,
// // // //       [phaseId]: !prev[phaseId]
// // // //     }));
// // // //   };

// // // //   const isPhaseCompleted = (phase) => {
// // // //     if (!phase.course_lessons || phase.course_lessons.length === 0) return false;
// // // //     return phase.course_lessons.every((lesson) => completedLessonIds.has(lesson.id));
// // // //   };

// // // //   if (loading) {
// // // //     return (
// // // //       <div className="min-h-[60vh] flex items-center justify-center">
// // // //         <div className="bg-white/10 dark:bg-white/[0.04] backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[30px] p-8 text-center shadow-xl">
// // // //           <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
// // // //           <h2 className="text-gray-900 dark:text-white text-xl font-bold">
// // // //             Loading Learning Workspace...
// // // //           </h2>
// // // //           <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
// // // //             Fetching your interactive curriculum 🚀
// // // //           </p>
// // // //         </div>
// // // //       </div>
// // // //     );
// // // //   }

// // // //   return (
// // // //     <div className="space-y-6 p-4 md:p-8 text-gray-900 dark:text-white max-w-7xl mx-auto">
// // // //       {/* Horizontal Quick Course Switcher Bar */}
// // // //       {courses.length > 0 && (
// // // //         <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
// // // //           {courses.map((course) => {
// // // //             const isSelected = activeCourse?.id === course.id;
// // // //             return (
// // // //               <button
// // // //                 key={course.id}
// // // //                 onClick={() => handleSelectCourse(course)}
// // // //                 className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-left shrink-0 transition-all ${
// // // //                   isSelected
// // // //                     ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20"
// // // //                     : "bg-white dark:bg-white/[0.04] border-gray-200 dark:border-white/10 hover:border-purple-500/40 text-gray-700 dark:text-gray-200"
// // // //                 }`}
// // // //               >
// // // //                 <div className="w-8 h-8 rounded-lg overflow-hidden bg-purple-500/20 shrink-0 flex items-center justify-center font-bold text-xs">
// // // //                   {course.thumbnail_url ? (
// // // //                     <img
// // // //                       src={course.thumbnail_url}
// // // //                       alt={course.title}
// // // //                       className="w-full h-full object-cover"
// // // //                     />
// // // //                   ) : (
// // // //                     <BookOpen size={16} className={isSelected ? "text-white" : "text-purple-500"} />
// // // //                   )}
// // // //                 </div>
// // // //                 <span className="font-bold text-sm max-w-[180px] truncate">
// // // //                   {course.title}
// // // //                 </span>
// // // //               </button>
// // // //             );
// // // //           })}
// // // //         </div>
// // // //       )}

// // // //       {courses.length === 0 ? (
// // // //         <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-[32px] p-12 text-center shadow-lg">
// // // //           <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
// // // //             🎓
// // // //           </div>
// // // //           <h3 className="text-xl font-bold">No Registered Courses Found</h3>
// // // //           <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto text-sm">
// // // //             You are not currently enrolled in any active courses. Please contact your administrator or instructor.
// // // //           </p>
// // // //         </div>
// // // //       ) : (
// // // //         activeCourse && (
// // // //           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
// // // //             {/* Left Sidebar: Sticky Syllabus & Course Overview */}
// // // //             <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-6">
// // // //               <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[28px] overflow-hidden shadow-xl p-5">
// // // //                 <div className="relative h-36 rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
// // // //                   {activeCourse.thumbnail_url ? (
// // // //                     <img
// // // //                       src={activeCourse.thumbnail_url}
// // // //                       alt={activeCourse.title}
// // // //                       className="w-full h-full object-cover"
// // // //                     />
// // // //                   ) : (
// // // //                     <div className="text-center p-4">
// // // //                       <BookOpen size={36} className="text-white/80 mx-auto mb-1" />
// // // //                       <span className="text-xs font-bold text-white/70 uppercase tracking-widest">
// // // //                         Course Track
// // // //                       </span>
// // // //                     </div>
// // // //                   )}
// // // //                   <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
// // // //                   <h2 className="absolute bottom-3 left-4 right-4 font-black text-white text-lg line-clamp-1">
// // // //                     {activeCourse.title}
// // // //                   </h2>
// // // //                 </div>

// // // //                 <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 px-1">
// // // //                   <span className="flex items-center gap-1.5">
// // // //                     <Layers size={14} className="text-purple-500" />
// // // //                     {phases.length} Phases
// // // //                   </span>
// // // //                   <span className="flex items-center gap-1.5">
// // // //                     <CheckCircle2 size={14} className="text-emerald-500" />
// // // //                     {completedLessonIds.size} Lessons Done
// // // //                   </span>
// // // //                 </div>
// // // //               </div>

// // // //               {/* Collapsible Syllabus Accordion */}
// // // //               <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[28px] p-4 shadow-xl space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
// // // //                 <h3 className="text-base font-black px-2 text-gray-900 dark:text-white flex items-center gap-2">
// // // //                   Course Syllabus
// // // //                 </h3>

// // // //                 <div className="space-y-2">
// // // //                   {phases.map((phase) => {
// // // //                     const isOpen = !!openPhases[phase.id];
// // // //                     const phaseDone = isPhaseCompleted(phase);

// // // //                     return (
// // // //                       <div
// // // //                         key={phase.id}
// // // //                         className="border border-gray-200/80 dark:border-white/10 rounded-2xl overflow-hidden transition-all bg-gray-50/50 dark:bg-white/[0.02]"
// // // //                       >
// // // //                         <button
// // // //                           onClick={() => togglePhaseAccordion(phase.id)}
// // // //                           className="w-full text-left p-3.5 flex items-center justify-between hover:bg-purple-500/5 transition-colors"
// // // //                         >
// // // //                           <div className="flex items-center gap-2.5 pr-2">
// // // //                             {phaseDone ? (
// // // //                               <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
// // // //                             ) : (
// // // //                               <div className="w-4 h-4 rounded-full border-2 border-purple-500/40 shrink-0" />
// // // //                             )}
// // // //                             <div>
// // // //                               <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">
// // // //                                 Phase {phase.phase_number}
// // // //                               </span>
// // // //                               <h4 className="font-bold text-xs md:text-sm text-gray-900 dark:text-white line-clamp-1">
// // // //                                 {phase.title}
// // // //                               </h4>
// // // //                             </div>
// // // //                           </div>

// // // //                           {isOpen ? (
// // // //                             <ChevronDown size={16} className="text-gray-400 shrink-0" />
// // // //                           ) : (
// // // //                             <ChevronRight size={16} className="text-gray-400 shrink-0" />
// // // //                           )}
// // // //                         </button>

// // // //                         {isOpen && (
// // // //                           <div className="p-2 pt-0 space-y-1.5 border-t border-gray-200/50 dark:border-white/5">
// // // //                             {phase.course_lessons?.map((lesson) => {
// // // //                               const isSelected = selectedLesson?.id === lesson.id;
// // // //                               const isDone = completedLessonIds.has(lesson.id);

// // // //                               return (
// // // //                                 <button
// // // //                                   key={lesson.id}
// // // //                                   onClick={() => setSelectedLesson(lesson)}
// // // //                                   className={`w-full text-left rounded-xl p-2.5 transition-all flex items-center justify-between border ${
// // // //                                     isSelected
// // // //                                       ? "bg-purple-600 text-white border-transparent shadow-md"
// // // //                                       : "bg-white dark:bg-white/[0.03] border-gray-200/60 dark:border-white/5 hover:border-purple-500/30"
// // // //                                   }`}
// // // //                                 >
// // // //                                   <div className="flex items-center gap-2 min-w-0 pr-2">
// // // //                                     {isDone ? (
// // // //                                       <CheckCircle2
// // // //                                         size={15}
// // // //                                         className={isSelected ? "text-white" : "text-emerald-500"}
// // // //                                       />
// // // //                                     ) : (
// // // //                                       <Circle
// // // //                                         size={15}
// // // //                                         className={isSelected ? "text-white/70" : "text-gray-400"}
// // // //                                       />
// // // //                                     )}
// // // //                                     <span
// // // //                                       className={`text-xs font-bold truncate ${
// // // //                                         isSelected
// // // //                                           ? "text-white"
// // // //                                           : "text-gray-800 dark:text-gray-200"
// // // //                                       }`}
// // // //                                     >
// // // //                                       {lesson.title}
// // // //                                     </span>
// // // //                                   </div>
// // // //                                   <ChevronRight
// // // //                                     size={13}
// // // //                                     className={isSelected ? "text-white/80" : "text-gray-400"}
// // // //                                   />
// // // //                                 </button>
// // // //                               );
// // // //                             })}
// // // //                           </div>
// // // //                         )}
// // // //                       </div>
// // // //                     );
// // // //                   })}
// // // //                 </div>
// // // //               </div>
// // // //             </div>

// // // //             {/* Right Main Panel: Active Lesson Content & Assessment */}
// // // //             <div className="lg:col-span-8">
// // // //               <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[32px] p-6 md:p-8 shadow-xl">
// // // //                 {selectedLesson ? (
// // // //                   <div>
// // // //                     {/* Active Lesson Header & Status Badge */}
// // // //                     <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
// // // //                       <div>
// // // //                         <span className="text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
// // // //                           Active Lesson
// // // //                         </span>
// // // //                         <h2 className="text-2xl md:text-3xl font-black mt-2 text-gray-900 dark:text-white">
// // // //                           {selectedLesson.title}
// // // //                         </h2>
// // // //                       </div>

// // // //                       <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border ${
// // // //                         completedLessonIds.has(selectedLesson.id)
// // // //                           ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
// // // //                           : "bg-amber-500/10 text-amber-500 border-amber-500/20"
// // // //                       }`}>
// // // //                         {completedLessonIds.has(selectedLesson.id) ? (
// // // //                           <>
// // // //                             <CheckCircle2 size={16} /> Completed (Passed)
// // // //                           </>
// // // //                         ) : (
// // // //                           <>
// // // //                             <AlertCircle size={16} /> Quiz Required to Complete
// // // //                           </>
// // // //                         )}
// // // //                       </div>
// // // //                     </div>

// // // //                     {/* Active Lesson Content & Video Display */}
// // // //                     <div className="border-t border-gray-100 dark:border-white/[0.08] pt-6 space-y-6">
// // // //                       {selectedLesson.video_url && (
// // // //                         <div className="relative rounded-2xl overflow-hidden aspect-video bg-black shadow-lg border border-gray-200/20 dark:border-white/10">
// // // //                           <iframe
// // // //                             src={selectedLesson.video_url}
// // // //                             title="Lesson Video"
// // // //                             className="w-full h-full border-0"
// // // //                             allowFullScreen
// // // //                           />
// // // //                         </div>
// // // //                       )}

// // // //                       {selectedLesson.content ? (
// // // //                         <div className="bg-gray-50/80 dark:bg-white/[0.02] p-5 md:p-6 rounded-2xl border border-gray-200/60 dark:border-white/5 space-y-3">
// // // //                           <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
// // // //                             {selectedLesson.content}
// // // //                           </p>
// // // //                         </div>
// // // //                       ) : (
// // // //                         <div className="text-center py-6 text-gray-400">
// // // //                           <p className="text-sm">No notes or study materials specified for this lesson yet.</p>
// // // //                         </div>
// // // //                       )}

// // // //                       {/* LESSON QUIZ ASSESSMENT SECTION */}
// // // //                       {lessonQuiz && lessonQuiz.quiz_questions && lessonQuiz.quiz_questions.length > 0 ? (
// // // //                         <div className="mt-8 p-6 bg-purple-50/40 dark:bg-purple-500/5 border border-purple-100 dark:border-purple-500/20 rounded-2xl space-y-6">
// // // //                           <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-500/20 pb-4">
// // // //                             <div>
// // // //                               <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
// // // //                                 Lesson Assessment
// // // //                               </span>
// // // //                               <h3 className="text-lg font-black text-gray-900 dark:text-white">
// // // //                                 {lessonQuiz.title}
// // // //                               </h3>
// // // //                             </div>
// // // //                             <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
// // // //                               Passing Score: {lessonQuiz.passing_score}%
// // // //                             </span>
// // // //                           </div>

// // // //                           {quizResult && (
// // // //                             <div className={`p-4 rounded-xl border flex items-center justify-between ${
// // // //                               quizResult.passed 
// // // //                                 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
// // // //                                 : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
// // // //                             }`}>
// // // //                               <div className="flex items-center gap-2.5 font-bold text-sm">
// // // //                                 {quizResult.passed ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
// // // //                                 <span>
// // // //                                   {quizResult.passed 
// // // //                                     ? `Great job! You passed with ${quizResult.score}%` 
// // // //                                     : `You scored ${quizResult.score}%. You need ${quizResult.passing_score}% to pass.`}
// // // //                                 </span>
// // // //                               </div>
// // // //                               {!quizResult.passed && (
// // // //                                 <button
// // // //                                   onClick={() => setQuizResult(null)}
// // // //                                   className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-rose-700 transition-all"
// // // //                                 >
// // // //                                   <RotateCcw size={14} /> Retake Quiz
// // // //                                 </button>
// // // //                               )}
// // // //                             </div>
// // // //                           )}

// // // //                           <form onSubmit={handleQuizSubmit} className="space-y-6">
// // // //                             {lessonQuiz.quiz_questions.map((q, qIdx) => (
// // // //                               <div key={q.id || qIdx} className="space-y-3 p-4 bg-white dark:bg-slate-900/40 rounded-xl border border-gray-200/60 dark:border-white/10">
// // // //                                 <p className="text-sm font-bold text-gray-900 dark:text-white">
// // // //                                   {qIdx + 1}. {q.question_text}
// // // //                                 </p>
// // // //                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
// // // //                                   {q.options.map((opt, optIdx) => (
// // // //                                     <label
// // // //                                       key={optIdx}
// // // //                                       className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
// // // //                                         quizAnswers[qIdx] === optIdx
// // // //                                           ? "bg-purple-600 text-white border-purple-600 shadow-sm"
// // // //                                           : "bg-gray-50/50 dark:bg-white/[0.02] border-gray-200 dark:border-white/10 hover:border-purple-500/40 text-gray-800 dark:text-gray-200"
// // // //                                       }`}
// // // //                                     >
// // // //                                       <input
// // // //                                         type="radio"
// // // //                                         name={`question-${qIdx}`}
// // // //                                         checked={quizAnswers[qIdx] === optIdx}
// // // //                                         onChange={() => setQuizAnswers({ ...quizAnswers, [qIdx]: optIdx })}
// // // //                                         disabled={quizResult?.passed}
// // // //                                         className="hidden"
// // // //                                       />
// // // //                                       <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 text-[10px] font-bold">
// // // //                                         {String.fromCharCode(65 + optIdx)}
// // // //                                       </span>
// // // //                                       <span className="flex-1">{opt}</span>
// // // //                                     </label>
// // // //                                   ))}
// // // //                                 </div>
// // // //                               </div>
// // // //                             ))}

// // // //                             {!quizResult?.passed && (
// // // //                               <div className="flex justify-end pt-2">
// // // //                                 <button
// // // //                                   type="submit"
// // // //                                   disabled={submittingQuiz}
// // // //                                   className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-purple-500/20 transition-all disabled:opacity-50"
// // // //                                 >
// // // //                                   {submittingQuiz ? "Evaluating..." : "Submit Assessment"}
// // // //                                 </button>
// // // //                               </div>
// // // //                             )}
// // // //                           </form>
// // // //                         </div>
// // // //                       ) : (
// // // //                         <div className="mt-8 p-6 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5 rounded-2xl text-center">
// // // //                           <p className="text-xs text-gray-400">No assessment quiz published for this lesson yet.</p>
// // // //                         </div>
// // // //                       )}
// // // //                     </div>
// // // //                   </div>
// // // //                 ) : (
// // // //                   <div className="text-center py-20 text-gray-400">
// // // //                     <BookOpen size={48} className="mx-auto mb-4 opacity-40 text-purple-500" />
// // // //                     <p className="text-base font-bold text-gray-700 dark:text-gray-300">
// // // //                       Select a lesson from the syllabus sidebar to begin learning.
// // // //                     </p>
// // // //                   </div>
// // // //                 )}
// // // //               </div>
// // // //             </div>
// // // //           </div>
// // // //         )
// // // //       )}
// // // //     </div>
// // // //   );
// // // // }
// // // // // // import React, { useEffect, useState } from "react";
// // // // // // import {
// // // // // //   BookOpen,
// // // // // //   ChevronRight,
// // // // // //   ChevronDown,
// // // // // //   CheckCircle2,
// // // // // //   Circle,
// // // // // //   Layers,
// // // // // //   HelpCircle,
// // // // // //   Award,
// // // // // //   RotateCcw,
// // // // // //   AlertCircle
// // // // // // } from "lucide-react";
// // // // // // import { supabase } from "../../../supabase";
// // // // // // import toast from "react-hot-toast";

// // // // // // export default function StudentCoursesView({ userId, courseId }) {
// // // // // //   const [loading, setLoading] = useState(true);
// // // // // //   const [courses, setCourses] = useState([]);
// // // // // //   const [activeCourse, setActiveCourse] = useState(null);

// // // // // //   // Structured Phase -> Lessons state
// // // // // //   const [phases, setPhases] = useState([]);
// // // // // //   const [selectedLesson, setSelectedLesson] = useState(null);
// // // // // //   const [completedLessonIds, setCompletedLessonIds] = useState(new Set());

// // // // // //   // Quiz state for active lesson
// // // // // //   const [lessonQuiz, setLessonQuiz] = useState(null);
// // // // // //   const [studentAnswers, setStudentAnswers] = useState({});
// // // // // //   const [quizSubmitted, setQuizSubmitted] = useState(false);
// // // // // //   const [quizScoreResult, setQuizScoreResult] = useState(null);

// // // // // //   // Track open/collapsed phases by phase ID
// // // // // //   const [openPhases, setOpenPhases] = useState({});

// // // // // //   useEffect(() => {
// // // // // //     if (userId) {
// // // // // //       fetchStudentCoursesData();
// // // // // //     }
// // // // // //   }, [userId, courseId]);

// // // // // //   useEffect(() => {
// // // // // //     if (selectedLesson) {
// // // // // //       fetchLessonQuiz(selectedLesson.id);
// // // // // //     }
// // // // // //   }, [selectedLesson]);

// // // // // //   const fetchStudentCoursesData = async () => {
// // // // // //     try {
// // // // // //       setLoading(true);

// // // // // //       const { data: userData, error: userError } = await supabase
// // // // // //         .from("users")
// // // // // //         .select(`
// // // // // //           assigned_course_id,
// // // // // //           courses:assigned_course_id (*)
// // // // // //         `)
// // // // // //         .eq("id", userId)
// // // // // //         .single();

// // // // // //       if (userError) throw userError;

// // // // // //       const assignedCourse = userData?.courses ? [userData.courses] : [];
// // // // // //       setCourses(assignedCourse);

// // // // // //       const defaultCourse = assignedCourse[0] || null;
// // // // // //       setActiveCourse(defaultCourse);

// // // // // //       if (defaultCourse) {
// // // // // //         const completedIds = await fetchLessonProgress();
// // // // // //         await fetchCourseSyllabus(defaultCourse.id, completedIds);
// // // // // //       }
// // // // // //     } catch (err) {
// // // // // //       console.error("Error fetching student data:", err.message);
// // // // // //     } finally {
// // // // // //       setLoading(false);
// // // // // //     }
// // // // // //   };

// // // // // //   const fetchLessonProgress = async () => {
// // // // // //     try {
// // // // // //       const { data: progressData, error } = await supabase
// // // // // //         .from("student_lesson_progress")
// // // // // //         .select("lesson_id, status")
// // // // // //         .eq("student_id", userId)
// // // // // //         .eq("status", "completed");

// // // // // //       if (error) throw error;

// // // // // //       const completedSet = new Set(progressData.map((p) => p.lesson_id));
// // // // // //       setCompletedLessonIds(completedSet);
// // // // // //       return completedSet;
// // // // // //     } catch (err) {
// // // // // //       console.error("Error fetching progress:", err.message);
// // // // // //       return new Set();
// // // // // //     }
// // // // // //   };

// // // // // //   const fetchCourseSyllabus = async (targetCourseId, completedIds = completedLessonIds) => {
// // // // // //     try {
// // // // // //       const { data: phaseData, error } = await supabase
// // // // // //         .from("course_phases")
// // // // // //         .select(`
// // // // // //           id,
// // // // // //           phase_number,
// // // // // //           title,
// // // // // //           focus,
// // // // // //           course_lessons (
// // // // // //             id,
// // // // // //             title,
// // // // // //             position,
// // // // // //             created_at
// // // // // //           )
// // // // // //         `)
// // // // // //         .eq("course_id", targetCourseId)
// // // // // //         .order("phase_number", { ascending: true });

// // // // // //       if (error) throw error;

// // // // // //       const { data: notesData } = await supabase
// // // // // //         .from("notes")
// // // // // //         .select("*")
// // // // // //         .eq("course_id", targetCourseId);

// // // // // //       const structuredPhases = (phaseData || []).map((phase) => ({
// // // // // //         ...phase,
// // // // // //         course_lessons: (phase.course_lessons || [])
// // // // // //           .sort((a, b) => (a.position || 0) - (b.position || 0))
// // // // // //           .map((lesson) => {
// // // // // //             const matchingNote = (notesData || []).find(
// // // // // //               (n) => n.title.toLowerCase() === lesson.title.toLowerCase()
// // // // // //             );
// // // // // //             return {
// // // // // //               ...lesson,
// // // // // //               content: matchingNote?.content || "",
// // // // // //               video_url: matchingNote?.video_url || ""
// // // // // //             };
// // // // // //           })
// // // // // //       }));

// // // // // //       setPhases(structuredPhases);

// // // // // //       const activePhase =
// // // // // //         structuredPhases.find((phase) =>
// // // // // //           phase.course_lessons?.some((lesson) => !completedIds.has(lesson.id))
// // // // // //         ) || structuredPhases[0];

// // // // // //       const initialOpenState = {};
// // // // // //       structuredPhases.forEach((p) => {
// // // // // //         initialOpenState[p.id] = p.id === activePhase?.id;
// // // // // //       });

// // // // // //       setOpenPhases(initialOpenState);

// // // // // //       const firstIncompleteLesson =
// // // // // //         activePhase?.course_lessons?.find((l) => !completedIds.has(l.id)) ||
// // // // // //         activePhase?.course_lessons?.[0] ||
// // // // // //         null;

// // // // // //       setSelectedLesson(firstIncompleteLesson);
// // // // // //     } catch (err) {
// // // // // //       console.error("Error fetching syllabus:", err.message);
// // // // // //     }
// // // // // //   };

// // // // // //   const fetchLessonQuiz = async (lessonId) => {
// // // // // //     try {
// // // // // //       setStudentAnswers({});
// // // // // //       setQuizSubmitted(false);
// // // // // //       setQuizScoreResult(null);

// // // // // //       const { data: quizData, error } = await supabase
// // // // // //         .from("quizzes")
// // // // // //         .select("*, quiz_questions(*)")
// // // // // //         .eq("lesson_id", lessonId)
// // // // // //         .maybeSingle();

// // // // // //       if (error) throw error;
// // // // // //       setLessonQuiz(quizData || null);
// // // // // //     } catch (err) {
// // // // // //       console.error("Error fetching lesson quiz:", err.message);
// // // // // //       setLessonQuiz(null);
// // // // // //     }
// // // // // //   };

// // // // // //   const handleSelectAnswer = (questionId, optionIndex) => {
// // // // // //     if (quizSubmitted) return; // Prevent changing answers after grading
// // // // // //     setStudentAnswers((prev) => ({
// // // // // //       ...prev,
// // // // // //       [questionId]: optionIndex
// // // // // //     }));
// // // // // //   };

// // // // // //   const handleGradeQuiz = async () => {
// // // // // //     if (!lessonQuiz || !lessonQuiz.quiz_questions) return;

// // // // // //     const questions = lessonQuiz.quiz_questions;
// // // // // //     if (Object.keys(studentAnswers).length < questions.length) {
// // // // // //       toast.error("Please answer all questions before submitting.");
// // // // // //       return;
// // // // // //     }

// // // // // //     let correctCount = 0;
// // // // // //     questions.forEach((q) => {
// // // // // //       if (studentAnswers[q.id] === q.correct_option_index) {
// // // // // //         correctCount++;
// // // // // //       }
// // // // // //     });

// // // // // //     const scorePercentage = Math.round((correctCount / questions.length) * 100);
// // // // // //     const passingScore = lessonQuiz.passing_score || 70;
// // // // // //     const passed = scorePercentage >= passingScore;

// // // // // //     setQuizSubmitted(true);
// // // // // //     setQuizScoreResult({ score: scorePercentage, passed });

// // // // // //     try {
// // // // // //       // Save attempt log
// // // // // //       await supabase.from("student_quiz_attempts").insert([
// // // // // //         {
// // // // // //           student_id: userId,
// // // // // //           quiz_id: lessonQuiz.id,
// // // // // //           score: scorePercentage,
// // // // // //           passed: passed
// // // // // //         }
// // // // // //       ]);

// // // // // //       if (passed) {
// // // // // //         // Automatically mark lesson as completed
// // // // // //         await supabase.from("student_lesson_progress").upsert(
// // // // // //           {
// // // // // //             student_id: userId,
// // // // // //             lesson_id: selectedLesson.id,
// // // // // //             status: "completed",
// // // // // //             completed_at: new Date().toISOString()
// // // // // //           },
// // // // // //           { onConflict: "student_id,lesson_id" }
// // // // // //         );

// // // // // //         setCompletedLessonIds((prev) => new Set(prev).add(selectedLesson.id));
// // // // // //         toast.success(`Passed! Score: ${scorePercentage}% 🎉`);
// // // // // //       } else {
// // // // // //         toast.error(`Failed! Score: ${scorePercentage}%. Minimum required is ${passingScore}%. Please retake.`);
// // // // // //       }
// // // // // //     } catch (err) {
// // // // // //       console.error("Error processing quiz result:", err.message);
// // // // // //     }
// // // // // //   };

// // // // // //   const handleRetakeQuiz = () => {
// // // // // //     setStudentAnswers({});
// // // // // //     setQuizSubmitted(false);
// // // // // //     setQuizScoreResult(null);
// // // // // //   };

// // // // // //   const handleSelectCourse = (course) => {
// // // // // //     setOpenPhases({});
// // // // // //     setSelectedLesson(null);
// // // // // //     setActiveCourse(course);
// // // // // //     fetchCourseSyllabus(course.id);
// // // // // //   };

// // // // // //   const togglePhaseAccordion = (phaseId) => {
// // // // // //     setOpenPhases((prev) => ({
// // // // // //       ...prev,
// // // // // //       [phaseId]: !prev[phaseId]
// // // // // //     }));
// // // // // //   };

// // // // // //   const isPhaseCompleted = (phase) => {
// // // // // //     if (!phase.course_lessons || phase.course_lessons.length === 0) return false;
// // // // // //     return phase.course_lessons.every((lesson) => completedLessonIds.has(lesson.id));
// // // // // //   };

// // // // // //   if (loading) {
// // // // // //     return (
// // // // // //       <div className="min-h-[60vh] flex items-center justify-center">
// // // // // //         <div className="bg-white/10 dark:bg-white/[0.04] backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[30px] p-8 text-center shadow-xl">
// // // // // //           <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
// // // // // //           <h2 className="text-gray-900 dark:text-white text-xl font-bold">
// // // // // //             Loading Learning Workspace...
// // // // // //           </h2>
// // // // // //         </div>
// // // // // //       </div>
// // // // // //     );
// // // // // //   }

// // // // // //   return (
// // // // // //     <div className="space-y-6 p-4 md:p-8 text-gray-900 dark:text-white max-w-7xl mx-auto">
// // // // // //       {/* Horizontal Course Switcher */}
// // // // // //       {courses.length > 0 && (
// // // // // //         <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
// // // // // //           {courses.map((course) => {
// // // // // //             const isSelected = activeCourse?.id === course.id;
// // // // // //             return (
// // // // // //               <button
// // // // // //                 key={course.id}
// // // // // //                 onClick={() => handleSelectCourse(course)}
// // // // // //                 className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-left shrink-0 transition-all ${
// // // // // //                   isSelected
// // // // // //                     ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20"
// // // // // //                     : "bg-white dark:bg-white/[0.04] border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200"
// // // // // //                 }`}
// // // // // //               >
// // // // // //                 <span className="font-bold text-sm max-w-[180px] truncate">{course.title}</span>
// // // // // //               </button>
// // // // // //             );
// // // // // //           })}
// // // // // //         </div>
// // // // // //       )}

// // // // // //       {courses.length === 0 ? (
// // // // // //         <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-[32px] p-12 text-center shadow-lg">
// // // // // //           <h3 className="text-xl font-bold">No Registered Courses Found</h3>
// // // // // //         </div>
// // // // // //       ) : (
// // // // // //         activeCourse && (
// // // // // //           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
// // // // // //             {/* Sidebar Syllabus */}
// // // // // //             <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-6">
// // // // // //               <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[28px] p-4 shadow-xl space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
// // // // // //                 <h3 className="text-base font-black px-2 text-gray-900 dark:text-white">Course Syllabus</h3>

// // // // // //                 <div className="space-y-2">
// // // // // //                   {phases.map((phase) => {
// // // // // //                     const isOpen = !!openPhases[phase.id];
// // // // // //                     const phaseDone = isPhaseCompleted(phase);

// // // // // //                     return (
// // // // // //                       <div key={phase.id} className="border border-gray-200/80 dark:border-white/10 rounded-2xl overflow-hidden bg-gray-50/50 dark:bg-white/[0.02]">
// // // // // //                         <button
// // // // // //                           onClick={() => togglePhaseAccordion(phase.id)}
// // // // // //                           className="w-full text-left p-3.5 flex items-center justify-between hover:bg-purple-500/5"
// // // // // //                         >
// // // // // //                           <div className="flex items-center gap-2.5 pr-2">
// // // // // //                             {phaseDone ? (
// // // // // //                               <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
// // // // // //                             ) : (
// // // // // //                               <div className="w-4 h-4 rounded-full border-2 border-purple-500/40 shrink-0" />
// // // // // //                             )}
// // // // // //                             <div>
// // // // // //                               <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400">
// // // // // //                                 Phase {phase.phase_number}
// // // // // //                               </span>
// // // // // //                               <h4 className="font-bold text-xs md:text-sm text-gray-900 dark:text-white line-clamp-1">
// // // // // //                                 {phase.title}
// // // // // //                               </h4>
// // // // // //                             </div>
// // // // // //                           </div>
// // // // // //                           {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
// // // // // //                         </button>

// // // // // //                         {isOpen && (
// // // // // //                           <div className="p-2 pt-0 space-y-1.5 border-t border-gray-200/50 dark:border-white/5">
// // // // // //                             {phase.course_lessons?.map((lesson) => {
// // // // // //                               const isSelected = selectedLesson?.id === lesson.id;
// // // // // //                               const isDone = completedLessonIds.has(lesson.id);

// // // // // //                               return (
// // // // // //                                 <button
// // // // // //                                   key={lesson.id}
// // // // // //                                   onClick={() => setSelectedLesson(lesson)}
// // // // // //                                   className={`w-full text-left rounded-xl p-2.5 transition-all flex items-center justify-between border ${
// // // // // //                                     isSelected
// // // // // //                                       ? "bg-purple-600 text-white border-transparent shadow-md"
// // // // // //                                       : "bg-white dark:bg-white/[0.03] border-gray-200/60 dark:border-white/5"
// // // // // //                                   }`}
// // // // // //                                 >
// // // // // //                                   <div className="flex items-center gap-2 min-w-0 pr-2">
// // // // // //                                     {isDone ? (
// // // // // //                                       <CheckCircle2 size={15} className={isSelected ? "text-white" : "text-emerald-500"} />
// // // // // //                                     ) : (
// // // // // //                                       <Circle size={15} className={isSelected ? "text-white/70" : "text-gray-400"} />
// // // // // //                                     )}
// // // // // //                                     <span className={`text-xs font-bold truncate ${isSelected ? "text-white" : "text-gray-800 dark:text-gray-200"}`}>
// // // // // //                                       {lesson.title}
// // // // // //                                     </span>
// // // // // //                                   </div>
// // // // // //                                   <ChevronRight size={13} className={isSelected ? "text-white/80" : "text-gray-400"} />
// // // // // //                                 </button>
// // // // // //                               );
// // // // // //                             })}
// // // // // //                           </div>
// // // // // //                         )}
// // // // // //                       </div>
// // // // // //                     );
// // // // // //                   })}
// // // // // //                 </div>
// // // // // //               </div>
// // // // // //             </div>

// // // // // //             {/* Main Content & Quiz Panel */}
// // // // // //             <div className="lg:col-span-8 space-y-6">
// // // // // //               <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[32px] p-6 md:p-8 shadow-xl">
// // // // // //                 {selectedLesson ? (
// // // // // //                   <div className="space-y-6">
// // // // // //                     <div className="flex items-center justify-between flex-wrap gap-4">
// // // // // //                       <div>
// // // // // //                         <span className="text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
// // // // // //                           Active Lesson
// // // // // //                         </span>
// // // // // //                         <h2 className="text-2xl md:text-3xl font-black mt-2 text-gray-900 dark:text-white">
// // // // // //                           {selectedLesson.title}
// // // // // //                         </h2>
// // // // // //                       </div>

// // // // // //                       <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border ${completedLessonIds.has(selectedLesson.id) ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>
// // // // // //                         {completedLessonIds.has(selectedLesson.id) ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
// // // // // //                         {completedLessonIds.has(selectedLesson.id) ? "Lesson Passed & Completed" : "Pending Passing Quiz"}
// // // // // //                       </div>
// // // // // //                     </div>

// // // // // //                     {selectedLesson.video_url && (
// // // // // //                       <div className="relative rounded-2xl overflow-hidden aspect-video bg-black shadow-lg border border-gray-200/20 dark:border-white/10">
// // // // // //                         <iframe src={selectedLesson.video_url} title="Lesson Video" className="w-full h-full border-0" allowFullScreen />
// // // // // //                       </div>
// // // // // //                     )}

// // // // // //                     {selectedLesson.content && (
// // // // // //                       <div className="bg-gray-50/80 dark:bg-white/[0.02] p-5 rounded-2xl border border-gray-200/60 dark:border-white/5">
// // // // // //                         <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
// // // // // //                           {selectedLesson.content}
// // // // // //                         </p>
// // // // // //                       </div>
// // // // // //                     )}

// // // // // //                     {/* Lesson Assessment Section */}
// // // // // //                     <div className="border-t border-gray-200/60 dark:border-white/10 pt-6 space-y-4">
// // // // // //                       <div className="flex items-center gap-2">
// // // // // //                         <HelpCircle size={20} className="text-purple-600 dark:text-purple-400" />
// // // // // //                         <h3 className="text-lg font-black text-gray-900 dark:text-white">
// // // // // //                           {lessonQuiz ? lessonQuiz.title : "Lesson Assessment"}
// // // // // //                         </h3>
// // // // // //                       </div>

// // // // // //                       {lessonQuiz && lessonQuiz.quiz_questions?.length > 0 ? (
// // // // // //                         <div className="space-y-6 bg-slate-50 dark:bg-white/[0.02] p-5 rounded-2xl border border-slate-200 dark:border-white/10">
// // // // // //                           <p className="text-xs font-bold text-slate-500">
// // // // // //                             Passing Score Required: <span className="text-purple-600 font-black">{lessonQuiz.passing_score}%</span>
// // // // // //                           </p>

// // // // // //                           {lessonQuiz.quiz_questions.map((q, qIndex) => (
// // // // // //                             <div key={q.id} className="space-y-2 border-b border-slate-200 dark:border-white/10 pb-4 last:border-0">
// // // // // //                               <p className="text-sm font-bold text-gray-900 dark:text-white">
// // // // // //                                 {qIndex + 1}. {q.question_text}
// // // // // //                               </p>
// // // // // //                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
// // // // // //                                 {q.options.map((opt, optIdx) => {
// // // // // //                                   const isSelected = studentAnswers[q.id] === optIdx;
// // // // // //                                   return (
// // // // // //                                     <button
// // // // // //                                       key={optIdx}
// // // // // //                                       type="button"
// // // // // //                                       disabled={quizSubmitted}
// // // // // //                                       onClick={() => handleSelectAnswer(q.id, optIdx)}
// // // // // //                                       className={`p-3 text-xs font-semibold rounded-xl text-left border transition-all ${
// // // // // //                                         isSelected
// // // // // //                                           ? "bg-purple-600 text-white border-purple-600"
// // // // // //                                           : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-purple-500"
// // // // // //                                       }`}
// // // // // //                                     >
// // // // // //                                       {opt}
// // // // // //                                     </button>
// // // // // //                                   );
// // // // // //                                 })}
// // // // // //                               </div>
// // // // // //                             </div>
// // // // // //                           ))}

// // // // // //                           {quizSubmitted ? (
// // // // // //                             <div className="p-4 rounded-2xl text-center space-y-3 bg-white dark:bg-slate-900 border">
// // // // // //                               <div className="flex items-center justify-center gap-2">
// // // // // //                                 {quizScoreResult.passed ? (
// // // // // //                                   <Award size={24} className="text-emerald-500" />
// // // // // //                                 ) : (
// // // // // //                                   <RotateCcw size={24} className="text-rose-500" />
// // // // // //                                 )}
// // // // // //                                 <span className={`text-base font-black ${quizScoreResult.passed ? "text-emerald-500" : "text-rose-500"}`}>
// // // // // //                                   Score: {quizScoreResult.score}% ({quizScoreResult.passed ? "Passed!" : "Failed"})
// // // // // //                                 </span>
// // // // // //                               </div>
// // // // // //                               {!quizScoreResult.passed && (
// // // // // //                                 <button
// // // // // //                                   onClick={handleRetakeQuiz}
// // // // // //                                   className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md"
// // // // // //                                 >
// // // // // //                                   Retake Quiz Assessment
// // // // // //                                 </button>
// // // // // //                               )}
// // // // // //                             </div>
// // // // // //                           ) : (
// // // // // //                             <button
// // // // // //                               onClick={handleGradeQuiz}
// // // // // //                               className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md"
// // // // // //                             >
// // // // // //                               Submit Quiz Answers
// // // // // //                             </button>
// // // // // //                           )}
// // // // // //                         </div>
// // // // // //                       ) : (
// // // // // //                         <div className="p-6 bg-slate-50 dark:bg-white/[0.02] rounded-2xl text-center text-slate-400">
// // // // // //                           <p className="text-xs">No quiz published for this lesson yet.</p>
// // // // // //                         </div>
// // // // // //                       )}
// // // // // //                     </div>
// // // // // //                   </div>
// // // // // //                 ) : (
// // // // // //                   <div className="text-center py-20 text-gray-400">
// // // // // //                     <BookOpen size={48} className="mx-auto mb-4 opacity-40 text-purple-500" />
// // // // // //                     <p className="text-base font-bold text-gray-700 dark:text-gray-300">
// // // // // //                       Select a lesson from the syllabus sidebar to begin learning.
// // // // // //                     </p>
// // // // // //                   </div>
// // // // // //                 )}
// // // // // //               </div>
// // // // // //             </div>
// // // // // //           </div>
// // // // // //         )
// // // // // //       )}
// // // // // //     </div>
// // // // // //   );
// // // // // // }
// // // // // // // import React, { useEffect, useState } from "react";
// // // // // // // import {
// // // // // // //   BookOpen,
// // // // // // //   ChevronRight,
// // // // // // //   ChevronDown,
// // // // // // //   CheckCircle2,
// // // // // // //   Circle,
// // // // // // //   Layers,
// // // // // // //   Rocket,
// // // // // // //   FileText
// // // // // // // } from "lucide-react";
// // // // // // // import { supabase } from "../../../supabase";

// // // // // // // export default function StudentCoursesView({ userId, courseId }) {
// // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // //   const [courses, setCourses] = useState([]);
// // // // // // //   const [activeCourse, setActiveCourse] = useState(null);

// // // // // // //   // Structured Phase -> Lessons state
// // // // // // //   const [phases, setPhases] = useState([]);
// // // // // // //   const [selectedLesson, setSelectedLesson] = useState(null);
// // // // // // //   const [completedLessonIds, setCompletedLessonIds] = useState(new Set());

// // // // // // //   // Track open/collapsed phases by phase ID
// // // // // // //   const [openPhases, setOpenPhases] = useState({});

// // // // // // //   useEffect(() => {
// // // // // // //     if (userId) {
// // // // // // //       fetchStudentCoursesData();
// // // // // // //     }
// // // // // // //   }, [userId, courseId]);

// // // // // // //   const fetchStudentCoursesData = async () => {
// // // // // // //     try {
// // // // // // //       setLoading(true);

// // // // // // //       // 1. Fetch the user's assigned course from the users table
// // // // // // //       const { data: userData, error: userError } = await supabase
// // // // // // //         .from("users")
// // // // // // //         .select(`
// // // // // // //           assigned_course_id,
// // // // // // //           courses:assigned_course_id (*)
// // // // // // //         `)
// // // // // // //         .eq("id", userId)
// // // // // // //         .single();

// // // // // // //       if (userError) throw userError;

// // // // // // //       // Extract the course object if it exists
// // // // // // //       const assignedCourse = userData?.courses ? [userData.courses] : [];
// // // // // // //       setCourses(assignedCourse);

// // // // // // //       const defaultCourse = assignedCourse[0] || null;
// // // // // // //       setActiveCourse(defaultCourse);

// // // // // // //       if (defaultCourse) {
// // // // // // //         const completedIds = await fetchLessonProgress();
// // // // // // //         await fetchCourseSyllabus(defaultCourse.id, completedIds);
// // // // // // //       }
// // // // // // //     } catch (err) {
// // // // // // //       console.error("Error fetching student data:", err.message);
// // // // // // //     } finally {
// // // // // // //       setLoading(false);
// // // // // // //     }
// // // // // // //   };

// // // // // // //   const fetchLessonProgress = async () => {
// // // // // // //     try {
// // // // // // //       const { data: progressData, error } = await supabase
// // // // // // //         .from("student_lesson_progress")
// // // // // // //         .select("lesson_id, status")
// // // // // // //         .eq("student_id", userId)
// // // // // // //         .eq("status", "completed");

// // // // // // //       if (error) throw error;

// // // // // // //       const completedSet = new Set(progressData.map((p) => p.lesson_id));
// // // // // // //       setCompletedLessonIds(completedSet);
// // // // // // //       return completedSet;
// // // // // // //     } catch (err) {
// // // // // // //       console.error("Error fetching progress:", err.message);
// // // // // // //       return new Set();
// // // // // // //     }
// // // // // // //   };

// // // // // // //   const fetchCourseSyllabus = async (targetCourseId, completedIds = completedLessonIds) => {
// // // // // // //     try {
// // // // // // //       // Fetch Phases along with nested Lessons
// // // // // // //       const { data: phaseData, error } = await supabase
// // // // // // //         .from("course_phases")
// // // // // // //         .select(`
// // // // // // //           id,
// // // // // // //           phase_number,
// // // // // // //           title,
// // // // // // //           focus,
// // // // // // //           course_lessons (
// // // // // // //             id,
// // // // // // //             title,
// // // // // // //             position,
// // // // // // //             created_at
// // // // // // //           )
// // // // // // //         `)
// // // // // // //         .eq("course_id", targetCourseId)
// // // // // // //         .order("phase_number", { ascending: true });

// // // // // // //       if (error) throw error;

// // // // // // //       // Fetch notes/materials associated with this course to map into lessons if needed
// // // // // // //       const { data: notesData } = await supabase
// // // // // // //         .from("notes")
// // // // // // //         .select("*")
// // // // // // //         .eq("course_id", targetCourseId);

// // // // // // //       // Sort nested lessons by position
// // // // // // //       const structuredPhases = (phaseData || []).map((phase) => ({
// // // // // // //         ...phase,
// // // // // // //         course_lessons: (phase.course_lessons || [])
// // // // // // //           .sort((a, b) => (a.position || 0) - (b.position || 0))
// // // // // // //           .map((lesson) => {
// // // // // // //             // Find matching note content if titles match or fallback
// // // // // // //             const matchingNote = (notesData || []).find(
// // // // // // //               (n) => n.title.toLowerCase() === lesson.title.toLowerCase()
// // // // // // //             );
// // // // // // //             return {
// // // // // // //               ...lesson,
// // // // // // //               content: matchingNote?.content || "",
// // // // // // //               video_url: matchingNote?.video_url || ""
// // // // // // //             };
// // // // // // //           })
// // // // // // //       }));

// // // // // // //       setPhases(structuredPhases);

// // // // // // //       // Auto-open the first phase that has uncompleted lessons (or phase 1 as fallback)
// // // // // // //       const activePhase =
// // // // // // //         structuredPhases.find((phase) =>
// // // // // // //           phase.course_lessons?.some((lesson) => !completedIds.has(lesson.id))
// // // // // // //         ) || structuredPhases[0];

// // // // // // //       const initialOpenState = {};
// // // // // // //       structuredPhases.forEach((p) => {
// // // // // // //         initialOpenState[p.id] = p.id === activePhase?.id;
// // // // // // //       });

// // // // // // //       setOpenPhases(initialOpenState);

// // // // // // //       // Auto-select the first lesson of the active phase
// // // // // // //       const firstIncompleteLesson =
// // // // // // //         activePhase?.course_lessons?.find((l) => !completedIds.has(l.id)) ||
// // // // // // //         activePhase?.course_lessons?.[0] ||
// // // // // // //         null;

// // // // // // //       setSelectedLesson(firstIncompleteLesson);
// // // // // // //     } catch (err) {
// // // // // // //       console.error("Error fetching syllabus:", err.message);
// // // // // // //     }
// // // // // // //   };

// // // // // // //   const toggleLessonCompletion = async (lessonId) => {
// // // // // // //     const isCompleted = completedLessonIds.has(lessonId);
// // // // // // //     const newStatus = isCompleted ? "in_progress" : "completed";

// // // // // // //     try {
// // // // // // //       const { error } = await supabase.from("student_lesson_progress").upsert(
// // // // // // //         {
// // // // // // //           student_id: userId,
// // // // // // //           lesson_id: lessonId,
// // // // // // //           status: newStatus,
// // // // // // //           completed_at: isCompleted ? null : new Date().toISOString()
// // // // // // //         },
// // // // // // //         { onConflict: "student_id,lesson_id" }
// // // // // // //       );

// // // // // // //       if (error) throw error;

// // // // // // //       setCompletedLessonIds((prev) => {
// // // // // // //         const next = new Set(prev);
// // // // // // //         if (isCompleted) next.delete(lessonId);
// // // // // // //         else next.add(lessonId);
// // // // // // //         return next;
// // // // // // //       });
// // // // // // //     } catch (err) {
// // // // // // //       console.error("Error toggling completion:", err.message);
// // // // // // //     }
// // // // // // //   };

// // // // // // //   const handleSelectCourse = (course) => {
// // // // // // //     setOpenPhases({});
// // // // // // //     setSelectedLesson(null);
// // // // // // //     setActiveCourse(course);
// // // // // // //     fetchCourseSyllabus(course.id);
// // // // // // //   };

// // // // // // //   const togglePhaseAccordion = (phaseId) => {
// // // // // // //     setOpenPhases((prev) => ({
// // // // // // //       ...prev,
// // // // // // //       [phaseId]: !prev[phaseId]
// // // // // // //     }));
// // // // // // //   };

// // // // // // //   const isPhaseCompleted = (phase) => {
// // // // // // //     if (!phase.course_lessons || phase.course_lessons.length === 0) return false;
// // // // // // //     return phase.course_lessons.every((lesson) => completedLessonIds.has(lesson.id));
// // // // // // //   };

// // // // // // //   if (loading) {
// // // // // // //     return (
// // // // // // //       <div className="min-h-[60vh] flex items-center justify-center">
// // // // // // //         <div className="bg-white/10 dark:bg-white/[0.04] backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[30px] p-8 text-center shadow-xl">
// // // // // // //           <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
// // // // // // //           <h2 className="text-gray-900 dark:text-white text-xl font-bold">
// // // // // // //             Loading Learning Workspace...
// // // // // // //           </h2>
// // // // // // //           <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
// // // // // // //             Fetching your interactive curriculum 🚀
// // // // // // //           </p>
// // // // // // //         </div>
// // // // // // //       </div>
// // // // // // //     );
// // // // // // //   }

// // // // // // //   return (
// // // // // // //     <div className="space-y-6 p-4 md:p-8 text-gray-900 dark:text-white max-w-7xl mx-auto">
// // // // // // //       {/* Horizontal Quick Course Switcher Bar */}
// // // // // // //       {courses.length > 0 && (
// // // // // // //         <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
// // // // // // //           {courses.map((course) => {
// // // // // // //             const isSelected = activeCourse?.id === course.id;
// // // // // // //             return (
// // // // // // //               <button
// // // // // // //                 key={course.id}
// // // // // // //                 onClick={() => handleSelectCourse(course)}
// // // // // // //                 className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-left shrink-0 transition-all ${
// // // // // // //                   isSelected
// // // // // // //                     ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20"
// // // // // // //                     : "bg-white dark:bg-white/[0.04] border-gray-200 dark:border-white/10 hover:border-purple-500/40 text-gray-700 dark:text-gray-200"
// // // // // // //                 }`}
// // // // // // //               >
// // // // // // //                 <div className="w-8 h-8 rounded-lg overflow-hidden bg-purple-500/20 shrink-0 flex items-center justify-center font-bold text-xs">
// // // // // // //                   {course.thumbnail_url ? (
// // // // // // //                     <img
// // // // // // //                       src={course.thumbnail_url}
// // // // // // //                       alt={course.title}
// // // // // // //                       className="w-full h-full object-cover"
// // // // // // //                     />
// // // // // // //                   ) : (
// // // // // // //                     <BookOpen size={16} className={isSelected ? "text-white" : "text-purple-500"} />
// // // // // // //                   )}
// // // // // // //                 </div>
// // // // // // //                 <span className="font-bold text-sm max-w-[180px] truncate">
// // // // // // //                   {course.title}
// // // // // // //                 </span>
// // // // // // //               </button>
// // // // // // //             );
// // // // // // //           })}
// // // // // // //         </div>
// // // // // // //       )}

// // // // // // //       {/* Empty State or Workspace Grid */}
// // // // // // //       {courses.length === 0 ? (
// // // // // // //         <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-[32px] p-12 text-center shadow-lg">
// // // // // // //           <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
// // // // // // //             🎓
// // // // // // //           </div>
// // // // // // //           <h3 className="text-xl font-bold">No Registered Courses Found</h3>
// // // // // // //           <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto text-sm">
// // // // // // //             You are not currently enrolled in any active courses. Please contact your administrator or instructor.
// // // // // // //           </p>
// // // // // // //         </div>
// // // // // // //       ) : (
// // // // // // //         activeCourse && (
// // // // // // //           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
// // // // // // //             {/* Left Sidebar: Sticky Syllabus & Course Overview */}
// // // // // // //             <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-6">
// // // // // // //               {/* Active Course Thumbnail & Stats Card */}
// // // // // // //               <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[28px] overflow-hidden shadow-xl p-5">
// // // // // // //                 <div className="relative h-36 rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
// // // // // // //                   {activeCourse.thumbnail_url ? (
// // // // // // //                     <img
// // // // // // //                       src={activeCourse.thumbnail_url}
// // // // // // //                       alt={activeCourse.title}
// // // // // // //                       className="w-full h-full object-cover"
// // // // // // //                     />
// // // // // // //                   ) : (
// // // // // // //                     <div className="text-center p-4">
// // // // // // //                       <BookOpen size={36} className="text-white/80 mx-auto mb-1" />
// // // // // // //                       <span className="text-xs font-bold text-white/70 uppercase tracking-widest">
// // // // // // //                         Course Track
// // // // // // //                       </span>
// // // // // // //                     </div>
// // // // // // //                   )}
// // // // // // //                   <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
// // // // // // //                   <h2 className="absolute bottom-3 left-4 right-4 font-black text-white text-lg line-clamp-1">
// // // // // // //                     {activeCourse.title}
// // // // // // //                   </h2>
// // // // // // //                 </div>

// // // // // // //                 <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 px-1">
// // // // // // //                   <span className="flex items-center gap-1.5">
// // // // // // //                     <Layers size={14} className="text-purple-500" />
// // // // // // //                     {phases.length} Phases
// // // // // // //                   </span>
// // // // // // //                   <span className="flex items-center gap-1.5">
// // // // // // //                     <CheckCircle2 size={14} className="text-emerald-500" />
// // // // // // //                     {completedLessonIds.size} Lessons Done
// // // // // // //                   </span>
// // // // // // //                 </div>
// // // // // // //               </div>

// // // // // // //               {/* Collapsible Syllabus Accordion */}
// // // // // // //               <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[28px] p-4 shadow-xl space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
// // // // // // //                 <h3 className="text-base font-black px-2 text-gray-900 dark:text-white flex items-center gap-2">
// // // // // // //                   Course Syllabus
// // // // // // //                 </h3>

// // // // // // //                 <div className="space-y-2">
// // // // // // //                   {phases.map((phase) => {
// // // // // // //                     const isOpen = !!openPhases[phase.id];
// // // // // // //                     const phaseDone = isPhaseCompleted(phase);

// // // // // // //                     return (
// // // // // // //                       <div
// // // // // // //                         key={phase.id}
// // // // // // //                         className="border border-gray-200/80 dark:border-white/10 rounded-2xl overflow-hidden transition-all bg-gray-50/50 dark:bg-white/[0.02]"
// // // // // // //                       >
// // // // // // //                         {/* Phase Header Button */}
// // // // // // //                         <button
// // // // // // //                           onClick={() => togglePhaseAccordion(phase.id)}
// // // // // // //                           className="w-full text-left p-3.5 flex items-center justify-between hover:bg-purple-500/5 transition-colors"
// // // // // // //                         >
// // // // // // //                           <div className="flex items-center gap-2.5 pr-2">
// // // // // // //                             {phaseDone ? (
// // // // // // //                               <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
// // // // // // //                             ) : (
// // // // // // //                               <div className="w-4 h-4 rounded-full border-2 border-purple-500/40 shrink-0" />
// // // // // // //                             )}
// // // // // // //                             <div>
// // // // // // //                               <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">
// // // // // // //                                 Phase {phase.phase_number}
// // // // // // //                               </span>
// // // // // // //                               <h4 className="font-bold text-xs md:text-sm text-gray-900 dark:text-white line-clamp-1">
// // // // // // //                                 {phase.title}
// // // // // // //                               </h4>
// // // // // // //                             </div>
// // // // // // //                           </div>

// // // // // // //                           {isOpen ? (
// // // // // // //                             <ChevronDown size={16} className="text-gray-400 shrink-0" />
// // // // // // //                           ) : (
// // // // // // //                             <ChevronRight size={16} className="text-gray-400 shrink-0" />
// // // // // // //                           )}
// // // // // // //                         </button>

// // // // // // //                         {/* Collapsible Lesson List */}
// // // // // // //                         {isOpen && (
// // // // // // //                           <div className="p-2 pt-0 space-y-1.5 border-t border-gray-200/50 dark:border-white/5">
// // // // // // //                             {phase.course_lessons?.map((lesson) => {
// // // // // // //                               const isSelected = selectedLesson?.id === lesson.id;
// // // // // // //                               const isDone = completedLessonIds.has(lesson.id);

// // // // // // //                               return (
// // // // // // //                                 <button
// // // // // // //                                   key={lesson.id}
// // // // // // //                                   onClick={() => setSelectedLesson(lesson)}
// // // // // // //                                   className={`w-full text-left rounded-xl p-2.5 transition-all flex items-center justify-between border ${
// // // // // // //                                     isSelected
// // // // // // //                                       ? "bg-purple-600 text-white border-transparent shadow-md"
// // // // // // //                                       : "bg-white dark:bg-white/[0.03] border-gray-200/60 dark:border-white/5 hover:border-purple-500/30"
// // // // // // //                                   }`}
// // // // // // //                                 >
// // // // // // //                                   <div className="flex items-center gap-2 min-w-0 pr-2">
// // // // // // //                                     {isDone ? (
// // // // // // //                                       <CheckCircle2
// // // // // // //                                         size={15}
// // // // // // //                                         className={isSelected ? "text-white" : "text-emerald-500"}
// // // // // // //                                       />
// // // // // // //                                     ) : (
// // // // // // //                                       <Circle
// // // // // // //                                         size={15}
// // // // // // //                                         className={isSelected ? "text-white/70" : "text-gray-400"}
// // // // // // //                                       />
// // // // // // //                                     )}
// // // // // // //                                     <span
// // // // // // //                                       className={`text-xs font-bold truncate ${
// // // // // // //                                         isSelected
// // // // // // //                                           ? "text-white"
// // // // // // //                                           : "text-gray-800 dark:text-gray-200"
// // // // // // //                                       }`}
// // // // // // //                                     >
// // // // // // //                                       {lesson.title}
// // // // // // //                                     </span>
// // // // // // //                                   </div>
// // // // // // //                                   <ChevronRight
// // // // // // //                                     size={13}
// // // // // // //                                     className={isSelected ? "text-white/80" : "text-gray-400"}
// // // // // // //                                   />
// // // // // // //                                 </button>
// // // // // // //                               );
// // // // // // //                             })}
// // // // // // //                           </div>
// // // // // // //                         )}
// // // // // // //                       </div>
// // // // // // //                     );
// // // // // // //                   })}
// // // // // // //                 </div>
// // // // // // //               </div>
// // // // // // //             </div>

// // // // // // //             {/* Right Main Panel: Active Lesson Content Display */}
// // // // // // //             <div className="lg:col-span-8">
// // // // // // //               <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[32px] p-6 md:p-8 shadow-xl">
// // // // // // //                 {selectedLesson ? (
// // // // // // //                   <div>
// // // // // // //                     {/* Active Lesson Header & Action */}
// // // // // // //                     <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
// // // // // // //                       <div>
// // // // // // //                         <span className="text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
// // // // // // //                           Active Lesson
// // // // // // //                         </span>
// // // // // // //                         <h2 className="text-2xl md:text-3xl font-black mt-2 text-gray-900 dark:text-white">
// // // // // // //                           {selectedLesson.title}
// // // // // // //                         </h2>
// // // // // // //                       </div>

// // // // // // //                       <button
// // // // // // //                         onClick={() => toggleLessonCompletion(selectedLesson.id)}
// // // // // // //                         className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
// // // // // // //                           completedLessonIds.has(selectedLesson.id)
// // // // // // //                             ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20"
// // // // // // //                             : "bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-500/20"
// // // // // // //                         }`}
// // // // // // //                       >
// // // // // // //                         {completedLessonIds.has(selectedLesson.id) ? (
// // // // // // //                           <>
// // // // // // //                             <CheckCircle2 size={16} /> Completed
// // // // // // //                           </>
// // // // // // //                         ) : (
// // // // // // //                           <>
// // // // // // //                             <Circle size={16} /> Mark as Complete
// // // // // // //                           </>
// // // // // // //                         )}
// // // // // // //                       </button>
// // // // // // //                     </div>

// // // // // // //                     {/* Active Lesson Content & Video Display */}
// // // // // // //                     <div className="border-t border-gray-100 dark:border-white/[0.08] pt-6 space-y-6">
// // // // // // //                       {selectedLesson.video_url && (
// // // // // // //                         <div className="relative rounded-2xl overflow-hidden aspect-video bg-black shadow-lg border border-gray-200/20 dark:border-white/10">
// // // // // // //                           <iframe
// // // // // // //                             src={selectedLesson.video_url}
// // // // // // //                             title="Lesson Video"
// // // // // // //                             className="w-full h-full border-0"
// // // // // // //                             allowFullScreen
// // // // // // //                           />
// // // // // // //                         </div>
// // // // // // //                       )}

// // // // // // //                       {selectedLesson.content ? (
// // // // // // //                         <div className="bg-gray-50/80 dark:bg-white/[0.02] p-5 md:p-6 rounded-2xl border border-gray-200/60 dark:border-white/5 space-y-3">
// // // // // // //                           <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
// // // // // // //                             {selectedLesson.content}
// // // // // // //                           </p>
// // // // // // //                         </div>
// // // // // // //                       ) : (
// // // // // // //                         <div className="text-center py-12 text-gray-400">
// // // // // // //                           <p className="text-sm">No notes or study materials specified for this lesson yet.</p>
// // // // // // //                         </div>
// // // // // // //                       )}
// // // // // // //                     </div>
// // // // // // //                   </div>
// // // // // // //                 ) : (
// // // // // // //                   <div className="text-center py-20 text-gray-400">
// // // // // // //                     <BookOpen size={48} className="mx-auto mb-4 opacity-40 text-purple-500" />
// // // // // // //                     <p className="text-base font-bold text-gray-700 dark:text-gray-300">
// // // // // // //                       Select a lesson from the syllabus sidebar to begin learning.
// // // // // // //                     </p>
// // // // // // //                   </div>
// // // // // // //                 )}
// // // // // // //               </div>
// // // // // // //             </div>
// // // // // // //           </div>
// // // // // // //         )
// // // // // // //       )}
// // // // // // //     </div>
// // // // // // //   );
// // // // // // // }
// // // // // // // // import React, { useEffect, useState } from "react";
// // // // // // // // import {
// // // // // // // //   BookOpen,
// // // // // // // //   ChevronRight,
// // // // // // // //   ChevronDown,
// // // // // // // //   CheckCircle2,
// // // // // // // //   Circle,
// // // // // // // //   Layers,
// // // // // // // //   Rocket,
// // // // // // // //   FileText
// // // // // // // // } from "lucide-react";
// // // // // // // // import { supabase } from "../../../supabase";

// // // // // // // // export default function StudentCoursesView({ userId, courseId }) {
// // // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // // //   const [courses, setCourses] = useState([]);
// // // // // // // //   const [activeCourse, setActiveCourse] = useState(null);

// // // // // // // //   // Structured Phase -> Lessons state
// // // // // // // //   const [phases, setPhases] = useState([]);
// // // // // // // //   const [selectedLesson, setSelectedLesson] = useState(null);
// // // // // // // //   const [completedLessonIds, setCompletedLessonIds] = useState(new Set());

// // // // // // // //   // Track open/collapsed phases by phase ID
// // // // // // // //   const [openPhases, setOpenPhases] = useState({});

// // // // // // // //   useEffect(() => {
// // // // // // // //     if (userId) {
// // // // // // // //       fetchStudentCoursesData();
// // // // // // // //     }
// // // // // // // //   }, [userId, courseId]);

// // // // // // // //   const fetchStudentCoursesData = async () => {
// // // // // // // //     try {
// // // // // // // //       setLoading(true);

// // // // // // // //       // 1. Fetch the user's assigned course from the users table
// // // // // // // //       const { data: userData, error: userError } = await supabase
// // // // // // // //         .from("users")
// // // // // // // //         .select(`
// // // // // // // //           assigned_course_id,
// // // // // // // //           courses:assigned_course_id (*)
// // // // // // // //         `)
// // // // // // // //         .eq("id", userId)
// // // // // // // //         .single();

// // // // // // // //       if (userError) throw userError;

// // // // // // // //       // Extract the course object if it exists
// // // // // // // //       const assignedCourse = userData?.courses ? [userData.courses] : [];
// // // // // // // //       setCourses(assignedCourse);

// // // // // // // //       const defaultCourse = assignedCourse[0] || null;
// // // // // // // //       setActiveCourse(defaultCourse);

// // // // // // // //       if (defaultCourse) {
// // // // // // // //         const completedIds = await fetchLessonProgress();
// // // // // // // //         await fetchCourseSyllabus(defaultCourse.id, completedIds);
// // // // // // // //       }
// // // // // // // //     } catch (err) {
// // // // // // // //       console.error("Error fetching student data:", err.message);
// // // // // // // //     } finally {
// // // // // // // //       setLoading(false);
// // // // // // // //     }
// // // // // // // //   };

// // // // // // // //   const fetchLessonProgress = async () => {
// // // // // // // //     try {
// // // // // // // //       const { data: progressData, error } = await supabase
// // // // // // // //         .from("student_lesson_progress")
// // // // // // // //         .select("lesson_id, status")
// // // // // // // //         .eq("student_id", userId)
// // // // // // // //         .eq("status", "completed");

// // // // // // // //       if (error) throw error;

// // // // // // // //       const completedSet = new Set(progressData.map((p) => p.lesson_id));
// // // // // // // //       setCompletedLessonIds(completedSet);
// // // // // // // //       return completedSet;
// // // // // // // //     } catch (err) {
// // // // // // // //       console.error("Error fetching progress:", err.message);
// // // // // // // //       return new Set();
// // // // // // // //     }
// // // // // // // //   };

// // // // // // // //   const fetchCourseSyllabus = async (targetCourseId, completedIds = completedLessonIds) => {
// // // // // // // //     try {
// // // // // // // //       // Fetch Phases along with nested Lessons & Topics ordered appropriately
// // // // // // // //       const { data: phaseData, error } = await supabase
// // // // // // // //         .from("course_phases")
// // // // // // // //         .select(`
// // // // // // // //           id,
// // // // // // // //           phase_number,
// // // // // // // //           title,
// // // // // // // //           focus,
// // // // // // // //           course_lessons (
// // // // // // // //             id,
// // // // // // // //             title,
// // // // // // // //             position,
// // // // // // // //             created_at,
// // // // // // // //             course_topics (
// // // // // // // //               id,
// // // // // // // //               intro,
// // // // // // // //               topic_blocks ( id, type, content, video_path, position )
// // // // // // // //             )
// // // // // // // //           )
// // // // // // // //         `)
// // // // // // // //         .eq("course_id", targetCourseId)
// // // // // // // //         .order("phase_number", { ascending: true });

// // // // // // // //       if (error) throw error;

// // // // // // // //       // Sort nested lessons by position and sort topic blocks if position exists
// // // // // // // //       const structuredPhases = (phaseData || []).map((phase) => ({
// // // // // // // //         ...phase,
// // // // // // // //         course_lessons: (phase.course_lessons || [])
// // // // // // // //           .sort((a, b) => (a.position || 0) - (b.position || 0))
// // // // // // // //           .map((lesson) => ({
// // // // // // // //             ...lesson,
// // // // // // // //             course_topics: (lesson.course_topics || []).map((topic) => ({
// // // // // // // //               ...topic,
// // // // // // // //               topic_blocks: (topic.topic_blocks || []).sort(
// // // // // // // //                 (a, b) => (a.position || 0) - (b.position || 0)
// // // // // // // //               )
// // // // // // // //             }))
// // // // // // // //           }))
// // // // // // // //       }));

// // // // // // // //       setPhases(structuredPhases);

// // // // // // // //       // Auto-open the first phase that has uncompleted lessons (or phase 1 as fallback)
// // // // // // // //       const activePhase =
// // // // // // // //         structuredPhases.find((phase) =>
// // // // // // // //           phase.course_lessons?.some((lesson) => !completedIds.has(lesson.id))
// // // // // // // //         ) || structuredPhases[0];

// // // // // // // //       const initialOpenState = {};
// // // // // // // //       structuredPhases.forEach((p) => {
// // // // // // // //         initialOpenState[p.id] = p.id === activePhase?.id;
// // // // // // // //       });

// // // // // // // //       setOpenPhases(initialOpenState);

// // // // // // // //       // Auto-select the first lesson of the active phase
// // // // // // // //       const firstIncompleteLesson =
// // // // // // // //         activePhase?.course_lessons?.find((l) => !completedIds.has(l.id)) ||
// // // // // // // //         activePhase?.course_lessons?.[0] ||
// // // // // // // //         null;

// // // // // // // //       setSelectedLesson(firstIncompleteLesson);
// // // // // // // //     } catch (err) {
// // // // // // // //       console.error("Error fetching syllabus:", err.message);
// // // // // // // //     }
// // // // // // // //   };

// // // // // // // //   const toggleLessonCompletion = async (lessonId) => {
// // // // // // // //     const isCompleted = completedLessonIds.has(lessonId);
// // // // // // // //     const newStatus = isCompleted ? "in_progress" : "completed";

// // // // // // // //     try {
// // // // // // // //       const { error } = await supabase.from("student_lesson_progress").upsert(
// // // // // // // //         {
// // // // // // // //           student_id: userId,
// // // // // // // //           lesson_id: lessonId,
// // // // // // // //           status: newStatus,
// // // // // // // //           completed_at: isCompleted ? null : new Date().toISOString()
// // // // // // // //         },
// // // // // // // //         { onConflict: "student_id,lesson_id" }
// // // // // // // //       );

// // // // // // // //       if (error) throw error;

// // // // // // // //       setCompletedLessonIds((prev) => {
// // // // // // // //         const next = new Set(prev);
// // // // // // // //         if (isCompleted) next.delete(lessonId);
// // // // // // // //         else next.add(lessonId);
// // // // // // // //         return next;
// // // // // // // //       });
// // // // // // // //     } catch (err) {
// // // // // // // //       console.error("Error toggling completion:", err.message);
// // // // // // // //     }
// // // // // // // //   };

// // // // // // // //   const handleSelectCourse = (course) => {
// // // // // // // //     setOpenPhases({});
// // // // // // // //     setSelectedLesson(null);
// // // // // // // //     setActiveCourse(course);
// // // // // // // //     fetchCourseSyllabus(course.id);
// // // // // // // //   };

// // // // // // // //   const togglePhaseAccordion = (phaseId) => {
// // // // // // // //     setOpenPhases((prev) => ({
// // // // // // // //       ...prev,
// // // // // // // //       [phaseId]: !prev[phaseId]
// // // // // // // //     }));
// // // // // // // //   };

// // // // // // // //   const isPhaseCompleted = (phase) => {
// // // // // // // //     if (!phase.course_lessons || phase.course_lessons.length === 0) return false;
// // // // // // // //     return phase.course_lessons.every((lesson) => completedLessonIds.has(lesson.id));
// // // // // // // //   };

// // // // // // // //   if (loading) {
// // // // // // // //     return (
// // // // // // // //       <div className="min-h-[60vh] flex items-center justify-center">
// // // // // // // //         <div className="bg-white/10 dark:bg-white/[0.04] backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[30px] p-8 text-center shadow-xl">
// // // // // // // //           <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
// // // // // // // //           <h2 className="text-gray-900 dark:text-white text-xl font-bold">
// // // // // // // //             Loading Learning Workspace...
// // // // // // // //           </h2>
// // // // // // // //           <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
// // // // // // // //             Fetching your interactive curriculum 🚀
// // // // // // // //           </p>
// // // // // // // //         </div>
// // // // // // // //       </div>
// // // // // // // //     );
// // // // // // // //   }

// // // // // // // //   return (
// // // // // // // //     <div className="space-y-6 p-4 md:p-8 text-gray-900 dark:text-white max-w-7xl mx-auto">
// // // // // // // //       {/* 2. Horizontal Quick Course Switcher Bar */}
// // // // // // // //       {courses.length > 0 && (
// // // // // // // //         <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
// // // // // // // //           {courses.map((course) => {
// // // // // // // //             const isSelected = activeCourse?.id === course.id;
// // // // // // // //             return (
// // // // // // // //               <button
// // // // // // // //                 key={course.id}
// // // // // // // //                 onClick={() => handleSelectCourse(course)}
// // // // // // // //                 className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-left shrink-0 transition-all ${
// // // // // // // //                   isSelected
// // // // // // // //                     ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20"
// // // // // // // //                     : "bg-white dark:bg-white/[0.04] border-gray-200 dark:border-white/10 hover:border-purple-500/40 text-gray-700 dark:text-gray-200"
// // // // // // // //                 }`}
// // // // // // // //               >
// // // // // // // //                 <div className="w-8 h-8 rounded-lg overflow-hidden bg-purple-500/20 shrink-0 flex items-center justify-center font-bold text-xs">
// // // // // // // //                   {course.thumbnail_url ? (
// // // // // // // //                     <img
// // // // // // // //                       src={course.thumbnail_url}
// // // // // // // //                       alt={course.title}
// // // // // // // //                       className="w-full h-full object-cover"
// // // // // // // //                     />
// // // // // // // //                   ) : (
// // // // // // // //                     <BookOpen size={16} className={isSelected ? "text-white" : "text-purple-500"} />
// // // // // // // //                   )}
// // // // // // // //                 </div>
// // // // // // // //                 <span className="font-bold text-sm max-w-[180px] truncate">
// // // // // // // //                   {course.title}
// // // // // // // //                 </span>
// // // // // // // //               </button>
// // // // // // // //             );
// // // // // // // //           })}
// // // // // // // //         </div>
// // // // // // // //       )}

// // // // // // // //       {/* 3. Empty State or Workspace Grid */}
// // // // // // // //       {courses.length === 0 ? (
// // // // // // // //         <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-[32px] p-12 text-center shadow-lg">
// // // // // // // //           <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
// // // // // // // //             🎓
// // // // // // // //           </div>
// // // // // // // //           <h3 className="text-xl font-bold">No Registered Courses Found</h3>
// // // // // // // //           <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto text-sm">
// // // // // // // //             You are not currently enrolled in any active courses. Please contact your administrator or instructor.
// // // // // // // //           </p>
// // // // // // // //         </div>
// // // // // // // //       ) : (
// // // // // // // //         activeCourse && (
// // // // // // // //           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
// // // // // // // //             {/* Left Sidebar: Sticky Syllabus & Course Overview */}
// // // // // // // //             <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-6">
// // // // // // // //               {/* Active Course Thumbnail & Stats Card */}
// // // // // // // //               <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[28px] overflow-hidden shadow-xl p-5">
// // // // // // // //                 <div className="relative h-36 rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
// // // // // // // //                   {activeCourse.thumbnail_url ? (
// // // // // // // //                     <img
// // // // // // // //                       src={activeCourse.thumbnail_url}
// // // // // // // //                       alt={activeCourse.title}
// // // // // // // //                       className="w-full h-full object-cover"
// // // // // // // //                     />
// // // // // // // //                   ) : (
// // // // // // // //                     <div className="text-center p-4">
// // // // // // // //                       <BookOpen size={36} className="text-white/80 mx-auto mb-1" />
// // // // // // // //                       <span className="text-xs font-bold text-white/70 uppercase tracking-widest">
// // // // // // // //                         Course Track
// // // // // // // //                       </span>
// // // // // // // //                     </div>
// // // // // // // //                   )}
// // // // // // // //                   <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
// // // // // // // //                   <h2 className="absolute bottom-3 left-4 right-4 font-black text-white text-lg line-clamp-1">
// // // // // // // //                     {activeCourse.title}
// // // // // // // //                   </h2>
// // // // // // // //                 </div>

// // // // // // // //                 <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 px-1">
// // // // // // // //                   <span className="flex items-center gap-1.5">
// // // // // // // //                     <Layers size={14} className="text-purple-500" />
// // // // // // // //                     {phases.length} Phases
// // // // // // // //                   </span>
// // // // // // // //                   <span className="flex items-center gap-1.5">
// // // // // // // //                     <CheckCircle2 size={14} className="text-emerald-500" />
// // // // // // // //                     {completedLessonIds.size} Lessons Done
// // // // // // // //                   </span>
// // // // // // // //                 </div>
// // // // // // // //               </div>

// // // // // // // //               {/* Collapsible Syllabus Accordion */}
// // // // // // // //               <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[28px] p-4 shadow-xl space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
// // // // // // // //                 <h3 className="text-base font-black px-2 text-gray-900 dark:text-white flex items-center gap-2">
// // // // // // // //                   Course Syllabus
// // // // // // // //                 </h3>

// // // // // // // //                 <div className="space-y-2">
// // // // // // // //                   {phases.map((phase) => {
// // // // // // // //                     const isOpen = !!openPhases[phase.id];
// // // // // // // //                     const phaseDone = isPhaseCompleted(phase);

// // // // // // // //                     return (
// // // // // // // //                       <div
// // // // // // // //                         key={phase.id}
// // // // // // // //                         className="border border-gray-200/80 dark:border-white/10 rounded-2xl overflow-hidden transition-all bg-gray-50/50 dark:bg-white/[0.02]"
// // // // // // // //                       >
// // // // // // // //                         {/* Phase Header Button */}
// // // // // // // //                         <button
// // // // // // // //                           onClick={() => togglePhaseAccordion(phase.id)}
// // // // // // // //                           className="w-full text-left p-3.5 flex items-center justify-between hover:bg-purple-500/5 transition-colors"
// // // // // // // //                         >
// // // // // // // //                           <div className="flex items-center gap-2.5 pr-2">
// // // // // // // //                             {phaseDone ? (
// // // // // // // //                               <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
// // // // // // // //                             ) : (
// // // // // // // //                               <div className="w-4 h-4 rounded-full border-2 border-purple-500/40 shrink-0" />
// // // // // // // //                             )}
// // // // // // // //                             <div>
// // // // // // // //                               <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">
// // // // // // // //                                 Phase {phase.phase_number}
// // // // // // // //                               </span>
// // // // // // // //                               <h4 className="font-bold text-xs md:text-sm text-gray-900 dark:text-white line-clamp-1">
// // // // // // // //                                 {phase.title}
// // // // // // // //                               </h4>
// // // // // // // //                             </div>
// // // // // // // //                           </div>

// // // // // // // //                           {isOpen ? (
// // // // // // // //                             <ChevronDown size={16} className="text-gray-400 shrink-0" />
// // // // // // // //                           ) : (
// // // // // // // //                             <ChevronRight size={16} className="text-gray-400 shrink-0" />
// // // // // // // //                           )}
// // // // // // // //                         </button>

// // // // // // // //                         {/* Collapsible Lesson List */}
// // // // // // // //                         {isOpen && (
// // // // // // // //                           <div className="p-2 pt-0 space-y-1.5 border-t border-gray-200/50 dark:border-white/5">
// // // // // // // //                             {phase.course_lessons?.map((lesson) => {
// // // // // // // //                               const isSelected = selectedLesson?.id === lesson.id;
// // // // // // // //                               const isDone = completedLessonIds.has(lesson.id);

// // // // // // // //                               return (
// // // // // // // //                                 <button
// // // // // // // //                                   key={lesson.id}
// // // // // // // //                                   onClick={() => setSelectedLesson(lesson)}
// // // // // // // //                                   className={`w-full text-left rounded-xl p-2.5 transition-all flex items-center justify-between border ${
// // // // // // // //                                     isSelected
// // // // // // // //                                       ? "bg-purple-600 text-white border-transparent shadow-md"
// // // // // // // //                                       : "bg-white dark:bg-white/[0.03] border-gray-200/60 dark:border-white/5 hover:border-purple-500/30"
// // // // // // // //                                   }`}
// // // // // // // //                                 >
// // // // // // // //                                   <div className="flex items-center gap-2 min-w-0 pr-2">
// // // // // // // //                                     {isDone ? (
// // // // // // // //                                       <CheckCircle2
// // // // // // // //                                         size={15}
// // // // // // // //                                         className={isSelected ? "text-white" : "text-emerald-500"}
// // // // // // // //                                       />
// // // // // // // //                                     ) : (
// // // // // // // //                                       <Circle
// // // // // // // //                                         size={15}
// // // // // // // //                                         className={isSelected ? "text-white/70" : "text-gray-400"}
// // // // // // // //                                       />
// // // // // // // //                                     )}
// // // // // // // //                                     <span
// // // // // // // //                                       className={`text-xs font-bold truncate ${
// // // // // // // //                                         isSelected
// // // // // // // //                                           ? "text-white"
// // // // // // // //                                           : "text-gray-800 dark:text-gray-200"
// // // // // // // //                                       }`}
// // // // // // // //                                     >
// // // // // // // //                                       {lesson.title}
// // // // // // // //                                     </span>
// // // // // // // //                                   </div>
// // // // // // // //                                   <ChevronRight
// // // // // // // //                                     size={13}
// // // // // // // //                                     className={isSelected ? "text-white/80" : "text-gray-400"}
// // // // // // // //                                   />
// // // // // // // //                                 </button>
// // // // // // // //                               );
// // // // // // // //                             })}
// // // // // // // //                           </div>
// // // // // // // //                         )}
// // // // // // // //                       </div>
// // // // // // // //                     );
// // // // // // // //                   })}
// // // // // // // //                 </div>
// // // // // // // //               </div>
// // // // // // // //             </div>

// // // // // // // //             {/* Right Main Panel: Active Lesson Content Display */}
// // // // // // // //             <div className="lg:col-span-8">
// // // // // // // //               <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[32px] p-6 md:p-8 shadow-xl">
// // // // // // // //                 {selectedLesson ? (
// // // // // // // //                   <div>
// // // // // // // //                     {/* Active Lesson Header & Action */}
// // // // // // // //                     <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
// // // // // // // //                       <div>
// // // // // // // //                         <span className="text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
// // // // // // // //                           Active Lesson
// // // // // // // //                         </span>
// // // // // // // //                         <h2 className="text-2xl md:text-3xl font-black mt-2 text-gray-900 dark:text-white">
// // // // // // // //                           {selectedLesson.title}
// // // // // // // //                         </h2>
// // // // // // // //                       </div>

// // // // // // // //                       <button
// // // // // // // //                         onClick={() => toggleLessonCompletion(selectedLesson.id)}
// // // // // // // //                         className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
// // // // // // // //                           completedLessonIds.has(selectedLesson.id)
// // // // // // // //                             ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20"
// // // // // // // //                             : "bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-500/20"
// // // // // // // //                         }`}
// // // // // // // //                       >
// // // // // // // //                         {completedLessonIds.has(selectedLesson.id) ? (
// // // // // // // //                           <>
// // // // // // // //                             <CheckCircle2 size={16} /> Completed
// // // // // // // //                           </>
// // // // // // // //                         ) : (
// // // // // // // //                           <>
// // // // // // // //                             <Circle size={16} /> Mark as Complete
// // // // // // // //                           </>
// // // // // // // //                         )}
// // // // // // // //                       </button>
// // // // // // // //                     </div>

// // // // // // // //                     {/* Active Lesson Topics Display */}
// // // // // // // //                     <div className="border-t border-gray-100 dark:border-white/[0.08] pt-6 space-y-8">
// // // // // // // //                       {selectedLesson.course_topics && selectedLesson.course_topics.length > 0 ? (
// // // // // // // //                         selectedLesson.course_topics.map((topic) => {
// // // // // // // //                           const videoBlocks = topic.topic_blocks?.filter(
// // // // // // // //                             (b) => b.type === "video" && b.video_path
// // // // // // // //                           ) || [];
// // // // // // // //                           const textBlocks = topic.topic_blocks?.filter(
// // // // // // // //                             (b) => ["text", "notes", "note", "markdown"].includes(b.type?.toLowerCase()) && b.content
// // // // // // // //                           ) || [];

// // // // // // // //                           return (
// // // // // // // //                             <div key={topic.id} className="space-y-4">
// // // // // // // //                               {topic.intro && (
// // // // // // // //                                 <h4 className="font-bold text-lg text-purple-600 dark:text-purple-400 flex items-center gap-2">
// // // // // // // //                                   <FileText size={20} />
// // // // // // // //                                   {topic.intro}
// // // // // // // //                                 </h4>
// // // // // // // //                               )}

// // // // // // // //                               {/* Top Block: Videos First */}
// // // // // // // //                               {videoBlocks.map((block) => (
// // // // // // // //                                 <div
// // // // // // // //                                   key={block.id}
// // // // // // // //                                   className="relative rounded-2xl overflow-hidden aspect-video bg-black shadow-lg border border-gray-200/20 dark:border-white/10"
// // // // // // // //                                 >
// // // // // // // //                                   <iframe
// // // // // // // //                                     src={block.video_path}
// // // // // // // //                                     title="Topic Video"
// // // // // // // //                                     className="w-full h-full border-0"
// // // // // // // //                                     allowFullScreen
// // // // // // // //                                   />
// // // // // // // //                                 </div>
// // // // // // // //                               ))}

// // // // // // // //                               {/* Bottom Block: Text Notes / Reading Material Second */}
// // // // // // // //                               {textBlocks.map((block) => (
// // // // // // // //                                 <div
// // // // // // // //                                   key={block.id}
// // // // // // // //                                   className="bg-gray-50/80 dark:bg-white/[0.02] p-5 md:p-6 rounded-2xl border border-gray-200/60 dark:border-white/5 space-y-3"
// // // // // // // //                                 >
// // // // // // // //                                   <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
// // // // // // // //                                     {block.content}
// // // // // // // //                                   </p>
// // // // // // // //                                 </div>
// // // // // // // //                               ))}
// // // // // // // //                             </div>
// // // // // // // //                           );
// // // // // // // //                         })
// // // // // // // //                       ) : (
// // // // // // // //                         <div className="text-center py-12 text-gray-400">
// // // // // // // //                           <p className="text-sm">No topic modules found for this lesson.</p>
// // // // // // // //                         </div>
// // // // // // // //                       )}
// // // // // // // //                     </div>
// // // // // // // //                   </div>
// // // // // // // //                 ) : (
// // // // // // // //                   <div className="text-center py-20 text-gray-400">
// // // // // // // //                     <BookOpen size={48} className="mx-auto mb-4 opacity-40 text-purple-500" />
// // // // // // // //                     <p className="text-base font-bold text-gray-700 dark:text-gray-300">
// // // // // // // //                       Select a lesson from the syllabus sidebar to begin learning.
// // // // // // // //                     </p>
// // // // // // // //                   </div>
// // // // // // // //                 )}
// // // // // // // //               </div>
// // // // // // // //             </div>
// // // // // // // //           </div>
// // // // // // // //         )
// // // // // // // //       )}
// // // // // // // //     </div>
// // // // // // // //   );
// // // // // // // // }
// // // // // // // // // import React, { useEffect, useState } from "react";
// // // // // // // // // import {
// // // // // // // // //   BookOpen,
// // // // // // // // //   ChevronRight,
// // // // // // // // //   ChevronDown,
// // // // // // // // //   CheckCircle2,
// // // // // // // // //   Circle,
// // // // // // // // //   Layers,
// // // // // // // // //   Rocket,
// // // // // // // // //   FileText
// // // // // // // // // } from "lucide-react";
// // // // // // // // // import { supabase } from "../../../supabase";

// // // // // // // // // export default function StudentCoursesView({ userId, courseId }) {
// // // // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // // // //   const [courses, setCourses] = useState([]);
// // // // // // // // //   const [activeCourse, setActiveCourse] = useState(null);

// // // // // // // // //   // Structured Phase -> Lessons state
// // // // // // // // //   const [phases, setPhases] = useState([]);
// // // // // // // // //   const [selectedLesson, setSelectedLesson] = useState(null);
// // // // // // // // //   const [completedLessonIds, setCompletedLessonIds] = useState(new Set());

// // // // // // // // //   // Track open/collapsed phases by phase ID
// // // // // // // // //   const [openPhases, setOpenPhases] = useState({});

// // // // // // // // //   useEffect(() => {
// // // // // // // // //     if (userId) {
// // // // // // // // //       fetchStudentCoursesData();
// // // // // // // // //     }
// // // // // // // // //   }, [userId, courseId]);

// // // // // // // // //   // const fetchStudentCoursesData = async () => {
// // // // // // // // //   //   try {
// // // // // // // // //   //     setLoading(true);

// // // // // // // // //   //     // 1. Fetch registered courses for student
// // // // // // // // //   //     const { data: enrollmentData, error: enrollError } = await supabase
// // // // // // // // //   //       .from("student_enrollments")
// // // // // // // // //   //       .select(`
// // // // // // // // //   //         course_id,
// // // // // // // // //   //         courses (*)
// // // // // // // // //   //       `)
// // // // // // // // //   //       .eq("student_id", userId);

// // // // // // // // //   //     if (enrollError) throw enrollError;

// // // // // // // // //   //     const enrolledCourses = enrollmentData
// // // // // // // // //   //       ? enrollmentData.map((e) => e.courses).filter(Boolean)
// // // // // // // // //   //       : [];

// // // // // // // // //   //     setCourses(enrolledCourses);

// // // // // // // // //   //     // 2. Set default active course (passed prop -> first enrolled -> null)
// // // // // // // // //   //     const defaultCourse =
// // // // // // // // //   //       enrolledCourses.find((c) => c.id === courseId) ||
// // // // // // // // //   //       enrolledCourses[0] ||
// // // // // // // // //   //       null;

// // // // // // // // //   //     setActiveCourse(defaultCourse);

// // // // // // // // //   //     if (defaultCourse) {
// // // // // // // // //   //       // Fetch lesson progress first so we know which phase to auto-open
// // // // // // // // //   //       const completedIds = await fetchLessonProgress();
// // // // // // // // //   //       await fetchCourseSyllabus(defaultCourse.id, completedIds);
// // // // // // // // //   //     }
// // // // // // // // //   //   } catch (err) {
// // // // // // // // //   //     console.error("Error fetching student data:", err.message);
// // // // // // // // //   //   } finally {
// // // // // // // // //   //     setLoading(false);
// // // // // // // // //   //   }
// // // // // // // // //   // };
// // // // // // // // // const fetchStudentCoursesData = async () => {
// // // // // // // // //     try {
// // // // // // // // //       setLoading(true);

// // // // // // // // //       // 1. Fetch the user's assigned course from the users table
// // // // // // // // //       const { data: userData, error: userError } = await supabase
// // // // // // // // //         .from("users")
// // // // // // // // //         .select(`
// // // // // // // // //           assigned_course_id,
// // // // // // // // //           courses:assigned_course_id (*)
// // // // // // // // //         `)
// // // // // // // // //         .eq("id", userId)
// // // // // // // // //         .single();

// // // // // // // // //       if (userError) throw userError;

// // // // // // // // //       // Extract the course object if it exists
// // // // // // // // //       const assignedCourse = userData?.courses ? [userData.courses] : [];
// // // // // // // // //       setCourses(assignedCourse);

// // // // // // // // //       const defaultCourse = assignedCourse[0] || null;
// // // // // // // // //       setActiveCourse(defaultCourse);

// // // // // // // // //       if (defaultCourse) {
// // // // // // // // //         const completedIds = await fetchLessonProgress();
// // // // // // // // //         await fetchCourseSyllabus(defaultCourse.id, completedIds);
// // // // // // // // //       }
// // // // // // // // //     } catch (err) {
// // // // // // // // //       console.error("Error fetching student data:", err.message);
// // // // // // // // //     } finally {
// // // // // // // // //       setLoading(false);
// // // // // // // // //     }
// // // // // // // // //   };
// // // // // // // // //   const fetchLessonProgress = async () => {
// // // // // // // // //     try {
// // // // // // // // //       const { data: progressData, error } = await supabase
// // // // // // // // //         .from("student_lesson_progress")
// // // // // // // // //         .select("lesson_id, status")
// // // // // // // // //         .eq("student_id", userId)
// // // // // // // // //         .eq("status", "completed");

// // // // // // // // //       if (error) throw error;

// // // // // // // // //       const completedSet = new Set(progressData.map((p) => p.lesson_id));
// // // // // // // // //       setCompletedLessonIds(completedSet);
// // // // // // // // //       return completedSet;
// // // // // // // // //     } catch (err) {
// // // // // // // // //       console.error("Error fetching progress:", err.message);
// // // // // // // // //       return new Set();
// // // // // // // // //     }
// // // // // // // // //   };

// // // // // // // // //   const fetchCourseSyllabus = async (targetCourseId, completedIds = completedLessonIds) => {
// // // // // // // // //     try {
// // // // // // // // //       // Fetch Phases along with nested Lessons & Topics ordered appropriately
// // // // // // // // //       const { data: phaseData, error } = await supabase
// // // // // // // // //         .from("course_phases")
// // // // // // // // //         .select(`
// // // // // // // // //           id,
// // // // // // // // //           phase_number,
// // // // // // // // //           title,
// // // // // // // // //           focus,
// // // // // // // // //           course_lessons (
// // // // // // // // //             id,
// // // // // // // // //             title,
// // // // // // // // //             position,
// // // // // // // // //             created_at,
// // // // // // // // //             course_topics (
// // // // // // // // //               id,
// // // // // // // // //               intro,
// // // // // // // // //               topic_blocks ( id, type, content, video_path, position )
// // // // // // // // //             )
// // // // // // // // //           )
// // // // // // // // //         `)
// // // // // // // // //         .eq("course_id", targetCourseId)
// // // // // // // // //         .order("phase_number", { ascending: true });

// // // // // // // // //       if (error) throw error;

// // // // // // // // //       // Sort nested lessons by position and sort topic blocks if position exists
// // // // // // // // //       const structuredPhases = (phaseData || []).map((phase) => ({
// // // // // // // // //         ...phase,
// // // // // // // // //         course_lessons: (phase.course_lessons || [])
// // // // // // // // //           .sort((a, b) => (a.position || 0) - (b.position || 0))
// // // // // // // // //           .map((lesson) => ({
// // // // // // // // //             ...lesson,
// // // // // // // // //             course_topics: (lesson.course_topics || []).map((topic) => ({
// // // // // // // // //               ...topic,
// // // // // // // // //               topic_blocks: (topic.topic_blocks || []).sort(
// // // // // // // // //                 (a, b) => (a.position || 0) - (b.position || 0)
// // // // // // // // //               )
// // // // // // // // //             }))
// // // // // // // // //           }))
// // // // // // // // //       }));

// // // // // // // // //       setPhases(structuredPhases);

// // // // // // // // //       // Auto-open the first phase that has uncompleted lessons (or phase 1 as fallback)
// // // // // // // // //       const activePhase =
// // // // // // // // //         structuredPhases.find((phase) =>
// // // // // // // // //           phase.course_lessons?.some((lesson) => !completedIds.has(lesson.id))
// // // // // // // // //         ) || structuredPhases[0];

// // // // // // // // //       const initialOpenState = {};
// // // // // // // // //       structuredPhases.forEach((p) => {
// // // // // // // // //         initialOpenState[p.id] = p.id === activePhase?.id;
// // // // // // // // //       });

// // // // // // // // //       setOpenPhases(initialOpenState);

// // // // // // // // //       // Auto-select the first lesson of the active phase
// // // // // // // // //       const firstIncompleteLesson =
// // // // // // // // //         activePhase?.course_lessons?.find((l) => !completedIds.has(l.id)) ||
// // // // // // // // //         activePhase?.course_lessons?.[0] ||
// // // // // // // // //         null;

// // // // // // // // //       setSelectedLesson(firstIncompleteLesson);
// // // // // // // // //     } catch (err) {
// // // // // // // // //       console.error("Error fetching syllabus:", err.message);
// // // // // // // // //     }
// // // // // // // // //   };

// // // // // // // // //   const toggleLessonCompletion = async (lessonId) => {
// // // // // // // // //     const isCompleted = completedLessonIds.has(lessonId);
// // // // // // // // //     const newStatus = isCompleted ? "in_progress" : "completed";

// // // // // // // // //     try {
// // // // // // // // //       const { error } = await supabase.from("student_lesson_progress").upsert(
// // // // // // // // //         {
// // // // // // // // //           student_id: userId,
// // // // // // // // //           lesson_id: lessonId,
// // // // // // // // //           status: newStatus,
// // // // // // // // //           completed_at: isCompleted ? null : new Date().toISOString()
// // // // // // // // //         },
// // // // // // // // //         { onConflict: "student_id,lesson_id" }
// // // // // // // // //       );

// // // // // // // // //       if (error) throw error;

// // // // // // // // //       setCompletedLessonIds((prev) => {
// // // // // // // // //         const next = new Set(prev);
// // // // // // // // //         if (isCompleted) next.delete(lessonId);
// // // // // // // // //         else next.add(lessonId);
// // // // // // // // //         return next;
// // // // // // // // //       });
// // // // // // // // //     } catch (err) {
// // // // // // // // //       console.error("Error toggling completion:", err.message);
// // // // // // // // //     }
// // // // // // // // //   };

// // // // // // // // //   const handleSelectCourse = (course) => {
// // // // // // // // //     setOpenPhases({});
// // // // // // // // //     setSelectedLesson(null);
// // // // // // // // //     setActiveCourse(course);
// // // // // // // // //     fetchCourseSyllabus(course.id);
// // // // // // // // //   };

// // // // // // // // //   const togglePhaseAccordion = (phaseId) => {
// // // // // // // // //     setOpenPhases((prev) => ({
// // // // // // // // //       ...prev,
// // // // // // // // //       [phaseId]: !prev[phaseId]
// // // // // // // // //     }));
// // // // // // // // //   };

// // // // // // // // //   const isPhaseCompleted = (phase) => {
// // // // // // // // //     if (!phase.course_lessons || phase.course_lessons.length === 0) return false;
// // // // // // // // //     return phase.course_lessons.every((lesson) => completedLessonIds.has(lesson.id));
// // // // // // // // //   };

// // // // // // // // //   if (loading) {
// // // // // // // // //     return (
// // // // // // // // //       <div className="min-h-[60vh] flex items-center justify-center">
// // // // // // // // //         <div className="bg-white/10 dark:bg-white/[0.04] backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[30px] p-8 text-center shadow-xl">
// // // // // // // // //           <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
// // // // // // // // //           <h2 className="text-gray-900 dark:text-white text-xl font-bold">
// // // // // // // // //             Loading Learning Workspace...
// // // // // // // // //           </h2>
// // // // // // // // //           <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
// // // // // // // // //             Fetching your interactive curriculum 🚀
// // // // // // // // //           </p>
// // // // // // // // //         </div>
// // // // // // // // //       </div>
// // // // // // // // //     );
// // // // // // // // //   }

// // // // // // // // //   return (
// // // // // // // // //     <div className="space-y-6 p-4 md:p-8 text-gray-900 dark:text-white max-w-7xl mx-auto">
// // // // // // // // //       {/* 1. Portal Header Banner */}
// // // // // // // // //       <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[32px] p-6 md:p-8 shadow-xl relative overflow-hidden">
// // // // // // // // //         <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 blur-[120px] pointer-events-none" />
// // // // // // // // //         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
// // // // // // // // //           <div>
// // // // // // // // //             <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-600 dark:text-purple-300 px-4 py-2 rounded-full text-xs font-black tracking-wider mb-3">
// // // // // // // // //               <BookOpen size={14} />
// // // // // // // // //               STUDENT LEARNING PORTAL
// // // // // // // // //             </div>
// // // // // // // // //             <h1 className="text-3xl md:text-4xl font-black tracking-tight">
// // // // // // // // //               My Learning Workspace
// // // // // // // // //             </h1>
// // // // // // // // //             <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-xl text-sm md:text-base">
// // // // // // // // //               Access registered courses, watch step-by-step videos, and track your phase progression.
// // // // // // // // //             </p>
// // // // // // // // //           </div>
// // // // // // // // //           {activeCourse && (
// // // // // // // // //             <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-2xl flex items-center gap-3.5 shadow-lg shadow-purple-500/25 shrink-0">
// // // // // // // // //               <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
// // // // // // // // //                 <Rocket size={20} />
// // // // // // // // //               </div>
// // // // // // // // //               <div>
// // // // // // // // //                 <p className="text-[11px] text-white/80 font-bold uppercase tracking-wider">
// // // // // // // // //                   Current Track
// // // // // // // // //                 </p>
// // // // // // // // //                 <p className="font-black text-base max-w-[200px] truncate">{activeCourse.title}</p>
// // // // // // // // //               </div>
// // // // // // // // //             </div>
// // // // // // // // //           )}
// // // // // // // // //         </div>
// // // // // // // // //       </div>

// // // // // // // // //       {/* 2. Horizontal Quick Course Switcher Bar */}
// // // // // // // // //       {courses.length > 0 && (
// // // // // // // // //         <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
// // // // // // // // //           {courses.map((course) => {
// // // // // // // // //             const isSelected = activeCourse?.id === course.id;
// // // // // // // // //             return (
// // // // // // // // //               <button
// // // // // // // // //                 key={course.id}
// // // // // // // // //                 onClick={() => handleSelectCourse(course)}
// // // // // // // // //                 className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-left shrink-0 transition-all ${
// // // // // // // // //                   isSelected
// // // // // // // // //                     ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20"
// // // // // // // // //                     : "bg-white dark:bg-white/[0.04] border-gray-200 dark:border-white/10 hover:border-purple-500/40 text-gray-700 dark:text-gray-200"
// // // // // // // // //                 }`}
// // // // // // // // //               >
// // // // // // // // //                 <div className="w-8 h-8 rounded-lg overflow-hidden bg-purple-500/20 shrink-0 flex items-center justify-center font-bold text-xs">
// // // // // // // // //                   {course.thumbnail_url ? (
// // // // // // // // //                     <img
// // // // // // // // //                       src={course.thumbnail_url}
// // // // // // // // //                       alt={course.title}
// // // // // // // // //                       className="w-full h-full object-cover"
// // // // // // // // //                     />
// // // // // // // // //                   ) : (
// // // // // // // // //                     <BookOpen size={16} className={isSelected ? "text-white" : "text-purple-500"} />
// // // // // // // // //                   )}
// // // // // // // // //                 </div>
// // // // // // // // //                 <span className="font-bold text-sm max-w-[180px] truncate">
// // // // // // // // //                   {course.title}
// // // // // // // // //                 </span>
// // // // // // // // //               </button>
// // // // // // // // //             );
// // // // // // // // //           })}
// // // // // // // // //         </div>
// // // // // // // // //       )}

// // // // // // // // //       {/* 3. Empty State or Workspace Grid */}
// // // // // // // // //       {courses.length === 0 ? (
// // // // // // // // //         <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-[32px] p-12 text-center shadow-lg">
// // // // // // // // //           <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
// // // // // // // // //             🎓
// // // // // // // // //           </div>
// // // // // // // // //           <h3 className="text-xl font-bold">No Registered Courses Found</h3>
// // // // // // // // //           <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto text-sm">
// // // // // // // // //             You are not currently enrolled in any active courses. Please contact your administrator or instructor.
// // // // // // // // //           </p>
// // // // // // // // //         </div>
// // // // // // // // //       ) : (
// // // // // // // // //         activeCourse && (
// // // // // // // // //           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
// // // // // // // // //             {/* Left Sidebar: Sticky Syllabus & Course Overview */}
// // // // // // // // //             <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-6">
// // // // // // // // //               {/* Active Course Thumbnail & Stats Card */}
// // // // // // // // //               <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[28px] overflow-hidden shadow-xl p-5">
// // // // // // // // //                 <div className="relative h-36 rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
// // // // // // // // //                   {activeCourse.thumbnail_url ? (
// // // // // // // // //                     <img
// // // // // // // // //                       src={activeCourse.thumbnail_url}
// // // // // // // // //                       alt={activeCourse.title}
// // // // // // // // //                       className="w-full h-full object-cover"
// // // // // // // // //                     />
// // // // // // // // //                   ) : (
// // // // // // // // //                     <div className="text-center p-4">
// // // // // // // // //                       <BookOpen size={36} className="text-white/80 mx-auto mb-1" />
// // // // // // // // //                       <span className="text-xs font-bold text-white/70 uppercase tracking-widest">
// // // // // // // // //                         Course Track
// // // // // // // // //                       </span>
// // // // // // // // //                     </div>
// // // // // // // // //                   )}
// // // // // // // // //                   <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
// // // // // // // // //                   <h2 className="absolute bottom-3 left-4 right-4 font-black text-white text-lg line-clamp-1">
// // // // // // // // //                     {activeCourse.title}
// // // // // // // // //                   </h2>
// // // // // // // // //                 </div>

// // // // // // // // //                 <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 px-1">
// // // // // // // // //                   <span className="flex items-center gap-1.5">
// // // // // // // // //                     <Layers size={14} className="text-purple-500" />
// // // // // // // // //                     {phases.length} Phases
// // // // // // // // //                   </span>
// // // // // // // // //                   <span className="flex items-center gap-1.5">
// // // // // // // // //                     <CheckCircle2 size={14} className="text-emerald-500" />
// // // // // // // // //                     {completedLessonIds.size} Lessons Done
// // // // // // // // //                   </span>
// // // // // // // // //                 </div>
// // // // // // // // //               </div>

// // // // // // // // //               {/* Collapsible Syllabus Accordion */}
// // // // // // // // //               <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[28px] p-4 shadow-xl space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
// // // // // // // // //                 <h3 className="text-base font-black px-2 text-gray-900 dark:text-white flex items-center gap-2">
// // // // // // // // //                   Course Syllabus
// // // // // // // // //                 </h3>

// // // // // // // // //                 <div className="space-y-2">
// // // // // // // // //                   {phases.map((phase) => {
// // // // // // // // //                     const isOpen = !!openPhases[phase.id];
// // // // // // // // //                     const phaseDone = isPhaseCompleted(phase);

// // // // // // // // //                     return (
// // // // // // // // //                       <div
// // // // // // // // //                         key={phase.id}
// // // // // // // // //                         className="border border-gray-200/80 dark:border-white/10 rounded-2xl overflow-hidden transition-all bg-gray-50/50 dark:bg-white/[0.02]"
// // // // // // // // //                       >
// // // // // // // // //                         {/* Phase Header Button */}
// // // // // // // // //                         <button
// // // // // // // // //                           onClick={() => togglePhaseAccordion(phase.id)}
// // // // // // // // //                           className="w-full text-left p-3.5 flex items-center justify-between hover:bg-purple-500/5 transition-colors"
// // // // // // // // //                         >
// // // // // // // // //                           <div className="flex items-center gap-2.5 pr-2">
// // // // // // // // //                             {phaseDone ? (
// // // // // // // // //                               <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
// // // // // // // // //                             ) : (
// // // // // // // // //                               <div className="w-4 h-4 rounded-full border-2 border-purple-500/40 shrink-0" />
// // // // // // // // //                             )}
// // // // // // // // //                             <div>
// // // // // // // // //                               <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">
// // // // // // // // //                                 Phase {phase.phase_number}
// // // // // // // // //                               </span>
// // // // // // // // //                               <h4 className="font-bold text-xs md:text-sm text-gray-900 dark:text-white line-clamp-1">
// // // // // // // // //                                 {phase.title}
// // // // // // // // //                               </h4>
// // // // // // // // //                             </div>
// // // // // // // // //                           </div>

// // // // // // // // //                           {isOpen ? (
// // // // // // // // //                             <ChevronDown size={16} className="text-gray-400 shrink-0" />
// // // // // // // // //                           ) : (
// // // // // // // // //                             <ChevronRight size={16} className="text-gray-400 shrink-0" />
// // // // // // // // //                           )}
// // // // // // // // //                         </button>

// // // // // // // // //                         {/* Collapsible Lesson List */}
// // // // // // // // //                         {isOpen && (
// // // // // // // // //                           <div className="p-2 pt-0 space-y-1.5 border-t border-gray-200/50 dark:border-white/5">
// // // // // // // // //                             {phase.course_lessons?.map((lesson) => {
// // // // // // // // //                               const isSelected = selectedLesson?.id === lesson.id;
// // // // // // // // //                               const isDone = completedLessonIds.has(lesson.id);

// // // // // // // // //                               return (
// // // // // // // // //                                 <button
// // // // // // // // //                                   key={lesson.id}
// // // // // // // // //                                   onClick={() => setSelectedLesson(lesson)}
// // // // // // // // //                                   className={`w-full text-left rounded-xl p-2.5 transition-all flex items-center justify-between border ${
// // // // // // // // //                                     isSelected
// // // // // // // // //                                       ? "bg-purple-600 text-white border-transparent shadow-md"
// // // // // // // // //                                       : "bg-white dark:bg-white/[0.03] border-gray-200/60 dark:border-white/5 hover:border-purple-500/30"
// // // // // // // // //                                   }`}
// // // // // // // // //                                 >
// // // // // // // // //                                   <div className="flex items-center gap-2 min-w-0 pr-2">
// // // // // // // // //                                     {isDone ? (
// // // // // // // // //                                       <CheckCircle2
// // // // // // // // //                                         size={15}
// // // // // // // // //                                         className={isSelected ? "text-white" : "text-emerald-500"}
// // // // // // // // //                                       />
// // // // // // // // //                                     ) : (
// // // // // // // // //                                       <Circle
// // // // // // // // //                                         size={15}
// // // // // // // // //                                         className={isSelected ? "text-white/70" : "text-gray-400"}
// // // // // // // // //                                       />
// // // // // // // // //                                     )}
// // // // // // // // //                                     <span
// // // // // // // // //                                       className={`text-xs font-bold truncate ${
// // // // // // // // //                                         isSelected
// // // // // // // // //                                           ? "text-white"
// // // // // // // // //                                           : "text-gray-800 dark:text-gray-200"
// // // // // // // // //                                       }`}
// // // // // // // // //                                     >
// // // // // // // // //                                       {lesson.title}
// // // // // // // // //                                     </span>
// // // // // // // // //                                   </div>
// // // // // // // // //                                   <ChevronRight
// // // // // // // // //                                     size={13}
// // // // // // // // //                                     className={isSelected ? "text-white/80" : "text-gray-400"}
// // // // // // // // //                                   />
// // // // // // // // //                                 </button>
// // // // // // // // //                               );
// // // // // // // // //                             })}
// // // // // // // // //                           </div>
// // // // // // // // //                         )}
// // // // // // // // //                       </div>
// // // // // // // // //                     );
// // // // // // // // //                   })}
// // // // // // // // //                 </div>
// // // // // // // // //               </div>
// // // // // // // // //             </div>

// // // // // // // // //             {/* Right Main Panel: Active Lesson Content Display */}
// // // // // // // // //             <div className="lg:col-span-8">
// // // // // // // // //               <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[32px] p-6 md:p-8 shadow-xl">
// // // // // // // // //                 {selectedLesson ? (
// // // // // // // // //                   <div>
// // // // // // // // //                     {/* Active Lesson Header & Action */}
// // // // // // // // //                     <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
// // // // // // // // //                       <div>
// // // // // // // // //                         <span className="text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
// // // // // // // // //                           Active Lesson
// // // // // // // // //                         </span>
// // // // // // // // //                         <h2 className="text-2xl md:text-3xl font-black mt-2 text-gray-900 dark:text-white">
// // // // // // // // //                           {selectedLesson.title}
// // // // // // // // //                         </h2>
// // // // // // // // //                       </div>

// // // // // // // // //                       <button
// // // // // // // // //                         onClick={() => toggleLessonCompletion(selectedLesson.id)}
// // // // // // // // //                         className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
// // // // // // // // //                           completedLessonIds.has(selectedLesson.id)
// // // // // // // // //                             ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20"
// // // // // // // // //                             : "bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-500/20"
// // // // // // // // //                         }`}
// // // // // // // // //                       >
// // // // // // // // //                         {completedLessonIds.has(selectedLesson.id) ? (
// // // // // // // // //                           <>
// // // // // // // // //                             <CheckCircle2 size={16} /> Completed
// // // // // // // // //                           </>
// // // // // // // // //                         ) : (
// // // // // // // // //                           <>
// // // // // // // // //                             <Circle size={16} /> Mark as Complete
// // // // // // // // //                           </>
// // // // // // // // //                         )}
// // // // // // // // //                       </button>
// // // // // // // // //                     </div>

// // // // // // // // //                     {/* Active Lesson Topics Display */}
// // // // // // // // //                     <div className="border-t border-gray-100 dark:border-white/[0.08] pt-6 space-y-8">
// // // // // // // // //                       {selectedLesson.course_topics && selectedLesson.course_topics.length > 0 ? (
// // // // // // // // //                         selectedLesson.course_topics.map((topic) => {
// // // // // // // // //                           const videoBlocks = topic.topic_blocks?.filter(
// // // // // // // // //                             (b) => b.type === "video" && b.video_path
// // // // // // // // //                           ) || [];
// // // // // // // // //                           // const textBlocks = topic.topic_blocks?.filter(
// // // // // // // // //                           //   (b) => b.type === "text" && b.content
// // // // // // // // //                           // ) || [];
// // // // // // // // //                         const textBlocks = topic.topic_blocks?.filter(
// // // // // // // // //   (b) => ["text", "notes", "note", "markdown"].includes(b.type?.toLowerCase()) && b.content
// // // // // // // // // ) || [];

// // // // // // // // //                           return (
// // // // // // // // //                             <div key={topic.id} className="space-y-4">
// // // // // // // // //                               {topic.intro && (
// // // // // // // // //                                 <h4 className="font-bold text-lg text-purple-600 dark:text-purple-400 flex items-center gap-2">
// // // // // // // // //                                   <FileText size={20} />
// // // // // // // // //                                   {topic.intro}
// // // // // // // // //                                 </h4>
// // // // // // // // //                               )}

// // // // // // // // //                               {/* Top Block: Videos First */}
// // // // // // // // //                               {videoBlocks.map((block) => (
// // // // // // // // //                                 <div
// // // // // // // // //                                   key={block.id}
// // // // // // // // //                                   className="relative rounded-2xl overflow-hidden aspect-video bg-black shadow-lg border border-gray-200/20 dark:border-white/10"
// // // // // // // // //                                 >
// // // // // // // // //                                   <iframe
// // // // // // // // //                                     src={block.video_path}
// // // // // // // // //                                     title="Topic Video"
// // // // // // // // //                                     className="w-full h-full border-0"
// // // // // // // // //                                     allowFullScreen
// // // // // // // // //                                   />
// // // // // // // // //                                 </div>
// // // // // // // // //                               ))}

// // // // // // // // //                               {/* Bottom Block: Text Notes / Reading Material Second */}
// // // // // // // // //                               {textBlocks.map((block) => (
// // // // // // // // //                                 <div
// // // // // // // // //                                   key={block.id}
// // // // // // // // //                                   className="bg-gray-50/80 dark:bg-white/[0.02] p-5 md:p-6 rounded-2xl border border-gray-200/60 dark:border-white/5 space-y-3"
// // // // // // // // //                                 >
// // // // // // // // //                                   <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
// // // // // // // // //                                     {block.content}
// // // // // // // // //                                   </p>
// // // // // // // // //                                 </div>
// // // // // // // // //                               ))}
// // // // // // // // //                             </div>
// // // // // // // // //                           );
// // // // // // // // //                         })
// // // // // // // // //                       ) : (
// // // // // // // // //                         <div className="text-center py-12 text-gray-400">
// // // // // // // // //                           <p className="text-sm">No topic modules found for this lesson.</p>
// // // // // // // // //                         </div>
// // // // // // // // //                       )}
// // // // // // // // //                     </div>
// // // // // // // // //                   </div>
// // // // // // // // //                 ) : (
// // // // // // // // //                   <div className="text-center py-20 text-gray-400">
// // // // // // // // //                     <BookOpen size={48} className="mx-auto mb-4 opacity-40 text-purple-500" />
// // // // // // // // //                     <p className="text-base font-bold text-gray-700 dark:text-gray-300">
// // // // // // // // //                       Select a lesson from the syllabus sidebar to begin learning.
// // // // // // // // //                     </p>
// // // // // // // // //                   </div>
// // // // // // // // //                 )}
// // // // // // // // //               </div>
// // // // // // // // //             </div>
// // // // // // // // //           </div>
// // // // // // // // //         )
// // // // // // // // //       )}
// // // // // // // // //     </div>
// // // // // // // // //   );
// // // // // // // // // }
// // // // // // // // // // import React, { useEffect, useState } from "react";
// // // // // // // // // // import {
// // // // // // // // // //   BookOpen,
// // // // // // // // // //   PlayCircle,
// // // // // // // // // //   Clock,
// // // // // // // // // //   ChevronRight,
// // // // // // // // // //   Rocket,
// // // // // // // // // //   CheckCircle2,
// // // // // // // // // //   Circle,
// // // // // // // // // //   Layers
// // // // // // // // // // } from "lucide-react";
// // // // // // // // // // import { supabase } from "../../../supabase";

// // // // // // // // // // export default function StudentCoursesView({ userId, courseId }) {
// // // // // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // // // // //   const [courses, setCourses] = useState([]);
// // // // // // // // // //   const [activeCourse, setActiveCourse] = useState(null);
  
// // // // // // // // // //   // Structured Phase -> Lessons state
// // // // // // // // // //   const [phases, setPhases] = useState([]);
// // // // // // // // // //   const [selectedLesson, setSelectedLesson] = useState(null);
// // // // // // // // // //   const [completedLessonIds, setCompletedLessonIds] = useState(new Set());

// // // // // // // // // //   useEffect(() => {
// // // // // // // // // //     if (userId) {
// // // // // // // // // //       fetchStudentCoursesData();
// // // // // // // // // //     }
// // // // // // // // // //   }, [userId, courseId]);

// // // // // // // // // //   const fetchStudentCoursesData = async () => {
// // // // // // // // // //     try {
// // // // // // // // // //       setLoading(true);

// // // // // // // // // //       // 1. Query student_enrollments to get registered courses
// // // // // // // // // //       let enrollQuery = supabase
// // // // // // // // // //         .from("student_enrollments")
// // // // // // // // // //         .select(`
// // // // // // // // // //           course_id,
// // // // // // // // // //           courses (*)
// // // // // // // // // //         `)
// // // // // // // // // //         .eq("student_id", userId);

// // // // // // // // // //       const { data: enrollmentData, error: enrollError } = await enrollQuery;
// // // // // // // // // //       if (enrollError) throw enrollError;

// // // // // // // // // //       const enrolledCourses = enrollmentData
// // // // // // // // // //         ? enrollmentData.map((e) => e.courses).filter(Boolean)
// // // // // // // // // //         : [];

// // // // // // // // // //       setCourses(enrolledCourses);

// // // // // // // // // //       // 2. Determine active course (either from prop or first enrolled course)
// // // // // // // // // //       const defaultCourse =
// // // // // // // // // //         enrolledCourses.find((c) => c.id === courseId) ||
// // // // // // // // // //         enrolledCourses[0] ||
// // // // // // // // // //         null;

// // // // // // // // // //       setActiveCourse(defaultCourse);

// // // // // // // // // //       if (defaultCourse) {
// // // // // // // // // //         await Promise.all([
// // // // // // // // // //           fetchCourseSyllabus(defaultCourse.id),
// // // // // // // // // //           fetchLessonProgress()
// // // // // // // // // //         ]);
// // // // // // // // // //       }
// // // // // // // // // //     } catch (err) {
// // // // // // // // // //       console.error("Error fetching student data:", err.message);
// // // // // // // // // //     } finally {
// // // // // // // // // //       setLoading(false);
// // // // // // // // // //     }
// // // // // // // // // //   };

// // // // // // // // // //   const fetchCourseSyllabus = async (targetCourseId) => {
// // // // // // // // // //     try {
// // // // // // // // // //       // Fetch Phases along with nested Lessons ordered by position
// // // // // // // // // //       const { data: phaseData, error } = await supabase
// // // // // // // // // //         .from("course_phases")
// // // // // // // // // //         .select(`
// // // // // // // // // //           id,
// // // // // // // // // //           phase_number,
// // // // // // // // // //           title,
// // // // // // // // // //           focus,
// // // // // // // // // //           course_lessons (
// // // // // // // // // //             id,
// // // // // // // // // //             title,
// // // // // // // // // //             position,
// // // // // // // // // //             created_at,
// // // // // // // // // //             course_topics (
// // // // // // // // // //               id,
// // // // // // // // // //               intro,
// // // // // // // // // //               topic_blocks ( id, type, content, video_path )
// // // // // // // // // //             )
// // // // // // // // // //           )
// // // // // // // // // //         `)
// // // // // // // // // //         .eq("course_id", targetCourseId)
// // // // // // // // // //         .order("phase_number", { ascending: true });

// // // // // // // // // //       if (error) throw error;

// // // // // // // // // //       // Sort nested lessons by position
// // // // // // // // // //       const structuredPhases = (phaseData || []).map((phase) => ({
// // // // // // // // // //         ...phase,
// // // // // // // // // //         course_lessons: (phase.course_lessons || []).sort(
// // // // // // // // // //           (a, b) => (a.position || 0) - (b.position || 0)
// // // // // // // // // //         )
// // // // // // // // // //       }));

// // // // // // // // // //       setPhases(structuredPhases);

// // // // // // // // // //       // Set default selected lesson
// // // // // // // // // //       const firstLesson = structuredPhases[0]?.course_lessons[0] || null;
// // // // // // // // // //       setSelectedLesson(firstLesson);
// // // // // // // // // //     } catch (err) {
// // // // // // // // // //       console.error("Error fetching syllabus:", err.message);
// // // // // // // // // //     }
// // // // // // // // // //   };

// // // // // // // // // //   const fetchLessonProgress = async () => {
// // // // // // // // // //     try {
// // // // // // // // // //       const { data: progressData, error } = await supabase
// // // // // // // // // //         .from("student_lesson_progress")
// // // // // // // // // //         .select("lesson_id, status")
// // // // // // // // // //         .eq("student_id", userId)
// // // // // // // // // //         .eq("status", "completed");

// // // // // // // // // //       if (error) throw error;

// // // // // // // // // //       const completedSet = new Set(progressData.map((p) => p.lesson_id));
// // // // // // // // // //       setCompletedLessonIds(completedSet);
// // // // // // // // // //     } catch (err) {
// // // // // // // // // //       console.error("Error fetching progress:", err.message);
// // // // // // // // // //     }
// // // // // // // // // //   };

// // // // // // // // // //   const toggleLessonCompletion = async (lessonId) => {
// // // // // // // // // //     const isCompleted = completedLessonIds.has(lessonId);
// // // // // // // // // //     const newStatus = isCompleted ? "in_progress" : "completed";

// // // // // // // // // //     try {
// // // // // // // // // //       const { error } = await supabase.from("student_lesson_progress").upsert(
// // // // // // // // // //         {
// // // // // // // // // //           student_id: userId,
// // // // // // // // // //           lesson_id: lessonId,
// // // // // // // // // //           status: newStatus,
// // // // // // // // // //           completed_at: isCompleted ? null : new Date().toISOString()
// // // // // // // // // //         },
// // // // // // // // // //         { onConflict: "student_id,lesson_id" }
// // // // // // // // // //       );

// // // // // // // // // //       if (error) throw error;

// // // // // // // // // //       setCompletedLessonIds((prev) => {
// // // // // // // // // //         const next = new Set(prev);
// // // // // // // // // //         if (isCompleted) next.delete(lessonId);
// // // // // // // // // //         else next.add(lessonId);
// // // // // // // // // //         return next;
// // // // // // // // // //       });
// // // // // // // // // //     } catch (err) {
// // // // // // // // // //       console.error("Error toggling completion:", err.message);
// // // // // // // // // //     }
// // // // // // // // // //   };

// // // // // // // // // //   const handleSelectCourse = (course) => {
// // // // // // // // // //     setActiveCourse(course);
// // // // // // // // // //     fetchCourseSyllabus(course.id);
// // // // // // // // // //   };

// // // // // // // // // //   if (loading) {
// // // // // // // // // //     return (
// // // // // // // // // //       <div className="min-h-[60vh] flex items-center justify-center">
// // // // // // // // // //         <div className="bg-white/10 dark:bg-white/[0.04] backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[30px] p-8 text-center shadow-xl">
// // // // // // // // // //           <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
// // // // // // // // // //           <h2 className="text-gray-900 dark:text-white text-xl font-bold">
// // // // // // // // // //             Loading Your Courses...
// // // // // // // // // //           </h2>
// // // // // // // // // //           <p className="text-gray-500 dark:text-gray-400 mt-2">
// // // // // // // // // //             Fetching your personalized learning materials 🚀
// // // // // // // // // //           </p>
// // // // // // // // // //         </div>
// // // // // // // // // //       </div>
// // // // // // // // // //     );
// // // // // // // // // //   }

// // // // // // // // // //   return (
// // // // // // // // // //     <div className="space-y-6 p-4 md:p-8 text-gray-900 dark:text-white max-w-7xl mx-auto">
// // // // // // // // // //       {/* Header Banner */}
// // // // // // // // // //       <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[32px] p-6 md:p-8 shadow-xl relative overflow-hidden">
// // // // // // // // // //         <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 blur-[120px] pointer-events-none" />
// // // // // // // // // //         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
// // // // // // // // // //           <div>
// // // // // // // // // //             <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-600 dark:text-purple-300 px-4 py-2 rounded-full text-xs font-black tracking-wider mb-3">
// // // // // // // // // //               <BookOpen size={14} />
// // // // // // // // // //               STUDENT LEARNING PORTAL
// // // // // // // // // //             </div>
// // // // // // // // // //             <h1 className="text-3xl md:text-4xl font-black tracking-tight">
// // // // // // // // // //               My Enrolled Courses
// // // // // // // // // //             </h1>
// // // // // // // // // //             <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-xl text-sm md:text-base">
// // // // // // // // // //               Access your registered curriculum, watch interactive video tutorials, and track your phase progression.
// // // // // // // // // //             </p>
// // // // // // // // // //           </div>
// // // // // // // // // //           {activeCourse && (
// // // // // // // // // //             <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-2xl flex items-center gap-3.5 shadow-lg shadow-purple-500/25 shrink-0">
// // // // // // // // // //               <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
// // // // // // // // // //                 <Rocket size={20} />
// // // // // // // // // //               </div>
// // // // // // // // // //               <div>
// // // // // // // // // //                 <p className="text-[11px] text-white/80 font-bold uppercase tracking-wider">
// // // // // // // // // //                   Current Track
// // // // // // // // // //                 </p>
// // // // // // // // // //                 <p className="font-black text-base">{activeCourse.title}</p>
// // // // // // // // // //               </div>
// // // // // // // // // //             </div>
// // // // // // // // // //           )}
// // // // // // // // // //         </div>
// // // // // // // // // //       </div>

// // // // // // // // // //       {/* Course Selection Grid */}
// // // // // // // // // //       {courses.length === 0 ? (
// // // // // // // // // //         <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-[32px] p-12 text-center shadow-lg">
// // // // // // // // // //           <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
// // // // // // // // // //             🎓
// // // // // // // // // //           </div>
// // // // // // // // // //           <h3 className="text-xl font-bold">No Registered Courses Found</h3>
// // // // // // // // // //           <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto text-sm">
// // // // // // // // // //             You are not currently enrolled in any active courses. Please contact your administrator.
// // // // // // // // // //           </p>
// // // // // // // // // //         </div>
// // // // // // // // // //       ) : (
// // // // // // // // // //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
// // // // // // // // // //           {courses.map((course) => {
// // // // // // // // // //             const isSelected = activeCourse?.id === course.id;
// // // // // // // // // //             return (
// // // // // // // // // //               <div
// // // // // // // // // //                 key={course.id}
// // // // // // // // // //                 onClick={() => handleSelectCourse(course)}
// // // // // // // // // //                 className={`cursor-pointer rounded-[28px] overflow-hidden border transition-all duration-300 group flex flex-col p-5 ${
// // // // // // // // // //                   isSelected
// // // // // // // // // //                     ? "bg-white dark:bg-[#131b31] border-purple-500 shadow-xl shadow-purple-500/15 scale-[1.02]"
// // // // // // // // // //                     : "bg-white dark:bg-white/[0.04] border-gray-200 dark:border-white/10 hover:border-purple-500/50 hover:shadow-lg"
// // // // // // // // // //                 }`}
// // // // // // // // // //               >
// // // // // // // // // //                 <div className="flex items-center justify-between mb-3">
// // // // // // // // // //                   <span className="text-xs px-3 py-1 rounded-full font-black bg-purple-500/10 text-purple-600 dark:text-purple-300">
// // // // // // // // // //                     {course.duration_lessons || 0} Lessons
// // // // // // // // // //                   </span>
// // // // // // // // // //                   {isSelected && (
// // // // // // // // // //                     <span className="text-[10px] bg-purple-600 text-white font-black px-2.5 py-0.5 rounded-full">
// // // // // // // // // //                       Active
// // // // // // // // // //                     </span>
// // // // // // // // // //                   )}
// // // // // // // // // //                 </div>
// // // // // // // // // //                 <h3 className="font-black text-lg text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
// // // // // // // // // //                   {course.title}
// // // // // // // // // //                 </h3>
// // // // // // // // // //                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2">
// // // // // // // // // //                   {course.description || "Interactive structured learning track."}
// // // // // // // // // //                 </p>
// // // // // // // // // //               </div>
// // // // // // // // // //             );
// // // // // // // // // //           })}
// // // // // // // // // //         </div>
// // // // // // // // // //       )}

// // // // // // // // // //       {/* Main Content Viewer and Phase Syllabus */}
// // // // // // // // // //       {activeCourse && (
// // // // // // // // // //         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
// // // // // // // // // //           {/* Main Lesson View */}
// // // // // // // // // //           <div className="lg:col-span-8 space-y-6">
// // // // // // // // // //             <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[32px] p-6 md:p-8 shadow-xl">
// // // // // // // // // //               {selectedLesson ? (
// // // // // // // // // //                 <div>
// // // // // // // // // //                   <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
// // // // // // // // // //                     <div>
// // // // // // // // // //                       <span className="text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
// // // // // // // // // //                         Lesson Module
// // // // // // // // // //                       </span>
// // // // // // // // // //                       <h2 className="text-2xl md:text-3xl font-black mt-2">
// // // // // // // // // //                         {selectedLesson.title}
// // // // // // // // // //                       </h2>
// // // // // // // // // //                     </div>

// // // // // // // // // //                     <button
// // // // // // // // // //                       onClick={() => toggleLessonCompletion(selectedLesson.id)}
// // // // // // // // // //                       className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
// // // // // // // // // //                         completedLessonIds.has(selectedLesson.id)
// // // // // // // // // //                           ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
// // // // // // // // // //                           : "bg-purple-600 text-white hover:bg-purple-700 shadow-md"
// // // // // // // // // //                       }`}
// // // // // // // // // //                     >
// // // // // // // // // //                       {completedLessonIds.has(selectedLesson.id) ? (
// // // // // // // // // //                         <>
// // // // // // // // // //                           <CheckCircle2 size={16} /> Completed
// // // // // // // // // //                         </>
// // // // // // // // // //                       ) : (
// // // // // // // // // //                         <>
// // // // // // // // // //                           <Circle size={16} /> Mark as Complete
// // // // // // // // // //                         </>
// // // // // // // // // //                       )}
// // // // // // // // // //                     </button>
// // // // // // // // // //                   </div>

// // // // // // // // // //                   {/* Rendering Topics inside Lesson */}
// // // // // // // // // //                   <div className="border-t border-gray-100 dark:border-white/[0.08] pt-5 mt-5 space-y-6">
// // // // // // // // // //                     {selectedLesson.course_topics && selectedLesson.course_topics.length > 0 ? (
// // // // // // // // // //                       selectedLesson.course_topics.map((topic) => (
// // // // // // // // // //                         <div key={topic.id} className="space-y-3">
// // // // // // // // // //                           <h4 className="font-black text-lg">{topic.intro || "Topic Notes"}</h4>
// // // // // // // // // //                           {topic.topic_blocks?.map((block) => (
// // // // // // // // // //                             <div key={block.id} className="bg-gray-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-gray-100 dark:border-white/5">
// // // // // // // // // //                               {block.type === "video" && block.video_path && (
// // // // // // // // // //                                 <iframe
// // // // // // // // // //                                   src={block.video_path}
// // // // // // // // // //                                   title="Topic Video"
// // // // // // // // // //                                   className="w-full h-64 rounded-xl mb-3"
// // // // // // // // // //                                   allowFullScreen
// // // // // // // // // //                                 />
// // // // // // // // // //                               )}
// // // // // // // // // //                               {block.content && (
// // // // // // // // // //                                 <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
// // // // // // // // // //                                   {block.content}
// // // // // // // // // //                                 </p>
// // // // // // // // // //                               )}
// // // // // // // // // //                             </div>
// // // // // // // // // //                           ))}
// // // // // // // // // //                         </div>
// // // // // // // // // //                       ))
// // // // // // // // // //                     ) : (
// // // // // // // // // //                       <p className="text-gray-500 text-sm">No topics added to this lesson yet.</p>
// // // // // // // // // //                     )}
// // // // // // // // // //                   </div>
// // // // // // // // // //                 </div>
// // // // // // // // // //               ) : (
// // // // // // // // // //                 <div className="text-center py-20 text-gray-400">
// // // // // // // // // //                   <BookOpen size={48} className="mx-auto mb-4 opacity-40 text-purple-500" />
// // // // // // // // // //                   <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
// // // // // // // // // //                     Select a lesson from a phase to start learning.
// // // // // // // // // //                   </p>
// // // // // // // // // //                 </div>
// // // // // // // // // //               )}
// // // // // // // // // //             </div>
// // // // // // // // // //           </div>

// // // // // // // // // //           {/* Phase & Lesson Accordion Sidebar */}
// // // // // // // // // //           <div className="lg:col-span-4 space-y-6">
// // // // // // // // // //             <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[32px] p-6 shadow-xl sticky top-6">
// // // // // // // // // //               <h3 className="text-xl font-black mb-5 flex items-center gap-2">
// // // // // // // // // //                 <Layers className="text-purple-500" size={20} /> Course Phases
// // // // // // // // // //               </h3>

// // // // // // // // // //               <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
// // // // // // // // // //                 {phases.map((phase) => (
// // // // // // // // // //                   <div key={phase.id} className="space-y-2">
// // // // // // // // // //                     <div className="bg-purple-500/5 p-3 rounded-xl border border-purple-500/10">
// // // // // // // // // //                       <p className="text-xs font-black text-purple-500 uppercase tracking-wider">
// // // // // // // // // //                         Phase {phase.phase_number}
// // // // // // // // // //                       </p>
// // // // // // // // // //                       <h4 className="font-bold text-sm text-gray-900 dark:text-white">
// // // // // // // // // //                         {phase.title}
// // // // // // // // // //                       </h4>
// // // // // // // // // //                     </div>

// // // // // // // // // //                     <div className="pl-2 space-y-1.5">
// // // // // // // // // //                       {phase.course_lessons?.map((lesson) => {
// // // // // // // // // //                         const isSelected = selectedLesson?.id === lesson.id;
// // // // // // // // // //                         const isDone = completedLessonIds.has(lesson.id);

// // // // // // // // // //                         return (
// // // // // // // // // //                           <div
// // // // // // // // // //                             key={lesson.id}
// // // // // // // // // //                             onClick={() => setSelectedLesson(lesson)}
// // // // // // // // // //                             className={`cursor-pointer rounded-xl p-3 transition-all flex items-center justify-between border ${
// // // // // // // // // //                               isSelected
// // // // // // // // // //                                 ? "bg-purple-600 text-white border-transparent shadow-md"
// // // // // // // // // //                                 : "bg-gray-50/80 dark:bg-white/[0.02] border-gray-200/80 dark:border-white/[0.06] hover:bg-gray-100"
// // // // // // // // // //                             }`}
// // // // // // // // // //                           >
// // // // // // // // // //                             <div className="flex items-center gap-2.5">
// // // // // // // // // //                               {isDone ? (
// // // // // // // // // //                                 <CheckCircle2 size={16} className={isSelected ? "text-white" : "text-emerald-500"} />
// // // // // // // // // //                               ) : (
// // // // // // // // // //                                 <Circle size={16} className={isSelected ? "text-white" : "text-gray-400"} />
// // // // // // // // // //                               )}
// // // // // // // // // //                               <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-gray-800 dark:text-gray-200"}`}>
// // // // // // // // // //                                 {lesson.title}
// // // // // // // // // //                               </span>
// // // // // // // // // //                             </div>
// // // // // // // // // //                             <ChevronRight size={14} className={isSelected ? "text-white" : "text-gray-400"} />
// // // // // // // // // //                           </div>
// // // // // // // // // //                         );
// // // // // // // // // //                       })}
// // // // // // // // // //                     </div>
// // // // // // // // // //                   </div>
// // // // // // // // // //                 ))}
// // // // // // // // // //               </div>
// // // // // // // // // //             </div>
// // // // // // // // // //           </div>
// // // // // // // // // //         </div>
// // // // // // // // // //       )}
// // // // // // // // // //     </div>
// // // // // // // // // //   );
// // // // // // // // // // }
// // // // // // // // // // // import React, { useEffect, useState } from "react";
// // // // // // // // // // // import {
// // // // // // // // // // //   BookOpen,
// // // // // // // // // // //   ChevronRight,
// // // // // // // // // // //   ChevronDown,
// // // // // // // // // // //   CheckCircle2,
// // // // // // // // // // //   Circle,
// // // // // // // // // // //   Layers,
// // // // // // // // // // //   Rocket,
// // // // // // // // // // //   FileText
// // // // // // // // // // // } from "lucide-react";
// // // // // // // // // // // import { supabase } from "../../../supabase";

// // // // // // // // // // // export default function StudentCoursesView({ userId, courseId }) {
// // // // // // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // // // // // //   const [courses, setCourses] = useState([]);
// // // // // // // // // // //   const [activeCourse, setActiveCourse] = useState(null);

// // // // // // // // // // //   // Structured Phase -> Lessons state
// // // // // // // // // // //   const [phases, setPhases] = useState([]);
// // // // // // // // // // //   const [selectedLesson, setSelectedLesson] = useState(null);
// // // // // // // // // // //   const [completedLessonIds, setCompletedLessonIds] = useState(new Set());

// // // // // // // // // // //   // Track open/collapsed phases by phase ID
// // // // // // // // // // //   const [openPhases, setOpenPhases] = useState({});

// // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // //     if (userId) {
// // // // // // // // // // //       fetchStudentCoursesData();
// // // // // // // // // // //     }
// // // // // // // // // // //   }, [userId, courseId]);

// // // // // // // // // // //   const fetchStudentCoursesData = async () => {
// // // // // // // // // // //     try {
// // // // // // // // // // //       setLoading(true);

// // // // // // // // // // //       // 1. Fetch registered courses for student
// // // // // // // // // // //       const { data: enrollmentData, error: enrollError } = await supabase
// // // // // // // // // // //         .from("student_enrollments")
// // // // // // // // // // //         .select(`
// // // // // // // // // // //           course_id,
// // // // // // // // // // //           courses (*)
// // // // // // // // // // //         `)
// // // // // // // // // // //         .eq("student_id", userId);

// // // // // // // // // // //       if (enrollError) throw enrollError;

// // // // // // // // // // //       const enrolledCourses = enrollmentData
// // // // // // // // // // //         ? enrollmentData.map((e) => e.courses).filter(Boolean)
// // // // // // // // // // //         : [];

// // // // // // // // // // //       setCourses(enrolledCourses);

// // // // // // // // // // //       // 2. Set default active course (passed prop -> first enrolled -> null)
// // // // // // // // // // //       const defaultCourse =
// // // // // // // // // // //         enrolledCourses.find((c) => c.id === courseId) ||
// // // // // // // // // // //         enrolledCourses[0] ||
// // // // // // // // // // //         null;

// // // // // // // // // // //       setActiveCourse(defaultCourse);

// // // // // // // // // // //       if (defaultCourse) {
// // // // // // // // // // //         // Fetch lesson progress first so we know which phase to auto-open
// // // // // // // // // // //         const completedIds = await fetchLessonProgress();
// // // // // // // // // // //         await fetchCourseSyllabus(defaultCourse.id, completedIds);
// // // // // // // // // // //       }
// // // // // // // // // // //     } catch (err) {
// // // // // // // // // // //       console.error("Error fetching student data:", err.message);
// // // // // // // // // // //     } finally {
// // // // // // // // // // //       setLoading(false);
// // // // // // // // // // //     }
// // // // // // // // // // //   };

// // // // // // // // // // //   const fetchLessonProgress = async () => {
// // // // // // // // // // //     try {
// // // // // // // // // // //       const { data: progressData, error } = await supabase
// // // // // // // // // // //         .from("student_lesson_progress")
// // // // // // // // // // //         .select("lesson_id, status")
// // // // // // // // // // //         .eq("student_id", userId)
// // // // // // // // // // //         .eq("status", "completed");

// // // // // // // // // // //       if (error) throw error;

// // // // // // // // // // //       const completedSet = new Set(progressData.map((p) => p.lesson_id));
// // // // // // // // // // //       setCompletedLessonIds(completedSet);
// // // // // // // // // // //       return completedSet;
// // // // // // // // // // //     } catch (err) {
// // // // // // // // // // //       console.error("Error fetching progress:", err.message);
// // // // // // // // // // //       return new Set();
// // // // // // // // // // //     }
// // // // // // // // // // //   };

// // // // // // // // // // //   const fetchCourseSyllabus = async (targetCourseId, completedIds = completedLessonIds) => {
// // // // // // // // // // //     try {
// // // // // // // // // // //       // Fetch Phases along with nested Lessons & Topics ordered appropriately
// // // // // // // // // // //       const { data: phaseData, error } = await supabase
// // // // // // // // // // //         .from("course_phases")
// // // // // // // // // // //         .select(`
// // // // // // // // // // //           id,
// // // // // // // // // // //           phase_number,
// // // // // // // // // // //           title,
// // // // // // // // // // //           focus,
// // // // // // // // // // //           course_lessons (
// // // // // // // // // // //             id,
// // // // // // // // // // //             title,
// // // // // // // // // // //             position,
// // // // // // // // // // //             created_at,
// // // // // // // // // // //             course_topics (
// // // // // // // // // // //               id,
// // // // // // // // // // //               intro,
// // // // // // // // // // //               topic_blocks ( id, type, content, video_path, position )
// // // // // // // // // // //             )
// // // // // // // // // // //           )
// // // // // // // // // // //         `)
// // // // // // // // // // //         .eq("course_id", targetCourseId)
// // // // // // // // // // //         .order("phase_number", { ascending: true });

// // // // // // // // // // //       if (error) throw error;

// // // // // // // // // // //       // Sort nested lessons by position and sort topic blocks if position exists
// // // // // // // // // // //       const structuredPhases = (phaseData || []).map((phase) => ({
// // // // // // // // // // //         ...phase,
// // // // // // // // // // //         course_lessons: (phase.course_lessons || [])
// // // // // // // // // // //           .sort((a, b) => (a.position || 0) - (b.position || 0))
// // // // // // // // // // //           .map((lesson) => ({
// // // // // // // // // // //             ...lesson,
// // // // // // // // // // //             course_topics: (lesson.course_topics || []).map((topic) => ({
// // // // // // // // // // //               ...topic,
// // // // // // // // // // //               topic_blocks: (topic.topic_blocks || []).sort(
// // // // // // // // // // //                 (a, b) => (a.position || 0) - (b.position || 0)
// // // // // // // // // // //               )
// // // // // // // // // // //             }))
// // // // // // // // // // //           }))
// // // // // // // // // // //       }));

// // // // // // // // // // //       setPhases(structuredPhases);

// // // // // // // // // // //       // Auto-open the first phase that has uncompleted lessons (or phase 1 as fallback)
// // // // // // // // // // //       const activePhase =
// // // // // // // // // // //         structuredPhases.find((phase) =>
// // // // // // // // // // //           phase.course_lessons?.some((lesson) => !completedIds.has(lesson.id))
// // // // // // // // // // //         ) || structuredPhases[0];

// // // // // // // // // // //       const initialOpenState = {};
// // // // // // // // // // //       structuredPhases.forEach((p) => {
// // // // // // // // // // //         initialOpenState[p.id] = p.id === activePhase?.id;
// // // // // // // // // // //       });

// // // // // // // // // // //       setOpenPhases(initialOpenState);

// // // // // // // // // // //       // Auto-select the first lesson of the active phase
// // // // // // // // // // //       const firstIncompleteLesson =
// // // // // // // // // // //         activePhase?.course_lessons?.find((l) => !completedIds.has(l.id)) ||
// // // // // // // // // // //         activePhase?.course_lessons?.[0] ||
// // // // // // // // // // //         null;

// // // // // // // // // // //       setSelectedLesson(firstIncompleteLesson);
// // // // // // // // // // //     } catch (err) {
// // // // // // // // // // //       console.error("Error fetching syllabus:", err.message);
// // // // // // // // // // //     }
// // // // // // // // // // //   };

// // // // // // // // // // //   const toggleLessonCompletion = async (lessonId) => {
// // // // // // // // // // //     const isCompleted = completedLessonIds.has(lessonId);
// // // // // // // // // // //     const newStatus = isCompleted ? "in_progress" : "completed";

// // // // // // // // // // //     try {
// // // // // // // // // // //       const { error } = await supabase.from("student_lesson_progress").upsert(
// // // // // // // // // // //         {
// // // // // // // // // // //           student_id: userId,
// // // // // // // // // // //           lesson_id: lessonId,
// // // // // // // // // // //           status: newStatus,
// // // // // // // // // // //           completed_at: isCompleted ? null : new Date().toISOString()
// // // // // // // // // // //         },
// // // // // // // // // // //         { onConflict: "student_id,lesson_id" }
// // // // // // // // // // //       );

// // // // // // // // // // //       if (error) throw error;

// // // // // // // // // // //       setCompletedLessonIds((prev) => {
// // // // // // // // // // //         const next = new Set(prev);
// // // // // // // // // // //         if (isCompleted) next.delete(lessonId);
// // // // // // // // // // //         else next.add(lessonId);
// // // // // // // // // // //         return next;
// // // // // // // // // // //       });
// // // // // // // // // // //     } catch (err) {
// // // // // // // // // // //       console.error("Error toggling completion:", err.message);
// // // // // // // // // // //     }
// // // // // // // // // // //   };

// // // // // // // // // // //   const handleSelectCourse = (course) => {
// // // // // // // // // // //     setOpenPhases({});
// // // // // // // // // // //     setSelectedLesson(null);
// // // // // // // // // // //     setActiveCourse(course);
// // // // // // // // // // //     fetchCourseSyllabus(course.id);
// // // // // // // // // // //   };

// // // // // // // // // // //   const togglePhaseAccordion = (phaseId) => {
// // // // // // // // // // //     setOpenPhases((prev) => ({
// // // // // // // // // // //       ...prev,
// // // // // // // // // // //       [phaseId]: !prev[phaseId]
// // // // // // // // // // //     }));
// // // // // // // // // // //   };

// // // // // // // // // // //   const isPhaseCompleted = (phase) => {
// // // // // // // // // // //     if (!phase.course_lessons || phase.course_lessons.length === 0) return false;
// // // // // // // // // // //     return phase.course_lessons.every((lesson) => completedLessonIds.has(lesson.id));
// // // // // // // // // // //   };

// // // // // // // // // // //   if (loading) {
// // // // // // // // // // //     return (
// // // // // // // // // // //       <div className="min-h-[60vh] flex items-center justify-center">
// // // // // // // // // // //         <div className="bg-white/10 dark:bg-white/[0.04] backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[30px] p-8 text-center shadow-xl">
// // // // // // // // // // //           <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
// // // // // // // // // // //           <h2 className="text-gray-900 dark:text-white text-xl font-bold">
// // // // // // // // // // //             Loading Learning Workspace...
// // // // // // // // // // //           </h2>
// // // // // // // // // // //           <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
// // // // // // // // // // //             Fetching your interactive curriculum 🚀
// // // // // // // // // // //           </p>
// // // // // // // // // // //         </div>
// // // // // // // // // // //       </div>
// // // // // // // // // // //     );
// // // // // // // // // // //   }

// // // // // // // // // // //   return (
// // // // // // // // // // //     <div className="space-y-6 p-4 md:p-8 text-gray-900 dark:text-white max-w-7xl mx-auto">
// // // // // // // // // // //       {/* 1. Portal Header Banner */}
// // // // // // // // // // //       <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[32px] p-6 md:p-8 shadow-xl relative overflow-hidden">
// // // // // // // // // // //         <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 blur-[120px] pointer-events-none" />
// // // // // // // // // // //         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
// // // // // // // // // // //           <div>
// // // // // // // // // // //             <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-600 dark:text-purple-300 px-4 py-2 rounded-full text-xs font-black tracking-wider mb-3">
// // // // // // // // // // //               <BookOpen size={14} />
// // // // // // // // // // //               STUDENT LEARNING PORTAL
// // // // // // // // // // //             </div>
// // // // // // // // // // //             <h1 className="text-3xl md:text-4xl font-black tracking-tight">
// // // // // // // // // // //               My Learning Workspace
// // // // // // // // // // //             </h1>
// // // // // // // // // // //             <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-xl text-sm md:text-base">
// // // // // // // // // // //               Access registered courses, watch step-by-step videos, and track your phase progression.
// // // // // // // // // // //             </p>
// // // // // // // // // // //           </div>
// // // // // // // // // // //           {activeCourse && (
// // // // // // // // // // //             <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-2xl flex items-center gap-3.5 shadow-lg shadow-purple-500/25 shrink-0">
// // // // // // // // // // //               <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
// // // // // // // // // // //                 <Rocket size={20} />
// // // // // // // // // // //               </div>
// // // // // // // // // // //               <div>
// // // // // // // // // // //                 <p className="text-[11px] text-white/80 font-bold uppercase tracking-wider">
// // // // // // // // // // //                   Current Track
// // // // // // // // // // //                 </p>
// // // // // // // // // // //                 <p className="font-black text-base max-w-[200px] truncate">{activeCourse.title}</p>
// // // // // // // // // // //               </div>
// // // // // // // // // // //             </div>
// // // // // // // // // // //           )}
// // // // // // // // // // //         </div>
// // // // // // // // // // //       </div>

// // // // // // // // // // //       {/* 2. Horizontal Quick Course Switcher Bar */}
// // // // // // // // // // //       {courses.length > 0 && (
// // // // // // // // // // //         <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
// // // // // // // // // // //           {courses.map((course) => {
// // // // // // // // // // //             const isSelected = activeCourse?.id === course.id;
// // // // // // // // // // //             return (
// // // // // // // // // // //               <button
// // // // // // // // // // //                 key={course.id}
// // // // // // // // // // //                 onClick={() => handleSelectCourse(course)}
// // // // // // // // // // //                 className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-left shrink-0 transition-all ${
// // // // // // // // // // //                   isSelected
// // // // // // // // // // //                     ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20"
// // // // // // // // // // //                     : "bg-white dark:bg-white/[0.04] border-gray-200 dark:border-white/10 hover:border-purple-500/40 text-gray-700 dark:text-gray-200"
// // // // // // // // // // //                 }`}
// // // // // // // // // // //               >
// // // // // // // // // // //                 <div className="w-8 h-8 rounded-lg overflow-hidden bg-purple-500/20 shrink-0 flex items-center justify-center font-bold text-xs">
// // // // // // // // // // //                   {course.thumbnail_url ? (
// // // // // // // // // // //                     <img
// // // // // // // // // // //                       src={course.thumbnail_url}
// // // // // // // // // // //                       alt={course.title}
// // // // // // // // // // //                       className="w-full h-full object-cover"
// // // // // // // // // // //                     />
// // // // // // // // // // //                   ) : (
// // // // // // // // // // //                     <BookOpen size={16} className={isSelected ? "text-white" : "text-purple-500"} />
// // // // // // // // // // //                   )}
// // // // // // // // // // //                 </div>
// // // // // // // // // // //                 <span className="font-bold text-sm max-w-[180px] truncate">
// // // // // // // // // // //                   {course.title}
// // // // // // // // // // //                 </span>
// // // // // // // // // // //               </button>
// // // // // // // // // // //             );
// // // // // // // // // // //           })}
// // // // // // // // // // //         </div>
// // // // // // // // // // //       )}

// // // // // // // // // // //       {/* 3. Empty State or Workspace Grid */}
// // // // // // // // // // //       {courses.length === 0 ? (
// // // // // // // // // // //         <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-[32px] p-12 text-center shadow-lg">
// // // // // // // // // // //           <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
// // // // // // // // // // //             🎓
// // // // // // // // // // //           </div>
// // // // // // // // // // //           <h3 className="text-xl font-bold">No Registered Courses Found</h3>
// // // // // // // // // // //           <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto text-sm">
// // // // // // // // // // //             You are not currently enrolled in any active courses. Please contact your administrator or instructor.
// // // // // // // // // // //           </p>
// // // // // // // // // // //         </div>
// // // // // // // // // // //       ) : (
// // // // // // // // // // //         activeCourse && (
// // // // // // // // // // //           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
// // // // // // // // // // //             {/* Left Sidebar: Sticky Syllabus & Course Overview */}
// // // // // // // // // // //             <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-6">
// // // // // // // // // // //               {/* Active Course Thumbnail & Stats Card */}
// // // // // // // // // // //               <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[28px] overflow-hidden shadow-xl p-5">
// // // // // // // // // // //                 <div className="relative h-36 rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
// // // // // // // // // // //                   {activeCourse.thumbnail_url ? (
// // // // // // // // // // //                     <img
// // // // // // // // // // //                       src={activeCourse.thumbnail_url}
// // // // // // // // // // //                       alt={activeCourse.title}
// // // // // // // // // // //                       className="w-full h-full object-cover"
// // // // // // // // // // //                     />
// // // // // // // // // // //                   ) : (
// // // // // // // // // // //                     <div className="text-center p-4">
// // // // // // // // // // //                       <BookOpen size={36} className="text-white/80 mx-auto mb-1" />
// // // // // // // // // // //                       <span className="text-xs font-bold text-white/70 uppercase tracking-widest">
// // // // // // // // // // //                         Course Track
// // // // // // // // // // //                       </span>
// // // // // // // // // // //                     </div>
// // // // // // // // // // //                   )}
// // // // // // // // // // //                   <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
// // // // // // // // // // //                   <h2 className="absolute bottom-3 left-4 right-4 font-black text-white text-lg line-clamp-1">
// // // // // // // // // // //                     {activeCourse.title}
// // // // // // // // // // //                   </h2>
// // // // // // // // // // //                 </div>

// // // // // // // // // // //                 <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 px-1">
// // // // // // // // // // //                   <span className="flex items-center gap-1.5">
// // // // // // // // // // //                     <Layers size={14} className="text-purple-500" />
// // // // // // // // // // //                     {phases.length} Phases
// // // // // // // // // // //                   </span>
// // // // // // // // // // //                   <span className="flex items-center gap-1.5">
// // // // // // // // // // //                     <CheckCircle2 size={14} className="text-emerald-500" />
// // // // // // // // // // //                     {completedLessonIds.size} Lessons Done
// // // // // // // // // // //                   </span>
// // // // // // // // // // //                 </div>
// // // // // // // // // // //               </div>

// // // // // // // // // // //               {/* Collapsible Syllabus Accordion */}
// // // // // // // // // // //               <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[28px] p-4 shadow-xl space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
// // // // // // // // // // //                 <h3 className="text-base font-black px-2 text-gray-900 dark:text-white flex items-center gap-2">
// // // // // // // // // // //                   Course Syllabus
// // // // // // // // // // //                 </h3>

// // // // // // // // // // //                 <div className="space-y-2">
// // // // // // // // // // //                   {phases.map((phase) => {
// // // // // // // // // // //                     const isOpen = !!openPhases[phase.id];
// // // // // // // // // // //                     const phaseDone = isPhaseCompleted(phase);

// // // // // // // // // // //                     return (
// // // // // // // // // // //                       <div
// // // // // // // // // // //                         key={phase.id}
// // // // // // // // // // //                         className="border border-gray-200/80 dark:border-white/10 rounded-2xl overflow-hidden transition-all bg-gray-50/50 dark:bg-white/[0.02]"
// // // // // // // // // // //                       >
// // // // // // // // // // //                         {/* Phase Header Button */}
// // // // // // // // // // //                         <button
// // // // // // // // // // //                           onClick={() => togglePhaseAccordion(phase.id)}
// // // // // // // // // // //                           className="w-full text-left p-3.5 flex items-center justify-between hover:bg-purple-500/5 transition-colors"
// // // // // // // // // // //                         >
// // // // // // // // // // //                           <div className="flex items-center gap-2.5 pr-2">
// // // // // // // // // // //                             {phaseDone ? (
// // // // // // // // // // //                               <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
// // // // // // // // // // //                             ) : (
// // // // // // // // // // //                               <div className="w-4 h-4 rounded-full border-2 border-purple-500/40 shrink-0" />
// // // // // // // // // // //                             )}
// // // // // // // // // // //                             <div>
// // // // // // // // // // //                               <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">
// // // // // // // // // // //                                 Phase {phase.phase_number}
// // // // // // // // // // //                               </span>
// // // // // // // // // // //                               <h4 className="font-bold text-xs md:text-sm text-gray-900 dark:text-white line-clamp-1">
// // // // // // // // // // //                                 {phase.title}
// // // // // // // // // // //                               </h4>
// // // // // // // // // // //                             </div>
// // // // // // // // // // //                           </div>

// // // // // // // // // // //                           {isOpen ? (
// // // // // // // // // // //                             <ChevronDown size={16} className="text-gray-400 shrink-0" />
// // // // // // // // // // //                           ) : (
// // // // // // // // // // //                             <ChevronRight size={16} className="text-gray-400 shrink-0" />
// // // // // // // // // // //                           )}
// // // // // // // // // // //                         </button>

// // // // // // // // // // //                         {/* Collapsible Lesson List */}
// // // // // // // // // // //                         {isOpen && (
// // // // // // // // // // //                           <div className="p-2 pt-0 space-y-1.5 border-t border-gray-200/50 dark:border-white/5">
// // // // // // // // // // //                             {phase.course_lessons?.map((lesson) => {
// // // // // // // // // // //                               const isSelected = selectedLesson?.id === lesson.id;
// // // // // // // // // // //                               const isDone = completedLessonIds.has(lesson.id);

// // // // // // // // // // //                               return (
// // // // // // // // // // //                                 <button
// // // // // // // // // // //                                   key={lesson.id}
// // // // // // // // // // //                                   onClick={() => setSelectedLesson(lesson)}
// // // // // // // // // // //                                   className={`w-full text-left rounded-xl p-2.5 transition-all flex items-center justify-between border ${
// // // // // // // // // // //                                     isSelected
// // // // // // // // // // //                                       ? "bg-purple-600 text-white border-transparent shadow-md"
// // // // // // // // // // //                                       : "bg-white dark:bg-white/[0.03] border-gray-200/60 dark:border-white/5 hover:border-purple-500/30"
// // // // // // // // // // //                                   }`}
// // // // // // // // // // //                                 >
// // // // // // // // // // //                                   <div className="flex items-center gap-2 min-w-0 pr-2">
// // // // // // // // // // //                                     {isDone ? (
// // // // // // // // // // //                                       <CheckCircle2
// // // // // // // // // // //                                         size={15}
// // // // // // // // // // //                                         className={isSelected ? "text-white" : "text-emerald-500"}
// // // // // // // // // // //                                       />
// // // // // // // // // // //                                     ) : (
// // // // // // // // // // //                                       <Circle
// // // // // // // // // // //                                         size={15}
// // // // // // // // // // //                                         className={isSelected ? "text-white/70" : "text-gray-400"}
// // // // // // // // // // //                                       />
// // // // // // // // // // //                                     )}
// // // // // // // // // // //                                     <span
// // // // // // // // // // //                                       className={`text-xs font-bold truncate ${
// // // // // // // // // // //                                         isSelected
// // // // // // // // // // //                                           ? "text-white"
// // // // // // // // // // //                                           : "text-gray-800 dark:text-gray-200"
// // // // // // // // // // //                                       }`}
// // // // // // // // // // //                                     >
// // // // // // // // // // //                                       {lesson.title}
// // // // // // // // // // //                                     </span>
// // // // // // // // // // //                                   </div>
// // // // // // // // // // //                                   <ChevronRight
// // // // // // // // // // //                                     size={13}
// // // // // // // // // // //                                     className={isSelected ? "text-white/80" : "text-gray-400"}
// // // // // // // // // // //                                   />
// // // // // // // // // // //                                 </button>
// // // // // // // // // // //                               );
// // // // // // // // // // //                             })}
// // // // // // // // // // //                           </div>
// // // // // // // // // // //                         )}
// // // // // // // // // // //                       </div>
// // // // // // // // // // //                     );
// // // // // // // // // // //                   })}
// // // // // // // // // // //                 </div>
// // // // // // // // // // //               </div>
// // // // // // // // // // //             </div>

// // // // // // // // // // //             {/* Right Main Panel: Active Lesson Content Display */}
// // // // // // // // // // //             <div className="lg:col-span-8">
// // // // // // // // // // //               <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[32px] p-6 md:p-8 shadow-xl">
// // // // // // // // // // //                 {selectedLesson ? (
// // // // // // // // // // //                   <div>
// // // // // // // // // // //                     {/* Active Lesson Header & Action */}
// // // // // // // // // // //                     <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
// // // // // // // // // // //                       <div>
// // // // // // // // // // //                         <span className="text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
// // // // // // // // // // //                           Active Lesson
// // // // // // // // // // //                         </span>
// // // // // // // // // // //                         <h2 className="text-2xl md:text-3xl font-black mt-2 text-gray-900 dark:text-white">
// // // // // // // // // // //                           {selectedLesson.title}
// // // // // // // // // // //                         </h2>
// // // // // // // // // // //                       </div>

// // // // // // // // // // //                       <button
// // // // // // // // // // //                         onClick={() => toggleLessonCompletion(selectedLesson.id)}
// // // // // // // // // // //                         className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
// // // // // // // // // // //                           completedLessonIds.has(selectedLesson.id)
// // // // // // // // // // //                             ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20"
// // // // // // // // // // //                             : "bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-500/20"
// // // // // // // // // // //                         }`}
// // // // // // // // // // //                       >
// // // // // // // // // // //                         {completedLessonIds.has(selectedLesson.id) ? (
// // // // // // // // // // //                           <>
// // // // // // // // // // //                             <CheckCircle2 size={16} /> Completed
// // // // // // // // // // //                           </>
// // // // // // // // // // //                         ) : (
// // // // // // // // // // //                           <>
// // // // // // // // // // //                             <Circle size={16} /> Mark as Complete
// // // // // // // // // // //                           </>
// // // // // // // // // // //                         )}
// // // // // // // // // // //                       </button>
// // // // // // // // // // //                     </div>

// // // // // // // // // // //                     {/* Active Lesson Topics Display */}
// // // // // // // // // // //                     <div className="border-t border-gray-100 dark:border-white/[0.08] pt-6 space-y-8">
// // // // // // // // // // //                       {selectedLesson.course_topics && selectedLesson.course_topics.length > 0 ? (
// // // // // // // // // // //                         selectedLesson.course_topics.map((topic) => {
// // // // // // // // // // //                           const videoBlocks = topic.topic_blocks?.filter(
// // // // // // // // // // //                             (b) => b.type === "video" && b.video_path
// // // // // // // // // // //                           ) || [];
// // // // // // // // // // //                           const textBlocks = topic.topic_blocks?.filter(
// // // // // // // // // // //                             (b) => b.type === "text" && b.content
// // // // // // // // // // //                           ) || [];

// // // // // // // // // // //                           return (
// // // // // // // // // // //                             <div key={topic.id} className="space-y-4">
// // // // // // // // // // //                               {topic.intro && (
// // // // // // // // // // //                                 <h4 className="font-bold text-lg text-purple-600 dark:text-purple-400 flex items-center gap-2">
// // // // // // // // // // //                                   <FileText size={20} />
// // // // // // // // // // //                                   {topic.intro}
// // // // // // // // // // //                                 </h4>
// // // // // // // // // // //                               )}

// // // // // // // // // // //                               {/* Top Block: Videos First */}
// // // // // // // // // // //                               {videoBlocks.map((block) => (
// // // // // // // // // // //                                 <div
// // // // // // // // // // //                                   key={block.id}
// // // // // // // // // // //                                   className="relative rounded-2xl overflow-hidden aspect-video bg-black shadow-lg border border-gray-200/20 dark:border-white/10"
// // // // // // // // // // //                                 >
// // // // // // // // // // //                                   <iframe
// // // // // // // // // // //                                     src={block.video_path}
// // // // // // // // // // //                                     title="Topic Video"
// // // // // // // // // // //                                     className="w-full h-full border-0"
// // // // // // // // // // //                                     allowFullScreen
// // // // // // // // // // //                                   />
// // // // // // // // // // //                                 </div>
// // // // // // // // // // //                               ))}

// // // // // // // // // // //                               {/* Bottom Block: Text Notes / Reading Material Second */}
// // // // // // // // // // //                               {textBlocks.map((block) => (
// // // // // // // // // // //                                 <div
// // // // // // // // // // //                                   key={block.id}
// // // // // // // // // // //                                   className="bg-gray-50/80 dark:bg-white/[0.02] p-5 md:p-6 rounded-2xl border border-gray-200/60 dark:border-white/5 space-y-3"
// // // // // // // // // // //                                 >
// // // // // // // // // // //                                   <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
// // // // // // // // // // //                                     {block.content}
// // // // // // // // // // //                                   </p>
// // // // // // // // // // //                                 </div>
// // // // // // // // // // //                               ))}
// // // // // // // // // // //                             </div>
// // // // // // // // // // //                           );
// // // // // // // // // // //                         })
// // // // // // // // // // //                       ) : (
// // // // // // // // // // //                         <div className="text-center py-12 text-gray-400">
// // // // // // // // // // //                           <p className="text-sm">No topic modules found for this lesson.</p>
// // // // // // // // // // //                         </div>
// // // // // // // // // // //                       )}
// // // // // // // // // // //                     </div>
// // // // // // // // // // //                   </div>
// // // // // // // // // // //                 ) : (
// // // // // // // // // // //                   <div className="text-center py-20 text-gray-400">
// // // // // // // // // // //                     <BookOpen size={48} className="mx-auto mb-4 opacity-40 text-purple-500" />
// // // // // // // // // // //                     <p className="text-base font-bold text-gray-700 dark:text-gray-300">
// // // // // // // // // // //                       Select a lesson from the syllabus sidebar to begin learning.
// // // // // // // // // // //                     </p>
// // // // // // // // // // //                   </div>
// // // // // // // // // // //                 )}
// // // // // // // // // // //               </div>
// // // // // // // // // // //             </div>
// // // // // // // // // // //           </div>
// // // // // // // // // // //         )
// // // // // // // // // // //       )}
// // // // // // // // // // //     </div>
// // // // // // // // // // //   );
// // // // // // // // // // // }
// // // // // // // // // // // // import React, { useEffect, useState } from "react";
// // // // // // // // // // // // import {
// // // // // // // // // // // //   BookOpen,
// // // // // // // // // // // //   ChevronRight,
// // // // // // // // // // // //   ChevronDown,
// // // // // // // // // // // //   CheckCircle2,
// // // // // // // // // // // //   Circle,
// // // // // // // // // // // //   Layers,
// // // // // // // // // // // //   Rocket,
// // // // // // // // // // // //   FileText
// // // // // // // // // // // // } from "lucide-react";
// // // // // // // // // // // // import { supabase } from "../../../supabase";

// // // // // // // // // // // // export default function StudentCoursesView({ userId, courseId }) {
// // // // // // // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // // // // // // //   const [courses, setCourses] = useState([]);
// // // // // // // // // // // //   const [activeCourse, setActiveCourse] = useState(null);

// // // // // // // // // // // //   // Structured Phase -> Lessons state
// // // // // // // // // // // //   const [phases, setPhases] = useState([]);
// // // // // // // // // // // //   const [selectedLesson, setSelectedLesson] = useState(null);
// // // // // // // // // // // //   const [completedLessonIds, setCompletedLessonIds] = useState(new Set());

// // // // // // // // // // // //   // Track open/collapsed phases by phase ID
// // // // // // // // // // // //   const [openPhases, setOpenPhases] = useState({});

// // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // //     if (userId) {
// // // // // // // // // // // //       fetchStudentCoursesData();
// // // // // // // // // // // //     }
// // // // // // // // // // // //   }, [userId, courseId]);

// // // // // // // // // // // //   const fetchStudentCoursesData = async () => {
// // // // // // // // // // // //     try {
// // // // // // // // // // // //       setLoading(true);

// // // // // // // // // // // //       // 1. Fetch registered courses for student
// // // // // // // // // // // //       const { data: enrollmentData, error: enrollError } = await supabase
// // // // // // // // // // // //         .from("student_enrollments")
// // // // // // // // // // // //         .select(`
// // // // // // // // // // // //           course_id,
// // // // // // // // // // // //           courses (*)
// // // // // // // // // // // //         `)
// // // // // // // // // // // //         .eq("student_id", userId);

// // // // // // // // // // // //       if (enrollError) throw enrollError;

// // // // // // // // // // // //       const enrolledCourses = enrollmentData
// // // // // // // // // // // //         ? enrollmentData.map((e) => e.courses).filter(Boolean)
// // // // // // // // // // // //         : [];

// // // // // // // // // // // //       setCourses(enrolledCourses);

// // // // // // // // // // // //       // 2. Set default active course (passed prop -> first enrolled -> null)
// // // // // // // // // // // //       const defaultCourse =
// // // // // // // // // // // //         enrolledCourses.find((c) => c.id === courseId) ||
// // // // // // // // // // // //         enrolledCourses[0] ||
// // // // // // // // // // // //         null;

// // // // // // // // // // // //       setActiveCourse(defaultCourse);

// // // // // // // // // // // //       if (defaultCourse) {
// // // // // // // // // // // //         await Promise.all([
// // // // // // // // // // // //           fetchCourseSyllabus(defaultCourse.id),
// // // // // // // // // // // //           fetchLessonProgress()
// // // // // // // // // // // //         ]);
// // // // // // // // // // // //       }
// // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // //       console.error("Error fetching student data:", err.message);
// // // // // // // // // // // //     } finally {
// // // // // // // // // // // //       setLoading(false);
// // // // // // // // // // // //     }
// // // // // // // // // // // //   };

// // // // // // // // // // // //   const fetchCourseSyllabus = async (targetCourseId) => {
// // // // // // // // // // // //     try {
// // // // // // // // // // // //       // Fetch Phases along with nested Lessons & Topics ordered appropriately
// // // // // // // // // // // //       const { data: phaseData, error } = await supabase
// // // // // // // // // // // //         .from("course_phases")
// // // // // // // // // // // //         .select(`
// // // // // // // // // // // //           id,
// // // // // // // // // // // //           phase_number,
// // // // // // // // // // // //           title,
// // // // // // // // // // // //           focus,
// // // // // // // // // // // //           course_lessons (
// // // // // // // // // // // //             id,
// // // // // // // // // // // //             title,
// // // // // // // // // // // //             position,
// // // // // // // // // // // //             created_at,
// // // // // // // // // // // //             course_topics (
// // // // // // // // // // // //               id,
// // // // // // // // // // // //               intro,
// // // // // // // // // // // //               topic_blocks ( id, type, content, video_path )
// // // // // // // // // // // //             )
// // // // // // // // // // // //           )
// // // // // // // // // // // //         `)
// // // // // // // // // // // //         .eq("course_id", targetCourseId)
// // // // // // // // // // // //         .order("phase_number", { ascending: true });

// // // // // // // // // // // //       if (error) throw error;

// // // // // // // // // // // //       // Sort nested lessons by position
// // // // // // // // // // // //       const structuredPhases = (phaseData || []).map((phase) => ({
// // // // // // // // // // // //         ...phase,
// // // // // // // // // // // //         course_lessons: (phase.course_lessons || []).sort(
// // // // // // // // // // // //           (a, b) => (a.position || 0) - (b.position || 0)
// // // // // // // // // // // //         )
// // // // // // // // // // // //       }));

// // // // // // // // // // // //       setPhases(structuredPhases);

// // // // // // // // // // // //       // Expand all phases by default
// // // // // // // // // // // //       const initialOpenState = {};
// // // // // // // // // // // //       structuredPhases.forEach((p) => {
// // // // // // // // // // // //         initialOpenState[p.id] = true;
// // // // // // // // // // // //       });
// // // // // // // // // // // //       setOpenPhases(initialOpenState);

// // // // // // // // // // // //       // Auto-select first lesson in first phase
// // // // // // // // // // // //       const firstLesson = structuredPhases[0]?.course_lessons[0] || null;
// // // // // // // // // // // //       setSelectedLesson(firstLesson);
// // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // //       console.error("Error fetching syllabus:", err.message);
// // // // // // // // // // // //     }
// // // // // // // // // // // //   };

// // // // // // // // // // // //   const fetchLessonProgress = async () => {
// // // // // // // // // // // //     try {
// // // // // // // // // // // //       const { data: progressData, error } = await supabase
// // // // // // // // // // // //         .from("student_lesson_progress")
// // // // // // // // // // // //         .select("lesson_id, status")
// // // // // // // // // // // //         .eq("student_id", userId)
// // // // // // // // // // // //         .eq("status", "completed");

// // // // // // // // // // // //       if (error) throw error;

// // // // // // // // // // // //       const completedSet = new Set(progressData.map((p) => p.lesson_id));
// // // // // // // // // // // //       setCompletedLessonIds(completedSet);
// // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // //       console.error("Error fetching progress:", err.message);
// // // // // // // // // // // //     }
// // // // // // // // // // // //   };

// // // // // // // // // // // //   const toggleLessonCompletion = async (lessonId) => {
// // // // // // // // // // // //     const isCompleted = completedLessonIds.has(lessonId);
// // // // // // // // // // // //     const newStatus = isCompleted ? "in_progress" : "completed";

// // // // // // // // // // // //     try {
// // // // // // // // // // // //       const { error } = await supabase.from("student_lesson_progress").upsert(
// // // // // // // // // // // //         {
// // // // // // // // // // // //           student_id: userId,
// // // // // // // // // // // //           lesson_id: lessonId,
// // // // // // // // // // // //           status: newStatus,
// // // // // // // // // // // //           completed_at: isCompleted ? null : new Date().toISOString()
// // // // // // // // // // // //         },
// // // // // // // // // // // //         { onConflict: "student_id,lesson_id" }
// // // // // // // // // // // //       );

// // // // // // // // // // // //       if (error) throw error;

// // // // // // // // // // // //       setCompletedLessonIds((prev) => {
// // // // // // // // // // // //         const next = new Set(prev);
// // // // // // // // // // // //         if (isCompleted) next.delete(lessonId);
// // // // // // // // // // // //         else next.add(lessonId);
// // // // // // // // // // // //         return next;
// // // // // // // // // // // //       });
// // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // //       console.error("Error toggling completion:", err.message);
// // // // // // // // // // // //     }
// // // // // // // // // // // //   };

// // // // // // // // // // // //   const handleSelectCourse = (course) => {
// // // // // // // // // // // //     setActiveCourse(course);
// // // // // // // // // // // //     fetchCourseSyllabus(course.id);
// // // // // // // // // // // //   };

// // // // // // // // // // // //   const togglePhaseAccordion = (phaseId) => {
// // // // // // // // // // // //     setOpenPhases((prev) => ({
// // // // // // // // // // // //       ...prev,
// // // // // // // // // // // //       [phaseId]: !prev[phaseId]
// // // // // // // // // // // //     }));
// // // // // // // // // // // //   };

// // // // // // // // // // // //   const isPhaseCompleted = (phase) => {
// // // // // // // // // // // //     if (!phase.course_lessons || phase.course_lessons.length === 0) return false;
// // // // // // // // // // // //     return phase.course_lessons.every((lesson) => completedLessonIds.has(lesson.id));
// // // // // // // // // // // //   };

// // // // // // // // // // // //   if (loading) {
// // // // // // // // // // // //     return (
// // // // // // // // // // // //       <div className="min-h-[60vh] flex items-center justify-center">
// // // // // // // // // // // //         <div className="bg-white/10 dark:bg-white/[0.04] backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[30px] p-8 text-center shadow-xl">
// // // // // // // // // // // //           <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
// // // // // // // // // // // //           <h2 className="text-gray-900 dark:text-white text-xl font-bold">
// // // // // // // // // // // //             Loading Learning Workspace...
// // // // // // // // // // // //           </h2>
// // // // // // // // // // // //           <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
// // // // // // // // // // // //             Fetching your interactive curriculum 🚀
// // // // // // // // // // // //           </p>
// // // // // // // // // // // //         </div>
// // // // // // // // // // // //       </div>
// // // // // // // // // // // //     );
// // // // // // // // // // // //   }

// // // // // // // // // // // //   return (
// // // // // // // // // // // //     <div className="space-y-6 p-4 md:p-8 text-gray-900 dark:text-white max-w-7xl mx-auto">
// // // // // // // // // // // //       {/* 1. Portal Header Banner */}
// // // // // // // // // // // //       <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[32px] p-6 md:p-8 shadow-xl relative overflow-hidden">
// // // // // // // // // // // //         <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 blur-[120px] pointer-events-none" />
// // // // // // // // // // // //         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
// // // // // // // // // // // //           <div>
// // // // // // // // // // // //             <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-600 dark:text-purple-300 px-4 py-2 rounded-full text-xs font-black tracking-wider mb-3">
// // // // // // // // // // // //               <BookOpen size={14} />
// // // // // // // // // // // //               STUDENT LEARNING PORTAL
// // // // // // // // // // // //             </div>
// // // // // // // // // // // //             <h1 className="text-3xl md:text-4xl font-black tracking-tight">
// // // // // // // // // // // //               My Learning Workspace
// // // // // // // // // // // //             </h1>
// // // // // // // // // // // //             <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-xl text-sm md:text-base">
// // // // // // // // // // // //               Access registered courses, watch step-by-step videos, and track your phase progression.
// // // // // // // // // // // //             </p>
// // // // // // // // // // // //           </div>
// // // // // // // // // // // //           {activeCourse && (
// // // // // // // // // // // //             <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-2xl flex items-center gap-3.5 shadow-lg shadow-purple-500/25 shrink-0">
// // // // // // // // // // // //               <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
// // // // // // // // // // // //                 <Rocket size={20} />
// // // // // // // // // // // //               </div>
// // // // // // // // // // // //               <div>
// // // // // // // // // // // //                 <p className="text-[11px] text-white/80 font-bold uppercase tracking-wider">
// // // // // // // // // // // //                   Current Track
// // // // // // // // // // // //                 </p>
// // // // // // // // // // // //                 <p className="font-black text-base max-w-[200px] truncate">{activeCourse.title}</p>
// // // // // // // // // // // //               </div>
// // // // // // // // // // // //             </div>
// // // // // // // // // // // //           )}
// // // // // // // // // // // //         </div>
// // // // // // // // // // // //       </div>

// // // // // // // // // // // //       {/* 2. Horizontal Quick Course Switcher Bar */}
// // // // // // // // // // // //       {courses.length > 0 && (
// // // // // // // // // // // //         <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
// // // // // // // // // // // //           {courses.map((course) => {
// // // // // // // // // // // //             const isSelected = activeCourse?.id === course.id;
// // // // // // // // // // // //             return (
// // // // // // // // // // // //               <button
// // // // // // // // // // // //                 key={course.id}
// // // // // // // // // // // //                 onClick={() => handleSelectCourse(course)}
// // // // // // // // // // // //                 className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-left shrink-0 transition-all ${
// // // // // // // // // // // //                   isSelected
// // // // // // // // // // // //                     ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20"
// // // // // // // // // // // //                     : "bg-white dark:bg-white/[0.04] border-gray-200 dark:border-white/10 hover:border-purple-500/40 text-gray-700 dark:text-gray-200"
// // // // // // // // // // // //                 }`}
// // // // // // // // // // // //               >
// // // // // // // // // // // //                 <div className="w-8 h-8 rounded-lg overflow-hidden bg-purple-500/20 shrink-0 flex items-center justify-center font-bold text-xs">
// // // // // // // // // // // //                   {course.thumbnail_url ? (
// // // // // // // // // // // //                     <img
// // // // // // // // // // // //                       src={course.thumbnail_url}
// // // // // // // // // // // //                       alt={course.title}
// // // // // // // // // // // //                       className="w-full h-full object-cover"
// // // // // // // // // // // //                     />
// // // // // // // // // // // //                   ) : (
// // // // // // // // // // // //                     <BookOpen size={16} className={isSelected ? "text-white" : "text-purple-500"} />
// // // // // // // // // // // //                   )}
// // // // // // // // // // // //                 </div>
// // // // // // // // // // // //                 <span className="font-bold text-sm max-w-[180px] truncate">
// // // // // // // // // // // //                   {course.title}
// // // // // // // // // // // //                 </span>
// // // // // // // // // // // //               </button>
// // // // // // // // // // // //             );
// // // // // // // // // // // //           })}
// // // // // // // // // // // //         </div>
// // // // // // // // // // // //       )}

// // // // // // // // // // // //       {/* 3. Empty State or Workspace Grid */}
// // // // // // // // // // // //       {courses.length === 0 ? (
// // // // // // // // // // // //         <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-[32px] p-12 text-center shadow-lg">
// // // // // // // // // // // //           <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
// // // // // // // // // // // //             🎓
// // // // // // // // // // // //           </div>
// // // // // // // // // // // //           <h3 className="text-xl font-bold">No Registered Courses Found</h3>
// // // // // // // // // // // //           <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto text-sm">
// // // // // // // // // // // //             You are not currently enrolled in any active courses. Please contact your administrator or instructor.
// // // // // // // // // // // //           </p>
// // // // // // // // // // // //         </div>
// // // // // // // // // // // //       ) : (
// // // // // // // // // // // //         activeCourse && (
// // // // // // // // // // // //           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
// // // // // // // // // // // //             {/* Left Sidebar: Active Course Overview & Collapsible Syllabus */}
// // // // // // // // // // // //             <div className="lg:col-span-4 space-y-4">
// // // // // // // // // // // //               {/* Active Course Thumbnail & Stats Card */}
// // // // // // // // // // // //               <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[28px] overflow-hidden shadow-xl p-5">
// // // // // // // // // // // //                 <div className="relative h-36 rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
// // // // // // // // // // // //                   {activeCourse.thumbnail_url ? (
// // // // // // // // // // // //                     <img
// // // // // // // // // // // //                       src={activeCourse.thumbnail_url}
// // // // // // // // // // // //                       alt={activeCourse.title}
// // // // // // // // // // // //                       className="w-full h-full object-cover"
// // // // // // // // // // // //                     />
// // // // // // // // // // // //                   ) : (
// // // // // // // // // // // //                     <div className="text-center p-4">
// // // // // // // // // // // //                       <BookOpen size={36} className="text-white/80 mx-auto mb-1" />
// // // // // // // // // // // //                       <span className="text-xs font-bold text-white/70 uppercase tracking-widest">
// // // // // // // // // // // //                         Course Track
// // // // // // // // // // // //                       </span>
// // // // // // // // // // // //                     </div>
// // // // // // // // // // // //                   )}
// // // // // // // // // // // //                   <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
// // // // // // // // // // // //                   <h2 className="absolute bottom-3 left-4 right-4 font-black text-white text-lg line-clamp-1">
// // // // // // // // // // // //                     {activeCourse.title}
// // // // // // // // // // // //                   </h2>
// // // // // // // // // // // //                 </div>

// // // // // // // // // // // //                 <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 px-1">
// // // // // // // // // // // //                   <span className="flex items-center gap-1.5">
// // // // // // // // // // // //                     <Layers size={14} className="text-purple-500" />
// // // // // // // // // // // //                     {phases.length} Phases
// // // // // // // // // // // //                   </span>
// // // // // // // // // // // //                   <span className="flex items-center gap-1.5">
// // // // // // // // // // // //                     <CheckCircle2 size={14} className="text-emerald-500" />
// // // // // // // // // // // //                     {completedLessonIds.size} Lessons Done
// // // // // // // // // // // //                   </span>
// // // // // // // // // // // //                 </div>
// // // // // // // // // // // //               </div>

// // // // // // // // // // // //               {/* Collapsible Syllabus Accordion */}
// // // // // // // // // // // //               <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[28px] p-4 shadow-xl space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto">
// // // // // // // // // // // //                 <h3 className="text-base font-black px-2 text-gray-900 dark:text-white flex items-center gap-2">
// // // // // // // // // // // //                   Course Syllabus
// // // // // // // // // // // //                 </h3>

// // // // // // // // // // // //                 <div className="space-y-2">
// // // // // // // // // // // //                   {phases.map((phase) => {
// // // // // // // // // // // //                     const isOpen = !!openPhases[phase.id];
// // // // // // // // // // // //                     const phaseDone = isPhaseCompleted(phase);

// // // // // // // // // // // //                     return (
// // // // // // // // // // // //                       <div
// // // // // // // // // // // //                         key={phase.id}
// // // // // // // // // // // //                         className="border border-gray-200/80 dark:border-white/10 rounded-2xl overflow-hidden transition-all bg-gray-50/50 dark:bg-white/[0.02]"
// // // // // // // // // // // //                       >
// // // // // // // // // // // //                         {/* Phase Header Button */}
// // // // // // // // // // // //                         <button
// // // // // // // // // // // //                           onClick={() => togglePhaseAccordion(phase.id)}
// // // // // // // // // // // //                           className="w-full text-left p-3.5 flex items-center justify-between hover:bg-purple-500/5 transition-colors"
// // // // // // // // // // // //                         >
// // // // // // // // // // // //                           <div className="flex items-center gap-2.5 pr-2">
// // // // // // // // // // // //                             {phaseDone ? (
// // // // // // // // // // // //                               <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
// // // // // // // // // // // //                             ) : (
// // // // // // // // // // // //                               <div className="w-4 h-4 rounded-full border-2 border-purple-500/40 shrink-0" />
// // // // // // // // // // // //                             )}
// // // // // // // // // // // //                             <div>
// // // // // // // // // // // //                               <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">
// // // // // // // // // // // //                                 Phase {phase.phase_number}
// // // // // // // // // // // //                               </span>
// // // // // // // // // // // //                               <h4 className="font-bold text-xs md:text-sm text-gray-900 dark:text-white line-clamp-1">
// // // // // // // // // // // //                                 {phase.title}
// // // // // // // // // // // //                               </h4>
// // // // // // // // // // // //                             </div>
// // // // // // // // // // // //                           </div>

// // // // // // // // // // // //                           {isOpen ? (
// // // // // // // // // // // //                             <ChevronDown size={16} className="text-gray-400 shrink-0" />
// // // // // // // // // // // //                           ) : (
// // // // // // // // // // // //                             <ChevronRight size={16} className="text-gray-400 shrink-0" />
// // // // // // // // // // // //                           )}
// // // // // // // // // // // //                         </button>

// // // // // // // // // // // //                         {/* Collapsible Lesson List */}
// // // // // // // // // // // //                         {isOpen && (
// // // // // // // // // // // //                           <div className="p-2 pt-0 space-y-1.5 border-t border-gray-200/50 dark:border-white/5">
// // // // // // // // // // // //                             {phase.course_lessons?.map((lesson) => {
// // // // // // // // // // // //                               const isSelected = selectedLesson?.id === lesson.id;
// // // // // // // // // // // //                               const isDone = completedLessonIds.has(lesson.id);

// // // // // // // // // // // //                               return (
// // // // // // // // // // // //                                 <button
// // // // // // // // // // // //                                   key={lesson.id}
// // // // // // // // // // // //                                   onClick={() => setSelectedLesson(lesson)}
// // // // // // // // // // // //                                   className={`w-full text-left rounded-xl p-2.5 transition-all flex items-center justify-between border ${
// // // // // // // // // // // //                                     isSelected
// // // // // // // // // // // //                                       ? "bg-purple-600 text-white border-transparent shadow-md"
// // // // // // // // // // // //                                       : "bg-white dark:bg-white/[0.03] border-gray-200/60 dark:border-white/5 hover:border-purple-500/30"
// // // // // // // // // // // //                                   }`}
// // // // // // // // // // // //                                 >
// // // // // // // // // // // //                                   <div className="flex items-center gap-2 min-w-0 pr-2">
// // // // // // // // // // // //                                     {isDone ? (
// // // // // // // // // // // //                                       <CheckCircle2
// // // // // // // // // // // //                                         size={15}
// // // // // // // // // // // //                                         className={isSelected ? "text-white" : "text-emerald-500"}
// // // // // // // // // // // //                                       />
// // // // // // // // // // // //                                     ) : (
// // // // // // // // // // // //                                       <Circle
// // // // // // // // // // // //                                         size={15}
// // // // // // // // // // // //                                         className={isSelected ? "text-white/70" : "text-gray-400"}
// // // // // // // // // // // //                                       />
// // // // // // // // // // // //                                     )}
// // // // // // // // // // // //                                     <span
// // // // // // // // // // // //                                       className={`text-xs font-bold truncate ${
// // // // // // // // // // // //                                         isSelected
// // // // // // // // // // // //                                           ? "text-white"
// // // // // // // // // // // //                                           : "text-gray-800 dark:text-gray-200"
// // // // // // // // // // // //                                       }`}
// // // // // // // // // // // //                                     >
// // // // // // // // // // // //                                       {lesson.title}
// // // // // // // // // // // //                                     </span>
// // // // // // // // // // // //                                   </div>
// // // // // // // // // // // //                                   <ChevronRight
// // // // // // // // // // // //                                     size={13}
// // // // // // // // // // // //                                     className={isSelected ? "text-white/80" : "text-gray-400"}
// // // // // // // // // // // //                                   />
// // // // // // // // // // // //                                 </button>
// // // // // // // // // // // //                               );
// // // // // // // // // // // //                             })}
// // // // // // // // // // // //                           </div>
// // // // // // // // // // // //                         )}
// // // // // // // // // // // //                       </div>
// // // // // // // // // // // //                     );
// // // // // // // // // // // //                   })}
// // // // // // // // // // // //                 </div>
// // // // // // // // // // // //               </div>
// // // // // // // // // // // //             </div>

// // // // // // // // // // // //             {/* Right Main Panel: Active Lesson Content Display */}
// // // // // // // // // // // //             <div className="lg:col-span-8">
// // // // // // // // // // // //               <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[32px] p-6 md:p-8 shadow-xl">
// // // // // // // // // // // //                 {selectedLesson ? (
// // // // // // // // // // // //                   <div>
// // // // // // // // // // // //                     {/* Active Lesson Header & Action */}
// // // // // // // // // // // //                     <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
// // // // // // // // // // // //                       <div>
// // // // // // // // // // // //                         <span className="text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
// // // // // // // // // // // //                           Active Lesson
// // // // // // // // // // // //                         </span>
// // // // // // // // // // // //                         <h2 className="text-2xl md:text-3xl font-black mt-2 text-gray-900 dark:text-white">
// // // // // // // // // // // //                           {selectedLesson.title}
// // // // // // // // // // // //                         </h2>
// // // // // // // // // // // //                       </div>

// // // // // // // // // // // //                       <button
// // // // // // // // // // // //                         onClick={() => toggleLessonCompletion(selectedLesson.id)}
// // // // // // // // // // // //                         className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
// // // // // // // // // // // //                           completedLessonIds.has(selectedLesson.id)
// // // // // // // // // // // //                             ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20"
// // // // // // // // // // // //                             : "bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-500/20"
// // // // // // // // // // // //                         }`}
// // // // // // // // // // // //                       >
// // // // // // // // // // // //                         {completedLessonIds.has(selectedLesson.id) ? (
// // // // // // // // // // // //                           <>
// // // // // // // // // // // //                             <CheckCircle2 size={16} /> Completed
// // // // // // // // // // // //                           </>
// // // // // // // // // // // //                         ) : (
// // // // // // // // // // // //                           <>
// // // // // // // // // // // //                             <Circle size={16} /> Mark as Complete
// // // // // // // // // // // //                           </>
// // // // // // // // // // // //                         )}
// // // // // // // // // // // //                       </button>
// // // // // // // // // // // //                     </div>

// // // // // // // // // // // //                     {/* Active Lesson Topics & Video Blocks */}
// // // // // // // // // // // //                     <div className="border-t border-gray-100 dark:border-white/[0.08] pt-6 space-y-6">
// // // // // // // // // // // //                       {selectedLesson.course_topics && selectedLesson.course_topics.length > 0 ? (
// // // // // // // // // // // //                         selectedLesson.course_topics.map((topic) => (
// // // // // // // // // // // //                           <div key={topic.id} className="space-y-4">
// // // // // // // // // // // //                             {topic.intro && (
// // // // // // // // // // // //                               <h4 className="font-bold text-base text-purple-600 dark:text-purple-400 flex items-center gap-2">
// // // // // // // // // // // //                                 <FileText size={18} />
// // // // // // // // // // // //                                 {topic.intro}
// // // // // // // // // // // //                               </h4>
// // // // // // // // // // // //                             )}
// // // // // // // // // // // //                             {topic.topic_blocks?.map((block) => (
// // // // // // // // // // // //                               <div
// // // // // // // // // // // //                                 key={block.id}
// // // // // // // // // // // //                                 className="bg-gray-50/80 dark:bg-white/[0.02] p-4 md:p-5 rounded-2xl border border-gray-200/60 dark:border-white/5 space-y-3"
// // // // // // // // // // // //                               >
// // // // // // // // // // // //                                 {block.type === "video" && block.video_path && (
// // // // // // // // // // // //                                   <div className="relative rounded-xl overflow-hidden aspect-video bg-black shadow-inner">
// // // // // // // // // // // //                                     <iframe
// // // // // // // // // // // //                                       src={block.video_path}
// // // // // // // // // // // //                                       title="Topic Video"
// // // // // // // // // // // //                                       className="w-full h-full border-0"
// // // // // // // // // // // //                                       allowFullScreen
// // // // // // // // // // // //                                     />
// // // // // // // // // // // //                                   </div>
// // // // // // // // // // // //                                 )}
// // // // // // // // // // // //                                 {block.content && (
// // // // // // // // // // // //                                   <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
// // // // // // // // // // // //                                     {block.content}
// // // // // // // // // // // //                                   </p>
// // // // // // // // // // // //                                 )}
// // // // // // // // // // // //                               </div>
// // // // // // // // // // // //                             ))}
// // // // // // // // // // // //                           </div>
// // // // // // // // // // // //                         ))
// // // // // // // // // // // //                       ) : (
// // // // // // // // // // // //                         <div className="text-center py-12 text-gray-400">
// // // // // // // // // // // //                           <p className="text-sm">No topic modules found for this lesson.</p>
// // // // // // // // // // // //                         </div>
// // // // // // // // // // // //                       )}
// // // // // // // // // // // //                     </div>
// // // // // // // // // // // //                   </div>
// // // // // // // // // // // //                 ) : (
// // // // // // // // // // // //                   <div className="text-center py-20 text-gray-400">
// // // // // // // // // // // //                     <BookOpen size={48} className="mx-auto mb-4 opacity-40 text-purple-500" />
// // // // // // // // // // // //                     <p className="text-base font-bold text-gray-700 dark:text-gray-300">
// // // // // // // // // // // //                       Select a lesson from the syllabus sidebar to begin learning.
// // // // // // // // // // // //                     </p>
// // // // // // // // // // // //                   </div>
// // // // // // // // // // // //                 )}
// // // // // // // // // // // //               </div>
// // // // // // // // // // // //             </div>
// // // // // // // // // // // //           </div>
// // // // // // // // // // // //         )
// // // // // // // // // // // //       )}
// // // // // // // // // // // //     </div>
// // // // // // // // // // // //   );
// // // // // // // // // // // // }
// // // // // // // // // // // // // // import React, { useEffect, useState } from "react";
// // // // // // // // // // // // // // import {
// // // // // // // // // // // // // //   BookOpen,
// // // // // // // // // // // // // //   ChevronRight,
// // // // // // // // // // // // // //   ChevronDown,
// // // // // // // // // // // // // //   CheckCircle2,
// // // // // // // // // // // // // //   Circle,
// // // // // // // // // // // // // //   Layers,
// // // // // // // // // // // // // //   Award,
// // // // // // // // // // // // // //   Video,
// // // // // // // // // // // // // //   FileText
// // // // // // // // // // // // // // } from "lucide-react";
// // // // // // // // // // // // // // import { supabase } from "../../../supabase";

// // // // // // // // // // // // // // export default function StudentCoursesView({ userId, courseId }) {
// // // // // // // // // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // // // // // // // // //   const [courses, setCourses] = useState([]);
// // // // // // // // // // // // // //   const [activeCourse, setActiveCourse] = useState(null);

// // // // // // // // // // // // // //   const [phases, setPhases] = useState([]);
// // // // // // // // // // // // // //   const [selectedLesson, setSelectedLesson] = useState(null);
// // // // // // // // // // // // // //   const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
  
// // // // // // // // // // // // // //   // Track open/collapsed phases by phase ID
// // // // // // // // // // // // // //   const [openPhases, setOpenPhases] = useState({});

// // // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // // //     if (userId) {
// // // // // // // // // // // // // //       fetchStudentCoursesData();
// // // // // // // // // // // // // //     }
// // // // // // // // // // // // // //   }, [userId, courseId]);

// // // // // // // // // // // // // //   const fetchStudentCoursesData = async () => {
// // // // // // // // // // // // // //     try {
// // // // // // // // // // // // // //       setLoading(true);

// // // // // // // // // // // // // //       const { data: enrollmentData, error: enrollError } = await supabase
// // // // // // // // // // // // // //         .from("student_enrollments")
// // // // // // // // // // // // // //         .select(`
// // // // // // // // // // // // // //           course_id,
// // // // // // // // // // // // // //           courses (*)
// // // // // // // // // // // // // //         `)
// // // // // // // // // // // // // //         .eq("student_id", userId);

// // // // // // // // // // // // // //       if (enrollError) throw enrollError;

// // // // // // // // // // // // // //       const enrolledCourses = enrollmentData
// // // // // // // // // // // // // //         ? enrollmentData.map((e) => e.courses).filter(Boolean)
// // // // // // // // // // // // // //         : [];

// // // // // // // // // // // // // //       setCourses(enrolledCourses);

// // // // // // // // // // // // // //       const defaultCourse =
// // // // // // // // // // // // // //         enrolledCourses.find((c) => c.id === courseId) ||
// // // // // // // // // // // // // //         enrolledCourses[0] ||
// // // // // // // // // // // // // //         null;

// // // // // // // // // // // // // //       setActiveCourse(defaultCourse);

// // // // // // // // // // // // // //       if (defaultCourse) {
// // // // // // // // // // // // // //         await Promise.all([
// // // // // // // // // // // // // //           fetchCourseSyllabus(defaultCourse.id),
// // // // // // // // // // // // // //           fetchLessonProgress()
// // // // // // // // // // // // // //         ]);
// // // // // // // // // // // // // //       }
// // // // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // // // //       console.error("Error fetching student data:", err.message);
// // // // // // // // // // // // // //     } finally {
// // // // // // // // // // // // // //       setLoading(false);
// // // // // // // // // // // // // //     }
// // // // // // // // // // // // // //   };

// // // // // // // // // // // // // //   const fetchCourseSyllabus = async (targetCourseId) => {
// // // // // // // // // // // // // //     try {
// // // // // // // // // // // // // //       const { data: phaseData, error } = await supabase
// // // // // // // // // // // // // //         .from("course_phases")
// // // // // // // // // // // // // //         .select(`
// // // // // // // // // // // // // //           id,
// // // // // // // // // // // // // //           phase_number,
// // // // // // // // // // // // // //           title,
// // // // // // // // // // // // // //           focus,
// // // // // // // // // // // // // //           course_lessons (
// // // // // // // // // // // // // //             id,
// // // // // // // // // // // // // //             title,
// // // // // // // // // // // // // //             position,
// // // // // // // // // // // // // //             created_at,
// // // // // // // // // // // // // //             course_topics (
// // // // // // // // // // // // // //               id,
// // // // // // // // // // // // // //               intro,
// // // // // // // // // // // // // //               topic_blocks ( id, type, content, video_path )
// // // // // // // // // // // // // //             )
// // // // // // // // // // // // // //           )
// // // // // // // // // // // // // //         `)
// // // // // // // // // // // // // //         .eq("course_id", targetCourseId)
// // // // // // // // // // // // // //         .order("phase_number", { ascending: true });

// // // // // // // // // // // // // //       if (error) throw error;

// // // // // // // // // // // // // //       const structuredPhases = (phaseData || []).map((phase) => ({
// // // // // // // // // // // // // //         ...phase,
// // // // // // // // // // // // // //         course_lessons: (phase.course_lessons || []).sort(
// // // // // // // // // // // // // //           (a, b) => (a.position || 0) - (b.position || 0)
// // // // // // // // // // // // // //         )
// // // // // // // // // // // // // //       }));

// // // // // // // // // // // // // //       setPhases(structuredPhases);

// // // // // // // // // // // // // //       // Default expand all phases
// // // // // // // // // // // // // //       const initialOpenState = {};
// // // // // // // // // // // // // //       structuredPhases.forEach((p) => {
// // // // // // // // // // // // // //         initialOpenState[p.id] = true;
// // // // // // // // // // // // // //       });
// // // // // // // // // // // // // //       setOpenPhases(initialOpenState);

// // // // // // // // // // // // // //       // Select first lesson
// // // // // // // // // // // // // //       const firstLesson = structuredPhases[0]?.course_lessons[0] || null;
// // // // // // // // // // // // // //       setSelectedLesson(firstLesson);
// // // // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // // // //       console.error("Error fetching syllabus:", err.message);
// // // // // // // // // // // // // //     }
// // // // // // // // // // // // // //   };

// // // // // // // // // // // // // //   const fetchLessonProgress = async () => {
// // // // // // // // // // // // // //     try {
// // // // // // // // // // // // // //       const { data: progressData, error } = await supabase
// // // // // // // // // // // // // //         .from("student_lesson_progress")
// // // // // // // // // // // // // //         .select("lesson_id, status")
// // // // // // // // // // // // // //         .eq("student_id", userId)
// // // // // // // // // // // // // //         .eq("status", "completed");

// // // // // // // // // // // // // //       if (error) throw error;

// // // // // // // // // // // // // //       const completedSet = new Set(progressData.map((p) => p.lesson_id));
// // // // // // // // // // // // // //       setCompletedLessonIds(completedSet);
// // // // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // // // //       console.error("Error fetching progress:", err.message);
// // // // // // // // // // // // // //     }
// // // // // // // // // // // // // //   };

// // // // // // // // // // // // // //   const toggleLessonCompletion = async (lessonId) => {
// // // // // // // // // // // // // //     const isCompleted = completedLessonIds.has(lessonId);
// // // // // // // // // // // // // //     const newStatus = isCompleted ? "in_progress" : "completed";

// // // // // // // // // // // // // //     try {
// // // // // // // // // // // // // //       const { error } = await supabase.from("student_lesson_progress").upsert(
// // // // // // // // // // // // // //         {
// // // // // // // // // // // // // //           student_id: userId,
// // // // // // // // // // // // // //           lesson_id: lessonId,
// // // // // // // // // // // // // //           status: newStatus,
// // // // // // // // // // // // // //           completed_at: isCompleted ? null : new Date().toISOString()
// // // // // // // // // // // // // //         },
// // // // // // // // // // // // // //         { onConflict: "student_id,lesson_id" }
// // // // // // // // // // // // // //       );

// // // // // // // // // // // // // //       if (error) throw error;

// // // // // // // // // // // // // //       setCompletedLessonIds((prev) => {
// // // // // // // // // // // // // //         const next = new Set(prev);
// // // // // // // // // // // // // //         if (isCompleted) next.delete(lessonId);
// // // // // // // // // // // // // //         else next.add(lessonId);
// // // // // // // // // // // // // //         return next;
// // // // // // // // // // // // // //       });
// // // // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // // // //       console.error("Error toggling completion:", err.message);
// // // // // // // // // // // // // //     }
// // // // // // // // // // // // // //   };

// // // // // // // // // // // // // //   const handleSelectCourse = (course) => {
// // // // // // // // // // // // // //     setActiveCourse(course);
// // // // // // // // // // // // // //     fetchCourseSyllabus(course.id);
// // // // // // // // // // // // // //   };

// // // // // // // // // // // // // //   const togglePhaseAccordion = (phaseId) => {
// // // // // // // // // // // // // //     setOpenPhases((prev) => ({
// // // // // // // // // // // // // //       ...prev,
// // // // // // // // // // // // // //       [phaseId]: !prev[phaseId]
// // // // // // // // // // // // // //     }));
// // // // // // // // // // // // // //   };

// // // // // // // // // // // // // //   // Helper check to see if all lessons in a phase are marked complete
// // // // // // // // // // // // // //   const isPhaseCompleted = (phase) => {
// // // // // // // // // // // // // //     if (!phase.course_lessons || phase.course_lessons.length === 0) return false;
// // // // // // // // // // // // // //     return phase.course_lessons.every((lesson) => completedLessonIds.has(lesson.id));
// // // // // // // // // // // // // //   };

// // // // // // // // // // // // // //   if (loading) {
// // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // //       <div className="min-h-[60vh] flex items-center justify-center">
// // // // // // // // // // // // // //         <div className="bg-white/10 dark:bg-white/[0.04] backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[30px] p-8 text-center shadow-xl">
// // // // // // // // // // // // // //           <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
// // // // // // // // // // // // // //           <h2 className="text-gray-900 dark:text-white text-xl font-bold">
// // // // // // // // // // // // // //             Loading Learning Workspace...
// // // // // // // // // // // // // //           </h2>
// // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // //       </div>
// // // // // // // // // // // // // //     );
// // // // // // // // // // // // // //   }

// // // // // // // // // // // // // //   return (
// // // // // // // // // // // // // //     <div className="space-y-6 p-4 md:p-8 text-gray-900 dark:text-white max-w-7xl mx-auto">
// // // // // // // // // // // // // //       {/* Top Selector Bar for Enrolled Courses */}
// // // // // // // // // // // // // //       <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
// // // // // // // // // // // // // //         {courses.map((course) => {
// // // // // // // // // // // // // //           const isSelected = activeCourse?.id === course.id;
// // // // // // // // // // // // // //           return (
// // // // // // // // // // // // // //             <button
// // // // // // // // // // // // // //               key={course.id}
// // // // // // // // // // // // // //               onClick={() => handleSelectCourse(course)}
// // // // // // // // // // // // // //               className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-left shrink-0 transition-all ${
// // // // // // // // // // // // // //                 isSelected
// // // // // // // // // // // // // //                   ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20"
// // // // // // // // // // // // // //                   : "bg-white dark:bg-white/[0.04] border-gray-200 dark:border-white/10 hover:border-purple-500/40 text-gray-700 dark:text-gray-200"
// // // // // // // // // // // // // //               }`}
// // // // // // // // // // // // // //             >
// // // // // // // // // // // // // //               <div className="w-8 h-8 rounded-lg overflow-hidden bg-purple-500/20 shrink-0 flex items-center justify-center font-bold text-xs">
// // // // // // // // // // // // // //                 {course.thumbnail_url ? (
// // // // // // // // // // // // // //                   <img
// // // // // // // // // // // // // //                     src={course.thumbnail_url}
// // // // // // // // // // // // // //                     alt={course.title}
// // // // // // // // // // // // // //                     className="w-full h-full object-cover"
// // // // // // // // // // // // // //                   />
// // // // // // // // // // // // // //                 ) : (
// // // // // // // // // // // // // //                   <BookOpen size={16} className={isSelected ? "text-white" : "text-purple-500"} />
// // // // // // // // // // // // // //                 )}
// // // // // // // // // // // // // //               </div>
// // // // // // // // // // // // // //               <span className="font-bold text-sm max-w-[160px] truncate">
// // // // // // // // // // // // // //                 {course.title}
// // // // // // // // // // // // // //               </span>
// // // // // // // // // // // // // //             </button>
// // // // // // // // // // // // // //           );
// // // // // // // // // // // // // //         })}
// // // // // // // // // // // // // //       </div>

// // // // // // // // // // // // // //       {activeCourse && (
// // // // // // // // // // // // // //         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
// // // // // // // // // // // // // //           {/* Left Sidebar: Collapsible Phases & Lessons */}
// // // // // // // // // // // // // //           <div className="lg:col-span-4 space-y-4">
// // // // // // // // // // // // // //             {/* Active Course Thumbnail Card Header */}
// // // // // // // // // // // // // //             <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[28px] overflow-hidden shadow-xl p-5">
// // // // // // // // // // // // // //               <div className="relative h-36 rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
// // // // // // // // // // // // // //                 {activeCourse.thumbnail_url ? (
// // // // // // // // // // // // // //                   <img
// // // // // // // // // // // // // //                     src={activeCourse.thumbnail_url}
// // // // // // // // // // // // // //                     alt={activeCourse.title}
// // // // // // // // // // // // // //                     className="w-full h-full object-cover"
// // // // // // // // // // // // // //                   />
// // // // // // // // // // // // // //                 ) : (
// // // // // // // // // // // // // //                   <div className="text-center p-4">
// // // // // // // // // // // // // //                     <BookOpen size={36} className="text-white/80 mx-auto mb-1" />
// // // // // // // // // // // // // //                     <span className="text-xs font-bold text-white/70 uppercase tracking-widest">
// // // // // // // // // // // // // //                       Course Track
// // // // // // // // // // // // // //                     </span>
// // // // // // // // // // // // // //                   </div>
// // // // // // // // // // // // // //                 )}
// // // // // // // // // // // // // //                 <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
// // // // // // // // // // // // // //                 <h2 className="absolute bottom-3 left-4 right-4 font-black text-white text-lg line-clamp-1">
// // // // // // // // // // // // // //                   {activeCourse.title}
// // // // // // // // // // // // // //                 </h2>
// // // // // // // // // // // // // //               </div>

// // // // // // // // // // // // // //               <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 px-1">
// // // // // // // // // // // // // //                 <span className="flex items-center gap-1.5">
// // // // // // // // // // // // // //                   <Layers size={14} className="text-purple-500" />
// // // // // // // // // // // // // //                   {phases.length} Phases
// // // // // // // // // // // // // //                 </span>
// // // // // // // // // // // // // //                 <span className="flex items-center gap-1.5">
// // // // // // // // // // // // // //                   <CheckCircle2 size={14} className="text-emerald-500" />
// // // // // // // // // // // // // //                   {completedLessonIds.size} Lessons Done
// // // // // // // // // // // // // //                 </span>
// // // // // // // // // // // // // //               </div>
// // // // // // // // // // // // // //             </div>

// // // // // // // // // // // // // //             {/* Collapsible Syllabus Accordion */}
// // // // // // // // // // // // // //             <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[28px] p-4 shadow-xl space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto">
// // // // // // // // // // // // // //               <h3 className="text-base font-black px-2 text-gray-900 dark:text-white flex items-center gap-2">
// // // // // // // // // // // // // //                 Course Syllabus
// // // // // // // // // // // // // //               </h3>

// // // // // // // // // // // // // //               <div className="space-y-2">
// // // // // // // // // // // // // //                 {phases.map((phase) => {
// // // // // // // // // // // // // //                   const isOpen = !!openPhases[phase.id];
// // // // // // // // // // // // // //                   const phaseDone = isPhaseCompleted(phase);

// // // // // // // // // // // // // //                   return (
// // // // // // // // // // // // // //                     <div
// // // // // // // // // // // // // //                       key={phase.id}
// // // // // // // // // // // // // //                       className="border border-gray-200/80 dark:border-white/10 rounded-2xl overflow-hidden transition-all bg-gray-50/50 dark:bg-white/[0.02]"
// // // // // // // // // // // // // //                     >
// // // // // // // // // // // // // //                       {/* Phase Header (Clickable to Toggle Collapse) */}
// // // // // // // // // // // // // //                       <button
// // // // // // // // // // // // // //                         onClick={() => togglePhaseAccordion(phase.id)}
// // // // // // // // // // // // // //                         className="w-full text-left p-3.5 flex items-center justify-between hover:bg-purple-500/5 transition-colors"
// // // // // // // // // // // // // //                       >
// // // // // // // // // // // // // //                         <div className="flex items-center gap-2.5 pr-2">
// // // // // // // // // // // // // //                           {phaseDone ? (
// // // // // // // // // // // // // //                             <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
// // // // // // // // // // // // // //                           ) : (
// // // // // // // // // // // // // //                             <div className="w-4 h-4 rounded-full border-2 border-purple-500/40 shrink-0" />
// // // // // // // // // // // // // //                           )}
// // // // // // // // // // // // // //                           <div>
// // // // // // // // // // // // // //                             <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">
// // // // // // // // // // // // // //                               Phase {phase.phase_number}
// // // // // // // // // // // // // //                             </span>
// // // // // // // // // // // // // //                             <h4 className="font-bold text-xs md:text-sm text-gray-900 dark:text-white line-clamp-1">
// // // // // // // // // // // // // //                               {phase.title}
// // // // // // // // // // // // // //                             </h4>
// // // // // // // // // // // // // //                           </div>
// // // // // // // // // // // // // //                         </div>

// // // // // // // // // // // // // //                         {isOpen ? (
// // // // // // // // // // // // // //                           <ChevronDown size={16} className="text-gray-400 shrink-0" />
// // // // // // // // // // // // // //                         ) : (
// // // // // // // // // // // // // //                           <ChevronRight size={16} className="text-gray-400 shrink-0" />
// // // // // // // // // // // // // //                         )}
// // // // // // // // // // // // // //                       </button>

// // // // // // // // // // // // // //                       {/* Collapsible Lesson List */}
// // // // // // // // // // // // // //                       {isOpen && (
// // // // // // // // // // // // // //                         <div className="p-2 pt-0 space-y-1.5 border-t border-gray-200/50 dark:border-white/5">
// // // // // // // // // // // // // //                           {phase.course_lessons?.map((lesson) => {
// // // // // // // // // // // // // //                             const isSelected = selectedLesson?.id === lesson.id;
// // // // // // // // // // // // // //                             const isDone = completedLessonIds.has(lesson.id);

// // // // // // // // // // // // // //                             return (
// // // // // // // // // // // // // //                               <button
// // // // // // // // // // // // // //                                 key={lesson.id}
// // // // // // // // // // // // // //                                 onClick={() => setSelectedLesson(lesson)}
// // // // // // // // // // // // // //                                 className={`w-full text-left rounded-xl p-2.5 transition-all flex items-center justify-between border ${
// // // // // // // // // // // // // //                                   isSelected
// // // // // // // // // // // // // //                                     ? "bg-purple-600 text-white border-transparent shadow-md"
// // // // // // // // // // // // // //                                     : "bg-white dark:bg-white/[0.03] border-gray-200/60 dark:border-white/5 hover:border-purple-500/30"
// // // // // // // // // // // // // //                                 }`}
// // // // // // // // // // // // // //                               >
// // // // // // // // // // // // // //                                 <div className="flex items-center gap-2 min-w-0 pr-2">
// // // // // // // // // // // // // //                                   {isDone ? (
// // // // // // // // // // // // // //                                     <CheckCircle2
// // // // // // // // // // // // // //                                       size={15}
// // // // // // // // // // // // // //                                       className={isSelected ? "text-white" : "text-emerald-500"}
// // // // // // // // // // // // // //                                     />
// // // // // // // // // // // // // //                                   ) : (
// // // // // // // // // // // // // //                                     <Circle
// // // // // // // // // // // // // //                                       size={15}
// // // // // // // // // // // // // //                                       className={isSelected ? "text-white/70" : "text-gray-400"}
// // // // // // // // // // // // // //                                     />
// // // // // // // // // // // // // //                                   )}
// // // // // // // // // // // // // //                                   <span
// // // // // // // // // // // // // //                                     className={`text-xs font-bold truncate ${
// // // // // // // // // // // // // //                                       isSelected
// // // // // // // // // // // // // //                                         ? "text-white"
// // // // // // // // // // // // // //                                         : "text-gray-800 dark:text-gray-200"
// // // // // // // // // // // // // //                                     }`}
// // // // // // // // // // // // // //                                   >
// // // // // // // // // // // // // //                                     {lesson.title}
// // // // // // // // // // // // // //                                   </span>
// // // // // // // // // // // // // //                                 </div>
// // // // // // // // // // // // // //                                 <ChevronRight
// // // // // // // // // // // // // //                                   size={13}
// // // // // // // // // // // // // //                                   className={isSelected ? "text-white/80" : "text-gray-400"}
// // // // // // // // // // // // // //                                 />
// // // // // // // // // // // // // //                               </button>
// // // // // // // // // // // // // //                             );
// // // // // // // // // // // // // //                           })}
// // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // //                       )}
// // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // //                   );
// // // // // // // // // // // // // //                 })}
// // // // // // // // // // // // // //               </div>
// // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // //           </div>

// // // // // // // // // // // // // //           {/* Right Area: Clean Active Lesson View */}
// // // // // // // // // // // // // //           <div className="lg:col-span-8">
// // // // // // // // // // // // // //             <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[32px] p-6 md:p-8 shadow-xl">
// // // // // // // // // // // // // //               {selectedLesson ? (
// // // // // // // // // // // // // //                 <div>
// // // // // // // // // // // // // //                   <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
// // // // // // // // // // // // // //                     <div>
// // // // // // // // // // // // // //                       <span className="text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
// // // // // // // // // // // // // //                         Active Lesson
// // // // // // // // // // // // // //                       </span>
// // // // // // // // // // // // // //                       <h2 className="text-2xl md:text-3xl font-black mt-2 text-gray-900 dark:text-white">
// // // // // // // // // // // // // //                         {selectedLesson.title}
// // // // // // // // // // // // // //                       </h2>
// // // // // // // // // // // // // //                     </div>

// // // // // // // // // // // // // //                     <button
// // // // // // // // // // // // // //                       onClick={() => toggleLessonCompletion(selectedLesson.id)}
// // // // // // // // // // // // // //                       className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
// // // // // // // // // // // // // //                         completedLessonIds.has(selectedLesson.id)
// // // // // // // // // // // // // //                           ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20"
// // // // // // // // // // // // // //                           : "bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-500/20"
// // // // // // // // // // // // // //                       }`}
// // // // // // // // // // // // // //                     >
// // // // // // // // // // // // // //                       {completedLessonIds.has(selectedLesson.id) ? (
// // // // // // // // // // // // // //                         <>
// // // // // // // // // // // // // //                           <CheckCircle2 size={16} /> Completed
// // // // // // // // // // // // // //                         </>
// // // // // // // // // // // // // //                       ) : (
// // // // // // // // // // // // // //                         <>
// // // // // // // // // // // // // //                           <Circle size={16} /> Mark as Complete
// // // // // // // // // // // // // //                         </>
// // // // // // // // // // // // // //                       )}
// // // // // // // // // // // // // //                     </button>
// // // // // // // // // // // // // //                   </div>

// // // // // // // // // // // // // //                   {/* Lesson Content / Topics Rendering */}
// // // // // // // // // // // // // //                   <div className="border-t border-gray-100 dark:border-white/[0.08] pt-6 space-y-6">
// // // // // // // // // // // // // //                     {selectedLesson.course_topics && selectedLesson.course_topics.length > 0 ? (
// // // // // // // // // // // // // //                       selectedLesson.course_topics.map((topic) => (
// // // // // // // // // // // // // //                         <div key={topic.id} className="space-y-4">
// // // // // // // // // // // // // //                           {topic.intro && (
// // // // // // // // // // // // // //                             <h4 className="font-bold text-base text-purple-600 dark:text-purple-400 flex items-center gap-2">
// // // // // // // // // // // // // //                               <FileText size={18} />
// // // // // // // // // // // // // //                               {topic.intro}
// // // // // // // // // // // // // //                             </h4>
// // // // // // // // // // // // // //                           )}
// // // // // // // // // // // // // //                           {topic.topic_blocks?.map((block) => (
// // // // // // // // // // // // // //                             <div
// // // // // // // // // // // // // //                               key={block.id}
// // // // // // // // // // // // // //                               className="bg-gray-50/80 dark:bg-white/[0.02] p-4 md:p-5 rounded-2xl border border-gray-200/60 dark:border-white/5 space-y-3"
// // // // // // // // // // // // // //                             >
// // // // // // // // // // // // // //                               {block.type === "video" && block.video_path && (
// // // // // // // // // // // // // //                                 <div className="relative rounded-xl overflow-hidden aspect-video bg-black">
// // // // // // // // // // // // // //                                   <iframe
// // // // // // // // // // // // // //                                     src={block.video_path}
// // // // // // // // // // // // // //                                     title="Topic Video"
// // // // // // // // // // // // // //                                     className="w-full h-full border-0"
// // // // // // // // // // // // // //                                     allowFullScreen
// // // // // // // // // // // // // //                                   />
// // // // // // // // // // // // // //                                 </div>
// // // // // // // // // // // // // //                               )}
// // // // // // // // // // // // // //                               {block.content && (
// // // // // // // // // // // // // //                                 <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
// // // // // // // // // // // // // //                                   {block.content}
// // // // // // // // // // // // // //                                 </p>
// // // // // // // // // // // // // //                               )}
// // // // // // // // // // // // // //                             </div>
// // // // // // // // // // // // // //                           ))}
// // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // //                       ))
// // // // // // // // // // // // // //                     ) : (
// // // // // // // // // // // // // //                       <div className="text-center py-12 text-gray-400">
// // // // // // // // // // // // // //                         <p className="text-sm">No topic modules found for this lesson.</p>
// // // // // // // // // // // // // //                       </div>
// // // // // // // // // // // // // //                     )}
// // // // // // // // // // // // // //                   </div>
// // // // // // // // // // // // // //                 </div>
// // // // // // // // // // // // // //               ) : (
// // // // // // // // // // // // // //                 <div className="text-center py-20 text-gray-400">
// // // // // // // // // // // // // //                   <BookOpen size={48} className="mx-auto mb-4 opacity-40 text-purple-500" />
// // // // // // // // // // // // // //                   <p className="text-base font-bold text-gray-700 dark:text-gray-300">
// // // // // // // // // // // // // //                     Select a lesson from the syllabus sidebar to begin learning.
// // // // // // // // // // // // // //                   </p>
// // // // // // // // // // // // // //                 </div>
// // // // // // // // // // // // // //               )}
// // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // //           </div>
// // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // //       )}
// // // // // // // // // // // // // //     </div>
// // // // // // // // // // // // // //   );
// // // // // // // // // // // // // // }
// // // // // // // // // // // // // import React, { useEffect, useState } from "react";
// // // // // // // // // // // // // import {
// // // // // // // // // // // // //   BookOpen,
// // // // // // // // // // // // //   PlayCircle,
// // // // // // // // // // // // //   Clock,
// // // // // // // // // // // // //   ChevronRight,
// // // // // // // // // // // // //   Rocket,
// // // // // // // // // // // // //   CheckCircle2,
// // // // // // // // // // // // //   Circle,
// // // // // // // // // // // // //   Layers
// // // // // // // // // // // // // } from "lucide-react";
// // // // // // // // // // // // // import { supabase } from "../../../supabase";

// // // // // // // // // // // // // export default function StudentCoursesView({ userId, courseId }) {
// // // // // // // // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // // // // // // // //   const [courses, setCourses] = useState([]);
// // // // // // // // // // // // //   const [activeCourse, setActiveCourse] = useState(null);
  
// // // // // // // // // // // // //   // Structured Phase -> Lessons state
// // // // // // // // // // // // //   const [phases, setPhases] = useState([]);
// // // // // // // // // // // // //   const [selectedLesson, setSelectedLesson] = useState(null);
// // // // // // // // // // // // //   const [completedLessonIds, setCompletedLessonIds] = useState(new Set());

// // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // //     if (userId) {
// // // // // // // // // // // // //       fetchStudentCoursesData();
// // // // // // // // // // // // //     }
// // // // // // // // // // // // //   }, [userId, courseId]);

// // // // // // // // // // // // //   const fetchStudentCoursesData = async () => {
// // // // // // // // // // // // //     try {
// // // // // // // // // // // // //       setLoading(true);

// // // // // // // // // // // // //       // 1. Query student_enrollments to get registered courses
// // // // // // // // // // // // //       let enrollQuery = supabase
// // // // // // // // // // // // //         .from("student_enrollments")
// // // // // // // // // // // // //         .select(`
// // // // // // // // // // // // //           course_id,
// // // // // // // // // // // // //           courses (*)
// // // // // // // // // // // // //         `)
// // // // // // // // // // // // //         .eq("student_id", userId);

// // // // // // // // // // // // //       const { data: enrollmentData, error: enrollError } = await enrollQuery;
// // // // // // // // // // // // //       if (enrollError) throw enrollError;

// // // // // // // // // // // // //       const enrolledCourses = enrollmentData
// // // // // // // // // // // // //         ? enrollmentData.map((e) => e.courses).filter(Boolean)
// // // // // // // // // // // // //         : [];

// // // // // // // // // // // // //       setCourses(enrolledCourses);

// // // // // // // // // // // // //       // 2. Determine active course (either from prop or first enrolled course)
// // // // // // // // // // // // //       const defaultCourse =
// // // // // // // // // // // // //         enrolledCourses.find((c) => c.id === courseId) ||
// // // // // // // // // // // // //         enrolledCourses[0] ||
// // // // // // // // // // // // //         null;

// // // // // // // // // // // // //       setActiveCourse(defaultCourse);

// // // // // // // // // // // // //       if (defaultCourse) {
// // // // // // // // // // // // //         await Promise.all([
// // // // // // // // // // // // //           fetchCourseSyllabus(defaultCourse.id),
// // // // // // // // // // // // //           fetchLessonProgress()
// // // // // // // // // // // // //         ]);
// // // // // // // // // // // // //       }
// // // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // // //       console.error("Error fetching student data:", err.message);
// // // // // // // // // // // // //     } finally {
// // // // // // // // // // // // //       setLoading(false);
// // // // // // // // // // // // //     }
// // // // // // // // // // // // //   };

// // // // // // // // // // // // //   const fetchCourseSyllabus = async (targetCourseId) => {
// // // // // // // // // // // // //     try {
// // // // // // // // // // // // //       // Fetch Phases along with nested Lessons ordered by position
// // // // // // // // // // // // //       const { data: phaseData, error } = await supabase
// // // // // // // // // // // // //         .from("course_phases")
// // // // // // // // // // // // //         .select(`
// // // // // // // // // // // // //           id,
// // // // // // // // // // // // //           phase_number,
// // // // // // // // // // // // //           title,
// // // // // // // // // // // // //           focus,
// // // // // // // // // // // // //           course_lessons (
// // // // // // // // // // // // //             id,
// // // // // // // // // // // // //             title,
// // // // // // // // // // // // //             position,
// // // // // // // // // // // // //             created_at,
// // // // // // // // // // // // //             course_topics (
// // // // // // // // // // // // //               id,
// // // // // // // // // // // // //               intro,
// // // // // // // // // // // // //               topic_blocks ( id, type, content, video_path )
// // // // // // // // // // // // //             )
// // // // // // // // // // // // //           )
// // // // // // // // // // // // //         `)
// // // // // // // // // // // // //         .eq("course_id", targetCourseId)
// // // // // // // // // // // // //         .order("phase_number", { ascending: true });

// // // // // // // // // // // // //       if (error) throw error;

// // // // // // // // // // // // //       // Sort nested lessons by position
// // // // // // // // // // // // //       const structuredPhases = (phaseData || []).map((phase) => ({
// // // // // // // // // // // // //         ...phase,
// // // // // // // // // // // // //         course_lessons: (phase.course_lessons || []).sort(
// // // // // // // // // // // // //           (a, b) => (a.position || 0) - (b.position || 0)
// // // // // // // // // // // // //         )
// // // // // // // // // // // // //       }));

// // // // // // // // // // // // //       setPhases(structuredPhases);

// // // // // // // // // // // // //       // Set default selected lesson
// // // // // // // // // // // // //       const firstLesson = structuredPhases[0]?.course_lessons[0] || null;
// // // // // // // // // // // // //       setSelectedLesson(firstLesson);
// // // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // // //       console.error("Error fetching syllabus:", err.message);
// // // // // // // // // // // // //     }
// // // // // // // // // // // // //   };

// // // // // // // // // // // // //   const fetchLessonProgress = async () => {
// // // // // // // // // // // // //     try {
// // // // // // // // // // // // //       const { data: progressData, error } = await supabase
// // // // // // // // // // // // //         .from("student_lesson_progress")
// // // // // // // // // // // // //         .select("lesson_id, status")
// // // // // // // // // // // // //         .eq("student_id", userId)
// // // // // // // // // // // // //         .eq("status", "completed");

// // // // // // // // // // // // //       if (error) throw error;

// // // // // // // // // // // // //       const completedSet = new Set(progressData.map((p) => p.lesson_id));
// // // // // // // // // // // // //       setCompletedLessonIds(completedSet);
// // // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // // //       console.error("Error fetching progress:", err.message);
// // // // // // // // // // // // //     }
// // // // // // // // // // // // //   };

// // // // // // // // // // // // //   const toggleLessonCompletion = async (lessonId) => {
// // // // // // // // // // // // //     const isCompleted = completedLessonIds.has(lessonId);
// // // // // // // // // // // // //     const newStatus = isCompleted ? "in_progress" : "completed";

// // // // // // // // // // // // //     try {
// // // // // // // // // // // // //       const { error } = await supabase.from("student_lesson_progress").upsert(
// // // // // // // // // // // // //         {
// // // // // // // // // // // // //           student_id: userId,
// // // // // // // // // // // // //           lesson_id: lessonId,
// // // // // // // // // // // // //           status: newStatus,
// // // // // // // // // // // // //           completed_at: isCompleted ? null : new Date().toISOString()
// // // // // // // // // // // // //         },
// // // // // // // // // // // // //         { onConflict: "student_id,lesson_id" }
// // // // // // // // // // // // //       );

// // // // // // // // // // // // //       if (error) throw error;

// // // // // // // // // // // // //       setCompletedLessonIds((prev) => {
// // // // // // // // // // // // //         const next = new Set(prev);
// // // // // // // // // // // // //         if (isCompleted) next.delete(lessonId);
// // // // // // // // // // // // //         else next.add(lessonId);
// // // // // // // // // // // // //         return next;
// // // // // // // // // // // // //       });
// // // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // // //       console.error("Error toggling completion:", err.message);
// // // // // // // // // // // // //     }
// // // // // // // // // // // // //   };

// // // // // // // // // // // // //   const handleSelectCourse = (course) => {
// // // // // // // // // // // // //     setActiveCourse(course);
// // // // // // // // // // // // //     fetchCourseSyllabus(course.id);
// // // // // // // // // // // // //   };

// // // // // // // // // // // // //   if (loading) {
// // // // // // // // // // // // //     return (
// // // // // // // // // // // // //       <div className="min-h-[60vh] flex items-center justify-center">
// // // // // // // // // // // // //         <div className="bg-white/10 dark:bg-white/[0.04] backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[30px] p-8 text-center shadow-xl">
// // // // // // // // // // // // //           <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
// // // // // // // // // // // // //           <h2 className="text-gray-900 dark:text-white text-xl font-bold">
// // // // // // // // // // // // //             Loading Your Courses...
// // // // // // // // // // // // //           </h2>
// // // // // // // // // // // // //           <p className="text-gray-500 dark:text-gray-400 mt-2">
// // // // // // // // // // // // //             Fetching your personalized learning materials 🚀
// // // // // // // // // // // // //           </p>
// // // // // // // // // // // // //         </div>
// // // // // // // // // // // // //       </div>
// // // // // // // // // // // // //     );
// // // // // // // // // // // // //   }

// // // // // // // // // // // // //   return (
// // // // // // // // // // // // //     <div className="space-y-6 p-4 md:p-8 text-gray-900 dark:text-white max-w-7xl mx-auto">
// // // // // // // // // // // // //       {/* Header Banner */}
// // // // // // // // // // // // //       <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[32px] p-6 md:p-8 shadow-xl relative overflow-hidden">
// // // // // // // // // // // // //         <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 blur-[120px] pointer-events-none" />
// // // // // // // // // // // // //         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
// // // // // // // // // // // // //           <div>
// // // // // // // // // // // // //             <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-600 dark:text-purple-300 px-4 py-2 rounded-full text-xs font-black tracking-wider mb-3">
// // // // // // // // // // // // //               <BookOpen size={14} />
// // // // // // // // // // // // //               STUDENT LEARNING PORTAL
// // // // // // // // // // // // //             </div>
// // // // // // // // // // // // //             <h1 className="text-3xl md:text-4xl font-black tracking-tight">
// // // // // // // // // // // // //               My Enrolled Courses
// // // // // // // // // // // // //             </h1>
// // // // // // // // // // // // //             <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-xl text-sm md:text-base">
// // // // // // // // // // // // //               Access your registered curriculum, watch interactive video tutorials, and track your phase progression.
// // // // // // // // // // // // //             </p>
// // // // // // // // // // // // //           </div>
// // // // // // // // // // // // //           {activeCourse && (
// // // // // // // // // // // // //             <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-2xl flex items-center gap-3.5 shadow-lg shadow-purple-500/25 shrink-0">
// // // // // // // // // // // // //               <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
// // // // // // // // // // // // //                 <Rocket size={20} />
// // // // // // // // // // // // //               </div>
// // // // // // // // // // // // //               <div>
// // // // // // // // // // // // //                 <p className="text-[11px] text-white/80 font-bold uppercase tracking-wider">
// // // // // // // // // // // // //                   Current Track
// // // // // // // // // // // // //                 </p>
// // // // // // // // // // // // //                 <p className="font-black text-base">{activeCourse.title}</p>
// // // // // // // // // // // // //               </div>
// // // // // // // // // // // // //             </div>
// // // // // // // // // // // // //           )}
// // // // // // // // // // // // //         </div>
// // // // // // // // // // // // //       </div>

// // // // // // // // // // // // //       {/* Course Selection Grid */}
// // // // // // // // // // // // //       {courses.length === 0 ? (
// // // // // // // // // // // // //         <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-[32px] p-12 text-center shadow-lg">
// // // // // // // // // // // // //           <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
// // // // // // // // // // // // //             🎓
// // // // // // // // // // // // //           </div>
// // // // // // // // // // // // //           <h3 className="text-xl font-bold">No Registered Courses Found</h3>
// // // // // // // // // // // // //           <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto text-sm">
// // // // // // // // // // // // //             You are not currently enrolled in any active courses. Please contact your administrator.
// // // // // // // // // // // // //           </p>
// // // // // // // // // // // // //         </div>
// // // // // // // // // // // // //       ) : (
// // // // // // // // // // // // //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
// // // // // // // // // // // // //           {courses.map((course) => {
// // // // // // // // // // // // //             const isSelected = activeCourse?.id === course.id;
// // // // // // // // // // // // //             return (
// // // // // // // // // // // // //               <div
// // // // // // // // // // // // //                 key={course.id}
// // // // // // // // // // // // //                 onClick={() => handleSelectCourse(course)}
// // // // // // // // // // // // //                 className={`cursor-pointer rounded-[28px] overflow-hidden border transition-all duration-300 group flex flex-col p-5 ${
// // // // // // // // // // // // //                   isSelected
// // // // // // // // // // // // //                     ? "bg-white dark:bg-[#131b31] border-purple-500 shadow-xl shadow-purple-500/15 scale-[1.02]"
// // // // // // // // // // // // //                     : "bg-white dark:bg-white/[0.04] border-gray-200 dark:border-white/10 hover:border-purple-500/50 hover:shadow-lg"
// // // // // // // // // // // // //                 }`}
// // // // // // // // // // // // //               >
// // // // // // // // // // // // //                 <div className="flex items-center justify-between mb-3">
// // // // // // // // // // // // //                   <span className="text-xs px-3 py-1 rounded-full font-black bg-purple-500/10 text-purple-600 dark:text-purple-300">
// // // // // // // // // // // // //                     {course.duration_lessons || 0} Lessons
// // // // // // // // // // // // //                   </span>
// // // // // // // // // // // // //                   {isSelected && (
// // // // // // // // // // // // //                     <span className="text-[10px] bg-purple-600 text-white font-black px-2.5 py-0.5 rounded-full">
// // // // // // // // // // // // //                       Active
// // // // // // // // // // // // //                     </span>
// // // // // // // // // // // // //                   )}
// // // // // // // // // // // // //                 </div>
// // // // // // // // // // // // //                 <h3 className="font-black text-lg text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
// // // // // // // // // // // // //                   {course.title}
// // // // // // // // // // // // //                 </h3>
// // // // // // // // // // // // //                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2">
// // // // // // // // // // // // //                   {course.description || "Interactive structured learning track."}
// // // // // // // // // // // // //                 </p>
// // // // // // // // // // // // //               </div>
// // // // // // // // // // // // //             );
// // // // // // // // // // // // //           })}
// // // // // // // // // // // // //         </div>
// // // // // // // // // // // // //       )}

// // // // // // // // // // // // //       {/* Main Content Viewer and Phase Syllabus */}
// // // // // // // // // // // // //       {activeCourse && (
// // // // // // // // // // // // //         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
// // // // // // // // // // // // //           {/* Main Lesson View */}
// // // // // // // // // // // // //           <div className="lg:col-span-8 space-y-6">
// // // // // // // // // // // // //             <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[32px] p-6 md:p-8 shadow-xl">
// // // // // // // // // // // // //               {selectedLesson ? (
// // // // // // // // // // // // //                 <div>
// // // // // // // // // // // // //                   <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
// // // // // // // // // // // // //                     <div>
// // // // // // // // // // // // //                       <span className="text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
// // // // // // // // // // // // //                         Lesson Module
// // // // // // // // // // // // //                       </span>
// // // // // // // // // // // // //                       <h2 className="text-2xl md:text-3xl font-black mt-2">
// // // // // // // // // // // // //                         {selectedLesson.title}
// // // // // // // // // // // // //                       </h2>
// // // // // // // // // // // // //                     </div>

// // // // // // // // // // // // //                     <button
// // // // // // // // // // // // //                       onClick={() => toggleLessonCompletion(selectedLesson.id)}
// // // // // // // // // // // // //                       className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
// // // // // // // // // // // // //                         completedLessonIds.has(selectedLesson.id)
// // // // // // // // // // // // //                           ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
// // // // // // // // // // // // //                           : "bg-purple-600 text-white hover:bg-purple-700 shadow-md"
// // // // // // // // // // // // //                       }`}
// // // // // // // // // // // // //                     >
// // // // // // // // // // // // //                       {completedLessonIds.has(selectedLesson.id) ? (
// // // // // // // // // // // // //                         <>
// // // // // // // // // // // // //                           <CheckCircle2 size={16} /> Completed
// // // // // // // // // // // // //                         </>
// // // // // // // // // // // // //                       ) : (
// // // // // // // // // // // // //                         <>
// // // // // // // // // // // // //                           <Circle size={16} /> Mark as Complete
// // // // // // // // // // // // //                         </>
// // // // // // // // // // // // //                       )}
// // // // // // // // // // // // //                     </button>
// // // // // // // // // // // // //                   </div>

// // // // // // // // // // // // //                   {/* Rendering Topics inside Lesson */}
// // // // // // // // // // // // //                   <div className="border-t border-gray-100 dark:border-white/[0.08] pt-5 mt-5 space-y-6">
// // // // // // // // // // // // //                     {selectedLesson.course_topics && selectedLesson.course_topics.length > 0 ? (
// // // // // // // // // // // // //                       selectedLesson.course_topics.map((topic) => (
// // // // // // // // // // // // //                         <div key={topic.id} className="space-y-3">
// // // // // // // // // // // // //                           <h4 className="font-black text-lg">{topic.intro || "Topic Notes"}</h4>
// // // // // // // // // // // // //                           {topic.topic_blocks?.map((block) => (
// // // // // // // // // // // // //                             <div key={block.id} className="bg-gray-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-gray-100 dark:border-white/5">
// // // // // // // // // // // // //                               {block.type === "video" && block.video_path && (
// // // // // // // // // // // // //                                 <iframe
// // // // // // // // // // // // //                                   src={block.video_path}
// // // // // // // // // // // // //                                   title="Topic Video"
// // // // // // // // // // // // //                                   className="w-full h-64 rounded-xl mb-3"
// // // // // // // // // // // // //                                   allowFullScreen
// // // // // // // // // // // // //                                 />
// // // // // // // // // // // // //                               )}
// // // // // // // // // // // // //                               {block.content && (
// // // // // // // // // // // // //                                 <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
// // // // // // // // // // // // //                                   {block.content}
// // // // // // // // // // // // //                                 </p>
// // // // // // // // // // // // //                               )}
// // // // // // // // // // // // //                             </div>
// // // // // // // // // // // // //                           ))}
// // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // //                       ))
// // // // // // // // // // // // //                     ) : (
// // // // // // // // // // // // //                       <p className="text-gray-500 text-sm">No topics added to this lesson yet.</p>
// // // // // // // // // // // // //                     )}
// // // // // // // // // // // // //                   </div>
// // // // // // // // // // // // //                 </div>
// // // // // // // // // // // // //               ) : (
// // // // // // // // // // // // //                 <div className="text-center py-20 text-gray-400">
// // // // // // // // // // // // //                   <BookOpen size={48} className="mx-auto mb-4 opacity-40 text-purple-500" />
// // // // // // // // // // // // //                   <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
// // // // // // // // // // // // //                     Select a lesson from a phase to start learning.
// // // // // // // // // // // // //                   </p>
// // // // // // // // // // // // //                 </div>
// // // // // // // // // // // // //               )}
// // // // // // // // // // // // //             </div>
// // // // // // // // // // // // //           </div>

// // // // // // // // // // // // //           {/* Phase & Lesson Accordion Sidebar */}
// // // // // // // // // // // // //           <div className="lg:col-span-4 space-y-6">
// // // // // // // // // // // // //             <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[32px] p-6 shadow-xl sticky top-6">
// // // // // // // // // // // // //               <h3 className="text-xl font-black mb-5 flex items-center gap-2">
// // // // // // // // // // // // //                 <Layers className="text-purple-500" size={20} /> Course Phases
// // // // // // // // // // // // //               </h3>

// // // // // // // // // // // // //               <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
// // // // // // // // // // // // //                 {phases.map((phase) => (
// // // // // // // // // // // // //                   <div key={phase.id} className="space-y-2">
// // // // // // // // // // // // //                     <div className="bg-purple-500/5 p-3 rounded-xl border border-purple-500/10">
// // // // // // // // // // // // //                       <p className="text-xs font-black text-purple-500 uppercase tracking-wider">
// // // // // // // // // // // // //                         Phase {phase.phase_number}
// // // // // // // // // // // // //                       </p>
// // // // // // // // // // // // //                       <h4 className="font-bold text-sm text-gray-900 dark:text-white">
// // // // // // // // // // // // //                         {phase.title}
// // // // // // // // // // // // //                       </h4>
// // // // // // // // // // // // //                     </div>

// // // // // // // // // // // // //                     <div className="pl-2 space-y-1.5">
// // // // // // // // // // // // //                       {phase.course_lessons?.map((lesson) => {
// // // // // // // // // // // // //                         const isSelected = selectedLesson?.id === lesson.id;
// // // // // // // // // // // // //                         const isDone = completedLessonIds.has(lesson.id);

// // // // // // // // // // // // //                         return (
// // // // // // // // // // // // //                           <div
// // // // // // // // // // // // //                             key={lesson.id}
// // // // // // // // // // // // //                             onClick={() => setSelectedLesson(lesson)}
// // // // // // // // // // // // //                             className={`cursor-pointer rounded-xl p-3 transition-all flex items-center justify-between border ${
// // // // // // // // // // // // //                               isSelected
// // // // // // // // // // // // //                                 ? "bg-purple-600 text-white border-transparent shadow-md"
// // // // // // // // // // // // //                                 : "bg-gray-50/80 dark:bg-white/[0.02] border-gray-200/80 dark:border-white/[0.06] hover:bg-gray-100"
// // // // // // // // // // // // //                             }`}
// // // // // // // // // // // // //                           >
// // // // // // // // // // // // //                             <div className="flex items-center gap-2.5">
// // // // // // // // // // // // //                               {isDone ? (
// // // // // // // // // // // // //                                 <CheckCircle2 size={16} className={isSelected ? "text-white" : "text-emerald-500"} />
// // // // // // // // // // // // //                               ) : (
// // // // // // // // // // // // //                                 <Circle size={16} className={isSelected ? "text-white" : "text-gray-400"} />
// // // // // // // // // // // // //                               )}
// // // // // // // // // // // // //                               <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-gray-800 dark:text-gray-200"}`}>
// // // // // // // // // // // // //                                 {lesson.title}
// // // // // // // // // // // // //                               </span>
// // // // // // // // // // // // //                             </div>
// // // // // // // // // // // // //                             <ChevronRight size={14} className={isSelected ? "text-white" : "text-gray-400"} />
// // // // // // // // // // // // //                           </div>
// // // // // // // // // // // // //                         );
// // // // // // // // // // // // //                       })}
// // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // //                   </div>
// // // // // // // // // // // // //                 ))}
// // // // // // // // // // // // //               </div>
// // // // // // // // // // // // //             </div>
// // // // // // // // // // // // //           </div>
// // // // // // // // // // // // //         </div>
// // // // // // // // // // // // //       )}
// // // // // // // // // // // // //     </div>
// // // // // // // // // // // // //   );
// // // // // // // // // // // // // }
// // // // // // // // // // // // // // import React, { useEffect, useState } from "react";
// // // // // // // // // // // // // // import {
// // // // // // // // // // // // // //   BookOpen,
// // // // // // // // // // // // // //   PlayCircle,
// // // // // // // // // // // // // //   Clock,
// // // // // // // // // // // // // //   ChevronRight,
// // // // // // // // // // // // // //   Rocket,
// // // // // // // // // // // // // //   CheckCircle2,
// // // // // // // // // // // // // // } from "lucide-react";
// // // // // // // // // // // // // // import { supabase } from "../../../supabase";

// // // // // // // // // // // // // // export default function StudentCoursesView({ userId, courseId }) {
// // // // // // // // // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // // // // // // // // //   const [courses, setCourses] = useState([]);
// // // // // // // // // // // // // //   const [activeCourse, setActiveCourse] = useState(null);
// // // // // // // // // // // // // //   const [lessons, setLessons] = useState([]);
// // // // // // // // // // // // // //   const [selectedLesson, setSelectedLesson] = useState(null);

// // // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // // //     if (userId) {
// // // // // // // // // // // // // //       fetchStudentCoursesData();
// // // // // // // // // // // // // //     }
// // // // // // // // // // // // // //   }, [userId, courseId]);

// // // // // // // // // // // // // //   const fetchStudentCoursesData = async () => {
// // // // // // // // // // // // // //     try {
// // // // // // // // // // // // // //       setLoading(true);

// // // // // // // // // // // // // //       // 1. Fetch user record to check `assigned_course_id`
// // // // // // // // // // // // // //       let targetCourseId = courseId;
// // // // // // // // // // // // // //       if (!targetCourseId) {
// // // // // // // // // // // // // //         const { data: userData, error: userError } = await supabase
// // // // // // // // // // // // // //           .from("users")
// // // // // // // // // // // // // //           .select("assigned_course_id")
// // // // // // // // // // // // // //           .eq("id", userId)
// // // // // // // // // // // // // //           .single();

// // // // // // // // // // // // // //         if (!userError && userData) {
// // // // // // // // // // // // // //           targetCourseId = userData.assigned_course_id;
// // // // // // // // // // // // // //         }
// // // // // // // // // // // // // //       }

// // // // // // // // // // // // // //       // 2. Fetch all courses (or filter specifically to the assigned one if they should only see theirs)
// // // // // // // // // // // // // //       // Here we fetch all so we can find the assigned one, or you can filter directly by .eq('id', targetCourseId)
// // // // // // // // // // // // // //       const { data: coursesData, error: coursesError } = await supabase
// // // // // // // // // // // // // //         .from("courses")
// // // // // // // // // // // // // //         .select("*");

// // // // // // // // // // // // // //       if (coursesError) throw coursesError;

// // // // // // // // // // // // // //       // Filter courses so the student only sees the course they are registered for
// // // // // // // // // // // // // //       // (Falls back to all courses if none assigned, or change to show none if strict)
// // // // // // // // // // // // // //       const registeredCourses = targetCourseId
// // // // // // // // // // // // // //         ? (coursesData || []).filter((c) => c.id === targetCourseId)
// // // // // // // // // // // // // //         : (coursesData || []);

// // // // // // // // // // // // // //       setCourses(registeredCourses);

// // // // // // // // // // // // // //       // Select active course
// // // // // // // // // // // // // //       const defaultCourse = 
// // // // // // // // // // // // // //         registeredCourses.find((c) => c.id === targetCourseId) || 
// // // // // // // // // // // // // //         registeredCourses[0] || 
// // // // // // // // // // // // // //         null;

// // // // // // // // // // // // // //       setActiveCourse(defaultCourse);

// // // // // // // // // // // // // //       if (defaultCourse) {
// // // // // // // // // // // // // //         await fetchLessons(defaultCourse.id);
// // // // // // // // // // // // // //       }
// // // // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // // // //       console.error("Error fetching courses:", err.message);
// // // // // // // // // // // // // //     } finally {
// // // // // // // // // // // // // //       setLoading(false);
// // // // // // // // // // // // // //     }
// // // // // // // // // // // // // //   };

// // // // // // // // // // // // // //   const fetchLessons = async (targetCourseId) => {
// // // // // // // // // // // // // //     try {
// // // // // // // // // // // // // //       const { data: lessonsData, error } = await supabase
// // // // // // // // // // // // // //         .from("lessons")
// // // // // // // // // // // // // //         .select("*")
// // // // // // // // // // // // // //         .eq("course_id", targetCourseId)
// // // // // // // // // // // // // //         .order("created_at", { ascending: true });

// // // // // // // // // // // // // //       if (error) throw error;
// // // // // // // // // // // // // //       setLessons(lessonsData || []);
// // // // // // // // // // // // // //       if (lessonsData && lessonsData.length > 0) {
// // // // // // // // // // // // // //         setSelectedLesson(lessonsData[0]);
// // // // // // // // // // // // // //       } else {
// // // // // // // // // // // // // //         setSelectedLesson(null);
// // // // // // // // // // // // // //       }
// // // // // // // // // // // // // //     } catch (err) {
// // // // // // // // // // // // // //       console.error("Error fetching lessons:", err.message);
// // // // // // // // // // // // // //     }
// // // // // // // // // // // // // //   };

// // // // // // // // // // // // // //   const handleSelectCourse = (course) => {
// // // // // // // // // // // // // //     setActiveCourse(course);
// // // // // // // // // // // // // //     fetchLessons(course.id);
// // // // // // // // // // // // // //   };

// // // // // // // // // // // // // //   if (loading) {
// // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // //       <div className="min-h-[60vh] flex items-center justify-center">
// // // // // // // // // // // // // //         <div className="bg-white/10 dark:bg-white/[0.04] backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[30px] p-8 text-center shadow-xl">
// // // // // // // // // // // // // //           <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
// // // // // // // // // // // // // //           <h2 className="text-gray-900 dark:text-white text-xl font-bold">Loading Your Courses...</h2>
// // // // // // // // // // // // // //           <p className="text-gray-500 dark:text-gray-400 mt-2">Fetching your personalized learning materials 🚀</p>
// // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // //       </div>
// // // // // // // // // // // // // //     );
// // // // // // // // // // // // // //   }

// // // // // // // // // // // // // //   return (
// // // // // // // // // // // // // //     <div className="space-y-6 p-4 md:p-8 text-gray-900 dark:text-white max-w-7xl mx-auto">
// // // // // // // // // // // // // //       {/* Header Banner */}
// // // // // // // // // // // // // //       <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[32px] p-6 md:p-8 shadow-xl relative overflow-hidden">
// // // // // // // // // // // // // //         <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 blur-[120px] pointer-events-none" />
// // // // // // // // // // // // // //         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
// // // // // // // // // // // // // //           <div>
// // // // // // // // // // // // // //             <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-600 dark:text-purple-300 px-4 py-2 rounded-full text-xs font-black tracking-wider mb-3">
// // // // // // // // // // // // // //               <BookOpen size={14} />
// // // // // // // // // // // // // //               STUDENT LEARNING PORTAL
// // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // //             <h1 className="text-3xl md:text-4xl font-black tracking-tight">My Enrolled Courses</h1>
// // // // // // // // // // // // // //             <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-xl text-sm md:text-base">
// // // // // // // // // // // // // //               Access your registered curriculum, watch interactive video tutorials, and track your module progress.
// // // // // // // // // // // // // //             </p>
// // // // // // // // // // // // // //           </div>
// // // // // // // // // // // // // //           {activeCourse && (
// // // // // // // // // // // // // //             <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-2xl flex items-center gap-3.5 shadow-lg shadow-purple-500/25 shrink-0">
// // // // // // // // // // // // // //               <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
// // // // // // // // // // // // // //                 <Rocket size={20} />
// // // // // // // // // // // // // //               </div>
// // // // // // // // // // // // // //               <div>
// // // // // // // // // // // // // //                 <p className="text-[11px] text-white/80 font-bold uppercase tracking-wider">Current Track</p>
// // // // // // // // // // // // // //                 <p className="font-black text-base">{activeCourse.title}</p>
// // // // // // // // // // // // // //               </div>
// // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // //           )}
// // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // //       </div>

// // // // // // // // // // // // // //       {/* Enrolled Courses Grid with Premium Thumbnails */}
// // // // // // // // // // // // // //       {courses.length === 0 ? (
// // // // // // // // // // // // // //         <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-[32px] p-12 text-center shadow-lg">
// // // // // // // // // // // // // //           <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
// // // // // // // // // // // // // //             🎓
// // // // // // // // // // // // // //           </div>
// // // // // // // // // // // // // //           <h3 className="text-xl font-bold">No Registered Courses Found</h3>
// // // // // // // // // // // // // //           <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto text-sm">
// // // // // // // // // // // // // //             You are not currently assigned to any active course. Please contact your tutor or administrator to assign a course package.
// // // // // // // // // // // // // //           </p>
// // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // //       ) : (
// // // // // // // // // // // // // //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
// // // // // // // // // // // // // //           {courses.map((course) => {
// // // // // // // // // // // // // //             const isSelected = activeCourse?.id === course.id;
// // // // // // // // // // // // // //             // Fallback default high-quality thumbnail if none provided in DB
// // // // // // // // // // // // // //             const thumbnailImage = course.thumbnail_url || course.image_url || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80";

// // // // // // // // // // // // // //             return (
// // // // // // // // // // // // // //               <div
// // // // // // // // // // // // // //                 key={course.id}
// // // // // // // // // // // // // //                 onClick={() => handleSelectCourse(course)}
// // // // // // // // // // // // // //                 className={`cursor-pointer rounded-[28px] overflow-hidden border transition-all duration-300 group flex flex-col ${
// // // // // // // // // // // // // //                   isSelected
// // // // // // // // // // // // // //                     ? "bg-white dark:bg-[#131b31] border-purple-500 shadow-xl shadow-purple-500/15 scale-[1.02]"
// // // // // // // // // // // // // //                     : "bg-white dark:bg-white/[0.04] border-gray-200 dark:border-white/10 hover:border-purple-500/50 hover:shadow-lg"
// // // // // // // // // // // // // //                 }`}
// // // // // // // // // // // // // //               >
// // // // // // // // // // // // // //                 {/* Course Thumbnail Image */}
// // // // // // // // // // // // // //                 <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
// // // // // // // // // // // // // //                   <img
// // // // // // // // // // // // // //                     src={thumbnailImage}
// // // // // // // // // // // // // //                     alt={course.title}
// // // // // // // // // // // // // //                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
// // // // // // // // // // // // // //                   />
// // // // // // // // // // // // // //                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                  
// // // // // // // // // // // // // //                   {/* Active / Enrolled Badge */}
// // // // // // // // // // // // // //                   <div className="absolute top-3 right-3">
// // // // // // // // // // // // // //                     <span className={`text-xs px-3 py-1 rounded-full font-black backdrop-blur-md shadow-md ${
// // // // // // // // // // // // // //                       isSelected 
// // // // // // // // // // // // // //                         ? "bg-purple-600 text-white" 
// // // // // // // // // // // // // //                         : "bg-black/50 text-white border border-white/20"
// // // // // // // // // // // // // //                     }`}>
// // // // // // // // // // // // // //                       {isSelected ? "Active Track" : "Enrolled"}
// // // // // // // // // // // // // //                     </span>
// // // // // // // // // // // // // //                   </div>

// // // // // // // // // // // // // //                   {/* Course Emoji/Icon Indicator */}
// // // // // // // // // // // // // //                   <div className="absolute bottom-3 left-4 flex items-center gap-2">
// // // // // // // // // // // // // //                     <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-sm font-bold border border-white/20">
// // // // // // // // // // // // // //                       {course.icon || "💻"}
// // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // //                   </div>
// // // // // // // // // // // // // //                 </div>

// // // // // // // // // // // // // //                 {/* Course Card Body */}
// // // // // // // // // // // // // //                 <div className="p-5 flex-1 flex flex-col justify-between">
// // // // // // // // // // // // // //                   <div>
// // // // // // // // // // // // // //                     <h3 className="font-black text-lg text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
// // // // // // // // // // // // // //                       {course.title}
// // // // // // // // // // // // // //                     </h3>
// // // // // // // // // // // // // //                     <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
// // // // // // // // // // // // // //                       {course.description || "Master core concepts through structured hands-on modules and interactive sessions."}
// // // // // // // // // // // // // //                     </p>
// // // // // // // // // // // // // //                   </div>
                  
// // // // // // // // // // // // // //                   <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/[0.08] flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
// // // // // // // // // // // // // //                     <span>Explore Syllabus</span>
// // // // // // // // // // // // // //                     <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
// // // // // // // // // // // // // //                   </div>
// // // // // // // // // // // // // //                 </div>
// // // // // // // // // // // // // //               </div>
// // // // // // // // // // // // // //             );
// // // // // // // // // // // // // //           })}
// // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // //       )}

// // // // // // // // // // // // // //       {/* Main Course Content Viewer & Syllabus */}
// // // // // // // // // // // // // //       {activeCourse && (
// // // // // // // // // // // // // //         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
// // // // // // // // // // // // // //           {/* Lesson Video / Content Area */}
// // // // // // // // // // // // // //           <div className="lg:col-span-8 space-y-6">
// // // // // // // // // // // // // //             <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[32px] p-6 md:p-8 shadow-xl">
// // // // // // // // // // // // // //               {selectedLesson ? (
// // // // // // // // // // // // // //                 <div>
// // // // // // // // // // // // // //                   <div className="h-64 sm:h-80 md:h-96 rounded-[24px] bg-gradient-to-br from-purple-900/40 via-indigo-900/40 to-black border border-white/10 flex flex-col items-center justify-center relative overflow-hidden mb-6 shadow-inner">
// // // // // // // // // // // // // //                     {selectedLesson.video_url ? (
// // // // // // // // // // // // // //                       <iframe
// // // // // // // // // // // // // //                         src={selectedLesson.video_url}
// // // // // // // // // // // // // //                         title={selectedLesson.title}
// // // // // // // // // // // // // //                         className="w-full h-full rounded-[24px]"
// // // // // // // // // // // // // //                         allowFullScreen
// // // // // // // // // // // // // //                       />
// // // // // // // // // // // // // //                     ) : (
// // // // // // // // // // // // // //                       <>
// // // // // // // // // // // // // //                         <div className="absolute inset-0 bg-purple-600/10 blur-3xl" />
// // // // // // // // // // // // // //                         <div className="w-20 h-20 rounded-full bg-purple-600/20 backdrop-blur-md flex items-center justify-center text-purple-400 mb-3 border border-purple-500/30 shadow-lg relative z-10 animate-pulse">
// // // // // // // // // // // // // //                           <PlayCircle size={36} />
// // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // //                         <p className="text-white font-bold text-lg relative z-10">Interactive Lesson Ready</p>
// // // // // // // // // // // // // //                         <p className="text-gray-400 text-xs mt-1 relative z-10">Follow along with your assigned tutor code exercises.</p>
// // // // // // // // // // // // // //                       </>
// // // // // // // // // // // // // //                     )}
// // // // // // // // // // // // // //                   </div>

// // // // // // // // // // // // // //                   <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
// // // // // // // // // // // // // //                     <div>
// // // // // // // // // // // // // //                       <span className="text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
// // // // // // // // // // // // // //                         Current Module
// // // // // // // // // // // // // //                       </span>
// // // // // // // // // // // // // //                       <h2 className="text-2xl md:text-3xl font-black mt-2">{selectedLesson.title}</h2>
// // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // //                     <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm bg-gray-100 dark:bg-white/[0.06] px-3.5 py-1.5 rounded-xl font-medium">
// // // // // // // // // // // // // //                       <Clock size={16} className="text-purple-500" />
// // // // // // // // // // // // // //                       <span>{selectedLesson.duration || "45 mins"}</span>
// // // // // // // // // // // // // //                     </div>
// // // // // // // // // // // // // //                   </div>

// // // // // // // // // // // // // //                   <div className="border-t border-gray-100 dark:border-white/[0.08] pt-5 mt-5">
// // // // // // // // // // // // // //                     <h4 className="font-black text-lg mb-2">Lesson Overview & Instructions</h4>
// // // // // // // // // // // // // //                     <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base">
// // // // // // // // // // // // // //                       {selectedLesson.content || selectedLesson.description || "No description provided for this module yet. Follow along with your tutor during live sessions and complete your assignments."}
// // // // // // // // // // // // // //                     </p>
// // // // // // // // // // // // // //                   </div>
// // // // // // // // // // // // // //                 </div>
// // // // // // // // // // // // // //               ) : (
// // // // // // // // // // // // // //                 <div className="text-center py-20 text-gray-400">
// // // // // // // // // // // // // //                   <BookOpen size={48} className="mx-auto mb-4 opacity-40 text-purple-500" />
// // // // // // // // // // // // // //                   <p className="text-lg font-bold text-gray-700 dark:text-gray-300">Select a lesson from the syllabus to start learning.</p>
// // // // // // // // // // // // // //                 </div>
// // // // // // // // // // // // // //               )}
// // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // //           </div>

// // // // // // // // // // // // // //           {/* Syllabus / Lesson Checklist Sidebar */}
// // // // // // // // // // // // // //           <div className="lg:col-span-4 space-y-6">
// // // // // // // // // // // // // //             <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[32px] p-6 shadow-xl sticky top-6">
// // // // // // // // // // // // // //               <div className="flex items-center justify-between mb-5">
// // // // // // // // // // // // // //                 <h3 className="text-xl font-black">Course Syllabus</h3>
// // // // // // // // // // // // // //                 <span className="text-xs bg-purple-500/10 text-purple-600 dark:text-purple-300 font-black px-3 py-1 rounded-full">
// // // // // // // // // // // // // //                   {lessons.length} Modules
// // // // // // // // // // // // // //                 </span>
// // // // // // // // // // // // // //               </div>

// // // // // // // // // // // // // //               <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
// // // // // // // // // // // // // //                 {lessons.length > 0 ? (
// // // // // // // // // // // // // //                   lessons.map((lesson, index) => {
// // // // // // // // // // // // // //                     const isSelected = selectedLesson?.id === lesson.id;
// // // // // // // // // // // // // //                     return (
// // // // // // // // // // // // // //                       <div
// // // // // // // // // // // // // //                         key={lesson.id}
// // // // // // // // // // // // // //                         onClick={() => setSelectedLesson(lesson)}
// // // // // // // // // // // // // //                         className={`cursor-pointer rounded-2xl p-4 transition-all flex items-center justify-between border ${
// // // // // // // // // // // // // //                           isSelected
// // // // // // // // // // // // // //                             ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent shadow-lg shadow-purple-500/25 scale-[1.02]"
// // // // // // // // // // // // // //                             : "bg-gray-50/80 dark:bg-white/[0.02] border-gray-200/80 dark:border-white/[0.06] hover:bg-gray-100 dark:hover:bg-white/[0.06]"
// // // // // // // // // // // // // //                         }`}
// // // // // // // // // // // // // //                       >
// // // // // // // // // // // // // //                         <div className="flex items-center gap-3.5">
// // // // // // // // // // // // // //                           <div
// // // // // // // // // // // // // //                             className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
// // // // // // // // // // // // // //                               isSelected ? "bg-white text-purple-600" : "bg-purple-500/10 text-purple-500"
// // // // // // // // // // // // // //                             }`}
// // // // // // // // // // // // // //                           >
// // // // // // // // // // // // // //                             {index + 1}
// // // // // // // // // // // // // //                           </div>
// // // // // // // // // // // // // //                           <div>
// // // // // // // // // // // // // //                             <p className={`font-bold text-sm line-clamp-1 ${isSelected ? "text-white" : "text-gray-800 dark:text-white"}`}>
// // // // // // // // // // // // // //                               {lesson.title}
// // // // // // // // // // // // // //                             </p>
// // // // // // // // // // // // // //                             <p className={`text-xs font-medium mt-0.5 ${isSelected ? "text-white/80" : "text-gray-400"}`}>
// // // // // // // // // // // // // //                               {lesson.duration || "Module Session"}
// // // // // // // // // // // // // //                             </p>
// // // // // // // // // // // // // //                           </div>
// // // // // // // // // // // // // //                         </div>
// // // // // // // // // // // // // //                         <ChevronRight size={16} className={`shrink-0 ${isSelected ? "text-white" : "text-gray-400"}`} />
// // // // // // // // // // // // // //                       </div>
// // // // // // // // // // // // // //                     );
// // // // // // // // // // // // // //                   })
// // // // // // // // // // // // // //                 ) : (
// // // // // // // // // // // // // //                   <div className="text-center py-12 text-gray-400 text-sm">
// // // // // // // // // // // // // //                     No lessons found for this active track yet.
// // // // // // // // // // // // // //                   </div>
// // // // // // // // // // // // // //                 )}
// // // // // // // // // // // // // //               </div>
// // // // // // // // // // // // // //             </div>
// // // // // // // // // // // // // //           </div>
// // // // // // // // // // // // // //         </div>
// // // // // // // // // // // // // //       )}
// // // // // // // // // // // // // //     </div>
// // // // // // // // // // // // // //   );
// // // // // // // // // // // // // // }