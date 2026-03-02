
// // // TO-DO
// // // Create a Google Form → webhook / Zapier → Supabase insert.
// // // SalesPipelineModal.js
import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../../supabase";
import { PhoneCall, TrendingUp, Plus, MessageCircle, X } from "lucide-react";
import CallCost from "./CallCost";

const TAB_TYPES = {
  ALL: "all",
  OVERDUE: "overdue",
  TODAY: "today",
  UPCOMING: "upcoming",
};

const Loading = ({ label }) => (
  <div className="p-20 text-center font-black animate-pulse text-slate-400">
    {label}
  </div>
);

const ModalShell = ({ title, icon: Icon, children, onClose }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
    <div className="bg-white rounded-[40px] w-full max-w-5xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
      <div className="p-8 border-b flex justify-between items-center">
        <h2 className="text-2xl font-black flex items-center gap-2">
          {Icon && <Icon className="text-blue-600" />}
          {title}
        </h2>
        <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl">
          <X size={24} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-8">{children}</div>
    </div>
  </div>
);

export default function SalesPipelineModal({ isOpen, onClose }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(TAB_TYPES.ALL);

  const [showAddLead, setShowAddLead] = useState(false);
  const [errors, setErrors] = useState({});
  const [newLead, setNewLead] = useState({
    parent_name: "",
    phone: "",
    email: "",
    country: "",
    grade: "",
    class_date: "",
    class_time: "",
    next_follow_up_at: "",
  });

  useEffect(() => {
    if (!isOpen) return;

    const fetchLeads = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("leads")
        .select("*")
        .order("next_follow_up_at", { ascending: true });
      setLeads(data || []);
      setLoading(false);
    };

    fetchLeads();
  }, [isOpen]);

  const getFollowUpBadge = (next_follow_up_at) => {
    if (!next_follow_up_at) return null;
    const now = new Date();
    const date = new Date(next_follow_up_at);

    if (date < now) return { label: "Overdue", color: "bg-red-500", icon: "⚠️" };
    if (date.toDateString() === now.toDateString()) return { label: "Today", color: "bg-blue-500", icon: "📅" };
    return { label: "Upcoming", color: "bg-green-500", icon: "⏳" };
  };

  // Filter and sort leads
  const filteredLeads = useMemo(() => {
    const now = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    let filtered = leads.filter((l) => {
      if (activeTab === TAB_TYPES.ALL) return true;
      if (!l.next_follow_up_at) return false;
      const d = new Date(l.next_follow_up_at);
      if (activeTab === TAB_TYPES.OVERDUE) return d < now;
      if (activeTab === TAB_TYPES.TODAY) return d >= start && d <= end;
      if (activeTab === TAB_TYPES.UPCOMING) return d > end;
      return true;
    });

    // Sort for "ALL": Overdue first, then Today, then Upcoming
    if (activeTab === TAB_TYPES.ALL) {
      filtered.sort((a, b) => {
        const getPriority = (d) => {
          if (!d) return 3; // No date goes last
          const date = new Date(d);
          if (date < now) return 0; // Overdue
          if (date.toDateString() === now.toDateString()) return 1; // Today
          return 2; // Upcoming
        };
        return getPriority(a.next_follow_up_at) - getPriority(b.next_follow_up_at);
      });
    }

    return filtered;
  }, [leads, activeTab]);

  if (!isOpen) return null;

  const updateStatus = async (id, status) => {
    const { data } = await supabase
      .from("leads")
      .update({
        status,
        last_contacted_at: status === "contacted" ? new Date() : null,
      })
      .eq("id", id)
      .select()
      .single();

    if (data) {
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...data } : l)));
    }
  };

  const validate = () => {
    const e = {};
    if (!newLead.parent_name) e.parent_name = "Required";
    if (!newLead.phone) e.phone = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addLead = async () => {
    if (!validate()) return;

    const { data } = await supabase
      .from("leads")
      .insert({
        parent_name: newLead.parent_name,
        phone: newLead.phone,
        email: newLead.email || null,
        country: newLead.country || null,
        grade: newLead.grade || null,
        class_date: newLead.class_date || null,
        class_time: newLead.class_time || null,
        next_follow_up_at: newLead.next_follow_up_at || null,
      })
      .select()
      .single();

    if (data) {
      setLeads((prev) => [data, ...prev]);
      setShowAddLead(false);
      setNewLead({
        parent_name: "",
        phone: "",
        email: "",
        country: "",
        grade: "",
        class_date: "",
        class_time: "",
        next_follow_up_at: "",
      });
      setErrors({});
    }
  };

  const whatsappLink = (phone) => `https://wa.me/${phone.replace(/\D/g, "")}`;

  return (
    <ModalShell title="Sales & Leads Pipeline" icon={TrendingUp} onClose={onClose}>
      {/* Header Tabs + Add Lead */}
      <div className="flex justify-between mb-4 items-center">
        <div className="flex gap-2">
          {Object.values(TAB_TYPES).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full font-bold ${
                activeTab === tab ? "bg-blue-500 text-white" : "bg-gray-100"
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAddLead(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full font-bold"
        >
          <Plus size={16} /> Add Lead
        </button>
      </div>

      {/* Add Lead Form */}
      {showAddLead && (
        <div className="fixed inset-0 bg-black/40 z-[1100] flex items-center justify-center">
          <div className="bg-white p-6 rounded-3xl w-full max-w-md space-y-3">
            <h3 className="font-black text-lg">Add New Lead</h3>

            <input
              placeholder="Parent name *"
              className="w-full p-3 border rounded-xl"
              value={newLead.parent_name}
              onChange={(e) => setNewLead({ ...newLead, parent_name: e.target.value })}
            />
            {errors.parent_name && <p className="text-red-500 text-xs">{errors.parent_name}</p>}

            <input
              placeholder="Phone *"
              className="w-full p-3 border rounded-xl"
              value={newLead.phone}
              onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
            />
            {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}

            <input
              placeholder="Email"
              className="w-full p-3 border rounded-xl"
              value={newLead.email}
              onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
            />

            <input
              placeholder="Country"
              className="w-full p-3 border rounded-xl"
              value={newLead.country}
              onChange={(e) => setNewLead({ ...newLead, country: e.target.value })}
            />

            <input
              placeholder="Grade"
              className="w-full p-3 border rounded-xl"
              value={newLead.grade}
              onChange={(e) => setNewLead({ ...newLead, grade: e.target.value })}
            />

            <input
              type="date"
              className="w-full p-3 border rounded-xl"
              value={newLead.class_date}
              onChange={(e) => setNewLead({ ...newLead, class_date: e.target.value })}
            />

            <input
              type="time"
              className="w-full p-3 border rounded-xl"
              value={newLead.class_time}
              onChange={(e) => setNewLead({ ...newLead, class_time: e.target.value })}
            />

            <input
              type="datetime-local"
              className="w-full p-3 border rounded-xl"
              value={newLead.next_follow_up_at}
              onChange={(e) => setNewLead({ ...newLead, next_follow_up_at: e.target.value })}
            />

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowAddLead(false)}>Cancel</button>
              <button
                onClick={addLead}
                className="px-4 py-2 bg-blue-600 text-white rounded-full font-bold"
              >
                Save Lead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leads Grid */}
      {loading ? (
        <Loading label="SYNCING PIPELINE..." />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map((l) => {
            const badge = getFollowUpBadge(l.next_follow_up_at);
            const nextDate = l.next_follow_up_at ? new Date(l.next_follow_up_at) : null;
            const now = new Date();
            let bgColor = "bg-white";

            if (nextDate) {
              if (nextDate < now) bgColor = "bg-red-100";
              else if (nextDate.toDateString() === now.toDateString()) bgColor = "bg-blue-100";
              else bgColor = "bg-green-100";
            }

            return (
              <div key={l.id} className={`p-6 rounded-[32px] border ${bgColor}`}>
                <div className="flex justify-between mb-1 items-center">
                  <span className="text-xs font-black uppercase">{l.status || "NEW"}</span>
                  {badge && (
                    <span className={`text-white text-[10px] px-2 py-1 rounded-full ${badge.color}`}>
                      {badge.icon} {badge.label}
                    </span>
                  )}
                </div>

                <h4 className="font-black">{l.parent_name}</h4>
                <p className="text-xs text-slate-400">{l.email || "-"}</p>
                <p className="text-xs text-slate-400">{l.country || "-"}</p>
                <p className="text-xs text-slate-400">Grade: {l.grade || "-"}</p>
                <p className="text-xs text-slate-400">
                  Class: {l.class_date || "-"} {l.class_time || ""}
                </p>

                <CallCost phone={l.phone} />

                <div className="flex gap-2 mt-3">
                  <a
                    href={whatsappLink(l.phone)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-green-100 rounded-xl text-green-600"
                  >
                    <MessageCircle size={14} />
                  </a>

                  <a
                    href={`tel:${l.phone}`}
                    className="px-3 py-1 bg-yellow-100 rounded-full text-xs text-yellow-800"
                  >
                    <PhoneCall size={14} />
                  </a>

                  <button
                    onClick={() => updateStatus(l.id, "contacted")}
                    className="px-3 py-1 bg-blue-300 rounded-full text-xs"
                  >
                    Contacted
                  </button>

                  <button
                    onClick={() => updateStatus(l.id, "converted")}
                    className="px-3 py-1 bg-emerald-300 rounded-full text-xs"
                  >
                    Convert
                  </button>
                </div>

                {nextDate && (
                  <p className="text-xs mt-2 text-slate-500">
                    Follow-up: {nextDate.toLocaleString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </ModalShell>
  );
}
