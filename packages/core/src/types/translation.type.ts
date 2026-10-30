import type { Merge, ParamsArgs, UnionToIntersection } from '../helpers/type.helper';

/**
 * The plural forms of a text, chosen by `Intl.PluralRules` from the `count` parameter. `other` is required.
 * A type rather than an interface, so a tree of texts can hold it.
 */
export type PluralForms = { readonly other: string } & { readonly [Form in Intl.LDMLPluralRule]?: string };

/** A text, or its plural forms. */
export type Message = string | PluralForms;

/** Texts grouped by key: `{ home: { title: 'Welcome' } }` */
export type TranslationTree = { readonly [key: string]: Message | TranslationTree };

/** Gives a translation's texts once its language is chosen: `() => import('./fr')`. */
export type TranslationLoader<T> = () => Promise<{ default: T }>;

/** A value given to a placeholder; a number is written the way the language writes it. */
export type PlaceholderValue = string | number;

/** An object whose keys are all plural categories, `other` among them. */
type IsPlural<T> = T extends PluralForms
  ? Exclude<keyof T, Intl.LDMLPluralRule> extends never
    ? true
    : false
  : false;

/** The names between braces in a text: `'{count} items for {name}'` gives `'count' | 'name'`. */
export type Placeholders<Text extends string> = Text extends `${string}{${infer Name}}${infer Rest}`
  ? (Name extends '' ? never : Name) | Placeholders<Rest>
  : never;

type MessagePlaceholders<M> = M extends string ? Placeholders<M> : Placeholders<M[keyof M] & string>;

/** Every text's key, its groups joined by dots: `'home.title' | 'cart.items'` */
export type TranslationKey<Tree> = {
  [K in keyof Tree & string]: Tree[K] extends string
    ? K
    : IsPlural<Tree[K]> extends true
      ? K
      : `${K}.${TranslationKey<Tree[K]>}`;
}[keyof Tree & string];

/** The message under a dotted key. */
export type MessageAt<Tree, Key extends string> = Key extends keyof Tree
  ? Tree[Key]
  : Key extends `${infer Group}.${infer Rest}`
    ? Group extends keyof Tree
      ? MessageAt<Tree[Group], Rest>
      : never
    : never;

/** The parameters a message takes: one per placeholder, and a numeric `count` for plural forms. */
export type MessageParams<M> = Merge<
  | { [Name in MessagePlaceholders<M>]: PlaceholderValue }
  | (IsPlural<M> extends true ? { count: number } : Record<never, never>)
>;

/**
 * What `t` takes after a key of the texts `Tree`: nothing for a text without placeholders, else its parameters.
 * For a function that hands a key and its parameters on to `t`.
 * Taken key by key: a misspelt key, read as any key, is then reported as not a key rather than as missing parameters.
 */
export type TranslationArgs<Tree, Key extends string> = Key extends unknown
  ? ParamsArgs<MessageParams<MessageAt<Tree, Key>>>
  : never;

/** A text that writes each of the placeholders, in any order. */
type WithPlaceholders<Names extends string> = [Names] extends [never]
  ? string
  : UnionToIntersection<Names extends string ? `${string}{${Names}}${string}` : never>;

type TranslatedPlural<Source> = { readonly other: WithPlaceholders<MessagePlaceholders<Source>> } & {
  readonly [Form in Exclude<Intl.LDMLPluralRule, 'other'>]?: string;
};

/**
 * What a translation of the texts `Source` is: the same keys, and the same placeholders in each text. Plural forms
 * are the language's own; the `other` form writes the source's placeholders.
 */
export type Translations<Source> = {
  readonly [K in keyof Source]: Source[K] extends string
    ? WithPlaceholders<Placeholders<Source[K]>>
    : IsPlural<Source[K]> extends true
      ? TranslatedPlural<Source[K]>
      : Translations<Source[K]>;
};

/** Refuses a text that writes a placeholder the source does not have: nothing would fill it. */
type KnownPlaceholders<Text, Names extends string> = Text extends string
  ? [Exclude<Placeholders<Text>, Names>] extends [never]
    ? unknown
    : { readonly 'Unknown placeholder': Exclude<Placeholders<Text>, Names> }
  : unknown;

type Field<T, K> = K extends keyof T ? T[K] : unknown;

/**
 * What the translation `T` must be to translate `Source`: `Translations<Source>`, without a key, a plural form or
 * a placeholder the source does not have. `T` is inferred first and checked after, so each mistake is reported on
 * its own line.
 */
export type TranslationOf<T, Source> = {
  readonly [K in keyof Source]: Source[K] extends string
    ? WithPlaceholders<Placeholders<Source[K]>> & KnownPlaceholders<Field<T, K>, Placeholders<Source[K]>>
    : IsPlural<Source[K]> extends true
      ? TranslatedPlural<Source[K]> & {
          readonly [Form in keyof Field<T, K>]: Form extends Intl.LDMLPluralRule
            ? KnownPlaceholders<Field<Field<T, K>, Form>, MessagePlaceholders<Source[K]>>
            : { readonly 'Not a plural form': Form };
        }
      : TranslationOf<Field<T, K>, Source[K]>;
} & { readonly [K in Exclude<keyof T, keyof Source>]: { readonly 'Not in the source': K } };

/** A translation given to the translator: its texts, or their loader. */
export type TranslationEntry<Source> = Translations<Source> | TranslationLoader<Translations<Source>>;

/** The source language and its texts, alone: `{ en }`. */
export type SourceLocale<Source> = [keyof Source] extends [UnionToIntersection<keyof Source>] ? Source : never;

/** The texts of the source language. */
export type SourceTexts<Source> = Source[keyof Source];

/** A language of the translator: the source's, or a translation's. */
export type Locale<Source, Others> = (keyof Source | keyof Others) & string;

/** The language shown, with its texts and the rules that write its plurals and numbers. */
export interface ActiveLocale<L extends string> {
  locale: L;
  texts: TranslationTree;
  plurals: Intl.PluralRules;
  numbers: Intl.NumberFormat;
}
