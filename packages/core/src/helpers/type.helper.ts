export type Constructor<T> = new (...args: unknown[]) => T;

export type Callable = (...args: any[]) => any;

export type NonCallableValues<T> = {
  [K in keyof T]: T[K] extends Callable ? never : T[K];
}[keyof T];

export type Primitive<T> = T extends NumberConstructor
  ? number
  : T extends StringConstructor
    ? string
    : T extends BooleanConstructor
      ? boolean
      : T extends BigIntConstructor
        ? bigint
        : T extends SymbolConstructor
          ? symbol
          : T extends FunctionConstructor
            ? Callable
            : T extends ArrayConstructor
              ? Array<unknown>
              : T;

export type OptionalIfUndefined<T> = undefined extends T ? [param?: T] : [param: T];

export type ComponentSelector = `${string}-${string}`;

export type HtmlMarkupValue = string | number | boolean | Node | Node[] | null | undefined;

export type AppendableElement = HTMLElement | ShadowRoot | DocumentFragment;

export type ElementValues<T extends HTMLElement> = Partial<T>;

export type OptionsWithProps<T> = { props?: T; attrs?: Record<string, string> };

// interface A {
//   foo: string;
//   bar: number;
//   callMe(): void;
// }

// const test: ElementAttributes<A> = {
//   bar: 42, // ✅ Works! 'number' matches 'bar: number' and the index signature
//   callMe: () => {}, // ✅ Correctly errors: Type '() => void' is not assignable to 'string | number | undefined'
//   customAttr: 'customValue', // ✅ Works! 'string' matches the index signature
//   foo: 'hello', // ✅ Works! 'string' matches 'foo: string' and the index signature
// };

// // The tradeoff:
// const test2: ElementAttributes<A> = {
//   bar: '42',
//   customAttr: 123, // This is now allowed, because 'number' is a valid type from A
// };

export type SelectorToElementWithFallback<
  S extends keyof HTMLElementTagNameMap | string,
  Fallback extends HTMLElement = HTMLElement,
> = S extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[S] : Fallback;
