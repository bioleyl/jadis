export type Constructor<T> = new (...args: any[]) => T;

export type Primitive<T> = T extends Number
  ? number
  : T extends String
  ? string
  : T extends Boolean
  ? boolean
  : T extends BigInt
  ? bigint
  : T extends Symbol
  ? symbol
  : T extends Function
  ? Function
  : T extends Array<infer U>
  ? U[]
  : T;

export type OptionalIfUndefined<T> = undefined extends T
  ? [param?: T]
  : [param: T];
