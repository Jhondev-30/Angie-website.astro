// Final verification: capture services section + click each Learn more
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  pathToFileURL(
    "C:/Users/User/AppData/Roaming/npm/node_modules/playwright/index.mjs",
  ).href,
);
import { mkdirSync } from "node:fs";
const outDir = "C:/Users/User/Documents/angie-website linux/Angie-website.astro/public/assets/hero/final-verify";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
const log = (...a) => console.log("[final]", ...a);

// Cache buster: append query string
await page.goto("http://localhost:4321/?v=" + Date.now(), { waitUntil: "networkidle" });
await page.waitForTimeout(1000);

// Read all service cards
const cards = await page.locator("#services article").evaluateAll((els) =>
  els.map((el) => {
    const title = el.querySelector("h3")?.textContent?.trim();
    const link = el.querySelector("a[href*='/services/']");
    return { title, href: link?.getAttribute("href") };
  }),
);
log("service cards:", JSON.stringify(cards, null, 2));

// Scroll to services and capture
await page.evaluate(() => document.getElementById("services")?.scrollIntoView({ block: "start" }));
await page.waitForTimeout(500);
await page.screenshot({ path: `${outDir}/all-services.png`, fullPage: true });

// Click each Learn more and verify navigation
for (const card of cards) {
  if (!card.href) continue;
  await page.goto("http://localhost:4321" + card.href, { waitUntil: "networkidle" });
  log(`navigated to ${card.href} → URL: ${page.url()}, status OK`);
  await page.screenshot({ path: `${outDir}/page-${card.href.split("/").pop()}.png`, fullPage: false });
}

await browser.close();
log("done");
