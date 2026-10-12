#!/usr/bin/env node

const { execSync } = require('child_process');
const { platform } = require('os');

function run(command, options = {}) {
    console.log(`> ${command}`);
    return execSync(command, { stdio: 'inherit', ...options });
}

function hasSafariDriver() {
    try {
        execSync('which safaridriver', { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

function enableSafariDriver() {
    try {
        run('safaridriver --enable');
        console.log('safaridriver enabled successfully.');
    } catch {
        console.log('\n⚠️  safaridriver --enable requires elevated permissions.');
        console.log('   Run the following one-time manual step:');
        console.log('   sudo safaridriver --enable');
        console.log('   Then re-run this script or proceed with testing.\n');
    }
}

async function main() {
    console.log('Installing Playwright browser binaries (chromium, firefox, webkit)...');
    run('npx playwright install chromium firefox webkit');

    if (platform() === 'darwin') {
        console.log('\nChecking Safari WebDriver setup...');
        if (hasSafariDriver()) {
            enableSafariDriver();
        } else {
            console.log('safaridriver not found. Safari WebDriver is part of macOS/Xcode Command Line Tools.');
            console.log('Install Xcode Command Line Tools, then run: sudo safaridriver --enable');
        }
    }

    console.log('Browser tools setup complete.');
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
