import { beforeEach, describe, expect, it, vi } from 'vitest';

import { defineTranslations } from '../../helpers/translation.helper';
import { Translator } from '../../translation/translator';

const en = defineTranslations({
  cart: {
    items: { one: '{count} item', other: '{count} items' },
    total: 'Total: {amount}',
  },
  home: {
    greeting: 'Hello {name}!',
    title: 'Welcome',
  },
});

const fr = defineTranslations(en, {
  cart: {
    items: { many: '{count} d’articles', one: '{count} article', other: '{count} articles' },
    total: 'Total : {amount}',
  },
  home: {
    greeting: 'Bonjour {name} !',
    title: 'Bienvenue',
  },
});

const de = defineTranslations(en, {
  cart: {
    items: { one: '{count} Artikel', other: '{count} Artikel' },
    total: 'Summe: {amount}',
  },
  home: {
    greeting: 'Hallo {name}!',
    title: 'Willkommen',
  },
});

/** What French writes between thousands. */
const FRENCH_THOUSANDS_SEPARATOR = ' ';

/** A loader the test settles itself, to load several locales at once. */
function deferredLoader<T>(texts: T) {
  let settle = () => {};
  const promise = new Promise<{ default: T }>((resolve) => {
    settle = () => resolve({ default: texts });
  });
  return { load: vi.fn(() => promise), settle: () => settle() };
}

describe('Translator', () => {
  beforeEach(() => {
    document.documentElement.lang = '';
  });

  it('shows the source language first', () => {
    const translator = new Translator({ en }, { fr });

    expect(translator.locale).toBe('en');
    expect(translator.t('home.title')).toBe('Welcome');
  });

  it('lists the source locale first, then the translations', () => {
    const translator = new Translator({ en }, { de, fr: () => Promise.resolve({ default: fr }) });

    expect(translator.locales).toEqual(['en', 'de', 'fr']);
  });

  it('refuses more than one source language', () => {
    // @ts-expect-error Two source languages.
    expect(() => new Translator({ en, fr }, {})).toThrowError('A translator has one source language');
  });

  it('fills the placeholders', () => {
    const translator = new Translator({ en }, {});

    expect(translator.t('home.greeting', { name: 'Ada' })).toBe('Hello Ada!');
    expect(translator.t('cart.total', { amount: 1234.5 })).toBe('Total: 1,234.5');
  });

  it('chooses the plural form of the count, in each language', async () => {
    const translator = new Translator({ en }, { fr });

    expect(translator.t('cart.items', { count: 1 })).toBe('1 item');
    expect(translator.t('cart.items', { count: 2 })).toBe('2 items');

    await translator.setLocale('fr');

    expect(translator.t('cart.items', { count: 1 })).toBe('1 article');
    expect(translator.t('cart.items', { count: 2 })).toBe('2 articles');
    expect(translator.t('cart.items', { count: 1_000_000 })).toBe(
      `1${FRENCH_THOUSANDS_SEPARATOR}000${FRENCH_THOUSANDS_SEPARATOR}000 d’articles`
    );
  });

  it('uses the other form when the language has no form of its own for the count', async () => {
    const translator = new Translator({ en }, { de });
    await translator.setLocale('de');

    expect(translator.t('cart.items', { count: 0 })).toBe('0 Artikel');
  });

  it('writes numbers the way the language shown writes them', async () => {
    const translator = new Translator({ en }, { fr });
    await translator.setLocale('fr');

    expect(translator.t('cart.total', { amount: 1234.5 })).toBe(`Total : 1${FRENCH_THOUSANDS_SEPARATOR}234,5`);
  });

  it('loads a translation once, when its language is first chosen', async () => {
    const load = vi.fn(() => Promise.resolve({ default: fr }));
    const translator = new Translator({ en }, { fr: load });

    expect(load).not.toHaveBeenCalled();

    await translator.setLocale('fr');
    await translator.setLocale('en');
    await translator.setLocale('fr');

    expect(load).toHaveBeenCalledOnce();
    expect(translator.t('home.title')).toBe('Bienvenue');
  });

  it('sets the page language and emits change', async () => {
    const translator = new Translator({ en }, { fr });
    const onChange = vi.fn();
    translator.bus.register('change', onChange, new AbortController().signal);

    await translator.setLocale('fr');

    expect(document.documentElement.lang).toBe('fr');
    expect(onChange).toHaveBeenCalledExactlyOnceWith('fr');
  });

  it('emits nothing when the locale is already shown, and still sets the page language', async () => {
    const translator = new Translator({ en }, { fr });
    const onChange = vi.fn();
    translator.bus.register('change', onChange, new AbortController().signal);

    await translator.setLocale('en');

    expect(onChange).not.toHaveBeenCalled();
    expect(document.documentElement.lang).toBe('en');
  });

  it('shows the locale asked last when an earlier one loads after it', async () => {
    const french = deferredLoader(fr);
    const german = deferredLoader(de);
    const translator = new Translator({ en }, { de: german.load, fr: french.load });

    const toFrench = translator.setLocale('fr');
    const toGerman = translator.setLocale('de');
    german.settle();
    await toGerman;
    french.settle();
    await toFrench;

    expect(translator.locale).toBe('de');
    expect(translator.t('home.title')).toBe('Willkommen');
  });

  it('keeps the source when a locale is asked back before its load ends', async () => {
    const french = deferredLoader(fr);
    const translator = new Translator({ en }, { fr: french.load });

    const toFrench = translator.setLocale('fr');
    await translator.setLocale('en');
    french.settle();
    await toFrench;

    expect(translator.locale).toBe('en');
  });

  it('loads a translation once even when it is asked twice at once', async () => {
    const french = deferredLoader(fr);
    const translator = new Translator({ en }, { fr: french.load });

    const first = translator.setLocale('fr');
    const second = translator.setLocale('fr');
    french.settle();
    await Promise.all([first, second]);

    expect(french.load).toHaveBeenCalledOnce();
    expect(translator.locale).toBe('fr');
  });

  it('keeps the locale shown when a load fails, and tries again next time', async () => {
    const load = vi
      .fn<() => Promise<{ default: typeof fr }>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ default: fr });
    const translator = new Translator({ en }, { fr: load });

    await expect(translator.setLocale('fr')).rejects.toThrowError('offline');
    expect(translator.locale).toBe('en');

    await translator.setLocale('fr');
    expect(translator.locale).toBe('fr');
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('gives the key itself for a key it does not know', () => {
    const translator = new Translator({ en }, {});
    const t = translator.t as (key: string) => string;

    expect(t.call(translator, 'home.missing')).toBe('home.missing');
  });

  describe('match', () => {
    it('finds the locale that best fits the wanted languages', () => {
      const translator = new Translator({ en }, { de, fr });

      expect(translator.match(['fr-CH', 'en'])).toBe('fr');
      expect(translator.match(['it', 'de-AT'])).toBe('de');
    });

    it('falls back to the source locale', () => {
      const translator = new Translator({ en }, { fr });

      expect(translator.match(['it'])).toBe('en');
    });

    it('reads the browser languages by default', () => {
      vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['fr-FR', 'en']);
      const translator = new Translator({ en }, { fr });

      expect(translator.match()).toBe('fr');
      vi.restoreAllMocks();
    });
  });
});
