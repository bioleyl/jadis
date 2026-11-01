# Jadis, rendered on the server

A [Jadis](https://bioleyl.github.io/jadis/) app that [Fastify](https://fastify.dev) renders on the server: every page
arrives as HTML, readable before any script runs, then Jadis takes it over in the browser.

```bash
npm install
npm run dev                  # http://localhost:3000
npm run build && npm start   # the build
```

| | |
|---|---|
| `src/routes.ts` | The app's one route table: the browser's router follows it, the server renders from it |
| `server/main.ts` | Fastify: the API, then `@jadis/fastify`, which renders every other page |
| `src/entry-server.ts` | The page of a URL: the page loads its data, the response gets its status and title |
| `src/entry-client.ts` | The router takes over the page the server rendered |
| `src/pages/` | The pages: `load(route, api)` fills their `data`, bound to an attribute |

The guide: [Server Rendering](https://bioleyl.github.io/jadis/server-rendering/overview).
