import React, { useState } from "react";
import { Appointment, Lead } from "../types";
import { 
  Plus, 
  Calendar, 
  Clock, 
  Mail, 
  MapPin, 
  Video, 
  Check, 
  Bell, 
  BellOff, 
  Trash2, 
  Edit3, 
  X,
  User,
  AlertCircle,
  FileText
} from "lucide-react";

interface AppointmentsListProps {
  appointments: Appointment[];
  leads: Lead[];
  onAddAppointment: (app: Omit<Appointment, "id" | "isCompleted">) => void;
  onUpdateAppointment: (app: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
  darkMode: boolean;
}

export default function AppointmentsList({
  appointments,
  leads,
  onAddAppointment,
  onUpdateAppointment,
  onDeleteAppointment,
  darkMode
}: AppointmentsListProps) {
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Appointment | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all"); // "all", "pending", "completed"

  // Form State
  const [newAppForm, setNewAppForm] = useState({
    leadId: "",
    title: "",
    date: new Date().toISOString().split("T")[0],
    time: "10:00",
    type: "meeting" as Appointment["type"],
    notes: "",
    reminderActive: true
  });

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppForm.title) return;
    
    // Find matching lead name if appropriate
    let selectedLeadName = "";
    if (newAppForm.leadId) {
      const found = leads.find(l => l.id === newAppForm.leadId);
      if (found) {
        selectedLeadName = found.name;
      }
    }

    onAddAppointment({
      leadId: newAppForm.leadId || undefined,
      leadName: selectedLeadName || undefined,
      title: newAppForm.title,
      date: newAppForm.date,
      time: newAppForm.time,
      type: newAppForm.type,
      notes: newAppForm.notes,
      reminderActive: newAppForm.reminderActive
    });

    // Reset Form
    setNewAppForm({
      leadId: "",
      title: "",
      date: new Date().toISOString().split("T")[0],
      time: "10:00",
      type: "meeting",
      notes: "",
      reminderActive: true
    });
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;

    // Resolve lead name if changed
    let updatedLeadName = editingApp.leadName;
    if (editingApp.leadId) {
      const found = leads.find(l => l.id === editingApp.leadId);
      if (found) {
        updatedLeadName = found.name;
      }
    } else {
      updatedLeadName = undefined;
    }

    onUpdateAppointment({
      ...editingApp,
      leadName: updatedLeadName
    });
    setEditingApp(null);
  };

  // Helper styles for Appointment Types
  const getTypeMeta = (type: Appointment["type"]) => {
    switch (type) {
      case "site_visit":
        return { label: "Site Tour Alignment", color: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20", icon: MapPin };
      case "meeting":
        return { label: "Executive Alignment Meeting", color: "bg-teal-500/10 text-teal-400 border border-teal-500/20", icon: User };
      case "call":
        return { label: "Strategy Alignment Call", color: "bg-amber-500/10 text-amber-400 border border-amber-500/20", icon: Video };
      case "followup":
        return { label: "Prospective Follow-up", color: "bg-purple-500/10 text-purple-400 border border-purple-500/20", icon: FileText };
    }
  };

  // Get current date string in UTC / local standard to detect today relative to mock time (2026-05-25)
  const SYSTEM_CURRENT_DATE = "2026-05-25"; 

  // Filtered appointments list
  const filteredApps = appointments.filter(app => {
    const typeMatch = filterType === "all" || app.type === filterType;
    const statusMatch = filterStatus === "all" 
      || (filterStatus === "completed" && app.isCompleted)
      || (filterStatus === "pending" && !app.isCompleted);
    return typeMatch && statusMatch;
  }).sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  // Immediate today warnings for accessibility & attention management
  const todayCount = appointments.filter(a => a.date === SYSTEM_CURRENT_DATE && !a.isCompleted).length;

  return (
    <div id="appointments-tab" className="space-y-6">
      
      {/* Upper Announcement Box with Immediate Reminders Warning */}
      <div className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4
        ${todayCount > 0 
          ? "bg-amber-500/10 border-amber-500/20 text-amber-100" 
          : darkMode 
            ? "bg-slate-900 border-slate-850" 
            : "bg-white border-slate-100 shadow-sm"}`}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl ${todayCount > 0 ? "bg-amber-500/20 text-amber-400" : "bg-teal-500/10 text-teal-400 animate-pulse"}`}>
            <AlertCircle size={22} />
          </div>
          <div>
            <h3 className={`font-display font-semibold text-base ${darkMode || todayCount > 0 ? "text-white" : "text-slate-900"}`}>
              {todayCount > 0 ? "Daily Alignment Action Required" : "Agenda & Appointment Alignment"}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {todayCount > 0 
                ? `You have ${todayCount} prospective client alignment appointment(s) scheduled for today, May 25, 2026. Prioritize client routing immediately.` 
                : "Perfect! All corporate followups are active and cataloged within standard boundaries."}
            </p>
          </div>
        </div>

        <button
          id="create-appt-modal-btn"
          onClick={() => setIsAddModalOpen(true)}
          className="px-4.5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs transition flex items-center gap-2 cursor-pointer shadow-md shadow-teal-500/5 select-none"
        >
          <Plus size={15} />
          Schedule Advisory Session
        </button>
      </div>

      {/* Control Filters Row */}
      <div className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3
        ${darkMode ? "bg-slate-950 border-slate-900" : "bg-slate-50 border-slate-150"}`}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">Filter Type:</span>
          {/* Appointment Type option tabs */}
          {["all", "site_visit", "meeting", "call", "followup"].map((type) => (
            <button
              key={type}
              id={`filter-appt-type-${type}`}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition select-none
                ${filterType === type 
                  ? "bg-teal-600 text-white" 
                  : darkMode 
                    ? "bg-slate-905 border border-slate-800 text-slate-350 hover:bg-slate-800" 
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"}`}
            >
              {type === "all" ? "All Formats" : getTypeMeta(type as Appointment["type"])?.label || type}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">Status:</span>
          <select
            id="appt-status-select-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border cursor-pointer
              ${darkMode ? "bg-slate-900 border-slate-800 text-slate-205" : "bg-white border-slate-200 text-slate-700"}`}
          >
            <option value="all">⚡ All Statuses</option>
            <option value="pending">⏳ Pending Sessions</option>
            <option value="completed">✅ Completed Sessions</option>
          </select>
        </div>
      </div>

      {/* Structured Alignment List */}
      <div className="space-y-3.5">
        {filteredApps.length > 0 ? (
          filteredApps.map((app) => {
            const meta = getTypeMeta(app.type);
            const Icon = meta?.icon || Calendar;
            const isToday = app.date === SYSTEM_CURRENT_DATE;

            return (
              <div
                key={app.id}
                id={`appointment-strip-${app.id}`}
                className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group relative overflow-hidden
                  ${app.isCompleted 
                    ? darkMode
                      ? "bg-slate-900/40 border-slate-900 text-slate-500 opacity-70" 
                      : "bg-slate-100/60 border-slate-200 text-slate-550 opacity-80"
                    : isToday
                      ? "bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/35 hover:shadow-md"
                      : darkMode 
                        ? "bg-slate-900 border-slate-850 hover:border-slate-750 hover:shadow-md" 
                        : "bg-white border-slate-150 shadow-sm hover:border-slate-300"}`}
              >
                
                {/* Left Section: Icon, Time, Title, Associated Lead client */}
                <div className="flex items-start gap-4">
                  
                  {/* Status checklist trigger bubble */}
                  <button
                    id={`toggle-complete-appt-${app.id}`}
                    onClick={() => onUpdateAppointment({ ...app, isCompleted: !app.isCompleted })}
                    className={`p-2.5 rounded-xl border flex-shrink-0 cursor-pointer transition flex items-center justify-center
                      ${app.isCompleted
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                        : darkMode
                          ? "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-705 hover:text-white"
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"}`}
                    title={app.isCompleted ? "Mark Session Pending" : "Mark Session Completed"}
                  >
                    <Check size={16} className={`transition-transform duration-200 ${app.isCompleted ? "scale-100 stroke-[3]" : "scale-0"}`} />
                  </button>

                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-semibold uppercase ${meta?.color}`}>
                        {meta?.label}
                      </span>
                      
                      {isToday && !app.isCompleted && (
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold tracking-wider uppercase bg-amber-500 text-slate-950 animate-pulse">
                          Today Required
                        </span>
                      )}
                    </div>

                    <h4 className={`font-display font-semibold text-base mt-1 
                      ${app.isCompleted ? "line-through text-slate-450 dark:text-slate-500" : ""}`}>
                      {app.title}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-slate-400 py-1 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar size={13} />
                        <span className="font-mono">{app.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={13} />
                        <span className="font-semibold font-mono text-teal-400">{app.time}</span>
                      </div>
                      {app.leadName && (
                        <div className="flex items-center gap-1 text-indigo-400 font-medium">
                          <User size={13} />
                          <span>Client: {app.leadName}</span>
                        </div>
                      )}
                    </div>

                    {app.notes && (
                      <p className={`text-xs italic leading-relaxed pt-1 max-w-xl font-light ${app.isCompleted ? "text-slate-500/70" : "text-slate-400"}`}>
                        "{app.notes}"
                      </p>
                    )}
                  </div>

                </div>

                {/* Right side alignment: Reminder Active status toggle and action parameters */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100/10">
                  
                  {/* Reminder alert active state button */}
                  <button
                    id={`toggle-reminder-${app.id}`}
                    onClick={() => {
                      onUpdateAppointment({ ...app, reminderActive: !app.reminderActive });
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-medium flex items-center gap-1.5 cursor-pointer transition select-none active:scale-95
                      ${app.reminderActive
                        ? "bg-teal-500/15 border-teal-500/30 text-teal-400"
                        : darkMode
                          ? "bg-slate-805 border-slate-800 text-slate-500 hover:bg-slate-800"
                          : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100"}`}
                    title="Toggle sound & dashboard system reminders"
                  >
                    {app.reminderActive ? (
                      <>
                        <Bell size={13} className="text-teal-400 fill-teal-400/10 animate-bounce" />
                        Reminder Active
                      </>
                    ) : (
                      <>
                        <BellOff size={13} />
                        Muted
                      </>
                    )}
                  </button>

                  <div className="flex gap-1.5">
                    <button
                      id={`edit-appt-${app.id}`}
                      onClick={() => setEditingApp(app)}
                      className={`p-2 rounded-xl transition cursor-pointer border
                        ${darkMode 
                          ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200" 
                          : "bg-slate-50 hover:bg-slate-150 border-slate-200 text-slate-700"}`}
                    >
                      <Edit3 size={13} />
                    </button>

                    <button
                      id={`delete-appt-${app.id}`}
                      onClick={() => onDeleteAppointment(app.id)}
                      className={`p-2 rounded-xl transition cursor-pointer border hover:border-rose-500/30 hover:text-rose-500
                        ${darkMode 
                          ? "bg-slate-800 border-slate-705 text-slate-400" 
                          : "bg-slate-50 border-slate-200 text-slate-505"}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                </div>

              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-slate-400 border border-dashed border-slate-100/10 rounded-2xl">
            No customized alignments matched current configuration. Schedule a fresh advisory loop.
          </div>
        )}
      </div>

      {/* MODAL: Creative Add Appointment */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
          <div 
            id="add-appt-modal"
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl relative
              ${darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"}`}
          >
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-450 dark:hover:text-white hover:text-slate-800 transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="font-display font-bold text-lg border-b border-slate-100/10 pb-3 mb-4">Schedule Alignment Session</h3>

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Corporate Client Connection</label>
                <select
                  id="appt-lead-select"
                  value={newAppForm.leadId}
                  onChange={(e) => setNewAppForm({ ...newAppForm, leadId: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-lg border cursor-pointer
                    ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}
                >
                  <option value="">-- No Direct Corporate Link (General Task) --</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({l.company})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Session Direct Objective Title *</label>
                <input
                  id="appt-title"
                  required
                  type="text"
                  placeholder="e.g. Saket Corridor Layout Alignment"
                  value={newAppForm.title}
                  onChange={(e) => setNewAppForm({ ...newAppForm, title: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-lg border 
                    ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Target Date</label>
                  <input
                    id="appt-date"
                    type="date"
                    value={newAppForm.date}
                    onChange={(e) => setNewAppForm({ ...newAppForm, date: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-lg border 
                      ${darkMode ? "bg-slate-950 border-slate-800 text-white font-mono" : "bg-slate-50 border-slate-200"}`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Arrival Alignment Time</label>
                  <input
                    id="appt-time"
                    type="time"
                    value={newAppForm.time}
                    onChange={(e) => setNewAppForm({ ...newAppForm, time: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-lg border 
                      ${darkMode ? "bg-slate-950 border-slate-800 text-white font-mono" : "bg-slate-50 border-slate-200"}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Session Platform Type</label>
                  <select
                    id="appt-type"
                    value={newAppForm.type}
                    onChange={(e) => setNewAppForm({ ...newAppForm, type: e.target.value as Appointment["type"] })}
                    className={`w-full px-3 py-2 text-xs rounded-lg border cursor-pointer
                      ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}
                  >
                    <option value="site_visit">🏗️ Site Tour Alignment</option>
                    <option value="meeting">🤝 Physical Office Negotiation</option>
                    <option value="call">📞 Teams Video Alignment</option>
                    <option value="followup">📝 Prospective Task Check</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end pb-1.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      id="appt-reminder-active"
                      type="checkbox"
                      checked={newAppForm.reminderActive}
                      onChange={(e) => setNewAppForm({ ...newAppForm, reminderActive: e.target.checked })}
                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-800 focus:outline-none"
                    />
                    <span className="text-xs font-medium">Trigger Sound Alerts</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Internal Checklist Directives</label>
                <textarea
                  id="appt-notes"
                  rows={3}
                  value={newAppForm.notes}
                  onChange={(e) => setNewAppForm({ ...newAppForm, notes: e.target.value })}
                  placeholder="Record precise tasks, gate locks, red-lines, and alignments prior to launch."
                  className={`w-full px-3 py-2 text-xs rounded-lg border 
                    ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}
                />
              </div>

              <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-100/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border cursor-pointer
                    ${darkMode ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-white" : "bg-slate-100 hover:bg-slate-150 border-slate-205"}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white cursor-pointer"
                >
                  Confirm Agenda Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Appointment */}
      {editingApp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all animate-none">
          <div 
            id="edit-appt-modal"
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl relative
              ${darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"}`}
          >
            <button 
              onClick={() => setEditingApp(null)}
              className="absolute top-4 right-4 text-slate-450 dark:hover:text-white hover:text-slate-800 transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="font-display font-bold text-lg border-b border-slate-100/10 pb-3 mb-4">Edit Alignment Agenda</h3>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Corporate Lead Link</label>
                <select
                  id="edit-appt-lead-select"
                  value={editingApp.leadId || ""}
                  onChange={(e) => setEditingApp({ ...editingApp, leadId: e.target.value || undefined })}
                  className={`w-full px-3 py-2 text-xs rounded-lg border cursor-pointer
                    ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}
                >
                  <option value="">-- No Direct Corporate Link --</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({l.company})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Session Objective Title</label>
                <input
                  id="edit-appt-title"
                  required
                  type="text"
                  value={editingApp.title}
                  onChange={(e) => setEditingApp({ ...editingApp, title: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-lg border 
                    ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Date</label>
                  <input
                    id="edit-appt-date"
                    required
                    type="date"
                    value={editingApp.date}
                    onChange={(e) => setEditingApp({ ...editingApp, date: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-lg border 
                      ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Time</label>
                  <input
                    id="edit-appt-time"
                    required
                    type="time"
                    value={editingApp.time}
                    onChange={(e) => setEditingApp({ ...editingApp, time: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-lg border 
                      ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Platform Type</label>
                  <select
                    id="edit-appt-type"
                    value={editingApp.type}
                    onChange={(e) => setEditingApp({ ...editingApp, type: e.target.value as Appointment["type"] })}
                    className={`w-full px-3 py-2 text-xs rounded-lg border cursor-pointer
                      ${darkMode ? "bg-slate-950 border-slate-800 text-white font-medium" : "bg-slate-50 border-slate-200 font-medium"}`}
                  >
                    <option value="site_visit">🏗️ Site Tour Alignment</option>
                    <option value="meeting">🤝 Physical Office Negotiation</option>
                    <option value="call">📞 Teams Video Alignment</option>
                    <option value="followup">📝 Prospective Task Check</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end pb-1.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      id="edit-appt-reminder-active"
                      type="checkbox"
                      checked={editingApp.reminderActive}
                      onChange={(e) => setEditingApp({ ...editingApp, reminderActive: e.target.checked })}
                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-800 focus:outline-none"
                    />
                    <span className="text-xs font-semibold">Mute System Sound</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Checklist Directives</label>
                <textarea
                  id="edit-appt-notes"
                  rows={3}
                  value={editingApp.notes}
                  onChange={(e) => setEditingApp({ ...editingApp, notes: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-lg border 
                    ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}
                />
              </div>

              <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-100/10">
                <button
                  type="button"
                  onClick={() => setEditingApp(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border cursor-pointer
                    ${darkMode ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-white" : "bg-slate-100 hover:bg-slate-150 border-slate-205"}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white cursor-pointer"
                >
                  Save Alignment Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
