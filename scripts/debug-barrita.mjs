// Deep debug: inspect morph-icon's rendered DOM (including shadow)
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  pathToFileURL(
    "C:/Users/User/AppData/Roaming/npm/node_modules/playwright/index.mjs",
  ).href,
);

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2,
});
const page = await context.newPage();
const log = (...a) => console.log("[barrita]", ...a);

await page.goto("http://localhost:4321/", { waitUntil: "networkidle" });
await page.waitForTimeout(800);

// Crop the area around the menu button
await page.screenshot({
  path: "C:/Users/User/Documents/angie-website linux/Angie-website.astro/public/assets/hero/navbar-mobile/button-crop.png",
  clip: { x: 130, y: 50, width: 130, height: 130 },
});

// Inspect the morph-icon deeply
const deepInfo = await page.evaluate(() => {
  const mi = document.querySelector("#menu-icon");
  if (!mi) return { error: "no morph-icon" };
  const out = {
    tag: mi.tagName,
    className: mi.className,
    id: mi.id,
    children: Array.from(mi.children).map((c) => ({
      tag: c.tagName,
      class: c.className,
      id: c.id,
      text: c.textContent?.slice(0, 50),
      style: c.getAttribute("style"),
    })),
    hasShadow: !!mi.shadowRoot,
    shadowHTML: mi.shadowRoot ? mi.shadowRoot.innerHTML : null,
    // Pseudo-elements computed
    before: getComputedStyle(mi, "::before").content,
    after: getComputedStyle(mi, "::after").content,
    // Check parent button
    parentTag: mi.parentElement?.tagName,
    parentStyle: mi.parentElement?.getAttribute("style"),
    parentClass: mi.parentElement?.className,
    parentBefore: getComputedStyle(mi.parentElement, "::before").content,
    parentAfter: getComputedStyle(mi.parentElement, "::after").content,
  };
  return out;
});
log("deep info:", JSON.stringify(deepInfo, null, 2));

// Also check if there's any element at the position of the barrita
const barritaInfo = await page.evaluate(() => {
  // The barrita appears to be around y=85-95, x=200-230 (above the icon)
  const elements = document.elementsFromPoint(217, 85);
  return elements.map((el) => ({
    tag: el.tagName,
    id: el.id,
    class: el.className,
    text: el.textContent?.slice(0, 30),
  }));
});
log("elementsFromPoint(217, 85):", JSON.stringify(barritaInfo, null, 2));

await browser.close();
