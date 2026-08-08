import React, { useState, useEffect } from "react";
import { BookOpen, Search, FileText, User, CheckCircle2, AlertCircle, Unlock, Lock, ChevronDown, ChevronUp, HelpCircle, ExternalLink, ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { supabase } from "../../../supabase";
import toast from "react-hot-toast";

export default function TutorStudentsView({ userId }) {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Multi-course support state
  const [studentCourses, setStudentCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const [studentPhases, setStudentPhases] = useState([]);
  const [studentAttempts, setStudentAttempts] = useState([]);
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [unlockingLessonId, setUnlockingLessonId] = useState(null);
  
  // Sidebar collapsed state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Track collapsed state per phase (auto-collapsed if complete)
  const [collapsedPhases, setCollapsedPhases] = useState({});
  
  // Track expanded lesson details inline view for notes & quizzes
  const [expandedLessonId, setExpandedLessonId] = useState(null);
  const [lessonContentMap, setLessonContentMap] = useState({});

  useEffect(() => {
    const fetchAssignedStudents = async () => {
      if (!userId) return;
      setLoadingStudents(true);
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("assigned_tutor_id", userId)
          .eq("role", "student");

        if (error) throw error;
        setStudents(data || []);
        if (data && data.length > 0) {
          setSelectedStudent(data[0]);
        }
      } catch (err) {
        console.error("Error fetching assigned students:", err);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchAssignedStudents();
  }, [userId]);

  // Fetch student's enrolled courses when selectedStudent changes
  useEffect(() => {
    const fetchStudentCourses = async () => {
      if (!selectedStudent?.id) {
        setStudentCourses([]);
        setSelectedCourseId("");
        return;
      }

      try {
        // 1. Fetch from student_enrollments
        const { data: enrollments, error } = await supabase
          .from("student_enrollments")
          .select("course_id, courses(id, title, thumbnail_url)")
          .eq("student_id", selectedStudent.id);

        if (error) throw error;

        let enrolledCourses = (enrollments || []).map((e) => e.courses).filter(Boolean);

        // 2. Fallback to assigned_course_id if enrollments are empty
        if (enrolledCourses.length === 0 && selectedStudent.assigned_course_id) {
          const { data: courseData } = await supabase
            .from("courses")
            .select("id, title, thumbnail_url")
            .eq("id", selectedStudent.assigned_course_id)
            .maybeSingle();

          if (courseData) {
            enrolledCourses = [courseData];
          }
        }

        setStudentCourses(enrolledCourses);
        if (enrolledCourses.length > 0) {
          setSelectedCourseId(enrolledCourses[0].id);
        } else {
          setSelectedCourseId("");
          setStudentPhases([]);
        }
      } catch (err) {
        console.error("Error loading student courses:", err);
        setStudentCourses([]);
        setSelectedCourseId("");
      }
    };

    fetchStudentCourses();
  }, [selectedStudent]);

  // Fetch academic data (progress, syllabus, quiz attempts) when selectedStudent or selectedCourseId changes
  useEffect(() => {
    const fetchStudentAcademicData = async () => {
      if (!selectedStudent?.id || !selectedCourseId) {
        setStudentPhases([]);
        return;
      }

      setLoadingData(true);
      setExpandedLessonId(null);
      try {
        const { data: progressData } = await supabase
          .from("student_lesson_progress")
          .select("lesson_id, status")
          .eq("student_id", selectedStudent.id)
          .eq("status", "completed");

        const completedSet = new Set((progressData || []).map((p) => p.lesson_id));
        setCompletedLessonIds(completedSet);

        const { data: phaseData } = await supabase
          .from("course_phases")
          .select(`
            id,
            phase_number,
            title,
            focus,
            course_lessons (
              id,
              title,
              position
            )
          `)
          .eq("course_id", selectedCourseId)
          .order("phase_number", { ascending: true });

        const { data: quizzesData } = await supabase
          .from("quizzes")
          .select("id, title, passing_score, lesson_id")
          .eq("course_id", selectedCourseId);

        const enrichedPhases = (phaseData || []).map((phase) => ({
          ...phase,
          course_lessons: (phase.course_lessons || []).map((lesson) => ({
            ...lesson,
            quiz: (quizzesData || []).find((q) => q.lesson_id === lesson.id) || null
          }))
        }));

        setStudentPhases(enrichedPhases);

        const initialCollapseState = {};
        enrichedPhases.forEach((phase) => {
          const lessons = phase.course_lessons || [];
          const allComplete = lessons.length > 0 && lessons.every((l) => completedSet.has(l.id));
          initialCollapseState[phase.id] = allComplete;
        });
        setCollapsedPhases(initialCollapseState);

        const { data: attemptsData } = await supabase
          .from("student_quiz_attempts")
          .select("*")
          .eq("student_id", selectedStudent.id)
          .order("completed_at", { ascending: false });

        setStudentAttempts(attemptsData || []);
      } catch (err) {
        console.error("Error fetching student academic data:", err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchStudentAcademicData();
  }, [selectedStudent, selectedCourseId]);

  const handleLessonClick = async (lessonId, isUnlocked) => {
    if (!isUnlocked) {
      toast.error("Lesson is locked. Unlock it first to inspect content.");
      return;
    }

    if (expandedLessonId === lessonId) {
      setExpandedLessonId(null);
      return;
    }

    setExpandedLessonId(lessonId);

    if (lessonContentMap[lessonId]) return;

    try {
      const { data: notesData } = await supabase
        .from("notes")
        .select("*")
        .eq("lesson_id", lessonId)
        .maybeSingle();

      const { data: quizData } = await supabase
        .from("quizzes")
        .select("id, title, passing_score")
        .eq("lesson_id", lessonId)
        .maybeSingle();

      let questions = [];
      if (quizData?.id) {
        const { data: qData } = await supabase
          .from("quiz_questions")
          .select("*")
          .eq("quiz_id", quizData.id)
          .order("position", { ascending: true });
        questions = qData || [];
      }

      setLessonContentMap((prev) => ({
        ...prev,
        [lessonId]: {
          notes: notesData || null,
          quiz: quizData || null,
          questions: questions
        }
      }));
    } catch (err) {
      console.error("Error loading lesson details:", err);
      toast.error("Failed to load lesson notes/quiz.");
    }
  };

  const handleToggleLock = async (lessonId, isCurrentlyCompleted, phaseId, lessonsInPhase) => {
    setUnlockingLessonId(lessonId);
    try {
      const newStatus = isCurrentlyCompleted ? "in_progress" : "completed";
      
      const { error } = await supabase.from("student_lesson_progress").upsert(
        {
          student_id: selectedStudent.id,
          lesson_id: lessonId,
          status: newStatus,
          completed_at: isCurrentlyCompleted ? null : new Date().toISOString()
        },
        { onConflict: "student_id,lesson_id" }
      );

      if (error) throw error;

      const nextCompletedSet = new Set(completedLessonIds);
      if (isCurrentlyCompleted) {
        nextCompletedSet.delete(lessonId);
      } else {
        nextCompletedSet.add(lessonId);
      }
      setCompletedLessonIds(nextCompletedSet);

      const allNowComplete = lessonsInPhase.length > 0 && lessonsInPhase.every((l) => nextCompletedSet.has(l.id));
      if (allNowComplete) {
        setCollapsedPhases((prev) => ({ ...prev, [phaseId]: true }));
      }

      toast.success(isCurrentlyCompleted ? "Lesson locked successfully!" : "Lesson manually unlocked & marked complete!");
    } catch (err) {
      console.error("Toggle lock error:", err);
      toast.error("Failed to update lesson status: " + err.message);
    } finally {
      setUnlockingLessonId(null);
    }
  };

  const togglePhaseCollapse = (phaseId) => {
    setCollapsedPhases((prev) => ({
      ...prev,
      [phaseId]: !prev[phaseId]
    }));
  };

  const filteredStudents = students.filter(
    (student) =>
      (student.full_name || student.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">My Students & Curriculum Breakdown</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review student progress, inspect notes and quizzes on unlocked lessons, and manage access locks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Container */}
        <div className={`transition-all duration-300 ${isSidebarCollapsed ? "lg:col-span-1 w-20 px-3" : "lg:col-span-4"} bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-5 shadow-sm space-y-4 relative`}>
          
          {/* Collapse/Expand Toggle Button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-6 w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-purple-700 transition-colors z-10 hidden lg:flex"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {!isSidebarCollapsed && (
            <div className="relative">
              <Search size={16} className="absolute left-4 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs font-medium focus:outline-none focus:border-purple-500"
              />
            </div>
          )}

          {loadingStudents ? (
            <div className="text-center py-12 text-gray-400 text-xs">{!isSidebarCollapsed && "Loading students..."}</div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">{!isSidebarCollapsed && "No assigned students found."}</div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredStudents.map((student) => {
                const isSelected = selectedStudent?.id === student.id;
                const studentName = student.full_name || student.name || "Student";
                const avatarImg = student.avatar_url || student.user_metadata?.avatar_url || student.picture;

                return (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    title={studentName}
                    className={`w-full p-2.5 rounded-2xl transition-all flex items-center ${
                      isSidebarCollapsed ? "justify-center" : "gap-3 text-left"
                    } ${
                      isSelected
                        ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                        : "hover:bg-gray-50 dark:hover:bg-white/5 text-gray-900 dark:text-white"
                    }`}
                  >
                    {avatarImg ? (
                      <img
                        src={avatarImg}
                        alt={studentName}
                        className={`w-9 h-9 rounded-xl object-cover shrink-0 border ${isSelected ? "border-white/40" : "border-purple-500/20"}`}
                      />
                    ) : (
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          isSelected ? "bg-white/20 text-white" : "bg-purple-50 text-purple-600"
                        }`}
                      >
                        {studentName[0] || <User size={16} />}
                      </div>
                    )}

                    {!isSidebarCollapsed && (
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-sm truncate">{studentName}</h4>
                        <p className={`text-[10px] truncate ${isSelected ? "text-purple-100" : "text-gray-400"}`}>
                          {student.email}
                        </p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Main Curriculum Content Area */}
        <div className={`transition-all duration-300 ${isSidebarCollapsed ? "lg:col-span-11" : "lg:col-span-8"} space-y-6`}>
          {selectedStudent ? (
            <div className="space-y-6">
              {/* Course Selection Tabs for Student */}
              {studentCourses.length > 0 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {studentCourses.map((course) => {
                    const isSelected = selectedCourseId === course.id;
                    return (
                      <button
                        key={course.id}
                        onClick={() => setSelectedCourseId(course.id)}
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

              {loadingData ? (
                <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-12 text-center text-gray-400 text-xs">
                  Loading student curriculum data...
                </div>
              ) : studentPhases.length === 0 ? (
                <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-12 text-center">
                  <FileText size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-bold text-sm">No course assigned or syllabus found for this track.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {studentPhases.map((phase) => {
                    const lessons = phase.course_lessons || [];
                    const isPhaseComplete = lessons.length > 0 && lessons.every((l) => completedLessonIds.has(l.id));
                    const isCollapsed = !!collapsedPhases[phase.id];

                    return (
                      <div
                        key={phase.id}
                        className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3 transition-all"
                      >
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
                          <div className="flex items-center gap-2.5">
                            {isPhaseComplete && (
                              <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 shrink-0">
                                <CheckCircle2 size={14} />
                              </div>
                            )}
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-purple-600">
                                Phase {phase.phase_number}
                              </span>
                              <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                {phase.title}
                              </h4>
                            </div>
                          </div>

                          <button
                            onClick={() => togglePhaseCollapse(phase.id)}
                            className="text-xs font-bold text-gray-400 hover:text-purple-600 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 transition-all"
                          >
                            {isCollapsed ? (
                              <><span>Expand</span> <ChevronDown size={14} /></>
                            ) : (
                              <><span>Collapse</span> <ChevronUp size={14} /></>
                            )}
                          </button>
                        </div>

                        {!isCollapsed && (
                          <div className="space-y-3 pt-1">
                            {lessons.map((lesson, lessonIdx, lessonsArray) => {
                              const isCompleted = completedLessonIds.has(lesson.id);
                              const prevLesson = lessonIdx > 0 ? lessonsArray[lessonIdx - 1] : null;
                              const isUnlocked = lessonIdx === 0 || (prevLesson && completedLessonIds.has(prevLesson.id));
                              
                              const quiz = lesson.quiz;
                              const attempt = quiz
                                ? studentAttempts.find((a) => a.quiz_id === quiz.id)
                                : null;

                              const isExpanded = expandedLessonId === lesson.id;
                              const lessonDetails = lessonContentMap[lesson.id];

                              return (
                                <div
                                  key={lesson.id}
                                  className={`bg-gray-50/60 dark:bg-white/[0.02] border rounded-xl p-3.5 transition-all ${
                                    !isUnlocked ? "opacity-60 border-dashed border-gray-300 dark:border-white/10" : "border-gray-200/60 dark:border-white/5"
                                  }`}
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div 
                                      onClick={() => handleLessonClick(lesson.id, isUnlocked)}
                                      className={`space-y-1 flex-1 ${isUnlocked ? "cursor-pointer group" : "cursor-not-allowed"}`}
                                    >
                                      <div className="flex items-center gap-2">
                                        {isCompleted ? (
                                          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                                        ) : isUnlocked ? (
                                          <AlertCircle size={16} className="text-amber-500 shrink-0 group-hover:text-purple-600 transition-colors" />
                                        ) : (
                                          <Lock size={16} className="text-gray-400 shrink-0" />
                                        )}
                                        <span className="font-bold text-xs text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors flex items-center gap-1.5">
                                          {lesson.title} {!isUnlocked && "(Locked)"}
                                          {isUnlocked && <span className="text-[10px] text-purple-500 font-normal underline">({isExpanded ? "Hide Content" : "View Notes & Quiz"})</span>}
                                        </span>
                                      </div>

                                      {quiz ? (
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 pl-6">
                                          Quiz: <span className="font-semibold">{quiz.title}</span> —{" "}
                                          {attempt ? (
                                            <span className={attempt.passed ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                                              Score: {attempt.score}% ({attempt.passed ? "Passed" : "Failed"})
                                            </span>
                                          ) : (
                                            <span className="text-gray-400 italic">Not attempted yet</span>
                                          )}
                                        </p>
                                      ) : (
                                        <p className="text-[11px] text-gray-400 pl-6 italic">No quiz attached</p>
                                      )}
                                    </div>

                                    <button
                                      onClick={() => handleToggleLock(lesson.id, isCompleted, phase.id, lessons)}
                                      disabled={unlockingLessonId === lesson.id}
                                      className={`self-end sm:self-center px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 shrink-0 ${
                                        isCompleted 
                                          ? "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-500/20" 
                                          : "bg-purple-600 hover:bg-purple-700 text-white"
                                      }`}
                                    >
                                      {isCompleted ? <Lock size={13} /> : <Unlock size={13} />}
                                      {unlockingLessonId === lesson.id 
                                        ? "Updating..." 
                                        : isCompleted 
                                        ? "Lock Lesson" 
                                        : "Unlock Lesson"}
                                    </button>
                                  </div>

                                  {isUnlocked && isExpanded && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10 space-y-4 animate-fade-in">
                                      {!lessonDetails ? (
                                        <div className="py-6 text-center text-xs text-gray-400">Loading lesson content...</div>
                                      ) : (
                                        <>
                                          <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 space-y-2">
                                            <h5 className="text-xs font-black uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
                                              <FileText size={14} /> Lesson Notes Content
                                            </h5>
                                            {lessonDetails.notes ? (
                                              <div className="space-y-2">
                                                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{lessonDetails.notes.title}</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed bg-gray-50 dark:bg-white/5 p-3 rounded-xl max-h-48 overflow-y-auto">
                                                  {lessonDetails.notes.content || "No detailed text content provided."}
                                                </p>
                                                {lessonDetails.notes.video_url && (
                                                  <a 
                                                    href={lessonDetails.notes.video_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:underline pt-1"
                                                  >
                                                    <ExternalLink size={12} /> Watch Video Material
                                                  </a>
                                                )}
                                              </div>
                                            ) : (
                                              <p className="text-xs text-gray-400 italic">No notes uploaded for this lesson.</p>
                                            )}
                                          </div>

                                          <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 space-y-3">
                                            <h5 className="text-xs font-black uppercase tracking-wider text-pink-600 flex items-center gap-1.5">
                                              <HelpCircle size={14} /> Attached Quiz & Questions ({lessonDetails.questions.length})
                                            </h5>
                                            {lessonDetails.quiz ? (
                                              <div className="space-y-3">
                                                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                                  {lessonDetails.quiz.title} (Passing Score: {lessonDetails.quiz.passing_score}%)
                                                </p>
                                                {lessonDetails.questions.length > 0 ? (
                                                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                                                    {lessonDetails.questions.map((q, idx) => (
                                                      <div key={q.id} className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl text-xs space-y-1.5">
                                                        <p className="font-bold text-gray-900 dark:text-white">
                                                          Q{idx + 1}. {q.question_text}
                                                        </p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-3">
                                                          {Array.isArray(q.options) && q.options.map((opt, optIdx) => (
                                                            <span 
                                                              key={optIdx} 
                                                              className={`p-1.5 rounded-lg border text-[11px] ${
                                                                optIdx === q.correct_option_index 
                                                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 font-bold" 
                                                                  : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400"
                                                              }`}
                                                            >
                                                              {optIdx + 1}. {opt} {optIdx === q.correct_option_index && "✓"}
                                                            </span>
                                                          ))}
                                                        </div>
                                                      </div>
                                                    ))}
                                                  </div>
                                                ) : (
                                                  <p className="text-xs text-gray-400 italic">No questions added to this quiz yet.</p>
                                                )}
                                              </div>
                                            ) : (
                                              <p className="text-xs text-gray-400 italic">No quiz attached to this lesson.</p>
                                            )}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-16 text-center">
              <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-bold text-sm">Select a student</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// import React, { useState, useEffect } from "react";
// import { BookOpen, Search, FileText, User, CheckCircle2, AlertCircle, Unlock, Lock, ChevronDown, ChevronUp, HelpCircle, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
// import { supabase } from "../../../supabase";
// import toast from "react-hot-toast";

// export default function TutorStudentsView({ userId }) {
//   const [students, setStudents] = useState([]);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [studentPhases, setStudentPhases] = useState([]);
//   const [studentAttempts, setStudentAttempts] = useState([]);
//   const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
//   const [loadingStudents, setLoadingStudents] = useState(true);
//   const [loadingData, setLoadingData] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [unlockingLessonId, setUnlockingLessonId] = useState(null);
  
//   // Sidebar collapsed state
//   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
//   // Track collapsed state per phase (auto-collapsed if complete)
//   const [collapsedPhases, setCollapsedPhases] = useState({});
  
//   // Track expanded lesson details inline view for notes & quizzes
//   const [expandedLessonId, setExpandedLessonId] = useState(null);
//   const [lessonContentMap, setLessonContentMap] = useState({});

//   useEffect(() => {
//     const fetchAssignedStudents = async () => {
//       if (!userId) return;
//       setLoadingStudents(true);
//       try {
//         const { data, error } = await supabase
//           .from("users")
//           .select("*")
//           .eq("assigned_tutor_id", userId)
//           .eq("role", "student");

//         if (error) throw error;
//         setStudents(data || []);
//         if (data && data.length > 0) {
//           setSelectedStudent(data[0]);
//         }
//       } catch (err) {
//         console.error("Error fetching assigned students:", err);
//       } finally {
//         setLoadingStudents(false);
//       }
//     };

//     fetchAssignedStudents();
//   }, [userId]);

//   useEffect(() => {
//     const fetchStudentAcademicData = async () => {
//       if (!selectedStudent?.id) return;
//       setLoadingData(true);
//       setExpandedLessonId(null);
//       try {
//         const { data: progressData } = await supabase
//           .from("student_lesson_progress")
//           .select("lesson_id, status")
//           .eq("student_id", selectedStudent.id)
//           .eq("status", "completed");

//         const completedSet = new Set((progressData || []).map((p) => p.lesson_id));
//         setCompletedLessonIds(completedSet);

//         const { data: userData } = await supabase
//           .from("users")
//           .select("assigned_course_id")
//           .eq("id", selectedStudent.id)
//           .single();

//         if (!userData?.assigned_course_id) {
//           setStudentPhases([]);
//           setLoadingData(false);
//           return;
//         }

//         const courseId = userData.assigned_course_id;

//         const { data: phaseData } = await supabase
//           .from("course_phases")
//           .select(`
//             id,
//             phase_number,
//             title,
//             focus,
//             course_lessons (
//               id,
//               title,
//               position
//             )
//           `)
//           .eq("course_id", courseId)
//           .order("phase_number", { ascending: true });

//         const { data: quizzesData } = await supabase
//           .from("quizzes")
//           .select("id, title, passing_score, lesson_id")
//           .eq("course_id", courseId);

//         const enrichedPhases = (phaseData || []).map((phase) => ({
//           ...phase,
//           course_lessons: (phase.course_lessons || []).map((lesson) => ({
//             ...lesson,
//             quiz: (quizzesData || []).find((q) => q.lesson_id === lesson.id) || null
//           }))
//         }));

//         setStudentPhases(enrichedPhases);

//         const initialCollapseState = {};
//         enrichedPhases.forEach((phase) => {
//           const lessons = phase.course_lessons || [];
//           const allComplete = lessons.length > 0 && lessons.every((l) => completedSet.has(l.id));
//           initialCollapseState[phase.id] = allComplete;
//         });
//         setCollapsedPhases(initialCollapseState);

//         const { data: attemptsData } = await supabase
//           .from("student_quiz_attempts")
//           .select("*")
//           .eq("student_id", selectedStudent.id)
//           .order("completed_at", { ascending: false });

//         setStudentAttempts(attemptsData || []);
//       } catch (err) {
//         console.error("Error fetching student academic data:", err);
//       } finally {
//         setLoadingData(false);
//       }
//     };

//     fetchStudentAcademicData();
//   }, [selectedStudent]);

//   const handleLessonClick = async (lessonId, isUnlocked) => {
//     if (!isUnlocked) {
//       toast.error("Lesson is locked. Unlock it first to inspect content.");
//       return;
//     }

//     if (expandedLessonId === lessonId) {
//       setExpandedLessonId(null);
//       return;
//     }

//     setExpandedLessonId(lessonId);

//     if (lessonContentMap[lessonId]) return;

//     try {
//       const { data: notesData } = await supabase
//         .from("notes")
//         .select("*")
//         .eq("lesson_id", lessonId)
//         .maybeSingle();

//       const { data: quizData } = await supabase
//         .from("quizzes")
//         .select("id, title, passing_score")
//         .eq("lesson_id", lessonId)
//         .maybeSingle();

//       let questions = [];
//       if (quizData?.id) {
//         const { data: qData } = await supabase
//           .from("quiz_questions")
//           .select("*")
//           .eq("quiz_id", quizData.id)
//           .order("position", { ascending: true });
//         questions = qData || [];
//       }

//       setLessonContentMap((prev) => ({
//         ...prev,
//         [lessonId]: {
//           notes: notesData || null,
//           quiz: quizData || null,
//           questions: questions
//         }
//       }));
//     } catch (err) {
//       console.error("Error loading lesson details:", err);
//       toast.error("Failed to load lesson notes/quiz.");
//     }
//   };

//   const handleToggleLock = async (lessonId, isCurrentlyCompleted, phaseId, lessonsInPhase) => {
//     setUnlockingLessonId(lessonId);
//     try {
//       const newStatus = isCurrentlyCompleted ? "in_progress" : "completed";
      
//       const { error } = await supabase.from("student_lesson_progress").upsert(
//         {
//           student_id: selectedStudent.id,
//           lesson_id: lessonId,
//           status: newStatus,
//           completed_at: isCurrentlyCompleted ? null : new Date().toISOString()
//         },
//         { onConflict: "student_id,lesson_id" }
//       );

//       if (error) throw error;

//       const nextCompletedSet = new Set(completedLessonIds);
//       if (isCurrentlyCompleted) {
//         nextCompletedSet.delete(lessonId);
//       } else {
//         nextCompletedSet.add(lessonId);
//       }
//       setCompletedLessonIds(nextCompletedSet);

//       const allNowComplete = lessonsInPhase.length > 0 && lessonsInPhase.every((l) => nextCompletedSet.has(l.id));
//       if (allNowComplete) {
//         setCollapsedPhases((prev) => ({ ...prev, [phaseId]: true }));
//       }

//       toast.success(isCurrentlyCompleted ? "Lesson locked successfully!" : "Lesson manually unlocked & marked complete!");
//     } catch (err) {
//       console.error("Toggle lock error:", err);
//       toast.error("Failed to update lesson status: " + err.message);
//     } finally {
//       setUnlockingLessonId(null);
//     }
//   };

//   const togglePhaseCollapse = (phaseId) => {
//     setCollapsedPhases((prev) => ({
//       ...prev,
//       [phaseId]: !prev[phaseId]
//     }));
//   };

//   const filteredStudents = students.filter(
//     (student) =>
//       (student.full_name || student.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       student.email?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="max-w-7xl mx-auto p-6 space-y-8">
//       <div>
//         <h1 className="text-2xl font-black text-gray-900 dark:text-white">My Students & Curriculum Breakdown</h1>
//         <p className="text-sm text-gray-500 mt-1">
//           Review student progress, inspect notes and quizzes on unlocked lessons, and manage access locks.
//         </p>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
//         {/* Sidebar Container */}
//         <div className={`transition-all duration-300 ${isSidebarCollapsed ? "lg:col-span-1 w-20 px-3" : "lg:col-span-4"} bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-5 shadow-sm space-y-4 relative`}>
          
//           {/* Collapse/Expand Toggle Button */}
//           <button
//             onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
//             className="absolute -right-3 top-6 w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-purple-700 transition-colors z-10 hidden lg:flex"
//             title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
//           >
//             {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
//           </button>

//           {!isSidebarCollapsed && (
//             <div className="relative">
//               <Search size={16} className="absolute left-4 top-3.5 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search students..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs font-medium focus:outline-none focus:border-purple-500"
//               />
//             </div>
//           )}

//           {loadingStudents ? (
//             <div className="text-center py-12 text-gray-400 text-xs">{!isSidebarCollapsed && "Loading students..."}</div>
//           ) : filteredStudents.length === 0 ? (
//             <div className="text-center py-12 text-gray-400 text-xs">{!isSidebarCollapsed && "No assigned students found."}</div>
//           ) : (
//             <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
//               {filteredStudents.map((student) => {
//                 const isSelected = selectedStudent?.id === student.id;
//                 const studentName = student.full_name || student.name || "Student";
//                 const avatarImg = student.avatar_url || student.user_metadata?.avatar_url || student.picture;

//                 return (
//                   <button
//                     key={student.id}
//                     onClick={() => setSelectedStudent(student)}
//                     title={studentName}
//                     className={`w-full p-2.5 rounded-2xl transition-all flex items-center ${
//                       isSidebarCollapsed ? "justify-center" : "gap-3 text-left"
//                     } ${
//                       isSelected
//                         ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
//                         : "hover:bg-gray-50 dark:hover:bg-white/5 text-gray-900 dark:text-white"
//                     }`}
//                   >
//                     {avatarImg ? (
//                       <img
//                         src={avatarImg}
//                         alt={studentName}
//                         className={`w-9 h-9 rounded-xl object-cover shrink-0 border ${isSelected ? "border-white/40" : "border-purple-500/20"}`}
//                       />
//                     ) : (
//                       <div
//                         className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
//                           isSelected ? "bg-white/20 text-white" : "bg-purple-50 text-purple-600"
//                         }`}
//                       >
//                         {studentName[0] || <User size={16} />}
//                       </div>
//                     )}

//                     {!isSidebarCollapsed && (
//                       <div className="overflow-hidden">
//                         <h4 className="font-bold text-sm truncate">{studentName}</h4>
//                         <p className={`text-[10px] truncate ${isSelected ? "text-purple-100" : "text-gray-400"}`}>
//                           {student.email}
//                         </p>
//                       </div>
//                     )}
//                   </button>
//                 );
//               })}
//             </div>
//           )}
//         </div>

//         {/* Main Curriculum Content Area */}
//         <div className={`transition-all duration-300 ${isSidebarCollapsed ? "lg:col-span-11" : "lg:col-span-8"} space-y-6`}>
//           {selectedStudent ? (
//             <div className="space-y-4">
//               {loadingData ? (
//                 <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-12 text-center text-gray-400 text-xs">
//                   Loading student curriculum data...
//                 </div>
//               ) : studentPhases.length === 0 ? (
//                 <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-12 text-center">
//                   <FileText size={40} className="mx-auto text-gray-300 mb-3" />
//                   <p className="text-gray-500 font-bold text-sm">No course assigned or syllabus found.</p>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {studentPhases.map((phase) => {
//                     const lessons = phase.course_lessons || [];
//                     const isPhaseComplete = lessons.length > 0 && lessons.every((l) => completedLessonIds.has(l.id));
//                     const isCollapsed = !!collapsedPhases[phase.id];

//                     return (
//                       <div
//                         key={phase.id}
//                         className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3 transition-all"
//                       >
//                         <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
//                           <div className="flex items-center gap-2.5">
//                             {isPhaseComplete && (
//                               <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 shrink-0">
//                                 <CheckCircle2 size={14} />
//                               </div>
//                             )}
//                             <div>
//                               <span className="text-[10px] font-black uppercase tracking-wider text-purple-600">
//                                 Phase {phase.phase_number}
//                               </span>
//                               <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
//                                 {phase.title}
//                               </h4>
//                             </div>
//                           </div>

//                           <button
//                             onClick={() => togglePhaseCollapse(phase.id)}
//                             className="text-xs font-bold text-gray-400 hover:text-purple-600 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 transition-all"
//                           >
//                             {isCollapsed ? (
//                               <><span>Expand</span> <ChevronDown size={14} /></>
//                             ) : (
//                               <><span>Collapse</span> <ChevronUp size={14} /></>
//                             )}
//                           </button>
//                         </div>

//                         {!isCollapsed && (
//                           <div className="space-y-3 pt-1">
//                             {lessons.map((lesson, lessonIdx, lessonsArray) => {
//                               const isCompleted = completedLessonIds.has(lesson.id);
//                               const prevLesson = lessonIdx > 0 ? lessonsArray[lessonIdx - 1] : null;
//                               const isUnlocked = lessonIdx === 0 || (prevLesson && completedLessonIds.has(prevLesson.id));
                              
//                               const quiz = lesson.quiz;
//                               const attempt = quiz
//                                 ? studentAttempts.find((a) => a.quiz_id === quiz.id)
//                                 : null;

//                               const isExpanded = expandedLessonId === lesson.id;
//                               const lessonDetails = lessonContentMap[lesson.id];

//                               return (
//                                 <div
//                                   key={lesson.id}
//                                   className={`bg-gray-50/60 dark:bg-white/[0.02] border rounded-xl p-3.5 transition-all ${
//                                     !isUnlocked ? "opacity-60 border-dashed border-gray-300 dark:border-white/10" : "border-gray-200/60 dark:border-white/5"
//                                   }`}
//                                 >
//                                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                                     <div 
//                                       onClick={() => handleLessonClick(lesson.id, isUnlocked)}
//                                       className={`space-y-1 flex-1 ${isUnlocked ? "cursor-pointer group" : "cursor-not-allowed"}`}
//                                     >
//                                       <div className="flex items-center gap-2">
//                                         {isCompleted ? (
//                                           <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
//                                         ) : isUnlocked ? (
//                                           <AlertCircle size={16} className="text-amber-500 shrink-0 group-hover:text-purple-600 transition-colors" />
//                                         ) : (
//                                           <Lock size={16} className="text-gray-400 shrink-0" />
//                                         )}
//                                         <span className="font-bold text-xs text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors flex items-center gap-1.5">
//                                           {lesson.title} {!isUnlocked && "(Locked)"}
//                                           {isUnlocked && <span className="text-[10px] text-purple-500 font-normal underline">({isExpanded ? "Hide Content" : "View Notes & Quiz"})</span>}
//                                         </span>
//                                       </div>

//                                       {quiz ? (
//                                         <p className="text-[11px] text-gray-500 dark:text-gray-400 pl-6">
//                                           Quiz: <span className="font-semibold">{quiz.title}</span> —{" "}
//                                           {attempt ? (
//                                             <span className={attempt.passed ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
//                                               Score: {attempt.score}% ({attempt.passed ? "Passed" : "Failed"})
//                                             </span>
//                                           ) : (
//                                             <span className="text-gray-400 italic">Not attempted yet</span>
//                                           )}
//                                         </p>
//                                       ) : (
//                                         <p className="text-[11px] text-gray-400 pl-6 italic">No quiz attached</p>
//                                       )}
//                                     </div>

//                                     <button
//                                       onClick={() => handleToggleLock(lesson.id, isCompleted, phase.id, lessons)}
//                                       disabled={unlockingLessonId === lesson.id}
//                                       className={`self-end sm:self-center px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 shrink-0 ${
//                                         isCompleted 
//                                           ? "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-500/20" 
//                                           : "bg-purple-600 hover:bg-purple-700 text-white"
//                                       }`}
//                                     >
//                                       {isCompleted ? <Lock size={13} /> : <Unlock size={13} />}
//                                       {unlockingLessonId === lesson.id 
//                                         ? "Updating..." 
//                                         : isCompleted 
//                                         ? "Lock Lesson" 
//                                         : "Unlock Lesson"}
//                                     </button>
//                                   </div>

//                                   {isUnlocked && isExpanded && (
//                                     <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10 space-y-4 animate-fade-in">
//                                       {!lessonDetails ? (
//                                         <div className="py-6 text-center text-xs text-gray-400">Loading lesson content...</div>
//                                       ) : (
//                                         <>
//                                           <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 space-y-2">
//                                             <h5 className="text-xs font-black uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
//                                               <FileText size={14} /> Lesson Notes Content
//                                             </h5>
//                                             {lessonDetails.notes ? (
//                                               <div className="space-y-2">
//                                                 <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{lessonDetails.notes.title}</p>
//                                                 <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed bg-gray-50 dark:bg-white/5 p-3 rounded-xl max-h-48 overflow-y-auto">
//                                                   {lessonDetails.notes.content || "No detailed text content provided."}
//                                                 </p>
//                                                 {lessonDetails.notes.video_url && (
//                                                   <a 
//                                                     href={lessonDetails.notes.video_url} 
//                                                     target="_blank" 
//                                                     rel="noopener noreferrer"
//                                                     className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:underline pt-1"
//                                                   >
//                                                     <ExternalLink size={12} /> Watch Video Material
//                                                   </a>
//                                                 )}
//                                               </div>
//                                             ) : (
//                                               <p className="text-xs text-gray-400 italic">No notes uploaded for this lesson.</p>
//                                             )}
//                                           </div>

//                                           <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 space-y-3">
//                                             <h5 className="text-xs font-black uppercase tracking-wider text-pink-600 flex items-center gap-1.5">
//                                               <HelpCircle size={14} /> Attached Quiz & Questions ({lessonDetails.questions.length})
//                                             </h5>
//                                             {lessonDetails.quiz ? (
//                                               <div className="space-y-3">
//                                                 <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
//                                                   {lessonDetails.quiz.title} (Passing Score: {lessonDetails.quiz.passing_score}%)
//                                                 </p>
//                                                 {lessonDetails.questions.length > 0 ? (
//                                                   <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
//                                                     {lessonDetails.questions.map((q, idx) => (
//                                                       <div key={q.id} className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl text-xs space-y-1.5">
//                                                         <p className="font-bold text-gray-900 dark:text-white">
//                                                           Q{idx + 1}. {q.question_text}
//                                                         </p>
//                                                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-3">
//                                                           {Array.isArray(q.options) && q.options.map((opt, optIdx) => (
//                                                             <span 
//                                                               key={optIdx} 
//                                                               className={`p-1.5 rounded-lg border text-[11px] ${
//                                                                 optIdx === q.correct_option_index 
//                                                                   ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 font-bold" 
//                                                                   : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400"
//                                                               }`}
//                                                             >
//                                                               {optIdx + 1}. {opt} {optIdx === q.correct_option_index && "✓"}
//                                                             </span>
//                                                           ))}
//                                                         </div>
//                                                       </div>
//                                                     ))}
//                                                   </div>
//                                                 ) : (
//                                                   <p className="text-xs text-gray-400 italic">No questions added to this quiz yet.</p>
//                                                 )}
//                                               </div>
//                                             ) : (
//                                               <p className="text-xs text-gray-400 italic">No quiz attached to this lesson.</p>
//                                             )}
//                                           </div>
//                                         </>
//                                       )}
//                                     </div>
//                                   )}
//                                 </div>
//                               );
//                             })}
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-16 text-center">
//               <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
//               <p className="text-gray-500 font-bold text-sm">Select a student</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
// // import React, { useState, useEffect } from "react";
// // import { BookOpen, Search, FileText, User, CheckCircle2, AlertCircle, Unlock, Lock } from "lucide-react";
// // import { supabase } from "../../../supabase";
// // import toast from "react-hot-toast";

// // export default function TutorStudentsView({ userId }) {
// //   const [students, setStudents] = useState([]);
// //   const [selectedStudent, setSelectedStudent] = useState(null);
// //   const [studentPhases, setStudentPhases] = useState([]);
// //   const [studentAttempts, setStudentAttempts] = useState([]);
// //   const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
// //   const [loadingStudents, setLoadingStudents] = useState(true);
// //   const [loadingData, setLoadingData] = useState(false);
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [unlockingLessonId, setUnlockingLessonId] = useState(null);

// //   useEffect(() => {
// //     const fetchAssignedStudents = async () => {
// //       if (!userId) return;
// //       setLoadingStudents(true);
// //       try {
// //         const { data, error } = await supabase
// //           .from("users")
// //           .select("*")
// //           .eq("assigned_tutor_id", userId)
// //           .eq("role", "student");

// //         if (error) throw error;
// //         setStudents(data || []);
// //         if (data && data.length > 0) {
// //           setSelectedStudent(data[0]);
// //         }
// //       } catch (err) {
// //         console.error("Error fetching assigned students:", err);
// //       } finally {
// //         setLoadingStudents(false);
// //       }
// //     };

// //     fetchAssignedStudents();
// //   }, [userId]);

// //   useEffect(() => {
// //     const fetchStudentAcademicData = async () => {
// //       if (!selectedStudent?.id) return;
// //       setLoadingData(true);
// //       try {
// //         const { data: progressData } = await supabase
// //           .from("student_lesson_progress")
// //           .select("lesson_id, status")
// //           .eq("student_id", selectedStudent.id)
// //           .eq("status", "completed");

// //         const completedSet = new Set((progressData || []).map((p) => p.lesson_id));
// //         setCompletedLessonIds(completedSet);

// //         const { data: userData } = await supabase
// //           .from("users")
// //           .select("assigned_course_id")
// //           .eq("id", selectedStudent.id)
// //           .single();

// //         if (!userData?.assigned_course_id) {
// //           setStudentPhases([]);
// //           setLoadingData(false);
// //           return;
// //         }

// //         const courseId = userData.assigned_course_id;

// //         const { data: phaseData } = await supabase
// //           .from("course_phases")
// //           .select(`
// //             id,
// //             phase_number,
// //             title,
// //             focus,
// //             course_lessons (
// //               id,
// //               title,
// //               position
// //             )
// //           `)
// //           .eq("course_id", courseId)
// //           .order("phase_number", { ascending: true });

// //         const { data: quizzesData } = await supabase
// //           .from("quizzes")
// //           .select("id, title, passing_score, lesson_id")
// //           .eq("course_id", courseId);

// //         const enrichedPhases = (phaseData || []).map((phase) => ({
// //           ...phase,
// //           course_lessons: (phase.course_lessons || []).map((lesson) => ({
// //             ...lesson,
// //             quiz: (quizzesData || []).find((q) => q.lesson_id === lesson.id) || null
// //           }))
// //         }));

// //         setStudentPhases(enrichedPhases);

// //         const { data: attemptsData } = await supabase
// //           .from("student_quiz_attempts")
// //           .select("*")
// //           .eq("student_id", selectedStudent.id)
// //           .order("completed_at", { ascending: false });

// //         setStudentAttempts(attemptsData || []);
// //       } catch (err) {
// //         console.error("Error fetching student academic data:", err);
// //       } finally {
// //         setLoadingData(false);
// //       }
// //     };

// //     fetchStudentAcademicData();
// //   }, [selectedStudent]);

// //   const handleToggleLock = async (lessonId, isCurrentlyCompleted) => {
// //     setUnlockingLessonId(lessonId);
// //     try {
// //       const newStatus = isCurrentlyCompleted ? "in_progress" : "completed";
      
// //       const { error } = await supabase.from("student_lesson_progress").upsert(
// //         {
// //           student_id: selectedStudent.id,
// //           lesson_id: lessonId,
// //           status: newStatus,
// //           completed_at: isCurrentlyCompleted ? null : new Date().toISOString()
// //         },
// //         { onConflict: "student_id,lesson_id" }
// //       );

// //       if (error) throw error;

// //       setCompletedLessonIds((prev) => {
// //         const next = new Set(prev);
// //         if (isCurrentlyCompleted) {
// //           next.delete(lessonId);
// //         } else {
// //           next.add(lessonId);
// //         }
// //         return next;
// //       });

// //       toast.success(isCurrentlyCompleted ? "Lesson locked successfully!" : "Lesson manually unlocked & marked complete!");
// //     } catch (err) {
// //       console.error("Toggle lock error:", err);
// //       toast.error("Failed to update lesson status: " + err.message);
// //     } finally {
// //       setUnlockingLessonId(null);
// //     }
// //   };

// //   const filteredStudents = students.filter(
// //     (student) =>
// //       student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //       student.email?.toLowerCase().includes(searchTerm.toLowerCase())
// //   );

// //   return (
// //     <div className="max-w-6xl mx-auto p-6 space-y-8">
// //       <div>
// //         <h1 className="text-2xl font-black text-gray-900 dark:text-white">My Students & Quiz Breakdown</h1>
// //         <p className="text-sm text-gray-500 mt-1">
// //           Review student assessment performance across phases and manage lesson access locks.
// //         </p>
// //       </div>

// //       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
// //         <div className="lg:col-span-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-5 shadow-sm space-y-4">
// //           <div className="relative">
// //             <Search size={16} className="absolute left-4 top-3.5 text-gray-400" />
// //             <input
// //               type="text"
// //               placeholder="Search students..."
// //               value={searchTerm}
// //               onChange={(e) => setSearchTerm(e.target.value)}
// //               className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs font-medium focus:outline-none focus:border-purple-500"
// //             />
// //           </div>

// //           {loadingStudents ? (
// //             <div className="text-center py-12 text-gray-400 text-xs">Loading students...</div>
// //           ) : filteredStudents.length === 0 ? (
// //             <div className="text-center py-12 text-gray-400 text-xs">No assigned students found.</div>
// //           ) : (
// //             <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
// //               {filteredStudents.map((student) => (
// //                 <button
// //                   key={student.id}
// //                   onClick={() => setSelectedStudent(student)}
// //                   className={`w-full text-left p-3.5 rounded-2xl transition-all flex items-center gap-3 ${
// //                     selectedStudent?.id === student.id
// //                       ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
// //                       : "hover:bg-gray-50 dark:hover:bg-white/5 text-gray-900 dark:text-white"
// //                   }`}
// //                 >
// //                   <div
// //                     className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
// //                       selectedStudent?.id === student.id ? "bg-white/20 text-white" : "bg-purple-50 text-purple-600"
// //                     }`}
// //                   >
// //                     {student.name?.[0] || <User size={16} />}
// //                   </div>
// //                   <div className="overflow-hidden">
// //                     <h4 className="font-bold text-sm truncate">{student.name || "Student"}</h4>
// //                     <p className={`text-[10px] truncate ${selectedStudent?.id === student.id ? "text-purple-100" : "text-gray-400"}`}>
// //                       {student.email}
// //                     </p>
// //                   </div>
// //                 </button>
// //               ))}
// //             </div>
// //           )}
// //         </div>

// //         <div className="lg:col-span-8 space-y-6">
// //           {selectedStudent ? (
// //             <>
// //               <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
// //                 <div className="flex items-center gap-4">
// //                   <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded-2xl flex items-center justify-center font-black text-xl">
// //                     {selectedStudent.name?.[0] || "S"}
// //                   </div>
// //                   <div>
// //                     <h2 className="text-lg font-black text-gray-900 dark:text-white">{selectedStudent.name}</h2>
// //                     <p className="text-xs text-gray-400 mt-0.5">{selectedStudent.email}</p>
// //                   </div>
// //                 </div>
// //                 <span className="text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-600 px-3 py-1.5 rounded-xl">
// //                   Active Student
// //                 </span>
// //               </div>

// //               <div className="space-y-4">
// //                 <h3 className="text-base font-black text-gray-900 dark:text-white">Curriculum & Quiz Performance</h3>

// //                 {loadingData ? (
// //                   <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-12 text-center text-gray-400 text-xs">
// //                     Loading student curriculum data...
// //                   </div>
// //                 ) : studentPhases.length === 0 ? (
// //                   <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-12 text-center">
// //                     <FileText size={40} className="mx-auto text-gray-300 mb-3" />
// //                     <p className="text-gray-500 font-bold text-sm">No course assigned or syllabus found.</p>
// //                   </div>
// //                 ) : (
// //                   <div className="space-y-4">
// //                     {studentPhases.map((phase) => (
// //                       <div
// //                         key={phase.id}
// //                         className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3"
// //                       >
// //                         <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
// //                           <div>
// //                             <span className="text-[10px] font-black uppercase tracking-wider text-purple-600">
// //                               Phase {phase.phase_number}
// //                             </span>
// //                             <h4 className="font-bold text-sm text-gray-900 dark:text-white">{phase.title}</h4>
// //                           </div>
// //                         </div>

// //                         <div className="space-y-2.5">
// //                           {phase.course_lessons?.map((lesson, lessonIdx, lessonsArray) => {
// //                             const isCompleted = completedLessonIds.has(lesson.id);
// //                             const prevLesson = lessonIdx > 0 ? lessonsArray[lessonIdx - 1] : null;
// //                             const isUnlocked = lessonIdx === 0 || (prevLesson && completedLessonIds.has(prevLesson.id));
                            
// //                             const quiz = lesson.quiz;
// //                             const attempt = quiz
// //                               ? studentAttempts.find((a) => a.quiz_id === quiz.id)
// //                               : null;

// //                             return (
// //                               <div
// //                                 key={lesson.id}
// //                                 className={`bg-gray-50/60 dark:bg-white/[0.02] border rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
// //                                   !isUnlocked ? "opacity-60 border-dashed border-gray-300 dark:border-white/10" : "border-gray-200/60 dark:border-white/5"
// //                                 }`}
// //                               >
// //                                 <div className="space-y-1">
// //                                   <div className="flex items-center gap-2">
// //                                     {isCompleted ? (
// //                                       <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
// //                                     ) : isUnlocked ? (
// //                                       <AlertCircle size={16} className="text-amber-500 shrink-0" />
// //                                     ) : (
// //                                       <Lock size={16} className="text-gray-400 shrink-0" />
// //                                     )}
// //                                     <span className="font-bold text-xs text-gray-900 dark:text-white">
// //                                       {lesson.title} {!isUnlocked && "(Locked)"}
// //                                     </span>
// //                                   </div>

// //                                   {quiz ? (
// //                                     <p className="text-[11px] text-gray-500 dark:text-gray-400 pl-6">
// //                                       Quiz: <span className="font-semibold">{quiz.title}</span> —{" "}
// //                                       {attempt ? (
// //                                         <span className={attempt.passed ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
// //                                           Score: {attempt.score}% ({attempt.passed ? "Passed" : "Failed"})
// //                                         </span>
// //                                       ) : (
// //                                         <span className="text-gray-400 italic">Not attempted yet</span>
// //                                       )}
// //                                     </p>
// //                                   ) : (
// //                                     <p className="text-[11px] text-gray-400 pl-6 italic">No quiz attached</p>
// //                                   )}
// //                                 </div>

// //                                 <button
// //                                   onClick={() => handleToggleLock(lesson.id, isCompleted)}
// //                                   disabled={unlockingLessonId === lesson.id}
// //                                   className={`self-end sm:self-center px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 shrink-0 ${
// //                                     isCompleted 
// //                                       ? "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-500/20" 
// //                                       : "bg-purple-600 hover:bg-purple-700 text-white"
// //                                   }`}
// //                                 >
// //                                   {isCompleted ? <Lock size={13} /> : <Unlock size={13} />}
// //                                   {unlockingLessonId === lesson.id 
// //                                     ? "Updating..." 
// //                                     : isCompleted 
// //                                     ? "Lock Lesson" 
// //                                     : "Unlock Lesson"}
// //                                 </button>
// //                               </div>
// //                             );
// //                           })}
// //                         </div>
// //                       </div>
// //                     ))}
// //                   </div>
// //                 )}
// //               </div>
// //             </>
// //           ) : (
// //             <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-16 text-center">
// //               <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
// //               <p className="text-gray-500 font-bold text-sm">Select a student</p>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
// // // import React, { useState, useEffect } from "react";
// // // import { BookOpen, Search, FileText, User, CheckCircle2, AlertCircle, Unlock, Lock } from "lucide-react";
// // // import { supabase } from "../../../supabase";
// // // import toast from "react-hot-toast";

// // // export default function TutorStudentsView({ userId }) {
// // //   const [students, setStudents] = useState([]);
// // //   const [selectedStudent, setSelectedStudent] = useState(null);
// // //   const [studentPhases, setStudentPhases] = useState([]);
// // //   const [studentAttempts, setStudentAttempts] = useState([]);
// // //   const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
// // //   const [loadingStudents, setLoadingStudents] = useState(true);
// // //   const [loadingData, setLoadingData] = useState(false);
// // //   const [searchTerm, setSearchTerm] = useState("");
// // //   const [unlockingLessonId, setUnlockingLessonId] = useState(null);

// // //   useEffect(() => {
// // //     const fetchAssignedStudents = async () => {
// // //       if (!userId) return;
// // //       setLoadingStudents(true);
// // //       try {
// // //         const { data, error } = await supabase
// // //           .from("users")
// // //           .select("*")
// // //           .eq("assigned_tutor_id", userId)
// // //           .eq("role", "student");

// // //         if (error) throw error;
// // //         setStudents(data || []);
// // //         if (data && data.length > 0) {
// // //           setSelectedStudent(data[0]);
// // //         }
// // //       } catch (err) {
// // //         console.error("Error fetching assigned students:", err);
// // //       } finally {
// // //         setLoadingStudents(false);
// // //       }
// // //     };

// // //     fetchAssignedStudents();
// // //   }, [userId]);

// // //   useEffect(() => {
// // //     const fetchStudentAcademicData = async () => {
// // //       if (!selectedStudent?.id) return;
// // //       setLoadingData(true);
// // //       try {
// // //         const { data: progressData } = await supabase
// // //           .from("student_lesson_progress")
// // //           .select("lesson_id, status")
// // //           .eq("student_id", selectedStudent.id)
// // //           .eq("status", "completed");

// // //         const completedSet = new Set((progressData || []).map((p) => p.lesson_id));
// // //         setCompletedLessonIds(completedSet);

// // //         const { data: userData } = await supabase
// // //           .from("users")
// // //           .select("assigned_course_id")
// // //           .eq("id", selectedStudent.id)
// // //           .single();

// // //         if (!userData?.assigned_course_id) {
// // //           setStudentPhases([]);
// // //           setLoadingData(false);
// // //           return;
// // //         }

// // //         const courseId = userData.assigned_course_id;

// // //         const { data: phaseData } = await supabase
// // //           .from("course_phases")
// // //           .select(`
// // //             id,
// // //             phase_number,
// // //             title,
// // //             focus,
// // //             course_lessons (
// // //               id,
// // //               title,
// // //               position
// // //             )
// // //           `)
// // //           .eq("course_id", courseId)
// // //           .order("phase_number", { ascending: true });

// // //         const { data: quizzesData } = await supabase
// // //           .from("quizzes")
// // //           .select("id, title, passing_score, lesson_id")
// // //           .eq("course_id", courseId);

// // //         const enrichedPhases = (phaseData || []).map((phase) => ({
// // //           ...phase,
// // //           course_lessons: (phase.course_lessons || []).map((lesson) => ({
// // //             ...lesson,
// // //             quiz: (quizzesData || []).find((q) => q.lesson_id === lesson.id) || null
// // //           }))
// // //         }));

// // //         setStudentPhases(enrichedPhases);

// // //         const { data: attemptsData } = await supabase
// // //           .from("student_quiz_attempts")
// // //           .select("*")
// // //           .eq("student_id", selectedStudent.id)
// // //           .order("completed_at", { ascending: false });

// // //         setStudentAttempts(attemptsData || []);
// // //       } catch (err) {
// // //         console.error("Error fetching student academic data:", err);
// // //       } finally {
// // //         setLoadingData(false);
// // //       }
// // //     };

// // //     fetchStudentAcademicData();
// // //   }, [selectedStudent]);

// // //   const handleToggleLock = async (lessonId, isCurrentlyCompleted) => {
// // //     setUnlockingLessonId(lessonId);
// // //     try {
// // //       const newStatus = isCurrentlyCompleted ? "in_progress" : "completed";
      
// // //       const { error } = await supabase.from("student_lesson_progress").upsert(
// // //         {
// // //           student_id: selectedStudent.id,
// // //           lesson_id: lessonId,
// // //           status: newStatus,
// // //           completed_at: isCurrentlyCompleted ? null : new Date().toISOString()
// // //         },
// // //         { onConflict: "student_id,lesson_id" }
// // //       );

// // //       if (error) throw error;

// // //       setCompletedLessonIds((prev) => {
// // //         const next = new Set(prev);
// // //         if (isCurrentlyCompleted) {
// // //           next.delete(lessonId);
// // //         } else {
// // //           next.add(lessonId);
// // //         }
// // //         return next;
// // //       });

// // //       toast.success(isCurrentlyCompleted ? "Lesson locked successfully!" : "Lesson manually unlocked & marked complete!");
// // //     } catch (err) {
// // //       console.error("Toggle lock error:", err);
// // //       toast.error("Failed to update lesson status: " + err.message);
// // //     } finally {
// // //       setUnlockingLessonId(null);
// // //     }
// // //   };

// // //   const filteredStudents = students.filter(
// // //     (student) =>
// // //       student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
// // //       student.email?.toLowerCase().includes(searchTerm.toLowerCase())
// // //   );

// // //   return (
// // //     <div className="max-w-6xl mx-auto p-6 space-y-8">
// // //       <div>
// // //         <h1 className="text-2xl font-black text-gray-900 dark:text-white">My Students & Quiz Breakdown</h1>
// // //         <p className="text-sm text-gray-500 mt-1">
// // //           Review student assessment performance across phases and manage lesson access locks.
// // //         </p>
// // //       </div>

// // //       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
// // //         <div className="lg:col-span-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-5 shadow-sm space-y-4">
// // //           <div className="relative">
// // //             <Search size={16} className="absolute left-4 top-3.5 text-gray-400" />
// // //             <input
// // //               type="text"
// // //               placeholder="Search students..."
// // //               value={searchTerm}
// // //               onChange={(e) => setSearchTerm(e.target.value)}
// // //               className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs font-medium focus:outline-none focus:border-purple-500"
// // //             />
// // //           </div>

// // //           {loadingStudents ? (
// // //             <div className="text-center py-12 text-gray-400 text-xs">Loading students...</div>
// // //           ) : filteredStudents.length === 0 ? (
// // //             <div className="text-center py-12 text-gray-400 text-xs">No assigned students found.</div>
// // //           ) : (
// // //             <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
// // //               {filteredStudents.map((student) => (
// // //                 <button
// // //                   key={student.id}
// // //                   onClick={() => setSelectedStudent(student)}
// // //                   className={`w-full text-left p-3.5 rounded-2xl transition-all flex items-center gap-3 ${
// // //                     selectedStudent?.id === student.id
// // //                       ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
// // //                       : "hover:bg-gray-50 dark:hover:bg-white/5 text-gray-900 dark:text-white"
// // //                   }`}
// // //                 >
// // //                   <div
// // //                     className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
// // //                       selectedStudent?.id === student.id ? "bg-white/20 text-white" : "bg-purple-50 text-purple-600"
// // //                     }`}
// // //                   >
// // //                     {student.name?.[0] || <User size={16} />}
// // //                   </div>
// // //                   <div className="overflow-hidden">
// // //                     <h4 className="font-bold text-sm truncate">{student.name || "Student"}</h4>
// // //                     <p className={`text-[10px] truncate ${selectedStudent?.id === student.id ? "text-purple-100" : "text-gray-400"}`}>
// // //                       {student.email}
// // //                     </p>
// // //                   </div>
// // //                 </button>
// // //               ))}
// // //             </div>
// // //           )}
// // //         </div>

// // //         <div className="lg:col-span-8 space-y-6">
// // //           {selectedStudent ? (
// // //             <>
// // //               <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
// // //                 <div className="flex items-center gap-4">
// // //                   <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded-2xl flex items-center justify-center font-black text-xl">
// // //                     {selectedStudent.name?.[0] || "S"}
// // //                   </div>
// // //                   <div>
// // //                     <h2 className="text-lg font-black text-gray-900 dark:text-white">{selectedStudent.name}</h2>
// // //                     <p className="text-xs text-gray-400 mt-0.5">{selectedStudent.email}</p>
// // //                   </div>
// // //                 </div>
// // //                 <span className="text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-600 px-3 py-1.5 rounded-xl">
// // //                   Active Student
// // //                 </span>
// // //               </div>

// // //               <div className="space-y-4">
// // //                 <h3 className="text-base font-black text-gray-900 dark:text-white">Curriculum & Quiz Performance</h3>

// // //                 {loadingData ? (
// // //                   <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-12 text-center text-gray-400 text-xs">
// // //                     Loading student curriculum data...
// // //                   </div>
// // //                 ) : studentPhases.length === 0 ? (
// // //                   <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-12 text-center">
// // //                     <FileText size={40} className="mx-auto text-gray-300 mb-3" />
// // //                     <p className="text-gray-500 font-bold text-sm">No course assigned or syllabus found.</p>
// // //                   </div>
// // //                 ) : (
// // //                   <div className="space-y-4">
// // //                     {studentPhases.map((phase) => (
// // //                       <div
// // //                         key={phase.id}
// // //                         className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3"
// // //                       >
// // //                         <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
// // //                           <div>
// // //                             <span className="text-[10px] font-black uppercase tracking-wider text-purple-600">
// // //                               Phase {phase.phase_number}
// // //                             </span>
// // //                             <h4 className="font-bold text-sm text-gray-900 dark:text-white">{phase.title}</h4>
// // //                           </div>
// // //                         </div>

// // //                         <div className="space-y-2.5">
// // //                           {phase.course_lessons?.map((lesson) => {
// // //                             const isCompleted = completedLessonIds.has(lesson.id);
// // //                             const quiz = lesson.quiz;
// // //                             const attempt = quiz
// // //                               ? studentAttempts.find((a) => a.quiz_id === quiz.id)
// // //                               : null;




// // //                             return (
// // //                               <div
// // //                                 key={lesson.id}
// // //                                 className="bg-gray-50/60 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
// // //                               >
// // //                                 <div className="space-y-1">
// // //                                   <div className="flex items-center gap-2">
// // //                                     {isCompleted ? (
// // //                                       <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
// // //                                     ) : (
// // //                                       <AlertCircle size={16} className="text-amber-500 shrink-0" />
// // //                                     )}
// // //                                     <span className="font-bold text-xs text-gray-900 dark:text-white">
// // //                                       {lesson.title}
// // //                                     </span>
// // //                                   </div>

// // //                                   {quiz ? (
// // //                                     <p className="text-[11px] text-gray-500 dark:text-gray-400 pl-6">
// // //                                       Quiz: <span className="font-semibold">{quiz.title}</span> —{" "}
// // //                                       {attempt ? (
// // //                                         <span className={attempt.passed ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
// // //                                           Score: {attempt.score}% ({attempt.passed ? "Passed" : "Failed"})
// // //                                         </span>
// // //                                       ) : (
// // //                                         <span className="text-gray-400 italic">Not attempted yet</span>
// // //                                       )}
// // //                                     </p>
// // //                                   ) : (
// // //                                     <p className="text-[11px] text-gray-400 pl-6 italic">No quiz attached</p>
// // //                                   )}
// // //                                 </div>

// // //                                 <button
// // //                                   onClick={() => handleToggleLock(lesson.id, isCompleted)}
// // //                                   disabled={unlockingLessonId === lesson.id}
// // //                                   className={`self-end sm:self-center px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 shrink-0 ${
// // //                                     isCompleted 
// // //                                       ? "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-500/20" 
// // //                                       : "bg-purple-600 hover:bg-purple-700 text-white"
// // //                                   }`}
// // //                                 >
// // //                                   {isCompleted ? <Lock size={13} /> : <Unlock size={13} />}
// // //                                   {unlockingLessonId === lesson.id 
// // //                                     ? "Updating..." 
// // //                                     : isCompleted 
// // //                                     ? "Lock Lesson" 
// // //                                     : "Unlock Lesson"}
// // //                                 </button>
// // //                               </div>
// // //                             );
// // //                           })}
// // //                         </div>
// // //                       </div>
// // //                     ))}
// // //                   </div>
// // //                 )}
// // //               </div>
// // //             </>
// // //           ) : (
// // //             <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-16 text-center">
// // //               <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
// // //               <p className="text-gray-500 font-bold text-sm">Select a student</p>
// // //             </div>
// // //           )}
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // // import React, { useState, useEffect } from "react";
// // // // import { BookOpen, Search, FileText, User, CheckCircle2, AlertCircle, Unlock, Lock } from "lucide-react";
// // // // import { supabase } from "../../../supabase";
// // // // import toast from "react-hot-toast";

// // // // export default function TutorStudentsView({ userId }) {
// // // //   const [students, setStudents] = useState([]);
// // // //   const [selectedStudent, setSelectedStudent] = useState(null);
// // // //   const [studentPhases, setStudentPhases] = useState([]);
// // // //   const [studentAttempts, setStudentAttempts] = useState([]);
// // // //   const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
// // // //   const [loadingStudents, setLoadingStudents] = useState(true);
// // // //   const [loadingData, setLoadingData] = useState(false);
// // // //   const [searchTerm, setSearchTerm] = useState("");
// // // //   const [unlockingLessonId, setUnlockingLessonId] = useState(null);

// // // //   useEffect(() => {
// // // //     const fetchAssignedStudents = async () => {
// // // //       if (!userId) return;
// // // //       setLoadingStudents(true);
// // // //       try {
// // // //         const { data, error } = await supabase
// // // //           .from("users")
// // // //           .select("*")
// // // //           .eq("assigned_tutor_id", userId)
// // // //           .eq("role", "student");

// // // //         if (error) throw error;
// // // //         setStudents(data || []);
// // // //         if (data && data.length > 0) {
// // // //           setSelectedStudent(data[0]);
// // // //         }
// // // //       } catch (err) {
// // // //         console.error("Error fetching assigned students:", err);
// // // //       } finally {
// // // //         setLoadingStudents(false);
// // // //       }
// // // //     };

// // // //     fetchAssignedStudents();
// // // //   }, [userId]);

// // // //   useEffect(() => {
// // // //     const fetchStudentAcademicData = async () => {
// // // //       if (!selectedStudent?.id) return;
// // // //       setLoadingData(true);
// // // //       try {
// // // //         const { data: progressData } = await supabase
// // // //           .from("student_lesson_progress")
// // // //           .select("lesson_id, status")
// // // //           .eq("student_id", selectedStudent.id)
// // // //           .eq("status", "completed");

// // // //         const completedSet = new Set((progressData || []).map((p) => p.lesson_id));
// // // //         setCompletedLessonIds(completedSet);

// // // //         const { data: userData } = await supabase
// // // //           .from("users")
// // // //           .select("assigned_course_id")
// // // //           .eq("id", selectedStudent.id)
// // // //           .single();

// // // //         if (!userData?.assigned_course_id) {
// // // //           setStudentPhases([]);
// // // //           setLoadingData(false);
// // // //           return;
// // // //         }

// // // //         const courseId = userData.assigned_course_id;

// // // //         // Fetch phases, lessons, and directly-linked quizzes via lesson_id
// // // //         const { data: phaseData } = await supabase
// // // //           .from("course_phases")
// // // //           .select(`
// // // //             id,
// // // //             phase_number,
// // // //             title,
// // // //             focus,
// // // //             course_lessons (
// // // //               id,
// // // //               title,
// // // //               position
// // // //             )
// // // //           `)
// // // //           .eq("course_id", courseId)
// // // //           .order("phase_number", { ascending: true });

// // // //         // Fetch all quizzes for this course
// // // //         const { data: quizzesData } = await supabase
// // // //           .from("quizzes")
// // // //           .select("id, title, passing_score, lesson_id")
// // // //           .eq("course_id", courseId);

// // // //         // Attach quizzes to respective lessons
// // // //         const enrichedPhases = (phaseData || []).map((phase) => ({
// // // //           ...phase,
// // // //           course_lessons: (phase.course_lessons || []).map((lesson) => ({
// // // //             ...lesson,
// // // //             quiz: (quizzesData || []).find((q) => q.lesson_id === lesson.id) || null
// // // //           }))
// // // //         }));

// // // //         setStudentPhases(enrichedPhases);

// // // //         const { data: attemptsData } = await supabase
// // // //           .from("student_quiz_attempts")
// // // //           .select("*")
// // // //           .eq("student_id", selectedStudent.id)
// // // //           .order("completed_at", { ascending: false });

// // // //         setStudentAttempts(attemptsData || []);
// // // //       } catch (err) {
// // // //         console.error("Error fetching student academic data:", err);
// // // //       } finally {
// // // //         setLoadingData(false);
// // // //       }
// // // //     };

// // // //     fetchStudentAcademicData();
// // // //   }, [selectedStudent]);

// // // //   const handleToggleLock = async (lessonId, isCurrentlyCompleted) => {
// // // //     setUnlockingLessonId(lessonId);
// // // //     try {
// // // //       const newStatus = isCurrentlyCompleted ? "in_progress" : "completed";
      
// // // //       const { error } = await supabase.from("student_lesson_progress").upsert(
// // // //         {
// // // //           student_id: selectedStudent.id,
// // // //           lesson_id: lessonId,
// // // //           status: newStatus,
// // // //           completed_at: isCurrentlyCompleted ? null : new Date().toISOString()
// // // //         },
// // // //         { onConflict: "student_id,lesson_id" }
// // // //       );

// // // //       if (error) throw error;

// // // //       setCompletedLessonIds((prev) => {
// // // //         const next = new Set(prev);
// // // //         if (isCurrentlyCompleted) {
// // // //           next.delete(lessonId);
// // // //         } else {
// // // //           next.add(lessonId);
// // // //         }
// // // //         return next;
// // // //       });

// // // //       toast.success(isSuccessfullyToggled(isCurrentlyCompleted));
// // // //     } catch (err) {
// // // //       toast.error("Failed to update lesson status: " + err.message);
// // // //     } finally {
// // // //       setUnlockingLessonId(null);
// // // //     }
// // // //   };

// // // //   const isSuccessfullyToggled = (isCompleted) => 
// // // //     isCompleted ? "Lesson locked successfully!" : "Lesson manually unlocked & marked complete!";

// // // //   const filteredStudents = students.filter(
// // // //     (student) =>
// // // //       student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
// // // //       student.email?.toLowerCase().includes(searchTerm.toLowerCase())
// // // //   );

// // // //   return (
// // // //     <div className="max-w-6xl mx-auto p-6 space-y-8">
// // // //       <div>
// // // //         <h1 className="text-2xl font-black text-gray-900 dark:text-white">My Students & Quiz Breakdown</h1>
// // // //         <p className="text-sm text-gray-500 mt-1">
// // // //           Review student assessment performance across phases and manage lesson access locks.
// // // //         </p>
// // // //       </div>

// // // //       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
// // // //         <div className="lg:col-span-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-5 shadow-sm space-y-4">
// // // //           <div className="relative">
// // // //             <Search size={16} className="absolute left-4 top-3.5 text-gray-400" />
// // // //             <input
// // // //               type="text"
// // // //               placeholder="Search students..."
// // // //               value={searchTerm}
// // // //               onChange={(e) => setSearchTerm(e.target.value)}
// // // //               className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs font-medium focus:outline-none focus:border-purple-500"
// // // //             />
// // // //           </div>

// // // //           {loadingStudents ? (
// // // //             <div className="text-center py-12 text-gray-400 text-xs">Loading students...</div>
// // // //           ) : filteredStudents.length === 0 ? (
// // // //             <div className="text-center py-12 text-gray-400 text-xs">No assigned students found.</div>
// // // //           ) : (
// // // //             <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
// // // //               {filteredStudents.map((student) => (
// // // //                 <button
// // // //                   key={student.id}
// // // //                   onClick={() => setSelectedStudent(student)}
// // // //                   className={`w-full text-left p-3.5 rounded-2xl transition-all flex items-center gap-3 ${
// // // //                     selectedStudent?.id === student.id
// // // //                       ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
// // // //                       : "hover:bg-gray-50 dark:hover:bg-white/5 text-gray-900 dark:text-white"
// // // //                   }`}
// // // //                 >
// // // //                   <div
// // // //                     className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
// // // //                       selectedStudent?.id === student.id ? "bg-white/20 text-white" : "bg-purple-50 text-purple-600"
// // // //                     }`}
// // // //                   >
// // // //                     {student.name?.[0] || <User size={16} />}
// // // //                   </div>
// // // //                   <div className="overflow-hidden">
// // // //                     <h4 className="font-bold text-sm truncate">{student.name || "Student"}</h4>
// // // //                     <p className={`text-[10px] truncate ${selectedStudent?.id === student.id ? "text-purple-100" : "text-gray-400"}`}>
// // // //                       {student.email}
// // // //                     </p>
// // // //                   </div>
// // // //                 </button>
// // // //               ))}
// // // //             </div>
// // // //           )}
// // // //         </div>

// // // //         <div className="lg:col-span-8 space-y-6">
// // // //           {selectedStudent ? (
// // // //             <>
// // // //               <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
// // // //                 <div className="flex items-center gap-4">
// // // //                   <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded-2xl flex items-center justify-center font-black text-xl">
// // // //                     {selectedStudent.name?.[0] || "S"}
// // // //                   </div>
// // // //                   <div>
// // // //                     <h2 className="text-lg font-black text-gray-900 dark:text-white">{selectedStudent.name}</h2>
// // // //                     <p className="text-xs text-gray-400 mt-0.5">{selectedStudent.email}</p>
// // // //                   </div>
// // // //                 </div>
// // // //                 <span className="text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-600 px-3 py-1.5 rounded-xl">
// // // //                   Active Student
// // // //                 </span>
// // // //               </div>

// // // //               <div className="space-y-4">
// // // //                 <h3 className="text-base font-black text-gray-900 dark:text-white">Curriculum & Quiz Performance</h3>

// // // //                 {loadingData ? (
// // // //                   <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-12 text-center text-gray-400 text-xs">
// // // //                     Loading student curriculum data...
// // // //                   </div>
// // // //                 ) : studentPhases.length === 0 ? (
// // // //                   <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-12 text-center">
// // // //                     <FileText size={40} className="mx-auto text-gray-300 mb-3" />
// // // //                     <p className="text-gray-500 font-bold text-sm">No course assigned or syllabus found.</p>
// // // //                   </div>
// // // //                 ) : (
// // // //                   <div className="space-y-4">
// // // //                     {studentPhases.map((phase) => (
// // // //                       <div
// // // //                         key={phase.id}
// // // //                         className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3"
// // // //                       >
// // // //                         <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
// // // //                           <div>
// // // //                             <span className="text-[10px] font-black uppercase tracking-wider text-purple-600">
// // // //                               Phase {phase.phase_number}
// // // //                             </span>
// // // //                             <h4 className="font-bold text-sm text-gray-900 dark:text-white">{phase.title}</h4>
// // // //                           </div>
// // // //                         </div>

// // // //                         <div className="space-y-2.5">
// // // //                           {phase.course_lessons?.map((lesson) => {
// // // //                             const isCompleted = completedLessonIds.has(lesson.id);
// // // //                             const quiz = lesson.quiz;
// // // //                             const attempt = quiz
// // // //                               ? studentAttempts.find((a) => a.quiz_id === quiz.id)
// // // //                               : null;

// // // //                             return (
// // // //                               <div
// // // //                                 key={lesson.id}
// // // //                                 className="bg-gray-50/60 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
// // // //                               >
// // // //                                 <div className="space-y-1">
// // // //                                   <div className="flex items-center gap-2">
// // // //                                     {isCompleted ? (
// // // //                                       <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
// // // //                                     ) : (
// // // //                                       <AlertCircle size={16} className="text-amber-500 shrink-0" />
// // // //                                     )}
// // // //                                     <span className="font-bold text-xs text-gray-900 dark:text-white">
// // // //                                       {lesson.title}
// // // //                                     </span>
// // // //                                   </div>

// // // //                                   {quiz ? (
// // // //                                     <p className="text-[11px] text-gray-500 dark:text-gray-400 pl-6">
// // // //                                       Quiz: <span className="font-semibold">{quiz.title}</span> —{" "}
// // // //                                       {attempt ? (
// // // //                                         <span className={attempt.passed ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
// // // //                                           Score: {attempt.score}% ({attempt.passed ? "Passed" : "Failed"})
// // // //                                         </span>
// // // //                                       ) : (
// // // //                                         <span className="text-gray-400 italic">Not attempted yet</span>
// // // //                                       )}
// // // //                                     </p>
// // // //                                   ) : (
// // // //                                     <p className="text-[11px] text-gray-400 pl-6 italic">No quiz attached</p>
// // // //                                   )}
// // // //                                 </div>

// // // //                                 <button
// // // //                                   onClick={() => handleToggleLock(lesson.id, isCompleted)}
// // // //                                   disabled={unlockingLessonId === lesson.id}
// // // //                                   className={`self-end sm:self-center px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 shrink-0 ${
// // // //                                     isCompleted 
// // // //                                       ? "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-500/20" 
// // // //                                       : "bg-purple-600 hover:bg-purple-700 text-white"
// // // //                                   }`}
// // // //                                 >
// // // //                                   {isCompleted ? <Lock size={13} /> : <Unlock size={13} />}
// // // //                                   {unlockingLessonId === lesson.id 
// // // //                                     ? "Updating..." 
// // // //                                     : isCompleted 
// // // //                                     ? "Lock Lesson" 
// // // //                                     : "Unlock Lesson"}
// // // //                                 </button>
// // // //                               </div>
// // // //                             );
// // // //                           })}
// // // //                         </div>
// // // //                       </div>
// // // //                     ))}
// // // //                   </div>
// // // //                 )}
// // // //               </div>
// // // //             </>
// // // //           ) : (
// // // //             <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-16 text-center">
// // // //               <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
// // // //               <p className="text-gray-500 font-bold text-sm">Select a student</p>
// // // //             </div>
// // // //           )}
// // // //         </div>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }
// // // // // import React, { useState, useEffect } from "react";
// // // // // import { BookOpen, Search, FileText, User, Calendar, CheckCircle2, AlertCircle, Unlock } from "lucide-react";
// // // // // import { supabase } from "../../../supabase";
// // // // // import toast from "react-hot-toast";

// // // // // export default function TutorStudentsView({ userId }) {
// // // // //   const [students, setStudents] = useState([]);
// // // // //   const [selectedStudent, setSelectedStudent] = useState(null);
// // // // //   const [studentAttempts, setStudentAttempts] = useState([]);
// // // // //   const [studentProgress, setStudentProgress] = useState([]);
// // // // //   const [loadingStudents, setLoadingStudents] = useState(true);
// // // // //   const [loadingDetails, setLoadingDetails] = useState(false);
// // // // //   const [searchTerm, setSearchTerm] = useState("");

// // // // //   // Fetch students assigned to this tutor
// // // // //   useEffect(() => {
// // // // //     const fetchAssignedStudents = async () => {
// // // // //       if (!userId) return;
// // // // //       setLoadingStudents(true);
// // // // //       try {
// // // // //         const { data, error } = await supabase
// // // // //           .from("users")
// // // // //           .select("*")
// // // // //           .eq("assigned_tutor_id", userId)
// // // // //           .eq("role", "student");

// // // // //         if (error) throw error;
// // // // //         setStudents(data || []);
// // // // //         if (data && data.length > 0) {
// // // // //           setSelectedStudent(data[0]);
// // // // //         }
// // // // //       } catch (err) {
// // // // //         console.error("Error fetching assigned students:", err);
// // // // //       } finally {
// // // // //         setLoadingStudents(false);
// // // // //       }
// // // // //     };

// // // // //     fetchAssignedStudents();
// // // // //   }, [userId]);

// // // // //   // Fetch quiz attempts & lesson progress for the selected student
// // // // //   useEffect(() => {
// // // // //     const fetchStudentAcademicData = async () => {
// // // // //       if (!selectedStudent?.id) return;
// // // // //       setLoadingDetails(true);
// // // // //       try {
// // // // //         // 1. Fetch Quiz Attempts with Quiz and Lesson details
// // // // //         const { data: attemptsData, error: attErr } = await supabase
// // // // //           .from("student_quiz_attempts")
// // // // //           .select(`
// // // // //             id,
// // // // //             score,
// // // // //             passed,
// // // // //             completed_at,
// // // // //             quizzes (
// // // // //               id,
// // // // //               title,
// // // // //               lesson_id,
// // // // //               course_lessons (
// // // // //                 id,
// // // // //                 title
// // // // //               )
// // // // //             )
// // // // //           `)
// // // // //           .eq("student_id", selectedStudent.id)
// // // // //           .order("completed_at", { ascending: false });

// // // // //         if (attErr) throw attErr;
// // // // //         setStudentAttempts(attemptsData || []);

// // // // //         // 2. Fetch Lesson Progress
// // // // //         const { data: progressData, error: progErr } = await supabase
// // // // //           .from("student_lesson_progress")
// // // // //           .select("*")
// // // // //           .eq("student_id", selectedStudent.id);

// // // // //         if (progErr) throw progErr;
// // // // //         setStudentProgress(progressData || []);
// // // // //       } catch (err) {
// // // // //         console.error("Error fetching student academic data:", err);
// // // // //         setStudentAttempts([]);
// // // // //         setStudentProgress([]);
// // // // //       } finally {
// // // // //         setLoadingDetails(false);
// // // // //       }
// // // // //     };

// // // // //     fetchStudentAcademicData();
// // // // //   }, [selectedStudent]);

// // // // //   // Manual Tutor Override: Force unlock lesson & mark as completed
// // // // //   const handleUnlockLesson = async (lessonId) => {
// // // // //     try {
// // // // //       const { error } = await supabase.from("student_lesson_progress").upsert(
// // // // //         {
// // // // //           student_id: selectedStudent.id,
// // // // //           lesson_id: lessonId,
// // // // //           status: "completed",
// // // // //           completed_at: new Date().toISOString()
// // // // //         },
// // // // //         { onConflict: "student_id,lesson_id" }
// // // // //       );

// // // // //       if (error) throw error;

// // // // //       // Refresh progress state locally
// // // // //       setStudentProgress((prev) => {
// // // // //         const existing = prev.find((p) => p.lesson_id === lessonId);
// // // // //         if (existing) {
// // // // //           return prev.map((p) => (p.lesson_id === lessonId ? { ...p, status: "completed" } : p));
// // // // //         }
// // // // //         return [...prev, { student_id: selectedStudent.id, lesson_id: lessonId, status: "completed" }];
// // // // //       });

// // // // //       toast.success("Lesson successfully unlocked and marked complete!");
// // // // //     } catch (err) {
// // // // //       toast.error("Failed to unlock lesson: " + err.message);
// // // // //     }
// // // // //   };

// // // // //   const filteredStudents = students.filter(
// // // // //     (student) =>
// // // // //       student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
// // // // //       student.email?.toLowerCase().includes(searchTerm.toLowerCase())
// // // // //   );

// // // // //   return (
// // // // //     <div className="max-w-6xl mx-auto p-6 space-y-8">
// // // // //       {/* Header */}
// // // // //       <div>
// // // // //         <h1 className="text-2xl font-black text-gray-900 dark:text-white">My Students & Assessments</h1>
// // // // //         <p className="text-sm text-gray-500 mt-1">
// // // // //           Review your assigned students, inspect their quiz breakdowns, and manually unlock progress after live support sessions.
// // // // //         </p>
// // // // //       </div>

// // // // //       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
// // // // //         {/* Students List Column */}
// // // // //         <div className="lg:col-span-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-5 shadow-sm space-y-4">
// // // // //           <div className="relative">
// // // // //             <Search size={16} className="absolute left-4 top-3.5 text-gray-400" />
// // // // //             <input
// // // // //               type="text"
// // // // //               placeholder="Search students..."
// // // // //               value={searchTerm}
// // // // //               onChange={(e) => setSearchTerm(e.target.value)}
// // // // //               className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs font-medium focus:outline-none focus:border-purple-500"
// // // // //             />
// // // // //           </div>

// // // // //           {loadingStudents ? (
// // // // //             <div className="text-center py-12 text-gray-400 text-xs">Loading students...</div>
// // // // //           ) : filteredStudents.length === 0 ? (
// // // // //             <div className="text-center py-12 text-gray-400 text-xs">No assigned students found.</div>
// // // // //           ) : (
// // // // //             <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
// // // // //               {filteredStudents.map((student) => (
// // // // //                 <button
// // // // //                   key={student.id}
// // // // //                   onClick={() => setSelectedStudent(student)}
// // // // //                   className={`w-full text-left p-3.5 rounded-2xl transition-all flex items-center gap-3 ${
// // // // //                     selectedStudent?.id === student.id
// // // // //                       ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
// // // // //                       : "hover:bg-gray-50 dark:hover:bg-white/5 text-gray-900 dark:text-white"
// // // // //                   }`}
// // // // //                 >
// // // // //                   <div
// // // // //                     className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
// // // // //                       selectedStudent?.id === student.id ? "bg-white/20 text-white" : "bg-purple-50 text-purple-600"
// // // // //                     }`}
// // // // //                   >
// // // // //                     {student.name?.[0] || <User size={16} />}
// // // // //                   </div>
// // // // //                   <div className="overflow-hidden">
// // // // //                     <h4 className="font-bold text-sm truncate">{student.name || "Student"}</h4>
// // // // //                     <p
// // // // //                       className={`text-[10px] truncate ${
// // // // //                         selectedStudent?.id === student.id ? "text-purple-100" : "text-gray-400"
// // // // //                       }`}
// // // // //                     >
// // // // //                       {student.email}
// // // // //                     </p>
// // // // //                   </div>
// // // // //                 </button>
// // // // //               ))}
// // // // //             </div>
// // // // //           )}
// // // // //         </div>

// // // // //         {/* Student Quiz Breakdown & Action Column */}
// // // // //         <div className="lg:col-span-8 space-y-6">
// // // // //           {selectedStudent ? (
// // // // //             <>
// // // // //               {/* Student Info Card */}
// // // // //               <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
// // // // //                 <div className="flex items-center gap-4">
// // // // //                   <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded-2xl flex items-center justify-center font-black text-xl">
// // // // //                     {selectedStudent.name?.[0] || "S"}
// // // // //                   </div>
// // // // //                   <div>
// // // // //                     <h2 className="text-lg font-black text-gray-900 dark:text-white">{selectedStudent.name}</h2>
// // // // //                     <p className="text-xs text-gray-400 mt-0.5">{selectedStudent.email}</p>
// // // // //                   </div>
// // // // //                 </div>
// // // // //                 <div className="flex items-center gap-2">
// // // // //                   <span className="text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-600 px-3 py-1.5 rounded-xl">
// // // // //                     Active Student
// // // // //                   </span>
// // // // //                 </div>
// // // // //               </div>

// // // // //               {/* Quiz Breakdown Feed */}
// // // // //               <div className="space-y-4">
// // // // //                 <h3 className="text-base font-black text-gray-900 dark:text-white">Assessment Quiz Breakdown</h3>

// // // // //                 {loadingDetails ? (
// // // // //                   <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-12 text-center text-gray-400 text-xs">
// // // // //                     Loading academic records...
// // // // //                   </div>
// // // // //                 ) : studentAttempts.length === 0 ? (
// // // // //                   <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-12 text-center">
// // // // //                     <FileText size={40} className="mx-auto text-gray-300 mb-3" />
// // // // //                     <p className="text-gray-500 font-bold text-sm">No quiz attempts recorded yet.</p>
// // // // //                     <p className="text-xs text-gray-400 mt-1">
// // // // //                       Student assessment results and quiz submissions will appear here.
// // // // //                     </p>
// // // // //                   </div>
// // // // //                 ) : (
// // // // //                   <div className="space-y-3">
// // // // //                     {studentAttempts.map((attempt) => {
// // // // //                       const lesson = attempt.quizzes?.course_lessons;
// // // // //                       const isLessonCompleted = studentProgress.some(
// // // // //                         (p) => p.lesson_id === lesson?.id && p.status === "completed"
// // // // //                       );

// // // // //                       return (
// // // // //                         <div
// // // // //                           key={attempt.id}
// // // // //                           className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4"
// // // // //                         >
// // // // //                           <div className="flex items-center justify-between flex-wrap gap-2">
// // // // //                             <div>
// // // // //                               <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
// // // // //                                 {lesson?.title || "Lesson Assessment"}
// // // // //                               </span>
// // // // //                               <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-0.5">
// // // // //                                 {attempt.quizzes?.title || "Quiz"}
// // // // //                               </h4>
// // // // //                             </div>
// // // // //                             <div className="flex items-center gap-3">
// // // // //                               <span
// // // // //                                 className={`text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 ${
// // // // //                                   attempt.passed
// // // // //                                     ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
// // // // //                                     : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
// // // // //                                 }`}
// // // // //                               >
// // // // //                                 {attempt.passed ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
// // // // //                                 Score: {attempt.score}%
// // // // //                               </span>
// // // // //                               <span className="text-[10px] text-gray-400 flex items-center gap-1">
// // // // //                                 <Calendar size={12} />
// // // // //                                 {new Date(attempt.completed_at).toLocaleDateString()}
// // // // //                               </span>
// // // // //                             </div>
// // // // //                           </div>

// // // // //                           {/* Manual Override Action for Failed Quizzes */}
// // // // //                           {!attempt.passed && lesson?.id && (
// // // // //                             <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between flex-wrap gap-3">
// // // // //                               <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
// // // // //                                 Student failed this assessment. You can manually unlock this lesson after reviewing weak spots during a live session.
// // // // //                               </p>
// // // // //                               <button
// // // // //                                 onClick={() => handleUnlockLesson(lesson.id)}
// // // // //                                 disabled={isLessonCompleted}
// // // // //                                 className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
// // // // //                                   isLessonCompleted
// // // // //                                     ? "bg-emerald-500/10 text-emerald-500 cursor-default"
// // // // //                                     : "bg-purple-600 hover:bg-purple-700 text-white"
// // // // //                                 }`}
// // // // //                               >
// // // // //                                 {isLessonCompleted ? (
// // // // //                                   <>
// // // // //                                     <CheckCircle2 size={14} /> Lesson Unlocked
// // // // //                                   </>
// // // // //                                 ) : (
// // // // //                                   <>
// // // // //                                     <Unlock size={14} /> Manually Unlock Lesson
// // // // //                                   </>
// // // // //                                 )}
// // // // //                               </button>
// // // // //                             </div>
// // // // //                           )}
// // // // //                         </div>
// // // // //                       );
// // // // //                     })}
// // // // //                   </div>
// // // // //                 )}
// // // // //               </div>
// // // // //             </>
// // // // //           ) : (
// // // // //             <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-16 text-center">
// // // // //               <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
// // // // //               <p className="text-gray-500 font-bold text-sm">Select a student</p>
// // // // //               <p className="text-xs text-gray-400 mt-1">Choose a student from the list to view their assessment breakdowns.</p>
// // // // //             </div>
// // // // //           )}
// // // // //         </div>
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // }
// // // // // // import React, { useState, useEffect } from "react";
// // // // // // import { BookOpen, Search, FileText, User, Calendar, ExternalLink } from "lucide-react";
// // // // // // import { supabase } from "../../../supabase";

// // // // // // export default function TutorStudentsView({ userId }) {
// // // // // //   const [students, setStudents] = useState([]);
// // // // // //   const [selectedStudent, setSelectedStudent] = useState(null);
// // // // // //   const [studentNotes, setStudentNotes] = useState([]);
// // // // // //   const [loadingStudents, setLoadingStudents] = useState(true);
// // // // // //   const [loadingNotes, setLoadingNotes] = useState(false);
// // // // // //   const [searchTerm, setSearchTerm] = useState("");

// // // // // //   // Fetch students assigned to this tutor
// // // // // //   useEffect(() => {
// // // // // //     const fetchAssignedStudents = async () => {
// // // // // //       if (!userId) return;
// // // // // //       setLoadingStudents(true);
// // // // // //       try {
// // // // // //         const { data, error } = await supabase
// // // // // //           .from("users")
// // // // // //           .select("*")
// // // // // //           .eq("assigned_tutor_id", userId)
// // // // // //           .eq("role", "student");

// // // // // //         if (error) throw error;
// // // // // //         setStudents(data || []);
// // // // // //         if (data && data.length > 0) {
// // // // // //           setSelectedStudent(data[0]);
// // // // // //         }
// // // // // //       } catch (err) {
// // // // // //         console.error("Error fetching assigned students:", err);
// // // // // //       } finally {
// // // // // //         setLoadingStudents(false);
// // // // // //       }
// // // // // //     };

// // // // // //     fetchAssignedStudents();
// // // // // //   }, [userId]);

// // // // // //   // Fetch notes/progress for the selected student
// // // // // //   useEffect(() => {
// // // // // //     const fetchStudentNotes = async () => {
// // // // // //       if (!selectedStudent?.id) return;
// // // // // //       setLoadingNotes(true);
// // // // // //       try {
// // // // // //         const { data, error } = await supabase
// // // // // //           .from("student_notes") // Update to your actual notes/progress table name if different
// // // // // //           .select("*")
// // // // // //           .eq("student_id", selectedStudent.id)
// // // // // //           .order("created_at", { ascending: false });

// // // // // //         if (error) throw error;
// // // // // //         setStudentNotes(data || []);
// // // // // //       } catch (err) {
// // // // // //         console.error("Error fetching student notes:", err);
// // // // // //         setStudentNotes([]);
// // // // // //       } finally {
// // // // // //         setLoadingNotes(false);
// // // // // //       }
// // // // // //     };

// // // // // //     fetchStudentNotes();
// // // // // //   }, [selectedStudent]);

// // // // // //   const filteredStudents = students.filter((student) =>
// // // // // //     student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
// // // // // //     student.email?.toLowerCase().includes(searchTerm.toLowerCase())
// // // // // //   );

// // // // // //   return (
// // // // // //     <div className="max-w-6xl mx-auto p-6 space-y-8">
// // // // // //       {/* Header */}
// // // // // //       <div>
// // // // // //         <h1 className="text-2xl font-black text-gray-900 dark:text-white">My Students & Notes</h1>
// // // // // //         <p className="text-sm text-gray-500 mt-1">
// // // // // //           Review your assigned students and track their lesson notes and progress.
// // // // // //         </p>
// // // // // //       </div>

// // // // // //       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
// // // // // //         {/* Students List Column */}
// // // // // //         <div className="lg:col-span-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-5 shadow-sm space-y-4">
// // // // // //           <div className="relative">
// // // // // //             <Search size={16} className="absolute left-4 top-3.5 text-gray-400" />
// // // // // //             <input
// // // // // //               type="text"
// // // // // //               placeholder="Search students..."
// // // // // //               value={searchTerm}
// // // // // //               onChange={(e) => setSearchTerm(e.target.value)}
// // // // // //               className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs font-medium focus:outline-none focus:border-purple-500"
// // // // // //             />
// // // // // //           </div>

// // // // // //           {loadingStudents ? (
// // // // // //             <div className="text-center py-12 text-gray-400 text-xs">Loading students...</div>
// // // // // //           ) : filteredStudents.length === 0 ? (
// // // // // //             <div className="text-center py-12 text-gray-400 text-xs">No assigned students found.</div>
// // // // // //           ) : (
// // // // // //             <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
// // // // // //               {filteredStudents.map((student) => (
// // // // // //                 <button
// // // // // //                   key={student.id}
// // // // // //                   onClick={() => setSelectedStudent(student)}
// // // // // //                   className={`w-full text-left p-3.5 rounded-2xl transition-all flex items-center gap-3 ${
// // // // // //                     selectedStudent?.id === student.id
// // // // // //                       ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
// // // // // //                       : "hover:bg-gray-50 dark:hover:bg-white/5 text-gray-900 dark:text-white"
// // // // // //                   }`}
// // // // // //                 >
// // // // // //                   <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
// // // // // //                     selectedStudent?.id === student.id ? "bg-white/20 text-white" : "bg-purple-50 text-purple-600"
// // // // // //                   }`}>
// // // // // //                     {student.name?.[0] || <User size={16} />}
// // // // // //                   </div>
// // // // // //                   <div className="overflow-hidden">
// // // // // //                     <h4 className="font-bold text-sm truncate">{student.name || "Student"}</h4>
// // // // // //                     <p className={`text-[10px] truncate ${selectedStudent?.id === student.id ? "text-purple-100" : "text-gray-400"}`}>
// // // // // //                       {student.email}
// // // // // //                     </p>
// // // // // //                   </div>
// // // // // //                 </button>
// // // // // //               ))}
// // // // // //             </div>
// // // // // //           )}
// // // // // //         </div>

// // // // // //         {/* Student Notes & Detail View Column */}
// // // // // //         <div className="lg:col-span-8 space-y-6">
// // // // // //           {selectedStudent ? (
// // // // // //             <>
// // // // // //               {/* Student Info Card */}
// // // // // //               <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
// // // // // //                 <div className="flex items-center gap-4">
// // // // // //                   <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded-2xl flex items-center justify-center font-black text-xl">
// // // // // //                     {selectedStudent.name?.[0] || "S"}
// // // // // //                   </div>
// // // // // //                   <div>
// // // // // //                     <h2 className="text-lg font-black text-gray-900 dark:text-white">{selectedStudent.name}</h2>
// // // // // //                     <p className="text-xs text-gray-400 mt-0.5">{selectedStudent.email}</p>
// // // // // //                   </div>
// // // // // //                 </div>
// // // // // //                 <div className="flex items-center gap-2">
// // // // // //                   <span className="text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-600 px-3 py-1.5 rounded-xl">
// // // // // //                     Active Student
// // // // // //                   </span>
// // // // // //                 </div>
// // // // // //               </div>

// // // // // //               {/* Notes Feed */}
// // // // // //               <div className="space-y-4">
// // // // // //                 <h3 className="text-base font-black text-gray-900 dark:text-white">Student Notes & Progress Log</h3>

// // // // // //                 {loadingNotes ? (
// // // // // //                   <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-12 text-center text-gray-400 text-xs">
// // // // // //                     Loading student notes...
// // // // // //                   </div>
// // // // // //                 ) : studentNotes.length === 0 ? (
// // // // // //                   <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-12 text-center">
// // // // // //                     <FileText size={40} className="mx-auto text-gray-300 mb-3" />
// // // // // //                     <p className="text-gray-500 font-bold text-sm">No notes recorded yet.</p>
// // // // // //                     <p className="text-xs text-gray-400 mt-1">Notes and lesson feedback for this student will appear here.</p>
// // // // // //                   </div>
// // // // // //                 ) : (
// // // // // //                   <div className="space-y-3">
// // // // // //                     {studentNotes.map((note) => (
// // // // // //                       <div
// // // // // //                         key={note.id}
// // // // // //                         className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-2"
// // // // // //                       >
// // // // // //                         <div className="flex items-center justify-between">
// // // // // //                           <h4 className="font-bold text-sm text-gray-900 dark:text-white">{note.title || "Lesson Note"}</h4>
// // // // // //                           <span className="text-[10px] text-gray-400 flex items-center gap-1">
// // // // // //                             <Calendar size={12} />
// // // // // //                             {new Date(note.created_at).toLocaleDateString()}
// // // // // //                           </span>
// // // // // //                         </div>
// // // // // //                         <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{note.content || note.description}</p>
// // // // // //                       </div>
// // // // // //                     ))}
// // // // // //                   </div>
// // // // // //                 )}
// // // // // //               </div>
// // // // // //             </>
// // // // // //           ) : (
// // // // // //             <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-16 text-center">
// // // // // //               <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
// // // // // //               <p className="text-gray-500 font-bold text-sm">Select a student</p>
// // // // // //               <p className="text-xs text-gray-400 mt-1">Choose a student from the list to view their details and notes.</p>
// // // // // //             </div>
// // // // // //           )}
// // // // // //         </div>
// // // // // //       </div>
// // // // // //     </div>
// // // // // //   );
// // // // // // }