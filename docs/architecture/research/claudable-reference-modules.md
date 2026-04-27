# Claudable Reference: Core Modules & Concepts

> **Status:** Production Ready ✅
> **Version:** 2.0
> **Format:** Enhanced BMAD-Compatible Documentation
> **Purpose:** Reference documentation for LLM-driven website generation patterns
> **Use Case:** Inform our own PRD and implementation approaches
> **Analysis Date:** 2025-08-26
> **Relevance:** High - Proven patterns for LLM-driven development

## PROJECT BOUNDARIES

### IN SCOPE:
- Core architecture concepts analysis
- Module structure documentation
- Integration patterns research
- System prompt structures
- User experience patterns
- Technical implementation strategies

### OUT OF SCOPE:
- Direct code implementation
- Specific integration code
- Detailed technical specifications
- Performance benchmarks

## Overview

Claudable provides working examples of LLM-driven web application generation that can inform our hotel website generator design. This document catalogs their main modules and concepts for reference during our own development, focusing on patterns applicable to hotel website generation.

## Core Architecture Concepts

### 1. Dual-Mode Generation Interface

**Concept**: Separate modes for different user intents
```typescript
type ChatMode = 'chat' | 'act';
// chat: Discussion and guidance
// act: Direct code generation
```

**Application to Our PRD**: 
- Consider separate modes for hotel parameter discussion vs. direct generation
- Chat mode for refining requirements, Act mode for generation execution

### 2. Real-time Generation Feedback

**Concept**: WebSocket-based live updates during generation process
```python
# Real-time progress updates
class WebSocketManager:
    async def broadcast_to_project(project_id: str, message: dict)
```

**Application to Our PRD**:
- Real-time progress during LangGraph workflow execution
- Live component selection feedback
- Generation stage indicators for user experience

### 3. Project Persistence Model

**Concept**: Multi-session projects with saved state
```python
async def initialize_project(project_id: str, name: str):
    # Each project gets:
    # - Isolated directory structure
    # - Independent git repository  
    # - Persistent configuration
    # - Asset management
```

**Application to Our PRD**:
- Hotel projects could support iterative refinement
- Save generation sessions for later modification
- Version control for generated hotel sites

## Key Modules

### Frontend Modules

#### 1. Chat Interface System
```
components/chat/
├── ChatInterface.tsx      # Main chat container
├── ChatHeader.tsx         # Mode switching, controls
├── MessageList.tsx        # Message history display
├── MessageInput.tsx       # User input handling
└── CLISelector.tsx        # Agent selection UI
```

**Relevant Patterns**:
- Conversational interface for parameter collection
- Real-time message handling
- Agent selection and configuration

#### 2. Project Management System
```
components/project/
├── CreateProjectModal.tsx    # Project initialization
├── ProjectSettings.tsx       # Configuration management
└── wizard/                   # Step-by-step project setup
    ├── ProjectBasicInfo.tsx
    ├── ProjectCLISetup.tsx
    └── ProjectTemplate.tsx
```

**Relevant Patterns**:
- Guided setup for hotel website parameters
- Template selection approach
- Configuration persistence

#### 3. Settings & Configuration
```
components/settings/
├── SettingsModal.tsx         # Main settings interface
├── GeneralSettings.tsx       # Basic configuration
├── ServiceSettings.tsx       # External service integration
└── EnvironmentSettings.tsx   # Environment variables
```

**Relevant Patterns**:
- User configuration management
- External service integration UI
- Environment-specific settings

### Backend Modules

#### 1. LLM Agent Service
```python
# services/claude_act.py
- Direct Claude Code SDK integration
- System prompt management
- Message handling and response processing
- Error handling and fallbacks
```

**Key Concepts**:
- Centralized LLM interaction service
- Dynamic system prompt loading
- Structured message handling

#### 2. Project Management Service
```python
# services/project/initializer.py
- Project directory scaffolding
- Git repository initialization  
- Environment setup
- Asset management
```

**Key Concepts**:
- Automated project setup
- Directory structure standardization
- Version control integration

#### 3. File System Management
```python
# services/filesystem.py
- Directory creation and management
- File scaffolding utilities
- Git operations
- Environment file handling
```

**Key Concepts**:
- Standardized file operations
- Template-based scaffolding
- Automated setup procedures

#### 4. WebSocket Communication
```python
# core/websocket/manager.py
- Connection management
- Real-time message broadcasting
- Session handling
- Error recovery
```

**Key Concepts**:
- Real-time client-server communication
- Session-based messaging
- Connection reliability

## System Prompt Structure

### Core Identity Definition
```markdown
You are CLovable, an advanced AI coding assistant specialized in building modern fullstack web applications.
```

### Technical Stack Guidelines
- Next.js 15 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Supabase for backend services
- Vercel for deployment

### Code Generation Rules
- Component-focused development
- Security-first approach
- Performance optimization
- Accessibility compliance

**Application to Our PRD**:
- Structured system prompts for our agents
- Hotel-specific technical stack guidance
- Clear code generation principles

## Database & State Management

### Project State Model
```python
class Project:
    id: str
    name: str
    created_at: datetime
    updated_at: datetime
    status: ProjectStatus
    
class Session:
    id: str
    project_id: str
    messages: List[Message]
    status: SessionStatus
```

### Configuration Management
- Environment variables per project
- Service integration credentials
- User preferences and settings
- Project-specific customizations

**Application to Our PRD**:
- Hotel project state management
- Generation session persistence
- Configuration storage patterns

## Integration Patterns

### External Service Integration
```python
# GitHub integration
class GitHubService:
    - Repository creation
    - Code push automation  
    - CI/CD setup

# Vercel integration  
class VercelService:
    - Project deployment
    - Environment configuration
    - Domain management

# Supabase integration
class SupabaseService:
    - Database setup
    - Authentication configuration
    - API key management
```

**Relevant Patterns**:
- Automated deployment workflows
- External service abstraction
- Configuration management

## User Experience Patterns

### Progressive Disclosure
- Start with simple project setup
- Gradually reveal advanced options
- Context-aware feature availability

### Real-time Feedback
- Immediate response to user actions
- Progress indicators for long operations
- Error handling with clear messaging

### Guided Workflows
- Step-by-step project creation
- Template-based initialization
- Smart defaults with customization options

**Application to Our PRD**:
- Hotel parameter collection workflow
- Generation progress visualization
- Error handling and recovery

## Technical Implementation Patterns

### Monorepo Structure
```
apps/
├── api/          # FastAPI backend
└── web/          # Next.js frontend
```

### Service Layer Architecture
- Clear separation between UI and business logic
- Reusable service modules
- Consistent error handling

### Real-time Communication
- WebSocket for live updates
- Fallback to polling for reliability
- Message queuing for complex operations

**Application to Our PRD**:
- Clean architecture principles
- Service-oriented design
- Reliable communication patterns

## Key Takeaways for Our PRD

### 1. User Experience Enhancements
- **Real-time feedback** during generation process
- **Conversational interface** for parameter collection
- **Progressive disclosure** of advanced options
- **Live preview** capabilities

### 2. Architecture Patterns
- **Dual-mode operation** (discussion vs. generation)
- **Project persistence** for iterative development
- **Service abstraction** for external integrations
- **WebSocket communication** for real-time updates

### 3. Development Workflow
- **Template-based scaffolding** for consistent output
- **Version control integration** from start
- **Automated deployment** workflows
- **Configuration management** systems

### 4. System Design
- **Modular service architecture**
- **Clear separation of concerns**
- **Robust error handling**
- **Scalable communication patterns**

---

## Next Steps

1. **Extract specific patterns** relevant to hotel website generation
2. **Update PRD** with Claudable-inspired enhancements  
3. **Define implementation approaches** based on proven patterns
4. **Prioritize features** that align with our hotel-focused use case

This reference documentation provides a foundation for informed decision-making about our own system design, drawing from Claudable's working implementation of LLM-driven website generation.