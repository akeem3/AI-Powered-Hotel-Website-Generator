# Shared Project Context

This directory contains context files that are **shared across ALL language-specific agents**. When any dev agent (dev-react, dev-python, dev-go, etc.) is invoked, it loads these files first.

## Purpose

Some context is language-agnostic and should be consistent across your entire system:

| Context | Why Shared |
|---------|-----------|
| **Domain Glossary** | Business terms are the same regardless of language |
| **Architecture Overview** | System design spans frontend and backend |
| **API Conventions** | Contract between services must be consistent |

## Files in This Directory

```
shared/
├── README.md                  # This file
├── domain-glossary.md         # Business terminology and concepts
├── architecture-overview.md   # High-level system design
└── api-conventions.md         # REST/GraphQL conventions, request/response format
```

### domain-glossary.md

Defines business terminology that all agents should understand:
- Entity definitions (User, Order, Product, etc.)
- Business rules and constraints
- Domain-specific vocabulary
- Acronyms and abbreviations

**Why shared**: A "User" in Python backend is the same as a "User" in React frontend.

### architecture-overview.md

Describes system-wide architecture:
- Service boundaries and responsibilities
- Data flow between components
- Deployment topology
- Cross-cutting concerns (auth, logging, monitoring)

**Why shared**: Both frontend and backend need to understand the overall system.

### api-conventions.md

Defines the contract between frontend and backend:
- REST endpoint patterns (`/api/v1/resources`)
- Request/response formats
- Error response structure
- Authentication headers
- Pagination patterns

**Why shared**: Frontend must send what backend expects, and vice versa.

## Loading Order

Shared context is loaded **before** language-specific context:

```
1. shared/domain-glossary.md      ← First (optional)
2. shared/architecture-overview.md ← Second (optional)
3. shared/api-conventions.md      ← Third (recommended)
4. {language}/tech-stack.md       ← Then language-specific
5. {language}/coding-standards.md
6. ...
```

This ensures language-specific files can reference shared concepts.

## When to Add Files Here

Add to `shared/` when the context:
- Applies to ALL languages in your project
- Defines cross-service contracts
- Contains business logic that must be consistent
- Would be duplicated across language directories

**Do NOT add** language-specific patterns, tools, or conventions here.

## Example: Domain Glossary

```markdown
## Core Entities

### User
A registered account in the system.
- **user_id**: UUID, primary identifier
- **email**: Unique email address
- **role**: One of: admin, member, guest

### Order
A purchase transaction.
- **order_id**: UUID, primary identifier
- **status**: pending → confirmed → shipped → delivered
- **user_id**: Foreign key to User

## Business Rules

- Orders under $50 do not qualify for free shipping
- Admin users can access all orders
- Guests cannot create orders (must register first)
```

Both dev-react and dev-python will understand these terms consistently.
