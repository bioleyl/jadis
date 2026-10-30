const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const cliPath = path.resolve(__dirname, '..', 'index.js');
const corePackagePath = path.resolve(__dirname, '..', '..', 'core', 'package.json');

function createTempDirectory() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'jadis-create-'));
}

function runCliAt(cli, directory, ...args) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd: directory,
    encoding: 'utf8',
  });
}

function runCli(directory, ...args) {
  return runCliAt(cliPath, directory, ...args);
}

test('creates the JavaScript template', () => {
  const directory = createTempDirectory();
  const result = runCli(directory, 'js', 'example');

  assert.equal(result.status, 0);
  assert.equal(fs.existsSync(path.join(directory, 'example', 'src/components/Counter.jsx')), true);
  assert.equal(fs.existsSync(path.join(directory, 'example', 'src/components/Counter.js')), false);
});

test('creates the TypeScript template', () => {
  const directory = createTempDirectory();
  const result = runCli(directory, 'ts', 'example');

  assert.equal(result.status, 0);
  assert.equal(fs.existsSync(path.join(directory, 'example', 'src/main.ts')), true);
  assert.match(
    fs.readFileSync(path.join(directory, 'example', 'package.json'), 'utf8'),
    /"@jadis\/core": "\^1\.4\.2"/
  );
});

test('creates the vanilla template without a package manager setup', () => {
  const directory = createTempDirectory();
  const result = runCli(directory, 'vanilla', 'example');
  const projectDirectory = path.join(directory, 'example');
  const { version: coreVersion } = JSON.parse(fs.readFileSync(corePackagePath, 'utf8'));

  assert.equal(result.status, 0);
  assert.equal(fs.existsSync(path.join(projectDirectory, 'package.json')), false);
  // The import map loads the current core release, not the template's placeholder.
  assert.equal(
    fs
      .readFileSync(path.join(projectDirectory, 'index.html'), 'utf8')
      .includes(`"https://esm.sh/@jadis/core@${coreVersion}"`),
    true
  );
  assert.match(result.stdout, /npx serve \./);
});

test('refuses the vanilla template when it has no core version', () => {
  const directory = createTempDirectory();
  const cliCopy = path.join(directory, 'cli');
  const vanillaCopy = path.join(cliCopy, 'templates', 'vanilla');
  fs.mkdirSync(vanillaCopy, { recursive: true });
  fs.copyFileSync(cliPath, path.join(cliCopy, 'index.js'));
  fs.writeFileSync(path.join(vanillaCopy, 'package.json'), '{}');

  const result = runCliAt(path.join(cliCopy, 'index.js'), directory, 'vanilla', 'example');

  assert.equal(result.status, 1);
  assert.match(result.stderr, /no @jadis\/core version/);
  assert.equal(fs.existsSync(path.join(directory, 'example')), false);
});

test('rejects an unsupported template', () => {
  const directory = createTempDirectory();
  const result = runCli(directory, 'unknown', 'example');

  assert.equal(result.status, 1);
  assert.match(result.stderr, /"js", "ts", "vanilla"/);
});
