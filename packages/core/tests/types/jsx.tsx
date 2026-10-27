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

void validButton;
void validCustomElement;
void validComponent;
void validComponentWithChildren;
void invalidComponent;
void invalidButton;
