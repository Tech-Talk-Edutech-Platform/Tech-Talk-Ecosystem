// src/pages/LearningPage.js
import React, { useState } from "react";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import Playground from "./Playground";
import ScratchEditor from "./Scratch";
import BlocklyEditor from "./Blockly";
import NotesPanel from "./NotesPanel";

export default function LearningPage() {
  const [activeTab, setActiveTab] = useState("video"); // video, playground, scratch, blockly
  const [darkMode, setDarkMode] = useState(true);
  const [notesOpen, setNotesOpen] = useState(true);
  const [notesWidth, setNotesWidth] = useState(320);

  return (
    <div
      className={`min-h-screen font-poppins ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-2 border-b border-gray-300 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-primary">Code Environment</h1>

        <div className="flex justify-center gap-6">
          {["video", "playground", "scratch", "blockly"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold rounded-t ${
                activeTab === tab
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-primary"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-3 py-1 rounded border border-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700"
        >
          {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* Main Area */}
      <div className="relative h-[90vh] overflow-hidden">
        {/* Video Tab */}
        {activeTab === "video" && (
          <div className="w-full h-full flex flex-col items-center justify-center text-center">
            <h2 className="text-3xl font-bold mb-4">📺 Video Session</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Video integration is currently disabled.
            </p>
          </div>
        )}

        {/* Playground Tab */}
        {activeTab === "playground" && (
          <div className="w-full h-full flex">
            {/* Playground section */}
            <div className="flex-1 overflow-hidden">
              <Playground darkMode={darkMode} />
            </div>

            {/* Notes panel */}
            {notesOpen && (
              <ResizableBox
                width={notesWidth}
                height={Infinity}
                axis="x"
                resizeHandles={["w"]}
                minConstraints={[240, Infinity]}
                maxConstraints={[600, Infinity]}
                onResizeStop={(e, data) => setNotesWidth(data.size.width)}
                className="relative h-full border-l border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg flex flex-col"
              >
                <button
                  onClick={() => setNotesOpen(false)}
                  className="absolute -left-3 top-1/2 transform -translate-y-1/2 bg-primary text-white px-1 py-1 rounded-l"
                >
                  ❮
                </button>
                <NotesPanel />
              </ResizableBox>
            )}

            {/* Expand button when closed */}
            {!notesOpen && (
              <button
                onClick={() => setNotesOpen(true)}
                className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-primary text-white px-2 py-2 rounded-l"
              >
                ❯
              </button>
            )}
          </div>
        )}

        {/* Scratch Tab */}
        {activeTab === "scratch" && (
          <div className="w-full h-full">
            <ScratchEditor />
          </div>
        )}

        {/* Blockly Tab */}
        {activeTab === "blockly" && (
          <div className="p-5">
            <h2 className="text-2xl font-bold mb-4">Blockly Code Runner</h2>
            <BlocklyEditor darkMode={darkMode} />
          </div>
        )}
      </div>
    </div>
  );
}

// import React, { useState } from "react";
// import { ResizableBox } from "react-resizable";
// import "react-resizable/css/styles.css";
// import Playground from "./Playground";
// import ScratchEditor from "./Scratch";
// import BlocklyEditor from "./Blockly";
// import NotesPanel from "./NotesPanel";

// export default function LearningPage() {
//   const [activeTab, setActiveTab] = useState("video"); // video, playground, scratch, blockly
//   const [darkMode, setDarkMode] = useState(true);
//   const [notesOpen, setNotesOpen] = useState(true);
//   const [notesWidth, setNotesWidth] = useState(320);

//   return (
//     <div
//       className={`min-h-screen font-poppins ${
//         darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
//       }`}
//     >
//       {/* Header */}
//       <div className="flex justify-between items-center p-2 border-b border-gray-300 dark:border-gray-700">
//         <h1 className="text-2xl font-bold text-primary">Code Environment</h1>

//         <div className="flex justify-center gap-6">
//           {["video", "playground", "scratch", "blockly"].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`px-4 py-2 font-semibold rounded-t ${
//                 activeTab === tab
//                   ? "border-b-2 border-primary text-primary"
//                   : "text-gray-500 hover:text-primary"
//               }`}
//             >
//               {tab.charAt(0).toUpperCase() + tab.slice(1)}
//             </button>
//           ))}
//         </div>

//         <button
//           onClick={() => setDarkMode(!darkMode)}
//           className="px-3 py-1 rounded border border-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700"
//         >
//           {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
//         </button>
//       </div>

//       {/* Main Area */}
//       <div className="relative h-[90vh] overflow-hidden">
//         {/* Video Tab */}
//         {activeTab === "video" && (
//           <div className="w-full h-full flex flex-col items-center justify-center text-center">
//             <h2 className="text-3xl font-bold mb-4">📺 Video Session</h2>
//             <p className="text-gray-600 dark:text-gray-400">
//               Video integration is currently disabled.
//             </p>
//           </div>
//         )}

//         {/* Playground Tab */}
//         {activeTab === "playground" && (
//           <div className="w-full h-full flex">
//             {/* Playground section */}
//             <div className="flex-1 overflow-hidden">
//               <Playground darkMode={darkMode} />
//             </div>

//             {/* Notes panel */}
//             {notesOpen && (
//               <ResizableBox
//                 width={notesWidth}
//                 height={Infinity}
//                 axis="x"
//                 minConstraints={[240, Infinity]}
//                 maxConstraints={[600, Infinity]}
//                 onResizeStop={(e, data) => setNotesWidth(data.size.width)}
//                 className="h-full border-l border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg flex flex-col"
//               >
//                 <div className="relative h-full w-full">
//                   <button
//                     onClick={() => setNotesOpen(false)}
//                     className="absolute -left-3 top-1/2 transform -translate-y-1/2 bg-primary text-white px-1 py-1 rounded-l"
//                   >
//                     ❮
//                   </button>
//                   <NotesPanel />
//                 </div>
//               </ResizableBox>
//             )}

//             {/* Expand button when closed */}
//             {!notesOpen && (
//               // <button
//               //   onClick={() => setNotesOpen(true)}
//               //   className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-primary text-white px-2 py-2 rounded-l"
//               // >
//               //   ❯
//               // </button>
//                <button
//     onClick={() => setNotesOpen(true)}
//     className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-primary text-white px-2 py-2 rounded-l"
//   >
//     ❯
//     {/* ❮ */}
//   </button>
//             )}
//           </div>
//         )}

//         {/* Scratch Tab */}
//         {activeTab === "scratch" && (
//           <div className="w-full h-full">
//             <ScratchEditor />
//           </div>
//         )}

//         {/* Blockly Tab */}
//         {activeTab === "blockly" && (
//           <div className="p-5">
//             <h2 className="text-2xl font-bold mb-4">Blockly Code Runner</h2>
//             <BlocklyEditor darkMode={darkMode} />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // // src/pages/Learning.js
// // import React, { useState } from "react";
// // import { ResizableBox } from "react-resizable";
// // import "react-resizable/css/styles.css";
// // import Playground from "./Playground";
// // import ScratchEditor from "./Scratch";
// // import BlocklyEditor from "./Blockly";
// // import NotesPanel from "../components/NotesPanel";


// // export default function LearningPage() {
// //   const [activeTab, setActiveTab] = useState("video"); // video, playground, scratch, blockly
// //   const [darkMode, setDarkMode] = useState(false);
// //   const [notesOpen, setNotesOpen] = useState(true);
// //   const [notesWidth, setNotesWidth] = useState(320);

// //   return (
// //     <div
// //       className={`min-h-screen font-poppins ${
// //         darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
// //       }`}
// //     >
// //       {/* Header */}
// //       <div className="flex justify-between items-center p-2 border-b border-gray-300 dark:border-gray-700">
// //         <h1 className="text-2xl font-bold text-primary">Code Environment</h1>

// //         <div className="flex justify-center gap-6">
// //           {["video", "playground", "scratch", "blockly"].map((tab) => (
// //             <button
// //               key={tab}
// //               onClick={() => setActiveTab(tab)}
// //               className={`px-4 py-2 font-semibold rounded-t ${
// //                 activeTab === tab
// //                   ? "border-b-2 border-primary text-primary"
// //                   : "text-gray-500 hover:text-primary"
// //               }`}
// //             >
// //               {tab.charAt(0).toUpperCase() + tab.slice(1)}
// //             </button>
// //           ))}
// //         </div>

// //         <button
// //           onClick={() => setDarkMode(!darkMode)}
// //           className="px-3 py-1 rounded border border-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700"
// //         >
// //           {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
// //         </button>
// //       </div>

// //       {/* Main Area */}
// //       <div className="relative h-[90vh] overflow-hidden">
// //         {activeTab === "video" && (
// //           <div className="w-full h-full flex flex-col items-center justify-center text-center">
// //             <h2 className="text-3xl font-bold mb-4">📺 Video Session</h2>
// //             <p className="text-gray-600 dark:text-gray-400">
// //               Video integration is currently disabled.
// //             </p>
// //           </div>
// //         )}

// //         {activeTab === "playground" && (
// //           <div className="w-full h-full flex">
// //             {/* Playground section (will shrink when notes open) */}
// //             <div className="flex-1 overflow-hidden">
// //               <Playground darkMode={darkMode} />
// //             </div>

// //             {/* Notes panel (now flexed, not absolute) */}
// //             {notesOpen && (
// //               <ResizableBox
// //                 width={notesWidth}
// //                 height={Infinity}
// //                 axis="x"
// //                 minConstraints={[240, Infinity]}
// //                 maxConstraints={[600, Infinity]}
// //                 onResizeStop={(e, data) => setNotesWidth(data.size.width)}
// //                 className="h-full border-l border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg flex flex-col"
// //               >
// //                 <div className="relative h-full w-full">
// //                   <button
// //                     onClick={() => setNotesOpen(false)}
// //                     className="absolute -left-3 top-1/2 transform -translate-y-1/2 bg-primary text-white px-1 py-1 rounded-l"
// //                   >
// //                     ❮
// //                   </button>

// //                   <div className="p-4 h-full flex flex-col bg-gray-100 dark:bg-gray-800 rounded-lg">
// //                     <h2 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-200">Notes</h2>
// //                     <textarea
// //                       className="w-full flex-1 p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
// //                       placeholder="Write your notes here..."
// //                     />
// //                   </div>
// //                 </div>
// //               </ResizableBox>
// //             )}

// //             {!notesOpen && (
// //               <button
// //                 onClick={() => setNotesOpen(true)}
// //                 className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-primary text-white px-2 py-2 rounded-l"
// //               >
// //                 ❯
// //               </button>
// //             )}
// //           </div>
// //         )}

// //         {activeTab === "scratch" && (
// //           <div className="w-full h-full">
// //             <ScratchEditor />
// //           </div>
// //         )}

// //         {activeTab === "blockly" && (
// //           <div className="p-5">
// //             <h2 className="text-2xl font-bold mb-4">Blockly Code Runner</h2>
// //             <BlocklyEditor darkMode={darkMode} />
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// // // // src/pages/Learning.js
// // // import React, { useState } from "react";
// // // import { ResizableBox } from "react-resizable";
// // // import "react-resizable/css/styles.css";
// // // import Playground from "./Playground";
// // // import ScratchEditor from "./Scratch";
// // // import BlocklyEditor from "./Blockly";

// // // export default function LearningPage() {
// // //   const [activeTab, setActiveTab] = useState("video"); // video, playground, notes, scratch, blockly
// // //   const [darkMode, setDarkMode] = useState(false);
// // //   const [notesOpen, setNotesOpen] = useState(true);
// // //   const [notesWidth, setNotesWidth] = useState(320);

// // //   return (
// // //     <div
// // //       className={`min-h-screen font-poppins ${
// // //         darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
// // //       }`}
// // //     >
// // //       {/* Header + Tabs + Dark Mode Toggle */}
// // //       <div className="flex justify-between items-center p-2 border-b border-gray-300 dark:border-gray-700">
// // //         <h1 className="text-2xl font-bold text-primary">Code Environment</h1>

// // //         <div className="flex justify-center gap-6">
// // //           {["video", "playground", "notes", "scratch", "blockly"].map((tab) => (
// // //             <button
// // //               key={tab}
// // //               onClick={() => setActiveTab(tab)}
// // //               className={`px-4 py-2 font-semibold rounded-t ${
// // //                 activeTab === tab
// // //                   ? "border-b-2 border-primary text-primary"
// // //                   : "text-gray-500 hover:text-primary"
// // //               }`}
// // //             >
// // //               {tab.charAt(0).toUpperCase() + tab.slice(1)}
// // //             </button>
// // //           ))}
// // //         </div>

// // //         <button
// // //           onClick={() => setDarkMode(!darkMode)}
// // //           className="px-3 py-1 rounded border border-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700"
// // //         >
// // //           {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
// // //         </button>
// // //       </div>

// // //       {/* Main Content Area */}
// // //       <div className="relative flex-1 h-[90vh] overflow-hidden">
// // //         {/* Video Tab (currently empty placeholder) */}
// // //         {activeTab === "video" && (
// // //           <div className="w-full h-full flex flex-col items-center justify-center text-center">
// // //             <h2 className="text-3xl font-bold mb-4">📺 Video Session</h2>
// // //             <p className="text-gray-600 dark:text-gray-400">
// // //               Video integration is currently disabled.
// // //             </p>
// // //           </div>
// // //         )}

// // //         {/* Playground Tab */}
// // //         {activeTab === "playground" && (
// // //           <div className="w-full h-full">
// // //             <Playground darkMode={darkMode} />
// // //           </div>
// // //         )}

// // //         {/* Scratch Tab */}
// // //         {activeTab === "scratch" && (
// // //           <div className="w-full h-full">
// // //             <ScratchEditor />
// // //           </div>
// // //         )}

// // //         {/* Blockly Tab */}
// // //         {activeTab === "blockly" && (
// // //           <div className="p-5">
// // //             <h2 className="text-2xl font-bold mb-4">Blockly Code Runner</h2>
// // //             <BlocklyEditor darkMode={darkMode} />
// // //           </div>
// // //         )}

// // //         {/* Notes Tab */}
// // //         {activeTab === "notes" && (
// // //           <div className="w-full h-full relative flex">
// // //             {/* Main Playground Editor */}
// // //             <div className="flex-1">
// // //               <Playground darkMode={darkMode} />
// // //             </div>

// // //             {/* Resizable Notes Panel */}
// // //             {notesOpen && (
// // //               <ResizableBox
// // //                 width={notesWidth}
// // //                 height={Infinity}
// // //                 axis="x"
// // //                 minConstraints={[240, Infinity]}
// // //                 maxConstraints={[600, Infinity]}
// // //                 resizeHandles={["w"]}
// // //                 onResizeStop={(e, data) => setNotesWidth(data.size.width)}
// // //                 className="absolute top-0 right-0 h-full shadow-lg border-l border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
// // //               >
// // //                 <div className="h-full relative">
// // //                   {/* Collapse Button */}
// // //                   <button
// // //                     onClick={() => setNotesOpen(false)}
// // //                     className="absolute left-0 top-1/2 -translate-x-full transform bg-primary text-white px-1 py-1 rounded-l"
// // //                   >
// // //                     ❮
// // //                   </button>

// // //                   <div className="p-4 h-full flex flex-col">
// // //                     <h2 className="text-lg font-bold mb-2">Notes</h2>
// // //                     <textarea
// // //                       className="w-full flex-1 p-2 rounded border dark:bg-gray-900 dark:border-gray-600"
// // //                       placeholder="Write your notes here..."
// // //                     />
// // //                   </div>
// // //                 </div>
// // //               </ResizableBox>
// // //             )}

// // //             {/* Reopen Button */}
// // //             {!notesOpen && (
// // //               <button
// // //                 onClick={() => setNotesOpen(true)}
// // //                 className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-primary text-white px-2 py-2 rounded-l"
// // //               >
// // //                 ❯
// // //               </button>
// // //             )}
// // //           </div>
// // //         )}
// // //       </div>
// // //     </div>
// // //   );
// // // }
