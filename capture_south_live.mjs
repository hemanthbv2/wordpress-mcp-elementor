import { chromium } from 'playwright';
import fs from 'node:fs';

const outDir = 'C:/Users/HP/.gemini/antigravity/brain/c5c230c2-90b4-4fe7-b358-32b81fcbace0/scratch/rvpu_south';
const artDir = 'C:/Users/HP/.gemini/antigravity/brain/c5c230c2-90b4-4fe7-b358-32b81fcbace0';
const url = 'https://rvcollegeofengineering.in/test/?page_id=380&v=' + Date.now();

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

// Test Events Carousel Next Arrow click
const evtBefore = await dPage.evaluate(() => {
  const stage = document.querySelector('.south-events-perspective-stage');
  const slots = Array.from(document.querySelectorAll('.south-evt-item')).map(el => ({
    idx: el.getAttribute('data-evt-index'),
    slot: el.getAttribute('data-slot')
  }));
  return { active: stage?.getAttribute('data-active-event'), slots };
});
await dPage.click('.south-events-next');
await dPage.waitForTimeout(650);
const evtAfter = await dPage.evaluate(() => {
  const stage = document.querySelector('.south-events-perspective-stage');
  const slots = Array.from(document.querySelectorAll('.south-evt-item')).map(el => ({
    idx: el.getAttribute('data-evt-index'),
    slot: el.getAttribute('data-slot')
  }));
  return { active: stage?.getAttribute('data-active-event'), slots };
});
console.log('Events Carousel Click Test:', { before: evtBefore.active, after: evtAfter.active, firstItemBeforeSlot: evtBefore.slots[0]?.slot, firstItemAfterSlot: evtAfter.slots[0]?.slot });

const dAudit = await dPage.evaluate(() => {
  const imgs = Array.from(document.querySelectorAll('img'));
  const broken = imgs.filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src);
  const resSec = document.querySelector('.south-results-section');
  const evtSec = document.querySelector('.south-events-section');
  return {
    totalImages: imgs.length,
    brokenCount: broken.length,
    broken,
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    scrollHeight: document.documentElement.scrollHeight,
    resultsHeight: resSec ? Math.round(resSec.getBoundingClientRect().height) : 0,
    eventsHeight: evtSec ? Math.round(evtSec.getBoundingClientRect().height) : 0
  };
});
console.log('Desktop Audit:', dAudit);

await dPage.locator('.south-results-section').screenshot({ path: `${artDir}/south_desktop_results_v2.png` });
await dPage.locator('.south-events-section').screenshot({ path: `${artDir}/south_desktop_events_v2.png` });
await dPage.screenshot({ path: `${outDir}/live_desktop_full.png`, fullPage: true });
fs.copyFileSync(`${outDir}/live_desktop_full.png`, `${artDir}/south_live_desktop_full.png`);
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
await tPage.screenshot({ path: `${artDir}/south_live_tablet_full.png`, fullPage: true });
await tCtx.close();

// 3. Mobile (430 x 932 - matching Figma 22:2)
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

const mAudit = await mPage.evaluate(() => {
  const desktopSec = document.querySelector('.south-courses-desktop-section');
  const mobileSec = document.querySelector('.south-courses-mobile-section');
  return {
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    scrollHeight: document.documentElement.scrollHeight,
    desktopCoursesDisplay: desktopSec ? getComputedStyle(desktopSec).display : 'missing',
    mobileCoursesDisplay: mobileSec ? getComputedStyle(mobileSec).display : 'missing'
  };
});
console.log('Mobile Audit (430x932):', mAudit);

await mPage.locator('.south-courses-mobile-section').screenshot({ path: `${outDir}/live_mobile_courses.png` });
fs.copyFileSync(`${outDir}/live_mobile_courses.png`, `${artDir}/south_live_mobile_courses.png`);
await mPage.locator('.south-results-section').screenshot({ path: `${artDir}/south_mobile_results_v2.png` });
await mPage.locator('.south-events-section').screenshot({ path: `${artDir}/south_mobile_events_v2.png` });
await mPage.screenshot({ path: `${outDir}/live_mobile_full.png`, fullPage: true });
fs.copyFileSync(`${outDir}/live_mobile_full.png`, `${artDir}/south_live_mobile_full.png`);
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
