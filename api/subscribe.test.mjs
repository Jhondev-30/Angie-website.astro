// Tests for api/subscribe.mjs — run with `pnpm test` (node:test, no deps).
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import handler from "./subscribe.mjs";

const realFetch = globalThis.fetch;
const ENV_KEYS = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "RESEND_API_KEY", "LEAD_NOTIFY_EMAIL", "RESEND_FROM"];
let savedEnv;
let calls;

function makeRes() {
  return {
    status: 0,
    body: null,
    writeHead(code) { this.status = code; },
    end(payload) { this.body = payload ? JSON.parse(payload) : null; },
  };
}

async function post(body) {
  const res = makeRes();
  await handler({ method: "POST", body }, res);
  return res;
}

// Routes fetch by hostname so each test can script Supabase / Resend behavior.
function mockFetch({ supabase, resend }) {
  globalThis.fetch = async (url, opts) => {
    calls.push({ url: String(url), opts });
    const target = String(url).includes("api.resend.com") ? resend : supabase;
    return target(url, opts);
  };
}

const ok = (status = 201) => async () => ({ ok: status < 300, status });

beforeEach(() => {
  savedEnv = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
  delete process.env.RESEND_API_KEY;
  delete process.env.LEAD_NOTIFY_EMAIL;
  calls = [];
});

afterEach(() => {
  globalThis.fetch = realFetch;
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  }
});

test("rejects an invalid email with 400", async () => {
  mockFetch({ supabase: ok() });
  const res = await post({ email: "not-an-email" });
  assert.equal(res.status, 400);
  assert.equal(res.body.ok, false);
  assert.equal(calls.length, 0);
});

test("honeypot skips the database and still returns ok", async () => {
  mockFetch({ supabase: ok() });
  const res = await post({ email: "a@b.co", company: "Spam Inc" });
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
  assert.equal(calls.length, 0);
});

test("saves the lead and reports saved:true", async () => {
  mockFetch({ supabase: ok(201) });
  const res = await post({ email: "  Person@Example.COM " });
  assert.equal(res.status, 200);
  assert.equal(res.body.saved, true);
  assert.equal(JSON.parse(calls[0].opts.body)[0].email, "person@example.com");
});

test("treats 409 duplicate as success", async () => {
  mockFetch({ supabase: ok(409) });
  const res = await post({ email: "a@b.co" });
  assert.equal(res.status, 200);
  assert.equal(res.body.saved, true);
});

test("DB 5xx still returns ok with download links (saved:false)", async () => {
  mockFetch({ supabase: ok(503) });
  const res = await post({ email: "a@b.co" });
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
  assert.equal(res.body.saved, false);
  assert.match(res.body.downloadUrl, /\.pdf$/);
});

test("DB network error still returns ok", async () => {
  mockFetch({ supabase: async () => { throw new Error("ECONNREFUSED"); } });
  const res = await post({ email: "a@b.co" });
  assert.equal(res.status, 200);
  assert.equal(res.body.saved, false);
});

test("missing Supabase env vars still returns ok", async () => {
  delete process.env.SUPABASE_URL;
  mockFetch({ supabase: ok() });
  const res = await post({ email: "a@b.co" });
  assert.equal(res.status, 200);
  assert.equal(res.body.saved, false);
  assert.equal(calls.length, 0);
});

test("emails the lead via Resend when the DB fails and Resend is configured", async () => {
  process.env.RESEND_API_KEY = "re_test";
  process.env.LEAD_NOTIFY_EMAIL = "owner@example.com";
  mockFetch({ supabase: ok(500), resend: ok(200) });
  const res = await post({ email: "lead@example.com" });
  assert.equal(res.status, 200);
  const resendCall = calls.find((c) => c.url.includes("api.resend.com"));
  assert.ok(resendCall, "expected a Resend call");
  const payload = JSON.parse(resendCall.opts.body);
  assert.deepEqual(payload.to, ["owner@example.com"]);
  assert.match(payload.text, /lead@example\.com/);
});

test("does not call Resend when the DB save succeeds", async () => {
  process.env.RESEND_API_KEY = "re_test";
  process.env.LEAD_NOTIFY_EMAIL = "owner@example.com";
  mockFetch({ supabase: ok(201), resend: ok(200) });
  await post({ email: "a@b.co" });
  assert.equal(calls.some((c) => c.url.includes("api.resend.com")), false);
});

test("non-string email (number, array, object) is a 400, not a 500", async () => {
  mockFetch({ supabase: ok() });
  for (const email of [123, ["a@b.co"], { a: 1 }, null]) {
    const res = await post({ email });
    assert.equal(res.status, 400, `email=${JSON.stringify(email)}`);
    assert.equal(res.body.ok, false);
  }
  assert.equal(calls.length, 0);
});

test("responds before the Resend fallback finishes", async () => {
  process.env.RESEND_API_KEY = "re_test";
  process.env.LEAD_NOTIFY_EMAIL = "owner@example.com";
  const order = [];
  mockFetch({
    supabase: ok(500),
    resend: async () => {
      await new Promise((r) => setTimeout(r, 30));
      order.push("resend-done");
      return { ok: true, status: 200 };
    },
  });
  const res = makeRes();
  const realEnd = res.end.bind(res);
  res.end = (payload) => { order.push("responded"); realEnd(payload); };
  await handler({ method: "POST", body: { email: "a@b.co" } }, res);
  assert.deepEqual(order, ["responded", "resend-done"]);
  assert.equal(res.status, 200);
});

test("logs LEAD_LOST when the DB fails and Resend is not configured", async () => {
  mockFetch({ supabase: ok(500) });
  const logged = [];
  const realError = console.error;
  console.error = (...args) => logged.push(args.join(" "));
  try {
    const res = await post({ email: "lost@example.com" });
    assert.equal(res.status, 200);
    assert.equal(res.body.saved, false);
  } finally {
    console.error = realError;
  }
  assert.ok(logged.some((l) => l.includes("LEAD_LOST") && l.includes("lost@example.com")));
});

test("a failing Resend call never breaks the download", async () => {
  process.env.RESEND_API_KEY = "re_test";
  process.env.LEAD_NOTIFY_EMAIL = "owner@example.com";
  mockFetch({
    supabase: ok(500),
    resend: async () => { throw new Error("resend down"); },
  });
  const res = await post({ email: "a@b.co" });
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
});
