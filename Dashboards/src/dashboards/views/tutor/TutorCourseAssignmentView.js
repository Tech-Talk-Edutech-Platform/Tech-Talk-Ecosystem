import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabase";
import toast from "react-hot-toast";
import { BookOpen, CheckCircle2, User, Layers, Send, AlertCircle, Award, FileCode2, ExternalLink } from "lucide-react";

export default function TutorCourseAssignmentView({ userId }) {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [studentCourses, setStudentCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courseLessons, setCourseLessons] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [studentAssignments, setStudentAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Track currently active expanded task for bottom review panel
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  useEffect(() => {
    fetchTutorStudents();
  }, [userId]);

  const fetchTutorStudents = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, assigned_course_id")
      .eq("assigned_tutor_id", userId)
      .eq("role", "student");

    if (error) {
      toast.error("Failed to load students.");
    } else {
      setStudents(data || []);
    }
  };

  const fetchStudentCourses = async (studentId) => {
    try {
      const { data: enrollments, error } = await supabase
        .from("student_enrollments")
        .select("course_id, courses(id, title)")
        .eq("student_id", studentId);

      if (error) throw error;

      let enrolledCourses = (enrollments || []).map((e) => e.courses).filter(Boolean);

      if (enrolledCourses.length === 0) {
        const student = students.find((s) => s.id === studentId);
        if (student?.assigned_course_id) {
          const { data: courseData } = await supabase
            .from("courses")
            .select("id, title")
            .eq("id", student.assigned_course_id)
            .maybeSingle();

          if (courseData) {
            enrolledCourses = [courseData];
          }
        }
      }

      setStudentCourses(enrolledCourses);
      if (enrolledCourses.length > 0) {
        const firstCourseId = enrolledCourses[0].id;
        setSelectedCourse(firstCourseId);
        fetchCourseLessons(firstCourseId, studentId);
      } else {
        setSelectedCourse("");
        setCourseLessons([]);
      }
    } catch (err) {
      console.error("Error loading student courses:", err.message);
      setStudentCourses([]);
    }
  };

  const fetchCourseLessons = async (courseId, studentId) => {
    try {
      const { data: phaseData, error: phaseError } = await supabase
        .from("course_phases")
        .select(`
          id,
          phase_number,
          title,
          course_lessons (
            id,
            title,
            position
          )
        `)
        .eq("course_id", courseId)
        .order("phase_number", { ascending: true });

      if (phaseError) throw phaseError;

      const { data: progressData, error: progressError } = await supabase
        .from("student_lesson_progress")
        .select("lesson_id")
        .eq("student_id", studentId)
        .eq("status", "completed");

      if (progressError) throw progressError;

      const completedIds = new Set((progressData || []).map((p) => p.lesson_id));

      let allLessons = [];
      (phaseData || []).forEach((phase) => {
        const sortedLessons = (phase.course_lessons || []).sort((a, b) => (a.position || 0) - (b.position || 0));
        sortedLessons.forEach((lesson) => {
          allLessons.push({
            ...lesson,
            phase_number: phase.phase_number
          });
        });
      });

      const eligibleLessons = allLessons.filter((lesson, index) => {
        const isCompleted = completedIds.has(lesson.id);
        if (isCompleted) return false;

        const prevLesson = index > 0 ? allLessons[index - 1] : null;
        const isUnlocked = index === 0 || (prevLesson && completedIds.has(prevLesson.id));

        return isUnlocked;
      });

      setCourseLessons(eligibleLessons);
    } catch (err) {
      console.error("Error loading eligible lessons:", err.message);
      setCourseLessons([]);
    }
  };

  const handleStudentChange = async (studentId) => {
    setSelectedStudent(studentId);
    setSelectedLessonId("");
    setSelectedTaskId(null);

    if (studentId) {
      await fetchStudentCourses(studentId);
      await fetchStudentAssignments(studentId);
    } else {
      setStudentCourses([]);
      setSelectedCourse("");
      setCourseLessons([]);
      setStudentAssignments([]);
    }
  };

  const handleCourseChange = async (courseId) => {
    setSelectedCourse(courseId);
    setSelectedLessonId("");
    if (selectedStudent && courseId) {
      await fetchCourseLessons(courseId, selectedStudent);
    } else {
      setCourseLessons([]);
    }
  };

  const fetchStudentAssignments = async (studentId) => {
    const { data, error } = await supabase
      .from("student_assignments")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (!error) {
      const tasks = data || [];
      setStudentAssignments(tasks);
      if (tasks.length > 0 && !selectedTaskId) {
        setSelectedTaskId(tasks[0].id);
      }
    }
  };

  const handleReviewTask = async (taskId, newStatus = "completed") => {
    const task = studentAssignments.find((a) => a.id === taskId);
    if (!task) return;

    setLoading(true);

    const { error } = await supabase
      .from("student_assignments")
      .update({
        tutor_feedback: task.tutor_feedback,
        grade: task.grade,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId);

    setLoading(false);

    if (error) {
      toast.error("Failed to save review.");
      return;
    }

    toast.success(newStatus === "completed" ? "Assignment marked as completed! 🎉" : "Requested revisions from student.");
    fetchStudentAssignments(selectedStudent);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !taskName.trim() || !taskDescription.trim() || !selectedLessonId) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("student_assignments")
      .insert([
        {
          tutor_id: userId,
          student_id: selectedStudent,
          lesson_id: selectedLessonId,
          task_name: taskName,
          description: taskDescription,
          status: "pending",
        },
      ]);

    setLoading(false);

    if (error) {
      toast.error("Failed to create assignment task.");
    } else {
      toast.success("Assignment task dispatched successfully! 🚀");
      setTaskName("");
      setTaskDescription("");
      setSelectedLessonId("");
      fetchStudentAssignments(selectedStudent);
    }
  };

  const activeTask = studentAssignments.find((a) => a.id === selectedTaskId);
  const isFormValid = Boolean(selectedStudent && selectedCourse && selectedLessonId && taskName.trim() && taskDescription.trim());

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-gray-900 dark:text-white">
      {/* Premium Header Banner */}
      <div className="bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-slate-900/50 dark:from-purple-950/60 dark:via-indigo-950/40 dark:to-slate-950/80 backdrop-blur-2xl border border-purple-500/20 rounded-[35px] p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 blur-[120px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-600 dark:text-purple-300 px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase mb-3 border border-purple-500/20">
              <FileCode2 size={15} className="text-purple-500" />
              TUTOR DISPATCH WORKSPACE
            </div>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 dark:from-white dark:via-purple-200 dark:to-indigo-300 bg-clip-text text-transparent">
              Student Homework & Task Control
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-xl text-sm leading-relaxed">
              Dispatch precision coding tasks to multi-course modules and review live student submissions seamlessly.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Dispatch Form */}
        <div className="bg-[#fcfbf9]/90 dark:bg-white/[0.04] backdrop-blur-2xl p-6 md:p-8 rounded-[32px] border border-stone-200/80 dark:border-white/10 shadow-xl space-y-6 lg:col-span-5">
          <div className="flex items-center gap-3 border-b border-stone-200/60 dark:border-white/5 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 font-black">
              <Send size={18} />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Assign Task</h3>
              <p className="text-xs text-stone-500 dark:text-gray-400">Target uncompleted curriculum nodes</p>
            </div>
          </div>

          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-stone-500 dark:text-gray-400 mb-2">Select Student</label>
              <select
                value={selectedStudent}
                onChange={(e) => handleStudentChange(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-[#f7f6f2] dark:bg-white/5 border border-stone-200 dark:border-white/10 focus:outline-none focus:border-purple-500 text-sm font-medium transition-all shadow-inner"
              >
                <option value="" className="dark:bg-slate-900">-- Choose Student --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id} className="dark:bg-slate-900">{s.full_name}</option>
                ))}
              </select>
            </div>

            {selectedStudent && (
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-stone-500 dark:text-gray-400 mb-2">Select Student Course</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-[#f7f6f2] dark:bg-white/5 border border-stone-200 dark:border-white/10 focus:outline-none focus:border-purple-500 text-sm font-medium transition-all shadow-inner"
                >
                  <option value="" className="dark:bg-slate-900">-- Choose Course --</option>
                  {studentCourses.map((c) => (
                    <option key={c.id} value={c.id} className="dark:bg-slate-900">{c.title}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-stone-500 dark:text-gray-400 mb-2">Target Unlocked Lesson</label>
              <select
                value={selectedLessonId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
                disabled={!selectedCourse}
                className="w-full p-3.5 rounded-2xl bg-[#f7f6f2] dark:bg-white/5 border border-stone-200 dark:border-white/10 focus:outline-none focus:border-purple-500 text-sm font-medium transition-all shadow-inner disabled:opacity-40"
              >
                <option value="" className="dark:bg-slate-900">-- Choose Eligible Lesson --</option>
                {courseLessons.map((l) => (
                  <option key={l.id} value={l.id} className="dark:bg-slate-900">
                    Phase {l.phase_number}: {l.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-stone-500 dark:text-gray-400 mb-2">Task Title</label>
              <input
                type="text"
                placeholder="e.g., Build a Python Function"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-[#f7f6f2] dark:bg-white/5 border border-stone-200 dark:border-white/10 focus:outline-none focus:border-purple-500 text-sm font-medium transition-all shadow-inner placeholder-stone-400 dark:placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-stone-500 dark:text-gray-400 mb-2">Task Instructions</label>
              <textarea
                placeholder="Provide precise execution requirements..."
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                rows={4}
                className="w-full p-3.5 rounded-2xl bg-[#f7f6f2] dark:bg-white/5 border border-stone-200 dark:border-white/10 focus:outline-none focus:border-purple-500 text-sm font-medium transition-all shadow-inner resize-none placeholder-stone-400 dark:placeholder-gray-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white shadow-xl transition-all flex items-center justify-center gap-2 ${
                isFormValid && !loading
                  ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:opacity-95 shadow-purple-500/25 cursor-pointer scale-[1.01] active:scale-[0.99]"
                  : "bg-stone-300 dark:bg-white/10 text-stone-500 dark:text-gray-400 cursor-not-allowed shadow-none"
              }`}
            >
              <Send size={16} />
              Dispatch Task
            </button>
          </form>
        </div>

        {/* Right Column: Sidebar Task List */}
        <div className="bg-[#fcfbf9]/90 dark:bg-white/[0.04] backdrop-blur-2xl p-6 md:p-8 rounded-[32px] border border-stone-200/80 dark:border-white/10 shadow-xl space-y-5 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-stone-200/60 dark:border-white/5 pb-4">
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
              <Layers size={18} className="text-purple-500" /> Assigned Task Logs
            </h3>
            {selectedStudent && (
              <span className="text-xs bg-purple-500/10 text-purple-600 dark:text-purple-300 font-bold px-3 py-1 rounded-full border border-purple-500/20">
                {studentAssignments.length} Total
              </span>
            )}
          </div>
          
          {selectedStudent ? (
            studentAssignments.length > 0 ? (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2 scrollbar-none">
                {studentAssignments.map((task) => {
                  const isSelected = selectedTaskId === task.id;
                  const needsAttention = task.status === "submitted" || task.status === "pending";

                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className={`cursor-pointer rounded-2xl p-4 transition-all border flex items-center justify-between group ${
                        isSelected
                          ? "bg-transparent border-2 border-purple-500 shadow-md"
                          : "bg-[#f7f6f2]/60 dark:bg-white/[0.02] border-stone-200/60 dark:border-white/5 hover:border-purple-500/40"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 pr-3">
                        <span className={`w-3 h-3 rounded-full shrink-0 shadow-sm ${
                          needsAttention ? "bg-red-500 animate-pulse shadow-red-500/50" : "bg-emerald-500 shadow-emerald-500/50"
                        }`} />
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm truncate tracking-tight text-stone-900 dark:text-white">
                            {task.task_name}
                          </h4>
                          <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            task.status === "completed"
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : task.status === "submitted"
                              ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                              : task.status === "needs_revision"
                              ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                              : "bg-orange-500/10 text-orange-600 border border-orange-500/20"
                          }`}>
                            {task.status ? task.status.replace("_", " ") : "pending"}
                          </span>
                        </div>
                      </div>

                      {needsAttention && (
                        <span className="text-[10px] font-black tracking-wider uppercase text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-xl shrink-0">
                          Review Needed
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 text-stone-400 dark:text-gray-400 space-y-2">
                <FileCode2 size={36} className="mx-auto opacity-40 text-purple-500" />
                <p className="text-sm font-bold">No tasks assigned to this student yet.</p>
              </div>
            )
          ) : (
            <div className="text-center py-16 text-stone-400 dark:text-gray-400 space-y-2">
              <User size={36} className="mx-auto opacity-40 text-purple-500" />
              <p className="text-sm font-bold">Select a student above to inspect their task timeline.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Expanded Review Panel */}
      {activeTask && (
        <div className="bg-[#fcfbf9]/90 dark:bg-white/[0.04] backdrop-blur-2xl p-6 md:p-8 rounded-[32px] border border-stone-200/80 dark:border-white/10 shadow-2xl space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200/60 dark:border-white/5 pb-5">
            <div>
              <span className="text-xs font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                Active Review Stream
              </span>
              <h3 className="text-2xl font-black mt-2 text-stone-900 dark:text-white tracking-tight">{activeTask.task_name}</h3>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${
              activeTask.status === "completed"
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/25"
                : activeTask.status === "submitted"
                ? "bg-blue-500/10 text-blue-600 border-blue-500/25"
                : activeTask.status === "needs_revision"
                ? "bg-amber-500/10 text-amber-600 border-amber-500/25"
                : "bg-orange-500/10 text-orange-600 border-orange-500/25"
            }`}>
              {activeTask.status ? activeTask.status.replace("_", " ") : "pending"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-stone-500 dark:text-gray-400 block mb-2">Instructions / Brief</label>
                <div className="text-sm text-stone-700 dark:text-gray-300 leading-relaxed bg-[#f7f6f2]/80 dark:bg-white/[0.02] border border-stone-200/60 dark:border-white/5 p-5 rounded-2xl shadow-inner">
                  {activeTask.description}
                </div>
              </div>

              {activeTask.submission_link && (
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-stone-500 dark:text-gray-400 block mb-2">Student Deployment / Link</label>
                  <a
                    href={activeTask.submission_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 text-purple-600 dark:text-purple-400 bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/40 p-4 rounded-2xl transition-all group font-bold text-sm"
                  >
                    <span className="truncate">{activeTask.submission_link}</span>
                    <ExternalLink size={16} className="shrink-0 group-hover:scale-110 transition-transform" />
                  </a>
                </div>
              )}

              {activeTask.submitted_at && (
                <p className="text-xs font-medium text-stone-400 dark:text-gray-400">
                  Timestamp: {new Date(activeTask.submitted_at).toLocaleString()}
                </p>
              )}
            </div>

            <div className="space-y-5 bg-[#f7f6f2]/60 dark:bg-white/[0.02] p-6 rounded-3xl border border-stone-200/60 dark:border-white/5 shadow-inner">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-stone-500 dark:text-gray-400 mb-2">Assign Grade</label>
                <input
                  type="text"
                  placeholder="e.g., A+, 95%, Mastered..."
                  value={activeTask.grade || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setStudentAssignments((prev) =>
                      prev.map((a) => (a.id === activeTask.id ? { ...a, grade: val } : a))
                    );
                  }}
                  className="w-full rounded-2xl border border-stone-200 dark:border-white/10 p-3.5 bg-white dark:bg-white/5 text-sm font-medium focus:outline-none focus:border-purple-500 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-stone-500 dark:text-gray-400 mb-2">Tutor Feedback</label>
                <textarea
                  rows={3}
                  placeholder="Write constructive guidance..."
                  value={activeTask.tutor_feedback || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setStudentAssignments((prev) =>
                      prev.map((a) => (a.id === activeTask.id ? { ...a, tutor_feedback: val } : a))
                    );
                  }}
                  className="w-full rounded-2xl border border-stone-200 dark:border-white/10 p-3.5 bg-white dark:bg-white/5 resize-none text-sm font-medium focus:outline-none focus:border-purple-500 shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleReviewTask(activeTask.id, "needs_revision")}
                  disabled={loading || activeTask.status !== "submitted"}
                  className="py-3.5 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 disabled:opacity-40 disabled:cursor-not-allowed font-black rounded-2xl transition-all text-xs uppercase tracking-wider shadow-sm"
                >
                  Request Revision
                </button>
                <button
                  onClick={() => handleReviewTask(activeTask.id, "completed")}
                  disabled={loading || activeTask.status !== "submitted"}
                  className="py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 dark:disabled:bg-white/10 disabled:cursor-not-allowed text-white font-black rounded-2xl transition-all text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20"
                >
                  Approve & Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// import React, { useState, useEffect } from "react";
// import { supabase } from "../../../supabase";
// import toast from "react-hot-toast";
// import { BookOpen, CheckCircle2, User, Layers, Send, AlertCircle, Award, FileCode2, ExternalLink } from "lucide-react";

// export default function TutorCourseAssignmentView({ userId }) {
//   const [students, setStudents] = useState([]);
//   const [selectedStudent, setSelectedStudent] = useState("");
//   const [studentCourses, setStudentCourses] = useState([]);
//   const [selectedCourse, setSelectedCourse] = useState("");
//   const [courseLessons, setCourseLessons] = useState([]);
//   const [selectedLessonId, setSelectedLessonId] = useState("");
//   const [taskName, setTaskName] = useState("");
//   const [taskDescription, setTaskDescription] = useState("");
//   const [studentAssignments, setStudentAssignments] = useState([]);
//   const [loading, setLoading] = useState(false);
  
//   // Track currently active expanded task for bottom review panel
//   const [selectedTaskId, setSelectedTaskId] = useState(null);

//   useEffect(() => {
//     fetchTutorStudents();
//   }, [userId]);

//   const fetchTutorStudents = async () => {
//     const { data, error } = await supabase
//       .from("users")
//       .select("id, full_name, assigned_course_id")
//       .eq("assigned_tutor_id", userId)
//       .eq("role", "student");

//     if (error) {
//       toast.error("Failed to load students.");
//     } else {
//       setStudents(data || []);
//     }
//   };

//   const fetchStudentCourses = async (studentId) => {
//     try {
//       const { data: enrollments, error } = await supabase
//         .from("student_enrollments")
//         .select("course_id, courses(id, title)")
//         .eq("student_id", studentId);

//       if (error) throw error;

//       let enrolledCourses = (enrollments || []).map((e) => e.courses).filter(Boolean);

//       if (enrolledCourses.length === 0) {
//         const student = students.find((s) => s.id === studentId);
//         if (student?.assigned_course_id) {
//           const { data: courseData } = await supabase
//             .from("courses")
//             .select("id, title")
//             .eq("id", student.assigned_course_id)
//             .maybeSingle();

//           if (courseData) {
//             enrolledCourses = [courseData];
//           }
//         }
//       }

//       setStudentCourses(enrolledCourses);
//       if (enrolledCourses.length > 0) {
//         const firstCourseId = enrolledCourses[0].id;
//         setSelectedCourse(firstCourseId);
//         fetchCourseLessons(firstCourseId, studentId);
//       } else {
//         setSelectedCourse("");
//         setCourseLessons([]);
//       }
//     } catch (err) {
//       console.error("Error loading student courses:", err.message);
//       setStudentCourses([]);
//     }
//   };

//   const fetchCourseLessons = async (courseId, studentId) => {
//     try {
//       const { data: phaseData, error: phaseError } = await supabase
//         .from("course_phases")
//         .select(`
//           id,
//           phase_number,
//           title,
//           course_lessons (
//             id,
//             title,
//             position
//           )
//         `)
//         .eq("course_id", courseId)
//         .order("phase_number", { ascending: true });

//       if (phaseError) throw phaseError;

//       const { data: progressData, error: progressError } = await supabase
//         .from("student_lesson_progress")
//         .select("lesson_id")
//         .eq("student_id", studentId)
//         .eq("status", "completed");

//       if (progressError) throw progressError;

//       const completedIds = new Set((progressData || []).map((p) => p.lesson_id));

//       let allLessons = [];
//       (phaseData || []).forEach((phase) => {
//         const sortedLessons = (phase.course_lessons || []).sort((a, b) => (a.position || 0) - (b.position || 0));
//         sortedLessons.forEach((lesson) => {
//           allLessons.push({
//             ...lesson,
//             phase_number: phase.phase_number
//           });
//         });
//       });

//       const eligibleLessons = allLessons.filter((lesson, index) => {
//         const isCompleted = completedIds.has(lesson.id);
//         if (isCompleted) return false;

//         const prevLesson = index > 0 ? allLessons[index - 1] : null;
//         const isUnlocked = index === 0 || (prevLesson && completedIds.has(prevLesson.id));

//         return isUnlocked;
//       });

//       setCourseLessons(eligibleLessons);
//     } catch (err) {
//       console.error("Error loading eligible lessons:", err.message);
//       setCourseLessons([]);
//     }
//   };

//   const handleStudentChange = async (studentId) => {
//     setSelectedStudent(studentId);
//     setSelectedLessonId("");
//     setSelectedTaskId(null);

//     if (studentId) {
//       await fetchStudentCourses(studentId);
//       await fetchStudentAssignments(studentId);
//     } else {
//       setStudentCourses([]);
//       setSelectedCourse("");
//       setCourseLessons([]);
//       setStudentAssignments([]);
//     }
//   };

//   const handleCourseChange = async (courseId) => {
//     setSelectedCourse(courseId);
//     setSelectedLessonId("");
//     if (selectedStudent && courseId) {
//       await fetchCourseLessons(courseId, selectedStudent);
//     } else {
//       setCourseLessons([]);
//     }
//   };

//   const fetchStudentAssignments = async (studentId) => {
//     const { data, error } = await supabase
//       .from("student_assignments")
//       .select("*")
//       .eq("student_id", studentId)
//       .order("created_at", { ascending: false });

//     if (!error) {
//       const tasks = data || [];
//       setStudentAssignments(tasks);
//       if (tasks.length > 0 && !selectedTaskId) {
//         setSelectedTaskId(tasks[0].id);
//       }
//     }
//   };

//   const handleReviewTask = async (taskId, newStatus = "completed") => {
//     const task = studentAssignments.find((a) => a.id === taskId);
//     if (!task) return;

//     setLoading(true);

//     const { error } = await supabase
//       .from("student_assignments")
//       .update({
//         tutor_feedback: task.tutor_feedback,
//         grade: task.grade,
//         status: newStatus,
//         updated_at: new Date().toISOString(),
//       })
//       .eq("id", taskId);

//     setLoading(false);

//     if (error) {
//       toast.error("Failed to save review.");
//       return;
//     }

//     toast.success(newStatus === "completed" ? "Assignment marked as completed! 🎉" : "Requested revisions from student.");
//     fetchStudentAssignments(selectedStudent);
//   };

//   const handleCreateTask = async (e) => {
//     e.preventDefault();
//     if (!selectedStudent || !taskName.trim() || !taskDescription.trim() || !selectedLessonId) {
//       toast.error("Please fill in all required fields.");
//       return;
//     }

//     setLoading(true);
//     const { error } = await supabase
//       .from("student_assignments")
//       .insert([
//         {
//           tutor_id: userId,
//           student_id: selectedStudent,
//           lesson_id: selectedLessonId,
//           task_name: taskName,
//           description: taskDescription,
//           status: "pending",
//         },
//       ]);

//     setLoading(false);

//     if (error) {
//       toast.error("Failed to create assignment task.");
//     } else {
//       toast.success("Assignment task dispatched successfully! 🚀");
//       setTaskName("");
//       setTaskDescription("");
//       setSelectedLessonId("");
//       fetchStudentAssignments(selectedStudent);
//     }
//   };

//   const activeTask = studentAssignments.find((a) => a.id === selectedTaskId);
//   const isFormValid = Boolean(selectedStudent && selectedCourse && selectedLessonId && taskName.trim() && taskDescription.trim());

//   return (
//     <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-gray-900 dark:text-white">
//       {/* Premium Header Banner */}
//       <div className="bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-slate-900/50 dark:from-purple-950/60 dark:via-indigo-950/40 dark:to-slate-950/80 backdrop-blur-2xl border border-purple-500/20 rounded-[35px] p-6 md:p-8 shadow-2xl relative overflow-hidden">
//         <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 blur-[120px] pointer-events-none" />
//         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//           <div>
//             <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-600 dark:text-purple-300 px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase mb-3 border border-purple-500/20">
//               <FileCode2 size={15} className="text-purple-500" />
//               TUTOR DISPATCH WORKSPACE
//             </div>
//             <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 dark:from-white dark:via-purple-200 dark:to-indigo-300 bg-clip-text text-transparent">
//               Student Homework & Task Control
//             </h1>
//             <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-xl text-sm leading-relaxed">
//               Dispatch precision coding tasks to multi-course modules and review live student submissions seamlessly.
//             </p>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
//         {/* Left Column: Dispatch Form */}
//         <div className="lg:col-span-5 bg-white/80 dark:bg-white/[0.04] backdrop-blur-2xl p-6 md:p-8 rounded-[32px] border border-gray-200/80 dark:border-white/10 shadow-xl space-y-6">
//           <div className="flex items-center gap-3 border-b border-gray-100 dark:border-white/5 pb-4">
//             <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 font-black">
//               <Send size={18} />
//             </div>
//             <div>
//               <h3 className="text-lg font-black tracking-tight">Assign Task</h3>
//               <p className="text-xs text-gray-400">Target uncompleted curriculum nodes</p>
//             </div>
//           </div>

//           <form onSubmit={handleCreateTask} className="space-y-4">
//             <div>
//               <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Select Student</label>
//               <select
//                 value={selectedStudent}
//                 onChange={(e) => handleStudentChange(e.target.value)}
//                 className="w-full p-3.5 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:border-purple-500 text-sm font-medium transition-all shadow-inner"
//               >
//                 <option value="" className="dark:bg-slate-900">-- Choose Student --</option>
//                 {students.map((s) => (
//                   <option key={s.id} value={s.id} className="dark:bg-slate-900">{s.full_name}</option>
//                 ))}
//               </select>
//             </div>

//             {selectedStudent && (
//               <div>
//                 <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Select Student Course</label>
//                 <select
//                   value={selectedCourse}
//                   onChange={(e) => handleCourseChange(e.target.value)}
//                   className="w-full p-3.5 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:border-purple-500 text-sm font-medium transition-all shadow-inner"
//                 >
//                   <option value="" className="dark:bg-slate-900">-- Choose Course --</option>
//                   {studentCourses.map((c) => (
//                     <option key={c.id} value={c.id} className="dark:bg-slate-900">{c.title}</option>
//                   ))}
//                 </select>
//               </div>
//             )}

//             <div>
//               <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Target Unlocked Lesson</label>
//               <select
//                 value={selectedLessonId}
//                 onChange={(e) => setSelectedLessonId(e.target.value)}
//                 disabled={!selectedCourse}
//                 className="w-full p-3.5 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:border-purple-500 text-sm font-medium transition-all shadow-inner disabled:opacity-40"
//               >
//                 <option value="" className="dark:bg-slate-900">-- Choose Eligible Lesson --</option>
//                 {courseLessons.map((l) => (
//                   <option key={l.id} value={l.id} className="dark:bg-slate-900">
//                     Phase {l.phase_number}: {l.title}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Task Title</label>
//               <input
//                 type="text"
//                 placeholder="e.g., Build a Python Function"
//                 value={taskName}
//                 onChange={(e) => setTaskName(e.target.value)}
//                 className="w-full p-3.5 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:border-purple-500 text-sm font-medium transition-all shadow-inner placeholder-gray-400"
//               />
//             </div>

//             <div>
//               <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Task Instructions</label>
//               <textarea
//                 placeholder="Provide precise execution requirements..."
//                 value={taskDescription}
//                 onChange={(e) => setTaskDescription(e.target.value)}
//                 rows={4}
//                 className="w-full p-3.5 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:border-purple-500 text-sm font-medium transition-all shadow-inner resize-none placeholder-gray-400"
//               />
//             </div>

//             <button
//               type="submit"
//               disabled={loading || !isFormValid}
//               className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white shadow-xl transition-all flex items-center justify-center gap-2 ${
//                 isFormValid && !loading
//                   ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:opacity-95 shadow-purple-500/25 cursor-pointer scale-[1.01] active:scale-[0.99]"
//                   : "bg-gray-300 dark:bg-white/10 text-gray-400 cursor-not-allowed shadow-none"
//               }`}
//             >
//               <Send size={16} />
//               Dispatch Task
//             </button>
//           </form>
//         </div>

//         {/* Right Column: Sidebar Task List */}
//         <div className="lg:col-span-7 bg-white/80 dark:bg-white/[0.04] backdrop-blur-2xl p-6 md:p-8 rounded-[32px] border border-gray-200/80 dark:border-white/10 shadow-xl space-y-5">
//           <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4">
//             <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
//               <Layers size={18} className="text-purple-500" /> Assigned Task Logs
//             </h3>
//             {selectedStudent && (
//               <span className="text-xs bg-purple-500/10 text-purple-600 dark:text-purple-300 font-bold px-3 py-1 rounded-full border border-purple-500/20">
//                 {studentAssignments.length} Total
//               </span>
//             )}
//           </div>
          
//           {selectedStudent ? (
//             studentAssignments.length > 0 ? (
//               <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2 scrollbar-none">
//                 {studentAssignments.map((task) => {
//                   const isSelected = selectedTaskId === task.id;
//                   const needsAttention = task.status === "submitted" || task.status === "pending";

//                   return (
//                     <div
//                       key={task.id}
//                       onClick={() => setSelectedTaskId(task.id)}
//                       className={`cursor-pointer rounded-2xl p-4 transition-all border flex items-center justify-between group ${
//                         isSelected
//                           ? "bg-transparent border-2 border-purple-500 shadow-md"
//                           : "bg-gray-50/60 dark:bg-white/[0.02] border-gray-200/60 dark:border-white/5 hover:border-purple-500/40"
//                       }`}
//                     >
//                       <div className="flex items-center gap-3.5 min-w-0 pr-3">
//                         <span className={`w-3 h-3 rounded-full shrink-0 shadow-sm ${
//                           needsAttention ? "bg-red-500 animate-pulse shadow-red-500/50" : "bg-emerald-500 shadow-emerald-500/50"
//                         }`} />
//                         <div className="min-w-0">
//                           <h4 className="font-bold text-sm truncate tracking-tight text-gray-900 dark:text-white">
//                             {task.task_name}
//                           </h4>
//                           <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
//                             task.status === "completed"
//                               ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
//                               : task.status === "submitted"
//                               ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
//                               : task.status === "needs_revision"
//                               ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
//                               : "bg-orange-500/10 text-orange-500 border border-orange-500/20"
//                           }`}>
//                             {task.status ? task.status.replace("_", " ") : "pending"}
//                           </span>
//                         </div>
//                       </div>

//                       {needsAttention && (
//                         <span className="text-[10px] font-black tracking-wider uppercase text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-xl shrink-0">
//                           Review Needed
//                         </span>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             ) : (
//               <div className="text-center py-16 text-gray-400 space-y-2">
//                 <FileCode2 size={36} className="mx-auto opacity-40 text-purple-500" />
//                 <p className="text-sm font-bold">No tasks assigned to this student yet.</p>
//               </div>
//             )
//           ) : (
//             <div className="text-center py-16 text-gray-400 space-y-2">
//               <User size={36} className="mx-auto opacity-40 text-purple-500" />
//               <p className="text-sm font-bold">Select a student above to inspect their task timeline.</p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Bottom Expanded Review Panel */}
//       {activeTask && (
//         <div className="bg-white/90 dark:bg-white/[0.04] backdrop-blur-2xl p-6 md:p-8 rounded-[32px] border border-gray-200/80 dark:border-white/10 shadow-2xl space-y-6 animate-fade-in">
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-white/5 pb-5">
//             <div>
//               <span className="text-xs font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
//                 Active Review Stream
//               </span>
//               <h3 className="text-2xl font-black mt-2 text-gray-900 dark:text-white tracking-tight">{activeTask.task_name}</h3>
//             </div>
//             <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${
//               activeTask.status === "completed"
//                 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/25"
//                 : activeTask.status === "submitted"
//                 ? "bg-blue-500/10 text-blue-500 border-blue-500/25"
//                 : activeTask.status === "needs_revision"
//                 ? "bg-amber-500/10 text-amber-500 border-amber-500/25"
//                 : "bg-orange-500/10 text-orange-500 border-orange-500/25"
//             }`}>
//               {activeTask.status ? activeTask.status.replace("_", " ") : "pending"}
//             </span>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//             <div className="space-y-4">
//               <div>
//                 <label className="text-xs font-black uppercase tracking-wider text-gray-400 block mb-2">Instructions / Brief</label>
//                 <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50/80 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5 p-5 rounded-2xl shadow-inner">
//                   {activeTask.description}
//                 </div>
//               </div>

//               {activeTask.submission_link && (
//                 <div>
//                   <label className="text-xs font-black uppercase tracking-wider text-gray-400 block mb-2">Student Deployment / Link</label>
//                   <a
//                     href={activeTask.submission_link}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="flex items-center justify-between gap-2 text-purple-600 dark:text-purple-400 bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/40 p-4 rounded-2xl transition-all group font-bold text-sm"
//                   >
//                     <span className="truncate">{activeTask.submission_link}</span>
//                     <ExternalLink size={16} className="shrink-0 group-hover:scale-110 transition-transform" />
//                   </a>
//                 </div>
//               )}

//               {activeTask.submitted_at && (
//                 <p className="text-xs font-medium text-gray-400">
//                   Timestamp: {new Date(activeTask.submitted_at).toLocaleString()}
//                 </p>
//               )}
//             </div>

//             <div className="space-y-5 bg-gray-50/60 dark:bg-white/[0.02] p-6 rounded-3xl border border-gray-200/60 dark:border-white/5 shadow-inner">
//               <div>
//                 <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Assign Grade</label>
//                 <input
//                   type="text"
//                   placeholder="e.g., A+, 95%, Mastered..."
//                   value={activeTask.grade || ""}
//                   onChange={(e) => {
//                     const val = e.target.value;
//                     setStudentAssignments((prev) =>
//                       prev.map((a) => (a.id === activeTask.id ? { ...a, grade: val } : a))
//                     );
//                   }}
//                   className="w-full rounded-2xl border border-gray-200 dark:border-white/10 p-3.5 bg-white dark:bg-white/5 text-sm font-medium focus:outline-none focus:border-purple-500 shadow-inner"
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Tutor Feedback</label>
//                 <textarea
//                   rows={3}
//                   placeholder="Write constructive guidance..."
//                   value={activeTask.tutor_feedback || ""}
//                   onChange={(e) => {
//                     const val = e.target.value;
//                     setStudentAssignments((prev) =>
//                       prev.map((a) => (a.id === activeTask.id ? { ...a, tutor_feedback: val } : a))
//                     );
//                   }}
//                   className="w-full rounded-2xl border border-gray-200 dark:border-white/10 p-3.5 bg-white dark:bg-white/5 resize-none text-sm font-medium focus:outline-none focus:border-purple-500 shadow-inner"
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-3 pt-2">
//                 <button
//                   onClick={() => handleReviewTask(activeTask.id, "needs_revision")}
//                   disabled={loading || activeTask.status !== "submitted"}
//                   className="py-3.5 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 disabled:opacity-40 disabled:cursor-not-allowed font-black rounded-2xl transition-all text-xs uppercase tracking-wider shadow-sm"
//                 >
//                   Request Revision
//                 </button>
//                 <button
//                   onClick={() => handleReviewTask(activeTask.id, "completed")}
//                   disabled={loading || activeTask.status !== "submitted"}
//                   className="py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 dark:disabled:bg-white/10 disabled:cursor-not-allowed text-white font-black rounded-2xl transition-all text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20"
//                 >
//                   Approve & Complete
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// // import React, { useState, useEffect } from "react";
// // import { supabase } from "../../../supabase";
// // import toast from "react-hot-toast";
// // import { BookOpen, CheckCircle2, User, Layers, Send, AlertCircle, Award, FileCode2, ExternalLink } from "lucide-react";

// // export default function TutorCourseAssignmentView({ userId }) {
// //   const [students, setStudents] = useState([]);
// //   const [selectedStudent, setSelectedStudent] = useState("");
// //   const [studentCourses, setStudentCourses] = useState([]);
// //   const [selectedCourse, setSelectedCourse] = useState("");
// //   const [courseLessons, setCourseLessons] = useState([]);
// //   const [selectedLessonId, setSelectedLessonId] = useState("");
// //   const [taskName, setTaskName] = useState("");
// //   const [taskDescription, setTaskDescription] = useState("");
// //   const [studentAssignments, setStudentAssignments] = useState([]);
// //   const [loading, setLoading] = useState(false);
  
// //   // Track currently active expanded task for bottom review panel
// //   const [selectedTaskId, setSelectedTaskId] = useState(null);

// //   useEffect(() => {
// //     fetchTutorStudents();
// //   }, [userId]);

// //   const fetchTutorStudents = async () => {
// //     const { data, error } = await supabase
// //       .from("users")
// //       .select("id, full_name, assigned_course_id")
// //       .eq("assigned_tutor_id", userId)
// //       .eq("role", "student");

// //     if (error) {
// //       toast.error("Failed to load students.");
// //     } else {
// //       setStudents(data || []);
// //     }
// //   };

// //   const fetchStudentCourses = async (studentId) => {
// //     try {
// //       // 1. Fetch from student_enrollments
// //       const { data: enrollments, error } = await supabase
// //         .from("student_enrollments")
// //         .select("course_id, courses(id, title)")
// //         .eq("student_id", studentId);

// //       if (error) throw error;

// //       let enrolledCourses = (enrollments || []).map((e) => e.courses).filter(Boolean);

// //       // 2. Fallback to assigned_course_id if enrollments are empty
// //       if (enrolledCourses.length === 0) {
// //         const student = students.find((s) => s.id === studentId);
// //         if (student?.assigned_course_id) {
// //           const { data: courseData } = await supabase
// //             .from("courses")
// //             .select("id, title")
// //             .eq("id", student.assigned_course_id)
// //             .maybeSingle();

// //           if (courseData) {
// //             enrolledCourses = [courseData];
// //           }
// //         }
// //       }

// //       setStudentCourses(enrolledCourses);
// //       if (enrolledCourses.length > 0) {
// //         setSelectedCourse(enrolledCourses[0].id);
// //         fetchCourseLessons(enrolledCourses[0].id, studentId);
// //       } else {
// //         setSelectedCourse("");
// //         setCourseLessons([]);
// //       }
// //     } catch (err) {
// //       console.error("Error loading student courses:", err.message);
// //       setStudentCourses([]);
// //     }
// //   };

// //   const fetchCourseLessons = async (courseId, studentId) => {
// //     try {
// //       const { data: lessonData, error: lessonError } = await supabase
// //         .from("course_lessons")
// //         .select("id, title, phase_id, position, course_phases!inner(course_id, phase_number)")
// //         .eq("course_phases.course_id", courseId)
// //         .order("phase_number", { ascending: true })
// //         .order("position", { ascending: true });

// //       if (lessonError) throw lessonError;

// //       const { data: progressData, error: progressError } = await supabase
// //         .from("student_lesson_progress")
// //         .select("lesson_id")
// //         .eq("student_id", studentId)
// //         .eq("status", "completed");

// //       if (progressError) throw progressError;

// //       const completedIds = new Set((progressData || []).map((p) => p.lesson_id));

// //       const allLessons = lessonData || [];
// //       const eligibleLessons = allLessons.filter((lesson, index) => {
// //         const isCompleted = completedIds.has(lesson.id);
// //         if (isCompleted) return false;

// //         const prevLesson = index > 0 ? allLessons[index - 1] : null;
// //         const isUnlocked = index === 0 || (prevLesson && completedIds.has(prevLesson.id));

// //         return isUnlocked;
// //       });

// //       setCourseLessons(eligibleLessons);
// //     } catch (err) {
// //       console.error("Error loading eligible lessons:", err.message);
// //       setCourseLessons([]);
// //     }
// //   };

// //   const handleStudentChange = async (studentId) => {
// //     setSelectedStudent(studentId);
// //     setSelectedLessonId("");
// //     setSelectedTaskId(null);

// //     if (studentId) {
// //       await fetchStudentCourses(studentId);
// //       await fetchStudentAssignments(studentId);
// //     } else {
// //       setStudentCourses([]);
// //       setSelectedCourse("");
// //       setCourseLessons([]);
// //       setStudentAssignments([]);
// //     }
// //   };

// //   const handleCourseChange = async (courseId) => {
// //     setSelectedCourse(courseId);
// //     setSelectedLessonId("");
// //     if (selectedStudent && courseId) {
// //       await fetchCourseLessons(courseId, selectedStudent);
// //     } else {
// //       setCourseLessons([]);
// //     }
// //   };

// //   const fetchStudentAssignments = async (studentId) => {
// //     const { data, error } = await supabase
// //       .from("student_assignments")
// //       .select("*")
// //       .eq("student_id", studentId)
// //       .order("created_at", { ascending: false });

// //     if (!error) {
// //       const tasks = data || [];
// //       setStudentAssignments(tasks);
// //       if (tasks.length > 0 && !selectedTaskId) {
// //         setSelectedTaskId(tasks[0].id);
// //       }
// //     }
// //   };

// //   const handleReviewTask = async (taskId, newStatus = "completed") => {
// //     const task = studentAssignments.find((a) => a.id === taskId);
// //     if (!task) return;

// //     setLoading(true);

// //     const { error } = await supabase
// //       .from("student_assignments")
// //       .update({
// //         tutor_feedback: task.tutor_feedback,
// //         grade: task.grade,
// //         status: newStatus,
// //         updated_at: new Date().toISOString(),
// //       })
// //       .eq("id", taskId);

// //     setLoading(false);

// //     if (error) {
// //       toast.error("Failed to save review.");
// //       return;
// //     }

// //     toast.success(newStatus === "completed" ? "Assignment marked as completed! 🎉" : "Requested revisions from student.");
// //     fetchStudentAssignments(selectedStudent);
// //   };

// //   const handleCreateTask = async (e) => {
// //     e.preventDefault();
// //     if (!selectedStudent || !taskName.trim() || !taskDescription.trim() || !selectedLessonId) {
// //       toast.error("Please fill in all required fields.");
// //       return;
// //     }

// //     setLoading(true);
// //     const { error } = await supabase
// //       .from("student_assignments")
// //       .insert([
// //         {
// //           tutor_id: userId,
// //           student_id: selectedStudent,
// //           lesson_id: selectedLessonId,
// //           task_name: taskName,
// //           description: taskDescription,
// //           status: "pending",
// //         },
// //       ]);

// //     setLoading(false);

// //     if (error) {
// //       toast.error("Failed to create assignment task.");
// //     } else {
// //       toast.success("Assignment task dispatched successfully! 🚀");
// //       setTaskName("");
// //       setTaskDescription("");
// //       setSelectedLessonId("");
// //       fetchStudentAssignments(selectedStudent);
// //     }
// //   };

// //   const activeTask = studentAssignments.find((a) => a.id === selectedTaskId);
// //   const isFormValid = Boolean(selectedStudent && selectedCourse && selectedLessonId && taskName.trim() && taskDescription.trim());

// //   return (
// //     <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-gray-900 dark:text-white">
// //       {/* Premium Header Banner */}
// //       <div className="bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-slate-900/50 dark:from-purple-950/60 dark:via-indigo-950/40 dark:to-slate-950/80 backdrop-blur-2xl border border-purple-500/20 rounded-[35px] p-6 md:p-8 shadow-2xl relative overflow-hidden">
// //         <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 blur-[120px] pointer-events-none" />
// //         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
// //           <div>
// //             <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-600 dark:text-purple-300 px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase mb-3 border border-purple-500/20">
// //               <FileCode2 size={15} className="text-purple-500" />
// //               TUTOR DISPATCH WORKSPACE
// //             </div>
// //             <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 dark:from-white dark:via-purple-200 dark:to-indigo-300 bg-clip-text text-transparent">
// //               Student Homework & Task Control
// //             </h1>
// //             <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-xl text-sm leading-relaxed">
// //               Dispatch precision coding tasks to multi-course modules and review live student submissions seamlessly.
// //             </p>
// //           </div>
// //         </div>
// //       </div>

// //       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
// //         {/* Left Column: Dispatch Form */}
// //         <div className="lg:col-span-5 bg-white/80 dark:bg-white/[0.04] backdrop-blur-2xl p-6 md:p-8 rounded-[32px] border border-gray-200/80 dark:border-white/10 shadow-xl space-y-6">
// //           <div className="flex items-center gap-3 border-b border-gray-100 dark:border-white/5 pb-4">
// //             <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 font-black">
// //               <Send size={18} />
// //             </div>
// //             <div>
// //               <h3 className="text-lg font-black tracking-tight">Assign Task</h3>
// //               <p className="text-xs text-gray-400">Target uncompleted curriculum nodes</p>
// //             </div>
// //           </div>

// //           <form onSubmit={handleCreateTask} className="space-y-4">
// //             <div>
// //               <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Select Student</label>
// //               <select
// //                 value={selectedStudent}
// //                 onChange={(e) => handleStudentChange(e.target.value)}
// //                 className="w-full p-3.5 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:border-purple-500 text-sm font-medium transition-all shadow-inner"
// //               >
// //                 <option value="" className="dark:bg-slate-900">-- Choose Student --</option>
// //                 {students.map((s) => (
// //                   <option key={s.id} value={s.id} className="dark:bg-slate-900">{s.full_name}</option>
// //                 ))}
// //               </select>
// //             </div>

// //             {selectedStudent && (
// //               <div>
// //                 <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Select Student Course</label>
// //                 <select
// //                   value={selectedCourse}
// //                   onChange={(e) => handleCourseChange(e.target.value)}
// //                   className="w-full p-3.5 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:border-purple-500 text-sm font-medium transition-all shadow-inner"
// //                 >
// //                   <option value="" className="dark:bg-slate-900">-- Choose Course --</option>
// //                   {studentCourses.map((c) => (
// //                     <option key={c.id} value={c.id} className="dark:bg-slate-900">{c.title}</option>
// //                   ))}
// //                 </select>
// //               </div>
// //             )}

// //             <div>
// //               <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Target Unlocked Lesson</label>
// //               <select
// //                 value={selectedLessonId}
// //                 onChange={(e) => setSelectedLessonId(e.target.value)}
// //                 disabled={!selectedCourse}
// //                 className="w-full p-3.5 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:border-purple-500 text-sm font-medium transition-all shadow-inner disabled:opacity-40"
// //               >
// //                 <option value="" className="dark:bg-slate-900">-- Choose Eligible Lesson --</option>
// //                 {courseLessons.map((l) => (
// //                   <option key={l.id} value={l.id} className="dark:bg-slate-900">
// //                     Phase {l.course_phases?.phase_number}: {l.title}
// //                   </option>
// //                 ))}
// //               </select>
// //             </div>

// //             <div>
// //               <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Task Title</label>
// //               <input
// //                 type="text"
// //                 placeholder="e.g., Build a Python Function"
// //                 value={taskName}
// //                 onChange={(e) => setTaskName(e.target.value)}
// //                 className="w-full p-3.5 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:border-purple-500 text-sm font-medium transition-all shadow-inner placeholder-gray-400"
// //               />
// //             </div>

// //             <div>
// //               <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Task Instructions</label>
// //               <textarea
// //                 placeholder="Provide precise execution requirements..."
// //                 value={taskDescription}
// //                 onChange={(e) => setTaskDescription(e.target.value)}
// //                 rows={4}
// //                 className="w-full p-3.5 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:border-purple-500 text-sm font-medium transition-all shadow-inner resize-none placeholder-gray-400"
// //               />
// //             </div>

// //             <button
// //               type="submit"
// //               disabled={loading || !isFormValid}
// //               className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white shadow-xl transition-all flex items-center justify-center gap-2 ${
// //                 isFormValid && !loading
// //                   ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:opacity-95 shadow-purple-500/25 cursor-pointer scale-[1.01] active:scale-[0.99]"
// //                   : "bg-gray-300 dark:bg-white/10 text-gray-400 cursor-not-allowed shadow-none"
// //               }`}
// //             >
// //               <Send size={16} />
// //               Dispatch Task
// //             </button>
// //           </form>
// //         </div>

// //         {/* Right Column: Sidebar Task List */}
// //         <div className="lg:col-span-7 bg-white/80 dark:bg-white/[0.04] backdrop-blur-2xl p-6 md:p-8 rounded-[32px] border border-gray-200/80 dark:border-white/10 shadow-xl space-y-5">
// //           <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4">
// //             <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
// //               <Layers size={18} className="text-purple-500" /> Assigned Task Logs
// //             </h3>
// //             {selectedStudent && (
// //               <span className="text-xs bg-purple-500/10 text-purple-600 dark:text-purple-300 font-bold px-3 py-1 rounded-full border border-purple-500/20">
// //                 {studentAssignments.length} Total
// //               </span>
// //             )}
// //           </div>
          
// //           {selectedStudent ? (
// //             studentAssignments.length > 0 ? (
// //               <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2 scrollbar-none">
// //                 {studentAssignments.map((task) => {
// //                   const isSelected = selectedTaskId === task.id;
// //                   const needsAttention = task.status === "submitted" || task.status === "pending";

// //                   return (
// //                     <div
// //                       key={task.id}
// //                       onClick={() => setSelectedTaskId(task.id)}
// //                       className={`cursor-pointer rounded-2xl p-4 transition-all border flex items-center justify-between group ${
// //                         isSelected
// //                           ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent shadow-lg shadow-purple-500/30 scale-[1.01]"
// //                           : "bg-gray-50/60 dark:bg-white/[0.02] border-gray-200/60 dark:border-white/5 hover:border-purple-500/40"
// //                       }`}
// //                     >
// //                       <div className="flex items-center gap-3.5 min-w-0 pr-3">
// //                         <span className={`w-3 h-3 rounded-full shrink-0 shadow-sm ${
// //                           needsAttention ? "bg-red-500 animate-pulse shadow-red-500/50" : "bg-emerald-500 shadow-emerald-500/50"
// //                         }`} />
// //                         <div className="min-w-0">
// //                           <h4 className={`font-bold text-sm truncate tracking-tight ${isSelected ? "text-white" : "text-gray-900 dark:text-white"}`}>
// //                             {task.task_name}
// //                           </h4>
// //                           <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
// //                             isSelected
// //                               ? "bg-white/20 text-white"
// //                               : task.status === "completed"
// //                               ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
// //                               : task.status === "submitted"
// //                               ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
// //                               : task.status === "needs_revision"
// //                               ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
// //                               : "bg-orange-500/10 text-orange-500 border border-orange-500/20"
// //                           }`}>
// //                             {task.status ? task.status.replace("_", " ") : "pending"}
// //                           </span>
// //                         </div>
// //                       </div>

// //                       {needsAttention && !isSelected && (
// //                         <span className="text-[10px] font-black tracking-wider uppercase text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-xl shrink-0">
// //                           Review Needed
// //                         </span>
// //                       )}
// //                     </div>
// //                   );
// //                 })}
// //               </div>
// //             ) : (
// //               <div className="text-center py-16 text-gray-400 space-y-2">
// //                 <FileCode2 size={36} className="mx-auto opacity-40 text-purple-500" />
// //                 <p className="text-sm font-bold">No tasks assigned to this student yet.</p>
// //               </div>
// //             )
// //           ) : (
// //             <div className="text-center py-16 text-gray-400 space-y-2">
// //               <User size={36} className="mx-auto opacity-40 text-purple-500" />
// //               <p className="text-sm font-bold">Select a student above to inspect their task timeline.</p>
// //             </div>
// //           )}
// //         </div>
// //       </div>

// //       {/* Bottom Expanded Review Panel */}
// //       {activeTask && (
// //         <div className="bg-white/90 dark:bg-white/[0.04] backdrop-blur-2xl p-6 md:p-8 rounded-[32px] border border-gray-200/80 dark:border-white/10 shadow-2xl space-y-6 animate-fade-in">
// //           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-white/5 pb-5">
// //             <div>
// //               <span className="text-xs font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
// //                 Active Review Stream
// //               </span>
// //               <h3 className="text-2xl font-black mt-2 text-gray-900 dark:text-white tracking-tight">{activeTask.task_name}</h3>
// //             </div>
// //             <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${
// //               activeTask.status === "completed"
// //                 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/25"
// //                 : activeTask.status === "submitted"
// //                 ? "bg-blue-500/10 text-blue-500 border-blue-500/25"
// //                 : activeTask.status === "needs_revision"
// //                 ? "bg-amber-500/10 text-amber-500 border-amber-500/25"
// //                 : "bg-orange-500/10 text-orange-500 border-orange-500/25"
// //             }`}>
// //               {activeTask.status ? activeTask.status.replace("_", " ") : "pending"}
// //             </span>
// //           </div>

// //           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
// //             <div className="space-y-4">
// //               <div>
// //                 <label className="text-xs font-black uppercase tracking-wider text-gray-400 block mb-2">Instructions / Brief</label>
// //                 <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50/80 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5 p-5 rounded-2xl shadow-inner">
// //                   {activeTask.description}
// //                 </div>
// //               </div>

// //               {activeTask.submission_link && (
// //                 <div>
// //                   <label className="text-xs font-black uppercase tracking-wider text-gray-400 block mb-2">Student Deployment / Link</label>
// //                   <a
// //                     href={activeTask.submission_link}
// //                     target="_blank"
// //                     rel="noopener noreferrer"
// //                     className="flex items-center justify-between gap-2 text-purple-600 dark:text-purple-400 bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/40 p-4 rounded-2xl transition-all group font-bold text-sm"
// //                   >
// //                     <span className="truncate">{activeTask.submission_link}</span>
// //                     <ExternalLink size={16} className="shrink-0 group-hover:scale-110 transition-transform" />
// //                   </a>
// //                 </div>
// //               )}

// //               {activeTask.submitted_at && (
// //                 <p className="text-xs font-medium text-gray-400">
// //                   Timestamp: {new Date(activeTask.submitted_at).toLocaleString()}
// //                 </p>
// //               )}
// //             </div>

// //             <div className="space-y-5 bg-gray-50/60 dark:bg-white/[0.02] p-6 rounded-3xl border border-gray-200/60 dark:border-white/5 shadow-inner">
// //               <div>
// //                 <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Assign Grade</label>
// //                 <input
// //                   type="text"
// //                   placeholder="e.g., A+, 95%, Mastered..."
// //                   value={activeTask.grade || ""}
// //                   onChange={(e) => {
// //                     const val = e.target.value;
// //                     setStudentAssignments((prev) =>
// //                       prev.map((a) => (a.id === activeTask.id ? { ...a, grade: val } : a))
// //                     );
// //                   }}
// //                   className="w-full rounded-2xl border border-gray-200 dark:border-white/10 p-3.5 bg-white dark:bg-white/5 text-sm font-medium focus:outline-none focus:border-purple-500 shadow-inner"
// //                 />
// //               </div>

// //               <div>
// //                 <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Tutor Feedback</label>
// //                 <textarea
// //                   rows={3}
// //                   placeholder="Write constructive guidance..."
// //                   value={activeTask.tutor_feedback || ""}
// //                   onChange={(e) => {
// //                     const val = e.target.value;
// //                     setStudentAssignments((prev) =>
// //                       prev.map((a) => (a.id === activeTask.id ? { ...a, tutor_feedback: val } : a))
// //                     );
// //                   }}
// //                   className="w-full rounded-2xl border border-gray-200 dark:border-white/10 p-3.5 bg-white dark:bg-white/5 resize-none text-sm font-medium focus:outline-none focus:border-purple-500 shadow-inner"
// //                 />
// //               </div>

// //               <div className="grid grid-cols-2 gap-3 pt-2">
// //                 <button
// //                   onClick={() => handleReviewTask(activeTask.id, "needs_revision")}
// //                   disabled={loading || activeTask.status !== "submitted"}
// //                   className="py-3.5 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 disabled:opacity-40 disabled:cursor-not-allowed font-black rounded-2xl transition-all text-xs uppercase tracking-wider shadow-sm"
// //                 >
// //                   Request Revision
// //                 </button>
// //                 <button
// //                   onClick={() => handleReviewTask(activeTask.id, "completed")}
// //                   disabled={loading || activeTask.status !== "submitted"}
// //                   className="py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 dark:disabled:bg-white/10 disabled:cursor-not-allowed text-white font-black rounded-2xl transition-all text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20"
// //                 >
// //                   Approve & Complete
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }
// // // import React, { useState, useEffect } from "react";
// // // import { supabase } from "../../../supabase";
// // // import toast from "react-hot-toast";
// // // import { BookOpen, CheckCircle2, User, Layers, Send, AlertCircle, Award, FileCode2, ExternalLink } from "lucide-react";

// // // export default function TutorCourseAssignmentView({ userId }) {
// // //   const [students, setStudents] = useState([]);
// // //   const [selectedStudent, setSelectedStudent] = useState("");
// // //   const [selectedCourse, setSelectedCourse] = useState("");
// // //   const [courseLessons, setCourseLessons] = useState([]);
// // //   const [selectedLessonId, setSelectedLessonId] = useState("");
// // //   const [taskName, setTaskName] = useState("");
// // //   const [taskDescription, setTaskDescription] = useState("");
// // //   const [studentAssignments, setStudentAssignments] = useState([]);
// // //   const [loading, setLoading] = useState(false);
  
// // //   // Track currently active expanded task for bottom review panel
// // //   const [selectedTaskId, setSelectedTaskId] = useState(null);

// // //   useEffect(() => {
// // //     fetchTutorStudents();
// // //   }, [userId]);

// // //   const fetchTutorStudents = async () => {
// // //     const { data, error } = await supabase
// // //       .from("users")
// // //       .select("id, full_name, assigned_course_id")
// // //       .eq("assigned_tutor_id", userId)
// // //       .eq("role", "student");

// // //     if (error) {
// // //       toast.error("Failed to load students.");
// // //     } else {
// // //       setStudents(data || []);
// // //     }
// // //   };

// // //   const fetchCourseLessons = async (courseId, studentId) => {
// // //     try {
// // //       const { data: lessonData, error: lessonError } = await supabase
// // //         .from("course_lessons")
// // //         .select("id, title, phase_id, position, course_phases!inner(course_id, phase_number)")
// // //         .eq("course_phases.course_id", courseId)
// // //         .order("phase_number", { ascending: true })
// // //         .order("position", { ascending: true });

// // //       if (lessonError) throw lessonError;

// // //       const { data: progressData, error: progressError } = await supabase
// // //         .from("student_lesson_progress")
// // //         .select("lesson_id")
// // //         .eq("student_id", studentId)
// // //         .eq("status", "completed");

// // //       if (progressError) throw progressError;

// // //       const completedIds = new Set((progressData || []).map((p) => p.lesson_id));

// // //       const allLessons = lessonData || [];
// // //       const eligibleLessons = allLessons.filter((lesson, index) => {
// // //         const isCompleted = completedIds.has(lesson.id);
// // //         if (isCompleted) return false;

// // //         const prevLesson = index > 0 ? allLessons[index - 1] : null;
// // //         const isUnlocked = index === 0 || (prevLesson && completedIds.has(prevLesson.id));

// // //         return isUnlocked;
// // //       });

// // //       setCourseLessons(eligibleLessons);
// // //     } catch (err) {
// // //       console.error("Error loading eligible lessons:", err.message);
// // //       setCourseLessons([]);
// // //     }
// // //   };

// // //   const handleStudentChange = async (studentId) => {
// // //     setSelectedStudent(studentId);
// // //     setSelectedLessonId("");
// // //     setSelectedTaskId(null);
// // //     const student = students.find((s) => s.id === studentId);
    
// // //     if (student?.assigned_course_id) {
// // //       setSelectedCourse(student.assigned_course_id);
// // //       await fetchCourseLessons(student.assigned_course_id, studentId);
// // //     } else {
// // //       setSelectedCourse("");
// // //       setCourseLessons([]);
// // //     }
// // //     await fetchStudentAssignments(studentId);
// // //   };

// // //   const fetchStudentAssignments = async (studentId) => {
// // //     const { data, error } = await supabase
// // //       .from("student_assignments")
// // //       .select("*")
// // //       .eq("student_id", studentId)
// // //       .order("created_at", { ascending: false });

// // //     if (!error) {
// // //       const tasks = data || [];
// // //       setStudentAssignments(tasks);
// // //       if (tasks.length > 0 && !selectedTaskId) {
// // //         setSelectedTaskId(tasks[0].id);
// // //       }
// // //     }
// // //   };

// // //   const handleReviewTask = async (taskId, newStatus = "completed") => {
// // //     const task = studentAssignments.find((a) => a.id === taskId);
// // //     if (!task) return;

// // //     setLoading(true);

// // //     const { error } = await supabase
// // //       .from("student_assignments")
// // //       .update({
// // //         tutor_feedback: task.tutor_feedback,
// // //         grade: task.grade,
// // //         status: newStatus,
// // //         updated_at: new Date().toISOString(),
// // //       })
// // //       .eq("id", taskId);

// // //     setLoading(false);

// // //     if (error) {
// // //       toast.error("Failed to save review.");
// // //       return;
// // //     }

// // //     toast.success(newStatus === "completed" ? "Assignment marked as completed! 🎉" : "Requested revisions from student.");
// // //     fetchStudentAssignments(selectedStudent);
// // //   };

// // //   const handleCreateTask = async (e) => {
// // //     e.preventDefault();
// // //     if (!selectedStudent || !taskName.trim() || !taskDescription.trim() || !selectedLessonId) {
// // //       toast.error("Please fill in all required fields.");
// // //       return;
// // //     }

// // //     setLoading(true);
// // //     const { error } = await supabase
// // //       .from("student_assignments")
// // //       .insert([
// // //         {
// // //           tutor_id: userId,
// // //           student_id: selectedStudent,
// // //           lesson_id: selectedLessonId,
// // //           task_name: taskName,
// // //           description: taskDescription,
// // //           status: "pending",
// // //         },
// // //       ]);

// // //     setLoading(false);

// // //     if (error) {
// // //       toast.error("Failed to create assignment task.");
// // //     } else {
// // //       toast.success("Assignment task dispatched successfully! 🚀");
// // //       setTaskName("");
// // //       setTaskDescription("");
// // //       setSelectedLessonId("");
// // //       fetchStudentAssignments(selectedStudent);
// // //     }
// // //   };

// // //   const activeTask = studentAssignments.find((a) => a.id === selectedTaskId);
// // //   const isFormValid = Boolean(selectedStudent && selectedLessonId && taskName.trim() && taskDescription.trim());

// // //   return (
// // //     <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-gray-900 dark:text-white">
// // //       {/* Premium Header Banner */}
// // //       <div className="bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-slate-900/50 dark:from-purple-950/60 dark:via-indigo-950/40 dark:to-slate-950/80 backdrop-blur-2xl border border-purple-500/20 rounded-[35px] p-6 md:p-8 shadow-2xl relative overflow-hidden">
// // //         <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 blur-[120px] pointer-events-none" />
// // //         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
// // //           <div>
// // //             <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-600 dark:text-purple-300 px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase mb-3 border border-purple-500/20">
// // //               <FileCode2 size={15} className="text-purple-500" />
// // //               TUTOR DISPATCH WORKSPACE
// // //             </div>
// // //             <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 dark:from-white dark:via-purple-200 dark:to-indigo-300 bg-clip-text text-transparent">
// // //               Student Homework & Task Control
// // //             </h1>
// // //             <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-xl text-sm leading-relaxed">
// // //               Dispatch precision coding tasks to unlocked course modules and review live student submissions seamlessly.
// // //             </p>
// // //           </div>
// // //         </div>
// // //       </div>

// // //       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
// // //         {/* Left Column: Dispatch Form */}
// // //         <div className="lg:col-span-5 bg-white/80 dark:bg-white/[0.04] backdrop-blur-2xl p-6 md:p-8 rounded-[32px] border border-gray-200/80 dark:border-white/10 shadow-xl space-y-6">
// // //           <div className="flex items-center gap-3 border-b border-gray-100 dark:border-white/5 pb-4">
// // //             <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 font-black">
// // //               <Send size={18} />
// // //             </div>
// // //             <div>
// // //               <h3 className="text-lg font-black tracking-tight">Assign Task</h3>
// // //               <p className="text-xs text-gray-400">Target uncompleted curriculum nodes</p>
// // //             </div>
// // //           </div>

// // //           <form onSubmit={handleCreateTask} className="space-y-4">
// // //             <div>
// // //               <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Select Student</label>
// // //               <select
// // //                 value={selectedStudent}
// // //                 onChange={(e) => handleStudentChange(e.target.value)}
// // //                 className="w-full p-3.5 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:border-purple-500 text-sm font-medium transition-all shadow-inner"
// // //               >
// // //                 <option value="" className="dark:bg-slate-900">-- Choose Student --</option>
// // //                 {students.map((s) => (
// // //                   <option key={s.id} value={s.id} className="dark:bg-slate-900">{s.full_name}</option>
// // //                 ))}
// // //               </select>
// // //             </div>

// // //             <div>
// // //               <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Target Unlocked Lesson</label>
// // //               <select
// // //                 value={selectedLessonId}
// // //                 onChange={(e) => setSelectedLessonId(e.target.value)}
// // //                 disabled={!selectedStudent}
// // //                 className="w-full p-3.5 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:border-purple-500 text-sm font-medium transition-all shadow-inner disabled:opacity-40"
// // //               >
// // //                 <option value="" className="dark:bg-slate-900">-- Choose Eligible Lesson --</option>
// // //                 {courseLessons.map((l) => (
// // //                   <option key={l.id} value={l.id} className="dark:bg-slate-900">
// // //                     Phase {l.course_phases?.phase_number}: {l.title}
// // //                   </option>
// // //                 ))}
// // //               </select>
// // //             </div>

// // //             <div>
// // //               <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Task Title</label>
// // //               <input
// // //                 type="text"
// // //                 placeholder="e.g., Build a Python Function"
// // //                 value={taskName}
// // //                 onChange={(e) => setTaskName(e.target.value)}
// // //                 className="w-full p-3.5 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:border-purple-500 text-sm font-medium transition-all shadow-inner placeholder-gray-400"
// // //               />
// // //             </div>

// // //             <div>
// // //               <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Task Instructions</label>
// // //               <textarea
// // //                 placeholder="Provide precise execution requirements..."
// // //                 value={taskDescription}
// // //                 onChange={(e) => setTaskDescription(e.target.value)}
// // //                 rows={4}
// // //                 className="w-full p-3.5 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:border-purple-500 text-sm font-medium transition-all shadow-inner resize-none placeholder-gray-400"
// // //               />
// // //             </div>

// // //             <button
// // //               type="submit"
// // //               disabled={loading || !isFormValid}
// // //               className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white shadow-xl transition-all flex items-center justify-center gap-2 ${
// // //                 isFormValid && !loading
// // //                   ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:opacity-95 shadow-purple-500/25 cursor-pointer scale-[1.01] active:scale-[0.99]"
// // //                   : "bg-gray-300 dark:bg-white/10 text-gray-400 cursor-not-allowed shadow-none"
// // //               }`}
// // //             >
// // //               <Send size={16} />
// // //               Dispatch Task
// // //             </button>
// // //           </form>
// // //         </div>

// // //         {/* Right Column: Sidebar Task List */}
// // //         <div className="lg:col-span-7 bg-white/80 dark:bg-white/[0.04] backdrop-blur-2xl p-6 md:p-8 rounded-[32px] border border-gray-200/80 dark:border-white/10 shadow-xl space-y-5">
// // //           <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4">
// // //             <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
// // //               <Layers size={18} className="text-purple-500" /> Assigned Task Logs
// // //             </h3>
// // //             {selectedStudent && (
// // //               <span className="text-xs bg-purple-500/10 text-purple-600 dark:text-purple-300 font-bold px-3 py-1 rounded-full border border-purple-500/20">
// // //                 {studentAssignments.length} Total
// // //               </span>
// // //             )}
// // //           </div>
          
// // //           {selectedStudent ? (
// // //             studentAssignments.length > 0 ? (
// // //               <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2 scrollbar-none">
// // //                 {studentAssignments.map((task) => {
// // //                   const isSelected = selectedTaskId === task.id;
// // //                   const needsAttention = task.status === "submitted" || task.status === "pending";

// // //                   return (
// // //                     <div
// // //                       key={task.id}
// // //                       onClick={() => setSelectedTaskId(task.id)}
// // //                       className={`cursor-pointer rounded-2xl p-4 transition-all border flex items-center justify-between group ${
// // //                         isSelected
// // //                           ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent shadow-lg shadow-purple-500/30 scale-[1.01]"
// // //                           : "bg-gray-50/60 dark:bg-white/[0.02] border-gray-200/60 dark:border-white/5 hover:border-purple-500/40"
// // //                       }`}
// // //                     >
// // //                       <div className="flex items-center gap-3.5 min-w-0 pr-3">
// // //                         <span className={`w-3 h-3 rounded-full shrink-0 shadow-sm ${
// // //                           needsAttention ? "bg-red-500 animate-pulse shadow-red-500/50" : "bg-emerald-500 shadow-emerald-500/50"
// // //                         }`} />
// // //                         <div className="min-w-0">
// // //                           <h4 className={`font-bold text-sm truncate tracking-tight ${isSelected ? "text-white" : "text-gray-900 dark:text-white"}`}>
// // //                             {task.task_name}
// // //                           </h4>
// // //                           <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
// // //                             isSelected
// // //                               ? "bg-white/20 text-white"
// // //                               : task.status === "completed"
// // //                               ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
// // //                               : task.status === "submitted"
// // //                               ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
// // //                               : task.status === "needs_revision"
// // //                               ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
// // //                               : "bg-orange-500/10 text-orange-500 border border-orange-500/20"
// // //                           }`}>
// // //                             {task.status ? task.status.replace("_", " ") : "pending"}
// // //                           </span>
// // //                         </div>
// // //                       </div>

// // //                       {needsAttention && !isSelected && (
// // //                         <span className="text-[10px] font-black tracking-wider uppercase text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-xl shrink-0">
// // //                           Review Needed
// // //                         </span>
// // //                       )}
// // //                     </div>
// // //                   );
// // //                 })}
// // //               </div>
// // //             ) : (
// // //               <div className="text-center py-16 text-gray-400 space-y-2">
// // //                 <FileCode2 size={36} className="mx-auto opacity-40 text-purple-500" />
// // //                 <p className="text-sm font-bold">No tasks assigned to this student yet.</p>
// // //               </div>
// // //             )
// // //           ) : (
// // //             <div className="text-center py-16 text-gray-400 space-y-2">
// // //               <User size={36} className="mx-auto opacity-40 text-purple-500" />
// // //               <p className="text-sm font-bold">Select a student above to inspect their task timeline.</p>
// // //             </div>
// // //           )}
// // //         </div>
// // //       </div>

// // //       {/* Bottom Expanded Review Panel */}
// // //       {activeTask && (
// // //         <div className="bg-white/90 dark:bg-white/[0.04] backdrop-blur-2xl p-6 md:p-8 rounded-[32px] border border-gray-200/80 dark:border-white/10 shadow-2xl space-y-6 animate-fade-in">
// // //           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-white/5 pb-5">
// // //             <div>
// // //               <span className="text-xs font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
// // //                 Active Review Stream
// // //               </span>
// // //               <h3 className="text-2xl font-black mt-2 text-gray-900 dark:text-white tracking-tight">{activeTask.task_name}</h3>
// // //             </div>
// // //             <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${
// // //               activeTask.status === "completed"
// // //                 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/25"
// // //                 : activeTask.status === "submitted"
// // //                 ? "bg-blue-500/10 text-blue-500 border-blue-500/25"
// // //                 : activeTask.status === "needs_revision"
// // //                 ? "bg-amber-500/10 text-amber-500 border-amber-500/25"
// // //                 : "bg-orange-500/10 text-orange-500 border-orange-500/25"
// // //             }`}>
// // //               {activeTask.status ? activeTask.status.replace("_", " ") : "pending"}
// // //             </span>
// // //           </div>

// // //           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
// // //             <div className="space-y-4">
// // //               <div>
// // //                 <label className="text-xs font-black uppercase tracking-wider text-gray-400 block mb-2">Instructions / Brief</label>
// // //                 <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50/80 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5 p-5 rounded-2xl shadow-inner">
// // //                   {activeTask.description}
// // //                 </div>
// // //               </div>

// // //               {activeTask.submission_link && (
// // //                 <div>
// // //                   <label className="text-xs font-black uppercase tracking-wider text-gray-400 block mb-2">Student Deployment / Link</label>
// // //                   <a
// // //                     href={activeTask.submission_link}
// // //                     target="_blank"
// // //                     rel="noopener noreferrer"
// // //                     className="flex items-center justify-between gap-2 text-purple-600 dark:text-purple-400 bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/40 p-4 rounded-2xl transition-all group font-bold text-sm"
// // //                   >
// // //                     <span className="truncate">{activeTask.submission_link}</span>
// // //                     <ExternalLink size={16} className="shrink-0 group-hover:scale-110 transition-transform" />
// // //                   </a>
// // //                 </div>
// // //               )}

// // //               {activeTask.submitted_at && (
// // //                 <p className="text-xs font-medium text-gray-400">
// // //                   Timestamp: {new Date(activeTask.submitted_at).toLocaleString()}
// // //                 </p>
// // //               )}
// // //             </div>

// // //             <div className="space-y-5 bg-gray-50/60 dark:bg-white/[0.02] p-6 rounded-3xl border border-gray-200/60 dark:border-white/5 shadow-inner">
// // //               <div>
// // //                 <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Assign Grade</label>
// // //                 <input
// // //                   type="text"
// // //                   placeholder="e.g., A+, 95%, Mastered..."
// // //                   value={activeTask.grade || ""}
// // //                   onChange={(e) => {
// // //                     const val = e.target.value;
// // //                     setStudentAssignments((prev) =>
// // //                       prev.map((a) => (a.id === activeTask.id ? { ...a, grade: val } : a))
// // //                     );
// // //                   }}
// // //                   className="w-full rounded-2xl border border-gray-200 dark:border-white/10 p-3.5 bg-white dark:bg-white/5 text-sm font-medium focus:outline-none focus:border-purple-500 shadow-inner"
// // //                 />
// // //               </div>

// // //               <div>
// // //                 <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Tutor Feedback</label>
// // //                 <textarea
// // //                   rows={3}
// // //                   placeholder="Write constructive guidance..."
// // //                   value={activeTask.tutor_feedback || ""}
// // //                   onChange={(e) => {
// // //                     const val = e.target.value;
// // //                     setStudentAssignments((prev) =>
// // //                       prev.map((a) => (a.id === activeTask.id ? { ...a, tutor_feedback: val } : a))
// // //                     );
// // //                   }}
// // //                   className="w-full rounded-2xl border border-gray-200 dark:border-white/10 p-3.5 bg-white dark:bg-white/5 resize-none text-sm font-medium focus:outline-none focus:border-purple-500 shadow-inner"
// // //                 />
// // //               </div>

// // //               <div className="grid grid-cols-2 gap-3 pt-2">
// // //                 <button
// // //                   onClick={() => handleReviewTask(activeTask.id, "needs_revision")}
// // //                   disabled={loading || activeTask.status !== "submitted"}
// // //                   className="py-3.5 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 disabled:opacity-40 disabled:cursor-not-allowed font-black rounded-2xl transition-all text-xs uppercase tracking-wider shadow-sm"
// // //                 >
// // //                   Request Revision
// // //                 </button>
// // //                 <button
// // //                   onClick={() => handleReviewTask(activeTask.id, "completed")}
// // //                   disabled={loading || activeTask.status !== "submitted"}
// // //                   className="py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 dark:disabled:bg-white/10 disabled:cursor-not-allowed text-white font-black rounded-2xl transition-all text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20"
// // //                 >
// // //                   Approve & Complete
// // //                 </button>
// // //               </div>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // }
// // // // import React, { useState, useEffect } from "react";
// // // // import { supabase } from "../../../supabase";
// // // // import toast from "react-hot-toast";
// // // // import { BookOpen, CheckCircle, User, Layers, Send } from "lucide-react";

// // // // export default function TutorCourseAssignmentView({ userId }) {
// // // //   const [students, setStudents] = useState([]);
// // // //   const [selectedStudent, setSelectedStudent] = useState("");
// // // //   const [selectedCourse, setSelectedCourse] = useState("");
// // // //   const [courseLessons, setCourseLessons] = useState([]);
// // // //   const [selectedLessonId, setSelectedLessonId] = useState("");
// // // //   const [taskName, setTaskName] = useState("");
// // // //   const [taskDescription, setTaskDescription] = useState("");
// // // //   const [studentAssignments, setStudentAssignments] = useState([]);
// // // //   const [loading, setLoading] = useState(false);

// // // //   useEffect(() => {
// // // //     fetchTutorStudents();
// // // //   }, [userId]);

// // // //   const fetchTutorStudents = async () => {
// // // //     const { data, error } = await supabase
// // // //       .from("users")
// // // //       .select("id, full_name, assigned_course_id")
// // // //       .eq("assigned_tutor_id", userId)
// // // //       .eq("role", "student");

// // // //     if (error) {
// // // //       toast.error("Failed to load students.");
// // // //     } else {
// // // //       setStudents(data || []);
// // // //     }
// // // //   };

// // // //   const fetchCourseLessons = async (courseId, studentId) => {
// // // //     try {
// // // //       // Fetch all lessons for the course ordered by position
// // // //       const { data: lessonData, error: lessonError } = await supabase
// // // //         .from("course_lessons")
// // // //         .select("id, title, phase_id, course_phases!inner(course_id, phase_number)")
// // // //         .eq("course_phases.course_id", courseId)
// // // //         .order("position", { ascending: true });

// // // //       if (lessonError) throw lessonError;

// // // //       // Fetch completed lessons for this specific student
// // // //       const { data: progressData, error: progressError } = await supabase
// // // //         .from("student_lesson_progress")
// // // //         .select("lesson_id")
// // // //         .eq("student_id", studentId)
// // // //         .eq("status", "completed");

// // // //       if (progressError) throw progressError;

// // // //       const completedIds = new Set((progressData || []).map((p) => p.lesson_id));

// // // //       // Filter: Unlocked (all lessons in sequence or simplified rule) and NOT completed
// // // //       // Here we filter out already completed lessons
// // // //       const uncompletedLessons = (lessonData || []).filter(
// // // //         (l) => !completedIds.has(l.id)
// // // //       );

// // // //       setCourseLessons(uncompletedLessons);
// // // //     } catch (err) {
// // // //       console.error("Error loading eligible lessons:", err.message);
// // // //       setCourseLessons([]);
// // // //     }
// // // //   };

// // // //   const handleStudentChange = async (studentId) => {
// // // //     setSelectedStudent(studentId);
// // // //     setSelectedLessonId("");
// // // //     const student = students.find((s) => s.id === studentId);
    
// // // //     if (student?.assigned_course_id) {
// // // //       setSelectedCourse(student.assigned_course_id);
// // // //       await fetchCourseLessons(student.assigned_course_id, studentId);
// // // //     } else {
// // // //       setSelectedCourse("");
// // // //       setCourseLessons([]);
// // // //     }
// // // //     await fetchStudentAssignments(studentId);
// // // //   };

// // // //   const fetchStudentAssignments = async (studentId) => {
// // // //     const { data, error } = await supabase
// // // //       .from("student_assignments")
// // // //       .select("*")
// // // //       .eq("student_id", studentId)
// // // //       .order("created_at", { ascending: false });

// // // //     if (!error) {
// // // //       setStudentAssignments(data || []);
// // // //     }
// // // //   };

// // // //   const handleReviewTask = async (taskId, newStatus = "completed") => {
// // // //     const task = studentAssignments.find((a) => a.id === taskId);
// // // //     if (!task) return;

// // // //     setLoading(true);

// // // //     const { error } = await supabase
// // // //       .from("student_assignments")
// // // //       .update({
// // // //         tutor_feedback: task.tutor_feedback,
// // // //         grade: task.grade,
// // // //         status: newStatus,
// // // //         updated_at: new Date().toISOString(),
// // // //       })
// // // //       .eq("id", taskId);

// // // //     setLoading(false);

// // // //     if (error) {
// // // //       toast.error("Failed to save review.");
// // // //       return;
// // // //     }

// // // //     toast.success(newStatus === "completed" ? "Assignment marked as completed!" : "Requested revisions from student.");
// // // //     fetchStudentAssignments(selectedStudent);
// // // //   };

// // // //   const handleCreateTask = async (e) => {
// // // //     e.preventDefault();
// // // //     if (!selectedStudent || !taskName.trim() || !taskDescription.trim() || !selectedLessonId) {
// // // //       toast.error("Please fill in all required fields (Student, Target Lesson, Title, and Instructions).");
// // // //       return;
// // // //     }

// // // //     setLoading(true);
// // // //     const { error } = await supabase
// // // //       .from("student_assignments")
// // // //       .insert([
// // // //         {
// // // //           tutor_id: userId,
// // // //           student_id: selectedStudent,
// // // //           lesson_id: selectedLessonId,
// // // //           task_name: taskName,
// // // //           description: taskDescription,
// // // //           status: "pending",
// // // //         },
// // // //       ]);

// // // //     setLoading(false);

// // // //     if (error) {
// // // //       toast.error("Failed to create assignment task.");
// // // //     } else {
// // // //       toast.success("Assignment task dispatched successfully!");
// // // //       setTaskName("");
// // // //       setTaskDescription("");
// // // //       setSelectedLessonId("");
// // // //       fetchStudentAssignments(selectedStudent);
// // // //     }
// // // //   };

// // // //   const isFormValid = Boolean(selectedStudent && selectedLessonId && taskName.trim() && taskDescription.trim());

// // // //   return (
// // // //     <div className="space-y-6 max-w-5xl mx-auto">
// // // //       <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
// // // //         <h2 className="text-xl font-black mb-2 flex items-center gap-2">
// // // //           <BookOpen className="text-purple-600" size={24} />
// // // //           Student Homework Dispatch
// // // //         </h2>
// // // //         <p className="text-sm text-gray-500 dark:text-gray-400">
// // // //           Assign specific uncompleted lesson homework tasks to your students.
// // // //         </p>
// // // //       </div>

// // // //       <div className="grid grid-cols-1 gap-6">
// // // //         {/* Custom Task / Homework Panel */}
// // // //         <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
// // // //           <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
// // // //             <Send size={18} className="text-pink-500" />
// // // //             Assign Homework Task
// // // //           </h3>

// // // //           <form onSubmit={handleCreateTask} className="space-y-4">
// // // //             <div>
// // // //               <label className="block text-xs font-black uppercase text-gray-400 mb-2">Select Student</label>
// // // //               <select
// // // //                 value={selectedStudent}
// // // //                 onChange={(e) => handleStudentChange(e.target.value)}
// // // //                 className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
// // // //               >
// // // //                 <option value="">-- Choose Student --</option>
// // // //                 {students.map((s) => (
// // // //                   <option key={s.id} value={s.id}>{s.full_name}</option>
// // // //                 ))}
// // // //               </select>
// // // //             </div>

// // // //             <div>
// // // //               <label className="block text-xs font-black uppercase text-gray-400 mb-2">Target Lesson (Incomplete Only)</label>
// // // //               <select
// // // //                 value={selectedLessonId}
// // // //                 onChange={(e) => setSelectedLessonId(e.target.value)}
// // // //                 disabled={!selectedStudent}
// // // //                 className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm disabled:opacity-50"
// // // //               >
// // // //                 <option value="">-- Choose Uncompleted Lesson --</option>
// // // //                 {courseLessons.map((l) => (
// // // //                   <option key={l.id} value={l.id}>
// // // //                     Phase {l.course_phases?.phase_number}: {l.title}
// // // //                   </option>
// // // //                 ))}
// // // //               </select>
// // // //             </div>

// // // //             <div>
// // // //               <label className="block text-xs font-black uppercase text-gray-400 mb-2">Task Title</label>
// // // //               <input
// // // //                 type="text"
// // // //                 placeholder="e.g., Build a Python Function"
// // // //                 value={taskName}
// // // //                 onChange={(e) => setTaskName(e.target.value)}
// // // //                 className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
// // // //               />
// // // //             </div>

// // // //             <div>
// // // //               <label className="block text-xs font-black uppercase text-gray-400 mb-2">Task Instructions</label>
// // // //               <textarea
// // // //                 placeholder="Detail instructions for the student..."
// // // //                 value={taskDescription}
// // // //                 onChange={(e) => setTaskDescription(e.target.value)}
// // // //                 rows={3}
// // // //                 className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
// // // //               />
// // // //             </div>

// // // //             <button
// // // //               type="submit"
// // // //               disabled={loading || !isFormValid}
// // // //               className={`w-full py-3 rounded-xl font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 ${
// // // //                 isFormValid && !loading
// // // //                   ? "bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 cursor-pointer"
// // // //                   : "bg-gray-400 cursor-not-allowed opacity-60"
// // // //               }`}
// // // //             >
// // // //               Dispatch Task
// // // //             </button>
// // // //           </form>
// // // //         </div>
// // // //       </div>

// // // //       {/* Student Active Task Feed */}
// // // //       {selectedStudent && (
// // // //         <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
// // // //           <h3 className="text-lg font-bold mb-4">Assigned Task Logs</h3>
          
// // // //           {studentAssignments.length > 0 ? (
// // // //             <div className="space-y-4">
// // // //               {studentAssignments.map((task) => (
// // // //                 <div
// // // //                   key={task.id}
// // // //                   className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-5"
// // // //                 >
// // // //                   <div className="flex justify-between items-start mb-3">
// // // //                     <div>
// // // //                       <h4 className="font-bold">{task.task_name}</h4>
// // // //                       <p className="text-sm text-gray-500 mt-1">
// // // //                         {task.description}
// // // //                       </p>
// // // //                     </div>

// // // //                     <span
// // // //                       className={`px-3 py-1 rounded-full text-xs font-bold ${
// // // //                         task.status === "completed"
// // // //                           ? "bg-green-100 text-green-600"
// // // //                           : task.status === "submitted"
// // // //                           ? "bg-blue-100 text-blue-600"
// // // //                           : task.status === "needs_revision"
// // // //                           ? "bg-amber-100 text-amber-600"
// // // //                           : "bg-orange-100 text-orange-600"
// // // //                       }`}
// // // //                     >
// // // //                       {task.status ? task.status.replace("_", " ") : "pending"}
// // // //                     </span>
// // // //                   </div>

// // // //                   {task.submitted_at && (
// // // //                     <p className="text-xs text-gray-500 mt-2">
// // // //                       Submitted on {new Date(task.submitted_at).toLocaleString()}
// // // //                     </p>
// // // //                   )}

// // // //                   {task.grade && (
// // // //                     <div className="mt-3">
// // // //                       <span className="font-bold text-green-600">
// // // //                         Grade: {task.grade}
// // // //                       </span>
// // // //                     </div>
// // // //                   )}

// // // //                   {task.tutor_feedback && (
// // // //                     <div className="mt-3 rounded-xl bg-purple-50 dark:bg-purple-500/10 p-4">
// // // //                       <p className="text-sm font-bold mb-1">Tutor Feedback</p>
// // // //                       <p className="text-sm">{task.tutor_feedback}</p>
// // // //                     </div>
// // // //                   )}

// // // //                   {task.submission_link && (
// // // //                     <div className="mb-4 mt-3">
// // // //                       <label className="text-xs font-bold uppercase text-gray-400">
// // // //                         Student Submission
// // // //                       </label>
// // // //                       <a
// // // //                         href={task.submission_link}
// // // //                         target="_blank"
// // // //                         rel="noopener noreferrer"
// // // //                         className="block text-purple-600 underline break-all text-sm"
// // // //                       >
// // // //                         {task.submission_link}
// // // //                       </a>
// // // //                     </div>
// // // //                   )}

// // // //                   <div className="space-y-3 mt-4">
// // // //                     <input
// // // //                       type="text"
// // // //                       placeholder="Grade (A+, 95%, Pass...)"
// // // //                       value={task.grade || ""}
// // // //                       onChange={(e) => {
// // // //                         setStudentAssignments((prev) =>
// // // //                           prev.map((a) =>
// // // //                             a.id === task.id
// // // //                               ? { ...a, grade: e.target.value }
// // // //                               : a
// // // //                           )
// // // //                         );
// // // //                       }}
// // // //                       className="w-full rounded-xl border p-3 bg-gray-50 dark:bg-white/5 text-sm"
// // // //                     />

// // // //                     <textarea
// // // //                       rows={3}
// // // //                       placeholder="Tutor feedback..."
// // // //                       value={task.tutor_feedback || ""}
// // // //                       onChange={(e) => {
// // // //                         setStudentAssignments((prev) =>
// // // //                           prev.map((a) =>
// // // //                             a.id === task.id
// // // //                               ? { ...a, tutor_feedback: e.target.value }
// // // //                               : a
// // // //                           )
// // // //                         );
// // // //                       }}
// // // //                       className="w-full rounded-xl border p-3 bg-gray-50 dark:bg-white/5 resize-none text-sm"
// // // //                     />

// // // //                     <div className="grid grid-cols-2 gap-3 pt-2">
// // // //                       <button
// // // //                         onClick={() => handleReviewTask(task.id, "needs_revision")}
// // // //                         disabled={loading || task.status !== "submitted"}
// // // //                         className="py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition text-sm shadow-md"
// // // //                       >
// // // //                         Request Revision
// // // //                       </button>
// // // //                       <button
// // // //                         onClick={() => handleReviewTask(task.id, "completed")}
// // // //                         disabled={loading || task.status !== "submitted"}
// // // //                         className="py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition text-sm shadow-md"
// // // //                       >
// // // //                         Approve & Complete
// // // //                       </button>
// // // //                     </div>
// // // //                   </div>
// // // //                 </div>
// // // //               ))}
// // // //             </div>
// // // //           ) : (
// // // //             <p className="text-sm text-gray-400 py-6 text-center">No tasks assigned to this student yet.</p>
// // // //           )}
// // // //         </div>
// // // //       )}
// // // //     </div>
// // // //   );
// // // // }
// // // // // import React, { useState, useEffect } from "react";
// // // // // import { supabase } from "../../../supabase";
// // // // // import toast from "react-hot-toast";
// // // // // import { BookOpen, CheckCircle, User, Layers, Send } from "lucide-react";

// // // // // export default function TutorCourseAssignmentView({ userId }) {
// // // // //   const [students, setStudents] = useState([]);
// // // // //   const [selectedStudent, setSelectedStudent] = useState("");
// // // // //   const [selectedCourse, setSelectedCourse] = useState("");
// // // // //   const [courseLessons, setCourseLessons] = useState([]);
// // // // //   const [selectedLessonId, setSelectedLessonId] = useState("");
// // // // //   const [taskName, setTaskName] = useState("");
// // // // //   const [taskDescription, setTaskDescription] = useState("");
// // // // //   const [studentAssignments, setStudentAssignments] = useState([]);
// // // // //   const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
// // // // //   const [loading, setLoading] = useState(false);

// // // // //   useEffect(() => {
// // // // //     fetchTutorStudents();
// // // // //   }, [userId]);

// // // // //   const fetchTutorStudents = async () => {
// // // // //     const { data, error } = await supabase
// // // // //       .from("users")
// // // // //       .select("id, full_name, assigned_course_id")
// // // // //       .eq("assigned_tutor_id", userId)
// // // // //       .eq("role", "student");

// // // // //     if (error) {
// // // // //       toast.error("Failed to load students.");
// // // // //     } else {
// // // // //       setStudents(data || []);
// // // // //     }
// // // // //   };

// // // // //   const fetchCourseLessonsAndProgress = async (courseId, studentId) => {
// // // // //     // 1. Fetch lessons for the course
// // // // //     const { data: lessonData, error: lessonError } = await supabase
// // // // //       .from("course_lessons")
// // // // //       .select("id, title, phase_id, course_phases!inner(course_id, phase_number)")
// // // // //       .eq("course_phases.course_id", courseId)
// // // // //       .order("position", { ascending: true });

// // // // //     if (lessonError) {
// // // // //       setCourseLessons([]);
// // // // //       return;
// // // // //     }

// // // // //     // 2. Fetch completed lesson progress for this specific student
// // // // //     const { data: progressData, error: progressError } = await supabase
// // // // //       .from("student_lesson_progress")
// // // // //       .select("lesson_id")
// // // // //       .eq("student_id", studentId)
// // // // //       .eq("status", "completed");

// // // // //     const completedSet = new Set((progressData || []).map((p) => p.lesson_id));
// // // // //     setCompletedLessonIds(completedSet);

// // // // //     // 3. Filter out completed lessons so only uncompleted ones show
// // // // //     const uncompletedLessons = (lessonData || []).filter(
// // // // //       (l) => !completedSet.has(l.id)
// // // // //     );

// // // // //     setCourseLessons(uncompletedLessons);
// // // // //   };

// // // // //   const handleStudentChange = async (studentId) => {
// // // // //     setSelectedStudent(studentId);
// // // // //     setSelectedLessonId("");
// // // // //     const student = students.find((s) => s.id === studentId);
    
// // // // //     if (student?.assigned_course_id) {
// // // // //       setSelectedCourse(student.assigned_course_id);
// // // // //       await fetchCourseLessonsAndProgress(student.assigned_course_id, studentId);
// // // // //     } else {
// // // // //       setSelectedCourse("");
// // // // //       setCourseLessons([]);
// // // // //     }
// // // // //     await fetchStudentAssignments(studentId);
// // // // //   };

// // // // //   const fetchStudentAssignments = async (studentId) => {
// // // // //     const { data, error } = await supabase
// // // // //       .from("student_assignments")
// // // // //       .select("*")
// // // // //       .eq("student_id", studentId)
// // // // //       .order("created_at", { ascending: false });

// // // // //     if (!error) {
// // // // //       setStudentAssignments(data || []);
// // // // //     }
// // // // //   };

// // // // //   const handleReviewTask = async (taskId, newStatus = "completed") => {
// // // // //     const task = studentAssignments.find((a) => a.id === taskId);
// // // // //     if (!task) return;

// // // // //     setLoading(true);

// // // // //     const { error } = await supabase
// // // // //       .from("student_assignments")
// // // // //       .update({
// // // // //         tutor_feedback: task.tutor_feedback,
// // // // //         grade: task.grade,
// // // // //         status: newStatus,
// // // // //         updated_at: new Date().toISOString(),
// // // // //       })
// // // // //       .eq("id", taskId);

// // // // //     setLoading(false);

// // // // //     if (error) {
// // // // //       toast.error("Failed to save review.");
// // // // //       return;
// // // // //     }

// // // // //     toast.success(newStatus === "completed" ? "Assignment marked as completed!" : "Requested revisions from student.");
// // // // //     fetchStudentAssignments(selectedStudent);
// // // // //   };

// // // // //   const handleCreateTask = async (e) => {
// // // // //     e.preventDefault();
// // // // //     if (!selectedStudent || !taskName.trim() || !taskDescription.trim()) {
// // // // //       toast.error("Please fill in all required fields.");
// // // // //       return;
// // // // //     }

// // // // //     setLoading(true);
// // // // //     const { error } = await supabase
// // // // //       .from("student_assignments")
// // // // //       .insert([
// // // // //         {
// // // // //           tutor_id: userId,
// // // // //           student_id: selectedStudent,
// // // // //           lesson_id: selectedLessonId || null,
// // // // //           task_name: taskName,
// // // // //           description: taskDescription,
// // // // //           status: "pending",
// // // // //         },
// // // // //       ]);

// // // // //     setLoading(false);

// // // // //     if (error) {
// // // // //       toast.error("Failed to create assignment task.");
// // // // //     } else {
// // // // //       toast.success("Assignment task dispatched successfully!");
// // // // //       setTaskName("");
// // // // //       setTaskDescription("");
// // // // //       setSelectedLessonId("");
// // // // //       fetchStudentAssignments(selectedStudent);
// // // // //     }
// // // // //   };

// // // // //   // Form validity check for enabling the Dispatch button
// // // // //   const isFormValid = selectedStudent && taskName.trim() !== "" && taskDescription.trim() !== "";

// // // // //   return (
// // // // //     <div className="space-y-6">
// // // // //       <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
// // // // //         <h2 className="text-xl font-black mb-2 flex items-center gap-2">
// // // // //           <BookOpen className="text-purple-600" size={24} />
// // // // //           Assignment Management
// // // // //         </h2>
// // // // //         <p className="text-sm text-gray-500 dark:text-gray-400">
// // // // //           Dispatch customized homework tasks to your students and review their submissions.
// // // // //         </p>
// // // // //       </div>

// // // // //       <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
// // // // //         {/* Custom Task / Homework Panel */}
// // // // //         <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
// // // // //           <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
// // // // //             <Send size={18} className="text-pink-500" />
// // // // //             Assign Homework Task
// // // // //           </h3>

// // // // //           <form onSubmit={handleCreateTask} className="space-y-4">
// // // // //             <div>
// // // // //               <label className="block text-xs font-black uppercase text-gray-400 mb-2">Select Student</label>
// // // // //               <select
// // // // //                 value={selectedStudent}
// // // // //                 onChange={(e) => handleStudentChange(e.target.value)}
// // // // //                 className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
// // // // //               >
// // // // //                 <option value="">-- Choose Student --</option>
// // // // //                 {students.map((s) => (
// // // // //                   <option key={s.id} value={s.id}>{s.full_name}</option>
// // // // //                 ))}
// // // // //               </select>
// // // // //             </div>

// // // // //             <div>
// // // // //               <label className="block text-xs font-black uppercase text-gray-400 mb-2">Target Lesson (Optional)</label>
// // // // //               <select
// // // // //                 value={selectedLessonId}
// // // // //                 onChange={(e) => setSelectedLessonId(e.target.value)}
// // // // //                 disabled={!selectedStudent}
// // // // //                 className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm disabled:opacity-50"
// // // // //               >
// // // // //                 <option value="">-- General Task (No Specific Lesson) --</option>
// // // // //                 {courseLessons.map((l) => (
// // // // //                   <option key={l.id} value={l.id}>
// // // // //                     Phase {l.course_phases?.phase_number}: {l.title}
// // // // //                   </option>
// // // // //                 ))}
// // // // //               </select>
// // // // //             </div>

// // // // //             <div>
// // // // //               <label className="block text-xs font-black uppercase text-gray-400 mb-2">Task Title</label>
// // // // //               <input
// // // // //                 type="text"
// // // // //                 placeholder="e.g., Build a Python Function"
// // // // //                 value={taskName}
// // // // //                 onChange={(e) => setTaskName(e.target.value)}
// // // // //                 className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
// // // // //               />
// // // // //             </div>

// // // // //             <div>
// // // // //               <label className="block text-xs font-black uppercase text-gray-400 mb-2">Task Instructions</label>
// // // // //               <textarea
// // // // //                 placeholder="Detail instructions for the student..."
// // // // //                 value={taskDescription}
// // // // //                 onChange={(e) => setTaskDescription(e.target.value)}
// // // // //                 rows={3}
// // // // //                 className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm"
// // // // //               />
// // // // //             </div>

// // // // //             <button
// // // // //               type="submit"
// // // // //               disabled={loading || !isFormValid}
// // // // //               className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
// // // // //             >
// // // // //               Dispatch Task
// // // // //             </button>
// // // // //           </form>
// // // // //         </div>
// // // // //       </div>

// // // // //       {/* Student Active Task Feed */}
// // // // //       {selectedStudent && (
// // // // //         <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
// // // // //           <h3 className="text-lg font-bold mb-4">Assigned Task Logs</h3>
          
// // // // //           {studentAssignments.length > 0 ? (
// // // // //             <div className="space-y-4">
// // // // //               {studentAssignments.map((task) => (
// // // // //                 <div
// // // // //                   key={task.id}
// // // // //                   className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-5"
// // // // //                 >
// // // // //                   <div className="flex justify-between items-start mb-3">
// // // // //                     <div>
// // // // //                       <h4 className="font-bold">{task.task_name}</h4>
// // // // //                       <p className="text-sm text-gray-500 mt-1">
// // // // //                         {task.description}
// // // // //                       </p>
// // // // //                     </div>

// // // // //                     <span
// // // // //                       className={`px-3 py-1 rounded-full text-xs font-bold ${
// // // // //                         task.status === "completed"
// // // // //                           ? "bg-green-100 text-green-600"
// // // // //                           : task.status === "submitted"
// // // // //                           ? "bg-blue-100 text-blue-600"
// // // // //                           : task.status === "needs_revision"
// // // // //                           ? "bg-amber-100 text-amber-600"
// // // // //                           : "bg-orange-100 text-orange-600"
// // // // //                       }`}
// // // // //                     >
// // // // //                       {task.status ? task.status.replace("_", " ") : "pending"}
// // // // //                     </span>
// // // // //                   </div>

// // // // //                   {task.submitted_at && (
// // // // //                     <p className="text-xs text-gray-500 mt-2">
// // // // //                       Submitted on {new Date(task.submitted_at).toLocaleString()}
// // // // //                     </p>
// // // // //                   )}

// // // // //                   {task.grade && (
// // // // //                     <div className="mt-3">
// // // // //                       <span className="font-bold text-green-600">
// // // // //                         Grade: {task.grade}
// // // // //                       </span>
// // // // //                     </div>
// // // // //                   )}

// // // // //                   {task.tutor_feedback && (
// // // // //                     <div className="mt-3 rounded-xl bg-purple-50 dark:bg-purple-500/10 p-4">
// // // // //                       <p className="text-sm font-bold mb-1">Tutor Feedback</p>
// // // // //                       <p className="text-sm">{task.tutor_feedback}</p>
// // // // //                     </div>
// // // // //                   )}

// // // // //                   {task.submission_link && (
// // // // //                     <div className="mb-4 mt-3">
// // // // //                       <label className="text-xs font-bold uppercase text-gray-400">
// // // // //                         Student Submission
// // // // //                       </label>
// // // // //                       <a
// // // // //                         href={task.submission_link}
// // // // //                         target="_blank"
// // // // //                         rel="noopener noreferrer"
// // // // //                         className="block text-purple-600 underline break-all text-sm"
// // // // //                       >
// // // // //                         {task.submission_link}
// // // // //                       </a>
// // // // //                     </div>
// // // // //                   )}

// // // // //                   <div className="space-y-3 mt-4">
// // // // //                     <input
// // // // //                       type="text"
// // // // //                       placeholder="Grade (A+, 95%, Pass...)"
// // // // //                       value={task.grade || ""}
// // // // //                       onChange={(e) => {
// // // // //                         setStudentAssignments((prev) =>
// // // // //                           prev.map((a) =>
// // // // //                             a.id === task.id
// // // // //                               ? { ...a, grade: e.target.value }
// // // // //                               : a
// // // // //                           )
// // // // //                         );
// // // // //                       }}
// // // // //                       className="w-full rounded-xl border p-3 bg-gray-50 dark:bg-white/5 text-sm"
// // // // //                     />

// // // // //                     <textarea
// // // // //                       rows={3}
// // // // //                       placeholder="Tutor feedback..."
// // // // //                       value={task.tutor_feedback || ""}
// // // // //                       onChange={(e) => {
// // // // //                         setStudentAssignments((prev) =>
// // // // //                           prev.map((a) =>
// // // // //                             a.id === task.id
// // // // //                               ? { ...a, tutor_feedback: e.target.value }
// // // // //                               : a
// // // // //                           )
// // // // //                         );
// // // // //                       }}
// // // // //                       className="w-full rounded-xl border p-3 bg-gray-50 dark:bg-white/5 resize-none text-sm"
// // // // //                     />

// // // // //                     <div className="grid grid-cols-2 gap-3 pt-2">
// // // // //                       <button
// // // // //                         onClick={() => handleReviewTask(task.id, "needs_revision")}
// // // // //                         disabled={loading || task.status !== "submitted"}
// // // // //                         className="py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition text-sm shadow-md"
// // // // //                       >
// // // // //                         Request Revision
// // // // //                       </button>
// // // // //                       <button
// // // // //                         onClick={() => handleReviewTask(task.id, "completed")}
// // // // //                         disabled={loading || task.status !== "submitted"}
// // // // //                         className="py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition text-sm shadow-md"
// // // // //                       >
// // // // //                         Approve & Complete
// // // // //                       </button>
// // // // //                     </div>
// // // // //                   </div>
// // // // //                 </div>
// // // // //               ))}
// // // // //             </div>
// // // // //           ) : (
// // // // //             <p className="text-sm text-gray-400 py-6 text-center">No tasks assigned to this student yet.</p>
// // // // //           )}
// // // // //         </div>
// // // // //       )}
// // // // //     </div>
// // // // //   );
// // // // // }
// // // // // // import React, { useState, useEffect } from "react";
// // // // // // import { supabase } from "../../../supabase";
// // // // // // import toast from "react-hot-toast";
// // // // // // import { BookOpen, CheckCircle, User, Layers, Send } from "lucide-react";

// // // // // // export default function TutorCourseAssignmentView({ userId }) {
// // // // // //   const [students, setStudents] = useState([]);
// // // // // //   const [courses, setCourses] = useState([]);
// // // // // //   const [selectedStudent, setSelectedStudent] = useState("");
// // // // // //   const [selectedCourse, setSelectedCourse] = useState("");
// // // // // //   const [courseLessons, setCourseLessons] = useState([]);
// // // // // //   const [selectedLessonId, setSelectedLessonId] = useState("");
// // // // // //   const [taskName, setTaskName] = useState("");
// // // // // //   const [taskDescription, setTaskDescription] = useState("");
// // // // // //   const [studentAssignments, setStudentAssignments] = useState([]);
// // // // // //   const [loading, setLoading] = useState(false);

// // // // // //   useEffect(() => {
// // // // // //     fetchTutorStudents();
// // // // // //     fetchCourses();
// // // // // //   }, [userId]);

// // // // // //   const fetchTutorStudents = async () => {
// // // // // //     const { data, error } = await supabase
// // // // // //       .from("users")
// // // // // //       .select("id, full_name, assigned_course_id")
// // // // // //       .eq("assigned_tutor_id", userId)
// // // // // //       .eq("role", "student");

// // // // // //     if (error) {
// // // // // //       toast.error("Failed to load students.");
// // // // // //     } else {
// // // // // //       setStudents(data || []);
// // // // // //     }
// // // // // //   };

// // // // // //   const fetchCourses = async () => {
// // // // // //     const { data, error } = await supabase
// // // // // //       .from("courses")
// // // // // //       .select("id, title")
// // // // // //       .order("title");

// // // // // //     if (error) {
// // // // // //       toast.error("Failed to load courses.");
// // // // // //     } else {
// // // // // //       setCourses(data || []);
// // // // // //     }
// // // // // //   };

// // // // // //   const fetchCourseLessons = async (courseId) => {
// // // // // //     const { data, error } = await supabase
// // // // // //       .from("course_lessons")
// // // // // //       .select("id, title, phase_id, course_phases!inner(course_id, phase_number)")
// // // // // //       .eq("course_phases.course_id", courseId)
// // // // // //       .order("position", { ascending: true });

// // // // // //     if (!error) {
// // // // // //       setCourseLessons(data || []);
// // // // // //     }
// // // // // //   };

// // // // // //   const handleStudentChange = async (studentId) => {
// // // // // //     setSelectedStudent(studentId);
// // // // // //     setSelectedLessonId("");
// // // // // //     const student = students.find((s) => s.id === studentId);
    
// // // // // //     if (student?.assigned_course_id) {
// // // // // //       setSelectedCourse(student.assigned_course_id);
// // // // // //       await fetchCourseLessons(student.assigned_course_id);
// // // // // //     } else {
// // // // // //       setSelectedCourse("");
// // // // // //       setCourseLessons([]);
// // // // // //     }
// // // // // //     await fetchStudentAssignments(studentId);
// // // // // //   };

// // // // // //   const fetchStudentAssignments = async (studentId) => {
// // // // // //     const { data, error } = await supabase
// // // // // //       .from("student_assignments")
// // // // // //       .select("*")
// // // // // //       .eq("student_id", studentId)
// // // // // //       .order("created_at", { ascending: false });

// // // // // //     if (!error) {
// // // // // //       setStudentAssignments(data || []);
// // // // // //     }
// // // // // //   };

// // // // // //   const handleReviewTask = async (taskId, newStatus = "completed") => {
// // // // // //     const task = studentAssignments.find((a) => a.id === taskId);
// // // // // //     if (!task) return;

// // // // // //     setLoading(true);

// // // // // //     const { error } = await supabase
// // // // // //       .from("student_assignments")
// // // // // //       .update({
// // // // // //         tutor_feedback: task.tutor_feedback,
// // // // // //         grade: task.grade,
// // // // // //         status: newStatus,
// // // // // //         updated_at: new Date().toISOString(),
// // // // // //       })
// // // // // //       .eq("id", taskId);

// // // // // //     setLoading(false);

// // // // // //     if (error) {
// // // // // //       toast.error("Failed to save review.");
// // // // // //       return;
// // // // // //     }

// // // // // //     toast.success(newStatus === "completed" ? "Assignment marked as completed!" : "Requested revisions from student.");
// // // // // //     fetchStudentAssignments(selectedStudent);
// // // // // //   };

// // // // // //   const handleAssignCourse = async (e) => {
// // // // // //     e.preventDefault();
// // // // // //     if (!selectedStudent || !selectedCourse) {
// // // // // //       toast.error("Please select both a student and a course.");
// // // // // //       return;
// // // // // //     }

// // // // // //     setLoading(true);
// // // // // //     const { error } = await supabase
// // // // // //       .from("users")
// // // // // //       .update({ assigned_course_id: selectedCourse })
// // // // // //       .eq("id", selectedStudent);

// // // // // //     setLoading(false);

// // // // // //     if (error) {
// // // // // //       toast.error("Error assigning course to student.");
// // // // // //     } else {
// // // // // //       toast.success("Course successfully assigned to student!");
// // // // // //       await fetchCourseLessons(selectedCourse);
// // // // // //       fetchTutorStudents();
// // // // // //     }
// // // // // //   };

// // // // // //   const handleCreateTask = async (e) => {
// // // // // //     e.preventDefault();
// // // // // //     if (!selectedStudent || !taskName) {
// // // // // //       toast.error("Please select a student and provide a task name.");
// // // // // //       return;
// // // // // //     }

// // // // // //     setLoading(true);
// // // // // //     const { error } = await supabase
// // // // // //       .from("student_assignments")
// // // // // //       .insert([
// // // // // //         {
// // // // // //           tutor_id: userId,
// // // // // //           student_id: selectedStudent,
// // // // // //           lesson_id: selectedLessonId || null,
// // // // // //           task_name: taskName,
// // // // // //           description: taskDescription,
// // // // // //           status: "pending",
// // // // // //         },
// // // // // //       ]);

// // // // // //     setLoading(false);

// // // // // //     if (error) {
// // // // // //       toast.error("Failed to create assignment task.");
// // // // // //     } else {
// // // // // //       toast.success("Assignment task dispatched successfully!");
// // // // // //       setTaskName("");
// // // // // //       setTaskDescription("");
// // // // // //       setSelectedLessonId("");
// // // // // //       fetchStudentAssignments(selectedStudent);
// // // // // //     }
// // // // // //   };

// // // // // //   return (
// // // // // //     <div className="space-y-6">
// // // // // //       <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
// // // // // //         <h2 className="text-xl font-black mb-2 flex items-center gap-2">
// // // // // //           <BookOpen className="text-purple-600" size={24} />
// // // // // //           Course & Assignment Management
// // // // // //         </h2>
// // // // // //         <p className="text-sm text-gray-500 dark:text-gray-400">
// // // // // //           Assign main curriculum courses and individual task assignments to your students.
// // // // // //         </p>
// // // // // //       </div>

// // // // // //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// // // // // //         {/* Course Assignment Panel */}
// // // // // //         <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
// // // // // //           <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
// // // // // //             <Layers size={18} className="text-purple-500" />
// // // // // //             Assign Core Course
// // // // // //           </h3>
          
// // // // // //           <form onSubmit={handleAssignCourse} className="space-y-4">
// // // // // //             <div>
// // // // // //               <label className="block text-xs font-black uppercase text-gray-400 mb-2">Select Student</label>
// // // // // //               <select
// // // // // //                 value={selectedStudent}
// // // // // //                 onChange={(e) => handleStudentChange(e.target.value)}
// // // // // //                 className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
// // // // // //               >
// // // // // //                 <option value="">-- Choose Student --</option>
// // // // // //                 {students.map((s) => (
// // // // // //                   <option key={s.id} value={s.id}>{s.full_name}</option>
// // // // // //                 ))}
// // // // // //               </select>
// // // // // //             </div>

// // // // // //             <div>
// // // // // //               <label className="block text-xs font-black uppercase text-gray-400 mb-2">Select Course Curriculum</label>
// // // // // //               <select
// // // // // //                 value={selectedCourse}
// // // // // //                 onChange={async (e) => {
// // // // // //                   setSelectedCourse(e.target.value);
// // // // // //                   await fetchCourseLessons(e.target.value);
// // // // // //                 }}
// // // // // //                 className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
// // // // // //               >
// // // // // //                 <option value="">-- Choose Course --</option>
// // // // // //                 {courses.map((c) => (
// // // // // //                   <option key={c.id} value={c.id}>{c.title}</option>
// // // // // //                 ))}
// // // // // //               </select>
// // // // // //             </div>

// // // // // //             <button
// // // // // //               type="submit"
// // // // // //               disabled={loading}
// // // // // //               className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
// // // // // //             >
// // // // // //               <CheckCircle size={18} />
// // // // // //               Save Course Assignment
// // // // // //             </button>
// // // // // //           </form>
// // // // // //         </div>

// // // // // //         {/* Custom Task / Homework Panel */}
// // // // // //         <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
// // // // // //           <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
// // // // // //             <Send size={18} className="text-pink-500" />
// // // // // //             Assign Homework Task
// // // // // //           </h3>

// // // // // //           <form onSubmit={handleCreateTask} className="space-y-4">
// // // // // //             <div>
// // // // // //               <label className="block text-xs font-black uppercase text-gray-400 mb-2">Target Lesson (Optional)</label>
// // // // // //               <select
// // // // // //                 value={selectedLessonId}
// // // // // //                 onChange={(e) => setSelectedLessonId(e.target.value)}
// // // // // //                 className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
// // // // // //               >
// // // // // //                 <option value="">-- General Task (No Specific Lesson) --</option>
// // // // // //                 {courseLessons.map((l) => (
// // // // // //                   <option key={l.id} value={l.id}>
// // // // // //                     Phase {l.course_phases?.phase_number}: {l.title}
// // // // // //                   </option>
// // // // // //                 ))}
// // // // // //               </select>
// // // // // //             </div>

// // // // // //             <div>
// // // // // //               <label className="block text-xs font-black uppercase text-gray-400 mb-2">Task Title</label>
// // // // // //               <input
// // // // // //                 type="text"
// // // // // //                 placeholder="e.g., Build a Python Function"
// // // // // //                 value={taskName}
// // // // // //                 onChange={(e) => setTaskName(e.target.value)}
// // // // // //                 className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
// // // // // //               />
// // // // // //             </div>

// // // // // //             <div>
// // // // // //               <label className="block text-xs font-black uppercase text-gray-400 mb-2">Task Instructions</label>
// // // // // //               <textarea
// // // // // //                 placeholder="Detail instructions for the student..."
// // // // // //                 value={taskDescription}
// // // // // //                 onChange={(e) => setTaskDescription(e.target.value)}
// // // // // //                 rows={3}
// // // // // //                 className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
// // // // // //               />
// // // // // //             </div>

// // // // // //             <button
// // // // // //               type="submit"
// // // // // //               disabled={loading || !selectedStudent}
// // // // // //               className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
// // // // // //             >
// // // // // //               Dispatch Task
// // // // // //             </button>
// // // // // //           </form>
// // // // // //         </div>
// // // // // //       </div>

// // // // // //       {/* Student Active Task Feed */}
// // // // // //       {selectedStudent && (
// // // // // //         <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
// // // // // //           <h3 className="text-lg font-bold mb-4">Assigned Task Logs</h3>
          
// // // // // //           {studentAssignments.length > 0 ? (
// // // // // //             <div className="space-y-4">
// // // // // //               {studentAssignments.map((task) => (
// // // // // //                 <div
// // // // // //                   key={task.id}
// // // // // //                   className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-5"
// // // // // //                 >
// // // // // //                   <div className="flex justify-between items-start mb-3">
// // // // // //                     <div>
// // // // // //                       <h4 className="font-bold">{task.task_name}</h4>
// // // // // //                       <p className="text-sm text-gray-500 mt-1">
// // // // // //                         {task.description}
// // // // // //                       </p>
// // // // // //                     </div>

// // // // // //                     <span
// // // // // //                       className={`px-3 py-1 rounded-full text-xs font-bold ${
// // // // // //                         task.status === "completed"
// // // // // //                           ? "bg-green-100 text-green-600"
// // // // // //                           : task.status === "submitted"
// // // // // //                           ? "bg-blue-100 text-blue-600"
// // // // // //                           : task.status === "needs_revision"
// // // // // //                           ? "bg-amber-100 text-amber-600"
// // // // // //                           : "bg-orange-100 text-orange-600"
// // // // // //                       }`}
// // // // // //                     >
// // // // // //                       {task.status ? task.status.replace("_", " ") : "pending"}
// // // // // //                     </span>
// // // // // //                   </div>

// // // // // //                   {task.submitted_at && (
// // // // // //                     <p className="text-xs text-gray-500 mt-2">
// // // // // //                       Submitted on {new Date(task.submitted_at).toLocaleString()}
// // // // // //                     </p>
// // // // // //                   )}

// // // // // //                   {task.grade && (
// // // // // //                     <div className="mt-3">
// // // // // //                       <span className="font-bold text-green-600">
// // // // // //                         Grade: {task.grade}
// // // // // //                       </span>
// // // // // //                     </div>
// // // // // //                   )}

// // // // // //                   {task.tutor_feedback && (
// // // // // //                     <div className="mt-3 rounded-xl bg-purple-50 dark:bg-purple-500/10 p-4">
// // // // // //                       <p className="text-sm font-bold mb-1">Tutor Feedback</p>
// // // // // //                       <p className="text-sm">{task.tutor_feedback}</p>
// // // // // //                     </div>
// // // // // //                   )}

// // // // // //                   {task.submission_link && (
// // // // // //                     <div className="mb-4 mt-3">
// // // // // //                       <label className="text-xs font-bold uppercase text-gray-400">
// // // // // //                         Student Submission
// // // // // //                       </label>
// // // // // //                       <a
// // // // // //                         href={task.submission_link}
// // // // // //                         target="_blank"
// // // // // //                         rel="noopener noreferrer"
// // // // // //                         className="block text-purple-600 underline break-all text-sm"
// // // // // //                       >
// // // // // //                         {task.submission_link}
// // // // // //                       </a>
// // // // // //                     </div>
// // // // // //                   )}

// // // // // //                   <div className="space-y-3 mt-4">
// // // // // //                     <input
// // // // // //                       type="text"
// // // // // //                       placeholder="Grade (A+, 95%, Pass...)"
// // // // // //                       value={task.grade || ""}
// // // // // //                       onChange={(e) => {
// // // // // //                         setStudentAssignments((prev) =>
// // // // // //                           prev.map((a) =>
// // // // // //                             a.id === task.id
// // // // // //                               ? { ...a, grade: e.target.value }
// // // // // //                               : a
// // // // // //                           )
// // // // // //                         );
// // // // // //                       }}
// // // // // //                       className="w-full rounded-xl border p-3 bg-gray-50 dark:bg-white/5 text-sm"
// // // // // //                     />

// // // // // //                     <textarea
// // // // // //                       rows={3}
// // // // // //                       placeholder="Tutor feedback..."
// // // // // //                       value={task.tutor_feedback || ""}
// // // // // //                       onChange={(e) => {
// // // // // //                         setStudentAssignments((prev) =>
// // // // // //                           prev.map((a) =>
// // // // // //                             a.id === task.id
// // // // // //                               ? { ...a, tutor_feedback: e.target.value }
// // // // // //                               : a
// // // // // //                           )
// // // // // //                         );
// // // // // //                       }}
// // // // // //                       className="w-full rounded-xl border p-3 bg-gray-50 dark:bg-white/5 resize-none text-sm"
// // // // // //                     />

// // // // // //                     <div className="grid grid-cols-2 gap-3 pt-2">
// // // // // //                       <button
// // // // // //                         onClick={() => handleReviewTask(task.id, "needs_revision")}
// // // // // //                         disabled={loading || task.status !== "submitted"}
// // // // // //                         className="py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition text-sm shadow-md"
// // // // // //                       >
// // // // // //                         Request Revision
// // // // // //                       </button>
// // // // // //                       <button
// // // // // //                         onClick={() => handleReviewTask(task.id, "completed")}
// // // // // //                         disabled={loading || task.status !== "submitted"}
// // // // // //                         className="py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition text-sm shadow-md"
// // // // // //                       >
// // // // // //                         Approve & Complete
// // // // // //                       </button>
// // // // // //                     </div>
// // // // // //                   </div>
// // // // // //                 </div>
// // // // // //               ))}
// // // // // //             </div>
// // // // // //           ) : (
// // // // // //             <p className="text-sm text-gray-400 py-6 text-center">No tasks assigned to this student yet.</p>
// // // // // //           )}
// // // // // //         </div>
// // // // // //       )}
// // // // // //     </div>
// // // // // //   );
// // // // // // }
// // // // // // // const [courseLessons, setCourseLessons] = useState([]);
// // // // // // // const [selectedLessonId, setSelectedLessonId] = useState("");
// // // // // // // import React, { useState, useEffect } from "react";
// // // // // // // import { supabase } from "../../../supabase";
// // // // // // // import toast from "react-hot-toast";
// // // // // // // import { BookOpen, CheckCircle, User, Layers, Send } from "lucide-react";

// // // // // // // export default function TutorCourseAssignmentView({ userId }) {
// // // // // // //   const [students, setStudents] = useState([]);
// // // // // // //   const [courses, setCourses] = useState([]);
// // // // // // //   const [selectedStudent, setSelectedStudent] = useState("");
// // // // // // //   const [selectedCourse, setSelectedCourse] = useState("");
// // // // // // //   const [taskName, setTaskName] = useState("");
// // // // // // //   const [taskDescription, setTaskDescription] = useState("");
// // // // // // //   const [studentAssignments, setStudentAssignments] = useState([]);
// // // // // // //   const [loading, setLoading] = useState(false);

// // // // // // //   useEffect(() => {
// // // // // // //     fetchTutorStudents();
// // // // // // //     fetchCourses();
// // // // // // //   }, [userId]);

// // // // // // //   const fetchTutorStudents = async () => {
// // // // // // //     const { data, error } = await supabase
// // // // // // //       .from("users")
// // // // // // //       .select("id, full_name, assigned_course_id")
// // // // // // //       .eq("assigned_tutor_id", userId)
// // // // // // //       .eq("role", "student");

// // // // // // //     if (error) {
// // // // // // //       toast.error("Failed to load students.");
// // // // // // //     } else {
// // // // // // //       setStudents(data || []);
// // // // // // //     }
// // // // // // //   };
// // // // // // //   const handleStudentChange = async (studentId) => {
// // // // // // //   setSelectedStudent(studentId);
// // // // // // //   setSelectedLessonId("");
// // // // // // //   const student = students.find((s) => s.id === studentId);
  
// // // // // // //   if (student?.assigned_course_id) {
// // // // // // //     setSelectedCourse(student.assigned_course_id);
// // // // // // //     await fetchCourseLessons(student.assigned_course_id);
// // // // // // //   } else {
// // // // // // //     setSelectedCourse("");
// // // // // // //     setCourseLessons([]);
// // // // // // //   }
// // // // // // //   await fetchStudentAssignments(studentId);
// // // // // // // };

// // // // // // // const fetchCourseLessons = async (courseId) => {
// // // // // // //   const { data, error } = await supabase
// // // // // // //     .from("course_lessons")
// // // // // // //     .select("id, title, phase_id, course_phases!inner(course_id, phase_number)")
// // // // // // //     .eq("course_phases.course_id", courseId)
// // // // // // //     .order("position", { ascending: true });

// // // // // // //   if (!error) {
// // // // // // //     setCourseLessons(data || []);
// // // // // // //   }
// // // // // // // };

// // // // // // // //   const handleReviewTask = async (taskId) => {
// // // // // // // //     setLoading(true);

// // // // // // // //     const { error } = await supabase
// // // // // // // //       .from("student_assignments")
// // // // // // // //       .update({
// // // // // // // //      const task = studentAssignments.find((a) => a.id === taskId);

// // // // // // // // const { error } = await supabase
// // // // // // // //   .from("student_assignments")
// // // // // // // //   .update({
// // // // // // // //     tutor_feedback: task.tutor_feedback,
// // // // // // // //     grade: task.grade,
// // // // // // // //     status: "pending",
// // // // // // // //     updated_at: new Date().toISOString(),
// // // // // // // //   })
// // // // // // // //   .eq("id", taskId);
// // // // // // // //         status: "completed",
// // // // // // // //         updated_at: new Date().toISOString(),
// // // // // // // //       })
// // // // // // // //       .eq("id", taskId);

// // // // // // // //     setLoading(false);

// // // // // // // //     if (error) {
// // // // // // // //       toast.error("Failed to save review.");
// // // // // // // //       return;
// // // // // // // //     }

// // // // // // // //     toast.success("Assignment reviewed successfully!");
// // // // // // // //     fetchStudentAssignments(selectedStudent);
// // // // // // // //   };
// // // // // // //   const handleReviewTask = async (taskId) => {
// // // // // // //   const task = studentAssignments.find((a) => a.id === taskId);
// // // // // // //   if (!task) return;

// // // // // // //   setLoading(true);

// // // // // // //   const { error } = await supabase
// // // // // // //     .from("student_assignments")
// // // // // // //     .update({
// // // // // // //       tutor_feedback: task.tutor_feedback,
// // // // // // //       grade: task.grade,
// // // // // // //       status: "completed",
// // // // // // //       updated_at: new Date().toISOString(),
// // // // // // //     })
// // // // // // //     .eq("id", taskId);

// // // // // // //   setLoading(false);

// // // // // // //   if (error) {
// // // // // // //     toast.error("Failed to save review.");
// // // // // // //     return;
// // // // // // //   }

// // // // // // //   toast.success("Assignment reviewed successfully!");
// // // // // // //   fetchStudentAssignments(selectedStudent);
// // // // // // // };

// // // // // // //   const fetchCourses = async () => {
// // // // // // //     const { data, error } = await supabase
// // // // // // //       .from("courses")
// // // // // // //       .select("id, title")
// // // // // // //       .order("title");

// // // // // // //     if (error) {
// // // // // // //       toast.error("Failed to load courses.");
// // // // // // //     } else {
// // // // // // //       setCourses(data || []);
// // // // // // //     }
// // // // // // //   };

// // // // // // //   const handleStudentChange = async (studentId) => {
// // // // // // //     setSelectedStudent(studentId);
// // // // // // //     const student = students.find((s) => s.id === studentId);
// // // // // // //     if (student?.assigned_course_id) {
// // // // // // //       setSelectedCourse(student.assigned_course_id);
// // // // // // //     } else {
// // // // // // //       setSelectedCourse("");
// // // // // // //     }
// // // // // // //     await fetchStudentAssignments(studentId);
// // // // // // //   };

// // // // // // //   const fetchStudentAssignments = async (studentId) => {
// // // // // // //     const { data, error } = await supabase
// // // // // // //       .from("student_assignments")
// // // // // // //       .select("*")
// // // // // // //       .eq("student_id", studentId)
// // // // // // //       .order("created_at", { ascending: false });

// // // // // // //     if (!error) {
// // // // // // //       setStudentAssignments(data || []);
// // // // // // //     }
// // // // // // //   };

// // // // // // //   const handleAssignCourse = async (e) => {
// // // // // // //     e.preventDefault();
// // // // // // //     if (!selectedStudent || !selectedCourse) {
// // // // // // //       toast.error("Please select both a student and a course.");
// // // // // // //       return;
// // // // // // //     }

// // // // // // //     setLoading(true);
// // // // // // //     const { error } = await supabase
// // // // // // //       .from("users")
// // // // // // //       .update({ assigned_course_id: selectedCourse })
// // // // // // //       .eq("id", selectedStudent);

// // // // // // //     setLoading(false);

// // // // // // //     if (error) {
// // // // // // //       toast.error("Error assigning course to student.");
// // // // // // //     } else {
// // // // // // //       toast.success("Course successfully assigned to student!");
// // // // // // //       fetchTutorStudents();
// // // // // // //     }
// // // // // // //   };

// // // // // // //   const handleCreateTask = async (e) => {
// // // // // // //     e.preventDefault();
// // // // // // //     if (!selectedStudent || !taskName) {
// // // // // // //       toast.error("Please select a student and provide a task name.");
// // // // // // //       return;
// // // // // // //     }

// // // // // // //     setLoading(true);
// // // // // // //     const { error } = await supabase
// // // // // // //       .from("student_assignments")
// // // // // // //       .insert([
// // // // // // //         {
// // // // // // //           tutor_id: userId,
// // // // // // //           student_id: selectedStudent,
// // // // // // //           task_name: taskName,
// // // // // // //           description: taskDescription,
// // // // // // //           status: "pending",
// // // // // // //         },
// // // // // // //       ]);

// // // // // // //     setLoading(false);

// // // // // // //     if (error) {
// // // // // // //       toast.error("Failed to create assignment task.");
// // // // // // //     } else {
// // // // // // //       toast.success("Assignment task dispatched successfully!");
// // // // // // //       setTaskName("");
// // // // // // //       setTaskDescription("");
// // // // // // //       fetchStudentAssignments(selectedStudent);
// // // // // // //     }
// // // // // // //   };

// // // // // // //   return (
// // // // // // //     <div className="space-y-6">
// // // // // // //       <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
// // // // // // //         <h2 className="text-xl font-black mb-2 flex items-center gap-2">
// // // // // // //           <BookOpen className="text-purple-600" size={24} />
// // // // // // //           Course & Assignment Management
// // // // // // //         </h2>
// // // // // // //         <p className="text-sm text-gray-500 dark:text-gray-400">
// // // // // // //           Assign main curriculum courses and individual task assignments to your students.
// // // // // // //         </p>
// // // // // // //       </div>

// // // // // // //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// // // // // // //         {/* Course Assignment Panel */}
// // // // // // //         <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
// // // // // // //           <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
// // // // // // //             <Layers size={18} className="text-purple-500" />
// // // // // // //             Assign Core Course
// // // // // // //           </h3>
          
// // // // // // //           <form onSubmit={handleAssignCourse} className="space-y-4">
// // // // // // //             <div>
// // // // // // //               <label className="block text-xs font-black uppercase text-gray-400 mb-2">Select Student</label>
// // // // // // //               <select
// // // // // // //                 value={selectedStudent}
// // // // // // //                 onChange={(e) => handleStudentChange(e.target.value)}
// // // // // // //                 className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
// // // // // // //               >
// // // // // // //                 <option value="">-- Choose Student --</option>
// // // // // // //                 {students.map((s) => (
// // // // // // //                   <option key={s.id} value={s.id}>{s.full_name}</option>
// // // // // // //                 ))}
// // // // // // //               </select>
// // // // // // //             </div>

// // // // // // //             <div>
// // // // // // //               <label className="block text-xs font-black uppercase text-gray-400 mb-2">Select Course Curriculum</label>
// // // // // // //               <select
// // // // // // //                 value={selectedCourse}
// // // // // // //                 onChange={(e) => setSelectedCourse(e.target.value)}
// // // // // // //                 className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
// // // // // // //               >
// // // // // // //                 <option value="">-- Choose Course --</option>
// // // // // // //                 {courses.map((c) => (
// // // // // // //                   <option key={c.id} value={c.id}>{c.title}</option>
// // // // // // //                 ))}
// // // // // // //               </select>
// // // // // // //             </div>

// // // // // // //             <button
// // // // // // //               type="submit"
// // // // // // //               disabled={loading}
// // // // // // //               className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
// // // // // // //             >
// // // // // // //               <CheckCircle size={18} />
// // // // // // //               Save Course Assignment
// // // // // // //             </button>
// // // // // // //           </form>
// // // // // // //         </div>

// // // // // // //         {/* Custom Task / Homework Panel */}
// // // // // // //         <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
// // // // // // //           <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
// // // // // // //             <Send size={18} className="text-pink-500" />
// // // // // // //             Assign Homework Task
// // // // // // //           </h3>

// // // // // // //           <form onSubmit={handleCreateTask} className="space-y-4">
// // // // // // //             <div>
// // // // // // //               <label className="block text-xs font-black uppercase text-gray-400 mb-2">Task Title</label>
// // // // // // //               <input
// // // // // // //                 type="text"
// // // // // // //                 placeholder="e.g., Build a Python Function"
// // // // // // //                 value={taskName}
// // // // // // //                 onChange={(e) => setTaskName(e.target.value)}
// // // // // // //                 className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
// // // // // // //               />
// // // // // // //             </div>

// // // // // // //             <div>
// // // // // // //               <label className="block text-xs font-black uppercase text-gray-400 mb-2">Task Instructions</label>
// // // // // // //               <textarea
// // // // // // //                 placeholder="Detail instructions for the student..."
// // // // // // //                 value={taskDescription}
// // // // // // //                 onChange={(e) => setTaskDescription(e.target.value)}
// // // // // // //                 rows={3}
// // // // // // //                 className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
// // // // // // //               />
// // // // // // //             </div>

// // // // // // //             <button
// // // // // // //               type="submit"
// // // // // // //               disabled={loading || !selectedStudent}
// // // // // // //               className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
// // // // // // //             >
// // // // // // //               Dispatch Task
// // // // // // //             </button>
// // // // // // //           </form>
// // // // // // //         </div>
// // // // // // //       </div>

// // // // // // //       {/* Student Active Task Feed */}
// // // // // // //       {selectedStudent && (
// // // // // // //         <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
// // // // // // //           <h3 className="text-lg font-bold mb-4">Assigned Task Logs</h3>
          
// // // // // // //           {studentAssignments.length > 0 ? (
// // // // // // //             <div className="space-y-4">
// // // // // // //               {studentAssignments.map((task) => (
// // // // // // //                 <div
// // // // // // //                   key={task.id}
// // // // // // //                   className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-5"
// // // // // // //                 >
// // // // // // //                   <div className="flex justify-between items-start mb-3">
// // // // // // //                     <div>
// // // // // // //                       <h4 className="font-bold">{task.task_name}</h4>
// // // // // // //                       <p className="text-sm text-gray-500 mt-1">
// // // // // // //                         {task.description}
// // // // // // //                       </p>
// // // // // // //                     </div>

// // // // // // //                     <span
// // // // // // // //                       className={`px-3 py-1 rounded-full text-xs font-bold ${
// // // // // // // //                         task.status === "completed"
// // // // // // // //                           ? "bg-green-100 text-green-600"
// // // // // // // //                           : className={`w-full py-3 rounded-xl font-bold text-white transition ${
// // // // // // // //   task.status === "submitted"
// // // // // // // //     ? "bg-green-600 hover:bg-green-700"
// // // // // // // //     : "bg-gray-400 cursor-not-allowed"
// // // // // // // // }`}
// // // // // // // //                           ? "bg-blue-100 text-blue-600"
// // // // // // // //                           : "bg-orange-100 text-orange-600"
// // // // // // // //                       }`}
// // // // // // // className={`px-3 py-1 rounded-full text-xs font-bold ${
// // // // // // //   task.status === "completed"
// // // // // // //     ? "bg-green-100 text-green-600"
// // // // // // //     : task.status === "submitted"
// // // // // // //     ? "bg-blue-100 text-blue-600"
// // // // // // //     : "bg-orange-100 text-orange-600"
// // // // // // // }`}
// // // // // // //                     >
// // // // // // //                       {task.status}
// // // // // // //                     </span>
// // // // // // //                   </div>
// // // // // // // {task.submitted_at && (
// // // // // // //   <p className="text-xs text-gray-500 mt-2">
// // // // // // //     Submitted on {new Date(task.submitted_at).toLocaleString()}
// // // // // // //   </p>
// // // // // // // )}
// // // // // // // {task.grade && (
// // // // // // //   <div className="mt-3">
// // // // // // //     <span className="font-bold text-green-600">
// // // // // // //       Grade: {task.grade}
// // // // // // //     </span>
// // // // // // //   </div>
// // // // // // // )}
// // // // // // // {task.tutor_feedback && (
// // // // // // //   <div className="mt-3 rounded-xl bg-purple-50 dark:bg-purple-500/10 p-4">
// // // // // // //     <p className="text-sm font-bold mb-1">Tutor Feedback</p>
// // // // // // //     <p className="text-sm">{task.tutor_feedback}</p>
// // // // // // //   </div>
// // // // // // // )}
// // // // // // //                   {task.submission_link && (
// // // // // // //                     <div className="mb-4">
// // // // // // //                       <label className="text-xs font-bold uppercase text-gray-400">
// // // // // // //                         Student Submission
// // // // // // //                       </label>

// // // // // // //                       <a
// // // // // // //                         href={task.submission_link}
// // // // // // //                         target="_blank"
// // // // // // //                         rel="noopener noreferrer"
// // // // // // //                         className="block text-purple-600 underline break-all"
// // // // // // //                       >
// // // // // // //                         {task.submission_link}
// // // // // // //                       </a>
// // // // // // //                     </div>
// // // // // // //                   )}

// // // // // // //                   <div className="space-y-3">
// // // // // // //                     <input
// // // // // // //                       type="text"
// // // // // // //                       placeholder="Grade (A+, 95%, Pass...)"
// // // // // // //                       value={task.grade || ""}
// // // // // // // onChange={(e) => {
// // // // // // //   setStudentAssignments((prev) =>
// // // // // // //     prev.map((a) =>
// // // // // // //       a.id === task.id
// // // // // // //         ? { ...a, grade: e.target.value }
// // // // // // //         : a
// // // // // // //     )
// // // // // // //   );
// // // // // // // }}
// // // // // // //                       className="w-full rounded-xl border p-3 bg-gray-50 dark:bg-white/5"
// // // // // // //                     />

// // // // // // //                     <textarea
// // // // // // //                       rows={3}
// // // // // // //                       placeholder="Tutor feedback..."
// // // // // // //                      value={task.tutor_feedback || ""}
// // // // // // // onChange={(e) => {
// // // // // // //   setStudentAssignments((prev) =>
// // // // // // //     prev.map((a) =>
// // // // // // //       a.id === task.id
// // // // // // //         ? { ...a, tutor_feedback: e.target.value }
// // // // // // //         : a
// // // // // // //     )
// // // // // // //   );
// // // // // // // }}
// // // // // // //                       className="w-full rounded-xl border p-3 bg-gray-50 dark:bg-white/5 resize-none"
// // // // // // //                     />

               
// // // // // // //                     <button
// // // // // // //   onClick={() => handleReviewTask(task.id)}
// // // // // // //   disabled={loading || task.status !== "submitted"}
// // // // // // //   className={`w-full py-3 rounded-xl font-bold text-white transition ${
// // // // // // //     task.status === "submitted"
// // // // // // //       ? "bg-green-600 hover:bg-green-700"
// // // // // // //       : "bg-gray-400 cursor-not-allowed"
// // // // // // //   }`}
// // // // // // // >
// // // // // // //   {task.status === "submitted"
// // // // // // //     ? "Save Review"
// // // // // // //     : "Waiting for Student Submission"}
// // // // // // // </button>
// // // // // // //                   </div>
// // // // // // //                 </div>
// // // // // // //               ))}
// // // // // // //             </div>
// // // // // // //           ) : (
// // // // // // //             <p className="text-sm text-gray-400 py-6 text-center">No tasks assigned to this student yet.</p>
// // // // // // //           )}
// // // // // // //         </div>
// // // // // // //       )}
// // // // // // //     </div>
// // // // // // //   );
// // // // // // // }
// // // // // // // // import React, { useState, useEffect } from "react";
// // // // // // // // import { supabase } from "../../../supabase";
// // // // // // // // import toast from "react-hot-toast";
// // // // // // // // import { BookOpen, CheckCircle, User, Layers, Send } from "lucide-react";

// // // // // // // // export default function TutorCourseAssignmentView({ userId }) {
// // // // // // // //   const [students, setStudents] = useState([]);
// // // // // // // //   const [courses, setCourses] = useState([]);
// // // // // // // //   const [selectedStudent, setSelectedStudent] = useState("");
// // // // // // // //   const [selectedCourse, setSelectedCourse] = useState("");
// // // // // // // //   const [taskName, setTaskName] = useState("");
// // // // // // // //   const [taskDescription, setTaskDescription] = useState("");
// // // // // // // //   const [studentAssignments, setStudentAssignments] = useState([]);
// // // // // // // //   const [loading, setLoading] = useState(false);
// // // // // // // // const [feedback, setFeedback] = useState("");
// // // // // // // // const [grade, setGrade] = useState("");
// // // // // // // //   useEffect(() => {
// // // // // // // //     fetchTutorStudents();
// // // // // // // //     fetchCourses();
// // // // // // // //   }, [userId]);

// // // // // // // //   const fetchTutorStudents = async () => {
// // // // // // // //     const { data, error } = await supabase
// // // // // // // //       .from("users")
// // // // // // // //       .select("id, full_name, assigned_course_id")
// // // // // // // //       .eq("assigned_tutor_id", userId)
// // // // // // // //       .eq("role", "student");

// // // // // // // //     if (error) {
// // // // // // // //       toast.error("Failed to load students.");
// // // // // // // //     } else {
// // // // // // // //       setStudents(data || []);
// // // // // // // //     }
// // // // // // // //   };
// // // // // // // // const handleSelectTask = (task) => {
// // // // // // // //   setFeedback(task.tutor_feedback || "");
// // // // // // // //   setGrade(task.grade || "");
// // // // // // // // };
// // // // // // // // const handleReviewTask = async (taskId) => {
// // // // // // // //   setLoading(true);

// // // // // // // //   const { error } = await supabase
// // // // // // // //     .from("student_assignments")
// // // // // // // //     .update({
// // // // // // // //       tutor_feedback: feedback,
// // // // // // // //       grade,
// // // // // // // //       status: "completed",
// // // // // // // //       updated_at: new Date().toISOString(),
// // // // // // // //     })
// // // // // // // //     .eq("id", taskId);

// // // // // // // //   setLoading(false);

// // // // // // // //   if (error) {
// // // // // // // //     toast.error("Failed to save review.");
// // // // // // // //     return;
// // // // // // // //   }

// // // // // // // //   toast.success("Assignment reviewed successfully!");
// // // // // // // //   fetchStudentAssignments(selectedStudent);
// // // // // // // // };
// // // // // // // //   const fetchCourses = async () => {
// // // // // // // //     const { data, error } = await supabase
// // // // // // // //       .from("courses")
// // // // // // // //       .select("id, title")
// // // // // // // //       .order("title");

// // // // // // // //     if (error) {
// // // // // // // //       toast.error("Failed to load courses.");
// // // // // // // //     } else {
// // // // // // // //       setCourses(data || []);
// // // // // // // //     }
// // // // // // // //   };

// // // // // // // //   const handleStudentChange = async (studentId) => {
// // // // // // // //     setSelectedStudent(studentId);
// // // // // // // //     const student = students.find((s) => s.id === studentId);
// // // // // // // //     if (student?.assigned_course_id) {
// // // // // // // //       setSelectedCourse(student.assigned_course_id);
// // // // // // // //     } else {
// // // // // // // //       setSelectedCourse("");
// // // // // // // //     }
// // // // // // // //     await fetchStudentAssignments(studentId);
// // // // // // // //   };

// // // // // // // //   const fetchStudentAssignments = async (studentId) => {
// // // // // // // //     const { data, error } = await supabase
// // // // // // // //       .from("student_assignments")
// // // // // // // //       .select("*")
// // // // // // // //       .eq("student_id", studentId)
// // // // // // // //       .order("created_at", { ascending: false });

// // // // // // // //     if (!error) {
// // // // // // // //       setStudentAssignments(data || []);
// // // // // // // //     }
// // // // // // // //   };

// // // // // // // //   const handleAssignCourse = async (e) => {
// // // // // // // //     e.preventDefault();
// // // // // // // //     if (!selectedStudent || !selectedCourse) {
// // // // // // // //       toast.error("Please select both a student and a course.");
// // // // // // // //       return;
// // // // // // // //     }

// // // // // // // //     setLoading(true);
// // // // // // // //     const { error } = await supabase
// // // // // // // //       .from("users")
// // // // // // // //       .update({ assigned_course_id: selectedCourse })
// // // // // // // //       .eq("id", selectedStudent);

// // // // // // // //     setLoading(false);

// // // // // // // //     if (error) {
// // // // // // // //       toast.error("Error assigning course to student.");
// // // // // // // //     } else {
// // // // // // // //       toast.success("Course successfully assigned to student!");
// // // // // // // //       fetchTutorStudents();
// // // // // // // //     }
// // // // // // // //   };

// // // // // // // //   const handleCreateTask = async (e) => {
// // // // // // // //     e.preventDefault();
// // // // // // // //     if (!selectedStudent || !taskName) {
// // // // // // // //       toast.error("Please select a student and provide a task name.");
// // // // // // // //       return;
// // // // // // // //     }

// // // // // // // //     setLoading(true);
// // // // // // // //     const { error } = await supabase
// // // // // // // //       .from("student_assignments")
// // // // // // // //       .insert([
// // // // // // // //         {
// // // // // // // //           tutor_id: userId,
// // // // // // // //           student_id: selectedStudent,
// // // // // // // //           task_name: taskName,
// // // // // // // //           description: taskDescription,
// // // // // // // //           status: "pending",
// // // // // // // //         },
// // // // // // // //       ]);

// // // // // // // //     setLoading(false);

// // // // // // // //     if (error) {
// // // // // // // //       toast.error("Failed to create assignment task.");
// // // // // // // //     } else {
// // // // // // // //       toast.success("Assignment task dispatched successfully!");
// // // // // // // //       setTaskName("");
// // // // // // // //       setTaskDescription("");
// // // // // // // //       fetchStudentAssignments(selectedStudent);
// // // // // // // //     }
// // // // // // // //   };

// // // // // // // //   return (
// // // // // // // //     <div className="space-y-6">
// // // // // // // //       <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
// // // // // // // //         <h2 className="text-xl font-black mb-2 flex items-center gap-2">
// // // // // // // //           <BookOpen className="text-purple-600" size={24} />
// // // // // // // //           Course & Assignment Management
// // // // // // // //         </h2>
// // // // // // // //         <p className="text-sm text-gray-500 dark:text-gray-400">
// // // // // // // //           Assign main curriculum courses and individual task assignments to your students.
// // // // // // // //         </p>
// // // // // // // //       </div>

// // // // // // // //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// // // // // // // //         {/* Course Assignment Panel */}
// // // // // // // //         <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
// // // // // // // //           <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
// // // // // // // //             <Layers size={18} className="text-purple-500" />
// // // // // // // //             Assign Core Course
// // // // // // // //           </h3>
          
// // // // // // // //           <form onSubmit={handleAssignCourse} className="space-y-4">
// // // // // // // //             <div>
// // // // // // // //               <label className="block text-xs font-black uppercase text-gray-400 mb-2">Select Student</label>
// // // // // // // //               <select
// // // // // // // //                 value={selectedStudent}
// // // // // // // //                 onChange={(e) => handleStudentChange(e.target.value)}
// // // // // // // //                 className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
// // // // // // // //               >
// // // // // // // //                 <option value="">-- Choose Student --</option>
// // // // // // // //                 {students.map((s) => (
// // // // // // // //                   <option key={s.id} value={s.id}>{s.full_name}</option>
// // // // // // // //                 ))}
// // // // // // // //               </select>
// // // // // // // //             </div>

// // // // // // // //             <div>
// // // // // // // //               <label className="block text-xs font-black uppercase text-gray-400 mb-2">Select Course Curriculum</label>
// // // // // // // //               <select
// // // // // // // //                 value={selectedCourse}
// // // // // // // //                 onChange={(e) => setSelectedCourse(e.target.value)}
// // // // // // // //                 className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
// // // // // // // //               >
// // // // // // // //                 <option value="">-- Choose Course --</option>
// // // // // // // //                 {courses.map((c) => (
// // // // // // // //                   <option key={c.id} value={c.id}>{c.title}</option>
// // // // // // // //                 ))}
// // // // // // // //               </select>
// // // // // // // //             </div>

// // // // // // // //             <button
// // // // // // // //               type="submit"
// // // // // // // //               disabled={loading}
// // // // // // // //               className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
// // // // // // // //             >
// // // // // // // //               <CheckCircle size={18} />
// // // // // // // //               Save Course Assignment
// // // // // // // //             </button>
// // // // // // // //           </form>
// // // // // // // //         </div>

// // // // // // // //         {/* Custom Task / Homework Panel */}
// // // // // // // //         <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
// // // // // // // //           <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
// // // // // // // //             <Send size={18} className="text-pink-500" />
// // // // // // // //             Assign Homework Task
// // // // // // // //           </h3>

// // // // // // // //           <form onSubmit={handleCreateTask} className="space-y-4">
// // // // // // // //             <div>
// // // // // // // //               <label className="block text-xs font-black uppercase text-gray-400 mb-2">Task Title</label>
// // // // // // // //               <input
// // // // // // // //                 type="text"
// // // // // // // //                 placeholder="e.g., Build a Python Function"
// // // // // // // //                 value={taskName}
// // // // // // // //                 onChange={(e) => setTaskName(e.target.value)}
// // // // // // // //                 className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
// // // // // // // //               />
// // // // // // // //             </div>

// // // // // // // //             <div>
// // // // // // // //               <label className="block text-xs font-black uppercase text-gray-400 mb-2">Task Instructions</label>
// // // // // // // //               <textarea
// // // // // // // //                 placeholder="Detail instructions for the student..."
// // // // // // // //                 value={taskDescription}
// // // // // // // //                 onChange={(e) => setTaskDescription(e.target.value)}
// // // // // // // //                 rows={3}
// // // // // // // //                 className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
// // // // // // // //               />
// // // // // // // //             </div>

// // // // // // // //             <button
// // // // // // // //               type="submit"
// // // // // // // //               disabled={loading || !selectedStudent}
// // // // // // // //               className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
// // // // // // // //             >
// // // // // // // //               Dispatch Task
// // // // // // // //             </button>
// // // // // // // //           </form>
// // // // // // // //         </div>
// // // // // // // //       </div>

// // // // // // // //       {/* Student Active Task Feed */}
// // // // // // // //       {selectedStudent && (
// // // // // // // //         <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
// // // // // // // //           <h3 className="text-lg font-bold mb-4">Assigned Task Logs</h3>
// // // // // // // //           // {studentAssignments.length > 0 ? (
// // // // // // // //           //   <div className="space-y-3">
// // // // // // // //           //     {studentAssignments.map((task) => (
// // // // // // // //           //       <div key={task.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-between">
// // // // // // // //           //         <div>
// // // // // // // //           //           <h4 className="font-bold text-gray-900 dark:text-white">{task.task_name}</h4>
// // // // // // // //           //           <p className="text-xs text-gray-500">{task.description || "No description provided."}</p>
// // // // // // // //           //         </div>
// // // // // // // //           //         <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
// // // // // // // //           //           task.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
// // // // // // // //           //         }`}>
// // // // // // // //           //           {task.status}
// // // // // // // //           //         </span>
// // // // // // // //           //       </div>
// // // // // // // //           //     ))}
// // // // // // // //           <div className="space-y-4">
// // // // // // // //   {studentAssignments.map((task) => (
// // // // // // // //     <div
// // // // // // // //       key={task.id}
// // // // // // // //       className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-5"
// // // // // // // //     >
// // // // // // // //       <div className="flex justify-between items-start mb-3">
// // // // // // // //         <div>
// // // // // // // //           <h4 className="font-bold">{task.task_name}</h4>
// // // // // // // //           <p className="text-sm text-gray-500 mt-1">
// // // // // // // //             {task.description}
// // // // // // // //           </p>
// // // // // // // //         </div>

// // // // // // // //         <span
// // // // // // // //           className={`px-3 py-1 rounded-full text-xs font-bold ${
// // // // // // // //             task.status === "completed"
// // // // // // // //               ? "bg-green-100 text-green-600"
// // // // // // // //               : task.status === "submitted"
// // // // // // // //               ? "bg-blue-100 text-blue-600"
// // // // // // // //               : "bg-orange-100 text-orange-600"
// // // // // // // //           }`}
// // // // // // // //         >
// // // // // // // //           {task.status}
// // // // // // // //         </span>
// // // // // // // //       </div>

// // // // // // // //       {task.submission_link && (
// // // // // // // //         <div className="mb-4">
// // // // // // // //           <label className="text-xs font-bold uppercase text-gray-400">
// // // // // // // //             Student Submission
// // // // // // // //           </label>

// // // // // // // //           <a
// // // // // // // //             href={task.submission_link}
// // // // // // // //             target="_blank"
// // // // // // // //             rel="noopener noreferrer"
// // // // // // // //             className="block text-purple-600 underline break-all"
// // // // // // // //           >
// // // // // // // //             {task.submission_link}
// // // // // // // //           </a>
// // // // // // // //         </div>
// // // // // // // //       )}

// // // // // // // //       <div className="space-y-3">
// // // // // // // //         <input
// // // // // // // //           type="text"
// // // // // // // //           placeholder="Grade (A+, 95%, Pass...)"
// // // // // // // //           defaultValue={task.grade || ""}
// // // // // // // //           onChange={(e) => setGrade(e.target.value)}
// // // // // // // //           className="w-full rounded-xl border p-3 bg-gray-50 dark:bg-white/5"
// // // // // // // //         />

// // // // // // // //         <textarea
// // // // // // // //           rows={3}
// // // // // // // //           placeholder="Tutor feedback..."
// // // // // // // //           defaultValue={task.tutor_feedback || ""}
// // // // // // // //           onChange={(e) => setFeedback(e.target.value)}
// // // // // // // //           className="w-full rounded-xl border p-3 bg-gray-50 dark:bg-white/5 resize-none"
// // // // // // // //         />

// // // // // // // //         <button
// // // // // // // //           onClick={() => handleReviewTask(task.id)}
// // // // // // // //           className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold"
// // // // // // // //         >
// // // // // // // //           Save Review
// // // // // // // //         </button>
// // // // // // // //       </div>
// // // // // // // //     </div>
// // // // // // // //   ))}
// // // // // // // // </div>
// // // // // // // //             </div>
// // // // // // // //           ) : (
// // // // // // // //             <p className="text-sm text-gray-400 py-6 text-center">No tasks assigned to this student yet.</p>
// // // // // // // //           )}
// // // // // // // //         </div>
// // // // // // // //       )}
// // // // // // // //     </div>
// // // // // // // //   );
// // // // // // // // }