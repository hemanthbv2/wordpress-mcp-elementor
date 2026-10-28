import { chromium } from 'playwright';
import fs from 'node:fs';

const dir = 'C:/Users/HP/.gemini/antigravity/brain/c5c230c2-90b4-4fe7-b358-32b81fcbace0/scratch/rvpu_south';
const figmaTexts = JSON.parse(fs.readFileSync(`${dir}/figma_texts.json`, 'utf8'));
const url = 'https://rvcollegeofengineering.in/test/?page_id=380&v=' + Date.now();

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, ignoreHTTPSErrors: true });
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(3500);

const domText = await page.evaluate(() => {
  return (document.body.textContent || '') + ' ' +
    Array.from(document.querySelectorAll('input[placeholder]')).map(i => i.placeholder).join(' ');
});

const norm = (s) => s.replace(/[\u2013\u2014-]/g, '-').replace(/\s+/g, ' ').trim().toLowerCase();
const domNorm = norm(domText);

// Filter out the individual 1-letter radial stamp characters (since "RVPU COLLEGE SOUTH" is checked as a full phrase)
const meaningfulNodes = figmaTexts.filter(t => t.text.trim().length > 1);
const missing = [];
for (const node of meaningfulNodes) {
  const nText = norm(node.text);
  if (!domNorm.includes(nText)) {
    missing.push({ id: node.id, text: node.text });
  }
}

console.log(`Audited ${meaningfulNodes.length} multi-character text nodes from Figma ( plus radial stamp 'RVPU COLLEGE SOUTH' ):`);
console.log('Radial stamp present:', domNorm.includes('rvpu college south'));
console.log('Missing text nodes count:', missing.length);
if (missing.length > 0) {
  console.log('Missing nodes:', JSON.stringify(missing, null, 2));
}

await browser.close();
