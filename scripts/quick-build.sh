#!/bin/bash
################################################################################
# Quick Build: Build website from latest JSON config (one command)
#
# Usage: ./quick-build.sh [dev]
#
# Options:
#   dev    Start development server instead of static build
################################################################################

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ "${1:-}" == "dev" ]]; then
    # Development mode
    "$SCRIPT_DIR/build-from-config.sh" --dev
else
    # Production build
    "$SCRIPT_DIR/build-from-config.sh" --production
fi
