import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import {
  User,
  BookOpen,
  Code,
  Monitor,
  Lightbulb,
  Star,
  MessageSquare,
  Rocket,
  ExternalLink,
} from 'lucide-react';

const StudentDashboard = () => {
  const { slug } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [slug]);

  async function fetchData() {
    if (!slug) return;

    const { data, error } = await supabase
      .from('student_results')
      .select('*')
      .eq('slug', slug)
      .order('exam_date', { ascending: false });

    if (error) console.error("Fetch Error:", error.message);

    if (data?.length) {
      setData(data);
      setSelectedId(data[0].id);
    }

    setLoading(false);
  }

  const latest = data.find(d => d.id === selectedId) || data[0];

  // ✅ AVERAGES
  const avg = data.length
    ? {
        overall:
          data.reduce((sum, i) => sum + (i.overall_score || 0), 0) / data.length,
        theory:
          data.reduce((sum, i) => sum + (i.theory_score || 0), 0) / data.length,
        practical:
          data.reduce((sum, i) => sum + (i.practical_score || 0), 0) / data.length,
        logic:
          data.reduce((sum, i) => sum + (i.problem_solving_score || 0), 0) / data.length,
        creative:
          data.reduce((sum, i) => sum + (i.creativity_score || 0), 0) / data.length,
      }
    : null;

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!data.length) return <div className="p-10 text-center">No results</div>;

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-20 font-sans shadow-2xl">

      {/* HEADER */}
      <div className="bg-white p-6 rounded-b-3xl shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-indigo-100 rounded-full overflow-hidden border-4 border-white shadow-inner flex items-center justify-center">
            {latest.avatar_url ? (
              <img src={latest.avatar_url} className="w-full h-full object-cover" />
            ) : (
              <User size={40} className="text-indigo-500" />
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-gray-800">
              {latest.student_name}
            </h1>
            <p className="text-sm text-indigo-600 font-semibold">
              Grade {latest.grade_level} • {latest.course_name}
            </p>
          </div>
        </div>
      </div>

      {/* PROJECT */}
      {latest.project_url && (
        <div className="p-4">
          <div className="bg-gradient-to-br from-orange-500 to-pink-500 p-5 rounded-2xl text-white">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase">
              <Rocket size={18} /> Student Project
            </div>

            <h3 className="text-lg font-black mb-3">
              Latest Project
            </h3>

            <a
              href={latest.project_url}
              target="_blank"
              className="flex items-center justify-center gap-2 w-full bg-white text-orange-600 font-black py-3 rounded-xl"
            >
              Launch Project <ExternalLink size={18} />
            </a>
          </div>
        </div>
      )}

      {/* OVERALL */}
      <div className="p-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <h2 className="font-bold text-sm uppercase mb-4">Overall Performance</h2>

          <div className="flex items-center gap-6">
            <div className="w-24 h-24 flex items-center justify-center border-[10px] border-green-500 rounded-full">
              <div className="text-center">
                <span className="text-2xl font-black">
                  {latest.overall_score}%
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Latest exam snapshot
            </p>
          </div>
        </div>
      </div>

      {/* ✅ NEW: BEAUTIFUL AVERAGE SUMMARY (NO UI BREAK) */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-5 rounded-2xl shadow-lg">

          <h2 className="text-sm uppercase font-bold mb-3">
            Average Performance
          </h2>

          <div className="grid grid-cols-2 gap-3 text-xs">

            <div className="bg-white/20 p-3 rounded-xl">
              Overall Avg
              <div className="text-xl font-black">
                {avg?.overall.toFixed(1)}%
              </div>
            </div>

            <div className="bg-white/20 p-3 rounded-xl">
              Theory
              <div className="text-xl font-black">
                {avg?.theory.toFixed(1)}%
              </div>
            </div>

            <div className="bg-white/20 p-3 rounded-xl">
              Practical
              <div className="text-xl font-black">
                {avg?.practical.toFixed(1)}%
              </div>
            </div>

            <div className="bg-white/20 p-3 rounded-xl">
              Logic
              <div className="text-xl font-black">
                {avg?.logic.toFixed(1)}%
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* EXAMS */}
      <div className="px-4 mb-2">
        {data.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedId(item.id)}
            className={`bg-white p-4 rounded-2xl shadow-sm border-l-[6px] border-indigo-500 mb-3 cursor-pointer ${
              selectedId === item.id ? "ring-2 ring-indigo-400" : ""
            }`}
          >
            <div className="flex justify-between">

              <div>
                <h3 className="font-bold text-sm">{item.exam_title}</h3>
                <p className="text-xs text-gray-400">
                  Click to view
                </p>
              </div>

              <div className="font-black text-green-500">
                {item.overall_score}%
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* BREAKDOWN */}
      <div className="p-4">
        <h2 className="font-bold text-sm uppercase mb-3">
          Section Breakdown
        </h2>

        <div className="space-y-4 bg-white p-5 rounded-2xl border">
          <StatRow label="Theory" score={latest.theory_score} icon={<Code size={16} />} />
          <StatRow label="Practical" score={latest.practical_score} icon={<Monitor size={16} />} />
          <StatRow label="Logic" score={latest.problem_solving_score} icon={<Lightbulb size={16} />} />
          <StatRow label="Creative" score={latest.creativity_score} icon={<Star size={16} />} />
        </div>
      </div>

      {/* FEEDBACK */}
      <div className="px-4">
        <div className="bg-indigo-600 p-5 rounded-2xl text-white">
          <h2 className="text-sm font-bold uppercase mb-2">
            Tutor Feedback
          </h2>
          <p className="text-sm italic">
            "{latest.tutor_feedback}"
          </p>
        </div>
      </div>

    </div>
  );
};

const StatRow = ({ label, score, icon }) => (
  <div>
    <div className="flex justify-between mb-1">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-bold uppercase">{label}</span>
      </div>
      <div className="text-xs font-black">{score}%</div>
    </div>

    <div className="w-full bg-gray-100 h-2 rounded-full">
      <div
        className="bg-green-500 h-full"
        style={{ width: `${score}%` }}
      />
    </div>
  </div>
);

export default StudentDashboard;
// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { supabase } from '../supabase';
// import {
//   User,
//   BookOpen,
//   Code,
//   Monitor,
//   Lightbulb,
//   Star,
//   MessageSquare,
//   Rocket,
//   ExternalLink,
//   Camera
// } from 'lucide-react';

// const StudentDashboard = () => {
//   const { slug } = useParams();
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [uploading, setUploading] = useState(false);

//   const [selectedId, setSelectedId] = useState(null);

//   useEffect(() => {
//     fetchData();
//   }, [slug]);

//   async function fetchData() {
//     if (!slug) return;

//     const { data, error } = await supabase
//       .from('student_results')
//       .select('*')
//       .eq('slug', slug)
//       .order('exam_date', { ascending: false });

//     if (error) console.error("Fetch Error:", error.message);

//     if (data?.length) {
//       setData(data);
//       setSelectedId(data[0].id); // default to latest exam
//     }

//     setLoading(false);
//   }

//   const latest = data.find(d => d.id === selectedId) || data[0];

//   const handleAvatarChange = async (e) => {
//     try {
//       setUploading(true);
//       const file = e.target.files[0];
//       if (!file || !data?.length) return;

//       const fileExt = file.name.split('.').pop();
//       const fileName = `${data[0].id}-${Math.random().toString(36).substring(7)}.${fileExt}`;
//       const filePath = `avatars/${fileName}`;

//       let { error: uploadError } = await supabase.storage
//         .from('student-assets')
//         .upload(filePath, file);

//       if (uploadError) throw uploadError;

//       const { data: { publicUrl } } = supabase.storage
//         .from('student-assets')
//         .getPublicUrl(filePath);

//       const { error: updateError } = await supabase
//         .from('student_results')
//         .update({ avatar_url: publicUrl })
//         .eq('id', data[0].id);

//       if (updateError) throw updateError;

//       const updated = [...data];
//       updated[0].avatar_url = publicUrl;
//       setData(updated);

//       alert("Profile picture updated!");
//     } catch (err) {
//       alert("Upload error: " + err.message);
//     } finally {
//       setUploading(false);
//     }
//   };

//   if (loading) return <div className="p-10 text-center animate-pulse font-sans">Fetching Report Card...</div>;
//   if (!data.length) return <div className="p-10 text-center font-sans">Result not found.</div>;

//   return (
//     <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-20 font-sans shadow-2xl">

//       {/* HEADER */}
//       <div className="bg-white p-6 rounded-b-3xl shadow-sm border-b border-gray-100">
//         <div className="flex items-center gap-4">

//           <div className="w-20 h-20 bg-indigo-100 rounded-full overflow-hidden border-4 border-white shadow-inner flex items-center justify-center">
//             {latest.avatar_url ? (
//               <img src={latest.avatar_url} className="w-full h-full object-cover" />
//             ) : (
//               <User size={40} className="text-indigo-500" />
//             )}
//           </div>

//           <div className="flex-1">
//             <h1 className="text-xl font-extrabold text-gray-800">{latest.student_name}</h1>
//             <p className="text-sm text-indigo-600 font-semibold">
//               Grade {latest.grade_level} • {latest.course_name}
//             </p>
//           </div>

//         </div>
//       </div>

//       {/* PROJECT (always latest selected exam) */}
//       {latest.project_url && (
//         <div className="p-4">
//           <div className="bg-gradient-to-br from-orange-500 to-pink-500 p-5 rounded-2xl shadow-lg text-white">
//             <div className="flex items-center gap-2 mb-2 font-bold uppercase text-xs tracking-widest">
//               <Rocket size={18} /> Student Project
//             </div>

//             <h3 className="text-lg font-black mb-3">
//               Latest submission by {latest.student_name.split(' ')[0]}
//             </h3>

//             <a
//               href={latest.project_url}
//               target="_blank"
//               rel="noreferrer"
//               className="flex items-center justify-center gap-2 w-full bg-white text-orange-600 font-black py-3 rounded-xl"
//             >
//               Launch Project <ExternalLink size={18} />
//             </a>
//           </div>
//         </div>
//       )}

//       {/* OVERALL */}
//       <div className="p-4">
//         <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50">
//           <h2 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide px-1">
//             Overall Performance
//           </h2>

//           <div className="flex items-center gap-6">

//             <div className="relative w-24 h-24 flex items-center justify-center border-[10px] border-green-500 rounded-full">
//               <div className="text-center">
//                 <span className="text-2xl font-black text-gray-800">
//                   {latest.overall_score}%
//                 </span>
//                 <p className="text-[8px] text-green-500 font-bold uppercase">
//                   {latest.performance_label || 'Score'}
//                 </p>
//               </div>
//             </div>

//             <p className="flex-1 text-sm text-gray-600 leading-tight">
//               <span className="font-bold text-gray-800">
//                 {latest.performance_label || 'Great Job'}!
//               </span>{' '}
//               Latest exam performance snapshot
//             </p>

//           </div>
//         </div>
//       </div>

//       {/* EXAMS LIST (click switches instantly) */}
//       <div className="px-4 mb-2">
//         {data.map((item) => (
//           <div
//             key={item.id}
//             onClick={() => setSelectedId(item.id)}
//             className={`bg-white p-4 rounded-2xl shadow-sm border-l-[6px] border-indigo-500 mb-3 cursor-pointer ${
//               selectedId === item.id ? "ring-2 ring-indigo-400" : ""
//             }`}
//           >
//             <div className="flex justify-between items-start">

//               <div className="flex gap-3">
//                 <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
//                   <BookOpen size={20} />
//                 </div>

//                 <div>
//                   <h3 className="font-bold text-gray-800 text-sm leading-tight">
//                     {item.exam_title}
//                   </h3>

//                   {/* replaced date with useful info */}
//                   <p className="text-[10px] text-gray-400 mt-1">
//                     Score trend: {item.overall_score}% • Click to view breakdown
//                   </p>
//                 </div>
//               </div>

//               <div className="text-right">
//                 <div className="text-xl font-black text-green-500">
//                   {item.overall_score}%
//                 </div>
//               </div>

//             </div>
//           </div>
//         ))}
//       </div>

//       {/* BREAKDOWN */}
//       <div className="p-4">
//         <h2 className="font-bold text-gray-800 mb-3 text-sm px-1 uppercase tracking-wide">
//           Section Breakdown
//         </h2>

//         <div className="space-y-4 bg-white p-5 rounded-2xl border border-gray-50 shadow-sm">
//           <StatRow label="Theory" score={latest.theory_score} icon={<Code size={16} />} color="bg-red-50 text-red-500" />
//           <StatRow label="Practical" score={latest.practical_score} icon={<Monitor size={16} />} color="bg-blue-50 text-blue-500" />
//           <StatRow label="Logic" score={latest.problem_solving_score} icon={<Lightbulb size={16} />} color="bg-yellow-50 text-yellow-500" />
//           <StatRow label="Creative" score={latest.creativity_score} icon={<Star size={16} />} color="bg-purple-50 text-purple-500" />
//         </div>
//       </div>

//       {/* TUTOR FEEDBACK (always latest selected) */}
//       <div className="px-4">
//         <div className="bg-indigo-600 p-5 rounded-2xl shadow-lg">
//           <div className="flex gap-2 items-center text-white font-bold mb-2 text-sm uppercase">
//             <MessageSquare size={18} /> Tutor Feedback
//           </div>

//           <p className="text-sm text-indigo-50 italic leading-relaxed font-medium">
//             "{latest.tutor_feedback}"
//           </p>
//         </div>
//       </div>

//     </div>
//   );
// };

// const StatRow = ({ label, score, icon, color }) => (
//   <div>
//     <div className="flex justify-between items-center mb-1">
//       <div className="flex items-center gap-2">
//         <div className={`${color} p-1.5 rounded-lg`}>{icon}</div>
//         <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">
//           {label}
//         </span>
//       </div>
//       <div className="text-xs font-black text-gray-800">{score}%</div>
//     </div>

//     <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
//       <div className="bg-green-500 h-full rounded-full" style={{ width: `${score}%` }} />
//     </div>
//   </div>
// );

// export default StudentDashboard;
// // import React, { useEffect, useState } from 'react';
// // import { useParams } from 'react-router-dom';
// // import { supabase } from '../supabase';
// // import {
// //   User,
// //   Calendar,
// //   BookOpen,
// //   Code,
// //   Monitor,
// //   Lightbulb,
// //   Star,
// //   MessageSquare,
// //   Rocket,
// //   ExternalLink,
// //   Camera
// // } from 'lucide-react';

// // const StudentDashboard = () => {
// //   const { slug } = useParams();
// //   const [data, setData] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [uploading, setUploading] = useState(false);

// //   useEffect(() => {
// //     fetchData();
// //   }, [slug]);

// //   async function fetchData() {
// //     if (!slug) return;

// //     const { data, error } = await supabase
// //       .from('student_results')
// //       .select('*')
// //       .eq('slug', slug)
// //       .order('exam_date', { ascending: false });

// //     if (error) console.error("Fetch Error:", error.message);

// //     if (data) setData(data);

// //     setLoading(false);
// //   }

// //   const latest = data?.[0]; // ✅ single source of truth

// //   const handleAvatarChange = async (e) => {
// //     try {
// //       setUploading(true);
// //       const file = e.target.files[0];
// //       if (!file || !latest?.id) return;

// //       const fileExt = file.name.split('.').pop();
// //       const fileName = `${latest.id}-${Math.random().toString(36).substring(7)}.${fileExt}`;
// //       const filePath = `avatars/${fileName}`;

// //       let { error: uploadError } = await supabase.storage
// //         .from('student-assets')
// //         .upload(filePath, file);

// //       if (uploadError) throw uploadError;

// //       const { data: { publicUrl } } = supabase.storage
// //         .from('student-assets')
// //         .getPublicUrl(filePath);

// //       const { error: updateError } = await supabase
// //         .from('student_results')
// //         .update({ avatar_url: publicUrl })
// //         .eq('id', latest.id);

// //       if (updateError) throw updateError;

// //       const updated = [...data];
// //       updated[0].avatar_url = publicUrl;
// //       setData(updated);

// //       alert("Profile picture updated!");
// //     } catch (err) {
// //       alert("Upload error: " + err.message);
// //     } finally {
// //       setUploading(false);
// //     }
// //   };

// //   if (loading) return <div className="p-10 text-center animate-pulse font-sans">Fetching Report Card...</div>;
// //   if (!latest) return <div className="p-10 text-center font-sans">Result not found.</div>;

// //   return (
// //     <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-20 font-sans shadow-2xl">

// //       {/* 1. HEADER SECTION */}
// //       <div className="bg-white p-6 rounded-b-3xl shadow-sm border-b border-gray-100">
// //         <div className="flex items-center gap-4">
// //           <div className="relative group">
// //             <div className="w-20 h-20 bg-indigo-100 rounded-full overflow-hidden border-4 border-white shadow-inner flex items-center justify-center">
// //               {latest.avatar_url && latest.avatar_url.trim() !== "" ? (
// //                 <img
// //                   key={latest.avatar_url}
// //                   src={`${latest.avatar_url}?t=${new Date().getTime()}`}
// //                   alt="Profile"
// //                   className="w-full h-full object-cover"
// //                 />
// //               ) : (
// //                 <User size={40} className="text-indigo-500" />
// //               )}
// //             </div>

// //             <label className="absolute bottom-0 right-0 bg-indigo-600 p-1.5 rounded-full text-white cursor-pointer shadow-lg hover:scale-110 transition-transform">
// //               <Camera size={14} />
// //               <input
// //                 type="file"
// //                 className="hidden"
// //                 onChange={handleAvatarChange}
// //                 disabled={uploading}
// //                 accept="image/*"
// //               />
// //             </label>
// //           </div>

// //           <div className="flex-1">
// //             <h1 className="text-xl font-extrabold text-gray-800">{latest.student_name}</h1>
// //             <p className="text-sm text-indigo-600 font-semibold">
// //               Grade {latest.grade_level} • {latest.course_name}
// //             </p>
// //             <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-bold rounded-full uppercase">
// //               Active Student
// //             </span>
// //           </div>
// //         </div>
// //       </div>

// //       {/* 2. PROJECT SHOWCASE (LATEST ONLY) */}
// //       {latest.project_url && (
// //         <div className="p-4">
// //           <div className="bg-gradient-to-br from-orange-500 to-pink-500 p-5 rounded-2xl shadow-lg text-white">
// //             <div className="flex items-center gap-2 mb-2 font-bold uppercase text-xs tracking-widest">
// //               <Rocket size={18} /> Student Project
// //             </div>
// //             <h3 className="text-lg font-black mb-3">
// //               See what {latest.student_name.split(' ')[0]} built!
// //             </h3>
// //             <a
// //               href={latest.project_url}
// //               target="_blank"
// //               rel="noreferrer"
// //               className="flex items-center justify-center gap-2 w-full bg-white text-orange-600 font-black py-3 rounded-xl shadow-md active:scale-95 transition-all"
// //             >
// //               Launch Project <ExternalLink size={18} />
// //             </a>
// //           </div>
// //         </div>
// //       )}

// //       {/* 3. OVERALL PERFORMANCE (LATEST ONLY) */}
// //       <div className="p-4">
// //         <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50">
// //           <h2 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide px-1">
// //             Overall Performance
// //           </h2>

// //           <div className="flex items-center gap-6">
// //             <div className="relative w-24 h-24 flex items-center justify-center border-[10px] border-green-500 rounded-full">
// //               <div className="text-center">
// //                 <span className="text-2xl font-black text-gray-800">
// //                   {latest.overall_score}%
// //                 </span>
// //                 <p className="text-[8px] text-green-500 font-bold uppercase">
// //                   {latest.performance_label || 'Score'}
// //                 </p>
// //               </div>
// //             </div>

// //             <p className="flex-1 text-sm text-gray-600 leading-tight">
// //               <span className="font-bold text-gray-800">
// //                 {latest.performance_label || 'Great Job'}!
// //               </span>{' '}
// //               {latest.student_name.split(' ')[0]} is performing excellently in this course.
// //             </p>
// //           </div>
// //         </div>
// //       </div>

// //       {/* 4. EXAM LIST (UI UNCHANGED, JUST FIXED DATA) */}
// //       <div className="px-4 mb-2">
// //         <div className="flex justify-between items-center mb-3 px-1">
// //           <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">
// //             Latest Exam Result
// //           </h2>
// //         </div>

// //         {data.map((item) => (
// //           <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border-l-[6px] border-indigo-500 mb-3">
// //             <div className="flex justify-between items-start">
// //               <div className="flex gap-3">
// //                 <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
// //                   <BookOpen size={20} />
// //                 </div>
// //                 <div>
// //                   <h3 className="font-bold text-gray-800 text-sm leading-tight">
// //                     {item.exam_title}
// //                   </h3>
// //                   <div className="flex items-center gap-1 text-gray-400 text-[10px] mt-1 font-medium">
// //                     <Calendar size={12} />{' '}
// //                     {item.exam_date ? new Date(item.exam_date).toDateString() : 'Recent'}
// //                   </div>
// //                 </div>
// //               </div>

// //               <div className="text-right">
// //                 <div className="text-xl font-black text-green-500">
// //                   {item.overall_score}%
// //                 </div>
// //                 <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
// //                   Score
// //                 </p>
// //               </div>
// //             </div>
// //           </div>
// //         ))}
// //       </div>

// //       {/* 5. SKILL BREAKDOWN (LATEST ONLY) */}
// //       <div className="p-4">
// //         <h2 className="font-bold text-gray-800 mb-3 text-sm px-1 uppercase tracking-wide">
// //           Section Breakdown
// //         </h2>

// //         <div className="space-y-4 bg-white p-5 rounded-2xl border border-gray-50 shadow-sm">
// //           <StatRow label="Theory" score={latest.theory_score} icon={<Code size={16} />} color="bg-red-50 text-red-500" />
// //           <StatRow label="Practical" score={latest.practical_score} icon={<Monitor size={16} />} color="bg-blue-50 text-blue-500" />
// //           <StatRow label="Logic" score={latest.problem_solving_score} icon={<Lightbulb size={16} />} color="bg-yellow-50 text-yellow-500" />
// //           <StatRow label="Creative" score={latest.creativity_score} icon={<Star size={16} />} color="bg-purple-50 text-purple-500" />
// //         </div>
// //       </div>

// //       {/* 6. TUTOR FEEDBACK (LATEST ONLY) */}
// //       <div className="px-4">
// //         <div className="bg-indigo-600 p-5 rounded-2xl shadow-lg">
// //           <div className="flex gap-2 items-center text-white font-bold mb-2 text-sm uppercase">
// //             <MessageSquare size={18} /> Tutor Feedback
// //           </div>
// //           <p className="text-sm text-indigo-50 italic leading-relaxed font-medium">
// //             "{latest.tutor_feedback}"
// //           </p>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // const StatRow = ({ label, score, icon, color }) => (
// //   <div>
// //     <div className="flex justify-between items-center mb-1">
// //       <div className="flex items-center gap-2">
// //         <div className={`${color} p-1.5 rounded-lg`}>{icon}</div>
// //         <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">{label}</span>
// //       </div>
// //       <div className="text-xs font-black text-gray-800">{score}%</div>
// //     </div>
// //     <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
// //       <div className="bg-green-500 h-full rounded-full" style={{ width: `${score}%` }}></div>
// //     </div>
// //   </div>
// // );

// // export default StudentDashboard;
// // // import React, { useEffect, useState } from 'react';
// // // import { useParams } from 'react-router-dom';
// // // import { supabase } from '../supabase';
// // // import {
// // //   User,
// // //   Calendar,
// // //   BookOpen,
// // //   Code,
// // //   Monitor,
// // //   Lightbulb,
// // //   Star,
// // //   MessageSquare,
// // //   Rocket,
// // //   ExternalLink,
// // //   Camera
// // // } from 'lucide-react';

// // // const StudentDashboard = () => {
// // //   const { slug } = useParams();
// // //   const [data, setData] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [uploading, setUploading] = useState(false);

// // //   useEffect(() => {
// // //     fetchData();
// // //   }, [slug]);

// // //   async function fetchData() {
// // //     if (!slug) return;

// // //     const { data, error } = await supabase
// // //       .from('student_results')
// // //       .select('*')
// // //       .eq('slug', slug)
// // //       .order('exam_date', { ascending: false });

// // //     if (error) console.error("Fetch Error:", error.message);

// // //     if (data) setData(data);

// // //     setLoading(false);
// // //   }

// // //   const handleAvatarChange = async (e) => {
// // //     try {
// // //       setUploading(true);
// // //       const file = e.target.files[0];
// // //       if (!file || !data?.length) return;

// // //       const fileExt = file.name.split('.').pop();
// // //       const fileName = `${data[0].id}-${Math.random().toString(36).substring(7)}.${fileExt}`;
// // //       const filePath = `avatars/${fileName}`;

// // //       let { error: uploadError } = await supabase.storage
// // //         .from('student-assets')
// // //         .upload(filePath, file);

// // //       if (uploadError) throw uploadError;

// // //       const { data: { publicUrl } } = supabase.storage
// // //         .from('student-assets')
// // //         .getPublicUrl(filePath);

// // //       const { error: updateError } = await supabase
// // //         .from('student_results')
// // //         .update({ avatar_url: publicUrl })
// // //         .eq('id', data[0].id);

// // //       if (updateError) throw updateError;

// // //       const updated = [...data];
// // //       updated[0].avatar_url = publicUrl;
// // //       setData(updated);

// // //       alert("Profile picture updated!");
// // //     } catch (err) {
// // //       alert("Upload error: " + err.message);
// // //     } finally {
// // //       setUploading(false);
// // //     }
// // //   };

// // //   if (loading) return <div className="p-10 text-center animate-pulse font-sans">Fetching Report Card...</div>;
// // //   if (!data.length) return <div className="p-10 text-center font-sans">Result not found.</div>;

// // //   const latest = data[0];

// // //   return (
// // //     <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-20 font-sans shadow-2xl">

// // //       {/* 1. HEADER SECTION */}
// // //       <div className="bg-white p-6 rounded-b-3xl shadow-sm border-b border-gray-100">
// // //         <div className="flex items-center gap-4">
// // //           <div className="relative group">
// // //             <div className="w-20 h-20 bg-indigo-100 rounded-full overflow-hidden border-4 border-white shadow-inner flex items-center justify-center">
// // //               {latest.avatar_url && latest.avatar_url.trim() !== "" ? (
// // //                 <img
// // //                   key={latest.avatar_url}
// // //                   src={`${latest.avatar_url}?t=${new Date().getTime()}`}
// // //                   alt="Profile"
// // //                   className="w-full h-full object-cover"
// // //                 />
// // //               ) : (
// // //                 <User size={40} className="text-indigo-500" />
// // //               )}
// // //             </div>
// // //             <label className="absolute bottom-0 right-0 bg-indigo-600 p-1.5 rounded-full text-white cursor-pointer shadow-lg hover:scale-110 transition-transform">
// // //               <Camera size={14} />
// // //               <input
// // //                 type="file"
// // //                 className="hidden"
// // //                 onChange={handleAvatarChange}
// // //                 disabled={uploading}
// // //                 accept="image/*"
// // //               />
// // //             </label>
// // //           </div>

// // //           <div className="flex-1">
// // //             <h1 className="text-xl font-extrabold text-gray-800">{latest.student_name}</h1>
// // //             <p className="text-sm text-indigo-600 font-semibold">
// // //               Grade {latest.grade_level} • {latest.course_name}
// // //             </p>
// // //             <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-bold rounded-full uppercase">
// // //               Active Student
// // //             </span>
// // //           </div>
// // //         </div>
// // //       </div>

// // //       {/* 2. PROJECT SHOWCASE */}
// // //       {latest.project_url && (
// // //         <div className="p-4">
// // //           <div className="bg-gradient-to-br from-orange-500 to-pink-500 p-5 rounded-2xl shadow-lg text-white">
// // //             <div className="flex items-center gap-2 mb-2 font-bold uppercase text-xs tracking-widest">
// // //               <Rocket size={18} /> Student Project
// // //             </div>
// // //             <h3 className="text-lg font-black mb-3">
// // //               See what {latest.student_name.split(' ')[0]} built!
// // //             </h3>
// // //             <a
// // //               href={latest.project_url}
// // //               target="_blank"
// // //               rel="noreferrer"
// // //               className="flex items-center justify-center gap-2 w-full bg-white text-orange-600 font-black py-3 rounded-xl shadow-md active:scale-95 transition-all"
// // //             >
// // //               Launch Project <ExternalLink size={18} />
// // //             </a>
// // //           </div>
// // //         </div>
// // //       )}

// // //       {/* 3. OVERALL PERFORMANCE */}
// // //       <div className="p-4">
// // //         <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50">
// // //           <h2 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide px-1">
// // //             Overall Performance
// // //           </h2>

// // //           <div className="flex items-center gap-6">
// // //             <div className="relative w-24 h-24 flex items-center justify-center border-[10px] border-green-500 rounded-full">
// // //               <div className="text-center">
// // //                 <span className="text-2xl font-black text-gray-800">
// // //                   {latest.overall_score}%
// // //                 </span>
// // //                 <p className="text-[8px] text-green-500 font-bold uppercase">
// // //                   {latest.performance_label || 'Score'}
// // //                 </p>
// // //               </div>
// // //             </div>

// // //             <p className="flex-1 text-sm text-gray-600 leading-tight">
// // //               <span className="font-bold text-gray-800">
// // //                 {latest.performance_label || 'Great Job'}!
// // //               </span>{' '}
// // //               {latest.student_name.split(' ')[0]} is performing excellently in this course.
// // //             </p>
// // //           </div>
// // //         </div>
// // //       </div>

// // //       {/* 4. LATEST EXAM CARD (FIXED LOOP) */}
// // //       <div className="px-4 mb-2">
// // //         <div className="flex justify-between items-center mb-3 px-1">
// // //           <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">
// // //             Latest Exam Result
// // //           </h2>
// // //         </div>

// // //         {data.map((item) => (
// // //           <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border-l-[6px] border-indigo-500 mb-3">
// // //             <div className="flex justify-between items-start">
// // //               <div className="flex gap-3">
// // //                 <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
// // //                   <BookOpen size={20} />
// // //                 </div>
// // //                 <div>
// // //                   <h3 className="font-bold text-gray-800 text-sm leading-tight">
// // //                     {item.exam_title}
// // //                   </h3>
// // //                   <div className="flex items-center gap-1 text-gray-400 text-[10px] mt-1 font-medium">
// // //                     <Calendar size={12} />{' '}
// // //                     {item.exam_date ? new Date(item.exam_date).toDateString() : 'Recent'}
// // //                   </div>
// // //                 </div>
// // //               </div>

// // //               <div className="text-right">
// // //                 <div className="text-xl font-black text-green-500">
// // //                   {item.overall_score}%
// // //                 </div>
// // //                 <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
// // //                   Score
// // //                 </p>
// // //               </div>
// // //             </div>
// // //           </div>
// // //         ))}
// // //       </div>

// // //       {/* 5. SKILL BREAKDOWN */}
// // //       <div className="p-4">
// // //         <h2 className="font-bold text-gray-800 mb-3 text-sm px-1 uppercase tracking-wide">
// // //           Section Breakdown
// // //         </h2>

// // //         <div className="space-y-4 bg-white p-5 rounded-2xl border border-gray-50 shadow-sm">
// // //           <StatRow label="Theory" score={latest.theory_score} icon={<Code size={16} />} color="bg-red-50 text-red-500" />
// // //           <StatRow label="Practical" score={latest.practical_score} icon={<Monitor size={16} />} color="bg-blue-50 text-blue-500" />
// // //           <StatRow label="Logic" score={latest.problem_solving_score} icon={<Lightbulb size={16} />} color="bg-yellow-50 text-yellow-500" />
// // //           <StatRow label="Creative" score={latest.creativity_score} icon={<Star size={16} />} color="bg-purple-50 text-purple-500" />
// // //         </div>
// // //       </div>

// // //       {/* 6. TUTOR FEEDBACK */}
// // //       <div className="px-4">
// // //         <div className="bg-indigo-600 p-5 rounded-2xl shadow-lg">
// // //           <div className="flex gap-2 items-center text-white font-bold mb-2 text-sm uppercase">
// // //             <MessageSquare size={18} /> Tutor Feedback
// // //           </div>
// // //           <p className="text-sm text-indigo-50 italic leading-relaxed font-medium">
// // //             "{latest.tutor_feedback}"
// // //           </p>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // const StatRow = ({ label, score, icon, color }) => (
// // //   <div>
// // //     <div className="flex justify-between items-center mb-1">
// // //       <div className="flex items-center gap-2">
// // //         <div className={`${color} p-1.5 rounded-lg`}>{icon}</div>
// // //         <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">{label}</span>
// // //       </div>
// // //       <div className="text-xs font-black text-gray-800">{score}%</div>
// // //     </div>
// // //     <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
// // //       <div className="bg-green-500 h-full rounded-full" style={{ width: `${score}%` }}></div>
// // //     </div>
// // //   </div>
// // // );

// // // export default StudentDashboard;
// // // // import React, { useEffect, useState } from 'react';
// // // // import { useParams } from 'react-router-dom';
// // // // import { supabase } from '../supabase';
// // // // import {
// // // //   User,
// // // //   Calendar,
// // // //   BookOpen,
// // // //   Code,
// // // //   Monitor,
// // // //   Lightbulb,
// // // //   Star,
// // // //   MessageSquare,
// // // //   Rocket,
// // // //   ExternalLink,
// // // //   Camera
// // // // } from 'lucide-react';

// // // // const StudentDashboard = () => {
// // // //   const { slug } = useParams();
// // // //   const [data, setData] = useState(null);
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [uploading, setUploading] = useState(false);

// // // //   useEffect(() => {
// // // //     fetchData();
// // // //   }, [slug]);

// // // //   async function fetchData() {
// // // //     if (!slug) return;
// // // //     const { data, error } = await supabase
// // // //       .from('student_results')
// // // //       .select('*')
// // // //       .eq('slug', slug)
// // // //       // .single();

// // // //   }

// // // //   const handleAvatarChange = async (e) => {
// // // //     try {
// // // //       setUploading(true);
// // // //       const file = e.target.files[0];
// // // //       if (!file || !data?.id) return;

// // // //       const fileExt = file.name.split('.').pop();
// // // //       const fileName = `${data.id}-${Math.random().toString(36).substring(7)}.${fileExt}`;
// // // //       const filePath = `avatars/${fileName}`;

// // // //       let { error: uploadError } = await supabase.storage
// // // //         .from('student-assets')
// // // //         .upload(filePath, file);

// // // //       if (uploadError) throw uploadError;

// // // //       const { data: { publicUrl } } = supabase.storage
// // // //         .from('student-assets')
// // // //         .getPublicUrl(filePath);

// // // //       const { error: updateError } = await supabase
// // // //         .from('student_results')
// // // //         .update({ avatar_url: publicUrl })
// // // //         .eq('id', data.id);

// // // //       if (updateError) throw updateError;

// // // //       setData({ ...data, avatar_url: publicUrl });
// // // //       alert("Profile picture updated!");
// // // //     } catch (err) {
// // // //       alert("Upload error: " + err.message);
// // // //     } finally {
// // // //       setUploading(false);
// // // //     }
// // // //   };

// // // //   if (loading) return <div className="p-10 text-center animate-pulse font-sans">Fetching Report Card...</div>;
// // // //   if (!data) return <div className="p-10 text-center font-sans">Result not found.</div>;

// // // //   return (
// // // //     <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-20 font-sans shadow-2xl">

// // // //       {/* 1. HEADER SECTION */}
// // // //       <div className="bg-white p-6 rounded-b-3xl shadow-sm border-b border-gray-100">
// // // //         <div className="flex items-center gap-4">
// // // //           <div className="relative group">
// // // //             <div className="w-20 h-20 bg-indigo-100 rounded-full overflow-hidden border-4 border-white shadow-inner flex items-center justify-center">
// // // //               {data.avatar_url && data.avatar_url.trim() !== "" ? (
// // // //                 // <img src={data.avatar_url} alt="Profile" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
// // // //                 <img
// // // //                   key={data.avatar_url} // Forces re-render when URL changes
// // // //                   src={`${data.avatar_url}?t=${new Date().getTime()}`} // Cache buster
// // // //                   alt="Profile"
// // // //                   className="w-full h-full object-cover"
// // // //                   onLoad={() => console.log("Image loaded successfully")}
// // // //                   onError={(e) => {
// // // //                     console.error("Image failed to load");
// // // //                     e.target.src = ""; // Clear broken src
// // // //                     // Optionally reset state to show User icon
// // // //                   }}
// // // //                 />
// // // //               ) : (
// // // //                 <User size={40} className="text-indigo-500" />
// // // //               )}
// // // //             </div>
// // // //             <label className="absolute bottom-0 right-0 bg-indigo-600 p-1.5 rounded-full text-white cursor-pointer shadow-lg hover:scale-110 transition-transform">
// // // //               <Camera size={14} />
// // // //               <input
// // // //                 type="file"
// // // //                 className="hidden"
// // // //                 onChange={handleAvatarChange}
// // // //                 disabled={uploading}
// // // //                 accept="image/*"
// // // //               />
// // // //             </label>
// // // //           </div>
// // // //           <div className="flex-1">
// // // //             <h1 className="text-xl font-extrabold text-gray-800">{data.student_name}</h1>
// // // //             {/* <p className="text-sm text-indigo-600 font-semibold">{data.course_name}</p> */}
// // // //             <p className="text-sm text-indigo-600 font-semibold">Grade {data.grade_level} • {data.course_name}</p>
// // // //             <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-bold rounded-full uppercase">
// // // //               Active Student
// // // //             </span>
// // // //           </div>
// // // //         </div>
// // // //       </div>

// // // //       {/* 2. PROJECT SHOWCASE (If available) */}
// // // //       {data.project_url && (
// // // //         <div className="p-4">
// // // //           <div className="bg-gradient-to-br from-orange-500 to-pink-500 p-5 rounded-2xl shadow-lg text-white">
// // // //             <div className="flex items-center gap-2 mb-2 font-bold uppercase text-xs tracking-widest">
// // // //               <Rocket size={18} /> Student Project
// // // //             </div>
// // // //             <h3 className="text-lg font-black mb-3">See what {data.student_name.split(' ')[0]} built!</h3>
// // // //             <a
// // // //               href={data.project_url}
// // // //               target="_blank"
// // // //               rel="noreferrer"
// // // //               className="flex items-center justify-center gap-2 w-full bg-white text-orange-600 font-black py-3 rounded-xl shadow-md active:scale-95 transition-all"
// // // //             >
// // // //               Launch Project <ExternalLink size={18} />
// // // //             </a>
// // // //           </div>
// // // //         </div>
// // // //       )}

// // // //       {/* 3. OVERALL PERFORMANCE CIRCLE */}
// // // //       <div className="p-4">
// // // //         <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50">
// // // //           <h2 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide px-1">Overall Performance</h2>
// // // //           <div className="flex items-center gap-6">
// // // //             <div className="relative w-24 h-24 flex items-center justify-center border-[10px] border-green-500 rounded-full">
// // // //               <div className="text-center">
// // // //                 <span className="text-2xl font-black text-gray-800">{data.overall_score}%</span>
// // // //                 <p className="text-[8px] text-green-500 font-bold uppercase">{data.performance_label || 'Score'}</p>
// // // //               </div>
// // // //             </div>
// // // //             <p className="flex-1 text-sm text-gray-600 leading-tight">
// // // //               <span className="font-bold text-gray-800">{data.performance_label || 'Great Job'}!</span> {data.student_name.split(' ')[0]} is performing excellently in this course.
// // // //             </p>
// // // //           </div>
// // // //         </div>
// // // //       </div>

// // // //       {/* 4. LATEST EXAM CARD */}
// // // //       <div className="px-4 mb-2">
// // // //         <div className="flex justify-between items-center mb-3 px-1">
// // // //           <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Latest Exam Result</h2>
// // // //         </div>
// // // //         <div className="bg-white p-4 rounded-2xl shadow-sm border-l-[6px] border-indigo-500">
// // // //           <div className="flex justify-between items-start">
// // // //             <div className="flex gap-3">
// // // //               <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
// // // //                 <BookOpen size={20} />
// // // //               </div>
// // // //               <div>
// // // //                 <h3 className="font-bold text-gray-800 text-sm leading-tight">{data.exam_title}</h3>
// // // //                 <div className="flex items-center gap-1 text-gray-400 text-[10px] mt-1 font-medium">
// // // //                   <Calendar size={12} /> {data.exam_date ? new Date(data.exam_date).toDateString() : 'Recent'}
// // // //                 </div>
// // // //               </div>
// // // //             </div>
// // // //             <div className="text-right">
// // // //               <div className="text-xl font-black text-green-500">{data.overall_score}%</div>
// // // //               <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Score</p>
// // // //             </div>
// // // //           </div>
// // // //         </div>
// // // //       </div>

// // // //       {/* 5. SKILL BREAKDOWN (Progress Bars) */}
// // // //       <div className="p-4">
// // // //         <h2 className="font-bold text-gray-800 mb-3 text-sm px-1 uppercase tracking-wide">Section Breakdown</h2>
// // // //         <div className="space-y-4 bg-white p-5 rounded-2xl border border-gray-50 shadow-sm">
// // // //           <StatRow label="Theory" score={data.theory_score} icon={<Code size={16} />} color="bg-red-50 text-red-500" />
// // // //           <StatRow label="Practical" score={data.practical_score} icon={<Monitor size={16} />} color="bg-blue-50 text-blue-500" />
// // // //           <StatRow label="Logic" score={data.problem_solving_score} icon={<Lightbulb size={16} />} color="bg-yellow-50 text-yellow-500" />
// // // //           <StatRow label="Creative" score={data.creativity_score} icon={<Star size={16} />} color="bg-purple-50 text-purple-500" />
// // // //         </div>
// // // //       </div>

// // // //       {/* 6. TUTOR FEEDBACK */}
// // // //       <div className="px-4">
// // // //         <div className="bg-indigo-600 p-5 rounded-2xl shadow-lg">
// // // //           <div className="flex gap-2 items-center text-white font-bold mb-2 text-sm uppercase">
// // // //             <MessageSquare size={18} /> Tutor Feedback
// // // //           </div>
// // // //           <p className="text-sm text-indigo-50 italic leading-relaxed font-medium">"{data.tutor_feedback}"</p>
// // // //           <div className="mt-4 pt-3 border-t border-indigo-400 text-[10px] text-indigo-200 font-bold uppercase flex justify-between">
// // // //             <span>By Tech Talk Hub</span>
// // // //             <span className="bg-white/20 px-2 py-0.5 rounded">Verified Report</span>
// // // //           </div>
// // // //         </div>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // };

// // // // const StatRow = ({ label, score, icon, color }) => (
// // // //   <div>
// // // //     <div className="flex justify-between items-center mb-1">
// // // //       <div className="flex items-center gap-2">
// // // //         <div className={`${color} p-1.5 rounded-lg`}>{icon}</div>
// // // //         <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">{label}</span>
// // // //       </div>
// // // //       <div className="text-xs font-black text-gray-800">{score}%</div>
// // // //     </div>
// // // //     <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
// // // //       <div
// // // //         className="bg-green-500 h-full rounded-full transition-all duration-1000"
// // // //         style={{ width: `${score}%` }}
// // // //       ></div>
// // // //     </div>
// // // //   </div>
// // // // );

// // // // export default StudentDashboard;
// // // // // import React, { useEffect, useState } from 'react';
// // // // // import { useParams } from 'react-router-dom';
// // // // // import { supabase } from '../supabase';
// // // // // import {
// // // // //   User,
// // // // //   Calendar,
// // // // //   BookOpen,
// // // // //   Code,
// // // // //   Monitor,
// // // // //   Lightbulb,
// // // // //   Star,
// // // // //   MessageSquare,
// // // // //   Rocket,
// // // // //   ExternalLink,
// // // // //   Camera
// // // // // } from 'lucide-react';

// // // // // const StudentDashboard = () => {
// // // // //   const { studentId } = useParams();
// // // // //   const [data, setData] = useState(null);
// // // // //   const [loading, setLoading] = useState(true);
// // // // //   const [uploading, setUploading] = useState(false);

// // // // //   useEffect(() => {
// // // // //     fetchData();
// // // // //   }, [studentId]);

// // // // //   async function fetchData() {
// // // // //     if (!studentId) return;
// // // // //     const { data, error } = await supabase
// // // // //       .from('student_results')
// // // // //       .select('*')
// // // // //       .eq('id', studentId)
// // // // //       .single();

// // // // //     if (data) setData(data);
// // // // //     setLoading(false);
// // // // //   }

// // // // //   const handleAvatarChange = async (e) => {
// // // // //     try {
// // // // //       setUploading(true);
// // // // //       const file = e.target.files[0];
// // // // //       if (!file) return;

// // // // //       const fileExt = file.name.split('.').pop();
// // // // //       const fileName = `${studentId}-${Math.random()}.${fileExt}`;
// // // // //       const filePath = `avatars/${fileName}`;

// // // // //       // 1. Upload to Supabase Storage
// // // // //       let { error: uploadError } = await supabase.storage
// // // // //         .from('student-assets')
// // // // //         .upload(filePath, file);

// // // // //       if (uploadError) throw uploadError;

// // // // //       // 2. Get Public URL
// // // // //       const { data: { publicUrl } } = supabase.storage
// // // // //         .from('student-assets')
// // // // //         .getPublicUrl(filePath);

// // // // //       // 3. Update Table
// // // // //       const { error: updateError } = await supabase
// // // // //         .from('student_results')
// // // // //         .update({ avatar_url: publicUrl })
// // // // //         .eq('id', studentId);

// // // // //       if (updateError) throw updateError;

// // // // //       setData({ ...data, avatar_url: publicUrl });
// // // // //       alert("Profile picture updated!");
// // // // //     } catch (err) {
// // // // //       alert("Error uploading image: " + err.message);
// // // // //     } finally {
// // // // //       setUploading(false);
// // // // //     }
// // // // //   };

// // // // //   if (loading) return <div className="p-10 text-center animate-pulse font-sans">Fetching Report Card...</div>;
// // // // //   if (!data) return <div className="p-10 text-center font-sans">Result not found.</div>;

// // // // //   return (
// // // // //     <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-20 font-sans shadow-2xl">
// // // // //       {/* Header with Editable Avatar */}
// // // // //       <div className="bg-white p-6 rounded-b-3xl shadow-sm border-b border-gray-100">
// // // // //         <div className="flex items-center gap-4">
// // // // //           <div className="relative group">
// // // // //             {/* <div className="w-20 h-20 bg-indigo-100 rounded-full overflow-hidden border-4 border-white shadow-inner flex items-center justify-center">
// // // // //               {data.avatar_url ? (
// // // // //                 <img src={data.avatar_url} alt="Profile" className="w-full h-full object-cover" />
// // // // //               ) : (
// // // // //                 <User size={40} className="text-indigo-500" />
// // // // //               )}
// // // // //             </div> */}
// // // // //             <div className="w-20 h-20 bg-indigo-100 rounded-full overflow-hidden border-4 border-white shadow-inner flex items-center justify-center">
// // // // //               {/* Check if avatar_url exists AND is not just an empty string */}
// // // // //               {data.avatar_url && data.avatar_url.trim() !== "" ? (
// // // // //                 <img
// // // // //                   src={data.avatar_url}
// // // // //                   alt="Profile"
// // // // //                   className="w-full h-full object-cover"
// // // // //                 />
// // // // //               ) : (
// // // // //                 <User size={40} className="text-indigo-500" />
// // // // //               )}
// // // // //             </div>
// // // // //             <label className="absolute bottom-0 right-0 bg-indigo-600 p-1.5 rounded-full text-white cursor-pointer shadow-lg hover:scale-110 transition-transform">
// // // // //               <Camera size={14} />
// // // // //               <input
// // // // //                 type="file"
// // // // //                 className="hidden"
// // // // //                 onChange={handleAvatarChange}
// // // // //                 disabled={uploading}
// // // // //                 accept="image/*"
// // // // //               />
// // // // //             </label>
// // // // //           </div>
// // // // //           <div className="flex-1">
// // // // //             <h1 className="text-xl font-extrabold text-gray-800">{data.student_name}</h1>
// // // // //             <p className="text-sm text-indigo-600 font-semibold">{data.course_name}</p>
// // // // //             <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-bold rounded-full uppercase">
// // // // //               Active Student
// // // // //             </span>
// // // // //           </div>
// // // // //         </div>
// // // // //       </div>

// // // // //       {/* Project Showcase Section */}
// // // // //       {data.project_url && (
// // // // //         <div className="p-4">
// // // // //           <div className="bg-gradient-to-br from-orange-500 to-pink-500 p-5 rounded-2xl shadow-lg text-white">
// // // // //             <div className="flex items-center gap-2 mb-2 font-bold uppercase text-xs tracking-widest">
// // // // //               <Rocket size={18} /> Student Project
// // // // //             </div>
// // // // //             <h3 className="text-lg font-black mb-3">See what {data.student_name.split(' ')[0]} built!</h3>
// // // // //             <a
// // // // //               href={data.project_url}
// // // // //               target="_blank"
// // // // //               rel="noreferrer"
// // // // //               className="flex items-center justify-center gap-2 w-full bg-white text-orange-600 font-black py-3 rounded-xl shadow-md active:scale-95 transition-all"
// // // // //             >
// // // // //               Launch Project <ExternalLink size={18} />
// // // // //             </a>
// // // // //           </div>
// // // // //         </div>
// // // // //       )}

// // // // //       {/* Performance Summary */}
// // // // //       <div className="p-4">
// // // // //         <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 flex items-center gap-6">
// // // // //           <div className="relative w-24 h-24 flex items-center justify-center border-[10px] border-green-500 rounded-full">
// // // // //             <div className="text-center">
// // // // //               <span className="text-2xl font-black text-gray-800">{data.overall_score}%</span>
// // // // //               {/* Uses dynamic label from DB (e.g. project_label) instead of hardcoded 'Excellent' */}
// // // // //               <p className="text-[8px] text-green-500 font-bold uppercase">{data.project_label || 'Score'}</p>
// // // // //             </div>
// // // // //           </div>
// // // // //           <p className="flex-1 text-sm text-gray-600 leading-tight">
// // // // //             <span className="font-bold text-gray-800">{data.project_label || 'Great Job'}!</span> {data.student_name.split(' ')[0]} is mastering coding concepts with great logic.
// // // // //           </p>
// // // // //         </div>
// // // // //       </div>

// // // // //       {/* Exam Details */}
// // // // //       <div className="px-4 mb-2">
// // // // //         <div className="bg-white p-4 rounded-2xl shadow-sm border-l-[6px] border-indigo-500">
// // // // //           <div className="flex justify-between items-start">
// // // // //             <div className="flex gap-3">
// // // // //               <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
// // // // //                 <BookOpen size={20} />
// // // // //               </div>
// // // // //               <div>
// // // // //                 <h3 className="font-bold text-gray-800 text-sm leading-tight">{data.exam_title}</h3>
// // // // //                 <div className="flex items-center gap-1 text-gray-400 text-[10px] mt-1 font-medium">
// // // // //                   <Calendar size={12} /> {data.exam_date ? new Date(data.exam_date).toDateString() : 'Recent'}
// // // // //                 </div>
// // // // //               </div>
// // // // //             </div>
// // // // //           </div>
// // // // //         </div>
// // // // //       </div>

// // // // //       {/* Skill Breakdown */}
// // // // //       <div className="p-4">
// // // // //         <h2 className="font-bold text-gray-800 mb-3 text-sm px-1 uppercase tracking-wide">Skill Breakdown</h2>
// // // // //         <div className="space-y-4 bg-white p-5 rounded-2xl border border-gray-50 shadow-sm">
// // // // //           <StatRow label="Theory" score={data.theory_score} icon={<Code size={16} />} color="bg-red-50 text-red-500" />
// // // // //           <StatRow label="Practical" score={data.practical_score} icon={<Monitor size={16} />} color="bg-blue-50 text-blue-500" />
// // // // //           <StatRow label="Logic" score={data.problem_solving_score} icon={<Lightbulb size={16} />} color="bg-yellow-50 text-yellow-500" />
// // // // //           <StatRow label="Creative" score={data.creativity_score} icon={<Star size={16} />} color="bg-purple-50 text-purple-500" />
// // // // //         </div>
// // // // //       </div>

// // // // //       {/* Tutor Feedback */}
// // // // //       <div className="px-4">
// // // // //         <div className="bg-indigo-600 p-5 rounded-2xl shadow-lg">
// // // // //           <div className="flex gap-2 items-center text-white font-bold mb-2 text-sm uppercase">
// // // // //             <MessageSquare size={18} /> Tutor Feedback
// // // // //           </div>
// // // // //           <p className="text-sm text-indigo-50 italic leading-relaxed font-medium">"{data.tutor_feedback}"</p>
// // // // //           <div className="mt-4 pt-3 border-t border-indigo-400 text-[10px] text-indigo-200 font-bold uppercase flex justify-between">
// // // // //             <span>By Tech Talk Hub</span>
// // // // //             <span className="bg-white/20 px-2 py-0.5 rounded">Verified Report</span>
// // // // //           </div>
// // // // //         </div>
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // const StatRow = ({ label, score, icon, color }) => (
// // // // //   <div>
// // // // //     <div className="flex justify-between items-center mb-1">
// // // // //       <div className="flex items-center gap-2">
// // // // //         <div className={`${color} p-1.5 rounded-lg`}>{icon}</div>
// // // // //         <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">{label}</span>
// // // // //       </div>
// // // // //       <div className="text-xs font-black text-gray-800">{score}%</div>
// // // // //     </div>
// // // // //     <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
// // // // //       <div
// // // // //         className="bg-green-500 h-full rounded-full transition-all duration-1000"
// // // // //         style={{ width: `${score}%` }}
// // // // //       ></div>
// // // // //     </div>
// // // // //   </div>
// // // // // );
