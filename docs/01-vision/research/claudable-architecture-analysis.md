# Claudable Architecture Analysis

**Research Date**: 2025-08-26  
**Analyst**: BMAD2 Competitive Analysis Framework  
**Repository**: https://github.com/opactorai/Claudable  
**Integration Context**: Hotel Website Generator Enhancement Research

---

## Executive Summary

Claudable is a sophisticated Next.js-based web app builder that integrates Claude Code/Cursor CLI agents with a real-time development environment. Key differentiators from our system include **interactive generation**, **dual-mode operation** (chat vs act), and **direct CLI integration** for live coding. Their approach offers valuable patterns for enhancing our LangGraph-based workflow with real-time feedback and interactive generation capabilities.

### Key Architectural Insights for Our System
1. **Interactive Generation**: Real-time preview with WebSocket-based updates
2. **Dual-Mode Interface**: Chat mode for discussion, Act mode for generation  
3. **CLI Agent Integration**: Direct integration with Claude Code SDK for live coding
4. **Project Isolation**: Each project gets independent git repository and directory structure

---

## Architecture Overview

### Technology Stack Comparison

| Component | Claudable | Our System | Analysis |
|-----------|-----------|------------|----------|
| **Frontend** | Next.js 14 + TypeScript | Next.js + TypeScript | ✅ Similar foundation |
| **Styling** | Tailwind CSS | Tailwind CSS + shadcn/ui | ✅ Compatible approach |
| **State Management** | React hooks + Context | LangGraph state management | 🔄 Different paradigm |
| **Backend** | FastAPI + Python | Node.js APIs | 🔄 Different but compatible |
| **Database** | SQLite → PostgreSQL | JSON manifests + APIs | 🔄 More persistent approach |
| **LLM Integration** | Claude Code SDK | OpenRouter API | 🔄 Different integration level |
| **Real-time** | WebSockets | Not implemented | ⭐ Enhancement opportunity |

### Project Structure Analysis

```
Claudable Structure:
├── apps/
│   ├── api/              # FastAPI backend
│   │   ├── services/     # Core services (claude_act, filesystem, git_ops)
│   │   ├── models/       # Database models
│   │   └── prompt/       # System prompt management
│   └── web/              # Next.js frontend
│       ├── components/   # Flat component structure
│       ├── hooks/        # Custom React hooks
│       └── types/        # TypeScript definitions

Our Structure:
├── src/
│   ├── components/       # Hierarchical (ui/blocks/sections)
│   ├── langgraph/        # Agent workflows
│   ├── lib/              # Utilities and services
│   └── data/             # Component manifests
```

**Key Differences**:
- **Monorepo vs Single App**: They use workspace pattern with separate API/web
- **Component Organization**: Flat vs our hierarchical ui/blocks/sections
- **Agent Architecture**: Direct CLI integration vs our LangGraph workflows
- **State Management**: WebSocket + Database vs our agent-based state

---

## Interactive Generation Analysis

### Claudable's Approach

1. **Dual Mode Operation**
   ```typescript
   // Chat mode: Discussion and guidance
   // Act mode: Direct code generation
   type ChatMode = 'chat' | 'act';
   ```

2. **Real-time Preview Architecture**
   ```
   User Input → Claude Code SDK → Live Code Changes → WebSocket Updates → Preview Refresh
   ```

3. **CLI Agent Integration**
   ```python
   # Direct integration with Claude Code SDK
   from claude_code_sdk import query, ClaudeCodeOptions
   # Executes code changes in real-time through CLI
   ```

### Our Current Workflow
```
Hotel Parameters → InputAnalyzer → ComponentSelector → StylingAgent → AssemblyAgent → Generated Site
```

### Enhancement Opportunities

1. **Interactive Feedback Loop**
   - Add WebSocket connection for real-time updates
   - Implement preview mode during ComponentSelector phase
   - Show component selection in real-time

2. **Dual Mode Interface**
   - **Discussion Mode**: Current InputAnalyzer behavior
   - **Generation Mode**: Direct component assembly with preview

3. **Real-time Component Preview**
   ```typescript
   // Potential enhancement for ComponentSelector
   interface ComponentPreview {
     selectedComponents: ComponentManifest[];
     previewUrl: string;
     websocketConnection: WebSocket;
   }
   ```

---

## Component Architecture Comparison

### Claudable's Component Structure

```typescript
// Flat organization with functional grouping
components/
├── chat/              # Chat-specific components
├── project/           # Project management
├── settings/          # Configuration
└── ui/                # Base UI components
```

### Our Hierarchical System

```typescript
// Hierarchical with progressive complexity
src/components/
├── ui/                # Primitives (Button, Input, Card)
├── blocks/            # Composite (RoomCard, TestimonialCard)  
├── sections/          # Page sections (HeroSection, RoomsSection)
└── layouts/           # Page layouts
```

### Selection Mechanisms

**Claudable**: User describes → Claude Code generates → Components created dynamically  
**Our System**: Hotel parameters → ComponentSelector agent → Manifest-driven selection

**Integration Opportunity**: Hybrid approach combining our structured selection with their dynamic generation capability.

---

## Agent Communication Patterns

### Claudable's CLI Integration

```python
# Direct Claude Code SDK integration
async def execute_act(message: str, options: dict):
    response = await query(
        messages=[UserMessage(content=message)],
        model=DEFAULT_MODEL,
        options=ClaudeCodeOptions(
            include_thinking=True,
            max_tokens=8192
        )
    )
    return response
```

### Our LangGraph Workflow

```typescript
// Agent coordination through state management
class GenerationWorkflow {
  nodes: {
    inputAnalyzer: InputAnalyzer,
    componentSelector: ComponentSelector,
    stylingAgent: StylingAgent,
    assemblyAgent: AssemblyAgent
  }
}
```

### Enhancement Opportunities

1. **Hybrid Agent Architecture**
   - Keep our LangGraph workflow for structure
   - Add real-time feedback at each stage
   - Integrate direct LLM calls for interactive elements

2. **WebSocket Integration**
   - Real-time updates during component selection
   - Live preview during styling generation
   - Progress feedback during assembly

---

## Project Management & Initialization

### Claudable's Project Setup

```python
async def initialize_project(project_id: str, name: str):
    # Create isolated project directory
    project_path = f"{settings.projects_root}/{project_id}/repo"
    
    # Scaffold Next.js minimal
    scaffold_nextjs_minimal(project_path)
    
    # Independent git repository
    init_git_repo(project_path)
    
    # Environment setup
    write_env_file(project_path, {...})
```

### Our Generation Approach

```typescript
// Single-generation model
generateHotelWebsite(params: HotelParameters) -> GeneratedSite
```

### Integration Insights

1. **Project Persistence**: They support ongoing projects vs our single-generation model
2. **Git Integration**: Each project gets isolated git repository
3. **Asset Management**: Dedicated assets directory per project
4. **Environment Configuration**: Per-project environment variables

**Potential Enhancement**: Add project persistence to our system for iterative refinement.

---

## Real-time Communication Architecture

### Claudable's WebSocket Implementation

```python
# WebSocket manager for real-time updates
class WebSocketManager:
    def __init__(self):
        self.connections = {}
    
    async def broadcast_to_project(self, project_id: str, message: dict):
        # Send updates to all connected clients
```

```typescript
// Frontend WebSocket hook
export function useWebSocket({ projectId }: { projectId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Real-time message handling
}
```

### Our Current Approach
- Static generation with no real-time updates
- Batch processing through LangGraph workflow
- No live preview during generation

### Enhancement Opportunity

```typescript
// Potential WebSocket integration for our workflow
interface GenerationProgress {
  stage: 'analyzing' | 'selecting' | 'styling' | 'assembling';
  progress: number;
  preview?: {
    selectedComponents: string[];
    currentStyling?: string;
  };
}
```

---

## Configuration & Customization Patterns

### Claudable's System Prompt Management

```python
# Dynamic system prompt loading
def load_system_prompt(force_reload: bool = False) -> str:
    prompt_file = find_prompt_file()
    with open(prompt_file, 'r') as f:
        return f.read()
```

**System Prompt Structure**:
- Identity and role definition
- Technical stack guidelines
- Code generation rules
- Security and validation patterns

### Our Approach
- Hardcoded prompts in agent files
- Component manifest for selection logic
- Static configuration in data files

### Enhancement Opportunities

1. **Dynamic Prompt Management**
   - Hot-reloadable prompts for agents
   - A/B testing different prompt strategies
   - Context-aware prompt modification

2. **Configuration Hierarchy**
   ```yaml
   # Enhanced configuration approach
   agent_prompts:
     InputAnalyzer: 
       base_prompt: "prompts/input-analyzer.md"
       hotel_specific: "prompts/hotel-analysis.md"
     ComponentSelector:
       base_prompt: "prompts/component-selector.md"
       selection_strategy: "prompts/selection-strategies.md"
   ```

---

## Implementation Recommendations

### Priority 1: Interactive Generation Enhancement (High Impact, Medium Effort)

1. **Add WebSocket Support**
   ```typescript
   // Add to GenerationWorkflow.ts
   interface GenerationWebSocket {
     onProgress: (stage: string, progress: number) => void;
     onPreview: (components: SelectedComponents) => void;
     onComplete: (result: GeneratedSite) => void;
   }
   ```

2. **Real-time Component Preview**
   - Show selected components as ComponentSelector works
   - Live preview of styling changes
   - Interactive component adjustment

3. **Dual Mode Interface**
   - Discussion mode for parameter refinement
   - Generation mode for immediate building

**Implementation Effort**: 2-3 weeks  
**Budget Impact**: Low (enhance existing workflow)  
**Risk**: Medium (requires WebSocket infrastructure)

### Priority 2: Project Persistence (Medium Impact, High Effort)

1. **Add Project Management**
   - Save generation sessions for iteration
   - Version control for generated sites
   - Asset management for hotel images

2. **Database Integration**
   - Persistent storage for project state
   - User session management
   - Generation history tracking

**Implementation Effort**: 4-6 weeks  
**Budget Impact**: Medium (storage costs)  
**Risk**: High (significant architecture change)

### Priority 3: Configuration Enhancement (Low Impact, Low Effort)

1. **Dynamic Prompt Management**
   - Hot-reloadable agent prompts
   - Configuration-driven agent behavior
   - A/B testing infrastructure

2. **Enhanced Monitoring**
   - Real-time cost tracking display
   - Performance metrics dashboard
   - Error tracking and recovery

**Implementation Effort**: 1-2 weeks  
**Budget Impact**: Low  
**Risk**: Low (additive changes)

---

## Integration Strategy with Epic 3 System

### Preserving Existing Architecture

1. **Keep LangGraph Workflow**
   - Maintain agent specialization (InputAnalyzer, ComponentSelector, etc.)
   - Preserve component manifest system
   - Keep budget monitoring architecture

2. **Enhance with Interactive Elements**
   - Add WebSocket layer for real-time updates
   - Implement preview mode during generation
   - Maintain $2.00 budget compliance

### Selective Pattern Adoption

```typescript
// Enhanced GenerationWorkflow with interactive elements
class InteractiveGenerationWorkflow extends GenerationWorkflow {
  constructor(
    private websocket: GenerationWebSocket,
    private previewMode: boolean = false
  ) {
    super();
  }
  
  async executeComponentSelector(state: WorkflowState) {
    // Existing logic
    const selectedComponents = await this.componentSelector.select(state.parameters);
    
    // New: Real-time preview
    if (this.previewMode) {
      this.websocket.onPreview({ selectedComponents });
      await this.waitForUserConfirmation();
    }
    
    return selectedComponents;
  }
}
```

### Risk Mitigation

1. **Incremental Implementation**
   - Start with read-only preview mode
   - Add interaction after validation
   - Maintain fallback to existing workflow

2. **Budget Protection**
   - Track real-time costs during interactive mode
   - Emergency stops for budget overruns
   - Cost prediction for interactive features

3. **Quality Assurance**
   - A/B testing interactive vs batch mode
   - Performance monitoring
   - User experience validation

---

## Conclusion

Claudable's architecture offers valuable insights for enhancing our BMAD2-enabled hotel website generator, particularly in the areas of **interactive generation**, **real-time feedback**, and **user experience**. Their direct CLI integration and WebSocket-based updates provide compelling patterns for making our sophisticated LangGraph workflow more interactive and user-friendly.

### Key Takeaways

1. **Interactive Generation**: Real-time preview significantly improves user experience
2. **Dual Mode Interface**: Separation of discussion and generation modes clarifies user intent
3. **WebSocket Architecture**: Critical for responsive, modern development experience
4. **Project Persistence**: Enables iterative refinement vs single-generation model

### Next Steps

1. **Prototype Interactive Preview**: Build WebSocket layer for ComponentSelector stage
2. **A/B Testing**: Compare interactive vs batch generation approaches  
3. **Budget Analysis**: Validate interactive features within Epic 3 constraints
4. **User Research**: Test interactive patterns with hotel website generation use cases

The analysis confirms that selective adoption of Claudable's interactive patterns can significantly enhance our system while preserving the sophisticated agent architecture and budget controls that make our Epic 3 system effective.