import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { rollup } from 'rollup';

const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const temporaryDirectory = mkdtempSync(join(tmpdir(), 'jadis-packages-'));

// Each export alone must leave the others out of an application's bundle.
const treeShakenExports = ['Jadis', 'Router', 'Translator'];

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

async function bundleImportOf(directory, exportName) {
  const entry = join(directory, `only-${exportName}.mjs`);
  writeFileSync(entry, `export { ${exportName} } from '@jadis/core';\n`);
  const build = await rollup({ input: entry, plugins: [nodeResolve()] });
  const { output } = await build.generate({ format: 'es' });
  await build.close();
  return output[0].code;
}

async function verifyTreeShaking(directory) {
  for (const exportName of treeShakenExports) {
    const code = await bundleImportOf(directory, exportName);
    // A class as written (`class Jadis extends`), or as Rolldown writes a module's classes (`var Jadis = class`).
    const holdsClass = (name) => new RegExp(`\\bclass ${name}\\b|\\b${name} = class\\b`).test(code);
    if (!holdsClass(exportName)) {
      throw new Error(`The bundle of ${exportName} alone does not hold its class: the check below would prove nothing.`);
    }

    const kept = treeShakenExports.filter((other) => other !== exportName && holdsClass(other));
    if (kept.length > 0) {
      throw new Error(`Importing only ${exportName} from @jadis/core also bundles ${kept.join(', ')}.`);
    }
  }
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
  await verifyTreeShaking(coreProject);

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
  const { version: coreVersion } = JSON.parse(readFileSync(join(rootDirectory, 'packages/core/package.json'), 'utf8'));
  if (!generatedSource.includes(`@jadis/core@${coreVersion}"`)) {
    throw new Error(`The generated vanilla project does not load @jadis/core@${coreVersion}.`);
  }

  console.log('Package smoke tests passed.');
} finally {
  rmSync(temporaryDirectory, { force: true, recursive: true });
}
