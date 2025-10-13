# Epic 3: LLM Orchestration Engine - API Reference

> **Version:** 1.0  
> **Date:** 2025-01-19  
> **Target Audience:** Developers integrating with LLM services

## Quick Start

```typescript
import { GenerationWorkflow } from '@/langgraph/workflows/GenerationWorkflow';
import { HotelParameters } from '@/types/components';

// Initialize workflow
const workflow = new GenerationWorkflow();

// Define hotel parameters
const hotelParams: HotelParameters = {
  hotelName: 'Sunset Beach Resort',
  hotelType: 'resort',
  location: 'Maldives',
  vibe: 'modern',
  brandColors: {
    primary: '#ff6b35',
    secondary: '#004e89', 
    accent: '#ffa400'
  },
  customRequests: 'Focus on water activities and luxury amenities'
};

// Generate website
const result = await workflow.generateWebsite(hotelParams);
console.log(`Generated ${result.generatedFiles.length} files`);
console.log(`Total cost: $${result.qualityMetrics.totalCost}`);
```

## Core Services

### Cost Monitor

#### `CostMonitor`

**Purpose:** Real-time cost tracking and budget enforcement

```typescript
import { costMonitor } from '@/lib/cost-monitor';

// Set budget limits
costMonitor.setBudgets(
  dailyBudget: number,    // Daily budget limit
  sessionBudget: number,  // Session budget limit
  websiteBudget?: number  // Per-website budget limit
);

// Log LLM request
const cost = costMonitor.logRequest(
  provider: string,       // 'openrouter'
  model: string,         // Model identifier
  tokensUsed: {          // Token usage
    input: number,
    output: number
  },
  requestId: string      // Unique request ID
): number;

// Get model recommendation
const model = costMonitor.getRecommendedModel(
  step: 'hotelAnalysis' | 'componentSelection' | 'configGeneration' | 'qualityValidation',
  preferredModel: string
): string;

// Check budget status
const remaining = costMonitor.getStepBudgetRemaining(step);
const isActive = costMonitor.isEmergencyStopActive();

// Get detailed report
const report = costMonitor.getDetailedReport();
```

#### Cost Report Structure

```typescript
interface CostReport {
  sessionTotal: number;
  dailyTotal: number;
  websiteTotal: number;
  entries: CostEntry[];
  breakdown: Record<string, number>;
  budgetStatus: Record<string, {
    allocated: number;
    used: number;
    remaining: number;
  }>;
}
```

### LLM Service

#### `LLMService`

**Purpose:** Unified interface for all LLM operations

```typescript
import { llmService } from '@/lib/llm-service';

// Hotel analysis generation
const analysis = await llmService.generateHotelAnalysis(
  hotelData: Record<string, any>,
  config?: Partial<LLMConfig>
): Promise<LLMResponse>;

// Component selection generation
const selection = await llmService.generateComponentSelection(
  hotelAnalysis: Record<string, any>,
  availableComponents: Record<string, any>,
  config?: Partial<LLMConfig>
): Promise<LLMResponse>;

// Site configuration generation
const siteConfig = await llmService.generateSiteConfiguration(
  components: Record<string, any>,
  hotelData: Record<string, any>,
  config?: Partial<LLMConfig>
): Promise<LLMResponse>;

// Quality validation generation
const validation = await llmService.generateQualityValidation(
  generatedConfig: Record<string, any>,
  config?: Partial<LLMConfig>
): Promise<LLMResponse>;

// Generic text generation
const response = await llmService.generateText(
  prompt: string,
  config?: Partial<LLMConfig>
): Promise<LLMResponse>;

// Structured response generation
const structured = await llmService.generateStructured<T>(
  prompt: string,
  schema: any,
  config?: Partial<LLMConfig>
): Promise<LLMResponse & { structured: T }>;
```

#### LLM Configuration

```typescript
interface LLMConfig {
  model?: string;           // Model to use
  temperature?: number;     // 0.0 - 2.0 (default: 0.7)
  maxTokens?: number;      // Max response tokens (default: 1000)
  topP?: number;           // 0.0 - 1.0 (default: 1.0)
  frequencyPenalty?: number; // -2.0 - 2.0 (default: 0)
  presencePenalty?: number;  // -2.0 - 2.0 (default: 0)
}
```

#### LLM Response

```typescript
interface LLMResponse {
  content: string;         // Generated text
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;          // Model used
  requestId: string;      // Unique request ID
  cost: number;          // Request cost in USD
}
```

## Agents

### Input Analyzer Agent

#### `InputAnalyzerAgent`

**Purpose:** Analyzes hotel parameters for strategic insights

```typescript
import { InputAnalyzerAgent } from '@/langgraph/agents/InputAnalyzer';

const agent = new InputAnalyzerAgent();

const result = await agent.analyzeInput(
  hotelParameters: HotelParameters,
  generationId?: string
): Promise<InputAnalysisResult>;
```

#### Input Analysis Result

```typescript
interface InputAnalysisResult {
  hotelProfile: HotelProfile;
  designDirection: DesignDirection;
  componentRequirements: ComponentRequirements;
  wireframeRecommendations: string[];
  confidence: number; // 0.0 - 1.0
  metadata?: {
    generationId: string;
    processingTime: number;
    modelUsed: string;
    cost: number;
    tokensUsed: number;
    isFallback?: boolean;
  };
}

interface HotelProfile {
  category: 'luxury' | 'boutique' | 'business' | 'resort' | 'budget' | 'eco';
  target_audience: string[];
  unique_selling_points: string[];
  brand_personality: string[];
  competitive_positioning: string;
}

interface DesignDirection {
  aesthetic: string;
  color_psychology: string;
  typography_style: string;
  layout_preference: string;
  imagery_style: string;
}

interface ComponentRequirements {
  must_have_components: string[];
  recommended_components: string[];
  avoid_components: string[];
  special_features: string[];
}
```

### Component Selector Agent

#### `ComponentSelectorAgent`

**Purpose:** Selects optimal components based on hotel analysis

```typescript
import { ComponentSelectorAgent } from '@/langgraph/agents/ComponentSelector';

const agent = new ComponentSelectorAgent();

const result = await agent.selectComponents(
  analysis: InputAnalysisResult,
  generationId?: string
): Promise<ComponentSelectionResult>;
```

#### Component Selection Result

```typescript
interface ComponentSelectionResult {
  selectedComponents: ComponentConfig[];
  selectionReasoning: Record<string, string>;
  estimatedLoadTime: number;
  accessibilityScore: number; // 1-10
  totalConfidence: number; // 0.0 - 1.0
  metadata?: {
    generationId: string;
    processingTime: number;
    modelUsed: string;
    cost: number;
    tokensUsed: number;
  };
}

interface ComponentConfig {
  componentType: string;
  variant: string;
  props: Record<string, any>;
  content: ComponentContent;
  styling: ComponentStyling;
  position: {
    section: string;
    order: number;
  };
}

interface ComponentContent {
  heading?: string;
  subheading?: string;
  bodyText?: string;
  ctaText?: string;
  items?: any[];
}

interface ComponentStyling {
  colorScheme: string;
  spacing: string;
  alignment: string;
  animation?: string;
}
```

### Configuration Generator Agent

#### `ConfigurationGeneratorAgent`

**Purpose:** Generates complete website configuration and files

```typescript
import { ConfigurationGeneratorAgent } from '@/langgraph/agents/ConfigurationGenerator';

const agent = new ConfigurationGeneratorAgent();

const result = await agent.generateConfiguration(
  hotelData: HotelParameters,
  analysis: InputAnalysisResult,
  componentSelection: ComponentSelectionResult,
  generationId?: string
): Promise<ConfigurationResult>;
```

#### Configuration Result

```typescript
interface ConfigurationResult {
  websiteConfig: WebsiteConfig;
  generatedFiles: GeneratedFile[];
  buildTime: number;
  metadata?: {
    generationId: string;
    processingTime: number;
    modelUsed: string;
    cost: number;
    tokensUsed: number;
  };
}

interface WebsiteConfig {
  metadata: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
  };
  pages: PageConfig[];
  globalStyles: StyleConfig;
  components: ComponentConfig[];
  assets: AssetConfig[];
  deploymentConfig: DeploymentConfig;
  buildInstructions: string[];
}

interface GeneratedFile {
  path: string;
  content: string;
  type: 'component' | 'page' | 'config' | 'style';
  dependencies: string[];
}
```

## Workflow

### Generation Workflow

#### `GenerationWorkflow`

**Purpose:** Orchestrates the complete website generation process

```typescript
import { GenerationWorkflow } from '@/langgraph/workflows/GenerationWorkflow';

const workflow = new GenerationWorkflow();

// Generate complete website
const result = await workflow.generateWebsite(
  hotelParameters: HotelParameters
): Promise<GenerationOutput>;

// Get generation state (for monitoring)
const state = workflow.getGenerationState();

// Get cost report
const costReport = workflow.getCostReport();
```

#### Generation Output

```typescript
interface GenerationOutput {
  siteStructure: SiteStructure;
  generatedFiles: GeneratedFile[];
  deploymentConfig: DeploymentConfig;
  qualityMetrics: QualityMetrics;
}

interface SiteStructure {
  pages: PageStructure[];
  globalComponents: ComponentSelection[];
  designTokens: GeneratedDesignTokens;
}

interface QualityMetrics {
  lighthouseScore: number;      // 0-100
  accessibilityScore: number;   // 0-10
  performanceScore: number;     // 0-100
  seoScore: number;            // 0-100
  componentCount: number;
  generatedCSSLines: number;
  buildTime: number;           // milliseconds
  totalCost: number;           // USD
}
```

## Error Handling

### Error Types

```typescript
// Budget-related errors
class BudgetExceededError extends Error {
  constructor(currentCost: number, limit: number) {
    super(`Budget exceeded: $${currentCost} > $${limit}`);
  }
}

// Generation-related errors
class GenerationError extends Error {
  constructor(
    public step: WorkflowStep,
    public retryable: boolean,
    message: string
  ) {
    super(message);
  }
}

// LLM-related errors
class LLMError extends Error {
  constructor(
    public provider: string,
    public model: string,
    public requestId: string,
    message: string
  ) {
    super(message);
  }
}
```

### Error Recovery

```typescript
// Automatic retry with exponential backoff
try {
  const result = await llmService.generateText(prompt);
} catch (error) {
  if (error.retryable && retryCount < maxRetries) {
    await new Promise(resolve => 
      setTimeout(resolve, 1000 * Math.pow(2, retryCount))
    );
    // Retry with fallback model
    return generateWithFallback(prompt);
  }
  throw error;
}
```

## Configuration

### Environment Variables

```bash
# Required
OPENROUTER_API_KEY=your_openrouter_api_key

# Optional - Cost Management
MAX_GENERATION_COST=2.0          # Max cost per website
DAILY_BUDGET=5.0                 # Daily budget limit
SESSION_BUDGET=2.0               # Session budget limit

# Optional - Performance
GENERATION_TIMEOUT_MINUTES=30    # Max generation time
MAX_RETRIES=3                    # Max retry attempts
RETRY_DELAY_MS=1000             # Base retry delay

# Optional - Models
DEFAULT_MODEL=anthropic/claude-3-haiku
PRIMARY_MODEL=anthropic/claude-3.5-sonnet
FALLBACK_MODEL=openai/gpt-4o-mini

# Optional - Debugging
DEBUG_LLM_REQUESTS=false         # Log all requests
VERBOSE_COST_TRACKING=false      # Detailed cost logs
```

### Budget Configuration

```typescript
// Set custom budgets programmatically
costMonitor.setBudgets(
  5.0,  // Daily budget: $5.00
  2.0,  // Session budget: $2.00
  2.0   // Website budget: $2.00
);

// Configure step-specific budgets
const customAllocation = {
  hotelAnalysis: 0.60,      // $0.60 (30%)
  componentSelection: 0.80,  // $0.80 (40%)
  configGeneration: 0.40,   // $0.40 (20%)
  qualityValidation: 0.20   // $0.20 (10%)
};
```

## Monitoring

### Performance Metrics

```typescript
// Get generation metrics
const metrics = {
  totalTime: result.qualityMetrics.buildTime,
  stepTimings: workflow.getGenerationState().stepTimings,
  totalCost: result.qualityMetrics.totalCost,
  qualityScore: result.qualityMetrics.lighthouseScore
};

// Monitor cost accumulation
const costBreakdown = costMonitor.getDetailedReport();
console.log('Cost by model:', costBreakdown.breakdown);
console.log('Budget utilization:', costBreakdown.budgetStatus);
```

### Health Checks

```typescript
// Test LLM connectivity
const isConnected = await llmService.testConnection();

// Validate cost tracking
const testCost = costMonitor.estimateCost(1000, 'anthropic/claude-3-haiku');

// Check emergency stop status
const isStopped = costMonitor.isEmergencyStopActive();
```

## Best Practices

### Cost Optimization

```typescript
// 1. Use budget-aware model selection
const recommendedModel = costMonitor.getRecommendedModel(
  'componentSelection',
  'anthropic/claude-3.5-sonnet'
);

// 2. Set appropriate token limits
const config: LLMConfig = {
  model: recommendedModel,
  maxTokens: 1500,     // Limit response size
  temperature: 0.2     // Reduce randomness for consistency
};

// 3. Monitor costs in real-time
if (costMonitor.getWebsiteTotal() > 1.5) {
  console.warn('Approaching budget limit');
}
```

### Error Resilience

```typescript
// 1. Implement proper error handling
try {
  const result = await agent.analyzeInput(hotelParams);
} catch (error) {
  if (error instanceof BudgetExceededError) {
    // Handle budget overrun
    return fallbackAnalysis(hotelParams);
  }
  throw error; // Re-throw other errors
}

// 2. Use timeouts for long operations
const result = await Promise.race([
  workflow.generateWebsite(hotelParams),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Timeout')), 30 * 60 * 1000)
  )
]);
```

### Quality Assurance

```typescript
// 1. Validate outputs
if (result.qualityMetrics.lighthouseScore < 70) {
  console.warn('Quality score below threshold');
}

// 2. Check component count
if (componentSelection.selectedComponents.length > 10) {
  console.warn('Too many components selected');
}

// 3. Verify cost constraints
if (result.qualityMetrics.totalCost > 2.0) {
  throw new Error('Budget constraint violated');
}
```

## Troubleshooting

### Common Issues

**Issue: Budget Exceeded**
```typescript
// Solution: Check cost allocation and adjust model selection
const report = costMonitor.getDetailedReport();
console.log('Budget status:', report.budgetStatus);

// Use more cost-effective models
const config = { model: 'anthropic/claude-3-haiku' };
```

**Issue: Generation Timeout**
```typescript
// Solution: Reduce complexity or increase timeout
const workflow = new GenerationWorkflow();
workflow['timeoutMinutes'] = 45; // Increase to 45 minutes
```

**Issue: Low Quality Scores**
```typescript
// Solution: Use higher-quality models for critical steps
const config = { 
  model: 'anthropic/claude-3.5-sonnet',
  temperature: 0.1 // More deterministic
};
```

### Debug Mode

```typescript
// Enable verbose logging
process.env.DEBUG_LLM_REQUESTS = 'true';
process.env.VERBOSE_COST_TRACKING = 'true';

// Check generation state
const state = workflow.getGenerationState();
console.log('Current step:', state.currentStep);
console.log('Errors:', state.errors);
console.log('Cost breakdown:', state.stepCosts);
```

## Migration Guide

### From Previous Versions

**Cost Monitor Changes:**
```typescript
// Old API
costMonitor.setBudget(5.0);

// New API (Epic 3)
costMonitor.setBudgets(5.0, 2.0, 2.0); // daily, session, website
```

**Agent API Changes:**
```typescript
// Old API
await agent.analyze(params, trace);

// New API (Epic 3)
await agent.analyzeInput(params, generationId);
```

### Breaking Changes

- `setBudget()` replaced with `setBudgets()`
- Agent methods now require `generationId` parameter
- LLM responses include structured data field
- Cost tracking includes step-wise allocation
- Error handling includes retry mechanisms

## Support

### Documentation
- [Architecture Overview](./epic3-llm-integration-architecture.md)
- [Testing Guide](../src/tests/README.md)
- [Deployment Guide](./deployment.md)

### Contact
- **Epic Lead:** Development Team
- **Architecture Questions:** System Architecture Team
- **Cost Optimization:** Cost Management Team

---

*This API reference covers Epic 3 LLM Orchestration Engine v1.0. For the latest updates, check the project documentation.*