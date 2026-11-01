import { Jadis } from '@jadis/core';

class UserCard extends Jadis {
  static readonly selector = 'user-card';

  readonly heading = this.useChange('', () => undefined);

  templateHtml(): Node {
    return <slot />;
  }
}

const validButton = <button disabled tabIndex={0} onClick={(event) => event.currentTarget} />;
const validCustomElement = <user-profile name="Jadis" />;
const validComponent = <UserCard />;
// A component by its class takes what is written between its tags, as a tag does.
const validComponentWithChildren = (
  <UserCard heading="Ada">
    <p>Slotted</p>
    <span slot="meta">text</span>
  </UserCard>
);

// @ts-expect-error A component's inputs keep their types.
const invalidComponent = <UserCard heading={42} />;

// @ts-expect-error Standard elements should reject unknown attributes.
const invalidButton = <button doesNotExist="invalid" />;

class TodoRow extends Jadis {
  static readonly selector = 'todo-row';

  readonly events = this.useEvents<{
    change: string;
    delete: undefined;
    valueChange: number;
    Archived: undefined;
    'play-source': string;
  }>();
}

// A component's own events are props: `onDelete` for `delete`, its handler given the event's detail.
const rowWithEvents = (
  <TodoRow
    onDelete={() => undefined}
    onChange={(text) => {
      const typed: string = text;
      return typed;
    }}
  />
);
// @ts-expect-error The detail of change is a string.
const rowWithWrongDetail = <TodoRow onChange={(count: number) => count} />;
// @ts-expect-error No such event.
const rowWithUnknownEvent = <TodoRow onArchive={() => undefined} />;
// An event named in camel case keeps its case: onValueChange hears valueChange.
const rowWithCamelCaseEvent = <TodoRow onValueChange={(value) => value.toFixed()} />;
// An event named with a hyphen has its prop, given the event's detail.
const rowWithHyphenatedEvent = <TodoRow onPlay-source={(path) => path.toUpperCase()} />;
// @ts-expect-error The detail of play-source is a string.
const rowWithWrongHyphenatedDetail = <TodoRow onPlay-source={(count: number) => count} />;
// @ts-expect-error An event whose name starts with a capital has no prop: onArchived would hear archived.
const rowWithCapitalEvent = <TodoRow onArchived={() => undefined} />;
// @ts-expect-error A component without events has no event props.
const cardWithEvent = <UserCard onDelete={() => undefined} />;

void validButton;
void validCustomElement;
void validComponent;
void validComponentWithChildren;
void invalidComponent;
void invalidButton;
void rowWithEvents;
void rowWithWrongDetail;
void rowWithUnknownEvent;
void rowWithCamelCaseEvent;
void rowWithHyphenatedEvent;
void rowWithWrongHyphenatedDetail;
void rowWithCapitalEvent;
void cardWithEvent;
