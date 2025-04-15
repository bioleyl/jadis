export type Constructor<T> = new (...args: any[]) => T;

export type Primitive<T> = T extends Number
  ? number
  : T extends String
    ? string
    : T extends Boolean
      ? boolean
      : T;

export type OptionalIfUndefined<T> = undefined extends T
  ? [param?: T]
  : [param: T];
