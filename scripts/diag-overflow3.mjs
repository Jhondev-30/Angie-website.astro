// Find overflow-x: scroll/auto on any element + remaining w-screen
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  pathToFileURL(
    "C:/Users/User/AppData/Roaming/npm/node_modules/playwright/index.mjs",
  ).href,
);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
await page.goto("http://localhost:4321/", { waitUntil: "networkidle" });
await page.waitForTimeout(800);

const result = await page.evaluate(() => {
  const out = { overflowScrollEls: [], fixedWEls: [], wscreens: [] };
  document.querySelectorAll("*").forEach((el) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (cs.overflowX === "scroll" || cs.overflowX === "auto") {
      out.overflowScrollEls.push({
        tag: el.tagName, id: el.id,
        cls: (el.className?.toString?.() || "").slice(0, 80),
        ovX: cs.overflowX, ovY: cs.overflowY,
        scrollW: el.scrollWidth, clientW: el.clientWidth,
      });
    }
    if (r.width > 390.5) {
      out.fixedWEls.push({
        tag: el.tagName, id: el.id,
        cls: (el.className?.toString?.() || "").slice(0, 80),
        w: Math.round(r.width),
      });
    }
  });
  return out;
});
console.log(JSON.stringify(result, null, 2));

// Also grep current source files for "w-screen"
const fs = await import("node:fs");
const files = [
  "C:/Users/User/Documents/angie-website linux/Angie-website.astro/src/pages/index.astro",
  "C:/Users/User/Documents/angie-website linux/Angie-website.astro/src/components/NavBar.astro",
  "C:/Users/User/Documents/angie-website linux/Angie-website.astro/src/styles/global.css",
];
for (const f of files) {
  if (fs.existsSync(f)) {
    const c = fs.readFileSync(f, "utf8");
    const matches = c.match(/w-screen|min-w-screen|overflow-x-scroll|overflow-x-auto/g);
    if (matches) console.log(`${f.split("/").pop()}: ${matches.join(", ")}`);
  }
}

await browser.close();
