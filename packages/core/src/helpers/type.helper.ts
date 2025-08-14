export type Constructor<T> = new (...args: any[]) => T;

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
  ? Function
  : T extends ArrayConstructor
  ? Array<unknown>
  : T;

export type OptionalIfUndefined<T> = undefined extends T
  ? [param?: T]
  : [param: T];

export type ComponentSelector = `${string}-${string}`;

export type HtmlMarkupValue =
  | string
  | number
  | boolean
  | Node
  | Node[]
  | null
  | undefined;

export type AppendableElement = HTMLElement | ShadowRoot | DocumentFragment;
