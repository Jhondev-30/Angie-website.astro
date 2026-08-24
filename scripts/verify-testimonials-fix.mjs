// Verify testimonials fix: card heights, read-more visibility, click behavior
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  pathToFileURL(
    "C:/Users/User/AppData/Roaming/npm/node_modules/playwright/index.mjs",
  ).href,
);
import { mkdirSync } from "node:fs";
const outDir = "C:/Users/User/Documents/angie-website linux/Angie-website.astro/public/assets/hero/testimonials-v2";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

await page.goto("http://localhost:4321/?v=" + Date.now(), { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.evaluate(() => document.getElementById("testimonials")?.scrollIntoView({ block: "start" }));
await page.waitForTimeout(500);

const state = await page.evaluate(() => {
  const cards = Array.from(document.querySelectorAll("#testimonials article"));
  return cards.map((c) => {
    const quote = c.querySelector(".testimonial-quote");
    const btn = c.querySelector("[data-readmore]");
    return {
      name: c.querySelector("h5")?.textContent?.trim(),
      height: Math.round(c.getBoundingClientRect().height),
      quoteClamp: quote?.classList.contains("line-clamp-4"),
      quoteScrollH: quote?.scrollHeight,
      quoteClientH: quote?.clientHeight,
      readMoreVisible: btn ? !btn.classList.contains("hidden") : null,
    };
  });
});
console.log("BEFORE CLICK:", JSON.stringify(state, null, 2));
await page.screenshot({ path: `${outDir}/01-before.png`, fullPage: false });

// Click the visible Read more (should be Yobanka)
const visibleBtn = page.locator("[data-readmore]:not(.hidden)");
const count = await visibleBtn.count();
console.log("Visible read-more buttons:", count);
if (count > 0) {
  await visibleBtn.first().click();
  await page.waitForTimeout(400);
}

const state2 = await page.evaluate(() => {
  const cards = Array.from(document.querySelectorAll("#testimonials article"));
  return cards.map((c) => {
    const quote = c.querySelector(".testimonial-quote");
    const btn = c.querySelector("[data-readmore]");
    return {
      name: c.querySelector("h5")?.textContent?.trim(),
      height: Math.round(c.getBoundingClientRect().height),
      quoteClamp: quote?.classList.contains("line-clamp-4"),
      readMoreVisible: btn ? !btn.classList.contains("hidden") : null,
    };
  });
});
console.log("AFTER CLICK:", JSON.stringify(state2, null, 2));
await page.screenshot({ path: `${outDir}/02-after-click.png`, fullPage: false });

await browser.close();
