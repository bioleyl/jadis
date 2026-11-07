# API

Every public export of `@jadis/core`, at the version [SKILL.md](../SKILL.md) names, in short form. The commented declarations of the installed version are in `node_modules/@jadis/core/dist/dts/`: they win over this page.

## Contents

- Entry points
- `Jadis` (the base class)
- Helpers
- JSX runtime
- `Bus`
- Routing
- Translations
- Types
- `@jadis/core/server`
- `@jadis/fastify`

## Entry points

| Import | Holds |
|---|---|
| `@jadis/core` | Everything below but the server |
| `@jadis/core/jsx-runtime` | What the compiler calls for JSX: never import it yourself |
| `@jadis/core/server` | `renderRoute`, `renderToHtml`, `serializeHtml` |
| `@jadis/fastify` | The Fastify plugin (default export) and its types |

## `Jadis` (the base class)

`abstract class Jadis extends HTMLElement`

**Static**

| Member | Meaning |
|---|---|
| `static readonly selector: \`${string}-${string}\`` | The custom element name. Required |
| `static readonly useShadowDom: boolean` | `true` by default |
| `static register(): void` | Defines the element unless the name is taken; throws without a selector |
| `static toTemplate(options?: { props?, attrs? }, slotted?: DocumentFragment): T` | Creates an instance with properties, attributes and a copy of `slotted` as children |
| `static toString(): string` | The selector |

**To implement** (all optional)

| Member | Called |
|---|---|
| `templateHtml(): Node` | Once, at the first connection |
| `templateCss(): string` | Once, at the first connection; one stylesheet per class, shared by instances |
| `onConnect(): void` | A task after each connection |
| `onDisconnect(): void` | A microtask after each removal, once the kill signal aborted |

**Protected helpers** (inside the class)

| Member | Meaning |
|---|---|
| `useRefs((ref) => ({ name: ref<T>('query') \| ref(Class) })): Readonly<…>` | Getters that query the template on each access; throw when nothing matches |
| `useChange<T>(initial, onChange: (value: T, oldValue: T) => void, options?): { get(): T; set(value \| (previous) => value): void }` | A value with a callback; queued while disconnected |
| `options.immediate?: boolean` | Calls back with the initial value at the connection |
| `options.attribute?: string`, `options.parse?: (value: string \| null) => T` | Sets the value from that attribute (turns `immediate` on); default parsers for string, number, boolean |
| `useAttributes({ name: (value, oldValue) => void }): Record<name, string \| null>` | Callbacks on attribute changes, and getters |
| `useEvents<{ name: Payload }>(): { emit(name, payload); register(name, (payload) => void) }` | Typed custom events on the element; `register` uses the element's kill signal. JavaScript: `useEvents({ name: String })` |
| `on(target: HTMLElement \| Window \| Document, event, callback): void` | A listener removed at disconnection |
| `onBus(bus, event, callback): void` | A bus listener removed at disconnection |
| `useTranslation(translator, draw: () => void): void` | Calls `draw` at each connection and at each language change; call once, in the constructor |
| `getElement<T>(query): T` | One query; `>>>` pierces nested shadow roots; throws when nothing matches |
| `toggleClass(name: string, condition: boolean): void` | A class on the host |
| `killSignal: AbortSignal` | Aborts at disconnection; a new one at each connection |
| `onConnectActions: Array<() => void>` | Actions run at the next connection |

**Public**

| Member | Meaning |
|---|---|
| `isConnected: boolean` | From the connection until the disconnection ran |
| `shadowRoot: ShadowRoot \| null` | Open, unless `useShadowDom` is false |

Never override: `connectedCallback`, `disconnectedCallback`, `attributeChangedCallback`, `connectedMoveCallback`, `observedAttributes`.

## Helpers

| Export | Meaning |
|---|---|
| `createElement(tag \| Class, { props?, attrs? }?, appendTo?)` | Creates an element, sets properties (`.set()` on `useChange` fields) and attributes (camel case to kebab case), appends it to `appendTo`. Typed by tag or class |
| `createSelector(name): ComponentSelector` | Checks a custom element name; throws on a bad one |
| `isComponentSelector(name): boolean` | The same check, as a predicate |
| `css\`…\`` | Joins a CSS template literal; escapes nothing |
| `assert(condition, message): asserts condition` | Throws `Error(message)` when the condition is falsy |

## JSX runtime

| Export | Meaning |
|---|---|
| `jsx`, `jsxs`, `h`, `Fragment` | The JSX factory and the fragment: used by the compiler |
| `createVNode(tag, { props?, children? })`, `createComponentVNode(Class, { props?, children? })` | A tree described as data |
| `mountVNodes(parent, nodes)` | Creates VNodes into a parent |

## `Bus`

```ts
class Bus<Events extends Record<string, unknown>> {
  emit(name, payload): void;                                   // payload optional when typed undefined
  register(name, (payload) => void, signal: AbortSignal): void; // the signal is required
}
```

## Routing

| Export | Meaning |
|---|---|
| `defineRoutes({ name: { page, path, options? } \| group })` | Flattens and normalises a route table |
| `defineRouteGroup(prefix, routes, { rootComponentSelector? }?)` | Prefixes paths; a group under a key prefixes names in camel case |
| `new Router(routes, { mode?, baseUrl?, links?, signal? })` | `mode` `'history'` (default) or `'hash'` |

`Router` members:

| Member | Meaning |
|---|---|
| `mountOn(element: HTMLElement, { show? }?)` | Shows the current URL's route and follows the URL |
| `goto(name, params?)`, `replace(name, params?)` | Navigate by name; params typed from the path |
| `gotoPath(path)`, `replacePath(path)` | Navigate by path, query included |
| `match(path): ActiveRoute \| undefined` | The route of a path |
| `currentRoute: ActiveRoute` | The route shown; throws before the first |
| `config` | `{ mode, baseUrl, links }` |
| `bus: Bus<{ change: ActiveRoute }>` | Emits once each page is shown |

A page may implement `RoutedPage`: `onRoute?(route: ActiveRoute): void` (keeps the page), `canLeave?(next: ActiveRoute): boolean | Promise<boolean>`.

## Translations

| Export | Meaning |
|---|---|
| `defineTranslations(source)` | The source texts, their strings kept in their type |
| `defineTranslations(source, translation)` | A translation, checked against the source |
| `new Translator({ sourceLocale: texts }, { locale: texts \| () => import('./x') })` | The translator |

`Translator` members: `t(key, params?)`, `setLocale(locale): Promise<void>`, `match(languages?)`, `locale`, `locales`, `bus: Bus<{ change: Locale }>`.

## Types

`ActiveRoute`, `Route`, `RouteDefinition`, `RoutedPage`, `LeaveAnswer`, `RouterMode`, `RouterOptions`, `MountOptions`, `PageShow`, `ChangeOptions`, `AttributeParser`, `ChangeStateHandler` (the `useChange` handler), `UseEventsHandler`, `TranslationSource`, `TranslationKey`, `TranslationArgs`, `TranslationOf`, `Translations`, `TranslationTree`, `TranslationLoader`, `PluralForms`, `PlaceholderValue`, `VNode`. Import them with `import type`.

## `@jadis/core/server`

```ts
renderRoute(routes, path: string, { prepare?: (page: HTMLElement, route: ActiveRoute) => Promise<void>, styles? }?):
  Promise<{ route: ActiveRoute; body: string; page: HTMLElement } | undefined>;
renderToHtml(content: Node | string, { ready?: () => Promise<void>, styles? }?): Promise<string>;
serializeHtml(node: Node, { styles?: (css: string) => string | undefined }?): string;
```

They need a DOM as globals (happy-dom) before the app's modules load.

## `@jadis/fastify`

```ts
await app.register(jadis, {
  root: string,                                   // the app's folder
  entry: string,                                  // the server entry, exporting `render: RenderPage`
  dev?: { vite },                                 // development, with the app's Vite module
  outDir?: { client?: string; server?: string },  // dist/client and dist/server by default
  workers?: number,
  preHandler?: Fastify hook,
  requestData?: (request) => data,                // what a render gets of the request; data only
});

type RenderPage<RequestData> = (url: string, request: RequestData, server: ServerTools) => Promise<PageResponse>;
interface ServerTools { fetch: typeof fetch; origin: string; styles: (css: string) => string }
interface PageResponse { body: string; head?: string; status?: number; headers?: Record<string, string> }
```
