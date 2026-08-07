import React, { useState } from "react";
import { supabase } from "../../../supabase";
import { HelpCircle, Send, Loader2, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

export default function StudentSupportView({ user }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill out all fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("support_tickets").insert({
        student_id: user?.id,
        tutor_id: user?.assigned_tutor_id || null,
        subject,
        message,
        status: "open"
      });

      if (error) throw error;
      toast.success("Support ticket sent successfully!");
      setSubject("");
      setMessage("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit ticket. Ensure support table exists.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Help & Support</h1>
        <p className="text-sm text-slate-500 mt-1">Need assistance? Reach out to your assigned tutor or technical administration.</p>
      </div>

      <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-2xl">
            <HelpCircle size={20} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white text-base">Submit a Request</h2>
            <p className="text-xs text-slate-400">Describe your issue and we'll get back to you promptly.</p>
          </div>
        </div>

        <form onSubmit={handleSubmitTicket} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Subject</label>
            <input 
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Question about homework assignment"
              className="w-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition text-sm font-medium text-slate-800 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Message</label>
            <textarea 
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide as much detail as possible..."
              className="w-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition text-sm font-medium text-slate-800 dark:text-white"
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-purple-500/20 flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Send Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}