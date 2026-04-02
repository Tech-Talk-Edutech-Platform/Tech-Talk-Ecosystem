// src/components/NotesPanel.js
import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark, vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function NotesPanel({ darkMode, courseId }) {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch topics
  useEffect(() => {
    if (!courseId) return;

    const fetchTopics = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("topics")
        .select("*")
        .eq("course_id", courseId)
        .order("title");

      if (!error) setTopics(data || []);
      setLoading(false);
    };

    fetchTopics();
  }, [courseId]);

  // Fetch notes
  useEffect(() => {
    if (!selectedTopic) return;

    const fetchNotes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("topic_id", selectedTopic.id)
        .order("title");

      if (!error) setNotes(data || []);
      setLoading(false);
    };

    fetchNotes();
  }, [selectedTopic]);

  const openNote = async (noteId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("id", noteId)
      .single();

    if (!error) setSelectedNote(data);
    setLoading(false);
  };

  if (loading && !selectedNote) {
    return <p className="p-6 text-gray-400">Loading...</p>;
  }

  return (
    <div className={`h-screen flex ${darkMode ? "dark bg-gray-950 text-white" : "bg-gray-100 text-gray-900"}`}>

      {/* ================= SIDEBAR ================= */}
      <div className="w-72 border-r border-gray-200 dark:border-gray-800 p-4 overflow-y-auto">

        <h2 className="text-xl font-black mb-4 text-primary">
          📘 Notes
        </h2>

        {/* TOPICS */}
        {!selectedTopic && (
          <div className="space-y-2">
            {topics.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTopic(t);
                  setSelectedNote(null);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all
                ${darkMode
                    ? "bg-gray-800 hover:bg-primary hover:text-white"
                    : "bg-white hover:bg-primary hover:text-white shadow"
                  }`}
              >
                {t.title}
              </button>
            ))}
          </div>
        )}

        {/* NOTES */}
        {selectedTopic && !selectedNote && (
          <div>
            <button
              onClick={() => setSelectedTopic(null)}
              className="text-sm mb-3 text-secondary hover:underline"
            >
              ← Topics
            </button>

            <div className="space-y-2">
              {notes.map((n) => (
                <button
                  key={n.id}
                  onClick={() => openNote(n.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all
                  ${darkMode
                      ? "bg-gray-800 hover:bg-accent hover:text-black"
                      : "bg-white hover:bg-accent hover:text-black shadow"
                    }`}
                >
                  {n.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================= CONTENT ================= */}
      <div className="flex-1 p-6 overflow-y-auto">

        {!selectedNote && (
          <div className="h-full flex items-center justify-center text-gray-400 text-lg">
            Select a note to start learning 🚀
          </div>
        )}

        {selectedNote && (
          <div className="max-w-4xl mx-auto">

            <button
              onClick={() => setSelectedNote(null)}
              className="mb-4 text-sm text-secondary hover:underline"
            >
              ← Back
            </button>

            <h1 className="text-3xl font-black mb-6 text-primary">
              {selectedNote.title}
            </h1>

            <div className={`p-6 rounded-2xl shadow-xl transition
              ${darkMode ? "bg-gray-900 border border-gray-800" : "bg-white border"}
            `}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold mb-4 text-primary">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-bold mb-3 text-secondary">{children}</h2>
                  ),
                  p: ({ children }) => (
                    <p className="mb-4 leading-relaxed">{children}</p>
                  ),
                  code({ inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={darkMode ? materialDark : vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded text-pink-500">
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {selectedNote.content}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// import React, { useEffect, useState, useRef } from "react";
// import { supabase } from "../../supabase";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
// import { ChevronLeft, BookOpen, FileText, Sparkles, Rocket } from "lucide-react";

// export default function NotesPanel({ darkMode, courseId }) {
//   const [topics, setTopics] = useState([]);
//   const [selectedTopic, setSelectedTopic] = useState(null);
//   const [notes, setNotes] = useState([]);
//   const [selectedNote, setSelectedNote] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [scrollProgress, setScrollProgress] = useState(0);
//   const scrollContainerRef = useRef(null);

//   // Handle Reading Progress
//   const handleScroll = () => {
//     if (scrollContainerRef.current) {
//       const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
//       const totalHeight = scrollHeight - clientHeight;
//       const progress = (scrollTop / totalHeight) * 100;
//       setScrollProgress(progress);
//     }
//   };

//   useEffect(() => {
//     if (!courseId || courseId === "default-course-id") return;
//     const fetchTopics = async () => {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from("topics")
//         .select("*")
//         .eq("course_id", courseId)
//         .order("title");
//       if (!error) setTopics(data || []);
//       setLoading(false);
//     };
//     fetchTopics();
//   }, [courseId]);

//   useEffect(() => {
//     if (!selectedTopic) {
//       setNotes([]);
//       return;
//     }
//     const fetchNotes = async () => {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from("notes")
//         .select("*")
//         .eq("topic_id", selectedTopic.id)
//         .order("title");
//       if (!error) setNotes(data || []);
//       setLoading(false);
//     };
//     fetchNotes();
//   }, [selectedTopic]);

//   const openNote = async (noteId) => {
//     setLoading(true);
//     const { data, error } = await supabase.from("notes").select("*").eq("id", noteId).single();
//     if (!error) {
//       setSelectedNote(data);
//       setScrollProgress(0); // Reset progress for new note
//     }
//     setLoading(false);
//   };

//   const cardStyle = darkMode
//     ? "bg-gray-800 border-gray-700 text-gray-100 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]"
//     : "bg-white border-blue-200 text-gray-900 shadow-[4px_4px_0px_0px_rgba(59,130,246,0.2)]";

//   return (
//     <div className={`p-4 md:p-8 h-full flex flex-col rounded-[2.5rem] transition-all duration-500 ${darkMode ? "bg-[#0f172a]" : "bg-[#f0f9ff]"}`}>

//       {/* Header */}
//       {!selectedNote && (
//         <div className="flex items-center gap-4 mb-8 animate-in fade-in slide-in-from-top-4">
//           <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-xl transform -rotate-3">
//             <BookOpen className="text-white" size={32} />
//           </div>
//           <div>
//             <h2 className="text-3xl font-black tracking-tight leading-none">Learning Lab</h2>
//             <p className={`text-sm font-bold uppercase tracking-widest mt-1 ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>Discover something new!</p>
//           </div>
//         </div>
//       )}

//       {loading && !selectedNote && (
//         <div className="flex flex-col items-center justify-center flex-1 animate-pulse">
//           <Rocket className="text-indigo-500 mb-4" size={48} />
//           <p className="text-xl font-black">Launching your lesson...</p>
//         </div>
//       )}

//       {/* TOPIC SELECTION */}
//       {!selectedTopic && !selectedNote && !loading && (
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 overflow-y-auto pr-2">
//           {topics.map((t) => (
//             <button
//               key={t.id}
//               onClick={() => setSelectedTopic(t)}
//               className={`group relative text-left p-8 rounded-[2rem] border-2 transition-all hover:scale-[1.02] active:scale-95 ${cardStyle}`}
//             >
//               <Sparkles className="absolute top-4 right-4 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
//               <h3 className="text-2xl font-black leading-tight group-hover:text-indigo-500">{t.title}</h3>
//               <div className="mt-4 inline-flex items-center gap-2 text-sm font-black text-indigo-400 uppercase">
//                 Explore Topic <ChevronLeft className="rotate-180" size={16} />
//               </div>
//             </button>
//           ))}
//         </div>
//       )}

//       {/* NOTES LIST */}
//       {selectedTopic && !selectedNote && !loading && (
//         <div className="flex flex-col h-full animate-in slide-in-from-right-8">
//           <button
//             onClick={() => setSelectedTopic(null)}
//             className="flex items-center gap-2 font-black mb-8 px-6 py-3 rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 self-start transition-transform hover:scale-105"
//           >
//             <ChevronLeft size={24} /> Back to Library
//           </button>

//           <h4 className={`text-4xl font-black mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>{selectedTopic.title}</h4>

//           <div className="space-y-4 overflow-y-auto">
//             {notes.map((n) => (
//               <button
//                 key={n.id}
//                 onClick={() => openNote(n.id)}
//                 className={`w-full text-left p-6 rounded-[2rem] border-2 flex items-center gap-5 transition-all hover:border-indigo-400 ${cardStyle}`}
//               >
//                 <div className="p-4 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl">
//                   <FileText size={28} className="text-indigo-600 dark:text-indigo-400" />
//                 </div>
//                 <span className="text-xl font-bold">{n.title}</span>
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* THE READING ROOM (Single Note View) */}
//       {selectedNote && (
//         <div className="flex flex-col h-full animate-in zoom-in-95 duration-500">
//           <div className="flex items-center justify-between mb-4">
//             <button
//               onClick={() => setSelectedNote(null)}
//               className="flex items-center gap-2 font-black px-6 py-3 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all hover:bg-red-500 hover:text-white"
//             >
//               <ChevronLeft size={20} /> Close Book
//             </button>
//             {/* Progress Bar */}
//             <div className="flex-1 mx-8 h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden hidden md:block">
//               <div
//                 className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
//                 style={{ width: `${scrollProgress}%` }}
//               />
//             </div>
//           </div>

//           <div
//             ref={scrollContainerRef}
//             onScroll={handleScroll}
//             className={`flex-1 overflow-y-auto rounded-[3rem] p-8 md:p-16 border-4 shadow-2xl transition-colors ${darkMode
//               ? "bg-[#1e293b] border-[#334155] text-gray-100"
//               : "bg-white border-white text-gray-900"
//               }`}
//           >
//             <h1 className="text-5xl md:text-6xl font-black mb-12 tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
//               {selectedNote.title}
//             </h1>

//             <article className={`prose prose-2xl max-w-none ${darkMode ? "prose-invert" : ""}`}>
//               <ReactMarkdown
//                 remarkPlugins={[remarkGfm]}
//                 components={{
//                   p: ({ children }) => <p className="text-2xl md:text-3xl leading-[1.6] mb-10 font-medium opacity-95">{children}</p>,
//                   h2: ({ children }) => <h2 className="text-4xl font-black text-indigo-500 mt-16 mb-8">{children}</h2>,
//                   li: ({ children }) => <li className="text-2xl mb-4 font-bold list-disc ml-6 marker:text-purple-500">{children}</li>,
//                   code({ node, inline, className, children, ...props }) {
//                     const match = /language-(\w+)/.exec(className || "");
//                     return !inline && match ? (
//                       <div className="my-10 rounded-[2rem] overflow-hidden border-4 border-indigo-500/20 shadow-2xl">
//                         <SyntaxHighlighter
//                           style={darkMode ? oneDark : oneLight}
//                           language={match[1]}
//                           PreTag="div"
//                           customStyle={{ padding: '2.5rem', fontSize: '1.2rem', lineHeight: '1.7' }}
//                           {...props}
//                         >
//                           {String(children).replace(/\n$/, "")}
//                         </SyntaxHighlighter>
//                       </div>
//                     ) : (
//                       <code className="bg-yellow-300 dark:bg-yellow-400 text-black px-4 py-1 rounded-xl font-black text-xl mx-1" {...props}>
//                         {children}
//                       </code>
//                     );
//                   },
//                 }}
//               >
//                 {selectedNote.content}
//               </ReactMarkdown>
//               <div className="h-20" /> {/* Extra space at bottom */}
//             </article>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// // import React, { useEffect, useState } from "react";
// // import { supabase } from "../../supabase";
// // import ReactMarkdown from "react-markdown";
// // import remarkGfm from "remark-gfm";
// // import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// // import { materialDark, vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
// // import { ChevronLeft, BookOpen, FileText } from "lucide-react";

// // export default function NotesPanel({ darkMode, courseId }) {
// //   const [topics, setTopics] = useState([]);
// //   const [selectedTopic, setSelectedTopic] = useState(null);
// //   const [notes, setNotes] = useState([]);
// //   const [selectedNote, setSelectedNote] = useState(null);
// //   const [loading, setLoading] = useState(false);

// //   // Fetch topics when course changes
// //   useEffect(() => {
// //     if (!courseId || courseId === "default-course-id") return;

// //     const fetchTopics = async () => {
// //       setLoading(true);
// //       const { data, error } = await supabase
// //         .from("topics")
// //         .select("*")
// //         .eq("course_id", courseId)
// //         .order("title");
// //       if (!error) setTopics(data || []);
// //       setLoading(false);
// //     };

// //     fetchTopics();
// //   }, [courseId]);

// //   // Fetch notes when topic changes
// //   useEffect(() => {
// //     if (!selectedTopic) {
// //       setNotes([]);
// //       return;
// //     }

// //     const fetchNotes = async () => {
// //       setLoading(true);
// //       const { data, error } = await supabase
// //         .from("notes")
// //         .select("*")
// //         .eq("topic_id", selectedTopic.id)
// //         .order("title");
// //       if (!error) setNotes(data || []);
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

// //   return (
// //     <div className={`p-4 h-full flex flex-col rounded-xl transition-colors ${darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"}`}>
// //       <div className="flex items-center gap-2 mb-6">
// //         <BookOpen className="text-indigo-500" size={20} />
// //         <h2 className="text-xl font-black uppercase tracking-tight">Course Notes</h2>
// //       </div>

// //       {loading && !selectedNote && (
// //         <div className="flex justify-center p-10 italic opacity-50">Loading content...</div>
// //       )}

// //       {/* TOPIC LIST */}
// //       {!selectedTopic && !selectedNote && !loading && (
// //         <div className="space-y-3">
// //           {topics.length > 0 ? topics.map((t) => (
// //             <button
// //               key={t.id}
// //               onClick={() => setSelectedTopic(t)}
// //               className={`w-full text-left p-4 rounded-xl font-bold border-2 transition-all ${darkMode ? "bg-gray-800 border-gray-700 hover:border-indigo-500" : "bg-gray-50 border-gray-200 hover:border-indigo-400"
// //                 }`}
// //             >
// //               {t.title}
// //             </button>
// //           )) : <p className="text-sm opacity-50">No topics found for this course.</p>}
// //         </div>
// //       )}

// //       {/* NOTES LIST */}
// //       {selectedTopic && !selectedNote && !loading && (
// //         <div className="space-y-3">
// //           <button
// //             onClick={() => setSelectedTopic(null)}
// //             className="flex items-center gap-1 text-indigo-500 font-bold mb-4 hover:underline"
// //           >
// //             <ChevronLeft size={18} /> Back to Topics
// //           </button>
// //           <p className="text-xs font-black uppercase text-gray-500 mb-2">{selectedTopic.title}</p>
// //           {notes.map((n) => (
// //             <button
// //               key={n.id}
// //               onClick={() => openNote(n.id)}
// //               className={`w-full text-left p-4 rounded-xl font-bold border-2 flex items-center gap-3 transition-all ${darkMode ? "bg-gray-800 border-gray-700 hover:border-purple-500" : "bg-purple-50 border-purple-100 hover:border-purple-400"
// //                 }`}
// //             >
// //               <FileText size={18} className="text-purple-500" />
// //               {n.title}
// //             </button>
// //           ))}
// //         </div>
// //       )}

// //       {/* SINGLE NOTE VIEW */}
// //       {selectedNote && (
// //         <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2">
// //           <button
// //             onClick={() => setSelectedNote(null)}
// //             className="flex items-center gap-1 text-indigo-500 font-bold mb-4 hover:underline"
// //           >
// //             <ChevronLeft size={18} /> Back to {selectedTopic?.title || 'Notes'}
// //           </button>

// //           <h3 className="text-2xl font-black mb-4">{selectedNote.title}</h3>

// //           <div className={`prose max-w-none p-5 rounded-2xl border ${darkMode ? "prose-invert bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow-sm"
// //             }`}>
// //             <ReactMarkdown
// //               remarkPlugins={[remarkGfm]}
// //               components={{
// //                 code({ node, inline, className, children, ...props }) {
// //                   const match = /language-(\w+)/.exec(className || "");
// //                   return !inline && match ? (
// //                     <SyntaxHighlighter
// //                       style={darkMode ? materialDark : vscDarkPlus}
// //                       language={match[1]}
// //                       PreTag="div"
// //                       className="rounded-lg shadow-inner"
// //                       {...props}
// //                     >
// //                       {String(children).replace(/\n$/, "")}
// //                     </SyntaxHighlighter>
// //                   ) : (
// //                     <code className="bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded font-mono text-sm" {...props}>
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
// // // // src/components/NotesPanel.js
// // // import React, { useEffect, useState } from "react";
// // // import { supabase } from "../../supabase"; // initialize Supabase client
// // // import ReactMarkdown from "react-markdown";
// // // import remarkGfm from "remark-gfm";
// // // import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// // // import { materialDark, vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

// // // export default function NotesPanel({ darkMode, courseId }) {
// // //   const [topics, setTopics] = useState([]);
// // //   const [selectedTopic, setSelectedTopic] = useState(null);
// // //   const [notes, setNotes] = useState([]);
// // //   const [selectedNote, setSelectedNote] = useState(null);
// // //   const [loading, setLoading] = useState(true);

// // //   // Fetch topics
// // //   useEffect(() => {
// // //     if (!courseId) return;
// // //     setLoading(true);

// // //     const fetchTopics = async () => {
// // //       const { data, error } = await supabase
// // //         .from("topics")
// // //         .select("*")
// // //         .eq("course_id", courseId);
// // //       if (!error) setTopics(data || []);
// // //       setLoading(false);
// // //     };

// // //     fetchTopics();
// // //   }, [courseId]);

// // //   // Fetch notes for selected topic
// // //   useEffect(() => {
// // //     if (!selectedTopic) return;
// // //     setLoading(true);

// // //     const fetchNotes = async () => {
// // //       const { data, error } = await supabase
// // //         .from("notes")
// // //         .select("*")
// // //         .eq("topic_id", selectedTopic.id);
// // //       if (!error) setNotes(data || []);
// // //       setLoading(false);
// // //     };

// // //     fetchNotes();
// // //   }, [selectedTopic]);

// // //   const openNote = async (noteId) => {
// // //     setLoading(true);
// // //     const { data, error } = await supabase
// // //       .from("notes")
// // //       .select("*")
// // //       .eq("id", noteId)
// // //       .single();
// // //     if (!error) setSelectedNote(data);
// // //     setLoading(false);
// // //   };

// // //   if (loading && !selectedNote)
// // //     return <p className="p-4 text-gray-500">Loading...</p>;

// // //   return (
// // //     <div className="p-4 h-full flex flex-col bg-background dark:bg-gray-900 rounded-lg overflow-y-auto transition-colors">
// // //       <h2 className="text-lg font-bold mb-4 text-text dark:text-gray-100">Notes</h2>

// // //       {!selectedTopic && !selectedNote && (
// // //         <div className="flex flex-col gap-2">
// // //           {topics.map((t) => (
// // //             <button
// // //               key={t.id}
// // //               onClick={() => setSelectedTopic(t)}
// // //               className="p-3 rounded-lg bg-primary dark:bg-accent shadow-card hover:bg-primary hover:text-white transition"
// // //             >
// // //               {t.title || t.id}
// // //             </button>
// // //           ))}
// // //         </div>
// // //       )}

// // //       {selectedTopic && !selectedNote && (
// // //         <div className="flex flex-col gap-2">
// // //           <button
// // //             onClick={() => setSelectedTopic(null)}
// // //             className="mb-2 text-sm text-primary hover:underline self-start"
// // //           >
// // //             ← Back to topics
// // //           </button>
// // //           {notes.map((n) => (
// // //             <button
// // //               key={n.id}
// // //               onClick={() => openNote(n.id)}
// // //               className="p-3 rounded-lg bg-primary dark:bg-accent shadow-card hover:bg-primary hover:text-white transition"
// // //             >
// // //               {n.title || n.id}
// // //             </button>
// // //           ))}
// // //         </div>
// // //       )}

// // //       {selectedNote && (
// // //         <div className="flex flex-col h-full">
// // //           <button
// // //             onClick={() => setSelectedNote(null)}
// // //             className="mb-2 text-sm text-primary hover:underline self-start"
// // //           >
// // //             ← Back to notes
// // //           </button>

// // //           <h3 className="text-xl font-semibold mb-2 text-text dark:text-gray-100">
// // //             {selectedNote.title}
// // //           </h3>

// // //           <div className="prose dark:prose-invert max-w-full overflow-x-auto p-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">
// // //             <ReactMarkdown
// // //               remarkPlugins={[remarkGfm]}
// // //               components={{
// // //                 code({ node, inline, className, children, ...props }) {
// // //                   const match = /language-(\w+)/.exec(className || "");
// // //                   return !inline && match ? (
// // //                     <SyntaxHighlighter
// // //                       style={darkMode ? materialDark : vscDarkPlus}
// // //                       language={match[1]}
// // //                       PreTag="div"
// // //                       {...props}
// // //                     >
// // //                       {String(children).replace(/\n$/, "")}
// // //                     </SyntaxHighlighter>
// // //                   ) : (
// // //                     <code
// // //                       className="bg-gray-700 text-green-300 px-1 rounded font-mono"
// // //                       {...props}
// // //                     >
// // //                       {children}
// // //                     </code>
// // //                   );
// // //                 },
// // //               }}
// // //             >
// // //               {selectedNote.content}
// // //             </ReactMarkdown>
// // //           </div>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // }



// // // // notes (collection)
// // // //  ┣ intro_to_python (doc)
// // // //  ┃ ┣ title: "Intro to Python"
// // // //  ┃ ┗ content: "print('Hello World!')"
// // // //  ┣ variables (doc)
// // // //  ┃ ┣ title: "Variables"
// // // //  ┃ ┗ content: "x = 5"

// // // // e #, ##, lists, code blocks, etc.

// // // // textarea now uses font-mono so code looks like code.

// // // // Users can type code blocks using triple backticks (```) and specify language (e.g., python).

// // // // When saved, NotesPanel will render the Markdown beautifully with syntax highlighting (from previous setup).
