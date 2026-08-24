// Capture testimonials section
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  pathToFileURL(
    "C:/Users/User/AppData/Roaming/npm/node_modules/playwright/index.mjs",
  ).href,
);
import { mkdirSync } from "node:fs";
const outDir = "C:/Users/User/Documents/angie-website linux/Angie-website.astro/public/assets/hero/testimonials";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
for (const vp of [{ name: "desktop", w: 1280, h: 900 }, { name: "mobile", w: 390, h: 844, isMobile: true }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, isMobile: vp.isMobile || false, hasTouch: vp.isMobile || false });
  const page = await ctx.newPage();
  await page.goto("http://localhost:4321/?v=" + Date.now(), { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.evaluate(() => document.getElementById("testimonials")?.scrollIntoView({ block: "start" }));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${outDir}/${vp.name}.png`, fullPage: false });
  console.log("captured", vp.name);
  await ctx.close();
}
await browser.close();
