import { createElement } from '../../helpers/element.helper';
import { TestComponent, TestComponentNoShadow } from '../fixtures/TestComponent';

describe('Jadis - constructor', () => {
  it('should attach a shadow root', () => {
    const el = createElement(TestComponent);
    el.connectedCallback();

    expect(el.shadowRoot).toBeDefined();
  });

  it('should inject template HTML + CSS', async () => {
    const el = createElement(TestComponent);
    el.connectedCallback();

    const style = el.shadowRoot?.querySelector('style');
    const inside = el.shadowRoot?.querySelector('#inside');
    expect(el.shadowRoot).toBeDefined();
    expect(style).not.toBeNull();
    expect(inside).not.toBeNull();
  });

  it('should not attach a shadow root when useShadowDom is false', async () => {
    const el = createElement(TestComponentNoShadow);
    el.connectedCallback();

    const insideNoShadow = el.querySelector('#inside-no-shadow');
    expect(el.shadowRoot).toBeNull();
    expect(insideNoShadow).not.toBeNull();
  });

  it('should inject template when useShadowDom is false', async () => {
    const el = createElement(TestComponentNoShadow);
    el.connectedCallback();

    const style = el.querySelector('style');
    const insideNoShadow = el.querySelector('#inside-no-shadow');
    expect(el.shadowRoot).toBeNull();
    expect(style).toBeNull();
    expect(insideNoShadow).not.toBeNull();
  });
});
