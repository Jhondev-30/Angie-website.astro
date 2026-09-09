// =============================================================================
// api/subscribe.mjs — Vercel Serverless Function
// Captures email from the /resources/ form and saves it to Supabase.
// Returns { downloadUrl } so the browser can trigger the PDF/DOCX download.
// =============================================================================
//
// Environment variables required (set in Vercel → Settings → Environment):
//   - SUPABASE_URL
//   - SUPABASE_SERVICE_ROLE_KEY
//
// Request:  POST { email: string }
// Response: 200 { ok: true, downloadUrl: string }
//           400 { ok: false, error: "Invalid email" }
//           500 { ok: false, error: "Server misconfigured" }
// =============================================================================

const PDF_URL  = "/pdfs/ALIGN_Free_Summit_PDF.pdf";
const DOCX_URL = "/pdfs/ALIGN_Free_Summit_Guide_EDITABLE...docx";
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

  // Honeypot anti-spam (bots fill this, humans don't)
  if (body.company) {
    // Pretend success and skip everything
    res.writeHead(200, { ...corsHeaders, "Content-Type": "application/json" });
    return res.end(JSON.stringify({ ok: true, downloadUrl: PDF_URL }));
  }

  const email = (body.email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    res.writeHead(400, { ...corsHeaders, "Content-Type": "application/json" });
    return res.end(JSON.stringify({ ok: false, error: "Invalid email" }));
  }

  const supabaseUrl  = process.env.SUPABASE_URL;
  const supabaseKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    res.writeHead(500, { ...corsHeaders, "Content-Type": "application/json" });
    return res.end(JSON.stringify({ ok: false, error: "Server misconfigured" }));
  }

  // Upsert: insert email, ignore if already exists.
  // Supabase PostgREST returns 201 on insert, 409 / 200 with empty rows on
  // conflict. We use `Prefer: resolution=ignore-duplicates` to silently skip.
  const upsertRes = await fetch(`${supabaseUrl}/rest/v1/subscribers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
      "Prefer": "resolution=ignore-duplicates,return=minimal",
    },
    body: JSON.stringify([{ email }]),
  });

  // Return success either way — user shouldn't be blocked by a re-submit.
  // The PDF URL is the default. The DOCX is also available in the success modal.
  res.writeHead(200, { ...corsHeaders, "Content-Type": "application/json" });
  return res.end(JSON.stringify({
    ok: true,
    downloadUrl: PDF_URL,
    alsoAvailable: DOCX_URL,
  }));
}
