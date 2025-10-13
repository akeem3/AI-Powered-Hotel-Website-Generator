# Tech Stack: LLM-Driven Hotel Website Generator

> **Version:** 1.0  
> **Last Updated:** 2025-01-19  
> **Architecture:** Modern, scalable, LLM-integrated

## Overview

This document defines the complete technology stack for the LLM-Driven Hotel Website Generator platform, including all dependencies, tools, and infrastructure components.

## Core Technologies

### Frontend Stack
```json
{
  "framework": "Next.js 14+",
  "language": "TypeScript 5.0+",
  "styling": "Tailwind CSS 3.4+",
  "ui-components": "Radix UI + Custom Components",
  "state-management": "React Query + Zustand",
  "forms": "React Hook Form + Zod validation"
}
```

### LLM Orchestration Stack
```json
{
  "workflow-engine": "LangGraph 0.2+",
  "observability": "LangFuse 2.0+",
  "llm-gateway": "OpenRouter API",
  "prompt-management": "LangChain 0.3+",
  "cost-tracking": "LangFuse + Custom metrics"
}
```

### Backend Integration Stack
```json
{
  "cms": "Directus 10.0+",
  "booking-api": "Effective Tours API",
  "database": "PostgreSQL 16+",
  "api-client": "GraphQL + REST",
  "authentication": "Directus Auth + JWT"
}
```

### Infrastructure Stack
```json
{
  "hosting": "CloudFlare Pages",
  "storage": "BackBlaze B2",
  "cdn": "CloudFlare CDN",
  "generation-platform": "Vercel/Railway",
  "monitoring": "Sentry + LangFuse",
  "analytics": "Vercel Analytics"
}
```

## Detailed Technology Breakdown

### Frontend Dependencies

#### Core Next.js Setup
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0"
  }
}
```

#### Styling & UI
```json
{
  "dependencies": {
    "tailwindcss": "^3.4.0",
    "@tailwindcss/typography": "^0.5.10",
    "@tailwindcss/forms": "^0.5.7",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  }
}
```

#### Data Fetching & State
```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0",
    "axios": "^1.6.0",
    "graphql": "^16.8.0",
    "graphql-request": "^6.1.0"
  }
}
```

#### Forms & Validation
```json
{
  "dependencies": {
    "react-hook-form": "^7.47.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0"
  }
}
```

### LLM Integration Dependencies

#### LangGraph & LangChain
```json
{
  "dependencies": {
    "@langchain/langgraph": "^0.2.0",
    "@langchain/core": "^0.3.0",
    "@langchain/openai": "^0.3.0",
    "@langchain/anthropic": "^0.3.0",
    "langfuse": "^2.0.0",
    "langfuse-langchain": "^2.0.0"
  }
}
```

#### OpenRouter Integration
```json
{
  "dependencies": {
    "openrouter-sdk": "^1.0.0",
    "dotenv": "^16.3.0"
  }
}
```

### Backend Integration Dependencies

#### Directus CMS
```json
{
  "dependencies": {
    "@directus/sdk": "^12.0.0",
    "@directus/types": "^12.0.0"
  }
}
```

#### Effective Tours API
```json
{
  "dependencies": {
    "effective-tours-sdk": "^1.0.0",
    "date-fns": "^2.30.0"
  }
}
```

### Development Dependencies

#### Build Tools
```json
{
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "prettier": "^3.0.0",
    "prettier-plugin-tailwindcss": "^0.5.6"
  }
}
```

#### Testing Framework
```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "@types/jest": "^29.5.0",
    "ts-jest": "^29.1.0"
  }
}
```

#### Testing Configuration Patterns
```typescript
// Jest configurations for different test types
{
  "jest.config.js": "Main Next.js Jest configuration with jsdom environment",
  "jest.config.workflow.js": "LangGraph workflow tests with timeout handling", 
  "jest.config.single.js": "Individual test execution configuration",
  "jest.config.simple.js": "Lightweight tests without complex mocking"
}

// Critical Jest Configuration Requirements
{
  "testEnvironment": "jest-environment-jsdom",
  "testTimeout": 10000,
  "setupFilesAfterEnv": ["<rootDir>/jest.setup.js"],
  "moduleNameMapper": {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  "testPathIgnorePatterns": [
    "/node_modules/",
    "/.next/",
    "/.cursor-server/",
    "/.vscode-server/"
  ]
}
```

#### LangGraph Testing Patterns
```typescript
// Prototype-based mocking for LangGraph agents
const { InputAnalyzerAgent } = require('@/langgraph/agents/InputAnalyzer');
InputAnalyzerAgent.prototype.analyzeInput = jest.fn().mockResolvedValue(mockData);

// Cost monitor state management in tests
costMonitor.reset(); // Resets costs AND deactivates emergency stops
costMonitor.activateEmergencyStop(); // Must be called after reset

// LLM service mocking pattern
const { llmService } = require('@/lib/llm-service');
llmService.generateQualityValidation = jest.fn().mockResolvedValue({
  structured: mockResult,
  cost: 0.1,
  usage: { totalTokens: 300 }
});
```

#### Test Environment State Management
```typescript
// Required beforeEach setup for LangGraph tests
beforeEach(() => {
  jest.clearAllMocks();
  costMonitor.reset(); // Clears costs and emergency stops
  
  // Set up default mock responses
  mockInputAnalyzer.analyzeInput.mockResolvedValue(defaultAnalysis);
  mockComponentSelector.selectComponents.mockResolvedValue(defaultSelection);
  mockConfigurationGenerator.generateConfiguration.mockResolvedValue(defaultConfig);
});
```

## Infrastructure Configuration

### CloudFlare Pages Setup
```yaml
# wrangler.toml
name = "hotel-generator"
compatibility_date = "2023-12-01"
pages_build_output_dir = "out"

[env.production]
vars = { NODE_ENV = "production" }

[env.staging]
vars = { NODE_ENV = "staging" }
```

### BackBlaze B2 Configuration
```typescript
// lib/storage.ts
interface StorageConfig {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
}

const storageConfig: StorageConfig = {
  endpoint: process.env.B2_ENDPOINT!,
  region: process.env.B2_REGION!,
  accessKeyId: process.env.B2_ACCESS_KEY_ID!,
  secretAccessKey: process.env.B2_SECRET_ACCESS_KEY!,
  bucket: process.env.B2_BUCKET_NAME!,
};
```

### LangFuse Configuration
```typescript
// lib/langfuse.ts
import { Langfuse } from "langfuse";

export const langfuse = new Langfuse({
  secretKey: process.env.LANGFUSE_SECRET_KEY!,
  publicKey: process.env.LANGFUSE_PUBLIC_KEY!,
  baseUrl: process.env.LANGFUSE_BASE_URL!,
});
```

### OpenRouter Configuration
```typescript
// lib/openrouter.ts
import OpenRouter from "openrouter-sdk";

export const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
  appName: "Hotel Generator",
  siteName: process.env.SITE_NAME!,
});
```

## Environment Variables

### Required Environment Variables
```bash
# LLM Services
OPENROUTER_API_KEY=your_openrouter_key
LANGFUSE_SECRET_KEY=your_langfuse_secret
LANGFUSE_PUBLIC_KEY=your_langfuse_public
LANGFUSE_BASE_URL=https://cloud.langfuse.com

# Backend Services
DIRECTUS_URL=https://your-directus-instance.com
DIRECTUS_TOKEN=your_directus_token
EFFECTIVE_TOURS_API_KEY=your_et_api_key
EFFECTIVE_TOURS_BASE_URL=https://api.effective-tours.com

# Storage
B2_ENDPOINT=s3.us-west-002.backblazeb2.com
B2_REGION=us-west-002
B2_ACCESS_KEY_ID=your_b2_key_id
B2_SECRET_ACCESS_KEY=your_b2_secret
B2_BUCKET_NAME=hotel-generator-assets

# CloudFlare
CLOUDFLARE_API_TOKEN=your_cf_token
CLOUDFLARE_ZONE_ID=your_zone_id

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
SITE_NAME=Hotel Generator
```

## Build Configuration

### Next.js Configuration
```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['your-directus-instance.com', 'backblaze-bucket.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async rewrites() {
    return [
      {
        source: '/api/directus/:path*',
        destination: `${process.env.DIRECTUS_URL}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
```

### Tailwind Configuration
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
      },
      fontFamily: {
        'h1': 'var(--font-h1)',
        'h2': 'var(--font-h2)',
        'body': 'var(--font-body)',
      },
      spacing: {
        'sp-1': '0.25rem',
        'sp-2': '0.5rem',
        'sp-3': '0.75rem',
        'sp-4': '1rem',
        'sp-5': '1.25rem',
        'sp-6': '1.5rem',
        'sp-7': '1.75rem',
        'sp-8': '2rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};

export default config;
```

## Testing Architecture

### Test Organization Strategy
```
src/tests/
├── integration/          # End-to-end workflow tests
├── langgraph/
│   ├── agents/          # Individual agent unit tests
│   └── workflows/       # Multi-agent workflow tests
├── lib/                 # Library and utility tests
└── epic3-integration.ts # Epic-specific integration tests
```

### Jest Configuration Files
```typescript
// jest.config.js - Main configuration
const nextJest = require('next/jest');
const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testTimeout: 10000,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  // Critical: Prevent Jest from scanning external directories
  roots: ['<rootDir>/src'],
  testPathIgnorePatterns: ['/node_modules/', '/.cursor-server/'],
  resetMocks: true,
  clearMocks: true
};
```

### LangGraph Agent Testing Patterns
```typescript
// CRITICAL: Use prototype mocking for class-based agents
const { InputAnalyzerAgent } = require('@/langgraph/agents/InputAnalyzer');
InputAnalyzerAgent.prototype.analyzeInput = jest.fn().mockResolvedValue({
  hotelProfile: { category: 'resort' },
  confidence: 0.8,
  metadata: { cost: 0.5 }
});

// Cost monitor testing requirements
beforeEach(() => {
  costMonitor.reset(); // MUST reset between tests - clears emergency stops
});

// Emergency stop testing pattern
InputAnalyzerAgent.prototype.analyzeInput = jest.fn().mockImplementation(() => {
  costMonitor.activateEmergencyStop(); // Activate after reset
  return Promise.resolve(mockData);
});
```

### Error Testing Patterns
```typescript
// Test workflow error states by returning null configurations
ConfigurationGeneratorAgent.prototype.generateConfiguration = jest.fn()
  .mockResolvedValue(null); // Triggers 'Configuration required for validation'

// Test specific workflow step failures
mockInputAnalyzer.analyzeInput.mockResolvedValue(null); 
// Triggers 'Analysis required for component selection'
```

### Test Environment Requirements
```bash
# Required for complex LangGraph workflow testing
ENABLE_LIVE_API_TESTING=true  # For integration tests with real APIs
JEST_TIMEOUT=120000           # Extended timeout for LLM operations
```

## Performance Optimizations

### Bundle Analysis
```json
{
  "scripts": {
    "analyze": "cross-env ANALYZE=true next build",
    "build": "next build",
    "dev": "next dev",
    "start": "next start"
  },
  "devDependencies": {
    "@next/bundle-analyzer": "^14.0.0",
    "cross-env": "^7.0.3"
  }
}
```

### Code Splitting Strategy
```typescript
// Dynamic imports for heavy components
const BookingCalendar = dynamic(() => import('./BookingCalendar'), {
  loading: () => <CalendarSkeleton />,
  ssr: false
});

const GallerySection = dynamic(() => import('./GallerySection'), {
  loading: () => <GallerySkeleton />
});
```

## Security Configuration

### Content Security Policy
```typescript
// next.config.js security headers
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self';
    `.replace(/\s{2,}/g, ' ').trim()
  }
];
```

## Monitoring & Analytics

### Error Tracking
```typescript
// lib/sentry.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

### Performance Monitoring
```typescript
// lib/analytics.ts
import { Analytics } from '@vercel/analytics/react';

export function AnalyticsProvider() {
  return <Analytics />;
}
```

## Version Management

### Package.json
```json
{
  "name": "hotel-generator",
  "version": "1.0.0",
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

## Testing Best Practices

### Critical Testing Requirements

1. **Always use prototype mocking** for LangGraph agents:
   ```typescript
   // ✅ CORRECT
   InputAnalyzerAgent.prototype.analyzeInput = jest.fn().mockResolvedValue(data);
   
   // ❌ WRONG
   mockInputAnalyzer.analyzeInput.mockResolvedValue(data);
   ```

2. **Reset cost monitor between tests**:
   ```typescript
   beforeEach(() => {
     costMonitor.reset(); // Clears costs AND emergency stops
   });
   ```

3. **Test emergency stops after workflow reset**:
   ```typescript
   // Emergency stop must be activated AFTER costMonitor.reset()
   InputAnalyzerAgent.prototype.analyzeInput = jest.fn().mockImplementation(() => {
     costMonitor.activateEmergencyStop();
     return Promise.resolve(data);
   });
   ```

4. **Handle floating-point precision in cost calculations**:
   ```typescript
   expect(result.totalCost).toBeCloseTo(1.5, 4); // Use toBeCloseTo for costs
   ```

5. **Mock LLM services completely**:
   ```typescript
   llmService.generateQualityValidation = jest.fn().mockResolvedValue({
     structured: mockValidation,
     cost: 0.1,
     usage: { totalTokens: 300 },
     model: 'anthropic/claude-3-haiku'
   });
   ```

### Error Message Mapping
```typescript
// Current workflow error messages for test expectations:
{
  "Analysis required for component selection": "state.analysis is null",
  "Configuration required for validation": "state.configuration is null in quality step", 
  "Configuration required to build generation output": "state.configuration is null in buildGenerationOutput",
  "Generation stopped due to budget overrun": "Emergency stop activated"
}
```

---

*This tech stack is optimized for scalability, performance, and maintainability of the LLM-Driven Hotel Website Generator platform, with comprehensive testing patterns for LangGraph workflows.*