/**
 * Whether an event is one the component dispatched itself, as `events.emit` does: a custom event whose target it is.
 * Its own events do not bubble, but those of the elements slotted into it do, and may bear the same name: the native
 * `change` of a field in a tab's panel reaches the tabs, whose own event is `change` too, and is not theirs.
 * @param event The event a listener of the component received
 * @param component The component the listener was added to
 * @returns True for the component's own event, whose detail a callback can be given
 */
export const isOwnEvent = (event: Event, component: EventTarget): event is CustomEvent =>
  event instanceof CustomEvent && event.target === component;
