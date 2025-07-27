import { OptionalIfUndefined, Primitive } from '../helpers/type.helper';

export type UseEventsHandler<EventType> = {
  /**
   * Registers a callback for a specific event.
   * @param event The event key to listen for
   * @param callback The callback to invoke when the event is emitted
   */
  register: <EventKey extends keyof EventType>(
    event: EventKey,
    callback: (detail: Primitive<EventType[EventKey]>) => void
  ) => void;
  /**
   * Emits an event on the component.
   * @param event The event key to emit
   * @param params The parameters to include with the event
   */
  emit: <EventKey extends keyof EventType>(
    event: EventKey,
    ...params: OptionalIfUndefined<Primitive<EventType[EventKey]>>
  ) => void;
};
