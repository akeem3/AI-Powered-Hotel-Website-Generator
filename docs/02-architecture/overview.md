# Architecture Document: LLM-Driven Hotel Website Generator

> **Status:** Core Architecture Documentation
> **Last Updated:** 2025-01-19
> **Purpose:** Foundational architecture concepts for new projects
> **Based on:** [Project Brief](../01-vision/project-brief.md)

## Architecture Overview

This document defines the technical architecture for the LLM-Driven Hotel Website Generator platform, including system design, component interactions, LangGraph workflows, and deployment strategies.

## Related Documentation

- **Tech Stack** - [tech-stack.md](./tech-stack.md)
- **Coding Standards** - [coding-standards.md](./coding-standards.md)
- **Source Tree** - [source-tree.md](./source-tree.md)
- **LangGraph Workflows** - [../04-llm-orchestration/langgraph-workflows.md](../04-llm-orchestration/langgraph-workflows.md)
- **Component Library** - [../03-component-system/component-library.md](../03-component-system/component-library.md)
- **Backend Integration** - [../03-component-system/backend-integration.md](../03-component-system/backend-integration.md)
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
- **Frontend Generation:** Next.js 14+ with App Router
- **Styling:** Tailwind CSS 3.4+ with custom configuration
- **Language:** TypeScript for type safety
- **LLM Orchestration:** LangGraph + LangFuse + OpenRouter

### Infrastructure
- **Hosting:** CloudFlare Pages with BackBlaze B2 storage
- **LLM Services:** OpenRouter with multiple provider support
- **CMS:** Directus headless CMS
- **Booking API:** Effective Tours integration
- **Generation Platform:** Vercel/Railway for orchestration services

### Development Standards
- **Code Standards:** [coding-standards.md](./coding-standards.md)
- **Tech Stack Details:** [tech-stack.md](./tech-stack.md)
- **Source Tree:** [source-tree.md](./source-tree.md)

## LangGraph Workflow Overview

### Primary Agents
1. **Input Analyzer Agent** - Processes hotel parameters and determines requirements
2. **Component Selector Agent** - Chooses appropriate components based on hotel type/vibe
3. **Styling Agent** - Generates custom Tailwind CSS configuration
4. **Assembly Agent** - Combines components into complete pages
5. **Quality Validator Agent** - Checks generated output against standards
6. **Deployment Agent** - Handles build and deployment pipeline

### LangFuse Integration
- **Cost Tracking:** Real-time monitoring of LLM API costs per generation
- **Performance Metrics:** Success rates, generation times, quality scores
- **Budget Enforcement:** Automatic workflow termination if approaching $5 limit

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
- **Cost Control:** <$5 per generation including all LLM calls

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