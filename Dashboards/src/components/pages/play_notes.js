// src/pages/LearningPage.js
import React, { useState } from "react";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import Playground from "./Playground";
import ScratchEditor from "./Scratch";
import BlocklyEditor from "./Blockly";
import NotesPanel from "./NotesPanel";

export default function NotesPage() {
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
          {["playground"].map((tab) => (
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
