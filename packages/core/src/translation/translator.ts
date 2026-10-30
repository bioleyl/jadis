import { assert } from '../helpers/assert.helper';
import { Bus } from '../helpers/bus.helper';
import { fillPlaceholders, findMessage, matchLocale } from '../helpers/translation.helper';

import type {
  ActiveLocale,
  Locale,
  Message,
  PlaceholderValue,
  SourceLocale,
  SourceTexts,
  TranslationArgs,
  TranslationEntry,
  TranslationKey,
  TranslationLoader,
  TranslationTree,
} from '../types/translation.type';

/**
 * Translator class for showing an application's texts in the language chosen.
 * Its keys and each text's placeholders come from the source texts, so a missing key or parameter is a type error.
 * Each translation is loaded once, when its language is first chosen.
 */
export class Translator<
  const Source extends Record<string, TranslationTree>,
  const Others extends Record<string, TranslationEntry<SourceTexts<Source>>>,
> {
  /** Emits `change` with the new locale, once its texts are the ones `t` gives. */
  readonly bus = new Bus<{ change: Locale<Source, Others> }>();
  private readonly _sourceLocale: Locale<Source, Others>;
  private readonly _sourceTexts: TranslationTree;
  private readonly _translations: Others;
  private readonly _texts = new Map<string, Promise<TranslationTree>>();
  private _active: ActiveLocale<Locale<Source, Others>>;
  /** The locale asked last: a slower load asked before it is not shown. */
  private _wanted: Locale<Source, Others>;

  /**
   * @param source The language of the source texts, with them: `{ en }`. It is shown until another is set, and a
   * text a translation lacks falls back to it.
   * @param translations Each other language: its texts, or a loader that gives them once the language is chosen,
   * such as `{ fr: () => import('./fr') }`.
   */
  constructor(source: SourceLocale<Source>, translations: Others) {
    const entries = Object.entries<TranslationTree>(source);
    assert(entries.length === 1, 'A translator has one source language');
    const [[locale, texts]] = entries;

    this._sourceLocale = locale as Locale<Source, Others>;
    this._sourceTexts = texts;
    this._translations = translations;
    this._texts.set(locale, Promise.resolve(texts));
    this._active = this.activate(this._sourceLocale, texts);
    this._wanted = this._sourceLocale;
  }

  /**
   * Gets the locale shown.
   * @returns {Locale} The locale whose texts `t` gives
   */
  get locale(): Locale<Source, Others> {
    return this._active.locale;
  }

  /**
   * Gets every locale: the source's first, then the translations' in their order.
   * @returns {Locale[]} The locales
   */
  get locales(): Array<Locale<Source, Others>> {
    return [this._sourceLocale, ...Object.keys(this._translations)] as Array<Locale<Source, Others>>;
  }

  /**
   * Finds the locale that best fits the wanted languages: for `fr-CH`, `fr-CH`, else `fr`, else another French.
   * @param {readonly string[]} [languages] The wanted languages, the preferred first (default: the browser's)
   * @returns {Locale} The locale, or the source's when none fits
   */
  match(languages: readonly string[] = navigator.languages): Locale<Source, Others> {
    return matchLocale(this.locales, languages) ?? this._sourceLocale;
  }

  /**
   * Shows the texts of a locale: loads them the first time, sets the page's `lang`, and emits `change`.
   * When it is called again before its texts are loaded, the locale asked last wins.
   * @param {Locale} locale The locale to show
   */
  async setLocale(locale: Locale<Source, Others>): Promise<void> {
    this._wanted = locale;
    const texts = await this.loadTexts(locale);
    if (this._wanted !== locale || this._active.locale === locale) {
      return;
    }

    this._active = this.activate(locale, texts);
    document.documentElement.lang = locale;
    this.bus.emit('change', locale);
  }

  /**
   * Gives the text of a key in the locale shown, its placeholders filled.
   * @param {string} key The text's key, its groups joined by dots: `'cart.items'`
   * @param {Record<string, string | number>} [params] A value for each placeholder, and `count` for plural forms
   * @returns {string} The text
   */
  t<K extends TranslationKey<SourceTexts<Source>>>(
    key: K,
    ...params: TranslationArgs<SourceTexts<Source>, K>
  ): string;
  t(key: string, params: Record<string, PlaceholderValue> = {}): string {
    const message = findMessage(this._active.texts, key) ?? findMessage(this._sourceTexts, key);
    if (message === undefined) {
      return key;
    }

    return fillPlaceholders(this.chooseText(message, params), params, this._active.numbers);
  }

  private chooseText(message: Message, params: Record<string, PlaceholderValue>): string {
    return typeof message === 'string'
      ? message
      : (message[this._active.plurals.select(Number(params.count))] ?? message.other);
  }

  private activate(locale: Locale<Source, Others>, texts: TranslationTree): ActiveLocale<Locale<Source, Others>> {
    return {
      locale,
      numbers: new Intl.NumberFormat(locale),
      plurals: new Intl.PluralRules(locale),
      texts,
    };
  }

  private loadTexts(locale: string): Promise<TranslationTree> {
    return this._texts.get(locale) ?? this.startLoading(locale);
  }

  /** Loads a translation; a load that fails is forgotten, so the next `setLocale` tries again. */
  private startLoading(locale: string): Promise<TranslationTree> {
    const loading = readTexts(this._translations[locale] as TranslationTree | TranslationLoader<TranslationTree>);
    this._texts.set(locale, loading);
    loading.catch(() => this._texts.delete(locale));
    return loading;
  }
}

async function readTexts(entry: TranslationTree | TranslationLoader<TranslationTree>): Promise<TranslationTree> {
  return typeof entry === 'function' ? (await entry()).default : entry;
}
