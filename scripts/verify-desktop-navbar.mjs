// Quick desktop regression check
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  pathToFileURL(
    "C:/Users/User/AppData/Roaming/npm/node_modules/playwright/index.mjs",
  ).href,
);
import { mkdirSync } from "node:fs";

const outDir = "C:/Users/User/Documents/angie-website linux/Angie-website.astro/public/assets/hero/navbar-desktop";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
});
const page = await context.newPage();
const log = (...a) => console.log("[desktop]", ...a);

await page.goto("http://localhost:4321/", { waitUntil: "networkidle" });
await page.waitForTimeout(800);

// Desktop: menu should be visible by default
const menuBox = await page.locator("#mobile-menu").evaluate((el) => {
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  return {
    display: cs.display,
    width: r.width,
    height: r.height,
    position: cs.position,
    dataOpen: el.dataset.open,
  };
});
log("desktop menu:", menuBox);

await page.screenshot({
  path: `${outDir}/01-default.png`,
  fullPage: false,
});

// Hover services
await page.locator("#services-btn").hover();
await page.waitForTimeout(400);
const dropdownBox = await page.locator("#services-menu").evaluate((el) => {
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  return {
    opacity: cs.opacity,
    visibility: cs.visibility,
    width: r.width,
    height: r.height,
    x: r.x,
    y: r.y,
  };
});
log("desktop dropdown on hover:", dropdownBox);
await page.screenshot({
  path: `${outDir}/02-services-hover.png`,
  fullPage: false,
});

await browser.close();
