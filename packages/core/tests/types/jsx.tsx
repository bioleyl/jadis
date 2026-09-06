import { Jadis } from '@jadis/core';

class UserCard extends Jadis {
  static readonly selector = 'user-card';

  templateHtml(): Node {
    return <p>User card</p>;
  }
}

const validButton = <button disabled tabIndex={0} onClick={(event) => event.currentTarget} />;
const validCustomElement = <user-profile name="Jadis" />;
const validComponent = <UserCard />;

// @ts-expect-error Standard elements should reject unknown attributes.
const invalidButton = <button doesNotExist="invalid" />;

void validButton;
void validCustomElement;
void validComponent;
void invalidButton;
