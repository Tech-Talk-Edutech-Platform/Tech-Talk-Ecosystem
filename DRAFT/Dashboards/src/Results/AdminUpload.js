import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Save, UserPlus, ClipboardList, Rocket, Award } from 'lucide-react';

// Dynamic slug generator based on immutable values
const slugify = (name, examTitle) => {
  const base = `${name}-${examTitle}`.toLowerCase().trim();
  return base.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

const AdminEntryForm = () => {
  const [loading, setLoading] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [fetchingStudents, setFetchingStudents] = useState(true);

  const initialState = {
    student_id: '', // 🔥 Store the relational UUID
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
    performance_label: 'Excellent',
    tutor_feedback: '',
    project_url: '',
  };

  const [formData, setFormData] = useState(initialState);

  // 1. Fetch real students from users table
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, full_name, grade_level:assigned_course_id') // adjust if grade lives elsewhere
          .eq('role', 'student')
          .eq('is_active', true)
          .order('full_name', { ascending: true });

        if (error) throw error;
        setStudentsList(data || []);
      } catch (err) {
        console.error("Error fetching student directory:", err.message);
      } finally {
        setFetchingStudents(false);
      }
    };
    fetchStudents();
  }, []);

  // 2. Handle selection changes cleanly
  const handleStudentSelect = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      setFormData(prev => ({ ...prev, student_id: '', student_name: '', slug: '' }));
      return;
    }

    const selectedStudent = studentsList.find(s => s.id === selectedId);
    setFormData(prev => ({
      ...prev,
      student_id: selectedId,
      student_name: selectedStudent.full_name,
      slug: slugify(selectedStudent.full_name, prev.exam_title || 'assessment')
    }));
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'number' ? (parseInt(value) || 0) : value;

    setFormData(prev => {
      const updated = { ...prev, [name]: finalValue };
      // Keep slug fresh if they type an exam title out
      if (name === 'exam_title' && prev.student_name) {
        updated.slug = slugify(prev.student_name, value);
      }
      return updated;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.student_id) {
      alert("Please select a student from the directory.");
      return;
    }
    setLoading(true);

    try {
      if (formData.project_url && !formData.project_url.startsWith("http")) {
        throw new Error("Project URL must start with http/https");
      }

      const overall = (formData.theory_score + formData.practical_score + formData.problem_solving_score + formData.creativity_score) / 4;

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
      alert(`✅ Saved Assessment Record!\n\nShareable Report Card Link:\n${link}`);
      setFormData(initialState);

    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow my-10 font-sans">
      <div className="flex items-center gap-3 mb-6">
        <UserPlus className="text-indigo-600" />
        <h1 className="text-xl font-bold text-gray-800">Enter Student Results</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* DROPDOWN SELECTOR */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold mb-1 block text-gray-700">Select Registered Student</label>
            <select
              name="student_id"
              value={formData.student_id}
              onChange={handleStudentSelect}
              disabled={fetchingStudents}
              required
              className="w-full p-2 border rounded bg-white text-sm outline-indigo-500 h-[38px]"
            >
              <option value="">{fetchingStudents ? "Loading directory..." : "-- Choose Student --"}</option>
              {studentsList.map(student => (
                <option key={student.id} value={student.id}>
                  {student.full_name}
                </option>
              ))}
            </select>
          </div>
          <Input label="Grade Level" name="grade_level" value={formData.grade_level} onChange={handleChange} placeholder="e.g. Grade 6" />
        </div>

        {/* PERFORMANCE LABEL & COURSE */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold flex items-center gap-1 mb-1">
              <Award size={14} className="text-indigo-500" /> Performance Label
            </label>
            <select
              name="performance_label"
              value={formData.performance_label}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-white text-sm h-[38px]"
            >
              <option value="Excellent">Excellent</option>
              <option value="Outstanding">Outstanding</option>
              <option value="Above Average">Above Average</option>
              <option value="Average">Average</option>
              <option value="Improving">Improving</option>
            </select>
          </div>
          <Input label="Course Name" name="course_name" value={formData.course_name} onChange={handleChange} />
        </div>

        {/* EXAM & PROJECT */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-3 border border-gray-100">
          <div className="flex items-center gap-2 font-bold text-sm text-gray-700">
            <ClipboardList size={16} /> Exam & Project
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              name="exam_title"
              placeholder="Exam title (e.g., Capstone Project)"
              required
              value={formData.exam_title}
              onChange={handleChange}
              className="p-2 border rounded text-sm w-full"
            />
            <input
              type="date"
              name="exam_date"
              value={formData.exam_date}
              onChange={handleChange}
              className="p-2 border rounded text-sm w-full"
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex gap-2 items-center bg-white p-2 border rounded">
              <Rocket size={16} className="text-orange-500" />
              <input name="project_url" value={formData.project_url} onChange={handleChange} placeholder="Project URL Link" className="w-full outline-none text-sm" />
            </div>
          </div>
        </div>

        {/* SCORES */}
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
          <label className="block text-sm font-bold text-indigo-800 mb-3 uppercase tracking-tight">Skill Scores (0-100)</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Score label="Theory" name="theory_score" value={formData.theory_score} onChange={handleChange} />
            <Score label="Practical" name="practical_score" value={formData.practical_score} onChange={handleChange} />
            <Score label="Logic" name="problem_solving_score" value={formData.problem_solving_score} onChange={handleChange} />
            <Score label="Creative" name="creativity_score" value={formData.creativity_score} onChange={handleChange} />
          </div>
        </div>

        {/* FEEDBACK */}
        <div>
          <label className="text-sm font-semibold mb-1 block">Tutor Feedback</label>
          <textarea
            name="tutor_feedback"
            value={formData.tutor_feedback}
            onChange={handleChange}
            placeholder="Write a personalized note for the student..."
            className="w-full p-3 border rounded text-sm h-24"
          />
        </div>

        <button
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-white transition-all ${loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg active:scale-95'}`}
        >
          {loading ? "Saving..." : <><Save size={18} /> Save Result</>}
        </button>
      </form>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div>
    <label className="text-sm font-semibold mb-1 block text-gray-700">{label}</label>
    <input {...props} className="w-full p-2 border rounded text-sm outline-indigo-500" />
  </div>
);

const Score = ({ label, ...props }) => (
  <div className="bg-white p-2 rounded border border-indigo-200">
    <label className="text-[10px] font-black text-indigo-400 uppercase block mb-1">{label}</label>
    <input type="number" min="0" max="100" {...props} className="w-full p-1 text-center font-bold text-indigo-900 outline-none" />
  </div>
);

export default AdminEntryForm;
// import React, { useState } from 'react';
// import { supabase } from '../supabase';
// import { Save, UserPlus, ClipboardList, Rocket, Award } from 'lucide-react';

// // 👉 helper: convert name → slug
// const slugify = (name) =>
//   name.toLowerCase().trim().replace(/\s+/g, '-');

// const AdminEntryForm = () => {
//   const [loading, setLoading] = useState(false);

//   const initialState = {
//     student_name: '',
//     slug: '',
//     grade_level: '',
//     course_name: 'Scratch Programming',
//     exam_title: '',
//     exam_date: new Date().toISOString().split('T')[0],
//     theory_score: 0,
//     practical_score: 0,
//     problem_solving_score: 0,
//     creativity_score: 0,
//     performance_label: 'Excellent', // Added field
//     tutor_feedback: '',
//     project_url: '',
//     // project_label: ''
//   };

//   const [formData, setFormData] = useState(initialState);

//   const handleChange = (e) => {
//     const { name, value, type } = e.target;
//     const finalValue = type === 'number' ? (parseInt(value) || 0) : value;

//     setFormData(prev => ({
//       ...prev,
//       [name]: finalValue,
//       ...(name === 'student_name' && { slug: slugify(value) }) // auto slug
//     }));
//   };

//   const handleSave = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       // ✅ Validate URL
//       if (formData.project_url && !formData.project_url.startsWith("http")) {
//         throw new Error("Project URL must start with http/https");
//       }

//       // ✅ Auto calculate overall
//       const overall =
//         (formData.theory_score +
//           formData.practical_score +
//           formData.problem_solving_score +
//           formData.creativity_score) / 4;

//       const payload = {
//         ...formData,
//         overall_score: Math.round(overall)
//       };

//       const { data, error } = await supabase
//         .from('student_results')
//         .insert([payload])
//         .select()
//         .single();

//       if (error) throw error;

//       const link = `${window.location.origin}/results/${data.slug}`;

//       alert(`✅ Saved!\n\nShare this link:\n${link}`);

//       setFormData(initialState);

//     } catch (err) {
//       alert("Error: " + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow my-10 font-sans">
//       <div className="flex items-center gap-3 mb-6">
//         <UserPlus className="text-indigo-600" />
//         <h1 className="text-xl font-bold text-gray-800">Enter Student Results</h1>
//       </div>

//       <form onSubmit={handleSave} className="space-y-6">

//         {/* BASIC INFO */}
//         <div className="grid grid-cols-2 gap-4">
//           <Input label="Student Name" name="student_name" value={formData.student_name} onChange={handleChange} required />
//           <Input label="Grade Level" name="grade_level" value={formData.grade_level} onChange={handleChange} placeholder="e.g. 6" />
//         </div>

//         {/* PERFORMANCE LABEL & COURSE */}
//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label className="text-sm font-semibold flex items-center gap-1 mb-1">
//               <Award size={14} className="text-indigo-500" /> Performance Label
//             </label>
//             <select
//               name="performance_label"
//               value={formData.performance_label}
//               onChange={handleChange}
//               className="w-full p-2 border rounded bg-white text-sm"
//             >
//               <option value="Excellent">Excellent</option>
//               <option value="Outstanding">Outstanding</option>
//               <option value="Above Average">Above Average</option>
//               <option value="Average">Average</option>
//               <option value="Improving">Improving</option>
//             </select>
//           </div>
//           <Input label="Course Name" name="course_name" value={formData.course_name} onChange={handleChange} />
//         </div>

//         {/* EXAM & PROJECT */}
//         <div className="bg-gray-50 p-4 rounded-lg space-y-3 border border-gray-100">
//           <div className="flex items-center gap-2 font-bold text-sm text-gray-700">
//             <ClipboardList size={16} /> Exam & Project
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <input
//               name="exam_title"
//               placeholder="Exam title (e.g. Final Assessment)"
//               required
//               value={formData.exam_title}
//               onChange={handleChange}
//               className="p-2 border rounded text-sm w-full"
//             />
//             <input
//               type="date"
//               name="exam_date"
//               value={formData.exam_date}
//               onChange={handleChange}
//               className="p-2 border rounded text-sm w-full"
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div className="flex gap-2 items-center bg-white p-2 border rounded">
//               <Rocket size={16} className="text-orange-500" />
//               <input name="project_url" value={formData.project_url} onChange={handleChange} placeholder="Project URL" className="w-full outline-none text-sm" />
//             </div>
//             {/* <input
//               name="project_label"
//               value={formData.project_label}
//               onChange={handleChange}
//               placeholder="Project Name (e.g. Space Game)"
//               className="p-2 border rounded text-sm w-full"
//             /> */}
//           </div>
//         </div>

//         {/* SCORES */}
//         <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
//           <label className="block text-sm font-bold text-indigo-800 mb-3 uppercase tracking-tight">Skill Scores (0-100)</label>
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//             <Score label="Theory" name="theory_score" value={formData.theory_score} onChange={handleChange} />
//             <Score label="Practical" name="practical_score" value={formData.practical_score} onChange={handleChange} />
//             <Score label="Logic" name="problem_solving_score" value={formData.problem_solving_score} onChange={handleChange} />
//             <Score label="Creative" name="creativity_score" value={formData.creativity_score} onChange={handleChange} />
//           </div>
//         </div>

//         {/* FEEDBACK */}
//         <div>
//           <label className="text-sm font-semibold mb-1 block">Tutor Feedback</label>
//           <textarea
//             name="tutor_feedback"
//             value={formData.tutor_feedback}
//             onChange={handleChange}
//             placeholder="Write a personalized note for the student..."
//             className="w-full p-3 border rounded text-sm h-24"
//           />
//         </div>

//         <button
//           disabled={loading}
//           className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-white transition-all ${loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg active:scale-95'}`}
//         >
//           {loading ? "Saving..." : <><Save size={18} /> Save Result</>}
//         </button>
//       </form>
//     </div>
//   );
// };

// const Input = ({ label, ...props }) => (
//   <div>
//     <label className="text-sm font-semibold mb-1 block text-gray-700">{label}</label>
//     <input {...props} className="w-full p-2 border rounded text-sm outline-indigo-500" />
//   </div>
// );

// const Score = ({ label, ...props }) => (
//   <div className="bg-white p-2 rounded border border-indigo-200">
//     <label className="text-[10px] font-black text-indigo-400 uppercase block mb-1">{label}</label>
//     <input type="number" min="0" max="100" {...props} className="w-full p-1 text-center font-bold text-indigo-900 outline-none" />
//   </div>
// );

// export default AdminEntryForm;
// import React, { useState } from 'react';
// import { supabase } from '../supabase';
// import { Save, UserPlus, ClipboardList, Rocket, Star } from 'lucide-react';

// // 👉 helper: convert name → slug
// const slugify = (name) =>
//   name.toLowerCase().trim().replace(/\s+/g, '-');

// const AdminEntryForm = () => {
//   const [loading, setLoading] = useState(false);

//   const initialState = {
//     student_name: '',
//     slug: '',
//     grade_level: '',
//     course_name: 'Scratch Programming',
//     exam_title: '',
//     exam_date: new Date().toISOString().split('T')[0],
//     theory_score: 0,
//     practical_score: 0,
//     problem_solving_score: 0,
//     creativity_score: 0,
//     performance_label: 'Excellent', // Default label
//     tutor_feedback: '',
//     project_url: '',
//     performance_label: ''
//   };

//   const [formData, setFormData] = useState(initialState);

//   const handleChange = (e) => {
//     const { name, value, type } = e.target;
//     const finalValue = type === 'number' ? (parseInt(value) || 0) : value;

//     setFormData(prev => ({
//       ...prev,
//       [name]: finalValue,
//       ...(name === 'student_name' && { slug: slugify(value) }) // auto slug
//     }));
//   };

//   const handleSave = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       if (formData.project_url && !formData.project_url.startsWith("http")) {
//         throw new Error("Project URL must start with http/https");
//       }

//       // Auto calculate overall
//       const overall =
//         (formData.theory_score +
//           formData.practical_score +
//           formData.problem_solving_score +
//           formData.creativity_score) / 4;

//       const payload = {
//         ...formData,
//         overall_score: Math.round(overall)
//       };

//       const { data, error } = await supabase
//         .from('student_results')
//         .insert([payload])
//         .select()
//         .single();

//       if (error) throw error;

//       const link = `${window.location.origin}/results/${data.slug}`;
//       alert(`✅ Saved Successfully!\n\nShare link:\n${link}`);

//       setFormData(initialState);

//     } catch (err) {
//       alert("Error: " + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow my-10 font-sans">
//       <div className="flex items-center gap-3 mb-6">
//         <div className="bg-indigo-100 p-2 rounded-lg">
//           <UserPlus className="text-indigo-600" />
//         </div>
//         <h1 className="text-xl font-bold text-gray-800">Enter Student Results</h1>
//       </div>

//       <form onSubmit={handleSave} className="space-y-6">
//         {/* BASIC INFO */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <Input label="Student Name" name="student_name" value={formData.student_name} onChange={handleChange} required placeholder="Full Name" />
//           <Input label="Grade/Class" name="grade_level" value={formData.grade_level} onChange={handleChange} placeholder="e.g. Grade 4" />
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <Input label="Course Name" name="course_name" value={formData.course_name} onChange={handleChange} />

//           {/* PERFORMANCE LABEL SELECTOR */}
//           <div>
//             <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Performance Label</label>
//             <select
//               name="performance_label"
//               value={formData.performance_label}
//               onChange={handleChange}
//               className="w-full p-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
//             >
//               <option value="Excellent">Excellent</option>
//               <option value="Above Average">Above Average</option>
//               <option value="Average">Average</option>
//               <option value="Satisfactory">Satisfactory</option>
//               <option value="Needs Improvement">Needs Improvement</option>
//             </select>
//           </div>
//         </div>

//         {/* EXAM & PROJECT */}
//         <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
//           <div className="flex items-center gap-2 font-bold text-sm text-gray-700">
//             <ClipboardList size={16} className="text-indigo-500" /> Exam Details
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <input name="exam_title" value={formData.exam_title} placeholder="Exam title (e.g. End of Term)" required onChange={handleChange} className="p-2 border rounded-lg text-sm outline-none" />
//             <input type="date" name="exam_date" value={formData.exam_date} onChange={handleChange} className="p-2 border rounded-lg text-sm outline-none" />
//           </div>

//           <div className="space-y-2">
//             <div className="flex gap-2 items-center bg-white p-2 border rounded-lg">
//               <Rocket size={16} className="text-orange-500" />
//               <input name="project_url" value={formData.project_url} onChange={handleChange} placeholder="Project URL (https://...)" className="w-full outline-none text-sm" />
//             </div>
//             <div className="flex gap-2 items-center bg-white p-2 border rounded-lg">
//               <Star size={16} className="text-yellow-500" />
//               <input name="performance_label" value={formData.performance_label} onChange={handleChange} placeholder="Project Badge (e.g. App Master)" className="w-full outline-none text-sm" />
//             </div>
//           </div>
//         </div>

//         {/* SCORES */}
//         <div>
//           <label className="text-xs font-bold text-gray-500 uppercase mb-3 block px-1">Subject Scores (%)</label>
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
//             <Score label="Theory" name="theory_score" value={formData.theory_score} onChange={handleChange} />
//             <Score label="Practical" name="practical_score" value={formData.practical_score} onChange={handleChange} />
//             <Score label="Logic" name="problem_solving_score" value={formData.problem_solving_score} onChange={handleChange} />
//             <Score label="Creative" name="creativity_score" value={formData.creativity_score} onChange={handleChange} />
//           </div>
//         </div>

//         {/* FEEDBACK */}
//         <div>
//           <label className="text-xs font-bold text-gray-500 uppercase mb-1 block px-1">Tutor Feedback</label>
//           <textarea
//             name="tutor_feedback"
//             value={formData.tutor_feedback}
//             onChange={handleChange}
//             placeholder="Write personalized feedback for the student..."
//             className="w-full p-3 border rounded-xl h-24 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
//           />
//         </div>

//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
//         >
//           {loading ? "Saving to Database..." : <><Save size={20} /> Save & Generate Report</>}
//         </button>
//       </form>
//     </div>
//   );
// };

// // Sub-components for cleaner code
// const Input = ({ label, ...props }) => (
//   <div className="flex flex-col">
//     <label className="text-xs font-bold text-gray-500 uppercase mb-1 px-1">{label}</label>
//     <input {...props} className="p-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
//   </div>
// );

// const Score = ({ label, ...props }) => (
//   <div className="flex flex-col text-center">
//     <label className="text-[10px] font-black text-indigo-400 uppercase mb-1">{label}</label>
//     <input
//       type="number"
//       min="0"
//       max="100"
//       {...props}
//       className="w-full p-2 border border-indigo-200 rounded-lg text-center font-bold text-indigo-700 outline-none focus:bg-white"
//     />
//   </div>
// );

// export default AdminEntryForm;
// // import React, { useState } from 'react';
// // import { supabase } from '../supabase';
// // import { Save, UserPlus, ClipboardList, Rocket } from 'lucide-react';

// // // 👉 helper: convert name → slug
// // const slugify = (name) =>
// //   name.toLowerCase().trim().replace(/\s+/g, '-');

// // const AdminEntryForm = () => {
// //   const [loading, setLoading] = useState(false);

// //   const initialState = {
// //     student_name: '',
// //     slug: '',
// //     grade_level: '',
// //     course_name: 'Scratch Programming',
// //     exam_title: '',
// //     exam_date: new Date().toISOString().split('T')[0],
// //     theory_score: 0,
// //     practical_score: 0,
// //     problem_solving_score: 0,
// //     creativity_score: 0,
// //     tutor_feedback: '',
// //     project_url: '',
// //     project_label: ''
// //   };

// //   const [formData, setFormData] = useState(initialState);

// //   const handleChange = (e) => {
// //     const { name, value, type } = e.target;
// //     const finalValue = type === 'number' ? (parseInt(value) || 0) : value;

// //     setFormData(prev => ({
// //       ...prev,
// //       [name]: finalValue,
// //       ...(name === 'student_name' && { slug: slugify(value) }) // auto slug
// //     }));
// //   };

// //   const handleSave = async (e) => {
// //     e.preventDefault();
// //     setLoading(true);

// //     try {
// //       // ✅ Validate URL
// //       if (formData.project_url && !formData.project_url.startsWith("http")) {
// //         throw new Error("Project URL must start with http/https");
// //       }

// //       // ✅ Auto calculate overall
// //       const overall =
// //         (formData.theory_score +
// //           formData.practical_score +
// //           formData.problem_solving_score +
// //           formData.creativity_score) / 4;

// //       const payload = {
// //         ...formData,
// //         overall_score: Math.round(overall)
// //       };

// //       const { data, error } = await supabase
// //         .from('student_results')
// //         .insert([payload])
// //         .select()
// //         .single();

// //       if (error) throw error;

// //       const link = `${window.location.origin}/results/${data.slug}`;

// //       alert(`✅ Saved!\n\nShare this link:\n${link}`);

// //       setFormData(initialState);

// //     } catch (err) {
// //       alert("Error: " + err.message);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow my-10">
// //       <div className="flex items-center gap-3 mb-6">
// //         <UserPlus className="text-indigo-600" />
// //         <h1 className="text-xl font-bold">Enter Student Results</h1>
// //       </div>

// //       <form onSubmit={handleSave} className="space-y-6">

// //         {/* BASIC */}
// //         <div className="grid grid-cols-2 gap-4">
// //           <Input label="Student Name" name="student_name" value={formData.student_name} onChange={handleChange} required />
// //           <Input label="Grade Level" name="grade_level" value={formData.grade_level} onChange={handleChange} />
// //         </div>

// //         {/* EXAM */}
// //         <div className="bg-gray-50 p-4 rounded-lg space-y-3">
// //           <div className="flex items-center gap-2 font-bold text-sm">
// //             <ClipboardList size={16} /> Exam
// //           </div>

// //           <div className="grid grid-cols-2 gap-4">
// //             <input name="exam_title" placeholder="Exam title" required onChange={handleChange} className="input" />
// //             <input type="date" name="exam_date" value={formData.exam_date} onChange={handleChange} className="input" />
// //           </div>

// //           <div className="flex gap-2 items-center bg-white p-2 border rounded">
// //             <Rocket size={16} />
// //             <input name="project_url" value={formData.project_url} onChange={handleChange} placeholder="Project URL" className="w-full outline-none text-sm" />
// //           </div>
// //         </div>

// //         {/* SCORES */}
// //         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-indigo-50 p-4 rounded">
// //           <Score label="Theory" name="theory_score" value={formData.theory_score} onChange={handleChange} />
// //           <Score label="Practical" name="practical_score" value={formData.practical_score} onChange={handleChange} />
// //           <Score label="Logic" name="problem_solving_score" value={formData.problem_solving_score} onChange={handleChange} />
// //           <Score label="Creative" name="creativity_score" value={formData.creativity_score} onChange={handleChange} />
// //         </div>

// //         {/* FEEDBACK */}
// //         <textarea name="tutor_feedback" value={formData.tutor_feedback} onChange={handleChange} placeholder="Feedback..." className="w-full p-3 border rounded" />

// //         <button disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded font-bold">
// //           {loading ? "Saving..." : <><Save size={16} /> Save</>}
// //         </button>
// //       </form>
// //     </div>
// //   );
// // };

// // const Input = ({ label, ...props }) => (
// //   <div>
// //     <label className="text-sm">{label}</label>
// //     <input {...props} className="w-full p-2 border rounded" />
// //   </div>
// // );

// // const Score = ({ label, ...props }) => (
// //   <div>
// //     <label className="text-xs">{label}</label>
// //     <input type="number" min="0" max="100" {...props} className="w-full p-2 border rounded" />
// //   </div>
// // );

// // export default AdminEntryForm;
