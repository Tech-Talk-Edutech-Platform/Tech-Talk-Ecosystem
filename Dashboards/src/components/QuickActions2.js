import React from 'react';
import { 
  Plus, 
  CheckCircle, 
  HelpCircle, 
  Award, 
  MessageSquare, 
  Video, 
  AlertTriangle,
  FileText
} from "lucide-react";

export default function QuickActions2({ userId, role }) {
  
  // 1. Define the action sets for each role
  const actionConfigs = {
    tutor: [
      { label: "Create Assignment", icon: Plus, color: "bg-blue-500", shadow: "shadow-blue-200" },
      { label: "Log Attendance", icon: CheckCircle, color: "bg-emerald-500", shadow: "shadow-emerald-200" },
      { label: "Start Live Room", icon: Video, color: "bg-purple-500", shadow: "shadow-purple-200" },
      { label: "Send Group Alert", icon: AlertTriangle, color: "bg-rose-500", shadow: "shadow-rose-200" }
    ],
    student: [
      { label: "Request Help", icon: HelpCircle, color: "bg-amber-500", shadow: "shadow-amber-200" },
      { label: "View Certificate", icon: Award, color: "bg-indigo-500", shadow: "shadow-indigo-200" },
      { label: "Submit Ticket", icon: MessageSquare, color: "bg-sky-500", shadow: "shadow-sky-200" },
      { label: "Learning Path", icon: FileText, color: "bg-pink-500", shadow: "shadow-pink-200" }
    ],
    // Optional fallback for admins if they use this component
    owner: [
      { label: "System Audit", icon: FileText, color: "bg-slate-700", shadow: "shadow-slate-200" },
      { label: "Announcement", icon: MessageSquare, color: "bg-blue-600", shadow: "shadow-blue-200" }
    ]
  };

  // 2. Get the specific actions for the current role
  const currentActions = actionConfigs[role] || [];

  const handleActionClick = (label) => {
    console.log(`Action Triggered: ${label} for User: ${userId}`);
    // Add your logic here (e.g., opening a modal or navigating)
    alert(`${label} feature coming soon!`);
  };

  return (
    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black text-slate-900 font-sans tracking-tight">Quick Actions</h3>
        <span className="px-2 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-tighter">
          {role}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {currentActions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleActionClick(action.label)}
            className="group flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-50 hover:border-transparent hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 active:scale-95"
          >
            <div className={`p-3 rounded-xl ${action.color} text-white shadow-lg ${action.shadow} group-hover:scale-110 transition-transform duration-300 mb-3`}>
              <action.icon size={20} />
            </div>
            <span className="text-[11px] font-black text-slate-600 group-hover:text-slate-900 text-center leading-tight">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}