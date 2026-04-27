#!/bin/bash
################################################################################
# Build Hotel Website from Generated JSON Config
#
# Usage:
#   ./build-from-config.sh [options]
#
# Options:
#   -c, --config FILE     Specific JSON config file to use (default: latest)
#   -a, --all             Build websites for ALL JSON configs in output/
#   -o, --output DIR      Output directory for built sites (default: ./dist)
#   -p, --production      Production build (minified, optimized)
#   -d, --dev             Development build with dev server
#   -h, --help            Show this help message
#
# Examples:
#   ./build-from-config.sh                                    # Build from latest config
#   ./build-from-config.sh -c output/homepage-config-*.json  # Build from specific file
#   ./build-from-config.sh -a                                 # Build all configs
#   ./build-from-config.sh -p -o ./build                      # Production build
################################################################################

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")/web-app"
OUTPUT_DIR="${PROJECT_ROOT}/../output"
BUILD_DIR="${PROJECT_ROOT}/../dist"
CONFIG_FILE=""
BUILD_ALL=false
PRODUCTION_MODE=false
DEV_MODE=false

# Logging functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Print help message
show_help() {
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════╗
║   Hotel Website Builder - Build from Generated JSON Configs ║
╚══════════════════════════════════════════════════════════════╝

Build Hotel Website from Generated JSON Config

Usage:
  ./build-from-config.sh [options]

Options:
  -c, --config FILE     Specific JSON config file to use (default: latest)
  -a, --all             Build websites for ALL JSON configs in output/
  -o, --output DIR      Output directory for built sites (default: ./dist)
  -p, --production      Production build (minified, optimized)
  -d, --dev             Development build with dev server
  -h, --help            Show this help message

Examples:
  ./build-from-config.sh                                    # Build from latest config
  ./build-from-config.sh -c output/homepage-config-*.json  # Build from specific file
  ./build-from-config.sh -a                                 # Build all configs
  ./build-from-config.sh -p -o ./build                      # Production build
EOF
    exit 0
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -c|--config)
                CONFIG_FILE="$2"
                shift 2
                ;;
            -a|--all)
                BUILD_ALL=true
                shift
                ;;
            -o|--output)
                BUILD_DIR="$2"
                shift 2
                ;;
            -p|--production)
                PRODUCTION_MODE=true
                shift
                ;;
            -d|--dev)
                DEV_MODE=true
                shift
                ;;
            -h|--help)
                show_help
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                ;;
        esac
    done
}

# Validate prerequisites
validate_prerequisites() {
    log_info "Validating prerequisites..."

    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi

    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi

    # Check if project root exists
    if [[ ! -d "$PROJECT_ROOT" ]]; then
        log_error "Project root not found: $PROJECT_ROOT"
        exit 1
    fi

    # Check if output directory exists
    if [[ ! -d "$OUTPUT_DIR" ]]; then
        log_error "Output directory not found: $OUTPUT_DIR"
        exit 1
    fi

    # Check if node_modules exists
    if [[ ! -d "$PROJECT_ROOT/node_modules" ]]; then
        log_warning "node_modules not found, installing dependencies..."
        cd "$PROJECT_ROOT"
        npm install
    fi

    log_success "Prerequisites validated"
}

# Get all JSON config files
get_config_files() {
    find "$OUTPUT_DIR" -name "homepage-config-*.json" -type f | sort
}

# Get latest config file
get_latest_config() {
    find "$OUTPUT_DIR" -name "homepage-config-*.json" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-
}

# Extract hotel name from config JSON
extract_hotel_name() {
    local config_file="$1"
    jq -r '.hotelParameters.hotelName // .hotelName // "Unknown Hotel"' "$config_file" 2>/dev/null || echo "Unknown Hotel"
}

# Extract hotel type from config JSON
extract_hotel_type() {
    local config_file="$1"
    jq -r '.hotelParameters.hotelType // "budget"' "$config_file" 2>/dev/null || echo "budget"
}

# Sanitize string for directory name
sanitize_name() {
    local name="$1"
    # Convert to lowercase, replace spaces with hyphens, remove special chars
    echo "$name" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/-\+/-/g' | sed 's/^-\|-$//g'
}

# Build website from a single config
build_from_config() {
    local config_file="$1"
    local output_subdir="$2"

    log_info "Building website from: $config_file"

    # Extract hotel info
    local hotel_name=$(extract_hotel_name "$config_file")
    local hotel_type=$(extract_hotel_type "$config_file")
    local sanitized_name=$(sanitize_name "$hotel_name")

    log_info "Hotel: $hotel_name ($hotel_type)"

    # Create output directory
    local site_build_dir="$BUILD_DIR/$output_subdir"
    mkdir -p "$site_build_dir"

    # Copy config to web-app for Next.js to use
    log_info "Preparing configuration..."
    cp "$config_file" "$PROJECT_ROOT/public/homepage-config.json"

    # Set environment for preview route
    export PREVIEW_ENABLED="true"
    export NEXT_PUBLIC_HOTEL_NAME="$hotel_name"
    export NEXT_PUBLIC_HOTEL_TYPE="$hotel_type"

    # Change to web-app directory
    cd "$PROJECT_ROOT"

    if [[ "$DEV_MODE" == true ]]; then
        log_info "Starting development server..."
        log_info "Preview will be available at http://localhost:3000/preview"
        npm run dev
    else
        # Build the Next.js application
        log_info "Building Next.js application..."

        # Enable static export in next.config.ts
        export NEXT_OUTPUT=export

        if [[ "$PRODUCTION_MODE" == true ]]; then
            npm run build
        else
            # Development build - don't set NODE_ENV (Next.js handles it)
            npm run build
        fi

        # Copy built files to output directory
        # With output: 'export', static files are in the 'out' directory
        log_info "Copying built files to $site_build_dir"

        # Check if out directory exists
        if [[ -d "$PROJECT_ROOT/out" ]]; then
            cp -r "$PROJECT_ROOT/out"/* "$site_build_dir/"
        else
            log_error "Build output directory not found: $PROJECT_ROOT/out"
            return 1
        fi

        # Copy the JSON config to the output for reference
        cp "$config_file" "$site_build_dir/homepage-config.json"

        log_success "Website built: $site_build_dir"
    fi
}

# Build all websites from all configs
build_all() {
    log_info "Building websites for ALL configs in $OUTPUT_DIR"

    local config_files=($(get_config_files))
    local count=${#config_files[@]}

    if [[ $count -eq 0 ]]; then
        log_error "No config files found in $OUTPUT_DIR"
        exit 1
    fi

    log_info "Found $count config file(s)"

    local built=0
    local failed=0

    for config_file in "${config_files[@]}"; do
        local hotel_name=$(extract_hotel_name "$config_file")
        local sanitized_name=$(sanitize_name "$hotel_name")

        log_info "[$((built + failed + 1))/$count] Building: $hotel_name"

        if build_from_config "$config_file" "$sanitized_name"; then
            ((built++))
            log_success "✓ Built: $hotel_name"
        else
            ((failed++))
            log_error "✗ Failed: $hotel_name"
        fi
    done

    echo ""
    log_info "Build Summary:"
    log_info "  Total: $count"
    log_success "  Built: $built"
    if [[ $failed -gt 0 ]]; then
        log_error "  Failed: $failed"
    fi

    # Create index.html with links to all sites
    create_index_page "$count" "$built" "$failed"
}

# Create index page listing all built websites
create_index_page() {
    local total=$1
    local built=$2
    local failed=$3

    local index_file="$BUILD_DIR/index.html"

    log_info "Creating index page: $index_file"

    # Add website cards
    local websites_html=""
    for config_file in "${config_files[@]}"; do
        local hotel_name=$(extract_hotel_name "$config_file")
        local hotel_type=$(extract_hotel_type "$config_file")
        local sanitized_name=$(sanitize_name "$hotel_name")

        websites_html+="
            <div class=\"website-card\">
                <a href=\"$sanitized_name/index.html\">
                    <div class=\"card-header\">
                        <h3>$hotel_name</h3>
                        <div class=\"type\">$hotel_type</div>
                    </div>
                    <div class=\"card-body\">
                        <p>Click to view the generated website</p>
                    </div>
                    <div class=\"card-footer\">
                        <span>View Site →</span>
                    </div>
                </a>
            </div>"
    done

    cat > "$index_file" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Hotel Websites</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 2rem;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            color: white;
            text-align: center;
            margin-bottom: 2rem;
            font-size: 2.5rem;
        }
        .summary {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .summary h2 {
            margin-bottom: 1rem;
            color: #333;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
        }
        .stat {
            text-align: center;
            padding: 1rem;
            border-radius: 8px;
        }
        .stat.total { background: #e3f2fd; color: #1976d2; }
        .stat.built { background: #e8f5e9; color: #388e3c; }
        .stat.failed { background: #ffebee; color: #d32f2f; }
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
        }
        .websites {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
        }
        .website-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .website-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 12px rgba(0,0,0,0.15);
        }
        .website-card a {
            text-decoration: none;
            color: inherit;
        }
        .card-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1.5rem;
        }
        .card-header h3 {
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
        }
        .card-header .type {
            opacity: 0.9;
            font-size: 0.875rem;
        }
        .card-body {
            padding: 1.5rem;
        }
        .card-body p {
            color: #666;
            line-height: 1.5;
        }
        .card-footer {
            padding: 1rem 1.5rem;
            border-top: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .visit-btn {
            display: inline-block;
            padding: 0.5rem 1rem;
            background: #667eea;
            color: white;
            border-radius: 6px;
            font-weight: 500;
        }
        .visit-btn:hover {
            background: #5568d3;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏨 Generated Hotel Websites</h1>

        <div class="summary">
            <h2>Build Summary</h2>
            <div class="stats">
                <div class="stat total">
                    <div class="stat-number">$total</div>
                    <div>Total Configs</div>
                </div>
                <div class="stat built">
                    <div class="stat-number">$built</div>
                    <div>Built Successfully</div>
                </div>
                <div class="stat failed">
                    <div class="stat-number">$failed</div>
                    <div>Failed</div>
                </div>
            </div>
        </div>

        <div class="websites">
$websites_html
        </div>
    </div>
</body>
</html>
EOF

    log_success "Index page created"
}

# Main function
main() {
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║   Hotel Website Builder - Build from Generated JSON Configs ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""

    parse_args "$@"
    validate_prerequisites

    if [[ "$BUILD_ALL" == true ]]; then
        build_all
    else
        # Determine which config to use
        if [[ -z "$CONFIG_FILE" ]]; then
            CONFIG_FILE=$(get_latest_config)
            log_info "No config specified, using latest: $CONFIG_FILE"
        fi

        if [[ ! -f "$CONFIG_FILE" ]]; then
            log_error "Config file not found: $CONFIG_FILE"
            exit 1
        fi

        # Build from single config
        local hotel_name=$(extract_hotel_name "$CONFIG_FILE")
        local sanitized_name=$(sanitize_name "$hotel_name")

        build_from_config "$CONFIG_FILE" "$sanitized_name"

        echo ""
        log_success "✓ Build complete!"
        echo ""
        log_info "Output location: $BUILD_DIR/$sanitized_name"
        log_info "Open file://$BUILD_DIR/$sanitized_name/index.html in your browser"
    fi
}

# Run main function
main "$@"
