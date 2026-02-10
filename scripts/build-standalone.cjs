const fs = require('node:fs');
const path = require('node:path');

const distDir = path.resolve(__dirname, '../dist');
const indexHtmlPath = path.join(distDir, 'index.html');
const outputHtmlPath = path.join(distDir, 'standalone.html');

// Check if dist/index.html exists
if (!fs.existsSync(indexHtmlPath)) {
    console.error('Error: dist/index.html not found. Run "npm run build" first.');
    process.exit(1);
}

// Get the world JSON file from arguments
const worldJsonPath = process.argv[2];
if (!worldJsonPath) {
    console.error('Usage: node scripts/build-standalone.cjs <path-to-world.json>');
    process.exit(1);
}

// Resolve relative path from cwd
const resolvedWorldJsonPath = path.resolve(process.cwd(), worldJsonPath);

if (!fs.existsSync(resolvedWorldJsonPath)) {
    console.error(`Error: World file not found at ${resolvedWorldJsonPath}`);
    process.exit(1);
}

try {
    const htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
    const worldJson = fs.readFileSync(resolvedWorldJsonPath, 'utf8');

    // Validate JSON
    JSON.parse(worldJson);

    // Inject the world definition
    const injection = `<script>window.DIEGESIS_WORLD_DEFINITION = ${worldJson};</script>`;

    // Insert before the closing head tag
    const newHtmlContent = htmlContent.replace('</head>', `${injection}</head>`);

    fs.writeFileSync(outputHtmlPath, newHtmlContent);
    console.log(`Success! Standalone build created at ${outputHtmlPath}`);

} catch (err) {
    console.error('Error building standalone:', err);
    process.exit(1);
}
