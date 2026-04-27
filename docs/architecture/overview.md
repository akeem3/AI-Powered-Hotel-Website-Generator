# Architecture Document: LLM-Driven Hotel Website Generator

> **Status:** Production Ready ✅
> **Version:** 2.0
> **Last Updated:** 2026-03-31
> **Format:** Enhanced BMAD-Compatible Documentation
> **Purpose:** Foundational architecture concepts for new projects
> **Based on:** [Project Brief](project-brief.md)

## PROJECT BOUNDARIES

### IN SCOPE:
- Complete system architecture definition
- Component library architecture specifications
- LLM orchestration system design
- Backend integration patterns
- Multi-language support architecture
- Performance and security requirements

### OUT OF SCOPE:
- Detailed infrastructure deployment
- Database administration procedures
- Security audit implementations
- Performance monitoring configuration

## Architecture Overview

This document defines the comprehensive technical architecture for the LLM-Driven Hotel Website Generator platform, including system design, component interactions, LangGraph workflows, deployment strategies, and integration patterns optimized for BMAD agent processing.

## Related Documentation

- **Tech Stack** - [tech-stack.md](./tech-stack.md)
- **Coding Standards** - [coding-standards.md](../guides/coding-standards.md)
- **Source Tree** - [source-tree.md](./source-tree.md)
- **LangGraph Workflows** - [langgraph-workflows.md](langgraph-workflows.md)
- **Component Library** - [component-library.md](component-library.md)
- **Backend Integration** - [backend-integration.md](backend-integration.md)
- **LangFuse Integration** - [langfuse-langgraph-integration.md](./langfuse-langgraph-integration.md)

## System Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Input    │───▶│ LangGraph       │───▶│ Site Generation │
│  (Parameters)   │    │ Orchestration   │    │    Pipeline     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                         │
                              ▼                         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Component       │◀───│ LangFuse        │    │ Quality         │
│ Library         │    │ Monitoring      │    │ Validation      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                                              │
         ▼                                              ▼
┌─────────────────┐                           ┌─────────────────┐
│ Backend         │                           │ CloudFlare      │
│ Integration     │                           │ Deployment      │
│ (Directus/ET)   │                           │                 │
└─────────────────┘                           └─────────────────┘
```

## Technical Stack

### Core Technologies
- **Frontend Generation:** Next.js 15.5+ with App Router
- **Styling:** Tailwind CSS 4.1+ with custom configuration
- **Language:** TypeScript for type safety
- **LLM Orchestration:** LangGraph + LangFuse + OpenRouter

### Infrastructure
- **Hosting:** CloudFlare Pages with BackBlaze B2 storage
- **LLM Services:** OpenRouter with multiple provider support
- **CMS:** Directus headless CMS
- **Booking API:** Effective Tours integration
- **Generation Platform:** Vercel/Railway for orchestration services

### Development Standards
- **Code Standards:** [coding-standards.md](../guides/coding-standards.md)
- **Tech Stack Details:** [tech-stack.md](./tech-stack.md)
- **Source Tree:** [source-tree.md](./source-tree.md)

## LangGraph Workflow Overview

### Primary Agents
1. **Component Selector Agent** - Chooses appropriate components based on hotel type/vibe
2. **Styling Agent** - Generates custom Tailwind CSS configuration
3. **Content Generator Agent** - Generates copy and content for selected components
4. **Assembly Agent** - Combines components into complete pages
5. **Quality Validator Agent** - Checks generated output against standards

### LangFuse Integration
- **Cost Tracking:** Real-time monitoring of LLM API costs per generation
- **Performance Metrics:** Success rates, generation times, quality scores
- **Budget Enforcement:** Automatic workflow termination if approaching $2.00 limit

## Multi-Page Generation Pipeline (Epics 24-25)

### Routing Architecture (Epic 24)
Pages moved from `app/(site)/` to `app/[lang]/` for i18n-ready routing. Old `(site)` routes are redirect stubs. CMS integration via Directus provides `getHotelFull()`, `getRoomsPageData()`, and similar data-fetching helpers. New pages: rooms, contact, about, FAQ, gallery.

### Config Generation Pipeline (Epic 25)
Post-processing transforms a single-page `HomepageConfig` into a full multi-page `WebsiteConfig` at zero LLM cost:

```
HomepageConfig → splitToPages() → multiplyContent() → WebsiteConfig
```

| Stage | Module | Purpose |
|-------|--------|---------|
| `splitToPages()` | `lib/generation/split-to-pages.ts` | Distributes homepage components across 9 page types (homepage, rooms, roomDetail, gallery, amenities, reviews, contact, about, faq) |
| `multiplyContent()` | `lib/generation/multiply-content.ts` | Expands content deterministically using the seed bank — no LLM calls |
| Seed bank | `lib/generation/seed-bank.ts` | Provides deterministic content variations |

`WebsiteConfig` wraps `HomepageConfig` with a `pages` field containing per-page component arrays. Preview route supports `?config=name&page=rooms&room=slug`.

---

## Key Architectural Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| LangGraph Multi-Agent | Structured, debuggable workflows vs simple prompts | Higher complexity, better reliability |
| LangFuse Integration | Cost control and observability | Additional dependency, better monitoring |
| Next.js Complete Apps | Full autonomy per site vs shared infrastructure | Higher resource usage, better isolation |
| Component-Based LLM | Reliability over flexibility | Limited creativity, ensured quality |

## Performance Targets

- **Generation Time:** <60 minutes per complete site
- **Core Web Vitals:** >90 Lighthouse score
- **Concurrent Generations:** Support 100+ simultaneous builds
- **Uptime:** 99.5% platform availability
- **Cost Control:** <$2.00 per generation including all LLM calls

## Security Considerations

- **Generated Code Security:** No user input in generated code
- **API Security:** Rate limiting and authentication for all services
- **Data Privacy:** Hotel data isolation and GDPR compliance
- **Infrastructure Security:** HTTPS enforcement and security headers
- **LangFuse Security:** Encrypted telemetry and cost data

## Next Steps

1. **Detailed Architecture Design** - Complete each sharded document
2. **LangGraph Workflow Specifications** - Define agent interactions and state management
3. **LangFuse Integration Setup** - Configure monitoring and cost tracking
4. **Infrastructure Setup** - Provision and configure deployment pipeline

---

*This document serves as the master index for all architecture components. Refer to individual sharded documents for detailed technical specifications.*

## BMAD Agent Integration

This architecture document is optimized for BMAD agent processing:

- **For SM Agents:** Reference epic files in `docs/epics/` for story creation
- **For Dev Agents:** Always load `coding-standards.md` and `tech-stack.md` from `devLoadAlwaysFiles`
- **For QA Agents:** Use testing standards and patterns defined in `tech-stack.md`
- **For Architect Agents:** Reference this master document and detailed specifications in `docs/architecture/`

### Key Files for Agents
```yaml
devLoadAlwaysFiles:
  - docs/guides/coding-standards.md
  - docs/architecture/tech-stack.md
  - docs/architecture/source-tree.md
```
