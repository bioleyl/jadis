# Vibe Coding

Build an app on *Jadis* by asking a coding agent for it. The `jadis-official` skill teaches the agent how *Jadis* works, so that it writes components the *Jadis* way: real DOM drawn once and changed in place, never a React or Vue habit brought along. It works with Claude Code, Codex, Cursor, Gemini CLI, GitHub Copilot, OpenCode, and any agent that reads [Agent Skills](https://agentskills.io).

## What the skill teaches

- **The model**: a template drawn once, nodes changed by hand, and the lifecycle around it: connection, moves, removal and reconnection, with a translation table for those who know React, Vue or Lit.
- **The setup**: a scaffolded project, Vite with TypeScript and JSX, checked JavaScript, or no build step at all with an import map.
- **Components and templates**: refs, `useChange`, attributes, JSX props and events, lists that change row by row, forms, styles, slots and shadow DOM.
- **Communication, routing and translations**: events between parent and child, buses and services, routes, links, pages that are kept or ask before they are left, typed texts in several languages.
- **Server rendering**: `@jadis/fastify`, pages that load their data, state that travels in attributes.
- **Tests**: what Vitest with jsdom can check and when to wait, and what needs a real browser.
- **The mistakes agents make**: re-rendering, invented hooks, overridden custom element callbacks, listeners that outlive their component, and the rest, each with what to write instead.
- **A self-check** the agent runs on its own code before it shows it to you, and the rules to review code by.
- **Where the API is**: the declarations of the version the app installed, and this documentation at that version.
- **What to report**: a bug in *Jadis*, or something every app has to work around, becomes an issue on *Jadis*'s repository, which the agent writes for you to file.

The skill is a short `SKILL.md`, which every session reads, and references the agent opens when the task needs them: recipes, the API, routing, server rendering and the others.

## Install it

### Claude Code: the plugin

*Jadis*'s repository is also a plugin marketplace. In Claude Code, add it once, then install the plugin:

```text
/plugin marketplace add bioleyl/jadis
/plugin install jadis-official@jadis
```

The install opens the plugin's page in `/plugin`, where you choose for whom: you, in every project, or the project, for everyone working on it. From a terminal, the same with `claude plugin marketplace add bioleyl/jadis` and `claude plugin install jadis-official@jadis`.

Claude loads the skill on its own when the code it works on imports `@jadis/core`; `/jadis-official:jadis-official` loads it by hand.

### Any agent: skills.sh

```bash
npx skills add bioleyl/jadis
```

[skills.sh](https://skills.sh) finds the agents installed on the machine and asks which ones get the skill, for the project or for you (`-g`). `npx skills update` brings it up to date.

### Any agent: the install script

```bash
curl -fsSL https://raw.githubusercontent.com/bioleyl/jadis/main/install-skill.sh | sh
```

It asks where the skill goes, one or several places:

| Choice | Folder | Read by |
|---|---|---|
| For you, every project | `~/.agents/skills` | Codex, and other agents that read the shared folder |
| For you, every project | `~/.claude/skills` | Claude Code |
| For the project | `.agents/skills` | Codex, Cursor, Gemini CLI, GitHub Copilot, OpenCode… |
| For the project | `.claude/skills` | Claude Code |
| Elsewhere | any folder that holds skills | `~/.cursor/skills`, `~/.gemini/skills`… |

Run from a clone of the repository (`sh install-skill.sh`), it can link the skill to the clone instead of copying it, so that `git pull` updates it. Without questions, for a script or a CI:

```bash
curl -fsSL https://raw.githubusercontent.com/bioleyl/jadis/main/install-skill.sh | sh -s -- --target project-agents --target project-claude --yes
```

`--ref core-v<version>` installs the skill of a release, from the first one that has `jadis-official`; `--help` lists the options. To remove the skill, delete its `jadis-official` folder.

## For a whole team

Commit the skill with the project: install it in the project's `.agents/skills` and `.claude/skills` (with skills.sh or the script) and commit those folders. Everyone who clones the project gets it, whatever their agent.

For Claude Code alone, a project's repository can instead give the plugin to everyone who opens it, kept up to date: commit this file as `.claude/settings.json`. It works in the folders people trust, which Claude Code asks about the first time.

```json
{
  "extraKnownMarketplaces": {
    "jadis": {
      "source": { "source": "github", "repo": "bioleyl/jadis" },
      "autoUpdate": true
    }
  },
  "enabledPlugins": { "jadis-official@jadis": true }
}
```

## Asking well

Say what the page is for and where its data comes from; the skill brings how it is built.

- *Start a Jadis app with Vite and TypeScript: a header, a router in history mode that follows links, a Home page and a Not found page.*
- *Add a todo list: a field to add an item, rows that can be ticked and deleted, and the number of items left.*
- *Make the Orders page load /api/orders, with its filters in the address.*
- *Translate the app into French and German, following the browser's language.*

A few habits help:

- Name the API when you know it (`useAttributes`, `router.bus`, `canLeave`): the agent reads its documentation at your version before it writes.
- Ask for the tests and the type check to pass, and look at the page in the browser.
- Ask the agent to review Jadis code against the skill: it reports each finding with the rule it breaks and a fix.
- When the agent meets a problem in *Jadis*, let it write the issue, and keep the app's way around it small until *Jadis* has the fix.

## Building on jlib

[jlib](https://bioleyl.github.io/jlib/) (`@syware/jlib`) is a component library on *Jadis*: buttons, fields, tables, dialogs, navigation and page templates, as `jl-*` tags and typed classes for JSX. Its repository has plugins of its own: `jlib`, its components and the way an app is written on them, and `syware-ux`, how SyWare's apps behave. Install them beside `jadis-official`:

```text
/plugin marketplace add bioleyl/jlib
/plugin install jlib@jlib
```

jlib's [Vibe coding](https://bioleyl.github.io/jlib/vibe-coding) page tells more.

## Keeping it current

The skill is released with `@jadis/core`, under its version. Whatever the skill's version, the agent reads the API of the version of *Jadis* your app installed.

- **The plugin**: Claude Code gives you a new copy when that version changes. In `/plugin`, under **Marketplaces**, choose jadis, then **Update marketplace**, or **Enable auto-update** to have it done at start. From a terminal: `claude plugin marketplace update jadis`, then `claude plugin update jadis-official@jadis`. A session keeps the plugins it started with: `/reload-plugins` takes the new ones.
- **skills.sh**: `npx skills update`.
- **The script**: run it again, or link the skill to a clone and `git pull`.
