import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Plus, Trash2, BookOpen, Layers, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate } from 'react-router-dom'

export default function AdminNotesManager() {
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [notes, setNotes] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  const [newCourse, setNewCourse] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  const [status, setStatus] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const showStatus = (type, msg) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus({ type: "", msg: "" }), 4000);
  };

  const fetchCourses = async () => {
    const { data } = await supabase.from("courses").select("*").order("title");
    setCourses(data || []);
  };

  const fetchTopics = async (courseId) => {
    if (!courseId) return;
    const { data } = await supabase.from("topics").select("*").eq("course_id", courseId).order("title");
    setTopics(data || []);
  };

  const fetchNotes = async (topicId) => {
    if (!topicId) return;
    const { data } = await supabase.from("notes").select("*").eq("topic_id", topicId).order("created_at");
    setNotes(data || []);
  };

  const handleCreateCourse = async () => {
    if (!newCourse) return;
    const { error } = await supabase.from("courses").insert([{ title: newCourse }]);
    if (error) return showStatus("error", "Failed to create course.");
    setNewCourse("");
    fetchCourses();
    showStatus("success", "Course created!");
  };

  const handleCreateTopic = async () => {
    if (!newTopic || !selectedCourse) return;
    const { error } = await supabase.from("topics").insert([{ title: newTopic, course_id: selectedCourse }]);
    if (error) return showStatus("error", "Failed to create topic.");
    setNewTopic("");
    fetchTopics(selectedCourse);
    showStatus("success", "Topic created!");
  };

  const handleUploadNote = async () => {
    if (!noteTitle || !noteContent || !selectedTopic) {
      return showStatus("error", "Fill all note fields.");
    }

    setLoading(true);
    // Explicitly mapping to your DB columns
    const { error } = await supabase.from("notes").insert([
      {
        title: noteTitle,
        content: noteContent,
        topic_id: selectedTopic,
        course_id: selectedCourse // Ensure you ran the SQL ALTER TABLE command above
      },
    ]);

    if (error) {
      console.error("Supabase Upload Error:", error);
      showStatus("error", `Error: ${error.message}`);
    } else {
      setNoteTitle("");
      setNoteContent("");
      fetchNotes(selectedTopic);
      showStatus("success", "Note published!");
    }
    setLoading(false);
  };

  const deleteNote = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (!error) fetchNotes(selectedTopic);
  };

  return (
    <div className="max-w mx-auto p-4 md:p-8 bg-gray-900 min-h-screen text-gray-100">

      <header className="mb-10 border-b border-gray-800 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/:role`)}
            className="px-3 py-2 bg--200 hover:bg-indigo-400 rounded-xl font-bold text-sm"
          >
            ← Back
          </button>
          <h6 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Curriculum Builder
          </h6>
        </div>
        <p className="text-gray-400 mt-2 text-lg">Create courses, add topics, and publish markdown notes.</p>
      </header>

      {status.msg && (
        <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${status.type === "error" ? "bg-red-500/10 text-red-400 border border-red-500/50" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/50"
          }`}>
          {status.type === "error" ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          <span className="font-bold">{status.msg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Hierarchy Setup */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-3xl backdrop-blur-sm">
            <h2 className="flex items-center gap-2 font-black text-indigo-400 mb-4 uppercase text-xs tracking-widest">
              Step 1: Course Selection
            </h2>
            <div className="flex gap-2 mb-4">
              <input
                value={newCourse}
                onChange={(e) => setNewCourse(e.target.value)}
                placeholder="New course title..."
                className="flex-1 bg-gray-950 border border-gray-700 p-3 rounded-xl focus:ring-2 ring-indigo-500 outline-none transition-all"
              />
              <button onClick={handleCreateCourse} className="bg-indigo-600 hover:bg-indigo-500 p-3 rounded-xl transition shadow-lg shadow-indigo-900/20">
                <Plus size={20} />
              </button>
            </div>
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                fetchTopics(e.target.value);
                setSelectedTopic("");
                setNotes([]);
              }}
              className="w-full bg-gray-950 border border-gray-700 p-3 rounded-xl text-gray-200 outline-none cursor-pointer hover:border-gray-600 transition"
            >
              <option value="">-- Choose Course --</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>

          <div className={`bg-gray-800/50 border border-gray-700 p-6 rounded-3xl transition-all duration-500 ${!selectedCourse ? 'opacity-30 pointer-events-none scale-95' : 'opacity-100'}`}>
            <h2 className="flex items-center gap-2 font-black text-emerald-400 mb-4 uppercase text-xs tracking-widest">
              Step 2: Topic Selection
            </h2>
            <div className="flex gap-2 mb-4">
              <input
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="New topic title..."
                className="flex-1 bg-gray-950 border border-gray-700 p-3 rounded-xl focus:ring-2 ring-emerald-500 outline-none transition-all"
              />
              <button onClick={handleCreateTopic} className="bg-emerald-600 hover:bg-emerald-500 p-3 rounded-xl transition shadow-lg shadow-emerald-900/20">
                <Plus size={20} />
              </button>
            </div>
            <select
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(e.target.value);
                fetchNotes(e.target.value);
              }}
              className="w-full bg-gray-950 border border-gray-700 p-3 rounded-xl text-gray-200 outline-none cursor-pointer hover:border-gray-600 transition"
            >
              <option value="">-- Choose Topic --</option>
              {topics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
        </div>

        {/* Right Column - Note Editor */}
        <div className={`lg:col-span-8 space-y-6 transition-all duration-500 ${!selectedTopic ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
          <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-3xl backdrop-blur-sm">
            <h2 className="flex items-center gap-2 font-black text-purple-400 mb-6 uppercase text-xs tracking-widest">
              Step 3: Content Editor (Markdown)
            </h2>
            <div className="space-y-4">
              <input
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Lesson Title (e.g. Introduction to Hooks)"
                className="w-full bg-gray-950 border border-gray-700 p-4 rounded-2xl text-xl font-bold focus:ring-2 ring-purple-500 outline-none transition-all"
              />
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="# Use Markdown! &#10;## Headers &#10;```javascript &#10; const code = 'blocks'; &#10;```"
                rows={12}
                className="w-full bg-gray-950 border border-gray-700 p-4 rounded-2xl outline-none focus:ring-2 ring-purple-500 font-mono text-sm leading-relaxed"
              />
              <button
                disabled={loading}
                onClick={handleUploadNote}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-4 rounded-2xl font-black text-lg transition shadow-xl shadow-indigo-900/20 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <FileText />}
                {loading ? "Publishing..." : "Publish Lesson"}
              </button>
            </div>
          </div>

          {/* Note List Container */}
          {notes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {notes.map((note) => (
                <div key={note.id} className="flex justify-between items-center bg-gray-800/80 border border-gray-700 p-4 rounded-2xl group hover:border-indigo-500/50 transition-all">
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <span className="font-bold truncate">{note.title}</span>
                  </div>
                  <button onClick={() => deleteNote(note.id)} className="text-gray-500 hover:text-red-400 p-2 transition opacity-0 group-hover:opacity-100">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// import React, { useEffect, useState } from "react";
// import { supabase } from "../supabase";
// import { Plus, Trash2, BookOpen, Layers, FileText, CheckCircle, AlertCircle } from "lucide-react";

// export default function AdminNotesManager() {
//   const [courses, setCourses] = useState([]);
//   const [topics, setTopics] = useState([]);
//   const [notes, setNotes] = useState([]);

//   const [selectedCourse, setSelectedCourse] = useState("");
//   const [selectedTopic, setSelectedTopic] = useState("");

//   const [newCourse, setNewCourse] = useState("");
//   const [newTopic, setNewTopic] = useState("");
//   const [noteTitle, setNoteTitle] = useState("");
//   const [noteContent, setNoteContent] = useState("");

//   const [status, setStatus] = useState({ type: "", msg: "" });
//   const [loading, setLoading] = useState(false);

//   // --- Initial Fetch ---
//   useEffect(() => {
//     fetchCourses();
//   }, []);

//   const showStatus = (type, msg) => {
//     setStatus({ type, msg });
//     setTimeout(() => setStatus({ type: "", msg: "" }), 4000);
//   };

//   const fetchCourses = async () => {
//     const { data } = await supabase.from("courses").select("*").order("title");
//     setCourses(data || []);
//   };

//   const fetchTopics = async (courseId) => {
//     if (!courseId) return;
//     const { data } = await supabase.from("topics").select("*").eq("course_id", courseId).order("title");
//     setTopics(data || []);
//   };

//   const fetchNotes = async (topicId) => {
//     if (!topicId) return;
//     const { data } = await supabase.from("notes").select("*").eq("topic_id", topicId).order("created_at");
//     setNotes(data || []);
//   };

//   // --- Creation Logic ---
//   const handleCreateCourse = async () => {
//     if (!newCourse) return;
//     const { error } = await supabase.from("courses").insert([{ title: newCourse }]);
//     if (error) return showStatus("error", "Failed to create course.");
//     setNewCourse("");
//     fetchCourses();
//     showStatus("success", "Course created!");
//   };

//   const handleCreateTopic = async () => {
//     if (!newTopic || !selectedCourse) return;
//     const { error } = await supabase.from("topics").insert([{ title: newTopic, course_id: selectedCourse }]);
//     if (error) return showStatus("error", "Failed to create topic.");
//     setNewTopic("");
//     fetchTopics(selectedCourse);
//     showStatus("success", "Topic created!");
//   };

//   const handleUploadNote = async () => {
//     if (!noteTitle || !noteContent || !selectedTopic) {
//       return showStatus("error", "Fill all note fields.");
//     }
//     setLoading(true);
//     const { error } = await supabase.from("notes").insert([
//       {
//         title: noteTitle,
//         content: noteContent,
//         topic_id: selectedTopic,
//         course_id: selectedCourse // Useful for quick filtering later
//       },
//     ]);

//     if (error) {
//       showStatus("error", "Failed to upload note.");
//     } else {
//       setNoteTitle("");
//       setNoteContent("");
//       fetchNotes(selectedTopic);
//       showStatus("success", "Note uploaded successfully!");
//     }
//     setLoading(false);
//   };

//   const deleteNote = async (id) => {
//     if (!window.confirm("Delete this note?")) return;
//     await supabase.from("notes").delete().eq("id", id);
//     fetchNotes(selectedTopic);
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-gray-900 min-h-screen text-gray-100 font-sans">
//       <header className="mb-8 border-b border-gray-800 pb-4">
//         <h1 className="text-3xl font-black text-indigo-400">Notes Management Hub</h1>
//         <p className="text-gray-400">Build your curriculum hierarchy: Course → Topic → Note</p>
//       </header>

//       {status.msg && (
//         <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-bounce ${status.type === "error" ? "bg-red-900/50 text-red-200 border border-red-700" : "bg-green-900/50 text-green-200 border border-green-700"
//           }`}>
//           {status.type === "error" ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
//           {status.msg}
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

//         {/* LEFT COLUMN: Setup Structure */}
//         <div className="space-y-8">

//           {/* Step 1: Courses */}
//           <section className="bg-gray-800 p-5 rounded-2xl shadow-xl">
//             <h2 className="flex items-center gap-2 font-bold mb-4 text-indigo-300">
//               <BookOpen size={18} /> 1. Manage Courses
//             </h2>
//             <div className="flex gap-2">
//               <input
//                 value={newCourse}
//                 onChange={(e) => setNewCourse(e.target.value)}
//                 placeholder="Ex: React Mastery"
//                 className="flex-1 bg-gray-900 border border-gray-700 p-2 rounded-lg outline-none focus:border-indigo-500"
//               />
//               <button onClick={handleCreateCourse} className="bg-indigo-600 hover:bg-indigo-700 p-2 rounded-lg transition">
//                 <Plus />
//               </button>
//             </div>
//             <select
//               value={selectedCourse}
//               onChange={(e) => {
//                 setSelectedCourse(e.target.value);
//                 fetchTopics(e.target.value);
//                 setSelectedTopic("");
//                 setNotes([]);
//               }}
//               className="w-full mt-4 bg-gray-900 border border-gray-700 p-2 rounded-lg text-gray-300"
//             >
//               <option value="">Select a Course to manage topics</option>
//               {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
//             </select>
//           </section>

//           {/* Step 2: Topics */}
//           <section className={`bg-gray-800 p-5 rounded-2xl shadow-xl transition-opacity ${!selectedCourse && 'opacity-50'}`}>
//             <h2 className="flex items-center gap-2 font-bold mb-4 text-green-300">
//               <Layers size={18} /> 2. Manage Topics
//             </h2>
//             <div className="flex gap-2">
//               <input
//                 disabled={!selectedCourse}
//                 value={newTopic}
//                 onChange={(e) => setNewTopic(e.target.value)}
//                 placeholder="Ex: State Management"
//                 className="flex-1 bg-gray-900 border border-gray-700 p-2 rounded-lg outline-none focus:border-green-500 disabled:cursor-not-allowed"
//               />
//               <button disabled={!selectedCourse} onClick={handleCreateTopic} className="bg-green-600 hover:bg-green-700 p-2 rounded-lg transition disabled:bg-gray-700">
//                 <Plus />
//               </button>
//             </div>
//             <select
//               disabled={!selectedCourse}
//               value={selectedTopic}
//               onChange={(e) => {
//                 setSelectedTopic(e.target.value);
//                 fetchNotes(e.target.value);
//               }}
//               className="w-full mt-4 bg-gray-900 border border-gray-700 p-2 rounded-lg text-gray-300 disabled:cursor-not-allowed"
//             >
//               <option value="">Select a Topic to add notes</option>
//               {topics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
//             </select>
//           </section>
//         </div>

//         {/* RIGHT COLUMN: Note Content */}
//         <div className="space-y-8">
//           <section className={`bg-gray-800 p-5 rounded-2xl shadow-xl transition-opacity ${!selectedTopic && 'opacity-50'}`}>
//             <h2 className="flex items-center gap-2 font-bold mb-4 text-purple-300">
//               <FileText size={18} /> 3. Create Note (Markdown)
//             </h2>
//             <div className="space-y-3">
//               <input
//                 disabled={!selectedTopic}
//                 value={noteTitle}
//                 onChange={(e) => setNoteTitle(e.target.value)}
//                 placeholder="Note Title"
//                 className="w-full bg-gray-900 border border-gray-700 p-2 rounded-lg outline-none focus:border-purple-500"
//               />
//               <textarea
//                 disabled={!selectedTopic}
//                 value={noteContent}
//                 onChange={(e) => setNoteContent(e.target.value)}
//                 placeholder="Paste your Markdown here... Use # for headers, ``` for code."
//                 rows={10}
//                 className="w-full bg-gray-900 border border-gray-700 p-2 rounded-lg outline-none focus:border-purple-500 font-mono text-sm"
//               />
//               <button
//                 disabled={!selectedTopic || loading}
//                 onClick={handleUploadNote}
//                 className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-xl font-black transition disabled:bg-gray-700"
//               >
//                 {loading ? "Uploading..." : "Publish Note"}
//               </button>
//             </div>
//           </section>

//           {/* List of Existing Notes */}
//           {notes.length > 0 && (
//             <div className="space-y-2">
//               <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 px-2">Published in this topic</h3>
//               {notes.map((note) => (
//                 <div key={note.id} className="flex justify-between items-center bg-gray-800 border border-gray-700 p-3 rounded-xl hover:border-gray-500 transition">
//                   <span className="font-medium">{note.title}</span>
//                   <button onClick={() => deleteNote(note.id)} className="text-red-500 hover:bg-red-900/30 p-2 rounded-lg">
//                     <Trash2 size={18} />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
// import React, { useState, useEffect } from "react";
// import { supabase } from "../supabase";

// export default function UploadNote() {
//   const [courses, setCourses] = useState([]);
//   const [topics, setTopics] = useState([]);
//   const [selectedCourse, setSelectedCourse] = useState("");
//   const [selectedTopic, setSelectedTopic] = useState("");
//   const [noteTitle, setNoteTitle] = useState("");
//   const [content, setContent] = useState("");
//   const [status, setStatus] = useState("");

//   // ===============================
//   // FETCH COURSES
//   // ===============================
//   useEffect(() => {
//     const fetchCourses = async () => {
//       const { data, error } = await supabase
//         .from("courses")
//         .select("id, title");

//       if (error) {
//         console.error(error);
//         return;
//       }

//       setCourses(data || []);
//     };

//     fetchCourses();
//   }, []);

//   // ===============================
//   // FETCH TOPICS (FILTERED)
//   // ===============================
//   useEffect(() => {
//     if (!selectedCourse) {
//       setTopics([]);
//       setSelectedTopic("");
//       return;
//     }

//     const fetchTopics = async () => {
//       const { data, error } = await supabase
//         .from("topics")
//         .select("id, title, course_id")
//         .eq("course_id", selectedCourse);

//       if (error) {
//         console.error(error);
//         return;
//       }

//       setTopics(data || []);
//     };

//     fetchTopics();
//   }, [selectedCourse]);

//   // ===============================
//   // UPLOAD NOTE
//   // ===============================
//   const handleUpload = async (e) => {
//     e.preventDefault();

//     if (!selectedCourse || !selectedTopic || !noteTitle || !content) {
//       setStatus("⚠️ Fill all fields.");
//       return;
//     }

//     const noteId = noteTitle.toLowerCase().replace(/\s+/g, "_");

//     const { error } = await supabase.from("notes").insert([
//       {
//         id: noteId,
//         course_id: selectedCourse,
//         topic_id: selectedTopic,
//         title: noteTitle,
//         content,
//         created_at: new Date(),
//       },
//     ]);

//     if (error) {
//       console.error(error);
//       setStatus("❌ Failed to upload note.");
//     } else {
//       setStatus("✅ Note uploaded successfully!");
//       setNoteTitle("");
//       setContent("");
//       setSelectedTopic("");
//     }
//   };

//   // ===============================
//   // UI (UNCHANGED)
//   // ===============================
//   return (
//     <div className="p-6 max-w-md mx-auto bg-background dark:bg-gray-900 rounded-lg shadow-card transition-colors">
//       <h2 className="text-xl font-bold mb-4 text-text dark:text-gray-100">
//         Upload a New Note
//       </h2>

//       <form onSubmit={handleUpload} className="flex flex-col gap-3">
//         <select
//           value={selectedCourse}
//           onChange={(e) => setSelectedCourse(e.target.value)}
//           className="p-2 border rounded dark:bg-gray-800 dark:text-white"
//         >
//           <option value="">Select Course</option>
//           {courses.map((c) => (
//             <option key={c.id} value={c.id}>
//               {c.title}
//             </option>
//           ))}
//         </select>

//         <select
//           value={selectedTopic}
//           onChange={(e) => setSelectedTopic(e.target.value)}
//           className="p-2 border rounded dark:bg-gray-800 dark:text-white"
//           disabled={!selectedCourse}
//         >
//           <option value="">Select Topic</option>
//           {topics.map((t) => (
//             <option key={t.id} value={t.id}>
//               {t.title}
//             </option>
//           ))}
//         </select>

//         <input
//           type="text"
//           placeholder="Note Title"
//           value={noteTitle}
//           onChange={(e) => setNoteTitle(e.target.value)}
//           className="p-2 border rounded dark:bg-gray-800 dark:text-white"
//         />

//         <textarea
//           placeholder="Content"
//           rows="6"
//           value={content}
//           onChange={(e) => setContent(e.target.value)}
//           className="p-2 border rounded dark:bg-gray-800 dark:text-white"
//         />

//         <button
//           type="submit"
//           className="bg-primary text-white py-2 rounded"
//         >
//           Upload Note
//         </button>
//       </form>

//       {status && (
//         <p className="mt-3 text-sm dark:text-gray-300">{status}</p>
//       )}
//     </div>
//   );
// }
// // import React, { useEffect, useState } from "react";
// // import { supabase } from "../supabase";

// // export default function AdminNotesManager() {
// //   const [courses, setCourses] = useState([]);
// //   const [topics, setTopics] = useState([]);
// //   const [selectedCourse, setSelectedCourse] = useState("");
// //   const [selectedTopic, setSelectedTopic] = useState("");

// //   const [newCourse, setNewCourse] = useState("");
// //   const [newTopic, setNewTopic] = useState("");
// //   const [noteTitle, setNoteTitle] = useState("");
// //   const [noteContent, setNoteContent] = useState("");

// //   const [notes, setNotes] = useState([]);

// //   // Fetch Courses
// //   useEffect(() => {
// //     fetchCourses();
// //   }, []);

// //   const fetchCourses = async () => {
// //     const { data } = await supabase.from("courses").select("*");
// //     setCourses(data || []);
// //   };

// //   const fetchTopics = async (courseId) => {
// //     const { data } = await supabase
// //       .from("topics")
// //       .select("*")
// //       .eq("course_id", courseId);

// //     setTopics(data || []);
// //   };

// //   const fetchNotes = async (topicId) => {
// //     const { data } = await supabase
// //       .from("notes")
// //       .select("*")
// //       .eq("topic_id", topicId);

// //     setNotes(data || []);
// //   };

// //   // Create Course
// //   const createCourse = async () => {
// //     if (!newCourse) return;

// //     await supabase.from("courses").insert([{ title: newCourse }]);
// //     setNewCourse("");
// //     fetchCourses();
// //   };

// //   // Create Topic
// //   const createTopic = async () => {
// //     if (!newTopic || !selectedCourse) return;

// //     await supabase.from("topics").insert([
// //       { title: newTopic, course_id: selectedCourse },
// //     ]);

// //     setNewTopic("");
// //     fetchTopics(selectedCourse);
// //   };

// //   // Upload Note
// //   const uploadNote = async () => {
// //     if (!noteTitle || !noteContent || !selectedTopic) return;

// //     await supabase.from("notes").insert([
// //       {
// //         title: noteTitle,
// //         content: noteContent,
// //         topic_id: selectedTopic,
// //       },
// //     ]);

// //     setNoteTitle("");
// //     setNoteContent("");
// //     fetchNotes(selectedTopic);
// //   };

// //   // Delete Note
// //   const deleteNote = async (id) => {
// //     await supabase.from("notes").delete().eq("id", id);
// //     fetchNotes(selectedTopic);
// //   };

// //   return (
// //     <div className="p-6 bg-gray-900 text-white rounded-xl space-y-6">

// //       <h2 className="text-2xl font-bold">Admin Notes Manager</h2>

// //       {/* Create Course */}
// //       <div className="space-y-2">
// //         <input
// //           value={newCourse}
// //           onChange={(e) => setNewCourse(e.target.value)}
// //           placeholder="New Course Name"
// //           className="p-2 rounded bg-gray-800 w-full"
// //         />
// //         <button onClick={createCourse} className="bg-blue-600 px-4 py-2 rounded">
// //           Create Course
// //         </button>
// //       </div>

// //       {/* Select Course */}
// //       <select
// //         value={selectedCourse}
// //         onChange={(e) => {
// //           setSelectedCourse(e.target.value);
// //           fetchTopics(e.target.value);
// //         }}
// //         className="p-2 rounded bg-gray-800 w-full"
// //       >
// //         <option value="">Select Course</option>
// //         {courses.map((c) => (
// //           <option key={c.id} value={c.id}>
// //             {c.title}
// //           </option>
// //         ))}
// //       </select>

// //       {/* Create Topic */}
// //       {selectedCourse && (
// //         <div className="space-y-2">
// //           <input
// //             value={newTopic}
// //             onChange={(e) => setNewTopic(e.target.value)}
// //             placeholder="New Topic Name"
// //             className="p-2 rounded bg-gray-800 w-full"
// //           />
// //           <button onClick={createTopic} className="bg-green-600 px-4 py-2 rounded">
// //             Create Topic
// //           </button>
// //         </div>
// //       )}

// //       {/* Select Topic */}
// //       {selectedCourse && (
// //         <select
// //           value={selectedTopic}
// //           onChange={(e) => {
// //             setSelectedTopic(e.target.value);
// //             fetchNotes(e.target.value);
// //           }}
// //           className="p-2 rounded bg-gray-800 w-full"
// //         >
// //           <option value="">Select Topic</option>
// //           {topics.map((t) => (
// //             <option key={t.id} value={t.id}>
// //               {t.title}
// //             </option>
// //           ))}
// //         </select>
// //       )}

// //       {/* Upload Note */}
// //       {selectedTopic && (
// //         <div className="space-y-2">
// //           <input
// //             value={noteTitle}
// //             onChange={(e) => setNoteTitle(e.target.value)}
// //             placeholder="Note Title"
// //             className="p-2 rounded bg-gray-800 w-full"
// //           />
// //           <textarea
// //             value={noteContent}
// //             onChange={(e) => setNoteContent(e.target.value)}
// //             placeholder="Write Markdown Content Here..."
// //             rows={8}
// //             className="p-2 rounded bg-gray-800 w-full"
// //           />
// //           <button onClick={uploadNote} className="bg-purple-600 px-4 py-2 rounded">
// //             Upload Note
// //           </button>
// //         </div>
// //       )}

// //       {/* Notes List */}
// //       {notes.length > 0 && (
// //         <div className="space-y-2">
// //           <h3 className="text-lg font-semibold">Existing Notes</h3>
// //           {notes.map((note) => (
// //             <div
// //               key={note.id}
// //               className="flex justify-between bg-gray-800 p-3 rounded"
// //             >
// //               <span>{note.title}</span>
// //               <button
// //                 onClick={() => deleteNote(note.id)}
// //                 className="text-red-400"
// //               >
// //                 Delete
// //               </button>
// //             </div>
// //           ))}
// //         </div>
// //       )}
// //     </div>
// //   );
// // }