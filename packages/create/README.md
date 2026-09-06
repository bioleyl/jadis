# @jadis/create

A simple CLI to scaffold projects using [Jadis](https://www.npmjs.com/package/@jadis/core). It provides Vite-based JavaScript and TypeScript templates with JSX support, plus a vanilla template that uses native browser modules without a bundler.

## Usage

```bash
npx @jadis/create js my-app
```

or, for a Typescript starter:

```bash
npx @jadis/create ts my-app
```

This will create a new directory called `my-app` with a minimal and ready-to-code *Jadis* setup.

For a no-bundler project:

```bash
npx @jadis/create vanilla my-app
```

## Run the Project

```bash
cd my-app
npm install
npm run dev
```

This will start a local dev server with instant reload. The vanilla template instead uses a static HTTP server:

```bash
cd my-app
npx serve .
```

## Why This CLI?

Because *Jadis* is about simplicity. This CLI gives you only what you need to start: minimal boilerplate, JSX-ready configuration, and no unnecessary framework dependencies.

## License

MIT - Made with ❤️, ☕, a bit of 🧠 and Neovim.
