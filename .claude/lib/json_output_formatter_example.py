#!/usr/bin/env python3
"""
JSON Output Formatter - Usage Examples
Story 07.04 - Example usage patterns for micro-agents

This file demonstrates how micro-agents should use the json_output_formatter
library to produce consistent JSON output for orchestration.

Usage:
    python3 json_output_formatter_example.py
"""

import json
import sys
from pathlib import Path

# Add lib directory to path
sys.path.insert(0, str(Path(__file__).parent))

from json_output_formatter import format_agent_output, AgentOutputData


def example_1_success_output():
    """Example 1: Basic success output from story-creator agent."""
    print("=" * 70)
    print("Example 1: Story Creator - Success")
    print("=" * 70)

    data = AgentOutputData(
        agent_name="create-story",
        status="success",
        story_id="07.04-json-formatter",
        content="Story created successfully with all required fields",
        issues=[],
        metadata={
            "duration_ms": 150,
            "created_file": "docs/stories/story-07.04.md",
            "version": "1.0.0",
        },
    )

    output = format_agent_output(data)
    print(output)
    print()


def example_2_validation_failed():
    """Example 2: Validation failed output from hallucination-checker."""
    print("=" * 70)
    print("Example 2: Hallucination Checker - Validation Failed")
    print("=" * 70)

    data = AgentOutputData(
        agent_name="hallucination-checker",
        status="validation_failed",
        story_id="03.05-data-model",
        content="Hallucination check found inconsistencies",
        issues=[
            "Story mentions 'UserRepository' but it doesn't exist in codebase",
            "Referenced 'auth_service.py' not found in project structure",
            "Acceptance criteria AC4 references undefined test fixture",
        ],
        metadata={
            "duration_ms": 2340,
            "confidence_score": 0.45,
            "checks_performed": 15,
            "issues_found": 3,
        },
    )

    output = format_agent_output(data)
    print(output)
    print()


def example_3_error_output():
    """Example 3: Error output from verify-story agent."""
    print("=" * 70)
    print("Example 3: Verify Story - Error")
    print("=" * 70)

    data = AgentOutputData(
        agent_name="verify-story",
        status="error",
        story_id="04.02-database-migration",
        content="Story verification failed due to missing dependencies",
        issues=["Required epic file epic-04.md not found"],
        metadata={
            "duration_ms": 50,
            "exit_code": 2,
            "error_type": "FileNotFoundError",
        },
    )

    output = format_agent_output(data)
    print(output)
    print()


def example_4_html_escaping():
    """Example 4: Content with HTML that gets escaped."""
    print("=" * 70)
    print("Example 4: Security Validator - HTML Escaping")
    print("=" * 70)

    data = AgentOutputData(
        agent_name="security-validator",
        status="validation_failed",
        story_id="05.01-xss-prevention",
        content="Found potential XSS vulnerability: <script>alert('XSS')</script>",
        issues=[
            "User input not sanitized in <form> submission",
            "Missing Content-Security-Policy header",
        ],
        metadata={
            "duration_ms": 890,
            "severity": "high",
            "cwe_id": "CWE-79",
        },
    )

    output = format_agent_output(data)
    print(output)
    print("\nNote: HTML entities are escaped to prevent XSS:")
    print("  <script> becomes &lt;script&gt;")
    print()


def example_5_complex_metadata():
    """Example 5: Complex nested metadata structure."""
    print("=" * 70)
    print("Example 5: Test Gen Agent - Complex Metadata")
    print("=" * 70)

    data = AgentOutputData(
        agent_name="test-gen-agent",
        status="success",
        story_id="06.03-test-generation",
        content="Generated 12 unit tests and 5 integration tests",
        issues=[],
        metadata={
            "duration_ms": 4500,
            "tests_generated": {
                "unit": 12,
                "integration": 5,
                "total": 17,
            },
            "coverage_estimate": {
                "lines": 95.5,
                "branches": 87.3,
            },
            "frameworks_used": ["pytest", "pytest-asyncio", "httpx"],
            "validated": True,
        },
    )

    output = format_agent_output(data)
    print(output)
    print()


def example_6_orchestrator_integration():
    """Example 6: How orchestrator parses and aggregates outputs."""
    print("=" * 70)
    print("Example 6: Orchestrator Integration Pattern")
    print("=" * 70)

    # Simulate multiple agent outputs
    agents_outputs = [
        AgentOutputData(
            agent_name="create-story",
            status="success",
            story_id="07.01-agent-output",
            content="Story created",
            issues=[],
            metadata={"duration_ms": 120},
        ),
        AgentOutputData(
            agent_name="hallucination-checker",
            status="success",
            story_id="07.01-agent-output",
            content="No hallucinations detected",
            issues=[],
            metadata={"duration_ms": 230, "confidence": 0.98},
        ),
        AgentOutputData(
            agent_name="security-validator",
            status="success",
            story_id="07.01-agent-output",
            content="Security checks passed",
            issues=[],
            metadata={"duration_ms": 180, "checks_performed": 8},
        ),
    ]

    # Orchestrator collects results
    results = []
    for agent_data in agents_outputs:
        json_output = format_agent_output(agent_data)
        parsed = json.loads(json_output)
        results.append(parsed)

    # Aggregate statistics
    print("Orchestrator aggregated results:")
    print(f"  Total agents: {len(results)}")
    print(f"  All succeeded: {all(r['status'] == 'success' for r in results)}")
    print(f"  Total duration: {sum(r['metadata']['duration_ms'] for r in results)}ms")
    print(f"  Story ID: {results[0]['story_id']}")
    print()


def main():
    """Run all examples."""
    print("\n" + "=" * 70)
    print("JSON Output Formatter - Usage Examples")
    print("Story 07.04 - Shared Library for Micro-Agent Output")
    print("=" * 70 + "\n")

    example_1_success_output()
    example_2_validation_failed()
    example_3_error_output()
    example_4_html_escaping()
    example_5_complex_metadata()
    example_6_orchestrator_integration()

    print("=" * 70)
    print("All examples completed successfully!")
    print("=" * 70)


if __name__ == "__main__":
    main()
