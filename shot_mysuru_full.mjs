import { chromium } from 'playwright';
const out = 'C:/Users/HP/.gemini/antigravity/brain/c5c230c2-90b4-4fe7-b358-32b81fcbace0/';
const b = await chromium.launch();
for (const [n, w, h] of [['desktop', 1920, 1080], ['mobile', 430, 932]]) {
  const p = await b.newPage({ ignoreHTTPSErrors: true, viewport: { width: w, height: h } });
  await p.goto('https://rvcollegeofengineering.in/test/?page_id=280&v=' + Date.now(), { waitUntil: 'load', timeout: 120000 });
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0, 0); });
  await p.waitForTimeout(2000);
  console.log(n, await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, h: document.body.scrollHeight })));
  await p.screenshot({ path: out + `mysuru_check_${n}.png`, fullPage: true });
}
await b.close();

