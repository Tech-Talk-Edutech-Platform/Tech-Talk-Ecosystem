import React, { useState } from "react";
import { Plus, Loader2, Sparkles } from "lucide-react";
import { supabase } from "../../../supabase";
import toast from "react-hot-toast";

export default function AddPhaseModal({ courseId, onPhaseAdded }) {
  const [isOpen, setIsOpen] = useState(false);
  const [phaseTitle, setPhaseTitle] = useState("");
  const [phaseFocus, setPhaseFocus] = useState("");
  const [lessonCount, setLessonCount] = useState(8);
  const [loading, setLoading] = useState(false);

  const handleCreatePhaseWithLessonsAndNotes = async (e) => {
    e.preventDefault();
    if (!phaseTitle.trim()) return toast.error("Please enter a phase title");

    setLoading(true);
    try {
      const { data: existingPhases } = await supabase
        .from("course_phases")
        .select("phase_number")
        .eq("course_id", courseId)
        .order("phase_number", { ascending: false })
        .limit(1);

      const nextPhaseNumber = existingPhases?.length ? existingPhases[0].phase_number + 1 : 1;

      const { data: phaseData, error: phaseError } = await supabase
        .from("course_phases")
        .insert([{ course_id: courseId, phase_number: nextPhaseNumber, title: phaseTitle.trim(), focus: phaseFocus.trim() || null }])
        .select()
        .single();

      if (phaseError) throw phaseError;

      for (let i = 1; i <= lessonCount; i++) {
        const lessonTitle = `Lesson ${i}: Core Concept & Practice`;
        const { data: lessonData } = await supabase
          .from("course_lessons")
          .insert([{ phase_id: phaseData.id, title: lessonTitle, position: i }])
          .select()
          .single();

        if (lessonData) {
          await supabase.from("notes").insert([{
            course_id: courseId,
            title: lessonTitle,
            content: `Welcome to ${lessonTitle}. Focus: ${phaseFocus || 'Practical implementation'}.`,
            lesson_order: i
          }]);
        }
      }

      toast.success(`Phase added with ${lessonCount} lessons & notes!`);
      setPhaseTitle("");
      setPhaseFocus("");
      setLessonCount(8);
      setIsOpen(false);
      if (onPhaseAdded) onPhaseAdded();
    } catch (err) {
      toast.error("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider px-5 py-3 rounded-2xl shadow-md transition-all">
        <Plus size={16} /> Add Structured Phase
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 max-w-lg w-full shadow-2xl space-y-6 border border-white/10">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="text-blue-500" size={20} /> Add Curriculum Phase
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCreatePhaseWithLessonsAndNotes} className="space-y-4">
              <input type="text" required placeholder="Phase Title (e.g., Phase 1: Getting Started)" value={phaseTitle} onChange={e => setPhaseTitle(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-900 dark:text-white outline-none" />
              <textarea rows={2} placeholder="Focus Description..." value={phaseFocus} onChange={e => setPhaseFocus(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-900 dark:text-white outline-none" />
              <input type="number" min="1" max="20" required value={lessonCount} onChange={e => setLessonCount(parseInt(e.target.value) || 8)} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-900 dark:text-white outline-none" />
              
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-xs uppercase">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase flex items-center gap-2">
                  {loading && <Loader2 className="animate-spin" size={16} />} Save Phase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
// <div className="pt-4">
//   <AddPhaseModal 
//     courseId={selectedCourse.id} 
//     onPhaseAdded={() => {
//       fetchCourseDetails(selectedCourse.id);
//       fetchCourses();
//     }} 
//   />
// </div>