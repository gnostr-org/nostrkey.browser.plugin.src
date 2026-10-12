# GnostrKey browser extension — just recipes
# Install `just`: https://github.com/casey/just

# Default: show available recipes
[private]
default:
    @just --list

# ─── Build ───────────────────────────────────────────────────────────────────

# Development build (default target)
build:
    npm run build

# Production/minified build
build-prod:
    npm run build:prod

# Build specific browser targets
build-chrome:
    npm run build:chrome

build-chrome-prod:
    npm run build:chrome:prod

build-firefox:
    npm run build:firefox

build-firefox-prod:
    npm run build:firefox:prod

# Build all browser distros (dev)
build-all:
    npm run build:all

# Build all browser distros (production)
build-all-prod:
    npm run build:all:prod

# Watch mode for development
watch:
    npm run watch

# Clean generated build artifacts
clean:
    npm run clean

# ─── Test ──────────────────────────────────────────────────────────────────────

# Run unit tests once
test:
    npm test

# Run unit tests in watch mode
test-watch:
    npm run test:watch

# Run unit tests with coverage
test-coverage:
    npm run test:coverage

# Run unit tests with coverage and embed report
test-coverage-embed:
    npm run test:coverage:embed

# Run all unit tests + default Playwright e2e suite
test-all:
    npm run test:all

# ─── E2E ───────────────────────────────────────────────────────────────────────

# Install Playwright browsers and system deps
setup-browser-tools:
    npm run setup:browser-tools

# Default e2e suite (Chromium extension tests)
test-e2e:
    npm run test:e2e

# Consent-surface e2e (gating)
test-e2e-consent:
    npm run test:e2e:consent

# Settings persistence e2e
test-e2e-settings:
    npm run test:e2e:settings

# Cross-browser P2P consensus smoke test
test-cross-browser:
    npm run test:cross-browser

# Legacy extension/settings e2e
test-e2e-legacy:
    npx playwright test test/e2e/extension.spec.js test/e2e/settings-persistence.spec.js

# Live P2P consensus across Chromium, Firefox, and WebKit
# Use HEADLESS=false to run browsers in headed mode for debugging.
test-e2e-cross-browser-smoke headless="true":
    #!/usr/bin/env bash
    if [[ "{{headless}}" == "false" ]]; then
        CROSS_BROWSER_SMOKE_HEADLESS=false npx playwright test test/e2e/cross-browser-smoke.spec.mjs
    else
        npx playwright test test/e2e/cross-browser-smoke.spec.mjs
    fi

# ─── P2P / libp2p experiments ──────────────────────────────────────────────────

# Run the deterministic P2P test peer
p2p-peer:
    npm run p2p:peer

# Run the P2P relay daemon
p2p-relay:
    npm run p2p:relay

# Ping connected peers from the test peer
p2p-ping:
    npm run p2p:ping

# ─── Release ───────────────────────────────────────────────────────────────────

# Upload Chrome extension to the Chrome Web Store
cws-upload:
    npm run cws:upload

# Publish Chrome extension on the Chrome Web Store
cws-publish:
    npm run cws:publish

# Upload and publish Chrome extension
cws-release:
    npm run cws:release

# ─── CI ────────────────────────────────────────────────────────────────────────

# Run the full CI build/test pipeline (matches .github/workflows/ci.yml build job)
ci:
    npm ci
    npm run build:all:prod
    npm test
    npm audit --omit=dev --audit-level=high || true

# Run CI audit step alone (non-gating due to current advisory false-positives)
ci-audit:
    npm audit --omit=dev --audit-level=high || true
