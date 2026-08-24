// Debug: check computed styles of the quote element
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

const info = await page.evaluate(() => {
  const quote = document.querySelector("#testimonials article:nth-child(2) .testimonial-quote");
  if (!quote) return { error: "not found" };
  const cs = getComputedStyle(quote);
  return {
    className: quote.className,
    display: cs.display,
    webkitLineClamp: cs.webkitLineClamp,
    webkitBoxOrient: cs.webkitBoxOrient,
    overflow: cs.overflow,
    height: cs.height,
    scrollHeight: quote.scrollHeight,
    clientHeight: quote.clientHeight,
    textContent: quote.textContent?.slice(0, 100) + "...",
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
