# ET Hotel AI - LLM-Driven Hotel Website Generator

Automated platform generating 10,000+ unique hotel websites at ~$2/site using LangGraph workflows and component-based architecture.

## Status

[![Chromatic](https://github.com/Dilidonka/et-llm-websites/actions/workflows/chromatic.yml/badge.svg)](https://www.chromatic.com/library?appId=697852f049be43181587e61e)

---

## Quick Start

```bash
# Install dependencies
cd web-app
npm install --legacy-peer-deps

# Run development server
npm run dev

# Run tests
npm test

# Run Storybook
npm run storybook
```

---

## Visual Testing with Chromatic

We use [Chromatic](https://www.chromatic.com/) for visual regression testing to catch unintended UI changes.

### Local Testing

```bash
# Set your project token
export CHROMATIC_PROJECT_TOKEN=chpt_739644bca754776

# Run Chromatic locally
cd web-app
npm run chromatic
```

### CI/CD

Visual tests run automatically on:
- Push to `Epic-*` branches (including Epic-1)
- Pull requests to `main`

### Reviewing Changes

1. Check the **Chromatic** link in GitHub Actions or PR checks
2. Review visual changes in the Chromatic UI
3. Accept or deny changes
4. Merge PR once approved

### Chromatic Configuration

- **Project**: [View Library](https://www.chromatic.com/library?appId=697852f049be43181587e61e)
- **Baseline Strategy**: See [docs/chromatic-baseline-strategy.md](docs/chromatic-baseline-strategy.md)
- **Snapshot Count**: ~88 snapshots per build (well within free tier)

---

## Project Structure

```
et-llm-websites/
├── web-app/               # Next.js 15 reference implementation
│   ├── app/              # App Router
│   ├── components/       # React components (4-tier system)
│   ├── stories/          # Storybook stories
│   └── tests/            # Component and integration tests
├── docs/                 # Project documentation
├── .github/              # GitHub Actions workflows
└── scripts/              # Build and utility scripts
```

---

## Documentation

- [Project Context](docs/project-context/) - Architecture, standards, and terminology
- [Epic Documentation](docs/epics/) - Feature epic definitions
- [Chromatic Strategy](docs/chromatic-baseline-strategy.md) - Visual testing baseline strategy
- [CLAUDE.md](CLAUDE.md) - AI agent instructions and project context

---

## Development

### Prerequisites

- Node.js 20+
- npm or yarn

### Setup

```bash
# Clone repository
git clone https://github.com/Dilidonka/et-llm-websites.git
cd et-llm-websites/web-app

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Build for production |
| `npm test` | Run Jest tests |
| `npm run storybook` | Start Storybook |
| `npm run build-storybook` | Build Storybook static |
| `npm run chromatic` | Run Chromatic visual tests |

---

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI**: React 19, Tailwind CSS 4
- **Components**: Radix UI, shadcn/ui patterns
- **Testing**: Jest, React Testing Library, Chromatic
- **AI/ML**: LangGraph, LangChain, Langfuse

---

## License

[Your License Here]

---

*Generated for ET Hotel AI Project - Epic 12: Visual Excellence & Design System*
