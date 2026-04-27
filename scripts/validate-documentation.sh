#!/bin/bash
# Validate component documentation quality

DOCS_DIR="docs/components"
GOLDEN_DIR="docs/components/golden-datasets"

echo "Validating component documentation..."

# Check all 8 component docs exist
EXPECTED_DOCS=("hero-section" "navigation" "room-cards" "booking-widget" "contact-form" "image-gallery" "testimonials" "amenities")
MISSING_DOCS=0

for doc in "${EXPECTED_DOCS[@]}"; do
  if [ ! -f "$DOCS_DIR/$doc.md" ]; then
    echo "❌ Missing: $DOCS_DIR/$doc.md"
    MISSING_DOCS=$((MISSING_DOCS + 1))
  else
    echo "✅ Found: $doc.md"
  fi
done

# Check all golden datasets exist
for doc in "${EXPECTED_DOCS[@]}"; do
  GOLDEN_FILE="$GOLDEN_DIR/$doc-golden.json"
  if [ ! -f "$GOLDEN_FILE" ]; then
    echo "❌ Missing: $GOLDEN_FILE"
    MISSING_DOCS=$((MISSING_DOCS + 1))
  else
    # Validate JSON is parseable using node (since jq isn't available)
    if ! node -e "JSON.parse(require('fs').readFileSync('$GOLDEN_FILE', 'utf8')); console.log('Valid JSON');" 2>/dev/null; then
      echo "❌ Invalid JSON: $GOLDEN_FILE"
      MISSING_DOCS=$((MISSING_DOCS + 1))
    else
      # Count test cases by counting "id" fields
      TEST_CASES=$(grep -c '"id":' "$GOLDEN_FILE")
      if [ "$TEST_CASES" -lt 3 ]; then
        echo "⚠️  Warning: $doc-golden.json has only $TEST_CASES test cases (minimum 3 recommended)"
      else
        echo "✅ Valid: $doc-golden.json ($TEST_CASES test cases)"
      fi
    fi
  fi
done

if [ $MISSING_DOCS -eq 0 ]; then
  echo "✅ All documentation files valid"
  exit 0
else
  echo "❌ Found $MISSING_DOCS issue(s)"
  exit 1
fi