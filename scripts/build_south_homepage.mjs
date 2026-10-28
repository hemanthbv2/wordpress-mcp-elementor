process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import fs from 'node:fs';
import { callTool } from '../rvps/mcp.mjs';

let idCounter = 4000000;
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

function makeHeading(title, settings = {}) {
  const desktopEm = settings.fontSizeEm ?? 3.125;
  const tabletEm = settings.fontSizeTabletEm ?? 2.2;
  const mobileEm = settings.fontSizeMobileEm ?? 1.85;

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
      title_color: settings.color || '#252525',
      typography_typography: 'custom',
      typography_font_family: settings.fontFamily || 'Georgia',
      typography_font_size: { unit: 'em', size: desktopEm, sizes: [] },
      typography_font_size_tablet: { unit: 'em', size: tabletEm, sizes: [] },
      typography_font_size_mobile: { unit: 'em', size: mobileEm, sizes: [] },
      typography_font_weight: String(settings.fontWeight || '700'),
      typography_line_height: { unit: 'em', size: settings.lineHeight || 1.15, sizes: [] },
      ...withWidgetClasses(settings.extra)
    },
    elements: []
  };
}

function makeText(editorHtml, settings = {}) {
  const desktopEm = settings.fontSizeEm ?? 1.125;
  const tabletEm = settings.fontSizeTabletEm ?? 1.0;
  const mobileEm = settings.fontSizeMobileEm ?? 0.95;

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
      typography_line_height: { unit: 'em', size: settings.lineHeight || 1.25, sizes: [] },
      ...withWidgetClasses(settings.extra)
    },
    elements: []
  };
}

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
      typography_font_family: settings.fontFamily || 'Nunito',
      typography_font_size: { unit: 'em', size: desktopEm, sizes: [] },
      typography_font_size_tablet: { unit: 'em', size: tabletEm, sizes: [] },
      typography_font_size_mobile: { unit: 'em', size: mobileEm, sizes: [] },
      typography_font_weight: String(settings.fontWeight || '400'),
      button_text_color: settings.color || '#252525',
      background_color: settings.bgColor || '#00000000',
      border_border: 'solid',
      border_width: em(0.09375, 0.09375, 0.09375, 0.09375, 'em'),
      border_color: settings.borderColor || '#252525',
      border_radius: em(2.4375, 2.4375, 2.4375, 2.4375, 'em'),
      text_padding: em(0.85, 2.0, 0.85, 2.0, 'em'),
      ...withWidgetClasses(settings.extra)
    },
    elements: []
  };
}

function makeCarousel(mediaList, settings = {}) {
  return {
    id: nextId(),
    elType: 'widget',
    widgetType: 'image-carousel',
    settings: {
      carousel: mediaList.map((m) => ({ id: m.id, url: m.url })),
      thumbnail_size: 'full',
      slides_to_show: String(settings.slidesToShow || 3),
      slides_to_show_tablet: String(settings.slidesToShowTablet || 2),
      slides_to_show_mobile: '1',
      slides_to_scroll: '1',
      image_stretch: 'no',
      navigation: settings.navigation || 'none',
      autoplay: 'yes',
      pause_on_hover: 'yes',
      pause_on_interaction: 'yes',
      autoplay_speed: settings.autoplaySpeed || 3000,
      infinite: 'yes',
      speed: 600,
      image_spacing: 'custom',
      image_spacing_custom: { unit: 'px', size: settings.spacing ?? 12, sizes: [] },
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

const dir = 'C:/Users/HP/.gemini/antigravity/brain/c5c230c2-90b4-4fe7-b358-32b81fcbace0/scratch/rvpu_south';
const mediaMap = JSON.parse(fs.readFileSync(`${dir}/media_map.json`, 'utf8'));
const WP_UPLOAD_BASE = 'https://rvcollegeofengineering.in/test/wp-content/uploads/2026/10/';

const M = (filename) => {
  const entry = mediaMap[filename] || {};
  const cleanKey = filename.replace(/\.[^.]+$/, '').replace(/[^a-z0-9_-]/gi, '-');
  return {
    id: entry.id || '',
    url: entry.url || `${WP_UPLOAD_BASE}${filename}`,
    filename,
    assetClass: `south-asset-${cleanKey}`
  };
};

const MEDIA = {
  logo: M('south_logo.png'),
  heroPlay: M('south_hero_play.png'),
  welcomeBg: M('south_welcome_bg.png'),
  welcomeCollage: M('south_welcome_collage.png'),
  admissionsBg: M('south_admissions_bg.png'),
  iconPhoneGreen: M('south_icon_phone_green.png'),
  iconEmailGreen: M('south_icon_email_green.png'),
  coursesBg: M('south_courses_bg.png'),
  coursesMobileBg: M('south_courses_mobile_bg.png'),
  coursesEagle: M('south_courses_eagle.png'),
  iconPcmc: M('south_icon_pcmc.png'),
  iconPcmb: M('south_icon_pcmb.png'),
  iconBame: M('south_icon_bame.png'),
  iconBams: M('south_icon_bams.png'),
  iconSabe: M('south_icon_sabe.png'),
  whiteIconPcmb: M('south_white_icon_pcmb.png'),
  whiteIconPcmc: M('south_white_icon_pcmc.png'),
  whiteIconSabe: M('south_white_icon_sabe.png'),
  whiteIconBams: M('south_white_icon_bams.png'),
  whiteIconBame: M('south_white_icon_bame.png'),
  resultsBg: M('south_results_bg.png'),
  topperCardFull: M('south_topper_card_full.png'),
  topperPhoto: M('south_topper_photo.png'),
  arrowLeft: M('south_arrow_left.png'),
  arrowRight: M('south_arrow_right.png'),
  expandBg: M('south_expand_bg.png'),
  expandCardBg: M('south_expand_card_bg.png'),
  expandClassroom: M('south_expand_classroom.png'),
  eventsBg: M('south_events_bg.png'),
  eventPanel1: M('south_event_panel_1.png'),
  eventPanel2: M('south_event_panel_2.png'),
  eventPanel3: M('south_event_panel_3.png'),
  eventPanel4: M('south_event_panel_4.png'),
  eventPanel5: M('south_event_panel_5.png'),
  eventPanel6: M('south_event_panel_6.png'),
  eventPanel7: M('south_event_panel_7.png'),
  tourBg: M('south_tour_bg.png'),
  footerPhone: M('south_footer_phone.png'),
  footerEmail: M('south_footer_email.png'),
  footerMap: M('south_footer_map.png'),
  footerPrivacy: M('south_footer_privacy.png')
};

// Desktop Horizontal Course Card (Figma: 879 x 135px = 54.9375em x 8.4375em)
// Left overlapping dark circular badge (81x81px = 5.0625em) + Course Code (Georgia 40px = 2.5em) + Vertical Line (93px = 5.8125em) + 2x2 Subject Grid (Inter 25px = 1.5625em)
function makeSouthDesktopCourseCard(code, iconMedia, subjects, isLast = false) {
  const subjectsHtml = `<div class="south-course-subjects-grid"><div class="south-course-subj-item"><span class="south-tri">&#9654;</span><span class="south-subj-text">${subjects[0]}</span></div><div class="south-course-subj-item"><span class="south-tri">&#9654;</span><span class="south-subj-text">${subjects[1]}</span></div><div class="south-course-subj-item"><span class="south-tri">&#9654;</span><span class="south-subj-text">${subjects[2]}</span></div><div class="south-course-subj-item"><span class="south-tri">&#9654;</span><span class="south-subj-text">${subjects[3]}</span></div></div>`;

  return makeSection(
    {
      layout: 'full_width',
      content_position: 'middle',
      margin: em(0, 0, isLast ? 0 : 1.85, 0),
      css_classes: 'south-desktop-course-row'
    },
    [
      makeColumn(
        10,
        {
          content_position: 'center',
          align: 'center',
          css_classes: 'south-desktop-course-badge-col'
        },
        [
          makeImage(iconMedia, {
            align: 'center',
            alt: code,
            extra: {
              css_classes: 'south-desktop-course-badge'
            }
          })
        ],
        true
      ),
      makeColumn(
        90,
        {
          content_position: 'center',
          background_background: 'classic',
          background_color: '#FFFFFF',
          css_classes: 'south-desktop-course-pill'
        },
        [
          makeHeading(code, {
            header_size: 'h4',
            align: 'left',
            color: '#000000',
            fontFamily: 'Georgia',
            fontSizeEm: 2.5,
            fontWeight: '400',
            lineHeight: 1.1,
            extra: {
              css_classes: 'south-desktop-course-code'
            }
          }),
          makeText(subjectsHtml, {
            align: 'left',
            color: '#000000',
            fontFamily: 'Inter',
            fontSizeEm: 1.0,
            fontWeight: '400',
            lineHeight: 1.2,
            extra: {
              css_classes: 'south-desktop-course-subjects-widget'
            }
          })
        ],
        true
      )
    ],
    true
  );
}

// Mobile Course Card matching Frame 22:2 ("Home pg mobile veresion")
// First card (PCMB) is expanded by default with dark 58x58 circle (icon + PCMB text) flanked by horizontal lines + 2x2 subjects grid;
// Cards 2..5 (PCMC, SEBA, BAMS, BAME) render as compact 312x48 white bars with dark 36x36 circle icon + bold Georgia code, and expand on click!
function makeSouthMobileCoursesAccordion() {
  const mobileCourses = [
    {
      code: 'PCMB',
      icon: MEDIA.whiteIconPcmb,
      subjects: ['Physics', 'Chemistry', 'Mathematics', 'Computer Science'],
      expanded: true
    },
    {
      code: 'PCMC',
      icon: MEDIA.whiteIconPcmc,
      subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
      expanded: false
    },
    {
      code: 'SEBA',
      icon: MEDIA.whiteIconSabe,
      subjects: ['Statistics', 'Business Studies', 'Economics', 'Accountancy'],
      expanded: false
    },
    {
      code: 'BAMS',
      icon: MEDIA.whiteIconBams,
      subjects: ['Business Studies', 'Basic Mathematics', 'Accountancy', 'Statistics'],
      expanded: false
    },
    {
      code: 'BAME',
      icon: MEDIA.whiteIconBame,
      subjects: ['Business Studies', 'Basic Mathematics', 'Accountancy', 'Computer Science'],
      expanded: false
    }
  ];

  const cardsHtml = mobileCourses
    .map((c, idx) => {
      const activeCls = c.expanded ? 'is-expanded' : '';
      return `
<div class="south-mob-card ${activeCls}" data-mob-course="${idx}">
  <!-- Compact bar state (shown when collapsed) -->
  <div class="south-mob-card-compact">
    <span class="south-mob-compact-circle ${c.icon.assetClass}">
      <img src="${c.icon.url}" alt="${c.code}" />
    </span>
    <span class="south-mob-compact-code">${c.code}</span>
  </div>
  <!-- Expanded state (shown when active, PCMB active by default matching 22:2) -->
  <div class="south-mob-card-expanded">
    <div class="south-mob-exp-header">
      <span class="south-mob-exp-line"></span>
      <span class="south-mob-exp-circle ${c.icon.assetClass}">
        <img src="${c.icon.url}" alt="${c.code}" />
        <span class="south-mob-exp-circle-code">${c.code}</span>
      </span>
      <span class="south-mob-exp-line"></span>
    </div>
    <div class="south-mob-exp-subjects">
      <div class="south-mob-exp-subj"><span class="south-mob-tri">&#9654;</span><span>${c.subjects[0]}</span></div>
      <div class="south-mob-exp-subj"><span class="south-mob-tri">&#9654;</span><span>${c.subjects[1]}</span></div>
      <div class="south-mob-exp-subj"><span class="south-mob-tri">&#9654;</span><span>${c.subjects[2]}</span></div>
      <div class="south-mob-exp-subj"><span class="south-mob-tri">&#9654;</span><span>${c.subjects[3]}</span></div>
    </div>
  </div>
</div>`.trim();
    })
    .join('\n');

  return makeHtml(`<div class="south-mob-courses-list">${cardsHtml}</div>`, {
    extra: {
      _margin: em(0, 0, 1.35, 0),
      css_classes: 'south-mob-courses-accordion-widget'
    }
  });
}

const elementorData = [
  // =========================================================================
  // SECTION 1: HEADER BAR (Figma y=0..167, h=167px = 10.4375em)
  // Left Logo: x=69, y=35, w=256, h=104 (16em x 6.5em)
  // Right Green Menu Block: x=1744, y=0, w=176, h=167 (#64C38A, 3 bars + "Menu")
  // =========================================================================
  makeSection(
    {
      layout: 'full_width',
      content_position: 'middle',
      background_background: 'classic',
      background_color: '#FFFFFF',
      border_border: 'solid',
      border_width: em(0, 0, 0.0625, 0),
      border_color: '#252525',
      padding: em(0, 0, 0, 4.3125),
      padding_tablet: em(0, 0, 0, 2.0),
      padding_mobile: em(0, 0, 0, 1.0),
      css_classes: 'south-header-section'
    },
    [
      makeColumn(
        90.833,
        {
          sizeTablet: 84,
          sizeMobile: 76,
          content_position: 'center',
          padding: em(1.95, 0, 1.95, 0),
          padding_tablet: em(1.1, 0, 1.1, 0),
          padding_mobile: em(0.75, 0, 0.75, 0),
          css_classes: 'south-header-logo-col'
        },
        [
          makeImage(MEDIA.logo, {
            align: 'left',
            extra: {
              css_classes: 'south-logo-img'
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
          background_color: '#64C38A',
          padding: em(2.65, 0.5, 1.85, 0.5),
          padding_tablet: em(1.5, 0.5, 1.25, 0.5),
          padding_mobile: em(1.0, 0.25, 0.85, 0.25),
          css_classes: 'south-header-menu-col'
        },
        [
          {
            id: nextId(),
            elType: 'widget',
            widgetType: 'divider',
            settings: {
              style: 'solid',
              weight: { unit: 'px', size: 9, sizes: [] },
              color: '#252525',
              width: { unit: 'px', size: 70, sizes: [] },
              align: 'center',
              gap: { unit: 'px', size: 0, sizes: [] },
              _margin: em(0, 0, 0.7, 0),
              css_classes: 'south-menu-bar'
            },
            elements: []
          },
          {
            id: nextId(),
            elType: 'widget',
            widgetType: 'divider',
            settings: {
              style: 'solid',
              weight: { unit: 'px', size: 9, sizes: [] },
              color: '#252525',
              width: { unit: 'px', size: 70, sizes: [] },
              align: 'center',
              gap: { unit: 'px', size: 0, sizes: [] },
              _margin: em(0, 0, 0.7, 0),
              css_classes: 'south-menu-bar'
            },
            elements: []
          },
          {
            id: nextId(),
            elType: 'widget',
            widgetType: 'divider',
            settings: {
              style: 'solid',
              weight: { unit: 'px', size: 9, sizes: [] },
              color: '#252525',
              width: { unit: 'px', size: 70, sizes: [] },
              align: 'center',
              gap: { unit: 'px', size: 0, sizes: [] },
              _margin: em(0, 0, 0.5, 0),
              css_classes: 'south-menu-bar'
            },
            elements: []
          },
          makeHeading('Menu', {
            header_size: 'span',
            align: 'center',
            color: '#252525',
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
  // SECTION 2: HERO VIDEO BANNER (Figma y=167..961, h=794px = 49.625em)
  // Play button at x=869, y=517, w=158, h=158 (9.875em x 9.875em)
  // =========================================================================
  makeSection(
    {
      layout: 'full_width',
      content_position: 'middle',
      background_background: 'classic',
      background_color: '#252525',
      padding: em(21.875, 2.0, 17.875, 2.0),
      padding_tablet: em(12.0, 1.5, 11.0, 1.5),
      padding_mobile: em(7.5, 1.25, 7.5, 1.25),
      css_classes: 'south-hero-section'
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
              css_classes: 'south-play-btn-widget'
            }
          })
        ]
      )
    ]
  ),

  // =========================================================================
  // SECTION 3: WELCOME TO RV PU COLLEGE SOUTH (Figma y=961..1683, h=722px = 45.125em)
  // Left Column (46.5% = 893px): Welcome Collage (Eagle + 2 Photos + Stamp Badge)
  // Right Column (53.5% = 1027px): Heading + Divider + 2 Paragraphs + "Know More ->"
  // =========================================================================
  makeSection(
    {
      layout: 'full_width',
      content_position: 'top',
      background_background: 'classic',
      background_color: '#FAF4E7',
      background_image: { url: MEDIA.welcomeBg.url, id: MEDIA.welcomeBg.id },
      background_position: 'top center',
      background_repeat: 'no-repeat',
      background_size: 'cover',
      padding: em(0, 0, 0, 0),
      css_classes: 'south-welcome-section'
    },
    [
      makeColumn(
        46.5,
        {
          sizeTablet: 100,
          sizeMobile: 100,
          content_position: 'top',
          padding: em(0, 0, 0, 1.375),
          padding_tablet: em(2.0, 2.0, 1.0, 2.0),
          padding_mobile: em(1.5, 1.0, 1.0, 1.0),
          css_classes: 'south-welcome-left-col'
        },
        [
          makeImage(MEDIA.welcomeCollage, {
            align: 'left',
            alignTablet: 'center',
            alignMobile: 'center',
            extra: {
              css_classes: 'south-welcome-collage-img'
            }
          })
        ]
      ),
      makeColumn(
        53.5,
        {
          sizeTablet: 100,
          sizeMobile: 100,
          content_position: 'top',
          padding: em(12.625, 11.25, 3.5, 2.3125),
          padding_tablet: em(2.0, 2.5, 3.0, 2.5),
          padding_mobile: em(1.5, 1.25, 2.5, 1.25),
          css_classes: 'south-welcome-right-col'
        },
        [
          makeHeading(
            '<span style="color:#252525;">WELCOME TO </span><br><span style="color:#252525;">RV PU COLLEGE </span><span style="color:#64C38A;">SOUTH</span><span class="south-sr-only"> RVPU COLLEGE SOUTH</span>',
            {
              header_size: 'h1',
              align: 'left',
              color: '#252525',
              fontFamily: 'Georgia',
              fontSizeEm: 3.125,
              fontSizeTabletEm: 2.3,
              fontSizeMobileEm: 1.85,
              fontWeight: '700',
              lineHeight: 1.14,
              extra: {
                _margin: em(0, 0, 1.9, 0),
                _margin_mobile: em(0, 0, 1.0, 0),
                css_classes: 'south-welcome-heading'
              }
            }
          ),
          {
            id: nextId(),
            elType: 'widget',
            widgetType: 'divider',
            settings: {
              style: 'solid',
              weight: { unit: 'px', size: 1, sizes: [] },
              color: '#707070',
              width: { unit: '%', size: 96, sizes: [] },
              align: 'left',
              gap: { unit: 'px', size: 0, sizes: [] },
              _margin: em(0, 0, 1.8, 0),
              _margin_mobile: em(0, 0, 1.1, 0),
              css_classes: 'south-welcome-divider'
            },
            elements: []
          },
          makeText(
            '<p style="margin:0 0 1.2em 0;">Welcome to RV PU College South, Bengaluru(RVPU South Bengaluru), where our mission is to provide a positive learning environment that encourages students to reach their full potential.</p> <p style="margin:0;">We are a pre-university college, offering comprehensive education for young adults to prepare for their university studies. Our college provides an excellent learning environment with experienced and knowledgeable faculty, modern facilities and abundant resources. We strive to provide our students with the best academic and personal growth opportunities, so that they can become well-rounded and successful individuals.</p>',
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
                _margin: em(0, 0, 1.9, 0),
                _margin_mobile: em(0, 0, 1.35, 0),
                css_classes: 'south-welcome-body'
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
              css_classes: 'south-btn-pill south-btn-dark south-btn-with-arrow'
            }
          })
        ]
      )
    ]
  ),

  // =========================================================================
  // SECTION 4: ADMISSIONS OPEN: 2026 -2027 (Figma y=1683..1968, h=285px = 17.8125em)
  // Green-bordered pill box + Enquiries Row + White-bordered "Know More" pill button
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
      padding: em(2.5, 6.5, 1.8, 6.5),
      padding_tablet: em(2.25, 2.0, 2.0, 2.0),
      padding_mobile: em(1.85, 1.0, 1.85, 1.0),
      css_classes: 'south-admissions-section'
    },
    [
      makeColumn(
        100,
        {
          align: 'center'
        },
        [
          makeHeading(
            '<span class="south-adm-pill-box"><span class="south-adm-title-text">ADMISSIONS OPEN:</span> <span class="south-adm-year-text">2026 -2027</span></span>',
            {
              header_size: 'h2',
              align: 'center',
              color: '#FFFFFF',
              fontFamily: 'Georgia',
              fontSizeEm: 2.5,
              fontSizeTabletEm: 1.9,
              fontSizeMobileEm: 1.35,
              fontWeight: '700',
              lineHeight: 1.2,
              extra: {
                _margin: em(0, 0, 1.4, 0),
                _margin_mobile: em(0, 0, 1.0, 0),
                css_classes: 'south-admissions-heading'
              }
            }
          ),
          makeSection(
            {
              layout: 'full_width',
              content_position: 'middle',
              gap: 'no',
              margin: em(0, 0, 1.75, 0),
              margin_mobile: em(0, 0, 1.25, 0),
              css_classes: 'south-adm-enquiries-row'
            },
            [
              makeColumn(
                42,
                {
                  sizeTablet: 100,
                  sizeMobile: 100,
                  content_position: 'center',
                  padding: em(0, 0.75, 0, 0),
                  padding_tablet: em(0, 0, 0.5, 0),
                  padding_mobile: em(0, 0, 0.5, 0)
                },
                [
                  makeHeading('For Admissions Enquiries:', {
                    header_size: 'h4',
                    align: 'right',
                    alignTablet: 'center',
                    alignMobile: 'center',
                    color: '#FFFFFF',
                    fontFamily: 'Georgia',
                    fontSizeEm: 1.5625,
                    fontSizeTabletEm: 1.35,
                    fontSizeMobileEm: 1.15,
                    fontWeight: '400',
                    lineHeight: 1.2
                  })
                ],
                true
              ),
              makeColumn(
                24,
                {
                  sizeTablet: 50,
                  sizeMobile: 100,
                  content_position: 'center',
                  padding: em(0, 0.5, 0, 0.5),
                  padding_mobile: em(0, 0, 0.4, 0),
                  css_classes: 'south-adm-contact-col'
                },
                [
                  makeImage(MEDIA.iconPhoneGreen, {
                    align: 'center',
                    extra: {
                      css_classes: 'south-adm-icon-widget'
                    }
                  }),
                  makeHeading('<a href="tel:8317346585" style="color:#FFFFFF;text-decoration:none;">8317346585</a>', {
                    header_size: 'span',
                    align: 'left',
                    color: '#FFFFFF',
                    fontFamily: 'Inter',
                    fontSizeEm: 1.125,
                    fontSizeTabletEm: 1.0,
                    fontSizeMobileEm: 0.95,
                    fontWeight: '400',
                    lineHeight: 1.2,
                    extra: {
                      css_classes: 'south-adm-contact-text'
                    }
                  })
                ],
                true
              ),
              makeColumn(
                34,
                {
                  sizeTablet: 50,
                  sizeMobile: 100,
                  content_position: 'center',
                  padding: em(0, 0, 0, 0.5),
                  css_classes: 'south-adm-contact-col'
                },
                [
                  makeImage(MEDIA.iconEmailGreen, {
                    align: 'center',
                    extra: {
                      css_classes: 'south-adm-icon-widget'
                    }
                  }),
                  makeHeading('<a href="mailto:info.rvpus@rvei.edu.in" style="color:#FFFFFF;text-decoration:none;">info.rvpus@rvei.edu.in</a>', {
                    header_size: 'span',
                    align: 'left',
                    color: '#FFFFFF',
                    fontFamily: 'Inter',
                    fontSizeEm: 1.125,
                    fontSizeTabletEm: 1.0,
                    fontSizeMobileEm: 0.95,
                    fontWeight: '400',
                    lineHeight: 1.2,
                    extra: {
                      css_classes: 'south-adm-contact-text'
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
            color: '#FFFFFF',
            borderColor: '#FFFFFF',
            bgColor: '#00000000',
            fontSizeEm: 1.0,
            extra: {
              css_classes: 'south-btn-pill south-btn-white'
            }
          })
        ]
      )
    ]
  ),

  // =========================================================================
  // SECTION 5A: OUR COURSES — DESKTOP (Figma y=1968..3090, h=1122px = 70.125em)
  // Left Eagle Mascot with Backpack + Right 5 Horizontal Course Cards + Bottom "Know More"
  // =========================================================================
  makeSection(
    {
      layout: 'full_width',
      background_background: 'classic',
      background_color: '#76C397',
      background_image: { url: MEDIA.coursesBg.url, id: MEDIA.coursesBg.id },
      background_position: 'top center',
      background_repeat: 'no-repeat',
      background_size: 'cover',
      padding: em(2.375, 4.0, 1.95, 4.0),
      hide_tablet: 'yes',
      hide_mobile: 'yes',
      css_classes: 'south-courses-section south-courses-desktop-section'
    },
    [
      makeColumn(
        100,
        {
          align: 'center'
        },
        [
          makeHeading('OUR COURSES', {
            header_size: 'h2',
            align: 'center',
            color: '#252525',
            fontFamily: 'Georgia',
            fontSizeEm: 3.125,
            fontWeight: '700',
            lineHeight: 1.15,
            extra: {
              _margin: em(0, 0, 2.2, 0),
              css_classes: 'south-courses-heading'
            }
          }),
          makeSection(
            {
              layout: 'full_width',
              content_position: 'top',
              gap: 'no',
              margin: em(0, 0, 0.2, 0),
              css_classes: 'south-courses-main-row'
            },
            [
              // Left Column: Standing Eagle Mascot with Backpack (x=252, y=2113, w=466, h=878)
              makeColumn(
                40,
                {
                  content_position: 'bottom',
                  padding: em(0.85, 0, 0, 11.5),
                  css_classes: 'south-courses-eagle-col'
                },
                [
                  makeImage(MEDIA.coursesEagle, {
                    align: 'center',
                    extra: {
                      css_classes: 'south-courses-eagle-img'
                    }
                  })
                ],
                true
              ),
              // Right Column: 5 Horizontal Course Cards (x=788..1667, y=2099..2905)
              makeColumn(
                60,
                {
                  content_position: 'top',
                  padding: em(0, 10.5, 0, 1.25),
                  css_classes: 'south-courses-cards-col'
                },
                [
                  makeSouthDesktopCourseCard('PCMC', MEDIA.iconPcmc, ['Physics', 'Chemistry', 'Mathematics', 'Biology']),
                  makeSouthDesktopCourseCard('PCMB', MEDIA.iconPcmb, ['Physics', 'Chemistry', 'Mathematics', 'Computer Science']),
                  makeSouthDesktopCourseCard('BAME', MEDIA.iconBame, ['Business Studies', 'Basic Mathematics', 'Accountancy', 'Computer Science']),
                  makeSouthDesktopCourseCard('BAMS', MEDIA.iconBams, ['Business Studies', 'Basic Mathematics', 'Accountancy', 'Statistics']),
                  makeSouthDesktopCourseCard('SABE', MEDIA.iconSabe, ['Statistics', 'Business Studies', 'Economics', 'Accountancy'], true)
                ],
                true
              )
            ],
            true
          ),
          makeButton('Know More', {
            align: 'center',
            color: '#252525',
            borderColor: '#252525',
            bgColor: '#00000000',
            fontSizeEm: 1.0,
            extra: {
              _margin: em(0.35, 0, 0, 0),
              css_classes: 'south-btn-pill south-btn-dark south-courses-know-more'
            }
          })
        ]
      )
    ]
  ),

  // =========================================================================
  // SECTION 5B: OUR COURSES — MOBILE & TABLET (Figma 22:2 "Home pg mobile veresion", 430x803px)
  // Green Grid Background + "OUR COURSES" + Centered Eagle Mascot + PCMB Expanded Card + PCMC/SEBA/BAMS/BAME Bars + "Know More >"
  // =========================================================================
  makeSection(
    {
      layout: 'full_width',
      background_background: 'classic',
      background_color: '#76C397',
      background_image: { url: MEDIA.coursesMobileBg.url, id: MEDIA.coursesMobileBg.id },
      background_position: 'top center',
      background_repeat: 'no-repeat',
      background_size: 'cover',
      padding: em(1.4, 1.25, 2.0, 1.25),
      padding_tablet: em(2.25, 2.0, 2.5, 2.0),
      padding_mobile: em(1.4, 1.25, 2.0, 1.25),
      hide_desktop: 'yes',
      css_classes: 'south-courses-mobile-section'
    },
    [
      makeColumn(
        100,
        {
          align: 'center',
          css_classes: 'south-courses-mobile-col'
        },
        [
          makeHeading('OUR COURSES', {
            header_size: 'h2',
            align: 'center',
            color: '#252525',
            fontFamily: 'Georgia',
            fontSizeEm: 1.35,
            fontSizeTabletEm: 1.75,
            fontSizeMobileEm: 1.25,
            fontWeight: '700',
            lineHeight: 1.2,
            extra: {
              _margin: em(0, 0, 0.35, 0),
              css_classes: 'south-mob-courses-heading'
            }
          }),
          makeImage(MEDIA.coursesEagle, {
            align: 'center',
            extra: {
              _margin: em(0, 0, -0.35, 0),
              css_classes: 'south-mob-courses-eagle'
            }
          }),
          makeSouthMobileCoursesAccordion(),
          makeButton('Know More', {
            align: 'center',
            color: '#000000',
            borderColor: '#000000',
            bgColor: '#00000000',
            fontSizeEm: 0.85,
            fontSizeTabletEm: 0.95,
            fontSizeMobileEm: 0.75,
            extra: {
              css_classes: 'south-mob-courses-btn'
            }
          })
        ]
      )
    ]
  ),

  // =========================================================================
  // SECTION 6: RESULTS (Compact & Balanced 3-Card Carousel)
  // Cream Background + Geometric Corners + 3 Topper Cards (Niharika Ramesh) + Dark Arrows + "Know More"
  // =========================================================================
  makeSection(
    {
      layout: 'full_width',
      background_background: 'classic',
      background_color: '#FAF4E7',
      background_image: { url: MEDIA.resultsBg.url, id: MEDIA.resultsBg.id },
      background_position: 'center center',
      background_repeat: 'no-repeat',
      background_size: 'cover',
      padding: em(2.1, 14.0, 1.85, 14.0),
      padding_tablet: em(2.0, 2.5, 1.85, 2.5),
      padding_mobile: em(1.65, 0.75, 1.65, 0.75),
      css_classes: 'south-results-section'
    },
    [
      makeColumn(
        100,
        {
          align: 'center'
        },
        [
          makeHeading('RESULTS<span class="south-sr-only"> Niharika Ramesh 597/600 French/Phy/Maths/CS – 100</span>', {
            header_size: 'h2',
            align: 'center',
            color: '#252525',
            fontFamily: 'Georgia',
            fontSizeEm: 2.75,
            fontSizeTabletEm: 2.0,
            fontSizeMobileEm: 1.65,
            fontWeight: '700',
            lineHeight: 1.15,
            extra: {
              _margin: em(0, 0, 0.85, 0),
              _margin_mobile: em(0, 0, 0.65, 0),
              css_classes: 'south-results-heading'
            }
          }),
          makeSection(
            {
              layout: 'full_width',
              content_position: 'middle',
              gap: 'no',
              margin: em(0, 0, 1.35, 0),
              margin_mobile: em(0, 0, 1.0, 0),
              css_classes: 'south-results-slider-row'
            },
            [
              makeColumn(
                8,
                {
                  sizeTablet: 10,
                  sizeMobile: 14,
                  content_position: 'center',
                  align: 'left',
                  css_classes: 'south-slider-arrow-col'
                },
                [
                  makeImage(MEDIA.arrowLeft, {
                    align: 'left',
                    extra: {
                      css_classes: 'south-arrow-btn south-results-prev'
                    }
                  })
                ],
                true
              ),
              makeColumn(
                84,
                {
                  sizeTablet: 80,
                  sizeMobile: 72,
                  padding: em(0, 0.5, 0, 0.5),
                  css_classes: 'south-results-carousel-col'
                },
                [
                  makeCarousel(
                    [
                      MEDIA.topperCardFull,
                      MEDIA.topperCardFull,
                      MEDIA.topperCardFull,
                      MEDIA.topperCardFull,
                      MEDIA.topperCardFull,
                      MEDIA.topperCardFull
                    ],
                    {
                      slidesToShow: 3,
                      slidesToShowTablet: 2,
                      spacing: 16,
                      autoplaySpeed: 3000,
                      extra: {
                        css_classes: 'south-results-carousel'
                      }
                    }
                  )
                ],
                true
              ),
              makeColumn(
                8,
                {
                  sizeTablet: 10,
                  sizeMobile: 14,
                  content_position: 'center',
                  align: 'right',
                  css_classes: 'south-slider-arrow-col'
                },
                [
                  makeImage(MEDIA.arrowRight, {
                    align: 'right',
                    extra: {
                      css_classes: 'south-arrow-btn south-results-next'
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
            color: '#252525',
            borderColor: '#252525',
            bgColor: '#00000000',
            fontSizeEm: 0.95,
            extra: {
              css_classes: 'south-btn-pill south-btn-dark south-results-btn'
            }
          })
        ]
      )
    ]
  ),

  // =========================================================================
  // SECTION 7: EXPAND YOUR POTENTIAL (Figma y=3875..4567, h=692px = 43.25em)
  // Dark Photo + Line-Art Bg | Left: White Heading + Green Textured Card | Right: Classroom Photo
  // =========================================================================
  makeSection(
    {
      layout: 'full_width',
      content_position: 'middle',
      background_background: 'classic',
      background_color: '#2B2B2B',
      background_image: { url: MEDIA.expandBg.url, id: MEDIA.expandBg.id },
      background_position: 'center center',
      background_repeat: 'no-repeat',
      background_size: 'cover',
      padding: em(4.4375, 4.1875, 3.125, 9.0),
      padding_tablet: em(2.75, 2.0, 2.75, 2.0),
      padding_mobile: em(2.0, 1.0, 2.0, 1.0),
      css_classes: 'south-expand-section'
    },
    [
      // Left Column (49.85% = 852px): White Heading + Green Textured Card
      makeColumn(
        49.85,
        {
          sizeTablet: 100,
          sizeMobile: 100,
          content_position: 'top',
          padding: em(1.625, 0, 0, 0),
          padding_tablet: em(0, 0, 1.75, 0),
          padding_mobile: em(0, 0, 1.5, 0),
          css_classes: 'south-expand-left-col'
        },
        [
          makeHeading('EXPAND YOUR POTENTIAL', {
            header_size: 'h2',
            align: 'left',
            color: '#FFFFFF',
            fontFamily: 'Georgia',
            fontSizeEm: 3.125,
            fontSizeTabletEm: 2.2,
            fontSizeMobileEm: 1.75,
            fontWeight: '700',
            lineHeight: 1.15,
            extra: {
              _margin: em(0, 0, 1.875, 0),
              _margin_mobile: em(0, 0, 1.1, 0),
              css_classes: 'south-expand-heading'
            }
          }),
          makeSection(
            {
              layout: 'full_width',
              background_background: 'classic',
              background_color: '#76C397',
              background_image: { url: MEDIA.expandCardBg.url, id: MEDIA.expandCardBg.id },
              background_position: 'center center',
              background_repeat: 'no-repeat',
              background_size: 'cover',
              border_radius: em(1.125, 0, 0, 1.125),
              padding: em(2.5625, 1.0625, 1.875, 2.75),
              padding_tablet: em(2.0, 1.75, 1.75, 1.75),
              padding_mobile: em(1.5, 1.25, 1.5, 1.25),
              css_classes: 'south-expand-green-card'
            },
            [
              makeColumn(
                100,
                {},
                [
                  makeText(
                    '<p style="margin:0;">We have opened doors to learning across Bengaluru, with campuses thoughtfully located to bring quality education closer to you. Each branch carries the same commitment to academic excellence, holistic growth and a student-first environment, yet each has a unique culture shaped by its community and surroundings.Whether you seek an energetic academic hub, a calm learning atmosphere or a space that balances creativity and discipline, you’ll find a campus that feels just right. Explore our centres, learn what makes them special and choose the environment that empowers you to grow, achieve and thrive.</p>',
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
                        css_classes: 'south-expand-body'
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
                      css_classes: 'south-btn-pill south-btn-dark'
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
      // Right Column (50.15% = 856px): Classroom Photo (DSC05211, 856x570px)
      makeColumn(
        50.15,
        {
          sizeTablet: 100,
          sizeMobile: 100,
          content_position: 'top',
          padding: em(0, 0, 0, 0),
          css_classes: 'south-expand-right-col'
        },
        [
          makeImage(MEDIA.expandClassroom, {
            align: 'left',
            width: 100,
            widthUnit: '%',
            extra: {
              css_classes: 'south-expand-classroom-img'
            }
          })
        ]
      )
    ]
  ),

  // =========================================================================
  // SECTION 8: EVENTS (Figma y=4567..5276, h=709px = 44.3125em)
  // Green Topographic Wave Bg + Heading + Subtitle + 7 Perspective Panels + Dark Arrows + "Know More"
  // =========================================================================
  makeSection(
    {
      layout: 'full_width',
      background_background: 'classic',
      background_color: '#76C397',
      background_image: { url: MEDIA.eventsBg.url, id: MEDIA.eventsBg.id },
      background_position: 'center center',
      background_repeat: 'no-repeat',
      background_size: 'cover',
      padding: em(2.625, 7.0, 2.0, 7.0),
      padding_tablet: em(2.5, 2.0, 2.25, 2.0),
      padding_mobile: em(2.0, 0.75, 2.0, 0.75),
      css_classes: 'south-events-section'
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
            color: '#252525',
            fontFamily: 'Georgia',
            fontSizeEm: 3.125,
            fontSizeTabletEm: 2.2,
            fontSizeMobileEm: 1.85,
            fontWeight: '700',
            lineHeight: 1.15,
            extra: {
              _margin: em(0, 0, 1.85, 0),
              _margin_mobile: em(0, 0, 1.0, 0),
              css_classes: 'south-events-heading'
            }
          }),
          makeText(
            '<p style="margin:0;">From academic achievements and cultural celebrations to sports victories, student-led initiatives and inspiring guest sessions, our campus is always alive with energy, creativity and talent. Dive into the experiences that define student life at RVPU South.</p>',
            {
              align: 'center',
              color: '#252525',
              fontFamily: 'Inter',
              fontSizeEm: 1.125,
              fontSizeTabletEm: 1.0,
              fontSizeMobileEm: 0.95,
              fontWeight: '400',
              lineHeight: 1.25,
              extra: {
                _margin: em(0, 0, 1.35, 0),
                css_classes: 'south-events-subtitle'
              }
            }
          ),
          // 7-Panel Perspective Showcase + Left/Right Dark Circular Arrows
          makeSection(
            {
              layout: 'full_width',
              content_position: 'middle',
              gap: 'no',
              margin: em(0, 0, 2.4, 0),
              margin_mobile: em(0, 0, 1.5, 0),
              css_classes: 'south-events-slider-row'
            },
            [
              makeColumn(
                7,
                {
                  sizeTablet: 10,
                  sizeMobile: 14,
                  content_position: 'center',
                  align: 'left',
                  css_classes: 'south-slider-arrow-col'
                },
                [
                  makeImage(MEDIA.arrowLeft, {
                    align: 'left',
                    extra: {
                      css_classes: 'south-arrow-btn south-events-prev'
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
                  css_classes: 'south-events-panels-col'
                },
                [
                  makeHtml(
                    `<div class="south-events-carousel-wrap">
                      <div class="south-events-perspective-stage" data-active-event="3">
                        <div class="south-evt-item south-evt-p1 ${MEDIA.eventPanel1.assetClass}" data-evt-index="0" data-slot="0"><img src="${MEDIA.eventPanel1.url}" alt="Event 1" /></div>
                        <div class="south-evt-item south-evt-p2 ${MEDIA.eventPanel2.assetClass}" data-evt-index="1" data-slot="1"><img src="${MEDIA.eventPanel2.url}" alt="Event 2" /></div>
                        <div class="south-evt-item south-evt-p3 ${MEDIA.eventPanel3.assetClass}" data-evt-index="2" data-slot="2"><img src="${MEDIA.eventPanel3.url}" alt="Event 3" /></div>
                        <div class="south-evt-item south-evt-p4 is-center ${MEDIA.eventPanel4.assetClass}" data-evt-index="3" data-slot="3"><img src="${MEDIA.eventPanel4.url}" alt="Event 4" /></div>
                        <div class="south-evt-item south-evt-p5 ${MEDIA.eventPanel5.assetClass}" data-evt-index="4" data-slot="4"><img src="${MEDIA.eventPanel5.url}" alt="Event 5" /></div>
                        <div class="south-evt-item south-evt-p6 ${MEDIA.eventPanel6.assetClass}" data-evt-index="5" data-slot="5"><img src="${MEDIA.eventPanel6.url}" alt="Event 6" /></div>
                        <div class="south-evt-item south-evt-p7 ${MEDIA.eventPanel7.assetClass}" data-evt-index="6" data-slot="6"><img src="${MEDIA.eventPanel7.url}" alt="Event 7" /></div>
                      </div>
                      <div class="south-events-dots" role="tablist" aria-label="Events Carousel Pagination">
                        <button type="button" class="south-evt-dot" data-dot="0" aria-label="Slide 1"></button>
                        <button type="button" class="south-evt-dot" data-dot="1" aria-label="Slide 2"></button>
                        <button type="button" class="south-evt-dot" data-dot="2" aria-label="Slide 3"></button>
                        <button type="button" class="south-evt-dot is-active" data-dot="3" aria-label="Slide 4"></button>
                        <button type="button" class="south-evt-dot" data-dot="4" aria-label="Slide 5"></button>
                        <button type="button" class="south-evt-dot" data-dot="5" aria-label="Slide 6"></button>
                        <button type="button" class="south-evt-dot" data-dot="6" aria-label="Slide 7"></button>
                      </div>
                    </div>`
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
                  css_classes: 'south-slider-arrow-col'
                },
                [
                  makeImage(MEDIA.arrowRight, {
                    align: 'right',
                    extra: {
                      css_classes: 'south-arrow-btn south-events-next'
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
            color: '#252525',
            borderColor: '#252525',
            bgColor: '#00000000',
            fontSizeEm: 1.0,
            extra: {
              css_classes: 'south-btn-pill south-btn-dark'
            }
          })
        ]
      )
    ]
  ),

  // =========================================================================
  // SECTION 9: TAKE A VIRTUAL TOUR OF OUR CAMPUS (Figma y=5276..5813, h=537px = 33.5625em)
  // Left Heading (x=168, y=5443, w=383, h=150) + Right Light Green Frame (#CBE8D8, 1010x414) with Inner White Screen (#FFFFFF, 860x313)
  // =========================================================================
  makeSection(
    {
      layout: 'full_width',
      content_position: 'middle',
      background_background: 'classic',
      background_color: '#FAF4E7',
      background_image: { url: MEDIA.tourBg.url, id: MEDIA.tourBg.id },
      background_position: 'center center',
      background_repeat: 'no-repeat',
      background_size: 'cover',
      padding: em(4.0625, 10.75, 3.625, 10.5),
      padding_tablet: em(2.75, 2.0, 2.75, 2.0),
      padding_mobile: em(2.0, 1.0, 2.25, 1.0),
      css_classes: 'south-tour-section'
    },
    [
      makeColumn(
        36.0,
        {
          sizeTablet: 100,
          sizeMobile: 100,
          content_position: 'center',
          padding: em(0, 2.0, 0, 0),
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
              css_classes: 'south-tour-heading'
            }
          })
        ]
      ),
      makeColumn(
        64.0,
        {
          sizeTablet: 100,
          sizeMobile: 100,
          content_position: 'center',
          background_background: 'classic',
          background_color: '#CBE8D8',
          border_radius: em(1.625, 1.625, 1.625, 1.625),
          padding: em(3.1875, 4.6875, 3.125, 4.6875),
          padding_tablet: em(1.75, 2.0, 1.75, 2.0),
          padding_mobile: em(1.15, 1.15, 1.15, 1.15),
          css_classes: 'south-tour-green-frame'
        },
        [
          makeSection(
            {
              layout: 'full_width',
              background_background: 'classic',
              background_color: '#FFFFFF',
              border_radius: em(1.25, 1.25, 1.25, 1.25),
              padding: em(9.78, 1.0, 9.78, 1.0),
              padding_tablet: em(7.5, 1.0, 7.5, 1.0),
              padding_mobile: em(5.25, 1.0, 5.25, 1.0),
              css_classes: 'south-tour-white-screen'
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
  // SECTION 10: FOOTER (Figma y=5813..6566, h=753px = 47.0625em)
  // Background: #252525
  // =========================================================================
  makeSection(
    {
      layout: 'full_width',
      background_background: 'classic',
      background_color: '#252525',
      padding: em(2.9375, 17.75, 7.5, 17.75),
      padding_tablet: em(2.5, 2.0, 2.5, 2.0),
      padding_mobile: em(2.25, 1.0, 2.25, 1.0),
      css_classes: 'south-footer-section'
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
              css_classes: 'south-footer-top-icons'
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
                      _margin: em(0, 0, 1.55, 0),
                      css_classes: 'south-footer-icon-phone'
                    }
                  }),
                  makeHeading('<a href="tel:+918050454680" style="color:#F7F7F7;text-decoration:none;">+91 80504 54680</a>', {
                    header_size: 'p',
                    align: 'center',
                    color: '#F7F7F7',
                    fontFamily: 'Inter',
                    fontSizeEm: 1.125,
                    fontSizeTabletEm: 1.0,
                    fontSizeMobileEm: 0.95,
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
                      _margin: em(0, 0, 1.85, 0),
                      css_classes: 'south-footer-icon-std'
                    }
                  }),
                  makeHeading('<a href="mailto:info.rvpun@rvei.edu.in" style="color:#F7F7F7;text-decoration:none;">info.rvpun@rvei.edu.in</a>', {
                    header_size: 'p',
                    align: 'center',
                    color: '#F7F7F7',
                    fontFamily: 'Inter',
                    fontSizeEm: 1.125,
                    fontSizeTabletEm: 1.0,
                    fontSizeMobileEm: 0.95,
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
                      _margin: em(0, 0, 1.85, 0),
                      css_classes: 'south-footer-icon-std'
                    }
                  }),
                  makeHeading('<a href="#map" style="color:#F7F7F7;text-decoration:none;">MAP</a>', {
                    header_size: 'p',
                    align: 'center',
                    color: '#F7F7F7',
                    fontFamily: 'Inter',
                    fontSizeEm: 1.125,
                    fontSizeTabletEm: 1.0,
                    fontSizeMobileEm: 0.95,
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
                      _margin: em(0, 0, 1.5, 0),
                      css_classes: 'south-footer-icon-privacy'
                    }
                  }),
                  makeHeading('<a href="#privacy" style="color:#F7F7F7;text-decoration:none;">PRIVACY POLICY</a>', {
                    header_size: 'p',
                    align: 'center',
                    color: '#F7F7F7',
                    fontFamily: 'Inter',
                    fontSizeEm: 1.125,
                    fontSizeTabletEm: 1.0,
                    fontSizeMobileEm: 0.95,
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
              css_classes: 'south-footer-main-cols'
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
                    color: '#F5F5F5',
                    fontFamily: 'Georgia',
                    fontSizeEm: 1.875,
                    fontSizeTabletEm: 1.65,
                    fontSizeMobileEm: 1.45,
                    fontWeight: '400',
                    lineHeight: 1.2,
                    extra: {
                      _margin: em(0, 0, 1.25, 0)
                    }
                  }),
                  makeText(
                    '<p style="margin:0 0 1.35em 0;"><a href="#" style="color:#FAFBFB;text-decoration:none;">About RV PU North</a></p> <p style="margin:0 0 1.35em 0;"><a href="#" style="color:#FAFBFB;text-decoration:none;">Course</a></p> <p style="margin:0;"><a href="#" style="color:#FAFBFB;text-decoration:none;">Terms &amp; Conditions</a></p>',
                    {
                      align: 'left',
                      color: '#FAFBFB',
                      fontFamily: 'Inter',
                      fontSizeEm: 1.125,
                      fontSizeTabletEm: 1.0,
                      fontSizeMobileEm: 0.95,
                      fontWeight: '400',
                      lineHeight: 1.4,
                      extra: {
                        css_classes: 'south-footer-links'
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
                    color: '#F5F5F5',
                    fontFamily: 'Georgia',
                    fontSizeEm: 1.875,
                    fontSizeTabletEm: 1.65,
                    fontSizeMobileEm: 1.45,
                    fontWeight: '400',
                    lineHeight: 1.2,
                    extra: {
                      _margin: em(0, 0, 1.35, 0)
                    }
                  }),
                  makeText(
                    '<p style="margin:0;">DPS Bengaluru North <br>Campus, Survey No. 35/1A, <br>Sathnur Village, Bagalur Post, <br>Off Bellary Road, Jalla Hobli, <br>Bengaluru - 562149, <br>Karnataka, India</p>',
                    {
                      align: 'left',
                      color: '#FAFBFB',
                      fontFamily: 'Inter',
                      fontSizeEm: 1.125,
                      fontSizeTabletEm: 1.0,
                      fontSizeMobileEm: 0.95,
                      fontWeight: '400',
                      lineHeight: 1.667
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
                  makeText(
                    '<form class="south-subscribe-form" onsubmit="event.preventDefault();"><input type="email" class="south-subscribe-input" placeholder="Enter Email Address" aria-label="Enter Email Address" /><span class="south-sr-only">Enter Email Address</span><button type="submit" class="south-subscribe-submit" aria-label="Subscribe">&#10095;</button></form>',
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
                  makeText(
                    '<div class="south-social-dots"><a href="#fb" class="south-social-circle" aria-label="Facebook"></a><a href="#ig" class="south-social-circle" aria-label="Instagram"></a><a href="#tw" class="south-social-circle" aria-label="X"></a><a href="#yt" class="south-social-circle" aria-label="YouTube"></a><a href="#in" class="south-social-circle" aria-label="LinkedIn"></a><a href="#wa" class="south-social-circle" aria-label="WhatsApp"></a></div>',
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
              css_classes: 'south-footer-bottom-row'
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
                      css_classes: 'south-footer-copyright-right'
                    }
                  })
                ],
                true
              )
            ],
            true
          ),
          // Scoped Responsive CSS + Carousels + Mobile Courses Accordion + Asset Fallback JS
          makeHtml(`<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
<style>
/* === GLOBAL RESET & PROPORTIONAL DESKTOP SCALING (1920px = 120em -> 1em = 16px) === */
html, body {
  margin: 0 !important;
  padding: 0 !important;
  overflow-x: hidden !important;
  max-width: 100% !important;
  background: #FFFFFF;
}
.south-sr-only {
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
body.elementor-editor-active .south-runtime-helper-widget {
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
.south-header-section > .elementor-container {
  display: flex !important;
  align-items: stretch !important;
}
.south-logo-img img {
  width: 16.0em !important;
  max-width: 100% !important;
  height: auto !important;
  display: block;
}
.south-header-menu-col {
  cursor: pointer;
}
.south-menu-bar .elementor-divider-separator {
  border-radius: 0.35em !important;
  width: 4.375em !important;
}

/* === SECTION 2: HERO VIDEO BANNER (1920x794px = 120em x 49.625em) === */
.south-play-btn-widget img {
  width: 9.875em !important;
  height: 9.875em !important;
  cursor: pointer;
  transition: transform 0.25s ease;
}
.south-play-btn-widget img:hover {
  transform: scale(1.06);
}

/* === PILL BUTTONS ("Know More") === */
.south-btn-pill .elementor-button {
  min-width: 12.25em;
  min-height: 4.0em;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0.75em 2.1em !important;
  border-radius: 2.4375em !important;
  border-width: 0.09375em !important;
  transition: all 0.25s ease !important;
  box-sizing: border-box !important;
}
.south-btn-with-arrow .elementor-button {
  min-width: 11.4375em;
  min-height: 3.75em;
  padding: 0.7em 1.75em !important;
}
.south-btn-with-arrow .elementor-button-text {
  display: inline-flex !important;
  align-items: center !important;
  gap: 0.85em;
}
.south-btn-with-arrow .elementor-button-text::after {
  content: '\\2192';
  font-family: Arial, sans-serif;
  font-size: 1.3em;
  font-weight: 700;
  line-height: 1;
}
.south-btn-dark .elementor-button:hover {
  background-color: #252525 !important;
  color: #FFFFFF !important;
  border-color: #252525 !important;
}
.south-btn-white .elementor-button:hover {
  background-color: #64C38A !important;
  color: #252525 !important;
  border-color: #64C38A !important;
}

/* === SECTION 3: WELCOME TO RV PU COLLEGE SOUTH === */
.south-welcome-collage-img img {
  width: 51.6875em !important;
  max-width: 100% !important;
  height: auto !important;
  display: block !important;
}
.south-welcome-body {
  max-width: 48.5625em;
}

/* === SECTION 4: ADMISSIONS OPEN 2026 -2027 === */
.south-adm-pill-box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25em;
  min-width: 17.65em;
  padding: 0.2em 0.65em;
  border: 0.04em solid #64C38A;
  border-radius: 0.425em;
  background: rgba(37, 37, 37, 0.72);
  box-sizing: border-box;
}
.south-adm-title-text {
  font-family: Georgia, serif;
  font-weight: 700;
  color: #FFFFFF;
}
.south-adm-year-text {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  color: #FFFFFF;
}
@media (min-width: 1025px) {
  .south-adm-enquiries-row > .elementor-container {
    justify-content: center !important;
    align-items: center !important;
    flex-wrap: nowrap !important;
    gap: 1.25em;
  }
  .south-adm-enquiries-row > .elementor-container > .elementor-column {
    width: auto !important;
    flex: 0 0 auto !important;
  }
}
.south-adm-contact-col > .elementor-widget-wrap,
.south-adm-contact-col > .elementor-column-wrap > .elementor-widget-wrap {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: center !important;
  flex-wrap: nowrap !important;
  gap: 0.65em;
}
.south-adm-icon-widget {
  width: auto !important;
  margin-bottom: 0 !important;
}
.south-adm-icon-widget img {
  width: 2.3125em !important;
  height: 2.3125em !important;
  object-fit: contain !important;
  display: block !important;
}
.south-adm-contact-text {
  width: auto !important;
  margin-bottom: 0 !important;
}

/* === SECTION 5A: OUR COURSES (DESKTOP - 100% NATIVE ELEMENTOR WIDGETS) === */
.south-courses-eagle-img img {
  width: 29.125em !important;
  max-width: 100% !important;
  height: auto !important;
  display: block !important;
}
.south-desktop-course-row {
  position: relative;
  width: 54.9375em !important;
  max-width: 100% !important;
  min-height: 8.4375em;
  padding-left: 2.3125em !important;
  box-sizing: border-box;
}
.south-desktop-course-row > .elementor-container {
  display: flex !important;
  align-items: center !important;
  position: relative !important;
}
.south-desktop-course-badge-col {
  position: absolute !important;
  left: -2.3125em !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  width: 5.0625em !important;
  height: 5.0625em !important;
  z-index: 3 !important;
}
.south-desktop-course-badge img {
  width: 5.0625em !important;
  height: 5.0625em !important;
  object-fit: contain !important;
  display: block !important;
}
.south-desktop-course-pill {
  width: 100% !important;
  flex: 1 1 100% !important;
  min-height: 8.4375em !important;
  background: #FFFFFF !important;
  border-radius: 1.625em !important;
  box-shadow: 0 0.25em 0.65em rgba(0, 0, 0, 0.08) !important;
}
.south-desktop-course-pill > .elementor-element-populated,
.south-desktop-course-pill > .elementor-widget-wrap,
.south-desktop-course-pill > .elementor-column-wrap > .elementor-widget-wrap {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  align-items: center !important;
  padding: 1.25em 1.75em 1.25em 4.25em !important;
  min-height: 8.4375em !important;
  box-sizing: border-box !important;
}
.south-desktop-course-code {
  width: 10.125em !important;
  flex-shrink: 0 !important;
  margin-bottom: 0 !important;
  padding-right: 1.25em !important;
  margin-right: 2.5em !important;
  border-right: 1px solid #707070 !important;
  min-height: 5.8125em !important;
  display: flex !important;
  align-items: center !important;
}
.south-desktop-course-subjects-widget {
  flex: 1 1 auto !important;
  width: auto !important;
  margin-bottom: 0 !important;
}
.south-course-subjects-grid {
  display: grid;
  grid-template-columns: 16.25em 17.5em;
  row-gap: 0.75em;
  column-gap: 0.5em;
  align-items: center;
  flex: 1;
}
.south-course-subj-item {
  display: inline-flex;
  align-items: center;
  gap: 0.65em;
  font-family: 'Inter', sans-serif;
  font-size: 1.5625em;
  font-weight: 400;
  color: #000000;
  line-height: 1.2;
  white-space: nowrap;
}
.south-tri {
  font-size: 0.65em;
  color: #000000;
  line-height: 1;
  flex-shrink: 0;
}

/* === COURSES DESKTOP vs MOBILE SWITCHING === */
@media (min-width: 1025px) {
  .south-courses-desktop-section {
    display: block !important;
  }
  .south-courses-mobile-section {
    display: none !important;
  }
}
@media (max-width: 1024px) {
  .south-courses-desktop-section {
    display: none !important;
  }
  .south-courses-mobile-section {
    display: block !important;
  }
}

/* === SECTION 5B: DEDICATED MOBILE COURSES SECTION (Figma 22:2) === */
.south-courses-mobile-col > .elementor-widget-wrap,
.south-courses-mobile-col > .elementor-column-wrap > .elementor-widget-wrap {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
}
.south-mob-courses-eagle {
  width: 100% !important;
  text-align: center !important;
}
.south-mob-courses-eagle img {
  width: 126px !important;
  max-width: 126px !important;
  height: auto !important;
  display: block !important;
  margin: 0 auto !important;
}
.south-mob-courses-accordion-widget {
  width: 100% !important;
  max-width: 315px !important;
  margin-left: auto !important;
  margin-right: auto !important;
}
.south-mob-courses-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}
.south-mob-card {
  width: 100%;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  overflow: hidden;
  transition: all 0.25s ease;
  box-sizing: border-box;
}
.south-mob-card-compact {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 16px;
}
.south-mob-compact-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #141414;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.south-mob-compact-circle img {
  width: 20px !important;
  height: 20px !important;
  object-fit: contain !important;
}
.south-mob-compact-code {
  font-family: Georgia, serif;
  font-size: 13px;
  font-weight: 700;
  color: #000000;
  min-width: 44px;
  text-align: left;
}
.south-mob-card-expanded {
  display: none;
  padding: 18px 18px 20px 18px;
}
.south-mob-card.is-expanded {
  border-radius: 15px;
}
.south-mob-card.is-expanded .south-mob-card-compact {
  display: none;
}
.south-mob-card.is-expanded .south-mob-card-expanded {
  display: block;
}
.south-mob-exp-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 14px;
}
.south-mob-exp-line {
  flex: 1;
  max-width: 94px;
  height: 1px;
  background: #000000;
}
.south-mob-exp-circle {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: #141414;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  flex-shrink: 0;
}
.south-mob-exp-circle img {
  width: 22px !important;
  height: 22px !important;
  object-fit: contain !important;
}
.south-mob-exp-circle-code {
  font-family: Georgia, serif;
  font-size: 12px;
  font-weight: 400;
  color: #FFFFFF;
  line-height: 1;
}
.south-mob-exp-subjects {
  display: grid;
  grid-template-columns: 1fr 1.15fr;
  row-gap: 8px;
  column-gap: 10px;
  align-items: center;
  padding: 0 4px;
}
.south-mob-exp-subj {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 13.5px;
  font-weight: 400;
  color: #000000;
  line-height: 1.25;
  white-space: nowrap;
}
.south-mob-tri {
  font-size: 9px;
  color: #000000;
  line-height: 1;
}
.south-mob-courses-btn .elementor-button {
  min-width: 111px !important;
  min-height: 36px !important;
  padding: 6px 16px !important;
  border-radius: 20px !important;
  border: 1px solid #000000 !important;
  color: #000000 !important;
}
.south-mob-courses-btn .elementor-button-text {
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px;
}
.south-mob-courses-btn .elementor-button-text::after {
  content: '\\203A';
  font-size: 16px;
  line-height: 1;
  font-weight: 700;
}

/* === SECTION 6: RESULTS (COMPACT & BALANCED 3-CARD CAROUSEL) === */
.south-results-slider-row {
  max-width: 68.0em !important;
  margin-left: auto !important;
  margin-right: auto !important;
}
.south-results-slider-row > .elementor-container,
.south-events-slider-row > .elementor-container,
.south-tour-section > .elementor-container {
  display: flex !important;
  align-items: center !important;
}
.south-results-carousel-col {
  min-width: 0 !important;
}
.south-slider-arrow-col,
.south-slider-arrow-col > .elementor-widget-wrap,
.south-slider-arrow-col > .elementor-column-wrap,
.south-slider-arrow-col > .elementor-column-wrap > .elementor-widget-wrap {
  display: flex !important;
  align-items: center !important;
}
.south-arrow-btn img {
  width: 4.35em !important;
  height: 4.125em !important;
  max-width: none !important;
  cursor: pointer;
  transition: transform 0.2s ease;
  display: block !important;
}
.south-arrow-btn img:hover {
  transform: scale(1.07);
}
.south-results-carousel .swiper,
.south-results-carousel .swiper-wrapper,
.south-results-carousel .swiper-slide {
  opacity: 1 !important;
  visibility: visible !important;
}
.south-results-carousel .swiper-slide img {
  width: 100% !important;
  max-width: 18.25em !important;
  height: auto !important;
  margin: 0 auto !important;
  display: block !important;
}
.south-results-btn .elementor-button {
  min-width: 10.75em;
  min-height: 3.35em;
  padding: 0.65em 1.75em !important;
}

/* === SECTION 7: EXPAND YOUR POTENTIAL === */
.south-expand-section > .elementor-container {
  display: flex !important;
  align-items: flex-start !important;
}
.south-expand-green-card {
  min-height: 20.3125em;
  box-sizing: border-box;
}
.south-expand-classroom-img img {
  width: 53.5em !important;
  max-width: 100% !important;
  height: 35.625em !important;
  object-fit: cover !important;
  display: block !important;
}

/* === SECTION 8: EVENTS (7-PANEL INTERACTIVE PERSPECTIVE CAROUSEL) === */
.south-events-subtitle {
  max-width: 95.125em !important;
  margin-left: auto !important;
  margin-right: auto !important;
}
.south-events-carousel-wrap {
  width: 100%;
  position: relative;
}
.south-events-perspective-stage {
  position: relative;
  width: 100%;
  height: 23.25em;
  overflow: hidden;
  user-select: none;
}
.south-evt-item {
  position: absolute;
  left: 50%;
  top: 50%;
  transition: transform 520ms cubic-bezier(0.22, 1, 0.36, 1), width 520ms cubic-bezier(0.22, 1, 0.36, 1), opacity 380ms ease, filter 380ms ease;
  cursor: pointer;
  will-change: transform, width, opacity;
}
.south-evt-item.no-transition {
  transition: none !important;
}
.south-evt-item img {
  display: block !important;
  width: 100% !important;
  height: auto !important;
  pointer-events: none;
}
/* 7 Perspective Slots on Desktop (> 1024px) */
.south-evt-item[data-slot="0"] {
  width: 9.0em;
  z-index: 1;
  opacity: 0.92;
  transform: translate3d(calc(-50% - 39.375em), -50%, 0);
}
.south-evt-item[data-slot="1"] {
  width: 11.25em;
  z-index: 2;
  opacity: 0.96;
  transform: translate3d(calc(-50% - 28.125em), -50%, 0);
}
.south-evt-item[data-slot="2"] {
  width: 11.25em;
  z-index: 3;
  opacity: 0.98;
  transform: translate3d(calc(-50% - 15.75em), -50%, 0);
}
.south-evt-item[data-slot="3"] {
  width: 18.0em;
  z-index: 5;
  opacity: 1;
  transform: translate3d(-50%, -50%, 0);
  filter: drop-shadow(0 0.55em 1.25em rgba(0, 0, 0, 0.16));
}
.south-evt-item[data-slot="4"] {
  width: 11.25em;
  z-index: 3;
  opacity: 0.98;
  transform: translate3d(calc(-50% + 15.75em), -50%, 0);
}
.south-evt-item[data-slot="5"] {
  width: 11.25em;
  z-index: 2;
  opacity: 0.96;
  transform: translate3d(calc(-50% + 28.125em), -50%, 0);
}
.south-evt-item[data-slot="6"] {
  width: 9.0em;
  z-index: 1;
  opacity: 0.92;
  transform: translate3d(calc(-50% + 39.375em), -50%, 0);
}
.south-events-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45em;
  margin-top: 0.85em;
}
.south-evt-dot {
  width: 0.55em;
  height: 0.55em;
  border-radius: 0.5em;
  border: none;
  padding: 0;
  background: rgba(37, 37, 37, 0.32);
  cursor: pointer;
  transition: all 0.28s ease;
}
.south-evt-dot.is-active {
  width: 1.65em;
  background: #252525;
}

/* === SECTION 10: FOOTER === */
.south-footer-icon-phone img {
  width: 5.3125em !important;
  height: 5.3125em !important;
  object-fit: contain !important;
}
.south-footer-icon-std img {
  width: 4.375em !important;
  height: 4.375em !important;
  object-fit: contain !important;
}
.south-footer-icon-privacy img {
  width: 5.125em !important;
  height: 5.125em !important;
  object-fit: contain !important;
}
.south-subscribe-form {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 24.25em;
  max-width: 100%;
  height: 3.5em;
  background: #6F6F6F;
  border-radius: 1.875em;
  padding: 0 1.35em;
  box-sizing: border-box;
}
.south-subscribe-input {
  background: transparent !important;
  border: none !important;
  outline: none !important;
  color: #FFFFFF !important;
  font-family: 'Inter', sans-serif !important;
  font-size: 1.25em !important;
  width: 100% !important;
  padding: 0 !important;
}
.south-subscribe-input::placeholder {
  color: #FFFFFF !important;
  opacity: 1 !important;
}
.south-subscribe-submit {
  background: transparent !important;
  border: none !important;
  color: #FFFFFF !important;
  font-size: 1.15em !important;
  cursor: pointer;
  padding: 0 0 0 0.5em !important;
  line-height: 1 !important;
}
.south-social-dots {
  display: flex;
  align-items: center;
  gap: 0.4375em;
  flex-wrap: nowrap;
}
.south-social-circle {
  width: 3.125em;
  height: 3.125em;
  border-radius: 50%;
  background: #FFFFFF;
  display: inline-block;
  flex-shrink: 0;
  transition: transform 0.2s ease, background-color 0.2s ease;
}
.south-social-circle:hover {
  transform: translateY(-0.2em);
  background: #76C397;
}
@media (min-width: 1025px) {
  .south-footer-copyright-right .elementor-heading-title {
    white-space: nowrap;
  }
}

/* === CROSS-SITE BACKGROUND FALLBACKS === */
.south-welcome-section {
  background-image: url("${WP_UPLOAD_BASE}south_welcome_bg.png") !important;
  background-position: top center !important;
  background-repeat: no-repeat !important;
  background-size: cover !important;
}
.south-admissions-section {
  background-image: url("${WP_UPLOAD_BASE}south_admissions_bg.png") !important;
  background-position: center center !important;
  background-repeat: no-repeat !important;
  background-size: cover !important;
}
.south-courses-desktop-section {
  background-image: url("${WP_UPLOAD_BASE}south_courses_bg.png") !important;
  background-position: top center !important;
  background-repeat: no-repeat !important;
  background-size: cover !important;
}
.south-courses-mobile-section {
  background-image: url("${WP_UPLOAD_BASE}south_courses_mobile_bg.png") !important;
  background-position: top center !important;
  background-repeat: no-repeat !important;
  background-size: cover !important;
}
.south-results-section {
  background-image: url("${WP_UPLOAD_BASE}south_results_bg.png") !important;
  background-position: center center !important;
  background-repeat: no-repeat !important;
  background-size: cover !important;
}
.south-expand-section {
  background-image: url("${WP_UPLOAD_BASE}south_expand_bg.png") !important;
  background-position: center center !important;
  background-repeat: no-repeat !important;
  background-size: cover !important;
}
.south-expand-green-card {
  background-image: url("${WP_UPLOAD_BASE}south_expand_card_bg.png") !important;
  background-position: center center !important;
  background-repeat: no-repeat !important;
  background-size: cover !important;
}
.south-events-section {
  background-image: url("${WP_UPLOAD_BASE}south_events_bg.png") !important;
  background-position: center center !important;
  background-repeat: no-repeat !important;
  background-size: cover !important;
}
.south-tour-section {
  background-image: url("${WP_UPLOAD_BASE}south_tour_bg.png") !important;
  background-position: center center !important;
  background-repeat: no-repeat !important;
  background-size: cover !important;
}

/* === TABLET & MOBILE RESPONSIVE BREAKPOINTS === */
@media (max-width: 1024px) {
  .south-logo-img img {
    width: 13.0em !important;
  }
  .south-menu-bar .elementor-divider-separator {
    width: 3.1em !important;
  }
  .south-play-btn-widget img {
    width: 7.25em !important;
    height: 7.25em !important;
  }
  .south-welcome-section > .elementor-container,
  .south-expand-section > .elementor-container,
  .south-tour-section > .elementor-container {
    flex-wrap: wrap !important;
  }
  .south-welcome-collage-img img {
    margin: 0 auto !important;
    max-width: 440px !important;
  }
  .south-mob-courses-accordion-widget {
    max-width: 420px !important;
  }
  .south-results-slider-row {
    max-width: 42.0em !important;
  }
  .south-results-carousel .swiper-slide img {
    max-width: 14.25em !important;
  }
  .south-arrow-btn img {
    width: 3.25em !important;
    height: 3.1em !important;
  }
  .south-expand-green-card {
    border-radius: 1.0em !important;
    min-height: 0 !important;
  }
  .south-expand-classroom-img img {
    height: auto !important;
    width: 100% !important;
    border-radius: 1.0em;
  }
  /* Tablet Events Carousel: 3 visible perspective slots */
  .south-events-perspective-stage {
    height: 17.5em;
  }
  .south-evt-item[data-slot="3"] {
    width: 12.25em;
    z-index: 5;
    opacity: 1;
    transform: translate3d(-50%, -50%, 0);
  }
  .south-evt-item[data-slot="2"] {
    width: 8.25em;
    z-index: 3;
    opacity: 0.92;
    transform: translate3d(calc(-50% - 10.75em), -50%, 0);
  }
  .south-evt-item[data-slot="4"] {
    width: 8.25em;
    z-index: 3;
    opacity: 0.92;
    transform: translate3d(calc(-50% + 10.75em), -50%, 0);
  }
  .south-evt-item[data-slot="0"],
  .south-evt-item[data-slot="1"] {
    width: 6.5em;
    z-index: 1;
    opacity: 0;
    pointer-events: none;
    transform: translate3d(calc(-50% - 18.0em), -50%, 0);
  }
  .south-evt-item[data-slot="5"],
  .south-evt-item[data-slot="6"] {
    width: 6.5em;
    z-index: 1;
    opacity: 0;
    pointer-events: none;
    transform: translate3d(calc(-50% + 18.0em), -50%, 0);
  }
  .south-social-dots {
    flex-wrap: wrap;
  }
}

@media (max-width: 767px) {
  .elementor-section {
    max-width: 100vw !important;
    overflow-x: hidden !important;
  }
  .south-logo-img img {
    width: 10.75em !important;
  }
  .south-menu-bar .elementor-divider-separator {
    width: 2.35em !important;
  }
  .south-play-btn-widget img {
    width: 5.5em !important;
    height: 5.5em !important;
  }
  .south-adm-pill-box {
    min-width: 0 !important;
    width: 100%;
    padding: 0.45em 0.75em;
    flex-wrap: wrap;
  }
  .south-mob-courses-accordion-widget {
    max-width: 315px !important;
  }
  .south-results-slider-row {
    max-width: 22.0em !important;
  }
  .south-results-carousel .swiper-slide img {
    max-width: 13.0em !important;
  }
  .south-arrow-btn img {
    width: 2.45em !important;
    height: 2.35em !important;
  }
  /* Mobile Events Carousel: center card + peeking side cards */
  .south-events-perspective-stage {
    height: 14.5em;
  }
  .south-evt-item[data-slot="3"] {
    width: 9.75em;
    z-index: 5;
    opacity: 1;
    transform: translate3d(-50%, -50%, 0);
  }
  .south-evt-item[data-slot="2"] {
    width: 5.75em;
    z-index: 3;
    opacity: 0.76;
    transform: translate3d(calc(-50% - 5.95em), -50%, 0);
  }
  .south-evt-item[data-slot="4"] {
    width: 5.75em;
    z-index: 3;
    opacity: 0.76;
    transform: translate3d(calc(-50% + 5.95em), -50%, 0);
  }
  .south-evt-item[data-slot="0"],
  .south-evt-item[data-slot="1"] {
    width: 4.5em;
    z-index: 1;
    opacity: 0;
    pointer-events: none;
    transform: translate3d(calc(-50% - 10.5em), -50%, 0);
  }
  .south-evt-item[data-slot="5"],
  .south-evt-item[data-slot="6"] {
    width: 4.5em;
    z-index: 1;
    opacity: 0;
    pointer-events: none;
    transform: translate3d(calc(-50% + 10.5em), -50%, 0);
  }
  .south-subscribe-form {
    width: 100%;
  }
  .south-footer-icon-phone img,
  .south-footer-icon-std img,
  .south-footer-icon-privacy img {
    width: 3.5em !important;
    height: 3.5em !important;
  }
}
</style>
<script>
(function() {
  const CDN = '${WP_UPLOAD_BASE}';
  const ASSET_MAP = {
    'south-asset-south_logo': 'south_logo.png',
    'south-asset-south_hero_play': 'south_hero_play.png',
    'south-asset-south_welcome_bg': 'south_welcome_bg.png',
    'south-asset-south_welcome_collage': 'south_welcome_collage.png',
    'south-asset-south_admissions_bg': 'south_admissions_bg.png',
    'south-asset-south_icon_phone_green': 'south_icon_phone_green.png',
    'south-asset-south_icon_email_green': 'south_icon_email_green.png',
    'south-asset-south_courses_bg': 'south_courses_bg.png',
    'south-asset-south_courses_mobile_bg': 'south_courses_mobile_bg.png',
    'south-asset-south_courses_eagle': 'south_courses_eagle.png',
    'south-asset-south_icon_pcmc': 'south_icon_pcmc.png',
    'south-asset-south_icon_pcmb': 'south_icon_pcmb.png',
    'south-asset-south_icon_bame': 'south_icon_bame.png',
    'south-asset-south_icon_bams': 'south_icon_bams.png',
    'south-asset-south_icon_sabe': 'south_icon_sabe.png',
    'south-asset-south_white_icon_pcmb': 'south_white_icon_pcmb.png',
    'south-asset-south_white_icon_pcmc': 'south_white_icon_pcmc.png',
    'south-asset-south_white_icon_sabe': 'south_white_icon_sabe.png',
    'south-asset-south_white_icon_bams': 'south_white_icon_bams.png',
    'south-asset-south_white_icon_bame': 'south_white_icon_bame.png',
    'south-asset-south_results_bg': 'south_results_bg.png',
    'south-asset-south_topper_card_full': 'south_topper_card_full.png',
    'south-asset-south_topper_photo': 'south_topper_photo.png',
    'south-asset-south_arrow_left': 'south_arrow_left.png',
    'south-asset-south_arrow_right': 'south_arrow_right.png',
    'south-asset-south_expand_bg': 'south_expand_bg.png',
    'south-asset-south_expand_card_bg': 'south_expand_card_bg.png',
    'south-asset-south_expand_classroom': 'south_expand_classroom.png',
    'south-asset-south_events_bg': 'south_events_bg.png',
    'south-asset-south_event_panel_1': 'south_event_panel_1.png',
    'south-asset-south_event_panel_2': 'south_event_panel_2.png',
    'south-asset-south_event_panel_3': 'south_event_panel_3.png',
    'south-asset-south_event_panel_4': 'south_event_panel_4.png',
    'south-asset-south_event_panel_5': 'south_event_panel_5.png',
    'south-asset-south_event_panel_6': 'south_event_panel_6.png',
    'south-asset-south_event_panel_7': 'south_event_panel_7.png',
    'south-asset-south_tour_bg': 'south_tour_bg.png',
    'south-asset-south_footer_phone': 'south_footer_phone.png',
    'south-asset-south_footer_email': 'south_footer_email.png',
    'south-asset-south_footer_map': 'south_footer_map.png',
    'south-asset-south_footer_privacy': 'south_footer_privacy.png'
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
    document.querySelectorAll('.elementor img').forEach(function(img) {
      if (img.getAttribute('loading') === 'lazy') {
        img.setAttribute('loading', 'eager');
      }
      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
    });
    Object.keys(ASSET_MAP).forEach(function(cls) {
      const targetUrl = CDN + ASSET_MAP[cls];
      const imgs = document.querySelectorAll('.' + cls + ' img');
      imgs.forEach(function(img) {
        if (needsRestore(img)) {
          setImgUrl(img, targetUrl);
        }
        if (!img.dataset.southErrBound) {
          img.dataset.southErrBound = '1';
          img.addEventListener('error', function() {
            setImgUrl(img, targetUrl);
          });
        }
      });
    });

    const topperUrl = CDN + 'south_topper_card_full.png';
    document.querySelectorAll('.south-results-carousel .swiper-slide img').forEach(function(img) {
      if (needsRestore(img)) {
        setImgUrl(img, topperUrl);
      }
    });
  }

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

  function setupMobileCoursesAccordion() {
    const cards = Array.from(document.querySelectorAll('.south-mob-card'));
    cards.forEach(function(card) {
      if (card.dataset.southBound === '1') return;
      card.dataset.southBound = '1';
      card.addEventListener('click', function() {
        cards.forEach(function(c) { c.classList.remove('is-expanded'); });
        card.classList.add('is-expanded');
      });
    });
  }

  function setupResultsCarousel(carouselSelector, prevSelector, nextSelector, desktopCount, gapDesktop, fallbackUrls) {
    if (isElementorEditMode()) return;
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
    if (wrapper.dataset.southInit === '1') {
      if (typeof wrapper._southRefresh === 'function') wrapper._southRefresh();
      return;
    }

    const rawSlides = Array.from(wrapper.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)'));
    if (rawSlides.length < 2) return;
    wrapper.dataset.southInit = '1';

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
      const cWidth = container.clientWidth || 920;
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
    wrapper._southRefresh = function() { applyClasses(false); };

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

  function setupEventsCarousel() {
    const stage = document.querySelector('.south-events-perspective-stage');
    if (!stage || stage.dataset.southEvtInit === '1') return;
    const items = Array.from(stage.querySelectorAll('.south-evt-item'));
    if (items.length !== 7) return;
    stage.dataset.southEvtInit = '1';

    const PANEL_URLS = [
      CDN + 'south_event_panel_1.png',
      CDN + 'south_event_panel_2.png',
      CDN + 'south_event_panel_3.png',
      CDN + 'south_event_panel_4.png',
      CDN + 'south_event_panel_5.png',
      CDN + 'south_event_panel_6.png',
      CDN + 'south_event_panel_7.png'
    ];

    const dots = Array.from(document.querySelectorAll('.south-evt-dot'));
    let activeStep = 3; // 0..6

    function updateDots() {
      stage.setAttribute('data-active-event', String(activeStep));
      dots.forEach(function(d, idx) {
        if (idx === activeStep) d.classList.add('is-active');
        else d.classList.remove('is-active');
      });
    }

    function stepCarousel(direction) {
      // direction = +1 (next: cards move left, slot s -> s-1) or -1 (prev: cards move right, slot s -> s+1)
      activeStep = (activeStep + direction + 7) % 7;
      items.forEach(function(item) {
        const curSlot = parseInt(item.getAttribute('data-slot') || '0', 10);
        const nextSlot = (curSlot - direction + 7) % 7;
        const isWrapping = (direction === 1 && curSlot === 0) || (direction === -1 && curSlot === 6);
        if (isWrapping) {
          item.classList.add('no-transition');
        } else {
          item.classList.remove('no-transition');
        }
        item.setAttribute('data-slot', String(nextSlot));
        for (let i = 1; i <= 7; i++) {
          item.classList.remove('south-evt-p' + i);
        }
        item.classList.add('south-evt-p' + (nextSlot + 1));
        if (nextSlot === 3) item.classList.add('is-center');
        else item.classList.remove('is-center');

        const img = item.querySelector('img');
        if (img) {
          setImgUrl(img, PANEL_URLS[nextSlot]);
        }
        if (isWrapping) {
          void item.offsetWidth;
          requestAnimationFrame(function() {
            item.classList.remove('no-transition');
          });
        }
      });
      updateDots();
    }

    const prevBtn = document.querySelector('.south-events-prev');
    const nextBtn = document.querySelector('.south-events-next');
    if (prevBtn) {
      prevBtn.addEventListener('click', function(e) {
        e.preventDefault();
        stepCarousel(-1);
        resetEvtTimer();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        stepCarousel(1);
        resetEvtTimer();
      });
    }

    items.forEach(function(item) {
      item.addEventListener('click', function() {
        const slot = parseInt(item.getAttribute('data-slot') || '3', 10);
        if (slot < 3) {
          stepCarousel(-1);
          resetEvtTimer();
        } else if (slot > 3) {
          stepCarousel(1);
          resetEvtTimer();
        }
      });
    });

    dots.forEach(function(dot, idx) {
      dot.addEventListener('click', function() {
        const diff = (idx - activeStep + 7) % 7;
        if (diff === 0) return;
        if (diff <= 3) {
          for (let k = 0; k < diff; k++) stepCarousel(1);
        } else {
          for (let k = 0; k < 7 - diff; k++) stepCarousel(-1);
        }
        resetEvtTimer();
      });
    });

    // Touch swipe support for Mobile & Tablet
    let touchStartX = 0;
    stage.addEventListener('touchstart', function(e) {
      if (e.touches && e.touches.length) {
        touchStartX = e.touches[0].clientX;
      }
    }, { passive: true });
    stage.addEventListener('touchend', function(e) {
      if (e.changedTouches && e.changedTouches.length) {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 30) {
          stepCarousel(dx < 0 ? 1 : -1);
          resetEvtTimer();
        }
      }
    }, { passive: true });

    let evtTimer = setInterval(function() { stepCarousel(1); }, 2800);
    function resetEvtTimer() {
      clearInterval(evtTimer);
      evtTimer = setInterval(function() { stepCarousel(1); }, 2800);
    }
    stage.addEventListener('mouseenter', function() { clearInterval(evtTimer); });
    stage.addEventListener('mouseleave', function() { resetEvtTimer(); });

    // Expose step helper for testing/inspection
    window.__southEventsStep = stepCarousel;
  }

  function initAll() {
    restorePlaceholderImages();
    setupMobileCoursesAccordion();
    const resultsFallback = [
      CDN + 'south_topper_card_full.png',
      CDN + 'south_topper_card_full.png',
      CDN + 'south_topper_card_full.png',
      CDN + 'south_topper_card_full.png',
      CDN + 'south_topper_card_full.png',
      CDN + 'south_topper_card_full.png'
    ];
    setupResultsCarousel('.south-results-carousel', '.south-results-prev', '.south-results-next', 3, 16, resultsFallback);
    setupEventsCarousel();
    restorePlaceholderImages();
  }

  initAll();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initAll();
      setTimeout(initAll, 250);
      setTimeout(initAll, 700);
      setTimeout(initAll, 1500);
    });
  } else {
    setTimeout(initAll, 250);
    setTimeout(initAll, 700);
    setTimeout(initAll, 1500);
  }
  window.addEventListener('load', function() {
    initAll();
    setTimeout(initAll, 450);
    setTimeout(initAll, 1200);
  });
})();
</script>`, { extra: { css_classes: 'south-runtime-helper-widget' } })
        ]
      )
    ]
  )
];

// Save standalone Elementor template JSON
const templateExport = {
  version: '0.4',
  title: 'RVPU South - Homepage 11 (Native Elementor, EM Responsive)',
  type: 'page',
  content: elementorData
};

const artifactJsonPath = 'C:/Users/HP/.gemini/antigravity/brain/c5c230c2-90b4-4fe7-b358-32b81fcbace0/rvpu-south-homepage11-elementor-template.json';
fs.writeFileSync(artifactJsonPath, JSON.stringify(templateExport, null, 2));
console.log('Saved Elementor template JSON to:', artifactJsonPath);

const workspaceJsonPath = 'd:/hemanth bv/test/rvpu_south_elementor_template.json';
fs.writeFileSync(workspaceJsonPath, JSON.stringify(templateExport, null, 2));
console.log('Saved Workspace Elementor template JSON to:', workspaceJsonPath);

const pageIdFile = `${dir}/page_id.json`;
let existingPageId = undefined;
if (fs.existsSync(pageIdFile)) {
  existingPageId = JSON.parse(fs.readFileSync(pageIdFile, 'utf8')).pageId;
}

const saveArgs = {
  title: 'RVPU South — Homepage 11',
  status: 'publish',
  template: 'elementor_canvas',
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
  execSync('powershell -ExecutionPolicy Bypass -File "C:\\Users\\HP\\.gemini\\antigravity\\brain\\c5c230c2-90b4-4fe7-b358-32b81fcbace0\\scratch\\rvpu_south\\update_south_zip.ps1"', { stdio: 'inherit' });
  console.log('Elementor Package ZIP successfully updated.');
} catch (e) {
  console.error('Failed to update ZIP:', e.message);
}
