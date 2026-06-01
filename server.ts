import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

// Initialize backend Supabase Client, auto-correcting any misplaced/swapped keys from environment secrets
let SUPABASE_URL = (process.env.VITE_SUPABASE_URL || "https://fzsjeukjjjutiihhzjgu.supabase.co").trim();
let SUPABASE_ANON_KEY = (process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_PTNuV0AtVvNGIUKk9P6nIA_DcgGCrk1").trim();

// Swapped configuration recovery: If key got parsed as URL by mistake, reset URL to target cluster
if (SUPABASE_URL.startsWith("sb_publishable_") || SUPABASE_URL.startsWith("sb_secret_")) {
  SUPABASE_URL = "https://fzsjeukjjjutiihhzjgu.supabase.co";
}

let formattedUrl = SUPABASE_URL;
if (formattedUrl.endsWith("/rest/v1/")) {
  formattedUrl = formattedUrl.substring(0, formattedUrl.length - "/rest/v1/".length);
} else if (formattedUrl.endsWith("/rest/v1")) {
  formattedUrl = formattedUrl.substring(0, formattedUrl.length - "/rest/v1".length);
}
if (formattedUrl.endsWith("/")) {
  formattedUrl = formattedUrl.substring(0, formattedUrl.length - 1);
}
if (!formattedUrl || typeof formattedUrl !== "string" || !formattedUrl.startsWith("http")) {
  formattedUrl = "https://fzsjeukjjjutiihhzjgu.supabase.co";
}

// Create a robust server client config. We pass auth setup and override/strip origin-headers
// in case client's browser context gets forwarded, preventing the Supabase Edge Gateway
// from misidentifying our Node server as a web browser.
const supabase = createClient(formattedUrl, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    detectSessionInUrl: false
  },
  global: {
    fetch: (url, options) => {
      const headers = new Headers(options?.headers);
      headers.delete("origin");
      headers.delete("referer");
      headers.delete("sec-fetch-mode");
      headers.delete("sec-fetch-site");
      headers.delete("sec-fetch-dest");
      return fetch(url, {
        ...options,
        headers
      });
    }
  }
});

const app = express();
const PORT = 3000;

// Parse request bodies with higher limit for bulk data syncs
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Helper to safely get the Gemini API client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY is not configured or is a placeholder. Please set a valid API key in your Secrets settings.");
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// REST API Endpoints
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Endpoint to load persistent configuration settings (e.g., Google Sheet URL)
app.get("/api/settings", (req, res) => {
  const settingsPath = path.join(process.cwd(), "settings.json");
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, "utf-8");
      return res.json(JSON.parse(data));
    }
  } catch (err) {
    console.error("Failed to read settings from path:", err);
  }
  // Return safe defaults
  return res.json({
    sheetUrl: "",
    sheetRange: "Sheet1",
    autoSheetsSync: false,
    lastSheetsSynced: "Never",
    metaVerifyToken: "elite_pro_meta_verify_token_2026",
    metaAutoIngest: true,
    lastMetaSynced: "Never"
  });
});

// Endpoint to save persistent configuration settings (e.g., Google Sheet URL)
app.post("/api/settings", (req, res) => {
  const settingsPath = path.join(process.cwd(), "settings.json");
  try {
    const config = req.body || {};
    fs.writeFileSync(settingsPath, JSON.stringify(config, null, 2), "utf-8");
    return res.json({ success: true });
  } catch (err: any) {
    console.error("Failed to write settings to path:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

// Endpoint: Generate Automated Real Estate / Infrastructure Lead Follow-Up Email
app.post("/api/generate-followup", async (req, res) => {
  try {
    const { leadName, company, source, budget, recentNotes, mood } = req.body;
    
    if (!leadName) {
      return res.status(400).json({ error: "Lead name is required to draft the email." });
    }

    const ai = getGeminiClient();
    
    const prompt = `You are a Senior Infrastructure Consultant and Client Relations Director for Elite Pro (a premier commercial real estate and industrial infrastructure advisory firm).
Write a professional, personalized follow-up email to a prospective lead.

Lead Profile:
- Name: ${leadName}
- Company: ${company || "Private Investor"}
- Lead Channel Source: ${source || "Organic / Inbound channels"}
- Estimated Budget Range: ${budget || "Not Specified"}
- Latest discussion notes: ${recentNotes || "Client is seeking high-yield industrial warehousing or premium corporate office structures with seamless sustainable architecture."}
- Tone style requested: ${mood || "persuasive and authoritative"}

Email Guidelines:
- Write a professional subject line that is specific, elegant, and avoids spammy sales verbs. Use "Elite Pro Proposal Integration" or customized to their interest.
- Maintain a highly sophisticated elite, modern, advisory tone. We are Elite Pro, not a standard transactional agency.
- Reference their budget and the recent notes naturally.
- Conclude with a clear, low-friction call-to-action (e.g., proposing an advisor consultation, site alignment tour, or brief presentation deck review).
- No placeholders like [Host Name], [Date]. Use "Rajan Srivastava, Client Relations Director" as the signature.
- Provide output as a clean, formatted payload containing subject and body text.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You represent Elite Pro Client advisory. Ensure impeccable, polished business prose with clear spacing and paragraph divisions.",
        temperature: 0.7,
      }
    });

    const generatedText = response.text || "";
    
    // Parse subject and body
    let subject = "Elite Pro Follow-Up | Architectural Advisory Alignment";
    let body = generatedText;

    const subjectMatch = generatedText.match(/(?:Subject|SUBJECT|Subject Line):\s*(.*)/i);
    if (subjectMatch) {
      subject = subjectMatch[1].trim();
      body = generatedText.replace(/^(?:Subject|SUBJECT|Subject Line):.*/im, "").trim();
    }
    
    // Fallback cleanup of body templates
    body = body.replace(/^(Body|BODY|Email Body|EMAIL BODY):\s*/i, "").trim();

    return res.json({ subject, body });
  } catch (error: any) {
    console.error("Error generating email follow-up:", error);
    return res.status(500).json({ 
      error: error.message || "Failed to compile automated email follow-up. Please ensure your GEMINI_API_KEY is configured."
    });
  }
});

// Endpoint: Custom Stakeholder Executive Report Analytics
app.post("/api/generate-insights", async (req, res) => {
  try {
    const { timeRange, metricFocus, totalLeads, conversionRate, activeDealsValue, pipelineStageSummary } = req.body;
    
    const ai = getGeminiClient();

    const prompt = `You are an executive strategic analyst at Elite Pro. 
Based on our sales CRM statistics, write a formal Executive Performance & Stakeholder Forecast Report for the Board of Directors.

Key Metrics Provided:
- Reporting Period: ${timeRange || "Current Quarter"}
- Core Analytics Focus Area: ${metricFocus || "Pipeline Velocity and Capital Conversion"}
- Lead Intake: ${totalLeads || 48} new premium industrial/commercial project leads
- Pipeline Conversion Rate: ${conversionRate || "24.5%"}
- Active Pipeline Capital Valuation: ${activeDealsValue || "₹125.0 Cr"}
- Pipeline Breakdown: ${JSON.stringify(pipelineStageSummary || { New: 12, Contacted: 18, ConceptPlanning: 10, ProposalMade: 5, Won: 3 })}

Generate a sophisticated high-level business brief containing the following sections:
1. Executive Summary: High-level overview of Elite Pro performance.
2. Core Performance Highlights: Analytical reasoning of current numbers, noting our core real-estate advisory positioning.
3. Strategic Growth Recommendations & Risks: Specific infrastructure-focused suggestions to optimize capital close times.
4. Future Projections: Realistic outlook for the upcoming period.

Draft this report as a beautiful structural presentation ready to put into formal documentation. Focus on executive clarity. Return your response in clean markdown format. Do not use generic placeholders. Signature is 'Executive Analytics Team | Elite Pro'`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Ensure a pristine, formal consulting voice without promotional slang. Focus on metrics, infrastructure market growth, and strategic planning.",
        temperature: 0.5,
      }
    });

    return res.json({ markdown: response.text || "" });
  } catch (error: any) {
    console.error("Error generating insights report:", error);
    return res.status(500).json({ 
      error: error.message || "Failed to compile executive analytics report. Please verify your GEMINI_API_KEY setting."
    });
  }
});

// ===================================
// SUPABASE BACKEND PROXY ENDPOINTS
// ===================================

// Auth: SignUp
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required credentials." });
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }
    return res.json({ user: data.user, session: data.session });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "An unexpected sign up error occurred." });
  }
});

// Auth: Login / SignIn
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required credentials." });
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return res.status(error.status || 401).json({ error: error.message });
    }
    return res.json({ user: data.user, session: data.session });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "An unexpected login error occurred." });
  }
});

// Proxy endpoint to download public Google Sheet CSV exports, bypassing CORS entirely in browser environments
app.get("/api/proxy-sheet-csv", async (req, res) => {
  try {
    const { spreadsheetId, sheet } = req.query;
    if (!spreadsheetId) {
      return res.status(400).json({ error: "Spreadsheet ID is required" });
    }
    const targetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv` + 
      (sheet ? `&sheet=${encodeURIComponent(String(sheet))}` : "");
    
    // Perform standard HTTP get on backend
    const response = await fetch(targetUrl);
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Google Sheets returned HTTP ${response.status}. Please check your Google spreadsheet Share settings and confirm it is visible to 'Anyone with the link'.` 
      });
    }
    const csvContent = await response.text();
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    return res.send(csvContent);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to retrieve public spreadsheet records." });
  }
});

// ==========================================
// META ADS INTEGRATION SYSTEM & WEBHOOKS
// ==========================================

// Temporary cache of leads received via Meta Webhooks, waiting for client CRM retrieval.
let metaLeadsCache: any[] = [];
const metaLeadsPath = path.join(process.cwd(), "meta_leads_cache.json");

function loadMetaLeadsCache() {
  try {
    if (fs.existsSync(metaLeadsPath)) {
      const txt = fs.readFileSync(metaLeadsPath, "utf-8");
      metaLeadsCache = JSON.parse(txt);
    }
  } catch (err) {
    console.error("Failed to load meta leads cache:", err);
  }
}

function saveMetaLeadsCache() {
  try {
    fs.writeFileSync(metaLeadsPath, JSON.stringify(metaLeadsCache, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save meta leads cache:", err);
  }
}

// Initial load
loadMetaLeadsCache();

// Webhook GET: Meta webhook subscription verification
app.get("/api/webhooks/meta-ads", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  let verifyToken = "elite_pro_meta_verify_token_2026";
  const settingsPath = path.join(process.cwd(), "settings.json");
  try {
    if (fs.existsSync(settingsPath)) {
      const data = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
      if (data.metaVerifyToken) {
        verifyToken = data.metaVerifyToken.trim();
      }
    }
  } catch (e) {}

  if (mode === "subscribe" && token === verifyToken) {
    console.log("[Meta Webhook] Verification successful!");
    return res.status(200).send(challenge);
  } else {
    console.warn("[Meta Webhook] Verification failed. Token mismatch.");
    return res.status(403).send("Verification failed");
  }
});

// Webhook POST: Meta webhook incoming lead generation (or simulation)
app.post("/api/webhooks/meta-ads", async (req, res) => {
  try {
    console.log("[Meta Webhook] Received webhook payload:", JSON.stringify(req.body));
    const body = req.body || {};
    
    let name = "Meta Lead User";
    let email = "";
    let phone = "";
    let budget = "₹1.50 Cr";
    let location = "Noida, India";
    let projectName = "Elite Living";
    let notes = "Acquired automatically via Meta Ad Lead form.";

    // Check simulation payload
    if (body.isSimulation) {
      name = body.name || name;
      email = body.email || email;
      phone = body.phone || phone;
      budget = body.budget || budget;
      location = body.location || location;
      projectName = body.projectName || projectName;
      notes = body.notes || notes;
    } else {
      // Standard Facebook Graph Webhook Leadgen Notification format
      if (body.entry && body.entry[0] && body.entry[0].changes && body.entry[0].changes[0]) {
        const changeVal = body.entry[0].changes[0].value;
        const leadgenId = changeVal.leadgen_id || "direct_webhook";
        notes = `Meta Ads Lead Campaign. Leadgen ID: ${leadgenId}. Form ID: ${changeVal.form_id || "N/A"}.`;
        name = "Meta Lead #" + leadgenId.slice(-4);
        email = `meta_${leadgenId.slice(-4)}@elitepro-leads.com`;
        phone = "+91 99999 0" + leadgenId.slice(-4);
      } else if (body.leadgen_id) {
        name = body.name || ("Meta Lead #" + String(body.leadgen_id).slice(-4));
        email = body.email || "meta_lead@example.com";
        phone = body.phone || "+91 90000 00001";
        budget = body.budget || "₹1.20 Cr";
        location = body.location || "Noida Expressway";
        projectName = body.projectName || "Commercial Hub";
      } else {
        name = body.name || name;
        email = body.email || email;
        phone = body.phone || phone;
        budget = body.budget || budget;
        location = body.location || location;
      }
    }

    // Prepare Lead payload (consistent camelCase for frontend and map to Supabase)
    const newLead = {
      id: "lead-meta-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      name,
      company: body.campaign || "Meta Ad Campaign",
      position: "Meta Ads Lead",
      email: email || `${name.toLowerCase().replace(/\s+/g, '_')}@elitepro-leads.com`,
      phone: phone || "+91 90000 00000",
      source: "Meta Ad" as any,
      status: "Interested" as any,
      temperature: "Warm" as any,
      budget: budget || "₹1.50 Cr",
      location: location || "Noida, India",
      assignedAgent: "Pending Assignment", // Instructively unassigned to let Admin allocate manually
      notes: notes || "Meta Ads lead captured automatically via Facebook Graph integrations.",
      projectName: projectName || "Elite Residency",
      dateCreated: new Date().toISOString().split("T")[0],
      dateUpdated: new Date().toISOString().split("T")[0],
      lastCommunication: "Never",
      score: 80
    };

    // 1. Try writing directly to Supabase if connection exists
    let savedToSupabase = false;
    let supabaseErr = null;
    try {
      const dbPayload = {
        id: newLead.id,
        name: newLead.name,
        company: newLead.company,
        position: newLead.position,
        email: newLead.email,
        phone: newLead.phone,
        source: newLead.source,
        status: newLead.status,
        temperature: newLead.temperature,
        budget: newLead.budget,
        location: newLead.location,
        assigned_agent: newLead.assignedAgent,
        notes: newLead.notes,
        project_name: newLead.projectName,
        date_created: newLead.dateCreated,
        date_updated: newLead.dateUpdated,
        last_communication: newLead.lastCommunication,
        score: newLead.score
      };
      
      const { error } = await supabase.from("leads").upsert(dbPayload);
      if (!error) {
        savedToSupabase = true;
      } else {
        supabaseErr = error.message;
      }
    } catch (e: any) {
      supabaseErr = e.message || String(e);
    }

    // 2. Append to local file-based retrieval cache so the React client can immediately ingest it upon checking
    metaLeadsCache.push(newLead);
    saveMetaLeadsCache();

    // 3. Update sync timestamps in configuration
    try {
      const settingsPath = path.join(process.cwd(), "settings.json");
      if (fs.existsSync(settingsPath)) {
        const data = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
        data.lastMetaSynced = new Date().toLocaleTimeString("en-US", { hour12: true }) + " (Local)";
        fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2), "utf-8");
      }
    } catch (e) {}

    return res.json({
      success: true,
      message: "Lead processed and ingested successfully!",
      savedToSupabase,
      supabaseError: supabaseErr,
      lead: newLead
    });
  } catch (err: any) {
    console.error("[Meta Webhook Integration Error]", err);
    return res.status(500).json({ error: err.message || "Failed to process incoming Webhook lead" });
  }
});

// Endpoint: Fetch and flush Meta Ads ingested leads for CRM client syncing
app.get("/api/meta-ads/incoming-leads", (req, res) => {
  try {
    loadMetaLeadsCache();
    const flushedLeads = [...metaLeadsCache];
    
    // Clear cache immediately after retrieval to avoid duplicate ingests on frontend
    metaLeadsCache = [];
    saveMetaLeadsCache();
    
    return res.json({ leads: flushedLeads });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch ingested webhook leads cache" });
  }
});

// DB: Health / Ping / Schema Verification
app.get("/api/db/status", async (req, res) => {
  try {
    const { error: testErr } = await supabase.from("users").select("count", { count: "exact", head: true });
    
    // Check if connected and can perform handshakes (suppress authorization fail specifically as erroring the whole connection)
    const isConn = !testErr || (testErr.code !== "P0001");

    const checkTable = async (tableName: string): Promise<boolean> => {
      const { error } = await supabase.from(tableName).select("count", { count: "exact", head: true });
      return !error || (error.code !== "42P01" && error.code !== "P0001");
    };

    const status = {
      isConnected: isConn,
      tablesVerified: {
        users: isConn ? await checkTable("users") : false,
        leads: isConn ? await checkTable("leads") : false,
        appointments: isConn ? await checkTable("appointments") : false,
        communication_logs: isConn ? await checkTable("communication_logs") : false,
        lead_edit_logs: isConn ? await checkTable("lead_edit_logs") : false,
      },
      error: testErr ? `${testErr.message} (code: ${testErr.code || "N/A"})` : undefined
    };
    return res.json(status);
  } catch (err: any) {
    return res.status(500).json({
      isConnected: false,
      tablesVerified: {
        users: false, leads: false, appointments: false, communication_logs: false, lead_edit_logs: false
      },
      error: err.message
    });
  }
});

// Helper for resilient database upserts, ignoring columns that do not exist on the target Supabase table
async function resilientUpsert(tableName: string, payload: any): Promise<{ success: boolean; error?: any }> {
  let currentPayload = JSON.parse(JSON.stringify(payload));
  const removedColumns = new Set<string>();
  
  while (true) {
    const { error } = await supabase.from(tableName).upsert(currentPayload);
    if (!error) {
      return { success: true };
    }
    
    let colName: string | null = null;
    if (error.message) {
      // 1. Matches PostgREST schema cache error: "Could not find the 'active' column of 'users' in the schema cache"
      const matchSchema = error.message.match(/Could not find the '([^']+)' column/i);
      if (matchSchema && matchSchema[1]) {
        colName = matchSchema[1];
      }
      // 2. Matches PostgreSQL standard column error: column "active" of relation "users" does not exist
      if (!colName) {
        const matchDouble = error.message.match(/column "([^"]+)"/i);
        if (matchDouble && matchDouble[1]) {
          colName = matchDouble[1];
        }
      }
      // 3. Matches any variant like: column 'active' does not exist
      if (!colName) {
        const matchSingle = error.message.match(/column '([^']+)'/i);
        if (matchSingle && matchSingle[1]) {
          colName = matchSingle[1];
        }
      }
    }
    
    const isMissingColumnError = error.code === "42703" || !!colName ||
      (error.message && (
        error.message.includes("does not exist") || 
        error.message.includes("schema cache") || 
        error.message.includes("column")
      ));
      
    if (isMissingColumnError && colName) {
      if (removedColumns.has(colName)) {
        return { success: false, error };
      }
      removedColumns.add(colName);
      console.warn(`[Supabase Integration Sync] Column "${colName}" does not exist in table "${tableName}". Filtering it out and retrying.`);
      
      if (Array.isArray(currentPayload)) {
        currentPayload = currentPayload.map((item: any) => {
          const copy = { ...item };
          delete copy[colName];
          return copy;
        });
      } else {
        delete currentPayload[colName];
      }
      continue;
    }
    
    return { success: false, error };
  }
}

// DB: Push Full Bundle (Manual sync or Seed push)
app.post("/api/db/push", async (req, res) => {
  try {
    const { users, leads, appointments, communicationLogs, leadEditLogs } = req.body;
    const errors: string[] = [];

    if (users && users.length > 0) {
      const { success, error } = await resilientUpsert("users", users);
      if (!success && error) errors.push(`Users push: ${error.message || JSON.stringify(error)}`);
    }
    if (leads && leads.length > 0) {
      const { success, error } = await resilientUpsert("leads", leads);
      if (!success && error) errors.push(`Leads push: ${error.message || JSON.stringify(error)}`);
    }
    if (appointments && appointments.length > 0) {
      const { success, error } = await resilientUpsert("appointments", appointments);
      if (!success && error) errors.push(`Appointments push: ${error.message || JSON.stringify(error)}`);
    }
    if (communicationLogs && communicationLogs.length > 0) {
      const { success, error } = await resilientUpsert("communication_logs", communicationLogs);
      if (!success && error) errors.push(`Comm logs push: ${error.message || JSON.stringify(error)}`);
    }
    if (leadEditLogs && leadEditLogs.length > 0) {
      const { success, error } = await resilientUpsert("lead_edit_logs", leadEditLogs);
      if (!success && error) errors.push(`Edit logs push: ${error.message || JSON.stringify(error)}`);
    }

    return res.json({
      success: errors.length === 0,
      errors
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, errors: [err.message || String(err)] });
  }
});

// DB: Pull Full Bundle (Full pull)
app.get("/api/db/pull", async (req, res) => {
  const errors: string[] = [];
  let users: any[] | null = null;
  let leads: any[] | null = null;
  let appointments: any[] | null = null;
  let communicationLogs: any[] | null = null;
  let leadEditLogs: any[] | null = null;

  try {
    const { data, error } = await supabase.from("users").select("*");
    if (error) errors.push(`Users: ${error.message}`);
    else users = data || [];
  } catch (e: any) { errors.push(`Users pull error: ${e.message}`); }

  try {
    const { data, error } = await supabase.from("leads").select("*");
    if (error) errors.push(`Leads: ${error.message}`);
    else leads = data || [];
  } catch (e: any) { errors.push(`Leads pull error: ${e.message}`); }

  try {
    const { data, error } = await supabase.from("appointments").select("*");
    if (error) errors.push(`Appointments: ${error.message}`);
    else appointments = data || [];
  } catch (e: any) { errors.push(`Appointments pull error: ${e.message}`); }

  try {
    const { data, error } = await supabase.from("communication_logs").select("*");
    if (error) errors.push(`Comm Logs: ${error.message}`);
    else communicationLogs = data || [];
  } catch (e: any) { errors.push(`Comm logs pull error: ${e.message}`); }

  try {
    const { data, error } = await supabase.from("lead_edit_logs").select("*");
    if (error) errors.push(`Lead Edit Logs: ${error.message}`);
    else leadEditLogs = data || [];
  } catch (e: any) { errors.push(`Lead edit logs pull error: ${e.message}`); }

  return res.json({
    users,
    leads,
    appointments,
    communicationLogs,
    leadEditLogs,
    errors
  });
});

// DB: Upsert/Delete Individual Record Proxies
app.post("/api/db/upsert-user", async (req, res) => {
  try {
    const { success, error } = await resilientUpsert("users", req.body);
    if (!success) return res.status(400).json({ error: error?.message || "Upsert user failed" });
    return res.json({ success: true });
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
});

app.post("/api/db/get-user", async (req, res) => {
  try {
    const { id } = req.body;
    const { data, error } = await supabase.from("users").select("*").eq("id", id).maybeSingle();
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ user: data });
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
});

app.post("/api/db/delete-user", async (req, res) => {
  try {
    const { id } = req.body;
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true });
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
});

app.post("/api/db/upsert-lead", async (req, res) => {
  try {
    const { success, error } = await resilientUpsert("leads", req.body);
    if (!success) return res.status(400).json({ error: error?.message || "Upsert lead failed" });
    return res.json({ success: true });
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
});

app.post("/api/db/delete-lead", async (req, res) => {
  try {
    const { id } = req.body;
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true });
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
});

app.post("/api/db/upsert-appointment", async (req, res) => {
  try {
    const { success, error } = await resilientUpsert("appointments", req.body);
    if (!success) return res.status(400).json({ error: error?.message || "Upsert appointment failed" });
    return res.json({ success: true });
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
});

app.post("/api/db/delete-appointment", async (req, res) => {
  try {
    const { id } = req.body;
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true });
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
});

app.post("/api/db/upsert-communication-log", async (req, res) => {
  try {
    const { success, error } = await resilientUpsert("communication_logs", req.body);
    if (!success) return res.status(400).json({ error: error?.message || "Upsert communication log failed" });
    return res.json({ success: true });
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
});

app.post("/api/db/upsert-lead-edit-log", async (req, res) => {
  try {
    const { success, error } = await resilientUpsert("lead_edit_logs", req.body);
    if (!success) return res.status(400).json({ error: error?.message || "Upsert lead edit log failed" });
    return res.json({ success: true });
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // In dev: integrate Vite as middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In prod: serve compiled static files from dist
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Elite Pro CRM Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
