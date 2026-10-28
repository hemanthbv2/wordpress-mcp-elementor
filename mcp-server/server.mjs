#!/usr/bin/env node
/**
 * Antigravity WordPress + Elementor + Figma MCP Server
 * Supports:
 * 1. WordPress REST API + Elementor (_elementor_data CRUD & Media Uploads)
 * 2. Easy MCP AI (Themeisle) Streamable HTTP Bridge
 * 3. Figma REST API (Frame inspection, design tokens, & image asset export)
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

// Allow self-signed or incomplete SSL chains on staging/test WordPress servers
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

function loadCredentials() {
  try {
    if (fs.existsSync(CREDENTIALS_PATH)) {
      return JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    }
  } catch (err) {
    // Ignore parse errors and fallback to env
  }
  return {
    wpUrl: process.env.WP_URL || '',
    wpUser: process.env.WP_APP_USER || '',
    wpAppPassword: process.env.WP_APP_PASSWORD || '',
    easyMcpUrl: process.env.EASY_MCP_URL || '',
    easyMcpToken: process.env.EASY_MCP_TOKEN || '',
    figmaToken: process.env.FIGMA_API_KEY || ''
  };
}

function saveCredentials(newCreds) {
  const current = loadCredentials();
  const merged = { ...current, ...newCreds };
  if (merged.wpUrl) {
    merged.wpUrl = merged.wpUrl.replace(/\/+$/, '');
  }
  fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(merged, null, 2), 'utf8');
  return merged;
}

function getWpAuthHeader(creds) {
  if (!creds.wpUrl || !creds.wpUser || !creds.wpAppPassword) {
    throw new Error(
      'WordPress credentials not configured yet. Call wp_configure_credentials first with wpUrl, wpUser, and wpAppPassword.'
    );
  }
  const token = Buffer.from(`${creds.wpUser}:${creds.wpAppPassword}`).toString('base64');
  return `Basic ${token}`;
}

function toRestRouteUrl(baseUrl, endpoint, base64Token = '') {
  // Use http:// for rvcollegeofengineering.in so requests route cleanly through forward.http.proxy:3128
  const normalizedBase = baseUrl.replace(/^https:\/\/(rvcollegeofengineering\.in)/i, 'http://$1').replace(/\/+$/, '');
  const authParam = base64Token ? `&ag_auth=${encodeURIComponent(base64Token)}` : '';
  if (endpoint.startsWith('/wp-json/')) {
    const withoutPrefix = endpoint.slice('/wp-json'.length); // e.g. /wp/v2/pages?per_page=20
    const [routePath, queryString] = withoutPrefix.split('?');
    return `${normalizedBase}/?rest_route=${encodeURIComponent(routePath)}${queryString ? `&${queryString}` : ''}${authParam}`;
  }
  const sep = endpoint.includes('?') ? '&' : '?';
  return `${normalizedBase}${endpoint.startsWith('/') ? '' : '/'}${endpoint}${authParam ? `${sep}ag_auth=${encodeURIComponent(base64Token)}` : ''}`;
}

async function wpFetch(endpoint, options = {}) {
  const creds = loadCredentials();
  const auth = getWpAuthHeader(creds);
  const base64Token = auth.replace(/^Basic\s+/i, '');
  const url = toRestRouteUrl(creds.wpUrl, endpoint, base64Token);
  const headers = {
    'X-AG-Auth': base64Token,
    ...(options.headers || {})
  };
  if (options.body && typeof options.body === 'object' && !(options.body instanceof Buffer)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify({ ...options.body, ag_auth: base64Token });
  }
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw new Error(`WordPress HTTP ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }
  return data;
}

function parseFigmaUrl(figmaUrl) {
  const urlObj = new URL(figmaUrl);
  const parts = urlObj.pathname.split('/').filter(Boolean);
  // Matches /file/:key/... or /design/:key/...
  const idx = parts.findIndex((p) => p === 'file' || p === 'design');
  const fileKey = idx !== -1 && parts[idx + 1] ? parts[idx + 1] : null;
  let nodeId = urlObj.searchParams.get('node-id');
  if (nodeId) {
    nodeId = nodeId.replace('-', ':');
  }
  return { fileKey, nodeId };
}

function simplifyFigmaNode(node, depth = 0) {
  if (!node || depth > 8) return null;
  const simplified = {
    id: node.id,
    name: node.name,
    type: node.type
  };
  if (node.characters) simplified.text = node.characters;
  if (node.absoluteBoundingBox) simplified.bounds = node.absoluteBoundingBox;
  if (node.layoutMode) {
    simplified.autoLayout = {
      direction: node.layoutMode === 'HORIZONTAL' ? 'row' : 'column',
      primaryAlign: node.primaryAxisAlignItems,
      counterAlign: node.counterAxisAlignItems,
      itemSpacing: node.itemSpacing,
      padding: {
        top: node.paddingTop || 0,
        right: node.paddingRight || 0,
        bottom: node.paddingBottom || 0,
        left: node.paddingLeft || 0
      }
    };
  }
  if (node.style) {
    simplified.typography = {
      fontFamily: node.style.fontFamily,
      fontWeight: node.style.fontWeight,
      fontSize: node.style.fontSize,
      lineHeightPx: node.style.lineHeightPx,
      letterSpacing: node.style.letterSpacing,
      textAlignHorizontal: node.style.textAlignHorizontal
    };
  }
  if (Array.isArray(node.fills) && node.fills.length > 0) {
    simplified.fills = node.fills
      .filter((f) => f.visible !== false)
      .map((f) => {
        if (f.type === 'SOLID' && f.color) {
          const r = Math.round(f.color.r * 255);
          const g = Math.round(f.color.g * 255);
          const b = Math.round(f.color.b * 255);
          const a = f.opacity ?? f.color.a ?? 1;
          const hex = `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
          return { type: 'SOLID', hex, rgba: `rgba(${r},${g},${b},${a.toFixed(2)})` };
        }
        return { type: f.type };
      });
  }
  if (node.cornerRadius) simplified.borderRadius = node.cornerRadius;
  if (Array.isArray(node.children)) {
    simplified.children = node.children.map((c) => simplifyFigmaNode(c, depth + 1)).filter(Boolean);
  }
  return simplified;
}

const TOOLS = [
  {
    name: 'wp_configure_credentials',
    description:
      'Save or update credentials for WordPress (URL + Application Password), Easy MCP AI (URL + Bearer Token), and Figma (Personal Access Token).',
    inputSchema: {
      type: 'object',
      properties: {
        wpUrl: { type: 'string', description: 'WordPress site base URL (e.g., https://example.com)' },
        wpUser: { type: 'string', description: 'WordPress admin username' },
        wpAppPassword: { type: 'string', description: 'WordPress Application Password' },
        easyMcpUrl: {
          type: 'string',
          description: 'Easy MCP AI endpoint URL (e.g., https://example.com/wp-json/easy-mcp-ai/v1/mcp)'
        },
        easyMcpToken: { type: 'string', description: 'Easy MCP AI Bearer API Token' },
        figmaToken: { type: 'string', description: 'Figma Personal Access Token (figd_...)' }
      }
    }
  },
  {
    name: 'wp_list_pages',
    description: 'List WordPress pages or posts and check their Elementor status.',
    inputSchema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Optional search keyword' },
        perPage: { type: 'number', description: 'Number of pages to fetch (default 20)' },
        postType: { type: 'string', description: 'pages, posts, or elementor_library (default: pages)' }
      }
    }
  },
  {
    name: 'wp_get_elementor_page',
    description:
      'Fetch a WordPress page by ID including its full Elementor JSON widget/container tree (_elementor_data) and page settings.',
    inputSchema: {
      type: 'object',
      properties: {
        pageId: { type: 'number', description: 'WordPress Page ID' }
      },
      required: ['pageId']
    }
  },
  {
    name: 'wp_save_elementor_page',
    description:
      'Create or update a WordPress page with an Elementor Flexbox Container & Widget JSON tree (_elementor_data), enable Elementor builder mode, and clear Elementor CSS cache.',
    inputSchema: {
      type: 'object',
      properties: {
        pageId: {
          type: 'number',
          description: 'Page ID to update. Omit to create a new page.'
        },
        title: { type: 'string', description: 'Page title' },
        status: {
          type: 'string',
          enum: ['publish', 'draft', 'private'],
          description: 'Publish status (default: publish)'
        },
        template: {
          type: 'string',
          enum: ['', 'elementor_header_footer', 'elementor_canvas', 'elementor_theme'],
          description: 'Page layout template (default: elementor_header_footer)'
        },
        elementorData: {
          type: 'array',
          description: 'Array of top-level Elementor containers/sections (the _elementor_data JSON array).'
        },
        pageSettings: {
          type: 'object',
          description: 'Optional _elementor_page_settings object (e.g. hide_title: "yes").'
        }
      },
      required: ['elementorData']
    }
  },
  {
    name: 'wp_upload_media',
    description:
      'Upload an image from a remote URL (such as a Figma export URL) or local file path to the WordPress Media Library for use in Elementor widgets.',
    inputSchema: {
      type: 'object',
      properties: {
        source: { type: 'string', description: 'Remote http/https URL or local absolute file path' },
        filename: { type: 'string', description: 'Target filename (e.g., hero-banner.png)' },
        altText: { type: 'string', description: 'Alt text for the uploaded image' }
      },
      required: ['source', 'filename']
    }
  },
  {
    name: 'wp_call_easy_mcp',
    description:
      'Call the Easy MCP AI WordPress plugin endpoint directly (supports listing tools or invoking any Easy MCP AI tool over Streamable HTTP).',
    inputSchema: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          description: 'MCP method such as "tools/list" or "tools/call"',
          default: 'tools/list'
        },
        params: {
          type: 'object',
          description: 'Parameters for the MCP method (e.g. { name: "...", arguments: {...} })'
        }
      },
      required: ['method']
    }
  },
  {
    name: 'figma_inspect_design',
    description:
      'Inspect a Figma URL or fileKey + nodeId to extract Auto-Layout (Flexbox) structure, colors, typography, spacing, and text content for converting to Elementor.',
    inputSchema: {
      type: 'object',
      properties: {
        figmaUrl: {
          type: 'string',
          description: 'Full Figma frame URL (e.g. https://www.figma.com/design/FILEKEY/Name?node-id=1-2)'
        },
        fileKey: { type: 'string', description: 'Figma file key (if figmaUrl not provided)' },
        nodeId: { type: 'string', description: 'Figma node ID like 1:2 (if figmaUrl not provided)' }
      }
    }
  },
  {
    name: 'figma_export_assets',
    description:
      'Export specific Figma node IDs as high-resolution PNG or SVG URLs so they can be uploaded to WordPress Media Library.',
    inputSchema: {
      type: 'object',
      properties: {
        fileKey: { type: 'string', description: 'Figma file key' },
        nodeIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of Figma node IDs to export (e.g., ["1:2", "1:15"])'
        },
        format: { type: 'string', enum: ['png', 'svg', 'jpg', 'webp'], default: 'png' },
        scale: { type: 'number', description: 'Scale factor (1 to 4, default 2)' }
      },
      required: ['fileKey', 'nodeIds']
    }
  }
];

async function handleToolCall(name, args = {}) {
  if (name === 'wp_configure_credentials') {
    const saved = saveCredentials(args);
    return {
      status: 'saved',
      credentialsFile: CREDENTIALS_PATH,
      configured: {
        wpUrl: saved.wpUrl || null,
        wpUser: saved.wpUser || null,
        wpAppPasswordSet: Boolean(saved.wpAppPassword),
        easyMcpUrl: saved.easyMcpUrl || null,
        easyMcpTokenSet: Boolean(saved.easyMcpToken),
        figmaTokenSet: Boolean(saved.figmaToken)
      }
    };
  }

  if (name === 'wp_list_pages') {
    const postType = args.postType || 'pages';
    const perPage = args.perPage || 20;
    const search = args.search ? `&search=${encodeURIComponent(args.search)}` : '';
    let items;
    try {
      items = await wpFetch(`/wp-json/wp/v2/${postType}?per_page=${perPage}&context=edit${search}`);
    } catch {
      items = await wpFetch(`/wp-json/wp/v2/${postType}?per_page=${perPage}${search}`);
    }
    return items.map((p) => ({
      id: p.id,
      title: p.title?.raw || p.title?.rendered,
      slug: p.slug,
      status: p.status,
      link: p.link,
      template: p.template,
      isElementor: Boolean(p.meta?._elementor_edit_mode === 'builder' || p.meta?._elementor_data)
    }));
  }

  if (name === 'wp_get_elementor_page') {
    const pageId = args.pageId;
    // Try custom Antigravity bridge endpoint first if installed, fallback to wp/v2/pages
    try {
      const bridgeData = await wpFetch(`/wp-json/antigravity/v1/elementor/${pageId}`);
      return bridgeData;
    } catch {
      const page = await wpFetch(`/wp-json/wp/v2/pages/${pageId}?context=edit`);
      let elementorData = page.meta?._elementor_data || null;
      if (typeof elementorData === 'string' && elementorData.trim()) {
        try {
          elementorData = JSON.parse(elementorData);
        } catch {
          // keep raw string if invalid JSON
        }
      }
      return {
        id: page.id,
        title: page.title?.raw || page.title?.rendered,
        status: page.status,
        link: page.link,
        template: page.template,
        elementorEditMode: page.meta?._elementor_edit_mode || null,
        elementorData,
        note:
          elementorData === null
            ? 'Note: If _elementor_data is null on an existing Elementor page, activate the Antigravity Elementor Bridge snippet/plugin or Easy MCP AI so protected _elementor_data meta is exposed to REST.'
            : undefined
      };
    }
  }

  if (name === 'wp_save_elementor_page') {
    const elementorJsonString =
      typeof args.elementorData === 'string' ? args.elementorData : JSON.stringify(args.elementorData);

    const targetId = args.pageId || 0;

    // 1. Try saving/creating via Antigravity Elementor Bridge endpoint first (handles id=0 creation, wp_slash + CSS cache flush)
    try {
      const bridgeRes = await wpFetch(`/wp-json/antigravity/v1/elementor/${targetId}`, {
        method: 'POST',
        body: {
          title: args.title,
          status: args.status || 'publish',
          template: args.template ?? 'elementor_header_footer',
          elementor_data: elementorJsonString,
          page_settings: args.pageSettings || { hide_title: 'yes' }
        }
      });
      return bridgeRes;
    } catch (bridgeErr) {
      // 2. Fallback to standard WP REST API
      let pageId = args.pageId;
      if (!pageId) {
        const created = await wpFetch('/wp-json/wp/v2/pages', {
          method: 'POST',
          body: {
            title: args.title || 'New Elementor Page',
            status: args.status || 'publish',
            template: args.template ?? 'elementor_header_footer'
          }
        });
        pageId = created.id;
      }
      const payload = {
        meta: {
          _elementor_edit_mode: 'builder',
          _elementor_template_type: 'wp-page',
          _elementor_data: elementorJsonString
        }
      };
      if (args.title) payload.title = args.title;
      if (args.status) payload.status = args.status;
      if (args.template !== undefined) payload.template = args.template;
      if (args.pageSettings) payload.meta._elementor_page_settings = args.pageSettings;

      const updated = await wpFetch(`/wp-json/wp/v2/pages/${pageId}?context=edit`, {
        method: 'POST',
        body: payload
      });
      return {
        id: updated.id,
        link: updated.link,
        status: updated.status,
        template: updated.template,
        metaUpdated: Boolean(updated.meta?._elementor_data)
      };
    }
  }

  if (name === 'wp_upload_media') {
    const creds = loadCredentials();
    const auth = getWpAuthHeader(creds);
    let buffer;
    let contentType = 'image/png';

    if (/^https?:\/\//i.test(args.source)) {
      const imgRes = await fetch(args.source);
      if (!imgRes.ok) throw new Error(`Failed to download image from ${args.source}: ${imgRes.status}`);
      contentType = imgRes.headers.get('content-type') || contentType;
      buffer = Buffer.from(await imgRes.arrayBuffer());
    } else {
      buffer = fs.readFileSync(args.source);
      const ext = path.extname(args.filename).toLowerCase();
      if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.svg') contentType = 'image/svg+xml';
      else if (ext === '.webp') contentType = 'image/webp';
    }

    const base64Token = auth.replace(/^Basic\s+/i, '');
    const uploadUrl = toRestRouteUrl(creds.wpUrl, '/wp-json/wp/v2/media', base64Token);
    const formData = new FormData();
    formData.append('file', new Blob([buffer], { type: contentType }), args.filename);
    if (args.altText) {
      formData.append('alt_text', args.altText);
    }
    const res = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    });
    const media = await res.json();
    if (!res.ok) {
      throw new Error(`Media upload failed (${res.status}): ${JSON.stringify(media)}`);
    }
    return {
      id: media.id,
      url: media.source_url,
      title: media.title?.rendered
    };
  }

  if (name === 'wp_call_easy_mcp') {
    const creds = loadCredentials();
    const tokenPath = creds.easyMcpToken && creds.easyMcpToken.startsWith('wpmcp_') ? `/${creds.easyMcpToken}` : '';
    const url =
      creds.easyMcpUrl ||
      (creds.wpUrl ? toRestRouteUrl(creds.wpUrl, `/wp-json/easy-mcp-ai/v1/mcp${tokenPath}`) : '');
    if (!url) {
      throw new Error('Easy MCP AI URL is not configured. Call wp_configure_credentials first.');
    }
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream'
    };
    if (creds.easyMcpToken) {
      headers.Authorization = `Bearer ${creds.easyMcpToken}`;
    }
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: args.method,
        params: args.params || {}
      })
    });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { rawResponse: text };
    }
  }

  if (name === 'figma_inspect_design') {
    const creds = loadCredentials();
    if (!creds.figmaToken) {
      throw new Error('Figma token not configured. Call wp_configure_credentials with figmaToken first.');
    }
    let fileKey = args.fileKey;
    let nodeId = args.nodeId;
    if (args.figmaUrl) {
      const parsed = parseFigmaUrl(args.figmaUrl);
      fileKey = fileKey || parsed.fileKey;
      nodeId = nodeId || parsed.nodeId;
    }
    if (!fileKey) {
      throw new Error('Could not determine Figma fileKey. Provide a valid figmaUrl or fileKey.');
    }
    const endpoint = nodeId
      ? `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`
      : `https://api.figma.com/v1/files/${fileKey}?depth=4`;

    const res = await fetch(endpoint, {
      headers: { 'X-Figma-Token': creds.figmaToken }
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Figma API error (${res.status}): ${JSON.stringify(data)}`);
    }

    if (nodeId && data.nodes) {
      const result = {};
      for (const [k, v] of Object.entries(data.nodes)) {
        result[k] = simplifyFigmaNode(v.document);
      }
      return { fileKey, nodeId, nodes: result };
    }
    return {
      fileKey,
      name: data.name,
      document: simplifyFigmaNode(data.document)
    };
  }

  if (name === 'figma_export_assets') {
    const creds = loadCredentials();
    if (!creds.figmaToken) {
      throw new Error('Figma token not configured. Call wp_configure_credentials with figmaToken first.');
    }
    const format = args.format || 'png';
    const scale = args.scale || 2;
    const ids = args.nodeIds.join(',');
    const url = `https://api.figma.com/v1/images/${args.fileKey}?ids=${encodeURIComponent(ids)}&format=${format}&scale=${scale}`;
    const res = await fetch(url, {
      headers: { 'X-Figma-Token': creds.figmaToken }
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Figma export error (${res.status}): ${JSON.stringify(data)}`);
    }
    return data;
  }

  throw new Error(`Unknown tool: ${name}`);
}

// Standard MCP JSON-RPC 2.0 over stdio
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

function sendJsonRpc(msg) {
  process.stdout.write(JSON.stringify(msg) + '\n');
}

rl.on('line', async (line) => {
  if (!line.trim()) return;
  let req;
  try {
    req = JSON.parse(line);
  } catch {
    return;
  }

  const { id, method, params } = req;

  if (method === 'initialize') {
    sendJsonRpc({
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: params?.protocolVersion || '2024-11-05',
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: 'wp-elementor-figma-mcp',
          version: '1.0.0'
        }
      }
    });
    return;
  }

  if (method === 'notifications/initialized') {
    return;
  }

  if (method === 'ping') {
    sendJsonRpc({ jsonrpc: '2.0', id, result: {} });
    return;
  }

  if (method === 'tools/list') {
    sendJsonRpc({
      jsonrpc: '2.0',
      id,
      result: {
        tools: TOOLS
      }
    });
    return;
  }

  if (method === 'tools/call') {
    try {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};
      const output = await handleToolCall(toolName, toolArgs);
      sendJsonRpc({
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(output, null, 2)
            }
          ]
        }
      });
    } catch (err) {
      sendJsonRpc({
        jsonrpc: '2.0',
        id,
        result: {
          isError: true,
          content: [
            {
              type: 'text',
              text: err.message || String(err)
            }
          ]
        }
      });
    }
    return;
  }

  if (id !== undefined) {
    sendJsonRpc({
      jsonrpc: '2.0',
      id,
      error: {
        code: -32601,
        message: `Method not found: ${method}`
      }
    });
  }
});
