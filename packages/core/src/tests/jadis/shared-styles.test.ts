import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Jadis } from '../../base-component';
import { sharedStyleSheet, styleSheetText } from '../../helpers/style.helper';

const CSS = ':host { display: block; } p { color: red; }';

class SharedStyled extends Jadis {
  static readonly selector = 'shared-styled';

  templateHtml(): Node {
    return Object.assign(document.createElement('p'), { textContent: 'styled' });
  }

  templateCss(): string {
    return CSS;
  }
}

/** A component whose CSS depends on the instance, against the advice: each instance that differs gets its own sheet. */
class SizedStyled extends Jadis {
  static readonly selector = 'sized-styled';

  size = 1;

  templateCss(): string {
    return `:host { --size: ${this.size}; }`;
  }
}

/** A component whose template brings a stylesheet of its own, after the component's CSS. */
class OwnStyled extends Jadis {
  static readonly selector = 'own-styled';

  templateHtml(): Node {
    const fragment = document.createDocumentFragment();
    fragment.append(
      Object.assign(document.createElement('link'), { href: '/icons.css', rel: 'stylesheet' }),
      Object.assign(document.createElement('p'), { textContent: 'own' })
    );
    return fragment;
  }

  templateCss(): string {
    return CSS;
  }
}

SharedStyled.register();
SizedStyled.register();
OwnStyled.register();

// jsdom's shadow roots cannot adopt stylesheets: these tests give them the property, as browsers have it.
const adopted = new WeakMap<ShadowRoot, CSSStyleSheet[]>();

const sheetsOf = (element: Element): readonly CSSStyleSheet[] => element.shadowRoot?.adoptedStyleSheets ?? [];

describe('shared stylesheets', () => {
  beforeAll(() => {
    Object.defineProperty(ShadowRoot.prototype, 'adoptedStyleSheets', {
      configurable: true,
      get(this: ShadowRoot) {
        return adopted.get(this) ?? [];
      },
      set(this: ShadowRoot, sheets: CSSStyleSheet[]) {
        adopted.set(this, sheets);
      },
    });
  });

  afterAll(() => {
    Reflect.deleteProperty(ShadowRoot.prototype, 'adoptedStyleSheets');
  });

  it('gives every instance the same adopted stylesheet, and no <style>', () => {
    const first = document.createElement(SharedStyled.selector);
    const second = document.createElement(SharedStyled.selector);
    document.body.append(first, second);

    const [firstSheet] = sheetsOf(first);
    expect(firstSheet).toBeDefined();
    expect(sheetsOf(second)[0]).toBe(firstSheet);
    expect(first.shadowRoot?.querySelector('style')).toBeNull();
    expect(first.shadowRoot?.querySelector('p')?.textContent).toBe('styled');

    first.remove();
    second.remove();
  });

  it('keeps the stylesheets the root adopted before its render, after the component’s', () => {
    const theme = new CSSStyleSheet();
    const element = document.createElement(SharedStyled.selector);
    if (element.shadowRoot) {
      element.shadowRoot.adoptedStyleSheets = [theme];
    }
    document.body.append(element);

    expect(sheetsOf(element)).toEqual([sharedStyleSheet(SharedStyled, CSS), theme]);

    element.remove();
  });

  it('keeps the CSS in a <style> before a template that brings stylesheets of its own', () => {
    const element = document.createElement(OwnStyled.selector);
    document.body.append(element);

    expect(sheetsOf(element)).toEqual([]);
    expect(Array.from(element.shadowRoot?.children ?? [], (child) => child.localName)).toEqual([
      'style',
      'link',
      'p',
    ]);
    expect(element.shadowRoot?.querySelector('style')?.textContent).toBe(CSS);

    element.remove();
  });

  it('shares the first CSS of a class, and gives an instance whose CSS differs a sheet of its own', () => {
    const first = document.createElement(SizedStyled.selector) as SizedStyled;
    const same = document.createElement(SizedStyled.selector) as SizedStyled;
    const larger = Object.assign(document.createElement(SizedStyled.selector) as SizedStyled, { size: 2 });
    document.body.append(first, same, larger);

    expect(sheetsOf(same)[0]).toBe(sheetsOf(first)[0]);
    expect(sheetsOf(larger)[0]).not.toBe(sheetsOf(first)[0]);
    expect(styleSheetText(sheetsOf(larger)[0])).toBe(':host { --size: 2; }');
    expect(sharedStyleSheet(SizedStyled, ':host { --size: 1; }')).toBe(sheetsOf(first)[0]);

    first.remove();
    same.remove();
    larger.remove();
  });

  it('makes one stylesheet per class, and keeps its text', () => {
    class Owner {}
    const sheet = sharedStyleSheet(Owner, CSS);

    expect(sharedStyleSheet(Owner, CSS)).toBe(sheet);
    expect(sharedStyleSheet(class Other {}, CSS)).not.toBe(sheet);
    expect(styleSheetText(sheet)).toBe(CSS);
  });

  it('reads the text another copy of the module stored, as the server entry point has its own', () => {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync('p { color: green; }');
    Object.assign(sheet, { [Symbol.for('jadis.sheet-text')]: 'p { color: green; } /* as written */' });

    expect(styleSheetText(sheet)).toBe('p { color: green; } /* as written */');
  });
});
