#!/usr/bin/env node

const { execSync } = require('child_process');

const steps = [
    { name: 'build:all', command: 'npm run build:all' },
    { name: 'test:e2e (Chrome extension)', command: 'npm run test:e2e' },
    { name: 'Firefox settings (Selenium)', command: 'node test/e2e/firefox-settings.mjs' },
    { name: 'Safari settings (Selenium)', command: 'node test/e2e/safari-settings.mjs' },
    { name: 'cross-browser smoke (Playwright)', command: 'npx playwright test test/e2e/cross-browser-smoke.spec.mjs --project=chromium --project=firefox --project=webkit' },
];

let failed = false;

function runStep(step) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`[RUN] ${step.name}`);
    console.log(`${'='.repeat(60)}`);
    try {
        execSync(step.command, { stdio: 'inherit' });
        console.log(`[PASS] ${step.name}`);
        return true;
    } catch (error) {
        console.error(`[FAIL] ${step.name} (exit ${error.status ?? 'unknown'})`);
        return false;
    }
}

async function main() {
    console.log('Starting cross-browser test suite...');
    console.log(`Steps: ${steps.map((s) => s.name).join(' → ')}`);

    for (const step of steps) {
        const ok = runStep(step);
        if (!ok) {
            failed = true;
            break;
        }
    }

    console.log(`\n${'='.repeat(60)}`);
    if (failed) {
        console.log('[FAIL] Cross-browser suite failed (see output above).');
        process.exit(1);
    } else {
        console.log('[PASS] Cross-browser suite completed successfully.');
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
