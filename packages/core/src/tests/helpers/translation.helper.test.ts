import { describe, expect, it } from 'vitest';

import { defineTranslations, fillPlaceholders, findMessage, matchLocale } from '../../helpers/translation.helper';

const texts = defineTranslations({
  cart: {
    items: { one: '{count} item', other: '{count} items' },
    title: 'Your cart',
  },
  home: 'Home',
});

const englishNumbers = new Intl.NumberFormat('en');

describe('Translation helper', () => {
  describe('defineTranslations', () => {
    it('gives back the source texts', () => {
      expect(defineTranslations(texts)).toBe(texts);
    });

    it('gives back the translated texts', () => {
      const french = {
        cart: { items: { one: '{count} article', other: '{count} articles' }, title: 'Votre panier' },
        home: 'Accueil',
      } as const;

      expect(defineTranslations(texts, french)).toBe(french);
    });
  });

  describe('findMessage', () => {
    it('finds a text by its dotted key', () => {
      expect(findMessage(texts, 'home')).toBe('Home');
      expect(findMessage(texts, 'cart.title')).toBe('Your cart');
    });

    it('finds plural forms as one message', () => {
      expect(findMessage(texts, 'cart.items')).toEqual({ one: '{count} item', other: '{count} items' });
    });

    it('finds nothing for a group or a missing key', () => {
      expect(findMessage(texts, 'cart')).toBeUndefined();
      expect(findMessage(texts, 'cart.missing')).toBeUndefined();
      expect(findMessage(texts, 'home.title')).toBeUndefined();
    });
  });

  describe('fillPlaceholders', () => {
    it('writes each value in its placeholder, in any order', () => {
      expect(fillPlaceholders('{name} has {count}', { count: '3', name: 'Ada' }, englishNumbers)).toBe(
        'Ada has 3'
      );
    });

    it('writes a number the way the language writes it', () => {
      expect(fillPlaceholders('{amount}', { amount: 1234.5 }, englishNumbers)).toBe('1,234.5');
      expect(fillPlaceholders('{amount}', { amount: 1234.5 }, new Intl.NumberFormat('de'))).toBe('1.234,5');
    });

    it('writes a string as it is', () => {
      expect(fillPlaceholders('{id}', { id: '007' }, englishNumbers)).toBe('007');
    });

    it('writes a placeholder twice when the text has it twice', () => {
      expect(fillPlaceholders('{x} and {x}', { x: 'a' }, englishNumbers)).toBe('a and a');
    });

    it('keeps a placeholder without a value, and empty braces', () => {
      expect(fillPlaceholders('{missing} {}', {}, englishNumbers)).toBe('{missing} {}');
    });
  });

  describe('matchLocale', () => {
    const locales = ['en', 'fr', 'fr-CH', 'de-DE'] as const;

    it('finds the exact locale, whatever its case', () => {
      expect(matchLocale(locales, ['fr-CH'])).toBe('fr-CH');
      expect(matchLocale(locales, ['FR-ch'])).toBe('fr-CH');
    });

    it('finds the language alone when its region is missing', () => {
      expect(matchLocale(locales, ['fr-BE'])).toBe('fr');
    });

    it('finds the language in another region when it is not there alone', () => {
      expect(matchLocale(locales, ['de'])).toBe('de-DE');
      expect(matchLocale(locales, ['de-AT'])).toBe('de-DE');
    });

    it('follows the order of the wanted languages', () => {
      expect(matchLocale(locales, ['it', 'de-CH', 'en'])).toBe('de-DE');
    });

    it('finds nothing when no language fits', () => {
      expect(matchLocale(locales, ['it', 'es'])).toBeUndefined();
      expect(matchLocale(locales, [])).toBeUndefined();
    });
  });
});
