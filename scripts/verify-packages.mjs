import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const temporaryDirectory = mkdtempSync(join(tmpdir(), 'jadis-packages-'));

function packWorkspace(workspace) {
  const output = execFileSync(
    'npm',
    ['pack', `--workspace=${workspace}`, '--pack-destination', temporaryDirectory, '--json'],
    { cwd: rootDirectory, encoding: 'utf8' }
  );
  const [packageInfo] = JSON.parse(output);
  return join(temporaryDirectory, packageInfo.filename);
}

function installPackage(directory, packagePath) {
  execFileSync('npm', ['init', '-y'], { cwd: directory, stdio: 'ignore' });
  execFileSync('npm', ['install', '--ignore-scripts', '--no-save', packagePath], {
    cwd: directory,
    stdio: 'inherit',
  });
}

try {
  const corePackage = packWorkspace('packages/core');
  const coreProject = mkdtempSync(join(temporaryDirectory, 'core-project-'));
  installPackage(coreProject, corePackage);

  execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      "globalThis.HTMLElement = class {}; globalThis.customElements = { define() {}, get() { return undefined; } }; const { Jadis, createElement } = await import('@jadis/core'); if (typeof Jadis !== 'function' || typeof createElement !== 'function') process.exit(1);",
    ],
    { cwd: coreProject, stdio: 'inherit' }
  );

  const createPackage = packWorkspace('packages/create');
  const createProject = mkdtempSync(join(temporaryDirectory, 'create-project-'));
  installPackage(createProject, createPackage);

  execFileSync(
    process.execPath,
    [join(createProject, 'node_modules/@jadis/create/index.js'), 'vanilla', 'generated'],
    { cwd: createProject, stdio: 'inherit' }
  );

  const generatedIndex = join(createProject, 'generated/index.html');
  statSync(generatedIndex);
  const generatedSource = readFileSync(generatedIndex, 'utf8');
  if (!generatedSource.includes('@jadis/core@1.0.0')) {
    throw new Error('The generated vanilla project does not reference the expected core version.');
  }

  console.log('Package smoke tests passed.');
} finally {
  rmSync(temporaryDirectory, { force: true, recursive: true });
}
