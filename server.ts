import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Parse request bodies
app.use(express.json());

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

// Endpoint: Generate Automated Real Estate / Infrastructure Lead Follow-Up Email
app.post("/api/generate-followup", async (req, res) => {
  try {
    const { leadName, company, source, budget, recentNotes, mood } = req.body;
    
    if (!leadName) {
      return res.status(400).json({ error: "Lead name is required to draft the email." });
    }

    const ai = getGeminiClient();
    
    const prompt = `You are a Senior Infrastructure Consultant and Client Relations Director for Elite Pro Infra (a premier commercial real estate and industrial infrastructure advisory firm).
Write a professional, personalized follow-up email to a prospective lead.

Lead Profile:
- Name: ${leadName}
- Company: ${company || "Private Investor"}
- Lead Channel Source: ${source || "Organic / Inbound channels"}
- Estimated Budget Range: ${budget || "Not Specified"}
- Latest discussion notes: ${recentNotes || "Client is seeking high-yield industrial warehousing or premium corporate office structures with seamless sustainable architecture."}
- Tone style requested: ${mood || "persuasive and authoritative"}

Email Guidelines:
- Write a professional subject line that is specific, elegant, and avoids spammy sales verbs. Use "Elite Pro Infra Proposal Integration" or customized to their interest.
- Maintain a highly sophisticated elite, modern, advisory tone. We are Elite Pro Infra, not a standard transactional agency.
- Reference their budget and the recent notes naturally.
- Conclude with a clear, low-friction call-to-action (e.g., proposing an advisor consultation, site alignment tour, or brief presentation deck review).
- No placeholders like [Host Name], [Date]. Use "Rajan Srivastava, Client Relations Director" as the signature.
- Provide output as a clean, formatted payload containing subject and body text.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You represent Elite Pro Infra Client advisory. Ensure impeccable, polished business prose with clear spacing and paragraph divisions.",
        temperature: 0.7,
      }
    });

    const generatedText = response.text || "";
    
    // Parse subject and body
    let subject = "Elite Pro Infra Follow-Up | Architectural Advisory Alignment";
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

    const prompt = `You are an executive strategic analyst at Elite Pro Infra. 
Based on our sales CRM statistics, write a formal Executive Performance & Stakeholder Forecast Report for the Board of Directors.

Key Metrics Provided:
- Reporting Period: ${timeRange || "Current Quarter"}
- Core Analytics Focus Area: ${metricFocus || "Pipeline Velocity and Capital Conversion"}
- Lead Intake: ${totalLeads || 48} new premium industrial/commercial project leads
- Pipeline Conversion Rate: ${conversionRate || "24.5%"}
- Active Pipeline Capital Valuation: ${activeDealsValue || "₹125.0 Cr"}
- Pipeline Breakdown: ${JSON.stringify(pipelineStageSummary || { New: 12, Contacted: 18, ConceptPlanning: 10, ProposalMade: 5, Won: 3 })}

Generate a sophisticated high-level business brief containing the following sections:
1. Executive Summary: High-level overview of Elite Pro Infra performance.
2. Core Performance Highlights: Analytical reasoning of current numbers, noting our core real-estate advisory positioning.
3. Strategic Growth Recommendations & Risks: Specific infrastructure-focused suggestions to optimize capital close times.
4. Future Projections: Realistic outlook for the upcoming period.

Draft this report as a beautiful structural presentation ready to put into formal documentation. Focus on executive clarity. Return your response in clean markdown format. Do not use generic placeholders. Signature is 'Executive Analytics Team | Elite Pro Infra'`;

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
