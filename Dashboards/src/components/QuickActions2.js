import React, { useState, useEffect } from "react";
import {
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
  BookSearchIcon,
} from "lucide-react";
import { supabase } from "../supabase";
import UserManagement from "./UserManagement";
import StudentAssignments from "./StudentAssignments";
import StudentAssignmentManager from "./StudentAssignmentManager";
import NotesPanel from "./NotesPanel";
import AdminNotesManager from "./AdminNotesManager";
import InvoiceDownloadButton from "./InvoiceDownloadButton";
import Sales from "./Sales";
import MyHomework from "./MyHomework";

// ===== NEW COMPONENT FOR INVOICES =====
function InvoicesManager() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setPayments(data || []));
  }, []);

  return (
    <div className="space-y-3">
      {payments.map((p) => (
        <div
          key={p.id}
          className="p-4 border rounded-xl flex justify-between items-center"
        >
          <div>
            <p className="font-bold text-slate-900">
              {p.description || "Payment"}
            </p>
            <p className="text-sm text-slate-500">
              {new Date(p.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="font-black text-slate-900">
            KES {p.amount.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}

// ===== MAIN COMPONENT =====
export default function QuickActions2({ userId, role }) {
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showStudentTutorAssignment, setShowStudentTutorAssignment] = useState(false);
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
  const [showTrialMaterial, setShowTrialMaterial] = useState(false);
  const [showCourseMaterial, setShowCourseMaterial] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showAddNotesModal, setShowAddNotesModal] = useState(false);
  const [showInvoicesModal, setShowInvoicesModal] = useState(false);
const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentTasks, setStudentTasks] = useState([]);

  // ===== GOOGLE LINKS =====
  const GOOGLE_DOC_URL =
    "https://docs.google.com/document/d/1DNIqIxd52u_8Qe8vcWZ0ANMNh35AR4FCWzoLfK_Dq5M/preview";

  const TUTOR_FEEDBACK_FORM =
    "https://docs.google.com/forms/d/e/1FAIpQLSeCEoH7LmNeU89c-WXKS4-Kc9H0uU4nYO4t2S8hAjb7btM__Q/viewform?embedded=true";

  const actionConfigs = {
    student: [
      // { label: "Learning Path", icon: FileText, color: "bg-pink-500", shadow: "shadow-pink-200" },
      { label: "My Homework", icon: Star, color: "bg-amber-400" },
      { label: "Class Notes", icon: BookOpen, color: "bg-indigo-500" },
      // { label: "View Certificates", icon: Award, color: "bg-yellow-500", shadow: "shadow-indigo-200" },
      // { label: "Request Help", icon: HelpCircle, color: "bg-amber-500", shadow: "shadow-amber-200" },
      // { label: "Feedback Form", icon: FileText, color: "bg-orange-600" },
    ],
    owner: [
      { label: "User Management", icon: ShieldAlert, color: "bg-indigo-600", shadow: "shadow-blue-200" },
      { label: "System Audit", icon: FileText, color: "bg-slate-700", shadow: "shadow-slate-200" },
      { label: "Announcement", icon: MessageSquare, color: "bg-blue-600", shadow: "shadow-blue-200" },
      { label: "Trial Student/Tutor Assignments", icon: FileText, color: "bg-emerald-600", shadow: "shadow-emerald-200" },
      { label: "Add Notes", icon: BookOpen, color: "bg-indigo-500" },
      { label: "Invoices & Receipts", icon: FileText, color: "bg-green-500", shadow: "shadow-green-200" },
    ],
    tutor: [
      { label: "Trial Class Material", icon: Star, color: "bg-amber-400" },
      { label: "Notes", icon: BookOpen, color: "bg-indigo-500" },
      { label: "Course Assignment", icon: CheckCircle, color: "bg-indigo-500" },
      { label: "Sales Alert", icon: AlertTriangle, color: "bg-rose-500" },
      { label: "Feedback Form", icon: FileText, color: "bg-orange-600" },
      { label: "View Messages", icon: MessageSquare, color: "bg-blue-500" },
    ],
  };

  const currentActions = actionConfigs[role] || [];

  const fetchTutorStudents = async () => {
    const { data } = await supabase
      .from("students")
      .select("id, full_name")
      .eq("assigned_tutor_id", userId)
      .order("full_name");
    if (data) setStudents(data);
  };

  const handleActionClick = async (label) => {
    if (label === "User Management") return setShowUserManagement(true);
    if (label === "Trial Student/Tutor Assignments") return setShowStudentTutorAssignment(true);
    if (label === "Trial Class Material") return setShowTrialMaterial(true);
    if (label === "View Assignments") return setShowAssignmentsModal(true);
    if (label === "My Homework") return setShowHomeworkModal(true);
    if (label === "Course Assignment") {
      await fetchTutorStudents();
      setShowCourseMaterial(true);
    }
    if (label === "Feedback Form") {
      await fetchTutorStudents();
      setShowFeedbackModal(true);
    }
    if (label === "Class Notes") return setShowNotesModal(true);
    if (label === "Notes") return setShowNotesModal(true);
    if (label === "Add Notes") return setShowAddNotesModal(true);
    if (label === "Invoices & Receipts") return setShowInvoicesModal(true);
  };

  const handleSelectStudent = async (studentId) => {
    setSelectedStudent(studentId);
    const { data: assignmentData } = await supabase
      .from("student_assignments")
      .select("id, task_name, status")
      .eq("student_id", studentId);

    setStudentTasks(
      assignmentData?.map((a) => ({ id: a.id, name: a.task_name, status: a.status })) || []
    );
  };

  return (
    <>
      {/* Quick Actions Card */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-slate-900">Quick Actions</h3>
          <span className="px-2 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-bold uppercase">
            {role}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {currentActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionClick(action.label)}
              className="group flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-50 hover:shadow-lg transition"
            >
              <div className={`p-3 rounded-xl ${action.color} text-white mb-3`}>
                <action.icon size={20} />
              </div>
              <span className="text-[11px] font-black text-slate-600 text-center">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ================= MODALS ================= */}
      {showUserManagement && (
        <Modal title="User Management" onClose={() => setShowUserManagement(false)}>
          <UserManagement viewerRole={role} />
        </Modal>
      )}

      {showStudentTutorAssignment && (
        <Modal title="Student/Tutor Assignment" onClose={() => setShowStudentTutorAssignment(false)}>
          <StudentAssignmentManager viewerRole={role} />
        </Modal>
      )}
      {showHomeworkModal && (
  <Modal title="My Homework" onClose={() => setShowHomeworkModal(false)}>
    <MyHomework studentId={userId} />
  </Modal>
)}
      {showTrialMaterial && (
        <Modal title="Trial Class Material" onClose={() => setShowTrialMaterial(false)}>
          <iframe
            src={GOOGLE_DOC_URL}
            className="w-full h-[600px] border rounded-lg"
            title="Trial Material"
          />
        </Modal>
      )}

      {showNotesModal && (
        <Modal title="Course Notes" onClose={() => setShowNotesModal(false)}>
          <NotesPanel darkMode={false} courseId={"PUT_COURSE_ID_HERE"} />
        </Modal>
      )}

      {showAddNotesModal && (
        <Modal title="Add Course Notes" onClose={() => setShowAddNotesModal(false)}>
          <AdminNotesManager />
        </Modal>
      )}

      {showAssignmentsModal && (
        <Modal title="Assignments" onClose={() => setShowAssignmentsModal(false)}>
          <StudentAssignments tutorId={userId} students={students} />
        </Modal>
      )}

      {showCourseMaterial && (
        <Modal title="Course Assignment" onClose={() => setShowCourseMaterial(false)}>
          <div className="flex">
            <div className="w-1/3 pr-4 border-r">
              <h3 className="font-bold mb-2">Students</h3>
              {students.map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleSelectStudent(s.id)}
                  className="p-2 rounded cursor-pointer bg-slate-100 hover:bg-slate-200 mb-2"
                >
                  {s.full_name}
                </div>
              ))}
            </div>
            <div className="w-2/3 pl-4">
              <h3 className="font-bold mb-2">Assignments</h3>
              {studentTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-2 rounded mb-2 text-white ${
                    task.status === "completed" || task.status === "done"
                      ? "bg-green-500"
                      : "bg-orange-500"
                  }`}
                >
                  {task.name} ({task.status})
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {showFeedbackModal && (
        <Modal title="Select Student for Feedback" onClose={() => { setShowFeedbackModal(false); setSelectedStudent(null); }}>
          {!selectedStudent ? (
            <div className="space-y-3">
              {students.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedStudent(s)}
                  className="p-3 bg-slate-100 rounded-xl cursor-pointer hover:bg-slate-200"
                >
                  {s.full_name}
                </div>
              ))}
            </div>
          ) : (
            <div>
              <h3 className="font-bold mb-4">Feedback for {selectedStudent.full_name}</h3>
              <iframe
                src={TUTOR_FEEDBACK_FORM}
                className="w-full h-[600px] border rounded-lg"
                title="Tutor Feedback Form"
              />
            </div>
          )}
        </Modal>
      )}

      {showInvoicesModal && (
        <Modal title="Invoices & Receipts" onClose={() => setShowInvoicesModal(false)}>
          {/* <InvoicesManager /> */}
          {/* <InvoiceDownloadButton/> */}
          <Sales/>
        </Modal>
      )}
    </>
  );
}

// ===== REUSABLE MODAL =====
const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
    <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-8 relative">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-slate-400 hover:text-slate-700"
      >
        <X size={22} />
      </button>
      <h2 className="text-2xl font-black mb-6">{title}</h2>
      {children}
    </div>
  </div>
);
// import React, { useState, useEffect } from "react";
// import {
//   CheckCircle,
//   HelpCircle,
//   Award,
//   MessageSquare,
//   Star,
//   BookOpen,
//   AlertTriangle,
//   FileText,
//   ShieldAlert,
//   UserCheck,
//   X,
//   BookSearchIcon,
// } from "lucide-react";
// import { supabase } from "../supabase";
// import UserManagement from "./UserManagement";
// import StudentAssignments from "./StudentAssignments";
// import StudentAssignmentManager from "./StudentAssignmentManager";
// import NotesPanel from "./NotesPanel";
// import AdminNotesManager from "./AdminNotesManager";

// export default function QuickActions2({ userId, role }) {
//   const [showUserManagement, setShowUserManagement] = useState(false);
//    const [showStudentTutorAssignment, setShowStudentTutorAssignment] = useState(false)
//   const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
//   const [showTrialMaterial, setShowTrialMaterial] = useState(false);
//   const [showCourseMaterial, setShowCourseMaterial] = useState(false);
//   const [showFeedbackModal, setShowFeedbackModal] = useState(false);
//   const [showNotesModal, setShowNotesModal] = useState(false);
// const [showAddNotesModal, setShowAddNotesModal] = useState(false);

//   const [students, setStudents] = useState([]);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [studentTasks, setStudentTasks] = useState([]);

//   // ===== GOOGLE LINKS =====
//   const GOOGLE_DOC_URL =
//     "https://docs.google.com/document/d/1DNIqIxd52u_8Qe8vcWZ0ANMNh35AR4FCWzoLfK_Dq5M/preview";

//   // 👉 TUTOR FEEDBACK FORM (replace with your real link)
//   const TUTOR_FEEDBACK_FORM =
//     "https://docs.google.com/forms/d/e/1FAIpQLSeCEoH7LmNeU89c-WXKS4-Kc9H0uU4nYO4t2S8hAjb7btM__Q/viewform?embedded=true";
    

//   const actionConfigs = {

//     student: [
//       { label: "Learning Path", icon: FileText, color: "bg-pink-500", shadow: "shadow-pink-200" },
//             { label: "My Homework", icon: Star, color: "bg-amber-400" },
//       { label: "Class Notes", icon: BookOpen, color: "bg-indigo-500" },

//       { label: "View Certificates", icon: Award, color: "bg-yellow-500", shadow: "shadow-indigo-200" },
//       // { label: "Story Books", icon: BookSearchIcon, color: "bg-sky-500", shadow: "shadow-sky-200" },
//             { label: "Request Help", icon: HelpCircle, color: "bg-amber-500", shadow: "shadow-amber-200" },
//             { label: "Feedback Form", icon: FileText, color: "bg-orange-600" },
      

//     ],
//     owner: [
//       { label: "User Management", icon: ShieldAlert, color: "bg-indigo-600", shadow: "shadow-blue-200" },
//       { label: "System Audit", icon: FileText, color: "bg-slate-700", shadow: "shadow-slate-200" },
//       { label: "Announcement", icon: MessageSquare, color: "bg-blue-600", shadow: "shadow-blue-200" },
//       { label: "Trial Student/Tutor Assignments", icon: FileText, color: "bg-emerald-600", shadow: "shadow-emerald-200" },
//       { label: "Add Notes", icon: BookOpen, color: "bg-indigo-500" },
//     ],

//     tutor: [
//       { label: "Trial Class Material", icon: Star, color: "bg-amber-400" },
//        { label: "Notes", icon: BookOpen, color: "bg-indigo-500" },
//       { label: "Course Assignment", icon: CheckCircle, color: "bg-indigo-500" },
     
//       { label: "Sales Alert", icon: AlertTriangle, color: "bg-rose-500" },
//       { label: "Feedback Form", icon: FileText, color: "bg-orange-600" },
//       { label: "View Messages", icon: MessageSquare, color: "bg-blue-500" },
//       // { label: "View Assignments", icon: CheckCircle, color: "bg-emerald-500" },
//     ],
//   };

//   const currentActions = actionConfigs[role] || [];

//   const fetchTutorStudents = async () => {
//     const { data } = await supabase
//       .from("students")
//       .select("id, full_name")
//       .eq("assigned_tutor_id", userId)
//       .order("full_name");

//     if (data) setStudents(data);
//   };

//   // const handleActionClick = async (label) => {
//   //   if (label === "User Management") return setShowUserManagement(true);
//   //   if (label === "Trial Student/Tutor Assignments") return setShowStudentTutorAssignment(true);
//   //   if (label === "Trial Class Material") return setShowTrialMaterial(true);
//   //   if (label === "View Assignments") return setShowAssignmentsModal(true);

//   //   if (label === "Course Assignment") {
//   //     await fetchTutorStudents();
//   //     setShowCourseMaterial(true);
//   //   }

//   //   if (label === "Feedback Form") {
//   //     await fetchTutorStudents();
//   //     setShowFeedbackModal(true);
//   //   }
//   // };

//   // const handleSelectStudent = async (studentId) => {
//   //   setSelectedStudent(studentId);

//   //   const { data: assignmentData } = await supabase
//   //     .from("student_assignments")
//   //     .select("id, task_name, status")
//   //     .eq("student_id", studentId);

//   //   const combined =
//   //     assignmentData?.map((a) => ({
//   //       id: a.id,
//   //       name: a.task_name,
//   //       status: a.status,
//   //     })) || [];

//   //   setStudentTasks(combined);
//   // };
//   const handleActionClick = async (label) => {
//   if (label === "User Management") return setShowUserManagement(true);
//   if (label === "Trial Student/Tutor Assignments") return setShowStudentTutorAssignment(true);
//   if (label === "Trial Class Material") return setShowTrialMaterial(true);
//   if (label === "View Assignments") return setShowAssignmentsModal(true);

//   if (label === "Course Assignment") {
//     await fetchTutorStudents();
//     setShowCourseMaterial(true);
//   }

//   if (label === "Feedback Form") {
//     await fetchTutorStudents();
//     setShowFeedbackModal(true);
//   }

//   // ✅ STUDENT NOTES
//   if (label === "Class Notes") {
//     return setShowNotesModal(true);
//   }

//   // ✅ TUTOR NOTES
//   if (label === "Notes") {
//     return setShowNotesModal(true);
//   }

//   // ✅ OWNER ADD NOTES
//   if (label === "Add Notes") {
//     return setShowAddNotesModal(true);
//   }
// };

//   return (
//     <>
//       {/* Quick Actions Card */}
//       <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-xl font-black text-slate-900">
//             Quick Actions
//           </h3>
//           <span className="px-2 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-bold uppercase">
//             {role}
//           </span>
//         </div>

//         <div className="grid grid-cols-2 gap-4">
//           {currentActions.map((action, index) => (
//             <button
//               key={index}
//               onClick={() => handleActionClick(action.label)}
//               className="group flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-50 hover:shadow-lg transition"
//             >
//               <div className={`p-3 rounded-xl ${action.color} text-white mb-3`}>
//                 <action.icon size={20} />
//               </div>
//               <span className="text-[11px] font-black text-slate-600 text-center">
//                 {action.label}
//               </span>
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* ================= MODALS ================= */}

//       {showUserManagement && (
//         <Modal title="User Management" onClose={() => setShowUserManagement(false)}>
//           <UserManagement viewerRole={role} />
//         </Modal>
//       )}
//       {showStudentTutorAssignment &&(
//         <Modal title="Student/Tutor Assignment" onClose={()=>setShowStudentTutorAssignment(false)}>
//           <StudentAssignmentManager viewerRole={role} />
//         </Modal>
//       )}

//       {showTrialMaterial && (
//         <Modal title="Trial Class Material" onClose={() => setShowTrialMaterial(false)}>
//           <iframe
//             src={GOOGLE_DOC_URL}
//             className="w-full h-[600px] border rounded-lg"
//             title="Trial Material"
//           />
//         </Modal>
//       )}

//       {showNotesModal && (
//   <Modal title="Course Notes" onClose={() => setShowNotesModal(false)}>
//     <NotesPanel
//       darkMode={false}
//       courseId={"PUT_COURSE_ID_HERE"}
//     />
//   </Modal>
// )}

// {showAddNotesModal && (
//   <Modal title="Add Course Notes" onClose={() => setShowAddNotesModal(false)}>
//     <AdminNotesManager />
//   </Modal>
// )}
//       {showAssignmentsModal && (
//         <Modal title="Assignments" onClose={() => setShowAssignmentsModal(false)}>
//           <StudentAssignments tutorId={userId} students={students} />
//         </Modal>
//       )}

//       {/* ===== COURSE MATERIAL ===== */}
//       {showCourseMaterial && (
//         <Modal title="Course Assignment" onClose={() => setShowCourseMaterial(false)}>
//           <div className="flex">
//             <div className="w-1/3 pr-4 border-r">
//               <h3 className="font-bold mb-2">Students</h3>
//               {students.map((s) => (
//                 <div
//                   key={s.id}
//                   onClick={() => handleSelectStudent(s.id)}
//                   className="p-2 rounded cursor-pointer bg-slate-100 hover:bg-slate-200 mb-2"
//                 >
//                   {s.full_name}
//                 </div>
//               ))}
//             </div>

//             <div className="w-2/3 pl-4">
//               <h3 className="font-bold mb-2">Assignments</h3>
//               {studentTasks.map((task) => (
//                 <div
//                   key={task.id}
//                   className={`p-2 rounded mb-2 text-white ${
//                     task.status === "completed" || task.status === "done"
//                       ? "bg-green-500"
//                       : "bg-orange-500"
//                   }`}
//                 >
//                   {task.name} ({task.status})
//                 </div>
//               ))}
//             </div>
//           </div>
//         </Modal>
//       )}

//       {/* ===== FEEDBACK FORM ===== */}
//       {showFeedbackModal && (
//         <Modal title="Select Student for Feedback" onClose={() => {
//           setShowFeedbackModal(false);
//           setSelectedStudent(null);
//         }}>
//           {!selectedStudent ? (
//             <div className="space-y-3">
//               {students.map((s) => (
//                 <div
//                   key={s.id}
//                   onClick={() => setSelectedStudent(s)}
//                   className="p-3 bg-slate-100 rounded-xl cursor-pointer hover:bg-slate-200"
//                 >
//                   {s.full_name}
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div>
//               <h3 className="font-bold mb-4">
//                 Feedback for {selectedStudent.full_name}
//               </h3>

//               <iframe
//                 src={TUTOR_FEEDBACK_FORM}
//                 className="w-full h-[600px] border rounded-lg"
//                 title="Tutor Feedback Form"
//               />
//             </div>
//           )}
//         </Modal>
//       )}
//     </>
//   );
// }

// /* Reusable Modal */
// const Modal = ({ title, children, onClose }) => (
//   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
//     <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-8 relative">
//       <button
//         onClick={onClose}
//         className="absolute top-6 right-6 text-slate-400 hover:text-slate-700"
//       >
//         <X size={22} />
//       </button>
//       <h2 className="text-2xl font-black mb-6">{title}</h2>
//       {children}
//     </div>
//   </div>
// );