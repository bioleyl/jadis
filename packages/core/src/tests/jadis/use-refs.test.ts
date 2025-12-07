/** biome-ignore-all lint/complexity/useLiteralKeys: Needed to access private properties */

import { describe, expect, it } from 'vitest';

import { TestComponent } from './TestComponent';

describe('Jadis — useRefs', () => {
  it('should return live getters for DOM elements', () => {
    const el = new TestComponent();
    document.body.appendChild(el);

    const refs = el['useRefs']((ref) => ({
      inside: ref('#inside'),
    }));

    expect(refs.inside).toBe(el.shadowRoot.querySelector('#inside'));
  });
});
