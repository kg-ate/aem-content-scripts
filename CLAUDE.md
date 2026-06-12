# CLAUDE.md

## Project

Node.js scripts for building AEM (Adobe Experience Manager) FileVault content packages, primarily for DAM asset migration.

## Key conventions

- All scripts are CommonJS (`"type": "commonjs"` in package.json), not ESM
- Scripts are standalone — no build step, run directly with `node scripts/<name>.js`
- Generated packages go to `output/` (both the unzipped folder and `.zip`)
- `content-packages/asset-content-package` is the base template — do not modify it; scripts copy it

## AEM package structure

A valid FileVault package requires:

- `META-INF/vault/filter.xml` — one `<filter root="..."/>` per JCR path
- `META-INF/vault/definition/.content.xml` — mirrors filter entries as `<f0>`, `<f1>`, ... nodes under `<filter>`
- `META-INF/vault/properties.xml` — package metadata (name, group, timestamps)
- `jcr_root/` — JCR content tree (can be empty stubs for asset-only packages)
