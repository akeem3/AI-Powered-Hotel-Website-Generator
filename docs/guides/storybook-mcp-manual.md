# Storybook MCP Integration Manual

> **Purpose:** Comprehensive guide for using the Storybook Model Context Protocol with AI agents.
> **Version:** `storybook-mcp@latest`

---

## 1. Overview

**Storybook MCP** enables AI agents to utilize your Storybook instance as a source of truth for UI components. It allows agents to discover components, understand their usage through machine-readable metadata, and visual verify changes via deep links.

### Quick Benefits
-   **No Hallucinations**: Agents use existing components instead of inventing new ones.
-   **Visual Verification**: Agents can provide you with direct links to see what they built.
-   **Consistent Style**: Agents access your CVA variants and design tokens directly.

### Configuration
Ensure your `.mcp.json` is configured:
```json
{
  "mcpServers": {
    "storybook-mcp": {
      "command": "npx",
      "args": ["-y", "storybook-mcp@latest"],
      "env": {
        "STORYBOOK_URL": "http://localhost:6006/index.json"
      }
    }
  }
}
```

---

## 2. Available MCP Tools

AI Agents have access to the following tools:

| Tool | Purpose | Example Usage |
|------|---------|---------------|
| `list_stories` | Discover all available components | "What buttons do we have?" |
| `get_story` | Get metadata (args, variants) | "Show me the props for HeroSection" |
| `get_story_docs` | Get usage examples & code | "How do I implement a RoomCard?" |
| `get_story_urls` | Get deep links for visual check | "Give me a link to view this" |
| `get_ui_building_instructions` | Get project-specific rules | "What are the coding standards?" |

---

## 3. Workflow for AI Agents

To get the best results, instruct your AI agent to follow this workflow:

1.  **Discover**: Call `list_stories` to find relevant components.
2.  **Learn**: Call `get_story_docs` on chosen components to understand patterns.
3.  **Implement**: Generate code reusing existing patterns and tokens.
4.  **Verify**: Call `get_story_urls` to generate a review link for the user.

### Example Interaction
**User**: "Create a luxury variant for the HeroSection"

**AI Process**:
1.  Checks existing heroes: `list_stories()`
2.  Reads implementation: `get_story_docs(herosection--default)`
3.  Creates new CVA variant in code.
4.  Returns verification link: `get_story_urls(HeroSection--Luxury)`

---

## 4. Design System Integration

Storybook MCP is fully aware of our design system.

### Colors & Theming
Agents should strictly use our semantic tokens.
-   **CORRECT**: `bg-brand-primary`, `text-text-inverted`
-   **INCORRECT**: `bg-blue-500`, `#ffffff`

### Component Architecture
Agents should follow our 4-tier system:
1.  **Primitives**: Atomic (Button, Input)
2.  **Blocks**: Composed (RoomCard, Navigation)
3.  **Sections**: Full-width (Hero, Testimonials)
4.  **Pages**: Complete views

---

## 5. Case Study: Fixing BookingWidget

*A real-world example of using Storybook MCP to fix a dark theme bug.*

**The Problem**: The BookingWidget desktop dark variant was invisible because it hardcoded `bg-surface-primary` (white) even in dark mode.

**The MCP Solution**:
1.  **Diagnosis**: AI used `get_story_docs` to read the implementation and compared `DesktopDefault` vs `DesktopDark`.
2.  **Visual Proof**: AI provided URLs to both stories side-by-side using `get_story_urls`.
3.  **The Fix**: AI identified that the internal container needed to be theme-aware. It applied conditional classes using our standard `cn()` utility:
    ```tsx
    const containerClasses = cn(
      "p-6 rounded-2xl",
      theme === 'dark' ? "bg-brand-primary" : "bg-surface-primary"
    );
    ```
4.  **Verification**: AI returned a new URL where the dark theme was correctly applied.

**Key Takeaway**: Use MCP to "see" the component state before and after fixing bugs.

---

## 6. Resources

-   [Storybook Developer Manual](./storybook-manual.md)
-   [Semantic Color System](./semantic-color-system.md)
-   [Official Storybook MCP Docs](https://github.com/storybookjs/mcp)
