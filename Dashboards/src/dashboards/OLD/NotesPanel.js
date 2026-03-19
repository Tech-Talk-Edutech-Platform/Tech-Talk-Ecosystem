
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
