import { defineTranslations, Translator } from '@jadis/core';

import en from './translation-en';
import fr from './translation-fr';

import type { TranslationKey, Translations } from '@jadis/core';

const cart = {
  items: { one: '{count} Artikel', other: '{count} Artikel' },
  summary: '{count} Artikel für {name}',
  total: 'Summe: {amount}',
} as const;
const home = { greeting: 'Hallo {name}!', title: 'Willkommen' } as const;

// A translation has each placeholder of the source.
defineTranslations(en, {
  cart,
  home: {
    // @ts-expect-error {name} is missing.
    greeting: 'Hallo!',
    title: 'Willkommen',
  },
  test: 'test {num} Zahl',
});

// A placeholder the source does not have would never be filled.
defineTranslations(en, {
  cart,
  home: {
    // @ts-expect-error {date} is not a placeholder of the source.
    greeting: 'Hallo {name}, {date}!',
    title: 'Willkommen',
  },
  test: 'test {num} Zahl',
});

defineTranslations(en, {
  cart,
  home: {
    // @ts-expect-error {nmae} is a typo of {name}.
    greeting: 'Hallo {nmae}!',
    title: 'Willkommen',
  },
  test: 'test {num} Zahl',
});

// A translation has each key of the source, and no other.
defineTranslations(en, {
  // @ts-expect-error cart.summary is missing.
  cart: { items: cart.items, total: 'Summe: {amount}' },
  home,
  test: 'test {num} Zahl',
});

defineTranslations(en, {
  cart,
  // @ts-expect-error The source has no extra key.
  extra: 'Extra',
  home,
  test: 'test {num} Zahl',
});

// Plural forms stay plural forms, with `other`, among the plural categories.
defineTranslations(en, {
  cart: {
    // @ts-expect-error A plural needs its `other` form.
    items: { one: '{count} Artikel' },
    summary: cart.summary,
    total: cart.total,
  },
  home,
  test: 'test {num} Zahl',
});

defineTranslations(en, {
  cart: {
    // @ts-expect-error `plenty` is not a plural category.
    items: { other: '{count} Artikel', plenty: 'viele' },
    summary: cart.summary,
    total: cart.total,
  },
  home,
  test: 'test {num} Zahl',
});

defineTranslations(en, {
  cart: {
    // @ts-expect-error Plural forms in the source are plural forms in each translation.
    items: '{count} Artikel',
    summary: cart.summary,
    total: cart.total,
  },
  home,
  test: 'test {num} Zahl',
});

defineTranslations(en, {
  cart: {
    // @ts-expect-error The `other` form writes the source's placeholders.
    items: { one: 'ein Artikel', other: 'Artikel' },
    summary: cart.summary,
    total: cart.total,
  },
  home,
  test: 'test {num} Zahl',
});

// A translation typed without defineTranslations.
const german = { cart, home, test: 'test {num} Zahl' } satisfies Translations<typeof en>;

const i18n = new Translator({ en }, { de: german, fr: () => import('./translation-fr') });

// A text without placeholders takes no parameters.
i18n.t('home.title');
// @ts-expect-error home.title has no placeholder.
i18n.t('home.title', { name: 'Ada' });

// Each placeholder is required, by its name.
i18n.t('home.greeting', { name: 'Ada' });
i18n.t('test', { num: 3 });
i18n.t('cart.summary', { count: 3, name: 'Ada' });
// @ts-expect-error {num} is required.
i18n.t('test');
// @ts-expect-error {num}, not {nmu}.
i18n.t('test', { nmu: 3 });
// @ts-expect-error {name} is missing.
i18n.t('cart.summary', { count: 3 });
// @ts-expect-error A placeholder takes a string or a number.
i18n.t('home.greeting', { name: true });

// Plural forms take a numeric count.
i18n.t('cart.items', { count: 3 });
// @ts-expect-error The count chooses the plural form: it is a number.
i18n.t('cart.items', { count: '3' });

// Only the source's texts have keys.
// @ts-expect-error No such key.
i18n.t('home.titel');
// @ts-expect-error A group is not a text.
i18n.t('home');
// @ts-expect-error A plural form is not a key.
i18n.t('cart.items.one', { count: 1 });

const key: TranslationKey<typeof en> = 'cart.total';
// @ts-expect-error No such key.
const wrongKey: TranslationKey<typeof en> = 'cart.tax';

// The locales are the ones given.
void i18n.setLocale('fr');
void i18n.setLocale('de');
// @ts-expect-error No Italian.
void i18n.setLocale('it');
const locale: 'en' | 'de' | 'fr' = i18n.locale;
const matched: 'en' | 'de' | 'fr' = i18n.match(['fr-CH']);

// Each translation translates the source.
new Translator(
  { en },
  {
    // @ts-expect-error A translation of other texts.
    fr: () => Promise.resolve({ default: { home: { title: 'Bienvenue' } } }),
  }
);

new Translator(
  { en },
  {
    // @ts-expect-error A translation of other texts, given as is.
    fr: { home: { title: 'Bienvenue' } },
  }
);

// One source language.
// @ts-expect-error Two source languages.
new Translator({ en, fr }, {});

void key;
void wrongKey;
void locale;
void matched;

// A key holding a dot is refused: `t` would read it as a group and its key, and never find the text.
defineTranslations({
  // @ts-expect-error Write the group: { account: { title } }.
  'account.title': 'My account',
  home: { title: 'Home' },
});

// Nor is it a key of texts given without defineTranslations.
const flat = new Translator({ en: { 'account.title': 'My account', home: 'Home' } }, {});
flat.t('home');
// @ts-expect-error Not a key: a dot joins a group and its key.
flat.t('account.title');
