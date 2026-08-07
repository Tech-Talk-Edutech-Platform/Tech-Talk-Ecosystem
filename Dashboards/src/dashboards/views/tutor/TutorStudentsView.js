import React, { useState, useEffect } from "react";
import { BookOpen, Search, FileText, User, Calendar, ExternalLink } from "lucide-react";
import { supabase } from "../../../supabase";

export default function TutorStudentsView({ userId }) {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentNotes, setStudentNotes] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch students assigned to this tutor
  useEffect(() => {
    const fetchAssignedStudents = async () => {
      if (!userId) return;
      setLoadingStudents(true);
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("assigned_tutor_id", userId)
          .eq("role", "student");

        if (error) throw error;
        setStudents(data || []);
        if (data && data.length > 0) {
          setSelectedStudent(data[0]);
        }
      } catch (err) {
        console.error("Error fetching assigned students:", err);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchAssignedStudents();
  }, [userId]);

  // Fetch notes/progress for the selected student
  useEffect(() => {
    const fetchStudentNotes = async () => {
      if (!selectedStudent?.id) return;
      setLoadingNotes(true);
      try {
        const { data, error } = await supabase
          .from("student_notes") // Update to your actual notes/progress table name if different
          .select("*")
          .eq("student_id", selectedStudent.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setStudentNotes(data || []);
      } catch (err) {
        console.error("Error fetching student notes:", err);
        setStudentNotes([]);
      } finally {
        setLoadingNotes(false);
      }
    };

    fetchStudentNotes();
  }, [selectedStudent]);

  const filteredStudents = students.filter((student) =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">My Students & Notes</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review your assigned students and track their lesson notes and progress.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Students List Column */}
        <div className="lg:col-span-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-5 shadow-sm space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs font-medium focus:outline-none focus:border-purple-500"
            />
          </div>

          {loadingStudents ? (
            <div className="text-center py-12 text-gray-400 text-xs">Loading students...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">No assigned students found.</div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredStudents.map((student) => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all flex items-center gap-3 ${
                    selectedStudent?.id === student.id
                      ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                      : "hover:bg-gray-50 dark:hover:bg-white/5 text-gray-900 dark:text-white"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                    selectedStudent?.id === student.id ? "bg-white/20 text-white" : "bg-purple-50 text-purple-600"
                  }`}>
                    {student.name?.[0] || <User size={16} />}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-sm truncate">{student.name || "Student"}</h4>
                    <p className={`text-[10px] truncate ${selectedStudent?.id === student.id ? "text-purple-100" : "text-gray-400"}`}>
                      {student.email}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Student Notes & Detail View Column */}
        <div className="lg:col-span-8 space-y-6">
          {selectedStudent ? (
            <>
              {/* Student Info Card */}
              <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded-2xl flex items-center justify-center font-black text-xl">
                    {selectedStudent.name?.[0] || "S"}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-gray-900 dark:text-white">{selectedStudent.name}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{selectedStudent.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-600 px-3 py-1.5 rounded-xl">
                    Active Student
                  </span>
                </div>
              </div>

              {/* Notes Feed */}
              <div className="space-y-4">
                <h3 className="text-base font-black text-gray-900 dark:text-white">Student Notes & Progress Log</h3>

                {loadingNotes ? (
                  <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-12 text-center text-gray-400 text-xs">
                    Loading student notes...
                  </div>
                ) : studentNotes.length === 0 ? (
                  <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-12 text-center">
                    <FileText size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-bold text-sm">No notes recorded yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Notes and lesson feedback for this student will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {studentNotes.map((note) => (
                      <div
                        key={note.id}
                        className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white">{note.title || "Lesson Note"}</h4>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(note.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{note.content || note.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[32px] p-16 text-center">
              <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-bold text-sm">Select a student</p>
              <p className="text-xs text-gray-400 mt-1">Choose a student from the list to view their details and notes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}