#!/usr/bin/env node

'use strict';

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const csvPath = process.argv[2];
const packageName = process.argv[3];

if (!csvPath || !packageName) {
  console.error('Usage: node scripts/create-package-from-csv.js <csv-path> <package-name>');
  console.error('Example: node scripts/create-package-from-csv.js uploaded-assets.csv my-assets');
  process.exit(1);
}

if (!fs.existsSync(csvPath)) {
  console.error(`CSV not found: ${csvPath}`);
  process.exit(1);
}

const lines = fs.readFileSync(csvPath, 'utf8').trim().split('\n');
const paths = lines
  .slice(1) // skip header
  .map((l) => l.trim())
  .filter(Boolean);

if (paths.length === 0) {
  console.error('No paths found in CSV');
  process.exit(1);
}

console.log(`Found ${paths.length} path(s)`);

// Copy template
const templateDir = path.resolve('content-packages/asset-content-package');
const outputDir = path.resolve(`output/${packageName}`);

fs.mkdirSync(path.resolve('output'), { recursive: true });
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true });
}

execSync(`cp -r "${templateDir}" "${outputDir}"`);

// Build filter.xml entries
const filterEntries = paths
  .map((p) => `    <filter root="${p}"/>`)
  .join('\n');

const filterXml = `<?xml version="1.0" encoding="UTF-8"?>
<workspaceFilter version="1.0">
${filterEntries}
</workspaceFilter>
`;

fs.writeFileSync(path.join(outputDir, 'META-INF/vault/filter.xml'), filterXml);

// Build definition filter nodes (f0, f1, f2, ...)
const defFilterNodes = paths
  .map(
    (p, i) => `        <f${i}
            jcr:primaryType="nt:unstructured"
            mode="replace"
            propertyRules="[]"
            root="${p}"
            rules="[]"/>`
  )
  .join('\n');

const now = new Date().toISOString();
const definitionXml = `<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0" xmlns:vlt="http://www.day.com/jcr/vault/1.0"
    jcr:created="{Date}${now}"
    jcr:createdBy="andrew_te@manulife.com"
    jcr:description="\\0"
    jcr:lastModified="{Date}${now}"
    jcr:lastModifiedBy="andrew_te@manulife.com"
    jcr:primaryType="vlt:PackageDefinition"
    buildCount="1"
    builtWith="Adobe Experience Manager-2026.5.26353.20260528T211800Z, forms-2026.5.19.00"
    group="my_packages"
    lastUnwrapped="{Date}${now}"
    lastUnwrappedBy="andrew_te@manulife.com"
    lastWrapped="{Date}${now}"
    lastWrappedBy="andrew_te@manulife.com"
    name="${packageName}"
    version="\\0">
    <filter jcr:primaryType="nt:unstructured">
${defFilterNodes}
    </filter>
</jcr:root>
`;

fs.writeFileSync(path.join(outputDir, 'META-INF/vault/definition/.content.xml'), definitionXml);

// Update properties.xml name entry
const propsPath = path.join(outputDir, 'META-INF/vault/properties.xml');
const props = fs.readFileSync(propsPath, 'utf8');
fs.writeFileSync(
  propsPath,
  props
    .replace(/<entry key="name">.*?<\/entry>/, `<entry key="name">${packageName}</entry>`)
    .replace(/<entry key="created">.*?<\/entry>/, `<entry key="created">${now}</entry>`)
    .replace(/<entry key="lastModified">.*?<\/entry>/, `<entry key="lastModified">${now}</entry>`)
    .replace(/<entry key="lastWrapped">.*?<\/entry>/, `<entry key="lastWrapped">${now}</entry>`)
);

// Zip it
const zipPath = path.resolve(`output/${packageName}.zip`);
execSync(
  `zip -r "${zipPath}" jcr_root META-INF -x "*.DS_Store" -x "__MACOSX/*" -x "*/__MACOSX/*"`,
  { cwd: outputDir, stdio: 'inherit' }
);

console.log(`\nCreated: ${zipPath}`);
