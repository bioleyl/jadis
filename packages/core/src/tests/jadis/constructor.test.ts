import { TestComponent } from './TestComponent';

describe('Jadis - constructor', () => {
  it('should attach a shadow root', () => {
    const el = new TestComponent();
    expect(el.shadowRoot).toBeDefined();
  });

  it('should inject template HTML + CSS', () => {
    const el = new TestComponent();
    const style = el.shadowRoot.querySelector('style');
    const inside = el.shadowRoot.querySelector('#inside');
    expect(style).not.toBeNull();
    expect(inside).not.toBeNull();
  });
});
