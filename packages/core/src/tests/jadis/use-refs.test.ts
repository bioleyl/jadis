/** biome-ignore-all lint/complexity/useLiteralKeys: Needed to access private properties */

import { describe, expect, it } from 'vitest';

import { createElement } from '../../helpers/element.helper';
import { TestComponent } from '../fixtures/TestComponent';

describe('Jadis — useRefs', () => {
  it('should return live getters for DOM elements', () => {
    const el = createElement(TestComponent, {}, document.body);

    const refs = el['useRefs']((ref) => ({
      inside: ref('#inside'),
    }));

    expect(refs.inside).toBe(el.shadowRoot?.querySelector('#inside'));
  });
});
