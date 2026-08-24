// Deep overflow check: multiple viewports, all elements
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  pathToFileURL(
    "C:/Users/User/AppData/Roaming/npm/node_modules/playwright/index.mjs",
  ).href,
);

const browser = await chromium.launch();
const viewports = [
  { name: "mobile-390", width: 390, height: 844 },
  { name: "mobile-360", width: 360, height: 740 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1280", width: 1280, height: 800 },
];

for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:4321/", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  const result = await page.evaluate((vw) => {
    const html = document.documentElement;
    const body = document.body;
    const docW = html.scrollWidth;
    const bodyW = body.scrollWidth;
    const htmlOF = getComputedStyle(html).overflowX;
    const bodyOF = getComputedStyle(body).overflowX;

    // Find elements that extend beyond viewport
    const offenders = [];
    document.querySelectorAll("*").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1) {
        offenders.push({
          tag: el.tagName,
          id: el.id || null,
          cls: (el.className?.toString?.() || "").slice(0, 100),
          left: Math.round(r.left),
          right: Math.round(r.right),
          overflow: Math.round(r.right - vw),
        });
      }
    });
    offenders.sort((a, b) => b.overflow - a.overflow);

    return { vw, docW, bodyW, htmlOF, bodyOF, top5: offenders.slice(0, 5) };
  }, vp.width);

  console.log(`\n=== ${vp.name} (${vp.width}px) ===`);
  console.log(JSON.stringify(result, null, 2));
  await ctx.close();
}

await browser.close();
