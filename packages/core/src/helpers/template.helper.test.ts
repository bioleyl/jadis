/** biome-ignore-all lint/style/noNonNullAssertion: It cannot infer that a div exist based on the previous assertion */
import { css, html } from './template.helper.js';

describe('Template helper', () => {
  describe('html', () => {
    it('should create a DocumentFragment from a template string', () => {
      const data = { name: 'John' };
      const fragment = html`<div>Hello, ${data.name}!</div>`;
      expect(fragment).toBeInstanceOf(DocumentFragment);
      const div = fragment.querySelector('div');
      expect(div).toBeTruthy();
      expect(div!.textContent).toBe('Hello, John!');
    });

    it('should create a DocumentFragment from a template string with multiple elements', () => {
      const data = { age: 30, name: 'John' };
      const fragment = html`
        <div>Hello, ${data.name}!</div>
        <div>You are ${data.age} years old.</div>
      `;
      expect(fragment).toBeInstanceOf(DocumentFragment);
      const divs = fragment.querySelectorAll('div');
      expect(divs.length).toBe(2);
      expect(divs[0]!.textContent).toBe('Hello, John!');
      expect(divs[1]!.textContent).toBe('You are 30 years old.');
    });

    it('should create a DocumentFragment from a template string with conditionals', () => {
      const data = { age: 30, isAdmin: true, name: 'John' };
      const fragment = html`
        <div>Hello, ${data.name}!</div>
        <div>You are ${data.age} years old.</div>
        ${data.isAdmin ? html`<div>You are an admin.</div>` : html`<div>You are not an admin.</div>`}
      `;
      expect(fragment).toBeInstanceOf(DocumentFragment);
      const divs = fragment.querySelectorAll('div');
      expect(divs.length).toBe(3);
      expect(divs[0]!.textContent).toBe('Hello, John!');
      expect(divs[1]!.textContent).toBe('You are 30 years old.');
      expect(divs[2]!.textContent).toBe('You are an admin.');
    });

    it('should create a DocumentFragment with built element passed to the template', () => {
      const div = document.createElement('div');
      div.textContent = 'Hello, John!';
      const fragment = html`${div}`;
      expect(fragment).toBeInstanceOf(DocumentFragment);
      expect(fragment.firstChild).toBe(div);
      expect(fragment.firstChild!.textContent).toBe('Hello, John!');
    });
  });

  describe('css', () => {
    it('should create a string with the given CSS rules', () => {
      const cssTemplate = `
        .my-class {
          color: red;
        }
      `;
      const style = css`${cssTemplate}`;
      expect(style).toBe(cssTemplate);
    });

    it('should create a string with the given CSS rules and accept interpolation', () => {
      const color = 'red';
      const style = css`
          .my-class {
            color: ${color};
          }
        `;
      expect(style).toBe(`
          .my-class {
            color: red;
          }
        `);
    });
  });
});
