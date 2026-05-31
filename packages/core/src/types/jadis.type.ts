import type { KeysWithoutUndefined, KeysWithUndefined, Primitive } from '../helpers/type.helper';

export type UseEventsHandler<EventTypes> = {
  /**
   * Registers a callback for a specific event.
   * @param event The event key to listen for
   * @param callback The callback to invoke when the event is emitted
   */
  register<EventName extends KeysWithoutUndefined<EventTypes>>(
    eventName: EventName,
    callback: (detail: Primitive<EventTypes[EventName]>) => void
  ): void;
  register<EventName extends KeysWithUndefined<EventTypes>>(
    eventName: EventName,
    callback: (detail?: Primitive<EventTypes[EventName]>) => void
  ): void;

  /**
   * Emits an event on the component.
   * @param event The event key to emit
   * @param params The parameters to include with the event
   */
  emit<EventName extends KeysWithoutUndefined<EventTypes>>(
    eventName: EventName,
    detail: Primitive<EventTypes[EventName]>
  ): void;
  emit<EventName extends KeysWithUndefined<EventTypes>>(
    eventName: EventName,
    detail?: Primitive<EventTypes[EventName]>
  ): void;
};

export type UseChangeHandler<StateType> = Readonly<{
  get(): StateType;
  set(setter: StateType | ((prevState: StateType) => StateType)): void;
}>;

export interface ChangeOptions {
  immediate?: boolean;
}
