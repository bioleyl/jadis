import { OptionalIfUndefined, Primitive } from '../helpers/type.helper';

export type UseEventsHandler<EventType> = {
  register: <EventKey extends keyof EventType>(
    event: EventKey,
    callback: (detail: Primitive<EventType[EventKey]>) => void
  ) => void;
  emit: <EventKey extends keyof EventType>(
    event: EventKey,
    ...params: OptionalIfUndefined<Primitive<EventType[EventKey]>>
  ) => void;
};
