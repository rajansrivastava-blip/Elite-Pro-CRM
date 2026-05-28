import { User, Lead, Appointment, CommunicationLog, LeadEditLog } from "./types";

// State to track if Supabase is fully configured and tables exist
export interface SupabaseStatus {
  isConnected: boolean;
  tablesVerified: {
    users: boolean;
    leads: boolean;
    appointments: boolean;
    communication_logs: boolean;
    lead_edit_logs: boolean;
  };
  error?: string;
}

// ==========================================
// DATA CONVERTERS (camelCase <-> snake_case)
// ==========================================

export function mapUserFromDb(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    avatarUrl: row.avatar_url,
    department: row.department,
    password: row.password,
    teamLeaderId: row.team_leader_id,
    active: row.active === undefined ? true : !!row.active
  };
}

export function mapUserToDb(user: User): any {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar_url: user.avatarUrl,
    department: user.department,
    password: user.password,
    team_leader_id: user.teamLeaderId,
    active: user.active === undefined ? true : !!user.active
  };
}

export function mapLeadFromDb(row: any): Lead {
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    position: row.position,
    email: row.email,
    phone: row.phone,
    source: row.source,
    status: row.status,
    temperature: row.temperature,
    budget: row.budget,
    location: row.location,
    assignedAgent: row.assigned_agent,
    notes: row.notes,
    projectName: row.project_name,
    dateCreated: row.date_created,
    dateUpdated: row.date_updated,
    lastCommunication: row.last_communication,
    score: row.score
  };
}

export function mapLeadToDb(lead: Lead): any {
  return {
    id: lead.id,
    name: lead.name,
    company: lead.company,
    position: lead.position,
    email: lead.email,
    phone: lead.phone,
    source: lead.source,
    status: lead.status,
    temperature: lead.temperature,
    budget: lead.budget,
    location: lead.location,
    assigned_agent: lead.assignedAgent,
    notes: lead.notes,
    project_name: lead.projectName,
    date_created: lead.dateCreated,
    date_updated: lead.dateUpdated,
    last_communication: lead.lastCommunication,
    score: lead.score
  };
}

export function mapAppointmentFromDb(row: any): Appointment {
  return {
    id: row.id,
    leadId: row.lead_id,
    leadName: row.lead_name,
    title: row.title,
    date: row.date,
    time: row.time,
    type: row.type,
    notes: row.notes,
    isCompleted: row.is_completed,
    reminderActive: row.reminder_active
  };
}

export function mapAppointmentToDb(app: Appointment): any {
  return {
    id: app.id,
    lead_id: app.leadId,
    lead_name: app.leadName,
    title: app.title,
    date: app.date,
    time: app.time,
    type: app.type,
    notes: app.notes,
    is_completed: app.isCompleted,
    reminder_active: app.reminderActive
  };
}

export function mapCommunicationLogFromDb(row: any): CommunicationLog {
  return {
    id: row.id,
    leadId: row.lead_id,
    date: row.date,
    type: row.type,
    content: row.content,
    sender: row.sender
  };
}

export function mapCommunicationLogToDb(log: CommunicationLog): any {
  return {
    id: log.id,
    lead_id: log.leadId,
    date: log.date,
    type: log.type,
    content: log.content,
    sender: log.sender
  };
}

export function mapLeadEditLogFromDb(row: any): LeadEditLog {
  return {
    id: row.id,
    leadId: row.lead_id,
    leadName: row.lead_name,
    editorName: row.editor_name,
    editorRole: row.editor_role,
    timestamp: row.timestamp,
    changes: Array.isArray(row.changes) ? row.changes : []
  };
}

export function mapLeadEditLogToDb(log: LeadEditLog): any {
  return {
    id: log.id,
    lead_id: log.leadId,
    lead_name: log.leadName,
    editor_name: log.editorName,
    editor_role: log.editorRole,
    timestamp: log.timestamp,
    changes: log.changes
  };
}

// ==========================================
// CORE DB DATA SYNC - BULK / SEED OPERATIONS
// ==========================================

export async function checkSupabaseStatus(): Promise<SupabaseStatus> {
  try {
    const res = await fetch("/api/db/status");
    if (!res.ok) {
      throw new Error(`Server returned HTTP status ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    return {
      isConnected: false,
      tablesVerified: {
        users: false,
        leads: false,
        appointments: false,
        communication_logs: false,
        lead_edit_logs: false,
      },
      error: err.message || String(err)
    };
  }
}

export async function pushLocalDataToSupabase(data: {
  users: User[];
  leads: Lead[];
  appointments: Appointment[];
  communicationLogs: CommunicationLog[];
  leadEditLogs: LeadEditLog[];
}): Promise<{ success: boolean; errors: string[] }> {
  try {
    const payload = {
      users: data.users.map(mapUserToDb),
      leads: data.leads.map(mapLeadToDb),
      appointments: data.appointments.map(mapAppointmentToDb),
      communicationLogs: data.communicationLogs.map(mapCommunicationLogToDb),
      leadEditLogs: data.leadEditLogs.map(mapLeadEditLogToDb)
    };

    const res = await fetch("/api/db/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const parsed = await res.json();
    if (!res.ok) {
      return { success: false, errors: [parsed.error || "Push operation query rejected."] };
    }
    return { success: parsed.success, errors: parsed.errors || [] };
  } catch (err: any) {
    return { success: false, errors: [err.message || String(err)] };
  }
}

export async function pullSupabaseData(): Promise<{
  users: User[] | null;
  leads: Lead[] | null;
  appointments: Appointment[] | null;
  communicationLogs: CommunicationLog[] | null;
  leadEditLogs: LeadEditLog[] | null;
  errors: string[];
}> {
  try {
    const res = await fetch("/api/db/pull");
    if (!res.ok) {
      const parsedError = await res.json();
      return {
        users: null, leads: null, appointments: null, communicationLogs: null, leadEditLogs: null,
        errors: [parsedError.error || `Failed HTTP pull logic: ${res.status}`]
      };
    }
    const parsed = await res.json();
    return {
      users: parsed.users ? parsed.users.map(mapUserFromDb) : [],
      leads: parsed.leads ? parsed.leads.map(mapLeadFromDb) : [],
      appointments: parsed.appointments ? parsed.appointments.map(mapAppointmentFromDb) : [],
      communicationLogs: parsed.communicationLogs ? parsed.communicationLogs.map(mapCommunicationLogFromDb) : [],
      leadEditLogs: parsed.leadEditLogs ? parsed.leadEditLogs.map(mapLeadEditLogFromDb) : [],
      errors: parsed.errors || []
    };
  } catch (err: any) {
    return {
      users: null, leads: null, appointments: null, communicationLogs: null, leadEditLogs: null,
      errors: [err.message || String(err)]
    };
  }
}

// ==========================================
// RESILIENT INDIVIDUAL UPDATES (REST PROXIES)
// ==========================================

export async function dbUpsertUser(user: User): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/db/upsert-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mapUserToDb(user))
    });
    if (!res.ok) {
      const parsed = await res.json();
      return { success: false, error: parsed.error || `HTTP ${res.status}` };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
}

export async function dbGetUser(id: string): Promise<{ user: User | null; error?: string }> {
  try {
    const res = await fetch("/api/db/get-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    const parsed = await res.json();
    if (!res.ok) {
      return { user: null, error: parsed.error || `HTTP ${res.status}` };
    }
    return { user: parsed.user ? mapUserFromDb(parsed.user) : null };
  } catch (err: any) {
    return { user: null, error: err.message || String(err) };
  }
}

export async function dbDeleteUser(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/db/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    if (!res.ok) {
      const parsed = await res.json();
      return { success: false, error: parsed.error || `HTTP ${res.status}` };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
}

export async function dbUpsertLead(lead: Lead): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/db/upsert-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mapLeadToDb(lead))
    });
    if (!res.ok) {
      const parsed = await res.json();
      return { success: false, error: parsed.error || `HTTP ${res.status}` };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
}

export async function dbDeleteLead(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/db/delete-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    if (!res.ok) {
      const parsed = await res.json();
      return { success: false, error: parsed.error || `HTTP ${res.status}` };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
}

export async function dbUpsertAppointment(app: Appointment): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/db/upsert-appointment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mapAppointmentToDb(app))
    });
    if (!res.ok) {
      const parsed = await res.json();
      return { success: false, error: parsed.error || `HTTP ${res.status}` };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
}

export async function dbDeleteAppointment(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/db/delete-appointment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    if (!res.ok) {
      const parsed = await res.json();
      return { success: false, error: parsed.error || `HTTP ${res.status}` };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
}

export async function dbUpsertCommunicationLog(log: CommunicationLog): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/db/upsert-communication-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mapCommunicationLogToDb(log))
    });
    if (!res.ok) {
      const parsed = await res.json();
      return { success: false, error: parsed.error || `HTTP ${res.status}` };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
}

export async function dbUpsertLeadEditLog(log: LeadEditLog): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/db/upsert-lead-edit-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mapLeadEditLogToDb(log))
    });
    if (!res.ok) {
      const parsed = await res.json();
      return { success: false, error: parsed.error || `HTTP ${res.status}` };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
}

// ==========================================
// PROXY AUTHENTICATION ADAPTERS
// ==========================================

export async function dbSignUp(email: string, password: string): Promise<{ data: { user: any } | null; error?: { message: string } }> {
  try {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const parsed = await res.json();
    if (!res.ok) {
      return { data: null, error: { message: parsed.error || "Establish credentials query failed." } };
    }
    return { data: { user: parsed.user } };
  } catch (err: any) {
    return { data: null, error: { message: err.message || "Establish credentials connection exception." } };
  }
}

export async function dbSignIn(email: string, password: string): Promise<{ data: { user: any } | null; error?: { message: string } }> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const parsed = await res.json();
    if (!res.ok) {
      return { data: null, error: { message: parsed.error || "Bypass authenticate query failed." } };
    }
    return { data: { user: parsed.user } };
  } catch (err: any) {
    return { data: null, error: { message: err.message || "Bypass authenticate connection exception." } };
  }
}

export async function dbBulkUpsert(data: {
  leads?: Lead[];
  appointments?: Appointment[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = {
      users: [],
      leads: (data.leads || []).map(mapLeadToDb),
      appointments: (data.appointments || []).map(mapAppointmentToDb),
      communicationLogs: [],
      leadEditLogs: []
    };

    const res = await fetch("/api/db/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      const parsed = await res.json().catch(() => ({}));
      return { success: false, error: parsed.error || `HTTP ${res.status} push rejected` };
    }
    const parsed = await res.json();
    if (!parsed.success) {
      return { success: false, error: parsed.errors?.join(", ") || "Bulk operation failed" };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
}

