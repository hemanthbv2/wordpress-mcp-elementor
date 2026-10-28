# WordPress MCP Elementor Toolkit

> Complete Model Context Protocol (MCP) server, WordPress bridge plugin, automated Figma-to-Elementor builders, and 100% native editable Elementor templates.

---

## Overview

This repository provides an end-to-end toolchain for converting Figma UI/UX designs into pixel-accurate, responsive, 100% visually editable WordPress Elementor pages through automated MCP tools.

### What's Included

1. **Antigravity Elementor MCP Bridge Plugin (`plugin/`)**
   - High-performance WordPress plugin (`antigravity-elementor-bridge.php`)
   - Extends the WordPress REST API to support direct `_elementor_data` reading and writing
   - Supports WordPress Application Passwords, authentication headers, and automatic Elementor CSS regeneration (`\Elementor\Plugin::$instance->files_manager->clear_cache()`).
2. **Node.js MCP Server (`mcp-server/`)**
   - Implements MCP tools: `wp_get_elementor_page`, `wp_save_elementor_page`, `wp_upload_media`, `wp_list_pages`, `figma_inspect_design`, and `figma_export_assets`.
3. **Pure Native Elementor JSON Templates (`templates / root`)**
   - **RVPU North (`rvpu_north_elementor_template.json`)**: 100% pure native Elementor widgets (0 HTML widgets, 0 scripts).
   - **RVPU South (`rvpu_south_elementor_template.json`)**: Native Elementor desktop/tablet sections, native image carousel, responsive hanging cards.
   - **RVPU Mysuru (`rvpu_mysuru_elementor_template.json`)**: Native 5-course layout around eagle mascot, alternating staggered results carousel.
   - **RVPU E-City (`rvpu_ecity_elementor_template.json`)**: Full-width campus landing page with toppers and events.
   - **RVPS Complete Package**: 7-page school website templates.
4. **Complete Elementor ZIP Packages**
   - Full import-ready packages containing the Elementor JSON layout and all associated high-resolution design assets.
5. **Automation & Verification Scripts (`scripts/`)**
   - Automated Figma-to-Elementor builder scripts for North, South, and Mysuru.
   - Headless Playwright capture scripts verifying 0 broken images, 0 missing texts, 0px horizontal overflow, and Elementor editor compatibility across Desktop, Tablet, and Mobile.

---

## 100% Visual Elementor Editor Compatibility

All templates are engineered to load and edit cleanly inside WordPress Elementor without spinner freezes or locked overlay handles:

- **0 Inline Scripts**: No `<script>` tags inside HTML widgets that could disrupt Elementor's iframe handshake or Marionette view rendering.
- **Native Elementor Widgets**: Every visual component (headings, text blocks, buttons, images, dividers, spacers, and image carousels) uses standard Elementor widget types (`heading`, `text-editor`, `button`, `image`, `image-carousel`, `social-icons`).
- **Real WordPress Media Library Attachments**: Carousel slides use genuine WordPress media IDs (`wp_posts` attachments), ensuring native Swiper rendering.
- **Native Custom CSS**: Proportional desktop `calc(100vw / 120)` scaling and responsive breakpoint styles are stored in Elementor's native `pageSettings.custom_css`.

---

## Templates & Packages Reference

| Campus | Live URL | Elementor Template JSON | Complete ZIP Package |
| :--- | :--- | :--- | :--- |
| **RVPU North** | `/?page_id=433` | `rvpu_north_elementor_template.json` | `rvpu-north-homepage-new-elementor-package.zip` |
| **RVPU South** | `/?page_id=380` | `rvpu_south_elementor_template.json` | `rvpu-south-homepage11-elementor-package.zip` |
| **RVPU Mysuru** | `/?page_id=280` | `rvpu_mysuru_elementor_template.json` | `rvpu-mysuru-homepage2-elementor-package.zip` |
| **RVPU E-City** | `/?page_id=268` | `rvpu_ecity_elementor_template.json` | `rvpu-ecity-homepage3-elementor-package.zip` |

---

## Setup & Usage

### 1. Install the WordPress Bridge Plugin
1. Copy `plugin/antigravity-elementor-bridge.php` to your WordPress site's `wp-content/plugins/antigravity-elementor-bridge/` folder (or upload `antigravity-elementor-bridge.zip` via **Plugins → Add New → Upload Plugin**).
2. Activate the plugin in your WordPress admin dashboard.

### 2. Configure the MCP Server
1. Copy `mcp-server/credentials.example.json` to `mcp-server/credentials.json`:
   ```json
   {
     "wpUrl": "https://your-wordpress-site.com",
     "wpUser": "your_wp_username",
     "wpAppPassword": "xxxx xxxx xxxx xxxx",
     "figmaToken": "figd_your_personal_access_token"
   }
   ```
2. Start the MCP server:
   ```bash
   node mcp-server/server.mjs
   ```

### 3. Importing Templates via WordPress Admin
1. In WordPress Admin, navigate to **Templates → Saved Templates**.
2. Click **Import Templates** at the top.
3. Select any of the `.json` template files (e.g., `rvpu_north_elementor_template.json`).
4. Create a new page, set the Page Template to **Elementor Canvas**, click **Edit with Elementor**, click the folder icon, and insert the imported template.

---

## License

Proprietary / RV Educational Institutions.
