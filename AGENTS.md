# Jadis: notes for working on the code

Jadis is a thin layer over native Web Components (no virtual DOM, no reactivity, no framework runtime), published as
`@jadis/core`, with server rendering on Fastify, a project starter and a documentation site. Read `README.md` first.

## Layout

An npm workspace (`packages/*` and the starter's templates):

- `packages/core`: `@jadis/core`, the library. The `Jadis` class in `src/base-component.ts`, helpers in
  `src/helpers/` (attributes, buses, changes, elements, styles, templates, the JSX runtime…), `src/router/`,
  `src/translation/`, `src/server/` (server rendering), types in `src/types/`. Unit tests in `src/tests/` (Vitest),
  browser tests in `tests/browser/` (Playwright), type tests in `tests/types/` (`npm run test:types`: checked by
  `tsc`, never run). Built with Rolldown, its declarations by `tsc`.
- `packages/fastify`: `@jadis/fastify`, which renders a Jadis app's pages on Fastify. Versioned with the core, whose
  server rendering it hosts.
- `packages/create`: `@jadis/create`, the project starter, its templates in `templates/` (`ts`, `js`, `ssr`,
  `vanilla`). The CI builds the first three.
- `packages/docs`: the documentation site (VitePress) on GitHub Pages, deployed at each push to `main`.
- `plugins/jadis-official/`: the skill for coding agents, listed by `.claude-plugin/marketplace.json` (which
  skills.sh reads too) and copied by `install-skill.sh`. `tests/skill.test.mjs` checks it: the version its manifest
  names is the core's, `SKILL.md` stays short and links each reference, and every link stays inside the plugin's
  folder (an installed plugin holds only that folder). `.agents/skills/jadis-official` is an installed copy, ignored
  by git: change the skill in `plugins/`, and read it there. A change to what apps do with Jadis updates the
  documentation and the skill too.

## Versions and releases

`npm run set-version` asks for the new core version and writes it where it is named: `@jadis/core` and
`@jadis/fastify`, the skill's manifest (Claude Code gives its users a new copy only when it changes), the templates'
dependency and CDN version, and the CDN links of the skill and the docs; it moves `@jadis/create` to its next minor.
Each package is published by its own workflow (`release-core`, `release-fastify`, `release-create`), started by hand.

## Checking a change

`npm run check` (Biome) and `npm test` (every workspace): the pre-commit hook runs both. The CI also runs
`npm run test:skill`, `npm run test:types --workspace=@jadis/core`, `npm run test:browser --workspace=@jadis/core`
(Chromium: `npx playwright install chromium` once), the templates' builds, `npm run verify:packages` (each export
alone leaves the others out of an app's bundle) and `npm run docs:build`.
