# Translations

Jadis has a typed translator. The source language's texts define the keys and placeholders; every translation and every call to `t` is checked against them at compile time.

## Contents

- Texts
- The translator
- Components that follow the language
- Plurals and numbers
- Traps

## Texts

```ts
// src/i18n/en.ts: the source texts
import { defineTranslations } from '@jadis/core';

export default defineTranslations({
  orders: {
    title: 'Orders',
    greeting: 'Hello {name}!',
    count: { one: '{count} order', other: '{count} orders' },
    total: 'Total: {amount}',
    search: 'Search orders',
  },
});
```

```ts
// src/i18n/fr.ts: checked against en, same keys, same placeholders
import { defineTranslations } from '@jadis/core';

import en from './en';

export default defineTranslations(en, {
  orders: {
    title: 'Commandes',
    greeting: 'Bonjour {name} !',
    count: { one: '{count} commande', other: '{count} commandes' },
    total: 'Total : {amount}',
    search: 'Chercher une commande',
  },
});
```

- Keys are nested groups; a key never contains a dot (`defineTranslations` refuses `'orders.title'` as a key: write the group).
- A translation missing a key or a placeholder, or adding a key, placeholder or plural form the source lacks, is a type error on that line.
- Texts live in `.ts` files: a `.json` import types every string as `string` and loses the checks.

## The translator

```ts
// src/i18n/i18n.ts
import { Translator } from '@jadis/core';

import en from './en';

export const i18n = new Translator({ en }, {
  fr: () => import('./fr'),       // loaded the first time it is chosen
  de: () => import('./de'),
});
```

```ts
// src/main.ts, before mounting
await i18n.setLocale(i18n.match());   // the best fit for navigator.languages, else the source
router.mountOn(document.getElementById('app') ?? document.body);
```

```ts
i18n.t('orders.title');                            // 'Orders'
i18n.t('orders.greeting', { name: 'Ada' });        // each placeholder required by name
i18n.t('orders.count', { count: 3 });              // plural forms need a numeric count
i18n.locale;                                       // the locale shown
i18n.locales;                                      // ['en', 'fr', 'de'], the source first: for a language picker
await i18n.setLocale('fr');                        // loads once, sets <html lang>, emits 'change' on i18n.bus
```

- The first argument of the constructor holds exactly one language: the source. A text a translation lacks falls back to it; a key that leads nowhere gives the key back.
- `match(languages?)` finds `fr-CH`, else `fr`, else another French, among the locales; the source when none fits.
- Calling `setLocale` again before a load ends: the locale asked last wins. A load that fails is forgotten, so the next call tries again.
- Locales are language tags: `en`, `fr`, `de-CH`.

## Components that follow the language

Nothing re-renders when the language changes. A component writes its texts in a callback given to `useTranslation`, **once, in the constructor**:

```tsx
export class OrdersHeader extends Jadis {
  static readonly selector = 'orders-header';

  readonly count = this.useChange(0, () => this.drawTexts());

  private readonly _refs = this.useRefs((ref) => ({
    title: ref('h1'),
    count: ref('#count'),
    search: ref('input'),
  }));

  constructor() {
    super();
    this.useTranslation(i18n, () => this.drawTexts());
  }

  templateHtml(): Node {
    return (
      <header>
        <h1 />
        <p id="count" />
        <input type="search" />
      </header>
    );
  }

  // Every text, wherever it goes: text, placeholder, aria-label, title.
  private drawTexts(): void {
    this._refs.title.textContent = i18n.t('orders.title');
    this._refs.count.textContent = i18n.t('orders.count', { count: this.count.get() });
    this._refs.search.placeholder = i18n.t('orders.search');
  }
}
```

The callback runs at every connection (after the template, the attribute callbacks and the queued changes, before the paint, so refs work), at each language change while connected, and again when the component comes back. A text with a changing parameter is drawn from one method, called from `useTranslation` and from the change.

An app that picks its language before mounting and reloads to change it can write texts straight in the template: `<h1>{i18n.t('orders.title')}</h1>`.

## Plurals and numbers

- Plural forms are an object of plural categories: `zero`, `one`, `two`, `few`, `many`, `other`; `other` is required. `Intl.PluralRules` picks the form for the locale, so each language lists the forms it uses.
- A number given to a placeholder is formatted with `Intl.NumberFormat` for the locale (`1234.5` is `1,234.5` in `en`, `1 234,5` in `fr`). Pass a string to keep a value as written (an id, a postcode). Format money and dates yourself with `Intl` before passing them.

## Traps

- Never name the drawing method `translate`: `HTMLElement.translate` already exists.
- Call `useTranslation` in the constructor, not in `onConnect`: it already runs at each connection.
- On a server, the translator is a module's state, shared by every render of the worker, and renders interleave at each `await`: switching its language per request mixes languages between visitors. Render one language per server process, and ask in Jadis's issues before building more.
