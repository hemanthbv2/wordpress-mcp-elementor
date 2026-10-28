import { chromium } from 'playwright';
import fs from 'node:fs';

const outDir = 'C:/Users/HP/.gemini/antigravity/brain/c5c230c2-90b4-4fe7-b358-32b81fcbace0/scratch/rvpu_north';
const artDir = 'C:/Users/HP/.gemini/antigravity/brain/c5c230c2-90b4-4fe7-b358-32b81fcbace0';
const url = 'https://rvcollegeofengineering.in/test/?page_id=433&v=' + Date.now();
const figmaTexts = JSON.parse(fs.readFileSync(`${outDir}/figma_texts.json`, 'utf8'));

const browser = await chromium.launch({ headless: true });

// 1. Desktop (1920 x 1080)
const dCtx = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  ignoreHTTPSErrors: true
});
const dPage = await dCtx.newPage();
await dPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await dPage.waitForTimeout(4000);

await dPage.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 800) {
    window.scrollTo(0, y);
    await new Promise(r => setTimeout(r, 120));
  }
  window.scrollTo(0, 0);
});
await dPage.waitForTimeout(1200);

// Audit images, overflow, and all 65 Figma text nodes
const dAudit = await dPage.evaluate((expectedTexts) => {
  const imgs = Array.from(document.querySelectorAll('img'));
  const broken = imgs.filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src);
  const fullText = (document.body.textContent || '').replace(/\s+/g, ' ').toLowerCase();

  const missingTexts = [];
  for (const item of expectedTexts) {
    const clean = (item.characters || '').replace(/\s+/g, ' ').trim().toLowerCase();
    if (!clean) continue;
    if (!fullText.includes(clean)) {
      missingTexts.push({ id: item.id, name: item.name, text: item.characters });
    }
  }

  const resSec = document.querySelector('.north-results-section');
  const evtSec = document.querySelector('.north-events-section');
  const crsSec = document.querySelector('.north-courses-section');

  const allWidgets = Array.from(document.querySelectorAll('.elementor-widget'));
  const missingWidgetTypes = allWidgets
    .filter(w => !w.getAttribute('data-widget_type'))
    .map(w => w.className);
  const widgetTypeCounts = {};
  for (const w of allWidgets) {
    const wt = w.getAttribute('data-widget_type') || 'MISSING';
    widgetTypeCounts[wt] = (widgetTypeCounts[wt] || 0) + 1;
  }

  return {
    totalImages: imgs.length,
    brokenCount: broken.length,
    broken,
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    scrollHeight: document.documentElement.scrollHeight,
    coursesHeight: crsSec ? Math.round(crsSec.getBoundingClientRect().height) : 0,
    resultsHeight: resSec ? Math.round(resSec.getBoundingClientRect().height) : 0,
    eventsHeight: evtSec ? Math.round(evtSec.getBoundingClientRect().height) : 0,
    totalFigmaTexts: expectedTexts.length,
    missingTextCount: missingTexts.length,
    missingTexts,
    totalElementorWidgets: allWidgets.length,
    missingWidgetTypeCount: missingWidgetTypes.length,
    widgetTypeCounts
  };
}, figmaTexts);

console.log('Desktop Audit:', JSON.stringify(dAudit, null, 2));

// Capture Desktop full page & key sections BEFORE clicking Events next
await dPage.locator('.north-courses-section').screenshot({ path: `${artDir}/north_desktop_courses.png` });
await dPage.locator('.north-results-section').screenshot({ path: `${artDir}/north_desktop_results.png` });
await dPage.locator('.north-expand-section').screenshot({ path: `${artDir}/north_desktop_expand.png` });
await dPage.locator('.north-events-section').screenshot({ path: `${artDir}/north_desktop_events.png` });
await dPage.screenshot({ path: `${outDir}/live_desktop_full.png`, fullPage: true });
fs.copyFileSync(`${outDir}/live_desktop_full.png`, `${artDir}/north_live_desktop_full.png`);

// Test Events Carousel Next Arrow click
const evtBefore = await dPage.evaluate(() => {
  const stage = document.querySelector('.north-events-right-col');
  const items = Array.from(document.querySelectorAll('.north-evt-slide')).map(el => ({
    idx: el.getAttribute('data-evt-idx'),
    expanded: el.classList.contains('is-expanded'),
    width: Math.round(el.getBoundingClientRect().width)
  }));
  return { active: stage?.getAttribute('data-active-slide'), items };
});
await dPage.click('.north-events-next');
await dPage.waitForTimeout(700);
const evtAfter = await dPage.evaluate(() => {
  const stage = document.querySelector('.north-events-right-col');
  const items = Array.from(document.querySelectorAll('.north-evt-slide')).map(el => ({
    idx: el.getAttribute('data-evt-idx'),
    expanded: el.classList.contains('is-expanded'),
    width: Math.round(el.getBoundingClientRect().width)
  }));
  return { active: stage?.getAttribute('data-active-slide'), items };
});
console.log('Events Carousel Click Test:', JSON.stringify({ before: evtBefore, after: evtAfter }, null, 2));

await dCtx.close();

// 2. Tablet (768 x 1024)
const tCtx = await browser.newContext({
  viewport: { width: 768, height: 1024 },
  ignoreHTTPSErrors: true
});
const tPage = await tCtx.newPage();
await tPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await tPage.waitForTimeout(3000);
await tPage.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 700) {
    window.scrollTo(0, y);
    await new Promise(r => setTimeout(r, 100));
  }
  window.scrollTo(0, 0);
});
await tPage.waitForTimeout(1000);

const tAudit = await tPage.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
  scrollHeight: document.documentElement.scrollHeight
}));
console.log('Tablet Audit (768x1024):', tAudit);
await tPage.screenshot({ path: `${artDir}/north_live_tablet_full.png`, fullPage: true });
await tCtx.close();

// 3. Mobile (430 x 932)
const mCtx = await browser.newContext({
  viewport: { width: 430, height: 932 },
  ignoreHTTPSErrors: true
});
const mPage = await mCtx.newPage();
await mPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await mPage.waitForTimeout(3000);
await mPage.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 600) {
    window.scrollTo(0, y);
    await new Promise(r => setTimeout(r, 100));
  }
  window.scrollTo(0, 0);
});
await mPage.waitForTimeout(1200);

const mAudit = await mPage.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
  scrollHeight: document.documentElement.scrollHeight
}));
console.log('Mobile Audit (430x932):', mAudit);

await mPage.locator('.north-courses-section').screenshot({ path: `${artDir}/north_mobile_courses.png` });
await mPage.locator('.north-results-section').screenshot({ path: `${artDir}/north_mobile_results.png` });
await mPage.locator('.north-events-section').screenshot({ path: `${artDir}/north_mobile_events.png` });
await mPage.screenshot({ path: `${outDir}/live_mobile_full.png`, fullPage: true });
fs.copyFileSync(`${outDir}/live_mobile_full.png`, `${artDir}/north_live_mobile_full.png`);
await mCtx.close();

// 4. Compact Mobile (375 x 812)
const sCtx = await browser.newContext({
  viewport: { width: 375, height: 812 },
  ignoreHTTPSErrors: true
});
const sPage = await sCtx.newPage();
await sPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await sPage.waitForTimeout(2500);
const sAudit = await sPage.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth
}));
console.log('Small Mobile Audit (375x812):', sAudit);
await sCtx.close();

await browser.close();
