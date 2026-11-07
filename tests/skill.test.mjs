// The skill jadis-official, as each way of installing it finds it: the Claude Code marketplace
// (.claude-plugin/marketplace.json, which skills.sh reads too) and install-skill.sh. Claude Code copies a plugin's
// folder alone when it installs it: what the skill links to must be inside.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { after, describe, it } from 'node:test';

const ROOT = join(import.meta.dirname, '..');
const SKILL_NAME = 'jadis-official';
const LINK_TARGET = /\]\(([^)\s]+)\)/g;
const ADDRESS = /^[a-z]+:/;
const FRONTMATTER = /^---\n([\s\S]*?)\n---\n/;
const HEADING = /^#{1,6} (.+)$/gm;
const FENCE = /^```[\s\S]*?^```/gm;
// The Agent Skills specification (agentskills.io): a lowercase name of hyphenated words, at most 64 characters.
const SKILL_NAME_RULE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_NAME_LENGTH = 64;
const MAX_DESCRIPTION_LENGTH = 1024;
const MAX_SKILL_LINES = 500;

const readJson = (path) => JSON.parse(readFileSync(join(ROOT, path), 'utf8'));

const marketplace = readJson('.claude-plugin/marketplace.json');
const coreVersion = readJson('packages/core/package.json').version;

/** The frontmatter's fields, each on one line. */
function frontmatterOf(markdown) {
  const [, block] = markdown.match(FRONTMATTER) ?? [];
  assert.ok(block, 'no frontmatter');
  return Object.fromEntries(
    block.split('\n').map((line) => {
      const separator = line.indexOf(': ');
      return [line.slice(0, separator), line.slice(separator + 2)];
    })
  );
}

/** GitHub's anchor for a heading: lowercase, punctuation dropped, spaces as hyphens. */
const anchorOf = (heading) =>
  heading
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s/g, '-');

const withoutCode = (markdown) => markdown.replace(FENCE, '');

const anchorsOf = (markdown) => new Set([...withoutCode(markdown).matchAll(HEADING)].map((match) => anchorOf(match[1])));

const localLinks = (markdown) =>
  [...withoutCode(markdown).matchAll(LINK_TARGET)].map((match) => match[1]).filter((target) => !ADDRESS.test(target));

const markdownFiles = (folder) =>
  readdirSync(folder, { recursive: true })
    .filter((path) => path.endsWith('.md'))
    .map((path) => join(folder, path));

/** The links of a file that lead to no file, or to no heading of their file. */
function brokenLinks(file) {
  return localLinks(readFileSync(file, 'utf8')).filter((link) => {
    const [path, anchor] = link.split('#');
    const target = path ? join(dirname(file), path) : file;
    if (!existsSync(target)) {
      return true;
    }
    return anchor !== undefined && !anchorsOf(readFileSync(target, 'utf8')).has(anchor);
  });
}

describe('the marketplace', () => {
  it(`lists the ${SKILL_NAME} plugin alone`, () => {
    assert.deepEqual(
      marketplace.plugins.map((entry) => entry.name),
      [SKILL_NAME]
    );
  });
});

// Each plugin holds one skill, of its own name.
for (const entry of marketplace.plugins) {
  const folder = join(ROOT, entry.source);
  const skillFolder = join(folder, 'skills', entry.name);
  const manifest = JSON.parse(readFileSync(join(folder, '.claude-plugin', 'plugin.json'), 'utf8'));
  const skill = readFileSync(join(skillFolder, 'SKILL.md'), 'utf8');
  const frontmatter = frontmatterOf(skill);

  describe(`the Claude plugin ${entry.name}`, () => {
    it('lies in its own folder of plugins/', () => {
      assert.equal(entry.source, `./plugins/${entry.name}`);
    });

    it("has its name and @jadis/core's version, written in its manifest only", () => {
      assert.equal(manifest.name, entry.name);
      assert.equal(manifest.version, coreVersion);
      assert.equal('version' in entry, false);
    });

    it('holds one skill, its folder of the same name', () => {
      assert.deepEqual(readdirSync(join(folder, 'skills')), [entry.name]);
    });
  });

  describe(`the skill ${entry.name}`, () => {
    it("is named as the specification asks, after its folder", () => {
      assert.equal(frontmatter.name, entry.name);
      assert.match(frontmatter.name, SKILL_NAME_RULE);
      assert.ok(frontmatter.name.length <= MAX_NAME_LENGTH);
    });

    it('describes what it does and when to load it, within the length agents read', () => {
      assert.ok(frontmatter.description.length > 0);
      assert.ok(
        frontmatter.description.length <= MAX_DESCRIPTION_LENGTH,
        `${frontmatter.description.length} characters`
      );
    });

    it('keeps SKILL.md short, the details in its references', () => {
      assert.ok(skill.split('\n').length <= MAX_SKILL_LINES);
    });

    it("names the @jadis/core version it was written for, the core's", () => {
      assert.match(skill, new RegExp(`\`@jadis/core@${coreVersion.replaceAll('.', '\\.')}\``));
    });

    it('links only to files of the plugin, and to headings they have', () => {
      const broken = markdownFiles(skillFolder).flatMap((file) =>
        brokenLinks(file).map((link) => `${relative(skillFolder, file)} → ${link}`)
      );
      assert.deepEqual(broken, []);
    });

    it('links from SKILL.md to each of its references', () => {
      const linked = new Set(localLinks(skill).map((link) => link.split('#')[0]));
      const references = readdirSync(join(skillFolder, 'references')).map((name) => `references/${name}`);
      assert.deepEqual(
        references.filter((reference) => !linked.has(reference)),
        []
      );
    });
  });
}

describe('install-skill.sh', () => {
  const home = mkdtempSync(join(tmpdir(), 'jadis-skill-'));
  const install = (...args) =>
    execFileSync('sh', [join(ROOT, 'install-skill.sh'), ...args], {
      env: { ...process.env, HOME: home },
      input: '',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).toString();

  after(() => rmSync(home, { force: true, recursive: true }));

  it('copies the skill of this clone into the folders asked', () => {
    install('--target', 'agents', '--target', 'claude');

    for (const folder of ['.agents/skills', '.claude/skills']) {
      const installed = join(home, folder, SKILL_NAME);
      assert.equal(lstatSync(installed).isDirectory(), true);
      assert.equal(existsSync(join(installed, 'references', 'agent-mistakes.md')), true);
    }
  });

  it('links to this clone when asked', () => {
    install('--target', 'agents', '--link', '--yes');

    assert.equal(lstatSync(join(home, '.agents/skills', SKILL_NAME)).isSymbolicLink(), true);
  });

  it('writes nothing when one of the targets is unknown', () => {
    assert.throws(() => install('--target', `${home}/first`, '--target', 'nowhere'), /unknown target: nowhere/);
    assert.equal(existsSync(join(home, 'first')), false);
  });
});
