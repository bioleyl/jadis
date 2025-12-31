/** biome-ignore-all lint/complexity/useLiteralKeys: Needed to access private properties */

import { describe, expect, it } from 'vitest';

import { TestComponent, TestComponentNoShadow } from './TestComponent';

describe('Jadis — getElement', () => {
  it('should return an element in shadow DOM', () => {
    const el = new TestComponent();
    document.body.appendChild(el);
    expect(el.shadowRoot).toBeDefined();

    const found = el['getElement']('#inside');
    expect(found).toBe(el.shadowRoot?.querySelector('#inside'));
  });

  it('should throw if element not found', () => {
    const el = new TestComponent();

    expect(() => el['getElement']('#missing')).toThrow();
  });

  it('should return an element in light DOM when useShadowDom is false', () => {
    const el = new TestComponentNoShadow();
    document.body.appendChild(el);

    const found = el['getElement']('#inside-no-shadow');
    expect(found).toBe(el.querySelector('#inside-no-shadow'));
  });

  it('should find elements inside nested components with >>> selector', () => {
    const parent = new TestComponent();
    document.body.appendChild(parent);
    const parentDiv = parent['getElement']('#inside');

    const child = new TestComponent();
    parentDiv.appendChild(child);

    expect(parent.shadowRoot?.querySelector('x-test')).toBe(child);
    expect(child.shadowRoot).toBeDefined();

    const childInnerDiv = child.shadowRoot?.querySelector('#inside');
    expect(childInnerDiv).not.toBeNull();

    const found = parent['getElement']('x-test >>> #inside');
    expect(found).toBe(childInnerDiv);
  });

  it('should find elements inside nested components without shadow DOM with >>> selector', () => {
    const parent = new TestComponent();
    document.body.appendChild(parent);
    const parentDiv = parent['getElement']('#inside');

    const child = new TestComponentNoShadow();
    parentDiv.appendChild(child);

    expect(parent.shadowRoot?.querySelector('x-test-no-shadow')).toBe(child);
    expect(child.shadowRoot).toBeNull();

    const childInnerDiv = child.querySelector('#inside-no-shadow');
    expect(childInnerDiv).not.toBeNull();

    const found = parent['getElement']('x-test-no-shadow >>> #inside-no-shadow');
    expect(found).toBe(childInnerDiv);
  });
});
