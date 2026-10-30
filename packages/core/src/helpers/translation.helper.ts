import {
  TRANSLATION_KEY_SEPARATOR,
  TRANSLATION_LOCALE_SEPARATOR,
  TRANSLATION_PLACEHOLDER_PATTERN,
} from '../translation/translation-constants';

import type { Message, PlaceholderValue, TranslationOf, TranslationTree } from '../types/translation.type';

/**
 * Defines the source texts: the keys and the placeholders every translation has.
 * @param source The texts, grouped by key: `{ home: { greeting: 'Hello {name}!' } }`.
 * @returns The texts, their exact strings kept in their type.
 */
export function defineTranslations<const Source extends TranslationTree>(source: Source): Source;
/**
 * Defines a translation of the source texts: the same keys, and the same placeholders in each text.
 * @param source The source texts, as `defineTranslations` returned them.
 * @param translations The translated texts.
 * @returns The translated texts.
 */
export function defineTranslations<const Source extends TranslationTree, const T>(
  source: Source,
  translations: T extends TranslationOf<T, Source> ? T : TranslationOf<T, Source>
): T;
export function defineTranslations(source: TranslationTree, translations?: TranslationTree): TranslationTree {
  return translations ?? source;
}

function isMessage(node: unknown): node is Message {
  return typeof node === 'string' || (typeof node === 'object' && node !== null && 'other' in node);
}

function isTree(node: unknown): node is TranslationTree {
  return typeof node === 'object' && node !== null;
}

/**
 * Finds the message under a dotted key.
 * @param tree The texts to look in.
 * @param key The key, its groups joined by dots: `'cart.items'`.
 * @returns The text or its plural forms, or undefined when the key leads to none.
 */
export function findMessage(tree: TranslationTree, key: string): Message | undefined {
  const node = key
    .split(TRANSLATION_KEY_SEPARATOR)
    .reduce<unknown>((current, part) => (isTree(current) ? current[part] : undefined), tree);
  return isMessage(node) ? node : undefined;
}

/**
 * Writes each placeholder's value in a text; a number is formatted for the language.
 * @param text The text: `'{count} items for {name}'`.
 * @param values The values, by placeholder name. A placeholder without a value stays as written.
 * @param numbers The language's number format.
 */
export function fillPlaceholders(
  text: string,
  values: Record<string, PlaceholderValue>,
  numbers: Intl.NumberFormat
): string {
  return text.replace(TRANSLATION_PLACEHOLDER_PATTERN, (placeholder, name: string) =>
    Object.hasOwn(values, name) ? formatValue(values[name], numbers) : placeholder
  );
}

function formatValue(value: PlaceholderValue, numbers: Intl.NumberFormat): string {
  return typeof value === 'number' ? numbers.format(value) : value;
}

function languageOf(locale: string): string {
  return locale.split(TRANSLATION_LOCALE_SEPARATOR)[0];
}

function isSameLocale(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

/** The locale for one wanted language: the exact one, else the language alone, else the language elsewhere. */
function findLocale<L extends string>(locales: readonly L[], language: string): L | undefined {
  return (
    locales.find((locale) => isSameLocale(locale, language))
    ?? locales.find((locale) => isSameLocale(locale, languageOf(language)))
    ?? locales.find((locale) => isSameLocale(languageOf(locale), languageOf(language)))
  );
}

/**
 * Finds the locale that best fits the wanted languages, the first wanted first.
 * For `fr-CH`: `fr-CH`, else `fr`, else another French such as `fr-FR`.
 * @param locales The locales there are.
 * @param languages The wanted languages, the preferred first: `navigator.languages`.
 * @returns The locale, or undefined when none fits.
 */
export function matchLocale<L extends string>(locales: readonly L[], languages: readonly string[]): L | undefined {
  return languages.reduce<L | undefined>((found, language) => found ?? findLocale(locales, language), undefined);
}
