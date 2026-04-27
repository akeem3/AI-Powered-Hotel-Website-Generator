# React/Next.js Project Context

This directory contains context files specific to **React and Next.js development**. The `dev-react` agent loads these files to understand project conventions for frontend code.

## Purpose

React/Next.js has unique patterns and tooling that differ from backend languages:
- JSX/TSX component syntax
- React hooks and state management
- Next.js App Router patterns
- Client vs Server Components
- Frontend testing with Vitest/RTL

These files define YOUR project's specific approach to React development.

## Files in This Directory

```
react/
├── README.md              # This file
├── tech-stack.md          # React, Next.js, TypeScript versions
├── coding-standards.md    # TSX patterns, hooks, naming conventions
├── testing-standards.md   # Vitest, React Testing Library, Playwright
└── error-handling.md      # Error boundaries, API error handling
```

### tech-stack.md (REQUIRED)

Defines the exact technologies and versions:
- React version (18.x, 19.x)
- Next.js version and router type (App/Pages)
- TypeScript configuration
- State management library (Zustand, Redux, etc.)
- Styling approach (Tailwind, CSS Modules, etc.)
- Package manager (pnpm, npm, yarn)

**Why required**: Agent needs to know which patterns apply.

### coding-standards.md (REQUIRED)

Defines how to write React code:
- Component patterns (functional only, no class components)
- TypeScript rules (strict mode, no `any`)
- Naming conventions (PascalCase components, camelCase hooks)
- File structure and organization
- Import order

**Why required**: Ensures consistent code style.

### testing-standards.md (Recommended)

Defines testing approach:
- Test framework (Vitest vs Jest)
- Component testing patterns (RTL queries)
- Mocking strategies (MSW)
- Coverage requirements
- E2E testing (Playwright)

### error-handling.md (Recommended)

Defines error handling patterns:
- Error boundaries
- API error handling
- Form validation errors
- Loading and error states

## Loading Order

When `dev-react` is invoked:

```
1. Load SHARED context first:
   ├── shared/domain-glossary.md     (optional)
   ├── shared/architecture-overview.md (optional)
   └── shared/api-conventions.md     (recommended)

2. Load REACT-SPECIFIC context:
   ├── react/tech-stack.md           (REQUIRED)
   ├── react/coding-standards.md     (REQUIRED)
   ├── react/testing-standards.md    (recommended)
   └── react/error-handling.md       (recommended)
```

## Customization Guide

### When to Modify

Update these files when:
- Upgrading React/Next.js versions
- Changing state management approach
- Adopting new testing patterns
- AI consistently produces wrong patterns

### What to Customize

| File | Customize For |
|------|--------------|
| `tech-stack.md` | Your exact versions, libraries |
| `coding-standards.md` | Team conventions, style guide |
| `testing-standards.md` | Coverage requirements, test patterns |
| `error-handling.md` | Your error handling approach |

### Examples of Customization

**If using Redux instead of Zustand:**
```markdown
# In tech-stack.md
### State Management
- **Client State**: Redux Toolkit 2.x
- **Server State**: RTK Query
```

**If using CSS Modules instead of Tailwind:**
```markdown
# In coding-standards.md
### Styling
- Use CSS Modules (*.module.css)
- No inline styles
- BEM naming convention
```

## Related Files

- Shared context: `docs/project-context/shared/`
- Agent definition: `.claude/agents/dev-react.md`
- Story templates: `.claude/context/templates/story.md`
