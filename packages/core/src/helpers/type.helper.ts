import type { ChangeHandler } from './change.helper';

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

export type ElementValues<T extends HTMLElement> = {
  [K in keyof T as T[K] extends Callable ? never : K]?: T[K] extends Readonly<ChangeHandler<infer U>> ? U : T[K];
};

export type OptionsWithProps<T> = { props?: T; attrs?: Record<string, string> };

export type SelectorToElementWithFallback<
  S extends keyof HTMLElementTagNameMap | string,
  Fallback extends HTMLElement = HTMLElement,
> = S extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[S] : Fallback;
