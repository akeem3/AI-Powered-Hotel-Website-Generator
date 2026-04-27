# LangGraph Workflow Tests Directory

This directory contains tests for LangGraph multi-agent workflow systems.

## Purpose
- Multi-agent workflow testing
- LLM integration testing
- Cost monitoring validation
- Complex state management testing

## Usage
Run with: `npm run test:workflow`

## Directory Structure
- `workflows/` - End-to-end workflow tests
- `agents/` - Individual agent unit tests
- `llm/` - LLM service integration tests
- `cost/` - Cost monitoring and budget control tests

## Test Characteristics
- Extended timeout (120 seconds)
- Complex mocking for LangGraph agents
- Cost monitor state management
- LLM API integration simulation
- Serial execution for state consistency

## Setup
Uses `jest.workflow.setup.js` for comprehensive LangGraph mocking setup including:
- Cost monitor mocking with reset functionality
- LangGraph agent prototype mocking
- LLM service mocking
- LangFuse integration mocking