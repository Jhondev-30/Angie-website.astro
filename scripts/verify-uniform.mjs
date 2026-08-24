// Verify all 3 cards have same default height, both Read more buttons work
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  pathToFileURL(
    "C:/Users/User/AppData/Roaming/npm/node_modules/playwright/index.mjs",
  ).href,
);
import { mkdirSync } from "node:fs";
const outDir = "C:/Users/User/Documents/angie-website linux/Angie-website.astro/public/assets/hero/testimonials-v3";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
await page.goto("http://localhost:4321/?v=" + Date.now(), { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.evaluate(() => document.getElementById("testimonials")?.scrollIntoView({ block: "start" }));
await page.waitForTimeout(300);

const state = async (label) => {
  const cards = await page.evaluate(() =>
    Array.from(document.querySelectorAll("#testimonials article")).map((c) => ({
      name: c.querySelector("h5")?.textContent?.trim(),
      height: Math.round(c.getBoundingClientRect().height),
      readMoreVisible: c.querySelector("[data-readmore]")
        ? !c.querySelector("[data-readmore]").classList.contains("hidden")
        : null,
    }))
  );
  console.log(label, JSON.stringify(cards, null, 2));
};

await state("INITIAL     ");
await page.screenshot({ path: `${outDir}/01-initial.png`, fullPage: false });

// Click both Read more buttons
const buttons = page.locator("[data-readmore]:not(.hidden)");
const count = await buttons.count();
console.log("Visible read-more buttons:", count);

for (let i = 0; i < count; i++) {
  await buttons.nth(i).click();
  await page.waitForTimeout(300);
}

await state("ALL EXPANDED");
await page.screenshot({ path: `${outDir}/02-all-expanded.png`, fullPage: false });

await browser.close();
