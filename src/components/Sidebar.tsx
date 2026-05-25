import React from "react";
import { 
  Building2, 
  Users, 
  LayoutDashboard, 
  Calendar, 
  FilePieChart, 
  Smartphone, 
  RefreshCw, 
  Lock, 
  LogOut,
  Sun, 
  Moon,
  UserCheck
} from "lucide-react";
import { User } from "../types";

interface SidebarProps {
  currentTab: string;
  onChangeTab: (tab: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isSyncing: boolean;
  onTriggerSync: () => void;
  isMobileModeActive: boolean;
  currentUser: User | null;
  onLogout: () => void;
}

export default function Sidebar({
  currentTab,
  onChangeTab,
  darkMode,
  onToggleDarkMode,
  isSyncing,
  onTriggerSync,
  isMobileModeActive,
  currentUser,
  onLogout
}: SidebarProps) {
  
  const menuItems = [
    { id: "dashboard", label: "Executive Dashboard", icon: LayoutDashboard },
    { id: "leads", label: "Lead Pipeline", icon: Users },
    { id: "calendar", label: "Appointments & Reminders", icon: Calendar },
    { id: "reports", label: "Stakeholder Reports", icon: FilePieChart },
    { id: "integrations", label: "System Sync", icon: RefreshCw },
    { id: "mobile-simulation", label: "Mobile Companion", icon: Smartphone },
    { id: "users", label: "Sales Team Accounts", icon: UserCheck },
  ];

  const isTabRestricted = (tabId: string) => {
    if (currentUser?.role === 'sales_team') {
      return tabId === "reports" || tabId === "integrations" || tabId === "users";
    }
    return false;
  };

  return (
    <aside 
      id="crm-sidebar"
      className={`fixed top-0 left-0 h-full w-64 z-20 transition-all duration-300 border-r flex flex-col justify-between
        ${darkMode 
          ? "bg-slate-900 border-slate-800 text-slate-100" 
          : "bg-white border-slate-250 text-slate-800"}`}
    >
      <div>
        {/* Brand Header */}
        <div className={`p-6 border-b flex items-center gap-3 ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
          <div className="p-2.5 rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/10">
            <Building2 size={24} className="stroke-[1.75]" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight tracking-tight">
              Elite Pro
            </h1>
            <span className="text-xs font-mono font-medium tracking-wider text-teal-500 uppercase">
              Infrastructure
            </span>
          </div>
        </div>

        {/* Sync Status Banner */}
        <div className={`px-4 py-3 mx-4 my-4 rounded-xl border flex items-center justify-between text-xs transition-all
          ${darkMode 
            ? "bg-slate-800/55 border-slate-700/60 text-slate-300" 
            : "bg-slate-50 border-slate-100 text-slate-600"}`}
        >
          <div className="flex items-center gap-2">
            <span className={`relative flex h-2.5 w-2.5`}>
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSyncing ? "bg-teal-400" : "bg-emerald-400"}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isSyncing ? "bg-amber-500" : "bg-emerald-500"}`}></span>
            </span>
            <span className="font-medium">
              {isSyncing ? "Syncing Calendar..." : "Connected to Workspace"}
            </span>
          </div>
          <button 
            id="force-sync-btn"
            onClick={onTriggerSync}
            disabled={isSyncing}
            className={`p-1.5 rounded-lg hover:bg-opacity-80 transition active:scale-95 disabled:opacity-50
              ${darkMode ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-200 text-slate-500"}`}
            title="Sync existing CRM and Google Calendar systems instantly"
          >
            <RefreshCw size={13} className={`stroke-[1.5] ${isSyncing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Nav list */}
        <nav className="px-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const isLocked = isTabRestricted(item.id);
            
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => onChangeTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 group cursor-pointer
                  ${isActive 
                    ? "bg-teal-600 text-white shadow-sm" 
                    : darkMode 
                      ? "hover:bg-slate-850/80 text-slate-400 hover:text-slate-100" 
                      : "hover:bg-slate-50 text-slate-600 hover:text-slate-950"}`}
              >
                <Icon 
                  size={18} 
                  className={`stroke-[1.75] transition-transform group-hover:scale-105 duration-200
                    ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-500"}`} 
                />
                
                <span className="flex-1 text-left truncate">{item.label}</span>
                
                {isLocked && (
                  <span className="text-slate-500/70 dark:text-slate-500/80" title="Super Admin or Admin credentials required">
                    <Lock size={12} />
                  </span>
                )}
                
                {item.id === "mobile-simulation" && isMobileModeActive && (
                  <span className="ml-auto w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer controls: User information, local time, dark mode toggle */}
      <div className={`p-4 border-t flex flex-col gap-3.5 ${darkMode ? "border-slate-800/80" : "border-slate-150"}`}>
        {/* User Info */}
        {currentUser && (
          <div className="flex items-center gap-3 p-1 rounded-xl">
            <div className="relative">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-10 h-10 rounded-xl object-cover border border-teal-500/20 shadow-sm skeleton"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
            </div>
            
            <div className="overflow-hidden flex-1 text-left">
              <p className="text-xs font-bold leading-tight truncate">{currentUser.name}</p>
              <span className={`text-[9px] font-mono font-bold uppercase tracking-wider block mt-0.5
                ${currentUser.role === "super_admin" 
                  ? "text-amber-500" 
                  : currentUser.role === "admin" 
                    ? "text-teal-400" 
                    : "text-emerald-400"}`}
              >
                {currentUser.role === "super_admin" 
                  ? "★ Super Admin" 
                  : currentUser.role === "admin" 
                    ? "♦ Board Admin" 
                    : "♠ Sales Team"}
              </span>
            </div>

            <button
              id="sidebar-logout-btn"
              onClick={onLogout}
              className={`p-2 rounded-xl border transition-all cursor-pointer active:scale-95 flex items-center justify-center hover:bg-rose-500/10 hover:border-rose-500/30 text-rose-500
                ${darkMode 
                  ? "bg-slate-800 border-slate-700" 
                  : "bg-slate-50 border-slate-200"}`}
              title="Secure Logout from Console"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}

        {/* Action controls */}
        <div className="flex items-center justify-between mt-1">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest leading-none">
            CRM Console v2.5
          </span>
          
          <button
            id="theme-toggler"
            onClick={onToggleDarkMode}
            className={`p-2 rounded-xl transition duration-150 cursor-pointer border ${
              darkMode 
                ? "bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700" 
                : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
            }`}
            title={darkMode ? "Switch to Eye-Comfort Light Mode" : "Dark Mode for Eye-Strain Control"}
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
    </aside>
  );
}
