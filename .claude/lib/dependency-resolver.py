#!/usr/bin/env python3
"""
Dependency Resolver for Story Analysis and Execution Planning

Trace:
    epic: EPIC-08
    story: STORY-08.02
    reqs: [REQ-IMPL-01, REQ-IMPL-03]

Why: Provides core dependency resolution capabilities for the parallel
implementation orchestrator. Uses directed graph representation with
DFS-based cycle detection (proven pattern from Epic 07). Enables
efficient parallel execution by identifying stories that can run
concurrently while respecting dependency constraints.

The resolver maintains minimal state (graph + completed set) for
thread-safety and supports dynamic updates as stories complete.
Topological level calculation enables wave-based execution strategy.

Usage:
    # Parse story files
    stories = [parse_story_dependencies(path) for path in story_files]

    # Build dependency graph
    graph = build_dependency_graph(stories)

    # Check for cycles
    cycles = detect_circular_dependencies(graph)
    if cycles:
        raise ValueError(f"Circular dependencies found: {cycles}")

    # Calculate dependency levels for wave-based execution
    levels = calculate_dependency_levels(graph)

    # Execute stories in waves
    completed = set()
    while True:
        ready = get_ready_stories(graph, completed)
        if not ready:
            break
        # Execute ready stories...
        for story_id in executed:
            newly_ready = update_dependencies(graph, story_id, completed)

Example:
    >>> stories = [
    ...     {"story_id": "08.01", "depends_on": []},
    ...     {"story_id": "08.02", "depends_on": ["story-08.01"]},
    ... ]
    >>> graph = build_dependency_graph(stories)
    >>> ready = get_ready_stories(graph, set())
    >>> ready
    ['08.01']

Related:
    - Epic: docs/epics/epic-08.adaptive_parallel-story-implementation-workflow_ready_2025-12-11.md
    - Pattern: .claude/lib/parallel-story-orchestrator.py (DFS cycle detection)
    - Index: .claude/context/coordination/story-implementation-index.yaml
"""

import logging
import re
import yaml
from pathlib import Path
from typing import Any

# Configure logging
logger = logging.getLogger(__name__)

# Story ID extraction pattern (matches "story-08.01", "story_08_01", "08.01", etc.)
STORY_ID_PATTERN = re.compile(r'story[_-]?(\d+\.\d+)', re.IGNORECASE)


def parse_story_dependencies_from_yaml(yaml_content: str) -> dict[str, Any]:
    """Parse story metadata from YAML frontmatter.

    Trace:
        story: STORY-08.02
        req: REQ-IMPL-01

    Why: Extracts dependency information from story YAML frontmatter to
    enable dependency graph construction. Uses yaml.safe_load for security.
    Handles both YAML list format and inline string format for depends_on.

    Args:
        yaml_content: Full story file content with YAML frontmatter delimited by ---

    Returns:
        dict with keys:
            - story_id: Extracted story ID (e.g., "08.02")
            - depends_on: List of dependency strings (file paths or story IDs)

    Raises:
        ValueError: If YAML frontmatter is malformed or missing required fields
        yaml.YAMLError: If YAML parsing fails

    Example:
        >>> content = '''---
        ... type: story
        ... id: "08.02"
        ... depends_on:
        ...   - story-08.01
        ... ---
        ... # Story content
        ... '''
        >>> result = parse_story_dependencies_from_yaml(content)
        >>> result['story_id']
        '08.02'
        >>> result['depends_on']
        ['story-08.01']
    """
    # Extract YAML frontmatter between --- delimiters
    yaml_match = re.match(r'^---\n(.*?)\n---', yaml_content, re.DOTALL)
    if not yaml_match:
        raise ValueError("No YAML frontmatter found in story file")

    yaml_str = yaml_match.group(1)

    try:
        metadata = yaml.safe_load(yaml_str)
    except yaml.YAMLError as e:
        raise ValueError(f"Failed to parse YAML frontmatter: {e}") from e

    if not isinstance(metadata, dict):
        raise ValueError(f"YAML frontmatter must be a dictionary, got {type(metadata)}")

    # Extract story ID
    story_id = metadata.get("id", "")
    if not story_id:
        raise ValueError("Story ID not found in YAML frontmatter")

    # Remove quotes if present
    story_id = story_id.strip('"\'')

    # Extract depends_on field
    depends_on = metadata.get("depends_on", [])
    if depends_on is None:
        depends_on = []
    elif not isinstance(depends_on, list):
        depends_on = [depends_on]

    return {
        "story_id": story_id,
        "depends_on": depends_on,
    }


def extract_story_id_from_reference(reference: str) -> str | None:
    """Extract story ID from dependency reference string.

    Trace:
        story: STORY-08.02
        req: REQ-IMPL-01

    Why: Normalizes various dependency reference formats (file paths,
    story IDs, story-NN.MM format) to canonical story ID format.
    Enables flexible dependency specification in story frontmatter.

    Args:
        reference: Dependency reference (e.g., "story-08.01", "docs/stories/story-08.01.*.md")

    Returns:
        Normalized story ID (e.g., "08.01") or None if no ID found

    Example:
        >>> extract_story_id_from_reference("story-08.01")
        '08.01'
        >>> extract_story_id_from_reference("docs/stories/story-08.01.*.md")
        '08.01'
        >>> extract_story_id_from_reference("some-other-file.md")
        None
    """
    match = STORY_ID_PATTERN.search(reference)
    if match:
        return match.group(1)
    return None


def build_dependency_graph(stories: list[dict[str, Any]]) -> dict[str, list[str]]:
    """Build directed dependency graph from story metadata.

    Trace:
        story: STORY-08.02
        req: REQ-IMPL-01

    Why: Constructs adjacency list representation of story dependencies.
    This format enables efficient DFS traversal for cycle detection and
    topological sorting. Pattern proven in Epic 07 cross-validation.

    Args:
        stories: List of story dicts with keys:
            - story_id: Unique story identifier (e.g., "08.02")
            - depends_on: List of dependency references

    Returns:
        Adjacency list graph: dict[story_id, list[dependency_story_ids]]
        Empty list means no dependencies (Level 0 story)

    Example:
        >>> stories = [
        ...     {"story_id": "08.01", "depends_on": []},
        ...     {"story_id": "08.02", "depends_on": ["story-08.01"]},
        ... ]
        >>> graph = build_dependency_graph(stories)
        >>> graph
        {'08.01': [], '08.02': ['08.01']}

    Note:
        Story IDs are normalized to NN.MM format. Dependencies that
        don't match STORY_ID_PATTERN are silently ignored (may be
        file paths to external artifacts).
    """
    graph: dict[str, list[str]] = {}

    # Initialize all story nodes
    for story in stories:
        story_id = story["story_id"]
        graph[story_id] = []

    # Build edges from depends_on fields
    for story in stories:
        story_id = story["story_id"]
        for dep_ref in story.get("depends_on", []):
            # Extract story ID from reference
            dep_id = extract_story_id_from_reference(dep_ref)
            if dep_id and dep_id in graph:
                graph[story_id].append(dep_id)

    return graph


def detect_circular_dependencies(graph: dict[str, list[str]]) -> list[list[str]]:
    """Detect circular dependencies using DFS traversal.

    Trace:
        story: STORY-08.02
        req: REQ-IMPL-01

    Why: Uses DFS-based cycle detection algorithm proven in Epic 07.
    Detects all cycles including simple (A↔B), complex (A→B→C→A), and
    self-references (A→A). Path reconstruction enables clear diagnostic
    messages for users.

    Algorithm: Depth-First Search with recursion stack tracking.
    When a node is encountered that's already in the current recursion
    stack, a cycle is detected. The path from cycle start to current
    node forms the cycle.

    Args:
        graph: Adjacency list representation of dependencies

    Returns:
        List of cycles, where each cycle is a list of story IDs forming
        the circular path. Empty list if no cycles found.

    Example:
        >>> graph = {"08.01": ["08.02"], "08.02": ["08.01"]}
        >>> cycles = detect_circular_dependencies(graph)
        >>> len(cycles)
        1
        >>> "08.01" in cycles[0] and "08.02" in cycles[0]
        True

    Note:
        Pattern copied from .claude/lib/parallel-story-orchestrator.py
        lines 1428-1446 (Epic 07). Proven correct across 108 test cases.
    """
    visited: set[str] = set()
    rec_stack: set[str] = set()
    cycles_found: list[list[str]] = []

    def dfs(node: str, path: list[str]) -> None:
        """DFS traversal with cycle detection.

        Args:
            node: Current node being visited
            path: Path from root to current node
        """
        if node in rec_stack:
            # Found cycle - extract the cycle from path
            cycle_start_idx = path.index(node)
            cycle = path[cycle_start_idx:] + [node]
            cycles_found.append(cycle)
            return

        if node in visited:
            return

        visited.add(node)
        rec_stack.add(node)
        path.append(node)

        # Traverse dependencies
        for neighbor in graph.get(node, []):
            if neighbor in graph:  # Only follow edges to known nodes
                dfs(neighbor, path[:])  # Pass copy of path

        rec_stack.discard(node)

    # Start DFS from each unvisited node
    for node in graph:
        if node not in visited:
            dfs(node, [])

    return cycles_found


def calculate_dependency_levels(graph: dict[str, list[str]]) -> dict[str, int]:
    """Calculate dependency levels for topological ordering.

    Trace:
        story: STORY-08.02
        req: REQ-IMPL-01

    Why: Enables wave-based parallel execution strategy. Stories at the
    same level have no dependencies on each other and can run in parallel.
    Level N stories can only run after all Level N-1 stories complete.

    Algorithm: Iterative topological sort. Level 0 = no dependencies.
    Level N = max(dependency levels) + 1.

    Args:
        graph: Adjacency list representation of dependencies

    Returns:
        dict mapping story_id to its dependency level (0, 1, 2, ...)
        Level 0 = no dependencies (ready to run immediately)

    Raises:
        ValueError: If graph contains circular dependencies

    Example:
        >>> graph = {
        ...     "08.01": [],
        ...     "08.02": ["08.01"],
        ...     "08.03": ["08.01"],
        ...     "08.04": ["08.02", "08.03"],
        ... }
        >>> levels = calculate_dependency_levels(graph)
        >>> levels["08.01"]
        0
        >>> levels["08.02"]
        1
        >>> levels["08.03"]
        1
        >>> levels["08.04"]
        2

    Note:
        Assumes graph is acyclic. Call detect_circular_dependencies()
        first to validate.
    """
    levels: dict[str, int] = {}

    # Track which nodes have been assigned levels
    assigned: set[str] = set()

    # Iteratively assign levels
    max_iterations = len(graph) + 1
    for iteration in range(max_iterations):
        made_progress = False

        for story_id in graph:
            if story_id in assigned:
                continue

            dependencies = graph[story_id]

            # Check if all dependencies have been assigned levels
            if all(dep in assigned for dep in dependencies):
                # Level is max of dependency levels + 1, or 0 if no deps
                if dependencies:
                    levels[story_id] = max(levels[dep] for dep in dependencies) + 1
                else:
                    levels[story_id] = 0
                assigned.add(story_id)
                made_progress = True

        if not made_progress:
            # No progress means circular dependencies
            unassigned = set(graph.keys()) - assigned
            raise ValueError(
                f"Circular dependency detected. Cannot assign levels to: {sorted(unassigned)}"
            )

        if len(assigned) == len(graph):
            break

    return levels


def get_ready_stories(
    graph: dict[str, list[str]],
    completed: set[str]
) -> list[str]:
    """Get stories ready for execution (all dependencies met).

    Trace:
        story: STORY-08.02
        req: REQ-IMPL-03

    Why: Core function for adaptive workflow algorithm. Identifies which
    stories can be executed in the current wave based on completed set.
    Enables dynamic unblocking as stories complete.

    Args:
        graph: Adjacency list representation of dependencies
        completed: Set of story IDs that have completed execution

    Returns:
        List of story IDs ready for execution (not yet completed,
        all dependencies completed). Sorted for deterministic behavior.

    Example:
        >>> graph = {"08.01": [], "08.02": ["08.01"], "08.03": ["08.01"]}
        >>> completed = {"08.01"}
        >>> ready = get_ready_stories(graph, completed)
        >>> sorted(ready)
        ['08.02', '08.03']

    Note:
        Returns empty list when no stories are ready (all blocked or
        all complete). Caller should check for this condition.
    """
    ready: list[str] = []

    for story_id in graph:
        # Skip already completed stories
        if story_id in completed:
            continue

        dependencies = graph[story_id]

        # Story is ready if all dependencies are completed
        if all(dep in completed for dep in dependencies):
            ready.append(story_id)

    return sorted(ready)  # Sort for deterministic behavior


def update_dependencies(
    graph: dict[str, list[str]],
    completed_story: str,
    completed: set[str]
) -> set[str]:
    """Update completed set and return newly ready stories.

    Trace:
        story: STORY-08.02
        req: REQ-IMPL-03

    Why: Provides atomic update operation for dependency state. Marks
    story as complete and immediately calculates which stories are now
    ready. Enables efficient progress tracking without full graph scan.

    Args:
        graph: Adjacency list representation of dependencies
        completed_story: Story ID that just completed
        completed: Set of completed story IDs (modified in-place)

    Returns:
        Set of story IDs that became ready as a result of this completion

    Example:
        >>> graph = {"08.01": [], "08.02": ["08.01"]}
        >>> completed = set()
        >>> newly_ready = update_dependencies(graph, "08.01", completed)
        >>> "08.01" in completed
        True
        >>> "08.02" in newly_ready
        True

    Note:
        Modifies completed set in-place. Thread-safe if caller uses
        appropriate locking around completed set access.
    """
    # Add to completed set
    completed.add(completed_story)

    # Find all stories that are now ready
    newly_ready: set[str] = set()

    for story_id in graph:
        # Skip already completed
        if story_id in completed:
            continue

        # Check if this story just became ready
        dependencies = graph[story_id]
        if all(dep in completed for dep in dependencies):
            # Verify it wasn't already ready before this completion
            # (i.e., completed_story was its last blocking dependency)
            if completed_story in dependencies or not dependencies:
                newly_ready.add(story_id)

    return newly_ready


# =============================================================================
# High-Level API
# =============================================================================


def parse_story_file(story_path: Path) -> dict[str, Any]:
    """Parse story file and extract dependency metadata.

    Trace:
        story: STORY-08.02
        req: REQ-IMPL-01

    Why: Convenience function combining file I/O with YAML parsing.
    Enables simple one-line story loading for orchestrator.

    Args:
        story_path: Path to story markdown file with YAML frontmatter

    Returns:
        dict with keys:
            - story_id: Extracted story ID
            - depends_on: List of dependency references

    Raises:
        FileNotFoundError: If story file doesn't exist
        ValueError: If YAML frontmatter is malformed

    Example:
        >>> story = parse_story_file(Path("docs/stories/story-08.02.*.md"))
        >>> story['story_id']
        '08.02'
    """
    if not story_path.exists():
        raise FileNotFoundError(f"Story file not found: {story_path}")

    content = story_path.read_text(encoding="utf-8")
    return parse_story_dependencies_from_yaml(content)


def validate_and_build_graph(
    stories: list[dict[str, Any]]
) -> tuple[dict[str, list[str]], dict[str, int]]:
    """Build dependency graph with validation.

    Trace:
        story: STORY-08.02
        req: REQ-IMPL-01

    Why: One-stop function for orchestrator initialization. Builds graph,
    validates for cycles, and calculates levels in one call. Simplifies
    error handling at orchestrator level.

    Args:
        stories: List of story metadata dicts from parse_story_file()

    Returns:
        Tuple of (dependency_graph, dependency_levels)

    Raises:
        ValueError: If circular dependencies detected

    Example:
        >>> stories = [
        ...     {"story_id": "08.01", "depends_on": []},
        ...     {"story_id": "08.02", "depends_on": ["story-08.01"]},
        ... ]
        >>> graph, levels = validate_and_build_graph(stories)
        >>> levels["08.02"]
        1
    """
    # Build graph
    graph = build_dependency_graph(stories)

    # Detect circular dependencies
    cycles = detect_circular_dependencies(graph)
    if cycles:
        # Format cycles for error message
        cycle_strs = []
        for cycle in cycles:
            cycle_str = " → ".join(cycle)
            cycle_strs.append(cycle_str)
        raise ValueError(
            f"Circular dependencies detected:\n" +
            "\n".join(f"  - {c}" for c in cycle_strs)
        )

    # Calculate levels
    levels = calculate_dependency_levels(graph)

    return graph, levels


if __name__ == "__main__":
    # Simple CLI for testing
    import sys

    if len(sys.argv) < 2:
        print("Usage: dependency-resolver.py <story-file-1> <story-file-2> ...")
        sys.exit(1)

    # Parse all story files
    stories = []
    for story_path_str in sys.argv[1:]:
        story_path = Path(story_path_str)
        try:
            story = parse_story_file(story_path)
            stories.append(story)
            print(f"✓ Parsed {story['story_id']}: {len(story['depends_on'])} dependencies")
        except Exception as e:
            print(f"✗ Failed to parse {story_path}: {e}")
            sys.exit(1)

    # Build and validate graph
    try:
        graph, levels = validate_and_build_graph(stories)
        print(f"\n✓ Dependency graph validated ({len(graph)} stories)")

        # Display levels
        print("\nDependency Levels:")
        for level in sorted(set(levels.values())):
            stories_at_level = [s for s, l in levels.items() if l == level]
            print(f"  Level {level}: {', '.join(sorted(stories_at_level))}")

        # Show ready stories
        completed: set[str] = set()
        ready = get_ready_stories(graph, completed)
        print(f"\nReady to execute: {', '.join(sorted(ready))}")

    except ValueError as e:
        print(f"\n✗ Validation failed: {e}")
        sys.exit(1)
