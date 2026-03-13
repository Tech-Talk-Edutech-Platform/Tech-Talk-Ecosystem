
// src/components/NotesPanel.js
import React, { useEffect, useState } from "react";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "@local/playground/src/firebase";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // for GitHub-flavored markdown (tables, lists)
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark, vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
//import { query, where } from "firebase/firestore";

export default function NotesPanel({ darkMode , topicId }) {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const unsub = onSnapshot(collection(db, "notes"), (snapshot) => {
  //     setNotes(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  //     setLoading(false);
  //   });
  //   return () => unsub();
  // }, []);
// useEffect(() => {
//   if (!topicId) return; // 🧠 skip until topicId is available

//   const q = query(collection(db, "notes"), where("topicId", "==", topicId));
//   const unsub = onSnapshot(q, (snapshot) => {
//     setNotes(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
//     setLoading(false);
//   });
//   return () => unsub();
// }, [topicId]);
  useEffect(() => {
  console.log("🟡 Fetching notes...");

  const unsub = onSnapshot(
    collection(db, "notes"),
    (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      console.log("✅ Notes fetched:", data); // see how many + what fields
      setNotes(data);
      setLoading(false);
    },
    (error) => {
      console.error("❌ Firestore error fetching notes:", error);
    }
  );

  return () => {
    console.log("🔵 Unsubscribed from notes listener");
    unsub();
  };
}, []);

// useEffect(() => {
//   const unsub = onSnapshot(collection(db, "notes"), (snapshot) => {
//     setNotes(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
//     setLoading(false);
//   });
//   return () => unsub();
// }, []);


  const openNote = async (noteId) => {
    setLoading(true);
    const ref = doc(db, "notes", noteId);
    const snap = await getDoc(ref);
    if (snap.exists()) setSelectedNote({ id: noteId, ...snap.data() });
    setLoading(false);
  };

  if (loading && !selectedNote)
    return <p className="p-4 text-gray-500">Loading...</p>;

  return (
    <div className="p-4 h-full flex flex-col bg-background dark:bg-gray-900 rounded-lg overflow-y-auto transition-colors">
      <h2 className="text-lg font-bold mb-4 text-text dark:text-gray-100">Notes</h2>

      {/* List of Notes */}
      {!selectedNote && (
        <div className="flex flex-col gap-2">
          {notes.map((n) => (
            <button
              key={n.id}
              onClick={() => openNote(n.id)}
              className="p-3 rounded-lg bg-primary dark:bg-accent shadow-card hover:bg-primary hover:text-white transition"
            >
              {n.title || n.id}
            </button>
          ))}
        </div>
      )}

      {/* Single Note View */}
      {selectedNote && (
        <div className="flex flex-col h-full">
          <button
            onClick={() => setSelectedNote(null)}
            className="mb-2 text-sm text-primary hover:underline self-start"
          >
            ← Back to notes
          </button>

          <h3 className="text-xl font-semibold mb-2 text-text dark:text-gray-100">
            {selectedNote.title}
          </h3>
          <div
  className={`prose dark:prose-invert max-w-full overflow-x-auto 
  p-3 rounded border border-gray-300 dark:border-gray-700 
  bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 
  prose-pre:bg-gray-900 prose-pre:text-green-200 prose-pre:rounded-xl 
  prose-code:bg-gray-800 prose-code:text-green-400 prose-code:px-2 prose-code:rounded`}
>
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      code({ node, inline, className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || "");
        return !inline && match ? (
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={match[1]}
            PreTag="div"
            className="rounded-lg my-3"
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        ) : (
          <code className="bg-gray-800 text-green-400 px-2 py-1 rounded font-mono">
            {children}
          </code>
        );
      },
    }}
  >
    {selectedNote.content}
  </ReactMarkdown>
</div>

          {/* <div
            className={`prose dark:prose-invert max-w-full overflow-x-auto p-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100`}
          >
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
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        // ✅ make inline code text color brighter and keep background dark
        <code
          className="bg-gray-700 text-green-300 px-1 rounded font-mono"
          {...props}
        >
          {children}
        </code>
      );
    },
    h1: ({ children }) => <h1 className="text-2xl font-bold">{children}</h1>,
    h2: ({ children }) => <h2 className="text-xl font-semibold">{children}</h2>,
    h3: ({ children }) => <h3 className="text-lg font-semibold">{children}</h3>,
    table: ({ children }) => (
      <table className="w-full border-collapse border border-gray-600">{children}</table>
    ),
    th: ({ children }) => (
      <th className="border border-gray-600 px-3 py-2 bg-gray-800 text-gray-100">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-gray-600 px-3 py-2 bg-gray-900 text-gray-200">
        {children}
      </td>
    ),
  }}
>
  {selectedNote.content}
</ReactMarkdown>

          </div> */}
        </div>
      )}
    </div>
  );
}

// // src/components/NotesPanel.js
// import React, { useEffect, useState } from "react";
// import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
// import { db } from "../firebase";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm"; // for GitHub-flavored markdown (tables, lists)
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { materialDark, vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

// export default function NotesPanel({ darkMode }) {
//   const [notes, setNotes] = useState([]);
//   const [selectedNote, setSelectedNote] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsub = onSnapshot(collection(db, "notes"), (snapshot) => {
//       setNotes(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
//       setLoading(false);
//     });
//     return () => unsub();
//   }, []);

//   const openNote = async (noteId) => {
//     setLoading(true);
//     const ref = doc(db, "notes", noteId);
//     const snap = await getDoc(ref);
//     if (snap.exists()) setSelectedNote({ id: noteId, ...snap.data() });
//     setLoading(false);
//   };

//   if (loading && !selectedNote)
//     return <p className="p-4 text-gray-500">Loading...</p>;

//   return (
//     <div className="p-4 h-full flex flex-col bg-background dark:bg-gray-900 rounded-lg overflow-y-auto transition-colors">
//       <h2 className="text-lg font-bold mb-4 text-text dark:text-gray-100">Notes</h2>

//       {/* List of Notes */}
//       {!selectedNote && (
//         <div className="flex flex-col gap-2">
//           {notes.map((n) => (
//             <button
//               key={n.id}
//               onClick={() => openNote(n.id)}
//               className="p-3 rounded-lg bg-primary dark:bg-accent shadow-card hover:bg-primary hover:text-white transition"
//             >
//               {n.title || n.id}
//             </button>
//           ))}
//         </div>
//       )}

//       {/* Single Note View */}
//       {selectedNote && (
//         <div className="flex flex-col h-full">
//           <button
//             onClick={() => setSelectedNote(null)}
//             className="mb-2 text-sm text-primary hover:underline self-start"
//           >
//             ← Back to notes
//           </button>

//           <h3 className="text-xl font-semibold mb-2 text-text dark:text-gray-100">
//             {selectedNote.title}
//           </h3>

//           <div
//             className={`prose dark:prose-invert max-w-full overflow-x-auto p-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100`}
//           >
            
//             <ReactMarkdown
//               remarkPlugins={[remarkGfm]}
//               components={{
//                 code({ node, inline, className, children, ...props }) {
//                   const match = /language-(\w+)/.exec(className || "");
//                   return !inline && match ? (
//                     <SyntaxHighlighter
//                       style={darkMode ? materialDark :vscDarkPlus}
//                       language={match[1]}
//                       PreTag="div"
//                       {...props}
//                     >
//                       {String(children).replace(/\n$/, "")}
//                     </SyntaxHighlighter>
//                   ) : (
//                     <code className="bg-gray-700 px-1 rounded" {...props}>
//                       {children}
//                     </code>
//                   );
//                 },
//                 h1: ({ children }) => <h1 className="text-2xl font-bold">{children}</h1>,
//                 h2: ({ children }) => <h2 className="text-xl font-semibold">{children}</h2>,
//                 h3: ({ children }) => <h3 className="text-lg font-semibold">{children}</h3>,
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
// // import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
// // import { db } from "../firebase";
// // import ReactMarkdown from "react-markdown";
// // import remarkGfm from "remark-gfm"; // for GitHub-flavored markdown (tables, lists)
// // import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// // import { materialDark, materialLight } from "react-syntax-highlighter/dist/esm/styles/prism";

// // export default function NotesPanel({ darkMode }) {
// //   const [notes, setNotes] = useState([]);
// //   const [selectedNote, setSelectedNote] = useState(null);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     const unsub = onSnapshot(collection(db, "notes"), (snapshot) => {
// //       setNotes(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
// //       setLoading(false);
// //     });
// //     return () => unsub();
// //   }, []);

// //   const openNote = async (noteId) => {
// //     setLoading(true);
// //     const ref = doc(db, "notes", noteId);
// //     const snap = await getDoc(ref);
// //     if (snap.exists()) setSelectedNote({ id: noteId, ...snap.data() });
// //     setLoading(false);
// //   };

// //   if (loading && !selectedNote)
// //     return <p className="p-4 text-gray-500">Loading...</p>;

// //   return (
// //     <div className="p-4 h-full flex flex-col bg-background dark:bg-gray-900 rounded-lg overflow-y-auto transition-colors">
// //       <h2 className="text-lg font-bold mb-4 text-text dark:text-gray-100">Notes</h2>

// //       {/* List of Notes */}
// //       {!selectedNote && (
// //         <div className="flex flex-col gap-2">
// //           {notes.map((n) => (
// //             <button
// //               key={n.id}
// //               onClick={() => openNote(n.id)}
// //               className="p-3 rounded-lg bg-white dark:bg-accent shadow-card hover:bg-primary hover:text-white transition"
// //             >
// //               {n.title || n.id}
// //             </button>
// //           ))}
// //         </div>
// //       )}

// //       {/* Single Note View */}
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
// //                 code({ node, inline, className, children, ...props }) {
// //                   const match = /language-(\w+)/.exec(className || "");
// //                   return !inline && match ? (
// //                     <SyntaxHighlighter
// //                       style={darkMode ? materialDark : materialLight}
// //                       language={match[1]}
// //                       PreTag="div"
// //                       {...props}
// //                     >
// //                       {String(children).replace(/\n$/, "")}
// //                     </SyntaxHighlighter>
// //                   ) : (
// //                     <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded" {...props}>
// //                       {children}
// //                     </code>
// //                   );
// //                 },
// //                 h1: ({ children }) => <h1 className="text-2xl font-bold">{children}</h1>,
// //                 h2: ({ children }) => <h2 className="text-xl font-semibold">{children}</h2>,
// //                 h3: ({ children }) => <h3 className="text-lg font-semibold">{children}</h3>,
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

// // // import React, { useEffect, useState } from "react";
// // // import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
// // // import { db } from "../firebase";

// // // export default function NotesPanel() {
// // //   const [notes, setNotes] = useState([]);
// // //   const [selectedNote, setSelectedNote] = useState(null);
// // //   const [loading, setLoading] = useState(true);

// // //   // 🔹 Fetch all notes
// // //   useEffect(() => {
// // //     const unsub = onSnapshot(collection(db, "notes"), (snapshot) => {
// // //       setNotes(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
// // //       setLoading(false);
// // //     });
// // //     return () => unsub();
// // //   }, []);

// // //   // 🔹 Open a single note
// // //   const openNote = async (noteId) => {
// // //     setLoading(true);
// // //     const ref = doc(db, "notes", noteId);
// // //     const snap = await getDoc(ref);
// // //     if (snap.exists()) setSelectedNote({ id: noteId, ...snap.data() });
// // //     setLoading(false);
// // //   };

// // //   if (loading && !selectedNote)
// // //     return <p className="p-4 text-gray-500">Loading...</p>;

// // //   return (
// // //     <div className="p-4 h-full flex flex-col bg-background dark:bg-gray-900 rounded-lg overflow-y-auto transition-colors">
// // //       <h2 className="text-lg font-bold mb-4 text-text dark:text-gray-100">
// // //         Notes
// // //       </h2>

// // //       {/* 🔸 List of Notes */}
// // //       {!selectedNote && (
// // //         <div className="flex flex-col gap-2">
// // //           {notes.map((n) => (
// // //             <button
// // //               key={n.id}
// // //               onClick={() => openNote(n.id)}
// // //               className="p-3 rounded-lg bg-white dark:bg-accent shadow-card hover:bg-primary hover:text-white transition"
// // //             >
// // //               {n.title || n.id}
// // //             </button>
// // //           ))}
// // //         </div>
// // //       )}

// // //       {/* 🔸 Single Note View */}
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

// // //           <textarea
// // //             readOnly
// // //             value={selectedNote.content}
// // //             className="w-full flex-1 p-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 resize-none"
// // //           />
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // }


// // // // // src/components/NotesPanel.js
// // // // import React, { useEffect, useState } from "react";
// // // // import { doc, getDoc } from "firebase/firestore";
// // // // import { db } from "../firebase"; // make sure your firebase.js exports db

// // // // export default function NotesPanel() {
// // // //   const [note, setNote] = useState("");
// // // //   const [loading, setLoading] = useState(true);

// // // //   useEffect(() => {
// // // //     const fetchNote = async () => {
// // // //       try {
// // // //         const docRef = doc(db, "notes", "playgroundNotes"); // 👈 change doc ID as needed
// // // //         const docSnap = await getDoc(docRef);
// // // //         if (docSnap.exists()) {
// // // //           setNote(docSnap.data().content || "");
// // // //         } else {
// // // //           setNote("No notes found in Firestore.");
// // // //         }
// // // //       } catch (error) {
// // // //         console.error("Error fetching notes:", error);
// // // //         setNote("Failed to load notes.");
// // // //       } finally {
// // // //         setLoading(false);
// // // //       }
// // // //     };

// // // //     fetchNote();
// // // //   }, []);

// // // //   if (loading) return <p className="p-4 text-gray-500">Loading notes...</p>;

// // // //   return (
// // // //     <div className="p-4 h-full flex flex-col bg-gray-100 dark:bg-gray-800 rounded-lg">
// // // //       <h2 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-200">
// // // //         Notes
// // // //       </h2>
// // // //       <textarea
// // // //         readOnly
// // // //         value={note}
// // // //         className="w-full flex-1 p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
// // // //       />
// // // //     </div>
// // // //   );
// // // // }


// // // // notes (collection)
// // // //  ┣ intro_to_python (doc)
// // // //  ┃ ┣ title: "Intro to Python"
// // // //  ┃ ┗ content: "print('Hello World!')"
// // // //  ┣ variables (doc)
// // // //  ┃ ┣ title: "Variables"
// // // //  ┃ ┗ content: "x = 5"

// // e #, ##, lists, code blocks, etc.

// // textarea now uses font-mono so code looks like code.

// // Users can type code blocks using triple backticks (```) and specify language (e.g., python).

// // When saved, NotesPanel will render the Markdown beautifully with syntax highlighting (from previous setup).
