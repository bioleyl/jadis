# Overview

Jadis includes a typed translator. The texts of one language, the source, give the keys and the placeholders: every translation must have the same, and every call to `t` must give each placeholder its value. A missing key, text or parameter is a type error, the way a missing route parameter is.

## Key Concepts

| Concept | Description |
|---|---|
| **Source texts** | The texts of the source language, defined with `defineTranslations()`. Their keys and placeholders are the ones every translation has. |
| **Translation** | The texts of another language, defined with `defineTranslations(source, texts)` and checked against the source. |
| **Translator** | Gives the text of a key in the language shown, and switches the language. |
| **Locale** | A language tag such as `en`, `fr` or `de-CH`: the plurals, the numbers and the page's `lang` follow it. |

## Quick Start

The source texts:

```typescript
// src/i18n/en.ts
import { defineTranslations } from '@jadis/core';

export default defineTranslations({
  home: {
    title: 'Welcome',
    greeting: 'Hello {name}!',
  },
  cart: {
    items: { one: '{count} item', other: '{count} items' },
    total: 'Total: {amount}',
  },
});
```

A translation, checked against them:

```typescript
// src/i18n/fr.ts
import { defineTranslations } from '@jadis/core';
import en from './en';

export default defineTranslations(en, {
  home: {
    title: 'Bienvenue',
    greeting: 'Bonjour {name} !',
  },
  cart: {
    items: { one: '{count} article', other: '{count} articles' },
    total: 'Total : {amount}',
  },
});
```

The translator, with the source language first and a loader for each translation:

```typescript
// src/i18n/i18n.ts
import { Translator } from '@jadis/core';
import en from './en';

export const i18n = new Translator({ en }, {
  fr: () => import('./fr'),
  de: () => import('./de'),
});
```

Then choose the language that best fits the browser's, before mounting the application:

```typescript
// src/main.ts
await i18n.setLocale(i18n.match());
router.mountOn(document.getElementById('app') ?? document.body);
```

## Showing Texts

```typescript
i18n.t('home.title');                       // 'Welcome'
i18n.t('home.greeting', { name: 'Ada' });   // 'Hello Ada!'
i18n.t('cart.items', { count: 3 });         // '3 items'

i18n.t('home.greeting');                    // ✗ Expected 2 arguments, but got 1
i18n.t('home.greeting', { nmae: 'Ada' });   // ✗ 'nmae' does not exist in type '{ name: … }'
i18n.t('home.titel');                       // ✗ not a key of the source texts
```

The editor completes the keys, and the parameters of each.

## Switching Language

```typescript
await i18n.setLocale('fr');
```

`setLocale` loads the translation the first time, sets `<html lang="fr">`, and emits `change` on `i18n.bus`.

## Texts That Follow the Language

A Jadis component renders once. To follow the language, it gives `useTranslation` a callback that writes its texts, once, in the constructor:

```tsx
export class CartSummary extends Jadis {
  static readonly selector = 'cart-summary';

  private readonly _refs = this.useRefs((ref) => ({
    title: ref('h2'),
    search: ref('input'),
  }));

  constructor() {
    super();
    this.useTranslation(i18n, () => {
      this._refs.title.textContent = i18n.t('home.title');
      this._refs.search.placeholder = i18n.t('cart.search');
    });
  }

  templateHtml(): Node {
    return (
      <>
        <h2 />
        <input />
      </>
    );
  }
}
```

The callback runs:

- **at every connection**, once the template exists, after the attribute callbacks and the changes made before the connection, and before the browser paints: the refs work, the values are settled, and no empty text is ever shown;
- **at each language change** while the component is connected. The listener goes with the component's `killSignal`;
- **again when the component comes back**, so a language changed while it was away is drawn.

Each text is written once, whatever it goes into: text, `placeholder`, `aria-label`, `title`.

A text whose parameters change is drawn from both places: put the texts in a method, and call it from `useTranslation` and from the change:

```tsx
readonly count = this.useChange(0, () => this.drawTexts());

constructor() {
  super();
  this.useTranslation(i18n, () => this.drawTexts());
}

private drawTexts(): void {
  this._refs.title.textContent = i18n.t('home.title');
  this._refs.items.textContent = i18n.t('cart.items', { count: this.count.get() });
}
```

Don't name that method `translate`: every element already has a `translate` property, the HTML attribute's.

An application that chooses its language before mounting, and reloads to change it, can write the texts straight in the template instead: `<h2>{i18n.t('home.title')}</h2>`.

`i18n.locales` lists the locales, the source's first, to build a language picker.

## Good to Know

- **Texts live in `.ts` files.** TypeScript reads every string of an imported `.json` file as `string`, which loses the placeholders.
- **Locales are language tags** (`en`, `fr`, `de-CH`): they choose the plural rules and the number format. Quote a tag that has a hyphen: `{ 'de-CH': () => import('./de-ch') }`.
- **Each translation loads once**, when its language is first chosen; give its texts directly (`{ fr }`) to bundle them with the application. When `setLocale` is called again before a load ends, the locale asked last wins. A load that fails rejects, keeps the language shown, and is tried again at the next `setLocale`.
- **Nothing re-renders on its own**: a component follows the language with `useTranslation`, as above.
- A key the source does not have, which only untyped code can ask for, gives the key itself.
- An application that does not import the translator does not bundle it.

## See Also

- [Writing Texts](./texts.md) — Placeholders, numbers, plural forms, and what a translation must match.
- [Translator API Reference](../api/translator-class.md) — Complete API documentation.
