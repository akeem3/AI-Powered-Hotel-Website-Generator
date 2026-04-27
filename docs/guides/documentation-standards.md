# Documentation Standards

## Overview

This document defines the documentation standards for the hotel website generation system.

## Documentation Principles

### 1. Documentation for LLMs
- Clear, structured format
- Heavy use of examples
- Explicit typing and schemas
- Minimal ambiguity

### 2. Living Documentation
- Docs are version controlled
- Updated with code changes
- Reviewed in PRs
- Audited regularly

### 3. Multi-Audience Approach
- **LLM Agents**: Detailed specs, examples, patterns
- **Developers**: Quick reference, API docs
- **Stakeholders**: High-level overviews, progress tracking

## Document Types

### Architecture Docs (`/docs/architecture/`)
- System design decisions
- Technical standards
- Integration patterns
- Trade-off analysis

### Component Docs (`/docs/architecture/` and `/docs/guides/`)
- Component API reference
- Usage examples
- Variant documentation
- Integration guides

### Process Docs (`/docs/prompts/`)
- Agent prompts
- Workflow definitions
- Validation checklists
- Troubleshooting guides

### Research Docs (`/docs/architecture/research/`)
- Technical research
- Best practices analysis
- Tool evaluation
- Proof of concepts

## Documentation Standards

### Markdown Format
- Use GitHub Flavored Markdown
- Include table of contents for long docs
- Use semantic headings (one H1 per document)
- Include code examples with syntax highlighting

### Cross-References
- Use absolute paths: `/docs/path/to/file.md`
- Include descriptive link text
- Validate references in CI
- Update references when moving files

### Code Examples
- Show, don't just tell
- Include real-world usage
- Comment complex logic
- Test all examples

## Template Structure

```markdown
# Title

## Overview
[2-3 sentence summary]

## Purpose
[Why this exists, what problem it solves]

## Implementation
[Detailed technical information]

## Examples
[Code examples, usage patterns]

## Related Documentation
- [Link 1](./path/to/file.md)
- [Link 2](./path/to/file.md)
```

## Related Documentation
- [Coding Standards](./coding-standards.md)
- [Project Context - Shared](../../project-context/shared/README.md)
