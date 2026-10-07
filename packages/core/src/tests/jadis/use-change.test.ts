/** biome-ignore-all lint/complexity/useLiteralKeys: Needed to access private properties */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Jadis } from '../../base-component';
import { createElement } from '../../helpers/element.helper';
import { TestComponent } from '../fixtures/TestComponent';

/** Shows its label in its template; the label can come from a property or the label attribute. */
class LabelComponent extends Jadis {
  static readonly selector = 'x-label';

  readonly label = this.useChange(
    'initial',
    (value) => {
      this.getElement('span').textContent = value;
    },
    { immediate: true }
  );

  constructor() {
    super();
    this.useAttributes({ label: (value) => this.label.set(value ?? '') });
  }

  templateHtml() {
    return document.createElement('span');
  }
}

LabelComponent.register();

const shownLabel = (el: LabelComponent): string | null | undefined =>
  el.shadowRoot?.querySelector('span')?.textContent;

describe('Jadis — useChange', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should call onChange when value changes', () => {
    const el = createElement(TestComponent, {}, document.body);
    const spy = vi.fn();
    const handler = el['useChange']<number>(1, spy);

    handler.set(2);
    expect(spy).toHaveBeenCalledWith(2, 1);
  });

  it('should not call onChange if component is not connected', () => {
    const el = createElement(TestComponent);
    const spy = vi.fn();
    const handler = el['useChange']<number>(1, spy);

    handler.set(2);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should call onChange when component connects if value has changed', async () => {
    const el = createElement(TestComponent);
    const spy = vi.fn();
    const handler = el['useChange']<number>(1, spy);

    handler.set(2);

    document.body.appendChild(el);

    await vi.waitFor(() => {
      expect(spy).toHaveBeenCalledWith(2, 1);
    });
  });

  it('should call onChange immediately if { immediate: true } and connected', () => {
    const el = createElement(TestComponent, {}, document.body);

    const spy = vi.fn();
    el['useChange'](5, spy, { immediate: true });

    expect(spy).toHaveBeenCalledWith(5, 5);
  });

  it('applies a change made before connection while connecting, before the next task', () => {
    const el = createElement(LabelComponent);
    el.label.set('from a property');

    document.body.appendChild(el);

    // No waiting: the browser could paint right after appendChild.
    expect(shownLabel(el)).toBe('from a property');
  });

  it('calls onChange once for the changes made before connection, with the latest value', () => {
    const el = createElement(TestComponent);
    const spy = vi.fn();
    const handler = el['useChange']<number>(1, spy, { immediate: true });
    handler.set(2);
    handler.set(3);

    document.body.appendChild(el);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(3, 1);
  });

  it('lets an attribute set on the element win over a property set before connection', async () => {
    const el = createElement(LabelComponent);
    el.label.set('from a property');
    el.setAttribute('label', 'from the attribute');

    document.body.appendChild(el);
    // Nothing queued may bring the property back a task later.
    await new Promise((resolve) => setTimeout(resolve));

    expect(shownLabel(el)).toBe('from the attribute');
    expect(el.label.get()).toBe('from the attribute');
  });

  it('applies changes before onConnect runs', async () => {
    const el = createElement(LabelComponent);
    const seen: Array<string | null | undefined> = [];
    el.onConnect = () => seen.push(shownLabel(el));
    el.label.set('ready');

    document.body.appendChild(el);
    expect(seen).toEqual([]);

    await vi.waitFor(() => {
      expect(seen).toEqual(['ready']);
    });
  });

  it('queues changes made while disconnected until the next connection', () => {
    const el = createElement(LabelComponent, {}, document.body);
    document.body.removeChild(el);
    el.label.set('while away');
    expect(shownLabel(el)).toBe('initial');

    document.body.appendChild(el);

    expect(shownLabel(el)).toBe('while away');
  });

  it('keeps the previous value as oldValue, without copying it', () => {
    const el = createElement(TestComponent, {}, document.body);
    const spy = vi.fn();
    const first = { node: document.createElement('p'), render: () => 'first' };
    const handler = el['useChange'](first, spy);

    handler.set({ node: document.createElement('p'), render: () => 'second' });

    expect(spy.mock.calls[0][1]).toBe(first);
  });
});
