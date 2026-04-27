#!/bin/bash
# Validate CVA file uses design tokens, not hardcoded colors
# Story 12.5: Variant Consistency Validation

# Find project root (directory containing this script)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CVA_FILE="$PROJECT_ROOT/web-app/lib/cva-variants.ts"

FORBIDDEN_PATTERNS=(
  "bg-blue-"
  "bg-gray-"
  "bg-white"
  "text-white"
  "bg-black"
  "text-black"
  "bg-red-"
  "bg-green-"
  "bg-yellow-"
  "border-blue-"
  "border-gray-"
  "border-red-"
  "border-green-"
  "border-yellow-"
  "#[0-9a-fA-F]{3,6}"
  "\[#[0-9a-fA-F]+\]"
  "\[[0-9]+px\]"
)

echo "🔍 Validating CVA design token usage..."
echo "=========================================="
VIOLATIONS=0

# Check if file exists
if [ ! -f "$CVA_FILE" ]; then
  echo "❌ Error: File $CVA_FILE not found"
  exit 1
fi

# Check forbidden patterns (basic grep patterns)
for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
  # Use grep to find pattern, excluding lines that start with * (comments)
  if grep -n "$pattern" "$CVA_FILE" | grep -v "^[0-9]*:[[:space:]]*\*"; then
    echo "❌ FORBIDDEN: Found hardcoded pattern '$pattern' in $CVA_FILE"
    VIOLATIONS=$((VIOLATIONS + 1))
  fi
done

# Check RGB/HSL function patterns (use extended regex)
FUNCTION_PATTERNS=("rgb" "rgba" "hsl")
for func in "${FUNCTION_PATTERNS[@]}"; do
  # Match function calls like rgb(, rgba(, hsl(
  if grep -nE "${func}\(" "$CVA_FILE" | grep -v "^[0-9]*:[[:space:]]*\*"; then
    echo "❌ FORBIDDEN: Found ${func}() function call in $CVA_FILE"
    VIOLATIONS=$((VIOLATIONS + 1))
  fi
done

# Validate semantic token presence
echo ""
echo "Checking for required semantic tokens..."

BRAND_TOKENS=$(grep -c 'brand-primary\|brand-secondary' "$CVA_FILE" || echo "0")
SURFACE_TOKENS=$(grep -c 'surface-' "$CVA_FILE" || echo "0")
TEXT_TOKENS=$(grep -c 'text-text-\|text-on-' "$CVA_FILE" || echo "0")
BORDER_TOKENS=$(grep -c 'border-border-\|border-brand-\|border-surface-' "$CVA_FILE" || echo "0")

# Check for minimum required semantic tokens
MISSING_SEMANTIC=0
if [ "$BRAND_TOKENS" -eq 0 ]; then
  echo "⚠️  WARNING: No brand-primary or brand-secondary tokens found"
  MISSING_SEMANTIC=1
fi
if [ "$SURFACE_TOKENS" -eq 0 ]; then
  echo "⚠️  WARNING: No surface- tokens found"
  MISSING_SEMANTIC=1
fi
if [ "$TEXT_TOKENS" -eq 0 ]; then
  echo "⚠️  WARNING: No semantic text tokens (text-text-, text-on-) found"
  MISSING_SEMANTIC=1
fi

# Summary output
echo ""
echo "=== CVA Token Audit Summary ==="
echo "Total lines scanned: $(wc -l < "$CVA_FILE")"
echo "Forbidden patterns found: $VIOLATIONS"
echo "Brand tokens (brand-primary/secondary): $BRAND_TOKENS"
echo "Surface tokens: $SURFACE_TOKENS"
echo "Semantic text tokens: $TEXT_TOKENS"
echo "Semantic border tokens: $BORDER_TOKENS"
echo ""

# Determine pass/fail
if [ $VIOLATIONS -gt 0 ]; then
  echo "❌ FAIL: Found $VIOLATIONS forbidden pattern(s)"
  echo "Fix: Replace all hardcoded colors with semantic tokens from Story 1.11"
  exit 1
elif [ $MISSING_SEMANTIC -eq 1 ]; then
  echo "⚠️  WARNING: Some required semantic tokens are missing"
  echo "Info: CVA file should use brand-primary, surface-, and text-text- tokens"
  exit 0
else
  echo "✅ PASS: All CVA variants use design system tokens"
  exit 0
fi
