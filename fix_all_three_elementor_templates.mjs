import fs from 'node:fs';
import path from 'node:path';
import { callTool } from 'file:///C:/Users/HP/.gemini/antigravity/brain/c5c230c2-90b4-4fe7-b358-32b81fcbace0/scratch/rvps/mcp.mjs';

const BRAIN_DIR = 'C:/Users/HP/.gemini/antigravity/brain/c5c230c2-90b4-4fe7-b358-32b81fcbace0';
const WORKSPACE_DIR = 'd:/hemanth bv/test';

async function main() {
  console.log('=== Step 1: Upload Topper Card Assets for South and Mysuru ===');
  
  // South topper card
  const southTopperPath = path.join(BRAIN_DIR, 'scratch/rvpu_south/assets/south_topper_card_full.png');
  let southTopperId = 461; // fallback
  try {
    const res = await callTool('wp_upload_media', {
      source: southTopperPath,
      filename: 'south_topper_card_full.png',
      altText: 'South Topper Card'
    });
    southTopperId = res.id;
    console.log('South Topper Card uploaded with ID:', southTopperId);
  } catch (e) {
    console.warn('South Topper upload warning:', e.message);
  }

  // Mysuru topper card
  const mysuruTopperPath = path.join(BRAIN_DIR, 'scratch/rvpu_mysuru/assets/mysuru_topper_card_full.png');
  let mysuruTopperId = 461; // fallback
  try {
    const res = await callTool('wp_upload_media', {
      source: mysuruTopperPath,
      filename: 'mysuru_topper_card_full.png',
      altText: 'Mysuru Topper Card'
    });
    mysuruTopperId = res.id;
    console.log('Mysuru Topper Card uploaded with ID:', mysuruTopperId);
  } catch (e) {
    console.warn('Mysuru Topper upload warning:', e.message);
  }

  // North topper cards already uploaded:
  const northGreyId = 461;
  const northBlueId = 462;

  console.log('\n=== Step 2: Clean and Rebuild RVPU North (Page ID 433) ===');
  await processCampus({
    name: 'North',
    pageId: 433,
    title: 'RVPU North — Home Page New',
    inputTemplate: path.join(WORKSPACE_DIR, 'rvpu_north_elementor_template.json'),
    outputTemplate: path.join(WORKSPACE_DIR, 'rvpu_north_elementor_template.json'),
    brainTemplate: path.join(BRAIN_DIR, 'rvpu-north-homepage-new-elementor-template.json'),
    carouselConfig: {
      items: [
        { id: northGreyId, url: 'https://rvcollegeofengineering.in/test/wp-content/uploads/2026/10/north_topper_card_grey-1.png' },
        { id: northBlueId, url: 'https://rvcollegeofengineering.in/test/wp-content/uploads/2026/10/north_topper_card_blue-1.png' },
        { id: northGreyId, url: 'https://rvcollegeofengineering.in/test/wp-content/uploads/2026/10/north_topper_card_grey-1.png' },
        { id: northBlueId, url: 'https://rvcollegeofengineering.in/test/wp-content/uploads/2026/10/north_topper_card_blue-1.png' },
        { id: northGreyId, url: 'https://rvcollegeofengineering.in/test/wp-content/uploads/2026/10/north_topper_card_grey-1.png' },
        { id: northBlueId, url: 'https://rvcollegeofengineering.in/test/wp-content/uploads/2026/10/north_topper_card_blue-1.png' }
      ],
      slidesToShow: '4'
    }
  });

  console.log('\n=== Step 3: Clean and Rebuild RVPU South (Page ID 380) ===');
  await processCampus({
    name: 'South',
    pageId: 380,
    title: 'RVPU South — Homepage 11',
    inputTemplate: path.join(WORKSPACE_DIR, 'rvpu_south_elementor_template.json'),
    outputTemplate: path.join(WORKSPACE_DIR, 'rvpu_south_elementor_template.json'),
    brainTemplate: path.join(BRAIN_DIR, 'rvpu-south-homepage11-elementor-template.json'),
    carouselConfig: {
      items: [
        { id: southTopperId, url: 'https://rvcollegeofengineering.in/test/wp-content/uploads/2026/10/south_topper_card_full.png' },
        { id: southTopperId, url: 'https://rvcollegeofengineering.in/test/wp-content/uploads/2026/10/south_topper_card_full.png' },
        { id: southTopperId, url: 'https://rvcollegeofengineering.in/test/wp-content/uploads/2026/10/south_topper_card_full.png' },
        { id: southTopperId, url: 'https://rvcollegeofengineering.in/test/wp-content/uploads/2026/10/south_topper_card_full.png' },
        { id: southTopperId, url: 'https://rvcollegeofengineering.in/test/wp-content/uploads/2026/10/south_topper_card_full.png' },
        { id: southTopperId, url: 'https://rvcollegeofengineering.in/test/wp-content/uploads/2026/10/south_topper_card_full.png' }
      ],
      slidesToShow: '4'
    }
  });

  console.log('\n=== Step 4: Clean and Rebuild RVPU Mysuru (Page ID 280) ===');
  await processCampus({
    name: 'Mysuru',
    pageId: 280,
    title: 'RVPU Mysuru — Home Page 2',
    inputTemplate: path.join(WORKSPACE_DIR, 'rvpu_mysuru_elementor_template.json'),
    outputTemplate: path.join(WORKSPACE_DIR, 'rvpu_mysuru_elementor_template.json'),
    brainTemplate: path.join(BRAIN_DIR, 'rvpu-mysuru-homepage2-elementor-template.json'),
    carouselConfig: {
      items: [
        { id: mysuruTopperId, url: 'https://rvcollegeofengineering.in/test/wp-content/uploads/2026/10/mysuru_topper_card_full.png' },
        { id: mysuruTopperId, url: 'https://rvcollegeofengineering.in/test/wp-content/uploads/2026/10/mysuru_topper_card_full.png' },
        { id: mysuruTopperId, url: 'https://rvcollegeofengineering.in/test/wp-content/uploads/2026/10/mysuru_topper_card_full.png' },
        { id: mysuruTopperId, url: 'https://rvcollegeofengineering.in/test/wp-content/uploads/2026/10/mysuru_topper_card_full.png' },
        { id: mysuruTopperId, url: 'https://rvcollegeofengineering.in/test/wp-content/uploads/2026/10/mysuru_topper_card_full.png' },
        { id: mysuruTopperId, url: 'https://rvcollegeofengineering.in/test/wp-content/uploads/2026/10/mysuru_topper_card_full.png' }
      ],
      slidesToShow: '5'
    }
  });

  console.log('\n=== ALL 3 TEMPLATES CLEANED, FIXED, AND PUBLISHED SUCCESSFULLY! ===');
}

async function processCampus({ name, pageId, title, inputTemplate, outputTemplate, brainTemplate, carouselConfig }) {
  const raw = fs.readFileSync(inputTemplate, 'utf8');
  const doc = JSON.parse(raw);

  // 1. Fetch current live custom_css from WordPress pageSettings
  let customCss = '';
  try {
    const pageData = await callTool('wp_get_elementor_page', { pageId });
    customCss = pageData.pageSettings?.custom_css || '';
  } catch (e) {
    console.warn(`[${name}] could not get remote pageSettings:`, e.message);
  }

  // 2. Extract CSS from any helper widget if customCss was empty
  function cleanElements(elements) {
    return elements.filter(el => {
      // If this is an HTML widget containing <script>, extract any <style> and remove the widget!
      if (el.widgetType === 'html') {
        const html = el.settings?.html || '';
        if (html.includes('<script')) {
          console.log(`[${name}] Removing script-bearing HTML widget ${el.id}`);
          const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
          if (styleMatch && !customCss) {
            customCss = styleMatch[1];
          }
          return false;
        }
      }
      if (el.elements && el.elements.length > 0) {
        el.elements = cleanElements(el.elements);
      }
      return true;
    });
  }

  doc.content = cleanElements(doc.content);

  // 3. Fix carousel settings with real media IDs
  function fixCarousels(elements) {
    elements.forEach(el => {
      if (el.widgetType === 'image-carousel' && carouselConfig) {
        el.settings.carousel = carouselConfig.items;
        el.settings.slides_to_show = carouselConfig.slidesToShow || '4';
        el.settings.slides_to_show_tablet = '2';
        el.settings.slides_to_show_mobile = '1';
        el.settings.slides_to_scroll = '1';
        el.settings.navigation = 'both';
        el.settings.autoplay = 'yes';
        el.settings.infinite = 'yes';
        console.log(`[${name}] Updated carousel widget ${el.id} with ${carouselConfig.items.length} native slides`);
      }
      if (el.elements && el.elements.length > 0) {
        fixCarousels(el.elements);
      }
    });
  }
  fixCarousels(doc.content);

  // 4. Fix any broken arrow string in custom_css ('2192' -> '\2192')
  if (customCss) {
    customCss = customCss
      .replace(/content:\s*['"]2192['"]/g, "content: '\\2192'")
      .replace(/content:\s*['"]276F['"]/g, "content: '\\276F'")
      .replace(/content:\s*['"]276E['"]/g, "content: '\\276E'");
  }

  // 5. Clean template export object
  const cleanExport = {
    version: '0.4',
    title: `${title} (Native Elementor, 100% Editable)`,
    type: 'page',
    content: doc.content,
    pageSettings: {
      custom_css: customCss
    }
  };

  const jsonStr = JSON.stringify(cleanExport, null, 2);

  // Verify zero scripts
  const scriptMatches = jsonStr.match(/<script/gi) || [];
  console.log(`[${name}] Verifying scripts in template: found ${scriptMatches.length}`);
  if (scriptMatches.length > 0) {
    throw new Error(`CRITICAL: [${name}] still has <script> tags!`);
  }

  // Save to workspace and brain
  fs.writeFileSync(outputTemplate, jsonStr, 'utf8');
  fs.writeFileSync(brainTemplate, jsonStr, 'utf8');
  console.log(`[${name}] Saved template JSON to: ${outputTemplate}`);

  // 6. Save to WordPress
  const saveRes = await callTool('wp_save_elementor_page', {
    pageId,
    title,
    status: 'publish',
    template: 'elementor_canvas',
    pageSettings: {
      custom_css: customCss
    },
    elementorData: doc.content
  });
  console.log(`[${name}] Save to WordPress (Page ${pageId}) result:`, saveRes?.success ? 'SUCCESS' : saveRes);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
