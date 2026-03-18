import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ResizableBox } from "react-resizable";
import { ArrowLeft, Sun, Moon } from "lucide-react";
import "react-resizable/css/styles.css";
import Playground from "./Playground";
import ScratchEditor from "./Scratch";
import BlocklyEditor from "./Blockly";
import NotesPanel from "./NotesPanel";
import CountdownRing from "../CountdownRing"; // ✅ ADD THIS
import { supabase } from "../../supabase";

export default function LearningPage({ user }) { // ✅ FIXED
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("playground");
  const [darkMode, setDarkMode] = useState(true);
  const [notesOpen, setNotesOpen] = useState(true);
  const [notesWidth, setNotesWidth] = useState(320);
  const [classStarted, setClassStarted] = useState(false);

  const [nextClass, setNextClass] = useState(null);

  // ✅ Fetch next class
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

  // ✅ Auto open video when coming from dashboard
  // useEffect(() => {
  //   if (location.state?.openVideo) {
  //     setClassStarted(true);
  //     setActiveTab("video");
  //   }
  // }, [location.state]);
  useEffect(() => {
    if (location.state?.openVideo) {
      setClassStarted(true);
      setActiveTab("video");

      // ✅ USE PASSED DATA INSTANTLY
      if (location.state.classData) {
        setNextClass(location.state.classData);
      }
    }
  }, [location.state]);

  // ✅ Persist class state
  useEffect(() => {
    if (localStorage.getItem("class_in_progress") === "true") {
      setClassStarted(true);
    }
  }, []);

  return (
    <div className={`min-h-screen font-poppins transition-colors duration-300 ${darkMode ? "bg-gray-900 text-gray-200" : "bg-orange-50 text-gray-900"
      }`}>

      {/* Header */}
      <div className={`flex justify-between items-center p-3 border-b-4 ${darkMode ? "border-gray-700 bg-gray-800" : "border-yellow-400 bg-white"
        }`}>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-black shadow-lg"
        >
          <ArrowLeft size={22} strokeWidth={3} />
          <span className="hidden md:inline">My Dashboard</span>
        </button>

        {/* Tabs */}
        <div className="flex justify-center gap-2 md:gap-4">
          {["playground", "scratch", "blockly", ...(classStarted ? ["video"] : [])].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-black rounded-xl transition-all ${activeTab === tab
                ? "bg-yellow-400 text-gray-900 shadow-md"
                : darkMode
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-500 hover:text-indigo-600"
                }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Dark mode */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-2xl border-2 ${darkMode
            ? "border-gray-600 bg-gray-700 text-yellow-400"
            : "border-yellow-200 bg-yellow-50 text-orange-500"
            }`}
        >
          {darkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </div>

      {/* Main */}
      <div className="relative h-[calc(100vh-80px)] overflow-hidden">

        {/* ✅ VIDEO TAB */}
        {activeTab === "video" && classStarted && (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
            <div className="bg-white dark:bg-gray-800 p-10 rounded-[40px] shadow-2xl border-b-8 border-indigo-500 max-w-xl flex flex-col items-center">

              <span className="text-6xl mb-4 block">📺</span>

              <h2 className="text-3xl font-black mb-6 text-indigo-500">
                {nextClass ? "Next Class Countdown" : "No Upcoming Class"}
              </h2>

              {/* ✅ Animated Ring */}
              {/* {nextClass && (
                <CountdownRing startTime={nextClass.start_time} />
              )} */}
              {nextClass && (
                <CountdownRing
                  startTime={nextClass.start_time}
                  onStart={() => setClassStarted(true)}
                />
              )}

              {/* Class title */}
              {nextClass && (
                <p className="mt-6 text-gray-400 font-bold">
                  {nextClass.class_title}
                </p>
              )}

              {/* Join */}
              {nextClass && (
                <button
                  onClick={() => window.open(nextClass.meet_link, "_blank")}
                  className="mt-6 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black shadow-lg"
                >
                  JOIN CLASS 🚀
                </button>
              )}
            </div>
          </div>
        )}

        {/* Playground */}
        {activeTab === "playground" && (
          <div className="w-full h-full flex">
            <div className="flex-1 overflow-hidden">
              <Playground darkMode={darkMode} />
            </div>

            {notesOpen && (
              <ResizableBox
                width={notesWidth}
                height={Infinity}
                axis="x"
                resizeHandles={["w"]}
                minConstraints={[240, Infinity]}
                maxConstraints={[600, Infinity]}
                onResizeStop={(e, data) => setNotesWidth(data.size.width)}
                className={`relative h-full border-l-4 ${darkMode ? "border-gray-700 bg-gray-800" : "border-yellow-400 bg-white"
                  }`}
              >
                <button
                  onClick={() => setNotesOpen(false)}
                  className="absolute -left-5 top-1/2 transform -translate-y-1/2 bg-yellow-400 h-16 w-5"
                >
                  ❮
                </button>
                <div className="flex-1 overflow-auto p-2">
                  <NotesPanel />
                </div>
              </ResizableBox>
            )}

            {!notesOpen && (
              <button
                onClick={() => setNotesOpen(true)}
                className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-yellow-400 h-16 w-8"
              >
                ❯
              </button>
            )}
          </div>
        )}

        {/* Scratch */}
        {activeTab === "scratch" && (
          <div className="w-full h-full">
            <ScratchEditor />
          </div>
        )}

        {/* Blockly */}
        {activeTab === "blockly" && (
          <div className="w-full h-full overflow-hidden">
            <BlocklyEditor darkMode={darkMode} />
          </div>
        )}
      </div>
    </div>
  );
}
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { ResizableBox } from "react-resizable";
// import { ArrowLeft, Sun, Moon } from "lucide-react";
// import "react-resizable/css/styles.css";
// import Playground from "./Playground";
// import ScratchEditor from "./Scratch";
// import BlocklyEditor from "./Blockly";
// import NotesPanel from "./NotesPanel";
// import { useLocation } from "react-router-dom";
// import { supabase } from "../../supabase";

// export default function LearningPage(user.id, user.role) {
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState("playground"); // video, playground, scratch, blockly
//   const [darkMode, setDarkMode] = useState(true);
//   const [notesOpen, setNotesOpen] = useState(true);
//   const [notesWidth, setNotesWidth] = useState(320);
//   const [classStarted, setClassStarted] = useState(false);

//   const [nextClass, setNextClass] = useState(null);
//   const [timeLeft, setTimeLeft] = useState("");

//   useEffect(() => {
//     const fetchNextClass = async () => {
//       const { data, error } = await supabase.rpc("get_next_class", {
//         user_id: user?.id, // pass correct user id
//         role: user?.role,
//       });

//       if (!error && data) {
//         setNextClass(data);
//       }
//     };

//     fetchNextClass();
//   }, []);
//   useEffect(() => {
//     if (!nextClass) return;

//     const interval = setInterval(() => {
//       const now = new Date();
//       const start = new Date(nextClass.start_time);
//       const diff = start - now;

//       if (diff <= 0) {
//         setTimeLeft("LIVE NOW 🚀");
//         clearInterval(interval);
//         return;
//       }

//       const minutes = Math.floor(diff / 60000);
//       const seconds = Math.floor((diff % 60000) / 1000);

//       setTimeLeft(`${minutes}m ${seconds}s`);
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [nextClass]);



//   const location = useLocation();

//   useEffect(() => {
//     if (location.state?.openVideo) {
//       setClassStarted(true);
//       setActiveTab("video");
//     }
//   }, [location.state]);
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
//       <div className={`flex justify-between items-center p-3 border-b-4 ${darkMode ? "border-gray-700 bg-gray-800" : "border-yellow-400 bg-white"
//         }`}>

//         {/* THE BACK BUTTON */}
//         <button
//           onClick={() => navigate(-1)}
//           className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-black shadow-lg transform hover:scale-105 transition-all"
//         >
//           <ArrowLeft size={22} strokeWidth={3} />
//           <span className="hidden md:inline">My Dashboard</span>
//         </button>

//         {/* Navigation Tabs */}
//         <div className="flex justify-center gap-2 md:gap-4">
//           {/* {["video", "playground", "scratch", "blockly"].map((tab) => ( */}
//           {["playground", "scratch", "blockly", ...(classStarted ? ["video"] : [])].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`px-4 py-2 font-black rounded-xl transition-all ${activeTab === tab
//                 ? "bg-yellow-400 text-gray-900 shadow-md translate-y-[-2px]"
//                 : darkMode
//                   ? "text-gray-400 hover:text-white"
//                   : "text-gray-500 hover:text-indigo-600"
//                 }`}
//             >
//               {tab.toUpperCase()}
//             </button>
//           ))}
//         </div>

//         {/* Mode Toggle */}
//         <button
//           onClick={() => setDarkMode(!darkMode)}
//           className={`p-2 rounded-2xl border-2 shadow-sm transition-all hover:rotate-12 ${darkMode
//             ? "border-gray-600 bg-gray-700 text-yellow-400"
//             : "border-yellow-200 bg-yellow-50 text-orange-500"
//             }`}
//         >
//           {darkMode ? <Sun size={24} fill="currentColor" /> : <Moon size={24} fill="currentColor" />}
//         </button>
//       </div>

//       {/* Main Area */}
//       <div className="relative h-[calc(100vh-80px)] overflow-hidden">
//         {/* Video Tab */}
//         {/* {activeTab === "video" && ( */}
//         {/* {activeTab === "video" && classStarted && (
//           <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
//             <div className="bg-white dark:bg-gray-800 p-10 rounded-[40px] shadow-2xl border-b-8 border-indigo-500">
//               <span className="text-6xl mb-4 block">📺</span>
//               <h2 className="text-4xl font-black mb-4 text-indigo-500">Video Session</h2>
//               <p className="text-xl font-bold text-gray-400">
//                 Ready to watch? Video is currently resting!
//               </p>
//             </div>
//           </div>
//         )} */}
//         {/* {activeTab === "video" && (
//           <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
//             <div className="bg-white dark:bg-gray-800 p-10 rounded-[40px] shadow-2xl border-b-8 border-indigo-500 max-w-xl">

//               <span className="text-6xl mb-4 block">📺</span>

//               <h2 className="text-4xl font-black mb-4 text-indigo-500">
//                 {timeLeft === "LIVE NOW 🚀" ? "Class is Live!" : "Next Class Starts In"}
//               </h2>

//               {activeTab === "video" && (
//   <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
//     <div className="bg-white dark:bg-gray-800 p-10 rounded-[40px] shadow-2xl border-b-8 border-indigo-500 max-w-xl flex flex-col items-center">

//       <span className="text-6xl mb-4 block">📺</span>

//       <h2 className="text-3xl font-black mb-6 text-indigo-500">
//         {nextClass ? "Next Class Countdown" : "No Upcoming Class"}
//       </h2>

//       {/* 🔥 Animated Ring */}
//         {nextClass && (
//           <CountdownRing startTime={nextClass.start_time} />
//         )}

//         {/* Class title */}
//         {nextClass && (
//           <p className="mt-6 text-gray-400 font-bold">
//             {nextClass.class_title}
//           </p>
//         )}

//         {/* Join button */}
//         {nextClass && (
//           <button
//             onClick={() => window.open(nextClass.meet_link, "_blank")}
//             className="mt-6 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black shadow-lg"
//           >
//             JOIN CLASS 🚀
//           </button>
//         )}
//       </div>
//     </div>
//   )
// }
// {/* COUNTDOWN */ }
// <div className="text-5xl font-black text-yellow-400 mb-6 animate-pulse">
//   {timeLeft || "Loading..."}
// </div>

// {/* CLASS INFO */ }
// {
//   nextClass && (
//     <div className="text-sm text-gray-400 font-bold">
//       {nextClass.class_title}
//     </div>
//   )
// }

// {/* JOIN BUTTON WHEN READY */ }
// {
//   timeLeft === "LIVE NOW 🚀" && (
//     <button
//       onClick={() => window.open(nextClass.meet_link, "_blank")}
//       className="mt-6 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black shadow-lg"
//     >
//       JOIN CLASS 🚀
//     </button>
//   )
// }
//             </div >
//           </div >
//         )} */}
// {/* Playground Tab */ }
// {
//   activeTab === "playground" && (
//     <div className="w-full h-full flex">
//       {/* Playground section */}
//       <div className="flex-1 overflow-hidden">
//         <Playground darkMode={darkMode} />
//       </div>

//       {/* Notes panel */}
//       {notesOpen && (
//         <ResizableBox
//           width={notesWidth}
//           height={Infinity}
//           axis="x"
//           resizeHandles={["w"]}
//           minConstraints={[240, Infinity]}
//           maxConstraints={[600, Infinity]}
//           onResizeStop={(e, data) => setNotesWidth(data.size.width)}
//           className={`relative h-full border-l-4 shadow-2xl flex flex-col ${darkMode ? "border-gray-700 bg-gray-800" : "border-yellow-400 bg-white"
//             }`}
//         >
//           <button
//             onClick={() => setNotesOpen(false)}
//             className="absolute -left-5 top-1/2 transform -translate-y-1/2 bg-yellow-400 text-gray-900 font-bold h-16 w-5 rounded-l-xl shadow-lg flex items-center justify-center"
//           >
//             ❮
//           </button>
//           <div className="flex-1 overflow-auto p-2">
//             <NotesPanel />
//           </div>
//         </ResizableBox>
//       )}

//       {/* Expand button when closed */}
//       {!notesOpen && (
//         <button
//           onClick={() => setNotesOpen(true)}
//           className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-yellow-400 text-gray-900 font-bold h-16 w-8 rounded-l-xl shadow-lg flex items-center justify-center hover:pr-2 transition-all"
//         >
//           ❯
//         </button>
//       )}
//     </div>
//   )
// }

// {/* Scratch Tab */ }
// {
//   activeTab === "scratch" && (
//     <div className="w-full h-full">
//       <ScratchEditor />
//     </div>
//   )
// }

// {/* Blockly Tab */ }
// {/* Blockly Tab */ }
// {
//   activeTab === "blockly" && (
//     <div className="w-full h-full overflow-hidden">
//       {/* Removed p-8, max-w-6xl, and fixed height to allow it to fill the entire screen */}
//       <BlocklyEditor darkMode={darkMode} />
//     </div>
//   )
// }

//       </div >
//     </div >
//   );
// }
// // // src/pages/LearningPage.js
// // import React, { useState } from "react";
// // import { ResizableBox } from "react-resizable";
// // import "react-resizable/css/styles.css";
// // import Playground from "./Playground";
// // import ScratchEditor from "./Scratch";
// // import BlocklyEditor from "./Blockly";
// // import NotesPanel from "./NotesPanel";

// // export default function LearningPage() {
// //   const [activeTab, setActiveTab] = useState("video"); // video, playground, scratch, blockly
// //   const [darkMode, setDarkMode] = useState(true);
// //   const [notesOpen, setNotesOpen] = useState(true);
// //   const [notesWidth, setNotesWidth] = useState(320);

// //   return (
// //     <div
// //       className={`min-h-screen font-poppins ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
// //         }`}
// //     >
// //       {/* Header */}
// //       <div className="flex justify-between items-center p-2 border-b border-gray-300 dark:border-gray-700">
// //         <h1 className="text-2xl font-bold text-primary">Code Environment</h1>

// //         <div className="flex justify-center gap-6">
// //           {["video", "playground", "scratch", "blockly"].map((tab) => (
// //             <button
// //               key={tab}
// //               onClick={() => setActiveTab(tab)}
// //               className={`px-4 py-2 font-semibold rounded-t ${activeTab === tab
// //                 ? "border-b-2 border-primary text-primary"
// //                 : "text-gray-500 hover:text-primary"
// //                 }`}
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
// //         {/* Video Tab */}
// //         {activeTab === "video" && (
// //           <div className="w-full h-full flex flex-col items-center justify-center text-center">
// //             <h2 className="text-3xl font-bold mb-4">📺 Video Session</h2>
// //             <p className="text-gray-600 dark:text-gray-400">
// //               Video integration is currently disabled.
// //             </p>
// //           </div>
// //         )}

// //         {/* Playground Tab */}
// //         {activeTab === "playground" && (
// //           <div className="w-full h-full flex">
// //             {/* Playground section */}
// //             <div className="flex-1 overflow-hidden">
// //               <Playground darkMode={darkMode} />
// //             </div>

// //             {/* Notes panel */}
// //             {notesOpen && (
// //               <ResizableBox
// //                 width={notesWidth}
// //                 height={Infinity}
// //                 axis="x"
// //                 resizeHandles={["w"]}
// //                 minConstraints={[240, Infinity]}
// //                 maxConstraints={[600, Infinity]}
// //                 onResizeStop={(e, data) => setNotesWidth(data.size.width)}
// //                 className="relative h-full border-l border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg flex flex-col"
// //               >
// //                 <button
// //                   onClick={() => setNotesOpen(false)}
// //                   className="absolute -left-3 top-1/2 transform -translate-y-1/2 bg-primary text-white px-1 py-1 rounded-l"
// //                 >
// //                   ❮
// //                 </button>
// //                 <NotesPanel />
// //               </ResizableBox>
// //             )}

// //             {/* Expand button when closed */}
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

// //         {/* Scratch Tab */}
// //         {activeTab === "scratch" && (
// //           <div className="w-full h-full">
// //             <ScratchEditor />
// //           </div>
// //         )}

// //         {/* Blockly Tab */}
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

// // // import React, { useState } from "react";
// // // import { ResizableBox } from "react-resizable";
// // // import "react-resizable/css/styles.css";
// // // import Playground from "./Playground";
// // // import ScratchEditor from "./Scratch";
// // // import BlocklyEditor from "./Blockly";
// // // import NotesPanel from "./NotesPanel";

// // // export default function LearningPage() {
// // //   const [activeTab, setActiveTab] = useState("video"); // video, playground, scratch, blockly
// // //   const [darkMode, setDarkMode] = useState(true);
// // //   const [notesOpen, setNotesOpen] = useState(true);
// // //   const [notesWidth, setNotesWidth] = useState(320);

// // //   return (
// // //     <div
// // //       className={`min-h-screen font-poppins ${
// // //         darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
// // //       }`}
// // //     >
// // //       {/* Header */}
// // //       <div className="flex justify-between items-center p-2 border-b border-gray-300 dark:border-gray-700">
// // //         <h1 className="text-2xl font-bold text-primary">Code Environment</h1>

// // //         <div className="flex justify-center gap-6">
// // //           {["video", "playground", "scratch", "blockly"].map((tab) => (
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

// // //       {/* Main Area */}
// // //       <div className="relative h-[90vh] overflow-hidden">
// // //         {/* Video Tab */}
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
// // //           <div className="w-full h-full flex">
// // //             {/* Playground section */}
// // //             <div className="flex-1 overflow-hidden">
// // //               <Playground darkMode={darkMode} />
// // //             </div>

// // //             {/* Notes panel */}
// // //             {notesOpen && (
// // //               <ResizableBox
// // //                 width={notesWidth}
// // //                 height={Infinity}
// // //                 axis="x"
// // //                 minConstraints={[240, Infinity]}
// // //                 maxConstraints={[600, Infinity]}
// // //                 onResizeStop={(e, data) => setNotesWidth(data.size.width)}
// // //                 className="h-full border-l border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg flex flex-col"
// // //               >
// // //                 <div className="relative h-full w-full">
// // //                   <button
// // //                     onClick={() => setNotesOpen(false)}
// // //                     className="absolute -left-3 top-1/2 transform -translate-y-1/2 bg-primary text-white px-1 py-1 rounded-l"
// // //                   >
// // //                     ❮
// // //                   </button>
// // //                   <NotesPanel />
// // //                 </div>
// // //               </ResizableBox>
// // //             )}

// // //             {/* Expand button when closed */}
// // //             {!notesOpen && (
// // //               // <button
// // //               //   onClick={() => setNotesOpen(true)}
// // //               //   className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-primary text-white px-2 py-2 rounded-l"
// // //               // >
// // //               //   ❯
// // //               // </button>
// // //                <button
// // //     onClick={() => setNotesOpen(true)}
// // //     className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-primary text-white px-2 py-2 rounded-l"
// // //   >
// // //     ❯
// // //     {/* ❮ */}
// // //   </button>
// // //             )}
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
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // // // src/pages/Learning.js
// // // // import React, { useState } from "react";
// // // // import { ResizableBox } from "react-resizable";
// // // // import "react-resizable/css/styles.css";
// // // // import Playground from "./Playground";
// // // // import ScratchEditor from "./Scratch";
// // // // import BlocklyEditor from "./Blockly";
// // // // import NotesPanel from "../components/NotesPanel";


// // // // export default function LearningPage() {
// // // //   const [activeTab, setActiveTab] = useState("video"); // video, playground, scratch, blockly
// // // //   const [darkMode, setDarkMode] = useState(false);
// // // //   const [notesOpen, setNotesOpen] = useState(true);
// // // //   const [notesWidth, setNotesWidth] = useState(320);

// // // //   return (
// // // //     <div
// // // //       className={`min-h-screen font-poppins ${
// // // //         darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
// // // //       }`}
// // // //     >
// // // //       {/* Header */}
// // // //       <div className="flex justify-between items-center p-2 border-b border-gray-300 dark:border-gray-700">
// // // //         <h1 className="text-2xl font-bold text-primary">Code Environment</h1>

// // // //         <div className="flex justify-center gap-6">
// // // //           {["video", "playground", "scratch", "blockly"].map((tab) => (
// // // //             <button
// // // //               key={tab}
// // // //               onClick={() => setActiveTab(tab)}
// // // //               className={`px-4 py-2 font-semibold rounded-t ${
// // // //                 activeTab === tab
// // // //                   ? "border-b-2 border-primary text-primary"
// // // //                   : "text-gray-500 hover:text-primary"
// // // //               }`}
// // // //             >
// // // //               {tab.charAt(0).toUpperCase() + tab.slice(1)}
// // // //             </button>
// // // //           ))}
// // // //         </div>

// // // //         <button
// // // //           onClick={() => setDarkMode(!darkMode)}
// // // //           className="px-3 py-1 rounded border border-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700"
// // // //         >
// // // //           {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
// // // //         </button>
// // // //       </div>

// // // //       {/* Main Area */}
// // // //       <div className="relative h-[90vh] overflow-hidden">
// // // //         {activeTab === "video" && (
// // // //           <div className="w-full h-full flex flex-col items-center justify-center text-center">
// // // //             <h2 className="text-3xl font-bold mb-4">📺 Video Session</h2>
// // // //             <p className="text-gray-600 dark:text-gray-400">
// // // //               Video integration is currently disabled.
// // // //             </p>
// // // //           </div>
// // // //         )}

// // // //         {activeTab === "playground" && (
// // // //           <div className="w-full h-full flex">
// // // //             {/* Playground section (will shrink when notes open) */}
// // // //             <div className="flex-1 overflow-hidden">
// // // //               <Playground darkMode={darkMode} />
// // // //             </div>

// // // //             {/* Notes panel (now flexed, not absolute) */}
// // // //             {notesOpen && (
// // // //               <ResizableBox
// // // //                 width={notesWidth}
// // // //                 height={Infinity}
// // // //                 axis="x"
// // // //                 minConstraints={[240, Infinity]}
// // // //                 maxConstraints={[600, Infinity]}
// // // //                 onResizeStop={(e, data) => setNotesWidth(data.size.width)}
// // // //                 className="h-full border-l border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg flex flex-col"
// // // //               >
// // // //                 <div className="relative h-full w-full">
// // // //                   <button
// // // //                     onClick={() => setNotesOpen(false)}
// // // //                     className="absolute -left-3 top-1/2 transform -translate-y-1/2 bg-primary text-white px-1 py-1 rounded-l"
// // // //                   >
// // // //                     ❮
// // // //                   </button>

// // // //                   <div className="p-4 h-full flex flex-col bg-gray-100 dark:bg-gray-800 rounded-lg">
// // // //                     <h2 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-200">Notes</h2>
// // // //                     <textarea
// // // //                       className="w-full flex-1 p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
// // // //                       placeholder="Write your notes here..."
// // // //                     />
// // // //                   </div>
// // // //                 </div>
// // // //               </ResizableBox>
// // // //             )}

// // // //             {!notesOpen && (
// // // //               <button
// // // //                 onClick={() => setNotesOpen(true)}
// // // //                 className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-primary text-white px-2 py-2 rounded-l"
// // // //               >
// // // //                 ❯
// // // //               </button>
// // // //             )}
// // // //           </div>
// // // //         )}

// // // //         {activeTab === "scratch" && (
// // // //           <div className="w-full h-full">
// // // //             <ScratchEditor />
// // // //           </div>
// // // //         )}

// // // //         {activeTab === "blockly" && (
// // // //           <div className="p-5">
// // // //             <h2 className="text-2xl font-bold mb-4">Blockly Code Runner</h2>
// // // //             <BlocklyEditor darkMode={darkMode} />
// // // //           </div>
// // // //         )}
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }

// // // // // // src/pages/Learning.js
// // // // // import React, { useState } from "react";
// // // // // import { ResizableBox } from "react-resizable";
// // // // // import "react-resizable/css/styles.css";
// // // // // import Playground from "./Playground";
// // // // // import ScratchEditor from "./Scratch";
// // // // // import BlocklyEditor from "./Blockly";

// // // // // export default function LearningPage() {
// // // // //   const [activeTab, setActiveTab] = useState("video"); // video, playground, notes, scratch, blockly
// // // // //   const [darkMode, setDarkMode] = useState(false);
// // // // //   const [notesOpen, setNotesOpen] = useState(true);
// // // // //   const [notesWidth, setNotesWidth] = useState(320);

// // // // //   return (
// // // // //     <div
// // // // //       className={`min-h-screen font-poppins ${
// // // // //         darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
// // // // //       }`}
// // // // //     >
// // // // //       {/* Header + Tabs + Dark Mode Toggle */}
// // // // //       <div className="flex justify-between items-center p-2 border-b border-gray-300 dark:border-gray-700">
// // // // //         <h1 className="text-2xl font-bold text-primary">Code Environment</h1>

// // // // //         <div className="flex justify-center gap-6">
// // // // //           {["video", "playground", "notes", "scratch", "blockly"].map((tab) => (
// // // // //             <button
// // // // //               key={tab}
// // // // //               onClick={() => setActiveTab(tab)}
// // // // //               className={`px-4 py-2 font-semibold rounded-t ${
// // // // //                 activeTab === tab
// // // // //                   ? "border-b-2 border-primary text-primary"
// // // // //                   : "text-gray-500 hover:text-primary"
// // // // //               }`}
// // // // //             >
// // // // //               {tab.charAt(0).toUpperCase() + tab.slice(1)}
// // // // //             </button>
// // // // //           ))}
// // // // //         </div>

// // // // //         <button
// // // // //           onClick={() => setDarkMode(!darkMode)}
// // // // //           className="px-3 py-1 rounded border border-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700"
// // // // //         >
// // // // //           {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
// // // // //         </button>
// // // // //       </div>

// // // // //       {/* Main Content Area */}
// // // // //       <div className="relative flex-1 h-[90vh] overflow-hidden">
// // // // //         {/* Video Tab (currently empty placeholder) */}
// // // // //         {activeTab === "video" && (
// // // // //           <div className="w-full h-full flex flex-col items-center justify-center text-center">
// // // // //             <h2 className="text-3xl font-bold mb-4">📺 Video Session</h2>
// // // // //             <p className="text-gray-600 dark:text-gray-400">
// // // // //               Video integration is currently disabled.
// // // // //             </p>
// // // // //           </div>
// // // // //         )}

// // // // //         {/* Playground Tab */}
// // // // //         {activeTab === "playground" && (
// // // // //           <div className="w-full h-full">
// // // // //             <Playground darkMode={darkMode} />
// // // // //           </div>
// // // // //         )}

// // // // //         {/* Scratch Tab */}
// // // // //         {activeTab === "scratch" && (
// // // // //           <div className="w-full h-full">
// // // // //             <ScratchEditor />
// // // // //           </div>
// // // // //         )}

// // // // //         {/* Blockly Tab */}
// // // // //         {activeTab === "blockly" && (
// // // // //           <div className="p-5">
// // // // //             <h2 className="text-2xl font-bold mb-4">Blockly Code Runner</h2>
// // // // //             <BlocklyEditor darkMode={darkMode} />
// // // // //           </div>
// // // // //         )}

// // // // //         {/* Notes Tab */}
// // // // //         {activeTab === "notes" && (
// // // // //           <div className="w-full h-full relative flex">
// // // // //             {/* Main Playground Editor */}
// // // // //             <div className="flex-1">
// // // // //               <Playground darkMode={darkMode} />
// // // // //             </div>

// // // // //             {/* Resizable Notes Panel */}
// // // // //             {notesOpen && (
// // // // //               <ResizableBox
// // // // //                 width={notesWidth}
// // // // //                 height={Infinity}
// // // // //                 axis="x"
// // // // //                 minConstraints={[240, Infinity]}
// // // // //                 maxConstraints={[600, Infinity]}
// // // // //                 resizeHandles={["w"]}
// // // // //                 onResizeStop={(e, data) => setNotesWidth(data.size.width)}
// // // // //                 className="absolute top-0 right-0 h-full shadow-lg border-l border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
// // // // //               >
// // // // //                 <div className="h-full relative">
// // // // //                   {/* Collapse Button */}
// // // // //                   <button
// // // // //                     onClick={() => setNotesOpen(false)}
// // // // //                     className="absolute left-0 top-1/2 -translate-x-full transform bg-primary text-white px-1 py-1 rounded-l"
// // // // //                   >
// // // // //                     ❮
// // // // //                   </button>

// // // // //                   <div className="p-4 h-full flex flex-col">
// // // // //                     <h2 className="text-lg font-bold mb-2">Notes</h2>
// // // // //                     <textarea
// // // // //                       className="w-full flex-1 p-2 rounded border dark:bg-gray-900 dark:border-gray-600"
// // // // //                       placeholder="Write your notes here..."
// // // // //                     />
// // // // //                   </div>
// // // // //                 </div>
// // // // //               </ResizableBox>
// // // // //             )}

// // // // //             {/* Reopen Button */}
// // // // //             {!notesOpen && (
// // // // //               <button
// // // // //                 onClick={() => setNotesOpen(true)}
// // // // //                 className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-primary text-white px-2 py-2 rounded-l"
// // // // //               >
// // // // //                 ❯
// // // // //               </button>
// // // // //             )}
// // // // //           </div>
// // // // //         )}
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // }
