#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// --- Fetch latest version via npm view ---
function getLatest(pkgName) {
  try {
    return execFileSync('npm', ['view', pkgName, 'version'], { encoding: 'utf8' }).trim();
  } catch {
    console.warn(`  ⚠ Could not fetch latest for ${pkgName}`);
    return null;
  }
}

// --- Parse version string (strip ^, ~, etc.) ---
function stripPrefix(v) {
  return v.replace(/^[\^~>=<]+/, '');
}

// --- Update core package (locked, no prefix) ---
const corePath = join(root, 'packages/core/package.json');
const corePkg = JSON.parse(readFileSync(corePath, 'utf8'));

console.log('\nChecking @jadis/core devDependencies...\n');

let updated = false;
for (const [pkg, current] of Object.entries(corePkg.devDependencies)) {
  const latest = getLatest(pkg);
  const currentClean = stripPrefix(current);
  if (latest && latest !== currentClean) {
    corePkg.devDependencies[pkg] = latest;
    console.log(`  ${pkg}: ${currentClean} → ${latest}`);
    updated = true;
  } else {
    console.log(`  ${pkg}: up to date`);
  }
}

if (updated) {
  writeFileSync(corePath, JSON.stringify(corePkg, null, 2) + '\n', 'utf8');
  console.log('\n✓ Updated packages/core/package.json');
} else {
  console.log('\nAll core dependencies are up to date.');
}

// --- Update docs package (locked, no prefix) ---
const docsPath = join(root, 'packages/docs/package.json');
const docsPkg = JSON.parse(readFileSync(docsPath, 'utf8'));

console.log(`\nChecking ${docsPath.replace(root + '/', '')} devDependencies...\n`);

let updatedDocs = false;
for (const [pkg, current] of Object.entries(docsPkg.devDependencies)) {
  const latest = getLatest(pkg);
  const currentClean = stripPrefix(current);
  if (latest && latest !== currentClean) {
    docsPkg.devDependencies[pkg] = latest;
    console.log(`  ${pkg}: ${currentClean} → ${latest}`);
    updatedDocs = true;
  } else {
    console.log(`  ${pkg}: up to date`);
  }
}

if (updatedDocs) {
  writeFileSync(docsPath, JSON.stringify(docsPkg, null, 2) + '\n', 'utf8');
  console.log(`\n✓ Updated packages/docs/package.json`);
} else {
  console.log('\nAll docs dependencies are up to date.');
}

// --- Update create templates (keep ^ prefix) ---
const templatePaths = [
  join(root, 'packages/create/templates/ts/package.json'),
  join(root, 'packages/create/templates/js/package.json'),
];

for (const tPath of templatePaths) {
  const tPkg = JSON.parse(readFileSync(tPath, 'utf8'));
  const relPath = tPath.replace(root + '/', '');

  console.log(`\nChecking ${relPath} devDependencies...\n`);

  let updatedTemplate = false;
  for (const [pkg, current] of Object.entries(tPkg.devDependencies)) {
    const latest = getLatest(pkg);
    const currentClean = stripPrefix(current);
    if (latest && latest !== currentClean) {
      tPkg.devDependencies[pkg] = `^${latest}`;
      console.log(`  ${pkg}: ^${currentClean} → ^${latest}`);
      updatedTemplate = true;
    } else {
      console.log(`  ${pkg}: up to date`);
    }
  }

  if (updatedTemplate) {
    writeFileSync(tPath, JSON.stringify(tPkg, null, 2) + '\n', 'utf8');
    console.log(`\n✓ Updated ${relPath}`);
  } else {
    console.log(`\nAll template dependencies are up to date.`);
  }
}

console.log();
