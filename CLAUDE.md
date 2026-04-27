# CLAUDE.md

**LLM-Driven Hotel Website Generator** - Automated platform generating 10,000+ unique hotel websites at ~$2/site using LangGraph workflows and component-based architecture.

## Working Principles

### 99% Confidence Rule
Before writing code/docs/answers:
1. Analyze request, assess understanding gaps
2. If <99% confidence: Use Sequential Thinking MCP → Context7 → WebSearch → AskUserQuestion
3. Only proceed at 99% confidence

### 100% Test Passing Rule
1. Run ALL test configs before completion
2. Fix ALL failures - no exceptions
3. Verify 100% pass rate

## MCP Servers

### Sequential Thinking
Use `mcp__sequential-thinking__sequentialthinking` for:
- Complex/ambiguous tasks
- Architectural decisions
- Multi-step problem solving

### Context7
Use `mcp__context7__resolve-library-id` + `get-library-docs` for:
- Up-to-date library documentation
- Verifying APIs and patterns
- Checking breaking changes

## Project Context

Project-specific standards are in `docs/project-context/`:
- **shared/domain-glossary.md** - Hotel domain terminology, component system, workflow states
- **react/tech-stack.md** - Technologies, commands, environment variables
- **react/coding-standards.md** - Code patterns and conventions
- **react/testing-standards.md** - Jest configs, LangGraph mocking patterns

## Testing

See `.claude/skills/test-debug/SKILL.md` for full test execution, debugging, and fix patterns.

**Key rules:** Run targeted tests, not full suite. Root-cause before fixing. Never skip broken tests. Dispatch parallel `test-react` sub-agents for bulk fixes.

## Key Commands

```bash
# Tests (all configs — run from web-app/)
cd web-app && npx jest --no-coverage --forceExit                                    # default
cd web-app && npx jest --config jest.config.simple.js --no-coverage --forceExit      # unit
cd web-app && npx jest --config jest.config.workflow.js --testPathPatterns="..." --no-coverage --forceExit  # workflow (always targeted!)

# Targeted test (preferred)
cd web-app && npx jest --testPathPatterns="tests/path/to/file" --no-coverage --forceExit

# Build
npm run build
npm run dev
```

## Key Directories

```
docs/
├── project-context/    # AI agent context (MUST read)
├── epics/              # Epic definitions
├── stories/            # User stories
├── prd.md              # Product requirements
└── architecture.md     # System architecture

web-app/
├── app/                # Next.js App Router
├── components/         # UI components (4-tier system)
├── lib/                # Utilities, LangGraph agents
└── types/              # TypeScript types
```

## Universal Agent System

This project uses the Universal Claude Micro-Agent System.
Agents and commands are globally available from `~/.claude/`.


