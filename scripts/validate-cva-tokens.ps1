# Validate CVA file uses design tokens, not hardcoded colors
# PowerShell version for Windows

$FORBIDDEN_PATTERNS = @(
    "bg-blue-",
    "bg-gray-",
    "bg-white",
    "text-white",
    "bg-black",
    "text-black",
    "bg-red-",
    "bg-green-",
    "bg-yellow-",
    "border-blue-",
    "border-gray-",
    "#[0-9a-fA-F]{3,6}"
)

$CVA_FILE = "web-app\lib\cva-variants.ts"

Write-Host "Validating CVA design token usage..." -ForegroundColor Cyan
$VIOLATIONS = 0

# Check if file exists
if (-not (Test-Path $CVA_FILE)) {
    Write-Host "❌ Error: File $CVA_FILE not found" -ForegroundColor Red
    exit 1
}

foreach ($pattern in $FORBIDDEN_PATTERNS) {
    # Read file and search for pattern, excluding comment lines
    $matches = Select-String -Path $CVA_FILE -Pattern $pattern | Where-Object {
        $_.Line -notmatch '^\s*\*' -and $_.Line -notmatch '^\s*//'
    }
    
    if ($matches) {
        Write-Host "❌ FORBIDDEN: Found hardcoded color pattern '$pattern' in $CVA_FILE" -ForegroundColor Red
        $matches | ForEach-Object {
            Write-Host "  Line $($_.LineNumber): $($_.Line.Trim())" -ForegroundColor Yellow
        }
        $VIOLATIONS++
    }
}

if ($VIOLATIONS -eq 0) {
    Write-Host "✅ PASS: All CVA variants use design system tokens" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ FAIL: Found $VIOLATIONS hardcoded color pattern(s)" -ForegroundColor Red
    Write-Host "Fix: Replace all hardcoded colors with semantic tokens from Story 1.11" -ForegroundColor Yellow
    exit 1
}
