import React from "react";
import { Settings, ShieldAlert, Sliders } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSettingsView() {
  return (
    <div className="bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-xs space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
          <Settings className="text-blue-600" /> Platform Settings & Controls
        </h2>
        <p className="text-xs text-slate-400 font-bold mt-1">Configure global notification triggers, access thresholds, and system preferences.</p>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h4 className="font-black text-slate-900 text-sm">Automated Attendance Reminders</h4>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Ping tutors 5 minutes prior to un-logged live sessions.</p>
          </div>
          <button onClick={() => toast.success("Settings updated successfully!")} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm">
            Configure
          </button>
        </div>

        <div className="p-5 rounded-2xl border border-rose-100 bg-rose-50/30 flex justify-between items-center">
          <div>
            <h4 className="font-black text-rose-900 text-sm">Maintenance Mode</h4>
            <p className="text-xs text-rose-500 font-medium mt-0.5">Temporarily restrict student login access for system updates.</p>
          </div>
          <button onClick={() => toast.error("Action requires Master Owner privileges.")} className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm">
            Toggle
          </button>
        </div>
      </div>
    </div>
  );
}