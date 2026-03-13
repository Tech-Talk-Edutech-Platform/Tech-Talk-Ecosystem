// import React, { useEffect, useState } from "react";
// import { supabase } from "../supabase";

// export default function NotesPanel({ tutorId }) {
//   const [courses, setCourses] = useState([]);
//   const [topics, setTopics] = useState([]);
//   const [selectedCourse, setSelectedCourse] = useState("");
//   const [selectedTopic, setSelectedTopic] = useState("");
//   const [notes, setNotes] = useState([]);

//   // Fetch all courses
//   useEffect(() => {
//     fetchCourses();
//   }, []);

//   const fetchCourses = async () => {
//     const { data } = await supabase.from("courses").select("*");
//     setCourses(data || []);
//   };

//   // Fetch topics for a course
//   const fetchTopics = async (courseId) => {
//     const { data } = await supabase
//       .from("topics")
//       .select("*")
//       .eq("course_id", courseId);

//     setTopics(data || []);
//   };

//   // Fetch notes for a topic
//   const fetchNotes = async (topicId) => {
//     const { data } = await supabase
//       .from("notes")
//       .select("*")
//       .eq("topic_id", topicId);
    
//     setNotes(data || []);
//   };

//   return (
//     <div className="p-6 bg-gray-900 text-white rounded-xl space-y-6">
//       <h2 className="text-2xl font-bold">Your Notes</h2>

//       {/* Select Course */}
//       <select
//         value={selectedCourse}
//         onChange={(e) => {
//           setSelectedCourse(e.target.value);
//           fetchTopics(e.target.value);
//           setSelectedTopic("");
//           setNotes([]);
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

//       {/* Notes List */}
//       {notes.length > 0 ? (
//         <div className="space-y-2">
//           <h3 className="text-lg font-semibold">Notes</h3>
//           {notes.map((note) => (
//             <div
//               key={note.id}
//               className="bg-gray-800 p-3 rounded space-y-1"
//             >
//               <p className="font-semibold">{note.title}</p>
//               <div className="text-sm whitespace-pre-wrap">{note.content}</div>
//             </div>
//           ))}
//         </div>
//       ) : selectedTopic ? (
//         <p className="text-gray-400">No notes available for this topic.</p>
//       ) : null}
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import ReactMarkdown from "react-markdown";

// Simple function to get badge color
const statusColor = (status) => {
  switch (status) {
    case "completed":
      return "bg-green-600";
    case "in-progress":
      return "bg-yellow-500";
    default:
      return "bg-red-500"; // pending
  }
};

export default function NotesDashboard({ tutorId }) {
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [notes, setNotes] = useState({});
  const [expandedTopics, setExpandedTopics] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const { data } = await supabase.from("courses").select("*");
    setCourses(data || []);
  };

  const fetchTopics = async (courseId) => {
    const { data } = await supabase
      .from("topics")
      .select("*")
      .eq("course_id", courseId);
    setTopics(data || []);
    setExpandedTopics({});
    setNotes({});
  };

  const fetchNotes = async (topicId) => {
    const { data } = await supabase
      .from("notes")
      .select("*")
      .eq("topic_id", topicId);
    setNotes((prev) => ({ ...prev, [topicId]: data || [] }));
  };

  const toggleTopic = (topicId) => {
    const isExpanded = expandedTopics[topicId];
    setExpandedTopics({ ...expandedTopics, [topicId]: !isExpanded });
    if (!isExpanded && !notes[topicId]) {
      fetchNotes(topicId);
    }
  };

  const filteredNotes = (topicId) =>
    notes[topicId]?.filter(
      (note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <div className="p-6 bg-gray-900 text-white rounded-2xl shadow-lg max-w-5xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
        Tutor Notes Dashboard
      </h2>

      {/* Course Selection */}
      <div className="space-y-2">
        <label className="font-medium text-gray-300">Select Course</label>
        <select
          onChange={(e) => fetchTopics(e.target.value)}
          className="w-full p-3 rounded-xl bg-gray-800 focus:ring-2 focus:ring-purple-500 outline-none transition"
        >
          <option value="">-- Choose a Course --</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {/* Search Bar */}
      {/* {topics.length > 0 && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 rounded-xl bg-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none transition"
          />
        </div>
      )} */}

      {/* Topics & Notes */}
      <div className="space-y-4">
        {topics.map((topic) => (
          <div key={topic.id} className="border border-gray-700 rounded-2xl overflow-hidden">
            <button
              onClick={() => toggleTopic(topic.id)}
              className="w-full text-left px-4 py-3 bg-gray-800 hover:bg-gray-700 flex justify-between items-center transition"
            >
              <span className="font-semibold text-purple-400">{topic.title}</span>
              <span>{expandedTopics[topic.id] ? "▲" : "▼"}</span>
            </button>

            {expandedTopics[topic.id] && (
              <div className="bg-gray-900 p-4 space-y-3">
                {filteredNotes(topic.id).length > 0 ? (
                  filteredNotes(topic.id).map((note) => (
                    <div
                      key={note.id}
                      className="bg-gray-800 rounded-2xl p-4 hover:bg-gray-700 transition-shadow shadow-md"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-purple-400">{note.title}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor(
                            note.status
                          )}`}
                        >
                          {note.status || "pending"}
                        </span>
                      </div>

                      {/* Optional tags if note.tags exists */}
                      {note.tags?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {note.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs bg-blue-600 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-2 text-gray-200 prose prose-invert max-w-none">
                        <ReactMarkdown>{note.content}</ReactMarkdown>
                      </div>

                      <p className="mt-2 text-sm text-gray-400 italic">
                        Created: {new Date(note.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No notes available for this topic.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
// // src/components/NotesPanel.js
// import React, { useEffect, useState } from "react";
// import { supabase } from "../supabase";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { materialDark, vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

// export default function NotesPanel({ userId, role, darkMode }) {
//   const [courses, setCourses] = useState([]);
//   const [selectedCourse, setSelectedCourse] = useState(null);
//   const [topics, setTopics] = useState([]);
//   const [selectedTopic, setSelectedTopic] = useState(null);
//   const [notes, setNotes] = useState([]);
//   const [selectedNote, setSelectedNote] = useState(null);
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // -------------------------
//   // Fetch courses (for student or tutor)
//   // -------------------------
//   useEffect(() => {
//     const fetchCourses = async () => {
//       setLoading(true);
//       if (role === "student") {
//         // Student sees only their course via enrollment
//         const { data: studentCourse } = await supabase
//           .from("students")
//           .select("id, full_name, grade, courses:course_id(*)")
//           .eq("id", userId)
//           .single();
//         if (studentCourse?.courses) setCourses([studentCourse.courses]);
//       } else if (role === "tutor") {
//         // Tutor sees all courses their students are enrolled in
//         const { data } = await supabase
//           .from("students")
//           .select("course_id")
//           .eq("assigned_tutor_id", userId)
//           .not("course_id", "is", null)
//           .distinct();
//         const courseIds = data.map((s) => s.course_id);
//         if (courseIds.length > 0) {
//           const { data: courseData } = await supabase
//             .from("courses")
//             .select("*")
//             .in("id", courseIds);
//           setCourses(courseData || []);
//         }
//       }
//       setLoading(false);
//     };
//     fetchCourses();
//   }, [userId, role]);

//   // -------------------------
//   // Fetch Topics when course selected
//   // -------------------------
//   useEffect(() => {
//     if (!selectedCourse) return;

//     const fetchTopics = async () => {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from("topics")
//         .select("*")
//         .eq("course_id", selectedCourse.id)
//         .order("created_at", { ascending: true });
//       if (!error) setTopics(data || []);
//       setLoading(false);
//     };

//     fetchTopics();
//   }, [selectedCourse]);

//   // -------------------------
//   // Fetch Notes when topic selected
//   // -------------------------
//   useEffect(() => {
//     if (!selectedTopic) return;

//     const fetchNotes = async () => {
//       setLoading(true);
//       let query = supabase
//         .from("notes")
//         .select("*")
//         .eq("topic_id", selectedTopic.id)
//         .order("created_at", { ascending: true });

//       const { data, error } = await query;
//       if (!error) setNotes(data || []);
//       setLoading(false);
//     };
//     fetchNotes();
//   }, [selectedTopic]);

//   // -------------------------
//   // Tutors: Fetch students for this course
//   // -------------------------
//   useEffect(() => {
//     if (role === "tutor" && selectedCourse) {
//       const fetchStudents = async () => {
//         const { data } = await supabase
//           .from("students")
//           .select("*")
//           .eq("assigned_tutor_id", userId)
//           .eq("course_id", selectedCourse.id);
//         setStudents(data || []);
//       };
//       fetchStudents();
//     }
//   }, [selectedCourse, userId, role]);

//   const openNote = (note) => setSelectedNote(note);

//   if (loading) return <p className="p-4 text-gray-500">Loading...</p>;

//   return (
//     <div className="p-4 h-full flex flex-col bg-background dark:bg-gray-900 rounded-lg overflow-y-auto transition-colors">
//       <h2 className="text-lg font-bold mb-4 text-text dark:text-gray-100">Notes</h2>

//       {/* 1️⃣ Select Course */}
//       {!selectedCourse && (
//         <div className="flex flex-col gap-2">
//           {courses.map((c) => (
//             <button
//               key={c.id}
//               onClick={() => {
//                 setSelectedCourse(c);
//                 setSelectedTopic(null);
//                 setSelectedNote(null);
//               }}
//               className="p-3 rounded-lg bg-primary dark:bg-accent shadow-card hover:bg-primary hover:text-white transition"
//             >
//               {c.title}
//             </button>
//           ))}
//           {courses.length === 0 && <p className="text-gray-500">No courses found</p>}
//         </div>
//       )}

//       {/* 2️⃣ Students List for Tutors */}
//       {role === "tutor" && selectedCourse && !selectedTopic && !selectedNote && (
//         <div className="space-y-2 mb-4">
//           <h3 className="font-bold">Your Students</h3>
//           {students.map((s) => (
//             <button
//               key={s.id}
//               onClick={() => setSelectedTopic({ id: s.course_id })}
//               className="p-2 rounded-lg bg-indigo-700 hover:bg-indigo-600"
//             >
//               {s.full_name} (Grade: {s.grade || "N/A"})
//             </button>
//           ))}
//           {students.length === 0 && <p>No students in this course</p>}
//         </div>
//       )}

//       {/* 3️⃣ Topics */}
//       {selectedCourse && !selectedNote && (
//         <div className="flex flex-col gap-2">
//           {topics.map((t) => (
//             <button
//               key={t.id}
//               onClick={() => setSelectedTopic(t)}
//               className="p-3 rounded-lg bg-primary dark:bg-accent shadow-card hover:bg-primary hover:text-white transition"
//             >
//               {t.title}
//             </button>
//           ))}
//           {topics.length === 0 && <p className="text-gray-500">No topics found for this course.</p>}
//           {selectedCourse && (
//             <button
//               onClick={() => setSelectedCourse(null)}
//               className="text-sm mt-2 text-primary hover:underline self-start"
//             >
//               ← Back to courses
//             </button>
//           )}
//         </div>
//       )}

//       {/* 4️⃣ Notes */}
//       {selectedTopic && !selectedNote && (
//         <div className="flex flex-col gap-2">
//           {notes.map((n) => (
//             <button
//               key={n.id}
//               onClick={() => openNote(n)}
//               className="p-3 rounded-lg bg-primary dark:bg-accent shadow-card hover:bg-primary hover:text-white transition"
//             >
//               {n.title}
//             </button>
//           ))}
//           {notes.length === 0 && <p>No notes found for this topic</p>}
//           <button
//             onClick={() => setSelectedTopic(null)}
//             className="text-sm mt-2 text-primary hover:underline self-start"
//           >
//             ← Back to topics
//           </button>
//         </div>
//       )}

//       {/* 5️⃣ Note Content */}
//       {selectedNote && (
//         <div className="flex flex-col h-full">
//           <button
//             onClick={() => setSelectedNote(null)}
//             className="mb-2 text-sm text-primary hover:underline self-start"
//           >
//             ← Back to notes
//           </button>

//           <h3 className="text-xl font-semibold mb-2 text-text dark:text-gray-100">{selectedNote.title}</h3>

//           <div
//             className={`prose dark:prose-invert max-w-full overflow-x-auto p-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100`}
//           >
//             <ReactMarkdown
//               remarkPlugins={[remarkGfm]}
//               components={{
//                 code({ inline, className, children, ...props }) {
//                   const match = /language-(\w+)/.exec(className || "");
//                   return !inline && match ? (
//                     <SyntaxHighlighter
//                       style={darkMode ? materialDark : vscDarkPlus}
//                       language={match[1]}
//                       PreTag="div"
//                       {...props}
//                     >
//                       {String(children).replace(/\n$/, "")}
//                     </SyntaxHighlighter>
//                   ) : (
//                     <code
//                       className="bg-gray-700 text-green-300 px-1 rounded font-mono"
//                       {...props}
//                     >
//                       {children}
//                     </code>
//                   );
//                 },
//               }}
//             >
//               {selectedNote.content}
//             </ReactMarkdown>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// // // src/components/NotesPanel.js
// // import React, { useEffect, useState } from "react";
// // import { supabase } from "../supabase";
// // import ReactMarkdown from "react-markdown";
// // import remarkGfm from "remark-gfm";
// // import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// // import { materialDark, vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

// // export default function NotesPanel({ darkMode, courseId }) {
// //   const [topics, setTopics] = useState([]);
// //   const [selectedTopic, setSelectedTopic] = useState(null);
// //   const [notes, setNotes] = useState([]);
// //   const [selectedNote, setSelectedNote] = useState(null);
// //   const [loading, setLoading] = useState(true);

// //   // Fetch Topics
// //   useEffect(() => {
// //     if (!courseId) return;

// //     const fetchTopics = async () => {
// //       setLoading(true);
// //       const { data, error } = await supabase
// //         .from("topics")
// //         .select("*")
// //         .eq("course_id", courseId)
// //         .order("created_at", { ascending: true });

// //       if (!error) setTopics(data);
// //       setLoading(false);
// //     };

// //     fetchTopics();
// //   }, [courseId]);
// // console.log("Course ID:", courseId);
// //   // Fetch Notes
// //   useEffect(() => {
// //     if (!selectedTopic) return;

// //     const fetchNotes = async () => {
// //       setLoading(true);
// //       const { data, error } = await supabase
// //         .from("notes")
// //         .select("*")
// //         .eq("topic_id", selectedTopic.id)
// //         .order("created_at", { ascending: true });

// //       if (!error) setNotes(data);
// //       setLoading(false);
// //     };

// //     fetchNotes();
// //   }, [selectedTopic]);

// //   const openNote = async (noteId) => {
// //     setLoading(true);

// //     const { data, error } = await supabase
// //       .from("notes")
// //       .select("*")
// //       .eq("id", noteId)
// //       .single();

// //     if (!error) setSelectedNote(data);

// //     setLoading(false);
// //   };

// //   if (loading && !selectedNote)
// //     return <p className="p-4 text-gray-500">Loading...</p>;

// //   return (
// //     <div className="p-4 h-full flex flex-col bg-background dark:bg-gray-900 rounded-lg overflow-y-auto transition-colors">
// //       <h2 className="text-lg font-bold mb-4 text-text dark:text-gray-100">
// //         Notes
// //       </h2>

// //       {/* Topics */}
// //       {!selectedTopic && !selectedNote && (
// //         <div className="flex flex-col gap-2">
// //           {topics.map((t) => (
// //             <button
// //               key={t.id}
// //               onClick={() => setSelectedTopic(t)}
// //               className="p-3 rounded-lg bg-primary dark:bg-accent shadow-card hover:bg-primary hover:text-white transition"
// //             >
// //               {t.title}
// //             </button>
// //           ))}
// //         </div>
// //       )}

// //       {/* Notes */}
// //       {selectedTopic && !selectedNote && (
// //         <div className="flex flex-col gap-2">
// //           <button
// //             onClick={() => setSelectedTopic(null)}
// //             className="mb-2 text-sm text-primary hover:underline self-start"
// //           >
// //             ← Back to topics
// //           </button>

// //           {notes.map((n) => (
// //             <button
// //               key={n.id}
// //               onClick={() => openNote(n.id)}
// //               className="p-3 rounded-lg bg-primary dark:bg-accent shadow-card hover:bg-primary hover:text-white transition"
// //             >
// //               {n.title}
// //             </button>
// //           ))}
// //         </div>
// //       )}
// //         {topics.length === 0 && (
// //   <p className="text-gray-500">No topics found for this course.</p>
// // )}
// //       {/* Note Content */}
// //       {selectedNote && (
// //         <div className="flex flex-col h-full">
// //           <button
// //             onClick={() => setSelectedNote(null)}
// //             className="mb-2 text-sm text-primary hover:underline self-start"
// //           >
// //             ← Back to notes
// //           </button>

// //           <h3 className="text-xl font-semibold mb-2 text-text dark:text-gray-100">
// //             {selectedNote.title}
// //           </h3>

// //           <div
// //             className={`prose dark:prose-invert max-w-full overflow-x-auto p-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100`}
// //           >
// //             <ReactMarkdown
// //               remarkPlugins={[remarkGfm]}
// //               components={{
// //                 code({ inline, className, children, ...props }) {
// //                   const match = /language-(\w+)/.exec(className || "");
// //                   return !inline && match ? (
// //                     <SyntaxHighlighter
// //                       style={darkMode ? materialDark : vscDarkPlus}
// //                       language={match[1]}
// //                       PreTag="div"
// //                       {...props}
// //                     >
// //                       {String(children).replace(/\n$/, "")}
// //                     </SyntaxHighlighter>
// //                   ) : (
// //                     <code
// //                       className="bg-gray-700 text-green-300 px-1 rounded font-mono"
// //                       {...props}
// //                     >
// //                       {children}
// //                     </code>
// //                   );
// //                 },
// //               }}
// //             >
// //               {selectedNote.content}
// //             </ReactMarkdown>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }