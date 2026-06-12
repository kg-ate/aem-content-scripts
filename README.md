# AEM Content Scripts

Utilities for building AEM content packages for asset migration.

## Scripts

### `create-package-from-csv.js`

Creates a content package from a CSV of asset paths.

```
node scripts/create-package-from-csv.js <csv-path> <package-name>
```

**Arguments**
- `csv-path` — path to a CSV file with a `PATH` header column containing JCR asset paths (e.g. `/content/dam/shared-assets/image1.png`)
- `package-name` — name for the output package

**Output**

Both the unzipped package folder and the `.zip` file are written to `output/`.

**Example**

```
node scripts/create-package-from-csv.js uploaded-assets.csv my-assets
# → output/my-assets/
# → output/my-assets.zip
```

---

### `package-content.js`

Zips an existing content package directory (must contain `jcr_root` and `META-INF`) into `content-packages/`.

```
node scripts/package-content.js <source-directory>
```

**Example**

```
node scripts/package-content.js source/en-retirement
# → content-packages/en-retirement.zip
```

---

### `generate-filters.js`

Walks the `source/en-retirement` JCR tree and regenerates `filter.xml` and `META-INF/vault/definition/.content.xml` with one filter entry per leaf node.

```
node scripts/generate-filters.js
```

## Directory structure

```
content-packages/     # Package templates (asset-content-package is the base template)
output/               # Generated packages from create-package-from-csv.js
scripts/              # All scripts
source/               # Hand-maintained content package source trees
```
