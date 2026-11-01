// The Claude Code plugin of plugins/, as its marketplace (.claude-plugin/marketplace.json) lists it. Claude Code
// copies a plugin's folder alone when it installs it: what its skill links to must be inside.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

const ROOT = join(import.meta.dirname, '..');
const PLUGIN_NAME = 'jadis';
const LINK_TARGET = /\]\(([^)\s]+)\)/g;
const ADDRESS = /^[a-z]+:\/\//;

const readJson = (path) => JSON.parse(readFileSync(join(ROOT, path), 'utf8'));

const marketplace = readJson('.claude-plugin/marketplace.json');
const coreVersion = readJson('packages/core/package.json').version;

const localLinks = (markdown) =>
  [...markdown.matchAll(LINK_TARGET)].map((match) => match[1]).filter((target) => !ADDRESS.test(target));

describe('the marketplace', () => {
  it('lists the jadis plugin alone', () => {
    assert.deepEqual(
      marketplace.plugins.map((entry) => entry.name),
      [PLUGIN_NAME]
    );
  });
});

// Each plugin holds one skill, of its own name.
for (const entry of marketplace.plugins) {
  const folder = join(ROOT, entry.source);
  const skillFolder = join(folder, 'skills', entry.name);
  const manifest = JSON.parse(readFileSync(join(folder, '.claude-plugin', 'plugin.json'), 'utf8'));
  const skill = readFileSync(join(skillFolder, 'SKILL.md'), 'utf8');

  describe(`the Claude plugin ${entry.name}`, () => {
    it('lies in its own folder of plugins/', () => {
      assert.equal(entry.source, `./plugins/${entry.name}`);
    });

    it("has its name and @jadis/core's version, written in its manifest only", () => {
      assert.equal(manifest.name, entry.name);
      assert.equal(manifest.version, coreVersion);
      assert.equal('version' in entry, false);
    });

    it('holds its skill, named and described for Claude to find it', () => {
      assert.match(skill, new RegExp(`^---\\nname: ${entry.name}\\ndescription: \\S.+\\n---\\n`));
    });

    it('links its skill only to files inside the plugin', () => {
      const missing = localLinks(skill).filter((target) => !existsSync(join(skillFolder, target)));
      assert.deepEqual(missing, []);
    });
  });
}
