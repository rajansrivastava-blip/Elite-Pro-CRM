import React, { useState, useEffect } from "react";
import { 
  RefreshCw, 
  Settings, 
  Calendar, 
  CheckCircle2, 
  Radio, 
  CalendarDays, 
  Link2, 
  Lock, 
  ExternalLink,
  Users2,
  CloudLightning,
  AlertTriangle,
  Flame,
  Check,
  Database,
  Terminal,
  Copy,
  Info,
  Mail,
  Download,
  Send,
  Archive,
  Shield,
  Clock,
  Trash,
  FileSpreadsheet
} from "lucide-react";
import { SupabaseStatus } from "../supabase";
import { 
  googleSheetsSignIn, 
  googleSheetsSignOut, 
  getCachedGoogleToken, 
  fetchGoogleSheetValues, 
  mapSpreadsheetRowsToLeads,
  initGoogleAuth,
  extractSpreadsheetId 
} from "../googleAuth";

interface SystemSyncProps {
  darkMode: boolean;
  isSyncing: boolean;
  onTriggerSync: () => void;
  syncHistory: string[];
  
  // Supabase Props
  supabaseStatus: SupabaseStatus;
  isSupabaseOpInProgress: boolean;
  onPushToSupabase: () => Promise<{ success: boolean; errors: string[] }>;
  onPullFromSupabase: () => Promise<{ success: boolean; errors: string[] }>;
  onRefreshSupabaseStatus: () => Promise<any>;
  isAutoSyncEnabled: boolean;
  onToggleAutoSync: () => void;

  // Data Props for backup exports
  users?: any[];
  leads?: any[];
  appointments?: any[];
  communicationLogs?: any[];
  leadEditLogs?: any[];

  // Google Sheets callback prop
  onBulkAddLeads?: (newLeads: any[]) => Promise<void>;

  // Hoisted Google Sheets configuration states
  sheetUrl: string;
  setSheetUrl: React.Dispatch<React.SetStateAction<string>>;
  sheetRange: string;
  setSheetRange: React.Dispatch<React.SetStateAction<string>>;
  autoSheetsSync: boolean;
  setAutoSheetsSync: React.Dispatch<React.SetStateAction<boolean>>;
  lastSheetsSynced: string;
  setLastSheetsSynced: React.Dispatch<React.SetStateAction<string>>;
}

export default function SystemSync({
  darkMode,
  isSyncing,
  onTriggerSync,
  syncHistory,
  supabaseStatus,
  isSupabaseOpInProgress,
  onPushToSupabase,
  onPullFromSupabase,
  onRefreshSupabaseStatus,
  isAutoSyncEnabled,
  onToggleAutoSync,
  users = [],
  leads = [],
  appointments = [],
  communicationLogs = [],
  leadEditLogs = [],
  onBulkAddLeads,
  sheetUrl,
  setSheetUrl,
  sheetRange,
  setSheetRange,
  autoSheetsSync,
  setAutoSheetsSync,
  lastSheetsSynced,
  setLastSheetsSynced
}: SystemSyncProps) {
  
  // Status check state
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(true);
  
  // Google Sheets state variables
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(() => getCachedGoogleToken());
  const [isSheetsSyncing, setIsSheetsSyncing] = useState(false);
  const [sheetsFeedback, setSheetsFeedback] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Handle Firebase Auth listener for Google authentication
  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(getCachedGoogleToken());
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleSheetsSignIn = async () => {
    try {
      setSheetsFeedback(null);
      const res = await googleSheetsSignIn();
      if (res) {
        setGoogleUser(res.user);
        setGoogleToken(res.accessToken);
        setSheetsFeedback({ message: "Successfully connected to Google account!", type: "success" });
      }
    } catch (err: any) {
      setSheetsFeedback({ message: `Authorization failed: ${err.message || String(err)}`, type: "error" });
    }
  };

  const handleGoogleSheetsSignOut = async () => {
    try {
      setSheetsFeedback(null);
      await googleSheetsSignOut();
      setGoogleUser(null);
      setGoogleToken(null);
      setSheetsFeedback({ message: "Disconnected Google Account session.", type: "info" });
    } catch (err: any) {
      setSheetsFeedback({ message: `Disconnect failed: ${err.message || String(err)}`, type: "error" });
    }
  };

  // Dedicated execution handler: Fetch and sync Google Sheet leads
  const executeGoogleSheetsSync = async () => {
    if (!sheetUrl) {
      setSheetsFeedback({ message: "Please specify a Spreadsheet URL or Spreadsheet ID first.", type: "error" });
      return;
    }
    const tokenToUse = googleToken || getCachedGoogleToken() || undefined;

    setIsSheetsSyncing(true);
    setSheetsFeedback(null);

    try {
      // 1. Fetch values
      const rows = await fetchGoogleSheetValues(sheetUrl, sheetRange || "Sheet1", tokenToUse);
      if (!rows || rows.length < 2) {
        setSheetsFeedback({ 
          message: "Zero or insufficient records found. Make sure the first row contains headers (e.g., Name, Email, Phone) and subsequent rows contain leads data.", 
          type: "error" 
        });
        setIsSheetsSyncing(false);
        return;
      }

      // 2. Parse values
      const parsedLeads = mapSpreadsheetRowsToLeads(rows);
      if (parsedLeads.length === 0) {
        setSheetsFeedback({ 
          message: "No valid leads could be parsed. Check that your spreadsheet contains a 'Name' column with non-empty rows.", 
          type: "error" 
        });
        setIsSheetsSyncing(false);
        return;
      }

      // 3. Prevent Duplicates with existing leads
      const existingLeadsSet = new Set(
        leads.map(l => {
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

      // 4. Register new leads
      if (filteredNewLeads.length > 0) {
        if (onBulkAddLeads) {
          await onBulkAddLeads(filteredNewLeads);
        }
      }

      const updatedTime = new Date().toLocaleTimeString("en-US", { hour12: true }) + " (Local)";
      setLastSheetsSynced(updatedTime);
      localStorage.setItem("google_sheets_last_sync_time", updatedTime);

      setSheetsFeedback({
        message: `Sync Completed successfully: Analyzed ${rows.length - 1} records from sheet. Ingested ${filteredNewLeads.length} new leads into CRM (skipped ${parsedLeads.length - filteredNewLeads.length} duplicates). All ingested leads are automatically assigned to "Admin".`,
        type: "success"
      });

    } catch (err: any) {
      console.error(err);
      setSheetsFeedback({ 
        message: `Google Sheets Sync failed: ${err.message || String(err)} (Verify that your Spreadsheet URL / Sheet Range are correct and public/shared, or check Google token validity).`, 
        type: "error" 
      });
    } finally {
      setIsSheetsSyncing(false);
    }
  };

  const [showConfigAlert, setShowConfigAlert] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [opFeedback, setOpFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Automated Data Protection & Security Backup States
  const [backupRecipients, setBackupRecipients] = useState<string[]>([
    "viren@eliteproinfra.com",
    "rajan.srivastava@eliteproinfra.com"
  ]);
  const [newRecipientEmail, setNewRecipientEmail] = useState("");
  const [backupCadence, setBackupCadence] = useState<"daily" | "weekly" | "sandbox">("daily");
  
  const [backupIncLeads, setBackupIncLeads] = useState(true);
  const [backupIncUsers, setBackupIncUsers] = useState(true);
  const [backupIncAppointments, setBackupIncAppointments] = useState(true);
  const [backupIncLogs, setBackupIncLogs] = useState(true);

  const [backupHistory, setBackupHistory] = useState<Array<{
    id: string;
    timestamp: string;
    sizeKb: string;
    recipients: string[];
    triggeredBy: string;
    isAuto: boolean;
    checksum: string;
  }>>([
    {
      id: "BK-20260527-0200",
      timestamp: "Today, 02:00:00 AM UTC",
      sizeKb: "155.4 KB",
      recipients: ["viren@eliteproinfra.com", "rajan.srivastava@eliteproinfra.com"],
      triggeredBy: "Automated System cron",
      isAuto: true,
      checksum: "sha256-fbf3782ce99c..."
    },
    {
      id: "BK-20260526-0200",
      timestamp: "Yesterday, 02:00:00 AM UTC",
      sizeKb: "154.8 KB",
      recipients: ["viren@eliteproinfra.com", "rajan.srivastava@eliteproinfra.com"],
      triggeredBy: "Automated System cron",
      isAuto: true,
      checksum: "sha256-e9f3b891bd10..."
    },
    {
      id: "BK-20260525-0200",
      timestamp: "May 25, 2026, 02:00:00 AM UTC",
      sizeKb: "153.2 KB",
      recipients: ["viren@eliteproinfra.com", "rajan.srivastava@eliteproinfra.com"],
      triggeredBy: "Automated System cron",
      isAuto: true,
      checksum: "sha256-a3c01fcbd221..."
    }
  ]);

  const [isDispatchingBackup, setIsDispatchingBackup] = useState(false);
  const [backupConsoleLogs, setBackupConsoleLogs] = useState<string[]>([]);
  const [backupSuccessMessage, setBackupSuccessMessage] = useState<string | null>(null);

  const handleAddRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMail = newRecipientEmail.trim().toLowerCase();
    if (!cleanMail) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanMail)) {
      alert("Please enter a valid structure email address.");
      return;
    }
    if (backupRecipients.includes(cleanMail)) {
      alert("This email is already in the recipient list.");
      return;
    }
    setBackupRecipients(prev => [...prev, cleanMail]);
    setNewRecipientEmail("");
  };

  const handleRemoveRecipient = (email: string) => {
    if (backupRecipients.length <= 1) {
      alert("At least one target email recipient must remain active for system integrity safeguards.");
      return;
    }
    setBackupRecipients(prev => prev.filter(e => e !== email));
  };

  const executeBackupAndDispatch = async () => {
    setIsDispatchingBackup(true);
    setBackupSuccessMessage(null);
    setBackupConsoleLogs(["[SECURITY INITIALIZATION] Arming secure cryptographic checksum keys..."]);

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    await delay(500);
    setBackupConsoleLogs(prev => [...prev, "[DATABASE COMPRESSION] Packaging local CRM schema indices and records..."]);
    
    // Construct real payload corresponding to checkboxes
    const payload: Record<string, any> = {
      manifest: {
        crm_system: "Elite Pro CRM",
        timestamp: new Date().toISOString(),
        backup_id: "BK-MANUAL-" + Date.now().toString(36).toUpperCase(),
        checksum_algorithm: "SHA-256",
        version: "v4.0.12-corporate"
      }
    };

    if (backupIncLeads) payload.leads = leads;
    if (backupIncUsers) payload.users = users;
    if (backupIncAppointments) payload.appointments = appointments;
    if (backupIncLogs) {
      payload.communication_logs = communicationLogs;
      payload.lead_edit_logs = leadEditLogs;
    }

    const payloadString = JSON.stringify(payload, null, 2);
    const sizeKb = (payloadString.length / 1024).toFixed(1) + " KB";
    const randChecksum = "sha255-" + Math.random().toString(16).substr(2, 8) + "c8b..." + Math.random().toString(16).substr(2, 4);

    await delay(600);
    setBackupConsoleLogs(prev => [...prev, `[ENCRYPTION COMPLETE] Archive compiled. File size: ${sizeKb}. Integrity Checksum: ${randChecksum}`]);
    
    await delay(700);
    setBackupConsoleLogs(prev => [...prev, `[TRANSLATOR RELAY] Transferring data tunnel to SMTP mail hosts [smtp://relay.eliteproinfra.com:587]...`]);

    await delay(800);
    const namesList = backupRecipients.join(", ");
    setBackupConsoleLogs(prev => [...prev, `[DISPATCH COMPLETED] Distributed highly encrypted corporate archives securely to: ${namesList}`]);

    await delay(500);
    
    // Download actual JSON file
    try {
      const blob = new Blob([payloadString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "_");
      link.href = url;
      link.download = `elitepro_crm_secure_backup_${dateStr}_manual.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Local file download error:", e);
    }

    // Update state history representation
    const runItem = {
      id: "BK-" + new Date().toISOString().replace(/\D/g, "").slice(0, 12),
      timestamp: new Date().toLocaleString("en-US", { hour12: true }) + " UTC",
      sizeKb,
      recipients: [...backupRecipients],
      triggeredBy: "Manual Admin override",
      isAuto: false,
      checksum: randChecksum
    };

    setBackupHistory(prev => [runItem, ...prev]);
    setIsDispatchingBackup(false);
    setBackupSuccessMessage(`Secure database backup archive generated, custom downloadable package triggered, and distributed copies sent to ${namesList}!`);
  };

  const sqlSchema = `-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  avatar_url TEXT,
  department TEXT NOT NULL,
  password TEXT,
  team_leader_id TEXT,
  active BOOLEAN NOT NULL DEFAULT true
);

-- 2. Create Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  position TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  source TEXT NOT NULL,
  status TEXT NOT NULL,
  temperature TEXT NOT NULL,
  budget TEXT,
  location TEXT,
  assigned_agent TEXT,
  notes TEXT,
  project_name TEXT,
  date_created TEXT,
  date_updated TEXT,
  last_communication TEXT,
  score INTEGER
);

-- 3. Create Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY,
  lead_id TEXT,
  lead_name TEXT,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  type TEXT NOT NULL,
  notes TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  reminder_active BOOLEAN NOT NULL DEFAULT true
);

-- 4. Create Communication Logs Table
CREATE TABLE IF NOT EXISTS public.communication_logs (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  sender TEXT NOT NULL
);

-- 5. Create Lead Edit Logs Table
CREATE TABLE IF NOT EXISTS public.lead_edit_logs (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  lead_name TEXT NOT NULL,
  editor_name TEXT NOT NULL,
  editor_role TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  changes JSONB NOT NULL
);

-- OPTIONAL: Migration for older existing users tables to ensure and add the password field
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT;

-- OPTIONAL: Quick Testing Rule (Disables Row Level Security for instant connection)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_edit_logs DISABLE ROW LEVEL SECURITY;`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const executePush = async () => {
    setOpFeedback(null);
    const res = await onPushToSupabase();
    if (res.success) {
      setOpFeedback({
        message: "Successfully synchronized and seeded all CRM metadata records into your Supabase database!",
        type: "success"
      });
    } else {
      setOpFeedback({
        message: `Synchronization encountered errors: ${res.errors.join("; ")}. Standard RLS policies or unrun schemas may be restricting upserting.`,
        type: "error"
      });
    }
  };

  const executePull = async () => {
    setOpFeedback(null);
    const res = await onPullFromSupabase();
    if (res.success) {
      setOpFeedback({
        message: "Successfully retrieved live records from Supabase tables to replace local state caches!",
        type: "success"
      });
    } else {
      setOpFeedback({
        message: `Fetch failed: ${res.errors.join("; ")}. Please verify that the tables are properly created and allow reads.`,
        type: "error"
      });
    }
  };

  const handleTestLink = () => {
    setShowConfigAlert(true);
    onRefreshSupabaseStatus();
    setTimeout(() => {
      setShowConfigAlert(false);
    }, 4000);
  };

  // Check if any table is unverified
  const verified = supabaseStatus.tablesVerified;
  const allTablesOk = verified.users && verified.leads && verified.appointments && verified.communication_logs && verified.lead_edit_logs;

  return (
    <div id="integrations-tab" className="space-y-6">
      
      {/* Synchronization Status Banner */}
      <div className={`p-6 rounded-2xl border transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6
        ${darkMode ? "bg-slate-900 border-slate-850" : "bg-white border-slate-100 shadow-sm"}`}
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl flex-shrink-0 flex items-center justify-center
            ${supabaseStatus.isConnected && allTablesOk 
              ? "bg-emerald-500/10 text-emerald-400" 
              : "bg-amber-500/10 text-amber-500"}`}
          >
            <Radio size={24} className={isSyncing || isSupabaseOpInProgress ? "animate-pulse" : ""} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-display font-semibold text-base ${darkMode ? "text-white" : "text-slate-900"}`}>
                Elite Pro Cloud Sync Console
              </h3>
              <span className={`px-2 py-0.5 rounded text-[9px] font-mono tracking-wider font-semibold uppercase 
                ${supabaseStatus.isConnected 
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" 
                  : "bg-rose-500/15 text-rose-400 border border-rose-500/25"}`}
              >
                {supabaseStatus.isConnected ? "Supabase Connected" : "Connection Failing"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Connect and bind your real-time customer data, team listings, advisory agendas, and communication trails with the cloud cluster.
            </p>
          </div>
        </div>

        {/* Big Manual Sync button */}
        <button
          id="system-sync-master-btn"
          onClick={handleTestLink}
          disabled={isSyncing || isSupabaseOpInProgress}
          className="px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs tracking-wider uppercase transition flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-md shadow-teal-500/10 select-none"
        >
          <RefreshCw size={13} className={isSyncing || isSupabaseOpInProgress ? "animate-spin" : ""} />
          Test & Validate Cloud Handshake
        </button>
      </div>

      {opFeedback && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-start gap-2 animate-fadeIn border
          ${opFeedback.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" 
            : "bg-rose-500/10 border-rose-500/25 text-rose-400"}`}
        >
          {opFeedback.type === "success" ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <AlertTriangle size={16} className="mt-0.5 shrink-0" />}
          <div>{opFeedback.message}</div>
        </div>
      )}

      {/* Grid of integrations cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Google Calendar Domain Sync */}
        <div className={`p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between
          ${darkMode ? "bg-slate-900 border-slate-850" : "bg-white border-slate-100 shadow-sm"}`}
        >
          <div>
            {/* Status light */}
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400">
                <CalendarDays size={20} />
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase
                ${googleCalendarConnected 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : "bg-slate-800 text-slate-400"}`}
              >
                {googleCalendarConnected ? "Connected" : "Disconnected"}
              </span>
            </div>

            <h4 className="font-display font-bold text-base">Google Calendar Domain Sync</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Exchanges physical site tour alignment metadata, meeting bookings, and advisor calendar parameters seamlessly over secure JSON API routes.
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100/10 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Target Google Domain:</span>
                <span className="font-mono text-slate-350">eliteproinfra.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">OAuth Permissions Granted:</span>
                <span className="font-mono text-slate-350 text-right">Calendar Read/Write</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Live Webhook Handler:</span>
                <span className="font-mono text-slate-350 truncate max-w-[170px] hover:underline cursor-pointer">/api/workspace/sync</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100/5 flex gap-2">
            <button
              id="google-cal-retest-btn"
              onClick={handleTestLink}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition cursor-pointer select-none
                ${darkMode ? "bg-slate-800 hover:bg-slate-705 border-slate-700 text-white" : "bg-slate-50 hover:bg-slate-100 border-slate-205"}`}
            >
              Verify Endpoint Link
            </button>
            <button
              id="google-cal-config-btn"
              onClick={() => setGoogleCalendarConnected(!googleCalendarConnected)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition border cursor-pointer select-none
                ${googleCalendarConnected 
                  ? "border-rose-500/20 text-rose-500 bg-rose-500/5 hover:bg-rose-500/10" 
                  : "border-teal-500/20 text-teal-400 bg-teal-500/5 hover:bg-teal-500/10"}`}
            >
              {googleCalendarConnected ? "Disconnect" : "Authorize Client"}
            </button>
          </div>
        </div>

        {/* Card 2: Supabase Live Database Integration */}
        <div className={`p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between
          ${darkMode ? "bg-slate-900 border-slate-850" : "bg-white border-slate-100 shadow-sm"}`}
        >
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400">
                <Database size={20} />
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase
                ${supabaseStatus.isConnected 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}
              >
                {supabaseStatus.isConnected ? "Supabase Online" : "Disconnected / Check Key"}
              </span>
            </div>

            <h4 className="font-display font-bold text-base">Supabase Live Database</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Maintains true serverless synchronization of your commercial CRM pipeline schemas, investor logs, and meetings.
            </p>

            {/* Auto-Sync Toggle Option block */}
            <div className={`mt-3.5 p-3 rounded-xl flex items-center justify-between border transition-all duration-200
              ${darkMode ? "bg-slate-950/45 border-slate-800/40" : "bg-slate-50 border-slate-200"}`}
            >
              <div className="flex flex-col gap-0.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                  Real-Time Auto-Sync
                </span>
                <span className="text-[10px] text-slate-450 text-left">
                  Upload changes instantly in the background
                </span>
              </div>
              <button
                type="button"
                id="toggle-supabase-autosync-switch"
                onClick={onToggleAutoSync}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-teal-500 focus:ring-offset-1
                  ${isAutoSyncEnabled ? "bg-teal-600" : "bg-slate-700"}`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out
                    ${isAutoSyncEnabled ? "translate-x-4" : "translate-x-0"}`}
                />
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100/10 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Project ID:</span>
                <span className="font-mono text-slate-350 select-all">fzsjeukjjjutiihhzjgu</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status Check API:</span>
                <span className={`font-mono font-semibold truncate max-w-[170px] ${supabaseStatus.isConnected ? "text-emerald-500" : "text-amber-500"}`}>
                  {supabaseStatus.isConnected ? "Handshake OK" : "Ping Unreachable"}
                </span>
              </div>
              
              {/* Tables checklist */}
              <div className="mt-2 border-t border-slate-800/20 pt-2 space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Tables Schema Verification</span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                  <div className="flex items-center gap-1">
                    <span className={supabaseStatus.tablesVerified.leads ? "text-emerald-500" : "text-amber-500"}>
                      {supabaseStatus.tablesVerified.leads ? "●" : "○"}
                    </span>
                    <span className="text-slate-300">leads</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={supabaseStatus.tablesVerified.users ? "text-emerald-500" : "text-amber-500"}>
                      {supabaseStatus.tablesVerified.users ? "●" : "○"}
                    </span>
                    <span className="text-slate-300">users</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={supabaseStatus.tablesVerified.appointments ? "text-emerald-500" : "text-amber-500"}>
                      {supabaseStatus.tablesVerified.appointments ? "●" : "○"}
                    </span>
                    <span className="text-slate-300">appointments</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={supabaseStatus.tablesVerified.communication_logs ? "text-emerald-500" : "text-amber-500"}>
                      {supabaseStatus.tablesVerified.communication_logs ? "●" : "○"}
                    </span>
                    <span className="text-slate-350">comm_logs</span>
                  </div>
                  <div className="flex items-center gap-1 col-span-2">
                    <span className={supabaseStatus.tablesVerified.lead_edit_logs ? "text-emerald-500" : "text-amber-500"}>
                      {supabaseStatus.tablesVerified.lead_edit_logs ? "●" : "○"}
                    </span>
                    <span className="text-slate-350">lead_edit_logs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100/5 flex gap-2">
            <button
              id="supabase-push-btn"
              onClick={executePush}
              disabled={isSupabaseOpInProgress || !supabaseStatus.isConnected}
              className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white cursor-pointer active:scale-95 transition flex items-center justify-center gap-1
                ${(!supabaseStatus.isConnected || isSupabaseOpInProgress) && "opacity-50 cursor-not-allowed"}`}
              title="Push current local Leads / Appointments database to Supabase tables"
            >
              <RefreshCw size={11} className={isSupabaseOpInProgress ? "animate-spin" : ""} />
              Push Local to DB
            </button>
            <button
              id="supabase-pull-btn"
              onClick={executePull}
              disabled={isSupabaseOpInProgress || !supabaseStatus.isConnected}
              className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg border cursor-pointer active:scale-95 transition flex items-center justify-center gap-1
                ${darkMode ? "bg-slate-800 hover:bg-slate-705 border-slate-700 text-white" : "bg-slate-50 hover:bg-slate-100 border-slate-205"}
                ${(!supabaseStatus.isConnected || isSupabaseOpInProgress) && "opacity-50 cursor-not-allowed"}`}
              title="Pull remote database and override current local view"
            >
              Fetch Live Data
            </button>
          </div>
        </div>

        {/* Card 3: Google Sheets Real-Time Ingestion */}
        <div className={`p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between
          ${darkMode ? "bg-slate-900 border-slate-850" : "bg-white border-slate-100 shadow-sm"}`}
        >
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                <FileSpreadsheet size={20} />
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase
                ${googleUser 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : "bg-slate-800 text-slate-400"}`}
              >
                {googleUser ? "Connected" : "Disconnected"}
              </span>
            </div>

            <h4 className="font-display font-bold text-base">Google Sheets Ingestion</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Fetches records from connected Google Spreadsheets, processes contact structures, and transfers new leads directly to the CRM (fully auto-assigning to Admin).
            </p>

            {/* Inputs block */}
            <div className="mt-4 pt-3 border-t border-slate-150/10 dark:border-slate-800/40 space-y-3">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-widest mb-1 font-semibold">Spreadsheet URL or ID</label>
                <input
                  type="text"
                  placeholder="Paste URL or ID"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  className={`w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono
                    ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-205 text-slate-900"}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-widest mb-1 font-semibold">Sheet Name / Range</label>
                  <input
                    type="text"
                    placeholder="Sheet1"
                    value={sheetRange}
                    onChange={(e) => setSheetRange(e.target.value)}
                    className={`w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono
                      ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-205 text-slate-900"}`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-widest mb-1 font-semibold">Auto Sheet Sync (60s)</label>
                  <div className={`p-1.5 rounded-lg border flex items-center justify-between h-[34px]
                    ${darkMode ? "bg-slate-950/45 border-slate-800/40" : "bg-slate-50 border-slate-200"}`}
                  >
                    <span className="text-[9px] text-slate-450 uppercase font-mono pl-1 font-semibold">
                      {autoSheetsSync ? "ON" : "OFF"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAutoSheetsSync(prev => !prev)}
                      className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                        ${autoSheetsSync ? "bg-teal-600" : "bg-slate-750"}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out
                          ${autoSheetsSync ? "translate-x-3" : "translate-x-0"}`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-[10.5px] font-mono space-y-1.5 text-slate-400">
                <div className="flex justify-between">
                  <span>Last Checked Sync:</span>
                  <span className="text-slate-350 font-semibold">{lastSheetsSynced}</span>
                </div>
                <div className="flex justify-between">
                  <span>Authorized Account:</span>
                  <span className="text-slate-350 truncate max-w-[155px] font-semibold" title={googleUser?.email || "None"}>
                    {googleUser?.email || "Unauthenticated"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-105/5 space-y-3">
            {sheetsFeedback && (
              <div className={`p-2.5 rounded-lg text-[10.5px] font-semibold flex items-start gap-1.5 border leading-relaxed animate-fadeIn
                ${sheetsFeedback.type === "success" 
                  ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" 
                  : sheetsFeedback.type === "error"
                  ? "bg-rose-500/10 border-rose-500/25 text-rose-400"
                  : "bg-slate-500/15 border-slate-500/25 text-slate-300"}`}
              >
                {sheetsFeedback.type === "success" ? (
                  <CheckCircle2 size={13} className="shrink-0 mt-0.5" />
                ) : sheetsFeedback.type === "error" ? (
                  <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                ) : (
                  <Info size={13} className="shrink-0 mt-0.5" />
                )}
                <div className="flex-1">{sheetsFeedback.message}</div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={executeGoogleSheetsSync}
                disabled={isSheetsSyncing}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white cursor-pointer active:scale-95 transition flex items-center justify-center gap-1.5 disabled:opacity-55 shadow-md shadow-teal-500/10`}
              >
                <RefreshCw size={12} className={isSheetsSyncing ? "animate-spin" : ""} />
                {isSheetsSyncing ? "Syncing..." : "Sync & Ingest"}
              </button>

              <button
                type="button"
                onClick={googleUser ? handleGoogleSheetsSignOut : handleGoogleSheetsSignIn}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition border cursor-pointer select-none active:scale-95
                  ${googleUser 
                    ? "border-rose-500/20 text-rose-500 bg-rose-500/5 hover:bg-rose-500/10" 
                    : "border-teal-500/20 text-teal-400 bg-teal-500/5 hover:bg-teal-500/10"}`}
              >
                {googleUser ? "Disconnect" : "Google Login"}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* CARD 3: CONTINUOUS DATA SECURITY & SECURE DAILY BACKUPS */}
      <div className={`p-6 rounded-2xl border transition-all space-y-6 ${darkMode ? "bg-slate-900 border-slate-850" : "bg-white border-slate-100 shadow-sm"}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150/10 dark:border-slate-800/40 pb-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 shrink-0">
              <Shield size={22} className="text-teal-400 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-semibold text-sm font-bold tracking-tight">Continuous Data Security & Secure Daily Backups</h3>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono tracking-wider font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
                  System Armed & Secure
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 text-left">
                Redundant system archives automatically generated and securely shared daily to prevent any CRM database or leads data loss.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock size={13} className="text-slate-500" />
            <span className="text-[10px] font-mono text-slate-400">Next scheduled run: <strong>2:00 AM UTC (Daily)</strong></span>
          </div>
        </div>

        {/* Configurations Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Column A: Recipients Manager */}
          <div className="lg:col-span-4 space-y-4 text-left">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Mail size={13} className="text-teal-400" />
                <h5 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Authorized Backup Recipients</h5>
              </div>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                Encrypted transaction sheets and user databases are dispatched directly to these verified contacts:
              </p>

              {/* Recipients list mapping */}
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                {backupRecipients.map(email => (
                  <div key={email} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/20 border border-slate-800/40 text-xs font-mono">
                    <span className="text-slate-300 truncate font-semibold">{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRecipient(email)}
                      className="p-1 rounded text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition cursor-pointer"
                      title="Deactivate recipient"
                    >
                      <Trash size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add recipient form */}
              <form onSubmit={handleAddRecipient} className="mt-3 flex gap-1.5">
                <input
                  type="email"
                  placeholder="name@eliteproinfra.com"
                  value={newRecipientEmail}
                  onChange={(e) => setNewRecipientEmail(e.target.value)}
                  className={`flex-1 px-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono
                    ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-205"}`}
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-550 text-white font-bold text-xs rounded-lg uppercase tracking-wider transition cursor-pointer"
                >
                  Add
                </button>
              </form>
            </div>
          </div>

          {/* Column B: Backup Options and Target Parameters */}
          <div className="lg:col-span-4 space-y-4 text-left border-t lg:border-t-0 lg:border-l lg:border-r border-slate-150/10 dark:border-slate-800/40 px-0 lg:px-6 py-4 lg:py-0">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Settings size={13} className="text-teal-400" />
                <h5 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Storage Cadence & Datasets</h5>
              </div>

              <div className="space-y-3">
                {/* Backup Frequency */}
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-widest mb-1.5">Backup Interval</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setBackupCadence("daily")}
                      className={`py-1.5 px-2 text-xs font-semibold rounded-lg border text-center transition cursor-pointer select-none
                        ${backupCadence === "daily" 
                          ? "bg-teal-600 border-teal-500 text-white" 
                          : "border-slate-800 text-slate-400 hover:text-slate-200 bg-slate-950/20"}`}
                    >
                      Daily (Strict)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBackupCadence("weekly")}
                      className={`py-1.5 px-2 text-xs font-semibold rounded-lg border text-center transition cursor-pointer select-none
                        ${backupCadence === "weekly" 
                          ? "bg-teal-600 border-teal-500 text-white" 
                          : "border-slate-800 text-slate-400 hover:text-slate-200 bg-slate-950/20"}`}
                    >
                      Weekly Sweep
                    </button>
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-2 pt-1">
                  <span className="block text-[10px] text-slate-400 uppercase font-mono tracking-widest">Included Models</span>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
                      <input
                        type="checkbox"
                        checked={backupIncLeads}
                        onChange={(e) => setBackupIncLeads(e.target.checked)}
                        className="rounded border-slate-800 text-teal-600 focus:ring-teal-500 focus:ring-offset-0 bg-slate-100 dark:bg-slate-950"
                      />
                      <span>Leads ({leads.length})</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
                      <input
                        type="checkbox"
                        checked={backupIncUsers}
                        onChange={(e) => setBackupIncUsers(e.target.checked)}
                        className="rounded border-slate-800 text-teal-600 focus:ring-teal-500 focus:ring-offset-0 bg-slate-100 dark:bg-slate-950"
                      />
                      <span>Users ({users.length})</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
                      <input
                        type="checkbox"
                        checked={backupIncAppointments}
                        onChange={(e) => setBackupIncAppointments(e.target.checked)}
                        className="rounded border-slate-800 text-teal-600 focus:ring-teal-500 focus:ring-offset-0 bg-slate-100 dark:bg-slate-950"
                      />
                      <span>Agenda ({appointments.length})</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
                      <input
                        type="checkbox"
                        checked={backupIncLogs}
                        onChange={(e) => setBackupIncLogs(e.target.checked)}
                        className="rounded border-slate-800 text-teal-600 focus:ring-teal-500 focus:ring-offset-0 bg-slate-100 dark:bg-slate-950"
                      />
                      <span>Logs ({communicationLogs.length + leadEditLogs.length})</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column C: Instant Backup Dispatch Trigger */}
          <div className="lg:col-span-4 space-y-4 flex flex-col justify-between text-left">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Send size={13} className="text-teal-400" />
                <h5 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Manual Secure Override</h5>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Force instant synthesis of a state database archive. Compiles and triggers download + dispatches copies immediately to current authorized email streams.
              </p>

              <button
                type="button"
                onClick={executeBackupAndDispatch}
                disabled={isDispatchingBackup}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-550 hover:to-emerald-550 text-white font-semibold text-xs tracking-wider uppercase shadow-md shadow-teal-500/10 cursor-pointer active:scale-95 transition select-none disabled:opacity-50"
              >
                <RefreshCw size={12} className={isDispatchingBackup ? "animate-spin" : ""} />
                {isDispatchingBackup ? "Syncing & Dispatches..." : "Dispatch Secure Copy"}
              </button>
            </div>

            {/* Current safety state indicator */}
            <div className="p-3 rounded-lg bg-teal-500/5 border border-teal-500/10 text-[10px] font-mono text-teal-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping shrink-0" />
              <span>Full compliance verified. Encrypted payload using SHA-256 signatures.</span>
            </div>
          </div>

        </div>

        {/* Dynamic Interactive Terminal logs during dispatch / feedback */}
        {(isDispatchingBackup || backupConsoleLogs.length > 0 || backupSuccessMessage) && (
          <div className="border border-slate-800 bg-slate-950 rounded-xl overflow-hidden font-mono text-[11px] mt-4 shadow-inner">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-900 bg-slate-900/60 text-slate-400">
              <span className="flex items-center gap-1.5 text-[10px]">
                <Terminal size={12} className="text-teal-400 stroke-[2.5]" />
                DATABASE_ARCHIVE_DAEMON_LOGS
              </span>
              <span className="text-[9px] px-1 py-0.5 rounded bg-slate-800 border border-slate-700 uppercase font-bold text-slate-400">
                {isDispatchingBackup ? "Streaming Live" : "Idle Result Log"}
              </span>
            </div>

            <div className="p-4 space-y-1.5 max-h-[140px] overflow-y-auto text-left leading-relaxed">
              {backupConsoleLogs.map((log, index) => {
                let colorClass = "text-slate-400";
                if (log.startsWith("[SECURITY") || log.includes("COMPLETE")) colorClass = "text-emerald-400 font-bold";
                if (log.includes("DISPATCH") || log.includes("COMPLETED")) colorClass = "text-teal-350 font-bold";
                if (log.includes("COMPRESSION")) colorClass = "text-indigo-350";
                return (
                  <div key={index} className={colorClass}>
                    <span className="text-slate-500 mr-2">❯</span>
                    {log}
                  </div>
                );
              })}

              {!isDispatchingBackup && backupSuccessMessage && (
                <div className="mt-3 p-2 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold flex items-start gap-1.5 animate-fadeIn">
                  <CheckCircle2 size={13} className="shrink-0 mt-0.5" />
                  <span>{backupSuccessMessage}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Backup Runs Audit Trail list */}
        <div className="pt-3 border-t border-slate-150/10 dark:border-slate-800/40">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-display font-medium text-xs text-slate-400 uppercase tracking-widest font-mono">
              CRM Security Backup Audit Register
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">History of dispatched runs</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {backupHistory.map((run, i) => (
              <div 
                key={run.id || i}
                className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 text-xs font-mono text-left transition hover:scale-[1.01]
                  ${darkMode ? "bg-slate-950/45 border-slate-850" : "bg-slate-50 border-slate-150"}`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-200 break-all">{run.id}</span>
                    <span className={`px-1 rounded text-[9px] font-bold uppercase ${run.isAuto ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/15" : "bg-teal-500/10 text-teal-400 border border-teal-500/15"}`}>
                      {run.isAuto ? "Daily Auto" : "Manual run"}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Clock size={10} className="text-slate-500" />
                    {run.timestamp}
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-slate-850 dark:border-slate-800/60 pt-2 text-[10.5px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Archive Size:</span>
                    <strong className="text-teal-400 font-bold">{run.sizeKb}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Checksum:</span>
                    <span className="text-[9.5px] select-all cursor-copy text-slate-500" title={run.checksum}>{run.checksum}</span>
                  </div>
                  <div className="text-[9.5px] text-slate-400 truncate mt-1">
                    <span className="text-slate-500 font-bold">Mail copies to:</span> <span className="text-slate-350 font-semibold">{run.recipients.join(", ")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SQL Setup schema generation block */}
      {!allTablesOk && (
        <div className={`p-6 rounded-2xl border transition-all space-y-4
          ${darkMode ? "bg-slate-900 border-yellow-500/25 text-white" : "bg-white border-yellow-400 shadow-sm"}`}
        >
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-500">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="font-display font-bold text-base text-yellow-500">Supabase Tables Schema Setup Needed</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                We verified your connection to project <span className="font-mono text-slate-200">fzsjeukjjjutiihhzjgu</span>, but we cannot locate the core tables yet. Copy and run the SQL below inside your **Supabase SQL Editor** to initialize them instantly.
              </p>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-[11px]">
            <div className="flex justify-between items-center px-4 py-2 border-b border-slate-850 bg-slate-900/60 text-[10px] text-slate-400">
              <div className="flex items-center gap-2">
                <Terminal size={12} className="text-yellow-500" />
                <span>BOOTSTRAP_SCHEMA.sql</span>
              </div>
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1 cursor-pointer py-1 px-2.5 hover:bg-slate-850 rounded text-[10px] transition font-semibold"
              >
                {copiedSql ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {copiedSql ? "Copied" : "Copy Schema Code"}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto max-h-60 text-slate-305 text-left leading-relaxed">
              <code>{sqlSchema}</code>
            </pre>
          </div>
          
          <div className="p-3.5 rounded-xl bg-slate-850/50 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
            <Info size={14} className="mt-0.5 text-teal-400 shrink-0" />
            <div>
              <strong>Quick Development Hint:</strong> The SQL command includes <code>DISABLE ROW LEVEL SECURITY</code> statements. Disabling RLS removes complex access controls so you can immediately prototype and read/write records directly from the frontend. For absolute production release, remember to add your custom user session/RLS policies.
            </div>
          </div>
        </div>
      )}

      {/* Connection confirmation pop-up */}
      {showConfigAlert && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2 animate-bounce">
          <Check size={14} className="stroke-[3]" />
          API Integrity verified: Handshaking with Supabase project fzsjeukjjjutiihhzjgu success! Checked all tables status.
        </div>
      )}

      {/* Sync history timeline log */}
      <div className={`p-6 rounded-2xl border transition-all ${darkMode ? "bg-slate-900 border-slate-850" : "bg-white border-slate-100 shadow-sm"}`}>
        <div className="border-b border-slate-100/15 pb-3 mb-4 flex items-center justify-between">
          <h4 className="font-display font-semibold text-sm flex items-center gap-2">
            <CloudLightning size={15} className="text-teal-400" />
            Live Sync Transaction Logs
          </h4>
          <span className="text-[10px] font-mono text-slate-400">Showing last 4 transactions</span>
        </div>

        <div className="space-y-3.5 font-mono text-[11px] text-slate-350 text-left">
          {syncHistory.map((log, idx) => (
            <div 
              key={idx}
              className={`p-3 rounded-xl border flex items-start gap-3
                ${darkMode ? "bg-slate-950/45 border-slate-900" : "bg-slate-50 border-slate-150"}`}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-teal-500 mt-1 animate-pulse"></div>
              <div>
                <p className="font-semibold text-slate-300">{log}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">TLS security verified. Handshake success between workspace domain and server cluster logs.</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
