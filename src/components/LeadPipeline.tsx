import React, { useState } from "react";
import { Lead, CommunicationLog, User, LeadEditLog } from "../types";
import { 
  Search, 
  Filter, 
  Sparkles, 
  Plus, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Briefcase, 
  IndianRupee, 
  TrendingUp, 
  Trash2, 
  Check, 
  Edit3, 
  X,
  Copy,
  Send,
  Loader2,
  Calendar,
  AlertCircle,
  ChevronDown,
  Lock,
  History,
  UserCheck
} from "lucide-react";

interface LeadPipelineProps {
  leads: Lead[];
  users?: User[];
  onAddLead: (lead: Omit<Lead, "id" | "dateCreated" | "dateUpdated">) => void;
  onUpdateLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
  communicationLogs: CommunicationLog[];
  onAddCommunicationLog: (log: Omit<CommunicationLog, "id">) => void;
  darkMode: boolean;
  currentUser?: User | null;
  leadEditLogs?: LeadEditLog[];
}

export default function LeadPipeline({
  leads,
  users,
  onAddLead,
  onUpdateLead,
  onDeleteLead,
  communicationLogs,
  onAddCommunicationLog,
  darkMode,
  currentUser,
  leadEditLogs = []
}: LeadPipelineProps) {
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [temperatureFilter, setTemperatureFilter] = useState<string>("all");
  const [showLogs, setShowLogs] = useState(false);
  
  // Modal / Form States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLeadForAI, setSelectedLeadForAI] = useState<Lead | null>(null);
  
  // AI Email Generator states
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailMood, setEmailMood] = useState("persuasive and authoritative");
  const [emailNotes, setEmailNotes] = useState("");
  const [emailSuccessMsg, setEmailSuccessMsg] = useState("");

  // New Lead form state
  const [newLeadForm, setNewLeadForm] = useState(() => ({
    name: "",
    company: "",
    position: "",
    email: "",
    phone: "",
    status: "Interested" as Lead["status"],
    source: "Website" as Lead["source"],
    temperature: "Warm" as Lead["temperature"],
    budget: "₹15.0 Cr",
    notes: "",
    location: "Noida, India",
    assignedAgent: currentUser?.role === "sales_team" ? currentUser.name : "Rajan Srivastava",
    score: 75
  }));

  const presetAgents = [
    "Rajan Srivastava",
    "Ananya Sharma",
    "Rakesh Verma",
    "Amit Patel",
    "Neha Gupta",
    "Suresh Kumar",
    "Priya Nair",
    "Vikram Singh"
  ];

  const finalAgents = users && users.length > 0 ? users.map((u) => u.name) : presetAgents;

  const [showNewAgentDropdown, setShowNewAgentDropdown] = useState(false);
  const [showEditAgentDropdown, setShowEditAgentDropdown] = useState(false);

  const isAuthorizedToAssign = !currentUser || currentUser.role === "super_admin" || currentUser.role === "admin";

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.assignedAgent.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
    const matchesTemperature = temperatureFilter === "all" || lead.temperature === temperatureFilter;
    
    return matchesSearch && matchesStatus && matchesSource && matchesTemperature;
  });

  // Handle addition
  const handleAddNewLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.name) return;
    onAddLead({
      ...newLeadForm,
      lastCommunication: new Date().toISOString().split("T")[0]
    });
    // Reset
    setNewLeadForm({
      name: "",
      company: "",
      position: "",
      email: "",
      phone: "",
      status: "Interested",
      source: "Website",
      temperature: "Warm",
      budget: "₹15.0 Cr",
      notes: "",
      location: "Noida, India",
      assignedAgent: currentUser?.role === "sales_team" ? currentUser.name : "Rajan Srivastava",
      score: 75
    });
    setIsAddModalOpen(false);
  };

  // Handle Edit submission
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    onUpdateLead({
      ...editingLead,
      dateUpdated: new Date().toISOString().split("T")[0]
    });
    setEditingLead(null);
  };

  // Trigger automated email follow-up generation from server
  const generateAIFollowUp = async (lead: Lead) => {
    setSelectedLeadForAI(lead);
    setIsGeneratingEmail(true);
    setEmailSuccessMsg("");
    setEmailSubject("");
    setEmailBody("");
    
    const customNotes = emailNotes || lead.notes;
    
    try {
      const response = await fetch("/api/generate-followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadName: lead.name,
          company: lead.company,
          source: lead.source,
          budget: lead.budget,
          recentNotes: customNotes,
          mood: emailMood
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setEmailSubject(data.subject);
        setEmailBody(data.body);
      } else {
        throw new Error(data.error || "Generation endpoint returned anomalous response.");
      }
    } catch (err: any) {
      console.error(err);
      setEmailSubject("Elite Pro Follow-Up | Corporate Real Estate Alignment");
      setEmailBody(`Dear ${lead.name},\n\nThank you for exploring premium real estate opportunities with Elite Pro Infra. Regarding your inquiries via ${lead.source} with a capital budget range of ${lead.budget}, we are eager to coordinate an advisory alignment session.\n\nBest regards,\nRajan Srivastava\nElite Pro Infra`);
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  // Send followups (simulated communication logging)
  const handleSimulateSendEmail = () => {
    if (!selectedLeadForAI) return;
    onAddCommunicationLog({
      leadId: selectedLeadForAI.id,
      date: new Date().toISOString().split("T")[0],
      type: "email",
      content: `[AI AUTOPILOT FOLLOW-UP SENT] Subject: ${emailSubject}\n\n${emailBody}`,
      sender: "Rajan Srivastava"
    });
    
    // Update Lead status to 'Follow Up' if it was 'Interested'
    if (selectedLeadForAI.status === "Interested") {
      onUpdateLead({
        ...selectedLeadForAI,
        status: "Follow Up",
        dateUpdated: new Date().toISOString().split("T")[0]
      });
    }

    setEmailSuccessMsg("Pristine email generated successfully & logged to Communication Timeline!");
    setTimeout(() => {
      setSelectedLeadForAI(null);
      setEmailNotes("");
    }, 2000);
  };

  // Helper colors for Lead status badges
  const getStatusBadgeClass = (status: Lead["status"]) => {
    switch (status) {
      case "Interested":
        return "bg-teal-500/10 text-teal-400 border border-teal-500/20";
      case "Follow Up":
        return "bg-sky-500/10 text-sky-400 border border-sky-500/20";
      case "Detailed Share":
        return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
      case "Not Interested":
        return "bg-rose-500/10 text-rose-455 border border-rose-500/25";
      case "Meeting Done":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "Site Visit":
        return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
      case "Call Back":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "Junk":
        return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
      case "Duplicate":
        return "bg-pink-500/10 text-pink-400 border border-pink-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
    }
  };

  // Helper colors for Temperature Status
  const getTemperatureBadgeClass = (temp: Lead["temperature"]) => {
    switch (temp) {
      case "Hot":
        return "bg-rose-500/10 text-rose-450 border border-rose-500/20";
      case "Warm":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
      case "Cold":
        return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
      case "Dead":
        return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
    }
  };

  // Helper colors for lead priority score
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-500 font-bold";
    if (score >= 60) return "text-amber-500 font-bold";
    return "text-slate-400";
  };

  const formatFieldName = (field: string) => {
    switch (field) {
      case "name": return "Customer Name";
      case "company": return "Company Name";
      case "position": return "Corporate Position";
      case "email": return "Corporate Email";
      case "phone": return "Contact Phone";
      case "source": return "Lead Source Channel";
      case "status": return "Advisory Stage Status";
      case "temperature": return "Conversion Temperature";
      case "budget": return "Capital Budget Plan";
      case "location": return "Project Target Location";
      case "assignedAgent": return "Assigned Advisor";
      case "notes": return "Consultation Synopsis (Notes)";
      case "score": return "Priority Rating Score";
      default: return field.replace(/([A-Z])/g, ' $1').toUpperCase();
    }
  };

  return (
    <div id="lead-pipeline-tab" className="space-y-6">
      
      {/* Search and Filters Block */}
      <div className={`p-5 rounded-2xl border transition-all flex flex-col gap-4
        ${darkMode ? "bg-slate-900 border-slate-850" : "bg-white border-slate-100 shadow-sm"}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className={`font-display font-semibold text-lg ${darkMode ? "text-white" : "text-slate-900"}`}>
              Lead Management Runway
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Refinement filters and pipeline indicators for infrastructure investors
            </p>
          </div>
          
          {/* Create Button & Logs Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="toggle-edit-logs-btn"
              onClick={() => setShowLogs(!showLogs)}
              className={`px-4.5 py-2.5 rounded-xl border text-xs font-semibold tracking-wide uppercase transition-all duration-155 flex items-center gap-2 cursor-pointer active:scale-95
                ${showLogs 
                  ? "bg-amber-550 border-amber-550 text-white shadow-md shadow-amber-500/15 hover:bg-amber-500" 
                  : darkMode 
                    ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300" 
                    : "bg-slate-50 border-slate-205 hover:bg-slate-100 hover:border-slate-300 text-slate-600"}`}
              title="Show log of lead parameter alterations made by Sales advisor advisors"
            >
              <History size={14} className={showLogs ? "animate-spin" : ""} />
              <span>{showLogs ? "Hide Edit Logs" : "Show Sales Team Edit Logs"}</span>
              {leadEditLogs.length > 0 && (
                <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono leading-none font-bold
                  ${showLogs ? "bg-amber-700/50 text-white" : "bg-teal-500/15 text-teal-400 border border-teal-500/10"}`}>
                  {leadEditLogs.length}
                </span>
              )}
            </button>

            <button
              id="register-lead-btn"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4.5 py-2.5 rounded-xl bg-teal-605 hover:bg-teal-550 text-white font-semibold text-xs tracking-wide uppercase transition-all shadow-md shadow-teal-605/15 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus size={16} />
              Register New Lead
            </button>
          </div>
        </div>

        {/* Filters and Search Bar Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              id="lead-search-input"
              type="text"
              placeholder="Search Name, Company, Assignee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border font-sans font-medium transition duration-200
                ${darkMode 
                  ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500" 
                  : "bg-slate-50 border-slate-150 text-slate-800 focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600"}`}
            />
          </div>

          {/* New Status Select */}
          <div className="relative">
            <select
              id="lead-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full px-3.5 py-2.5 text-xs rounded-xl border font-sans font-medium transition duration-200 cursor-pointer appearance-none
                ${darkMode 
                  ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-teal-500" 
                  : "bg-slate-50 border-slate-150 text-slate-800 focus:border-teal-600 font-medium"}`}
            >
              <option value="all">💼 All Lead Statuses</option>
              <option value="Interested">Interested</option>
              <option value="Follow Up">Follow Up</option>
              <option value="Detailed Share">Detailed Share</option>
              <option value="Not Interested">Not Interested</option>
              <option value="Meeting Done">Meeting Done</option>
              <option value="Site Visit">Site Visit</option>
              <option value="Call Back">Call Back</option>
              <option value="Junk">Junk</option>
              <option value="Duplicate">Duplicate</option>
            </select>
          </div>

          {/* Source Select */}
          <div className="relative">
            <select
              id="lead-source-filter"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className={`w-full px-3.5 py-2.5 text-xs rounded-xl border font-sans font-medium transition duration-200 cursor-pointer appearance-none
                ${darkMode 
                  ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-teal-500" 
                  : "bg-slate-50 border-slate-150 text-slate-800 focus:border-teal-600 font-medium"}`}
            >
              <option value="all">📣 All Sources / Ads</option>
              <option value="Meta Ad">Meta Ad</option>
              <option value="Google Ad">Google Ad</option>
              <option value="IVR Board">IVR Board</option>
              <option value="IVR">IVR</option>
              <option value="Reference">Reference</option>
              <option value="Website">Website</option>
              <option value="Social Media">Social Media</option>
              <option value="Personal">Personal</option>
              <option value="Cold Call">Cold Call</option>
            </select>
          </div>

          {/* Temperature Select */}
          <div className="relative">
            <select
              id="lead-temperature-filter"
              value={temperatureFilter}
              onChange={(e) => setTemperatureFilter(e.target.value)}
              className={`w-full px-3.5 py-2.5 text-xs rounded-xl border font-sans font-medium transition duration-200 cursor-pointer appearance-none
                ${darkMode 
                  ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-teal-500" 
                  : "bg-slate-50 border-slate-150 text-slate-800 focus:border-teal-600 font-medium"}`}
            >
              <option value="all">🔥 All Temp Ratings</option>
              <option value="Hot">🔥 Hot</option>
              <option value="Warm">☀️ Warm</option>
              <option value="Cold">❄️ Cold</option>
              <option value="Dead">🫙 Dead</option>
            </select>
          </div>

          {/* Metrics count indicator */}
          <div className={`p-1 px-3 rounded-xl border flex items-center justify-between text-xs font-mono sm:col-span-2 lg:col-span-5
            ${darkMode ? "bg-slate-950 border-slate-800/80 text-slate-400" : "bg-slate-50 border-slate-100 text-slate-500"}`}
          >
            <span>Retrieved Matrix Size:</span>
            <span className="font-bold text-teal-500">{filteredLeads.length} records matching parameters</span>
          </div>

        </div>
      </div>

      {/* Grid of Leads Cards / Logs Ledger */}
      {showLogs ? (
        <div 
          id="lead-edit-logs-panel" 
          className={`p-6 rounded-2xl border transition-all space-y-6 ${darkMode ? "bg-slate-900 border-slate-850" : "bg-white border-slate-150 shadow-sm"}`}
        >
          <div className="flex justify-between items-center pb-4 border-b border-slate-100/10">
            <div>
              <h3 className={`font-display font-semibold text-base ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                Sales Advisor Revision Ledger
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentUser?.role === "super_admin" || currentUser?.role === "admin"
                  ? "Real-time auditing trail of infrastructural portfolio parameter modifications"
                  : `Auditing trail of parameter modifications captured for standard advisor profile [${currentUser?.name}]`}
              </p>
            </div>
            <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase rounded-lg bg-amber-500/15 text-amber-500 border border-amber-500/25">
              Secure Auditing: Active
            </span>
          </div>

          {leadEditLogs.length > 0 ? (
            <div className="space-y-4">
              {leadEditLogs.map((log) => (
                <div 
                  key={log.id} 
                  className={`p-4 rounded-xl border font-sans text-xs transition duration-155
                    ${darkMode ? "bg-slate-950/60 border-slate-800 hover:border-slate-700" : "bg-slate-50/60 border-slate-205 hover:border-slate-300 shadow-sm"}`}
                >
                  {/* Log Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100/10 mb-3 text-slate-400">
                    <div className="flex items-center gap-2">
                       <div className="p-1 px-2 rounded bg-amber-500/15 text-amber-500 font-bold font-mono text-[9px] uppercase border border-amber-500/20 flex items-center gap-1">
                        <History size={10} />
                        <span>Log</span>
                      </div>
                      <span className={`font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>
                        Lead: <strong className="text-teal-500">{log.leadName}</strong>
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2.5 text-[10px] font-mono">
                      <span>Edited By: <strong className="text-teal-400">{log.editorName}</strong></span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border
                        ${log.editorRole === 'super_admin' 
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                          : log.editorRole === 'admin' 
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}
                      >
                        {log.editorRole.replace('_', ' ')}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400 font-mono text-[10px]">{log.timestamp}</span>
                    </div>
                  </div>

                  {/* Changes List */}
                  <div className="space-y-2">
                    {log.changes.map((change, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 pl-3 py-1 border-l-2 border-amber-550">
                        <span className="font-mono text-[10px] text-slate-400 font-semibold uppercase min-w-[200px]">
                          {formatFieldName(change.field)}:
                        </span>
                        
                        <div className="flex-1 flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-slate-400 line-through truncate max-w-[220px]" title={change.oldValue}>
                            {change.oldValue || <span className="italic text-slate-500">None</span>}
                          </span>
                          <span className="text-slate-405 font-bold font-mono">→</span>
                          <span className="text-teal-450 font-bold bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded max-w-[320px] truncate" title={change.newValue}>
                            {change.newValue || <span className="italic text-teal-600">None</span>}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              No portfolio revisions have been logged yet for your active session context.
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredLeads.length > 0 ? (
          filteredLeads.map((lead) => (
            <div 
              key={lead.id}
              id={`lead-card-${lead.id}`}
              className={`p-6 rounded-2xl border transition-all flex flex-col justify-between group relative overflow-hidden
                ${darkMode 
                  ? "bg-slate-900/90 border-slate-850 hover:border-slate-700 hover:shadow-lg hover:shadow-black/20" 
                  : "bg-white border-slate-150 shadow-sm hover:border-slate-300 hover:shadow-md"}`}
            >
              
              {/* Top Row: Lead Header and Score */}
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    {lead.company && (
                      <span className="text-[10px] font-mono tracking-wider text-slate-400 font-semibold uppercase">
                        {lead.company}
                      </span>
                    )}
                    <h4 className="font-display font-bold text-lg leading-tight mt-0.5 group-hover:text-teal-500 transition duration-150">
                      {lead.name}
                    </h4>
                    <p className={`text-xs mt-0.5 ${darkMode ? "text-slate-300" : "text-slate-650"}`}>
                      {lead.position || "Private Client"} | <span className="text-teal-400 font-mono text-[10px]">Assignee: {lead.assignedAgent}</span>
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase font-semibold ${getStatusBadgeClass(lead.status)}`}>
                      {lead.status}
                    </span>
                    <div className="text-[10px] font-mono font-medium">
                      Priority Index: <span className={getScoreColor(lead.score || 50)}>{lead.score || 50}</span>
                    </div>
                  </div>
                </div>

                {/* Main statistics / details row */}
                <div className="grid grid-cols-2 gap-4 my-4 p-3 rounded-xl bg-slate-100/5 dark:bg-slate-950/40 border border-slate-100/5">
                  <div className="flex items-center gap-2">
                    <IndianRupee size={14} className="text-teal-500" />
                    <div>
                      <p className="text-[10px] text-slate-400 leading-none">BUDGET ALLOCATED</p>
                      <p className="text-xs font-bold font-mono text-teal-400 tracking-tight mt-0.5">{lead.budget || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-indigo-400" />
                    <div>
                      <p className="text-[10px] text-slate-400 leading-none">LEAD SOURCE</p>
                      <p className="text-xs font-bold truncate mt-0.5 max-w-[120px] text-indigo-300">{lead.source}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-amber-500" />
                    <div className="overflow-hidden">
                      <p className="text-[10px] text-slate-400 leading-none">LOCATION</p>
                      <p className="text-xs truncate font-medium mt-0.5 max-w-[120px]">{lead.location || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-emerald-400" />
                    <div>
                      <p className="text-[10px] text-slate-400 leading-none">LEAD PRIORITY</p>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold mt-0.5 ${getTemperatureBadgeClass(lead.temperature)}`}>
                        {lead.temperature}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Notes Block */}
                <div className="space-y-1 mt-3">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-mono">Latest Consultation Synopsis (Notes)</p>
                  <p className={`text-xs font-light italic leading-relaxed line-clamp-2 ${darkMode ? "text-slate-350" : "text-slate-600"}`}>
                    "{lead.notes || "No advisory brief recorded yet."}"
                  </p>
                </div>
              </div>

              {/* Communication contacts list & Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100/10 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-400 gap-2">
                  <div className="flex items-center gap-3">
                    <a href={`mailto:${lead.email}`} className="hover:text-teal-400 flex items-center gap-1">
                      <Mail size={12} />
                      {lead.email}
                    </a>
                    <a href={`tel:${lead.phone}`} className="hover:text-teal-400 flex items-center gap-1">
                      <Phone size={12} />
                      {lead.phone}
                    </a>
                  </div>

                  <div className="font-mono text-[9px] uppercase tracking-wider text-right">
                    Last Comm: {lead.lastCommunication}
                  </div>
                </div>

                {/* Interaction & AI Assistant triggers */}
                <div className="flex items-center justify-between gap-2.5 mt-1 pt-1.5">
                  <button 
                    id={`trigger-ai-email-${lead.id}`}
                    onClick={() => generateAIFollowUp(lead)}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold bg-teal-605 hover:bg-teal-550 border border-teal-50/10 text-white flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 shadow-md shadow-teal-500/10"
                  >
                    <Sparkles size={11} className="text-amber-300 animate-pulse" />
                    Draft AI Advisory Email
                  </button>

                  <div className="flex gap-1.5">
                    <button
                      id={`edit-lead-${lead.id}`}
                      onClick={() => setEditingLead(lead)}
                      className={`p-2 rounded-xl transition duration-155 cursor-pointer border
                        ${darkMode 
                          ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200" 
                          : "bg-slate-50 hover:bg-slate-150 border-slate-200 text-slate-700"}`}
                      title="Edit Real Estate Parameters"
                    >
                      <Edit3 size={13} />
                    </button>

                    {currentUser?.role !== "sales_team" && (
                      <button
                        id={`delete-lead-${lead.id}`}
                        onClick={() => onDeleteLead(lead.id)}
                        className={`p-2 rounded-xl transition duration-155 cursor-pointer border hover:border-rose-500/30 hover:text-rose-500
                          ${darkMode 
                            ? "bg-slate-800 border-slate-705 text-slate-400" 
                            : "bg-slate-50 border-slate-200 text-slate-500"}`}
                        title="Delete Entry"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="py-12 text-center text-slate-400 lg:col-span-2">
            No matches found. Clear filters or add a fresh real estate client.
          </div>
        )}
      </div>
      )}

      {/* MODAL: Draft AI Advisor Email */}
      {selectedLeadForAI && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all animate-none">
          <div 
            id="ai-email-modal"
            className={`w-full max-w-2xl rounded-2xl border p-6 shadow-2xl relative
              ${darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"}`}
          >
            <button 
              onClick={() => setSelectedLeadForAI(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100/10 mb-4">
              <div className="p-2 bg-gradient-to-tr from-teal-500 to-amber-400 rounded-xl text-slate-900">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg">AI Strategic Auto-Followup</h3>
                <p className="text-xs text-slate-450">Elite Pro Infra Automated Client Response Assistant</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Parameters input column */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-widest mb-1">Target Client Profile</label>
                  <p className="text-sm font-semibold">{selectedLeadForAI.name} ({selectedLeadForAI.company})</p>
                  <p className="text-xs text-slate-400">Source: {selectedLeadForAI.source} | Budget: {selectedLeadForAI.budget}</p>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-widest mb-1">Response Communication Style</label>
                  <select
                    id="ai-email-mood"
                    value={emailMood}
                    onChange={(e) => setEmailMood(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-lg border font-sans font-medium transition duration-200 cursor-pointer
                      ${darkMode ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200"}`}
                  >
                    <option value="persuasive and authoritative">👔 Authoritative & Strategic Partner Theme</option>
                    <option value="urgency and high priority">⚡ High Pipeline Velocity & Alignment Tour</option>
                    <option value="technical and architectural details">🏗️ Granular Technical Specifications Focus</option>
                    <option value="warm, relationship oriented">🤝 High Relationship Building Theme</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-widest mb-1">Incorporate Real-time Brief Notes</label>
                  <textarea
                    id="ai-email-notes"
                    rows={4}
                    value={emailNotes}
                    onChange={(e) => setEmailNotes(e.target.value)}
                    placeholder="Enter proprietary brief directives or leave empty to default to original lead consultation notes."
                    className={`w-full px-3 py-2 text-xs rounded-lg border font-sans font-light transition duration-200
                      ${darkMode ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200"}`}
                  />
                </div>

                <button
                  id="recompile-ai-email-btn"
                  onClick={() => generateAIFollowUp(selectedLeadForAI)}
                  disabled={isGeneratingEmail}
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-550 text-white font-semibold text-xs transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isGeneratingEmail ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      Drafting custom advisory brief...
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} className="text-amber-300" />
                      Configure & Generate Email Draft
                    </>
                  )}
                </button>
              </div>

              {/* Output Preview Column */}
              <div className="flex flex-col justify-between border-l border-slate-100/10 pl-0 md:pl-4">
                <div className="flex-1 flex flex-col min-h-[220px]">
                  <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-widest mb-1">Live Preview</label>
                  
                  {isGeneratingEmail ? (
                    <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-100/10 rounded-xl p-4 text-center">
                      <Loader2 size={24} className="animate-spin text-teal-500 mb-2" />
                      <p className="text-xs font-semibold">Gemini AI Engine Spinning...</p>
                      <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">Crafting professional commercial real estate follow-up prose aligned with target variables.</p>
                    </div>
                  ) : emailBody ? (
                    <div className="flex-1 flex flex-col border border-dashed rounded-xl p-3 bg-slate-950/20 max-h-[260px] overflow-y-auto w-full text-left leading-relaxed text-xs">
                      <div className="pb-1.5 mb-1.5 border-b border-slate-100/5">
                        <span className="font-bold text-teal-400">Subject:</span> {emailSubject}
                      </div>
                      <div className="whitespace-pre-line font-light">{emailBody}</div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-150 rounded-xl p-4 text-center">
                      <AlertCircle size={20} className="text-slate-400 mb-1" />
                      <p className="text-xs text-slate-400">Ready to initiate generation protocol.</p>
                    </div>
                  )}
                </div>

                {/* Final Copy / Log Button */}
                {emailBody && (
                  <div className="mt-3 space-y-2">
                    {emailSuccessMsg && (
                      <div className="text-[11px] text-emerald-400 text-center font-semibold bg-emerald-500/10 py-1.5 rounded-lg border border-emerald-500/15 animate-pulse">
                        {emailSuccessMsg}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <button
                        id="copy-to-clipboard-btn"
                        onClick={() => {
                          const fullTxt = `Subject: ${emailSubject}\n\n${emailBody}`;
                          navigator.clipboard.writeText(fullTxt);
                        }}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 cursor-pointer
                          ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-100 border-slate-200"}`}
                      >
                        <Copy size={13} />
                        Copy Draft
                      </button>

                      <button
                        id="send-simulate-email-btn"
                        onClick={handleSimulateSendEmail}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Send size={13} />
                        Log Campaign Sync
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add Lead */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
          <div 
            id="add-lead-modal"
            className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl relative
              ${darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"}`}
          >
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-450 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="font-display font-bold text-lg border-b border-slate-100/10 pb-3 mb-4">Register Capital Investor Lead</h3>

            <form onSubmit={handleAddNewLead} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Customer Name *</label>
                <input
                  id="new-lead-name"
                  required
                  type="text"
                  placeholder="Enter customer name"
                  value={newLeadForm.name}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-lg border 
                    ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                  <input
                    id="new-lead-email"
                    type="email"
                    placeholder="name@corporation.com"
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-lg border 
                      ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Phone Number</label>
                  <input
                    id="new-lead-phone"
                    type="text"
                    placeholder="e.g. +91 99999 99999"
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-lg border 
                      ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Lead Source</label>
                  <select
                    id="new-lead-source"
                    value={newLeadForm.source}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, source: e.target.value as Lead["source"] })}
                    className={`w-full px-3 py-2 text-xs rounded-lg border cursor-pointer
                      ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}
                  >
                    <option value="Meta Ad">Meta Ad</option>
                    <option value="Google Ad">Google Ad</option>
                    <option value="IVR Board">IVR Board</option>
                    <option value="IVR">IVR</option>
                    <option value="Reference">Reference</option>
                    <option value="Website">Website</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Personal">Personal</option>
                    <option value="Cold Call">Cold Call</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Physical Location</label>
                  <input
                    id="new-lead-location"
                    type="text"
                    placeholder="e.g. Noida Sector 62, India"
                    value={newLeadForm.location}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, location: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-lg border 
                      ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Lead Status</label>
                  <select
                    id="new-lead-status"
                    value={newLeadForm.status}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, status: e.target.value as Lead["status"] })}
                    className={`w-full px-3 py-2 text-xs rounded-lg border cursor-pointer
                      ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}
                  >
                    <option value="Interested">Interested</option>
                    <option value="Follow Up">Follow Up</option>
                    <option value="Detailed Share">Detailed Share</option>
                    <option value="Not Interested">Not Interested</option>
                    <option value="Meeting Done">Meeting Done</option>
                    <option value="Site Visit">Site Visit</option>
                    <option value="Call Back">Call Back</option>
                    <option value="Junk">Junk</option>
                    <option value="Duplicate">Duplicate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Lead Priority</label>
                  <select
                    id="new-lead-temperature"
                    value={newLeadForm.temperature}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, temperature: e.target.value as Lead["temperature"] })}
                    className={`w-full px-3 py-2 text-xs rounded-lg border cursor-pointer
                      ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}
                  >
                    <option value="Hot">🔥 Hot</option>
                    <option value="Warm">☀️ Warm</option>
                    <option value="Cold">❄️ Cold</option>
                    <option value="Dead">🫙 Dead</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Budget</label>
                  <input
                    id="new-lead-budget"
                    type="text"
                    placeholder="e.g. ₹15.0 Cr"
                    value={newLeadForm.budget}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, budget: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-lg border 
                      ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Assign To (Agent)</label>
                  {!isAuthorizedToAssign && (
                    <span className="text-[9px] text-rose-450 flex items-center gap-1 font-mono uppercase">
                      <Lock size={10} /> Locked
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="new-lead-agent"
                    type="text"
                    placeholder="Select or type agent name..."
                    value={newLeadForm.assignedAgent}
                    onChange={(e) => {
                      if (isAuthorizedToAssign) {
                        setNewLeadForm({ ...newLeadForm, assignedAgent: e.target.value });
                      }
                    }}
                    disabled={!isAuthorizedToAssign}
                    className={`w-full pr-10 px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-teal-500
                      ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}
                      ${!isAuthorizedToAssign ? "opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-900" : ""}`}
                  />
                  {isAuthorizedToAssign && (
                    <button
                      type="button"
                      onClick={() => setShowNewAgentDropdown(!showNewAgentDropdown)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 pointer-events-auto"
                    >
                      <ChevronDown size={14} className={`transform transition-transform ${showNewAgentDropdown ? "rotate-180" : ""}`} />
                    </button>
                  )}
                  {showNewAgentDropdown && isAuthorizedToAssign && (
                    <div className={`absolute z-30 w-full mt-1 max-h-40 overflow-y-auto rounded-lg shadow-xl border text-xs divide-y
                      ${darkMode ? "bg-slate-900 border-slate-800 text-slate-200 divide-slate-800/50" : "bg-white border-slate-200 text-slate-800 divide-slate-100"}`}>
                      {finalAgents.map((agent) => (
                        <button
                          key={agent}
                          type="button"
                          onClick={() => {
                            setNewLeadForm({ ...newLeadForm, assignedAgent: agent });
                            setShowNewAgentDropdown(false);
                          }}
                          className={`w-full px-3 py-2 text-left transition select-none ${darkMode ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}
                        >
                          {agent}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {!isAuthorizedToAssign && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Only Super Admin and Admin roles can assign or change lead ownership.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Notes (Consultation Synopsis Brief)</label>
                <textarea
                  id="new-lead-notes"
                  rows={3}
                  value={newLeadForm.notes}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  placeholder="Record essential client demands and notes here..."
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
                  Register Lead Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Lead */}
      {editingLead && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all animate-none">
          <div 
            id="edit-lead-modal"
            className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl relative
              ${darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"}`}
          >
            <button 
              onClick={() => setEditingLead(null)}
              className="absolute top-4 right-4 text-slate-450 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="font-display font-bold text-lg border-b border-slate-100/10 pb-3 mb-4">Edit Capital Real Estate Parameters</h3>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Customer Name *</label>
                <input
                  id="edit-lead-name"
                  required
                  type="text"
                  value={editingLead.name}
                  onChange={(e) => setEditingLead({ ...editingLead, name: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-lg border 
                    ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Corporate Position</label>
                  <input
                    id="edit-lead-position"
                    type="text"
                    value={editingLead.position || ""}
                    onChange={(e) => setEditingLead({ ...editingLead, position: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-lg border 
                      ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Allocated Capital Budget</label>
                  <input
                    id="edit-lead-budget"
                    type="text"
                    value={editingLead.budget}
                    onChange={(e) => setEditingLead({ ...editingLead, budget: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-lg border 
                      ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                  <input
                    id="edit-lead-email"
                    type="email"
                    value={editingLead.email}
                    onChange={(e) => setEditingLead({ ...editingLead, email: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-lg border 
                      ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Phone Number</label>
                  <input
                    id="edit-lead-phone"
                    type="text"
                    value={editingLead.phone}
                    onChange={(e) => setEditingLead({ ...editingLead, phone: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-lg border 
                      ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Lead Source</label>
                  <select
                    id="edit-lead-source"
                    value={editingLead.source}
                    onChange={(e) => setEditingLead({ ...editingLead, source: e.target.value as Lead["source"] })}
                    className={`w-full px-3 py-2 text-xs rounded-lg border cursor-pointer
                      ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}
                  >
                    <option value="Meta Ad">Meta Ad</option>
                    <option value="Google Ad">Google Ad</option>
                    <option value="IVR Board">IVR Board</option>
                    <option value="IVR">IVR</option>
                    <option value="Reference">Reference</option>
                    <option value="Website">Website</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Personal">Personal</option>
                    <option value="Cold Call">Cold Call</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Physical Location</label>
                  <input
                    id="edit-lead-location"
                    type="text"
                    value={editingLead.location}
                    onChange={(e) => setEditingLead({ ...editingLead, location: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-lg border 
                      ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Lead Status</label>
                  <select
                    id="edit-lead-status"
                    value={editingLead.status}
                    onChange={(e) => setEditingLead({ ...editingLead, status: e.target.value as Lead["status"] })}
                    className={`w-full px-3 py-2 text-xs rounded-lg border cursor-pointer
                      ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 font-medium"}`}
                  >
                    <option value="Interested">Interested</option>
                    <option value="Follow Up">Follow Up</option>
                    <option value="Detailed Share">Detailed Share</option>
                    <option value="Not Interested">Not Interested</option>
                    <option value="Meeting Done">Meeting Done</option>
                    <option value="Site Visit">Site Visit</option>
                    <option value="Call Back">Call Back</option>
                    <option value="Junk">Junk</option>
                    <option value="Duplicate">Duplicate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Lead Priority</label>
                  <select
                    id="edit-lead-temperature"
                    value={editingLead.temperature}
                    onChange={(e) => setEditingLead({ ...editingLead, temperature: e.target.value as Lead["temperature"] })}
                    className={`w-full px-3 py-2 text-xs rounded-lg border cursor-pointer
                      ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}
                  >
                    <option value="Hot">🔥 Hot</option>
                    <option value="Warm">☀️ Warm</option>
                    <option value="Cold">❄️ Cold</option>
                    <option value="Dead">🫙 Dead</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Assign To (Agent)</label>
                  {!isAuthorizedToAssign && (
                    <span className="text-[9px] text-rose-450 flex items-center gap-1 font-mono uppercase">
                      <Lock size={10} /> Locked
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="edit-lead-agent"
                    type="text"
                    placeholder="Select or type agent name..."
                    value={editingLead.assignedAgent}
                    onChange={(e) => {
                      if (isAuthorizedToAssign) {
                        setEditingLead({ ...editingLead, assignedAgent: e.target.value });
                      }
                    }}
                    disabled={!isAuthorizedToAssign}
                    className={`w-full pr-10 px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-teal-500
                      ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}
                      ${!isAuthorizedToAssign ? "opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-900" : ""}`}
                  />
                  {isAuthorizedToAssign && (
                    <button
                      type="button"
                      onClick={() => setShowEditAgentDropdown(!showEditAgentDropdown)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 pointer-events-auto"
                    >
                      <ChevronDown size={14} className={`transform transition-transform ${showEditAgentDropdown ? "rotate-180" : ""}`} />
                    </button>
                  )}
                  {showEditAgentDropdown && isAuthorizedToAssign && (
                    <div className={`absolute z-30 w-full mt-1 max-h-40 overflow-y-auto rounded-lg shadow-xl border text-xs divide-y
                      ${darkMode ? "bg-slate-900 border-slate-800 text-slate-200 divide-slate-800/50" : "bg-white border-slate-200 text-slate-800 divide-slate-100"}`}>
                      {finalAgents.map((agent) => (
                        <button
                          key={agent}
                          type="button"
                          onClick={() => {
                            setEditingLead({ ...editingLead, assignedAgent: agent });
                            setShowEditAgentDropdown(false);
                          }}
                          className={`w-full px-3 py-2 text-left transition select-none ${darkMode ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}
                        >
                          {agent}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {!isAuthorizedToAssign && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Only Super Admin and Admin roles can assign or change lead ownership.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Notes (Consultation Synopsis Brief)</label>
                <textarea
                  id="edit-lead-notes"
                  rows={3}
                  value={editingLead.notes}
                  onChange={(e) => setEditingLead({ ...editingLead, notes: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-lg border 
                    ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}
                />
              </div>

              <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-100/10">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border cursor-pointer
                    ${darkMode ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-white" : "bg-slate-100 hover:bg-slate-150 border-slate-205"}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white cursor-pointer"
                >
                  Save Real Estate Parameters
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
