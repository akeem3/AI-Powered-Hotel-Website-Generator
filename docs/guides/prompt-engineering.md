# Prompt Engineering Guidelines

## Overview

This document provides guidelines and best practices for engineering prompts used in LLM-powered component generation.

## Core Principles

### 1. Clarity and Specificity
- Use precise, unambiguous language
- Specify exact output format requirements
- Define boundaries and constraints explicitly
- Provide concrete examples

### 2. Context Provision
- Include relevant background information
- Provide reference implementations
- Share design system guidelines
- Include success criteria

### 3. Structured Communication
- Use consistent prompt structure
- Organize information hierarchically
- Separate instructions from examples
- Use formatting for emphasis

## Prompt Structure Template

```markdown
## Role
You are an expert [role] specialized in [domain].

## Task
[Clear description of what needs to be done]

## Context
- Background information
- Relevant constraints
- Design system references
- Component specifications

## Input Format
[Description of input data structure]

## Output Format
[Detailed specification of expected output]

## Examples
### Example 1
Input: [example input]
Output: [example output]

### Example 2
Input: [example input]
Output: [example output]

## Constraints
- [Constraint 1]
- [Constraint 2]
- [Constraint 3]

## Success Criteria
- [Criteria 1]
- [Criteria 2]
- [Criteria 3]

## Quality Requirements
- [Quality requirement 1]
- [Quality requirement 2]
```

## Component Generation Prompts

### Selector Agent Prompt

```markdown
You are a component selection specialist for hotel websites.

## Task
Select the appropriate components for a hotel homepage based on the provided requirements and theme.

## Available Components
- HeroSection: Large hero image with headline and CTA
- RoomCards: Display available room types
- BookingWidget: Date picker and booking form
- ImageGallery: Photo gallery of hotel amenities
- Testimonials: Guest reviews and ratings
- Navigation: Site navigation menu
- ContactForm: Contact information and form

## Selection Criteria
1. Must include: HeroSection, Navigation, BookingWidget
2. Theme-appropriate: Match hotel category (luxury, budget, boutique, etc.)
3. User journey: Guide visitors from discovery to booking
4. Content type: Showcase hotel's unique selling points

## Output Format
Return JSON array of selected components with configurations:
```json
{
  "components": [
    {
      "type": "HeroSection",
      "priority": 1,
      "config": { /* component-specific config */ }
    }
  ]
}
```

## Examples
### Luxury Hotel
Input: { "theme": "luxury", "features": ["spa", "restaurant", "concierge"] }
Output: Selects HeroSection, RoomCards, ImageGallery, Testimonials, BookingWidget

### Budget Hotel
Input: { "theme": "budget", "features": ["free-parking", "wifi"] }
Output: Selects HeroSection, RoomCards, BookingWidget, ContactForm
```

### Styling Agent Prompt

```markdown
You are a styling specialist applying hotel themes to React components.

## Task
Apply the provided design tokens and theme to generate Tailwind CSS classes for the component.

## Design System
- Use semantic color tokens: `theme.colors.primary[500]`, `theme.colors.neutral[900]`
- Follow spacing scale: `xs`, `sm`, `md`, `lg`, `xl`
- Use typography scale: `xs`, `sm`, `base`, `lg`, `xl`, `2xl`, `3xl`
- All interactive elements need hover and focus states

## Component: Button
### Variants
- primary: Main action, uses primary color
- secondary: Secondary action, uses neutral color
- outline: Bordered variant
- text: Text-only variant

### Sizes
- sm: Small (compact, mobile-friendly)
- md: Medium (default)
- lg: Large (prominent CTAs)

## Output Format
Return complete React component with Tailwind classes:
```tsx
export function Button({ variant, size, children }) {
  return (
    <button className="[TAILWIND CLASSES]">
      {children}
    </button>
  );
}
```

## Theme Variables
The component will have access to `useHotelTheme()` hook which provides:
- `theme.colors.primary[50-900]`
- `theme.colors.neutral[50-900]`
- `theme.spacing.{xs,sm,md,lg,xl}`
- `theme.typography.{fontDisplay,fontSans}`

## Examples
### Primary Button, Medium
```tsx
<button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
  Book Now
</button>
```

### Secondary Button, Large
```tsx
<button className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">
  Learn More
</button>
```

## Quality Requirements
- All colors use design tokens (no hardcoded colors)
- Proper contrast ratios (WCAG AA: 4.5:1)
- Touch targets minimum 44x44px
- Smooth transitions (150-200ms)
- Accessible focus indicators (2px ring)
```

## Iteration and Refinement

### First Prompt Iteration
Focus on getting basic functionality working.
- Accept first complete output
- Document any issues

### Second Iteration
Address specific issues from first attempt.
- Provide feedback on what worked
- Specify what needs improvement
- Add missing constraints

### Third+ Iterations
Polish and optimize.
- Fine-tune output quality
- Add edge case handling
- Improve consistency

## Common Pitfalls

### 1. Vague Instructions
❌ "Make it look good"
✅ "Use primary color for background, white text, rounded-lg corners, padding-md"

### 2. Missing Examples
❌ Just describing expected output
✅ Providing 2-3 concrete examples of expected output

### 3. Overloading Information
❌ Providing entire design system in one prompt
✅ Providing only relevant tokens for the specific component

### 4. Inconsistent Format
❌ Changing output format between iterations
✅ Maintaining consistent output structure throughout

### 5. Missing Validation
❌ Not specifying how to validate output
✅ Including validation criteria and examples

## Prompt Testing

### Test Framework
```typescript
interface PromptTest {
  name: string;
  prompt: string;
  inputs: TestCase[];
  expectedOutputs: ExpectedOutput[];
  evaluationCriteria: string[];
}

async function testPrompt(test: PromptTest) {
  const results = await Promise.all(
    test.inputs.map(async (input) => {
      const output = await llmInvoke(test.prompt, input);
      return evaluate(output, test.expectedOutputs);
    })
  );

  return calculatePassRate(results);
}
```

### Evaluation Metrics
- **Format Compliance**: Does output match specified format?
- **Content Accuracy**: Is the generated content correct?
- **Constraint Satisfaction**: Are all constraints met?
- **Consistency**: Are multiple attempts consistent?
- **Quality Score**: Subjective quality assessment (1-5)

## Version Control

### Prompt Versioning
```
prompts/
├── component-selector/
│   ├── v1.md (initial)
│   ├── v2.md (refined)
│   └── v3.md (optimized)
└── styling-agent/
    ├── v1.md
    └── v2.md
```

### Change Documentation
Each prompt version should document:
- What changed from previous version
- Why the change was made
- Impact on output quality
- Performance metrics

## Related Documentation
- [LangGraph Workflows](./langgraph-workflows.md)
- [LLM Integration](./llm-integration.md)
- [Cost Tracking](./cost-tracking.md)
- [Prompts Directory](../prompts/)
