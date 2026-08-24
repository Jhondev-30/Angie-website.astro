// Verify hero CTAs are hidden on load, visible after scroll
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  pathToFileURL(
    "C:/Users/User/AppData/Roaming/npm/node_modules/playwright/index.mjs",
  ).href,
);
import { mkdirSync } from "node:fs";
const outDir = "C:/Users/User/Documents/angie-website linux/Angie-website.astro/public/assets/hero/cta-reveal";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

await page.goto("http://localhost:4321/?v=" + Date.now(), { waitUntil: "networkidle" });
await page.waitForTimeout(500);

async function getState() {
  return await page.evaluate(() => {
    const social = document.getElementById("hero-social");
    const cta = document.getElementById("hero-cta");
    const cs = (el) => {
      if (!el) return null;
      const s = getComputedStyle(el);
      return { opacity: s.opacity, transform: s.transform, visibility: s.visibility };
    };
    return {
      bodyClass: document.body.className,
      scrollY: window.scrollY,
      social: cs(social),
      cta: cs(cta),
    };
  });
}

console.log("=== INITIAL (scrollY=0) ===");
console.log(JSON.stringify(await getState(), null, 2));
await page.screenshot({ path: `${outDir}/01-initial.png`, clip: { x: 0, y: 0, width: 1280, height: 800 } });

await page.evaluate(() => window.scrollTo({ top: 80, behavior: "instant" }));
await page.waitForTimeout(700);
console.log("\n=== AFTER SCROLL 80px ===");
console.log(JSON.stringify(await getState(), null, 2));
await page.screenshot({ path: `${outDir}/02-scrolled.png`, clip: { x: 0, y: 0, width: 1280, height: 800 } });

await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
await page.waitForTimeout(700);
console.log("\n=== BACK TO TOP ===");
console.log(JSON.stringify(await getState(), null, 2));
await page.screenshot({ path: `${outDir}/03-back-to-top.png`, clip: { x: 0, y: 0, width: 1280, height: 800 } });

await browser.close();
