# LLM-Driven Hotel Website Generator - Core Architecture Documentation

> **Purpose:** Foundational architecture and design concepts for building LLM-orchestrated website generation systems
>
> **Status:** Ready for new project implementation
>
> **Date Extracted:** 2025-06-21

## Overview

This documentation captures the **HOW** of building an LLM-driven hotel website generator—the architectural patterns, component systems, agent workflows, and integration strategies that power automated website creation. This knowledge base is designed to be copied to new projects as a complete architectural foundation.

### What's Included

✅ **4-Tier Component System** (Lego Principle)
✅ **LangGraph Multi-Agent Workflows**
✅ **ZOD Type Safety & Validation**
✅ **Cost Management & Budget Tracking**
✅ **Responsive Design Patterns**
✅ **Backend Integration Strategies**
✅ **LangFuse Observability Patterns**

### What's Excluded

❌ Epic-based project management
❌ Story tracking and task management
❌ Time-based milestones
❌ QA assessment reports tied to Epics

---

## Documentation Structure

### 📘 Vision & Research

**Purpose:** Understand the market opportunity, problem space, and proven patterns

- **[project-brief.md](architecture/project-brief.md)**
  - Executive summary and problem statement
  - Market analysis and target users
  - MVP scope and success metrics
  - Technology preferences and constraints

- **research/**
  - **[claudable-architecture-analysis.md](architecture/research/claudable-architecture-analysis.md)** - Interactive generation patterns from reference architecture
  - **[claudable-inspired-patterns.md](architecture/research/claudable-inspired-patterns.md)** - Proven UX patterns for LLM-driven generation
  - **[claudable-reference-modules.md](architecture/research/claudable-reference-modules.md)** - Reusable module patterns
  - **[LLM-Driven Web Development_.md](architecture/research/LLM-Driven%20Web%20Development_%20The%20Proven%20Playbook%20for%20Generating%20Unique,%20On-Brand%20React%20&%20Tailwind%20Sites%20at%20Production%20Scale.md)** - Production-scale LLM development playbook

**Key Concepts:** Market positioning, cost economics ($2-5 per generation), component-first architecture, LangGraph orchestration rationale

---

### 🏗️ System Architecture

**Purpose:** Core technical architecture and development standards

- **[overview.md](architecture/overview.md)** - System architecture overview with key decisions
- **[tech-stack.md](architecture/tech-stack.md)** - Complete technology stack (Next.js, LangGraph, LangFuse, OpenRouter)
- **[coding-standards.md](guides/coding-standards.md)** - TypeScript, React, Tailwind, and LangGraph coding patterns
- **[source-tree.md](architecture/source-tree.md)** - Project structure and file organization
- **[technical-architecture.md](architecture/technical-architecture.md)** - Detailed technical specifications (responsive design, multi-language, deployment)
- **[langfuse-langgraph-integration.md](architecture/langfuse-langgraph-integration.md)** - LangFuse observability and cost tracking integration

**Key Concepts:** Next.js 15.5+, TypeScript strict mode, Tailwind CSS 4.1+, LangGraph state management, 768px responsive breakpoint

---

### 🧩 Component System (Architecture)

**Purpose:** The 4-tier component system and integration patterns (the "Lego principle")

- **[component-library.md](architecture/component-library.md)**
  - **Tier 1:** Primitives (Shadcn/ui base components)
  - **Tier 2:** Blocks (Hotel-specific: RoomCard, BookingWidget, TestimonialCard)
  - **Tier 3:** Sections (HeroSection, RoomsSection, GallerySection)
  - **Tier 4:** Pages (Composed views via AssemblyAgent)
  - Responsive design strategy (separate variants vs. responsive utilities)
  - Mobile-first approach with 768px breakpoint
  - Component selection logic and LLM integration

- **[backend-integration.md](architecture/backend-integration.md)**
  - Directus CMS integration patterns
  - Effective Tours booking API
  - BackBlaze storage strategy
  - DeepL translation service

- **[component-types.ts](architecture/reference/component-types.ts)**
  - Complete TypeScript type definitions
  - ZOD validation schemas
  - Component manifest interfaces
  - Hotel parameter types

**Key Concepts:** Hierarchical component composition, manifest-driven selection, props validation, backend-integrated components, responsive variants

---

### 🤖 LLM Orchestration (Architecture)

**Purpose:** LangGraph workflows, agent patterns, and cost management

- **[llm-integration.md](architecture/llm-integration.md)**
  - Complete LangGraph workflow architecture
  - Agent specifications (ComponentSelector, StylingAgent, ContentGenerator, AssemblyAgent, QualityValidator)
  - LLM configuration and prompt engineering
  - Retry strategies and error handling
  - Budget enforcement with LangFuse

- **[langgraph-workflows.md](architecture/langgraph-workflows.md)**
  - Implementation details and architecture
  - Agent communication patterns
  - State management between agents
  - Performance optimization (86% improvement achieved)
  - Cost allocation per agent

- **[api-reference.md](guides/api-reference.md)**
  - API usage patterns and examples
  - Cost tracking implementation
  - Error handling patterns
  - Testing strategies

**Key Concepts:** Multi-agent orchestration, state management, cost monitoring, $2.00 budget per generation, OpenRouter integration, fallback strategies

---

### ⚙️ Configuration (Guides)

**Purpose:** LLM settings and operational configuration

- **[llm-settings.md](guides/llm-configuration.md)**
  - Model selection (Kimi K2, Claude, GPT-4o-mini)
  - Temperature and token settings
  - Cost tracking configuration
  - Provider fallback strategies

**Key Concepts:** Budget-aware model selection, temperature tuning, token limits, provider diversity

---

## Core Architectural Concepts

### 1. The Lego Principle: Component System

```
Primitives (Shadcn/ui)
    ↓
Blocks (Hotel-specific: RoomCard, BookingWidget)
    ↓
Sections (Page layouts: HeroSection, RoomsSection)
    ↓
Pages (Composed via AssemblyAgent)
```

**Key Innovation:** LLM agents select and configure pre-built, tested components rather than generating raw code. This ensures reliability, performance, and maintainability.

### 2. LangGraph Multi-Agent Orchestration

```
Input Parameters
    ↓
ComponentSelector (manifest-driven selection)
    ↓
StylingAgent (Tailwind theme generation)
    ↓
ContentGenerator (Copy and JSON content)
    ↓
AssemblyAgent (Next.js app assembly)
    ↓
QualityValidator (standards verification)
    ↓
Generated Website
```

**Key Innovation:** Each agent specializes in one task with clear inputs/outputs. LangGraph manages state transitions and error recovery.

### 3. Cost Management & Budget Tracking

- **Per-Generation Budget:** $2.00 target (Kimi K2 model: ~$0.002 total LLM cost)
- **Real-time Tracking:** LangFuse integration for cost monitoring
- **Emergency Stops:** Automatic workflow termination on budget overrun
- **Model Fallbacks:** Intelligent fallback to cheaper models when needed

**Key Innovation:** Budget enforcement at the workflow level with agent-specific cost allocation.

### 4. Responsive Design Framework

- **Mobile-First:** Default styling for <768px
- **Desktop Enhancement:** `md:` prefix for ≥768px
- **Two Strategies:**
  - **Separate Variants:** Complex components (BookingWidget, Navigation) with distinct mobile/desktop implementations
  - **Responsive Utilities:** Simple components (RoomCard, TestimonialCard) using Tailwind responsive classes
- **Image Optimization:** `.webp` for desktop, `.m.webp` for mobile (<768px)

**Key Innovation:** Strategy-based responsive design that balances simplicity with mobile/desktop UX optimization.

### 5. ZOD Type Safety & Validation

- **Runtime Validation:** All LLM outputs validated against ZOD schemas
- **Type Safety:** TypeScript interfaces derived from ZOD schemas
- **Component Props:** Validated props prevent runtime errors
- **Agent Outputs:** Structured responses with confidence scoring

**Key Innovation:** Bridge between LLM flexibility and production reliability through runtime validation.

### 6. Backend Integration Patterns

- **Directus CMS:** Read-only access for hotel/room data
- **Effective Tours API:** Redirect-based booking flow
- **BackBlaze B2:** Content and translation storage
- **DeepL API:** Professional-grade translations

**Key Innovation:** Decoupled backend services with graceful degradation and fallback strategies.

---

## Quick Start Guide

### For New Projects

1. **Copy docs_new/** to your new project as `/docs`
2. **Read in order:**
   - `architecture/project-brief.md` - Understand the problem and approach
   - `architecture/overview.md` - System architecture decisions
   - `architecture/component-library.md` - Component hierarchy
   - `architecture/llm-integration.md` - LangGraph workflows
   - `architecture/tech-stack.md` - Technology choices

3. **Reference as needed:**
   - Component types: `architecture/reference/component-types.ts`
   - Coding standards: `guides/coding-standards.md`
   - Cost management: `architecture/langgraph-workflows.md`
   - Backend integration: `architecture/backend-integration.md`

### Key Implementation Steps

1. **Component Library Setup**
   - Install Shadcn/ui primitives
   - Build Tier 2 blocks (RoomCard, BookingWidget)
   - Implement Tier 3 sections (HeroSection, RoomsSection)
   - Create page wireframes

2. **LangGraph Agent Development**
   - Implement ComponentSelector with manifest integration
   - Build StylingAgent for Tailwind theme generation
   - Create ContentGenerator for copy
   - Set up cost monitoring with LangFuse

3. **Backend Integration**
   - Configure Directus CMS schema
   - Integrate Effective Tours API (redirect flow)
   - Set up BackBlaze for asset storage
   - Implement DeepL for translations

4. **Testing & Validation**
   - Component unit tests (Jest + React Testing Library)
   - Agent integration tests (LangGraph workflow validation)
   - Cost compliance tests (budget enforcement)
   - Responsive design tests (mobile + desktop)

---

## Technology Stack Summary

```yaml
Frontend Generation:
  - Next.js 15.5+ (App Router, SSG)
  - TypeScript 5.0+ (strict mode)
  - Tailwind CSS 4.1+ (utility-first)
  - Shadcn/ui (Radix UI primitives)

LLM Orchestration:
  - LangGraph 0.2+ (multi-agent workflows)
  - LangFuse 3.38+ (observability & cost tracking)
  - OpenRouter (LLM gateway)
  - Kimi K2 ($0.0002 per generation)

Backend Services:
  - Directus CMS (hotel/room data)
  - Effective Tours API (booking)
  - BackBlaze B2 (storage)
  - DeepL API (translations)

Infrastructure:
  - CloudFlare Pages (hosting)
  - PostgreSQL (CMS database)
  - Vercel/Railway (generation platform)
```

---

## Cost Economics

### Per-Generation Budget Breakdown

| Component | Cost | Percentage |
|-----------|------|------------|
| LLM Calls (Kimi K2) | $0.002 | 0.1% |
| Translation (DeepL) | $0.02-0.10 | 1-5% |
| Storage (BackBlaze) | $0.005 | 0.25% |
| **Base Total** | **$0.027-0.107** | **1.35-5.35%** |
| **Buffer/Retries** | **$1.893-1.973** | **94.65-98.65%** |
| **Target Budget** | **$2.00** | **100%** |

**Key Insight:** The majority of the budget is safety buffer. Actual LLM costs with Kimi K2 are ~$0.002, allowing massive scale with excellent margins.

---

## Success Metrics

### Technical Performance
- ✅ Generation Time: <30 minutes (average ~15 minutes)
- ✅ Cost Per Website: <$2.00 (actual ~$0.10)
- ✅ Success Rate: >95% for valid inputs
- ✅ Quality Score: >85 Lighthouse average

### Architectural Quality
- ✅ Type Safety: 100% TypeScript coverage
- ✅ Component Reusability: 4-tier hierarchy
- ✅ Cost Monitoring: Real-time with emergency stops
- ✅ Error Recovery: Multi-level retry with fallbacks
- ✅ Responsive Design: Mobile-first with 768px breakpoint

---

## Common Patterns & Best Practices

### Component Selection Pattern
```typescript
// Agent uses manifest to validate and select components
const selectedComponents = await componentSelector.selectComponents({
  hotelType: 'luxury',
  analysis: inputAnalysis,
  componentManifest: manifest,
  maxComponents: 10 // Epic 3 performance requirement
});
```

### Cost Tracking Pattern
```typescript
// All LLM calls tracked through cost monitor
const result = await langfuseService.executeGeneration(
  'ComponentSelector',
  { input, model, params },
  async () => llmCall()
);
// Automatic cost tracking, budget enforcement, emergency stops
```

### Responsive Component Pattern
```typescript
// Strategy 1: Separate Variants (complex components)
{isMobile ? (
  <MobileBookingWidget sections={collapsibleSections} />
) : (
  <DesktopBookingWidget layout="single-form" />
)}

// Strategy 2: Responsive Utilities (simple components)
<RoomCard className="flex-col md:flex-row p-4 md:p-6" />
```

### ZOD Validation Pattern
```typescript
// Runtime validation of LLM outputs
const ComponentSelectionSchema = z.object({
  selectedComponents: z.array(ComponentConfigSchema),
  selectionReasoning: z.record(z.string()),
  totalConfidence: z.number().min(0).max(1)
});

const validated = ComponentSelectionSchema.parse(llmOutput);
```

---

## Troubleshooting & Common Issues

### Issue: Budget Overruns
**Solution:** Check `CostMonitor.ts` allocation, verify model selection (use Kimi K2), review prompt length

### Issue: Component Selection Failures
**Solution:** Validate manifest completeness, check confidence thresholds, review selection logic

### Issue: Responsive Design Issues
**Solution:** Verify 768px breakpoint usage, check component strategy (separate vs. utilities), test image variants

### Issue: LangGraph State Errors
**Solution:** Validate state object structure, check optional chaining usage, verify agent outputs

### Issue: Test Failures
**Solution:** Consult `tech-stack.md` testing patterns, reset cost monitor between tests, use prototype mocking for agents

---

## Additional Resources

### External Documentation
- [LangGraph Docs](https://langchain-ai.github.io/langgraph/) - Multi-agent workflow framework
- [LangFuse Docs](https://langfuse.com/docs) - LLM observability and cost tracking
- [Shadcn/ui](https://ui.shadcn.com/) - Component library foundation
- [Next.js Docs](https://nextjs.org/docs) - React framework with App Router
- [OpenRouter](https://openrouter.ai/) - LLM gateway and provider abstraction

### Key Files Reference
```
web-app/
├── types/
│   └── components.ts          # Type definitions (reference only)
├── app/
│   └── langgraph/
│       ├── agents/            # ComponentSelector, StylingAgent, etc.
│       ├── services/
│       │   └── CostMonitor.ts # Budget tracking and enforcement
│       └── workflows/         # GenerationWorkflow orchestration
├── lib/
│   └── llm-service.ts         # OpenRouter API integration
└── components/
    ├── ui/                    # Tier 1: Shadcn/ui primitives
    ├── blocks/                # Tier 2: Hotel-specific components
    └── sections/              # Tier 3: Page sections
```

---

## Version History

- **v1.1 (2026-03-25)** - Epic 24 & 25 completion
  - Multi-page routing implemented at `app/[lang]/` with Directus CMS integration (Epic 24)
  - WebsiteConfig multi-page generation via `splitToPages()` + `multiplyContent()` post-processing (Epic 25)
  - Platform now generates complete multi-page hotel websites (homepage, rooms, dining, etc.) within the ~$2/site budget

- **v1.0 (2025-01-19)** - Initial extraction from production system
  - 16 core documents preserved
  - Epic/Story references removed
  - Internal links updated for new structure
  - Ready for new project implementation

---

## License & Usage

This documentation represents architectural patterns and design decisions. When copying to a new project:

1. ✅ Adapt patterns to your specific use case
2. ✅ Modify cost budgets and technical constraints
3. ✅ Customize component library for your domain
4. ✅ Adjust LangGraph workflows for your requirements

---

**Ready to build?** Start with `architecture/project-brief.md` to understand the full context, then dive into `architecture/overview.md` for system design.
