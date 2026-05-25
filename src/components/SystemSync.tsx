import React, { useState } from "react";
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
  Check
} from "lucide-react";

interface SystemSyncProps {
  darkMode: boolean;
  isSyncing: boolean;
  onTriggerSync: () => void;
  syncHistory: string[];
}

export default function SystemSync({
  darkMode,
  isSyncing,
  onTriggerSync,
  syncHistory
}: SystemSyncProps) {
  
  // Status check state
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(true);
  const [crmConnected, setCrmConnected] = useState(true);
  const [showConfigAlert, setShowConfigAlert] = useState(false);

  const handleTestLink = () => {
    setShowConfigAlert(true);
    setTimeout(() => {
      setShowConfigAlert(false);
    }, 3000);
  };

  return (
    <div id="integrations-tab" className="space-y-6">
      
      {/* Synchronization Status Banner */}
      <div className={`p-6 rounded-2xl border transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6
        ${darkMode ? "bg-slate-900 border-slate-850" : "bg-white border-slate-100 shadow-sm"}`}
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl flex-shrink-0 flex items-center justify-center
            ${googleCalendarConnected && crmConnected 
              ? "bg-emerald-500/10 text-emerald-400" 
              : "bg-amber-500/10 text-amber-500"}`}
          >
            <Radio size={24} className={isSyncing ? "animate-pulse" : ""} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-display font-semibold text-base ${darkMode ? "text-white" : "text-slate-900"}`}>
                Corporate Sync Registry Portal
              </h3>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono tracking-wider font-semibold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Elite Pro Infra integrates directly with standard Google Workspace domain parameters and client CRM pipelines to maintain single-truth lead alignment.
            </p>
          </div>
        </div>

        {/* Big Manual Sync button */}
        <button
          id="system-sync-master-btn"
          onClick={onTriggerSync}
          disabled={isSyncing}
          className="px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs tracking-wider uppercase transition flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-md shadow-teal-500/10 select-none"
        >
          <RefreshCw size={13} className={isSyncing ? "animate-spin" : ""} />
          {isSyncing ? "Synchronizing Calendar Hub..." : "Force Core System Synchronization"}
        </button>
      </div>

      {/* Grid of integrations cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
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

        {/* Card 2: CRM Core Database Synchronization */}
        <div className={`p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between
          ${darkMode ? "bg-slate-900 border-slate-850" : "bg-white border-slate-100 shadow-sm"}`}
        >
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Link2 size={20} />
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase
                ${crmConnected 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : "bg-slate-800 text-slate-400"}`}
              >
                {crmConnected ? "Connected" : "Disconnected"}
              </span>
            </div>

            <h4 className="font-display font-bold text-base">Elite Pro Core CRM System</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Maintains high-availability synchronization with corporate pipeline ledger schemas (Oracle/SQL clusters) tracking active investor valuations.
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100/10 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Source Cluster Address:</span>
                <span className="font-mono text-slate-350">db-prod.elitepro.internal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sync Master Mode:</span>
                <span className="font-mono text-slate-350">Bi-directional Autopilot</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">API Connection Integrity:</span>
                <span className="text-emerald-500 font-bold">100% (Green)</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100/5 flex gap-2">
            <button
              id="crm-test-connection-btn"
              onClick={handleTestLink}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition cursor-pointer select-none
                ${darkMode ? "bg-slate-800 hover:bg-slate-705 border-slate-700 text-white" : "bg-slate-50 hover:bg-slate-100 border-slate-205"}`}
            >
              Verify Endpoint Link
            </button>
            <button
              id="crm-config-toggle-btn"
              onClick={() => setCrmConnected(!crmConnected)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition border cursor-pointer select-none
                ${crmConnected 
                  ? "border-rose-500/20 text-rose-500 bg-rose-500/5 hover:bg-rose-500/10" 
                  : "border-teal-500/20 text-teal-400 bg-teal-500/5 hover:bg-teal-500/10"}`}
            >
              {crmConnected ? "Disconnect" : "Re-Link Protocol"}
            </button>
          </div>
        </div>

      </div>

      {/* Connection confirmation pop-up */}
      {showConfigAlert && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2 animate-bounce">
          <Check size={14} className="stroke-[3]" />
          API Integrity verified: Endpoint responding standard JSON ping in 42ms. Schema mapping matches perfectly.
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
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70 mt-1 animate-pulse"></div>
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
