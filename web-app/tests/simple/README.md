# Simple Tests Directory

This directory contains lightweight unit tests that run quickly without complex mocking.

## Purpose
- Fast unit tests for utility functions
- Simple component rendering tests
- Contract validation tests
- Quick validation tests

## Usage
Run with: `npm run test:simple`

## File Organization
- `utils/` - Utility function tests
- `contracts/` - ZOD contract validation tests (linked from main contracts directory)
- `components/` - Simple component unit tests

## Test Characteristics
- Fast execution (< 5 seconds timeout)
- Minimal mocking requirements
- No complex LLM or workflow integration
- Focus on pure functions and simple components