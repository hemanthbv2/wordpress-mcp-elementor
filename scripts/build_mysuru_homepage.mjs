process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import fs from 'node:fs';
import { callTool } from '../rvps/mcp.mjs';

let idCounter = 3000000;
function nextId() {
  idCounter += 1;
  return idCounter.toString(16).slice(-7).padStart(7, '0');
}

// Responsive box helper using 'em' by default for all padding and margin settings
// On desktop (1920px = 120em), 1em = 16px in Figma
function em(top, right, bottom, left, unit = 'em') {
  return {
    unit,
    top: String(top),
    right: String(right),
    bottom: String(bottom),
    left: String(left),
    isLinked: false
  };
}

function withWidgetClasses(extra = {}) {
  if (extra.css_classes && !extra._css_classes) {
    return { ...extra, _css_classes: extra.css_classes };
  }
  return extra;
}

function makeSection(settings = {}, columns = [], isInner = false) {
  return {
    id: nextId(),
    elType: 'section',
    isInner,
    settings: {
      layout: isInner ? 'boxed' : 'full_width',
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
      _inline_size: size,
      ...(settings.sizeTablet !== undefined ? { _inline_size_tablet: settings.sizeTablet } : {}),
      ...(settings.sizeMobile !== undefined ? { _inline_size_mobile: settings.sizeMobile } : {}),
      ...settings
    },
    elements: widgets
  };
}

// Heading widget using 'em' for desktop, tablet, and mobile font-size, line-height, and margins
// Global Typography Scale:
// - Main Headings: Georgia 2.5em (Desktop), 2.2em (Tablet), 2.0em (Mobile)
// - Subheadings:   Georgia 2.0em (Desktop), 1.8em (Tablet), 1.6em (Mobile)
function makeHeading(title, settings = {}) {
  const desktopEm = settings.fontSizeEm ?? 2.5;
  const tabletEm = settings.fontSizeTabletEm ?? 2.2;
  const mobileEm = settings.fontSizeMobileEm ?? 2.0;

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
      title_color: settings.color || '#000000',
      typography_typography: 'custom',
      typography_font_family: settings.fontFamily || 'Georgia',
      typography_font_size: { unit: 'em', size: desktopEm, sizes: [] },
      typography_font_size_tablet: { unit: 'em', size: tabletEm, sizes: [] },
      typography_font_size_mobile: { unit: 'em', size: mobileEm, sizes: [] },
      typography_font_weight: String(settings.fontWeight || '700'),
      typography_line_height: { unit: 'em', size: settings.lineHeight || 1.25, sizes: [] },
      ...withWidgetClasses(settings.extra)
    },
    elements: []
  };
}

// Text Editor widget using 'em' for desktop, tablet, and mobile font-size, line-height, and margins
// Global Body Scale: Inter 1.0em (Desktop, Tablet, Mobile)
function makeText(editorHtml, settings = {}) {
  const desktopEm = settings.fontSizeEm ?? 1.0;
  const tabletEm = settings.fontSizeTabletEm ?? 1.0;
  const mobileEm = settings.fontSizeMobileEm ?? 1.0;

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
      typography_font_size: { unit: 'em', size: desktopEm, sizes: [] },
      typography_font_size_tablet: { unit: 'em', size: tabletEm, sizes: [] },
      typography_font_size_mobile: { unit: 'em', size: mobileEm, sizes: [] },
      typography_font_weight: String(settings.fontWeight || '400'),
      typography_line_height: { unit: 'em', size: settings.lineHeight || 1.45, sizes: [] },
      ...withWidgetClasses(settings.extra)
    },
    elements: []
  };
}

// Image widget with responsive % / em sizing + automatic asset class for zero-placeholder fallback restoration
function makeImage(media, settings = {}) {
  const rawExtra = settings.extra || {};
  const mergedClasses = [rawExtra.css_classes, media.assetClass].filter(Boolean).join(' ');
  const extraWithAsset = {
    ...rawExtra,
    ...(mergedClasses ? { css_classes: mergedClasses } : {})
  };

  return {
    id: nextId(),
    elType: 'widget',
    widgetType: 'image',
    settings: {
      image: { url: media.url, id: media.id },
      image_size: 'full',
      align: settings.align || 'center',
      ...(settings.alignTablet ? { align_tablet: settings.alignTablet } : {}),
      ...(settings.alignMobile ? { align_mobile: settings.alignMobile } : {}),
      ...(settings.width ? { width: { unit: settings.widthUnit || '%', size: settings.width, sizes: [] } } : {}),
      ...(settings.widthTablet ? { width_tablet: { unit: settings.widthTabletUnit || settings.widthUnit || '%', size: settings.widthTablet, sizes: [] } } : {}),
      ...(settings.widthMobile ? { width_mobile: { unit: settings.widthMobileUnit || settings.widthUnit || '%', size: settings.widthMobile, sizes: [] } } : {}),
      ...(settings.borderRadius ? { image_border_radius: em(settings.borderRadius, settings.borderRadius, settings.borderRadius, settings.borderRadius, 'em') } : {}),
      ...withWidgetClasses(extraWithAsset)
    },
    elements: []
  };
}

// Button widget using 'em' for font-size, border-radius, and text_padding
// In RVPU Mysuru, all "Know More" buttons are 183x60px (11.4375em x 3.75em) orange-bordered pills (#E58D4D)
function makeButton(text, settings = {}) {
  const desktopEm = settings.fontSizeEm ?? 1.0;
  const tabletEm = settings.fontSizeTabletEm ?? 1.0;
  const mobileEm = settings.fontSizeMobileEm ?? 0.95;

  return {
    id: nextId(),
    elType: 'widget',
    widgetType: 'button',
    settings: {
      text,
      link: { url: settings.url || '#', is_external: false, nofollow: false },
      align: settings.align || 'left',
      ...(settings.alignTablet ? { align_tablet: settings.alignTablet } : {}),
      ...(settings.alignMobile ? { align_mobile: settings.alignMobile } : {}),
      size: 'md',
      typography_typography: 'custom',
      typography_font_family: settings.fontFamily || 'Inter',
      typography_font_size: { unit: 'em', size: desktopEm, sizes: [] },
      typography_font_size_tablet: { unit: 'em', size: tabletEm, sizes: [] },
      typography_font_size_mobile: { unit: 'em', size: mobileEm, sizes: [] },
      typography_font_weight: String(settings.fontWeight || '400'),
      button_text_color: settings.color || '#E58D4D',
      background_color: settings.bgColor || '#00000000',
      border_border: 'solid',
      border_width: em(0.0625, 0.0625, 0.0625, 0.0625, 'em'),
      border_color: settings.borderColor || '#E58D4D',
      border_radius: em(2.2, 2.2, 2.2, 2.2, 'em'),
      text_padding: em(0.85, 1.85, 0.85, 1.85, 'em'),
      ...withWidgetClasses(settings.extra)
    },
    elements: []
  };
}

// Native Elementor Image Carousel widget for Results section
function makeCarousel(mediaList, settings = {}) {
  return {
    id: nextId(),
    elType: 'widget',
    widgetType: 'image-carousel',
    settings: {
      carousel: mediaList.map((m) => ({ id: m.id, url: m.url })),
      thumbnail_size: 'full',
      slides_to_show: String(settings.slidesToShow || 5),
      slides_to_show_tablet: String(settings.slidesToShowTablet || 2),
      slides_to_show_mobile: '1',
      slides_to_scroll: '1',
      image_stretch: 'no',
      navigation: settings.navigation || 'none',
      autoplay: 'yes',
      pause_on_hover: 'yes',
      pause_on_interaction: 'yes',
      autoplay_speed: settings.autoplaySpeed || 2800,
      infinite: 'yes',
      speed: 600,
      image_spacing: 'custom',
      image_spacing_custom: { unit: 'px', size: settings.spacing ?? 28, sizes: [] },
      ...withWidgetClasses(settings.extra)
    },
    elements: []
  };
}

const mediaMap = JSON.parse(
  fs.readFileSync('C:/Users/HP/.gemini/antigravity/brain/c5c230c2-90b4-4fe7-b358-32b81fcbace0/scratch/rvpu_mysuru/media_map.json', 'utf8')
);
const GITHUB_ASSET_BASE = 'https://rvcollegeofengineering.in/test/wp-content/uploads/2026/10/';
const M = (filename) => {
  const entry = mediaMap[filename] || {};
  const cleanKey = filename.replace(/\.[^.]+$/, '').replace(/[^a-z0-9_-]/gi, '-');
  return {
    id: entry.id || '',
    // Clean .png URL without query string so WordPress wp_check_filetype(basename($url)) succeeds on Elementor JSON import
    url: `${GITHUB_ASSET_BASE}${filename}`,
    filename,
    assetClass: `mysuru-asset-${cleanKey}`
  };
};

const MEDIA = {
  logo: M('mysuru_logo.png'),
  headerMenu: M('mysuru_header_menu.png'),
  heroPlay: M('mysuru_hero_play.png'),
  welcomeLeftBg: M('mysuru_welcome_left_bg.png'),
  welcomeCampus: M('mysuru_welcome_campus.png'),
  admissionsBg: M('mysuru_admissions_bg.png'),
  iconPhoneOrange: M('mysuru_icon_phone_orange.png'),
  iconEmailOrange: M('mysuru_icon_email_orange.png'),
  coursesBg: M('mysuru_courses_bg.png'),
  courseCardBg: M('mysuru_course_card_bg.png'),
  courseLineDots: M('mysuru_course_line_dots.png'),
  coursesMascot: M('mysuru_courses_mascot.png'),
  iconPcmb: M('mysuru_icon_pcmb.png'),
  iconPcmc: M('mysuru_icon_pcmc.png'),
  iconBams: M('mysuru_icon_bams.png'),
  iconBame: M('mysuru_icon_bame.png'),
  iconSeba: M('mysuru_icon_seba.png'),
  topperCardFull: M('mysuru_topper_card_full.png'),
  topperPhoto: M('mysuru_topper_photo.png'),
  arrowLeft: M('mysuru_arrow_left.png'),
  arrowRight: M('mysuru_arrow_right.png'),
  exploreBg: M('mysuru_explore_bg.png'),
  exploreStudents: M('mysuru_explore_students.png'),
  eventCenter: M('mysuru_event_center.png'),
  eventPanel1: M('mysuru_event_panel_1.png'),
  eventPanel2: M('mysuru_event_panel_2.png'),
  eventPanel3: M('mysuru_event_panel_3.png'),
  eventPanel4: M('mysuru_event_panel_4.png'),
  eventPanel5: M('mysuru_event_panel_5.png'),
  tourBg: M('mysuru_tour_bg.png'),
  footerPhone: M('mysuru_footer_phone.png'),
  footerEmail: M('mysuru_footer_email.png'),
  footerMap: M('mysuru_footer_map.png'),
  footerPrivacy: M('mysuru_footer_privacy.png')
};

// Helper for each Course Card in RVPU Mysuru (619x166px = 38.6875em x 10.375em)
// Built as a 100% Native Elementor Inner Section with:
// - Left Inner Column: White Rounded Square (58x52px = 3.625em x 3.25em, #FFFFFF, border-radius: 0.3125em) + Course Icon
// - Right Inner Column: Course Code Subheading (Georgia 2.0em Desktop / 1.8em Tablet / 1.6em Mobile) + Horizontal White Line with Dots + 4 Subject Items with Triangle Bullets (Inter 1.0em)
function makeMysuruCourseCard(code, iconMedia, subjects, isBottom = false, extraClass = '') {
  const subjectsHtml = `<div class="mysuru-course-subjects-row">${subjects
    .map((s) => `<span class="mysuru-course-subject"><span class="mysuru-tri">&#9654;</span><span class="mysuru-subj-label">${s}</span></span>`)
    .join('')}</div>`;

  return makeSection(
    {
      layout: 'full_width',
      content_position: 'middle',
      gap: 'no',
      background_background: 'classic',
      background_color: '#D48146',
      background_image: { url: MEDIA.courseCardBg.url, id: MEDIA.courseCardBg.id },
      background_position: 'center center',
      background_repeat: 'no-repeat',
      background_size: 'cover',
      border_radius: em(0.9375, 0.9375, 0.9375, 0.9375),
      margin: em(0, 0, isBottom ? 0 : 1.875, 0),
      margin_tablet: em(0, 0, 1.25, 0),
      margin_mobile: em(0, 0, 1.15, 0),
      padding: em(1.5, 1.5, 1.35, 1.65),
      padding_tablet: em(1.25, 1.25, 1.25, 1.25),
      padding_mobile: em(1.15, 1.0, 1.15, 1.0),
      css_classes: `mysuru-course-card ${extraClass}`.trim()
    },
    [
      // Left Column: White Rounded Square (58x52px = 3.625em x 3.25em)
      makeColumn(
        13,
        {
          sizeTablet: 15,
          sizeMobile: 100,
          content_position: 'center',
          align: 'center',
          background_background: 'classic',
          background_color: '#FFFFFF',
          border_radius: em(0.3125, 0.3125, 0.3125, 0.3125),
          css_classes: 'mysuru-course-icon-box'
        },
        [
          makeImage(iconMedia, {
            align: 'center',
            extra: {
              _margin: em(0, 0, 0, 0),
              css_classes: 'mysuru-course-icon-widget'
            }
          })
        ],
        true
      ),
      // Right Column: Course Code Heading + Dotted Line + 4 Subject Bullets
      makeColumn(
        87,
        {
          sizeTablet: 85,
          sizeMobile: 100,
          content_position: 'center',
          padding: em(0, 0, 0, 1.2),
          padding_tablet: em(0, 0, 0, 1.0),
          padding_mobile: em(0.65, 0, 0, 0),
          css_classes: 'mysuru-course-content-col'
        },
        [
          makeHeading(
            `<span class="mysuru-course-code-wrap"><span class="mysuru-course-code-text">${code}</span><span class="mysuru-course-dotted-line"><span class="mysuru-line-dot"></span><span class="mysuru-line-bar"></span><span class="mysuru-line-dot"></span></span></span>`,
            {
              header_size: 'h4',
              align: 'left',
              alignMobile: 'center',
              color: '#FFFFFF',
              fontFamily: 'Georgia',
              fontSizeEm: 2.0,
              fontSizeTabletEm: 1.8,
              fontSizeMobileEm: 1.6,
              fontWeight: '700',
              lineHeight: 1.1,
              extra: {
                _margin: em(0, 0, 0.35, 0),
                css_classes: 'mysuru-course-code-heading'
              }
            }
          ),
          makeText(subjectsHtml, {
            align: 'left',
            alignMobile: 'center',
            color: '#FFFFFF',
            fontFamily: 'Inter',
            fontSizeEm: 1.0,
            fontSizeTabletEm: 1.0,
            fontSizeMobileEm: 1.0,
            fontWeight: '400',
            lineHeight: 1.25,
            extra: {
              _margin: em(0, 0, 0, 0),
              css_classes: 'mysuru-course-subjects-widget'
            }
          })
        ],
        true
      )
    ],
    true
  );
}

// Native HTML widget for custom code
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

// Dedicated Mobile Course Card matching reference image media_1793170580302_5dffaa10.png
// Split header: White icon box + Peach/cream course code box
// Body: Vertically stacked subject rows with filled white triangle bullets
function makeMobileCourseCard(code, iconMedia, subjects) {
  const subjectsHtml = subjects
    .map(
      (s) =>
        `<div class="mysuru-mob-sub-item"><span class="mysuru-mob-sub-arrow">&#9654;</span><span class="mysuru-mob-sub-text">${s}</span></div>`
    )
    .join('');

  const cardHtml = `
<div class="mysuru-mob-course-card">
  <div class="mysuru-mob-card-head">
    <div class="mysuru-mob-card-icon-box">
      <img src="${iconMedia.url}" alt="${code}" class="mysuru-mob-card-icon" />
    </div>
    <div class="mysuru-mob-card-code-box">
      <span class="mysuru-mob-card-code-text">${code}</span>
    </div>
  </div>
  <div class="mysuru-mob-card-body">
    ${subjectsHtml}
  </div>
</div>`.trim();

  return makeHtml(cardHtml, {
    extra: {
      _margin: em(0, 0, 1.35, 0),
      _margin_mobile: em(0, 0, 1.25, 0),
      css_classes: 'mysuru-mob-card-widget'
    }
  });
}

const elementorData = [
  // =========================================================================
  // SECTION 1: HEADER BAR (Figma y=0..167, h=167px = 10.4375em)
  // Logo at x=68, y=32, w=257, h=104 (16.0625em x 6.5em)
  // Menu at x=1744, y=0, w=176, h=167 (Black 3-bar hamburger + "Menu")
  // =========================================================================
  makeSection(
    {
      layout: 'full_width',
      content_position: 'middle',
      background_background: 'classic',
      background_color: '#FFFFFF',
      border_border: 'solid',
      border_width: em(0, 0, 0.0625, 0),
      border_color: '#707070',
      padding: em(0, 2.25, 0, 4.25),
      padding_tablet: em(0, 1.5, 0, 2.0),
      padding_mobile: em(0, 1.0, 0, 1.0),
      css_classes: 'mysuru-header-section'
    },
    [
      makeColumn(
        90,
        {
          sizeTablet: 84,
          sizeMobile: 76,
          content_position: 'center',
          padding: em(1.9, 0, 1.9, 0),
          padding_tablet: em(1.1, 0, 1.1, 0),
          padding_mobile: em(0.75, 0, 0.75, 0),
          css_classes: 'mysuru-header-logo-col'
        },
        [
          makeImage(MEDIA.logo, {
            align: 'left',
            extra: {
              css_classes: 'mysuru-logo-img'
            }
          })
        ]
      ),
      makeColumn(
        10,
        {
          sizeTablet: 16,
          sizeMobile: 24,
          content_position: 'center',
          align: 'center',
          padding: em(1.5, 0, 1.25, 4.9),
          padding_tablet: em(1.0, 0.5, 1.0, 0.5),
          padding_mobile: em(0.75, 0.25, 0.75, 0.25),
          css_classes: 'mysuru-header-menu-col'
        },
        [
          {
            id: nextId(),
            elType: 'widget',
            widgetType: 'divider',
            settings: {
              style: 'solid',
              weight: { unit: 'px', size: 8, sizes: [] },
              color: '#000000',
              width: { unit: 'px', size: 68, sizes: [] },
              align: 'center',
              gap: { unit: 'px', size: 0, sizes: [] },
              _margin: em(0, 0, 0.55, 0),
              css_classes: 'mysuru-menu-bar'
            },
            elements: []
          },
          {
            id: nextId(),
            elType: 'widget',
            widgetType: 'divider',
            settings: {
              style: 'solid',
              weight: { unit: 'px', size: 8, sizes: [] },
              color: '#000000',
              width: { unit: 'px', size: 68, sizes: [] },
              align: 'center',
              gap: { unit: 'px', size: 0, sizes: [] },
              _margin: em(0, 0, 0.55, 0),
              css_classes: 'mysuru-menu-bar'
            },
            elements: []
          },
          {
            id: nextId(),
            elType: 'widget',
            widgetType: 'divider',
            settings: {
              style: 'solid',
              weight: { unit: 'px', size: 8, sizes: [] },
              color: '#000000',
              width: { unit: 'px', size: 68, sizes: [] },
              align: 'center',
              gap: { unit: 'px', size: 0, sizes: [] },
              _margin: em(0, 0, 0.45, 0),
              css_classes: 'mysuru-menu-bar'
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
            lineHeight: 1.15
          })
        ]
      )
    ]
  ),

  // =========================================================================
  // SECTION 2: HERO VIDEO BANNER (Figma y=159..690, h=531px = 33.1875em)
  // Play button at x=877, y=375, w=166, h=166 (10.375em x 10.375em)
  // =========================================================================
  makeSection(
    {
      layout: 'full_width',
      content_position: 'middle',
      background_background: 'classic',
      background_color: '#3C3C3C',
      padding: em(11.4, 2.0, 11.4, 2.0),
      padding_tablet: em(8.5, 1.5, 8.5, 1.5),
      padding_mobile: em(6.0, 1.25, 6.0, 1.25),
      css_classes: 'mysuru-hero-section'
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
            extra: {
              css_classes: 'mysuru-play-btn-widget'
            }
          })
        ]
      )
    ]
  ),

  // =========================================================================
  // SECTION 3: WELCOME TO RV PU COLLEGE, MYSURU (Figma y=690..1290, h=600px = 37.5em)
  // Left Column (1120px = 58.333%): Aged Paper + Twin Dasara Elephants (mysuru_welcome_left_bg.png)
  // Right Column (800px = 41.667%): Campus Photo + White Curtain + Eagle Mascot (mysuru_welcome_campus.png)
  // =========================================================================
  makeSection(
    {
      layout: 'full_width',
      content_position: 'middle',
      background_background: 'classic',
      background_color: '#FBF6EE',
      padding: em(0, 0, 0, 0),
      css_classes: 'mysuru-welcome-section'
    },
    [
      makeColumn(
        58.333,
        {
          sizeTablet: 100,
          sizeMobile: 100,
          content_position: 'center',
          background_background: 'classic',
          background_color: '#FBF6EE',
          background_image: { url: MEDIA.welcomeLeftBg.url, id: MEDIA.welcomeLeftBg.id },
          background_position: 'center center',
          background_repeat: 'no-repeat',
          background_size: 'cover',
          padding: em(5.5, 4.5, 3.5, 9.5),
          padding_tablet: em(3.0, 2.0, 3.0, 2.0),
          padding_mobile: em(2.25, 1.25, 2.25, 1.25),
          css_classes: 'mysuru-welcome-left-col'
        },
        [
          makeHeading(
            '<span style="color:#252525;">Welcome to</span><br><span style="color:#E58D4D;">RV PU College, Mysuru</span>',
            {
              header_size: 'h1',
              align: 'left',
              color: '#252525',
              fontFamily: 'Georgia',
              fontSizeEm: 2.5,
              fontSizeTabletEm: 2.2,
              fontSizeMobileEm: 2.0,
              fontWeight: '700',
              lineHeight: 1.28,
              extra: {
                _margin: em(0, 0, 0.85, 0.35),
                _margin_tablet: em(0, 0, 0.75, 0),
                _margin_mobile: em(0, 0, 0.65, 0),
                css_classes: 'mysuru-welcome-heading'
              }
            }
          ),
          makeText(
            '<p style="margin:0 0 1.25em 0;">Welcome to RV PU College, Mysuru, where our mission is to provide a positive learning environment that encourages students to reach their full potential.</p><p style="margin:0;">We are a pre-university college, offering comprehensive education for young adults to prepare for their university studies. Our college provides an excellent learning environment with experienced and knowledgeable faculty, modern facilities and abundant resources. We strive to provide our students with the best academic and personal growth opportunities, so that they can become well-rounded and successful individuals.</p>',
            {
              align: 'left',
              color: '#252525',
              fontFamily: 'Inter',
              fontSizeEm: 1.0,
              fontSizeTabletEm: 1.0,
              fontSizeMobileEm: 1.0,
              fontWeight: '400',
              lineHeight: 1.38,
              extra: {
                _margin: em(0, 0, 2.0, 0),
                _margin_mobile: em(0, 0, 1.5, 0),
                css_classes: 'mysuru-welcome-body'
              }
            }
          ),
          makeButton('Know More', {
            align: 'left',
            color: '#E58D4D',
            borderColor: '#E58D4D',
            bgColor: '#00000000',
            fontSizeEm: 1.0,
            extra: {
              _margin: em(0, 0, 0, 0.75),
              _margin_tablet: em(0, 0, 0, 0),
              _margin_mobile: em(0, 0, 0, 0),
              css_classes: 'mysuru-btn-pill mysuru-btn-orange'
            }
          })
        ]
      ),
      makeColumn(
        41.667,
        {
          sizeTablet: 100,
          sizeMobile: 100,
          content_position: 'center',
          padding: em(0, 0, 0, 0),
          css_classes: 'mysuru-welcome-right-col'
        },
        [
          makeImage(MEDIA.welcomeCampus, {
            align: 'center',
            width: 100,
            widthUnit: '%',
            extra: {
              _margin: em(0, 0, 0, 0),
              css_classes: 'mysuru-welcome-campus-img'
            }
          })
        ]
      )
    ]
  ),

  // =========================================================================
  // SECTION 4A: ADMISSIONS OPEN 2026-2027 TOP BANNER BAR (Figma y=1290..1379, h=89px = 5.5625em)
  // Background: #5D5B59 with 1px solid #E58D4D top and bottom border
  // =========================================================================
  makeSection(
    {
      layout: 'full_width',
      content_position: 'middle',
      background_background: 'classic',
      background_color: '#5D5B59',
      border_border: 'solid',
      border_width: em(0.0625, 0, 0.0625, 0),
      border_color: '#E58D4D',
      padding: em(1.1, 1.5, 1.1, 1.5),
      padding_tablet: em(1.0, 1.25, 1.0, 1.25),
      padding_mobile: em(0.9, 0.75, 0.9, 0.75),
      css_classes: 'mysuru-admissions-top-bar'
    },
    [
      makeColumn(
        100,
        {
          content_position: 'center',
          align: 'center'
        },
        [
          makeHeading(
            '<span class="mysuru-adm-open-label">ADMISSIONS OPEN</span> <span class="mysuru-adm-orange-box">2026-2027</span>',
            {
              header_size: 'h2',
              align: 'center',
              color: '#FFFFFF',
              fontFamily: 'Georgia',
              fontSizeEm: 2.5,
              fontSizeTabletEm: 2.2,
              fontSizeMobileEm: 2.0,
              fontWeight: '700',
              lineHeight: 1.15,
              extra: {
                _margin: em(0, 0, 0, 0),
                css_classes: 'mysuru-adm-top-heading'
              }
            }
          )
        ]
      )
    ]
  ),

  // =========================================================================
  // SECTION 4B: ADMISSIONS ENQUIRIES BAND (Figma y=1379..1558, h=179px = 11.1875em)
  // Background: mysuru_admissions_bg.png (#323130 + waves + floral corner motifs)
  // =========================================================================
  makeSection(
    {
      layout: 'full_width',
      content_position: 'middle',
      background_background: 'classic',
      background_color: '#323130',
      background_image: { url: MEDIA.admissionsBg.url, id: MEDIA.admissionsBg.id },
      background_position: 'center center',
      background_repeat: 'no-repeat',
      background_size: 'cover',
      padding: em(1.35, 2.0, 1.35, 2.0),
      padding_tablet: em(1.5, 1.5, 1.5, 1.5),
      padding_mobile: em(1.35, 1.0, 1.35, 1.0),
      css_classes: 'mysuru-admissions-section'
    },
    [
      makeColumn(
        100,
        {
          align: 'center'
        },
        [
          makeSection(
            {
              layout: 'full_width',
              content_position: 'middle',
              margin: em(0, 0, 1.1, 0),
              css_classes: 'mysuru-adm-enquiries-row'
            },
            [
              makeColumn(
                45,
                {
                  sizeTablet: 100,
                  sizeMobile: 100,
                  content_position: 'center',
                  padding: em(0.25, 0.5, 0.25, 0.5)
                },
                [
                  makeHeading('For Admissions Enquiries:', {
                    header_size: 'h4',
                    align: 'right',
                    alignTablet: 'center',
                    alignMobile: 'center',
                    color: '#FFFFFF',
                    fontFamily: 'Georgia',
                    fontSizeEm: 2.0,
                    fontSizeTabletEm: 1.8,
                    fontSizeMobileEm: 1.6,
                    fontWeight: '400',
                    lineHeight: 1.2
                  })
                ],
                true
              ),
              makeColumn(
                22,
                {
                  sizeTablet: 50,
                  sizeMobile: 100,
                  content_position: 'center',
                  padding: em(0.25, 0.5, 0.25, 0.5),
                  css_classes: 'mysuru-adm-contact-col'
                },
                [
                  makeImage(MEDIA.iconPhoneOrange, {
                    align: 'left',
                    extra: {
                      css_classes: 'mysuru-adm-icon-widget'
                    }
                  }),
                  makeHeading('<a href="tel:8317346585" style="color:#FFFFFF;text-decoration:none;">8317346585</a>', {
                    header_size: 'span',
                    align: 'left',
                    color: '#FFFFFF',
                    fontFamily: 'Inter',
                    fontSizeEm: 1.0,
                    fontSizeTabletEm: 1.0,
                    fontSizeMobileEm: 1.0,
                    fontWeight: '400',
                    lineHeight: 1.2,
                    extra: {
                      css_classes: 'mysuru-adm-contact-text'
                    }
                  })
                ],
                true
              ),
              makeColumn(
                33,
                {
                  sizeTablet: 50,
                  sizeMobile: 100,
                  content_position: 'center',
                  padding: em(0.25, 0.5, 0.25, 0.5),
                  css_classes: 'mysuru-adm-contact-col'
                },
                [
                  makeImage(MEDIA.iconEmailOrange, {
                    align: 'left',
                    extra: {
                      css_classes: 'mysuru-adm-icon-widget'
                    }
                  }),
                  makeHeading('<a href="mailto:info.rvpus@rvei.edu.in" style="color:#FFFFFF;text-decoration:none;">info.rvpus@rvei.edu.in</a>', {
                    header_size: 'span',
                    align: 'left',
                    color: '#FFFFFF',
                    fontFamily: 'Inter',
                    fontSizeEm: 1.0,
                    fontSizeTabletEm: 1.0,
                    fontSizeMobileEm: 1.0,
                    fontWeight: '400',
                    lineHeight: 1.2,
                    extra: {
                      css_classes: 'mysuru-adm-contact-text'
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
            color: '#E58D4D',
            borderColor: '#E58D4D',
            bgColor: '#00000000',
            fontSizeEm: 1.0,
            extra: {
              css_classes: 'mysuru-btn-pill mysuru-btn-orange'
            }
          })
        ]
      )
    ]
  ),

  // =========================================================================
  // SECTION 5: COURSES OFFERED (Figma y=1558..2399, h=841px = 52.5625em)
  // Background: mysuru_courses_bg.png (1920x841 cream grid + left/right rangoli)
  // Layout:
  // - Heading: COURSES OFFERED (Georgia 700, 2.5em)
  // - 3-Column Row:
  //   - Left Column (38.1%): PCMB Card + BAMS Card
  //   - Center Column (23.8%): Thinking Eagle Mascot (mysuru_courses_mascot.png, 341x468px)
  //   - Right Column (38.1%): PCMC Card + BAME Card
  // - Centered Bottom Card: SEBA Card (619x166px = 38.6875em x 10.375em)
  // - Bottom "Know More ->" Pill Button
  // =========================================================================
  makeSection(
    {
      layout: 'full_width',
      background_background: 'classic',
      background_color: '#F6ECDC',
      background_image: { url: MEDIA.coursesBg.url, id: MEDIA.coursesBg.id },
      background_position: 'center center',
      background_repeat: 'no-repeat',
      background_size: 'cover',
      padding: em(1.65, 9.0, 2.15, 9.5),
      padding_tablet: em(2.25, 1.5, 2.25, 1.5),
      padding_mobile: em(2.0, 1.0, 2.0, 1.0),
      hide_tablet: 'yes',
      hide_mobile: 'yes',
      css_classes: 'mysuru-courses-section mysuru-courses-desktop-section'
    },
    [
      makeColumn(
        100,
        {
          align: 'center'
        },
        [
          makeHeading('COURSES OFFERED', {
            header_size: 'h2',
            align: 'center',
            color: '#000000',
            fontFamily: 'Georgia',
            fontSizeEm: 2.5,
            fontSizeTabletEm: 2.2,
            fontSizeMobileEm: 2.0,
            fontWeight: '700',
            lineHeight: 1.2,
            extra: {
              _margin: em(0, 0, 1.85, 0),
              _margin_tablet: em(0, 0, 1.25, 0),
              _margin_mobile: em(0, 0, 1.15, 0)
            }
          }),
          // Top 3-Column Grid (PCMB/BAMS Left + Thinking Mascot Center + PCMC/BAME Right)
          makeSection(
            {
              layout: 'full_width',
              content_position: 'top',
              gap: 'no',
              margin: em(0, 0, 0, 0),
              css_classes: 'mysuru-courses-top-grid'
            },
            [
              makeColumn(
                38.1,
                {
                  sizeTablet: 100,
                  sizeMobile: 100,
                  padding: em(0, 0, 0, 0),
                  css_classes: 'mysuru-courses-left-col'
                },
                [
                  makeMysuruCourseCard('PCMB', MEDIA.iconPcmb, ['Physics', 'Mathematics', 'Chemistry', 'Biology'], false),
                  makeMysuruCourseCard('BAMS', MEDIA.iconBams, ['Business<br>Studies', 'Basic<br>Mathematics', 'Accountancy', 'Statistics'], true)
                ],
                true
              ),
              makeColumn(
                23.8,
                {
                  sizeTablet: 100,
                  sizeMobile: 100,
                  content_position: 'center',
                  align: 'center',
                  padding: em(0, 0.25, 0, 0.25),
                  css_classes: 'mysuru-courses-mascot-col'
                },
                [
                  makeImage(MEDIA.coursesMascot, {
                    align: 'center',
                    extra: {
                      _margin: em(-0.85, 0, 0, 0),
                      _margin_tablet: em(0.5, 0, 0.5, 0),
                      _margin_mobile: em(0.25, 0, 0.5, 0),
                      css_classes: 'mysuru-courses-mascot-widget'
                    }
                  })
                ],
                true
              ),
              makeColumn(
                38.1,
                {
                  sizeTablet: 100,
                  sizeMobile: 100,
                  padding: em(0, 0, 0, 0),
                  css_classes: 'mysuru-courses-right-col'
                },
                [
                  makeMysuruCourseCard('PCMC', MEDIA.iconPcmc, ['Physics', 'Mathematics', 'Chemistry', 'Computer<br>Science'], false),
                  makeMysuruCourseCard('BAME', MEDIA.iconBame, ['Business<br>Studies', 'Basic<br>Mathematics', 'Accountancy', 'Economics'], true)
                ],
                true
              )
            ],
            true
          ),
          // Bottom Centered SEBA Card
          makeMysuruCourseCard(
            'SEBA',
            MEDIA.iconSeba,
            ['Statistics', 'Business<br>Studies', 'Economics', 'Accountancy'],
            true,
            'mysuru-course-card-seba'
          ),
          makeButton('Know More', {
            align: 'center',
            color: '#E58D4D',
            borderColor: '#E58D4D',
            bgColor: '#00000000',
            fontSizeEm: 1.0,
            extra: {
              _margin: em(2.25, 0, 0, 0),
              _margin_tablet: em(1.5, 0, 0, 0),
              _margin_mobile: em(1.25, 0, 0, 0),
              css_classes: 'mysuru-btn-pill mysuru-btn-orange'
            }
          })
        ]
      )
    ]
  ),

  // =========================================================================
  // SECTION 5B: COURSES OFFERED (MOBILE DEDICATED - Reference Parity)
  // Visible on Tablet and Mobile (<= 1024px), Hidden on Desktop (> 1024px)
  // Exact layout matching reference image media_1793170580302_5dffaa10.png:
  // - Centered Header: COURSES OFFERED
  // - Thinking Mascot (mysuru_courses_mascot.png)
  // - 5 Vertical Cards: PCMC, PCMB, BAMS, BAME, SEBA
  // - Bottom Pill Button: "Know More >"
  // =========================================================================
  makeSection(
    {
      layout: 'full_width',
      background_background: 'classic',
      background_color: '#F6ECDC',
      background_image: { url: MEDIA.coursesBg.url, id: MEDIA.coursesBg.id },
      background_position: 'center top',
      background_repeat: 'no-repeat',
      background_size: 'cover',
      padding: em(2.25, 1.25, 2.5, 1.25),
      padding_tablet: em(2.25, 1.25, 2.5, 1.25),
      padding_mobile: em(1.85, 0.75, 2.25, 0.75),
      hide_desktop: 'yes',
      hide_tablet: 'no',
      hide_mobile: 'no',
      css_classes: 'mysuru-courses-mobile-section'
    },
    [
      makeColumn(
        100,
        {
          align: 'center',
          css_classes: 'mysuru-courses-mobile-inner-col'
        },
        [
          makeHeading('COURSES OFFERED', {
            header_size: 'h2',
            align: 'center',
            color: '#000000',
            fontFamily: 'Georgia',
            fontSizeEm: 2.2,
            fontSizeTabletEm: 2.0,
            fontSizeMobileEm: 1.85,
            fontWeight: '700',
            lineHeight: 1.2,
            extra: {
              _margin: em(0, 0, 1.15, 0),
              css_classes: 'mysuru-mob-courses-heading'
            }
          }),
          makeImage(MEDIA.coursesMascot, {
            align: 'center',
            extra: {
              _margin: em(0, 0, 1.35, 0),
              css_classes: 'mysuru-mob-courses-mascot-img'
            }
          }),
          makeMobileCourseCard('PCMC', MEDIA.iconPcmc, ['Physics', 'Mathematics', 'Chemistry', 'Computer Science']),
          makeMobileCourseCard('PCMB', MEDIA.iconPcmb, ['Physics', 'Mathematics', 'Chemistry', 'Biology']),
          makeMobileCourseCard('BAMS', MEDIA.iconBams, ['Business Studies', 'Basic Mathematics', 'Accountancy', 'Statistics']),
          makeMobileCourseCard('BAME', MEDIA.iconBame, ['Business Studies', 'Basic Mathematics', 'Accountancy', 'Economics']),
          makeMobileCourseCard('SEBA', MEDIA.iconSeba, ['Statistics', 'Business Studies', 'Economics', 'Accountancy']),
          makeButton('Know More &gt;', {
            align: 'center',
            color: '#D48146',
            borderColor: '#D48146',
            bgColor: '#00000000',
            fontSizeEm: 0.95,
            extra: {
              _margin: em(0.85, 0, 0, 0),
              css_classes: 'mysuru-btn-pill mysuru-mob-courses-btn'
            }
          })
        ]
      )
    ]
  ),

  // =========================================================================
  // SECTION 6: RESULTS (Figma y=2399..3068, h=669px = 41.8125em)
  // 5 Staggered Topper Cards (Niharika Ramesh, 283x357px each) + Orange Circular Arrows
  // =========================================================================
  makeSection(
    {
      layout: 'full_width',
      background_background: 'classic',
      background_color: '#FFFFFF',
      padding: em(1.75, 5.5, 2.0, 5.5),
      padding_tablet: em(2.25, 1.5, 2.25, 1.5),
      padding_mobile: em(2.0, 0.75, 2.0, 0.75),
      css_classes: 'mysuru-results-section'
    },
    [
      makeColumn(
        100,
        {
          align: 'center'
        },
        [
          makeHeading('RESULTS', {
            header_size: 'h2',
            align: 'center',
            color: '#E58D4D',
            fontFamily: 'Georgia',
            fontSizeEm: 2.5,
            fontSizeTabletEm: 2.2,
            fontSizeMobileEm: 2.0,
            fontWeight: '700',
            lineHeight: 1.2,
            extra: {
              _margin: em(0, 0, 1.65, 0),
              _margin_mobile: em(0, 0, 1.2, 0)
            }
          }),
          makeSection(
            {
              layout: 'full_width',
              content_position: 'middle',
              gap: 'no',
              margin: em(0, 0, 2.0, 0),
              css_classes: 'mysuru-results-slider-row'
            },
            [
              makeColumn(
                6,
                {
                  sizeTablet: 10,
                  sizeMobile: 14,
                  content_position: 'center',
                  align: 'left',
                  css_classes: 'mysuru-slider-arrow-col'
                },
                [
                  makeImage(MEDIA.arrowLeft, {
                    align: 'left',
                    extra: {
                      css_classes: 'mysuru-arrow-btn mysuru-results-prev'
                    }
                  })
                ],
                true
              ),
              makeColumn(
                88,
                {
                  sizeTablet: 80,
                  sizeMobile: 72,
                  padding: em(0, 0.75, 0, 0.75),
                  padding_tablet: em(0, 0.5, 0, 0.5),
                  padding_mobile: em(0, 0.25, 0, 0.25),
                  css_classes: 'mysuru-results-carousel-col'
                },
                [
                  makeCarousel(
                    [
                      MEDIA.topperCardFull,
                      MEDIA.topperCardFull,
                      MEDIA.topperCardFull,
                      MEDIA.topperCardFull,
                      MEDIA.topperCardFull,
                      MEDIA.topperCardFull,
                      MEDIA.topperCardFull,
                      MEDIA.topperCardFull,
                      MEDIA.topperCardFull,
                      MEDIA.topperCardFull
                    ],
                    {
                      slidesToShow: 5,
                      slidesToShowTablet: 2,
                      spacing: 28,
                      autoplaySpeed: 2800,
                      extra: {
                        css_classes: 'mysuru-results-carousel'
                      }
                    }
                  )
                ],
                true
              ),
              makeColumn(
                6,
                {
                  sizeTablet: 10,
                  sizeMobile: 14,
                  content_position: 'center',
                  align: 'right',
                  css_classes: 'mysuru-slider-arrow-col'
                },
                [
                  makeImage(MEDIA.arrowRight, {
                    align: 'right',
                    extra: {
                      css_classes: 'mysuru-arrow-btn mysuru-results-next'
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
            color: '#E58D4D',
            borderColor: '#E58D4D',
            bgColor: '#00000000',
            fontSizeEm: 1.0,
            extra: {
              css_classes: 'mysuru-btn-pill mysuru-btn-orange'
            }
          })
        ]
      )
    ]
  ),

  // =========================================================================
  // SECTION 7: EXPLORE OUR VARIOUS CAMPUSES! (Figma y=3068..3668, h=600px = 37.5em)
  // Background: mysuru_explore_bg.png (1920x600 warm peach/sand gradient + left mandala)
  // Left Column (62.7% = 1204px): Heading + 2 paragraphs + "Know More ->" Button
  // Right Column (37.3% = 716px): Students + Mysuru Palace Artwork (mysuru_explore_students.png)
  // =========================================================================
  makeSection(
    {
      layout: 'full_width',
      content_position: 'bottom',
      background_background: 'classic',
      background_color: '#F5DEC4',
      background_image: { url: MEDIA.exploreBg.url, id: MEDIA.exploreBg.id },
      background_position: 'center center',
      background_repeat: 'no-repeat',
      background_size: 'cover',
      padding: em(0, 0, 0, 0),
      css_classes: 'mysuru-explore-section'
    },
    [
      makeColumn(
        62.7,
        {
          sizeTablet: 100,
          sizeMobile: 100,
          content_position: 'center',
          padding: em(7.8, 1.0, 4.2, 9.5),
          padding_tablet: em(3.0, 2.0, 2.0, 2.0),
          padding_mobile: em(2.25, 1.25, 1.5, 1.25),
          css_classes: 'mysuru-explore-left-col'
        },
        [
          makeHeading('Explore our various campuses!', {
            header_size: 'h2',
            align: 'left',
            color: '#252525',
            fontFamily: 'Georgia',
            fontSizeEm: 2.5,
            fontSizeTabletEm: 2.2,
            fontSizeMobileEm: 2.0,
            fontWeight: '700',
            lineHeight: 1.25,
            extra: {
              _margin: em(0, 0, 1.35, 0)
            }
          }),
          makeText(
            '<p style="margin:0 0 1.25em 0;">We have opened doors to learning across Bengaluru, with campuses thoughtfully located to bring quality education closer to you. Each branch carries the same commitment to academic excellence, holistic growth and a student-first environment, yet each has a unique culture shaped by its community and surroundings.</p><p style="margin:0;">Whether you seek an energetic academic hub, a calm learning atmosphere or a space that balances creativity and discipline, you’ll find a campus that feels just right. Explore our centres, learn what makes them special and choose the environment that empowers you to grow, achieve and thrive.</p>',
            {
              align: 'left',
              color: '#252525',
              fontFamily: 'Inter',
              fontSizeEm: 1.0,
              fontSizeTabletEm: 1.0,
              fontSizeMobileEm: 1.0,
              fontWeight: '400',
              lineHeight: 1.4,
              extra: {
                _margin: em(0, 0, 2.15, 0),
                _margin_mobile: em(0, 0, 1.5, 0),
                css_classes: 'mysuru-explore-body'
              }
            }
          ),
          makeButton('Know More', {
            align: 'left',
            color: '#E58D4D',
            borderColor: '#E58D4D',
            bgColor: '#00000000',
            fontSizeEm: 1.0,
            extra: {
              css_classes: 'mysuru-btn-pill mysuru-btn-orange'
            }
          })
        ]
      ),
      makeColumn(
        37.3,
        {
          sizeTablet: 100,
          sizeMobile: 100,
          content_position: 'bottom',
          padding: em(0, 0, 0, 0),
          css_classes: 'mysuru-explore-right-col'
        },
        [
          makeImage(MEDIA.exploreStudents, {
            align: 'right',
            width: 100,
            widthUnit: '%',
            extra: {
              _margin: em(0, 0, 0, 0),
              css_classes: 'mysuru-explore-students-img'
            }
          })
        ]
      )
    ]
  ),

  // =========================================================================
  // SECTION 8: EVENTS (Figma y=3668..4682, h=1014px = 63.375em)
  // Heading: EVENTS (Georgia 700, 2.5em, #E58D4D)
  // Subtitle: Inter 400, 1.0em, #000000
  // 5-Panel Interactive Architectural Showcase Row + 4 Pagination Dots + "Know More ->"
  // =========================================================================
  makeSection(
    {
      layout: 'full_width',
      background_background: 'classic',
      background_color: '#FFFFFF',
      padding: em(4.1, 4.5, 3.5, 4.5),
      padding_tablet: em(2.5, 1.5, 2.5, 1.5),
      padding_mobile: em(2.0, 0.75, 2.25, 0.75),
      css_classes: 'mysuru-events-section'
    },
    [
      makeColumn(
        100,
        {
          align: 'center'
        },
        [
          makeHeading('EVENTS', {
            header_size: 'h2',
            align: 'center',
            color: '#E58D4D',
            fontFamily: 'Georgia',
            fontSizeEm: 2.5,
            fontSizeTabletEm: 2.2,
            fontSizeMobileEm: 2.0,
            fontWeight: '700',
            lineHeight: 1.2,
            extra: {
              _margin: em(0, 0, 0.75, 0)
            }
          }),
          makeText(
            '<p style="margin:0;">From academic achievements and cultural celebrations to sports victories, student-led initiatives and inspiring guest sessions, our campus is always alive with energy, creativity and talent. Dive into the experiences that define student life at RVPU Mysuru.</p>',
            {
              align: 'center',
              color: '#000000',
              fontFamily: 'Inter',
              fontSizeEm: 1.0,
              fontSizeTabletEm: 1.0,
              fontSizeMobileEm: 1.0,
              fontWeight: '400',
              lineHeight: 1.38,
              extra: {
                _margin: em(0, 0, 3.25, 0),
                _margin_tablet: em(0, 0, 2.0, 0),
                _margin_mobile: em(0, 0, 1.5, 0),
                css_classes: 'mysuru-events-subtitle'
              }
            }
          ),
          // 5-Panel Showcase Row with Left/Right Orange Arrows
          makeSection(
            {
              layout: 'full_width',
              content_position: 'middle',
              gap: 'no',
              margin: em(0, 0, 1.5, 0),
              css_classes: 'mysuru-events-slider-row'
            },
            [
              makeColumn(
                5.5,
                {
                  sizeTablet: 10,
                  sizeMobile: 14,
                  content_position: 'center',
                  align: 'left',
                  css_classes: 'mysuru-slider-arrow-col'
                },
                [
                  makeImage(MEDIA.arrowLeft, {
                    align: 'left',
                    extra: {
                      css_classes: 'mysuru-arrow-btn mysuru-events-prev'
                    }
                  })
                ],
                true
              ),
              makeColumn(
                14.5,
                {
                  sizeTablet: 0,
                  sizeMobile: 0,
                  padding: em(0, 0.55, 0, 0),
                  css_classes: 'mysuru-event-panel-col mysuru-event-side-outer'
                },
                [
                  makeImage(MEDIA.eventPanel1, {
                    align: 'center',
                    width: 100,
                    widthUnit: '%',
                    extra: {
                      css_classes: 'mysuru-event-panel-img mysuru-event-panel-1'
                    }
                  })
                ],
                true
              ),
              makeColumn(
                14.5,
                {
                  sizeTablet: 22,
                  sizeMobile: 0,
                  padding: em(2.8125, 0.55, 0, 0.55),
                  css_classes: 'mysuru-event-panel-col mysuru-event-side-inner'
                },
                [
                  makeImage(MEDIA.eventPanel2, {
                    align: 'center',
                    width: 100,
                    widthUnit: '%',
                    extra: {
                      css_classes: 'mysuru-event-panel-img mysuru-event-panel-2'
                    }
                  })
                ],
                true
              ),
              makeColumn(
                31.0,
                {
                  sizeTablet: 36,
                  sizeMobile: 72,
                  padding: em(0, 0.55, 0, 0.55),
                  css_classes: 'mysuru-event-panel-col mysuru-event-center-col'
                },
                [
                  makeImage(MEDIA.eventPanel3, {
                    align: 'center',
                    width: 100,
                    widthUnit: '%',
                    extra: {
                      css_classes: 'mysuru-event-panel-img mysuru-event-panel-3'
                    }
                  }),
                  // 4 Pagination Dots directly beneath center panel (aligning with bottom of Panel 2 & 4)
                  makeText(
                    '<div class="mysuru-events-dots"><span class="mysuru-event-dot active" data-idx="0"></span><span class="mysuru-event-dot" data-idx="1"></span><span class="mysuru-event-dot" data-idx="2"></span><span class="mysuru-event-dot" data-idx="3"></span></div>',
                    {
                      align: 'center',
                      extra: {
                        _margin: em(1.5, 0, 0, 0),
                        _margin_mobile: em(1.1, 0, 0, 0)
                      }
                    }
                  )
                ],
                true
              ),
              makeColumn(
                14.5,
                {
                  sizeTablet: 22,
                  sizeMobile: 0,
                  padding: em(2.8125, 0.55, 0, 0.55),
                  css_classes: 'mysuru-event-panel-col mysuru-event-side-inner'
                },
                [
                  makeImage(MEDIA.eventPanel4, {
                    align: 'center',
                    width: 100,
                    widthUnit: '%',
                    extra: {
                      css_classes: 'mysuru-event-panel-img mysuru-event-panel-4'
                    }
                  })
                ],
                true
              ),
              makeColumn(
                14.5,
                {
                  sizeTablet: 0,
                  sizeMobile: 0,
                  padding: em(0, 0, 0, 0.55),
                  css_classes: 'mysuru-event-panel-col mysuru-event-side-outer'
                },
                [
                  makeImage(MEDIA.eventPanel5, {
                    align: 'center',
                    width: 100,
                    widthUnit: '%',
                    extra: {
                      css_classes: 'mysuru-event-panel-img mysuru-event-panel-5'
                    }
                  })
                ],
                true
              ),
              makeColumn(
                5.5,
                {
                  sizeTablet: 10,
                  sizeMobile: 14,
                  content_position: 'center',
                  align: 'right',
                  css_classes: 'mysuru-slider-arrow-col'
                },
                [
                  makeImage(MEDIA.arrowRight, {
                    align: 'right',
                    extra: {
                      css_classes: 'mysuru-arrow-btn mysuru-events-next'
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
            color: '#E58D4D',
            borderColor: '#E58D4D',
            bgColor: '#00000000',
            fontSizeEm: 1.0,
            extra: {
              css_classes: 'mysuru-btn-pill mysuru-btn-orange'
            }
          })
        ]
      )
    ]
  ),

  // =========================================================================
  // SECTION 9: TAKE A VIRTUAL TOUR OF OUR CAMPUS (Figma y=4682..5188, h=506px = 31.625em)
  // Background: mysuru_tour_bg.png (1920x507 aged paper + bottom-left lotus + right waves)
  // Left Heading: x=192, y=4831, w=383, h=150 ("TAKE A VIRTUAL TOUR OF OUR CAMPUS")
  // Right Video Box: x=762, y=4729, w=1010, h=414 (White Outer Frame + #E8EAE9 Inner Video Box)
  // =========================================================================
  makeSection(
    {
      layout: 'full_width',
      content_position: 'middle',
      background_background: 'classic',
      background_color: '#F7EFE0',
      background_image: { url: MEDIA.tourBg.url, id: MEDIA.tourBg.id },
      background_position: 'center center',
      background_repeat: 'no-repeat',
      background_size: 'cover',
      padding: em(2.9375, 9.25, 2.9375, 12.0),
      padding_tablet: em(2.5, 1.5, 2.5, 1.5),
      padding_mobile: em(2.0, 1.0, 2.25, 1.0),
      css_classes: 'mysuru-tour-section'
    },
    [
      makeColumn(
        36.1,
        {
          sizeTablet: 100,
          sizeMobile: 100,
          content_position: 'center',
          padding: em(0, 2.0, 0, 0),
          padding_tablet: em(0, 0, 1.5, 0),
          padding_mobile: em(0, 0, 1.25, 0)
        },
        [
          makeHeading('TAKE A VIRTUAL<br>TOUR OF OUR<br>CAMPUS', {
            header_size: 'h2',
            align: 'left',
            alignTablet: 'center',
            alignMobile: 'center',
            color: '#252525',
            fontFamily: 'Georgia',
            fontSizeEm: 2.5,
            fontSizeTabletEm: 2.2,
            fontSizeMobileEm: 2.0,
            fontWeight: '700',
            lineHeight: 1.25
          })
        ]
      ),
      makeColumn(
        63.9,
        {
          sizeTablet: 100,
          sizeMobile: 100,
          content_position: 'center',
          background_background: 'classic',
          background_color: '#FFFFFF',
          padding: em(2.3125, 4.6875, 2.3125, 4.6875),
          padding_tablet: em(1.5, 1.5, 1.5, 1.5),
          padding_mobile: em(1.0, 1.0, 1.0, 1.0),
          css_classes: 'mysuru-tour-white-frame'
        },
        [
          makeSection(
            {
              layout: 'full_width',
              background_background: 'classic',
              background_color: '#E8EAE9',
              padding: em(10.625, 1.0, 10.625, 1.0),
              padding_tablet: em(8.0, 1.0, 8.0, 1.0),
              padding_mobile: em(5.5, 1.0, 5.5, 1.0),
              css_classes: 'mysuru-tour-grey-screen'
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
  // SECTION 10: FOOTER (Figma y=5188..5934, h=746px = 46.625em)
  // Background: #262421
  // =========================================================================
  makeSection(
    {
      layout: 'full_width',
      background_background: 'classic',
      background_color: '#262421',
      padding: em(2.9375, 17.75, 2.5, 17.8),
      padding_tablet: em(2.5, 2.0, 2.0, 2.0),
      padding_mobile: em(2.25, 1.0, 1.75, 1.0),
      css_classes: 'mysuru-footer-section'
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
              margin: em(0, 0, 1.6, 0),
              css_classes: 'mysuru-footer-top-icons'
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
                    extra: {
                      _margin: em(0, 0, 1.25, 0),
                      css_classes: 'mysuru-footer-icon-phone'
                    }
                  }),
                  makeHeading('<a href="tel:+918050454680" style="color:#F7F7F7;text-decoration:none;">+91 80504 54680</a>', {
                    header_size: 'p',
                    align: 'center',
                    color: '#F7F7F7',
                    fontFamily: 'Inter',
                    fontSizeEm: 1.0,
                    fontSizeTabletEm: 1.0,
                    fontSizeMobileEm: 1.0,
                    fontWeight: '400',
                    lineHeight: 1.25
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
                    extra: {
                      _margin: em(0, 0, 1.55, 0),
                      css_classes: 'mysuru-footer-icon-std'
                    }
                  }),
                  makeHeading('<a href="mailto:info.rvpun@rvei.edu.in" style="color:#F7F7F7;text-decoration:none;">info.rvpun@rvei.edu.in</a>', {
                    header_size: 'p',
                    align: 'center',
                    color: '#F7F7F7',
                    fontFamily: 'Inter',
                    fontSizeEm: 1.0,
                    fontSizeTabletEm: 1.0,
                    fontSizeMobileEm: 1.0,
                    fontWeight: '400',
                    lineHeight: 1.25
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
                    extra: {
                      _margin: em(0, 0, 1.55, 0),
                      css_classes: 'mysuru-footer-icon-std'
                    }
                  }),
                  makeHeading('<a href="#map" style="color:#F7F7F7;text-decoration:none;">MAP</a>', {
                    header_size: 'p',
                    align: 'center',
                    color: '#F7F7F7',
                    fontFamily: 'Inter',
                    fontSizeEm: 1.0,
                    fontSizeTabletEm: 1.0,
                    fontSizeMobileEm: 1.0,
                    fontWeight: '400',
                    lineHeight: 1.25
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
                    extra: {
                      _margin: em(0, 0, 1.25, 0),
                      css_classes: 'mysuru-footer-icon-std'
                    }
                  }),
                  makeHeading('<a href="#privacy" style="color:#F7F7F7;text-decoration:none;">PRIVACY POLICY</a>', {
                    header_size: 'p',
                    align: 'center',
                    color: '#F7F7F7',
                    fontFamily: 'Inter',
                    fontSizeEm: 1.0,
                    fontSizeTabletEm: 1.0,
                    fontSizeMobileEm: 1.0,
                    fontWeight: '400',
                    lineHeight: 1.25
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
              color: 'rgba(255, 255, 255, 0.58)',
              width: { unit: '%', size: 100, sizes: [] },
              align: 'center',
              gap: { unit: 'px', size: 0, sizes: [] },
              _margin: em(0, 0, 2.4, 0)
            },
            elements: []
          },
          // Middle 4 Footer Columns (Know Us, Address, Subscribe with us, Follow Us)
          makeSection(
            {
              layout: 'full_width',
              content_position: 'top',
              margin: em(0, 0, 2.5, 0),
              css_classes: 'mysuru-footer-main-cols'
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
                    color: '#E58D4D',
                    fontFamily: 'Georgia',
                    fontSizeEm: 2.0,
                    fontSizeTabletEm: 1.8,
                    fontSizeMobileEm: 1.6,
                    fontWeight: '400',
                    lineHeight: 1.25,
                    extra: {
                      _margin: em(0, 0, 0.85, 0)
                    }
                  }),
                  makeText(
                    '<p style="margin:0 0 0.85em 0;"><a href="#" style="color:#FAFBFB;text-decoration:none;">About RV PU North</a></p><p style="margin:0 0 0.85em 0;"><a href="#" style="color:#FAFBFB;text-decoration:none;">Course</a></p><p style="margin:0;"><a href="#" style="color:#FAFBFB;text-decoration:none;">Terms &amp; Conditions</a></p>',
                    {
                      align: 'left',
                      color: '#FAFBFB',
                      fontFamily: 'Inter',
                      fontSizeEm: 1.0,
                      fontSizeTabletEm: 1.0,
                      fontSizeMobileEm: 1.0,
                      fontWeight: '400',
                      lineHeight: 1.45,
                      extra: {
                        css_classes: 'mysuru-footer-links'
                      }
                    }
                  )
                ],
                true
              ),
              // Col 2: Address
              makeColumn(
                23.0,
                {
                  sizeTablet: 50,
                  sizeMobile: 100,
                  padding: em(0, 1.5, 1.5, 0)
                },
                [
                  makeHeading('Address', {
                    header_size: 'h4',
                    align: 'left',
                    color: '#E58D4D',
                    fontFamily: 'Georgia',
                    fontSizeEm: 2.0,
                    fontSizeTabletEm: 1.8,
                    fontSizeMobileEm: 1.6,
                    fontWeight: '400',
                    lineHeight: 1.25,
                    extra: {
                      _margin: em(0, 0, 0.85, 0)
                    }
                  }),
                  makeText(
                    '<p style="margin:0;">DPS Bengaluru North<br>Campus, Survey No. 35/1A,<br>Sathnur Village, Bagalur Post,<br>Off Bellary Road, Jalla Hobli,<br>Bengaluru - 562149,<br>Karnataka, India</p>',
                    {
                      align: 'left',
                      color: '#FAFBFB',
                      fontFamily: 'Inter',
                      fontSizeEm: 1.0,
                      fontSizeTabletEm: 1.0,
                      fontSizeMobileEm: 1.0,
                      fontWeight: '400',
                      lineHeight: 1.55
                    }
                  )
                ],
                true
              ),
              // Col 3: Subscribe with us
              makeColumn(
                32.5,
                {
                  sizeTablet: 50,
                  sizeMobile: 100,
                  padding: em(0, 1.5, 1.5, 0)
                },
                [
                  makeHeading('Subscribe with us', {
                    header_size: 'h4',
                    align: 'left',
                    color: '#E58D4D',
                    fontFamily: 'Georgia',
                    fontSizeEm: 2.0,
                    fontSizeTabletEm: 1.8,
                    fontSizeMobileEm: 1.6,
                    fontWeight: '400',
                    lineHeight: 1.25,
                    extra: {
                      _margin: em(0, 0, 1.05, 0)
                    }
                  }),
                  makeText(
                    '<form class="mysuru-subscribe-form" onsubmit="event.preventDefault();"><input type="email" class="mysuru-subscribe-input" placeholder="Enter Email Address" aria-label="Enter Email Address" /><button type="submit" class="mysuru-subscribe-submit" aria-label="Subscribe">&#10095;</button></form>',
                    {
                      align: 'left',
                      color: '#FFFFFF',
                      fontFamily: 'Inter',
                      fontSizeEm: 1.0
                    }
                  )
                ],
                true
              ),
              // Col 4: Follow Us
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
                    color: '#E58D4D',
                    fontFamily: 'Georgia',
                    fontSizeEm: 2.0,
                    fontSizeTabletEm: 1.8,
                    fontSizeMobileEm: 1.6,
                    fontWeight: '400',
                    lineHeight: 1.25,
                    extra: {
                      _margin: em(0, 0, 1.05, 0)
                    }
                  }),
                  makeText(
                    '<div class="mysuru-social-dots"><a href="#fb" class="mysuru-social-circle" aria-label="Facebook"></a><a href="#ig" class="mysuru-social-circle" aria-label="Instagram"></a><a href="#tw" class="mysuru-social-circle" aria-label="X"></a><a href="#yt" class="mysuru-social-circle" aria-label="YouTube"></a><a href="#in" class="mysuru-social-circle" aria-label="LinkedIn"></a><a href="#wa" class="mysuru-social-circle" aria-label="WhatsApp"></a></div>',
                    {
                      align: 'left'
                    }
                  )
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
              color: 'rgba(255, 255, 255, 0.58)',
              width: { unit: '%', size: 100, sizes: [] },
              align: 'center',
              gap: { unit: 'px', size: 0, sizes: [] },
              _margin: em(0, 0, 1.05, 0)
            },
            elements: []
          },
          // Copyright Row (strictly 2 columns: 35% left, 65% right)
          makeSection(
            {
              layout: 'full_width',
              content_position: 'middle',
              css_classes: 'mysuru-footer-bottom-row'
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
                      css_classes: 'mysuru-footer-copyright-right'
                    }
                  })
                ],
                true
              )
            ],
            true
          ),
          // Scoped Responsive CSS + Infinite Carousel & Zero-Placeholder Auto-Restore JS
          {
            id: nextId(),
            elType: 'widget',
            widgetType: 'html',
            settings: { _css_classes: 'mysuru-runtime-helper-widget',
              html: `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
/* === GLOBAL RESET & PROPORTIONAL DESKTOP SCALING (1920px = 120em -> 1em = 16px) === */
html, body {
  margin: 0 !important;
  padding: 0 !important;
  overflow-x: hidden !important;
  max-width: 100% !important;
  background: #FFFFFF;
}
.mysuru-results-carousel .swiper,
.mysuru-results-carousel .swiper-wrapper,
.mysuru-results-carousel .swiper-slide {
  opacity: 1 !important;
  visibility: visible !important;
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
.mysuru-logo-img img {
  width: 16.0625em !important;
  max-width: 100% !important;
  height: auto !important;
  display: block;
}
.mysuru-header-menu-col {
  cursor: pointer;
}
.mysuru-menu-bar .elementor-divider-separator {
  border-radius: 0.35em !important;
}

/* === SECTION 2: HERO VIDEO BANNER (1920x531px = 120em x 33.1875em) === */
.mysuru-play-btn-widget img {
  width: 10.375em !important;
  height: 10.375em !important;
  cursor: pointer;
  transition: transform 0.25s ease;
}
.mysuru-play-btn-widget img:hover {
  transform: scale(1.06);
}

/* === ORANGE PILL BUTTONS (183x60px = 11.4375em x 3.75em, #E58D4D) === */
.mysuru-btn-pill .elementor-button {
  min-width: 11.4375em;
  min-height: 3.75em;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0.75em 1.65em !important;
  border-radius: 2.1875em !important;
  transition: all 0.25s ease !important;
  box-sizing: border-box !important;
}
.mysuru-btn-pill .elementor-button-content-wrapper {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}
.mysuru-btn-pill .elementor-button-text {
  display: inline-flex !important;
  align-items: center !important;
  gap: 0.9em;
  line-height: 1 !important;
}
.mysuru-btn-orange .elementor-button-text::after {
  content: '\\2192';
  font-size: 1.25em;
  line-height: 1;
  font-weight: 600;
  display: inline-block;
  transform: translateY(-0.02em);
}
.mysuru-btn-orange .elementor-button:hover {
  background-color: #E58D4D !important;
  color: #FFFFFF !important;
  border-color: #E58D4D !important;
}

/* === SECTION 3: WELCOME TO RV PU COLLEGE, MYSURU (1920x600px = 120em x 37.5em) === */
.mysuru-welcome-section > .elementor-container {
  display: flex !important;
  align-items: stretch !important;
}
.mysuru-welcome-body {
  max-width: 55.5625em;
}
.mysuru-welcome-campus-img img {
  width: 100% !important;
  height: 37.5em !important;
  object-fit: cover !important;
  display: block !important;
}

/* === SECTION 4A & 4B: ADMISSIONS OPEN 2026-2027 === */
.mysuru-adm-orange-box {
  background: #E58D4D;
  color: #FFFFFF;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  padding: 0.04em 0.36em;
  display: inline-block;
  margin-left: 0.25em;
  line-height: 1.15;
}
.mysuru-adm-enquiries-row {
  max-width: 66em !important;
  margin-left: auto !important;
  margin-right: auto !important;
}
.mysuru-adm-contact-col > .elementor-widget-wrap,
.mysuru-adm-contact-col > .elementor-column-wrap > .elementor-widget-wrap {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: center !important;
  flex-wrap: nowrap !important;
  gap: 0.65em;
}
.mysuru-adm-icon-widget {
  width: auto !important;
  margin-bottom: 0 !important;
}
.mysuru-adm-icon-widget img {
  width: 2.3125em !important;
  height: 2.3125em !important;
  object-fit: contain !important;
  display: block !important;
}
.mysuru-adm-contact-text {
  width: auto !important;
  margin-bottom: 0 !important;
}

/* === SECTION 5: COURSES OFFERED (1920x841px = 120em x 52.5625em) === */
.mysuru-courses-top-grid {
  max-width: 101.6875em !important;
  margin-left: auto !important;
  margin-right: auto !important;
}
.mysuru-course-card {
  min-height: 10.3125em;
  box-shadow: 0 0.25em 0.65em rgba(0, 0, 0, 0.22);
  box-sizing: border-box !important;
}
.mysuru-course-card > .elementor-container {
  display: flex !important;
  align-items: center !important;
}
.mysuru-course-icon-box {
  width: 3.625em !important;
  min-width: 3.625em !important;
  max-width: 3.625em !important;
  height: 3.25em !important;
  border-radius: 0.3125em !important;
  background: #FFFFFF !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
}
.mysuru-course-icon-box > .elementor-widget-wrap,
.mysuru-course-icon-box > .elementor-column-wrap,
.mysuru-course-icon-box > .elementor-column-wrap > .elementor-widget-wrap {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100% !important;
  height: 100% !important;
  padding: 0 !important;
}
.mysuru-course-icon-widget img {
  width: 1.9em !important;
  height: 2.0em !important;
  object-fit: contain !important;
  display: block !important;
  margin: 0 auto !important;
}
.mysuru-course-code-wrap {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 0.55em;
}
.mysuru-course-code-text {
  flex-shrink: 0;
}
.mysuru-course-dotted-line {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  min-width: 3em;
}
.mysuru-line-dot {
  width: 0.35em;
  height: 0.35em;
  border-radius: 50%;
  background: #FFFFFF;
  flex-shrink: 0;
}
.mysuru-line-bar {
  flex: 1 1 auto;
  height: 0.0625em;
  background: rgba(255, 255, 255, 0.9);
}
.mysuru-course-subjects-row {
  display: grid;
  grid-template-columns: repeat(4, auto);
  align-items: start;
  justify-content: space-between;
  gap: 0.5em;
  width: 100%;
}
.mysuru-course-subject {
  display: inline-flex;
  align-items: flex-start;
  gap: 0.35em;
  color: #FFFFFF;
  font-family: 'Inter', sans-serif;
  font-size: 1.0em;
  line-height: 1.22;
  text-align: left;
}
.mysuru-tri {
  font-size: 0.85em;
  line-height: 1.3;
  flex-shrink: 0;
}
.mysuru-courses-mascot-col {
  position: relative;
  z-index: 6;
}
.mysuru-courses-mascot-widget img {
  width: 21.3125em !important;
  max-width: 100% !important;
  height: auto !important;
  display: block !important;
  margin: 0 auto !important;
}
.mysuru-course-card-seba {
  width: 38.6875em !important;
  max-width: 100% !important;
  margin-left: auto !important;
  margin-right: auto !important;
  position: relative;
  z-index: 4;
}
@media (min-width: 1025px) {
  .mysuru-course-card-seba {
    margin-top: -1.65em !important;
  }
}

/* === SECTION 6: RESULTS (5-CARD STAGGERED CAROUSEL) === */
.mysuru-results-slider-row > .elementor-container,
.mysuru-events-slider-row > .elementor-container,
.mysuru-tour-section > .elementor-container {
  display: flex !important;
  align-items: center !important;
}
.mysuru-results-carousel-col {
  min-width: 0 !important;
}
.mysuru-slider-arrow-col,
.mysuru-slider-arrow-col > .elementor-widget-wrap,
.mysuru-slider-arrow-col > .elementor-column-wrap,
.mysuru-slider-arrow-col > .elementor-column-wrap > .elementor-widget-wrap {
  display: flex !important;
  align-items: center !important;
}
.mysuru-arrow-btn img {
  width: 5.875em !important;
  height: 5.5625em !important;
  max-width: none !important;
  cursor: pointer;
  transition: transform 0.2s ease;
  display: block !important;
}
.mysuru-arrow-btn img:hover {
  transform: scale(1.06);
}
.mysuru-results-carousel,
.mysuru-results-carousel > .elementor-widget-container {
  width: 100% !important;
}
.mysuru-results-carousel .swiper-wrapper {
  align-items: flex-start !important;
}
.mysuru-results-carousel .swiper-slide {
  transition: margin-top 520ms cubic-bezier(0.22, 1, 0.36, 1);
}
@media (min-width: 1025px) {
  .mysuru-footer-copyright-right .elementor-heading-title {
    white-space: nowrap;
  }
}
.mysuru-results-carousel .swiper-slide img {
  width: 100% !important;
  max-width: 17.6875em !important;
  height: auto !important;
  margin: 0 auto !important;
  display: block !important;
}

/* === SECTION 7: EXPLORE OUR VARIOUS CAMPUSES! (1920x600px = 120em x 37.5em) === */
.mysuru-explore-section {
  min-height: 37.5em;
  overflow: hidden;
}
.mysuru-explore-body {
  max-width: 67.3em;
}
.mysuru-explore-students-img img {
  width: 44.75em !important;
  max-width: 100% !important;
  height: auto !important;
  display: block !important;
  margin-left: auto !important;
}

/* === SECTION 8: EVENTS (5-PANEL SHOWCASE + DOTS) === */
.mysuru-events-subtitle {
  max-width: 69.5em !important;
  margin-left: auto !important;
  margin-right: auto !important;
}
.mysuru-events-slider-row > .elementor-container {
  align-items: flex-start !important;
}
.mysuru-events-slider-row .mysuru-slider-arrow-col {
  align-self: center !important;
}
.mysuru-event-panel-img img {
  width: 100% !important;
  height: auto !important;
  display: block !important;
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.mysuru-events-dots {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.65em;
}
.mysuru-event-dot {
  width: 1.15em;
  height: 1.15em;
  border-radius: 50%;
  border: 0.0625em solid #252525;
  background: transparent;
  cursor: pointer;
  display: inline-block;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}
.mysuru-event-dot.active {
  background: #8E8E8E;
  border-color: #8E8E8E;
}

/* === SECTION 10: FOOTER (1920x746px = 120em x 46.625em) === */
.mysuru-footer-top-icons {
  max-width: 58em !important;
  margin-left: auto !important;
  margin-right: auto !important;
}
.mysuru-footer-icon-phone img {
  width: 5.3125em !important;
  height: 5.3125em !important;
  object-fit: contain !important;
}
.mysuru-footer-icon-std img {
  width: 4.5em !important;
  height: 4.5em !important;
  object-fit: contain !important;
}
.mysuru-subscribe-form {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #6F6F6F;
  border-radius: 1.9375em;
  height: 3.875em;
  padding: 0 1.4em;
  width: 100%;
  max-width: 24.25em;
  box-sizing: border-box;
}
.mysuru-subscribe-input {
  background: transparent !important;
  border: none !important;
  outline: none !important;
  color: #FFFFFF !important;
  font-family: 'Inter', sans-serif;
  font-size: 1.15em;
  width: 100%;
}
.mysuru-subscribe-input::placeholder {
  color: #FFFFFF;
  opacity: 0.95;
}
.mysuru-subscribe-submit {
  background: transparent !important;
  border: none !important;
  color: #FFFFFF !important;
  font-size: 1.15em;
  cursor: pointer;
  padding: 0.25em 0 0.25em 0.75em;
}
.mysuru-social-dots {
  display: flex;
  align-items: center;
  gap: 0.4375em;
  flex-wrap: nowrap;
}
.mysuru-social-circle {
  width: 3.125em;
  height: 3.125em;
  border-radius: 50%;
  background: #FFFFFF;
  display: inline-block;
  flex-shrink: 0;
  transition: transform 0.2s ease, background-color 0.2s ease;
}
.mysuru-social-circle:hover {
  transform: translateY(-0.2em);
  background: #E58D4D;
}

/* === BULLETPROOF BACKGROUND IMAGE FALLBACKS (FOR CROSS-SITE ELEMENTOR JSON IMPORT) === */
.mysuru-welcome-left-col:not(.elementor-motion-effects-element-type-background),
.mysuru-welcome-left-col > .elementor-element-populated,
.mysuru-welcome-left-col > .elementor-widget-wrap {
  background-image: url("https://rvcollegeofengineering.in/test/wp-content/uploads/2026/10/mysuru_welcome_left_bg.png") !important;
  background-position: center center !important;
  background-repeat: no-repeat !important;
  background-size: cover !important;
}
.mysuru-admissions-section {
  background-color: #323130 !important;
  background-image: url("https://rvcollegeofengineering.in/test/wp-content/uploads/2026/10/mysuru_admissions_bg.png") !important;
  background-position: center center !important;
  background-repeat: no-repeat !important;
  background-size: cover !important;
}
.mysuru-courses-section {
  background-color: #F6ECDC !important;
  background-image: url("https://rvcollegeofengineering.in/test/wp-content/uploads/2026/10/mysuru_courses_bg.png") !important;
  background-position: center center !important;
  background-repeat: no-repeat !important;
  background-size: cover !important;
}

/* === COURSES OFFERED: DESKTOP & MOBILE RESPONSIVE SWITCHING === */
@media (min-width: 1025px) {
  .mysuru-courses-desktop-section {
    display: block !important;
  }
  .mysuru-courses-mobile-section {
    display: none !important;
  }
}

@media (max-width: 1024px) {
  .mysuru-courses-desktop-section {
    display: none !important;
  }
  .mysuru-courses-mobile-section {
    display: block !important;
  }
}

/* === DEDICATED MOBILE COURSES SECTION (Pixel-Accurate to reference media_1793170580302_5dffaa10.png) === */
.mysuru-courses-mobile-section {
  background-color: #F6ECDC !important;
  background-image: url("https://rvcollegeofengineering.in/test/wp-content/uploads/2026/10/mysuru_courses_bg.png") !important;
  background-position: left center !important;
  background-repeat: no-repeat !important;
  background-size: cover !important;
}

.mysuru-courses-mobile-inner-col {
  width: 100% !important;
  max-width: 380px !important;
  margin: 0 auto !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
}

.mysuru-mob-courses-heading .elementor-heading-title {
  font-family: Georgia, 'Playfair Display', serif !important;
  font-size: 1.85em !important;
  font-weight: 700 !important;
  color: #000000 !important;
  text-align: center !important;
  letter-spacing: 0.02em !important;
}

.mysuru-mob-courses-mascot-img {
  text-align: center !important;
  margin-bottom: 1.25em !important;
}

.mysuru-mob-courses-mascot-img img {
  width: 9.5em !important;
  max-width: 155px !important;
  height: auto !important;
  display: inline-block !important;
}

.mysuru-mob-card-widget {
  width: 100% !important;
  max-width: 310px !important;
  margin-left: auto !important;
  margin-right: auto !important;
}

.mysuru-mob-course-card {
  width: 100%;
  background: #D48146;
  background: linear-gradient(180deg, #D48146 0%, #C8743B 100%);
  border-radius: 1.25em;
  padding: 1.15em 1.2em 1.3em 1.2em;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  box-sizing: border-box;
}

.mysuru-mob-card-head {
  display: flex;
  align-items: center;
  gap: 0.55em;
  margin-bottom: 1.1em;
}

.mysuru-mob-card-icon-box {
  background: #FFFFFF;
  border-radius: 0.5em;
  width: 3.4em;
  height: 2.85em;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.mysuru-mob-card-icon-box img {
  width: 1.8em !important;
  height: auto !important;
  max-height: 2.0em !important;
  object-fit: contain;
}

.mysuru-mob-card-code-box {
  background: #F1D9C6;
  border-radius: 0.5em;
  flex: 1;
  height: 2.85em;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.mysuru-mob-card-code-text {
  font-family: Georgia, 'Playfair Display', serif;
  font-size: 1.25em;
  font-weight: 700;
  color: #000000;
  letter-spacing: 0.03em;
}

.mysuru-mob-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.55em;
  padding-left: 0.35em;
}

.mysuru-mob-sub-item {
  display: flex;
  align-items: center;
  gap: 0.65em;
  color: #FFFFFF;
  font-family: 'Inter', -apple-system, sans-serif;
  font-size: 1.0em;
  font-weight: 500;
  line-height: 1.35;
}

.mysuru-mob-sub-arrow {
  color: #FFFFFF;
  font-size: 0.7em;
  line-height: 1;
  flex-shrink: 0;
}

.mysuru-mob-courses-btn .elementor-button {
  border-color: #D48146 !important;
  color: #D48146 !important;
  border-radius: 2.0em !important;
  padding: 0.65em 2.4em !important;
  font-family: 'Nunito', 'Inter', sans-serif !important;
  font-weight: 600 !important;
}

.mysuru-mob-courses-btn .elementor-button:hover {
  background-color: #D48146 !important;
  color: #FFFFFF !important;
}
.mysuru-course-card {
  background-color: #D48146 !important;
  background-image: url("https://rvcollegeofengineering.in/test/wp-content/uploads/2026/10/mysuru_course_card_bg.png") !important;
  background-position: center center !important;
  background-repeat: no-repeat !important;
  background-size: cover !important;
}
.mysuru-explore-section {
  background-color: #F5DEC4 !important;
  background-image: url("https://rvcollegeofengineering.in/test/wp-content/uploads/2026/10/mysuru_explore_bg.png") !important;
  background-position: center center !important;
  background-repeat: no-repeat !important;
  background-size: cover !important;
}
.mysuru-tour-section {
  background-color: #F7EFE0 !important;
  background-image: url("https://rvcollegeofengineering.in/test/wp-content/uploads/2026/10/mysuru_tour_bg.png") !important;
  background-position: center center !important;
  background-repeat: no-repeat !important;
  background-size: cover !important;
}

/* === FIGMA PARITY REFINEMENTS (DESKTOP) === */
@media (min-width: 1025px) {
  /* Header: 70px rounded hamburger bars */
  .mysuru-menu-bar .elementor-divider-separator {
    width: 4.375em !important;
  }
  /* Welcome: two-size heading + 18px body */
  .mysuru-welcome-heading .elementor-heading-title {
    font-size: 2.75em !important;
    line-height: 1.3 !important;
  }
  .mysuru-welcome-heading .elementor-heading-title span:last-child {
    font-size: 1.28em;
  }
  .mysuru-welcome-heading {
    margin-bottom: 3.0em !important;
  }
  .mysuru-welcome-body.elementor-widget-text-editor,
  .mysuru-explore-body.elementor-widget-text-editor,
  .mysuru-events-subtitle.elementor-widget-text-editor {
    font-size: 1.125em !important;
    line-height: 1.25 !important;
  }
  .mysuru-welcome-body { max-width: 49.5em !important; }
  .mysuru-explore-body { max-width: 58.8em !important; }
  .mysuru-events-subtitle {
    max-width: 61.4em !important;
    text-align: left !important;
  }
  .mysuru-events-subtitle p { text-align: left !important; }
  /* Admissions: Georgia year badge + compact centred enquiry row */
  .mysuru-adm-orange-box { font-family: Georgia, serif !important; }
  .mysuru-adm-enquiries-row { max-width: none !important; }
  .mysuru-adm-enquiries-row > .elementor-container {
    justify-content: center !important;
    flex-wrap: nowrap !important;
    gap: 1.5em;
  }
  .mysuru-adm-enquiries-row > .elementor-container > .elementor-column {
    width: auto !important;
    flex: 0 0 auto !important;
  }
  .mysuru-adm-enquiries-row h4.elementor-heading-title {
    font-size: 1.75em !important;
  }
  .mysuru-adm-contact-text .elementor-heading-title {
    font-size: 1.125em !important;
  }
  /* Course cards: vertically centred content, smaller code, 18px subjects */
  .mysuru-course-card {
    display: flex !important;
    align-items: center !important;
  }
  .mysuru-course-card > .elementor-container { width: 100%; }
  .mysuru-course-code-heading .elementor-heading-title { font-size: 1.6em !important; }
  .mysuru-course-subject { font-size: 1.125em; }
  .mysuru-tri { font-size: 0.7em; line-height: 1.75; }
  .mysuru-line-dot { width: 0.25em; height: 0.25em; }
  /* Bigger orange arrow circles (94px) */
  .mysuru-arrow-btn img {
    width: 6.9em !important;
    height: 6.55em !important;
  }
  /* Events heading spacing */
  .mysuru-events-section .elementor-widget-heading:first-child { margin-bottom: 1.6em !important; }
  /* Footer parity */
  .mysuru-footer-section { background-color: #252525 !important; }
  .mysuru-footer-section .elementor-widget-text-editor { font-size: 1.125em !important; }
  .mysuru-footer-section .elementor-widget-text-editor p { margin-bottom: 1.25em !important; }
  .mysuru-footer-section .elementor-widget-text-editor p:last-child { margin-bottom: 0 !important; }
  .mysuru-footer-main-cols .elementor-column:nth-child(2) .elementor-widget-text-editor { line-height: 1.667 !important; }
  .mysuru-footer-main-cols h4.elementor-heading-title { font-size: 1.875em !important; }
  .mysuru-footer-main-cols .elementor-widget-heading { margin-bottom: 1.6em !important; }
  .mysuru-footer-top-icons p.elementor-heading-title { font-size: 1.125em !important; }
  .mysuru-footer-top-icons .elementor-widget-image { margin-bottom: 1.7em !important; }
  .mysuru-footer-section { padding-bottom: 7.5em !important; }
  /* Pill buttons: 2px border + bold arrow */
  .mysuru-btn-pill .elementor-button { border-width: 0.125em !important; }
  .mysuru-btn-orange .elementor-button-text::after {
    font-family: Arial, sans-serif;
    font-weight: 700;
    font-size: 1.45em;
  }
}

/* === TABLET & MOBILE RESPONSIVE BREAKPOINTS (EM) === */
@media (max-width: 1024px) {
  .mysuru-welcome-section > .elementor-container,
  .mysuru-tour-section > .elementor-container {
    flex-wrap: wrap !important;
  }
  .mysuru-welcome-campus-img img {
    height: auto !important;
  }
  .mysuru-course-card-seba {
    width: 100% !important;
    margin-top: 0 !important;
  }
  .mysuru-event-side-outer {
    display: none !important;
  }
  .mysuru-social-dots {
    flex-wrap: wrap;
  }
}

@media (max-width: 767px) {
  .elementor-section {
    max-width: 100vw !important;
    overflow-x: hidden !important;
  }
  .mysuru-logo-img img {
    width: 11.5em !important;
  }
  .mysuru-play-btn-widget img {
    width: 6.5em !important;
    height: 6.5em !important;
  }
  .mysuru-course-card > .elementor-container {
    flex-direction: column !important;
    align-items: center !important;
    text-align: center !important;
  }
  .mysuru-course-icon-box {
    margin: 0 auto 0.5em auto !important;
  }
  .mysuru-course-dotted-line {
    display: none !important;
  }
  .mysuru-course-code-wrap {
    justify-content: center;
  }
  .mysuru-course-subjects-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.65em 0.85em;
    margin-top: 0.35em;
  }
  .mysuru-arrow-btn img {
    width: 3.0em !important;
    height: 2.85em !important;
  }
  .mysuru-event-side-inner {
    display: none !important;
  }
  .mysuru-subscribe-form {
    max-width: 100%;
  }
}

/* Elementor Editor Safety: Ensure all widgets and buttons are 100% clickable & editable in Elementor Editor */
body.elementor-editor-active .mysuru-runtime-helper-widget {
  height: 0 !important;
  min-height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  pointer-events: none !important;
}
</style>
<script>
(function() {
  function isElementorEditMode() {
    try {
      if (document.body && (document.body.classList.contains('elementor-editor-active') || document.body.classList.contains('elementor-editor-preview'))) return true;
      if (window.location && window.location.search && (window.location.search.indexOf('elementor-preview=') !== -1 || window.location.search.indexOf('action=elementor') !== -1)) return true;
      if (window.elementorFrontend && typeof window.elementorFrontend.isEditMode === 'function' && window.elementorFrontend.isEditMode()) return true;
    } catch (e) {}
    return false;
  }

  const CDN = 'https://rvcollegeofengineering.in/test/wp-content/uploads/2026/10/';
  const ASSET_MAP = {
    'mysuru-asset-mysuru_logo': 'mysuru_logo.png',
    'mysuru-asset-mysuru_header_menu': 'mysuru_header_menu.png',
    'mysuru-asset-mysuru_hero_play': 'mysuru_hero_play.png',
    'mysuru-asset-mysuru_welcome_left_bg': 'mysuru_welcome_left_bg.png',
    'mysuru-asset-mysuru_welcome_campus': 'mysuru_welcome_campus.png',
    'mysuru-asset-mysuru_admissions_bg': 'mysuru_admissions_bg.png',
    'mysuru-asset-mysuru_icon_phone_orange': 'mysuru_icon_phone_orange.png',
    'mysuru-asset-mysuru_icon_email_orange': 'mysuru_icon_email_orange.png',
    'mysuru-asset-mysuru_courses_bg': 'mysuru_courses_bg.png',
    'mysuru-asset-mysuru_course_card_bg': 'mysuru_course_card_bg.png',
    'mysuru-asset-mysuru_course_line_dots': 'mysuru_course_line_dots.png',
    'mysuru-asset-mysuru_courses_mascot': 'mysuru_courses_mascot.png',
    'mysuru-asset-mysuru_icon_pcmb': 'mysuru_icon_pcmb.png',
    'mysuru-asset-mysuru_icon_pcmc': 'mysuru_icon_pcmc.png',
    'mysuru-asset-mysuru_icon_bams': 'mysuru_icon_bams.png',
    'mysuru-asset-mysuru_icon_bame': 'mysuru_icon_bame.png',
    'mysuru-asset-mysuru_icon_seba': 'mysuru_icon_seba.png',
    'mysuru-asset-mysuru_topper_card_full': 'mysuru_topper_card_full.png',
    'mysuru-asset-mysuru_topper_photo': 'mysuru_topper_photo.png',
    'mysuru-asset-mysuru_arrow_left': 'mysuru_arrow_left.png',
    'mysuru-asset-mysuru_arrow_right': 'mysuru_arrow_right.png',
    'mysuru-asset-mysuru_explore_bg': 'mysuru_explore_bg.png',
    'mysuru-asset-mysuru_explore_students': 'mysuru_explore_students.png',
    'mysuru-asset-mysuru_event_center': 'mysuru_event_center.png',
    'mysuru-asset-mysuru_event_panel_1': 'mysuru_event_panel_1.png',
    'mysuru-asset-mysuru_event_panel_2': 'mysuru_event_panel_2.png',
    'mysuru-asset-mysuru_event_panel_3': 'mysuru_event_panel_3.png',
    'mysuru-asset-mysuru_event_panel_4': 'mysuru_event_panel_4.png',
    'mysuru-asset-mysuru_event_panel_5': 'mysuru_event_panel_5.png',
    'mysuru-asset-mysuru_tour_bg': 'mysuru_tour_bg.png',
    'mysuru-asset-mysuru_footer_phone': 'mysuru_footer_phone.png',
    'mysuru-asset-mysuru_footer_email': 'mysuru_footer_email.png',
    'mysuru-asset-mysuru_footer_map': 'mysuru_footer_map.png',
    'mysuru-asset-mysuru_footer_privacy': 'mysuru_footer_privacy.png'
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
        if (!img.dataset.mysuruErrBound) {
          img.dataset.mysuruErrBound = '1';
          img.addEventListener('error', function() {
            setImgUrl(img, targetUrl);
          });
        }
      });
    });

    const topperUrl = CDN + 'mysuru_topper_card_full.png';
    document.querySelectorAll('.mysuru-results-carousel .swiper-slide img').forEach(function(img) {
      if (needsRestore(img)) {
        setImgUrl(img, topperUrl);
      }
    });
  }

  function setupResultsCarousel(carouselSelector, prevSelector, nextSelector, desktopCount, gapDesktop, fallbackUrls) {
    if (isElementorEditMode()) return;
    const widgetEl = document.querySelector(carouselSelector);
    // CRITICAL: Never remove data-widget_type or data-settings!
    // Elementor Editor requires data-widget_type on every .elementor-widget element.
    let container = document.querySelector(carouselSelector + ' .swiper, ' + carouselSelector + ' .swiper-container');
    if (!container && widgetEl && fallbackUrls && fallbackUrls.length) {
      const wCont = widgetEl.querySelector('.elementor-widget-container') || widgetEl;
      const slidesHtml = fallbackUrls.map(function(u) {
        return '<div class="swiper-slide"><figure class="swiper-slide-inner"><img class="swiper-slide-image" src="' + u + '" loading="eager" alt="" /></figure></div>';
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
    if (wrapper.dataset.mysuruInit === '1') {
      if (typeof wrapper._mysuruRefresh === 'function') wrapper._mysuruRefresh();
      return;
    }

    const rawSlides = Array.from(wrapper.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)'));
    if (rawSlides.length < 2) return;
    wrapper.dataset.mysuruInit = '1';

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
      if (window.innerWidth <= 767) return 16;
      return Math.round((window.innerWidth / 1920) * gapDesktop);
    }

    function getSlideStep() {
      const vis = getVisibleCount();
      const gapPx = getGapPx();
      const cWidth = container.clientWidth || 1400;
      const slideW = (cWidth - gapPx * (vis - 1)) / vis;
      return { vis: vis, gapPx: gapPx, slideW: slideW, step: slideW + gapPx };
    }

    function applyClasses(animate) {
      wrapper.querySelectorAll('.swiper-slide-duplicate').forEach(function(d) { d.remove(); });
      const allSlides = Array.from(wrapper.children);
      const m = getSlideStep();
      const isDesktop = window.innerWidth > 1024;
      allSlides.forEach(function(s, idx) {
        s.style.width = m.slideW + 'px';
        s.style.minWidth = m.slideW + 'px';
        s.style.maxWidth = m.slideW + 'px';
        s.style.marginRight = m.gapPx + 'px';
        s.style.flexShrink = '0';
        s.style.boxSizing = 'border-box';
        // Exact alternating vertical stagger on desktop (Card 1,3,5 lower by 3.65em, Card 2,4 higher at 0em)
        const rel = idx - currentIndex;
        if (isDesktop) {
          s.style.marginTop = (Math.abs(rel) % 2 === 0) ? '3.65em' : '0em';
        } else {
          s.style.marginTop = '0em';
        }
      });
      wrapper.style.transition = animate ? 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none';
      const offset = -(currentIndex * m.step);
      wrapper.style.transform = 'translate3d(' + offset + 'px, 0, 0)';
    }
    wrapper._mysuruRefresh = function() { applyClasses(false); };

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

    let timer = setInterval(nextSlide, 2800);
    function resetTimer() {
      clearInterval(timer);
      timer = setInterval(nextSlide, 2800);
    }
    container.addEventListener('mouseenter', function() { clearInterval(timer); });
    container.addEventListener('mouseleave', function() { resetTimer(); });
  }

  // Interactive Events 5-Panel Showcase + Pagination Dots
  function setupEventsShowcase() {
    const row = document.querySelector('.mysuru-events-slider-row');
    if (!row || row.dataset.mysuruEventsInit === '1') return;
    row.dataset.mysuruEventsInit = '1';

    const dots = Array.from(document.querySelectorAll('.mysuru-event-dot'));
    const prevBtn = document.querySelector('.mysuru-events-prev');
    const nextBtn = document.querySelector('.mysuru-events-next');
    const centerImg = document.querySelector('.mysuru-event-panel-3 img');
    let activeDot = 0;

    function setActiveDot(idx) {
      activeDot = (idx + 4) % 4;
      dots.forEach(function(d, i) {
        d.classList.toggle('active', i === activeDot);
      });
      if (centerImg) {
        centerImg.style.opacity = '0.78';
        setTimeout(function() { centerImg.style.opacity = '1'; }, 160);
      }
    }

    dots.forEach(function(d, i) {
      d.addEventListener('click', function() { setActiveDot(i); });
    });
    if (prevBtn) {
      prevBtn.addEventListener('click', function(e) {
        e.preventDefault();
        setActiveDot(activeDot - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        setActiveDot(activeDot + 1);
      });
    }
  }

  function initAll() {
    if (isElementorEditMode()) return;
    restorePlaceholderImages();
    const resultsFallback = [
      CDN + 'mysuru_topper_card_full.png',
      CDN + 'mysuru_topper_card_full.png',
      CDN + 'mysuru_topper_card_full.png',
      CDN + 'mysuru_topper_card_full.png',
      CDN + 'mysuru_topper_card_full.png',
      CDN + 'mysuru_topper_card_full.png',
      CDN + 'mysuru_topper_card_full.png',
      CDN + 'mysuru_topper_card_full.png',
      CDN + 'mysuru_topper_card_full.png',
      CDN + 'mysuru_topper_card_full.png'
    ];
    setupResultsCarousel('.mysuru-results-carousel', '.mysuru-results-prev', '.mysuru-results-next', 5, 28, resultsFallback);
    setupEventsShowcase();
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
</script>`
            },
            elements: []
          }
        ]
      )
    ]
  )
];

// Save standalone Elementor template JSON
const templateExport = {
  version: '0.4',
  title: 'RVPU Mysuru - Home Page 2 (Native Elementor, EM Responsive)',
  type: 'page',
  content: elementorData
};

const artifactJsonPath = 'C:/Users/HP/.gemini/antigravity/brain/c5c230c2-90b4-4fe7-b358-32b81fcbace0/rvpu-mysuru-homepage2-elementor-template.json';
fs.writeFileSync(artifactJsonPath, JSON.stringify(templateExport, null, 2));
console.log('Saved Elementor template JSON to:', artifactJsonPath);

const workspaceJsonPath = 'd:/hemanth bv/test/rvpu_mysuru_elementor_template.json';
fs.writeFileSync(workspaceJsonPath, JSON.stringify(templateExport, null, 2));
console.log('Saved Workspace Elementor template JSON to:', workspaceJsonPath);

const targetPageId = process.argv[2] ? Number(process.argv[2]) : 280;
const res = await callTool('wp_save_elementor_page', {
  pageId: targetPageId,
  title: 'RVPU Mysuru — Home Page 2',
  status: 'publish',
  template: 'elementor_canvas',
  elementorData
});
console.log('Save Page Result:', JSON.stringify(res, null, 2));

// Automatically bundle and update the complete import package ZIP
try {
  const { execSync } = await import('node:child_process');
  execSync('powershell -ExecutionPolicy Bypass -File "C:\\Users\\HP\\.gemini\\antigravity\\brain\\c5c230c2-90b4-4fe7-b358-32b81fcbace0\\scratch\\rvpu_mysuru\\update_mysuru_zip.ps1"', { stdio: 'inherit' });
  console.log('Elementor Package ZIP successfully updated.');
} catch (e) {
  console.error('Failed to update ZIP:', e.message);
}
