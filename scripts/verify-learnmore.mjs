// Verify the Learn more link and SERVICE label
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  pathToFileURL(
    "C:/Users/User/AppData/Roaming/npm/node_modules/playwright/index.mjs",
  ).href,
);
import { mkdirSync } from "node:fs";
const outDir = "C:/Users/User/Documents/angie-website linux/Angie-website.astro/public/assets/hero/services-v2";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
await page.goto("http://localhost:4321/", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);

// Read the href of each Learn more link
const links = await page.locator("a:has-text('Learn more')").evaluateAll((els) =>
  els.map((el) => ({ href: el.getAttribute("href"), text: el.textContent.trim() })),
);
console.log("Learn more links:", JSON.stringify(links, null, 2));

// Click the first Learn more and check it navigates
await page.evaluate(() => document.getElementById("services")?.scrollIntoView({ block: "start" }));
await page.waitForTimeout(500);
await page.screenshot({ path: `${outDir}/desktop.png`, fullPage: true });

// Test navigation
const firstHref = links[0]?.href;
if (firstHref) {
  const resp = await page.goto("http://localhost:4321" + firstHref, { waitUntil: "networkidle" });
  console.log("Navigate to", firstHref, "→ status", resp?.status());
  console.log("Final URL:", page.url());
}

await browser.close();
