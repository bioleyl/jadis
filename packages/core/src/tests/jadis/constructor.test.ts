import { TestComponent, TestComponentNoShadow } from './TestComponent';

describe('Jadis - constructor', () => {
  it('should attach a shadow root', () => {
    const el = new TestComponent();
    expect(el.shadowRoot).toBeDefined();
  });

  it('should inject template HTML + CSS', () => {
    const el = new TestComponent();
    expect(el.shadowRoot).toBeDefined();
    const style = el.shadowRoot?.querySelector('style');
    const inside = el.shadowRoot?.querySelector('#inside');
    expect(style).not.toBeNull();
    expect(inside).not.toBeNull();
  });

  it('should not attach a shadow root when useShadowDom is false', () => {
    const el = new TestComponentNoShadow();
    expect(el.shadowRoot).toBeNull();
    const insideNoShadow = el.querySelector('#inside-no-shadow');
    expect(insideNoShadow).not.toBeNull();
  });

  it('should inject template when useShadowDom is false', () => {
    const el = new TestComponentNoShadow();
    const style = el.querySelector('style');
    const insideNoShadow = el.querySelector('#inside-no-shadow');
    expect(style).toBeNull();
    expect(insideNoShadow).not.toBeNull();
  });
});
