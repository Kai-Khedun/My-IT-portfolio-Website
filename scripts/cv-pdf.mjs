// Prints the /cv page to public/cv/Kaiyur-Khedun-CV.pdf (A4, one page), which turns on the Download button.
// Start the site first (npm run dev, or npm run build && npm start), then: npm run cv:pdf [url]
// Uses the installed Microsoft Edge; set PW_CHANNEL=chrome to use Chrome instead.
import { chromium } from "@playwright/test";

const url = process.argv[2] ?? "http://localhost:3000/cv";
const out = "public/cv/Kaiyur-Khedun-CV.pdf";

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || "msedge" });
const page = await browser.newPage();
await page.goto(url, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.emulateMedia({ media: "print" });
await page.pdf({ path: out, format: "A4", printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log(`Saved ${out} from ${url}`);
