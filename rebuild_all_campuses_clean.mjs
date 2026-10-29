import fs from 'fs';
import path from 'path';
import { callTool } from 'file:///C:/Users/HP/.gemini/antigravity/brain/c5c230c2-90b4-4fe7-b358-32b81fcbace0/scratch/rvps/mcp.mjs';

const CDN = 'https://rvcollegeofengineering.in/test/wp-content/uploads/2026/10/';
const WORKSPACE_DIR = 'D:/wordpress-mcp-elementor-main';
const BRAIN_DIR = 'C:/Users/HP/.gemini/antigravity/brain/c5c230c2-90b4-4fe7-b358-32b81fcbace0';

console.log('=== STARTING REBUILD OF ALL 3 CAMPUS TEMPLATES ===');

// Helper to remove any script-bearing HTML widgets from footer or elsewhere (except our clean carousels)
function cleanTemplateElements(elements, campusName) {
  return elements.map(sec => {
    // If the section is the footer section or contains scripts
    function processWidget(el) {
      if (el.widgetType === 'html') {
        const html = el.settings?.html || '';
        if (html.includes('<script')) {
          console.log(`[${campusName}] Cleaning script from HTML widget (id: ${el.id})`);
          // Extract any <link> fonts or <style> tags and discard all <script>
          const links = (html.match(/<link[^>]+>/gi) || []).join('\n');
          const styles = (html.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || []).join('\n');
          el.settings.html = (links + '\n' + styles).trim();
          if (!el.settings.html) {
            el.settings.html = '<!-- Cleaned -->';
          }
        }
      }
      if (el.elements && el.elements.length > 0) {
        el.elements = el.elements.map(processWidget);
      }
      return el;
    }
    return processWidget(sec);
  });
}

// -------------------------------------------------------------
// 1. REBUILD RVPU NORTH
// -------------------------------------------------------------
async function rebuildNorth() {
  console.log('\n--- Rebuilding RVPU North (Page ID 433) ---');
  const file = path.join(WORKSPACE_DIR, 'rvpu_north_elementor_template.json');
  const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
  
  // Section 6 is Results (id: rn15fda)
  // Section 8 is Events (id: rn15feb)
  // Section 10 is Footer (id: rn1601c)
  
  const northResultsHtml = `
<div class="north-results-carousel-container">
  <style>
    .north-results-carousel-container {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      position: relative;
      padding: 10px 0 20px 0;
      font-family: 'Inter', sans-serif;
    }
    .north-results-carousel-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      width: 100%;
    }
    .north-arrow-btn {
      flex: 0 0 54px;
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: #5CC2E6;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease, background 0.2s ease;
      box-shadow: 0 4px 12px rgba(92, 194, 230, 0.35);
      padding: 0;
      z-index: 2;
    }
    .north-arrow-btn:hover {
      transform: scale(1.08);
      background: #4ab2d6;
    }
    .north-arrow-btn img {
      width: 16px;
      height: 24px;
      object-fit: contain;
      display: block;
    }
    .north-results-track {
      display: flex;
      gap: 22px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      padding: 15px 5px;
      flex: 1;
    }
    .north-results-track::-webkit-scrollbar {
      display: none;
    }
    .north-topper-card {
      flex: 0 0 calc((100% - 66px) / 4);
      min-width: 260px;
      max-width: 310px;
      scroll-snap-align: center;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
      background: #ffffff;
    }
    .north-topper-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 14px 30px rgba(0, 0, 0, 0.14);
    }
    .north-topper-card img {
      width: 100%;
      height: auto;
      display: block;
      object-fit: contain;
    }
    @media (max-width: 1024px) {
      .north-topper-card {
        flex: 0 0 calc((100% - 22px) / 2);
      }
    }
    @media (max-width: 640px) {
      .north-topper-card {
        flex: 0 0 82%;
        min-width: 240px;
      }
      .north-arrow-btn {
        width: 44px;
        height: 44px;
        flex: 0 0 44px;
      }
    }
  </style>
  <div class="north-results-carousel-wrapper">
    <button type="button" class="north-arrow-btn" aria-label="Previous Topper" onclick="this.closest('.north-results-carousel-container').querySelector('.north-results-track').scrollBy({left: -320, behavior: 'smooth'})">
      <img src="${CDN}north_arrow_left.png" alt="Prev" />
    </button>
    <div class="north-results-track">
      <!-- TOPPER CARD 1 (Replace image src with your topper photo) -->
      <div class="north-topper-card">
        <img src="${CDN}north_topper_card_grey.png" alt="Niharika Ramesh 597/600" />
      </div>
      <!-- TOPPER CARD 2 (Replace image src with your topper photo) -->
      <div class="north-topper-card">
        <img src="${CDN}north_topper_card_blue.png" alt="Student Topper Blue" />
      </div>
      <!-- TOPPER CARD 3 (Replace image src with your topper photo) -->
      <div class="north-topper-card">
        <img src="${CDN}north_topper_card_grey.png" alt="Niharika Ramesh 597/600" />
      </div>
      <!-- TOPPER CARD 4 (Replace image src with your topper photo) -->
      <div class="north-topper-card">
        <img src="${CDN}north_topper_card_blue.png" alt="Student Topper Blue" />
      </div>
      <!-- TOPPER CARD 5 (Replace image src with your topper photo) -->
      <div class="north-topper-card">
        <img src="${CDN}north_topper_card_grey.png" alt="Niharika Ramesh 597/600" />
      </div>
      <!-- TOPPER CARD 6 (Replace image src with your topper photo) -->
      <div class="north-topper-card">
        <img src="${CDN}north_topper_card_blue.png" alt="Student Topper Blue" />
      </div>
    </div>
    <button type="button" class="north-arrow-btn" aria-label="Next Topper" onclick="this.closest('.north-results-carousel-container').querySelector('.north-results-track').scrollBy({left: 320, behavior: 'smooth'})">
      <img src="${CDN}north_arrow_right.png" alt="Next" />
    </button>
  </div>
</div>
`.trim();

  const northEventsHtml = `
<div class="north-events-carousel-wrap">
  <style>
    .north-events-carousel-wrap {
      display: flex;
      gap: 40px;
      align-items: center;
      width: 100%;
      max-width: 1440px;
      margin: 0 auto;
    }
    .north-events-left {
      flex: 0 0 38%;
      text-align: left;
    }
    .north-events-title {
      font-family: 'Georgia', serif;
      font-size: 2.5em;
      font-weight: 700;
      color: #252525;
      margin: 0 0 16px 0;
      line-height: 1.15;
    }
    .north-events-desc {
      font-family: 'Inter', sans-serif;
      font-size: 1.125em;
      line-height: 1.5;
      color: #252525;
      margin: 0 0 28px 0;
    }
    .north-events-arrows {
      display: flex;
      gap: 16px;
    }
    .north-evt-arrow-btn {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: #5CC2E6;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease, background 0.2s ease;
      box-shadow: 0 4px 12px rgba(92, 194, 230, 0.35);
      padding: 0;
    }
    .north-evt-arrow-btn:hover {
      transform: scale(1.08);
      background: #4ab2d6;
    }
    .north-evt-arrow-btn img {
      width: 16px;
      height: 24px;
      object-fit: contain;
    }
    .north-events-right {
      flex: 1;
      overflow: hidden;
    }
    .north-events-track {
      display: flex;
      gap: 20px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      padding: 10px 0;
    }
    .north-events-track::-webkit-scrollbar {
      display: none;
    }
    .north-event-item {
      flex: 0 0 420px;
      height: 350px;
      border-radius: 18px;
      overflow: hidden;
      scroll-snap-align: start;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
      background: #000;
    }
    .north-event-item:hover {
      transform: scale(1.02);
    }
    .north-event-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    @media (max-width: 1024px) {
      .north-events-carousel-wrap {
        flex-direction: column;
        gap: 25px;
      }
      .north-events-left {
        flex: 0 0 100%;
        width: 100%;
      }
      .north-event-item {
        flex: 0 0 320px;
        height: 270px;
      }
    }
    @media (max-width: 640px) {
      .north-event-item {
        flex: 0 0 85%;
        height: 230px;
      }
    }
  </style>
  <div class="north-events-left">
    <h2 class="north-events-title">EVENTS</h2>
    <p class="north-events-desc">From academic achievements and cultural celebrations to sports victories, student-led initiatives and inspiring guest sessions, our campus is always alive with energy, creativity and talent. Dive into the experiences that define student life at RVPU North.</p>
    <div class="north-events-arrows">
      <button type="button" class="north-evt-arrow-btn" aria-label="Previous Event" onclick="this.closest('.north-events-carousel-wrap').querySelector('.north-events-track').scrollBy({left: -440, behavior: 'smooth'})">
        <img src="${CDN}north_arrow_left.png" alt="Prev" />
      </button>
      <button type="button" class="north-evt-arrow-btn" aria-label="Next Event" onclick="this.closest('.north-events-carousel-wrap').querySelector('.north-events-track').scrollBy({left: 440, behavior: 'smooth'})">
        <img src="${CDN}north_arrow_right.png" alt="Next" />
      </button>
    </div>
  </div>
  <div class="north-events-right">
    <div class="north-events-track">
      <!-- EVENT SLIDE 1 (Replace image URL with your event photo) -->
      <div class="north-event-item">
        <img src="${CDN}north_event_full_1.png" alt="RVPU North Event 1" />
      </div>
      <!-- EVENT SLIDE 2 (Replace image URL with your event photo) -->
      <div class="north-event-item">
        <img src="${CDN}north_event_full_2.png" alt="RVPU North Event 2" />
      </div>
      <!-- EVENT SLIDE 3 (Replace image URL with your event photo) -->
      <div class="north-event-item">
        <img src="${CDN}north_event_full_3.png" alt="RVPU North Event 3" />
      </div>
      <!-- EVENT SLIDE 4 (Replace image URL with your event photo) -->
      <div class="north-event-item">
        <img src="${CDN}north_event_1.png" alt="RVPU North Event 4" />
      </div>
      <!-- EVENT SLIDE 5 (Replace image URL with your event photo) -->
      <div class="north-event-item">
        <img src="${CDN}north_event_2.png" alt="RVPU North Event 5" />
      </div>
    </div>
  </div>
</div>
`.trim();

  // Replace Results section content with carousel
  const resultsSec = doc.content[5]; // Sec 6
  resultsSec.elements = [{
    id: 'rn_res_col_1',
    elType: 'column',
    settings: { _column_size: 100 },
    elements: [
      {
        id: 'rn_res_heading',
        elType: 'widget',
        widgetType: 'heading',
        settings: {
          title: 'RESULTS',
          align: 'center',
          header_size: 'h2',
          title_color: '#000000',
          typography_typography: 'custom',
          typography_font_family: 'Georgia',
          typography_font_size: { unit: 'px', size: 40 },
          typography_font_weight: '700'
        }
      },
      {
        id: 'rn_res_carousel_html',
        elType: 'widget',
        widgetType: 'html',
        settings: {
          html: northResultsHtml
        }
      },
      {
        id: 'rn_res_btn',
        elType: 'widget',
        widgetType: 'button',
        settings: {
          text: 'Know More →',
          align: 'center',
          link: { url: '#' },
          background_color: '#000000',
          button_text_color: '#FFFFFF',
          border_radius: { unit: 'px', top: '30', right: '30', bottom: '30', left: '30' }
        }
      }
    ]
  }];

  // Replace Events section content with carousel
  const eventsSec = doc.content[7]; // Sec 8
  eventsSec.elements = [{
    id: 'rn_evt_col_1',
    elType: 'column',
    settings: { _column_size: 100 },
    elements: [
      {
        id: 'rn_evt_carousel_html',
        elType: 'widget',
        widgetType: 'html',
        settings: {
          html: northEventsHtml
        }
      }
    ]
  }];

  // Clean all elements of freezing scripts
  doc.content = cleanTemplateElements(doc.content, 'North');

  const jsonStr = JSON.stringify(doc, null, 2);
  fs.writeFileSync(file, jsonStr, 'utf8');
  fs.writeFileSync(path.join(BRAIN_DIR, 'rvpu-north-homepage-new-elementor-template.json'), jsonStr, 'utf8');
  console.log('North template JSON saved successfully! Length:', jsonStr.length);

  // Save to WordPress
  const saveRes = await callTool('wp_save_elementor_page', {
    pageId: 433,
    title: 'RVPU North — Home Page New',
    status: 'publish',
    template: 'elementor_canvas',
    pageSettings: doc.pageSettings || {},
    elementorData: doc.content
  });
  console.log('North WP Save Result:', saveRes?.success ? 'SUCCESS' : saveRes);
}

// -------------------------------------------------------------
// 2. REBUILD RVPU SOUTH
// -------------------------------------------------------------
async function rebuildSouth() {
  console.log('\n--- Rebuilding RVPU South (Page ID 380) ---');
  const file = path.join(WORKSPACE_DIR, 'rvpu_south_elementor_template.json');
  const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
  
  // Section 7 is Results (id: 03d0957)
  // Section 9 is Events (id: 03d096c)
  // Section 11 is Footer (id: 03d0997)

  const southResultsHtml = `
<div class="south-results-carousel-container">
  <style>
    .south-results-carousel-container {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      position: relative;
      padding: 10px 0 20px 0;
      font-family: 'Inter', sans-serif;
    }
    .south-results-carousel-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      width: 100%;
    }
    .south-arrow-btn {
      flex: 0 0 54px;
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: #76C397;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease, background 0.2s ease;
      box-shadow: 0 4px 12px rgba(118, 195, 151, 0.35);
      padding: 0;
      z-index: 2;
    }
    .south-arrow-btn:hover {
      transform: scale(1.08);
      background: #64b385;
    }
    .south-arrow-btn img {
      width: 16px;
      height: 24px;
      object-fit: contain;
      display: block;
    }
    .south-results-track {
      display: flex;
      gap: 24px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      padding: 15px 5px;
      flex: 1;
    }
    .south-results-track::-webkit-scrollbar {
      display: none;
    }
    .south-topper-card {
      flex: 0 0 calc((100% - 72px) / 4);
      min-width: 260px;
      max-width: 310px;
      scroll-snap-align: center;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
      background: #ffffff;
    }
    .south-topper-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 14px 30px rgba(0, 0, 0, 0.14);
    }
    .south-topper-card img {
      width: 100%;
      height: auto;
      display: block;
      object-fit: contain;
    }
    @media (max-width: 1024px) {
      .south-topper-card {
        flex: 0 0 calc((100% - 24px) / 2);
      }
    }
    @media (max-width: 640px) {
      .south-topper-card {
        flex: 0 0 82%;
        min-width: 240px;
      }
      .south-arrow-btn {
        width: 44px;
        height: 44px;
        flex: 0 0 44px;
      }
    }
  </style>
  <div class="south-results-carousel-wrapper">
    <button type="button" class="south-arrow-btn" aria-label="Previous Topper" onclick="this.closest('.south-results-carousel-container').querySelector('.south-results-track').scrollBy({left: -320, behavior: 'smooth'})">
      <img src="${CDN}south_arrow_left.png" alt="Prev" />
    </button>
    <div class="south-results-track">
      <!-- SOUTH TOPPER CARD 1 (Change image src to your student photo) -->
      <div class="south-topper-card">
        <img src="${CDN}south_topper_card_full.png" alt="South Topper Card 1" />
      </div>
      <!-- SOUTH TOPPER CARD 2 (Change image src to your student photo) -->
      <div class="south-topper-card">
        <img src="${CDN}south_topper_card_full.png" alt="South Topper Card 2" />
      </div>
      <!-- SOUTH TOPPER CARD 3 (Change image src to your student photo) -->
      <div class="south-topper-card">
        <img src="${CDN}south_topper_card_full.png" alt="South Topper Card 3" />
      </div>
      <!-- SOUTH TOPPER CARD 4 (Change image src to your student photo) -->
      <div class="south-topper-card">
        <img src="${CDN}south_topper_card_full.png" alt="South Topper Card 4" />
      </div>
      <!-- SOUTH TOPPER CARD 5 (Change image src to your student photo) -->
      <div class="south-topper-card">
        <img src="${CDN}south_topper_card_full.png" alt="South Topper Card 5" />
      </div>
      <!-- SOUTH TOPPER CARD 6 (Change image src to your student photo) -->
      <div class="south-topper-card">
        <img src="${CDN}south_topper_card_full.png" alt="South Topper Card 6" />
      </div>
    </div>
    <button type="button" class="south-arrow-btn" aria-label="Next Topper" onclick="this.closest('.south-results-carousel-container').querySelector('.south-results-track').scrollBy({left: 320, behavior: 'smooth'})">
      <img src="${CDN}south_arrow_right.png" alt="Next" />
    </button>
  </div>
</div>
`.trim();

  const southEventsHtml = `
<div class="south-events-carousel-wrap">
  <style>
    .south-events-carousel-wrap {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      text-align: center;
      position: relative;
      padding: 10px 0 20px 0;
    }
    .south-events-carousel-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      width: 100%;
    }
    .south-evt-arrow-btn {
      flex: 0 0 54px;
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: #2B2B2B;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease, background 0.2s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
      padding: 0;
      z-index: 2;
    }
    .south-evt-arrow-btn:hover {
      transform: scale(1.08);
      background: #111111;
    }
    .south-evt-arrow-btn img {
      width: 16px;
      height: 24px;
      object-fit: contain;
      display: block;
      filter: invert(1);
    }
    .south-events-track {
      display: flex;
      gap: 20px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      padding: 15px 5px;
      flex: 1;
    }
    .south-events-track::-webkit-scrollbar {
      display: none;
    }
    .south-evt-panel {
      flex: 0 0 280px;
      height: 360px;
      border-radius: 18px;
      overflow: hidden;
      scroll-snap-align: center;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      transition: transform 0.3s ease;
      background: #FFFFFF;
    }
    .south-evt-panel:hover {
      transform: translateY(-8px);
    }
    .south-evt-panel img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    @media (max-width: 1024px) {
      .south-evt-panel {
        flex: 0 0 240px;
        height: 310px;
      }
    }
    @media (max-width: 640px) {
      .south-evt-panel {
        flex: 0 0 80%;
        height: 280px;
      }
      .south-evt-arrow-btn {
        width: 44px;
        height: 44px;
        flex: 0 0 44px;
      }
    }
  </style>
  <div class="south-events-carousel-wrapper">
    <button type="button" class="south-evt-arrow-btn" aria-label="Previous Event" onclick="this.closest('.south-events-carousel-wrap').querySelector('.south-events-track').scrollBy({left: -300, behavior: 'smooth'})">
      <img src="${CDN}south_arrow_left.png" alt="Prev" />
    </button>
    <div class="south-events-track">
      <!-- SOUTH EVENT 1 (Change image src to your event photo) -->
      <div class="south-evt-panel">
        <img src="${CDN}south_event_panel_1.png" alt="South Campus Event 1" />
      </div>
      <!-- SOUTH EVENT 2 (Change image src to your event photo) -->
      <div class="south-evt-panel">
        <img src="${CDN}south_event_panel_2.png" alt="South Campus Event 2" />
      </div>
      <!-- SOUTH EVENT 3 (Change image src to your event photo) -->
      <div class="south-evt-panel">
        <img src="${CDN}south_event_panel_3.png" alt="South Campus Event 3" />
      </div>
      <!-- SOUTH EVENT 4 (Change image src to your event photo) -->
      <div class="south-evt-panel">
        <img src="${CDN}south_event_panel_4.png" alt="South Campus Event 4" />
      </div>
      <!-- SOUTH EVENT 5 (Change image src to your event photo) -->
      <div class="south-evt-panel">
        <img src="${CDN}south_event_panel_5.png" alt="South Campus Event 5" />
      </div>
      <!-- SOUTH EVENT 6 (Change image src to your event photo) -->
      <div class="south-evt-panel">
        <img src="${CDN}south_event_panel_6.png" alt="South Campus Event 6" />
      </div>
      <!-- SOUTH EVENT 7 (Change image src to your event photo) -->
      <div class="south-evt-panel">
        <img src="${CDN}south_event_panel_7.png" alt="South Campus Event 7" />
      </div>
    </div>
    <button type="button" class="south-evt-arrow-btn" aria-label="Next Event" onclick="this.closest('.south-events-carousel-wrap').querySelector('.south-events-track').scrollBy({left: 300, behavior: 'smooth'})">
      <img src="${CDN}south_arrow_right.png" alt="Next" />
    </button>
  </div>
</div>
`.trim();

  // Replace Results section content with carousel
  const resultsSec = doc.content[6]; // Sec 7
  resultsSec.elements = [{
    id: 'so_res_col_1',
    elType: 'column',
    settings: { _column_size: 100 },
    elements: [
      {
        id: 'so_res_heading',
        elType: 'widget',
        widgetType: 'heading',
        settings: {
          title: 'Results',
          align: 'center',
          header_size: 'h2',
          title_color: '#252525',
          typography_typography: 'custom',
          typography_font_family: 'Georgia',
          typography_font_size: { unit: 'px', size: 50 },
          typography_font_weight: '700'
        }
      },
      {
        id: 'so_res_carousel_html',
        elType: 'widget',
        widgetType: 'html',
        settings: {
          html: southResultsHtml
        }
      },
      {
        id: 'so_res_btn',
        elType: 'widget',
        widgetType: 'button',
        settings: {
          text: 'Know More →',
          align: 'center',
          link: { url: '#' },
          background_color: '#000000',
          button_text_color: '#FFFFFF',
          border_radius: { unit: 'px', top: '30', right: '30', bottom: '30', left: '30' }
        }
      }
    ]
  }];

  // Replace Events section content with carousel
  const eventsSec = doc.content[8]; // Sec 9
  eventsSec.elements = [{
    id: 'so_evt_col_1',
    elType: 'column',
    settings: { _column_size: 100 },
    elements: [
      {
        id: 'so_evt_heading',
        elType: 'widget',
        widgetType: 'heading',
        settings: {
          title: 'EVENTS',
          align: 'center',
          header_size: 'h2',
          title_color: '#252525',
          typography_typography: 'custom',
          typography_font_family: 'Georgia',
          typography_font_size: { unit: 'px', size: 50 },
          typography_font_weight: '700'
        }
      },
      {
        id: 'so_evt_desc',
        elType: 'widget',
        widgetType: 'text-editor',
        settings: {
          editor: '<p style="text-align: center; color: #252525; font-family: Inter, sans-serif; font-size: 18px; max-width: 900px; margin: 0 auto 20px auto;">From academic achievements and cultural celebrations to sports victories, student-led initiatives and inspiring guest sessions, our campus is always alive with energy, creativity and talent. Dive into the experiences that define student life at RVPU South.</p>'
        }
      },
      {
        id: 'so_evt_carousel_html',
        elType: 'widget',
        widgetType: 'html',
        settings: {
          html: southEventsHtml
        }
      },
      {
        id: 'so_evt_btn',
        elType: 'widget',
        widgetType: 'button',
        settings: {
          text: 'Know More →',
          align: 'center',
          link: { url: '#' },
          background_color: '#000000',
          button_text_color: '#FFFFFF',
          border_radius: { unit: 'px', top: '30', right: '30', bottom: '30', left: '30' }
        }
      }
    ]
  }];

  // Clean all elements of freezing scripts
  doc.content = cleanTemplateElements(doc.content, 'South');

  const jsonStr = JSON.stringify(doc, null, 2);
  fs.writeFileSync(file, jsonStr, 'utf8');
  fs.writeFileSync(path.join(BRAIN_DIR, 'rvpu-south-homepage11-elementor-template.json'), jsonStr, 'utf8');
  console.log('South template JSON saved successfully! Length:', jsonStr.length);

  // Save to WordPress
  const saveRes = await callTool('wp_save_elementor_page', {
    pageId: 380,
    title: 'RVPU South — Homepage 11',
    status: 'publish',
    template: 'elementor_canvas',
    pageSettings: doc.pageSettings || {},
    elementorData: doc.content
  });
  console.log('South WP Save Result:', saveRes?.success ? 'SUCCESS' : saveRes);
}

// -------------------------------------------------------------
// 3. REBUILD RVPU MYSURU
// -------------------------------------------------------------
async function rebuildMysuru() {
  console.log('\n--- Rebuilding RVPU Mysuru (Page ID 280) ---');
  const file = path.join(WORKSPACE_DIR, 'rvpu_mysuru_elementor_template.json');
  const doc = JSON.parse(fs.readFileSync(file, 'utf8'));

  // Section 8 is Results (id: 02dc71d)
  // Section 10 is Events (id: 02dc739)
  // Section 12 is Footer (id: 02dc764)

  const mysuruResultsHtml = `
<div class="mysuru-results-carousel-container">
  <style>
    .mysuru-results-carousel-container {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      position: relative;
      padding: 10px 0 20px 0;
      font-family: 'Inter', sans-serif;
    }
    .mysuru-results-carousel-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      width: 100%;
    }
    .mysuru-arrow-btn {
      flex: 0 0 54px;
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: #E58D4D;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease, background 0.2s ease;
      box-shadow: 0 4px 12px rgba(229, 141, 77, 0.35);
      padding: 0;
      z-index: 2;
    }
    .mysuru-arrow-btn:hover {
      transform: scale(1.08);
      background: #d47c3c;
    }
    .mysuru-arrow-btn img {
      width: 16px;
      height: 24px;
      object-fit: contain;
      display: block;
    }
    .mysuru-results-track {
      display: flex;
      gap: 22px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      padding: 15px 5px;
      flex: 1;
    }
    .mysuru-results-track::-webkit-scrollbar {
      display: none;
    }
    .mysuru-topper-card {
      flex: 0 0 calc((100% - 88px) / 5);
      min-width: 240px;
      max-width: 280px;
      scroll-snap-align: center;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
      background: #ffffff;
    }
    .mysuru-topper-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 14px 30px rgba(0, 0, 0, 0.14);
    }
    .mysuru-topper-card img {
      width: 100%;
      height: auto;
      display: block;
      object-fit: contain;
    }
    @media (max-width: 1200px) {
      .mysuru-topper-card {
        flex: 0 0 calc((100% - 44px) / 3);
      }
    }
    @media (max-width: 800px) {
      .mysuru-topper-card {
        flex: 0 0 calc((100% - 22px) / 2);
      }
    }
    @media (max-width: 600px) {
      .mysuru-topper-card {
        flex: 0 0 82%;
        min-width: 230px;
      }
      .mysuru-arrow-btn {
        width: 44px;
        height: 44px;
        flex: 0 0 44px;
      }
    }
  </style>
  <div class="mysuru-results-carousel-wrapper">
    <button type="button" class="mysuru-arrow-btn" aria-label="Previous Topper" onclick="this.closest('.mysuru-results-carousel-container').querySelector('.mysuru-results-track').scrollBy({left: -300, behavior: 'smooth'})">
      <img src="${CDN}mysuru_arrow_left.png" alt="Prev" />
    </button>
    <div class="mysuru-results-track">
      <!-- MYSURU TOPPER CARD 1 (Change image src to your student photo) -->
      <div class="mysuru-topper-card">
        <img src="${CDN}mysuru_topper_card_full.png" alt="Mysuru Topper Card 1" />
      </div>
      <!-- MYSURU TOPPER CARD 2 (Change image src to your student photo) -->
      <div class="mysuru-topper-card">
        <img src="${CDN}mysuru_topper_card_full.png" alt="Mysuru Topper Card 2" />
      </div>
      <!-- MYSURU TOPPER CARD 3 (Change image src to your student photo) -->
      <div class="mysuru-topper-card">
        <img src="${CDN}mysuru_topper_card_full.png" alt="Mysuru Topper Card 3" />
      </div>
      <!-- MYSURU TOPPER CARD 4 (Change image src to your student photo) -->
      <div class="mysuru-topper-card">
        <img src="${CDN}mysuru_topper_card_full.png" alt="Mysuru Topper Card 4" />
      </div>
      <!-- MYSURU TOPPER CARD 5 (Change image src to your student photo) -->
      <div class="mysuru-topper-card">
        <img src="${CDN}mysuru_topper_card_full.png" alt="Mysuru Topper Card 5" />
      </div>
      <!-- MYSURU TOPPER CARD 6 (Change image src to your student photo) -->
      <div class="mysuru-topper-card">
        <img src="${CDN}mysuru_topper_card_full.png" alt="Mysuru Topper Card 6" />
      </div>
    </div>
    <button type="button" class="mysuru-arrow-btn" aria-label="Next Topper" onclick="this.closest('.mysuru-results-carousel-container').querySelector('.mysuru-results-track').scrollBy({left: 300, behavior: 'smooth'})">
      <img src="${CDN}mysuru_arrow_right.png" alt="Next" />
    </button>
  </div>
</div>
`.trim();

  const mysuruEventsHtml = `
<div class="mysuru-events-carousel-wrap">
  <style>
    .mysuru-events-carousel-wrap {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      text-align: center;
      position: relative;
      padding: 10px 0 20px 0;
    }
    .mysuru-events-carousel-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      width: 100%;
    }
    .mysuru-evt-arrow-btn {
      flex: 0 0 54px;
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: #E58D4D;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease, background 0.2s ease;
      box-shadow: 0 4px 12px rgba(229, 141, 77, 0.35);
      padding: 0;
      z-index: 2;
    }
    .mysuru-evt-arrow-btn:hover {
      transform: scale(1.08);
      background: #d47c3c;
    }
    .mysuru-evt-arrow-btn img {
      width: 16px;
      height: 24px;
      object-fit: contain;
      display: block;
    }
    .mysuru-events-track {
      display: flex;
      gap: 20px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      padding: 15px 5px;
      flex: 1;
    }
    .mysuru-events-track::-webkit-scrollbar {
      display: none;
    }
    .mysuru-evt-panel {
      flex: 0 0 280px;
      height: 380px;
      border-radius: 18px;
      overflow: hidden;
      scroll-snap-align: center;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      transition: transform 0.3s ease;
      background: #FFFFFF;
    }
    .mysuru-evt-panel:hover {
      transform: translateY(-8px);
    }
    .mysuru-evt-panel img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    @media (max-width: 1024px) {
      .mysuru-evt-panel {
        flex: 0 0 240px;
        height: 320px;
      }
    }
    @media (max-width: 640px) {
      .mysuru-evt-panel {
        flex: 0 0 80%;
        height: 280px;
      }
      .mysuru-evt-arrow-btn {
        width: 44px;
        height: 44px;
        flex: 0 0 44px;
      }
    }
  </style>
  <div class="mysuru-events-carousel-wrapper">
    <button type="button" class="mysuru-evt-arrow-btn" aria-label="Previous Event" onclick="this.closest('.mysuru-events-carousel-wrap').querySelector('.mysuru-events-track').scrollBy({left: -300, behavior: 'smooth'})">
      <img src="${CDN}mysuru_arrow_left.png" alt="Prev" />
    </button>
    <div class="mysuru-events-track">
      <!-- MYSURU EVENT 1 (Change image src to your event photo) -->
      <div class="mysuru-evt-panel">
        <img src="${CDN}mysuru_event_panel_1.png" alt="Mysuru Event 1" />
      </div>
      <!-- MYSURU EVENT 2 (Change image src to your event photo) -->
      <div class="mysuru-evt-panel">
        <img src="${CDN}mysuru_event_panel_2.png" alt="Mysuru Event 2" />
      </div>
      <!-- MYSURU EVENT 3 - CENTER FEATURED (Change image src to your event photo) -->
      <div class="mysuru-evt-panel">
        <img src="${CDN}mysuru_event_panel_3.png" alt="Mysuru Event 3 (Center Featured)" />
      </div>
      <!-- MYSURU EVENT 4 (Change image src to your event photo) -->
      <div class="mysuru-evt-panel">
        <img src="${CDN}mysuru_event_panel_4.png" alt="Mysuru Event 4" />
      </div>
      <!-- MYSURU EVENT 5 (Change image src to your event photo) -->
      <div class="mysuru-evt-panel">
        <img src="${CDN}mysuru_event_panel_5.png" alt="Mysuru Event 5" />
      </div>
    </div>
    <button type="button" class="mysuru-evt-arrow-btn" aria-label="Next Event" onclick="this.closest('.mysuru-events-carousel-wrap').querySelector('.mysuru-events-track').scrollBy({left: 300, behavior: 'smooth'})">
      <img src="${CDN}mysuru_arrow_right.png" alt="Next" />
    </button>
  </div>
</div>
`.trim();

  // Replace Results section content with carousel
  const resultsSec = doc.content[7]; // Sec 8
  resultsSec.elements = [{
    id: 'my_res_col_1',
    elType: 'column',
    settings: { _column_size: 100 },
    elements: [
      {
        id: 'my_res_heading',
        elType: 'widget',
        widgetType: 'heading',
        settings: {
          title: 'RESULTS',
          align: 'center',
          header_size: 'h2',
          title_color: '#E58D4D',
          typography_typography: 'custom',
          typography_font_family: 'Georgia',
          typography_font_size: { unit: 'px', size: 40 },
          typography_font_weight: '700'
        }
      },
      {
        id: 'my_res_carousel_html',
        elType: 'widget',
        widgetType: 'html',
        settings: {
          html: mysuruResultsHtml
        }
      },
      {
        id: 'my_res_btn',
        elType: 'widget',
        widgetType: 'button',
        settings: {
          text: 'Know More →',
          align: 'center',
          link: { url: '#' },
          background_color: '#000000',
          button_text_color: '#FFFFFF',
          border_radius: { unit: 'px', top: '30', right: '30', bottom: '30', left: '30' }
        }
      }
    ]
  }];

  // Replace Events section content with carousel
  const eventsSec = doc.content[9]; // Sec 10
  eventsSec.elements = [{
    id: 'my_evt_col_1',
    elType: 'column',
    settings: { _column_size: 100 },
    elements: [
      {
        id: 'my_evt_heading',
        elType: 'widget',
        widgetType: 'heading',
        settings: {
          title: 'EVENTS',
          align: 'center',
          header_size: 'h2',
          title_color: '#E58D4D',
          typography_typography: 'custom',
          typography_font_family: 'Georgia',
          typography_font_size: { unit: 'px', size: 40 },
          typography_font_weight: '700'
        }
      },
      {
        id: 'my_evt_desc',
        elType: 'widget',
        widgetType: 'text-editor',
        settings: {
          editor: '<p style="text-align: center; color: #000000; font-family: Inter, sans-serif; font-size: 18px; max-width: 900px; margin: 0 auto 20px auto;">From academic achievements and cultural celebrations to sports victories, student-led initiatives and inspiring guest sessions, our campus is always alive with energy, creativity and talent. Dive into the experiences that define student life at RVPU Mysuru.</p>'
        }
      },
      {
        id: 'my_evt_carousel_html',
        elType: 'widget',
        widgetType: 'html',
        settings: {
          html: mysuruEventsHtml
        }
      },
      {
        id: 'my_evt_btn',
        elType: 'widget',
        widgetType: 'button',
        settings: {
          text: 'Know More →',
          align: 'center',
          link: { url: '#' },
          background_color: '#000000',
          button_text_color: '#FFFFFF',
          border_radius: { unit: 'px', top: '30', right: '30', bottom: '30', left: '30' }
        }
      }
    ]
  }];

  // Clean all elements of freezing scripts
  doc.content = cleanTemplateElements(doc.content, 'Mysuru');

  const jsonStr = JSON.stringify(doc, null, 2);
  fs.writeFileSync(file, jsonStr, 'utf8');
  fs.writeFileSync(path.join(BRAIN_DIR, 'rvpu-mysuru-homepage2-elementor-template.json'), jsonStr, 'utf8');
  console.log('Mysuru template JSON saved successfully! Length:', jsonStr.length);

  // Save to WordPress
  const saveRes = await callTool('wp_save_elementor_page', {
    pageId: 280,
    title: 'RVPU Mysuru — Home Page 2',
    status: 'publish',
    template: 'elementor_canvas',
    pageSettings: doc.pageSettings || {},
    elementorData: doc.content
  });
  console.log('Mysuru WP Save Result:', saveRes?.success ? 'SUCCESS' : saveRes);
}

async function main() {
  await rebuildNorth();
  await rebuildSouth();
  await rebuildMysuru();
  console.log('\n=== ALL 3 CAMPUS TEMPLATES REBUILT, FIXED, AND PUBLISHED! ===');
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
