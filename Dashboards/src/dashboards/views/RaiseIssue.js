// RaiseIssue.jsx
import { useState } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../../supabase"; // adjust path as needed

export default function RaiseIssue({ user, fetchAll }) {
  const [newIssue, setNewIssue] = useState("");

  // Safely check role; default to empty string if undefined
  const role = user?.role || "";

  // Only show if user is a tutor
  if (role !== "tutor") return null;

  const handleSubmit = async () => {
    if (!newIssue) return;
    const { error } = await supabase
      .from("issues")
      .insert({ title: newIssue, reported_by: user.id });

    if (error) {
      toast.error("Failed to report issue");
      console.error(error);
      return;
    }

    toast.success("Issue reported!");
    setNewIssue("");
    if (typeof fetchAll === "function") fetchAll(); // refresh issues
  };

  return (
    <div className="mt-6 p-4 border rounded-2xl bg-slate-50">
      <h4 className="font-bold mb-2">Report an Issue</h4>
      <input
        type="text"
        placeholder="Issue title"
        value={newIssue}
        onChange={e => setNewIssue(e.target.value)}
        className="w-full p-2 mb-2 rounded-lg border"
      />
      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        Submit
      </button>
    </div>
  );
}
