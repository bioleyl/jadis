import { assert } from './assert.helper';

import type { AttributeParser } from '../types/jadis.type';

type ParserFactory = (fallback: never) => AttributeParser<unknown>;

// A blank attribute is not 0, as Number('') would have it.
const toNumber = (value: string | null): number =>
  value === null || value.trim() === '' ? Number.NaN : Number(value);

const parseNumber =
  (fallback: number): AttributeParser<number> =>
  (value) => {
    const parsed = toNumber(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  };

// An absent attribute gives back the initial value; a boolean follows HTML: present means true.
const DEFAULT_PARSERS: Partial<Record<string, ParserFactory>> = {
  boolean: () => (value) => value !== null,
  number: parseNumber,
  string: (fallback: string) => (value) => value ?? fallback,
};

/**
 * The parser for an attribute bound to a `useChange` field, chosen from the type of its initial value.
 * @throws Will throw an error if the initial value is not a string, a number or a boolean
 */
export function defaultAttributeParser<T>(initialValue: T): AttributeParser<T> {
  const factory = DEFAULT_PARSERS[typeof initialValue];
  assert(factory, `useChange: no default parser for a ${typeof initialValue} initial value, pass options.parse`);
  return factory(initialValue as never) as AttributeParser<T>;
}
