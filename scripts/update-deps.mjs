#!/usr/bin/env node

// Brings the packages' and the templates' dependencies to their latest versions on npm, each range keeping its prefix:
// core and the docs pin theirs, @jadis/fastify takes `^` for what its users install with it, the templates `^` (`~`
// for TypeScript, whose minor versions can break). The Jadis packages are left to set-version.mjs, which writes the
// version being released, not yet on npm.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const PACKAGE_PATHS = [
  'packages/core/package.json',
  'packages/docs/package.json',
  'packages/fastify/package.json',
  'packages/create/templates/ts/package.json',
  'packages/create/templates/js/package.json',
  'packages/create/templates/ssr/package.json',
];
const DEPENDENCY_FIELDS = ['dependencies', 'devDependencies'];
const OWN_SCOPE = '@jadis/';
const RANGE_PREFIX = /^[\^~>=<]*/;

// --- Fetch latest version via npm view ---
function getLatest(pkgName) {
  try {
    return execFileSync('npm', ['view', pkgName, 'version'], { encoding: 'utf8' }).trim();
  } catch {
    console.warn(`  ⚠ Could not fetch latest for ${pkgName}`);
    return null;
  }
}

/** Updates one dependency's range in place, keeping its prefix; returns whether it changed. */
function updateDependency(dependencies, name) {
  const current = dependencies[name];
  const [prefix] = current.match(RANGE_PREFIX);
  const currentVersion = current.slice(prefix.length);
  const latest = getLatest(name);
  if (!latest || latest === currentVersion) {
    console.log(`  ${name}: up to date`);
    return false;
  }
  dependencies[name] = `${prefix}${latest}`;
  console.log(`  ${name}: ${current} → ${prefix}${latest}`);
  return true;
}

function updatePackage(relPath) {
  const path = join(root, relPath);
  const pkg = JSON.parse(readFileSync(path, 'utf8'));

  console.log(`\nChecking ${relPath}...\n`);

  const changes = DEPENDENCY_FIELDS.flatMap((field) =>
    Object.keys(pkg[field] ?? {})
      .filter((name) => !name.startsWith(OWN_SCOPE))
      .map((name) => updateDependency(pkg[field], name))
  );
  if (!changes.includes(true)) {
    console.log(`\nAll ${relPath} dependencies are up to date.`);
    return;
  }
  writeFileSync(path, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log(`\n✓ Updated ${relPath}`);
}

for (const relPath of PACKAGE_PATHS) {
  updatePackage(relPath);
}

console.log();
