// =============================================================================
// api/subscribe.mjs — Vercel Serverless Function
// Captures email from the /resources/ form and saves it to Supabase.
// =============================================================================
//
// Environment variables required (set in Vercel → Settings → Environment):
//   - SUPABASE_URL
//   - SUPABASE_SERVICE_ROLE_KEY
//
// Request:  POST { email: string }
// Response: 200 { ok: true, downloadUrl: string, alsoAvailable: string }
//           400 { ok: false, error: "Invalid email" }
//           500 { ok: false, error: "Server misconfigured" | "Database error" }
// =============================================================================

const PDF_URL  = "/pdfs/ALIGN_Free_Summit_PDF.pdf";
const DOCX_URL = "/pdfs/ALIGN_Free_Summit_Guide_EDITABLE...docx";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://graceafterthegrave.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function maskKey(k) {
  if (!k) return "<missing>";
  if (k.length < 12) return "***";
  return k.slice(0, 8) + "..." + k.slice(-4);
}

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

  console.log("[subscribe] env check", {
    SUPABASE_URL: supabaseUrl ? supabaseUrl : "<missing>",
    SUPABASE_SERVICE_ROLE_KEY: maskKey(supabaseKey),
    email,
  });

  if (!supabaseUrl || !supabaseKey) {
    console.error("[subscribe] env vars missing");
    res.writeHead(500, { ...corsHeaders, "Content-Type": "application/json" });
    return res.end(JSON.stringify({ ok: false, error: "Server misconfigured" }));
  }

  // Upsert: insert email, ignore if already exists.
  // Supabase returns 201 on insert, 200 on no-op upsert, 409 / 422 on conflict
  // when resolution=ignore-duplicates is NOT honored. Treat 2xx AND 409 as
  // success from the user's perspective (re-submitting an email should not fail).
  let upsertRes;
  try {
    upsertRes = await fetch(`${supabaseUrl}/rest/v1/subscribers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Prefer": "resolution=ignore-duplicates,return=minimal",
      },
      body: JSON.stringify([{ email }]),
    });
  } catch (err) {
    console.error("[subscribe] fetch to Supabase threw:", err.message);
    res.writeHead(500, { ...corsHeaders, "Content-Type": "application/json" });
    return res.end(JSON.stringify({ ok: false, error: "Database unreachable" }));
  }

  console.log("[subscribe] supabase response", {
    status: upsertRes.status,
    ok: upsertRes.ok,
    email,
  });

  // Accept 2xx OR 409 (conflict on duplicate) as success.
  if (!upsertRes.ok && upsertRes.status !== 409) {
    let body = "";
    try { body = await upsertRes.text(); } catch {}
    console.error("[subscribe] supabase error body:", body);
    res.writeHead(500, { ...corsHeaders, "Content-Type": "application/json" });
    return res.end(JSON.stringify({ ok: false, error: "Database error" }));
  }

  res.writeHead(200, { ...corsHeaders, "Content-Type": "application/json" });
  return res.end(JSON.stringify({
    ok: true,
    downloadUrl: PDF_URL,
    alsoAvailable: DOCX_URL,
  }));
}
