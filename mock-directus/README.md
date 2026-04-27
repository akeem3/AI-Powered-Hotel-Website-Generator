# Mock Directus API Server

A lightweight Express server that **exactly mimics the Directus REST API** for development and testing. No real Directus instance required.

## Installation

```bash
npm install --save-dev express cors
```

## Usage

### Start the server

```bash
# Default port 3001
node mock-directus/server.js

# Custom port
node mock-directus/server.js 4000

# Or via npm script
npm run mock:directus
```

### Configure your app

```bash
# .env.local
DIRECTUS_URL=http://localhost:3001
DIRECTUS_TOKEN=mock-token-not-needed
```

## Directus API Compatibility

This mock server follows the **official Directus REST API specification**:

### Response Format

| Type | Format |
|------|--------|
| **Single item** | `{ data: {...} }` |
| **Multiple items** | `{ data: [...], meta: {...} }` |
| **Error** | `{ error: { code, message } }` |

### Supported Endpoints

| Endpoint | Description | Mock Source |
|----------|-------------|-------------|
| `GET /items` | Generic items list | `responses/items.json` |
| `GET /items/:collection` | List collection items | `responses/items/:collection.json` |
| `GET /items/:collection/:id` | Get single item | `responses/items/:collection/:id.json` |
| `GET /fields` | Collection fields | `responses/fields.json` |
| `GET /server/info` | Server information | Built-in |
| `GET /server/health` | Health check | Built-in |
| `GET /server/ping` | Ping endpoint | Built-in |

### Supported Query Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `fields` | Field selection | `?fields=id,title,author.name` |
| `limit` | Max items to return | `?limit=10` |
| `offset` | Skip N items | `?offset=20` |
| `page` | Page number (1-indexed) | `?page=2` |
| `sort` | Sort by field(s) | `?sort=-date_created,title` |
| `meta` | Include metadata | `?meta=total_count,filter_count` |
| `filter` | Filter conditions (JSON) | `?filter={"status":{"_eq":"published"}}` |
| `deep` | Nested query params | `?deep={"translations":{"_filter":{"...}}}` |

## Examples

### Example 1: List items with pagination

**Request:**
```bash
GET http://localhost:3001/items/hotels?limit=2&offset=0&meta=*
```

**Response:**
```json
{
  "data": [
    { "id": 1, "slug": "grand-hotel-paris", "city": "Paris" },
    { "id": 2, "slug": "seaside-resort-maldives", "city": "Malé" }
  ],
  "meta": {
    "page": 1,
    "limit": 2,
    "total_count": 4,
    "filter_count": 4
  }
}
```

### Example 2: Field selection

**Request:**
```bash
GET http://localhost:3001/items/hotels?fields=id,slug,city
```

**Response:**
```json
{
  "data": [
    { "id": 1, "slug": "grand-hotel-paris", "city": "Paris" },
    { "id": 2, "slug": "seaside-resort-maldives", "city": "Malé" }
  ]
}
```

### Example 3: Sorting

**Request:**
```bash
GET http://localhost:3001/items/hotels?sort=-rating,city
```

**Response:**
```json
{
  "data": [
    { "id": 2, "rating": 4.8, "city": "Malé" },
    { "id": 3, "rating": 4.7, "city": "Zermatt" },
    { "id": 1, "rating": 4.5, "city": "Paris" }
  ]
}
```

### Example 4: Nested field selection

**Request:**
```bash
GET http://localhost:3001/items/hotels/1?fields=id,slug,translations.languages_code
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "slug": "grand-hotel-paris",
    "translations": [
      { "languages_code": "en-US" },
      { "languages_code": "fr-FR" }
    ]
  }
}
```

## Adding New Mock Endpoints

### Simple endpoint (single file)

Create a JSON file matching the URL path:

```
Request:  GET /items
File:     responses/items.json
```

### Nested endpoints

Use subdirectories in the `responses/` folder:

```
Request:  GET /items/hotels/fields
File:     responses/items/hotels/fields.json
```

### Query parameters

Query parameters are applied dynamically:
- `fields`, `limit`, `offset`, `sort`, `meta` are handled automatically
- Filter and search require extending the server logic

## Response Format Reference

### Success Response (Multiple Items)

```json
{
  "data": [
    { "id": 1, "field": "value1" },
    { "id": 2, "field": "value2" }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total_count": 150,
    "filter_count": 50
  }
}
```

### Success Response (Single Item)

```json
{
  "data": {
    "id": 1,
    "slug": "example",
    "status": "published"
  }
}
```

### Error Response

```json
{
  "error": {
    "code": 404,
    "message": "Endpoint not found: /items/unknown"
  }
}
```

### Server Health

```json
{
  "status": "ok",
  "releaseId": "11.0.0",
  "serviceId": "http://localhost:3001",
  "checks": []
}
```

### Server Info

```json
{
  "data": {
    "id": 1,
    "project_name": "Mock Directus",
    "project_url": null,
    "project_color": null,
    "project_logo": null,
    "auth_login_attempts": 25,
    "storage_asset_transform": "all",
    "storage_asset_presets": null
  }
}
```

## Testing

```bash
# Start mock server
npm run mock:directus

# In another terminal, test endpoints
# Basic request
curl http://localhost:3001/items/hotels

# With pagination
curl http://localhost:3001/items/hotels?limit=2&offset=0

# With field selection
curl http://localhost:3001/items/hotels?fields=id,slug,city

# With sorting
curl http://localhost:3001/items/hotels?sort=-rating

# Server endpoints
curl http://localhost:3001/server/info
curl http://localhost:3001/server/health
curl http://localhost:3001/server/ping
```

## Directory Structure

```
mock-directus/
├── server.js                 # Express server with Directus logic
├── README.md                # This file
├── .gitignore
└── responses/               # Mock JSON files
    ├── items.json           # GET /items
    ├── fields.json          # GET /fields
    ├── languages.json       # GET /languages
    └── items/              # Nested endpoints
        ├── hotels.json     # GET /items/hotels
        └── hotels/
            ├── 1.json      # GET /items/hotels/1
            └── 2.json      # GET /items/hotels/2
```

## Differences from Real Directus

| Feature | Mock Server | Real Directus |
|---------|-------------|---------------|
| `fields` parameter | ✅ Supported | ✅ Supported |
| `limit`/`offset` | ✅ Supported | ✅ Supported |
| `sort` | ✅ Supported | ✅ Supported |
| `meta` | ✅ Supported | ✅ Supported |
| `filter` | ❌ Not implemented | ✅ Supported |
| `search` | ❌ Not implemented | ✅ Supported |
| `deep` | ❌ Not implemented | ✅ Supported |
| `aggregate` | ❌ Not implemented | ✅ Supported |
| Authentication | ❌ Bypassed | ✅ Required |
| Real database | ❌ Static files | ✅ Database |

## Migration to Production

When switching from mock to real Directus:

1. **Change URL in .env:**
   ```bash
   # Development
   DIRECTUS_URL=http://localhost:3001

   # Production
   DIRECTUS_URL=https://your-directus-instance.com
   DIRECTUS_TOKEN=your_real_static_token
   ```

2. **Code requires no changes** - the API response format is identical

3. **Optional:** Add authentication:
   ```typescript
   // In real Directus, add Authorization header
   headers: {
     'Authorization': `Bearer ${process.env.DIRECTUS_TOKEN}`
   }
   ```

## Troubleshooting

### Port already in use

```bash
# Kill process on port 3001 (Linux/Mac)
lsof -ti:3001 | xargs kill -9

# Or use a different port
npm run mock:directus 4000
```

### CORS errors

The server has CORS enabled by default. If you still see errors, check your fetch configuration.

### Mock not found error

Check the console output for available mock files:
```
→ 404 Mock not found: items/hotels
  Available mocks: items, fields, languages
```

Create the missing file in `responses/` directory.

## Tips

1. **Use real Directus exports:** Export JSON from your real Directus instance and save to `responses/`
2. **Version control:** Commit mock files to git for reproducible tests
3. **Dynamic responses:** Extend `server.js` for complex scenarios (filter, search, etc.)
4. **Test pagination:** Use `?limit=2&offset=0&meta=*` to test pagination behavior

## References

- [Directus REST API Documentation](https://docs.directus.io/reference/introduction)
- [Directus Items API](https://docs.directus.io/reference/items)
- [Directus Query Parameters](https://docs.directus.io/reference/query)
- [Directus Error Codes](https://docs.directus.io/reference/errors)
