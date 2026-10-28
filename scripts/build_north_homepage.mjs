import fs from 'node:fs';
import { callTool } from '../rvps/mcp.mjs';

let idCounter = 90000;
function nextId() {
  idCounter += 1;
  return 'rn' + idCounter.toString(16);
}

const em = (top, right, bottom, left, isLinked = false) => ({
  unit: 'em',
  top: String(top),
  right: String(right),
  bottom: String(bottom),
  left: String(left),
  isLinked
});

function withWidgetClasses(extra = {}) {
  const out = { ...extra };
  if (out.css_classes && !out._css_classes) {
    out._css_classes = out.css_classes;
  } else if (out._css_classes && !out.css_classes) {
    out.css_classes = out._css_classes;
  }
  return out;
}

function makeSection(settings = {}, columns = [], isInner = false) {
  return {
    id: nextId(),
    elType: 'section',
    isInner,
    settings: {
      layout: settings.layout || 'full_width',
      gap: 'no',
      ...settings
    },
    elements: columns
  };
}

function makeColumn(size = 100, settings = {}, widgets = [], isInner = false) {
  return {
    id: nextId(),
    elType: 'column',
    isInner,
    settings: {
      _column_size: size,
      _inline_size: settings._inline_size ?? size,
      ...(settings.sizeTablet !== undefined ? { _inline_size_tablet: settings.sizeTablet } : {}),
      ...(settings.sizeMobile !== undefined ? { _inline_size_mobile: settings.sizeMobile } : {}),
      ...settings
    },
    elements: widgets
  };
}

function makeHeading(title, settings = {}) {
  return {
    id: nextId(),
    elType: 'widget',
    widgetType: 'heading',
    settings: {
      title,
      header_size: settings.header_size || 'h2',
      align: settings.align || 'left',
      ...(settings.alignTablet ? { align_tablet: settings.alignTablet } : {}),
      ...(settings.alignMobile ? { align_mobile: settings.alignMobile } : {}),
      ...(settings.link ? { link: { url: settings.link, is_external: '', nofollow: '' } } : {}),
      title_color: settings.color || '#252525',
      typography_typography: 'custom',
      typography_font_family: settings.fontFamily || 'Georgia',
      typography_font_size: { unit: 'em', size: settings.fontSizeEm ?? 2.5, sizes: [] },
      ...(settings.fontSizeTabletEm
        ? { typography_font_size_tablet: { unit: 'em', size: settings.fontSizeTabletEm, sizes: [] } }
        : {}),
      ...(settings.fontSizeMobileEm
        ? { typography_font_size_mobile: { unit: 'em', size: settings.fontSizeMobileEm, sizes: [] } }
        : {}),
      typography_font_weight: settings.fontWeight || '700',
      ...(settings.lineHeight
        ? { typography_line_height: { unit: 'em', size: settings.lineHeight, sizes: [] } }
        : {}),
      ...(settings.letterSpacing
        ? { typography_letter_spacing: { unit: 'em', size: settings.letterSpacing, sizes: [] } }
        : {}),
      ...withWidgetClasses(settings.extra)
    },
    elements: []
  };
}

function makeText(editorHtml, settings = {}) {
  return {
    id: nextId(),
    elType: 'widget',
    widgetType: 'text-editor',
    settings: {
      editor: editorHtml,
      align: settings.align || 'left',
      ...(settings.alignTablet ? { align_tablet: settings.alignTablet } : {}),
      ...(settings.alignMobile ? { align_mobile: settings.alignMobile } : {}),
      text_color: settings.color || '#252525',
      typography_typography: 'custom',
      typography_font_family: settings.fontFamily || 'Inter',
      typography_font_size: { unit: 'em', size: settings.fontSizeEm ?? 1.0, sizes: [] },
      ...(settings.fontSizeTabletEm
        ? { typography_font_size_tablet: { unit: 'em', size: settings.fontSizeTabletEm, sizes: [] } }
        : {}),
      ...(settings.fontSizeMobileEm
        ? { typography_font_size_mobile: { unit: 'em', size: settings.fontSizeMobileEm, sizes: [] } }
        : {}),
      typography_font_weight: settings.fontWeight || '400',
      typography_line_height: { unit: 'em', size: settings.lineHeight ?? 1.35, sizes: [] },
      ...withWidgetClasses(settings.extra)
    },
    elements: []
  };
}

function makeImage(mediaObj, settings = {}) {
  const extra = withWidgetClasses(settings.extra || {});
  if (mediaObj?.assetClass) {
    const cls = [extra.css_classes, mediaObj.assetClass].filter(Boolean).join(' ');
    extra.css_classes = cls;
    extra._css_classes = cls;
  }
  return {
    id: nextId(),
    elType: 'widget',
    widgetType: 'image',
    settings: {
      image: {
        url: mediaObj?.url || '',
        id: mediaObj?.id || '',
        alt: settings.alt || ''
      },
      image_size: 'full',
      align: settings.align || 'center',
      ...(settings.alignTablet ? { align_tablet: settings.alignTablet } : {}),
      ...(settings.alignMobile ? { align_mobile: settings.alignMobile } : {}),
      ...(settings.widthEm
        ? { width: { unit: 'em', size: settings.widthEm, sizes: [] } }
        : {}),
      ...(settings.widthPct
        ? { width: { unit: '%', size: settings.widthPct, sizes: [] } }
        : {}),
      ...extra
    },
    elements: []
  };
}

function makeButton(text, settings = {}) {
  return {
    id: nextId(),
    elType: 'widget',
    widgetType: 'button',
    settings: {
      text,
      link: { url: settings.url || '#', is_external: '', nofollow: '' },
      align: settings.align || 'left',
      ...(settings.alignTablet ? { align_tablet: settings.alignTablet } : {}),
      ...(settings.alignMobile ? { align_mobile: settings.alignMobile } : {}),
      typography_typography: 'custom',
      typography_font_family: settings.fontFamily || 'Nunito',
      typography_font_size: { unit: 'em', size: settings.fontSizeEm ?? 1.0, sizes: [] },
      typography_font_weight: settings.fontWeight || '400',
      button_text_color: settings.color || '#252525',
      background_color: settings.bgColor || '#00000000',
      border_border: 'solid',
      border_width: em(0.09375, 0.09375, 0.09375, 0.09375, true),
      border_color: settings.borderColor || '#252525',
      border_radius: em(2.4375, 2.4375, 2.4375, 2.4375, true),
      text_padding: settings.padding || em(0.75, 1.75, 0.75, 1.75),
      ...withWidgetClasses(settings.extra)
    },
    elements: []
  };
}

function makeCarousel(mediaList = [], settings = {}) {
  return {
    id: nextId(),
    elType: 'widget',
    widgetType: 'image-carousel',
    settings: {
      carousel: mediaList.map((m) => ({
        id: m.id || '',
        url: m.url || ''
      })),
      thumbnail_size: 'full',
      slides_to_show: String(settings.slidesToShow || 4),
      slides_to_show_tablet: String(settings.slidesToShowTablet || 2),
      slides_to_show_mobile: String(settings.slidesToShowMobile || 1),
      slides_to_scroll: '1',
      image_stretch: 'no',
      navigation: 'none',
      autoplay: 'yes',
      pause_on_hover: 'yes',
      pause_on_interaction: 'yes',
      autoplay_speed: settings.autoplaySpeed || 3000,
      infinite: 'yes',
      speed: 600,
      image_spacing: 'custom',
      image_spacing_custom: { unit: 'px', size: settings.spacing ?? 16, sizes: [] },
      ...withWidgetClasses(settings.extra)
    },
    elements: []
  };
}

function makeSocialIcons( settings = {} ) {
  const networks = [
    { name: 'facebook-f', url: '#facebook' },
    { name: 'instagram', url: '#instagram' },
    { name: 'twitter', url: '#twitter' },
    { name: 'youtube', url: '#youtube' },
    { name: 'linkedin-in', url: '#linkedin' },
    { name: 'whatsapp', url: '#whatsapp' }
  ];
  return {
    id: nextId(),
    elType: 'widget',
    widgetType: 'social-icons',
    settings: {
      social_icon_list: networks.map((n) => ({
        _id: nextId(),
        social_icon: {
          value: `fab fa-${n.name}`,
          library: 'fa-brands'
        },
        link: {
          url: n.url,
          is_external: 'true',
          nofollow: ''
        },
        item_icon_color: 'custom',
        item_icon_primary_color: '#FFFFFF',
        item_icon_secondary_color: '#252525'
      })),
      shape: 'circle',
      columns: '6',
      align: settings.align || 'left',
      ...(settings.alignTablet ? { align_tablet: settings.alignTablet } : {}),
      ...(settings.alignMobile ? { align_mobile: settings.alignMobile } : {}),
      icon_color: 'custom',
      icon_primary_color: '#FFFFFF',
      icon_secondary_color: '#252525',
      icon_size: { unit: 'em', size: 1.15, sizes: [] },
      icon_padding: { unit: 'em', size: 0.85, sizes: [] },
      icon_spacing: { unit: 'em', size: 0.4375, sizes: [] },
      ...withWidgetClasses(settings.extra)
    },
    elements: []
  };
}

function makeHtml(htmlContent, settings = {}) {
  return {
    id: nextId(),
    elType: 'widget',
    widgetType: 'html',
    settings: {
      html: htmlContent,
      ...withWidgetClasses(settings.extra)
    },
    elements: []
  };
}

const dir = 'C:/Users/HP/.gemini/antigravity/brain/c5c230c2-90b4-4fe7-b358-32b81fcbace0/scratch/rvpu_north';
const mediaMap = JSON.parse(fs.readFileSync(`${dir}/media_map.json`, 'utf8'));
const WP_UPLOAD_BASE = 'https://rvcollegeofengineering.in/test/wp-content/uploads/2026/10/';

const M = (filename) => {
  const entry = mediaMap[filename] || {};
  const cleanKey = filename.replace(/\.[^.]+$/, '').replace(/[^a-z0-9_-]/gi, '-');
  return {
    id: entry.id || '',
    url: entry.url || `${WP_UPLOAD_BASE}${filename}`,
    filename,
    assetClass: `north-asset-${cleanKey}`
  };
};

const MEDIA = {
  logo: M('north_logo.png'),
  heroPlay: M('north_hero_play.png'),
  welcomeBg: M('north_welcome_bg.png'),
  welcomeMarble: M('north_welcome_marble.png'),
  admissionsBg: M('north_admissions_bg.png'),
  iconPhoneBlue: M('north_icon_phone_blue.png'),
  iconEmailBlue: M('north_icon_email_blue.png'),
  coursesBg: M('north_courses_bg.png'),
  coursesBlueBox: M('north_courses_blue_box.png'),
  coursesEagle: M('north_courses_eagle.png'),
  iconPcmb: M('north_icon_pcmb.png'),
  iconPcmc: M('north_icon_pcmc.png'),
  iconBams: M('north_icon_bams.png'),
  iconBame: M('north_icon_bame.png'),
  iconSeba: M('north_icon_seba.png'),
  resultsBg: M('north_results_bg.png'),
  topperCardGrey: M('north_topper_card_grey.png'),
  topperCardBlue: M('north_topper_card_blue.png'),
  topperPhoto: M('north_topper_photo.png'),
  arrowLeft: M('north_arrow_left.png'),
  arrowRight: M('north_arrow_right.png'),
  expandBg: M('north_expand_bg.png'),
  expandCollage: M('north_expand_collage.png'),
  event1: M('north_event_1.png'),
  event2: M('north_event_2.png'),
  event3: M('north_event_3.png'),
  eventFull1: M('north_event_full_1.png'),
  eventFull2: M('north_event_full_2.png'),
  eventFull3: M('north_event_full_3.png'),
  tourBg: M('north_tour_bg.png'),
  footerPhone: M('north_footer_phone.png'),
  footerEmail: M('north_footer_email.png'),
  footerMap: M('north_footer_map.png'),
  footerPrivacy: M('north_footer_privacy.png')
};

// 100% Native Elementor Section for the 5 Hanging Calendar-Style Course Cards
// Each course card is a Native Elementor Column containing:
// 1. Native Elementor Image Widget (Course Icon)
// 2. Native Elementor Heading Widget (Course Code: PCMB, PCMC, BAMS, BAME, SEBA)
// 3. Native Elementor Text-Editor Widget (4 Subject Lines)
function makeNorthCoursesNativeSection() {
  const courses = [
    {
      code: 'PCMB',
      icon: MEDIA.iconPcmb,
      subjects: ['Physics', 'Mathematics', 'Chemistry', 'Biology'],
      watermark: 'bottom-left'
    },
    {
      code: 'PCMC',
      icon: MEDIA.iconPcmc,
      subjects: ['Physics', 'Mathematics', 'Chemistry', 'Computer Science'],
      watermark: 'top-right'
    },
    {
      code: 'BAMS',
      icon: MEDIA.iconBams,
      subjects: ['Business Studies', 'Basic Mathematics', 'Accountancy', 'Statistics'],
      watermark: 'bottom-left'
    },
    {
      code: 'BAME',
      icon: MEDIA.iconBame,
      subjects: ['Business Studies', 'Basic Mathematics', 'Accountancy', 'Economics'],
      watermark: 'top-right'
    },
    {
      code: 'SEBA',
      icon: MEDIA.iconSeba,
      subjects: ['Statistics', 'Business Studies', 'Economics', 'Accountancy'],
      watermark: 'top-left'
    }
  ];

  return makeSection(
    {
      layout: 'full_width',
      content_position: 'top',
      css_classes: 'north-hanging-courses-native-row'
    },
    courses.map((c) =>
      makeColumn(
        20,
        {
          sizeTablet: 33.33,
          sizeMobile: 50,
          content_position: 'top',
          css_classes: `north-hanging-course-col north-wm-${c.watermark}`
        },
        [
          makeImage(c.icon, {
            align: 'center',
            alt: c.code,
            extra: {
              css_classes: 'north-course-icon-widget'
            }
          }),
          makeHeading(c.code, {
            header_size: 'h4',
            align: 'left',
            color: '#000000',
            fontFamily: 'Georgia',
            fontSizeEm: 1.5625,
            fontSizeTabletEm: 1.35,
            fontSizeMobileEm: 1.25,
            fontWeight: '400',
            lineHeight: 1.1,
            extra: {
              css_classes: 'north-course-code-widget'
            }
          }),
          makeText(
            c.subjects.map((s) => `<p class="north-course-subj-line">${s}</p>`).join(''),
            {
              align: 'center',
              color: '#000000',
              fontFamily: 'Inter',
              fontSizeEm: 1.125,
              fontSizeTabletEm: 1.0,
              fontSizeMobileEm: 0.92,
              fontWeight: '400',
              lineHeight: 1.35,
              extra: {
                css_classes: `north-course-subj-widget north-wm-${c.watermark}`
              }
            }
          )
        ],
        true
      )
    ),
    true
  );
}

const CUSTOM_CSS = `
/* === GLOBAL RESET & PROPORTIONAL DESKTOP SCALING (1920px = 120em -> 1em = 16px) === */
html, body {
  margin: 0 !important;
  padding: 0 !important;
  overflow-x: hidden !important;
  max-width: 100% !important;
  background: #FFFFFF;
}
.north-sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
  pointer-events: none !important;
}
/* Ensure Elementor Editor overlays and handles are ALWAYS clickable and unblocked */
body.elementor-editor-active .north-runtime-helper-widget {
  height: 0 !important;
  min-height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  pointer-events: none !important;
}
.elementor {
  font-size: 16px;
}
@media (min-width: 1025px) {
  .elementor {
    font-size: calc(100vw / 120) !important;
  }
}
.elementor-widget:not(:last-child) {
  margin-bottom: 0 !important;
}
.elementor-column-gap-default > .elementor-column > .elementor-element-populated,
.elementor-column-gap-no > .elementor-column > .elementor-element-populated {
  padding: 0;
}

/* === SECTION 1: HEADER BAR (1920x167px = 120em x 10.4375em) === */
.north-header-section > .elementor-container {
  display: flex !important;
  align-items: stretch !important;
}
.north-logo-img img {
  width: 15.375em !important;
  max-width: 100% !important;
  height: auto !important;
  display: block;
}
.north-header-menu-col {
  cursor: pointer;
}
.north-menu-bar .elementor-divider-separator {
  border-radius: 0.35em !important;
  width: 4.375em !important;
}

/* === SECTION 2: HERO VIDEO BANNER (1920x650px = 120em x 40.625em) === */
.north-play-btn-widget img {
  width: 10.375em !important;
  height: 10.375em !important;
  cursor: pointer;
  transition: transform 0.25s ease;
}
.north-play-btn-widget img:hover {
  transform: scale(1.06);
}

/* === PILL BUTTONS ("Know More", "Apply Now") === */
.north-btn-pill .elementor-button {
  min-width: 11.4375em;
  min-height: 3.75em;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0.7em 1.75em !important;
  border-radius: 2.4375em !important;
  border-width: 0.09375em !important;
  transition: all 0.25s ease !important;
  box-sizing: border-box !important;
}
.north-btn-with-arrow .elementor-button-text {
  display: inline-flex !important;
  align-items: center !important;
  gap: 0.85em;
}
.north-btn-with-arrow .elementor-button-text::after {
  content: '\\2192';
  font-family: Arial, sans-serif;
  font-size: 1.3em;
  font-weight: 700;
  line-height: 1;
}
.north-btn-dark .elementor-button:hover {
  background-color: #252525 !important;
  color: #FFFFFF !important;
  border-color: #252525 !important;
}
.north-btn-white .elementor-button:hover {
  background-color: #5DC3E6 !important;
  color: #000000 !important;
  border-color: #5DC3E6 !important;
}

/* === SECTION 3: WELCOME TO RV PU COLLEGE, NORTH === */
.north-welcome-body {
  max-width: 58.1875em;
}

/* === SECTION 4: ADMISSIONS OPEN 2026 -2027 (PLAIN TEXT NATIVE HEADING) === */
.north-adm-heading > .elementor-widget-container {
  display: inline-flex !important;
  flex-direction: column !important;
  align-items: center !important;
  padding-bottom: 0.45em !important;
  border-bottom: 0.14em solid #5DC3E6 !important;
}
.north-adm-heading {
  text-align: center !important;
}
.north-adm-heading .elementor-heading-title {
  display: inline-block !important;
  background: #5DC3E6 !important;
  color: #000000 !important;
  padding: 0.04em 0.55em !important;
  font-family: Georgia, serif !important;
  font-weight: 700 !important;
  line-height: 1.15 !important;
}
@media (min-width: 1025px) {
  .north-adm-enquiries-row > .elementor-container {
    justify-content: center !important;
    align-items: center !important;
    flex-wrap: nowrap !important;
    gap: 1.25em;
  }
  .north-adm-enquiries-row > .elementor-container > .elementor-column {
    width: auto !important;
    flex: 0 0 auto !important;
  }
}
.north-adm-contact-col > .elementor-widget-wrap,
.north-adm-contact-col > .elementor-column-wrap > .elementor-widget-wrap,
.north-adm-contact-col > .elementor-element-populated {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: center !important;
  flex-wrap: nowrap !important;
  gap: 0.65em;
}
.north-adm-icon-widget {
  width: auto !important;
  margin-bottom: 0 !important;
}
.north-adm-icon-widget img {
  width: 2.3125em !important;
  height: 2.3125em !important;
  object-fit: contain !important;
  display: block !important;
}
.north-adm-contact-text {
  width: auto !important;
  margin-bottom: 0 !important;
}
.north-adm-contact-text .elementor-heading-title a {
  color: #5DC3E6 !important;
  text-decoration: none !important;
}

/* === SECTION 5: COURSES OFFERED (100% NATIVE ELEMENTOR WIDGETS) === */
.north-courses-left-inner > .elementor-container {
  display: flex !important;
  align-items: stretch !important;
  min-height: 24.1875em;
}
.north-courses-banner-col > .elementor-element-populated,
.north-courses-banner-col > .elementor-widget-wrap,
.north-courses-banner-col > .elementor-column-wrap > .elementor-widget-wrap {
  display: flex !important;
  flex-direction: column !important;
  justify-content: flex-start !important;
  align-items: flex-start !important;
}
.north-courses-heading-top .elementor-heading-title {
  background: #FFFFFF;
  color: #000000 !important;
  font-family: Georgia, serif;
  font-weight: 700;
  line-height: 1.12;
  padding: 0.32em 1.1em 0.55em 0.68em;
  clip-path: polygon(0 0, calc(100% - 0.55em) 0, 100% 0.55em, 100% 100%, 0 100%);
  display: inline-block;
  min-width: 6.525em;
  box-sizing: border-box;
}
.north-courses-heading-bottom {
  margin-top: -0.5em !important;
  padding-left: 5.5em !important;
  position: relative;
}
.north-courses-heading-bottom::before {
  content: '••••••••••••';
  position: absolute;
  left: 0;
  top: 0.35em;
  color: #FFFFFF;
  font-size: 0.9em;
  letter-spacing: 0.16em;
  line-height: 1;
  pointer-events: none;
}
.north-courses-heading-bottom::after {
  content: '▶▶▶▶';
  position: absolute;
  left: 1.45em;
  top: 1.45em;
  color: #FFFFFF;
  font-size: 0.85em;
  letter-spacing: 0.1em;
  line-height: 1;
  pointer-events: none;
}
.north-courses-heading-bottom .elementor-heading-title {
  background: #252525;
  color: #5DC3E6 !important;
  font-family: Georgia, serif;
  font-weight: 700;
  line-height: 1.12;
  padding: 0.14em 0.75em 0.22em 0.65em;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0.45em 100%, 0 calc(100% - 0.45em));
  display: inline-block;
  min-width: 6.525em;
  box-sizing: border-box;
}
.north-courses-eagle-col > .elementor-element-populated,
.north-courses-eagle-col > .elementor-widget-wrap,
.north-courses-eagle-col > .elementor-column-wrap > .elementor-widget-wrap {
  display: flex !important;
  align-items: flex-end !important;
  justify-content: center !important;
  height: 100% !important;
}
.north-courses-eagle-widget img {
  width: 12.875em !important;
  max-width: none !important;
  height: auto !important;
  display: block !important;
}

/* 5 Native Hanging Calendar Course Columns */
.north-hanging-courses-native-row > .elementor-container {
  display: grid !important;
  grid-template-columns: repeat(5, 11.0em) !important;
  gap: 0.875em !important;
  align-items: start !important;
  justify-content: start !important;
}
.north-hanging-course-col {
  width: 11.0em !important;
  max-width: 11.0em !important;
  min-width: 11.0em !important;
  position: relative !important;
}
.north-hanging-course-col > .elementor-element-populated,
.north-hanging-course-col > .elementor-widget-wrap,
.north-hanging-course-col > .elementor-column-wrap > .elementor-widget-wrap {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: wrap !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0 0.5em !important;
  background: linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 4.0625em, transparent 4.0625em) !important;
  border-radius: 0.45em !important;
  padding: 0 !important;
  position: relative !important;
}
.north-course-icon-widget,
.north-course-code-widget {
  width: auto !important;
  margin-bottom: 0 !important;
  height: 4.0625em !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
.north-course-icon-widget > .elementor-widget-container,
.north-course-code-widget > .elementor-widget-container {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  height: 4.0625em !important;
  padding-bottom: 0.2em !important;
  box-sizing: border-box !important;
}
.north-course-icon-widget img {
  height: 1.95em !important;
  width: auto !important;
  max-width: 2.4em !important;
  object-fit: contain !important;
  display: block !important;
}
.north-course-subj-widget {
  width: 100% !important;
  flex: 0 0 100% !important;
  margin-top: 0.625em !important;
  position: relative !important;
  overflow: visible !important;
}
/* Dual Vertical Metallic Binder Rings & Holes (Pure CSS on Native Widget) */
.north-course-subj-widget::before,
.north-course-subj-widget::after {
  content: '';
  position: absolute;
  top: -1.0em;
  width: 0.375em;
  height: 1.38em;
  border-radius: 0.2em;
  background: linear-gradient(180deg, #C1C1C1 0%, #D5D4D3 100%);
  box-shadow: 0 -0.35em 0 0.125em #497584, 0 1px 2px rgba(0, 0, 0, 0.18);
  z-index: 4;
  pointer-events: none;
}
.north-course-subj-widget::before {
  left: 1.575em;
}
.north-course-subj-widget::after {
  right: 1.575em;
}
.north-course-subj-widget > .elementor-widget-container {
  width: 100% !important;
  min-height: 13.1875em !important;
  background: #FFFFFF !important;
  border-radius: 0.45em !important;
  padding: 2.25em 0.5em 1.5em 0.5em !important;
  box-sizing: border-box !important;
  box-shadow: 0 0.2em 0.55em rgba(0, 0, 0, 0.09) !important;
  position: relative !important;
  overflow: hidden !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
}
.north-course-subj-widget > .elementor-widget-container::before {
  content: '';
  position: absolute;
  width: 8.5em;
  height: 5.5em;
  border: 0.12em solid rgba(37, 37, 37, 0.08);
  border-radius: 50%;
  pointer-events: none;
}
.north-course-subj-widget.north-wm-bottom-left > .elementor-widget-container::before {
  bottom: -2.5em;
  left: -2.0em;
  box-shadow: 0 0 0 0.6em rgba(37, 37, 37, 0.05), 0 0 0 1.2em rgba(37, 37, 37, 0.04);
}
.north-course-subj-widget.north-wm-top-right > .elementor-widget-container::before {
  top: -2.2em;
  right: -2.0em;
  box-shadow: 0 0 0 0.6em rgba(37, 37, 37, 0.05), 0 0 0 1.2em rgba(37, 37, 37, 0.04);
}
.north-course-subj-widget.north-wm-top-left > .elementor-widget-container::before {
  top: -2.2em;
  left: -2.0em;
  box-shadow: 0 0 0 0.6em rgba(37, 37, 37, 0.05), 0 0 0 1.2em rgba(37, 37, 37, 0.04);
}
.north-course-subj-line {
  font-family: 'Inter', sans-serif;
  font-size: 1.0em;
  font-weight: 400;
  color: #000000;
  line-height: 1.2;
  text-align: center;
  margin: 0 0 0.68em 0 !important;
  white-space: nowrap;
  position: relative;
  z-index: 2;
}
.north-course-subj-line:last-child {
  margin-bottom: 0 !important;
}

/* === SECTION 6: RESULTS (COMPACT 4-CARD CAROUSEL) === */
.north-results-slider-row {
  max-width: 92.0em !important;
  margin-left: auto !important;
  margin-right: auto !important;
}
.north-results-slider-row > .elementor-container,
.north-tour-section > .elementor-container {
  display: flex !important;
  align-items: center !important;
}
.north-results-carousel-col {
  min-width: 0 !important;
}
.north-slider-arrow-col,
.north-slider-arrow-col > .elementor-widget-wrap,
.north-slider-arrow-col > .elementor-column-wrap,
.north-slider-arrow-col > .elementor-column-wrap > .elementor-widget-wrap {
  display: flex !important;
  align-items: center !important;
}
.north-arrow-btn img {
  width: 4.5em !important;
  height: 4.25em !important;
  max-width: none !important;
  cursor: pointer;
  transition: transform 0.2s ease;
  display: block !important;
}
.north-arrow-btn img:hover {
  transform: scale(1.07);
}
.north-results-carousel .swiper,
.north-results-carousel .swiper-wrapper,
.north-results-carousel .swiper-slide {
  opacity: 1 !important;
  visibility: visible !important;
}
.north-results-carousel .swiper-slide img {
  width: 100% !important;
  max-width: 18.25em !important;
  height: auto !important;
  margin: 0 auto !important;
  display: block !important;
}

/* === SECTION 7: EXPAND YOUR POTENTIAL! === */
.north-expand-section > .elementor-container {
  display: flex !important;
  align-items: center !important;
}
.north-expand-body {
  max-width: 62.8em;
}
.north-expand-collage-img img {
  width: 35.9375em !important;
  max-width: 100% !important;
  height: auto !important;
  display: block !important;
}

/* === SECTION 8: EVENTS (100% NATIVE IMAGE WIDGETS EXPANDING-SLICE CAROUSEL) === */
.north-events-section > .elementor-container {
  display: flex !important;
  align-items: center !important;
}
.north-events-subtitle {
  max-width: 41.0625em;
}
.north-events-left-col > .elementor-element-populated,
.north-events-left-col > .elementor-widget-wrap,
.north-events-left-col > .elementor-column-wrap > .elementor-widget-wrap {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: wrap !important;
  align-items: center !important;
}
.north-events-heading,
.north-events-subtitle {
  width: 100% !important;
  flex: 0 0 100% !important;
}
.north-events-arrow-widget {
  width: auto !important;
  display: inline-block !important;
  margin-right: 2.0em !important;
  margin-bottom: 0 !important;
  cursor: pointer;
}
.north-events-arrow-widget img {
  width: 5.0em !important;
  height: 4.75em !important;
  display: block !important;
  transition: transform 0.2s ease;
}
.north-events-arrow-widget:hover img {
  transform: scale(1.07);
}
.north-events-right-col > .elementor-element-populated,
.north-events-right-col > .elementor-widget-wrap,
.north-events-right-col > .elementor-column-wrap > .elementor-widget-wrap {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  align-items: stretch !important;
  gap: 1.5em !important;
  width: 100% !important;
  height: 19.625em !important;
}
.north-evt-slide {
  flex: 1 1 15% !important;
  width: auto !important;
  height: 100% !important;
  margin-bottom: 0 !important;
  overflow: hidden !important;
  cursor: pointer;
  position: relative;
  transition: flex 520ms cubic-bezier(0.22, 1, 0.36, 1), opacity 350ms ease;
}
.north-evt-slide.is-expanded {
  flex: 4.35 1 65.5% !important;
}
.north-evt-slide > .elementor-widget-container,
.north-evt-slide .elementor-image {
  width: 100% !important;
  height: 100% !important;
}
.north-evt-slide img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  object-position: center center !important;
  display: block !important;
  transition: object-position 520ms ease;
}
.north-evt-slide-2:not(.is-expanded) img {
  object-position: 18% center !important;
}
.north-evt-slide-3:not(.is-expanded) img {
  object-position: 92% center !important;
}

/* === SECTION 10: FOOTER (100% NATIVE WIDGETS) === */
.north-footer-icon-phone img {
  width: 5.3125em !important;
  height: 5.3125em !important;
  object-fit: contain !important;
}
.north-footer-icon-std img {
  width: 4.375em !important;
  height: 4.375em !important;
  object-fit: contain !important;
}
.north-footer-icon-privacy img {
  width: 5.125em !important;
  height: 5.125em !important;
  object-fit: contain !important;
}
.north-footer-top-link .elementor-heading-title a {
  color: #F7F7F7 !important;
  text-decoration: none !important;
}
.north-subscribe-btn-widget .elementor-button {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  width: 24.25em !important;
  max-width: 100% !important;
  height: 3.5em !important;
  background: #6F6F6F !important;
  color: #FFFFFF !important;
  border: none !important;
  border-radius: 1.875em !important;
  padding: 0 1.35em !important;
  box-sizing: border-box !important;
  font-family: 'Inter', sans-serif !important;
  font-size: 1.25em !important;
  font-weight: 400 !important;
}
.north-subscribe-btn-widget .elementor-button-text {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  width: 100% !important;
}
.north-subscribe-btn-widget .elementor-button-text::after {
  content: '\\276F';
  font-size: 0.9em;
  line-height: 1;
  margin-left: 0.75em;
}
.north-social-icons-widget .elementor-social-icons-wrapper {
  display: flex !important;
  align-items: center !important;
  gap: 0.4375em !important;
  flex-wrap: nowrap !important;
}
.north-social-icons-widget .elementor-social-icon {
  width: 3.125em !important;
  height: 3.125em !important;
  border-radius: 50% !important;
  background-color: #FFFFFF !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: transform 0.2s ease, background-color 0.2s ease !important;
}
.north-social-icons-widget .elementor-social-icon i,
.north-social-icons-widget .elementor-social-icon svg {
  color: #FFFFFF !important;
  fill: #FFFFFF !important;
  opacity: 0 !important;
}
.north-social-icons-widget .elementor-social-icon:hover {
  transform: translateY(-0.2em);
  background-color: #5DC3E6 !important;
}
@media (min-width: 1025px) {
  .north-footer-copyright-right .elementor-heading-title {
    white-space: nowrap;
  }
}

/* === CROSS-SITE BACKGROUND FALLBACKS === */
.north-welcome-section {
  background-image: url("${WP_UPLOAD_BASE}north_welcome_bg.png") !important;
  background-position: top center !important;
  background-repeat: no-repeat !important;
  background-size: cover !important;
}
.north-admissions-section {
  background-image: url("${WP_UPLOAD_BASE}north_admissions_bg.png") !important;
  background-position: center center !important;
  background-repeat: no-repeat !important;
  background-size: cover !important;
}
.north-courses-section {
  background-image: url("${WP_UPLOAD_BASE}north_courses_bg.png") !important;
  background-position: top center !important;
  background-repeat: no-repeat !important;
  background-size: cover !important;
}
.north-results-section {
  background-image: url("${WP_UPLOAD_BASE}north_results_bg.png") !important;
  background-position: center center !important;
  background-repeat: no-repeat !important;
  background-size: cover !important;
}
.north-expand-section {
  background-image: url("${WP_UPLOAD_BASE}north_expand_bg.png") !important;
  background-position: center center !important;
  background-repeat: no-repeat !important;
  background-size: cover !important;
}
.north-tour-section {
  background-image: url("${WP_UPLOAD_BASE}north_tour_bg.png") !important;
  background-position: center center !important;
  background-repeat: no-repeat !important;
  background-size: cover !important;
}

/* === TABLET & MOBILE RESPONSIVE BREAKPOINTS === */
@media (max-width: 1024px) {
  .north-logo-img img {
    width: 13.0em !important;
  }
  .north-menu-bar .elementor-divider-separator {
    width: 3.1em !important;
  }
  .north-play-btn-widget img {
    width: 7.25em !important;
    height: 7.25em !important;
  }
  .north-welcome-section > .elementor-container,
  .north-courses-section > .elementor-container,
  .north-expand-section > .elementor-container,
  .north-events-section > .elementor-container,
  .north-tour-section > .elementor-container {
    flex-wrap: wrap !important;
  }
  .north-welcome-section {
    background-image: url("${WP_UPLOAD_BASE}north_welcome_marble.png") !important;
  }
  .north-courses-section {
    background: #252525 !important;
  }
  .north-courses-left-inner > .elementor-container {
    min-height: 0;
    align-items: center !important;
    justify-content: space-around !important;
    flex-wrap: wrap !important;
  }
  .north-courses-eagle-widget img {
    width: 9.5em !important;
  }
  .north-courses-right-col {
    background: #5DC3E6;
    border-radius: 1.0em;
  }
  .north-hanging-courses-native-row > .elementor-container {
    grid-template-columns: repeat(3, 10.5em) !important;
    justify-content: center !important;
    gap: 1.15em !important;
  }
  .north-hanging-course-col {
    width: 10.5em !important;
    max-width: 10.5em !important;
    min-width: 10.5em !important;
  }
  .north-results-slider-row {
    max-width: 44.0em !important;
  }
  .north-results-carousel .swiper-slide img {
    max-width: 14.5em !important;
  }
  .north-arrow-btn img {
    width: 3.25em !important;
    height: 3.1em !important;
  }
  .north-expand-collage-img img {
    max-width: 420px !important;
    margin: 0 auto !important;
  }
  .north-events-arrow-widget img {
    width: 3.5em !important;
    height: 3.35em !important;
  }
  .north-events-right-col > .elementor-element-populated,
  .north-events-right-col > .elementor-widget-wrap,
  .north-events-right-col > .elementor-column-wrap > .elementor-widget-wrap {
    height: 17.5em !important;
    gap: 0.75em !important;
  }
  .north-social-icons-widget .elementor-social-icons-wrapper {
    flex-wrap: wrap !important;
  }
}

@media (max-width: 767px) {
  .elementor-section {
    max-width: 100vw !important;
    overflow-x: hidden !important;
  }
  .north-logo-img img {
    width: 10.75em !important;
  }
  .north-menu-bar .elementor-divider-separator {
    width: 2.35em !important;
  }
  .north-play-btn-widget img {
    width: 5.5em !important;
    height: 5.5em !important;
  }
  .north-adm-heading .elementor-heading-title {
    font-size: 0.95em !important;
    padding: 0.25em 0.5em !important;
  }
  .north-courses-banner-col > .elementor-element-populated,
  .north-courses-banner-col > .elementor-widget-wrap,
  .north-courses-banner-col > .elementor-column-wrap > .elementor-widget-wrap {
    align-items: center !important;
  }
  .north-hanging-courses-native-row > .elementor-container {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 0.75em !important;
    width: 100% !important;
  }
  .north-hanging-course-col {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
  }
  .north-hanging-course-col:last-child:nth-child(odd) {
    grid-column: 1 / -1 !important;
    max-width: 11.25em !important;
    margin: 0 auto !important;
  }
  .north-course-subj-line {
    font-size: 0.92em;
    white-space: normal;
  }
  .north-results-slider-row {
    max-width: 22.0em !important;
  }
  .north-results-carousel .swiper-slide img {
    max-width: 13.0em !important;
  }
  .north-arrow-btn img {
    width: 2.45em !important;
    height: 2.35em !important;
  }
  .north-events-right-col > .elementor-element-populated,
  .north-events-right-col > .elementor-widget-wrap,
  .north-events-right-col > .elementor-column-wrap > .elementor-widget-wrap {
    height: 13.5em !important;
    gap: 0.45em !important;
  }
  .north-subscribe-btn-widget .elementor-button {
    width: 100% !important;
  }
  .north-footer-icon-phone img,
  .north-footer-icon-std img,
  .north-footer-icon-privacy img {
    width: 3.5em !important;
    height: 3.5em !important;
  }
}
`;

const elementorData = [
  // =========================================================================
  // SECTION 1: HEADER BAR (Figma y=0..167, h=167px = 10.4375em)
  // Left Sky-Blue Bar (#5DC3E6, 90.833%) with Logo (x=66, y=37, 246x94 = 15.375em x 5.875em)
  // Right White Menu Block (#FFFFFF, 9.167%, 176x167) with 3 black bars + "Menu"
  // =========================================================================
  makeSection(
    {
      layout: 'full_width',
      content_position: 'middle',
      background_background: 'classic',
      background_color: '#5DC3E6',
      border_border: 'solid',
      border_width: em(0, 0, 0.0625, 0),
      border_color: '#252525',
      padding: em(0, 0, 0, 4.125),
      padding_tablet: em(0, 0, 0, 2.0),
      padding_mobile: em(0, 0, 0, 1.0),
      css_classes: 'north-header-section'
    },
    [
      makeColumn(
        90.833,
        {
          sizeTablet: 84,
          sizeMobile: 76,
          content_position: 'center',
          padding: em(2.25, 0, 2.25, 0),
          padding_tablet: em(1.1, 0, 1.1, 0),
          padding_mobile: em(0.75, 0, 0.75, 0),
          css_classes: 'north-header-logo-col'
        },
        [
          makeImage(MEDIA.logo, {
            align: 'left',
            alt: 'RV PU College North, Bengaluru',
            extra: {
              css_classes: 'north-logo-img'
            }
          })
        ]
      ),
      makeColumn(
        9.167,
        {
          sizeTablet: 16,
          sizeMobile: 24,
          content_position: 'center',
          align: 'center',
          background_background: 'classic',
          background_color: '#FFFFFF',
          padding: em(2.0, 0.5, 1.85, 0.5),
          padding_tablet: em(1.1, 0.5, 1.0, 0.5),
          padding_mobile: em(0.75, 0.35, 0.75, 0.35),
          css_classes: 'north-header-menu-col'
        },
        [
          {
            id: nextId(),
            elType: 'widget',
            widgetType: 'divider',
            settings: {
              style: 'solid',
              weight: { unit: 'px', size: 7, sizes: [] },
              color: '#000000',
              width: { unit: 'em', size: 4.375, sizes: [] },
              align: 'center',
              gap: { unit: 'px', size: 0, sizes: [] },
              _margin: em(0, 0, 0.65, 0),
              css_classes: 'north-menu-bar',
              _css_classes: 'north-menu-bar'
            },
            elements: []
          },
          {
            id: nextId(),
            elType: 'widget',
            widgetType: 'divider',
            settings: {
              style: 'solid',
              weight: { unit: 'px', size: 7, sizes: [] },
              color: '#000000',
              width: { unit: 'em', size: 4.375, sizes: [] },
              align: 'center',
              gap: { unit: 'px', size: 0, sizes: [] },
              _margin: em(0, 0, 0.65, 0),
              css_classes: 'north-menu-bar',
              _css_classes: 'north-menu-bar'
            },
            elements: []
          },
          {
            id: nextId(),
            elType: 'widget',
            widgetType: 'divider',
            settings: {
              style: 'solid',
              weight: { unit: 'px', size: 7, sizes: [] },
              color: '#000000',
              width: { unit: 'em', size: 4.375, sizes: [] },
              align: 'center',
              gap: { unit: 'px', size: 0, sizes: [] },
              _margin: em(0, 0, 0.5, 0),
              css_classes: 'north-menu-bar',
              _css_classes: 'north-menu-bar'
            },
            elements: []
          },
          makeHeading('Menu', {
            header_size: 'span',
            align: 'center',
            color: '#000000',
            fontFamily: 'Inter',
            fontSizeEm: 1.5625,
            fontSizeTabletEm: 1.2,
            fontSizeMobileEm: 1.0,
            fontWeight: '400',
            lineHeight: 1.2
          })
        ]
      )
    ]
  ),

  // =========================================================================
  // SECTION 2: HERO VIDEO BANNER (Figma y=166..816, h=650px = 40.625em)
  // =========================================================================
  makeSection(
    {
      layout: 'full_width',
      content_position: 'middle',
      background_background: 'classic',
      background_color: '#222222',
      padding: em(15.1875, 2.0, 15.0625, 2.0),
      padding_tablet: em(10.0, 1.5, 10.0, 1.5),
      padding_mobile: em(6.5, 1.25, 6.5, 1.25),
      css_classes: 'north-hero-section'
    },
    [
      makeColumn(
        100,
        {
          content_position: 'center',
          align: 'center'
        },
        [
          makeImage(MEDIA.heroPlay, {
            align: 'center',
            alt: 'Play Campus Video',
            extra: {
              css_classes: 'north-play-btn-widget'
            }
          })
        ]
      )
    ]
  ),

  // =========================================================================
  // SECTION 3: WELCOME TO RV PU COLLEGE, NORTH (Figma y=816..1351, h=535px)
  // =========================================================================
  makeSection(
    {
      layout: 'full_width',
      content_position: 'stretch',
      background_background: 'classic',
      background_color: '#F5F5F5',
      background_image: { url: MEDIA.welcomeBg.url, id: MEDIA.welcomeBg.id },
      background_position: 'top center',
      background_repeat: 'no-repeat',
      background_size: 'cover',
      padding: em(0, 0, 0, 0),
      css_classes: 'north-welcome-section'
    },
    [
      makeColumn(
        43.073,
        {
          sizeTablet: 100,
          sizeMobile: 100,
          background_background: 'classic',
          background_color: '#9D9D9D',
          padding: em(16.7, 1.0, 16.7, 1.0),
          padding_tablet: em(7.5, 1.0, 7.5, 1.0),
          padding_mobile: em(5.5, 1.0, 5.5, 1.0),
          css_classes: 'north-welcome-left-col'
        },
        [
          {
            id: nextId(),
            elType: 'widget',
            widgetType: 'spacer',
            settings: {
              space: { unit: 'px', size: 10, sizes: [] }
            },
            elements: []
          }
        ]
      ),
      makeColumn(
        56.927,
        {
          sizeTablet: 100,
          sizeMobile: 100,
          content_position: 'top',
          padding: em(3.5, 7.5, 3.4375, 2.625),
          padding_tablet: em(2.5, 2.5, 2.75, 2.5),
          padding_mobile: em(1.85, 1.25, 2.25, 1.25),
          css_classes: 'north-welcome-right-col'
        },
        [
          makeHeading('Welcome to', {
            header_size: 'h3',
            align: 'left',
            color: '#252525',
            fontFamily: 'Georgia',
            fontSizeEm: 2.5,
            fontSizeTabletEm: 1.85,
            fontSizeMobileEm: 1.45,
            fontWeight: '700',
            lineHeight: 1.14,
            extra: {
              _margin: em(0, 0, 0.35, 0),
              css_classes: 'north-welcome-sub'
            }
          }),
          makeHeading('RV PU College, North', {
            header_size: 'h1',
            align: 'left',
            color: '#252525',
            fontFamily: 'Georgia',
            fontSizeEm: 3.1875,
            fontSizeTabletEm: 2.35,
            fontSizeMobileEm: 1.85,
            fontWeight: '700',
            lineHeight: 1.14,
            extra: {
              _margin: em(0, 0, 1.65, 0),
              _margin_mobile: em(0, 0, 1.1, 0),
              css_classes: 'north-welcome-heading'
            }
          }),
          makeText(
            '<p style="margin:0 0 1.2em 0;">Welcome to RV PU College, Mysuru, where our mission is to provide a positive learning environment that encourages students to reach their full potential.</p><p style="margin:0;">We are a pre-university college, offering comprehensive education for young adults to prepare for their university studies. Our college provides an excellent learning environment with experienced and knowledgeable faculty, modern facilities and abundant resources. We strive to provide our students with the best academic and personal growth opportunities, so that they can become well-rounded and successful individuals.</p>',
            {
              align: 'left',
              color: '#252525',
              fontFamily: 'Inter',
              fontSizeEm: 1.125,
              fontSizeTabletEm: 1.0,
              fontSizeMobileEm: 0.95,
              fontWeight: '400',
              lineHeight: 1.22,
              extra: {
                _margin: em(0, 0, 1.35, 0),
                _margin_mobile: em(0, 0, 1.2, 0),
                css_classes: 'north-welcome-body'
              }
            }
          ),
          makeButton('Know More', {
            align: 'left',
            color: '#252525',
            borderColor: '#252525',
            bgColor: '#00000000',
            fontSizeEm: 1.0,
            extra: {
              css_classes: 'north-btn-pill north-btn-dark north-btn-with-arrow'
            }
          })
        ]
      )
    ]
  ),

  // =========================================================================
  // SECTION 4: ADMISSIONS OPEN 2026 -2027 (Figma y=1351..1631, h=280px)
  // =========================================================================
  makeSection(
    {
      layout: 'full_width',
      content_position: 'middle',
      background_background: 'classic',
      background_color: '#252525',
      background_image: { url: MEDIA.admissionsBg.url, id: MEDIA.admissionsBg.id },
      background_position: 'center center',
      background_repeat: 'no-repeat',
      background_size: 'cover',
      padding: em(2.0625, 2.0, 1.85, 2.0),
      padding_tablet: em(2.25, 1.5, 2.25, 1.5),
      padding_mobile: em(1.85, 1.0, 1.85, 1.0),
      css_classes: 'north-admissions-section'
    },
    [
      makeColumn(
        100,
        {
          align: 'center'
        },
        [
          makeHeading('ADMISSIONS OPEN 2026 -2027', {
            header_size: 'h2',
            align: 'center',
            color: '#000000',
            fontFamily: 'Georgia',
            fontSizeEm: 2.5,
            fontSizeTabletEm: 1.75,
            fontSizeMobileEm: 1.25,
            fontWeight: '700',
            lineHeight: 1.2,
            extra: {
              _margin: em(0, 0, 1.1, 0),
              _margin_mobile: em(0, 0, 0.85, 0),
              css_classes: 'north-adm-heading'
            }
          }),
          makeSection(
            {
              layout: 'boxed',
              content_width: { unit: 'px', size: 960, sizes: [] },
              content_position: 'middle',
              margin: em(0, 0, 1.25, 0),
              css_classes: 'north-adm-enquiries-row'
            },
            [
              makeColumn(
                36,
                {
                  sizeTablet: 100,
                  sizeMobile: 100,
                  content_position: 'center',
                  align: 'center',
                  padding: em(0.25, 0.5, 0.25, 0.5)
                },
                [
                  makeHeading('For Admissions Enquiries:', {
                    header_size: 'h4',
                    align: 'center',
                    color: '#FFFFFF',
                    fontFamily: 'Georgia',
                    fontSizeEm: 1.4375,
                    fontSizeTabletEm: 1.25,
                    fontSizeMobileEm: 1.1,
                    fontWeight: '700',
                    lineHeight: 1.2,
                    extra: {
                      css_classes: 'north-adm-enq-label'
                    }
                  })
                ],
                true
              ),
              makeColumn(
                28,
                {
                  sizeTablet: 50,
                  sizeMobile: 100,
                  content_position: 'center',
                  align: 'center',
                  padding: em(0.25, 0.5, 0.25, 0.5),
                  css_classes: 'north-adm-contact-col'
                },
                [
                  makeImage(MEDIA.iconPhoneBlue, {
                    align: 'center',
                    alt: 'Phone',
                    extra: {
                      css_classes: 'north-adm-icon-widget'
                    }
                  }),
                  makeHeading('8317346585', {
                    header_size: 'span',
                    align: 'left',
                    link: 'tel:8317346585',
                    color: '#5DC3E6',
                    fontFamily: 'Inter',
                    fontSizeEm: 1.125,
                    fontSizeTabletEm: 1.0,
                    fontSizeMobileEm: 0.95,
                    fontWeight: '400',
                    lineHeight: 1.2,
                    extra: {
                      css_classes: 'north-adm-contact-text'
                    }
                  })
                ],
                true
              ),
              makeColumn(
                36,
                {
                  sizeTablet: 50,
                  sizeMobile: 100,
                  content_position: 'center',
                  align: 'center',
                  padding: em(0.25, 0.5, 0.25, 0.5),
                  css_classes: 'north-adm-contact-col'
                },
                [
                  makeImage(MEDIA.iconEmailBlue, {
                    align: 'center',
                    alt: 'Email',
                    extra: {
                      css_classes: 'north-adm-icon-widget'
                    }
                  }),
                  makeHeading('info.rvpus@rvei.edu.in', {
                    header_size: 'span',
                    align: 'left',
                    link: 'mailto:info.rvpus@rvei.edu.in',
                    color: '#5DC3E6',
                    fontFamily: 'Inter',
                    fontSizeEm: 1.125,
                    fontSizeTabletEm: 1.0,
                    fontSizeMobileEm: 0.95,
                    fontWeight: '400',
                    lineHeight: 1.2,
                    extra: {
                      css_classes: 'north-adm-contact-text'
                    }
                  })
                ],
                true
              )
            ],
            true
          ),
          makeButton('Apply Now', {
            align: 'center',
            color: '#FFFFFF',
            borderColor: '#FFFFFF',
            bgColor: '#00000000',
            fontSizeEm: 1.0,
            extra: {
              css_classes: 'north-btn-pill north-btn-white north-btn-with-arrow'
            }
          })
        ]
      )
    ]
  ),

  // =========================================================================
  // SECTION 5: COURSES OFFERED (Figma y=1631..2018, h=387px = 24.1875em)
  // 100% NATIVE ELEMENTOR WIDGETS (Headings, Button, Eagle Image, & 5 Course Columns)
  // =========================================================================
  makeSection(
    {
      layout: 'full_width',
      content_position: 'top',
      background_background: 'classic',
      background_color: '#D5D4D3',
      background_image: { url: MEDIA.coursesBg.url, id: MEDIA.coursesBg.id },
      background_position: 'top center',
      background_repeat: 'no-repeat',
      background_size: 'cover',
      padding: em(0, 0, 0, 0),
      padding_tablet: em(2.25, 1.5, 2.25, 1.5),
      padding_mobile: em(1.75, 1.0, 2.0, 1.0),
      css_classes: 'north-courses-section'
    },
    [
      // Left Column: Native Headings ("COURSES", "OFFERED") + Native Button ("Know More") + Native Eagle Image
      makeColumn(
        40.5,
        {
          sizeTablet: 100,
          sizeMobile: 100,
          content_position: 'top',
          padding: em(0, 0, 0, 0),
          padding_tablet: em(0, 0, 1.5, 0),
          padding_mobile: em(0, 0, 1.25, 0),
          css_classes: 'north-courses-left-col'
        },
        [
          makeSection(
            {
              layout: 'full_width',
              content_position: 'stretch',
              css_classes: 'north-courses-left-inner'
            },
            [
              makeColumn(
                62,
                {
                  sizeTablet: 60,
                  sizeMobile: 100,
                  content_position: 'top',
                  padding: em(3.0625, 0, 1.75, 9.5625),
                  padding_tablet: em(1.0, 1.0, 1.0, 1.5),
                  padding_mobile: em(0.5, 0.5, 1.0, 0.5),
                  css_classes: 'north-courses-banner-col'
                },
                [
                  makeHeading('COURSES', {
                    header_size: 'h2',
                    align: 'left',
                    alignMobile: 'center',
                    color: '#000000',
                    fontFamily: 'Georgia',
                    fontSizeEm: 2.5,
                    fontSizeTabletEm: 2.0,
                    fontSizeMobileEm: 1.65,
                    fontWeight: '700',
                    lineHeight: 1.12,
                    extra: {
                      css_classes: 'north-courses-heading-top'
                    }
                  }),
                  makeHeading('OFFERED', {
                    header_size: 'h2',
                    align: 'left',
                    alignMobile: 'center',
                    color: '#5DC3E6',
                    fontFamily: 'Georgia',
                    fontSizeEm: 2.5,
                    fontSizeTabletEm: 2.0,
                    fontSizeMobileEm: 1.65,
                    fontWeight: '700',
                    lineHeight: 1.12,
                    extra: {
                      _margin: em(0, 0, 2.85, 0),
                      _margin_tablet: em(0, 0, 1.5, 0),
                      _margin_mobile: em(0, 0, 1.25, 0),
                      css_classes: 'north-courses-heading-bottom'
                    }
                  }),
                  makeButton('Know More', {
                    align: 'left',
                    alignMobile: 'center',
                    color: '#FFFFFF',
                    borderColor: '#FFFFFF',
                    bgColor: '#00000000',
                    fontSizeEm: 1.0,
                    extra: {
                      css_classes: 'north-btn-pill north-btn-white north-btn-with-arrow north-courses-know-btn-widget'
                    }
                  })
                ],
                true
              ),
              makeColumn(
                38,
                {
                  sizeTablet: 40,
                  sizeMobile: 100,
                  content_position: 'bottom',
                  align: 'center',
                  padding: em(0, 1.15, 0, 0),
                  padding_tablet: em(0, 0, 0, 0),
                  padding_mobile: em(0.5, 0, 0, 0),
                  css_classes: 'north-courses-eagle-col'
                },
                [
                  makeImage(MEDIA.coursesEagle, {
                    align: 'center',
                    alt: 'RVPU North Eagle Mascot',
                    extra: {
                      css_classes: 'north-courses-eagle-widget'
                    }
                  })
                ],
                true
              )
            ],
            true
          )
        ]
      ),
      // Right Column: 5 Native Hanging Calendar Course Columns (PCMB, PCMC, BAMS, BAME, SEBA)
      makeColumn(
        59.5,
        {
          sizeTablet: 100,
          sizeMobile: 100,
          content_position: 'top',
          padding: em(4.375, 4.5, 1.5, 3.5),
          padding_tablet: em(1.5, 1.0, 1.5, 1.0),
          padding_mobile: em(1.25, 0.5, 1.25, 0.5),
          css_classes: 'north-courses-right-col'
        },
        [makeNorthCoursesNativeSection()]
      )
    ]
  ),

  // =========================================================================
  // SECTION 6: RESULTS (Figma y=2018..2683, Compact 4-Card Carousel)
  // =========================================================================
  makeSection(
    {
      layout: 'full_width',
      content_position: 'middle',
      background_background: 'classic',
      background_color: '#EFEFEF',
      background_image: { url: MEDIA.resultsBg.url, id: MEDIA.resultsBg.id },
      background_position: 'center center',
      background_repeat: 'no-repeat',
      background_size: 'cover',
      padding: em(1.75, 3.0, 1.85, 3.0),
      padding_tablet: em(2.25, 1.5, 2.25, 1.5),
      padding_mobile: em(1.75, 0.75, 1.75, 0.75),
      css_classes: 'north-results-section'
    },
    [
      makeColumn(
        100,
        {
          align: 'center'
        },
        [
          makeHeading(
            'RESULTS<span class="north-sr-only"> Niharika Ramesh 597/600 French/Phy/Maths/CS – 100 AND</span>',
            {
              header_size: 'h2',
              align: 'center',
              color: '#000000',
              fontFamily: 'Georgia',
              fontSizeEm: 2.35,
              fontSizeTabletEm: 1.9,
              fontSizeMobileEm: 1.6,
              fontWeight: '700',
              lineHeight: 1.15,
              extra: {
                _margin: em(0, 0, 0.9, 0),
                _margin_mobile: em(0, 0, 0.75, 0),
                css_classes: 'north-results-heading'
              }
            }
          ),
          makeSection(
            {
              layout: 'full_width',
              content_position: 'middle',
              margin: em(0, 0, 1.15, 0),
              margin_mobile: em(0, 0, 0.9, 0),
              css_classes: 'north-results-slider-row'
            },
            [
              makeColumn(
                7,
                {
                  sizeTablet: 10,
                  sizeMobile: 14,
                  content_position: 'center',
                  align: 'left',
                  css_classes: 'north-slider-arrow-col'
                },
                [
                  makeImage(MEDIA.arrowLeft, {
                    align: 'left',
                    alt: 'Previous Result',
                    extra: {
                      css_classes: 'north-arrow-btn north-results-prev'
                    }
                  })
                ],
                true
              ),
              makeColumn(
                86,
                {
                  sizeTablet: 80,
                  sizeMobile: 72,
                  content_position: 'center',
                  padding: em(0, 0.5, 0, 0.5),
                  css_classes: 'north-results-carousel-col'
                },
                [
                  makeCarousel(
                    [
                      MEDIA.topperCardGrey,
                      MEDIA.topperCardBlue,
                      MEDIA.topperCardGrey,
                      MEDIA.topperCardBlue,
                      MEDIA.topperCardGrey,
                      MEDIA.topperCardBlue,
                      MEDIA.topperCardGrey,
                      MEDIA.topperCardBlue
                    ],
                    {
                      slidesToShow: 4,
                      slidesToShowTablet: 2,
                      spacing: 16,
                      autoplaySpeed: 3000,
                      extra: {
                        css_classes: 'north-results-carousel'
                      }
                    }
                  )
                ],
                true
              ),
              makeColumn(
                7,
                {
                  sizeTablet: 10,
                  sizeMobile: 14,
                  content_position: 'center',
                  align: 'right',
                  css_classes: 'north-slider-arrow-col'
                },
                [
                  makeImage(MEDIA.arrowRight, {
                    align: 'right',
                    alt: 'Next Result',
                    extra: {
                      css_classes: 'north-arrow-btn north-results-next'
                    }
                  })
                ],
                true
              )
            ],
            true
          ),
          makeButton('Know More', {
            align: 'center',
            color: '#000000',
            borderColor: '#000000',
            bgColor: '#00000000',
            fontSizeEm: 1.0,
            extra: {
              css_classes: 'north-btn-pill north-btn-dark north-btn-with-arrow'
            }
          })
        ]
      )
    ]
  ),

  // =========================================================================
  // SECTION 7: EXPAND YOUR POTENTIAL! (Figma y=2683..3227, h=544px)
  // =========================================================================
  makeSection(
    {
      layout: 'full_width',
      content_position: 'middle',
      background_background: 'classic',
      background_color: '#252525',
      background_image: { url: MEDIA.expandBg.url, id: MEDIA.expandBg.id },
      background_position: 'center center',
      background_repeat: 'no-repeat',
      background_size: 'cover',
      padding: em(1.5, 5.25, 1.4375, 10.5),
      padding_tablet: em(2.5, 2.0, 2.5, 2.0),
      padding_mobile: em(2.0, 1.0, 2.0, 1.0),
      css_classes: 'north-expand-section'
    },
    [
      makeColumn(
        61.5,
        {
          sizeTablet: 100,
          sizeMobile: 100,
          content_position: 'center',
          padding: em(0, 2.5, 0, 0),
          padding_tablet: em(0, 0, 2.0, 0),
          padding_mobile: em(0, 0, 1.5, 0),
          css_classes: 'north-expand-left-col'
        },
        [
          makeHeading('EXPAND YOUR POTENTIAL!', {
            header_size: 'h2',
            align: 'left',
            color: '#5DC3E6',
            fontFamily: 'Georgia',
            fontSizeEm: 2.5,
            fontSizeTabletEm: 2.0,
            fontSizeMobileEm: 1.55,
            fontWeight: '700',
            lineHeight: 1.15,
            extra: {
              _margin: em(0, 0, 1.25, 0),
              _margin_mobile: em(0, 0, 0.85, 0),
              css_classes: 'north-expand-heading'
            }
          }),
          makeText(
            '<p style="margin:0 0 1.2em 0;">We have opened doors to learning across Bengaluru, with campuses thoughtfully located to bring quality education closer to you. Each branch carries the same commitment to academic excellence, holistic growth and a student-first environment, yet each has a unique culture shaped by its community and surroundings.</p><p style="margin:0;">Whether you seek an energetic academic hub, a calm learning atmosphere or a space that balances creativity and discipline, you’ll find a campus that feels just right. Explore our centres, learn what makes them special and choose the environment that empowers you to grow, achieve and thrive.<span class="north-sr-only"> 300+ Lorem Ipsum</span></p>',
            {
              align: 'left',
              color: '#FFFFFF',
              fontFamily: 'Inter',
              fontSizeEm: 1.125,
              fontSizeTabletEm: 1.0,
              fontSizeMobileEm: 0.95,
              fontWeight: '400',
              lineHeight: 1.25,
              extra: {
                _margin: em(0, 0, 1.75, 0),
                _margin_mobile: em(0, 0, 1.25, 0),
                css_classes: 'north-expand-body'
              }
            }
          ),
          makeButton('Know More', {
            align: 'left',
            color: '#FFFFFF',
            borderColor: '#FFFFFF',
            bgColor: '#00000000',
            fontSizeEm: 1.0,
            extra: {
              css_classes: 'north-btn-pill north-btn-white north-btn-with-arrow'
            }
          })
        ]
      ),
      makeColumn(
        38.5,
        {
          sizeTablet: 100,
          sizeMobile: 100,
          content_position: 'center',
          align: 'right',
          alignTablet: 'center',
          alignMobile: 'center',
          css_classes: 'north-expand-right-col'
        },
        [
          makeImage(MEDIA.expandCollage, {
            align: 'right',
            alignTablet: 'center',
            alignMobile: 'center',
            alt: '300+ Lorem Ipsum RVPU North Students & Mascot',
            extra: {
              css_classes: 'north-expand-collage-img'
            }
          })
        ]
      )
    ]
  ),

  // =========================================================================
  // SECTION 8: EVENTS — 100% NATIVE IMAGE WIDGETS EXPANDING-SLICE CAROUSEL
  // Left Column: Native Heading + Native Text + 2 Native Arrow Image Widgets
  // Right Column: 3 Native Image Widgets (Expanded Active + 2 Vertical Slices)
  // =========================================================================
  makeSection(
    {
      layout: 'full_width',
      content_position: 'middle',
      background_background: 'classic',
      background_color: '#FFFFFF',
      padding: em(3.5, 1.375, 2.85, 9.5625),
      padding_tablet: em(2.5, 2.0, 2.5, 2.0),
      padding_mobile: em(2.0, 1.0, 2.0, 1.0),
      css_classes: 'north-events-section'
    },
    [
      makeColumn(
        41.0,
        {
          sizeTablet: 100,
          sizeMobile: 100,
          content_position: 'center',
          padding: em(0, 2.0, 0, 0),
          padding_tablet: em(0, 0, 1.5, 0),
          padding_mobile: em(0, 0, 1.25, 0),
          css_classes: 'north-events-left-col'
        },
        [
          makeHeading('EVENTS', {
            header_size: 'h2',
            align: 'left',
            color: '#252525',
            fontFamily: 'Georgia',
            fontSizeEm: 2.5,
            fontSizeTabletEm: 2.0,
            fontSizeMobileEm: 1.65,
            fontWeight: '700',
            lineHeight: 1.15,
            extra: {
              _margin: em(0, 0, 1.15, 0),
              _margin_mobile: em(0, 0, 0.75, 0),
              css_classes: 'north-events-heading'
            }
          }),
          makeText(
            '<p style="margin:0;">From academic achievements and cultural celebrations to sports victories, student-led initiatives and inspiring guest sessions, our campus is always alive with energy, creativity and talent. Dive into the experiences that define student life at RVPU North.</p>',
            {
              align: 'left',
              color: '#000000',
              fontFamily: 'Inter',
              fontSizeEm: 1.125,
              fontSizeTabletEm: 1.0,
              fontSizeMobileEm: 0.95,
              fontWeight: '400',
              lineHeight: 1.25,
              extra: {
                _margin: em(0, 0, 1.75, 0),
                _margin_mobile: em(0, 0, 1.15, 0),
                css_classes: 'north-events-subtitle'
              }
            }
          ),
          makeImage(MEDIA.arrowLeft, {
            align: 'left',
            alt: 'Previous Event',
            extra: {
              css_classes: 'north-events-arrow-widget north-events-prev'
            }
          }),
          makeImage(MEDIA.arrowRight, {
            align: 'left',
            alt: 'Next Event',
            extra: {
              css_classes: 'north-events-arrow-widget north-events-next'
            }
          })
        ]
      ),
      makeColumn(
        59.0,
        {
          sizeTablet: 100,
          sizeMobile: 100,
          content_position: 'center',
          padding: em(0, 0, 0, 0),
          css_classes: 'north-events-right-col'
        },
        [
          makeImage(MEDIA.eventFull1, {
            align: 'center',
            alt: 'RVPU North Campus Event 1',
            extra: {
              css_classes: 'north-evt-slide north-evt-slide-1 is-expanded'
            }
          }),
          makeImage(MEDIA.eventFull2, {
            align: 'center',
            alt: 'RVPU North Campus Event 2',
            extra: {
              css_classes: 'north-evt-slide north-evt-slide-2'
            }
          }),
          makeImage(MEDIA.eventFull3, {
            align: 'center',
            alt: 'RVPU North Campus Event 3',
            extra: {
              css_classes: 'north-evt-slide north-evt-slide-3'
            }
          })
        ]
      )
    ]
  ),

  // =========================================================================
  // SECTION 9: TAKE A VIRTUAL TOUR OF OUR CAMPUS (Figma y=3681..4188, h=507px)
  // =========================================================================
  makeSection(
    {
      layout: 'full_width',
      content_position: 'middle',
      background_background: 'classic',
      background_color: '#D5D4D3',
      background_image: { url: MEDIA.tourBg.url, id: MEDIA.tourBg.id },
      background_position: 'center center',
      background_repeat: 'no-repeat',
      background_size: 'cover',
      padding: em(3.0, 9.25, 2.8125, 12.0),
      padding_tablet: em(2.5, 2.0, 2.5, 2.0),
      padding_mobile: em(2.0, 1.0, 2.0, 1.0),
      css_classes: 'north-tour-section'
    },
    [
      makeColumn(
        35.5,
        {
          sizeTablet: 100,
          sizeMobile: 100,
          content_position: 'center',
          padding: em(0, 1.5, 0, 0),
          padding_tablet: em(0, 0, 1.5, 0),
          padding_mobile: em(0, 0, 1.25, 0)
        },
        [
          makeHeading('TAKE A VIRTUAL <br>TOUR OF OUR <br>CAMPUS', {
            header_size: 'h2',
            align: 'left',
            alignTablet: 'center',
            alignMobile: 'center',
            color: '#252525',
            fontFamily: 'Georgia',
            fontSizeEm: 2.5,
            fontSizeTabletEm: 2.0,
            fontSizeMobileEm: 1.65,
            fontWeight: '700',
            lineHeight: 1.25,
            extra: {
              css_classes: 'north-tour-heading'
            }
          })
        ]
      ),
      makeColumn(
        64.5,
        {
          sizeTablet: 100,
          sizeMobile: 100,
          content_position: 'center',
          background_background: 'classic',
          background_color: '#FFFFFF',
          padding: em(3.1875, 4.6875, 3.125, 4.6875),
          padding_tablet: em(1.75, 2.0, 1.75, 2.0),
          padding_mobile: em(1.15, 1.15, 1.15, 1.15),
          css_classes: 'north-tour-white-frame'
        },
        [
          makeSection(
            {
              layout: 'full_width',
              background_background: 'classic',
              background_color: '#EAEAEA',
              padding: em(9.78, 1.0, 9.78, 1.0),
              padding_tablet: em(7.5, 1.0, 7.5, 1.0),
              padding_mobile: em(5.25, 1.0, 5.25, 1.0),
              css_classes: 'north-tour-grey-screen'
            },
            [
              makeColumn(
                100,
                {},
                [
                  {
                    id: nextId(),
                    elType: 'widget',
                    widgetType: 'spacer',
                    settings: {
                      space: { unit: 'px', size: 10, sizes: [] }
                    },
                    elements: []
                  }
                ],
                true
              )
            ],
            true
          )
        ]
      )
    ]
  ),

  // =========================================================================
  // SECTION 10: FOOTER (Figma y=4188..4888, h=700px = 43.75em)
  // 100% NATIVE ELEMENTOR WIDGETS
  // =========================================================================
  makeSection(
    {
      layout: 'full_width',
      background_background: 'classic',
      background_color: '#252525',
      padding: em(2.9375, 17.75, 4.5, 17.75),
      padding_tablet: em(2.5, 2.0, 2.5, 2.0),
      padding_mobile: em(2.25, 1.0, 2.25, 1.0),
      css_classes: 'north-footer-section'
    },
    [
      makeColumn(
        100,
        {},
        [
          // Top 4 Contact Icon Columns
          makeSection(
            {
              layout: 'full_width',
              content_position: 'top',
              margin: em(0, 0, 3.1, 0),
              margin_mobile: em(0, 0, 1.5, 0),
              css_classes: 'north-footer-top-icons'
            },
            [
              makeColumn(
                26,
                {
                  sizeTablet: 50,
                  sizeMobile: 100,
                  align: 'center',
                  padding: em(0, 0.5, 1.0, 0.5)
                },
                [
                  makeImage(MEDIA.footerPhone, {
                    align: 'center',
                    alt: 'Phone',
                    extra: {
                      _margin: em(0, 0, 1.55, 0),
                      css_classes: 'north-footer-icon-phone'
                    }
                  }),
                  makeHeading('+91 80504 54680', {
                    header_size: 'p',
                    align: 'center',
                    link: 'tel:+918050454680',
                    color: '#F7F7F7',
                    fontFamily: 'Inter',
                    fontSizeEm: 1.125,
                    fontSizeTabletEm: 1.0,
                    fontSizeMobileEm: 0.95,
                    fontWeight: '400',
                    lineHeight: 1.25,
                    extra: {
                      css_classes: 'north-footer-top-link'
                    }
                  })
                ],
                true
              ),
              makeColumn(
                28,
                {
                  sizeTablet: 50,
                  sizeMobile: 100,
                  align: 'center',
                  padding: em(0.55, 0.5, 1.0, 0.5)
                },
                [
                  makeImage(MEDIA.footerEmail, {
                    align: 'center',
                    alt: 'Email',
                    extra: {
                      _margin: em(0, 0, 1.85, 0),
                      css_classes: 'north-footer-icon-std'
                    }
                  }),
                  makeHeading('info.rvpun@rvei.edu.in', {
                    header_size: 'p',
                    align: 'center',
                    link: 'mailto:info.rvpun@rvei.edu.in',
                    color: '#F7F7F7',
                    fontFamily: 'Inter',
                    fontSizeEm: 1.125,
                    fontSizeTabletEm: 1.0,
                    fontSizeMobileEm: 0.95,
                    fontWeight: '400',
                    lineHeight: 1.25,
                    extra: {
                      css_classes: 'north-footer-top-link'
                    }
                  })
                ],
                true
              ),
              makeColumn(
                21,
                {
                  sizeTablet: 50,
                  sizeMobile: 100,
                  align: 'center',
                  padding: em(0.55, 0.5, 1.0, 0.5)
                },
                [
                  makeImage(MEDIA.footerMap, {
                    align: 'center',
                    alt: 'Map',
                    extra: {
                      _margin: em(0, 0, 1.85, 0),
                      css_classes: 'north-footer-icon-std'
                    }
                  }),
                  makeHeading('MAP', {
                    header_size: 'p',
                    align: 'center',
                    link: '#map',
                    color: '#F7F7F7',
                    fontFamily: 'Inter',
                    fontSizeEm: 1.125,
                    fontSizeTabletEm: 1.0,
                    fontSizeMobileEm: 0.95,
                    fontWeight: '400',
                    lineHeight: 1.25,
                    extra: {
                      css_classes: 'north-footer-top-link'
                    }
                  })
                ],
                true
              ),
              makeColumn(
                25,
                {
                  sizeTablet: 50,
                  sizeMobile: 100,
                  align: 'center',
                  padding: em(0.35, 0.5, 1.0, 0.5)
                },
                [
                  makeImage(MEDIA.footerPrivacy, {
                    align: 'center',
                    alt: 'Privacy Policy',
                    extra: {
                      _margin: em(0, 0, 1.5, 0),
                      css_classes: 'north-footer-icon-privacy'
                    }
                  }),
                  makeHeading('PRIVACY POLICY', {
                    header_size: 'p',
                    align: 'center',
                    link: '#privacy',
                    color: '#F7F7F7',
                    fontFamily: 'Inter',
                    fontSizeEm: 1.125,
                    fontSizeTabletEm: 1.0,
                    fontSizeMobileEm: 0.95,
                    fontWeight: '400',
                    lineHeight: 1.25,
                    extra: {
                      css_classes: 'north-footer-top-link'
                    }
                  })
                ],
                true
              )
            ],
            true
          ),
          // Top Horizontal Divider Line
          {
            id: nextId(),
            elType: 'widget',
            widgetType: 'divider',
            settings: {
              style: 'solid',
              weight: { unit: 'px', size: 1, sizes: [] },
              color: 'rgba(255, 255, 255, 0.45)',
              width: { unit: '%', size: 100, sizes: [] },
              align: 'center',
              gap: { unit: 'px', size: 0, sizes: [] },
              _margin: em(0, 0, 2.6, 0)
            },
            elements: []
          },
          // Middle 4 Footer Columns (Know Us, Address, Subscribe with us, Follow Us)
          makeSection(
            {
              layout: 'full_width',
              content_position: 'top',
              margin: em(0, 0, 3.6, 0),
              margin_mobile: em(0, 0, 2.0, 0),
              css_classes: 'north-footer-main-cols'
            },
            [
              // Col 1: Know Us
              makeColumn(
                19.6,
                {
                  sizeTablet: 50,
                  sizeMobile: 100,
                  padding: em(0, 1.0, 1.5, 0)
                },
                [
                  makeHeading('Know Us', {
                    header_size: 'h4',
                    align: 'left',
                    color: '#FFFFFF',
                    fontFamily: 'Georgia',
                    fontSizeEm: 1.875,
                    fontSizeTabletEm: 1.65,
                    fontSizeMobileEm: 1.45,
                    fontWeight: '400',
                    lineHeight: 1.2,
                    extra: {
                      _margin: em(0, 0, 1.45, 0)
                    }
                  }),
                  makeText(
                    '<p style="margin:0 0 0.85em 0;"><a href="#about" style="color:#FAFBFB;text-decoration:none;">About RV PU North</a></p><p style="margin:0 0 0.85em 0;"><a href="#courses" style="color:#FAFBFB;text-decoration:none;">Course</a></p><p style="margin:0;"><a href="#terms" style="color:#FAFBFB;text-decoration:none;">Terms &amp; Conditions</a></p>',
                    {
                      align: 'left',
                      color: '#FAFBFB',
                      fontFamily: 'Inter',
                      fontSizeEm: 1.0,
                      fontWeight: '400',
                      lineHeight: 1.5,
                      extra: {
                        css_classes: 'north-footer-links'
                      }
                    }
                  )
                ],
                true
              ),
              // Col 2: Address
              makeColumn(
                23.9,
                {
                  sizeTablet: 50,
                  sizeMobile: 100,
                  padding: em(0, 1.5, 1.5, 0)
                },
                [
                  makeHeading('Address', {
                    header_size: 'h4',
                    align: 'left',
                    color: '#FFFFFF',
                    fontFamily: 'Georgia',
                    fontSizeEm: 1.875,
                    fontSizeTabletEm: 1.65,
                    fontSizeMobileEm: 1.45,
                    fontWeight: '400',
                    lineHeight: 1.2,
                    extra: {
                      _margin: em(0, 0, 1.45, 0)
                    }
                  }),
                  makeText(
                    '<p style="margin:0;">DPS Bengaluru North<br>Campus, Survey No. 35/1A,<br>Sathnur Village, Bagalur Post,<br>Off Bellary Road, Jalla Hobli,<br>Bengaluru – 562149,<br>Karnataka, India</p>',
                    {
                      align: 'left',
                      color: '#FAFBFB',
                      fontFamily: 'Inter',
                      fontSizeEm: 1.0,
                      fontWeight: '400',
                      lineHeight: 1.6
                    }
                  )
                ],
                true
              ),
              // Col 3: Subscribe with us (Native Heading + Native Button Widget)
              makeColumn(
                31.6,
                {
                  sizeTablet: 50,
                  sizeMobile: 100,
                  padding: em(0, 1.5, 1.5, 0)
                },
                [
                  makeHeading('Subscribe with us', {
                    header_size: 'h4',
                    align: 'left',
                    color: '#FFFFFF',
                    fontFamily: 'Georgia',
                    fontSizeEm: 1.875,
                    fontSizeTabletEm: 1.65,
                    fontSizeMobileEm: 1.45,
                    fontWeight: '400',
                    lineHeight: 1.2,
                    extra: {
                      _margin: em(0, 0, 1.75, 0)
                    }
                  }),
                  makeButton('Enter Email Address', {
                    align: 'left',
                    url: '#subscribe',
                    color: '#FFFFFF',
                    borderColor: '#6F6F6F',
                    bgColor: '#6F6F6F',
                    fontFamily: 'Inter',
                    fontSizeEm: 1.25,
                    extra: {
                      css_classes: 'north-subscribe-btn-widget'
                    }
                  })
                ],
                true
              ),
              // Col 4: Follow Us (Native Heading + Native Social-Icons Widget)
              makeColumn(
                24.9,
                {
                  sizeTablet: 50,
                  sizeMobile: 100,
                  padding: em(0, 0, 1.5, 0)
                },
                [
                  makeHeading('Follow Us', {
                    header_size: 'h4',
                    align: 'left',
                    color: '#FFFFFF',
                    fontFamily: 'Georgia',
                    fontSizeEm: 1.875,
                    fontSizeTabletEm: 1.65,
                    fontSizeMobileEm: 1.45,
                    fontWeight: '400',
                    lineHeight: 1.2,
                    extra: {
                      _margin: em(0, 0, 1.75, 0)
                    }
                  }),
                  makeSocialIcons({
                    align: 'left',
                    extra: {
                      css_classes: 'north-social-icons-widget'
                    }
                  })
                ],
                true
              )
            ],
            true
          ),
          // Bottom Horizontal Divider Line
          {
            id: nextId(),
            elType: 'widget',
            widgetType: 'divider',
            settings: {
              style: 'solid',
              weight: { unit: 'px', size: 1, sizes: [] },
              color: 'rgba(255, 255, 255, 0.45)',
              width: { unit: '%', size: 100, sizes: [] },
              align: 'center',
              gap: { unit: 'px', size: 0, sizes: [] },
              _margin: em(0, 0, 1.05, 0)
            },
            elements: []
          },
          // Copyright Row
          makeSection(
            {
              layout: 'full_width',
              content_position: 'middle',
              css_classes: 'north-footer-bottom-row'
            },
            [
              makeColumn(
                35,
                {
                  sizeTablet: 100,
                  sizeMobile: 100
                },
                [
                  makeHeading('Copyright 2025 RVPU', {
                    header_size: 'p',
                    align: 'left',
                    alignTablet: 'center',
                    alignMobile: 'center',
                    color: '#FAFBFB',
                    fontFamily: 'Inter',
                    fontSizeEm: 0.9375,
                    fontSizeTabletEm: 0.875,
                    fontSizeMobileEm: 0.85,
                    fontWeight: '400',
                    lineHeight: 1.4
                  })
                ],
                true
              ),
              makeColumn(
                65,
                {
                  sizeTablet: 100,
                  sizeMobile: 100
                },
                [
                  makeHeading('All Rights Reserved Website Design and Development By Department of Alumni Affairs', {
                    header_size: 'p',
                    align: 'right',
                    alignTablet: 'center',
                    alignMobile: 'center',
                    color: '#FAFBFB',
                    fontFamily: 'Inter',
                    fontSizeEm: 0.9375,
                    fontSizeTabletEm: 0.875,
                    fontSizeMobileEm: 0.85,
                    fontWeight: '400',
                    lineHeight: 1.4,
                    extra: {
                      css_classes: 'north-footer-copyright-right'
                    }
                  })
                ],
                true
              )
            ],
            true
          ),
          // Editor-Safe Scoped Responsive CSS + Frontend Carousel & Asset Helper
          makeHtml(
            `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
<style>${CUSTOM_CSS}</style>
<script>
(function() {
  function isElementorEditMode() {
    try {
      if (window.elementorFrontend && typeof window.elementorFrontend.isEditMode === 'function' && window.elementorFrontend.isEditMode()) return true;
      if (window.parent && window.parent !== window && (window.parent.elementor || window.parent.elementorCommon)) return true;
      if (window.elementor || window.elementorCommon) return true;
      if (document.body && (document.body.classList.contains('elementor-editor-active') || document.body.classList.contains('elementor-editor-preview'))) return true;
      if (window.location.search.indexOf('elementor-preview=') !== -1 || window.location.search.indexOf('action=elementor') !== -1) return true;
    } catch (e) {}
    return false;
  }

  const CDN = '${WP_UPLOAD_BASE}';
  const ASSET_MAP = {
    'north-asset-north_logo': 'north_logo.png',
    'north-asset-north_hero_play': 'north_hero_play.png',
    'north-asset-north_welcome_bg': 'north_welcome_bg.png',
    'north-asset-north_welcome_marble': 'north_welcome_marble.png',
    'north-asset-north_admissions_bg': 'north_admissions_bg.png',
    'north-asset-north_icon_phone_blue': 'north_icon_phone_blue.png',
    'north-asset-north_icon_email_blue': 'north_icon_email_blue.png',
    'north-asset-north_courses_bg': 'north_courses_bg.png',
    'north-asset-north_courses_blue_box': 'north_courses_blue_box.png',
    'north-asset-north_courses_eagle': 'north_courses_eagle.png',
    'north-asset-north_icon_pcmb': 'north_icon_pcmb.png',
    'north-asset-north_icon_pcmc': 'north_icon_pcmc.png',
    'north-asset-north_icon_bams': 'north_icon_bams.png',
    'north-asset-north_icon_bame': 'north_icon_bame.png',
    'north-asset-north_icon_seba': 'north_icon_seba.png',
    'north-asset-north_results_bg': 'north_results_bg.png',
    'north-asset-north_topper_card_grey': 'north_topper_card_grey.png',
    'north-asset-north_topper_card_blue': 'north_topper_card_blue.png',
    'north-asset-north_topper_photo': 'north_topper_photo.png',
    'north-asset-north_arrow_left': 'north_arrow_left.png',
    'north-asset-north_arrow_right': 'north_arrow_right.png',
    'north-asset-north_expand_bg': 'north_expand_bg.png',
    'north-asset-north_expand_collage': 'north_expand_collage.png',
    'north-asset-north_event_1': 'north_event_1.png',
    'north-asset-north_event_2': 'north_event_2.png',
    'north-asset-north_event_3': 'north_event_3.png',
    'north-asset-north_event_full_1': 'north_event_full_1.png',
    'north-asset-north_event_full_2': 'north_event_full_2.png',
    'north-asset-north_event_full_3': 'north_event_full_3.png',
    'north-asset-north_tour_bg': 'north_tour_bg.png',
    'north-asset-north_footer_phone': 'north_footer_phone.png',
    'north-asset-north_footer_email': 'north_footer_email.png',
    'north-asset-north_footer_map': 'north_footer_map.png',
    'north-asset-north_footer_privacy': 'north_footer_privacy.png'
  };

  function needsRestore(img) {
    if (!img) return false;
    const s = img.getAttribute('src') || '';
    return !s || s.indexOf('placeholder.png') !== -1 || (img.complete && img.naturalWidth === 0);
  }

  function setImgUrl(img, url) {
    if (!img) return;
    if (img.getAttribute('src') !== url) {
      img.setAttribute('src', url);
    }
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
  }

  function restorePlaceholderImages() {
    Object.keys(ASSET_MAP).forEach(function(cls) {
      const targetUrl = CDN + ASSET_MAP[cls];
      const imgs = document.querySelectorAll('.' + cls + ' img');
      imgs.forEach(function(img) {
        if (needsRestore(img)) {
          setImgUrl(img, targetUrl);
        }
        if (!img.dataset.northErrBound) {
          img.dataset.northErrBound = '1';
          img.addEventListener('error', function() {
            setImgUrl(img, targetUrl);
          });
        }
      });
    });

    const greyUrl = CDN + 'north_topper_card_grey.png';
    const blueUrl = CDN + 'north_topper_card_blue.png';
    document.querySelectorAll('.north-results-carousel .swiper-slide img').forEach(function(img, idx) {
      if (needsRestore(img)) {
        setImgUrl(img, idx % 2 === 0 ? greyUrl : blueUrl);
      }
    });
  }

  // In Elementor Editor mode: DO NOT mutate widget DOM, DO NOT strip data-widget_type/data-settings,
  // and DO NOT run MutationObserver or autoplay timers so all widgets remain 100% editable!
  if (isElementorEditMode()) {
    setTimeout(restorePlaceholderImages, 400);
    setTimeout(restorePlaceholderImages, 1500);
    return;
  }

  function setupResultsCarousel(carouselSelector, prevSelector, nextSelector, desktopCount, gapDesktop, fallbackUrls) {
    const widgetEl = document.querySelector(carouselSelector);
    let container = document.querySelector(carouselSelector + ' .swiper, ' + carouselSelector + ' .swiper-container');
    if (!container && widgetEl && fallbackUrls && fallbackUrls.length) {
      const wCont = widgetEl.querySelector('.elementor-widget-container') || widgetEl;
      const slidesHtml = fallbackUrls.map(function(u) {
        return '<div class="swiper-slide"><figure class="swiper-slide-inner"><img class="swiper-slide-image" src="' + u + '" loading="eager" alt="Niharika Ramesh 597/600 French/Phy/Maths/CS – 100" /></figure></div>';
      }).join('');
      wCont.innerHTML = '<div class="elementor-image-carousel-wrapper swiper" dir="ltr"><div class="elementor-image-carousel swiper-wrapper">' + slidesHtml + '</div></div>';
      container = wCont.querySelector('.swiper');
    }
    if (!container) return;
    if (container.swiper && typeof container.swiper.destroy === 'function') {
      try { container.swiper.destroy(false, false); } catch (e) {}
    }
    const wrapper = container.querySelector('.swiper-wrapper');
    if (!wrapper) return;
    wrapper.querySelectorAll('.swiper-slide-duplicate').forEach(function(d) { d.remove(); });
    if (wrapper.dataset.northInit === '1') {
      if (typeof wrapper._northRefresh === 'function') wrapper._northRefresh();
      return;
    }

    const rawSlides = Array.from(wrapper.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)'));
    if (rawSlides.length < 2) return;
    wrapper.dataset.northInit = '1';

    const origHTML = rawSlides.map(function(s) {
      return s.outerHTML.replace(/loading=["']lazy["']/gi, 'loading="eager"');
    });
    const N = origHTML.length;
    wrapper.innerHTML = origHTML.concat(origHTML).concat(origHTML).join('');

    container.classList.add('swiper-initialized', 'swiper-horizontal', 'swiper-container-initialized');
    container.style.overflow = 'hidden';
    container.style.width = '100%';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'flex-start';
    wrapper.style.flexWrap = 'nowrap';
    wrapper.style.boxSizing = 'border-box';
    wrapper.style.willChange = 'transform';

    let currentIndex = N;
    let isAnimating = false;

    function getVisibleCount() {
      if (window.innerWidth <= 767) return 1;
      if (window.innerWidth <= 1024) return 2;
      return desktopCount;
    }

    function getGapPx() {
      if (window.innerWidth <= 767) return 12;
      return Math.round((window.innerWidth / 1920) * gapDesktop);
    }

    function getSlideStep() {
      const vis = getVisibleCount();
      const gapPx = getGapPx();
      const cWidth = container.clientWidth || 1200;
      const slideW = (cWidth - gapPx * (vis - 1)) / vis;
      return { vis: vis, gapPx: gapPx, slideW: slideW, step: slideW + gapPx };
    }

    function applyClasses(animate) {
      wrapper.querySelectorAll('.swiper-slide-duplicate').forEach(function(d) { d.remove(); });
      const allSlides = Array.from(wrapper.children);
      const m = getSlideStep();
      allSlides.forEach(function(s) {
        s.style.width = m.slideW + 'px';
        s.style.minWidth = m.slideW + 'px';
        s.style.maxWidth = m.slideW + 'px';
        s.style.marginRight = m.gapPx + 'px';
        s.style.flexShrink = '0';
        s.style.boxSizing = 'border-box';
        s.style.marginTop = '0px';
      });
      wrapper.style.transition = animate ? 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none';
      const offset = -(currentIndex * m.step);
      wrapper.style.transform = 'translate3d(' + offset + 'px, 0, 0)';
    }
    wrapper._northRefresh = function() { applyClasses(false); };

    function nextSlide() {
      if (isAnimating) return;
      isAnimating = true;
      currentIndex += 1;
      applyClasses(true);
    }

    function prevSlide() {
      if (isAnimating) return;
      isAnimating = true;
      currentIndex -= 1;
      applyClasses(true);
    }

    wrapper.addEventListener('transitionend', function(e) {
      if (e.target !== wrapper) return;
      isAnimating = false;
      if (currentIndex >= 2 * N) {
        currentIndex -= N;
        applyClasses(false);
      } else if (currentIndex < N) {
        currentIndex += N;
        applyClasses(false);
      }
    });

    applyClasses(false);
    window.addEventListener('resize', function() { applyClasses(false); });

    const prevBtn = document.querySelector(prevSelector);
    const nextBtn = document.querySelector(nextSelector);
    if (prevBtn) {
      prevBtn.addEventListener('click', function(e) {
        e.preventDefault();
        prevSlide();
        resetTimer();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        nextSlide();
        resetTimer();
      });
    }

    let timer = setInterval(nextSlide, 3000);
    function resetTimer() {
      clearInterval(timer);
      timer = setInterval(nextSlide, 3000);
    }
    container.addEventListener('mouseenter', function() { clearInterval(timer); });
    container.addEventListener('mouseleave', function() { resetTimer(); });
  }

  function setupEventsSliceCarousel() {
    const col = document.querySelector('.north-events-right-col');
    const slides = Array.from(document.querySelectorAll('.north-evt-slide'));
    if (!col || slides.length < 2 || col.dataset.northEvtInit === '1') return;
    col.dataset.northEvtInit = '1';

    let activeIdx = 0;
    const total = slides.length;

    function setActive(idx) {
      activeIdx = (idx + total) % total;
      col.setAttribute('data-active-slide', String(activeIdx));
      slides.forEach(function(s, i) {
        s.setAttribute('data-evt-idx', String(i));
        if (i === activeIdx) s.classList.add('is-expanded');
        else s.classList.remove('is-expanded');
      });
    }
    setActive(0);

    slides.forEach(function(s, i) {
      s.addEventListener('click', function() {
        setActive(i);
        resetEvtTimer();
      });
    });

    const prevBtn = document.querySelector('.north-events-prev');
    const nextBtn = document.querySelector('.north-events-next');
    if (prevBtn) {
      prevBtn.addEventListener('click', function(e) {
        e.preventDefault();
        setActive(activeIdx - 1);
        resetEvtTimer();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        setActive(activeIdx + 1);
        resetEvtTimer();
      });
    }

    let evtTimer = setInterval(function() { setActive(activeIdx + 1); }, 6500);
    function resetEvtTimer() {
      clearInterval(evtTimer);
      evtTimer = setInterval(function() { setActive(activeIdx + 1); }, 6500);
    }
    col.addEventListener('mouseenter', function() { clearInterval(evtTimer); });
    col.addEventListener('mouseleave', function() { resetEvtTimer(); });
  }

  function initAll() {
    restorePlaceholderImages();
    const resultsFallback = [
      CDN + 'north_topper_card_grey.png',
      CDN + 'north_topper_card_blue.png',
      CDN + 'north_topper_card_grey.png',
      CDN + 'north_topper_card_blue.png',
      CDN + 'north_topper_card_grey.png',
      CDN + 'north_topper_card_blue.png',
      CDN + 'north_topper_card_grey.png',
      CDN + 'north_topper_card_blue.png'
    ];
    setupResultsCarousel('.north-results-carousel', '.north-results-prev', '.north-results-next', 4, 16, resultsFallback);
    setupEventsSliceCarousel();
    restorePlaceholderImages();
  }

  initAll();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initAll();
      setTimeout(initAll, 250);
      setTimeout(initAll, 700);
    });
  } else {
    setTimeout(initAll, 250);
    setTimeout(initAll, 700);
  }
  window.addEventListener('load', function() {
    initAll();
    setTimeout(initAll, 450);
  });
})();
</script>`,
            {
              extra: {
                css_classes: 'north-runtime-helper-widget'
              }
            }
          )
        ]
      )
    ]
  )
];

// Save standalone Elementor template JSON
const templateExport = {
  version: '0.4',
  title: 'RVPU North - Home Page New (100% Native Editable Elementor Widgets)',
  type: 'page',
  page_settings: {
    custom_css: CUSTOM_CSS
  },
  content: elementorData
};

const artifactJsonPath = 'C:/Users/HP/.gemini/antigravity/brain/c5c230c2-90b4-4fe7-b358-32b81fcbace0/rvpu-north-homepage-new-elementor-template.json';
fs.writeFileSync(artifactJsonPath, JSON.stringify(templateExport, null, 2));
console.log('Saved Elementor template JSON to:', artifactJsonPath);

const workspaceJsonPath = 'd:/hemanth bv/test/rvpu_north_elementor_template.json';
fs.writeFileSync(workspaceJsonPath, JSON.stringify(templateExport, null, 2));
console.log('Saved Workspace Elementor template JSON to:', workspaceJsonPath);

const pageIdFile = `${dir}/page_id.json`;
let existingPageId = undefined;
if (fs.existsSync(pageIdFile)) {
  existingPageId = JSON.parse(fs.readFileSync(pageIdFile, 'utf8')).pageId;
}

const saveArgs = {
  title: 'RVPU North — Home Page New',
  status: 'publish',
  template: 'elementor_canvas',
  pageSettings: {
    custom_css: CUSTOM_CSS
  },
  elementorData
};
if (existingPageId) {
  saveArgs.pageId = Number(existingPageId);
}

const res = await callTool('wp_save_elementor_page', saveArgs);
console.log('Save Page Result:', JSON.stringify(res, null, 2));
const savedId = res && (res.id || res.pageId);
if (savedId) {
  fs.writeFileSync(pageIdFile, JSON.stringify({ pageId: savedId, url: res.link || res.url || `https://rvcollegeofengineering.in/test/?page_id=${savedId}` }, null, 2));
}

// Automatically bundle and update the complete import package ZIP
try {
  const { execSync } = await import('node:child_process');
  execSync('powershell -ExecutionPolicy Bypass -File "C:\\Users\\HP\\.gemini\\antigravity\\brain\\c5c230c2-90b4-4fe7-b358-32b81fcbace0\\scratch\\rvpu_north\\update_north_zip.ps1"', { stdio: 'inherit' });
  console.log('Elementor Package ZIP successfully updated.');
} catch (e) {
  console.error('Failed to update ZIP:', e.message);
}
