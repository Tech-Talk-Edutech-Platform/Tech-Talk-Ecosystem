import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function MyHomework({ studentId }) {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});

  useEffect(() => {
    fetchAssignments();
  }, []);

  async function fetchAssignments() {
    const { data } = await supabase
      .from("student_assignments")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    setAssignments(data || []); // always an array
  }

  async function submitAssignment(id) {
    const text = submissions[id];

    if (!text) return alert("Write your answer first");

    const { error } = await supabase
      .from("student_assignments")
      .update({
        submission_text: text,
        status: "submitted",
        submitted_at: new Date(),
      })
      .eq("id", id);

    if (!error) {
      alert("Homework submitted!");
      fetchAssignments();
    }
  }

  if (assignments.length === 0) {
    return (
      <p className="text-center text-slate-400 italic mt-4">
        No assignments yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((a) => (
        <div key={a.id} className="border p-4 rounded-xl">
          <h3 className="font-bold">{a.task_name}</h3>
          <p className="text-sm text-gray-600">{a.description}</p>

          <p className="text-xs mt-2 font-bold">Status: {a.status}</p>

          {a.status === "pending" && (
            <>
              <textarea
                className="w-full border p-2 mt-2 rounded"
                placeholder="Write your answer..."
                value={submissions[a.id] || ""}
                onChange={(e) =>
                  setSubmissions({ ...submissions, [a.id]: e.target.value })
                }
              />

              <button
                onClick={() => submitAssignment(a.id)}
                className="mt-2 bg-blue-600 text-white px-3 py-2 rounded"
              >
                Submit Homework
              </button>
            </>
          )}

          {a.status === "submitted" && (
            <p className="text-amber-600 text-sm mt-2">
              Submitted. Waiting for tutor review.
            </p>
          )}

          {a.status === "completed" && (
            <p className="text-green-600 text-sm mt-2">Reviewed by tutor</p>
          )}
        </div>
      ))}
    </div>
  );
}
