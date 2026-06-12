#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const ROOT_FS =
  "/Users/ate/dev/aem-content-scripts/source/en-retirement/jcr_root/content/dam/manulife-com/ca";
const ROOT_JCR = "/content/dam/manulife-com/ca";
const FILTER_XML =
  "/Users/ate/dev/aem-content-scripts/source/en-retirement/META-INF/vault/filter.xml";
const DEF_XML =
  "/Users/ate/dev/aem-content-scripts/source/en-retirement/META-INF/vault/definition/.content.xml";

function collectLeaves(fsDir, jcrDir, out) {
  const entries = fs
    .readdirSync(fsDir, { withFileTypes: true })
    .filter(
      (e) =>
        e.name !== "_jcr_content" &&
        e.name !== ".content.xml" &&
        !e.name.endsWith(".dir"),
    );

  const childDirs = entries.filter((e) => e.isDirectory());
  const childFiles = entries.filter((e) => e.isFile());

  if (childDirs.length === 0 && childFiles.length === 0) {
    out.push(jcrDir);
    return;
  }

  for (const f of childFiles) {
    out.push(`${jcrDir}/${f.name}`);
  }

  for (const d of childDirs) {
    const sub = fs
      .readdirSync(path.join(fsDir, d.name), { withFileTypes: true })
      .filter(
        (e) =>
          e.name !== "_jcr_content" &&
          e.name !== ".content.xml" &&
          !e.name.endsWith(".dir"),
      );
    if (sub.length === 0) {
      out.push(`${jcrDir}/${d.name}`);
    } else {
      collectLeaves(path.join(fsDir, d.name), `${jcrDir}/${d.name}`, out);
    }
  }
}

const leaves = [];
collectLeaves(ROOT_FS, ROOT_JCR, leaves);
leaves.sort();

const filterXml = `<?xml version="1.0" encoding="UTF-8"?>
<workspaceFilter version="1.0">
${leaves.map((p) => `    <filter root="${p}"/>`).join("\n")}
</workspaceFilter>
`;
fs.writeFileSync(FILTER_XML, filterXml);

const defContent = fs.readFileSync(DEF_XML, "utf8");
const fNodes = leaves
  .map(
    (p, i) => `        <f${i}
            jcr:primaryType="nt:unstructured"
            mode="replace"
            propertyRules="[]"
            root="${p}"
            rules="[]"/>`,
  )
  .join("\n");

const newFilterBlock = `    <filter jcr:primaryType="nt:unstructured">
${fNodes}
    </filter>`;

const updatedDef = defContent.replace(
  /    <filter jcr:primaryType="nt:unstructured">[\s\S]*?<\/filter>/,
  newFilterBlock,
);
fs.writeFileSync(DEF_XML, updatedDef);

console.log(`Wrote ${leaves.length} filter entries.`);
