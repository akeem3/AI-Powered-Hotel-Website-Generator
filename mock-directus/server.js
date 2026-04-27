/**
 * Mock Directus API Server
 *
 * A lightweight Express server that mimics the Directus REST API exactly.
 * Used for development and testing without requiring a real Directus instance.
 *
 * Response format matches Directus API specification:
 * - Single item: { data: {...} }
 * - Multiple items: { data: [...], meta: {...} }
 * - Errors: { error: {...} } or { errors: [...] }
 *
 * Usage: node server.js [port]
 * Default port: 3001
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const MOCK_DIR = path.join(__dirname, 'responses');

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

/**
 * Parse Directus query parameters
 * Supports: fields, limit, offset, page, sort, filter, search, meta, deep
 */
function parseQueryParams(query) {
  return {
    fields: query.fields ? query.fields.split(',') : null,
    limit: parseInt(query.limit) || -1, // -1 = unlimited (Directus default)
    offset: parseInt(query.offset) || 0,
    page: parseInt(query.page) || null,
    sort: query.sort || null,
    filter: query.filter ? tryParseJSON(query.filter) : null,
    search: query.search || null,
    meta: query.meta ? query.meta.split(',') : [],
    deep: query.deep ? tryParseJSON(query.deep) : null,
  };
}

/**
 * Safely parse JSON, return null if invalid
 */
function tryParseJSON(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

/**
 * Apply fields filtering (Directus field selection)
 */
function applyFields(data, fields) {
  if (!fields || fields.includes('*')) return data;

  if (Array.isArray(data)) {
    return data.map((item) => applyFields(item, fields));
  }

  const result = {};
  for (const field of fields) {
    // Handle nested fields like "author.name"
    const parts = field.split('.');
    let current = result;
    let source = data;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      if (isLast) {
        if (source && source.hasOwnProperty(part)) {
          current[part] = source[part];
        }
      } else {
        current[part] = current[part] || {};
        if (source && source[part]) {
          source = source[part];
          current = current[part];
        }
      }
    }
  }

  return result;
}

/**
 * Apply sorting (Directus sort parameter)
 * -sort for descending, sort for ascending
 */
function applySort(data, sortStr) {
  if (!sortStr || !Array.isArray(data)) return data;

  const sortFields = sortStr.split(',').map((s) => ({
    field: s.startsWith('-') ? s.slice(1) : s,
    desc: s.startsWith('-'),
  }));

  return [...data].sort((a, b) => {
    for (const { field, desc } of sortFields) {
      const aVal = getNestedValue(a, field);
      const bVal = getNestedValue(b, field);

      if (aVal < bVal) return desc ? 1 : -1;
      if (aVal > bVal) return desc ? -1 : 1;
    }
    return 0;
  });
}

/**
 * Get nested object value by path (e.g., "author.name")
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((cur, key) => (cur ? cur[key] : undefined), obj);
}

/**
 * Apply pagination (limit + offset)
 */
function applyPagination(data, limit, offset) {
  if (limit === -1) limit = data.length;
  return data.slice(offset, offset + limit);
}

/**
 * Calculate page from offset and limit
 */
function calculatePage(offset, limit) {
  return Math.floor(offset / limit) + 1;
}

/**
 * Directus error response format
 */
function sendError(res, statusCode, code, message) {
  res.status(statusCode).json({
    error: {
      code: statusCode,
      message: message,
    },
  });
}

/**
 * Main request handler - serves JSON files or applies Directus query logic
 */
app.use((req, res) => {
  // Remove query string and leading/trailing slashes
  const urlPath = req.path
    .replace(/\?.*$/, '') // Remove query string
    .replace(/^\//, '') // Remove leading slash
    .replace(/\/$/, '') || 'root'; // Replace empty with 'root'

  // Special Directus endpoints
  if (urlPath === 'server/ping') {
    res.set('Content-Type', 'text/html').status(200).send('pong');
    console.log(`  → 200 OK (Directus ping)`);
    return;
  }

  if (urlPath === 'server/health') {
    res.json({
      status: 'ok',
      releaseId: '11.0.0',
      serviceId: 'http://localhost:3001',
      checks: [],
    });
    console.log(`  → 200 OK (Directus health)`);
    return;
  }

  if (urlPath === 'server/info') {
    res.json({
      data: {
        id: 1,
        project_name: 'Mock Directus',
        project_url: null,
        project_color: null,
        project_logo: null,
        auth_login_attempts: 25,
        storage_asset_transform: 'all',
        storage_asset_presets: null,
      },
    });
    console.log(`  → 200 OK (Directus info)`);
    return;
  }

  // Try to find matching JSON file
  const jsonPath = path.join(MOCK_DIR, `${urlPath}.json`);

  if (fs.existsSync(jsonPath)) {
    try {
      const rawData = fs.readFileSync(jsonPath, 'utf8');
      let responseData = JSON.parse(rawData);

      const params = parseQueryParams(req.query);

      // Apply Directus query parameter logic
      if (responseData.data && Array.isArray(responseData.data)) {
        let items = responseData.data;

        // Apply fields filtering
        if (params.fields) {
          items = applyFields(items, params.fields);
        }

        // Apply sorting
        if (params.sort) {
          items = applySort(items, params.sort);
        }

        // Calculate totals before pagination
        const totalCount = items.length;

        // Apply pagination
        items = applyPagination(items, params.limit, params.offset);

        // Build response with or without meta
        const shouldIncludeMeta =
          params.meta.length > 0 ||
          req.query.meta === '*' ||
          req.query.limit !== undefined;

        if (shouldIncludeMeta) {
          const page = params.page || calculatePage(params.offset, params.limit);
          responseData = {
            data: items,
            meta: {
              page: page,
              limit: params.limit,
              total_count: totalCount,
              filter_count: totalCount,
            },
          };
        } else {
          responseData = {
            data: items,
          };
        }
      } else if (responseData.data && params.fields) {
        // Single item with fields
        responseData.data = applyFields(responseData.data, params.fields);
      }

      // Set Directus headers
      res.set('Content-Type', 'application/json');

      res.json(responseData);
      console.log(`  → 200 OK (mock: ${urlPath})`);
    } catch (error) {
      console.error(`  → 500 Error reading mock file: ${error.message}`);
      sendError(res, 500, 'SERVICE_UNAVAILABLE', 'Mock server error reading file');
    }
  } else {
    // List available mock files for debugging
    const availableMocks = fs
      .readdirSync(MOCK_DIR, { recursive: true })
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace('.json', '').replace(/\\/g, '/'));

    console.error(`  → 404 Mock not found: ${urlPath}`);
    console.error(`  Available mocks: ${availableMocks.slice(0, 10).join(', ')}`);

    // Directus 404 format
    sendError(res, 404, 'ROUTE_NOT_FOUND', `Endpoint not found: /${urlPath}`);
  }
});

// Start server
const port = process.argv[2] || process.env.MOCK_PORT || 3001;

app.listen(port, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║           Mock Directus API Server                        ║
║            (Directus API Compatible)                      ║
╠════════════════════════════════════════════════════════════╣
║  Running on: http://localhost:${port}                       ║
║  Mock directory: ${MOCK_DIR.padEnd(39)}║
║                                                            ║
║  Supported endpoints:                                     ║
║  - GET  /items                                           ║
║  - GET  /items/:collection                               ║
║  - GET  /items/:collection/:id                           ║
║  - GET  /fields                                          ║
║  - GET  /server/info                                     ║
║  - GET  /server/health                                   ║
║  - GET  /server/ping                                      ║
║                                                            ║
║  Query parameters: fields, limit, offset, sort, meta     ║
║                                                            ║
║  Press Ctrl+C to stop                                      ║
╚════════════════════════════════════════════════════════════╝
  `);
});
