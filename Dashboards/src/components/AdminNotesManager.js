import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function UploadNote() {
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("");

  // ===============================
  // FETCH COURSES
  // ===============================
  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title");

      if (error) {
        console.error(error);
        return;
      }

      setCourses(data || []);
    };

    fetchCourses();
  }, []);

  // ===============================
  // FETCH TOPICS (FILTERED)
  // ===============================
  useEffect(() => {
    if (!selectedCourse) {
      setTopics([]);
      setSelectedTopic("");
      return;
    }

    const fetchTopics = async () => {
      const { data, error } = await supabase
        .from("topics")
        .select("id, title, course_id")
        .eq("course_id", selectedCourse);

      if (error) {
        console.error(error);
        return;
      }

      setTopics(data || []);
    };

    fetchTopics();
  }, [selectedCourse]);

  // ===============================
  // UPLOAD NOTE
  // ===============================
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedCourse || !selectedTopic || !noteTitle || !content) {
      setStatus("⚠️ Fill all fields.");
      return;
    }

    const noteId = noteTitle.toLowerCase().replace(/\s+/g, "_");

    const { error } = await supabase.from("notes").insert([
      {
        id: noteId,
        course_id: selectedCourse,
        topic_id: selectedTopic,
        title: noteTitle,
        content,
        created_at: new Date(),
      },
    ]);

    if (error) {
      console.error(error);
      setStatus("❌ Failed to upload note.");
    } else {
      setStatus("✅ Note uploaded successfully!");
      setNoteTitle("");
      setContent("");
      setSelectedTopic("");
    }
  };

  // ===============================
  // UI (UNCHANGED)
  // ===============================
  return (
    <div className="p-6 max-w-md mx-auto bg-background dark:bg-gray-900 rounded-lg shadow-card transition-colors">
      <h2 className="text-xl font-bold mb-4 text-text dark:text-gray-100">
        Upload a New Note
      </h2>

      <form onSubmit={handleUpload} className="flex flex-col gap-3">
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="p-2 border rounded dark:bg-gray-800 dark:text-white"
        >
          <option value="">Select Course</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>

        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="p-2 border rounded dark:bg-gray-800 dark:text-white"
          disabled={!selectedCourse}
        >
          <option value="">Select Topic</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Note Title"
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          className="p-2 border rounded dark:bg-gray-800 dark:text-white"
        />

        <textarea
          placeholder="Content"
          rows="6"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="p-2 border rounded dark:bg-gray-800 dark:text-white"
        />

        <button
          type="submit"
          className="bg-primary text-white py-2 rounded"
        >
          Upload Note
        </button>
      </form>

      {status && (
        <p className="mt-3 text-sm dark:text-gray-300">{status}</p>
      )}
    </div>
  );
}
// import React, { useEffect, useState } from "react";
// import { supabase } from "../supabase";

// export default function AdminNotesManager() {
//   const [courses, setCourses] = useState([]);
//   const [topics, setTopics] = useState([]);
//   const [selectedCourse, setSelectedCourse] = useState("");
//   const [selectedTopic, setSelectedTopic] = useState("");

//   const [newCourse, setNewCourse] = useState("");
//   const [newTopic, setNewTopic] = useState("");
//   const [noteTitle, setNoteTitle] = useState("");
//   const [noteContent, setNoteContent] = useState("");

//   const [notes, setNotes] = useState([]);

//   // Fetch Courses
//   useEffect(() => {
//     fetchCourses();
//   }, []);

//   const fetchCourses = async () => {
//     const { data } = await supabase.from("courses").select("*");
//     setCourses(data || []);
//   };

//   const fetchTopics = async (courseId) => {
//     const { data } = await supabase
//       .from("topics")
//       .select("*")
//       .eq("course_id", courseId);

//     setTopics(data || []);
//   };

//   const fetchNotes = async (topicId) => {
//     const { data } = await supabase
//       .from("notes")
//       .select("*")
//       .eq("topic_id", topicId);

//     setNotes(data || []);
//   };

//   // Create Course
//   const createCourse = async () => {
//     if (!newCourse) return;

//     await supabase.from("courses").insert([{ title: newCourse }]);
//     setNewCourse("");
//     fetchCourses();
//   };

//   // Create Topic
//   const createTopic = async () => {
//     if (!newTopic || !selectedCourse) return;

//     await supabase.from("topics").insert([
//       { title: newTopic, course_id: selectedCourse },
//     ]);

//     setNewTopic("");
//     fetchTopics(selectedCourse);
//   };

//   // Upload Note
//   const uploadNote = async () => {
//     if (!noteTitle || !noteContent || !selectedTopic) return;

//     await supabase.from("notes").insert([
//       {
//         title: noteTitle,
//         content: noteContent,
//         topic_id: selectedTopic,
//       },
//     ]);

//     setNoteTitle("");
//     setNoteContent("");
//     fetchNotes(selectedTopic);
//   };

//   // Delete Note
//   const deleteNote = async (id) => {
//     await supabase.from("notes").delete().eq("id", id);
//     fetchNotes(selectedTopic);
//   };

//   return (
//     <div className="p-6 bg-gray-900 text-white rounded-xl space-y-6">

//       <h2 className="text-2xl font-bold">Admin Notes Manager</h2>

//       {/* Create Course */}
//       <div className="space-y-2">
//         <input
//           value={newCourse}
//           onChange={(e) => setNewCourse(e.target.value)}
//           placeholder="New Course Name"
//           className="p-2 rounded bg-gray-800 w-full"
//         />
//         <button onClick={createCourse} className="bg-blue-600 px-4 py-2 rounded">
//           Create Course
//         </button>
//       </div>

//       {/* Select Course */}
//       <select
//         value={selectedCourse}
//         onChange={(e) => {
//           setSelectedCourse(e.target.value);
//           fetchTopics(e.target.value);
//         }}
//         className="p-2 rounded bg-gray-800 w-full"
//       >
//         <option value="">Select Course</option>
//         {courses.map((c) => (
//           <option key={c.id} value={c.id}>
//             {c.title}
//           </option>
//         ))}
//       </select>

//       {/* Create Topic */}
//       {selectedCourse && (
//         <div className="space-y-2">
//           <input
//             value={newTopic}
//             onChange={(e) => setNewTopic(e.target.value)}
//             placeholder="New Topic Name"
//             className="p-2 rounded bg-gray-800 w-full"
//           />
//           <button onClick={createTopic} className="bg-green-600 px-4 py-2 rounded">
//             Create Topic
//           </button>
//         </div>
//       )}

//       {/* Select Topic */}
//       {selectedCourse && (
//         <select
//           value={selectedTopic}
//           onChange={(e) => {
//             setSelectedTopic(e.target.value);
//             fetchNotes(e.target.value);
//           }}
//           className="p-2 rounded bg-gray-800 w-full"
//         >
//           <option value="">Select Topic</option>
//           {topics.map((t) => (
//             <option key={t.id} value={t.id}>
//               {t.title}
//             </option>
//           ))}
//         </select>
//       )}

//       {/* Upload Note */}
//       {selectedTopic && (
//         <div className="space-y-2">
//           <input
//             value={noteTitle}
//             onChange={(e) => setNoteTitle(e.target.value)}
//             placeholder="Note Title"
//             className="p-2 rounded bg-gray-800 w-full"
//           />
//           <textarea
//             value={noteContent}
//             onChange={(e) => setNoteContent(e.target.value)}
//             placeholder="Write Markdown Content Here..."
//             rows={8}
//             className="p-2 rounded bg-gray-800 w-full"
//           />
//           <button onClick={uploadNote} className="bg-purple-600 px-4 py-2 rounded">
//             Upload Note
//           </button>
//         </div>
//       )}

//       {/* Notes List */}
//       {notes.length > 0 && (
//         <div className="space-y-2">
//           <h3 className="text-lg font-semibold">Existing Notes</h3>
//           {notes.map((note) => (
//             <div
//               key={note.id}
//               className="flex justify-between bg-gray-800 p-3 rounded"
//             >
//               <span>{note.title}</span>
//               <button
//                 onClick={() => deleteNote(note.id)}
//                 className="text-red-400"
//               >
//                 Delete
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }