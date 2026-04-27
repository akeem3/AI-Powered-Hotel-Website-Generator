---
type: project-context
domain: api-conventions
language: shared
version: 1.0.0
updated: 2025-11-30
applies_to: [dev-react, dev-python, dev-go, all-agents]
---

# API Conventions

> **Purpose**: Define the contract between frontend and backend services.
> Both frontend and backend agents MUST follow these conventions for consistency.

## Base URL Structure

```
Production:  https://api.example.com/v1
Staging:     https://api.staging.example.com/v1
Development: http://localhost:8000/api/v1
```

### Versioning
- Version in URL path: `/v1/`, `/v2/`
- Major version changes only for breaking changes
- Deprecation notice: 6 months before removal

---

## REST Endpoint Patterns

### Resource Naming
- Use **plural nouns**: `/users`, `/orders`, `/products`
- Use **kebab-case**: `/user-profiles`, `/order-items`
- Use **lowercase**: Never `/Users` or `/ORDERS`

### URL Structure
```
GET    /v1/resources          # List all (with pagination)
POST   /v1/resources          # Create new
GET    /v1/resources/:id      # Get single
PUT    /v1/resources/:id      # Full update
PATCH  /v1/resources/:id      # Partial update
DELETE /v1/resources/:id      # Delete

# Nested resources (when tightly coupled)
GET    /v1/users/:userId/orders     # User's orders
POST   /v1/orders/:orderId/items    # Add item to order

# Actions (when CRUD doesn't fit)
POST   /v1/orders/:orderId/cancel   # Cancel order
POST   /v1/users/:userId/verify     # Verify user email
```

### Query Parameters
```
# Pagination
?page=1&limit=20              # Page-based
?cursor=abc123&limit=20       # Cursor-based (preferred)

# Filtering
?status=active                # Single value
?status=active,pending        # Multiple values (OR)
?created_after=2025-01-01     # Date range

# Sorting
?sort=created_at              # Ascending (default)
?sort=-created_at             # Descending (prefix with -)
?sort=status,-created_at      # Multiple fields

# Field selection
?fields=id,name,email         # Sparse fieldsets

# Search
?q=search+term                # Full-text search
```

---

## HTTP Methods and Status Codes

### Methods
| Method | Idempotent | Use Case |
|--------|------------|----------|
| GET | Yes | Read resource(s) |
| POST | No | Create resource, trigger action |
| PUT | Yes | Full resource replacement |
| PATCH | No | Partial update |
| DELETE | Yes | Remove resource |

### Success Status Codes
| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST creating resource |
| 204 | No Content | Successful DELETE with no body |

### Error Status Codes
| Code | Meaning | When to Use |
|------|---------|-------------|
| 400 | Bad Request | Invalid input, validation failure |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Valid auth, but no permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate, state conflict |
| 422 | Unprocessable Entity | Semantic validation failure |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |
| 503 | Service Unavailable | Maintenance, dependency down |

---

## Request Format

### Headers
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <token>
X-Request-ID: <uuid>           # For tracing
X-Tenant-ID: <tenant-id>       # For multi-tenant
```

### Request Body (Create/Update)
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "role": "member"
}
```

**Rules:**
- Use `camelCase` for JSON keys (frontend convention)
- Backend transforms to `snake_case` internally
- Omit read-only fields (`id`, `created_at`, etc.)
- Include only fields being updated for PATCH

---

## Response Format

### Success Response (Single Resource)
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "member",
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
}
```

### Success Response (Collection)
```json
{
  "data": [
    { "id": "...", "name": "..." },
    { "id": "...", "name": "..." }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "hasMore": true
  }
}
```

### Success Response (Cursor Pagination)
```json
{
  "data": [...],
  "meta": {
    "cursor": "eyJpZCI6MTAwfQ==",
    "hasMore": true,
    "limit": 20
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "fields": {
        "email": "Invalid email format",
        "password": "Must be at least 8 characters"
      }
    },
    "requestId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

## Error Codes

### Authentication/Authorization
| Code | HTTP | Description |
|------|------|-------------|
| `AUTH_REQUIRED` | 401 | No authentication provided |
| `AUTH_INVALID` | 401 | Invalid token or credentials |
| `AUTH_EXPIRED` | 401 | Token has expired |
| `FORBIDDEN` | 403 | No permission for resource |

### Validation
| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `INVALID_FORMAT` | 400 | Wrong data format |
| `MISSING_FIELD` | 400 | Required field missing |

### Resources
| Code | HTTP | Description |
|------|------|-------------|
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `ALREADY_EXISTS` | 409 | Duplicate resource |
| `CONFLICT` | 409 | State conflict |

### Server
| Code | HTTP | Description |
|------|------|-------------|
| `INTERNAL_ERROR` | 500 | Unexpected error |
| `SERVICE_UNAVAILABLE` | 503 | Dependency down |
| `RATE_LIMITED` | 429 | Too many requests |

---

## Authentication

### JWT Token Structure
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "role": "member",
  "tenantId": "tenant-123",
  "iat": 1705312200,
  "exp": 1705315800
}
```

### Token Refresh
```http
POST /v1/auth/refresh
Authorization: Bearer <refresh-token>

Response:
{
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "expiresIn": 3600
  }
}
```

---

## Pagination

### Cursor-Based (Preferred)
```http
GET /v1/users?cursor=eyJpZCI6MTAwfQ==&limit=20

Response:
{
  "data": [...],
  "meta": {
    "cursor": "eyJpZCI6MTIwfQ==",
    "hasMore": true
  }
}
```

**Benefits:**
- Stable with concurrent inserts/deletes
- Better performance for large datasets
- No "page drift" problem

### Page-Based (Simple Cases)
```http
GET /v1/users?page=2&limit=20

Response:
{
  "data": [...],
  "meta": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## Rate Limiting

### Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705315800
```

### Limits
| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Read (GET) | 1000/hour | Per user |
| Write (POST/PUT/PATCH) | 100/hour | Per user |
| Auth endpoints | 10/minute | Per IP |

### Rate Limit Response (429)
```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests",
    "details": {
      "retryAfter": 60
    }
  }
}
```

---

## Field Conventions

### Naming
| Convention | Example | Use |
|------------|---------|-----|
| camelCase | `userId`, `createdAt` | JSON keys |
| snake_case | `user_id`, `created_at` | Database, internal |

### Dates
- Format: ISO 8601 with timezone
- Example: `2025-01-15T10:30:00Z`
- Always UTC in API responses
- Frontend converts to local timezone

### IDs
- Format: UUID v4
- Example: `550e8400-e29b-41d4-a716-446655440000`
- Never expose sequential IDs externally

### Booleans
- Use `is` prefix: `isActive`, `isVerified`
- Never use `1`/`0` or `"true"`/`"false"`

---

## Implementation Notes

### Frontend (React)
```typescript
// API client should:
// - Add Authorization header from auth store
// - Transform camelCase ↔ snake_case if backend uses snake_case
// - Handle 401 with automatic token refresh
// - Include X-Request-ID for tracing

const response = await api.get('/users', {
  params: { page: 1, limit: 20 }
});
```

### Backend (Python)
```python
# API routes should:
# - Validate input with Pydantic
# - Return consistent response format
# - Log with request_id for tracing
# - Transform snake_case ↔ camelCase in serialization

@router.get("/users")
async def list_users(
    page: int = 1,
    limit: int = Query(default=20, le=100)
) -> PaginatedResponse[UserResponse]:
    ...
```
