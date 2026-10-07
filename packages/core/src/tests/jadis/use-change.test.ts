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

const TONES = ['neutral', 'ok'] as const;
type Tone = (typeof TONES)[number];
const parseTone = (value: string | null): Tone => TONES.find((tone) => tone === value) ?? 'neutral';

/** Its fields are bound to attributes; the tone is written back on the host, as styles read :host([tone]). */
class BoundComponent extends Jadis {
  static readonly selector = 'x-bound';

  readonly label = this.useChange(
    'initial',
    (value) => {
      this.getElement('span').textContent = value;
    },
    { attribute: 'label' }
  );
  readonly disabled = this.useChange(false, () => undefined, { attribute: 'disabled' });
  readonly size = this.useChange(10, () => undefined, { attribute: 'size' });
  readonly tone = this.useChange<Tone>('neutral', (value) => this.reflectTone(value), {
    attribute: 'tone',
    parse: parseTone,
  });

  templateHtml() {
    return document.createElement('span');
  }

  // Even an unchanged value would be a mutation, calling the attribute back without end.
  private reflectTone(value: Tone): void {
    if (this.getAttribute('tone') !== value) {
      this.setAttribute('tone', value);
    }
  }
}

BoundComponent.register();

const flushAttributes = (): Promise<unknown> => new Promise((resolve) => setTimeout(resolve));

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

describe('Jadis — useChange bound to an attribute', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('applies the attribute the element was written with before the first paint', () => {
    document.body.innerHTML = '<x-bound label="from HTML"></x-bound>';
    const el = document.querySelector('x-bound') as BoundComponent;

    expect(el.label.get()).toBe('from HTML');
    expect(el.shadowRoot?.querySelector('span')?.textContent).toBe('from HTML');
  });

  it('renders the initial value without an attribute, as immediate is on', () => {
    const el = createElement(BoundComponent, {}, document.body);

    expect(el.shadowRoot?.querySelector('span')?.textContent).toBe('initial');
  });

  it('follows the attribute once connected, and goes back to the initial value when it is removed', async () => {
    const el = createElement(BoundComponent, {}, document.body);

    el.setAttribute('label', 'changed');
    await flushAttributes();
    expect(el.label.get()).toBe('changed');

    el.removeAttribute('label');
    await flushAttributes();
    expect(el.label.get()).toBe('initial');
  });

  it('reads a boolean as present or absent', async () => {
    const el = createElement(BoundComponent, { attrs: { disabled: '' } }, document.body);
    expect(el.disabled.get()).toBe(true);

    el.removeAttribute('disabled');
    await flushAttributes();
    expect(el.disabled.get()).toBe(false);
  });

  it('reads a number, and keeps the initial value for one that is blank or not a number', async () => {
    const el = createElement(BoundComponent, { attrs: { size: '42' } }, document.body);
    expect(el.size.get()).toBe(42);

    for (const notANumber of ['', 'large']) {
      el.setAttribute('size', notANumber);
      await flushAttributes();
      expect(el.size.get()).toBe(10);
    }
  });

  it('reads the attribute through the parse option', () => {
    const el = createElement(BoundComponent, { attrs: { tone: 'unknown' } }, document.body);

    expect(el.tone.get()).toBe('neutral');
  });

  it('asks for a parser when the initial value has no default one', () => {
    const el = createElement(TestComponent);

    expect(() =>
      el['useChange']<string | null>(null, vi.fn(), { attribute: 'min', parse: undefined as never })
    ).toThrow(/pass options.parse/);
  });
});
