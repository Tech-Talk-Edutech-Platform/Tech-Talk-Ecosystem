// src/components/NotesPanel.js
import React, { useEffect, useState } from "react";
// import { supabase } from "../supabaseClient"; // initialize Supabase client
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
    setLoading(true);

    const fetchTopics = async () => {
      const { data, error } = await supabase
        .from("topics")
        .select("*")
        .eq("course_id", courseId);
      if (!error) setTopics(data || []);
      setLoading(false);
    };

    fetchTopics();
  }, [courseId]);

  // Fetch notes for selected topic
  useEffect(() => {
    if (!selectedTopic) return;
    setLoading(true);

    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("topic_id", selectedTopic.id);
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

  if (loading && !selectedNote)
    return <p className="p-4 text-gray-500">Loading...</p>;

  return (
    <div className="p-4 h-full flex flex-col bg-background dark:bg-gray-900 rounded-lg overflow-y-auto transition-colors">
      <h2 className="text-lg font-bold mb-4 text-text dark:text-gray-100">Notes</h2>

      {!selectedTopic && !selectedNote && (
        <div className="flex flex-col gap-2">
          {topics.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTopic(t)}
              className="p-3 rounded-lg bg-primary dark:bg-accent shadow-card hover:bg-primary hover:text-white transition"
            >
              {t.title || t.id}
            </button>
          ))}
        </div>
      )}

      {selectedTopic && !selectedNote && (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setSelectedTopic(null)}
            className="mb-2 text-sm text-primary hover:underline self-start"
          >
            ← Back to topics
          </button>
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

          <div className="prose dark:prose-invert max-w-full overflow-x-auto p-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">
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
                    <code
                      className="bg-gray-700 text-green-300 px-1 rounded font-mono"
                      {...props}
                    >
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
  );
}
