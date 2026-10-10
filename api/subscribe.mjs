// =============================================================================
// api/subscribe.mjs — Vercel Serverless Function
// Captures email from the /resources/ form and saves it to Supabase.
// =============================================================================
//
// Environment variables (set in Vercel → Settings → Environment):
//   Required for persistence:
//   - SUPABASE_URL
//   - SUPABASE_SERVICE_ROLE_KEY
//   Optional fallback (emails the lead to you when the DB is unavailable):
//   - RESEND_API_KEY
//   - LEAD_NOTIFY_EMAIL
//   - RESEND_FROM  (defaults to "Website <onboarding@resend.dev>")
//
// Request:  POST { email: string }
// Response: 200 { ok: true, saved: boolean, downloadUrl: string, alsoAvailable: string }
//           400 { ok: false, error: "Invalid email" }
//
// Database problems (paused project, timeout, 5xx, missing env) are handled
// silently: the response is still 200 so the user can always download.
// =============================================================================

const PDF_URL  = "/pdfs/ALIGN_Free_Summit_PDF.pdf";
const DOCX_URL = "/pdfs/ALIGN_Free_Summit_Guide_EDITABLE...docx";
const SUPABASE_TIMEOUT_MS = 4000;
const RESEND_TIMEOUT_MS = 4000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://graceafterthegrave.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders);
    return res.end();
  }
  if (req.method !== "POST") {
    res.writeHead(405, { ...corsHeaders, "Content-Type": "application/json" });
    return res.end(JSON.stringify({ ok: false, error: "Method not allowed" }));
  }

  // Parse body
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  // Honeypot anti-spam (bots fill this, humans don't).
  // Pretend success without touching Supabase.
  if (body.company) {
    console.log("[subscribe] honeypot triggered, skipping DB write");
    res.writeHead(200, { ...corsHeaders, "Content-Type": "application/json" });
    return res.end(JSON.stringify({ ok: true, downloadUrl: PDF_URL, alsoAvailable: DOCX_URL, _honeypot: true }));
  }

  const email = (body.email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    console.log("[subscribe] invalid email format:", JSON.stringify(email));
    res.writeHead(400, { ...corsHeaders, "Content-Type": "application/json" });
    return res.end(JSON.stringify({ ok: false, error: "Invalid email" }));
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let saved = false;
  let failReason = "";

  if (!supabaseUrl || !supabaseKey) {
    failReason = "supabase env vars missing";
  } else {
    // Insert; 2xx and 409 (duplicate) both count as success.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SUPABASE_TIMEOUT_MS);
    try {
      const upsertRes = await fetch(`${supabaseUrl}/rest/v1/subscribers`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Prefer": "resolution=ignore-duplicates,return=minimal",
        },
        body: JSON.stringify([{ email }]),
      });
      console.log("[subscribe] supabase response", { status: upsertRes.status, ok: upsertRes.ok });
      if (upsertRes.ok || upsertRes.status === 409) {
        saved = true;
      } else {
        failReason = `supabase status ${upsertRes.status}`;
      }
    } catch (err) {
      failReason = err.name === "AbortError"
        ? "supabase timeout"
        : `supabase unreachable: ${err.message}`;
    } finally {
      clearTimeout(timer);
    }
  }

  if (!saved) {
    console.error("[subscribe] DB save failed, using fallback:", failReason);
    await notifyViaResend(email, failReason);
  }

  res.writeHead(200, { ...corsHeaders, "Content-Type": "application/json" });
  return res.end(JSON.stringify({
    ok: true,
    saved,
    downloadUrl: PDF_URL,
    alsoAvailable: DOCX_URL,
  }));
}

// Emails the lead to the site owner so it is not lost while Supabase is down.
// Never throws: a failing fallback must not break the download.
async function notifyViaResend(email, reason) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFY_EMAIL;
  if (!apiKey || !to) {
    console.error("[subscribe] Resend not configured; lead NOT persisted:", email);
    return;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RESEND_TIMEOUT_MS);
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "Website <onboarding@resend.dev>",
        to: [to],
        subject: "New A.L.I.G.N. lead (database unavailable)",
        text: `Email: ${email}\nWhy the DB save failed: ${reason}\n\nAdd this subscriber manually once Supabase is back.`,
      }),
    });
    if (!r.ok) console.error("[subscribe] Resend error status:", r.status);
  } catch (err) {
    console.error("[subscribe] Resend fallback failed:", err.message);
  } finally {
    clearTimeout(timer);
  }
}
