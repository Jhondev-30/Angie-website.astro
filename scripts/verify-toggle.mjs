// Verify Read more / Read less toggle
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  pathToFileURL(
    "C:/Users/User/AppData/Roaming/npm/node_modules/playwright/index.mjs",
  ).href,
);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
await page.goto("http://localhost:4321/?v=" + Date.now(), { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.evaluate(() => document.getElementById("testimonials")?.scrollIntoView({ block: "start" }));
await page.waitForTimeout(300);

const btn = page.locator("[data-readmore]:not(.hidden)");

const state = async (label) => {
  const s = await page.evaluate(() => {
    const q = document.querySelector(".testimonial-quote");
    const b = document.querySelector("[data-readmore]");
    return {
      text: b?.textContent?.trim(),
      expanded: q?.dataset.expanded,
      display: getComputedStyle(q).display,
      lineClamp: getComputedStyle(q).webkitLineClamp,
      height: Math.round(q?.getBoundingClientRect().height || 0),
    };
  });
  console.log(label, s);
};

await state("INITIAL     ");

await btn.click();
await page.waitForTimeout(300);
await state("1st CLICK  ");

await btn.click();
await page.waitForTimeout(300);
await state("2nd CLICK  ");

await btn.click();
await page.waitForTimeout(300);
await state("3rd CLICK  ");

await browser.close();
