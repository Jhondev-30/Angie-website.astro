// Diagnostico: encontrar qué elemento causa overflow horizontal
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
await page.goto("http://localhost:4321/", { waitUntil: "networkidle" });
await page.waitForTimeout(800);

const result = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const docW = document.documentElement.scrollWidth;
  const bodyW = document.body.scrollWidth;
  const offenders = [];

  // Buscar todos los elementos cuyo right edge > vw
  document.querySelectorAll("*").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.right > vw + 1 || r.left < -1) {
      offenders.push({
        tag: el.tagName,
        id: el.id || null,
        cls: (el.className?.toString?.() || "").slice(0, 80),
        left: Math.round(r.left),
        right: Math.round(r.right),
        width: Math.round(r.width),
        overflow: Math.round(r.right - vw),
      });
    }
  });

  // Top 15 más ofensores
  offenders.sort((a, b) => b.overflow - a.overflow);

  return {
    vw,
    docW,
    bodyW,
    hasHOverflow: docW > vw,
    top15: offenders.slice(0, 15),
  };
});

console.log(JSON.stringify(result, null, 2));

await browser.close();
