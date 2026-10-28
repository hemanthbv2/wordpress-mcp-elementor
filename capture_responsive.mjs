import { chromium } from 'playwright';

async function capture() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--ignore-certificate-errors', '--disable-web-security']
  });

  const url = 'https://rvcollegeofengineering.in/test/?page_id=280&nocache=' + Date.now();

  // 1. Mobile Capture (390 x 844)
  console.log('Capturing Mobile view...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
  await mobilePage.waitForTimeout(4000);

  const mobileFull = 'C:/Users/HP/.gemini/antigravity/brain/c5c230c2-90b4-4fe7-b358-32b81fcbace0/scratch/rvpu_mysuru/live_mobile_full.png';
  await mobilePage.screenshot({ path: mobileFull, fullPage: true });
  console.log('Saved Mobile Full screenshot to:', mobileFull);

  const coursesMobileEl = await mobilePage.$('.mysuru-courses-mobile-section');
  if (coursesMobileEl) {
    const coursesMobileCrop = 'C:/Users/HP/.gemini/antigravity/brain/c5c230c2-90b4-4fe7-b358-32b81fcbace0/scratch/rvpu_mysuru/live_courses_mobile_crop.png';
    await coursesMobileEl.screenshot({ path: coursesMobileCrop });
    console.log('Saved Courses Mobile crop screenshot to:', coursesMobileCrop);
  } else {
    console.log('Could not find .mysuru-courses-mobile-section element!');
  }

  // 2. Desktop Capture (1920 x 1080)
  console.log('Capturing Desktop view...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
  await desktopPage.waitForTimeout(4000);

  const coursesDesktopEl = await desktopPage.$('.mysuru-courses-desktop-section');
  if (coursesDesktopEl) {
    const coursesDesktopCrop = 'C:/Users/HP/.gemini/antigravity/brain/c5c230c2-90b4-4fe7-b358-32b81fcbace0/scratch/rvpu_mysuru/live_courses_desktop_crop.png';
    await coursesDesktopEl.screenshot({ path: coursesDesktopCrop });
    console.log('Saved Courses Desktop crop screenshot to:', coursesDesktopCrop);
  }

  await browser.close();
  console.log('All captures complete!');
}

capture().catch(console.error);
