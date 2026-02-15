// import { useEffect, useState } from 'react';
// import { supabase } from '../supabase';
// import { notifyTutor } from "../utils/adminActions";

// const OpsDashboard = () => {
//   const [stats, setStats] = useState({ tutors: 0, issues: 0 });
//   const [classes, setClasses] = useState([]);

//   useEffect(() => {
//     fetchStats();
//     fetchClasses();
//   }, []);

//   const fetchStats = async () => {
//     const { count: tutors } = await supabase
//       .from('tutors')
//       .select('*', { count: 'exact', head: true })
//       .eq('active', true);

//     const { count: issues } = await supabase
//       .from('issues')
//       .select('*', { count: 'exact', head: true })
//       .eq('status', 'open');

//     setStats({ tutors: tutors || 0, issues: issues || 0 });
//   };

//   const fetchClasses = async () => {
//     const { data } = await supabase
//       .from('classes')
//       .select('*')
//       .order('start_time', { ascending: true })
//       .limit(5);

//     setClasses(data || []);
//   };

//   return (
//     <div className="p-8 bg-gray-50 min-h-screen font-sans">
//       <header className="mb-8">
//         <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Operations Dashboard</h2>
//         <p className="text-gray-500 mt-1">Real-time platform overview and class monitoring.</p>
//       </header>

//       {/* Stats Section */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         <Card 
//           title="Active Tutors" 
//           value={stats.tutors} 
//           icon="✅" 
//           colorClass="text-emerald-600 bg-emerald-50 border-emerald-100" 
//         />
//         <Card 
//           title="Open Issues" 
//           value={stats.issues} 
//           icon="⚠️" 
//           colorClass="text-rose-600 bg-rose-50 border-rose-100" 
//         />
//       </div>

//       {/* Classes Section */}
//       <div className="mt-10 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//         <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
//           <h3 className="font-bold text-gray-800">Next 5 Upcoming Classes</h3>
//         </div>
//         <ul className="divide-y divide-gray-100">
//           {classes.length > 0 ? classes.map(cls => (
//             <li key={cls.id} className="px-6 py-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
//               <span className="font-medium text-gray-700">{cls.student_name}</span>
//               <span className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-md font-semibold">
//                 🕒 {new Date(cls.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//               </span>
//             </li>
//           )) : (
//             <li className="px-6 py-8 text-center text-gray-400">No upcoming classes found.</li>
//           )}
//         </ul>
//       </div>
//     </div>
//   );
// };

// const Card = ({ title, value, icon, colorClass }) => (
//   <div className={`p-6 rounded-2xl border-2 shadow-sm transition-transform hover:scale-[1.02] ${colorClass}`}>
//     <div className="flex items-center justify-between">
//       <div>
//         <h4 className="text-sm font-bold uppercase tracking-wider opacity-70 mb-1">{title}</h4>
//         <span className="text-4xl font-black">{value ?? 0}</span>
//       </div>
//       <span className="text-3xl">{icon}</span>
//     </div>
//   </div>
// );

// export default OpsDashboard;


// // Inside a "Confirm Class" button:
// const handleConfirm = (id) => {
//    // ... existing logic ...
//    notifyTutor({tutor.name}, "You have a new {classes.class_type} class with {student.name} at {calendar_events.start_time}!");
// };