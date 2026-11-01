import type { AttributeBinding, StateAttributes } from '../types/jadis.type';

// What a value would be written as in an attribute: null for no attribute, undefined when it has no text.
const FORMATTERS: Partial<Record<string, (value: never) => string | null | undefined>> = {
  boolean: (value: boolean) => (value ? '' : null),
  number: (value: number) => (Number.isFinite(value) ? String(value) : undefined),
  object: (value: object | null) => (value === null ? null : toJson(value)),
  string: (value: string) => value,
};

function toJson(value: object): string | undefined {
  try {
    return JSON.stringify(value);
  } catch {
    return undefined;
  }
}

/** The same value, for state: primitives by identity, lists and objects by their JSON. */
function sameValue(first: unknown, second: unknown): boolean {
  if (Object.is(first, second)) {
    return true;
  }
  const bothObjects = typeof first === 'object' && typeof second === 'object' && first !== null && second !== null;
  return bothObjects && toJson(first) === toJson(second);
}

/** The attribute that gives a binding its value back, or undefined when its attribute already does or none can. */
function stateAttribute<T>(element: Element, binding: AttributeBinding<T>): string | null | undefined {
  const value = binding.handler.get();
  if (sameValue(binding.parse(element.getAttribute(binding.attribute)), value)) {
    return undefined;
  }
  const text = FORMATTERS[typeof value]?.(value as never);
  // Written only when the field's own parser reads it back as the same value: a value no attribute can hold stays out.
  return text !== undefined && sameValue(binding.parse(text), value) ? text : undefined;
}

/**
 * The attributes that give an element's attribute-bound fields the values set in code: what a server render writes
 * on the element, so that the browser's upgrade starts from the same state. Text, numbers, flags (present or not),
 * and lists and objects as JSON, each kept only when the field's parser reads it back as the same value.
 * @param element The element whose attributes hold the fields
 * @param bindings The fields bound to its attributes
 * @returns The attributes to write, by name: null removes one
 */
export function stateAttributes(element: Element, bindings: readonly AttributeBinding[]): StateAttributes {
  const attributes: StateAttributes = new Map();
  for (const binding of bindings) {
    const text = stateAttribute(element, binding);
    if (text !== undefined) {
      attributes.set(binding.attribute, text);
    }
  }
  return attributes;
}
