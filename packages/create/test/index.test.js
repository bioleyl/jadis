const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const cliPath = path.resolve(__dirname, '..', 'index.js');

function createTempDirectory() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'jadis-create-'));
}

function runCli(directory, ...args) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd: directory,
    encoding: 'utf8',
  });
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
    /"@jadis\/core": "\^1\.0\.0"/
  );
});

test('creates the vanilla template without a package manager setup', () => {
  const directory = createTempDirectory();
  const result = runCli(directory, 'vanilla', 'example');
  const projectDirectory = path.join(directory, 'example');

  assert.equal(result.status, 0);
  assert.equal(fs.existsSync(path.join(projectDirectory, 'package.json')), false);
  assert.match(
    fs.readFileSync(path.join(projectDirectory, 'index.html'), 'utf8'),
    /https:\/\/esm\.sh\/@jadis\/core@1\.0\.0/
  );
  assert.match(result.stdout, /npx serve \./);
});

test('rejects an unsupported template', () => {
  const directory = createTempDirectory();
  const result = runCli(directory, 'unknown', 'example');

  assert.equal(result.status, 1);
  assert.match(result.stderr, /"js", "ts", "vanilla"/);
});
