import type { JadisConstructor } from '../base-component';
import type { Bus } from '../helpers/bus.helper';
import type {
  KeysWithoutUndefined,
  KeysWithUndefined,
  SelectorToElementWithFallback,
} from '../helpers/type.helper';

/** What `useTranslation` follows: a translator, or anything that emits `change` on its bus when its language changes. */
export interface TranslationSource<Locale extends string = string> {
  readonly bus: Bus<{ change: Locale }>;
}

/** The `ref` that `useRefs` hands its callback: points at an element by a query, or at a component by its class. */
export type UseRefsRef = {
  <Element extends HTMLElement = HTMLElement, Tag extends string = string>(
    query: Tag
  ): SelectorToElementWithFallback<Tag, Element>;
  <Component extends JadisConstructor>(component: Component): InstanceType<Component>;
};

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

/** A `useChange` field bound to an attribute: what a server render needs to write the field's value back. */
export interface AttributeBinding<T = unknown> {
  attribute: string;
  handler: UseChangeHandler<T>;
  parse: AttributeParser<T>;
}

/** The attributes that give components their state back, by name: `null` removes one. */
export type StateAttributes = Map<string, string | null>;

type IsExactly<T, U> = [T, U] extends [U, T] ? true : false;

/** Strings, numbers and booleans come with a parser; any other type brings its own. */
type HasDefaultParser<T> = true extends IsExactly<T, string> | IsExactly<T, number> | IsExactly<T, boolean>
  ? true
  : false;

/**
 * A field bound to an attribute through its own parser: any type, including one built on the component's type
 * parameter (`class Choice<Value extends string>`), which TypeScript cannot match with a default parser.
 */
type ParsedBinding<T> = { attribute: string; parse: AttributeParser<T> };

/** A field bound to an attribute through the default parser: strings, numbers and booleans only. */
type DefaultParsedBinding<T> = HasDefaultParser<T> extends true ? { attribute: string; parse?: undefined } : never;

type NoAttributeBinding = { attribute?: undefined; parse?: undefined };

export type ChangeOptions<T = unknown> = {
  /** Calls onChange once with the initial value; on by default for a field bound to an attribute. */
  immediate?: boolean;
} & (NoAttributeBinding | ParsedBinding<T> | DefaultParsedBinding<T>);
