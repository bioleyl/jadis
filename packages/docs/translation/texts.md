# Writing Texts

## Keys

Texts are grouped by key, as deep as needed. A text's key joins its groups with dots:

```typescript
export default defineTranslations({
  cart: {
    summary: { title: 'Your order' },
  },
});

i18n.t('cart.summary.title');
```

A key itself never holds a dot: `t` reads a dot as a group and its key. `defineTranslations({ 'cart.title': … })` is refused; write the group, `{ cart: { title: … } }`.

## Placeholders

A name between braces is a placeholder: `t` must give it a value, by its name.

```typescript
greeting: 'Hello {name}, you have {count} messages',

i18n.t('home.greeting', { name: 'Ada', count: 3 });
```

A value is a string or a number. A number is written the way the language shown writes it: `1234.5` is `1,234.5` in English and `1 234,5` in French.

A number that is an identifier, such as an order number, must not be written that way: `{ order: 1234 }` shows "#1,234" in English and "#1’234" in Swiss German. Give it as a string to keep it as it is written:

```typescript
orderTitle: 'Order #{order}',

i18n.t('orders.orderTitle', { order: 1234 });         // 'Order #1,234'
i18n.t('orders.orderTitle', { order: String(1234) }); // 'Order #1234'
```

Empty braces, `{}`, are text.

## Plural Forms

A text that depends on a number gives one form per plural category. The translator chooses the form of the `count` parameter with the browser's `Intl.PluralRules`:

```typescript
items: { one: '{count} item', other: '{count} items' },

i18n.t('cart.items', { count: 1 });   // '1 item'
i18n.t('cart.items', { count: 5 });   // '5 items'
```

The categories are `zero`, `one`, `two`, `few`, `many` and `other`, and `other` is required. Each language uses its own: French adds `many` for large round numbers (`1 000 000 d’articles`), Polish uses `few` and `many`, Japanese only `other`. A form the language does not use is never chosen, and a count without a form of its own takes `other`.

An object whose keys are all plural categories, `other` among them, is plural forms; any other object is a group. A group with only such keys, such as `{ one: 'One', other: 'Other' }`, is read as plural forms: rename one of its keys.

## Translations

`defineTranslations(source, texts)` checks a translation against the source texts. Each mistake is reported on its own line:

| Mistake | Error |
|---|---|
| A placeholder is missing: `greeting: 'Hallo!'` | `'"Hallo!"' is not assignable to type '${string}{name}${string}'` |
| A placeholder the source does not have: `'Hallo {name}, {date}!'` | `not assignable to type '{ 'Unknown placeholder': "date" }'` |
| A key is missing | `Property 'total' is missing` |
| A key the source does not have | `not assignable to type '{ 'Not in the source': "tax" }'` |
| Plural forms without `other` | `Property 'other' is missing` |
| A form that is not a plural category: `{ plenty: … }` | `not assignable to type '{ 'Not a plural form': "plenty" }'` |
| Plural forms written as one text | `'string' is not assignable to type '{ readonly other: … }'` |

The placeholders may come in any order. In plural forms, `other` writes the source's placeholders; the other forms are free: `one: 'un article'`.

When the source drops a placeholder, every translation that still writes it stops compiling, instead of showing `{name}` on the page.

## Typing a Translation Without `defineTranslations`

`Translations<typeof en>` is the type of a translation of `en`:

```typescript
import type { Translations } from '@jadis/core';
import type en from './en';

export default {
  home: { title: 'Willkommen', greeting: 'Hallo {name}!' },
  cart: { items: { one: '{count} Artikel', other: '{count} Artikel' }, total: 'Summe: {amount}' },
} satisfies Translations<typeof en>;
```

It checks the keys and each text's placeholders, but not a placeholder the source does not have: `defineTranslations` does.

## A Key as a Value

`TranslationKey<typeof en>` is the union of the keys, for a value that holds one:

```typescript
import type { TranslationKey } from '@jadis/core';

const titles: Record<'cart' | 'home', TranslationKey<typeof en>> = {
  cart: 'cart.title',
  home: 'home.title',
};
```

## See Also

- [Overview](./overview.md) — Setting up the translator, and switching language.
- [Translator API Reference](../api/translator-class.md) — Complete API documentation.
