import { describe, expect, it, vi } from 'vitest';

import { Jadis } from '../../base-component';
import { jsx } from '../../helpers/jsx-runtime';

/** A row with events of its own: `change` gives the new text, `delete` nothing. */
class EventRow extends Jadis {
  static readonly selector = 'x-event-row';

  readonly events = this.useEvents<{ change: string; delete: undefined; valueChange: number }>();

  templateHtml() {
    return document.createElement('span');
  }
}

EventRow.register();

describe('JSX event props', () => {
  it("give a component's own event its detail", () => {
    const onChange = vi.fn();
    const row = jsx(EventRow, { onChange }) as EventRow;

    row.events.emit('change', 'done');

    expect(onChange).toHaveBeenCalledExactlyOnceWith('done');
  });

  it('keep the case of an event named in camel case', () => {
    const onValueChange = vi.fn();
    const row = jsx(EventRow, { onValueChange }) as EventRow;

    row.events.emit('valueChange', 3);

    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(3);
  });

  it('give any other event of a component as it is', () => {
    const onClick = vi.fn();
    const row = jsx(EventRow, { onClick } as never) as EventRow;

    row.dispatchEvent(new MouseEvent('click'));

    expect(onClick.mock.calls[0]?.[0]).toBeInstanceOf(MouseEvent);
  });

  it('give a standard element its event', () => {
    const onClick = vi.fn();
    const button = jsx('button', { onClick }) as HTMLButtonElement;

    button.click();

    expect(onClick.mock.calls[0]?.[0]).toBeInstanceOf(MouseEvent);
  });

  it('keep listening when the component is moved, or removed and put back later', async () => {
    const onDelete = vi.fn();
    const row = jsx(EventRow, { onDelete }) as EventRow;
    const [first, second] = [document.createElement('ul'), document.createElement('ul')];
    document.body.replaceChildren(first, second);

    first.append(row);
    second.append(row);
    row.remove();
    await Promise.resolve();
    first.append(row);
    row.events.emit('delete');

    expect(onDelete).toHaveBeenCalledOnce();
  });
});
