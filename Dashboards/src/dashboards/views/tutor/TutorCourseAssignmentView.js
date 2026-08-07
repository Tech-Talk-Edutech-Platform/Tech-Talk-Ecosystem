import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabase";
import toast from "react-hot-toast";
import { BookOpen, CheckCircle, User, Layers, Send } from "lucide-react";

export default function TutorCourseAssignmentView({ userId }) {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [studentAssignments, setStudentAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTutorStudents();
    fetchCourses();
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

//   const handleReviewTask = async (taskId) => {
//     setLoading(true);

//     const { error } = await supabase
//       .from("student_assignments")
//       .update({
//      const task = studentAssignments.find((a) => a.id === taskId);

// const { error } = await supabase
//   .from("student_assignments")
//   .update({
//     tutor_feedback: task.tutor_feedback,
//     grade: task.grade,
//     status: "pending",
//     updated_at: new Date().toISOString(),
//   })
//   .eq("id", taskId);
//         status: "completed",
//         updated_at: new Date().toISOString(),
//       })
//       .eq("id", taskId);

//     setLoading(false);

//     if (error) {
//       toast.error("Failed to save review.");
//       return;
//     }

//     toast.success("Assignment reviewed successfully!");
//     fetchStudentAssignments(selectedStudent);
//   };
  const handleReviewTask = async (taskId) => {
  const task = studentAssignments.find((a) => a.id === taskId);
  if (!task) return;

  setLoading(true);

  const { error } = await supabase
    .from("student_assignments")
    .update({
      tutor_feedback: task.tutor_feedback,
      grade: task.grade,
      status: "completed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId);

  setLoading(false);

  if (error) {
    toast.error("Failed to save review.");
    return;
  }

  toast.success("Assignment reviewed successfully!");
  fetchStudentAssignments(selectedStudent);
};

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("id, title")
      .order("title");

    if (error) {
      toast.error("Failed to load courses.");
    } else {
      setCourses(data || []);
    }
  };

  const handleStudentChange = async (studentId) => {
    setSelectedStudent(studentId);
    const student = students.find((s) => s.id === studentId);
    if (student?.assigned_course_id) {
      setSelectedCourse(student.assigned_course_id);
    } else {
      setSelectedCourse("");
    }
    await fetchStudentAssignments(studentId);
  };

  const fetchStudentAssignments = async (studentId) => {
    const { data, error } = await supabase
      .from("student_assignments")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (!error) {
      setStudentAssignments(data || []);
    }
  };

  const handleAssignCourse = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedCourse) {
      toast.error("Please select both a student and a course.");
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("users")
      .update({ assigned_course_id: selectedCourse })
      .eq("id", selectedStudent);

    setLoading(false);

    if (error) {
      toast.error("Error assigning course to student.");
    } else {
      toast.success("Course successfully assigned to student!");
      fetchTutorStudents();
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !taskName) {
      toast.error("Please select a student and provide a task name.");
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("student_assignments")
      .insert([
        {
          tutor_id: userId,
          student_id: selectedStudent,
          task_name: taskName,
          description: taskDescription,
          status: "pending",
        },
      ]);

    setLoading(false);

    if (error) {
      toast.error("Failed to create assignment task.");
    } else {
      toast.success("Assignment task dispatched successfully!");
      setTaskName("");
      setTaskDescription("");
      fetchStudentAssignments(selectedStudent);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
        <h2 className="text-xl font-black mb-2 flex items-center gap-2">
          <BookOpen className="text-purple-600" size={24} />
          Course & Assignment Management
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Assign main curriculum courses and individual task assignments to your students.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Assignment Panel */}
        <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Layers size={18} className="text-purple-500" />
            Assign Core Course
          </h3>
          
          <form onSubmit={handleAssignCourse} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase text-gray-400 mb-2">Select Student</label>
              <select
                value={selectedStudent}
                onChange={(e) => handleStudentChange(e.target.value)}
                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">-- Choose Student --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.full_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-400 mb-2">Select Course Curriculum</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">-- Choose Course --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              Save Course Assignment
            </button>
          </form>
        </div>

        {/* Custom Task / Homework Panel */}
        <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Send size={18} className="text-pink-500" />
            Assign Homework Task
          </h3>

          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase text-gray-400 mb-2">Task Title</label>
              <input
                type="text"
                placeholder="e.g., Build a Python Function"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-400 mb-2">Task Instructions</label>
              <textarea
                placeholder="Detail instructions for the student..."
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !selectedStudent}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              Dispatch Task
            </button>
          </form>
        </div>
      </div>

      {/* Student Active Task Feed */}
      {selectedStudent && (
        <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Assigned Task Logs</h3>
          
          {studentAssignments.length > 0 ? (
            <div className="space-y-4">
              {studentAssignments.map((task) => (
                <div
                  key={task.id}
                  className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-5"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold">{task.task_name}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {task.description}
                      </p>
                    </div>

                    <span
//                       className={`px-3 py-1 rounded-full text-xs font-bold ${
//                         task.status === "completed"
//                           ? "bg-green-100 text-green-600"
//                           : className={`w-full py-3 rounded-xl font-bold text-white transition ${
//   task.status === "submitted"
//     ? "bg-green-600 hover:bg-green-700"
//     : "bg-gray-400 cursor-not-allowed"
// }`}
//                           ? "bg-blue-100 text-blue-600"
//                           : "bg-orange-100 text-orange-600"
//                       }`}
className={`px-3 py-1 rounded-full text-xs font-bold ${
  task.status === "completed"
    ? "bg-green-100 text-green-600"
    : task.status === "submitted"
    ? "bg-blue-100 text-blue-600"
    : "bg-orange-100 text-orange-600"
}`}
                    >
                      {task.status}
                    </span>
                  </div>
{task.submitted_at && (
  <p className="text-xs text-gray-500 mt-2">
    Submitted on {new Date(task.submitted_at).toLocaleString()}
  </p>
)}
{task.grade && (
  <div className="mt-3">
    <span className="font-bold text-green-600">
      Grade: {task.grade}
    </span>
  </div>
)}
{task.tutor_feedback && (
  <div className="mt-3 rounded-xl bg-purple-50 dark:bg-purple-500/10 p-4">
    <p className="text-sm font-bold mb-1">Tutor Feedback</p>
    <p className="text-sm">{task.tutor_feedback}</p>
  </div>
)}
                  {task.submission_link && (
                    <div className="mb-4">
                      <label className="text-xs font-bold uppercase text-gray-400">
                        Student Submission
                      </label>

                      <a
                        href={task.submission_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-purple-600 underline break-all"
                      >
                        {task.submission_link}
                      </a>
                    </div>
                  )}

                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Grade (A+, 95%, Pass...)"
                      value={task.grade || ""}
onChange={(e) => {
  setStudentAssignments((prev) =>
    prev.map((a) =>
      a.id === task.id
        ? { ...a, grade: e.target.value }
        : a
    )
  );
}}
                      className="w-full rounded-xl border p-3 bg-gray-50 dark:bg-white/5"
                    />

                    <textarea
                      rows={3}
                      placeholder="Tutor feedback..."
                     value={task.tutor_feedback || ""}
onChange={(e) => {
  setStudentAssignments((prev) =>
    prev.map((a) =>
      a.id === task.id
        ? { ...a, tutor_feedback: e.target.value }
        : a
    )
  );
}}
                      className="w-full rounded-xl border p-3 bg-gray-50 dark:bg-white/5 resize-none"
                    />

               
                    <button
  onClick={() => handleReviewTask(task.id)}
  disabled={loading || task.status !== "submitted"}
  className={`w-full py-3 rounded-xl font-bold text-white transition ${
    task.status === "submitted"
      ? "bg-green-600 hover:bg-green-700"
      : "bg-gray-400 cursor-not-allowed"
  }`}
>
  {task.status === "submitted"
    ? "Save Review"
    : "Waiting for Student Submission"}
</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-6 text-center">No tasks assigned to this student yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
// import React, { useState, useEffect } from "react";
// import { supabase } from "../../../supabase";
// import toast from "react-hot-toast";
// import { BookOpen, CheckCircle, User, Layers, Send } from "lucide-react";

// export default function TutorCourseAssignmentView({ userId }) {
//   const [students, setStudents] = useState([]);
//   const [courses, setCourses] = useState([]);
//   const [selectedStudent, setSelectedStudent] = useState("");
//   const [selectedCourse, setSelectedCourse] = useState("");
//   const [taskName, setTaskName] = useState("");
//   const [taskDescription, setTaskDescription] = useState("");
//   const [studentAssignments, setStudentAssignments] = useState([]);
//   const [loading, setLoading] = useState(false);
// const [feedback, setFeedback] = useState("");
// const [grade, setGrade] = useState("");
//   useEffect(() => {
//     fetchTutorStudents();
//     fetchCourses();
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
// const handleSelectTask = (task) => {
//   setFeedback(task.tutor_feedback || "");
//   setGrade(task.grade || "");
// };
// const handleReviewTask = async (taskId) => {
//   setLoading(true);

//   const { error } = await supabase
//     .from("student_assignments")
//     .update({
//       tutor_feedback: feedback,
//       grade,
//       status: "completed",
//       updated_at: new Date().toISOString(),
//     })
//     .eq("id", taskId);

//   setLoading(false);

//   if (error) {
//     toast.error("Failed to save review.");
//     return;
//   }

//   toast.success("Assignment reviewed successfully!");
//   fetchStudentAssignments(selectedStudent);
// };
//   const fetchCourses = async () => {
//     const { data, error } = await supabase
//       .from("courses")
//       .select("id, title")
//       .order("title");

//     if (error) {
//       toast.error("Failed to load courses.");
//     } else {
//       setCourses(data || []);
//     }
//   };

//   const handleStudentChange = async (studentId) => {
//     setSelectedStudent(studentId);
//     const student = students.find((s) => s.id === studentId);
//     if (student?.assigned_course_id) {
//       setSelectedCourse(student.assigned_course_id);
//     } else {
//       setSelectedCourse("");
//     }
//     await fetchStudentAssignments(studentId);
//   };

//   const fetchStudentAssignments = async (studentId) => {
//     const { data, error } = await supabase
//       .from("student_assignments")
//       .select("*")
//       .eq("student_id", studentId)
//       .order("created_at", { ascending: false });

//     if (!error) {
//       setStudentAssignments(data || []);
//     }
//   };

//   const handleAssignCourse = async (e) => {
//     e.preventDefault();
//     if (!selectedStudent || !selectedCourse) {
//       toast.error("Please select both a student and a course.");
//       return;
//     }

//     setLoading(true);
//     const { error } = await supabase
//       .from("users")
//       .update({ assigned_course_id: selectedCourse })
//       .eq("id", selectedStudent);

//     setLoading(false);

//     if (error) {
//       toast.error("Error assigning course to student.");
//     } else {
//       toast.success("Course successfully assigned to student!");
//       fetchTutorStudents();
//     }
//   };

//   const handleCreateTask = async (e) => {
//     e.preventDefault();
//     if (!selectedStudent || !taskName) {
//       toast.error("Please select a student and provide a task name.");
//       return;
//     }

//     setLoading(true);
//     const { error } = await supabase
//       .from("student_assignments")
//       .insert([
//         {
//           tutor_id: userId,
//           student_id: selectedStudent,
//           task_name: taskName,
//           description: taskDescription,
//           status: "pending",
//         },
//       ]);

//     setLoading(false);

//     if (error) {
//       toast.error("Failed to create assignment task.");
//     } else {
//       toast.success("Assignment task dispatched successfully!");
//       setTaskName("");
//       setTaskDescription("");
//       fetchStudentAssignments(selectedStudent);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
//         <h2 className="text-xl font-black mb-2 flex items-center gap-2">
//           <BookOpen className="text-purple-600" size={24} />
//           Course & Assignment Management
//         </h2>
//         <p className="text-sm text-gray-500 dark:text-gray-400">
//           Assign main curriculum courses and individual task assignments to your students.
//         </p>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Course Assignment Panel */}
//         <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
//           <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
//             <Layers size={18} className="text-purple-500" />
//             Assign Core Course
//           </h3>
          
//           <form onSubmit={handleAssignCourse} className="space-y-4">
//             <div>
//               <label className="block text-xs font-black uppercase text-gray-400 mb-2">Select Student</label>
//               <select
//                 value={selectedStudent}
//                 onChange={(e) => handleStudentChange(e.target.value)}
//                 className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
//               >
//                 <option value="">-- Choose Student --</option>
//                 {students.map((s) => (
//                   <option key={s.id} value={s.id}>{s.full_name}</option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-xs font-black uppercase text-gray-400 mb-2">Select Course Curriculum</label>
//               <select
//                 value={selectedCourse}
//                 onChange={(e) => setSelectedCourse(e.target.value)}
//                 className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
//               >
//                 <option value="">-- Choose Course --</option>
//                 {courses.map((c) => (
//                   <option key={c.id} value={c.id}>{c.title}</option>
//                 ))}
//               </select>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
//             >
//               <CheckCircle size={18} />
//               Save Course Assignment
//             </button>
//           </form>
//         </div>

//         {/* Custom Task / Homework Panel */}
//         <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
//           <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
//             <Send size={18} className="text-pink-500" />
//             Assign Homework Task
//           </h3>

//           <form onSubmit={handleCreateTask} className="space-y-4">
//             <div>
//               <label className="block text-xs font-black uppercase text-gray-400 mb-2">Task Title</label>
//               <input
//                 type="text"
//                 placeholder="e.g., Build a Python Function"
//                 value={taskName}
//                 onChange={(e) => setTaskName(e.target.value)}
//                 className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
//               />
//             </div>

//             <div>
//               <label className="block text-xs font-black uppercase text-gray-400 mb-2">Task Instructions</label>
//               <textarea
//                 placeholder="Detail instructions for the student..."
//                 value={taskDescription}
//                 onChange={(e) => setTaskDescription(e.target.value)}
//                 rows={3}
//                 className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
//               />
//             </div>

//             <button
//               type="submit"
//               disabled={loading || !selectedStudent}
//               className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
//             >
//               Dispatch Task
//             </button>
//           </form>
//         </div>
//       </div>

//       {/* Student Active Task Feed */}
//       {selectedStudent && (
//         <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
//           <h3 className="text-lg font-bold mb-4">Assigned Task Logs</h3>
//           // {studentAssignments.length > 0 ? (
//           //   <div className="space-y-3">
//           //     {studentAssignments.map((task) => (
//           //       <div key={task.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-between">
//           //         <div>
//           //           <h4 className="font-bold text-gray-900 dark:text-white">{task.task_name}</h4>
//           //           <p className="text-xs text-gray-500">{task.description || "No description provided."}</p>
//           //         </div>
//           //         <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
//           //           task.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
//           //         }`}>
//           //           {task.status}
//           //         </span>
//           //       </div>
//           //     ))}
//           <div className="space-y-4">
//   {studentAssignments.map((task) => (
//     <div
//       key={task.id}
//       className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-5"
//     >
//       <div className="flex justify-between items-start mb-3">
//         <div>
//           <h4 className="font-bold">{task.task_name}</h4>
//           <p className="text-sm text-gray-500 mt-1">
//             {task.description}
//           </p>
//         </div>

//         <span
//           className={`px-3 py-1 rounded-full text-xs font-bold ${
//             task.status === "completed"
//               ? "bg-green-100 text-green-600"
//               : task.status === "submitted"
//               ? "bg-blue-100 text-blue-600"
//               : "bg-orange-100 text-orange-600"
//           }`}
//         >
//           {task.status}
//         </span>
//       </div>

//       {task.submission_link && (
//         <div className="mb-4">
//           <label className="text-xs font-bold uppercase text-gray-400">
//             Student Submission
//           </label>

//           <a
//             href={task.submission_link}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="block text-purple-600 underline break-all"
//           >
//             {task.submission_link}
//           </a>
//         </div>
//       )}

//       <div className="space-y-3">
//         <input
//           type="text"
//           placeholder="Grade (A+, 95%, Pass...)"
//           defaultValue={task.grade || ""}
//           onChange={(e) => setGrade(e.target.value)}
//           className="w-full rounded-xl border p-3 bg-gray-50 dark:bg-white/5"
//         />

//         <textarea
//           rows={3}
//           placeholder="Tutor feedback..."
//           defaultValue={task.tutor_feedback || ""}
//           onChange={(e) => setFeedback(e.target.value)}
//           className="w-full rounded-xl border p-3 bg-gray-50 dark:bg-white/5 resize-none"
//         />

//         <button
//           onClick={() => handleReviewTask(task.id)}
//           className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold"
//         >
//           Save Review
//         </button>
//       </div>
//     </div>
//   ))}
// </div>
//             </div>
//           ) : (
//             <p className="text-sm text-gray-400 py-6 text-center">No tasks assigned to this student yet.</p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }