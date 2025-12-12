import { describe, expect, it } from 'vitest';

import { TestComponent } from './TestComponent';

describe('Jadis — toTemplate', () => {
  it('should create an instance of the component', () => {
    const el = TestComponent.toTemplate();
    expect(el).toBeInstanceOf(TestComponent);
  });

  it('should apply attributes and properties', () => {
    const el = TestComponent.toTemplate({
      attrs: { foo: 'bar' },
      props: { customProp: 42 },
    });

    expect(el.getAttribute('foo')).toBe('bar');
    expect(el.customProp).toBe(42);
  });

  it('should append slotted content', () => {
    const slotted = document.createDocumentFragment();
    const span = document.createElement('span');
    span.textContent = 'Hello';
    slotted.appendChild(span);

    const el = TestComponent.toTemplate({}, slotted);

    // Check if slotted content exists inside the element
    const slottedNode = el.querySelector('span');
    expect(slottedNode).not.toBeNull();
    expect(slottedNode?.textContent).toBe('Hello');
  });
});
