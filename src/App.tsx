import React, { useState, useEffect, useMemo, useRef } from "react";
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
  checkSupabaseStatus, 
  pushLocalDataToSupabase, 
  pullSupabaseData, 
  SupabaseStatus,
  dbUpsertUser,
  dbDeleteUser,
  dbUpsertLead,
  dbDeleteLead,
  dbUpsertAppointment,
  dbDeleteAppointment,
  dbUpsertCommunicationLog,
  dbUpsertLeadEditLog,
  dbBulkUpsert
} from "./supabase";
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
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("elite_pro_dark_mode");
    return saved ? JSON.parse(saved) === "true" : false; // Default to eye-comfort clean light mode
  });

  // Hoisted Google Sheets configuration states (prevent state loss when doing other work / switching tabs)
  const [sheetUrl, setSheetUrl] = useState<string>(() => localStorage.getItem("google_sheets_sync_url") || "");
  const [sheetRange, setSheetRange] = useState<string>(() => localStorage.getItem("google_sheets_sync_range") || "Sheet1");
  const [autoSheetsSync, setAutoSheetsSync] = useState<boolean>(() => localStorage.getItem("google_sheets_sync_auto") === "true");
  const [lastSheetsSynced, setLastSheetsSynced] = useState<string>(() => localStorage.getItem("google_sheets_last_sync_time") || "Never");

  useEffect(() => {
    localStorage.setItem("google_sheets_sync_url", sheetUrl);
  }, [sheetUrl]);

  useEffect(() => {
    localStorage.setItem("google_sheets_sync_range", sheetRange);
  }, [sheetRange]);

  useEffect(() => {
    localStorage.setItem("google_sheets_sync_auto", autoSheetsSync ? "true" : "false");
  }, [autoSheetsSync]);

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncHistory, setSyncHistory] = useState<string[]>([
    "2026-05-25 07:44:12 GMT - Master Node Aligned Successfully",
    "2026-05-24 18:20:05 GMT - Google workspace domain boundary sync completed",
    "2026-05-23 09:12:30 GMT - DB transaction ledger reconciled"
  ]);

  // Supabase Integration States
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseStatus>({
    isConnected: false,
    tablesVerified: {
      users: false,
      leads: false,
      appointments: false,
      communication_logs: false,
      lead_edit_logs: false,
    }
  });
  const [isSupabaseOpInProgress, setIsSupabaseOpInProgress] = useState<boolean>(false);

  // Supabase Auto Sync setting: Default to true for automatic real-time cloud database synchronization
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("elite_pro_auto_sync");
    return saved ? saved === "true" : true;
  });

  const handleToggleAutoSync = () => {
    setIsAutoSyncEnabled(prev => {
      const newVal = !prev;
      localStorage.setItem("elite_pro_auto_sync", newVal ? "true" : "false");
      return newVal;
    });
  };

  const refreshSupabaseStatus = async () => {
    try {
      const status = await checkSupabaseStatus();
      setSupabaseStatus(status);
      return status;
    } catch (e) {
      console.error("Supabase check error", e);
      return {
        isConnected: false,
        tablesVerified: {
          users: false, leads: false, appointments: false, communication_logs: false, lead_edit_logs: false
        }
      };
    }
  };

  // Check Supabase and load live data on mount (conditional on Auto-Sync)
  useEffect(() => {
    const initSupabase = async () => {
      const status = await refreshSupabaseStatus();
      if (isAutoSyncEnabled && status.isConnected && status.tablesVerified.leads && status.tablesVerified.users) {
        const res = await pullSupabaseData();
        if (res.leads && res.leads.length > 0) {
          setLeads(prev => {
            const merged = [...res.leads!];
            prev.forEach(localLead => {
              const exists = merged.some(l => l.id === localLead.id);
              if (!exists) {
                merged.push(localLead);
              }
            });
            return merged;
          });
        }
        if (res.users && res.users.length > 0) {
          setUsers(prev => {
            const merged = [...res.users!];
            prev.forEach(localUser => {
              const matchedIdx = merged.findIndex(u => u.id === localUser.id || u.email.toLowerCase() === localUser.email.toLowerCase());
              if (matchedIdx >= 0) {
                if (!merged[matchedIdx].password && localUser.password) {
                  merged[matchedIdx].password = localUser.password;
                }
              } else {
                merged.push(localUser);
              }
            });
            return merged;
          });
        }
        if (res.appointments) {
          setAppointments(prev => {
            const merged = [...res.appointments!];
            prev.forEach(localApp => {
              const exists = merged.some(a => a.id === localApp.id);
              if (!exists) {
                merged.push(localApp);
              }
            });
            return merged;
          });
        }
        if (res.communicationLogs) {
          setCommunicationLogs(prev => {
            const merged = [...res.communicationLogs!];
            prev.forEach(localLog => {
              const exists = merged.some(c => c.id === localLog.id);
              if (!exists) {
                merged.push(localLog);
              }
            });
            return merged;
          });
        }
        if (res.leadEditLogs) {
          setLeadEditLogs(prev => {
            const merged = [...res.leadEditLogs!];
            prev.forEach(localLog => {
              const exists = merged.some(e => e.id === localLog.id);
              if (!exists) {
                merged.push(localLog);
              }
            });
            return merged;
          });
        }
        
        setSyncHistory(prev => [
          `${new Date().toISOString().replace("T", " ").substr(0, 19)} GMT - Hydrated from Supabase Cloud Cluster successfully with local overrides.`,
          ...prev
        ]);
      }
    };
    initSupabase();
  }, []);

  const handlePushToSupabase = async () => {
    setIsSupabaseOpInProgress(true);
    const res = await pushLocalDataToSupabase({
      users,
      leads,
      appointments,
      communicationLogs,
      leadEditLogs
    });
    setIsSupabaseOpInProgress(false);
    
    if (res.success) {
      await refreshSupabaseStatus();
      setSyncHistory(prev => [
        `${new Date().toISOString().replace("T", " ").substr(0, 19)} GMT - Seeded all local records to Supabase.`,
        ...prev
      ]);
    }
    return res;
  };

  const handlePullFromSupabase = async () => {
    setIsSupabaseOpInProgress(true);
    const res = await pullSupabaseData();
    setIsSupabaseOpInProgress(false);

    let success = res.errors.length === 0;
    if (success) {
      if (res.leads) setLeads(res.leads);
      if (res.users) {
        setUsers(prev => {
          const merged = [...res.users!];
          prev.forEach(localUser => {
            const matchedIdx = merged.findIndex(u => u.id === localUser.id || u.email.toLowerCase() === localUser.email.toLowerCase());
            if (matchedIdx >= 0) {
              if (!merged[matchedIdx].password && localUser.password) {
                merged[matchedIdx].password = localUser.password;
              }
            } else {
              merged.push(localUser);
            }
          });
          return merged;
        });
      }
      if (res.appointments) setAppointments(res.appointments);
      if (res.communicationLogs) setCommunicationLogs(res.communicationLogs);
      if (res.leadEditLogs) setLeadEditLogs(res.leadEditLogs);

      setSyncHistory(prev => [
        `${new Date().toISOString().replace("T", " ").substr(0, 19)} GMT - Pulled live data from Supabase backend tables.`,
        ...prev
      ]);
    }
    
    return {
      success,
      errors: res.errors
    };
  };

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



  // Self-deactivation/Admin-deactivation kick out check
  useEffect(() => {
    if (currentUser) {
      const match = users.find(u => u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase());
      if (match && match.active === false) {
        alert("Your account has been deactivated by an Administrator. Logging out.");
        setCurrentUser(null);
        localStorage.removeItem("elite_pro_current_user");
      }
    }
  }, [currentUser, users]);

  // Derive filtered records based on active role boundary
  const visibleLeads = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "super_admin" || currentUser.role === "admin") {
      return leads;
    }
    if (currentUser.role === "team_leader") {
      const teamMemberNames = new Set(
        users
          .filter(u => u.teamLeaderId === currentUser.id)
          .map(u => u.name.toLowerCase())
      );
      return leads.filter(l => {
        const agentLower = (l.assignedAgent || "").toLowerCase();
        return agentLower === currentUser.name.toLowerCase() || teamMemberNames.has(agentLower);
      });
    }
    // Sales Team can see only leads which is assigned to them.
    return leads.filter(l => (l.assignedAgent || "").toLowerCase() === currentUser.name.toLowerCase());
  }, [leads, currentUser, users]);

  const visibleLeadEditLogs = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "super_admin" || currentUser.role === "admin") {
      return leadEditLogs;
    }
    // Users can see edit logs for leads assigned to them or their team, or logs they edited
    const visibleLeadIds = new Set(visibleLeads.map(l => l.id));
    return leadEditLogs.filter(log => {
      const isLogForVisibleLead = visibleLeadIds.has(log.leadId);
      const isLoggedBySelf = log.editorName.toLowerCase() === currentUser.name.toLowerCase();
      return isLogForVisibleLead || isLoggedBySelf;
    });
  }, [leadEditLogs, currentUser, visibleLeads]);

  const visibleAppointments = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "super_admin" || currentUser.role === "admin") {
      return appointments;
    }
    // Filter appointments belonging to visible leads
    const visibleLeadIds = new Set(visibleLeads.map(l => l.id));
    return appointments.filter(app => visibleLeadIds.has(app.leadId));
  }, [appointments, visibleLeads, currentUser]);

  // Handler: Add User
  const handleAddUser = async (newUser: Omit<User, "id">) => {
    const id = "user-" + (users.length + 1) + "-" + Math.random().toString(36).substr(2, 4);
    const item: User = {
      ...newUser,
      id
    };
    setUsers(prev => [...prev, item]);

    const res = await dbUpsertUser(item);
    if (!res.success) {
      console.warn("Failed to upsert user to Supabase:", res.error);
      triggerAlert(
        "Supabase User Sync Alert",
        `User portfolio for "${item.name}" registered successfully to your local browser storage, but failed to write onto your Supabase database!\n\nDatabase Error: "${res.error || "No response"}"\n\nPlease ensure your 'users' table is properly configured under your Supabase backend using the SQL commands located inside the Integrations "System Sync" tab.`
      );
    } else {
      triggerAlert(
        "Supabase Sync Success",
        `New portal account for "${item.name}" has been successfully stored in your remote Supabase users database.\n\nThey can now login instantly using their email: ${item.email}`
      );
    }
  };

  // Handler: Update User
  const handleUpdateUser = async (updated: User) => {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    if (currentUser && currentUser.id === updated.id) {
      setCurrentUser(updated);
    }

    const res = await dbUpsertUser(updated);
    if (!res.success) {
      console.warn("Failed to update user to Supabase:", res.error);
      triggerAlert(
        "Supabase User Update Alert",
        `User updates saved locally, but we couldn't send them to your Supabase database!\n\nDatabase Error: "${res.error || "No response"}"`
      );
    } else {
      triggerAlert(
        "Supabase Sync Success",
        `User file for "${updated.name}" has been successfully updated on your remote Supabase users database.\n\nAny modified credentials (including login password) are active immediately.`
      );
    }
  };

  // Handler: Delete User
  const handleDeleteUser = async (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));

    if (isAutoSyncEnabled) {
      const res = await dbDeleteUser(userId);
      if (!res.success) {
        console.warn("Failed to delete user in Supabase:", res.error);
        triggerAlert(
          "Supabase User Delete Alert",
          `User removed locally, but we couldn't delete them from your Supabase database!\n\nDatabase Error: "${res.error || "No response"}"`
        );
      }
    }
  };

  // Handler: Add Lead
  const handleAddLead = async (newLead: Omit<Lead, "id" | "dateCreated" | "dateUpdated">) => {
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

    // Perform background db sync (only if Auto-Sync is enabled)
    if (isAutoSyncEnabled) {
      const [leadRes, apptRes] = await Promise.all([
        dbUpsertLead(item),
        dbUpsertAppointment(automaticAppt)
      ]);

      if (!leadRes.success) {
        console.warn("Supabase Lead Sync failed:", leadRes.error);
        triggerAlert(
          "Supabase Synchronization Warned",
          `Investor Lead "${item.name}" registered successfully to your local browser storage, but failed to write onto your Supabase cluster!\n\nDatabase Error: "${leadRes.error || "No response"}"\n\nTo make this lead visible in your Supabase backend dashboard:\n1. Open the "System Sync" (Integrations) tab.\n2. Copy the initialization SQL.\n3. Open your Supabase SQL Editor (https://supabase.com) and run the commands to build the 'leads' and 'appointments' tables.\n4. Make sure Row Level Security (RLS) is disabled or a public access policy is configured!`
        );
      }
    }
  };

  // Handler: Bulk Add Leads (CSV/Excel ingestion)
  const handleBulkAddLeads = async (newLeads: Omit<Lead, "id" | "dateCreated" | "dateUpdated">[]) => {
    const createdDate = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const newItems: Lead[] = [];
    const newAppts: Appointment[] = [];
    
    // Create batch lists to execute
    newLeads.forEach((nl, index) => {
      const id = "lead-bulk-" + (leads.length + index + 1) + "-" + Math.random().toString(36).substr(2, 4);
      const item: Lead = {
        ...nl,
        id,
        dateCreated: createdDate,
        dateUpdated: createdDate
      };
      newItems.push(item);

      const automaticAppt: Appointment = {
        id: "app-auto-bulk-" + index + "-" + Math.random().toString(36).substr(2, 5),
        leadId: id,
        leadName: nl.name,
        title: `Automated Outreach Target: ${nl.name}`,
        date: tomorrowStr,
        time: "09:00",
        type: "followup",
        notes: `Auto-generated follow-up reminder for imported client ${nl.name} via ${nl.source}.`,
        isCompleted: false,
        reminderActive: true
      };
      newAppts.push(automaticAppt);
    });

    setLeads(prev => [...newItems, ...prev]);
    setAppointments(prev => [...newAppts, ...prev]);

    // Push each newly registered lead to Supabase (only if Auto-Sync is enabled in local state or storage)
    const isSyncActiveCombined = isAutoSyncEnabled || localStorage.getItem("elite_pro_auto_sync") !== "false";
    if (isSyncActiveCombined) {
      const dbRes = await dbBulkUpsert({
        leads: newItems,
        appointments: newAppts
      });

      if (!dbRes.success) {
        const sampleErr = dbRes.error || "Missing schema table or blocked with RLS";
        console.warn("Supabase bulk registration failed:", sampleErr);
        triggerAlert(
          "Supabase Bulk Sync Alert",
          `Successfully added ${newLeads.length} leads to local browser state, but failed to write onto your remote Supabase database.\n\nDatabase Error: "${sampleErr}"\n\nPlease ensure your 'leads' and 'appointments' tables are properly configured under Supabase's SQL Editor schema (details located inside the Integrations "System Sync" page).`
        );
      }
    }
  };

  // Stable refs to prevent permanent timers from capturing stale React closures
  const leadsRef = useRef(leads);
  useEffect(() => {
    leadsRef.current = leads;
  }, [leads]);

  const handleBulkAddLeadsRef = useRef(handleBulkAddLeads);
  useEffect(() => {
    handleBulkAddLeadsRef.current = handleBulkAddLeads;
  }, [handleBulkAddLeads]);

  const sheetUrlRef = useRef(sheetUrl);
  useEffect(() => {
    sheetUrlRef.current = sheetUrl;
  }, [sheetUrl]);

  const sheetRangeRef = useRef(sheetRange);
  useEffect(() => {
    sheetRangeRef.current = sheetRange;
  }, [sheetRange]);

  const autoSheetsSyncRef = useRef(autoSheetsSync);
  useEffect(() => {
    autoSheetsSyncRef.current = autoSheetsSync;
  }, [autoSheetsSync]);

  // Background Google Sheets Synchronization Loop
  useEffect(() => {
    const runSheetsBackgroundSync = async () => {
      const isAuto = autoSheetsSyncRef.current;
      const sheetUrlVal = sheetUrlRef.current;
      const sheetRangeVal = sheetRangeRef.current;
      const token = sessionStorage.getItem("google_sheets_token") || undefined;

      if (isAuto && sheetUrlVal) {
        try {
          const { fetchGoogleSheetValues, mapSpreadsheetRowsToLeads } = await import("./googleAuth");
          const rows = await fetchGoogleSheetValues(sheetUrlVal, sheetRangeVal, token);
          if (rows && rows.length >= 2) {
            const parsedLeads = mapSpreadsheetRowsToLeads(rows);
            if (parsedLeads.length > 0) {
              const existingLeadsSet = new Set(
                leadsRef.current.map(l => {
                  const name = (l.name || "").toLowerCase().trim();
                  const email = (l.email || "").toLowerCase().trim();
                  return email ? `${name}::${email}` : name;
                })
              );

              const filteredNewLeads = parsedLeads.filter(nl => {
                const name = (nl.name || "").toLowerCase().trim();
                const email = (nl.email || "").toLowerCase().trim();
                const key = email ? `${name}::${email}` : name;
                return !existingLeadsSet.has(key);
              });

              if (filteredNewLeads.length > 0) {
                // Call via the up-to-date ref to execute the latest function with accurate states
                await handleBulkAddLeadsRef.current(filteredNewLeads);
                const updatedTime = new Date().toLocaleTimeString("en-US", { hour12: true }) + " (Local)";
                setLastSheetsSynced(updatedTime);
                localStorage.setItem("google_sheets_last_sync_time", updatedTime);
                console.log(`[Google Sheets Auto-Sync] Automatically synchronized ${filteredNewLeads.length} new leads assigned to Admin.`);
              }
            }
          }
        } catch (err) {
          console.warn("[Google Sheets Background-Sync Interrupted]:", err);
        }
      }
    };

    // Steady interval: every 60 seconds, starting with a 7 second initial delay
    const intervalId = setInterval(runSheetsBackgroundSync, 60000);
    const timeoutId = setTimeout(runSheetsBackgroundSync, 7000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);

  // Handler: Update Lead
  const handleUpdateLead = async (updated: Lead) => {
    const oldLead = leads.find(l => l.id === updated.id);
    if (oldLead && currentUser) {
      const changes: { field: string; oldValue: string; newValue: string }[] = [];
      const fieldsToTrack: (keyof Lead)[] = [
        "name", "company", "position", "email", "phone", "source", "status", "temperature", "budget", "location", "assignedAgent", "notes", "score", "projectName"
      ];
      
      fieldsToTrack.forEach(field => {
         const oldVal = (oldLead[field] !== undefined && oldLead[field] !== null) ? String(oldLead[field]) : "";
         const newVal = (updated[field] !== undefined && updated[field] !== null) ? String(updated[field]) : "";
         if (oldVal !== newVal) {
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
        if (isAutoSyncEnabled) {
          dbUpsertLeadEditLog(newLog);
        }
      }
    }
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));

    if (isAutoSyncEnabled) {
      const res = await dbUpsertLead(updated);
      if (!res.success) {
        console.warn("Lead update save failed on Supabase:", res.error);
        triggerAlert(
          "Supabase Update Failure",
          `Changes saved locally, but failed to sync online to Supabase.\n\nDatabase Error: "${res.error || "Permission Denied / Missing Table 'leads'"}"`
        );
      }
    }
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
      async () => {
        setLeads(prev => prev.filter(l => l.id !== id));
        if (isAutoSyncEnabled) {
          const res = await dbDeleteLead(id);
          if (!res.success) {
            console.warn("Delete lead failed on Supabase:", res.error);
            triggerAlert(
              "Supabase Delete Warning",
              `Investor removed locally, but could not delete from Supabase database!\n\nError: ${res.error || "Network error"}`
            );
          }
        }
      }
    );
  };

  // Handler: Add Appointment
  const handleAddAppointment = async (appt: Omit<Appointment, "id" | "isCompleted">) => {
    const id = "app-" + (appointments.length + 1) + "-" + Math.random().toString(36).substr(2, 4);
    const item: Appointment = {
      ...appt,
      id,
      isCompleted: false
    };
    setAppointments(prev => [item, ...prev]);

    if (isAutoSyncEnabled) {
      const res = await dbUpsertAppointment(item);
      if (!res.success) {
        console.warn("Appointment creation failed on Supabase:", res.error);
        triggerAlert(
          "Supabase Agenda Sync failure",
          `Appointment scheduled locally, but failed to upload to Supabase.\n\nDatabase Error: "${res.error || "Missing table 'appointments' or permission blocked"}"`
        );
      }
    }
  };

  // Handler: Update Appointment
  const handleUpdateAppointment = async (updated: Appointment) => {
    setAppointments(prev => prev.map(a => a.id === updated.id ? updated : a));

    if (isAutoSyncEnabled) {
      const res = await dbUpsertAppointment(updated);
      if (!res.success) {
        console.warn("Appointment updates failed on Supabase:", res.error);
        triggerAlert(
          "Supabase Agenda Sync failure",
          `Appointment changes saved locally, but failed to update Supabase.\n\nDatabase Error: "${res.error || "Missing table 'appointments' or permission blocked"}"`
        );
      }
    }
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
    triggerConfirm(
      "Confirm Appointment Removal",
      "Are you sure you want to delete this scheduled meeting? This changes live corporate agendas.",
      async () => {
        if (isAutoSyncEnabled) {
          const res = await dbDeleteAppointment(id);
          if (!res.success) {
            console.warn("Appointment removal failed on Supabase:", res.error);
            triggerAlert(
              "Supabase Agenda Sync alert",
              `Appointment unscheduled locally, but delete failed on Supabase.\n\nDatabase Error: "${res.error || "Missing table or network error"}"`
            );
          }
        }
      }
    );
  };

  // Handler: Add Communication Log
  const handleAddCommunicationLog = async (log: Omit<CommunicationLog, "id">) => {
    const id = "log-" + (communicationLogs.length + 1) + "-" + Math.random().toString(36).substr(2, 4);
    const item: CommunicationLog = {
      ...log,
      id
    };
    setCommunicationLogs(prev => [item, ...prev]);
    setIsMobileModeActive(true); // Signal activity state icon on companion mobile sidebar
    
    if (isAutoSyncEnabled) {
      const res = await dbUpsertCommunicationLog(item);
      if (!res.success) {
        console.warn("Communication log sync failed on Supabase:", res.error);
        triggerAlert(
          "Supabase Interaction Logger alert",
          `Interaction logged locally, but could not sync log to Supabase.\n\nDatabase Error: "${res.error || "Missing table 'communication_logs' or permission restricted"}"`
        );
      }
    }
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
      "Do you want to log out of Elite Pro CRM? This will secure your active session.",
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
    if (currentUser?.role === "team_leader") {
      return tabId === "integrations";
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
          className="px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs tracking-wide uppercase transition shadow-md shadow-teal-500/10 cursor-pointer active:scale-95"
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
            users={users}
            currentUser={currentUser}
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
            onBulkAddLeads={handleBulkAddLeads}
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
            supabaseStatus={supabaseStatus}
            isSupabaseOpInProgress={isSupabaseOpInProgress}
            onPushToSupabase={handlePushToSupabase}
            onPullFromSupabase={handlePullFromSupabase}
            onRefreshSupabaseStatus={refreshSupabaseStatus}
            isAutoSyncEnabled={isAutoSyncEnabled}
            onToggleAutoSync={handleToggleAutoSync}
            users={users}
            leads={leads}
            appointments={appointments}
            communicationLogs={communicationLogs}
            leadEditLogs={leadEditLogs}
            onBulkAddLeads={handleBulkAddLeads}
            sheetUrl={sheetUrl}
            setSheetUrl={setSheetUrl}
            sheetRange={sheetRange}
            setSheetRange={setSheetRange}
            autoSheetsSync={autoSheetsSync}
            setAutoSheetsSync={setAutoSheetsSync}
            lastSheetsSynced={lastSheetsSynced}
            setLastSheetsSynced={setLastSheetsSynced}
          />
        );
      case "users":
        return (
          <UserManagement
            users={users}
            leads={leads}
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
            currentUser={currentUser}
          />
        );
      default:
        return (
          <PerformanceDashboard
            leads={visibleLeads}
            users={users}
            currentUser={currentUser}
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
        onUpdateUserAvatar={(newUrl) => {
          if (currentUser) {
            handleUpdateUser({ ...currentUser, avatarUrl: newUrl });
          }
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          id="mobile-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Main Screen Runway Area */}
      <main 
        id="crm-main-canvas"
        className="flex-1 md:ml-64 ml-0 min-h-screen flex flex-col justify-between overflow-y-auto px-4 md:px-8 py-6 relative"
      >
        <div>
          {/* Top Navbar Header */}
          <header className={`flex justify-between items-center pb-5 border-b mb-6 ${darkMode ? "border-slate-850" : "border-slate-150"}`}>
            <div className="flex items-center gap-3 text-left">
              {/* Hamburger Toggle button on Mobile */}
              <button
                id="mobile-menu-trigger"
                onClick={() => setSidebarOpen(true)}
                className={`p-2 rounded-xl border md:hidden flex items-center justify-center transition cursor-pointer active:scale-95
                  ${darkMode 
                    ? "bg-slate-900 border-slate-800 text-slate-350 hover:bg-slate-855" 
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-xs"}`}
              >
                <Menu size={18} />
              </button>

              <div>
                <span className="text-[10px] font-mono tracking-widest text-slate-450 uppercase font-bold">
                  SYSTEM MODULE &gt; {currentTab.toUpperCase()}
                </span>
                <h2 className="font-display font-bold text-base sm:text-xl leading-snug tracking-tight mt-0.5 max-w-[150px] xs:max-w-xs sm:max-w-none truncate sm:overflow-visible">
                  {currentTab === "dashboard" && "Executive Command Dashboard"}
                  {currentTab === "leads" && "Lead Infrastructure Runway"}
                  {currentTab === "calendar" && "Appointment Calendar & Active Reminders"}
                  {currentTab === "reports" && "Board Insights & Executive Summaries"}
                  {currentTab === "integrations" && "Domain Integration & Sync Master"}
                  {currentTab === "mobile-simulation" && "Field Representative Mobile Companion"}
                </h2>
              </div>
            </div>

            {/* Quick alert indicator pill */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {todayRemindersCount > 0 && (
                <button 
                  id="header-notification-pill"
                  onClick={() => setCurrentTab("calendar")}
                  className="px-2.5 sm:px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-500 text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 animate-pulse cursor-pointer transition select-none hover:bg-amber-500/25 active:scale-95"
                >
                  <Bell size={13} className="fill-amber-500/10 shrink-0" />
                  <span className="hidden sm:inline">{todayRemindersCount} Alignment Reminders Due Today</span>
                  <span className="sm:hidden">{todayRemindersCount} Due</span>
                </button>
              )}

              {/* Dynamic current user badge */}
              <div 
                id="quick-domain-tag" 
                onClick={handleLogout}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl border text-[11px] sm:text-xs font-mono font-bold flex items-center gap-1.5 transition duration-150 cursor-pointer active:scale-95 select-none shrink-0
                  ${darkMode 
                    ? "bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300" 
                    : "bg-white border-slate-200 hover:bg-slate-100 text-slate-700 shadow-xs"}`}
                title="Click to Switch User Profile"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                <span className="max-w-[70px] xs:max-w-[120px] sm:max-w-[200px] truncate">{currentUser.email}</span>
                <span className="text-[9px] text-teal-400 uppercase font-mono font-semibold hidden lg:inline">[{currentUser.role}]</span>
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
          <span>Elite Pro Corporate Real Estate Advisors CRM Console © 2026</span>
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
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition cursor-pointer select-none active:scale-97 shadow-sm shadow-teal-500/10"
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
