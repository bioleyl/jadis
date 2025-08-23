export type Constructor<T> = new (...args: unknown[]) => T;

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
            ? (...args: unknown[]) => unknown
            : T extends ArrayConstructor
              ? Array<unknown>
              : T;

export type OptionalIfUndefined<T> = undefined extends T ? [param?: T] : [param: T];

export type ComponentSelector = `${string}-${string}`;

export type HtmlMarkupValue = string | number | boolean | Node | Node[] | null | undefined;

export type AppendableElement = HTMLElement | ShadowRoot | DocumentFragment;

export type ElementAttributes<T extends HTMLElement> = Partial<
  {
    [K in keyof T]: T[K];
  } & Record<string, string>
>;
