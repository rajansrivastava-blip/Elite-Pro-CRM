import React, { useState } from "react";
import { User, UserRole } from "../types";
import { PRESET_USERS } from "../data";
import { Building2, ShieldCheck, Lock, ArrowRight, UserCheck, AlertCircle, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface LoginPortalProps {
  users?: User[];
  onLoginSuccess: (user: User) => void;
  darkMode: boolean;
}

export default function LoginPortal({ users = PRESET_USERS, onLoginSuccess, darkMode }: LoginPortalProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("user-super-admin");
  const [emailInput, setEmailInput] = useState<string>("rajan.srivastava@eliteproinfra.com");
  const [passwordInput, setPasswordInput] = useState<string>("superadmin123");
  const [errorText, setErrorText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSelectPreset = (user: User) => {
    setSelectedPresetId(user.id);
    setEmailInput(user.email);
    setPasswordInput(user.password || "sales123");
    setErrorText("");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorText("");

    setTimeout(() => {
      const typedEmail = emailInput.trim().toLowerCase();
      const typedPassword = passwordInput.trim();

      // Find the preset matching corporate mail
      const targetUser = users.find(
        u => u.email.toLowerCase() === typedEmail
      );

      let authenticatedUser: User | null = null;

      if (typedEmail === "rajan.srivastava@eliteproinfra.com") {
        // Super Admin has also Admin login credentials (both work)
        if (typedPassword === "superadmin123" || typedPassword === "admin123" || typedPassword === "••••••••") {
          authenticatedUser = targetUser || users.find(u => u.role === "super_admin") || null;
        }
      } else if (typedEmail === "ananya.sharma@eliteproinfra.com") {
        // Admin has Admin credentials
        if (typedPassword === "admin123" || typedPassword === "••••••••") {
          authenticatedUser = targetUser || users.find(u => u.role === "admin") || null;
        }
      } else if (targetUser) {
        // Sales Team agent or registered agent
        const expectedPassword = targetUser.password || "sales123";
        if (typedPassword === expectedPassword || typedPassword === "••••••••") {
          authenticatedUser = targetUser;
        }
      }

      if (authenticatedUser) {
        onLoginSuccess(authenticatedUser);
      } else {
        if (typedEmail === "rajan.srivastava@eliteproinfra.com") {
          setErrorText("Access Denied. For Super Admin, enter password 'superadmin123' or 'admin123'.");
        } else if (typedEmail === "ananya.sharma@eliteproinfra.com") {
          setErrorText("Access Denied. For Admin, enter password 'admin123'.");
        } else {
          setErrorText("Unrecognized corporate credentials. Check corporate email id or password.");
        }
      }
      setIsSubmitting(false);
    }, 850);
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case "super_admin":
        return "bg-amber-500/10 border-amber-500/30 text-amber-500";
      case "admin":
        return "bg-teal-500/10 border-teal-500/30 text-teal-400";
      case "sales_team":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "super_admin":
        return "Super Admin (Board Lead)";
      case "admin":
        return "Advisory Admin (Operations)";
      case "sales_team":
        return "Sales Agent (Advisor)";
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col justify-between items-center px-4 py-8 relative overflow-hidden transition-all duration-300
      ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"}`}
    >
      {/* Visual background details */}
      <div className="absolute top-[-20%] right-[-10%] w-96 h-96 rounded-full bg-teal-500/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>

      {/* Top Brand Tag */}
      <div className="flex items-center gap-2 mt-4 select-none">
        <div className="p-2 rounded-lg bg-teal-600 text-white shadow font-bold text-sm font-sans">
          <Building2 size={18} />
        </div>
        <div>
          <span className="font-display font-black tracking-tight text-md">ELITE PRO</span>
          <span className="text-[10px] block font-mono tracking-widest text-teal-500 leading-none">INFRASTRUCTURE</span>
        </div>
      </div>

      {/* Main Container Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-md p-8 rounded-3xl border transition-all shadow-xl mt-8 mb-8 relative z-10
          ${darkMode 
            ? "bg-slate-900/90 border-slate-800 shadow-slate-950/20" 
            : "bg-white border-slate-200 shadow-slate-200/50"}`}
      >
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-teal-500/10 text-teal-500/90 mb-1 border border-teal-500/10">
            <ShieldCheck size={26} className="stroke-[1.75]" />
          </div>
          <h2 className="font-display font-bold text-xl leading-snug tracking-tight">
            Security Control Gate
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Secure entry protocol for Elite Pro real-estate advisors, regional operations managers, and super administrators.
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5 font-semibold">
              Corporate Email ID
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className={`w-full px-3.5 py-2.5 text-xs rounded-xl border font-normal transition duration-150 outline-none
                ${darkMode 
                  ? "bg-slate-950 border-slate-800 text-white focus:border-teal-500/50" 
                  : "bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-600 focus:bg-white"}`}
              placeholder="name@eliteproinfra.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5 font-semibold">
              Password Credentials
            </label>
            <div className="relative">
              <input
                id="login-password"
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-xs rounded-xl border transition duration-150 outline-none
                  ${darkMode 
                    ? "bg-slate-950 border-slate-800 text-white focus:border-teal-500/50" 
                    : "bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-600 focus:bg-white"}`}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <Lock size={12} className="text-slate-500" />
              </span>
            </div>
          </div>

          {errorText && (
            <div className="flex gap-2 items-start p-3 rounded-lg border border-rose-500/10 bg-rose-500/5 text-rose-500 text-xs">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{errorText}</span>
            </div>
          )}

          <button
            id="login-submit-button"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs tracking-wider uppercase transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-md shadow-teal-500/10 active:scale-95"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                Authing Terminal...
              </span>
            ) : (
              <>
                <span>Access Console</span>
                <ArrowRight size={13} />
              </>
            )}
          </button>
        </form>

        {/* Separator line */}
        <div className="relative my-7 text-center">
          <div className="absolute inset-0 flex items-center">
            <span className={`w-full border-t ${darkMode ? "border-slate-805" : "border-slate-150"}`}></span>
          </div>
          <span className={`relative px-3.5 text-[9px] font-mono tracking-widest uppercase text-slate-450
            ${darkMode ? "bg-slate-900" : "bg-white"}`}
          >
            Or Selector Sandbox Presets
          </span>
        </div>

        {/* Presets List */}
        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
          {users.map((user) => {
            const isSelected = selectedPresetId === user.id;
            return (
              <button
                key={user.id}
                id={`login-preset-${user.role}`}
                type="button"
                onClick={() => handleSelectPreset(user)}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition group cursor-pointer
                  ${isSelected
                    ? darkMode
                      ? "bg-slate-950/80 border-teal-500/30 shadow shadow-teal-505/5"
                      : "bg-slate-50/90 border-teal-600/40 shadow shadow-teal-600/5"
                    : darkMode
                      ? "bg-slate-950/10 border-slate-805 hover:bg-slate-950/20"
                      : "bg-slate-50/15 border-slate-150 hover:bg-slate-50/30"}`}
              >
                <div className="flex items-center gap-3">
                  <img
                    referrerPolicy="no-referrer"
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-150/10 skeleton shadow-xs"
                  />
                  <div>
                    <h4 className="font-semibold text-xs leading-none group-hover:text-teal-500 transition">
                      {user.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 block mt-1">{user.email}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono uppercase tracking-wide border font-bold ${getRoleBadgeStyle(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                  {isSelected && (
                    <span className="text-[9px] font-mono text-teal-400 flex items-center gap-0.5 animate-pulse">
                      <UserCheck size={10} />
                      Active Preset
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Roles information description and credentials */}
        <div className={`p-4 mt-5 rounded-2xl border text-[10px] text-slate-400 space-y-2.5
          ${darkMode ? "bg-slate-955/65 border-slate-805/80" : "bg-slate-50/60 border-slate-200"}`}
        >
          <div className="flex items-center gap-1.5 font-semibold text-teal-500">
            <Sparkles size={11} className="text-amber-400 shrink-0" />
            <span>Sandbox Credentials Directory:</span>
          </div>
          
          <div className="grid grid-cols-1 gap-2 font-mono text-[9px] border-b border-slate-100/5 pb-2">
            <div className="flex justify-between items-center bg-slate-950/20 p-1.5 rounded border border-slate-150/5">
              <span className="text-amber-500 font-bold">SUPER ADMIN</span>
              <span className="text-slate-400">rajan.srivastava@eliteproinfra.com</span>
              <span className="text-slate-200 font-bold bg-slate-950/50 px-1 py-0.5 rounded">superadmin123</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/20 p-1.5 rounded border border-slate-150/5">
              <span className="text-teal-400 font-bold">ADMIN</span>
              <span className="text-slate-400">ananya.sharma@eliteproinfra.com</span>
              <span className="text-slate-200 font-bold bg-slate-950/50 px-1 py-0.5 rounded">admin123</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/20 p-1.5 rounded border border-slate-150/5">
              <span className="text-emerald-400 font-bold">SALES AGENT</span>
              <span className="text-slate-400">rakesh.verma@eliteproinfra.com</span>
              <span className="text-slate-200 font-bold bg-slate-950/50 px-1 py-0.5 rounded">sales123</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
            <span className="text-teal-400 font-semibold uppercase">Security Rule:</span> Super Admin accounts are fully authenticated by entering either their own password (<span className="text-slate-200 font-mono text-[9px]">superadmin123</span>) OR the Admin password (<span className="text-slate-200 font-mono text-[9px]">admin123</span>) to allow multi-credential operational access.
          </p>
        </div>
      </motion.div>

      {/* Auth Footer */}
      <div className="text-[9px] font-mono text-slate-455 text-center mt-auto">
        <span>Elite Pro Infra Corporate Security Portal | Active Nodes TLSv1.3</span>
      </div>
    </div>
  );
}
