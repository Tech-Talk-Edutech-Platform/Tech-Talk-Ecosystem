import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Save, UserPlus, ClipboardList, Rocket } from 'lucide-react';

// 👉 helper: convert name → slug
const slugify = (name) =>
  name.toLowerCase().trim().replace(/\s+/g, '-');

const AdminEntryForm = () => {
  const [loading, setLoading] = useState(false);

  const initialState = {
    student_name: '',
    slug: '',
    grade_level: '',
    course_name: 'Scratch Programming',
    exam_title: '',
    exam_date: new Date().toISOString().split('T')[0],
    theory_score: 0,
    practical_score: 0,
    problem_solving_score: 0,
    creativity_score: 0,
    tutor_feedback: '',
    project_url: '',
    project_label: ''
  };

  const [formData, setFormData] = useState(initialState);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'number' ? (parseInt(value) || 0) : value;

    setFormData(prev => ({
      ...prev,
      [name]: finalValue,
      ...(name === 'student_name' && { slug: slugify(value) }) // auto slug
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Validate URL
      if (formData.project_url && !formData.project_url.startsWith("http")) {
        throw new Error("Project URL must start with http/https");
      }

      // ✅ Auto calculate overall
      const overall =
        (formData.theory_score +
          formData.practical_score +
          formData.problem_solving_score +
          formData.creativity_score) / 4;

      const payload = {
        ...formData,
        overall_score: Math.round(overall)
      };

      const { data, error } = await supabase
        .from('student_results')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      const link = `${window.location.origin}/results/${data.slug}`;

      alert(`✅ Saved!\n\nShare this link:\n${link}`);

      setFormData(initialState);

    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow my-10">
      <div className="flex items-center gap-3 mb-6">
        <UserPlus className="text-indigo-600" />
        <h1 className="text-xl font-bold">Enter Student Results</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* BASIC */}
        <div className="grid grid-cols-2 gap-4">
          <Input label="Student Name" name="student_name" value={formData.student_name} onChange={handleChange} required />
          <Input label="Grade Level" name="grade_level" value={formData.grade_level} onChange={handleChange} />
        </div>

        {/* EXAM */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ClipboardList size={16} /> Exam
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input name="exam_title" placeholder="Exam title" required onChange={handleChange} className="input" />
            <input type="date" name="exam_date" value={formData.exam_date} onChange={handleChange} className="input" />
          </div>

          <div className="flex gap-2 items-center bg-white p-2 border rounded">
            <Rocket size={16} />
            <input name="project_url" value={formData.project_url} onChange={handleChange} placeholder="Project URL" className="w-full outline-none text-sm" />
          </div>
        </div>

        {/* SCORES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-indigo-50 p-4 rounded">
          <Score label="Theory" name="theory_score" value={formData.theory_score} onChange={handleChange} />
          <Score label="Practical" name="practical_score" value={formData.practical_score} onChange={handleChange} />
          <Score label="Logic" name="problem_solving_score" value={formData.problem_solving_score} onChange={handleChange} />
          <Score label="Creative" name="creativity_score" value={formData.creativity_score} onChange={handleChange} />
        </div>

        {/* FEEDBACK */}
        <textarea name="tutor_feedback" value={formData.tutor_feedback} onChange={handleChange} placeholder="Feedback..." className="w-full p-3 border rounded" />

        <button disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded font-bold">
          {loading ? "Saving..." : <><Save size={16} /> Save</>}
        </button>
      </form>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div>
    <label className="text-sm">{label}</label>
    <input {...props} className="w-full p-2 border rounded" />
  </div>
);

const Score = ({ label, ...props }) => (
  <div>
    <label className="text-xs">{label}</label>
    <input type="number" min="0" max="100" {...props} className="w-full p-2 border rounded" />
  </div>
);

export default AdminEntryForm;
// import React, { useState } from 'react';
// import { supabase } from '../supabase';
// import { Save, UserPlus, ClipboardList, MessageSquare, Rocket } from 'lucide-react';

// const AdminEntryForm = () => {
//   const [loading, setLoading] = useState(false);
//   const initialState = {
//     student_name: '',
//     grade_level: '',
//     course_name: 'Scratch Programming',
//     overall_score: 0,
//     exam_title: '',
//     exam_date: new Date().toISOString().split('T')[0],
//     theory_score: 0,
//     practical_score: 0,
//     problem_solving_score: 0,
//     creativity_score: 0,
//     tutor_feedback: '',
//     project_url: '' // Added this
//   };

//   const [formData, setFormData] = useState(initialState);

//   const handleChange = (e) => {
//     const { name, value, type } = e.target;
//     const finalValue = type === 'number' ? (parseInt(value) || 0) : value;
//     setFormData(prev => ({ ...prev, [name]: finalValue }));
//   };

//   const handleSave = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const { error } = await supabase.from('student_results').insert([formData]);
//       if (error) throw error;
//       alert(`Success! Results published for ${formData.student_name}`);
//       setFormData(initialState);
//     } catch (error) {
//       alert("Error saving: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl my-10 font-sans border border-gray-100">
//       <div className="flex items-center gap-3 mb-8 border-b pb-4">
//         <UserPlus className="text-indigo-600" />
//         <h1 className="text-2xl font-bold text-gray-800">Enter Student Results</h1>
//       </div>

//       <form onSubmit={handleSave} className="space-y-6">
//         <div className="grid grid-cols-2 gap-4">
//           <InputGroup label="Student Name" name="student_name" value={formData.student_name} required onChange={handleChange} placeholder="Daniel Mwangi" />
//           <InputGroup label="Grade Level" name="grade_level" value={formData.grade_level} onChange={handleChange} placeholder="Grade 6" />
//         </div>

//         <div className="bg-gray-50 p-4 rounded-lg space-y-4">
//           <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm uppercase"><ClipboardList size={18} /> Exam Details</div>
//           <div className="grid grid-cols-2 gap-4">
//             <input type="text" name="exam_title" value={formData.exam_title} required placeholder="Exam Title" onChange={handleChange} className="p-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-400" />
//             <input type="date" name="exam_date" value={formData.exam_date} onChange={handleChange} className="p-2 border rounded-lg bg-white outline-none" />
//           </div>
//           {/* Project Link Input */}
//           <div className="flex items-center gap-2 bg-white p-2 rounded-lg border">
//             <Rocket size={18} className="text-orange-500" />
//             <input type="text" name="project_url" value={formData.project_url} placeholder="Paste Scratch Project URL here" onChange={handleChange} className="w-full outline-none text-sm" />
//           </div>
//         </div>

//         <div>
//           <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider text-center">Scores (0-100)</label>
//           <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-indigo-50 p-6 rounded-xl">
//             <ScoreInput label="Overall %" name="overall_score" value={formData.overall_score} onChange={handleChange} />
//             <ScoreInput label="Theory" name="theory_score" value={formData.theory_score} onChange={handleChange} />
//             <ScoreInput label="Practical" name="practical_score" value={formData.practical_score} onChange={handleChange} />
//             <ScoreInput label="Problem Solving" name="problem_solving_score" value={formData.problem_solving_score} onChange={handleChange} />
//             <ScoreInput label="Creativity" name="creativity_score" value={formData.creativity_score} onChange={handleChange} />
//           </div>
//         </div>

//         <textarea name="tutor_feedback" value={formData.tutor_feedback} rows="4" onChange={handleChange} placeholder="Write comments here..." className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none" />

//         <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:bg-gray-400">
//           {loading ? "Uploading..." : <><Save size={20} /> Save & Publish Results</>}
//         </button>
//       </form>
//     </div>
//   );
// };

// const InputGroup = ({ label, ...props }) => (
//   <div>
//     <label className="block text-sm font-semibold text-gray-600 mb-1">{label}</label>
//     <input {...props} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none" />
//   </div>
// );

// const ScoreInput = ({ label, name, value, onChange }) => (
//   <div className="flex flex-col">
//     <label className="text-xs font-bold text-indigo-900 mb-1">{label}</label>
//     <input type="number" name={name} value={value} onChange={onChange} className="p-2 border-2 border-white rounded-lg outline-none" />
//   </div>
// );

// export default AdminEntryForm;
// // import React, { useState } from 'react';
// // import { supabase } from '../supabase';
// // import { Save, UserPlus, ClipboardList, MessageSquare } from 'lucide-react';

// // const AdminEntryForm = () => {
// //   const [loading, setLoading] = useState(false);
// //   const [formData, setFormData] = useState({
// //     student_name: '',
// //     grade_level: '',
// //     course_name: 'Scratch Programming',
// //     overall_score: 0,
// //     exam_title: '',
// //     exam_date: new Date().toISOString().split('T')[0],
// //     theory_score: 0,
// //     practical_score: 0,
// //     problem_solving_score: 0,
// //     creativity_score: 0,
// //     tutor_feedback: ''
// //   });

// //   const handleChange = (e) => {
// //     const { name, value, type } = e.target;
// //     // Ensure numbers are sent as integers to Supabase
// //     const finalValue = type === 'number' ? (parseInt(value) || 0) : value;

// //     setFormData(prev => ({
// //       ...prev,
// //       [name]: finalValue
// //     }));
// //   };

// //   const handleSave = async (e) => {
// //     e.preventDefault();
// //     setLoading(true);

// //     try {
// //       const { error } = await supabase
// //         .from('student_results')
// //         .insert([formData]);

// //       if (error) throw error;

// //       alert(`Success! Results published for ${formData.student_name}`);
// //       // Optional: Reset form here
// //     } catch (error) {
// //       alert("Error saving: " + error.message);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl my-10 font-sans border border-gray-100">
// //       <div className="flex items-center gap-3 mb-8 border-b pb-4">
// //         <UserPlus className="text-indigo-600" />
// //         <h1 className="text-2xl font-bold text-gray-800">Enter Student Results</h1>
// //       </div>

// //       <form onSubmit={handleSave} className="space-y-6">
// //         <div className="grid grid-cols-2 gap-4">
// //           <div>
// //             <label className="block text-sm font-semibold text-gray-600 mb-1">Student Name</label>
// //             <input type="text" name="student_name" required onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none" placeholder="Daniel Mwangi" />
// //           </div>
// //           <div>
// //             <label className="block text-sm font-semibold text-gray-600 mb-1">Grade Level</label>
// //             <input type="text" name="grade_level" onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none" placeholder="Grade 6" />
// //           </div>
// //         </div>

// //         <div className="bg-gray-50 p-4 rounded-lg space-y-4">
// //           <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
// //             <ClipboardList size={18} /> EXAM DETAILS
// //           </div>
// //           <div className="grid grid-cols-2 gap-4">
// //             <input type="text" name="exam_title" required placeholder="Exam Title" onChange={handleChange} className="p-2 border rounded-lg bg-white" />
// //             <input type="date" name="exam_date" value={formData.exam_date} onChange={handleChange} className="p-2 border rounded-lg bg-white" />
// //           </div>
// //         </div>

// //         <div>
// //           <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider text-center">Scores (0-100)</label>
// //           <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-indigo-50 p-6 rounded-xl">
// //             <ScoreInput label="Overall %" name="overall_score" value={formData.overall_score} onChange={handleChange} />
// //             <ScoreInput label="Theory" name="theory_score" value={formData.theory_score} onChange={handleChange} />
// //             <ScoreInput label="Practical" name="practical_score" value={formData.practical_score} onChange={handleChange} />
// //             <ScoreInput label="Problem Solving" name="problem_solving_score" value={formData.problem_solving_score} onChange={handleChange} />
// //             <ScoreInput label="Creativity" name="creativity_score" value={formData.creativity_score} onChange={handleChange} />
// //           </div>
// //         </div>

// //         <div>
// //           <div className="flex items-center gap-2 text-gray-700 font-bold text-sm mb-2">
// //             <MessageSquare size={18} /> TUTOR FEEDBACK
// //           </div>
// //           <textarea
// //             name="tutor_feedback"
// //             rows="4"
// //             onChange={handleChange}
// //             placeholder="Write comments here..."
// //             className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
// //           ></textarea>
// //         </div>

// //         <button
// //           type="submit"
// //           disabled={loading}
// //           className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:bg-gray-400"
// //         >
// //           {loading ? "Uploading..." : <><Save size={20} /> Save & Publish Results</>}
// //         </button>
// //       </form>
// //     </div>
// //   );
// // };

// // const ScoreInput = ({ label, name, value, onChange }) => (
// //   <div className="flex flex-col">
// //     <label className="text-xs font-bold text-indigo-900 mb-1">{label}</label>
// //     <input
// //       type="number"
// //       name={name}
// //       value={value}
// //       min="0"
// //       max="100"
// //       onChange={onChange}
// //       className="p-2 border-2 border-white rounded-lg focus:border-indigo-300 outline-none"
// //     />
// //   </div>
// // );

// // export default AdminEntryForm;