# Translator Class

Shows an application's texts in the language chosen. Its keys and each text's placeholders come from the source texts, so a missing key or parameter is a type error. Each translation is loaded once, when its language is first chosen.

## Import

```typescript
import { defineTranslations, Translator } from '@jadis/core';
```

## `defineTranslations()`

```typescript
defineTranslations(source: TranslationTree): Source;
defineTranslations(source: Source, translations: T): T;
```

With one argument, defines the source texts, keeping their exact strings in their type. With two, defines a translation of the source texts and checks it: the same keys, the same placeholders, and plural forms where the source has them. See [Writing Texts](../translation/texts.md).

## Constructor

```typescript
new Translator(source: { [locale]: SourceTexts }, translations: Record<Locale, Texts | Loader>);
```

| Parameter | Type | Description |
|---|---|---|
| `source` | `{ [locale]: SourceTexts }` | The source language and its texts, alone: `{ en }`. It is shown until another is set. |
| `translations` | `Record<string, Texts \| () => Promise<{ default: Texts }>>` | Each other language: its texts, or a loader such as `() => import('./fr')`. |

```typescript
const i18n = new Translator({ en }, {
  fr: () => import('./fr'),
  de,
});
```

## Properties

| Property | Type | Description |
|---|---|---|
| `locale` | `Locale` | The locale shown. |
| `locales` | `Locale[]` | Every locale: the source's first, then the translations' in their order. |
| `bus` | `Bus<{ change: Locale }>` | Emits `change` with the new locale, once its texts are the ones `t` gives. Components follow it with [`useTranslation`](../translation/overview.md#texts-that-follow-the-language). |

## Methods

### `t(key, params?)`

Gives the text of a key in the locale shown, its placeholders filled.

```typescript
i18n.t('home.title');
i18n.t('home.greeting', { name: 'Ada' });
i18n.t('cart.items', { count: 3 });
```

| Parameter | Type | Description |
|---|---|---|
| `key` | `TranslationKey` | A key of the source texts, its groups joined by dots |
| `params` | `Record<string, string \| number>` | A value for each placeholder, and a numeric `count` for plural forms: required when the text has some, refused otherwise |

A number is formatted with the locale's `Intl.NumberFormat`, and `count` chooses the plural form with its `Intl.PluralRules`.

### `setLocale(locale)`

Shows the texts of a locale: loads them the first time, sets the page's `lang`, and emits `change`. Returns a `Promise` that settles once the texts are shown.

```typescript
await i18n.setLocale('fr');
```

When it is called again before a load ends, the locale asked last wins. A load that fails rejects, keeps the locale shown, and is tried again next time. Asking for the locale shown does nothing.

### `match(languages?)`

Finds the locale that best fits the wanted languages, the first wanted first: for `fr-CH`, `fr-CH`, else `fr`, else another French such as `fr-FR`. Falls back to the source locale.

```typescript
await i18n.setLocale(i18n.match());            // the browser's languages
i18n.match(['de-AT', 'en']);                   // 'de' when there is a German
```

| Parameter | Type | Description |
|---|---|---|
| `languages` | `readonly string[]` | The wanted languages, the preferred first (default: `navigator.languages`) |

## Types

| Type | Description |
|---|---|
| `TranslationTree` | Texts grouped by key. |
| `PluralForms` | A text's forms by plural category; `other` is required. |
| `Translations<Source>` | A translation of the texts `Source`: the same keys and placeholders. |
| `TranslationKey<Source>` | The union of the keys of `Source`, such as `'home.title' \| 'cart.items'`. |
| `TranslationLoader<T>` | `() => Promise<{ default: T }>` |
| `PlaceholderValue` | `string \| number` |

## See Also

- [Translations Overview](../translation/overview.md) — Getting started with translations.
- [Writing Texts](../translation/texts.md) — Placeholders, numbers, plural forms, and what a translation must match.
- [Jadis Class](./jadis-class.md) — `useTranslation`, to draw a component's texts in the language shown.
