#!/bin/bash
# AC6.1: Style Anti-Pattern Linter
# Validates no style anti-patterns exist in production components.
# Excludes: tests, stories, mocks, documentation.

set -e

VIOLATIONS=0
EXCLUDE_PATTERN="test\|spec\|stories\|mock\|\.test\.\|\.spec\."

echo "🔍 Checking for style anti-patterns..."
echo ""

# Check for inline styles (excluding allowed cases like scrollBehavior)
INLINE_STYLES=$(grep -r "style={{" web-app/components/ --include="*.tsx" 2>/dev/null | grep -v "$EXCLUDE_PATTERN" | grep -v "scrollBehavior" | grep -v "// inline-ok" || true)
if [ -n "$INLINE_STYLES" ]; then
  echo "❌ FORBIDDEN: Inline style objects found (use Tailwind or CVA)"
  echo "$INLINE_STYLES"
  echo ""
  VIOLATIONS=$((VIOLATIONS + 1))
fi

# Check for hardcoded status colors in components
# Note: bg-red-*, bg-green-* for status should use --status-error, --status-success
STATUS_COLORS=$(grep -rn "bg-red-\|border-red-\|text-red-\|bg-green-\|text-green-" web-app/components/ --include="*.tsx" 2>/dev/null | grep -v "$EXCLUDE_PATTERN" || true)
if [ -n "$STATUS_COLORS" ]; then
  echo "❌ FORBIDDEN: Hardcoded status colors found (use status-error/status-success tokens)"
  echo "$STATUS_COLORS"
  echo ""
  VIOLATIONS=$((VIOLATIONS + 1))
fi

# Check for typos (known issues)
TYPOS=$(grep -rn "bg-liner-" web-app/ --include="*.tsx" 2>/dev/null | grep -v "$EXCLUDE_PATTERN" || true)
if [ -n "$TYPOS" ]; then
  echo "❌ TYPO: 'bg-liner-' should be 'bg-gradient-'"
  echo "$TYPOS"
  echo ""
  VIOLATIONS=$((VIOLATIONS + 1))
fi

# Check for arbitrary Tailwind values (AC5.2 rule)
ARBITRARY_VALUES=$(grep -rn "\[.*px.*\]" web-app/components/ --include="*.tsx" 2>/dev/null | grep -v "$EXCLUDE_PATTERN" | grep -v "// arbitrary-ok" | grep -E "p-\[|m-\[|px-\[|py-\[|w-\[|h-\[" | head -20 || true)
if [ -n "$ARBITRARY_VALUES" ]; then
  echo "⚠️  WARNING: Arbitrary Tailwind values found (consider CVA variant)"
  echo "$ARBITRARY_VALUES"
  echo ""
  # Don't count as violation, just warn
fi

if [ $VIOLATIONS -eq 0 ]; then
  echo "✅ PASS: No style anti-patterns found"
  exit 0
else
  echo "❌ FAIL: Found $VIOLATIONS style anti-pattern category(ies)"
  exit 1
fi
