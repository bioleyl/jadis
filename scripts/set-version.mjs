#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const question = (q) => new Promise((resolve) => rl.question(q, resolve));

// --- Read current versions ---
const corePkg = JSON.parse(readFileSync(join(root, 'packages/core/package.json'), 'utf8'));
const createPkg = JSON.parse(readFileSync(join(root, 'packages/create/package.json'), 'utf8'));

const coreVersion = corePkg.version;
const [coreMajor, coreMinor, corePatch] = coreVersion.split('.').map(Number);
const proposedCore = `${coreMajor}.${coreMinor}.${corePatch + 1}`;

const createVersion = createPkg.version;
const createParts = createVersion.split('.');
const proposedCreate = `${createParts[0]}.${Number(createParts[1]) + 1}.0`;

// --- Prompt user ---
console.log(`\nCurrent @jadis/core version: ${coreVersion}`);
console.log(`Proposed next version: ${proposedCore}\n`);

const input = await question(`New core version [${proposedCore}]: `);
const newCoreVersion = input.trim() || proposedCore;

const confirm = await question(`Update to ${newCoreVersion}? (y/n) `);
if (confirm.toLowerCase() !== 'y') {
  console.log('Aborted.');
  rl.close();
  process.exit(0);
}

// --- Update files ---
const updates = [
  // Core package version
  {
    path: 'packages/core/package.json',
    update: (data) => { data.version = newCoreVersion; return data; },
  },
  // Template packages - @jadis/core dependency
  {
    path: 'packages/create/templates/ts/package.json',
    update: (data) => {
      data.devDependencies['@jadis/core'] = `^${newCoreVersion}`;
      return data;
    },
  },
  {
    path: 'packages/create/templates/js/package.json',
    update: (data) => {
      data.devDependencies['@jadis/core'] = `^${newCoreVersion}`;
      return data;
    },
  },
  // Create package version - bump minor, reset patch to 0
  {
    path: 'packages/create/package.json',
    update: (data) => {
      const parts = createVersion.split('.');
      data.version = `${parts[0]}.${Number(parts[1]) + 1}.0`;
      return data;
    },
  },
];

for (const { path: relPath, update } of updates) {
  const fullPath = join(root, relPath);
  const data = JSON.parse(readFileSync(fullPath, 'utf8'));
  writeFileSync(fullPath, JSON.stringify(update(data), null, 2) + '\n', 'utf8');
  console.log(`✓ ${relPath}`);
}

// --- Update CDN references in installation.md ---
const installPath = join(root, 'packages/docs/guides/installation.md');
let content = readFileSync(installPath, 'utf8');
const oldPattern = new RegExp(`@jadis/core@${coreVersion}`, 'g');
content = content.replace(oldPattern, `@jadis/core@${newCoreVersion}`);
writeFileSync(installPath, content, 'utf8');
console.log(`✓ packages/docs/guides/installation.md`);

rl.close();
console.log(`\nDone! Version ${coreVersion} → ${newCoreVersion}\n`);
