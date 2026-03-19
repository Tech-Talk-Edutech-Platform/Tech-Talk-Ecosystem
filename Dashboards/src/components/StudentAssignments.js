import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function StudentAssignments({ tutorId, students }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [newAssignment, setNewAssignment] = useState({
    student_id: "",
    task_name: "",
    category: "",
    description: "",
  });

  // Status badge styles
  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case "submitted":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "pending":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Fetch assignments
  const fetchAssignments = async () => {
    if (!tutorId) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("student_assignments")
      .select(`
        id,
        task_name,
        status,
        category,
        description,
        submission_text,
        submission_link,
        students ( full_name )
      `)
      .eq("tutor_id", tutorId)
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      const formatted = data.map((item) => ({
        id: item.id,
        name: item.students?.full_name || "Unknown Student",
        task: item.task_name,
        description: item.description,
        category: item.category,
        submission_text: item.submission_text,
        submission_link: item.submission_link,
        icon:
          item.category === "Python"
            ? "🐍"
            : item.category === "Web Dev"
              ? "🎨"
              : "📘",
        status: item.status,
      }));
      setAssignments(formatted);
    } else {
      setAssignments([]); // fallback if data is null
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAssignments();
  }, [tutorId]);

  // Mark assignment completed
  const markCompleted = async (id) => {
    const { error } = await supabase
      .from("student_assignments")
      .update({
        status: "completed",
        grade: "Reviewed",
      })
      .eq("id", id);

    if (!error) fetchAssignments();
  };

  // Create assignment
  const handleCreateAssignment = async () => {
    if (!newAssignment.student_id || !newAssignment.task_name) return;

    const { error } = await supabase.from("student_assignments").insert({
      tutor_id: tutorId,
      student_id: newAssignment.student_id,
      task_name: newAssignment.task_name,
      category: newAssignment.category,
      description: newAssignment.description,
      status: "pending",
    });

    if (!error) {
      fetchAssignments();
      setShowModal(false);
      setNewAssignment({
        student_id: "",
        task_name: "",
        category: "",
        description: "",
      });
    }
  };

  return (
    <>
      {/* Assignment Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-6">
        <div className="flex justify-between mb-6 items-center">
          <h3 className="font-bold text-slate-800">Assignments</h3>
          <button
            onClick={() => setShowModal(true)}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black hover:bg-blue-700"
          >
            + New Assignment
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-slate-400">Loading...</p>
        ) : !Array.isArray(assignments) || assignments.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">
            No assignments found.
          </p>
        ) : (
          <div className="space-y-4">
            {assignments.map((item) => (
              <div key={item.id} className="p-4 border rounded-xl bg-white">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.task}</p>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-2 py-1 rounded border ${getStatusStyles(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-2">
                  {item.description}
                </p>

                {item.submission_text && (
                  <div className="bg-slate-50 p-3 rounded mt-3">
                    <p className="text-[10px] text-slate-400 font-bold">
                      Student Submission
                    </p>
                    <p className="text-sm">{item.submission_text}</p>
                    {item.status === "submitted" && (
                      <button
                        onClick={() => markCompleted(item.id)}
                        className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-xs"
                      >
                        Mark Reviewed
                      </button>
                    )}
                  </div>
                )}

                {item.submission_link && (
                  <button
                    onClick={() =>
                      window.open(item.submission_link, "_blank")
                    }
                    className="mt-2 text-xs text-blue-600 underline"
                  >
                    Open Submission Link
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Assignment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-[320px]">
            <h3 className="font-bold mb-4">New Assignment</h3>

            <select
              className="w-full mb-2 p-2 border rounded"
              value={newAssignment.student_id}
              onChange={(e) =>
                setNewAssignment({ ...newAssignment, student_id: e.target.value })
              }
            >
              <option value="">Select Student</option>
              {students?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Task Name"
              className="w-full mb-2 p-2 border rounded"
              value={newAssignment.task_name}
              onChange={(e) =>
                setNewAssignment({ ...newAssignment, task_name: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Category"
              className="w-full mb-2 p-2 border rounded"
              value={newAssignment.category}
              onChange={(e) =>
                setNewAssignment({ ...newAssignment, category: e.target.value })
              }
            />

            <textarea
              placeholder="Description"
              className="w-full mb-4 p-2 border rounded"
              value={newAssignment.description}
              onChange={(e) =>
                setNewAssignment({ ...newAssignment, description: e.target.value })
              }
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 bg-slate-200 rounded text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAssignment}
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
