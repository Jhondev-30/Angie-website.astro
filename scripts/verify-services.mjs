// Verify services section: no overflow + visual check
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  pathToFileURL(
    "C:/Users/User/AppData/Roaming/npm/node_modules/playwright/index.mjs",
  ).href,
);
import { mkdirSync } from "node:fs";

const outDir = "C:/Users/User/Documents/angie-website linux/Angie-website.astro/public/assets/hero/services";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const log = (...a) => console.log("[services]", ...a);

// Mobile
const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const mpage = await mctx.newPage();
await mpage.goto("http://localhost:4321/", { waitUntil: "networkidle" });
await mpage.waitForTimeout(1000);
const mof = await mpage.evaluate(() => ({
  vw: document.documentElement.clientWidth,
  docW: document.documentElement.scrollWidth,
}));
log("mobile overflow:", mof);
await mpage.evaluate(() => document.getElementById("services")?.scrollIntoView({ block: "start" }));
await mpage.waitForTimeout(500);
await mpage.screenshot({ path: `${outDir}/mobile-services.png`, fullPage: true });
await mctx.close();

// Desktop
const dctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const dpage = await dctx.newPage();
await dpage.goto("http://localhost:4321/", { waitUntil: "networkidle" });
await dpage.waitForTimeout(1000);
await dpage.evaluate(() => document.getElementById("services")?.scrollIntoView({ block: "start" }));
await dpage.waitForTimeout(500);
await dpage.screenshot({ path: `${outDir}/desktop-services.png`, fullPage: true });
await dctx.close();

await browser.close();
log("done");
