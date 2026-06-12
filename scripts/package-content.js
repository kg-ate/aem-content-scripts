#!/usr/bin/env node

'use strict';

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const destination = process.argv[2];

if (!destination) {
  console.error('Usage: node scripts/package-content.js <destination>');
  console.error('Example: node scripts/package-content.js source/en-retirement');
  process.exit(1);
}

const sourceDir = path.resolve(destination);

if (!fs.existsSync(sourceDir)) {
  console.error(`Directory not found: ${sourceDir}`);
  process.exit(1);
}

const missing = ['jcr_root', 'META-INF'].filter(
  (d) => !fs.existsSync(path.join(sourceDir, d))
);

if (missing.length > 0) {
  console.error(`Missing required directories in ${sourceDir}: ${missing.join(', ')}`);
  process.exit(1);
}

const outputDir = path.resolve('content-packages');
fs.mkdirSync(outputDir, { recursive: true });

const packageName = path.basename(sourceDir) + '.zip';
const outputPath = path.join(outputDir, packageName);

execSync(
  `zip -r "${outputPath}" jcr_root META-INF -x "*.DS_Store" -x "__MACOSX/*" -x "*/__MACOSX/*"`,
  { cwd: sourceDir, stdio: 'inherit' }
);

console.log(`\nCreated: ${outputPath}`);
