import React, { useState, useEffect, useMemo } from "react";
import { INITIAL_LEADS, INITIAL_APPOINTMENTS, INITIAL_COMMUNICATION_LOGS, SALES_METRICS_HISTORY, PRESET_USERS } from "./data";
import { Lead, Appointment, CommunicationLog, User, UserRole, LeadEditLog } from "./types";
import Sidebar from "./components/Sidebar";
import PerformanceDashboard from "./components/PerformanceDashboard";
import LeadPipeline from "./components/LeadPipeline";
import AppointmentsList from "./components/AppointmentsList";
import StakeholderReports from "./components/StakeholderReports";
import SystemSync from "./components/SystemSync";
import MobileCompanion from "./components/MobileCompanion";
import LoginPortal from "./components/LoginPortal";
import UserManagement from "./components/UserManagement";
import { 
  Menu, 
  X, 
  Building2, 
  Sparkles, 
  HelpCircle,
  Bell,
  Lock,
  UserCheck,
  ShieldCheck,
  AlertOctagon
} from "lucide-react";
import { motion } from "motion/react";

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("elite_pro_current_user");
    return saved ? JSON.parse(saved) : null; // Starts logged out for realistic, robust role-based access testing
  });

  // User Directory State
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem("elite_pro_users");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error(err);
      }
    }
    return PRESET_USERS;
  });

  // Application State
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem("elite_pro_leads");
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem("elite_pro_appointments");
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLog[]>(() => {
    const saved = localStorage.getItem("elite_pro_communication_logs");
    return saved ? JSON.parse(saved) : INITIAL_COMMUNICATION_LOGS;
  });

  const [leadEditLogs, setLeadEditLogs] = useState<LeadEditLog[]>(() => {
    const saved = localStorage.getItem("elite_pro_lead_edit_logs");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "edit-log-init-1",
        leadId: "lead-3",
        leadName: "Akira Tanaka",
        editorName: "Rakesh Verma",
        editorRole: "sales_team",
        timestamp: "May 24, 2026, 3:15:22 PM UTC",
        changes: [
          { field: "status", oldValue: "Detailed Share", newValue: "Site Visit" },
          { field: "temperature", oldValue: "Warm", newValue: "Hot" }
        ]
      },
      {
        id: "edit-log-init-2",
        leadId: "lead-3",
        leadName: "Akira Tanaka",
        editorName: "Rakesh Verma",
        editorRole: "sales_team",
        timestamp: "May 22, 2026, 11:20:05 AM UTC",
        changes: [
          { field: "notes", oldValue: "Interested in glass facade shell.", newValue: "Deal closed successfully on May 18. Architect plans sent for custom interior facade styling." },
          { field: "score", oldValue: "85", newValue: "100" }
        ]
      }
    ];
  });

  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("elite_pro_dark_mode");
    return saved ? JSON.parse(saved) === "true" : false; // Default to eye-comfort clean light mode
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncHistory, setSyncHistory] = useState<string[]>([
    "2026-05-25 07:44:12 GMT - Master Node Aligned Successfully",
    "2026-05-24 18:20:05 GMT - Google workspace domain boundary sync completed",
    "2026-05-23 09:12:30 GMT - DB transaction ledger reconciled"
  ]);

  // Is Mobile Companion Mode simulated activity check
  const [isMobileModeActive, setIsMobileModeActive] = useState<boolean>(false);

  // Custom modal config state
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "alert" | "confirm";
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "alert"
  });

  const triggerAlert = (title: string, message: string) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type: "alert"
    });
  };

  const triggerConfirm = (title: string, message: string, onConfirm: () => void) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type: "confirm",
      onConfirm
    });
  };

  // Persistence side effects
  useEffect(() => {
    localStorage.setItem("elite_pro_leads", JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem("elite_pro_appointments", JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem("elite_pro_communication_logs", JSON.stringify(communicationLogs));
  }, [communicationLogs]);

  useEffect(() => {
    localStorage.setItem("elite_pro_lead_edit_logs", JSON.stringify(leadEditLogs));
  }, [leadEditLogs]);

  useEffect(() => {
    localStorage.setItem("elite_pro_dark_mode", darkMode ? "true" : "false");
  }, [darkMode]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("elite_pro_current_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("elite_pro_current_user");
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("elite_pro_users", JSON.stringify(users));
  }, [users]);

  // Derive filtered records based on active role boundary
  const visibleLeads = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "super_admin" || currentUser.role === "admin") {
      return leads;
    }
    // Sales Team can see only leads which is assigned to them.
    return leads.filter(l => (l.assignedAgent || "").toLowerCase() === currentUser.name.toLowerCase());
  }, [leads, currentUser]);

  const visibleLeadEditLogs = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "super_admin" || currentUser.role === "admin") {
      return leadEditLogs;
    }
    // Sales Team can see his own edit log
    return leadEditLogs.filter(log => log.editorName.toLowerCase() === currentUser.name.toLowerCase());
  }, [leadEditLogs, currentUser]);

  const visibleAppointments = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "super_admin" || currentUser.role === "admin") {
      return appointments;
    }
    // Filter appointments belonging to leads assigned to the Sales Team user
    const assignedLeadIds = new Set(
      leads
        .filter(l => (l.assignedAgent || "").toLowerCase() === currentUser.name.toLowerCase())
        .map(l => l.id)
    );
    return appointments.filter(app => assignedLeadIds.has(app.leadId));
  }, [appointments, leads, currentUser]);

  // Handler: Add User
  const handleAddUser = (newUser: Omit<User, "id">) => {
    const id = "user-" + (users.length + 1) + "-" + Math.random().toString(36).substr(2, 4);
    const item: User = {
      ...newUser,
      id
    };
    setUsers(prev => [...prev, item]);
  };

  // Handler: Update User
  const handleUpdateUser = (updated: User) => {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    if (currentUser && currentUser.id === updated.id) {
      setCurrentUser(updated);
    }
  };

  // Handler: Delete User
  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  // Handler: Add Lead
  const handleAddLead = (newLead: Omit<Lead, "id" | "dateCreated" | "dateUpdated">) => {
    const id = "lead-" + (leads.length + 1) + "-" + Math.random().toString(36).substr(2, 4);
    const createdDate = new Date().toISOString().split("T")[0];
    const item: Lead = {
      ...newLead,
      id,
      dateCreated: createdDate,
      dateUpdated: createdDate
    };
    setLeads(prev => [item, ...prev]);

    // Also auto-generate general appointment follow-up for tomorrow relative to local time (today: 2026-05-25)
    // to protect leads followups as requested: "Also, set reminder so that sales team can easily manage..."
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const automaticAppt: Appointment = {
      id: "app-auto-" + Math.random().toString(36).substr(2, 5),
      leadId: id,
      leadName: newLead.name,
      title: `Automated Outreach Target: ${newLead.name}`,
      date: tomorrowStr,
      time: "09:00",
      type: "followup",
      notes: `Auto-generated follow-up reminder for fresh client ${newLead.name} via ${newLead.source}.`,
      isCompleted: false,
      reminderActive: true
    };
    setAppointments(prev => [automaticAppt, ...prev]);
  };

  // Handler: Update Lead
  const handleUpdateLead = (updated: Lead) => {
    const oldLead = leads.find(l => l.id === updated.id);
    if (oldLead && currentUser) {
      const changes: { field: string; oldValue: string; newValue: string }[] = [];
      const fieldsToTrack: (keyof Lead)[] = [
        "name", "company", "position", "email", "phone", "source", "status", "temperature", "budget", "location", "assignedAgent", "notes", "score"
      ];
      
      fieldsToTrack.forEach(field => {
        const oldVal = oldLead[field] !== undefined ? String(oldLead[field]) : "";
        const newVal = updated[field] !== undefined ? String(updated[field]) : "";
        if (oldVal !== newVal) {
          // Format visually pleasing labels or keep the field raw
          changes.push({
            field,
            oldValue: oldVal,
            newValue: newVal
          });
        }
      });

      // Create an edit log if there are alterations
      if (changes.length > 0) {
        const newLog: LeadEditLog = {
          id: "edit-log-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
          leadId: updated.id,
          leadName: updated.name,
          editorName: currentUser.name,
          editorRole: currentUser.role,
          timestamp: new Date().toLocaleString("en-US", { 
            timeStyle: "medium", 
            dateStyle: "medium",
            timeZone: "UTC"
          }) + " UTC",
          changes
        };
        setLeadEditLogs(prev => [newLog, ...prev]);
      }
    }
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
  };

  // Handler: Delete Lead
  const handleDeleteLead = (id: string) => {
    // Role-based Access Control authorization filter
    if (currentUser?.role !== "super_admin") {
      triggerAlert(
        "Access Refused",
        `Full hard removal of real-estate lead portfolios requires [Super Admin] authority. Your current role [${currentUser?.role?.replace('_', ' ').toUpperCase()}] does not possess this permit.`
      );
      return;
    }

    triggerConfirm(
      "Confirm Investor Removal",
      "Are you sure you want to remove this investor registration? All communication logs will remain secured in metadata.",
      () => {
        setLeads(prev => prev.filter(l => l.id !== id));
      }
    );
  };

  // Handler: Add Appointment
  const handleAddAppointment = (appt: Omit<Appointment, "id" | "isCompleted">) => {
    const id = "app-" + (appointments.length + 1) + "-" + Math.random().toString(36).substr(2, 4);
    const item: Appointment = {
      ...appt,
      id,
      isCompleted: false
    };
    setAppointments(prev => [item, ...prev]);
  };

  // Handler: Update Appointment
  const handleUpdateAppointment = (updated: Appointment) => {
    setAppointments(prev => prev.map(a => a.id === updated.id ? updated : a));
  };

  // Handler: Delete Appointment
  const handleDeleteAppointment = (id: string) => {
    // Role-based Access Control authorization filter
    if (currentUser?.role === "sales_team") {
      triggerAlert(
        "Access Refused",
        "Sales Advisor accounts are unauthorized to delete active client appointments. Please coordinate with operations admins or super administrators."
      );
      return;
    }

    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  // Handler: Add Communication Log
  const handleAddCommunicationLog = (log: Omit<CommunicationLog, "id">) => {
    const id = "log-" + (communicationLogs.length + 1) + "-" + Math.random().toString(36).substr(2, 4);
    const item: CommunicationLog = {
      ...log,
      id
    };
    setCommunicationLogs(prev => [item, ...prev]);
    setIsMobileModeActive(true); // Signal activity state icon on companion mobile sidebar
  };

  // Master Synchronizer Action (simulates API connection)
  const handleMasterSynchronization = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const now = new Date();
      const timeStr = now.toISOString().replace("T", " ").substr(0, 19) + " GMT";
      setSyncHistory(prev => [
        `${timeStr} - Forced Synchronization complete. Workspace calendar & CRM systems mapped.`,
        ...prev
      ]);
    }, 1800);
  };

  // Toggle Dark Mode
  const handleToggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Handle Logout
  const handleLogout = () => {
    triggerConfirm(
      "Confirm Logout",
      "Do you want to log out of Elite Pro Infrastructure CRM? This will secure your active session.",
      () => {
        setCurrentUser(null);
      }
    );
  };

  // Guard check to filter out active view tab restrictions
  const isViewRestricted = (tabId: string) => {
    if (currentUser?.role === "sales_team") {
      return tabId === "reports" || tabId === "integrations" || tabId === "users";
    }
    return false;
  };

  // Render locked screen styling inside the tab runway
  const renderRestrictedAccessBlock = (moduleLabel: string, permittedRoles: string[]) => {
    return (
      <div className={`p-10 rounded-3xl border transition-all flex flex-col items-center justify-center text-center max-w-xl mx-auto my-14
        ${darkMode ? "bg-slate-900 border-slate-850" : "bg-white border-slate-200/80 shadow-md shadow-slate-100/10"}`}
      >
        <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-5 animate-pulse">
          <Lock size={32} className="stroke-[1.75]" />
        </div>
        
        <h3 className={`font-display font-bold text-xl tracking-tight mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
          Module Access Unauthorized
        </h3>
        
        <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
          The proprietary module <span className="text-teal-400 uppercase font-mono font-bold">[{moduleLabel}]</span> is restricted from your assigned security level. Board policies mandate high-level credentials for access.
        </p>

        <div className={`w-full p-4 rounded-xl border text-left space-y-3 mb-6
          ${darkMode ? "bg-slate-950/70 border-slate-805" : "bg-slate-50 border-slate-200/50"}`}
        >
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block mb-1">Permitted Levels:</span>
            <div className="flex gap-2.5">
              {permittedRoles.map((role, i) => (
                <span key={i} className="px-2.5 py-0.5 rounded-md text-[9px] font-mono border font-bold uppercase bg-teal-500/15 border-teal-500/30 text-teal-400">
                  {role.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
          
          <div className="border-t border-slate-100/10 pt-2.5 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Your Identity: <strong className="text-rose-400 uppercase font-mono">{currentUser?.name}</strong></span>
            <span className="px-2 py-0.5 rounded-md text-[9px] font-mono border font-bold uppercase bg-rose-500/10 border-rose-500/30 text-rose-400">
              {currentUser?.role?.replace('_', ' ')}
            </span>
          </div>
        </div>

        <button 
          id="restricted-bypass-btn"
          onClick={() => setCurrentUser(null)}
          className="px-5 py-3 rounded-xl bg-teal-605 hover:bg-teal-550 text-white font-semibold text-xs tracking-wide uppercase transition shadow-md shadow-teal-505/10 cursor-pointer active:scale-95"
        >
          Securely Switch Admin Account
        </button>
      </div>
    );
  };

  // Render sub-components based on active tab state
  const renderTabContent = () => {
    if (isViewRestricted(currentTab)) {
      if (currentTab === "reports") {
        return renderRestrictedAccessBlock("Stakeholder Reports", ["super_admin", "admin"]);
      }
      if (currentTab === "integrations") {
        return renderRestrictedAccessBlock("System Sync", ["super_admin", "admin"]);
      }
      if (currentTab === "users") {
        return renderRestrictedAccessBlock("Sales Team Accounts", ["super_admin", "admin"]);
      }
    }

    switch (currentTab) {
      case "dashboard":
        return (
          <PerformanceDashboard
            leads={visibleLeads}
            metricsHistory={SALES_METRICS_HISTORY}
            darkMode={darkMode}
            onNavigateToLeads={() => setCurrentTab("leads")}
          />
        );
      case "leads":
        return (
          <LeadPipeline
            leads={visibleLeads}
            users={users}
            onAddLead={handleAddLead}
            onUpdateLead={handleUpdateLead}
            onDeleteLead={handleDeleteLead}
            communicationLogs={communicationLogs}
            onAddCommunicationLog={handleAddCommunicationLog}
            darkMode={darkMode}
            currentUser={currentUser}
            leadEditLogs={visibleLeadEditLogs}
          />
        );
      case "calendar":
        return (
          <AppointmentsList
            appointments={visibleAppointments}
            leads={visibleLeads}
            onAddAppointment={handleAddAppointment}
            onUpdateAppointment={handleUpdateAppointment}
            onDeleteAppointment={handleDeleteAppointment}
            darkMode={darkMode}
          />
        );
      case "reports":
        return (
          <StakeholderReports
            leads={visibleLeads}
            darkMode={darkMode}
          />
        );
      case "integrations":
        return (
          <SystemSync
            darkMode={darkMode}
            isSyncing={isSyncing}
            onTriggerSync={handleMasterSynchronization}
            syncHistory={syncHistory}
          />
        );
      case "users":
        return (
          <UserManagement
            users={users}
            currentUser={currentUser}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            darkMode={darkMode}
          />
        );
      case "mobile-simulation":
        return (
          <MobileCompanion
            leads={visibleLeads}
            onUpdateLead={handleUpdateLead}
            onAddCommunicationLog={handleAddCommunicationLog}
            onTriggerSync={handleMasterSynchronization}
            darkMode={darkMode}
          />
        );
      default:
        return (
          <PerformanceDashboard
            leads={visibleLeads}
            metricsHistory={SALES_METRICS_HISTORY}
            darkMode={darkMode}
            onNavigateToLeads={() => setCurrentTab("leads")}
          />
        );
    }
  };

  // If there's no logged-in user session, render the beautiful, dedicated Security Control Login Gate!
  if (!currentUser) {
    return (
      <LoginPortal 
        users={users}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          // Auto route to lead pipeline or dashboard
          setCurrentTab("dashboard");
        }}
        darkMode={darkMode}
      />
    );
  }

  const todayRemindersCount = appointments.filter(a => a.date === "2026-05-25" && !a.isCompleted).length;

  return (
    <div 
      id="root-viewport-wrap"
      className={`min-h-screen transition-colors duration-300 flex overflow-hidden
        ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"}`}
    >
      {/* Sidebar Controller Component */}
      <Sidebar
        currentTab={currentTab}
        onChangeTab={(tab) => {
          setCurrentTab(tab);
          if (tab === "mobile-simulation") {
            setIsMobileModeActive(false); // Reset notification dot once viewed
          }
        }}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        isSyncing={isSyncing}
        onTriggerSync={handleMasterSynchronization}
        isMobileModeActive={isMobileModeActive}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Screen Runway Area */}
      <main 
        id="crm-main-canvas"
        className="flex-1 ml-64 min-h-screen flex flex-col justify-between overflow-y-auto px-8 py-6 relative"
      >
        <div>
          {/* Top Navbar Header */}
          <header className={`flex justify-between items-center pb-5 border-b mb-6 ${darkMode ? "border-slate-850" : "border-slate-150"}`}>
            <div className="text-left">
              <span className="text-[10px] font-mono tracking-widest text-slate-450 uppercase font-bold">
                SYSTEM MODULE &gt; {currentTab.toUpperCase()}
              </span>
              <h2 className="font-display font-bold text-xl leading-snug tracking-tight mt-0.5">
                {currentTab === "dashboard" && "Executive Command Dashboard"}
                {currentTab === "leads" && "Lead Infrastructure Runway"}
                {currentTab === "calendar" && "Appointment Calendar & Active Reminders"}
                {currentTab === "reports" && "Board Insights & Executive Summaries"}
                {currentTab === "integrations" && "Domain Integration & Sync Master"}
                {currentTab === "mobile-simulation" && "Field Representative Mobile Companion"}
              </h2>
            </div>

            {/* Quick alert indicator pill */}
            <div className="flex items-center gap-3">
              {todayRemindersCount > 0 && (
                <button 
                  id="header-notification-pill"
                  onClick={() => setCurrentTab("calendar")}
                  className="px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-500 text-xs font-semibold flex items-center gap-1.5 animate-pulse cursor-pointer transition select-none hover:bg-amber-500/25 active:scale-95"
                >
                  <Bell size={13} className="fill-amber-500/10" />
                  <span>{todayRemindersCount} Alignment Reminders Due Today</span>
                </button>
              )}

              {/* Dynamic current user badge */}
              <div 
                id="quick-domain-tag" 
                onClick={handleLogout}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition duration-150 cursor-pointer active:scale-95 select-none
                  ${darkMode 
                    ? "bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300" 
                    : "bg-white border-slate-200 hover:bg-slate-100 text-slate-700 shadow-xs"}`}
                title="Click to Switch User Profile"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span>{currentUser.email}</span>
                <span className="text-[9px] text-teal-400 uppercase font-mono font-semibold">[{currentUser.role}]</span>
              </div>
            </div>
          </header>

          {/* Active Tab Sub-view render */}
          <div id="tab-window-content-carrier" className="pb-16 animate-fade-in">
            {renderTabContent()}
          </div>
        </div>

        {/* Global Footer */}
        <footer className={`pt-4 border-t text-[10px] text-slate-400 font-mono flex flex-col sm:flex-row justify-between items-center gap-2 mt-auto
          ${darkMode ? "border-slate-800" : "border-slate-200"}`}
        >
          <span>Elite Pro Infra Corporate Real Estate Advisors CRM Console © 2026</span>
          <div className="flex gap-4 items-center">
            <span>Secure Enterprise Connection: Active TLSv1.3</span>
            <span>Local Node Current Time: 2026-05-25 08:10 GMT</span>
          </div>
        </footer>
      </main>

      {/* Custom Confirmation/Alert Dialog Overlay */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop lock */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => {
              if (modalConfig.type === "alert") {
                setModalConfig(prev => ({ ...prev, isOpen: false }));
              }
            }}
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`relative max-w-sm w-full p-6 rounded-2xl border shadow-2xl z-10 text-center flex flex-col items-center gap-4.5
              ${darkMode 
                ? "bg-slate-900 border-slate-800 text-slate-100" 
                : "bg-white border-slate-150 text-slate-800"}`}
          >
            {/* Top Indicator Accent Symbol */}
            {modalConfig.type === "alert" ? (
              <div className="p-3.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse">
                <AlertOctagon size={24} className="stroke-[1.75]" />
              </div>
            ) : (
              <div className="p-3.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <HelpCircle size={24} className="stroke-[1.75]" />
              </div>
            )}

            {/* Typography Heading & Body */}
            <div>
              <h3 className="font-display font-bold text-base leading-tight tracking-tight">
                {modalConfig.title}
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {modalConfig.message}
              </p>
            </div>

            {/* Structured Selection Button Rows */}
            <div className="flex gap-2.5 w-full mt-1">
              {modalConfig.type === "confirm" ? (
                <>
                  <button
                    id="modal-cancel-btn"
                    onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer select-none active:scale-97
                      ${darkMode 
                        ? "border-slate-850 bg-slate-950/40 hover:bg-slate-950 text-slate-400" 
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500"}`}
                  >
                    Cancel
                  </button>
                  <button
                    id="modal-confirm-btn"
                    onClick={() => {
                      setModalConfig(prev => ({ ...prev, isOpen: false }));
                      if (modalConfig.onConfirm) modalConfig.onConfirm();
                    }}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-555 transition cursor-pointer select-none active:scale-97 shadow-sm shadow-teal-500/10"
                  >
                    Confirm Action
                  </button>
                </>
              ) : (
                <button
                  id="modal-dismiss-btn"
                  onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-slate-850 hover:bg-slate-800 transition cursor-pointer select-none active:scale-97 shadow-sm"
                >
                  Acknowledge
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
