import type { KeysWithoutUndefined, KeysWithUndefined } from '../helpers/type.helper';

export type UseEventsHandler<EventTypes extends Record<string, unknown>> = {
  /**
   * Registers a callback for a specific event.
   * @param event The event key to listen for
   * @param callback The callback to invoke when the event is emitted
   */
  register<EventName extends KeysWithoutUndefined<EventTypes>>(
    eventName: EventName,
    callback: (detail: EventTypes[EventName]) => void
  ): void;
  register<EventName extends KeysWithUndefined<EventTypes>>(
    eventName: EventName,
    callback: (detail?: EventTypes[EventName]) => void
  ): void;

  /**
   * Emits an event on the component.
   * @param event The event key to emit
   * @param params The parameters to include with the event
   */
  emit<EventName extends KeysWithoutUndefined<EventTypes>>(
    eventName: EventName,
    detail: EventTypes[EventName]
  ): void;
  emit<EventName extends KeysWithUndefined<EventTypes>>(
    eventName: EventName,
    detail?: EventTypes[EventName]
  ): void;
};

export type UseChangeHandler<StateType> = Readonly<{
  get(): StateType;
  set(setter: StateType | ((prevState: StateType) => StateType)): void;
}>;

/** Turns an attribute's value, null when the attribute is absent, into the value of a `useChange` field. */
export type AttributeParser<T> = (value: string | null) => T;

type IsExactly<T, U> = [T, U] extends [U, T] ? true : false;

/** Strings, numbers and booleans come with a parser; any other type brings its own. */
type HasDefaultParser<T> = true extends IsExactly<T, string> | IsExactly<T, number> | IsExactly<T, boolean>
  ? true
  : false;

type AttributeBinding<T> = HasDefaultParser<T> extends true
  ? { attribute: string; parse?: AttributeParser<T> }
  : { attribute: string; parse: AttributeParser<T> };

type NoAttributeBinding = { attribute?: undefined; parse?: undefined };

export type ChangeOptions<T = unknown> = {
  /** Calls onChange once with the initial value; on by default for a field bound to an attribute. */
  immediate?: boolean;
} & (NoAttributeBinding | AttributeBinding<T>);
