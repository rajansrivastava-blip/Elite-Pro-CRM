import React, { useState } from "react";
import { User, UserRole } from "../types";
import { 
  UserPlus, 
  Shield, 
  Sparkles, 
  Mail, 
  Building2, 
  Trash2, 
  Edit2, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle, 
  Search, 
  Lock, 
  UserCheck,
  UserX,
  Plus,
  Info,
  Power,
  X,
  FileText,
  Database
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface UserManagementProps {
  users: User[];
  currentUser: User | null;
  onAddUser: (user: Omit<User, "id">) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  darkMode: boolean;
}

export default function UserManagement({
  users,
  currentUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  darkMode
}: UserManagementProps) {
  // Navigation & Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");

  // Create User Form State
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    role: "sales_team" as UserRole,
    department: "Infrastructure Advisory",
    avatarUrl: "",
    permissions: {
      canEditLeads: true,
      canDeleteLeads: false,
      canViewReports: false,
      canSyncSystems: false
    }
  });

  // Edit User Permissions State
  const [editPermissions, setEditPermissions] = useState({
    canEditLeads: true,
    canDeleteLeads: false,
    canViewReports: false,
    canSyncSystems: false
  });

  const presetDepartments = [
    "Infrastructure Advisory",
    "Operations Management",
    "Executive Board",
    "Retail & Global Expansion",
    "Corporate Acquisitions",
    "Legal & Site Compliance"
  ];

  const presetAvatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop", // Female 1
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop", // Male 1
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop", // Female 2
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop", // Male 2
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop", // Female 3
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop", // Male 3
  ];

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedRoleFilter === "all" || u.role === selectedRoleFilter;
    
    return matchesSearch && matchesFilter;
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name.trim() || !newUserForm.email.trim()) return;

    // Use a random preset avatar if not provided
    const avatar = newUserForm.avatarUrl || presetAvatars[Math.floor(Math.random() * presetAvatars.length)];

    onAddUser({
      name: newUserForm.name,
      email: newUserForm.email,
      role: newUserForm.role,
      department: newUserForm.department,
      avatarUrl: avatar
    });

    // Reset Form
    setNewUserForm({
      name: "",
      email: "",
      role: "sales_team",
      department: "Infrastructure Advisory",
      avatarUrl: "",
      permissions: {
        canEditLeads: true,
        canDeleteLeads: false,
        canViewReports: false,
        canSyncSystems: false
      }
    });
    setIsRegistering(false);
  };

  const handleEditInit = (user: User) => {
    setEditingUser(user);
    setIsRegistering(false);
    // Initialize permissions block mock for visual customization
    setEditPermissions({
      canEditLeads: user.role !== "sales_team",
      canDeleteLeads: user.role === "super_admin",
      canViewReports: user.role !== "sales_team",
      canSyncSystems: user.role === "super_admin"
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    onUpdateUser(editingUser);
    setEditingUser(null);
  };

  // Check role restrictions
  const isSuperAdmin = currentUser?.role === "super_admin";
  const isAdmin = currentUser?.role === "admin";

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

  return (
    <div id="users-tab" className="space-y-6">
      
      {/* Top Welcome Control Panel summary */}
      <div className={`p-6 rounded-2xl border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6
        ${darkMode ? "bg-slate-900 border-slate-850" : "bg-white border-slate-100 shadow-sm"}`}
      >
        <div className="text-left space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-500/15 text-teal-400 font-mono font-bold text-xs">ROLE MGMT</span>
            <span className="text-slate-400 text-xs font-mono">Current Identity: <strong className="text-teal-400 font-bold uppercase">{currentUser?.name}</strong></span>
          </div>
          <h3 className={`font-display font-semibold text-lg ${darkMode ? "text-white" : "text-slate-800"}`}>
            Advisory & Sales Team Identity Hub
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Super Admins and Admins possess exclusive clearance to spawn, configure, edit, and audit Sales Team credentials. 
            Assigning users ensures appropriate lead delegation on the pipeline workspace.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {!isRegistering && !editingUser && (
            <button
              id="btn-trigger-register-user"
              onClick={() => setIsRegistering(true)}
              className="px-4 py-2.5 rounded-xl bg-teal-605 hover:bg-teal-550 text-white font-bold text-xs tracking-wide uppercase transition shadow-md shadow-teal-505/10 flex items-center gap-2 cursor-pointer w-full justify-center md:w-auto active:scale-95"
            >
              <UserPlus size={14} />
              <span>Register New Agent</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Users list and search filters */}
        <div className={`col-span-1 lg:col-span-7 p-6 rounded-2xl border transition-all space-y-4
          ${darkMode ? "bg-slate-900 border-slate-850" : "bg-white border-slate-100 shadow-sm"}`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100/5">
            <div>
              <h4 className={`font-semibold text-sm ${darkMode ? "text-white" : "text-slate-800"}`}>
                Sales Agents Registry ({filteredUsers.length})
              </h4>
              <p className="text-[11px] text-slate-400">Manage real-time access permission keys and regional departments</p>
            </div>

            {/* Role Filter dropdown tabs */}
            <div className="flex gap-1 bg-slate-100/5 p-1 rounded-lg border border-slate-150/10">
              {["all", "sales_team", "admin", "super_admin"].map((roleOpt) => (
                <button
                  key={roleOpt}
                  onClick={() => setSelectedRoleFilter(roleOpt)}
                  className={`px-2 py-1 rounded-md text-[10px] font-mono uppercase tracking-wide transition font-semibold cursor-pointer
                    ${selectedRoleFilter === roleOpt
                      ? "bg-teal-600 text-white"
                      : "text-slate-400 hover:text-slate-200"}`}
                >
                  {roleOpt === "all" ? "All" : roleOpt.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <input
              id="search-user-input"
              type="text"
              placeholder="Search by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-teal-500
                ${darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200"}`}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={14} />
            </span>
          </div>

          {/* User Cards Grid */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredUsers.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <UserX size={36} className="text-slate-550 mx-auto stroke-[1.5]" />
                <p className="text-xs text-slate-400 font-mono">No matched sales agents found within selected boundary</p>
              </div>
            ) : (
              filteredUsers.map((user) => {
                const isTargetCurrentUser = currentUser?.id === user.id;
                return (
                  <div
                    key={user.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group
                      ${editingUser?.id === user.id 
                        ? "border-teal-500/50 bg-teal-500/5" 
                        : darkMode 
                          ? "bg-slate-950/40 border-slate-805/80 hover:bg-slate-950/60" 
                          : "bg-slate-50 border-slate-150/50 hover:bg-slate-50"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <img
                          referrerPolicy="no-referrer"
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-150/10 shadow-xs skeleton"
                        />
                        <span className="absolute -bottom-1 -right-1 p-0.5 rounded-md bg-emerald-500 text-white border-2 border-white dark:border-slate-950">
                          <CheckCircle size={8} />
                        </span>
                      </div>

                      <div className="text-left">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className={`font-semibold text-xs leading-none ${darkMode ? "text-white" : "text-slate-800"}`}>
                            {user.name}
                          </h5>
                          {isTargetCurrentUser && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold uppercase">
                              Self
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-1 font-mono">{user.email}</span>
                        
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-[9px] font-medium font-sans text-slate-400 flex items-center gap-1">
                            <Building2 size={10} className="text-slate-400" />
                            {user.department}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col items-end gap-2.5 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-150/10 justify-between">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono border font-bold uppercase tracking-wider ${getRoleBadgeStyle(user.role)}`}>
                        {getRoleLabel(user.role).split(" ")[0]} {user.role === "sales_team" ? "Agent" : "Admin"}
                      </span>

                      {/* Controls row for Admin/Super Admin */}
                      <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition duration-150">
                        <button
                          id={`btn-edit-user-${user.id}`}
                          onClick={() => handleEditInit(user)}
                          className={`p-1.5 rounded-lg border transition cursor-pointer active:scale-90
                            ${darkMode 
                              ? "bg-slate-900 border-slate-800 hover:text-teal-400 hover:border-teal-500/30 text-slate-400" 
                              : "bg-white border-slate-200 hover:text-teal-600 hover:border-teal-200 text-slate-500"}`}
                          title="Tweak client security access settings"
                        >
                          <Edit2 size={12} />
                        </button>
                        
                        {/* Prevent self deletion */}
                        {!isTargetCurrentUser && (
                          <button
                            id={`btn-delete-user-${user.id}`}
                            onClick={() => {
                              if (user.role === "super_admin" && !isSuperAdmin) {
                                alert("Only Super Admins can delete a board Super Admin account.");
                                return;
                              }
                              if (window.confirm(`Are you sure you want to delete sales agent account for ${user.name}? This will revoke their API tokens instantly.`)) {
                                onDeleteUser(user.id);
                              }
                            }}
                            className={`p-1.5 rounded-lg border transition cursor-pointer active:scale-90 hover:bg-rose-500/15 hover:border-rose-500/20 text-rose-550
                              ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-205"}`}
                            title="Hard removal of agent credentials"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Create/Edit Panel Form */}
        <div className="col-span-1 lg:col-span-12 xl:col-span-5 space-y-6">
          <AnimatePresence mode="wait">
            {isRegistering ? (
              <motion.div
                key="register-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-6 rounded-2xl border transition-all space-y-4 text-left
                  ${darkMode ? "bg-slate-900 border-slate-850" : "bg-white border-slate-100 shadow-sm"}`}
              >
                <div className="flex justify-between items-center pb-3 border-b border-slate-100/5">
                  <div className="flex items-center gap-2">
                    <UserPlus size={16} className="text-teal-500" />
                    <h4 className={`font-semibold text-sm ${darkMode ? "text-white" : "text-slate-800"}`}>
                      Register Sales Account
                    </h4>
                  </div>
                  <button
                    onClick={() => setIsRegistering(false)}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    <X size={15} />
                  </button>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Full Legal Name</label>
                    <input
                      id="reg-user-name"
                      type="text"
                      required
                      placeholder="e.g. Priyesh Patel"
                      value={newUserForm.name}
                      onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                      className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-teal-500
                        ${darkMode ? "bg-slate-950 border-slate-805 text-white" : "bg-slate-50 border-slate-200"}`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Corporate Email</label>
                    <input
                      id="reg-user-email"
                      type="email"
                      required
                      placeholder="e.g. priyesh.patel@eliteproinfra.com"
                      value={newUserForm.email}
                      onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                      className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-teal-500
                        ${darkMode ? "bg-slate-950 border-slate-805 text-white" : "bg-slate-50 border-slate-200"}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Security Clearance</label>
                      <select
                        id="reg-user-role"
                        value={newUserForm.role}
                        onChange={(e) => {
                          const val = e.target.value as UserRole;
                          setNewUserForm({ 
                            ...newUserForm, 
                            role: val,
                            permissions: {
                              canEditLeads: val !== "sales_team",
                              canDeleteLeads: val === "super_admin",
                              canViewReports: val !== "sales_team",
                              canSyncSystems: val === "super_admin"
                            }
                          });
                        }}
                        className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-teal-500
                          ${darkMode ? "bg-slate-950 border-slate-805 text-white" : "bg-slate-50 border-slate-200"}`}
                      >
                        <option value="sales_team">Sales Team</option>
                        <option value="admin">Admin</option>
                        {isSuperAdmin && <option value="super_admin">Super Admin</option>}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Assigned Department</label>
                      <select
                        id="reg-user-dept"
                        value={newUserForm.department}
                        onChange={(e) => setNewUserForm({ ...newUserForm, department: e.target.value })}
                        className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-teal-500
                          ${darkMode ? "bg-slate-950 border-slate-805 text-white" : "bg-slate-50 border-slate-200"}`}
                      >
                        {presetDepartments.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Preset Avatar Picker */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Select User Portrait Avatar</label>
                    <div className="flex gap-2 items-center flex-wrap">
                      {presetAvatars.map((url, idx) => {
                        const isSelected = newUserForm.avatarUrl === url;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setNewUserForm({ ...newUserForm, avatarUrl: url })}
                            className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition relative cursor-pointer
                              ${isSelected ? "border-teal-500 scale-105" : "border-transparent opacity-70 hover:opacity-100"}`}
                          >
                            <img referrerPolicy="no-referrer" src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                            {isSelected && (
                              <span className="absolute inset-0 bg-teal-500/20 flex items-center justify-center text-white">
                                <CheckCircle size={10} />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Permissions Checklist indicator */}
                  <div className={`p-4 rounded-xl border space-y-2.5 
                    ${darkMode ? "bg-slate-950/40 border-slate-805" : "bg-slate-50/70 border-slate-200"}`}
                  >
                    <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-slate-400">
                      <Shield size={11} className="text-teal-400" />
                      <span>Security Clearance Matrix</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Can Edit Allocated Leads</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold
                          ${newUserForm.permissions.canEditLeads ? "bg-teal-500/10 text-teal-400" : "bg-rose-500/10 text-rose-400"}`}>
                          {newUserForm.permissions.canEditLeads ? "PERMITTED" : "REFUSED"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Can Delete Key Leads</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold
                          ${newUserForm.permissions.canDeleteLeads ? "bg-teal-500/10 text-teal-400" : "bg-rose-500/10 text-rose-400"}`}>
                          {newUserForm.permissions.canDeleteLeads ? "PERMITTED" : "REFUSED"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Can Access Board Analyst Reports</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold
                          ${newUserForm.permissions.canViewReports ? "bg-teal-500/10 text-teal-400" : "bg-rose-500/10 text-rose-400"}`}>
                          {newUserForm.permissions.canViewReports ? "PERMITTED" : "REFUSED"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    id="submit-register-user"
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs tracking-wider uppercase transition active:scale-95 cursor-pointer shadow-md shadow-teal-605/10"
                  >
                    Create Sales Account Instantly
                  </button>
                </form>
              </motion.div>
            ) : editingUser ? (
              <motion.div
                key="edit-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-6 rounded-2xl border transition-all space-y-4 text-left
                  ${darkMode ? "bg-slate-900 border-slate-850" : "bg-white border-slate-100 shadow-sm"}`}
              >
                <div className="flex justify-between items-center pb-3 border-b border-slate-100/5">
                  <div className="flex items-center gap-2">
                    <Edit2 size={16} className="text-teal-500" />
                    <h4 className={`font-semibold text-sm ${darkMode ? "text-white" : "text-slate-800"}`}>
                      Configure User Access
                    </h4>
                  </div>
                  <button
                    onClick={() => setEditingUser(null)}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    <X size={15} />
                  </button>
                </div>

                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Full Legal Name</label>
                    <input
                      id="edit-user-name"
                      type="text"
                      required
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                      className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-teal-500
                        ${darkMode ? "bg-slate-950 border-slate-805 text-white" : "bg-slate-50 border-slate-200"}`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Corporate Email</label>
                    <input
                      id="edit-user-email"
                      type="email"
                      required
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                      className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-teal-500
                        ${darkMode ? "bg-slate-950 border-slate-805 text-white" : "bg-slate-50 border-slate-200"}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">User Position Role</label>
                      <select
                        id="edit-user-role"
                        value={editingUser.role}
                        onChange={(e) => {
                          const val = e.target.value as UserRole;
                          setEditingUser({ ...editingUser, role: val });
                          setEditPermissions({
                            canEditLeads: val !== "sales_team",
                            canDeleteLeads: val === "super_admin",
                            canViewReports: val !== "sales_team",
                            canSyncSystems: val === "super_admin"
                          });
                        }}
                        disabled={editingUser.id === currentUser?.id} // cannot change own role to lock admin bypass
                        className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-teal-500
                          ${darkMode ? "bg-slate-950 border-slate-805 text-white" : "bg-slate-50 border-slate-200"}
                          ${editingUser.id === currentUser?.id ? "opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800" : ""}`}
                      >
                        <option value="sales_team">Sales Team</option>
                        <option value="admin">Admin</option>
                        {isSuperAdmin && <option value="super_admin">Super Admin</option>}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Department</label>
                      <select
                        id="edit-user-dept"
                        value={editingUser.department}
                        onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                        className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-teal-500
                          ${darkMode ? "bg-slate-950 border-slate-805 text-white" : "bg-slate-50 border-slate-200"}`}
                      >
                        {presetDepartments.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Edit Permissions Matrix Indicator Checklist */}
                  <div className={`p-4 rounded-xl border space-y-2.5 
                    ${darkMode ? "bg-slate-950/40 border-slate-805" : "bg-slate-50/70 border-slate-200"}`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-slate-400">
                      <div className="flex items-center gap-1">
                        <ShieldAlert size={11} className="text-amber-500" />
                        <span>Security Authorization Access</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Editable Leads Access Key</span>
                        <input
                          type="checkbox"
                          checked={editPermissions.canEditLeads}
                          onChange={(e) => setEditPermissions({ ...editPermissions, canEditLeads: e.target.checked })}
                          disabled={editingUser.role === "sales_team"}
                          className="accent-teal-500 h-3.5 w-3.5 rounded cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Leads Absolute Deletion Permit</span>
                        <input
                          type="checkbox"
                          checked={editPermissions.canDeleteLeads}
                          onChange={(e) => setEditPermissions({ ...editPermissions, canDeleteLeads: e.target.checked })}
                          disabled={editingUser.role !== "super_admin"}
                          className="accent-teal-500 h-3.5 w-3.5 rounded cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Board Analysts Report Access</span>
                        <input
                          type="checkbox"
                          checked={editPermissions.canViewReports}
                          onChange={(e) => setEditPermissions({ ...editPermissions, canViewReports: e.target.checked })}
                          disabled={editingUser.role === "sales_team"}
                          className="accent-teal-500 h-3.5 w-3.5 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition text-center cursor-pointer active:scale-95
                        ${darkMode 
                          ? "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900" 
                          : "bg-slate-50 border-slate-202 text-slate-600 hover:bg-slate-100"}`}
                    >
                      Cancel
                    </button>
                    <button
                      id="save-user-changes"
                      type="submit"
                      className="flex-1 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wide transition active:scale-95 cursor-pointer shadow-md shadow-teal-605/10"
                    >
                      Save Configuration
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="info-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-6 rounded-2xl border transition-all text-left space-y-4
                  ${darkMode ? "bg-slate-900 border-slate-850" : "bg-white border-slate-100 shadow-sm"}`}
              >
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100/5">
                  <Info size={16} className="text-teal-500" />
                  <h4 className={`font-semibold text-sm ${darkMode ? "text-white" : "text-slate-800"}`}>
                    Identity & Security Framework
                  </h4>
                </div>

                <div className="space-y-4 text-xs leading-relaxed text-slate-400">
                  <p>
                    Elite Pro Infrastructure mandates severe data privacy. This dashboard acts as a local security directory. 
                    Adding a user makes their name instantly visible in the <strong>"Assign To"</strong> dropdown menu inside the <strong>Lead Pipeline</strong>.
                  </p>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-teal-500/5 border border-teal-500/10 text-slate-400">
                    <Database size={18} className="text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className={`block text-[11px] mb-1 font-semibold ${darkMode ? "text-slate-200" : "text-slate-805"}`}>Dynamic Sales Delegation</strong>
                      Assigning high-yield real estate leads instantly updates the lead record, triggering real-time alerts if the companion mobile app is synchronized.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 text-slate-400">
                    <Lock size={18} className="text-orange-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className={`block text-[11px] mb-1 font-semibold ${darkMode ? "text-slate-200" : "text-slate-850"}`}>Role Hierarchies</strong>
                      Only <strong>Super Admin</strong> and <strong>Admin</strong> levels hold authority to spawn Sales accounts. 
                      Standard Sales Team credentials are restricted from changing ownership allocations.
                    </div>
                  </div>
                </div>

                <button
                  id="btn-register-user-prompt"
                  onClick={() => setIsRegistering(true)}
                  className="w-full py-2.5 rounded-xl border border-slate-150/10 hover:border-teal-500/35 bg-teal-500/5 hover:bg-teal-500/10 text-teal-400 font-bold text-xs uppercase tracking-wide transition active:scale-95 cursor-pointer"
                >
                  Click to Register New Account
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
