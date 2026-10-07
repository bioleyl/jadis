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

  it('listens on the window and the document until the component disconnects', () => {
    const el = createElement(TestComponent, {}, document.body);
    const onWindow = vi.fn();
    const onDocument = vi.fn();
    el['on'](window, 'resize', onWindow);
    el['on'](document, 'keydown', onDocument);

    window.dispatchEvent(new Event('resize'));
    document.dispatchEvent(new KeyboardEvent('keydown'));
    expect(onWindow).toHaveBeenCalledTimes(1);
    expect(onDocument).toHaveBeenCalledTimes(1);

    document.body.removeChild(el);
    window.dispatchEvent(new Event('resize'));
    document.dispatchEvent(new KeyboardEvent('keydown'));

    expect(onWindow).toHaveBeenCalledTimes(1);
    expect(onDocument).toHaveBeenCalledTimes(1);
  });
});
