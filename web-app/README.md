# Sterling Executive Hotel Website

> A modern, responsive hotel website built with Next.js 14+, TypeScript, and Tailwind CSS, serving as the reference implementation for the LLM-Driven Hotel Website Generator platform.

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Installation & Setup](#installation--setup)
- [Development Instructions](#development-instructions)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [BMAD Method Integration](#bmad-method-integration)

## Project Overview

The Sterling Executive Hotel Website is a sophisticated reference implementation that demonstrates modern web development best practices for hotel websites. This project serves as both a functional hotel website and the primary reference pattern for our LLM-driven website generation platform.

### Key Features

- **Modern Architecture**: Next.js 14+ with App Router for optimal performance
- **Type Safety**: TypeScript 5.0+ in strict mode throughout the codebase
- **Responsive Design**: Mobile-first approach with Tailwind CSS custom branding
- **Component-Based**: Shadcn/ui primitives with custom hotel-specific components
- **Test-Driven**: Comprehensive test suite with Jest and React Testing Library
- **Accessibility**: WCAG 2.1 AA compliant components
- **Performance Optimized**: Core Web Vitals compliant with Lighthouse scores >90

## Architecture

### Project Structure

```
et-llm-websites/
├── web-app/                    # Main application directory
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx        # Root layout component
│   │   ├── page.tsx          # Homepage
│   │   ├── globals.css       # Global styles
│   │   ├── rooms/            # Rooms pages
│   │   └── contact/          # Contact page
│   ├── components/           # Component library
│   │   ├── ui/              # Shadcn/ui primitives
│   │   ├── blocks/          # Hotel-specific blocks
│   │   ├── sections/        # Page sections
│   │   └── pages/           # Page layouts
│   ├── lib/                 # Utilities and configurations
│   ├── hooks/               # Custom React hooks
│   ├── tests/               # Test files
│   ├── types/               # TypeScript type definitions
│   └── public/              # Static assets
├── docs/                    # Project documentation
├── .bmad-core/             # BMAD framework configuration
└── docs/stories/           # User stories and development tracking
```

### Component Hierarchy

Our architecture follows a 4-tier component system:

1. **Primitives** - Shadcn/ui base components (Button, Input, Card, etc.)
2. **Blocks** - Hotel-specific components (RoomCard, BookingWidget, TestimonialCard)
3. **Sections** - Page sections (HeroSection, GallerySection, BookingSection)
4. **Pages** - Complete page compositions

### BMAD Integration

This project utilizes the **BMAD-METHOD™ (Breakthrough Method of Agile AI-driven Development)** framework:

- **Agents**: Specialized AI agents for development, testing, and documentation
- **Stories**: User stories managed through the SM agent
- **Documentation**: Automated generation and maintenance of project docs
- **Quality Assurance**: QA agent integration for code review and validation

## Tech Stack

### Frontend

- **Framework**: Next.js 15.5.6 with App Router
- **Language**: TypeScript 5.0+ (strict mode enabled)
- **Styling**: Tailwind CSS 4.1.15 with custom Sterling Executive branding
- **UI Components**: Shadcn/ui component library
- **Icons**: Lucide React icon library
- **State Management**: React hooks and context API

### Development Tools

- **Package Manager**: npm
- **Code Formatting**: Prettier with ESLint integration
- **Git Hooks**: Husky for pre-commit validation
- **Linting**: ESLint with Next.js and TypeScript configurations

### Testing

- **Testing Framework**: Jest 30.2.0
- **React Testing**: React Testing Library 16.3.0
- **Test Environment**: jsdom
- **Coverage**: Built-in Jest coverage reporting

### Build & Deployment

- **Build Tool**: Next.js built-in optimization
- **Static Export**: Capability for static site generation
- **Deployment**: Ready for Vercel, Netlify, or similar platforms

## Installation & Setup

### Prerequisites

- Node.js 18.0 or higher
- npm 9.0 or higher
- Git

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd et-llm-websites
   ```

2. **Install dependencies**

   ```bash
   cd web-app
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Verify installation**
   - Open [http://localhost:3000](http://localhost:3000) in your browser
   - Run tests to verify setup: `npm test`

## Development Instructions

### Development Workflow

1. **Start Development Server**

   ```bash
   cd web-app
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

2. **Run Tests**

   ```bash
   # Run all tests once
   npm test

   # Run tests in watch mode
   npm run test:watch
   ```

3. **Code Quality Checks**

   ```bash
   # Run ESLint
   npm run lint

   # Fix formatting issues
   npm run lint:fix
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

### BMAD Development Process

This project follows the BMAD development methodology:

1. **Story Creation**: Use SM agent to create user stories from `docs/epics/`
2. **Development**: Use Dev agent to implement stories with TDD approach
3. **Quality Review**: QA agent validates and improves implementation
4. **Documentation**: Automated documentation updates throughout process

### Component Development Guidelines

- Use TypeScript strict mode for all components
- Follow the 4-tier component hierarchy
- Implement responsive design with mobile-first approach
- Write tests before implementing features (TDD)
- Use semantic HTML5 elements for accessibility
- Follow established naming conventions and patterns

### Custom Styling

The Sterling Executive brand uses a custom Tailwind palette:

```css
/* Custom design tokens in globals.css */
@layer theme {
  :root {
    --brand-primary-val: oklch(0.346 0.074 256);   /* Sterling Executive blue */
    --brand-secondary-val: oklch(0.748 0.099 86.1); /* Gold accent */
    /* Full palette auto-generated via useHotelTheme + culori */
  }
}
```

## Testing

This project implements comprehensive testing infrastructure as part of **Story 1.7: Comprehensive Testing Infrastructure**.

### Quick Start

```bash
# Run all tests (main configuration)
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode for development
npm run test:watch

# Run CI-ready tests with coverage
npm run test:ci
```

### Test Configurations

```bash
# Simple configuration (lightweight tests)
npm run test:simple

# Workflow configuration (LangGraph tests)
npm run test:workflow

# Contract validation tests only
npm run test:contracts
```

### Test Structure

```
tests/
├── components/           # Component unit tests
│   ├── ui/              # Primitive UI components
│   ├── blocks/          # Hotel-specific block components
│   └── sections/        # Page section components
├── integration/         # Integration and E2E tests
│   ├── user-journeys.test.tsx
│   └── error-handling.test.tsx
├── contracts/           # ZOD contract validation tests
├── performance/         # Performance benchmark tests
├── accessibility/       # Accessibility (axe-core) tests
├── responsive/          # Responsive design tests
├── utils/              # Test utilities and helpers
│   ├── test-utils.tsx   # Custom render functions
│   └── factories/       # Mock data factories
└── helpers/            # Test helper functions
```

### Coverage Requirements

- **Statements:** 80%
- **Branches:** 70%
- **Functions:** 70%
- **Lines:** 80%

### Performance Budgets

- **Primitive Components:** <10ms
- **Block Components:** <30ms
- **Section Components:** <50ms
- **Page Components:** <100ms

### Testing Standards

✅ **Contract-First Testing:** All components validated against ZOD schemas
✅ **TDD Workflow:** Red-Green-Refactor cycle implemented
✅ **Accessibility Testing:** axe-core integration
✅ **Performance Testing:** Core Web Vitals monitoring
✅ **Integration Testing:** Complete user journey coverage

### Running Specific Tests

```bash
# Component tests
npm test -- --testPathPattern="HeroSection"
npm test -- --testPathPattern="RoomCard"

# Integration tests
npm test -- --testPathPattern="integration"

# Contract tests
npm run test:contracts

# Performance tests
npm test -- --testPathPattern="performance"
```

### Documentation

- [Complete Testing Guide](./docs/testing/README.md)
- [Testing Checklist](./docs/testing/checklist.md)
- [Performance Guidelines](./docs/performance/README.md)
- [Contract Testing Guide](./docs/contracts/README.md)

### Testing Standards

- **Test-Driven Development**: Write tests before implementation
- **Coverage Requirements**: Minimum 80% coverage for new features
- **Component Testing**: Test all component variants and states
- **Accessibility Testing**: Verify WCAG compliance for interactive elements
- **Snapshot Testing**: Use for visual regression prevention

### Test Example

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });
});
```

## Deployment

### Production Build

```bash
cd web-app
npm run build
npm start
```

### Static Export (Optional)

For static hosting platforms:

```bash
# Configure next.config.ts for static export
npm run build
# Output will be in /out directory
```

### Environment Variables

Required environment variables for production:

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Custom configuration variables as needed
NEXT_PUBLIC_HOTEL_NAME="Sterling Executive"
```

### Deployment Platforms

This project is optimized for:

- **Vercel**: Zero-config deployment
- **Netlify**: Static site hosting
- **Cloudflare Pages**: Edge-optimized hosting
- **AWS Amplify**: Full-stack hosting

## Contributing

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow BMAD process**: Use agents for story creation and implementation
4. **Write tests**: Ensure comprehensive test coverage
5. **Run quality checks**: `npm test && npm run lint`
6. **Commit changes**: Use conventional commit format
7. **Push branch**: `git push origin feature/amazing-feature`
8. **Create Pull Request**

### Commit Message Format

Follow conventional commits:

```
feat(components): add new RoomCard component
fix(booking): resolve date picker validation issue
docs(readme): update installation instructions
test(booking): add comprehensive booking widget tests
refactor(navigation): improve mobile menu performance
```

### Code Review Process

- All code must pass automated tests
- TypeScript strict mode compliance required
- Accessibility standards must be met
- Performance impact should be considered
- Documentation updates for new features

## License

This project is proprietary software owned by Effective Tours. All rights reserved.

© 2025 Effective Tours. Unauthorized copying, distribution, or modification of this project is strictly prohibited.

## BMAD Method Integration

### Available Agents

This project integrates with the BMAD framework through specialized agents:

- **PM Agent**: Product management and PRD creation
- **Architect Agent**: System design and technical specifications
- **Dev Agent**: Code implementation and testing
- **QA Agent**: Quality assurance and code review
- **SM Agent**: Story creation and sprint planning
- **UX Expert Agent**: User experience design and validation

### Agent Commands

```bash
# Activate BMAD agents
/BMad:agents:pm           # Product management
/BMad:agents:dev          # Development implementation
/BMad:agents:qa           # Quality assurance
/BMad:agents:sm           # Story creation
```

### Documentation Structure

BMAD maintains automated documentation:

- **`docs/epics/`**: Epic definitions for major features
- **`docs/stories/`**: User stories with implementation tracking
- **`docs/research/`**: Market research and analysis
- **`docs/qa/`**: Quality assurance reports and findings

### Development Tracking

Each story includes:

- **Dev Agent Record**: Implementation progress and notes
- **QA Results**: Quality assessment and recommendations
- **Change Log**: Detailed modification history
- **File List**: Complete inventory of changed files

---

**Project Status**: Active Development
**Last Updated**: 2025-10-20
**Version**: 1.0.0
**Framework**: BMAD-METHOD™ v4

For questions or support, please refer to the project documentation or contact the development team.
