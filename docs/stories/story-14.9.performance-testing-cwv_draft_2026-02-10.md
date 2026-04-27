---
type: story
id: "14.9.performance-testing-cwv"
status: draft
priority: medium
epic_number: 14
story_number: 9
created_at: "2026-02-10T13:35:00+08:00"
updated_at: "2026-02-10T14:05:00+08:00"
created_by: story-creator-v2
updated_by: pattern-researcher-v2
depends_on:
  - docs/epics/epic-14.static-site-generation_isr_ready_2026-01-28.md
  - docs/stories/story-14.4.ssg-build-time-content-injection_draft_2026-02-10.md
  - docs/stories/story-14.7.hybrid-architecture-client-server_draft_2026-02-10.md
related_artifacts: []
acceptance_criteria_met: "0/10"
hallucination_check: passed
security_check: passed
test_coverage: pending
code_review_status: not_started
tags: [performance, cwv, lighthouse, testing, optimization]
archival_date: null

code_scout:
  status: pending
  scanned_at: null
  findings:
    reusable_patterns:
      - pattern: "lighthouse-ci"
        location: ".github/workflows/lighthouse.yml"
        strategy: "Reuse existing CI config"
      - pattern: "vercel-analytics"
        location: "web-app/app/layout.tsx"
        strategy: "Ensure analytics script is present"

pattern_research:
  status: completed
  researched_at: "2026-02-10T14:05:00+08:00"
  libraries_analyzed:
    - "next@15.5.6"
    - "google-lighthouse"
  patterns_injected: 2
  warnings_added: 1
---

# Story: Performance Testing - Core Web Vitals Validation

## User Story

**As a** developer
**I want** to test Core Web Vitals (LCP, FID, CLS) after SSG implementation with real CMS data
**So that** I validate performance improvements and ensure SEO requirements are met

## Context

We have implemented SSG to improve performance. Now we must prove it. We need to run Lighthouse tests against a realistic build (80+ amenities, multiple rooms, full descriptions) to ensure we meet our NFR targets.

**Epic Reference:** [Epic 14](../epics/epic-14.static-site-generation_isr_ready_2026-01-28.md)

## Acceptance Criteria

- [ ] **AC1**: LCP validated <2.0s (desktop), <2.5s (mobile)
- [ ] **AC2**: INP (formerly FID) <200ms (desktop/mobile)
- [ ] **AC3**: CLS <0.1 (all devices)
- [ ] **AC4**: Build time measured (<90s target for single hotel)
- [ ] **AC5**: CMS API response time measured and recorded
- [ ] **AC6**: SSG vs Runtime JSON performance comparison documented
- [ ] **AC7**: Bundle size verified (<150KB mobile, <250KB desktop)
- [ ] **AC8**: Performance verified with different languages (checking font loading impact)
- [ ] **AC9**: Slow 3G network simulation test passed
- [ ] **AC10**: Test report generated documenting findings

## Technical Considerations

- **Lighthouse CI**: Use `lhci` or similar for automation.
- **Real Data**: Do not test with "Lorem Ipsum". Use the real hotel data. If fonts are heavy for Thai/Arabic, this test will catch it.
- **Environment**: Test on a production-like build (`next build && next start`), not dev server.
- **Metric Update**: FID (First Input Delay) was replaced by INP (Interaction to Next Paint) as a Core Web Vital in March 2024. Next.js 15 optimizes for INP.

## Proposed Structure

### Test Scripts
```
web-app/
├── scripts/
│   └── test-performance.sh  # Orchestrates build and lighthouse run
└── lighthouserc.json        # Lighthouse configuration
```

## Pattern Research (CWV 2024+)

### Required Patterns

**INP Optimization:**
- Avoid long tasks on the main thread.
- Use `useTransition` for React state updates that trigger heavy UI changes (Server Actions are transitions by default).
- Breakdown long Tasks.

**Font Optimization (Next.js):**
Use `next/font` which is built-in.
```tsx
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
// Apply className={inter.className} to body
```
For multilingual support (Arabic/Thai), you likely need to load subsets or variable fonts correctly. Ensure distinct font loaders for RTL if needed, or variable fonts that cover many ranges.

**Image Optimization:**
Use `<Image />` component with `priority` for the LCP element (Hero image).
```tsx
<Image src={...} priority={true} alt="Hero" ... />
```
This is the #1 fix for LCP issues.

### Version Warnings
⚠️ **FID Deprecated**: Google Core Web Vitals replaced FID with INP. Ensure your Lighthouse config or dashboard is looking at INP.

## Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| Story 14.7: Hybrid Architecture | Internal | Pending |

## Out of Scope

- Optimization of the CMS API itself (we just measure it)

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Performance report saved to artifacts
- [ ] NFR targets met or deviations explained/accepted

---

## Agent Activity Log

### Creation
- **Agent**: story-creator-v2
- **Timestamp**: 2026-02-10T13:35:00+08:00
- **Notes**: Story created from Epic 14, Story 14.9 specification

### Update
- **Agent**: structure-agent-v2
- **Timestamp**: 2026-02-10T13:55:00+08:00
- **Notes**: Added structural analysis for performance testing scripts.

### Update
- **Agent**: pattern-researcher-v2
- **Timestamp**: 2026-02-10T14:05:00+08:00
- **Notes**: Injected INP (replacing FID) and Font/Image optimization patterns.
