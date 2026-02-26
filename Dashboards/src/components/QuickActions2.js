// QuickActions2.js
import React, { useState, useEffect } from "react";
import {
  Plus,
  CheckCircle,
  HelpCircle,
  Award,
  MessageSquare,
  Star,
  BookOpen,
  AlertTriangle,
  FileText,
  ShieldAlert,
  UserCheck,
  X,
} from "lucide-react";
import { supabase } from "../supabase"; // make sure this points to your supabase client
import UserManagement from "./UserManagement";
import StudentAssignmentManager from "./StudentAssignmentManager";

export default function QuickActions2({ userId, role }) {
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showStudentManager, setShowStudentManager] = useState(false);
  const [showTrialMaterial, setShowTrialMaterial] = useState(false);
  const [showCourseMaterial, setShowCourseMaterial] = useState(false);

  // Course Material state
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentTasks, setStudentTasks] = useState([]);

  // Google Doc URL for Trial Material
  const GOOGLE_DOC_URL =
    "https://docs.google.com/document/d/1DNIqIxd52u_8Qe8vcWZ0ANMNh35AR4FCWzoLfK_Dq5M/preview";

  const actionConfigs = {
    tutor: [
      {
        label: "Trial Class Material",
        icon: Star,
        color: "bg-amber-400",
        shadow: "shadow-amber-200",
      },
      {
        label: "Course Material",
        icon: BookOpen,
        color: "bg-indigo-500",
        shadow: "shadow-indigo-200",
      },
      { label: "Sales Alert", icon: AlertTriangle, color: "bg-rose-500", shadow: "shadow-rose-200" },
      { label: "Feedback Form", icon: FileText, color: "bg-orange-600", shadow: "shadow-emerald-200" },
      { label: "Create Assignment", icon: Plus, color: "bg-blue-500", shadow: "shadow-blue-200" },
      { label: "View Assignments", icon: CheckCircle, color: "bg-emerald-500", shadow: "shadow-emerald-200" },
    ],
    student: [
      { label: "Request Help", icon: HelpCircle, color: "bg-amber-500", shadow: "shadow-amber-200" },
      { label: "View Certificate", icon: Award, color: "bg-indigo-500", shadow: "shadow-indigo-200" },
      { label: "Submit Ticket", icon: MessageSquare, color: "bg-sky-500", shadow: "shadow-sky-200" },
      { label: "Learning Path", icon: FileText, color: "bg-pink-500", shadow: "shadow-pink-200" },
    ],
    owner: [
      { label: "User Management", icon: UserCheck, color: "bg-indigo-600", shadow: "shadow-blue-200" },
      { label: "Reports Audit", icon: ShieldAlert, color: "bg-slate-700", shadow: "shadow-slate-200" },
      { label: "Announcement", icon: MessageSquare, color: "bg-blue-600", shadow: "shadow-blue-200" },
      { label: "Student Assignments", icon: FileText, color: "bg-emerald-600", shadow: "shadow-emerald-200" },
    ],
  };

  const currentActions = actionConfigs[role] || [];

  const handleActionClick = async (label) => {
    if (label === "User Management") return setShowUserManagement(true);
    if (label === "Student Assignments") return setShowStudentManager(true);
    if (label === "Trial Class Material") return setShowTrialMaterial(true);
    if (label === "Course Material") {
      // fetch tutor's students
      const { data: studentsData, error } = await supabase
        .from("students")
        .select("id, full_name")
        .eq("assigned_tutor_id", userId)
        .order("full_name");

      if (!error) setStudents(studentsData);
      setShowCourseMaterial(true);
    }
  };

  const handleSelectStudent = async (studentId) => {
    setSelectedStudent(studentId);

    // fetch assignments
    const { data: assignmentData } = await supabase
      .from("student_assignments")
      .select("id, task_name, status")
      .eq("student_id", studentId)
      .order("created_at");

    // fetch notes
    const { data: notesData } = await supabase
      .from("notes")
      .select("id, title, status")
      .eq("student_id", studentId)
      .order("created_at");

    // combine assignments and notes
    const combined = [
      ...assignmentData.map((a) => ({ ...a, type: "assignment", name: a.task_name })),
      ...notesData.map((n) => ({ ...n, type: "note", name: n.title })),
    ];

    setStudentTasks(combined);
  };

  return (
    <>
      {/* Quick Actions Card */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-slate-900 font-sans tracking-tight">Quick Actions</h3>
          <span className="px-2 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-tighter">{role}</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {currentActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionClick(action.label)}
              className="group flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-50 hover:border-transparent hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 active:scale-95"
            >
              <div className={`p-3 rounded-xl ${action.color} text-white shadow-lg ${action.shadow} group-hover:scale-110 transition-transform duration-300 mb-3`}>
                <action.icon size={20} />
              </div>
              <span className="text-[11px] font-black text-slate-600 group-hover:text-slate-900 text-center leading-tight">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* User Management Modal */}
      {showUserManagement && (
        <Modal title="User Management" onClose={() => setShowUserManagement(false)}>
          <UserManagement viewerRole={role} showAdmins={role === "owner"} />
        </Modal>
      )}

      {/* Student Assignment Modal */}
      {showStudentManager && (
        <Modal title="Student Assignment Manager" onClose={() => setShowStudentManager(false)}>
          <StudentAssignmentManager />
        </Modal>
      )}

      {/* Trial Class Material Modal */}
      {showTrialMaterial && (
        <Modal title="Trial Class Material" onClose={() => setShowTrialMaterial(false)}>
          <iframe src={GOOGLE_DOC_URL} className="w-full h-[600px] border rounded-lg" title="Trial Class Material" />
        </Modal>
      )}

      {/* Course Material Modal */}
      {showCourseMaterial && (
        <Modal title="Course Material" onClose={() => setShowCourseMaterial(false)}>
          <div className="flex">
            {/* Students List */}
            <div className="w-1/3 pr-4 border-r overflow-y-auto">
              <h3 className="font-bold mb-2">Students</h3>
              <ul>
                {students.map((s) => (
                  <li
                    key={s.id}
                    onClick={() => handleSelectStudent(s.id)}
                    className={`p-2 rounded mb-1 cursor-pointer ${selectedStudent === s.id ? "bg-slate-200" : "bg-slate-100 hover:bg-slate-200"}`}
                  >
                    {s.full_name}
                  </li>
                ))}
              </ul>
            </div>

            {/* Student Tasks List */}
            <div className="w-2/3 pl-4 overflow-y-auto">
              <h3 className="font-bold mb-2">Assignments & Notes</h3>
              <ul>
                {studentTasks.map((task) => (
                  <li
                    key={task.id}
                    className={`p-2 rounded mb-1 text-white ${
                      task.status === "done" ? "bg-green-500" : "bg-orange-500"
                    }`}
                  >
                    {task.type === "assignment" ? "Assignment: " : "Note: "} {task.name} ({task.status})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

// Reusable Modal Component
const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
    <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-8 relative">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition"
      >
        <X size={22} />
      </button>
      <h2 className="text-2xl font-black mb-6">{title}</h2>
      {children}
    </div>
  </div>
);
// // QuickActions2.js
// import React, { useState } from 'react';
// import { 
//   Plus, CheckCircle, HelpCircle, Award, MessageSquare, Star,
//   BookOpen, AlertTriangle, FileText, ShieldAlert, UserCheck, X
// } from "lucide-react";

// export default function QuickActions2({ userId, role }) {
//   const [showCourseMaterial, setShowCourseMaterial] = useState(false);
//   const [selectedStudent, setSelectedStudent] = useState(null);

//   // Dummy data for demo
//   const students = [
//     { id: 1, name: "Alice" },
//     { id: 2, name: "Bob" },
//     { id: 3, name: "Charlie" },
//   ];

//   const courseProgress = {
//     1: { "Lesson 1": true, "Lesson 2": false, "Lesson 3": true },
//     2: { "Lesson 1": true, "Lesson 2": true, "Lesson 3": true },
//     3: { "Lesson 1": false, "Lesson 2": false, "Lesson 3": false },
//   };

//   const actionConfigs = {
//     tutor: [
//       { label: "Course Material", icon: BookOpen, color: "bg-indigo-500", shadow: "shadow-indigo-200" },
//       // other actions...
//     ]
//   };

//   const currentActions = actionConfigs[role] || [];

//   const handleActionClick = (label) => {
//     if (label === "Course Material") {
//       setShowCourseMaterial(true);
//       setSelectedStudent(null); // reset student selection
//     }
//   };

//   return (
//     <>
//       <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
//         <div className="grid grid-cols-2 gap-4">
//           {currentActions.map((action, index) => (
//             <button
//               key={index}
//               onClick={() => handleActionClick(action.label)}
//               className={`group flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-50 hover:border-transparent hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 active:scale-95`}
//             >
//               <div className={`p-3 rounded-xl ${action.color} text-white shadow-lg ${action.shadow} mb-3`}>
//                 <action.icon size={20} />
//               </div>
//               <span className="text-[11px] font-black text-slate-600 group-hover:text-slate-900 text-center leading-tight">
//                 {action.label}
//               </span>
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Course Material Modal */}
//       {showCourseMaterial && (
//         <Modal title="Course Material" onClose={() => setShowCourseMaterial(false)}>
//           {!selectedStudent ? (
//             <div className="space-y-2">
//               <h3 className="font-bold mb-4">Select a student:</h3>
//               {students.map(student => (
//                 <button
//                   key={student.id}
//                   onClick={() => setSelectedStudent(student)}
//                   className="w-full text-left px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200"
//                 >
//                   {student.name}
//                 </button>
//               ))}
//             </div>
//           ) : (
//             <div>
//               <button
//                 onClick={() => setSelectedStudent(null)}
//                 className="mb-4 px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 text-sm"
//               >
//                 ← Back to students
//               </button>
//               <h3 className="font-bold mb-2">{selectedStudent.name}'s Progress</h3>
//               <div className="grid grid-cols-1 gap-2">
//                 {Object.entries(courseProgress[selectedStudent.id]).map(([lesson, done]) => (
//                   <div
//                     key={lesson}
//                     className={`px-4 py-2 rounded ${
//                       done ? "bg-emerald-400 text-white" : "bg-orange-400 text-white"
//                     }`}
//                   >
//                     {lesson} — {done ? "Done" : "Not Done"}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </Modal>
//       )}
//     </>
//   );
// }

// // Reusable Modal Component
// const Modal = ({ title, children, onClose }) => (
//   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
//     <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-8 relative">
//       <button
//         onClick={onClose}
//         className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition"
//       >
//         <X size={22} />
//       </button>
//       <h2 className="text-2xl font-black mb-6">{title}</h2>
//       {children}
//     </div>
//   </div>
// );
// // // QuickActions2.js
// // import React, { useState } from 'react';
// // import { 
// //   Plus, CheckCircle, HelpCircle, Award, MessageSquare, Star,
// //   BookOpen, AlertTriangle, FileText, ShieldAlert, UserCheck, X
// // } from "lucide-react";
// // import UserManagement from "./UserManagement";
// // import StudentAssignmentManager from "./StudentAssignmentManager";

// // export default function QuickActions2({ userId, role }) {
// //   const [showUserManagement, setShowUserManagement] = useState(false);
// //   const [showStudentManager, setShowStudentManager] = useState(false);
// //   const [showTrialMaterial, setShowTrialMaterial] = useState(false);

// //   // Replace with your actual Google Doc URL (use /preview for iframe)
// //   const GOOGLE_DOC_URL = "https://docs.google.com/document/d/1DNIqIxd52u_8Qe8vcWZ0ANMNh35AR4FCWzoLfK_Dq5M/preview";

// //   const actionConfigs = {
// //     tutor: [
// //       { label: "Trial Class Material", icon: Star, color: "bg-amber-400", shadow: "shadow-amber-200" },
// //       { label: "Course Material", icon: BookOpen, color: "bg-indigo-500", shadow: "shadow-indigo-200" },
// //       { label: "Sales Alert", icon: AlertTriangle, color: "bg-rose-500", shadow: "shadow-rose-200" },
// //       { label: "Feedback Form", icon: FileText, color: "bg-orange-600", shadow: "shadow-emerald-200" },
// //       { label: "Create Assignment", icon: Plus, color: "bg-blue-500", shadow: "shadow-blue-200" },
// //       { label: "View Assignments", icon: CheckCircle, color: "bg-emerald-500", shadow: "shadow-emerald-200" },
// //     ],
// //     student: [
// //       { label: "Request Help", icon: HelpCircle, color: "bg-amber-500", shadow: "shadow-amber-200" },
// //       { label: "View Certificate", icon: Award, color: "bg-indigo-500", shadow: "shadow-indigo-200" },
// //       { label: "Submit Ticket", icon: MessageSquare, color: "bg-sky-500", shadow: "shadow-sky-200" },
// //       { label: "Learning Path", icon: FileText, color: "bg-pink-500", shadow: "shadow-pink-200" }
// //     ],
// //     owner: [
// //       { label: "User Management", icon: UserCheck, color: "bg-indigo-600", shadow: "shadow-blue-200" },
// //       { label: "Reports Audit", icon: ShieldAlert, color: "bg-slate-700", shadow: "shadow-slate-200" },
// //       { label: "Announcement", icon: MessageSquare, color: "bg-blue-600", shadow: "shadow-blue-200" },
// //       { label: "Student Assignments", icon: FileText, color: "bg-emerald-600", shadow: "shadow-emerald-200" }
// //     ]
// //   };

// //   const currentActions = actionConfigs[role] || [];

// //   const handleActionClick = (label) => {
// //     if (label === "User Management") return setShowUserManagement(true);
// //     if (label === "Student Assignments") return setShowStudentManager(true);
// //     if (label === "Trial Class Material") return setShowTrialMaterial(true);

// //     alert(`${label} feature coming soon!`);
// //   };

// //   return (
// //     <>
// //       {/* Quick Actions Card */}
// //       <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
// //         <div className="flex items-center justify-between mb-6">
// //           <h3 className="text-xl font-black text-slate-900 font-sans tracking-tight">Quick Actions</h3>
// //           <span className="px-2 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-tighter">{role}</span>
// //         </div>
// //         <div className="grid grid-cols-2 gap-4">
// //           {currentActions.map((action, index) => (
// //             <button
// //               key={index}
// //               onClick={() => handleActionClick(action.label)}
// //               className="group flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-50 hover:border-transparent hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 active:scale-95"
// //             >
// //               <div className={`p-3 rounded-xl ${action.color} text-white shadow-lg ${action.shadow} group-hover:scale-110 transition-transform duration-300 mb-3`}>
// //                 <action.icon size={20} />
// //               </div>
// //               <span className="text-[11px] font-black text-slate-600 group-hover:text-slate-900 text-center leading-tight">{action.label}</span>
// //             </button>
// //           ))}
// //         </div>
// //       </div>

// //       {/* User Management Modal */}
// //       {showUserManagement && (
// //         <Modal title="User Management" onClose={() => setShowUserManagement(false)}>
// //           <UserManagement viewerRole={role} showAdmins={role === "owner"} />
// //         </Modal>
// //       )}

// //       {/* Student Assignment Modal */}
// //       {showStudentManager && (
// //         <Modal title="Student Assignment Manager" onClose={() => setShowStudentManager(false)}>
// //           <StudentAssignmentManager />
// //         </Modal>
// //       )}

// //       {/* Trial Class Material Modal */}
// //       {showTrialMaterial && (
// //         <Modal title="Trial Class Material" onClose={() => setShowTrialMaterial(false)}>
// //           <iframe
// //             src={GOOGLE_DOC_URL}
// //             className="w-full h-[600px] border rounded-lg"
// //             title="Trial Class Material"
// //           />
// //         </Modal>
// //       )}
// //     </>
// //   );
// // }

// // // Reusable Modal Component
// // const Modal = ({ title, children, onClose }) => (
// //   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
// //     <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-8 relative">
// //       <button
// //         onClick={onClose}
// //         className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition"
// //       >
// //         <X size={22} />
// //       </button>
// //       <h2 className="text-2xl font-black mb-6">{title}</h2>
// //       {children}
// //     </div>
// //   </div>
// // );
// // import React, { useState } from 'react';
// // import { 
// //   Plus, CheckCircle, HelpCircle, Award, MessageSquare, Star,
// //   BookOpen, AlertTriangle, FileText, ShieldAlert, UserCheck, X
// // } from "lucide-react";
// // import UserManagement from "./UserManagement";
// // import StudentAssignmentManager from "./StudentAssignmentManager";

// // export default function QuickActions2({ userId, role }) {
// //   const [showUserManagement, setShowUserManagement] = useState(false);
// //   const [showStudentManager, setShowStudentManager] = useState(false);
// //   const [showTrialMaterial, setShowTrialMaterial] = useState(false);

// //   const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1B6rKMb67YVcn6GNGiTLstyop-hE5mLH4JkhURCaEHQg/edit?usp=sharing?rm=minimal";

// //   const actionConfigs = {
// //     tutor: [
// //       { label: "Trial Class Material", icon: Star, color: "bg-amber-400", shadow: "shadow-amber-200" },
// //       { label: "Course Material", icon: BookOpen, color: "bg-indigo-500", shadow: "shadow-indigo-200" },
// //       { label: "Sales Alert", icon: AlertTriangle, color: "bg-rose-500", shadow: "shadow-rose-200" },
// //       { label: "Feedback Form", icon: FileText, color: "bg-orange-600", shadow: "shadow-emerald-200" },
// //       { label: "Create Assignment", icon: Plus, color: "bg-blue-500", shadow: "shadow-blue-200" },
// //       { label: "View Assignments", icon: CheckCircle, color: "bg-emerald-500", shadow: "shadow-emerald-200" },
// //     ],
// //     student: [
// //       { label: "Request Help", icon: HelpCircle, color: "bg-amber-500", shadow: "shadow-amber-200" },
// //       { label: "View Certificate", icon: Award, color: "bg-indigo-500", shadow: "shadow-indigo-200" },
// //       { label: "Submit Ticket", icon: MessageSquare, color: "bg-sky-500", shadow: "shadow-sky-200" },
// //       { label: "Learning Path", icon: FileText, color: "bg-pink-500", shadow: "shadow-pink-200" }
// //     ],
// //     owner: [
// //       { label: "User Management", icon: UserCheck, color: "bg-indigo-600", shadow: "shadow-blue-200" },
// //       { label: "Reports Audit", icon: ShieldAlert, color: "bg-slate-700", shadow: "shadow-slate-200" },
// //       { label: "Announcement", icon: MessageSquare, color: "bg-blue-600", shadow: "shadow-blue-200" },
// //       { label: "Student Assignments", icon: FileText, color: "bg-emerald-600", shadow: "shadow-emerald-200" }
// //     ]
// //   };

// //   const currentActions = actionConfigs[role] || [];

// //   const handleActionClick = (label) => {
// //     if (label === "User Management") return setShowUserManagement(true);
// //     if (label === "Student Assignments") return setShowStudentManager(true);
// //     if (label === "Trial Class Material") return setShowTrialMaterial(true);

// //     alert(`${label} feature coming soon!`);
// //   };

// //   return (
// //     <>
// //       {/* Quick Actions Card */}
// //       <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
// //         <div className="flex items-center justify-between mb-6">
// //           <h3 className="text-xl font-black text-slate-900 font-sans tracking-tight">Quick Actions</h3>
// //           <span className="px-2 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-tighter">{role}</span>
// //         </div>
// //         <div className="grid grid-cols-2 gap-4">
// //           {currentActions.map((action, index) => (
// //             <button
// //               key={index}
// //               onClick={() => handleActionClick(action.label)}
// //               className="group flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-50 hover:border-transparent hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 active:scale-95"
// //             >
// //               <div className={`p-3 rounded-xl ${action.color} text-white shadow-lg ${action.shadow} group-hover:scale-110 transition-transform duration-300 mb-3`}>
// //                 <action.icon size={20} />
// //               </div>
// //               <span className="text-[11px] font-black text-slate-600 group-hover:text-slate-900 text-center leading-tight">{action.label}</span>
// //             </button>
// //           ))}
// //         </div>
// //       </div>

// //       {/* User Management Modal */}
// //       {showUserManagement && (
// //         <Modal title="User Management" onClose={() => setShowUserManagement(false)}>
// //           <UserManagement viewerRole={role} showAdmins={role === "owner"} />
// //         </Modal>
// //       )}

// //       {/* Student Assignment Modal */}
// //       {showStudentManager && (
// //         <Modal title="Student Assignment Manager" onClose={() => setShowStudentManager(false)}>
// //           <StudentAssignmentManager />
// //         </Modal>
// //       )}

// //       {/* Trial Class Material Modal */}
// //       {showTrialMaterial && (
// //         <Modal title="Trial Class Material" onClose={() => setShowTrialMaterial(false)}>
// //           <iframe
// //             src={GOOGLE_SHEET_URL}
// //             className="w-full h-[600px] border rounded-lg"
// //             title="Trial Class Material"
// //           />
// //         </Modal>
// //       )}
// //     </>
// //   );
// // }

// // // Reusable Modal Component
// // const Modal = ({ title, children, onClose }) => (
// //   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
// //     <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-8 relative">
// //       <button
// //         onClick={onClose}
// //         className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition"
// //       >
// //         <X size={22} />
// //       </button>
// //       <h2 className="text-2xl font-black mb-6">{title}</h2>
// //       {children}
// //     </div>
// //   </div>
// // );
// // // QuickActions2.js
// // import React, { useState } from 'react';
// // import { 
// //   Plus, 
// //   CheckCircle, 
// //   HelpCircle, 
// //   Award, 
// //   MessageSquare, 
// //   Star,
// //   BookOpen, 
// //   AlertTriangle,
// //   FileText,
// //   ShieldAlert,
// //    UserCheck,
// //   X
// // } from "lucide-react";
// // import UserManagement from "./UserManagement";
// // import StudentAssignmentManager from "./StudentAssignmentManager";

// // export default function QuickActions2({ userId, role }) {

// //   const [showUserManagement, setShowUserManagement] = useState(false);
// //   const [showStudentManager, setShowStudentManager] = useState(false);

// //   const actionConfigs = {
// //     tutor: [
// //       { label: "Trial Class Material", icon: Star, color: "bg-amber-400", shadow: "shadow-amber-200" },
// // { label: "Course Material", icon: BookOpen, color: "bg-indigo-500", shadow: "shadow-indigo-200" },
// //  { label: "Sales Alert", icon: AlertTriangle, color: "bg-rose-500", shadow: "shadow-rose-200" },
// //       { label: "Feedback Form", icon: FileText, color: "bg-orange-600", shadow: "shadow-emerald-200" },
      
// //       { label: "Create Assignment", icon: Plus, color: "bg-blue-500", shadow: "shadow-blue-200" },
// //       { label: "View Assignments", icon: CheckCircle, color: "bg-emerald-500", shadow: "shadow-emerald-200" },
// //       // { label: "Start Live Room", icon: Video, color: "bg-purple-500", shadow: "shadow-purple-200" },
     
// //     ],
// //     student: [
// //       { label: "Request Help", icon: HelpCircle, color: "bg-amber-500", shadow: "shadow-amber-200" },
// //       { label: "View Certificate", icon: Award, color: "bg-indigo-500", shadow: "shadow-indigo-200" },
// //       { label: "Submit Ticket", icon: MessageSquare, color: "bg-sky-500", shadow: "shadow-sky-200" },
// //       { label: "Learning Path", icon: FileText, color: "bg-pink-500", shadow: "shadow-pink-200" }
// //     ],
// //     owner: [
// //       { label: "User Management", icon: UserCheck, color: "bg-indigo-600", shadow: "shadow-blue-200" },
// //       { label: "Reports Audit", icon: ShieldAlert, color: "bg-slate-700", shadow: "shadow-slate-200" },
// //       { label: "Announcement", icon: MessageSquare, color: "bg-blue-600", shadow: "shadow-blue-200" },
// //       { label: "Student Assignments", icon: FileText, color: "bg-emerald-600", shadow: "shadow-emerald-200" }
// //     ]
// //   };

// //   const currentActions = actionConfigs[role] || [];

// //   const handleActionClick = (label) => {
// //     if (label === "User Management") {
// //       setShowUserManagement(true);
// //       return;
// //     }
// //     if (label === "Student Assignments") {
// //       setShowStudentManager(true);
// //       return;
// //     }

// //     console.log(`Action Triggered: ${label} for User: ${userId}`);
// //     alert(`${label} feature coming soon!`);
// //   };

// //   return (
// //     <>
// //       {/* Quick Actions Card */}
// //       <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
// //         <div className="flex items-center justify-between mb-6">
// //           <h3 className="text-xl font-black text-slate-900 font-sans tracking-tight">
// //             Quick Actions
// //           </h3>
// //           <span className="px-2 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-tighter">
// //             {role}
// //           </span>
// //         </div>

// //         <div className="grid grid-cols-2 gap-4">
// //           {currentActions.map((action, index) => (
// //             <button
// //               key={index}
// //               onClick={() => handleActionClick(action.label)}
// //               className="group flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-50 hover:border-transparent hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 active:scale-95"
// //             >
// //               <div className={`p-3 rounded-xl ${action.color} text-white shadow-lg ${action.shadow} group-hover:scale-110 transition-transform duration-300 mb-3`}>
// //                 <action.icon size={20} />
// //               </div>
// //               <span className="text-[11px] font-black text-slate-600 group-hover:text-slate-900 text-center leading-tight">
// //                 {action.label}
// //               </span>
// //             </button>
// //           ))}
// //         </div>
// //       </div>

// //       {/* User Management Modal */}
// //       {showUserManagement && (
// //         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
// //           <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-8 relative">
// //             <button
// //               onClick={() => setShowUserManagement(false)}
// //               className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition"
// //             >
// //               <X size={22} />
// //             </button>
// //             <h2 className="text-2xl font-black mb-6">User Management</h2>
// //             <UserManagement viewerRole={role} showAdmins={role === "owner"} />
// //           </div>
// //         </div>
// //       )}

// //       {/* Student Assignment Modal */}
// //       {showStudentManager && (
// //         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
// //           <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-8 relative">
// //             <button
// //               onClick={() => setShowStudentManager(false)}
// //               className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition"
// //             >
// //               <X size={22} />
// //             </button>
// //             <h2 className="text-2xl font-black mb-6">Student Assignment Manager</h2>
// //             <StudentAssignmentManager />
// //           </div>
// //         </div>
// //       )}
// //     </>
// //   );
// // }
// // import React, { useState } from 'react';
// // import { 
// //   Plus, 
// //   CheckCircle, 
// //   HelpCircle, 
// //   Award, 
// //   MessageSquare, 
// //   Video, 
// //   AlertTriangle,
// //   FileText,
// //   ShieldAlert,
// //   X
// // } from "lucide-react";
// // import UserManagement from "./UserManagement";
// // import StudentAssignmentManager from "./StudentAssignmentManager";

// // export default function QuickActions2({ userId, role }) {

// //   const [showUserManagement, setShowUserManagement] = useState(false);
// //   const [showStudentManager, setShowStudentManager] = useState(false);

// //   const actionConfigs = {
// //     tutor: [
// //       { label: "Create Assignment", icon: Plus, color: "bg-blue-500", shadow: "shadow-blue-200" },
// //       { label: "Log Attendance", icon: CheckCircle, color: "bg-emerald-500", shadow: "shadow-emerald-200" },
// //       { label: "Start Live Room", icon: Video, color: "bg-purple-500", shadow: "shadow-purple-200" },
// //       { label: "Send Group Alert", icon: AlertTriangle, color: "bg-rose-500", shadow: "shadow-rose-200" }
// //     ],
// //     student: [
// //       { label: "Request Help", icon: HelpCircle, color: "bg-amber-500", shadow: "shadow-amber-200" },
// //       { label: "View Certificate", icon: Award, color: "bg-indigo-500", shadow: "shadow-indigo-200" },
// //       { label: "Submit Ticket", icon: MessageSquare, color: "bg-sky-500", shadow: "shadow-sky-200" },
// //       { label: "Learning Path", icon: FileText, color: "bg-pink-500", shadow: "shadow-pink-200" }
// //     ],
// //     owner: [
// //       { label: "User Management", icon: ShieldAlert, color: "bg-indigo-600", shadow: "shadow-blue-200" },
// //       { label: "System Audit", icon: FileText, color: "bg-slate-700", shadow: "shadow-slate-200" },
// //       { label: "Announcement", icon: MessageSquare, color: "bg-blue-600", shadow: "shadow-blue-200" },
// //        { label: "Student Assignments", icon: FileText, color: "bg-emerald-600", shadow: "shadow-emerald-200" }
// //     ]
// //   };

// //   const currentActions = actionConfigs[role] || [];

// //   // const handleActionClick = (label) => {
// //   //   if (label === "User Management") {
// //   //     setShowUserManagement(true);
// //   //     return;
// //   //   }

// //   //   console.log(`Action Triggered: ${label} for User: ${userId}`);
// //   //   alert(`${label} feature coming soon!`);
// //   // };
// //   const handleActionClick = (label) => {
// //   if (label === "User Management") {
// //     setShowUserManagement(true);
// //     return;
// //   }
// //   if (label === "Student Assignments") {
// //     setShowStudentManager(true);
// //     return;
// //   }

// //   console.log(`Action Triggered: ${label} for User: ${userId}`);
// //   alert(`${label} feature coming soon!`);
// // };

// //   return (
// //     <>
// //       {/* Quick Actions Card */}
// //       <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
// //         <div className="flex items-center justify-between mb-6">
// //           <h3 className="text-xl font-black text-slate-900 font-sans tracking-tight">
// //             Quick Actions
// //           </h3>
// //           <span className="px-2 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-tighter">
// //             {role}
// //           </span>
// //         </div>

// //         <div className="grid grid-cols-2 gap-4">
// //           {currentActions.map((action, index) => (
// //             <button
// //               key={index}
// //               onClick={() => handleActionClick(action.label)}
// //               className="group flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-50 hover:border-transparent hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 active:scale-95"
// //             >
// //               <div className={`p-3 rounded-xl ${action.color} text-white shadow-lg ${action.shadow} group-hover:scale-110 transition-transform duration-300 mb-3`}>
// //                 <action.icon size={20} />
// //               </div>
// //               <span className="text-[11px] font-black text-slate-600 group-hover:text-slate-900 text-center leading-tight">
// //                 {action.label}
// //               </span>
// //             </button>
// //           ))}
// //         </div>
// //       </div>

// //       {/* Modal */}
// //       {showUserManagement && (
// //         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
          
// //           <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-8 relative">
            
// //             {/* Close Button */}
// //             <button
// //               onClick={() => setShowUserManagement(false)}
// //               className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition"
// //             >
// //               <X size={22} />
// //             </button>

// //             <h2 className="text-2xl font-black mb-6">
// //               User Management
// //             </h2>

// //             <UserManagement
// //               viewerRole={role}
// //               showAdmins={role === "owner"}
// //             />
// //             {/* Student Assignment Modal */}
// // {showStudentManager && (
// //   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
// //     <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-8 relative">
// //       <button
// //         onClick={() => setShowStudentManager(false)}
// //         className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition"
// //       >
// //         <X size={22} />
// //       </button>
// //       <h2 className="text-2xl font-black mb-6">Student Assignment Manager</h2>
// //       <StudentAssignmentManager />
// //     </div>
// //   </div>
// // )}
// //           </div>
// //         </div>
// //       )}
// //     </>
// //   );
// // }
// // // import React, { useState } from 'react';
// // // import { 
// // //   Plus, 
// // //   CheckCircle, 
// // //   HelpCircle, 
// // //   Award, 
// // //   MessageSquare, 
// // //   Video, 
// // //   AlertTriangle,
// // //   FileText,
// // //   ShieldAlert
// // // } from "lucide-react";
// // // import UserManagement from "./UserManagement";

// // // export default function QuickActions2({ userId, role }) {

// // //   // State to control which action view is open
// // //   const [activeAction, setActiveAction] = useState(null);

// // //   // Define action sets
// // //   const actionConfigs = {
// // //     tutor: [
// // //       { label: "Create Assignment", icon: Plus, color: "bg-blue-500", shadow: "shadow-blue-200" },
// // //       { label: "Log Attendance", icon: CheckCircle, color: "bg-emerald-500", shadow: "shadow-emerald-200" },
// // //       { label: "Start Live Room", icon: Video, color: "bg-purple-500", shadow: "shadow-purple-200" },
// // //       { label: "Send Group Alert", icon: AlertTriangle, color: "bg-rose-500", shadow: "shadow-rose-200" }
// // //     ],
// // //     student: [
// // //       { label: "Request Help", icon: HelpCircle, color: "bg-amber-500", shadow: "shadow-amber-200" },
// // //       { label: "View Certificate", icon: Award, color: "bg-indigo-500", shadow: "shadow-indigo-200" },
// // //       { label: "Submit Ticket", icon: MessageSquare, color: "bg-sky-500", shadow: "shadow-sky-200" },
// // //       { label: "Learning Path", icon: FileText, color: "bg-pink-500", shadow: "shadow-pink-200" }
// // //     ],
// // //     owner: [
// // //       { label: "User Management", icon: ShieldAlert, color: "bg-blue-600", shadow: "shadow-blue-200" },
// // //       { label: "System Audit", icon: FileText, color: "bg-slate-700", shadow: "shadow-slate-200" },
// // //       { label: "Announcement", icon: MessageSquare, color: "bg-blue-600", shadow: "shadow-blue-200" }
// // //     ]
// // //   };

// // //   const currentActions = actionConfigs[role] || [];

// // //   // Handle button clicks
// // //   const handleActionClick = (label) => {
// // //     if (label === "User Management") {
// // //       setActiveAction("user-management");
// // //       return;
// // //     }

// // //     console.log(`Action Triggered: ${label} for User: ${userId}`);
// // //     alert(`${label} feature coming soon!`);
// // //   };

// // //   return (
// // //     <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
      
// // //       {activeAction === "user-management" ? (
// // //         <>
// // //           <div className="flex justify-between items-center mb-6">
// // //             <h3 className="text-xl font-black text-slate-900">
// // //               User Management
// // //             </h3>
// // //             <button
// // //               onClick={() => setActiveAction(null)}
// // //               className="text-xs font-bold text-blue-600 hover:underline"
// // //             >
// // //               ← Back
// // //             </button>
// // //           </div>

// // //           <UserManagement 
// // //             viewerRole={role} 
// // //             showAdmins={role === "owner"} 
// // //           />
// // //         </>
// // //       ) : (
// // //         <>
// // //           <div className="flex items-center justify-between mb-6">
// // //             <h3 className="text-xl font-black text-slate-900 font-sans tracking-tight">
// // //               Quick Actions
// // //             </h3>
// // //             <span className="px-2 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-tighter">
// // //               {role}
// // //             </span>
// // //           </div>

// // //           <div className="grid grid-cols-2 gap-4">
// // //             {currentActions.map((action, index) => (
// // //               <button
// // //                 key={index}
// // //                 onClick={() => handleActionClick(action.label)}
// // //                 className="group flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-50 hover:border-transparent hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 active:scale-95"
// // //               >
// // //                 <div className={`p-3 rounded-xl ${action.color} text-white shadow-lg ${action.shadow} group-hover:scale-110 transition-transform duration-300 mb-3`}>
// // //                   <action.icon size={20} />
// // //                 </div>
// // //                 <span className="text-[11px] font-black text-slate-600 group-hover:text-slate-900 text-center leading-tight">
// // //                   {action.label}
// // //                 </span>
// // //               </button>
// // //             ))}
// // //           </div>
// // //         </>
// // //       )}
// // //     </div>
// // //   );
// // // }
// // // // import React from 'react';
// // // // import { 
// // // //   Plus, 
// // // //   CheckCircle, 
// // // //   HelpCircle, 
// // // //   Award, 
// // // //   MessageSquare, 
// // // //   Video, 
// // // //   AlertTriangle,
// // // //   FileText,
// // // //   ShieldAlert
// // // // } from "lucide-react";
// // // // import UserManagement from "./UserManagement"
// // // // export default function QuickActions2({ userId, role }) {
  
// // // //   // 1. Define the action sets for each role
// // // //   const actionConfigs = {
// // // //     tutor: [
// // // //       { label: "Create Assignment", icon: Plus, color: "bg-blue-500", shadow: "shadow-blue-200" },
// // // //       { label: "Log Attendance", icon: CheckCircle, color: "bg-emerald-500", shadow: "shadow-emerald-200" },
// // // //       { label: "Start Live Room", icon: Video, color: "bg-purple-500", shadow: "shadow-purple-200" },
// // // //       { label: "Send Group Alert", icon: AlertTriangle, color: "bg-rose-500", shadow: "shadow-rose-200" }
// // // //     ],
// // // //     student: [
// // // //       { label: "Request Help", icon: HelpCircle, color: "bg-amber-500", shadow: "shadow-amber-200" },
// // // //       { label: "View Certificate", icon: Award, color: "bg-indigo-500", shadow: "shadow-indigo-200" },
// // // //       { label: "Submit Ticket", icon: MessageSquare, color: "bg-sky-500", shadow: "shadow-sky-200" },
// // // //       { label: "Learning Path", icon: FileText, color: "bg-pink-500", shadow: "shadow-pink-200" }
// // // //     ],
// // // //     // Optional fallback for admins if they use this component
// // // //     owner: [
// // // //       { label: "User Management", icon: ShieldAlert, color: "bg-blue-600", shadow: "shadow-blue-200" },
// // // //       { label: "System Audit", icon: FileText, color: "bg-slate-700", shadow: "shadow-slate-200" },
// // // //       { label: "Announcement", icon: MessageSquare, color: "bg-blue-600", shadow: "shadow-blue-200" }
// // // //     ]
// // // //   };

// // // //   // 2. Get the specific actions for the current role
// // // //   const currentActions = actionConfigs[role] || [];

// // // //   const handleActionClick = (label) => {
// // // //     console.log(`Action Triggered: ${label} for User: ${userId}`);
// // // //     // Add your logic here (e.g., opening a modal or navigating)
// // // //     alert(`${label} feature coming soon!`);
// // // //   };

// // // //   return (
// // // //     <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
// // // //       <div className="flex items-center justify-between mb-6">
// // // //         <h3 className="text-xl font-black text-slate-900 font-sans tracking-tight">Quick Actions</h3>
// // // //         <span className="px-2 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-tighter">
// // // //           {role}
// // // //         </span>
// // // //       </div>

// // // //       <div className="grid grid-cols-2 gap-4">
// // // //         {currentActions.map((action, index) => (
// // // //           <button
// // // //             key={index}
// // // //             onClick={() => handleActionClick(action.label)}
// // // //             className="group flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-50 hover:border-transparent hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 active:scale-95"
// // // //           >
// // // //             <div className={`p-3 rounded-xl ${action.color} text-white shadow-lg ${action.shadow} group-hover:scale-110 transition-transform duration-300 mb-3`}>
// // // //               <action.icon size={20} />
// // // //             </div>
// // // //             <span className="text-[11px] font-black text-slate-600 group-hover:text-slate-900 text-center leading-tight">
// // // //               {action.label}
// // // //             </span>
// // // //           </button>
// // // //         ))}
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }