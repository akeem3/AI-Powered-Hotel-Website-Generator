#!/bin/bash

# LLM-Driven Hotel Website Generator - Build Script
# This script builds the complete platform or individual components

set -e  # Exit on any error

echo "🏨 LLM-Driven Hotel Website Generator Build Script"
echo "=================================================="

# Function to build the web-app (reference implementation)
build_web_app() {
    echo "📱 Building Next.js Reference Implementation..."
    cd web-app

    # Ensure we're using local node_modules, not global
    export NODE_PATH="$(pwd)/node_modules"

    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies..."
        npm ci --no-optional
    fi

    # Run the build
    echo "🔨 Building Next.js application..."
    npm run build

    # Verify build success
    if [ -d ".next" ] || [ -d "out" ]; then
        echo "✅ Next.js build completed successfully!"
        echo "📁 Build output: $(pwd)/$( [ -d "out" ] && echo "out" || echo ".next" )"
    else
        echo "❌ Build failed - no output directory found"
        exit 1
    fi

    cd ..
}

# Function to run tests
run_tests() {
    echo "🧪 Running test suite..."
    cd web-app

    if [ -d "node_modules" ]; then
        npm test
        echo "✅ Tests completed!"
    else
        echo "⚠️  Dependencies not installed - skipping tests"
    fi

    cd ..
}

# Function to start development server
start_dev() {
    echo "🚀 Starting development server..."
    cd web-app

    # Ensure dependencies are installed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies first..."
        npm ci --no-optional
    fi

    # Start dev server
    npm run dev
}

# Function to validate project structure
validate_structure() {
    echo "🔍 Validating project structure..."

    # Check essential files
    required_files=(
        "web-app/package.json"
        "web-app/next.config.ts"
        "web-app/tsconfig.json"
        "web-app/tailwind.config.js"
        "docs/prd.md"
        ".bmad-core/core-config.yaml"
    )

    missing_files=()
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done

    if [ ${#missing_files[@]} -eq 0 ]; then
        echo "✅ All required files present!"
    else
        echo "❌ Missing required files:"
        for file in "${missing_files[@]}"; do
            echo "   - $file"
        done
        exit 1
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  build     Build the Next.js reference implementation"
    echo "  test      Run the test suite"
    echo "  dev       Start development server"
    echo "  validate  Validate project structure"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build          # Build the web-app"
    echo "  $0 test           # Run tests"
    echo "  $0 dev            # Start development server"
    echo ""
}

# Main script logic
case "${1:-build}" in
    "build")
        validate_structure
        build_web_app
        ;;
    "test")
        validate_structure
        run_tests
        ;;
    "dev")
        validate_structure
        start_dev
        ;;
    "validate")
        validate_structure
        ;;
    "help"|"-h"|"--help")
        show_usage
        ;;
    *)
        echo "❌ Unknown command: $1"
        show_usage
        exit 1
        ;;
esac

echo ""
echo "🎉 Build script completed!"