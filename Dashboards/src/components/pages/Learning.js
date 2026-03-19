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