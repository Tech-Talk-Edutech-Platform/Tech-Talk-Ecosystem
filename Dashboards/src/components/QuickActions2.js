import React, { useState } from 'react';
import { 
  Plus, CheckCircle, HelpCircle, Award, MessageSquare, Star,
  BookOpen, AlertTriangle, FileText, ShieldAlert, UserCheck, X
} from "lucide-react";
import UserManagement from "./UserManagement";
import StudentAssignmentManager from "./StudentAssignmentManager";

export default function QuickActions2({ userId, role }) {
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showStudentManager, setShowStudentManager] = useState(false);
  const [showTrialMaterial, setShowTrialMaterial] = useState(false);

  const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1B6rKMb67YVcn6GNGiTLstyop-hE5mLH4JkhURCaEHQg/edit?usp=sharing?rm=minimal";

  const actionConfigs = {
    tutor: [
      { label: "Trial Class Material", icon: Star, color: "bg-amber-400", shadow: "shadow-amber-200" },
      { label: "Course Material", icon: BookOpen, color: "bg-indigo-500", shadow: "shadow-indigo-200" },
      { label: "Sales Alert", icon: AlertTriangle, color: "bg-rose-500", shadow: "shadow-rose-200" },
      { label: "Feedback Form", icon: FileText, color: "bg-orange-600", shadow: "shadow-emerald-200" },
      { label: "Create Assignment", icon: Plus, color: "bg-blue-500", shadow: "shadow-blue-200" },
      { label: "View Assignments", icon: CheckCircle, color: "bg-emerald-500", shadow: "shadow-emerald-200" },
    ],
    student: [
      { label: "Request Help", icon: HelpCircle, color: "bg-amber-500", shadow: "shadow-amber-200" },
      { label: "View Certificate", icon: Award, color: "bg-indigo-500", shadow: "shadow-indigo-200" },
      { label: "Submit Ticket", icon: MessageSquare, color: "bg-sky-500", shadow: "shadow-sky-200" },
      { label: "Learning Path", icon: FileText, color: "bg-pink-500", shadow: "shadow-pink-200" }
    ],
    owner: [
      { label: "User Management", icon: UserCheck, color: "bg-indigo-600", shadow: "shadow-blue-200" },
      { label: "Reports Audit", icon: ShieldAlert, color: "bg-slate-700", shadow: "shadow-slate-200" },
      { label: "Announcement", icon: MessageSquare, color: "bg-blue-600", shadow: "shadow-blue-200" },
      { label: "Student Assignments", icon: FileText, color: "bg-emerald-600", shadow: "shadow-emerald-200" }
    ]
  };

  const currentActions = actionConfigs[role] || [];

  const handleActionClick = (label) => {
    if (label === "User Management") return setShowUserManagement(true);
    if (label === "Student Assignments") return setShowStudentManager(true);
    if (label === "Trial Class Material") return setShowTrialMaterial(true);

    alert(`${label} feature coming soon!`);
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
          <iframe
            src={GOOGLE_SHEET_URL}
            className="w-full h-[600px] border rounded-lg"
            title="Trial Class Material"
          />
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
//   Plus, 
//   CheckCircle, 
//   HelpCircle, 
//   Award, 
//   MessageSquare, 
//   Star,
//   BookOpen, 
//   AlertTriangle,
//   FileText,
//   ShieldAlert,
//    UserCheck,
//   X
// } from "lucide-react";
// import UserManagement from "./UserManagement";
// import StudentAssignmentManager from "./StudentAssignmentManager";

// export default function QuickActions2({ userId, role }) {

//   const [showUserManagement, setShowUserManagement] = useState(false);
//   const [showStudentManager, setShowStudentManager] = useState(false);

//   const actionConfigs = {
//     tutor: [
//       { label: "Trial Class Material", icon: Star, color: "bg-amber-400", shadow: "shadow-amber-200" },
// { label: "Course Material", icon: BookOpen, color: "bg-indigo-500", shadow: "shadow-indigo-200" },
//  { label: "Sales Alert", icon: AlertTriangle, color: "bg-rose-500", shadow: "shadow-rose-200" },
//       { label: "Feedback Form", icon: FileText, color: "bg-orange-600", shadow: "shadow-emerald-200" },
      
//       { label: "Create Assignment", icon: Plus, color: "bg-blue-500", shadow: "shadow-blue-200" },
//       { label: "View Assignments", icon: CheckCircle, color: "bg-emerald-500", shadow: "shadow-emerald-200" },
//       // { label: "Start Live Room", icon: Video, color: "bg-purple-500", shadow: "shadow-purple-200" },
     
//     ],
//     student: [
//       { label: "Request Help", icon: HelpCircle, color: "bg-amber-500", shadow: "shadow-amber-200" },
//       { label: "View Certificate", icon: Award, color: "bg-indigo-500", shadow: "shadow-indigo-200" },
//       { label: "Submit Ticket", icon: MessageSquare, color: "bg-sky-500", shadow: "shadow-sky-200" },
//       { label: "Learning Path", icon: FileText, color: "bg-pink-500", shadow: "shadow-pink-200" }
//     ],
//     owner: [
//       { label: "User Management", icon: UserCheck, color: "bg-indigo-600", shadow: "shadow-blue-200" },
//       { label: "Reports Audit", icon: ShieldAlert, color: "bg-slate-700", shadow: "shadow-slate-200" },
//       { label: "Announcement", icon: MessageSquare, color: "bg-blue-600", shadow: "shadow-blue-200" },
//       { label: "Student Assignments", icon: FileText, color: "bg-emerald-600", shadow: "shadow-emerald-200" }
//     ]
//   };

//   const currentActions = actionConfigs[role] || [];

//   const handleActionClick = (label) => {
//     if (label === "User Management") {
//       setShowUserManagement(true);
//       return;
//     }
//     if (label === "Student Assignments") {
//       setShowStudentManager(true);
//       return;
//     }

//     console.log(`Action Triggered: ${label} for User: ${userId}`);
//     alert(`${label} feature coming soon!`);
//   };

//   return (
//     <>
//       {/* Quick Actions Card */}
//       <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-xl font-black text-slate-900 font-sans tracking-tight">
//             Quick Actions
//           </h3>
//           <span className="px-2 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-tighter">
//             {role}
//           </span>
//         </div>

//         <div className="grid grid-cols-2 gap-4">
//           {currentActions.map((action, index) => (
//             <button
//               key={index}
//               onClick={() => handleActionClick(action.label)}
//               className="group flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-50 hover:border-transparent hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 active:scale-95"
//             >
//               <div className={`p-3 rounded-xl ${action.color} text-white shadow-lg ${action.shadow} group-hover:scale-110 transition-transform duration-300 mb-3`}>
//                 <action.icon size={20} />
//               </div>
//               <span className="text-[11px] font-black text-slate-600 group-hover:text-slate-900 text-center leading-tight">
//                 {action.label}
//               </span>
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* User Management Modal */}
//       {showUserManagement && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
//           <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-8 relative">
//             <button
//               onClick={() => setShowUserManagement(false)}
//               className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition"
//             >
//               <X size={22} />
//             </button>
//             <h2 className="text-2xl font-black mb-6">User Management</h2>
//             <UserManagement viewerRole={role} showAdmins={role === "owner"} />
//           </div>
//         </div>
//       )}

//       {/* Student Assignment Modal */}
//       {showStudentManager && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
//           <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-8 relative">
//             <button
//               onClick={() => setShowStudentManager(false)}
//               className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition"
//             >
//               <X size={22} />
//             </button>
//             <h2 className="text-2xl font-black mb-6">Student Assignment Manager</h2>
//             <StudentAssignmentManager />
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
// import React, { useState } from 'react';
// import { 
//   Plus, 
//   CheckCircle, 
//   HelpCircle, 
//   Award, 
//   MessageSquare, 
//   Video, 
//   AlertTriangle,
//   FileText,
//   ShieldAlert,
//   X
// } from "lucide-react";
// import UserManagement from "./UserManagement";
// import StudentAssignmentManager from "./StudentAssignmentManager";

// export default function QuickActions2({ userId, role }) {

//   const [showUserManagement, setShowUserManagement] = useState(false);
//   const [showStudentManager, setShowStudentManager] = useState(false);

//   const actionConfigs = {
//     tutor: [
//       { label: "Create Assignment", icon: Plus, color: "bg-blue-500", shadow: "shadow-blue-200" },
//       { label: "Log Attendance", icon: CheckCircle, color: "bg-emerald-500", shadow: "shadow-emerald-200" },
//       { label: "Start Live Room", icon: Video, color: "bg-purple-500", shadow: "shadow-purple-200" },
//       { label: "Send Group Alert", icon: AlertTriangle, color: "bg-rose-500", shadow: "shadow-rose-200" }
//     ],
//     student: [
//       { label: "Request Help", icon: HelpCircle, color: "bg-amber-500", shadow: "shadow-amber-200" },
//       { label: "View Certificate", icon: Award, color: "bg-indigo-500", shadow: "shadow-indigo-200" },
//       { label: "Submit Ticket", icon: MessageSquare, color: "bg-sky-500", shadow: "shadow-sky-200" },
//       { label: "Learning Path", icon: FileText, color: "bg-pink-500", shadow: "shadow-pink-200" }
//     ],
//     owner: [
//       { label: "User Management", icon: ShieldAlert, color: "bg-indigo-600", shadow: "shadow-blue-200" },
//       { label: "System Audit", icon: FileText, color: "bg-slate-700", shadow: "shadow-slate-200" },
//       { label: "Announcement", icon: MessageSquare, color: "bg-blue-600", shadow: "shadow-blue-200" },
//        { label: "Student Assignments", icon: FileText, color: "bg-emerald-600", shadow: "shadow-emerald-200" }
//     ]
//   };

//   const currentActions = actionConfigs[role] || [];

//   // const handleActionClick = (label) => {
//   //   if (label === "User Management") {
//   //     setShowUserManagement(true);
//   //     return;
//   //   }

//   //   console.log(`Action Triggered: ${label} for User: ${userId}`);
//   //   alert(`${label} feature coming soon!`);
//   // };
//   const handleActionClick = (label) => {
//   if (label === "User Management") {
//     setShowUserManagement(true);
//     return;
//   }
//   if (label === "Student Assignments") {
//     setShowStudentManager(true);
//     return;
//   }

//   console.log(`Action Triggered: ${label} for User: ${userId}`);
//   alert(`${label} feature coming soon!`);
// };

//   return (
//     <>
//       {/* Quick Actions Card */}
//       <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-xl font-black text-slate-900 font-sans tracking-tight">
//             Quick Actions
//           </h3>
//           <span className="px-2 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-tighter">
//             {role}
//           </span>
//         </div>

//         <div className="grid grid-cols-2 gap-4">
//           {currentActions.map((action, index) => (
//             <button
//               key={index}
//               onClick={() => handleActionClick(action.label)}
//               className="group flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-50 hover:border-transparent hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 active:scale-95"
//             >
//               <div className={`p-3 rounded-xl ${action.color} text-white shadow-lg ${action.shadow} group-hover:scale-110 transition-transform duration-300 mb-3`}>
//                 <action.icon size={20} />
//               </div>
//               <span className="text-[11px] font-black text-slate-600 group-hover:text-slate-900 text-center leading-tight">
//                 {action.label}
//               </span>
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Modal */}
//       {showUserManagement && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
          
//           <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-8 relative">
            
//             {/* Close Button */}
//             <button
//               onClick={() => setShowUserManagement(false)}
//               className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition"
//             >
//               <X size={22} />
//             </button>

//             <h2 className="text-2xl font-black mb-6">
//               User Management
//             </h2>

//             <UserManagement
//               viewerRole={role}
//               showAdmins={role === "owner"}
//             />
//             {/* Student Assignment Modal */}
// {showStudentManager && (
//   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
//     <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-8 relative">
//       <button
//         onClick={() => setShowStudentManager(false)}
//         className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition"
//       >
//         <X size={22} />
//       </button>
//       <h2 className="text-2xl font-black mb-6">Student Assignment Manager</h2>
//       <StudentAssignmentManager />
//     </div>
//   </div>
// )}
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
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
// //   ShieldAlert
// // } from "lucide-react";
// // import UserManagement from "./UserManagement";

// // export default function QuickActions2({ userId, role }) {

// //   // State to control which action view is open
// //   const [activeAction, setActiveAction] = useState(null);

// //   // Define action sets
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
// //       { label: "User Management", icon: ShieldAlert, color: "bg-blue-600", shadow: "shadow-blue-200" },
// //       { label: "System Audit", icon: FileText, color: "bg-slate-700", shadow: "shadow-slate-200" },
// //       { label: "Announcement", icon: MessageSquare, color: "bg-blue-600", shadow: "shadow-blue-200" }
// //     ]
// //   };

// //   const currentActions = actionConfigs[role] || [];

// //   // Handle button clicks
// //   const handleActionClick = (label) => {
// //     if (label === "User Management") {
// //       setActiveAction("user-management");
// //       return;
// //     }

// //     console.log(`Action Triggered: ${label} for User: ${userId}`);
// //     alert(`${label} feature coming soon!`);
// //   };

// //   return (
// //     <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
      
// //       {activeAction === "user-management" ? (
// //         <>
// //           <div className="flex justify-between items-center mb-6">
// //             <h3 className="text-xl font-black text-slate-900">
// //               User Management
// //             </h3>
// //             <button
// //               onClick={() => setActiveAction(null)}
// //               className="text-xs font-bold text-blue-600 hover:underline"
// //             >
// //               ← Back
// //             </button>
// //           </div>

// //           <UserManagement 
// //             viewerRole={role} 
// //             showAdmins={role === "owner"} 
// //           />
// //         </>
// //       ) : (
// //         <>
// //           <div className="flex items-center justify-between mb-6">
// //             <h3 className="text-xl font-black text-slate-900 font-sans tracking-tight">
// //               Quick Actions
// //             </h3>
// //             <span className="px-2 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-tighter">
// //               {role}
// //             </span>
// //           </div>

// //           <div className="grid grid-cols-2 gap-4">
// //             {currentActions.map((action, index) => (
// //               <button
// //                 key={index}
// //                 onClick={() => handleActionClick(action.label)}
// //                 className="group flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-50 hover:border-transparent hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 active:scale-95"
// //               >
// //                 <div className={`p-3 rounded-xl ${action.color} text-white shadow-lg ${action.shadow} group-hover:scale-110 transition-transform duration-300 mb-3`}>
// //                   <action.icon size={20} />
// //                 </div>
// //                 <span className="text-[11px] font-black text-slate-600 group-hover:text-slate-900 text-center leading-tight">
// //                   {action.label}
// //                 </span>
// //               </button>
// //             ))}
// //           </div>
// //         </>
// //       )}
// //     </div>
// //   );
// // }
// // // import React from 'react';
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
// // // import UserManagement from "./UserManagement"
// // // export default function QuickActions2({ userId, role }) {
  
// // //   // 1. Define the action sets for each role
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
// // //     // Optional fallback for admins if they use this component
// // //     owner: [
// // //       { label: "User Management", icon: ShieldAlert, color: "bg-blue-600", shadow: "shadow-blue-200" },
// // //       { label: "System Audit", icon: FileText, color: "bg-slate-700", shadow: "shadow-slate-200" },
// // //       { label: "Announcement", icon: MessageSquare, color: "bg-blue-600", shadow: "shadow-blue-200" }
// // //     ]
// // //   };

// // //   // 2. Get the specific actions for the current role
// // //   const currentActions = actionConfigs[role] || [];

// // //   const handleActionClick = (label) => {
// // //     console.log(`Action Triggered: ${label} for User: ${userId}`);
// // //     // Add your logic here (e.g., opening a modal or navigating)
// // //     alert(`${label} feature coming soon!`);
// // //   };

// // //   return (
// // //     <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
// // //       <div className="flex items-center justify-between mb-6">
// // //         <h3 className="text-xl font-black text-slate-900 font-sans tracking-tight">Quick Actions</h3>
// // //         <span className="px-2 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-tighter">
// // //           {role}
// // //         </span>
// // //       </div>

// // //       <div className="grid grid-cols-2 gap-4">
// // //         {currentActions.map((action, index) => (
// // //           <button
// // //             key={index}
// // //             onClick={() => handleActionClick(action.label)}
// // //             className="group flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-50 hover:border-transparent hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 active:scale-95"
// // //           >
// // //             <div className={`p-3 rounded-xl ${action.color} text-white shadow-lg ${action.shadow} group-hover:scale-110 transition-transform duration-300 mb-3`}>
// // //               <action.icon size={20} />
// // //             </div>
// // //             <span className="text-[11px] font-black text-slate-600 group-hover:text-slate-900 text-center leading-tight">
// // //               {action.label}
// // //             </span>
// // //           </button>
// // //         ))}
// // //       </div>
// // //     </div>
// // //   );
// // // }