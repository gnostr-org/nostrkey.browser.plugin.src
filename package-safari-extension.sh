#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Help
# ==============================================================================
usage() {
    cat <<'EOF'
Usage: package-safari-extension.sh [OPTIONS] [EXTENSION_SRC] [-- [PACKAGER_ARGS...]]

Package or rebuild a Safari Web Extension into an Xcode project using Xcode's
`safari-web-extension-packager`.

Options:
  -h, --help    Show this help text and exit.

Arguments:
  EXTENSION_SRC Path to the built Safari extension directory.
                Default: ./distros/safari
  PACKAGER_ARGS Additional arguments forwarded to
                `safari-web-extension-packager` after `--`.

Examples:
  package-safari-extension.sh
  package-safari-extension.sh ./distros/safari -- --force --no-open
EOF
}

# ==============================================================================
# Configuration Variables
# ==============================================================================
EXTENSION_SRC="./distros/safari"
PACKAGER_ARGS=()
PACKAGER_SHOW_HELP=false

while (($#)); do
    case "$1" in
        -h|--help)
            usage
            exit 0
            ;;
        --)
            shift
            PACKAGER_ARGS=("$@")
            break
            ;;
        -*)
            echo "Error: unsupported option '$1'." >&2
            echo "Use '--' before additional packager arguments." >&2
            exit 1
            ;;
        *)
            if [[ "$EXTENSION_SRC" != "./distros/safari" ]]; then
                echo "Error: unexpected extra argument '$1'." >&2
                usage >&2
                exit 1
            fi
            EXTENSION_SRC="$1"
            ;;
    esac
    shift
done

for arg in "${PACKAGER_ARGS[@]}"; do
    case "$arg" in
        -h|--help)
            PACKAGER_SHOW_HELP=true
            break
            ;;
    esac
done

# Output directory where the generated Xcode project will be saved
PROJECT_LOCATION="./safari-build"
PROJECT_FILE="$PROJECT_LOCATION/GnostrKey.xcodeproj"

# App and Xcode Project metadata
APP_NAME="GnostrKey"
BUNDLE_IDENTIFIER="org.gnostr.GnostrKey"

# ==============================================================================
# Pre-flight Checks
# ==============================================================================
echo "==> Verifying environment..."

# Check if running on macOS
if [[ "$(uname)" != "Darwin" ]]; then
    echo "Error: This script must be run on macOS with Xcode installed." >&2
    exit 1
fi

# Check if xcrun and safari-web-extension-packager are available
if ! xcrun --find safari-web-extension-packager &>/dev/null; then
    echo "Error: safari-web-extension-packager tool not found." >&2
    echo "Make sure Xcode and its command-line tools are installed and active (xcode-select --install)." >&2
    exit 1
fi

if [[ "$PACKAGER_SHOW_HELP" == true ]]; then
    xcrun safari-web-extension-packager --help || true
    exit 0
fi

# Validate source directory
if [[ ! -d "$EXTENSION_SRC" ]]; then
    echo "Error: Extension source directory not found at '$EXTENSION_SRC'." >&2
    exit 1
fi

if [[ ! -f "$EXTENSION_SRC/manifest.json" ]]; then
    echo "Error: No 'manifest.json' found in '$EXTENSION_SRC'. Please verify your build path." >&2
    exit 1
fi

npm run build

# ==============================================================================
# Execution (Detect Existing & Rebuild vs Brand New)
# ==============================================================================
echo "==> Packaging extension from: $EXTENSION_SRC"
echo "==> Target output location:  $PROJECT_LOCATION"
echo "==> App Name:               $APP_NAME"
echo "==> Bundle ID:              $BUNDLE_IDENTIFIER"

if [[ -d "$PROJECT_FILE" ]]; then
    echo "==> Existing Xcode project detected. Rebuilding project target..."
    xcrun safari-web-extension-packager \
        --rebuild-project "$PROJECT_FILE" \
        --project-location "$PROJECT_LOCATION" \
        --app-name "$APP_NAME" \
        --bundle-identifier "$BUNDLE_IDENTIFIER" \
        --copy-resources \
        --no-prompt \
        --no-open \
        "${PACKAGER_ARGS[@]}" \
        "$EXTENSION_SRC"
else
    echo "==> No existing project found. Creating a fresh Xcode project..."
    mkdir -p "$PROJECT_LOCATION"
    xcrun safari-web-extension-packager \
        --project-location "$PROJECT_LOCATION" \
        --app-name "$APP_NAME" \
        --bundle-identifier "$BUNDLE_IDENTIFIER" \
        --copy-resources \
        --no-prompt \
        --no-open \
        "${PACKAGER_ARGS[@]}" \
        "$EXTENSION_SRC"
fi

echo "SUCCESS: Xcode project processed successfully at $PROJECT_FILE"
