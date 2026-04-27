# Docstring Standard Template

**Version:** 1.0.0
**Based on:** LLM-Optimized Docstring Research (2025-12-11)
**Reference:** `docs/research/1.llm-optimized-docstring-formats-vector-db-best-practices.md`

---

## Overview

This template defines the standard docstring format for all code produced by BMAD development agents. The format is optimized for:

1. **LLM Context Understanding** - Maximizes comprehension with minimal tokens
2. **Vector Database Retrieval** - Optimal for semantic search and RAG systems
3. **Traceability** - Links code to epics, stories, and requirements
4. **Human Readability** - Clear, consistent, scannable documentation

---

## Format: Google-Style with Traceability Enhancement

### Python Docstring Template

```python
def function_name(
    param1: Type,
    param2: Type,
    param3: Type | None = None,
) -> ReturnType:
    """One-line summary in imperative mood (max 79 chars).

    Trace:
        epic: EPIC-XX
        story: STORY-XX.Y
        reqs: [REQ-ID-001, REQ-ID-002]

    Why: 2-4 sentences explaining intent, design rationale, and why this
    approach was chosen over alternatives. Reference ADRs or retrospectives
    if applicable. This section has the HIGHEST value for LLM context.

    Args:
        param1: Description with constraints, validation rules, and
            expected ranges. Be explicit about what happens with
            invalid input.
        param2: Description with purpose and business context.
        param3: Description with default behavior explanation.
            Defaults to None, which means [specific behavior].

    Returns:
        Description of return value including structure for complex
        types. Mention important attributes or sentinel values
        (e.g., returns None if not found).

    Raises:
        ExceptionType: When and why this exception occurs.
        AnotherException: Different error condition with context.

    Example:
        >>> result = function_name(value1, value2)
        >>> result.important_field
        'expected_value'

    Note:
        Thread-safety, performance characteristics, security
        considerations, or other caveats that don't fit elsewhere.
    """
```

### TypeScript/TSDoc Template

```typescript
/**
 * One-line summary in imperative mood.
 *
 * @trace epic: EPIC-XX
 * @trace story: STORY-XX.Y
 * @trace reqs: REQ-ID-001, REQ-ID-002
 *
 * Why: 2-4 sentences explaining intent, design rationale, and why this
 * approach was chosen over alternatives. This section has the HIGHEST
 * value for LLM context understanding.
 *
 * @param param1 - Description with constraints and validation rules.
 * @param param2 - Description with purpose and business context.
 * @param param3 - Description with default behavior. Defaults to undefined.
 *
 * @returns Description of return value including structure for complex types.
 *
 * @throws {ErrorType} When and why this error is thrown.
 *
 * @example
 * ```typescript
 * const result = functionName(value1, value2);
 * console.log(result.field); // 'expected'
 * ```
 *
 * @remarks
 * Thread-safety, performance, or security considerations.
 */
```

---

## Section Guidelines

### One-Line Summary
- **Format:** Imperative mood ("Calculate", not "Calculates")
- **Length:** Max 79 characters (fits one line)
- **Content:** WHAT it does (not HOW or WHY)
- **Purpose:** Quick scanning, function discovery

**Examples:**
- `"""Calculate order total with applicable discounts."""`
- `"""Validate user credentials against stored hash."""`
- `"""Transform API response to domain model."""`

### Trace Block (Required for story-related code)
- **Format:** YAML-like structured metadata
- **Purpose:** Machine-parseable traceability
- **Fields:**
  - `epic`: Epic identifier (e.g., EPIC-07)
  - `story`: Story identifier (e.g., STORY-07.3)
  - `reqs`: List of requirement IDs (e.g., [REQ-AUTH-001, REQ-SEC-015])

**When to include:**
- All code implementing story acceptance criteria
- Security-sensitive functions (always)
- Public API endpoints
- Database migrations

**When to omit:**
- Internal utility functions with no direct story link
- Trivial getters/setters
- Test helper functions

### Why Section (Highest LLM Value)
- **Length:** 2-4 sentences
- **Content:**
  - Intent/purpose beyond what code shows
  - Design rationale and trade-offs
  - Why THIS approach vs alternatives
  - References to ADRs, retrospectives, or design docs

**What to include:**
- Non-obvious design decisions
- Performance considerations and why they matter
- Security choices and their rationale
- Business rules driving implementation

**What NOT to include:**
- Redundant description of what code does
- Information obvious from code structure
- Generic programming explanations

### Args/Parameters Section
- **Format:** `param_name: Description with context.`
- **Include:**
  - Type constraints (even with type hints, explain constraints)
  - Valid ranges, formats, patterns
  - What happens with invalid input
  - Default value behavior (if applicable)

### Returns Section
- **Include:**
  - Return type description
  - Structure for complex types (mention important fields)
  - Sentinel values (None, empty list, etc.)
  - Error returns vs exceptions

### Raises Section
- **Include:**
  - Exception types callers should handle
  - WHEN the exception occurs
  - WHY it's raised (context)

### Example Section
- **Format:** Doctest-compatible (`>>>` prompts)
- **Include:**
  - Basic usage pattern
  - Edge cases if helpful
  - Expected output values

### Note Section (Optional)
- Thread-safety considerations
- Performance characteristics
- Security warnings
- Breaking change notices
- Deprecation information

---

## Class/Module Documentation

### Python Class Template

```python
class ClassName:
    """One-line summary of class purpose.

    Extended description explaining the class's role in the system,
    its responsibilities, and how it fits into the architecture.

    Trace:
        epic: EPIC-XX
        story: STORY-XX.Y
        pattern: Repository|Service|Controller|etc.

    Why: Design rationale explaining why this class exists, what
    problem it solves, and architectural decisions involved.

    Attributes:
        attr1: Description of public attribute.
        attr2: Description with type and purpose.

    Example:
        >>> instance = ClassName(config)
        >>> result = instance.method(data)
        >>> result.status
        'success'

    Note:
        Thread-safety, lifecycle, or usage considerations.
    """

    def __init__(self, param1: Type, param2: Type) -> None:
        """Initialize ClassName with required dependencies.

        Args:
            param1: Description of dependency.
            param2: Description of configuration.
        """
```

### TypeScript Class/Component Template

```typescript
/**
 * One-line summary of component purpose.
 *
 * Extended description explaining the component's role, props interface,
 * and rendering behavior.
 *
 * @trace epic: EPIC-XX
 * @trace story: STORY-XX.Y
 *
 * Why: Design rationale explaining component architecture decisions.
 *
 * @example
 * ```tsx
 * <ComponentName
 *   prop1={value}
 *   onAction={handleAction}
 * />
 * ```
 *
 * @remarks
 * Accessibility considerations, performance notes.
 */
```

---

## Quality Guidelines

### Token Budget
- **Target:** 150-400 tokens per docstring
- **Maximum:** 512 tokens (optimal for embedding models)
- **If exceeding:** Compress by 25-40% without losing critical info

### Compression Priority (What to Keep)
1. One-line summary (keep)
2. Trace block (keep for story-related code)
3. Why section (keep - highest LLM value)
4. Args with constraints (keep essential)
5. Returns (keep)
6. Example (keep if adds value)
7. Raises (keep for public APIs)
8. Note (remove if not critical)

### Terminology Consistency
- Use ONE term per concept throughout codebase
- Define terms in `docs/project-context/shared/domain-glossary.md`
- Never use synonyms interchangeably (confuses LLMs)

**Bad:** "user", "account", "profile" used interchangeably
**Good:** "user" for authentication, "profile" for display data, "account" for billing

### Explicit Over Implicit
- Avoid pronouns ("it", "this", "that") without clear antecedents
- Be specific about what functions do and return
- Don't assume reader knows context

**Bad:** "It processes the data and returns it."
**Good:** "Processes user authentication data and returns JWT token."

---

## Anti-Patterns to Avoid

### Redundant What
```python
# BAD - describes what code obviously does
def calculate_sum(a: int, b: int) -> int:
    """
    Calculates the sum of two integers.

    This function takes two integers and adds them together,
    returning the result of the addition operation.

    Args:
        a: The first integer
        b: The second integer

    Returns:
        The sum of a and b
    """
    return a + b
```

```python
# GOOD - explains context when non-trivial
def calculate_order_total(items: list[Item], discount: Decimal) -> Decimal:
    """Calculate order total with discount applied.

    Trace:
        story: STORY-08.3
        reqs: [REQ-PRICING-001]

    Why: Uses Decimal for financial precision. Discount applied after
    tax calculation per regulatory requirements (not per-item).

    Args:
        items: Order line items with price in cents.
        discount: Percentage as decimal (0.10 = 10%).

    Returns:
        Total in dollars, rounded to 2 decimal places.
    """
```

### Missing Why
```python
# BAD - no explanation of non-obvious design choice
def hash_password(password: str) -> str:
    """Hash a password using Argon2id."""
    return argon2_hash(password, time_cost=3, memory_cost=65536)
```

```python
# GOOD - explains design rationale
def hash_password(password: str) -> str:
    """Hash password using Argon2id with security parameters.

    Why: Argon2id chosen over bcrypt for better GPU attack resistance
    (see ADR-2025-01). Parameters tuned for 200ms hash time on
    production hardware, balancing security vs UX latency.

    Args:
        password: Plaintext password from user input.

    Returns:
        Base64-encoded hash safe for database storage.
    """
```

### Excessive Length
```python
# BAD - too verbose, low information density
def get_user(user_id: str) -> User | None:
    """
    Retrieves a user from the database by their unique identifier.

    This function performs a database lookup operation to find and
    return a user object based on the provided user identifier. The
    function will search through the users table in the database
    and attempt to locate a matching record. If a user with the
    specified identifier is found, the function will return a User
    object containing all of the user's information. If no matching
    user is found in the database, the function will return None
    to indicate that the user does not exist.

    The function uses the repository pattern to abstract the database
    access layer, ensuring proper separation of concerns and making
    the code more maintainable and testable...
    [continues for another 200 tokens]
    """
```

```python
# GOOD - concise, high information density
def get_user(user_id: str) -> User | None:
    """Retrieve user by ID from database.

    Args:
        user_id: UUID string identifier.

    Returns:
        User object if found, None otherwise.

    Raises:
        DatabaseConnectionError: If database unavailable.
    """
```

---

## Integration with Vector Search

### Metadata for Indexing
Docstrings should support extraction of:
- Function/class name
- Module path
- Epic/story references
- Requirement IDs
- Security classification (if present)

### Chunk-Friendly Structure
- Each docstring is one semantic unit
- Keep under 512 tokens for optimal embedding
- Use consistent section ordering for predictable parsing

### Search Optimization
- Include business terms for semantic matching
- Use consistent terminology for keyword matching
- Structure enables filtered retrieval by epic/story

---

## Language-Specific Notes

### Python
- Use type hints IN ADDITION to docstring types
- Follow PEP 257 for formatting basics
- Use Google style sections (Args, Returns, Raises)
- Support doctest execution (`python -m doctest`)

### TypeScript/JavaScript
- Use TSDoc tags (@param, @returns, @throws)
- Custom @trace tag for traceability
- Include type information even with TypeScript types
- Support JSDoc extraction tools

### React Components
- Document props interface clearly
- Include render behavior description
- Note accessibility requirements
- Provide usage examples with JSX

---

## Enforcement

### Pre-commit Hooks
- Validate Trace block presence for story files
- Check docstring length limits
- Verify consistent terminology

### Code Review Checklist
- [ ] One-line summary present and imperative
- [ ] Trace block for story-related code
- [ ] Why section for non-trivial functions
- [ ] Args describe constraints, not just types
- [ ] Examples for public APIs
- [ ] Under 512 tokens

### Linting Rules
- Enforce Google/TSDoc format
- Flag missing docstrings on public APIs
- Warn on excessive length

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-11 | Initial release based on research |

---

**This template is referenced by:**
- `dev-python` agent
- `dev-react` agent
- `code-reviewer` agent
- `test-python` agent
- `test-react` agent
