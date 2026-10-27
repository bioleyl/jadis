/** biome-ignore-all lint/complexity/useLiteralKeys: Needed to access private properties */

import { describe, expect, it } from 'vitest';

import { Jadis } from '../../base-component';
import { createElement } from '../../helpers/element.helper';
import { TestComponent } from '../fixtures/TestComponent';

class RefHost extends Jadis {
  static readonly selector = 'x-ref-host';

  templateHtml() {
    return document.createElement(TestComponent.selector);
  }
}

RefHost.register();

describe('Jadis — useRefs', () => {
  it('should return live getters for DOM elements', () => {
    const el = createElement(TestComponent, {}, document.body);

    const refs = el['useRefs']((ref) => ({
      inside: ref('#inside'),
    }));

    expect(el.shadowRoot).toBeDefined();
    expect(refs.inside).toBe(el.shadowRoot?.querySelector('#inside'));
  });

  it('should find a component from its class', () => {
    const el = createElement(RefHost, {}, document.body);

    const refs = el['useRefs']((ref) => ({
      child: ref(TestComponent),
    }));

    expect(refs.child).toBe(el.shadowRoot?.querySelector(TestComponent.selector));
    expect(refs.child.customProp).toBe(10);
  });

  it('should throw when no element matches the component', () => {
    const el = createElement(TestComponent, {}, document.body);

    const refs = el['useRefs']((ref) => ({
      host: ref(RefHost),
    }));

    expect(() => refs.host).toThrow(`${RefHost.selector} element is not reachable`);
  });
});
