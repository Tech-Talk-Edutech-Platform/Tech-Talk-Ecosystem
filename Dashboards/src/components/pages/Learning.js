// import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { ArrowLeft, Sun, Moon, ChevronLeft } from "lucide-react";
// import { supabase } from "../../supabase";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { materialDark, vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
// import CountdownRing from "../CountdownRing";

// // --- Sub-Component: Sidebar Navigation ---
// function NotesNavigation({ courseId, onSelectNote, darkMode }) {
//   const [topics, setTopics] = useState([]);
//   const [selectedTopic, setSelectedTopic] = useState(null);
//   const [notes, setNotes] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Fetch topics for the course
//   useEffect(() => {
//     if (!courseId) return;
//     const fetchTopics = async () => {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from("topics")
//         .select("*")
//         .eq("course_id", courseId);
//       if (!error) setTopics(data || []);
//       setLoading(false);
//     };
//     fetchTopics();
//   }, [courseId]);

//   // Fetch notes when a topic is selected
//   useEffect(() => {
//     if (!selectedTopic) return;
//     const fetchNotes = async () => {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from("notes")
//         .select("*")
//         .eq("topic_id", selectedTopic.id);
//       if (!error) setNotes(data || []);
//       setLoading(false);
//     };
//     fetchNotes();
//   }, [selectedTopic]);

//   if (loading && topics.length === 0) return <p className="p-4 opacity-50">Loading...</p>;

//   return (
//     <div className="flex flex-col gap-2">
//       {!selectedTopic ? (
//         <>
//           <h3 className="text-xs uppercase tracking-widest font-black mb-2 opacity-50">Topics</h3>
//           {topics.map((t) => (
//             <button
//               key={t.id}
//               onClick={() => setSelectedTopic(t)}
//               className={`block w-full text-left p-3 rounded-xl font-bold transition-all border-2 border-transparent ${darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-yellow-100 text-gray-700"
//                 }`}
//             >
//               {t.title || "Untitled Topic"}
//             </button>
//           ))}
//         </>
//       ) : (
//         <>
//           <button
//             onClick={() => setSelectedTopic(null)}
//             className="flex items-center gap-1 mb-4 text-sm font-bold text-indigo-500 hover:underline"
//           >
//             <ChevronLeft size={16} /> Back to Topics
//           </button>
//           <h3 className="text-xs uppercase tracking-widest font-black mb-2 opacity-50">
//             {selectedTopic.title}
//           </h3>
//           {notes.map((n) => (
//             <button
//               key={n.id}
//               onClick={() => onSelectNote(n)}
//               className={`block w-full text-left p-3 rounded-xl font-bold transition-all ${darkMode
//                 ? "bg-gray-700 text-white shadow-lg border-l-4 border-indigo-500"
//                 : "bg-yellow-400 text-gray-900 shadow-md"
//                 }`}
//             >
//               {n.title}
//             </button>
//           ))}
//         </>
//       )}
//     </div>
//   );
// }

// // --- Main Component: LearningPage ---
// export default function LearningPage({ user }) {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [darkMode, setDarkMode] = useState(true);
//   const [classStarted, setClassStarted] = useState(false);
//   const [nextClass, setNextClass] = useState(null);
//   const [selectedNote, setSelectedNote] = useState(null);

//   // Use courseId from location state or a default
//   const courseId = location.state?.courseId || "default-course-id";

//   useEffect(() => {
//     if (!user) return;
//     const fetchNextClass = async () => {
//       const { data, error } = await supabase.rpc("get_next_class", {
//         user_id: user.id,
//         role: user.role,
//       });
//       if (!error && data) setNextClass(data);
//     };
//     fetchNextClass();
//   }, [user]);

//   useEffect(() => {
//     if (location.state?.openVideo) setClassStarted(true);
//     if (localStorage.getItem("class_in_progress") === "true") setClassStarted(true);
//   }, [location.state]);

//   return (
//     <div className={`min-h-screen font-poppins transition-colors duration-300 flex flex-col ${darkMode ? "bg-gray-900 text-gray-200" : "bg-orange-50 text-gray-900"
//       }`}>

//       {/* Header */}
//       <div className={`flex justify-between items-center p-3 border-b-4 z-10 ${darkMode ? "border-gray-700 bg-gray-800" : "border-yellow-400 bg-white"
//         }`}>
//         <button
//           onClick={() => navigate(-1)}
//           className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-black shadow-lg"
//         >
//           <ArrowLeft size={22} strokeWidth={3} />
//           <span className="hidden md:inline">Dashboard</span>
//         </button>

//         <div className="flex items-center gap-4">
//           {classStarted && nextClass && (
//             <div className="flex items-center gap-3">
//               <CountdownRing startTime={nextClass.start_time} onStart={() => setClassStarted(true)} size={40} />
//               <p className="hidden sm:block text-sm font-bold">{nextClass.class_title}</p>
//             </div>
//           )}
//           <button
//             onClick={() => setDarkMode(!darkMode)}
//             className={`p-2 rounded-2xl border-2 ${darkMode ? "border-gray-600 bg-gray-700 text-yellow-400" : "border-yellow-200 bg-yellow-50 text-orange-500"
//               }`}
//           >
//             {darkMode ? <Sun size={24} /> : <Moon size={24} />}
//           </button>
//         </div>
//       </div>

//       {/* Main Content Area */}
//       <div className="flex-1 flex overflow-hidden">

//         {/* Left Section: Navigation (20%) */}
//         <div className={`w-1/5 min-w-[250px] max-w-[350px] border-r-4 overflow-auto p-4 ${darkMode ? "border-gray-700 bg-gray-800" : "border-yellow-400 bg-white"
//           }`}>
//           <NotesNavigation
//             courseId={courseId}
//             darkMode={darkMode}
//             onSelectNote={(note) => setSelectedNote(note)}
//           />
//         </div>

//         {/* Right Section: Content (80%) */}
//         <div className="flex-1 overflow-auto p-6 lg:p-10">
//           {selectedNote ? (
//             <div className="max-w-4xl mx-auto">
//               <div className={`p-8 rounded-3xl shadow-xl border-2 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-yellow-100"
//                 }`}>
//                 <h2 className="text-3xl font-black mb-6 text-indigo-500">{selectedNote.title}</h2>

//                 <div className="prose dark:prose-invert max-w-none">
//                   <ReactMarkdown
//                     remarkPlugins={[remarkGfm]}
//                     components={{
//                       code({ node, inline, className, children, ...props }) {
//                         const match = /language-(\w+)/.exec(className || "");
//                         return !inline && match ? (
//                           <SyntaxHighlighter
//                             style={darkMode ? materialDark : vscDarkPlus}
//                             language={match[1]}
//                             PreTag="div"
//                             className="rounded-xl my-4 shadow-inner"
//                             {...props}
//                           >
//                             {String(children).replace(/\n$/, "")}
//                           </SyntaxHighlighter>
//                         ) : (
//                           <code className="bg-indigo-100 dark:bg-gray-700 text-indigo-600 dark:text-green-300 px-2 py-0.5 rounded font-mono font-bold" {...props}>
//                             {children}
//                           </code>
//                         );
//                       },
//                     }}
//                   >
//                     {selectedNote.content}
//                   </ReactMarkdown>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div className="h-full flex flex-col justify-center items-center opacity-20">
//               <div className="w-32 h-32 border-8 border-dashed border-current rounded-full mb-6 flex items-center justify-center text-6xl">
//                 📚
//               </div>
//               <p className="text-2xl font-black">Choose a topic to start your lesson</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
// At the top of Learning.js
import { useParams, useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Sun, Moon, ChevronLeft, CheckCircle, Circle } from "lucide-react";
import { supabase } from "../../supabase";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark, vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import CountdownRing from "../CountdownRing";

// --- Sub-Component: Sidebar Navigation ---
function NotesNavigation({ courseId, onSelectNote, darkMode, completedNotes }) {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   if (!courseId) return;
  //   const fetchTopics = async () => {
  //     setLoading(true);
  //     const { data, error } = await supabase
  //       .from("topics")
  //       .select("*")
  //       .eq("course_id", courseId);
  //     if (!error) setTopics(data || []);
  //     setLoading(false);
  //   };
  //   fetchTopics();
  // }, [courseId]);
  useEffect(() => {
    // Temporarily replace your courseId line with this to test:
    // const courseId = "c48bc1e1-8b50-4ded-9544-fff76b38b1f6";
    // If courseId is null, undefined, or the placeholder string, don't fetch
    if (!courseId || courseId === "default-course-id") {
      console.error("No valid Course UUID provided to NotesNavigation");

      return;
    }

    const fetchTopics = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("topics")
        .select("*")
        .eq("course_id", courseId)
        .order("title"); // Added ordering

      if (error) {
        console.error("Error fetching topics:", error.message);
      } else {
        setTopics(data || []);
      }
      setLoading(false);
    };
    fetchTopics();
  }, [courseId]);

  useEffect(() => {
    if (!selectedTopic) return;
    const fetchNotes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("topic_id", selectedTopic.id);
      if (!error) setNotes(data || []);
      setLoading(false);
    };
    fetchNotes();
  }, [selectedTopic]);

  if (loading && topics.length === 0) return <p className="p-4 opacity-50 text-sm">Loading...</p>;

  return (
    <div className="flex flex-col gap-2">
      {!selectedTopic ? (
        <>
          <h3 className="text-xs uppercase tracking-widest font-black mb-2 opacity-50">Topics</h3>
          {topics.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTopic(t)}
              className={`block w-full text-left p-3 rounded-xl font-bold transition-all border-2 border-transparent ${darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-yellow-100 text-gray-700"
                }`}
            >
              {t.title || "Untitled Topic"}
            </button>
          ))}
        </>
      ) : (
        <>
          <button
            onClick={() => setSelectedTopic(null)}
            className="flex items-center gap-1 mb-4 text-sm font-bold text-indigo-500 hover:underline"
          >
            <ChevronLeft size={16} /> Back to Topics
          </button>
          <h3 className="text-xs uppercase tracking-widest font-black mb-2 opacity-50">
            {selectedTopic.title}
          </h3>
          {notes.map((n) => (
            <button
              key={n.id}
              onClick={() => onSelectNote(n)}
              className={`flex items-center justify-between w-full text-left p-3 rounded-xl font-bold transition-all ${darkMode
                ? "bg-gray-700 text-white shadow-lg border-l-4 border-indigo-500"
                : "bg-yellow-400 text-gray-900 shadow-md"
                }`}
            >
              <span className="truncate">{n.title}</span>
              {completedNotes.includes(n.id) && <CheckCircle size={16} className="text-green-500 ml-2 shrink-0" />}
            </button>
          ))}
        </>
      )}
    </div>
  );
}

// --- Main Component: LearningPage ---
export default function LearningPage({ user }) {
  const navigate = useNavigate();
  // const location = useLocation();
  const { id: courseId } = useParams();

  const [darkMode, setDarkMode] = useState(true);
  const [classStarted, setClassStarted] = useState(false);
  const [nextClass, setNextClass] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [completedNotes, setCompletedNotes] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // const courseId = location.state?.courseId || "default-course-id";

  // Fetch completed notes for the current user
  useEffect(() => {
    if (!user) return;
    const fetchProgress = async () => {
      const { data, error } = await supabase
        .from("user_notes_progress")
        .select("note_id")
        .eq("user_id", user.id);

      if (!error && data) {
        setCompletedNotes(data.map(item => item.note_id));
      }
    };
    fetchProgress();
  }, [user]);

  // Handle Mark as Completed
  const toggleCompletion = async (noteId) => {
    if (!user || isUpdating) return;
    setIsUpdating(true);

    const isDone = completedNotes.includes(noteId);

    if (isDone) {
      // Remove from completed
      const { error } = await supabase
        .from("user_notes_progress")
        .delete()
        .eq("user_id", user.id)
        .eq("note_id", noteId);

      if (!error) setCompletedNotes(prev => prev.filter(id => id !== noteId));
    } else {
      // Add to completed
      const { error } = await supabase
        .from("user_notes_progress")
        .insert([{ user_id: user.id, note_id: noteId }]);

      if (!error) setCompletedNotes(prev => [...prev, noteId]);
    }
    setIsUpdating(false);
  };

  useEffect(() => {
    if (!user) return;
    const fetchNextClass = async () => {
      const { data, error } = await supabase.rpc("get_next_class", {
        user_id: user.id,
        role: user.role,
      });
      if (!error && data) setNextClass(data);
    };
    fetchNextClass();
  }, [user]);

  return (
    <div className={`min-h-screen font-poppins transition-colors duration-300 flex flex-col ${darkMode ? "bg-gray-900 text-gray-200" : "bg-orange-50 text-gray-900"
      }`}>

      {/* Header */}
      <div className={`flex justify-between items-center p-3 border-b-4 z-10 ${darkMode ? "border-gray-700 bg-gray-800" : "border-yellow-400 bg-white"
        }`}>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-black shadow-lg"
        >
          <ArrowLeft size={22} strokeWidth={3} />
          <span className="hidden md:inline">Dashboard</span>
        </button>

        <div className="flex items-center gap-4">
          {classStarted && nextClass && (
            <div className="flex items-center gap-3">
              <CountdownRing startTime={nextClass.start_time} onStart={() => setClassStarted(true)} size={40} />
              <p className="hidden sm:block text-sm font-bold">{nextClass.class_title}</p>
            </div>
          )}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-2xl border-2 ${darkMode ? "border-gray-600 bg-gray-700 text-yellow-400" : "border-yellow-200 bg-yellow-50 text-orange-500"
              }`}
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">

        {/* Sidebar (20%) */}
        <div className={`w-1/5 min-w-[250px] max-w-[350px] border-r-4 overflow-auto p-4 ${darkMode ? "border-gray-700 bg-gray-800" : "border-yellow-400 bg-white"
          }`}>
          <NotesNavigation
            courseId={courseId}
            darkMode={darkMode}
            completedNotes={completedNotes}
            onSelectNote={(note) => setSelectedNote(note)}
          />
        </div>

        {/* Content (80%) */}
        <div className="flex-1 overflow-auto p-6 lg:p-10">
          {selectedNote ? (
            <div className="max-w-4xl mx-auto">
              <div className={`p-8 rounded-3xl shadow-xl border-2 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-yellow-100"
                }`}>
                <h2 className="text-3xl font-black mb-6 text-indigo-500">{selectedNote.title}</h2>

                <div className="prose dark:prose-invert max-w-none mb-10">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={darkMode ? materialDark : vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            className="rounded-xl my-4"
                            {...props}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        ) : (
                          <code className="bg-indigo-100 dark:bg-gray-700 text-indigo-600 dark:text-green-300 px-2 py-0.5 rounded font-mono font-bold" {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {selectedNote.content}
                  </ReactMarkdown>
                </div>

                {/* --- Mark as Completed Button --- */}
                <hr className="border-gray-700 mb-8" />
                <button
                  onClick={() => toggleCompletion(selectedNote.id)}
                  disabled={isUpdating}
                  className={`flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-black text-lg transition-all transform active:scale-95 ${completedNotes.includes(selectedNote.id)
                    ? "bg-green-500 text-white shadow-[0_5px_0_rgb(21,128,61)] mb-[5px]"
                    : "bg-indigo-500 text-white shadow-[0_5px_0_rgb(67,56,202)] mb-[5px] hover:bg-indigo-600"
                    } disabled:opacity-50`}
                >
                  {completedNotes.includes(selectedNote.id) ? (
                    <><CheckCircle size={24} strokeWidth={3} /> Lesson Completed!</>
                  ) : (
                    <><Circle size={24} strokeWidth={3} /> Mark as Completed</>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center opacity-20">
              <div className="w-32 h-32 border-8 border-dashed border-current rounded-full mb-6 flex items-center justify-center text-6xl">📚</div>
              <p className="text-2xl font-black">Choose a topic to start your lesson</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { ResizableBox } from "react-resizable";
// import { ArrowLeft, Sun, Moon } from "lucide-react";
// import "react-resizable/css/styles.css";
// import CountdownRing from "../CountdownRing";
// import { supabase } from "../../supabase";

// // NotesPanel with click highlight
// function NotesPanel({ onSelectNote, selectedNoteId }) {
//   const [notes, setNotes] = useState([
//     { id: 1, title: "Lesson 1", content: "Details of lesson 1..." },
//     { id: 2, title: "Lesson 2", content: "Details of lesson 2..." },
//     { id: 3, title: "Lesson 3", content: "Details of lesson 3..." },
//   ]);

//   return (
//     <div className="flex flex-col gap-1">
//       {notes.map((note) => (
//         <button
//           key={note.id}
//           onClick={() => onSelectNote(note)}
//           className={`block w-full text-left p-2 rounded font-bold transition-colors ${selectedNoteId === note.id
//             ? "bg-yellow-400 text-gray-900 shadow-md"
//             : "hover:bg-yellow-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
//             }`}
//         >
//           {note.title}
//         </button>
//       ))}
//     </div>
//   );
// }

// export default function LearningPage({ user }) {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [darkMode, setDarkMode] = useState(true);
//   const [notesOpen, setNotesOpen] = useState(true);
//   const [notesWidth, setNotesWidth] = useState(400);
//   const [classStarted, setClassStarted] = useState(false);
//   const [nextClass, setNextClass] = useState(null);
//   const [selectedNote, setSelectedNote] = useState(null);

//   // Fetch next class
//   useEffect(() => {
//     if (!user) return;

//     const fetchNextClass = async () => {
//       const { data, error } = await supabase.rpc("get_next_class", {
//         user_id: user.id,
//         role: user.role,
//       });

//       if (!error && data) setNextClass(data);
//     };

//     fetchNextClass();
//   }, [user]);

//   // Auto open video when coming from dashboard
//   useEffect(() => {
//     if (location.state?.openVideo) {
//       setClassStarted(true);

//       if (location.state.classData) {
//         setNextClass(location.state.classData);
//       }
//     }
//   }, [location.state]);

//   // Persist class state
//   useEffect(() => {
//     if (localStorage.getItem("class_in_progress") === "true") {
//       setClassStarted(true);
//     }
//   }, []);

//   return (
//     <div
//       className={`min-h-screen font-poppins transition-colors duration-300 ${darkMode ? "bg-gray-900 text-gray-200" : "bg-orange-50 text-gray-900"
//         }`}
//     >
//       {/* Header */}
//       <div
//         className={`flex justify-between items-center p-3 border-b-4 ${darkMode ? "border-gray-700 bg-gray-800" : "border-yellow-400 bg-white"
//           }`}
//       >
//         <button
//           onClick={() => navigate(-1)}
//           className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-black shadow-lg"
//         >
//           <ArrowLeft size={22} strokeWidth={3} />
//           <span className="hidden md:inline">My Dashboard</span>
//         </button>

//         <button
//           onClick={() => setDarkMode(!darkMode)}
//           className={`p-2 rounded-2xl border-2 ${darkMode
//             ? "border-gray-600 bg-gray-700 text-yellow-400"
//             : "border-yellow-200 bg-yellow-50 text-orange-500"
//             }`}
//         >
//           {darkMode ? <Sun size={24} /> : <Moon size={24} />}
//         </button>
//       </div>

//       {/* Main */}
//       <div className="relative h-[calc(100vh-80px)] overflow-hidden flex justify-center items-center">
//         {classStarted && nextClass && (
//           <div className="absolute top-6">
//             <CountdownRing
//               startTime={nextClass.start_time}
//               onStart={() => setClassStarted(true)}
//             />
//             <p className="mt-2 text-center text-gray-400 font-bold">
//               {nextClass.class_title}
//             </p>
//           </div>
//         )}

//         {/* Notes Panel Split View */}
//         {notesOpen && (
//           <ResizableBox
//             width={notesWidth}
//             height={Infinity}
//             axis="x"
//             resizeHandles={["w"]}
//             minConstraints={[300, Infinity]}
//             maxConstraints={[800, Infinity]}
//             onResizeStop={(e, data) => setNotesWidth(data.size.width)}
//             className={`relative h-full border-l-4 ${darkMode ? "border-gray-700 bg-gray-800" : "border-yellow-400 bg-white"
//               } flex`}
//           >
//             {/* Left: Notes List */}
//             <div className="w-1/3 border-r-2 overflow-auto p-2">
//               <NotesPanel
//                 onSelectNote={(note) => setSelectedNote(note)}
//                 selectedNoteId={selectedNote?.id}
//               />
//             </div>

//             {/* Right: Note Details */}
//             <div className="flex-1 overflow-auto p-4">
//               {selectedNote ? (
//                 <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-md">
//                   <h2 className="text-xl font-bold mb-2">{selectedNote.title}</h2>
//                   <p className="text-gray-600 dark:text-gray-300">{selectedNote.content}</p>
//                 </div>
//               ) : (
//                 <p className="text-gray-400 dark:text-gray-500 text-center mt-20">
//                   Select a note to view details
//                 </p>
//               )}
//             </div>

//             {/* Collapse Button */}
//             <button
//               onClick={() => setNotesOpen(false)}
//               className="absolute -left-5 top-1/2 transform -translate-y-1/2 bg-yellow-400 h-16 w-5"
//             >
//               ❮
//             </button>
//           </ResizableBox>
//         )}

//         {!notesOpen && (
//           <button
//             onClick={() => setNotesOpen(true)}
//             className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-yellow-400 h-16 w-8"
//           >
//             ❯
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }
// import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { ResizableBox } from "react-resizable";
// import { ArrowLeft, Sun, Moon } from "lucide-react";
// import "react-resizable/css/styles.css";
// import Playground from "./Playground";
// import ScratchEditor from "./Scratch";
// import BlocklyEditor from "./Blockly";
// import NotesPanel from "./NotesPanel";
// import CountdownRing from "../CountdownRing"; // ✅ ADD THIS
// import { supabase } from "../../supabase";
// import CodingTabs from "./CodingTabs";

// export default function LearningPage({ user }) { // ✅ FIXED
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [activeTab, setActiveTab] = useState("playground");
//   const [darkMode, setDarkMode] = useState(true);
//   const [notesOpen, setNotesOpen] = useState(true);
//   const [notesWidth, setNotesWidth] = useState(320);
//   const [classStarted, setClassStarted] = useState(false);

//   const [nextClass, setNextClass] = useState(null);

//   // ✅ Fetch next class
//   useEffect(() => {
//     if (!user) return;

//     const fetchNextClass = async () => {
//       const { data, error } = await supabase.rpc("get_next_class", {
//         user_id: user.id,
//         role: user.role,
//       });

//       if (!error && data) setNextClass(data);
//     };

//     fetchNextClass();
//   }, [user]);

//   // ✅ Auto open video when coming from dashboard
//   // useEffect(() => {
//   //   if (location.state?.openVideo) {
//   //     setClassStarted(true);
//   //     setActiveTab("video");
//   //   }
//   // }, [location.state]);
//   useEffect(() => {
//     if (location.state?.openVideo) {
//       setClassStarted(true);
//       setActiveTab("video");

//       // ✅ USE PASSED DATA INSTANTLY
//       if (location.state.classData) {
//         setNextClass(location.state.classData);
//       }
//     }
//   }, [location.state]);

//   // ✅ Persist class state
//   useEffect(() => {
//     if (localStorage.getItem("class_in_progress") === "true") {
//       setClassStarted(true);
//     }
//   }, []);

//   return (
//     <div className={`min-h-screen font-poppins transition-colors duration-300 ${darkMode ? "bg-gray-900 text-gray-200" : "bg-orange-50 text-gray-900"
//       }`}>

//       {/* Header */}
//       <div className={`flex justify-between items-center p-3 border-b-4 ${darkMode ? "border-gray-700 bg-gray-800" : "border-yellow-400 bg-white"
//         }`}>

//         <button
//           onClick={() => navigate(-1)}
//           className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-black shadow-lg"
//         >
//           <ArrowLeft size={22} strokeWidth={3} />
//           <span className="hidden md:inline">My Dashboard</span>
//         </button>

//         {/* Tabs */}
//         <div className="flex justify-center gap-2 md:gap-4">
//           {["playground", "scratch", "blockly", ...(classStarted ? ["video"] : [])].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`px-4 py-2 font-black rounded-xl transition-all ${activeTab === tab
//                 ? "bg-yellow-400 text-gray-900 shadow-md"
//                 : darkMode
//                   ? "text-gray-400 hover:text-white"
//                   : "text-gray-500 hover:text-indigo-600"
//                 }`}
//             >
//               {tab.toUpperCase()}
//             </button>
//           ))}
//         </div>

//         {/* Dark mode */}
//         <button
//           onClick={() => setDarkMode(!darkMode)}
//           className={`p-2 rounded-2xl border-2 ${darkMode
//             ? "border-gray-600 bg-gray-700 text-yellow-400"
//             : "border-yellow-200 bg-yellow-50 text-orange-500"
//             }`}
//         >
//           {darkMode ? <Sun size={24} /> : <Moon size={24} />}
//         </button>
//       </div>

//       {/* Main */}
//       <div className="relative h-[calc(100vh-80px)] overflow-hidden">

//         {/* ✅ VIDEO TAB */}
//         {activeTab === "video" && classStarted && (
//           <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
//             <div className="bg-white dark:bg-gray-800 p-10 rounded-[40px] shadow-2xl border-b-8 border-indigo-500 max-w-xl flex flex-col items-center">

//               <span className="text-6xl mb-4 block">📺</span>

//               <h2 className="text-3xl font-black mb-6 text-indigo-500">
//                 {nextClass ? "Next Class Countdown" : "No Upcoming Class"}
//               </h2>

//               {/* ✅ Animated Ring */}
//               {/* {nextClass && (
//                 <CountdownRing startTime={nextClass.start_time} />
//               )} */}
//               {nextClass && (
//                 <CountdownRing
//                   startTime={nextClass.start_time}
//                   onStart={() => setClassStarted(true)}
//                 />
//               )}

//               {/* Class title */}
//               {nextClass && (
//                 <p className="mt-6 text-gray-400 font-bold">
//                   {nextClass.class_title}
//                 </p>
//               )}

//               {/* Join */}
//               {nextClass && (
//                 <button
//                   onClick={() => window.open(nextClass.meet_link, "_blank")}
//                   className="mt-6 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black shadow-lg"
//                 >
//                   JOIN CLASS 🚀
//                 </button>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Playground */}
//         {activeTab === "playground" && (
//           <div className="w-full h-full flex">
//             <div className="flex-1 overflow-hidden">
//               <Playground darkMode={darkMode} />
//             </div>

//             {notesOpen && (
//               <ResizableBox
//                 width={notesWidth}
//                 height={Infinity}
//                 axis="x"
//                 resizeHandles={["w"]}
//                 minConstraints={[240, Infinity]}
//                 maxConstraints={[600, Infinity]}
//                 onResizeStop={(e, data) => setNotesWidth(data.size.width)}
//                 className={`relative h-full border-l-4 ${darkMode ? "border-gray-700 bg-gray-800" : "border-yellow-400 bg-white"
//                   }`}
//               >
//                 <button
//                   onClick={() => setNotesOpen(false)}
//                   className="absolute -left-5 top-1/2 transform -translate-y-1/2 bg-yellow-400 h-16 w-5"
//                 >
//                   ❮
//                 </button>
//                 <div className="flex-1 overflow-auto p-2">
//                   <NotesPanel />
//                 </div>
//               </ResizableBox>
//             )}

//             {!notesOpen && (
//               <button
//                 onClick={() => setNotesOpen(true)}
//                 className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-yellow-400 h-16 w-8"
//               >
//                 ❯
//               </button>
//             )}
//           </div>
//         )}

//         {/* Scratch */}
//         {activeTab === "scratch" && (
//           <div className="w-full h-full">
//             <ScratchEditor />
//           </div>
//         )}

//         {/* Blockly */}
//         {activeTab === "blockly" && (
//           <div className="w-full h-full overflow-hidden">
//             {/* <BlocklyEditor darkMode={darkMode} /> */}
//             <CodingTabs />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
