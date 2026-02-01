/** biome-ignore-all lint/complexity/useLiteralKeys: Needed to access private properties */

import { describe, expect, it, vi } from 'vitest';

import { assert } from '../../helpers/assert.helper';
import { createElement } from '../../helpers/element.helper';
import { TestComponent } from '../fixtures/TestComponent';

describe('Jadis — on', () => {
  it('should register an event listener on an element', () => {
    const el = createElement(TestComponent, {}, document.body);

    const button = document.createElement('button');
    assert(el.shadowRoot, 'Shadow root should be present');
    el.shadowRoot.appendChild(button);

    const callback = vi.fn();

    // Attach the listener using Jadis.on
    el['on'](button, 'click', callback);

    // Simulate a click event
    const clickEvent = new MouseEvent('click');
    button.dispatchEvent(clickEvent);

    expect(callback).toHaveBeenCalled();
    expect(callback.mock.calls[0][0]).toBeInstanceOf(MouseEvent);
  });

  it('should automatically remove the listener when killSignal is aborted', () => {
    const el = createElement(TestComponent, {}, document.body);

    const button = document.createElement('button');
    assert(el.shadowRoot, 'Shadow root should be present');
    el.shadowRoot.appendChild(button);

    const callback = vi.fn();

    el['on'](button, 'click', callback);

    // Abort the killSignal
    el['_abortController'].abort();

    // Simulate a click
    const clickEvent = new MouseEvent('click');
    button.dispatchEvent(clickEvent);

    // The callback should not be called because signal is aborted
    expect(callback).not.toHaveBeenCalled();
  });
});
