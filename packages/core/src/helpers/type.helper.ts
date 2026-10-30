import type { ChangeHandler } from './change.helper';

export type Constructor<T> = new (...args: unknown[]) => T;
// biome-ignore lint/suspicious/noExplicitAny: Needed for event listener callback
export type Callable = (...args: any[]) => any;

export type NonCallableValues<T> = {
  [K in keyof T]: T[K] extends Callable ? never : T[K];
}[keyof T];

export type EventSchemaValue =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | BigIntConstructor
  | SymbolConstructor
  | FunctionConstructor
  | ArrayConstructor
  | Constructor<unknown>
  | undefined;

export type EventValue<T> = [T] extends [StringConstructor]
  ? string
  : [T] extends [NumberConstructor]
    ? number
    : [T] extends [BooleanConstructor]
      ? boolean
      : [T] extends [BigIntConstructor]
        ? bigint
        : [T] extends [SymbolConstructor]
          ? symbol
          : [T] extends [FunctionConstructor]
            ? Callable
            : [T] extends [ArrayConstructor]
              ? Array<unknown>
              : [T] extends [Constructor<infer U>]
                ? U
                : [T] extends [undefined]
                  ? undefined
                  : T;

export type ComponentSelector = `${string}-${string}`;
export type AppendableElement = HTMLElement | ShadowRoot | DocumentFragment;

export type ElementValues<T extends HTMLElement> = {
  [K in keyof T as T[K] extends Callable ? never : K]?: T[K] extends Readonly<ChangeHandler<infer U>> ? U : T[K];
};

export type OptionsWithProps<T> = { props?: T; attrs?: Record<string, string> };

export type SelectorToElementWithFallback<
  S extends string,
  Fallback extends HTMLElement = HTMLElement,
> = S extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[S] : Fallback;

export type EventSchema = Record<string, EventSchemaValue>;

export type SchemaToEvents<S extends EventSchema> = {
  [K in keyof S]: EventValue<S[K]>;
};

/** Turn a union into the intersection of its members */
export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

/** Turn a union of object types into a single merged object type */
export type Merge<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void
  ? { [K in keyof I]: I[K] }
  : never;

/**
 * The parameters a call takes after its name: none when `Params` has no key, `Params` otherwise.
 * `router.goto('home')`, `router.goto('user', { id: '42' })`
 */
export type ParamsArgs<Params> = keyof Params extends never ? [] : [params: Params];

export type EventKey<T extends Record<string, unknown>> = Extract<keyof T, string>;
export type HasUndefined<T> = [Extract<T, undefined>] extends [never] ? false : true;

export type KeysWithUndefined<T extends Record<string, unknown>> = {
  [K in EventKey<T>]-?: HasUndefined<T[K]> extends true ? K : never;
}[EventKey<T>];

export type KeysWithoutUndefined<T extends Record<string, unknown>> = {
  [K in EventKey<T>]-?: HasUndefined<T[K]> extends true ? never : K;
}[EventKey<T>];

/**
 * Remove index signatures from a type. Used for JSX prop safety.
 */
export type RemoveIndexSignature<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K];
};

/**
 * Element values safe for JSX props — strips index signatures.
 */
export type SafeElementValues<T extends HTMLElement> = RemoveIndexSignature<ElementValues<T>>;

/**
 * A component's props in JSX: its element values, less the element's own `children` (an HTMLCollection), whose
 * name JSX gives to what is written between the component's tags: `<MyCard><p>…</p></MyCard>`.
 */
export type ComponentJsxProps<T extends HTMLElement> = Omit<SafeElementValues<T>, 'children'> & {
  children?: unknown;
};
