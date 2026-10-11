#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const COVERAGE_FILE = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');
const HTML_FILE = path.join(__dirname, '..', 'test', 'test.html');

function main() {
    if (!fs.existsSync(COVERAGE_FILE)) {
        console.error(`Coverage summary not found: ${COVERAGE_FILE}`);
        console.error('Run "vitest run --coverage" first.');
        process.exit(1);
    }

    const summary = JSON.parse(fs.readFileSync(COVERAGE_FILE, 'utf8'));
    const minified = JSON.stringify(summary);

    let html = fs.readFileSync(HTML_FILE, 'utf8');

    html = html.replace(
        /<script id="coverage-summary" type="application\/json">[\s\S]*?<\/script>/,
        `<script id="coverage-summary" type="application/json">\n    ${minified}\n    </script>`
    );

    const generated = new Date().toISOString();
    if (html.includes('id="coverage-timestamp"')) {
        html = html.replace(
            /<p id="coverage-timestamp"[^>]*>.*?<\/p>/,
            `<p id="coverage-timestamp" class="muted">Generated ${generated}</p>`
        );
    } else {
        html = html.replace(
            /<h2>Coverage Report<\/h2>/,
            `<h2>Coverage Report</h2>\n            <p id="coverage-timestamp" class="muted">Generated ${generated}</p>`
        );
    }

    fs.writeFileSync(HTML_FILE, html);
    console.log(`Embedded coverage summary into ${HTML_FILE} (${generated})`);
}

main();
