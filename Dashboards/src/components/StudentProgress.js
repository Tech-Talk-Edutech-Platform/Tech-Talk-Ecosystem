import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { X } from "lucide-react";

export default function StudentList({ tutorId }) {
  const [students, setStudents] = useState([]);
  const [showAllModal, setShowAllModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      const { data } = await supabase
        .from("students")
        .select("*")
        .eq("assigned_tutor_id", tutorId)
        .order("created_at", { ascending: false });

      if (data) setStudents(data);
    };

    if (tutorId) fetchStudents();
  }, [tutorId]);

  const renderStudent = (s) => (
    <div
      key={s.id}
      onClick={() => setSelectedStudent(s)}
      className="flex items-center gap-4 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition"
    >
      <div className="relative">
        <img
          src={
            s.avatar_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              s.full_name
            )}&background=random`
          }
          className="w-11 h-11 rounded-full border-2 border-slate-50 shadow-sm"
          alt="avatar"
        />
        <div
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
            s.online ? "bg-emerald-500" : "bg-slate-300"
          }`}
        ></div>
      </div>

      <div className="flex-1">
        <div className="flex justify-between mb-1.5 items-end">
          <div>
            <p className="text-sm font-bold text-slate-800 leading-none">
              {s.full_name}
            </p>
            <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-tight">
              {s.course_name || "Scratch Beginners"}
            </p>
          </div>

          <span className="text-[11px] font-black text-slate-600 leading-none">
            {s.progress || 0}%
          </span>
        </div>

        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${s.progress || 0}%`,
              backgroundColor: s.progress_color || "#3b82f6",
            }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Main Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-800 tracking-tight">
            Student Progress
          </h3>

          {students.length > 3 && (
            <button
              onClick={() => setShowAllModal(true)}
              className="text-blue-600 text-xs font-bold hover:underline"
            >
              View All &gt;
            </button>
          )}
        </div>

        <div className="space-y-4">
          {students.length > 0
            ? students.slice(0, 3).map(renderStudent)
            : (
              <p className="text-center text-slate-400 text-sm py-2">
                No active students.
              </p>
            )}
        </div>
      </div>

      {/* View All Modal */}
      {showAllModal && (
        <Modal title="All Students" onClose={() => setShowAllModal(false)}>
          <div className="space-y-4">
            {students.map(renderStudent)}
          </div>
        </Modal>
      )}

      {/* Student Info Modal */}
      {selectedStudent && (
        <Modal
          title="Student Information"
          onClose={() => setSelectedStudent(null)}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={
                  selectedStudent.avatar_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    selectedStudent.full_name
                  )}&background=random`
                }
                className="w-16 h-16 rounded-full"
                alt="avatar"
              />
              <div>
                <h3 className="text-lg font-bold">
                  {selectedStudent.full_name}
                </h3>
                <p className="text-sm text-slate-500">
                  {selectedStudent.email || "No email provided"}
                </p>
              </div>
            </div>

            <div className="border-t pt-4 text-sm text-slate-600 space-y-2">
              <p><strong>Course:</strong> {selectedStudent.course_name || "Scratch Beginners"}</p>
              <p><strong>Progress:</strong> {selectedStudent.progress || 0}%</p>
              <p><strong>Status:</strong> {selectedStudent.online ? "Online" : "Offline"}</p>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

/* Reusable Modal */
const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
    <div className="bg-white w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl shadow-2xl p-8 relative">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-slate-400 hover:text-slate-700"
      >
        <X size={22} />
      </button>
      <h2 className="text-xl font-black mb-6">{title}</h2>
      {children}
    </div>
  </div>
);
// import { useEffect, useState } from "react";
// import { supabase } from "../supabase";

// export default function StudentList({ tutorId }) {
//   const [students, setStudents] = useState([]);
//   const [showAll, setShowAll] = useState(false);

//   useEffect(() => {
//     const fetchStudents = async () => {
//       const { data } = await supabase
//         .from("students")
//         .select("*")
//         .eq("assigned_tutor_id", tutorId)
//         .order("created_at", { ascending: false });

//       if (data) setStudents(data);
//     };

//     if (tutorId) fetchStudents();
//   }, [tutorId]);

//   const displayedStudents = showAll ? students : students.slice(0, 3);

//   return (
//     <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
//       <div className="flex justify-between items-center mb-6">
//         <h3 className="font-bold text-slate-800 tracking-tight">
//           Student Progress
//         </h3>

//         {students.length > 3 && (
//           <button
//             onClick={() => setShowAll(!showAll)}
//             className="text-blue-600 text-xs font-bold hover:underline"
//           >
//             {showAll ? "Show Less" : "View All >"}
//           </button>
//         )}
//       </div>

//       <div className="space-y-6">
//         {displayedStudents.length > 0 ? (
//           displayedStudents.map((s) => (
//             <div key={s.id} className="flex items-center gap-4">
//               <div className="relative">
//                 <img
//                   src={
//                     s.avatar_url ||
//                     `https://ui-avatars.com/api/?name=${encodeURIComponent(
//                       s.full_name
//                     )}&background=random`
//                   }
//                   className="w-11 h-11 rounded-full border-2 border-slate-50 shadow-sm"
//                   alt="avatar"
//                 />
//                 <div
//                   className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
//                     s.online ? "bg-emerald-500" : "bg-slate-300"
//                   }`}
//                 ></div>
//               </div>

//               <div className="flex-1">
//                 <div className="flex justify-between mb-1.5 items-end">
//                   <div>
//                     <p className="text-sm font-bold text-slate-800 leading-none">
//                       {s.full_name}
//                     </p>
//                     <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-tight">
//                       {s.course_name || "Scratch Beginners"}
//                     </p>
//                   </div>

//                   <span className="text-[11px] font-black text-slate-600 leading-none">
//                     {s.progress || 0}%
//                   </span>
//                 </div>

//                 <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
//                   <div
//                     className="h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(59,130,246,0.3)]"
//                     style={{
//                       width: `${s.progress || 0}%`,
//                       backgroundColor: s.progress_color || "#3b82f6",
//                     }}
//                   />
//                 </div>
//               </div>
//             </div>
//           ))
//         ) : (
//           <p className="text-center text-slate-400 text-sm py-2">
//             No active students.
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }
// // import { useEffect, useState } from "react";
// // import { supabase } from "../supabase";

// // export default function StudentList({ tutorId }) {
// //   const [students, setStudents] = useState([]);

// //   useEffect(() => {
// //     const fetchStudents = async () => {
// //       const { data } = await supabase
// //         .from("students")
// //         .select("*")
// //         .eq("assigned_tutor_id", tutorId);
// //       if (data) setStudents(data);
// //     };
// //     if (tutorId) fetchStudents();
// //   }, [tutorId]);

// //   return (
// //     <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
// //       <div className="flex justify-between items-center mb-6">
// //         <h3 className="font-bold text-slate-800 tracking-tight">Student Progress</h3>
// //         <button className="text-blue-600 text-xs font-bold hover:underline">View All &gt;</button>
// //       </div>
// //       <div className="space-y-6">
// //         {students.length > 0 ? students.map((s) => (
// //           <div key={s.id} className="flex items-center gap-4">
// //             <div className="relative">
// //               <img 
// //                 src={s.avatar_url || `https://ui-avatars.com/api/?name=${s.full_name}&background=random`} 
// //                 className="w-11 h-11 rounded-full border-2 border-slate-50 shadow-sm"
// //                 alt="avatar" 
// //               />
// //               <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${s.online ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
// //             </div>
// //             <div className="flex-1">
// //               <div className="flex justify-between mb-1.5 items-end">
// //                 <div>
// //                   <p className="text-sm font-bold text-slate-800 leading-none">{s.full_name}</p>
// //                   <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-tight">{s.course_name || 'Scratch Beginners'}</p>
// //                 </div>
// //                 <span className="text-[11px] font-black text-slate-600 leading-none">{s.progress || 0}%</span>
// //               </div>
// //               <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
// //                 <div 
// //                   className="h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(59,130,246,0.3)]" 
// //                   style={{ width: `${s.progress}%`, backgroundColor: s.progress_color || '#3b82f6' }}
// //                 />
// //               </div>
// //             </div>
// //           </div>
// //         )) : (
// //           <p className="text-center text-slate-400 text-sm py-2">No active students.</p>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }
