# Vibe Coding

Build an app on *Jadis* by asking Claude Code for it. The `jadis` plugin teaches Claude how *Jadis* works, so that it writes components the *Jadis* way: real DOM drawn once and changed in place, never a React or Vue habit brought along.

## What the plugin teaches

- **The model**: a template drawn once, nodes changed by hand, and the lifecycle around it: connection, moves, removal and reconnection.
- **The setup**: a scaffolded project, Vite with TypeScript and JSX, or no build step at all with an import map.
- **Components**: refs, `useChange`, attributes, JSX props and events, slots and shadow DOM.
- **Communication, routing and translations**: events between parent and child, buses, routes, links, pages that ask before they are left, typed texts in several languages.
- **Tests**: what Vitest with jsdom can check, and what needs a real browser.
- **Where the API is**: the declarations of the version the app installed, and this documentation at that version.
- **What to report**: a bug in *Jadis*, or something every app has to work around, becomes an issue on *Jadis*'s repository, which Claude writes for you to file.

## Install the plugin

*Jadis*'s repository is also a plugin marketplace. In Claude Code, add it once, then install the plugin:

```text
/plugin marketplace add bioleyl/jadis
/plugin install jadis@jadis
```

The install opens the plugin's page in `/plugin`, where you choose for whom: you, in every project, or the project, for everyone working on it. From a terminal, the same with `claude plugin marketplace add bioleyl/jadis` and `claude plugin install jadis@jadis`.

The plugin holds one skill, `jadis`. Claude loads it on its own when the code it works on imports `@jadis/core`; `/jadis:jadis` loads it by hand.

## For a whole team

A project's repository can give the plugin to everyone who opens it in Claude Code, kept up to date: commit this file as `.claude/settings.json`. It works in the folders people trust, which Claude Code asks about the first time.

```json
{
  "extraKnownMarketplaces": {
    "jadis": {
      "source": { "source": "github", "repo": "bioleyl/jadis" },
      "autoUpdate": true
    }
  },
  "enabledPlugins": { "jadis@jadis": true }
}
```

## Asking well

Say what the page is for and where its data comes from; the plugin brings how it is built.

- *Start a Jadis app with Vite and TypeScript: a header, a router in history mode that follows links, a Home page and a Not found page.*
- *Add a todo list: a field to add an item, rows that can be ticked and deleted, and the number of items left.*
- *Make the Orders page load /api/orders, with its filters in the address.*
- *Translate the app into French and German, following the browser's language.*

A few habits help:

- Name the API when you know it (`useAttributes`, `router.bus`, `canLeave`): Claude reads its documentation at your version before it writes.
- Ask for the tests and the type check to pass, and look at the page in the browser.
- When Claude meets a problem in *Jadis*, let it write the issue, and keep the app's way around it small until *Jadis* has the fix.

## Building on jlib

[jlib](https://bioleyl.github.io/jlib/) (`@syware/jlib`) is a component library on *Jadis*: buttons, fields, tables, dialogs, navigation and page templates, as `jl-*` tags and typed classes for JSX. Its repository has plugins of its own: `jlib`, its components and the way an app is written on them, and `syware-ux`, how SyWare's apps behave. Install them beside `jadis`:

```text
/plugin marketplace add bioleyl/jlib
/plugin install jlib@jlib
```

jlib's [Vibe coding](https://bioleyl.github.io/jlib/vibe-coding) page tells more.

## Keeping it current

The plugin is released with `@jadis/core`, under its version, and Claude Code gives you a new copy when that version changes. In `/plugin`, under **Marketplaces**, choose jadis, then **Update marketplace**, which updates its plugin too, or **Enable auto-update** to have it done at start. From a terminal:

```bash
claude plugin marketplace update jadis
claude plugin update jadis@jadis
```

A session keeps the plugins it started with: `/reload-plugins` takes the new ones. Whatever the plugin's version, Claude reads the API of the version of *Jadis* your app installed.

## Other assistants

The skill is a Markdown file: give [SKILL.md](https://github.com/bioleyl/jadis/blob/main/plugins/jadis/skills/jadis/SKILL.md) to another assistant as its instructions.
