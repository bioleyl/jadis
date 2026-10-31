import { describe, expect, it, vi } from 'vitest';

import { Jadis } from '../../base-component';
import { Fragment, jsx, jsxs } from '../../helpers/jsx-runtime';

/** A component with a useChange input and a plain field, to see how JSX props reach them. */
class Labelled extends Jadis {
  static readonly selector = 'x-jsx-labelled';

  readonly label = this.useChange('', () => undefined);
  note = '';
}

Labelled.register();

const html = (node: Node): string => {
  const holder = document.createElement('div');
  holder.append(node);
  return holder.innerHTML;
};

describe('JSX runtime', () => {
  describe('children', () => {
    it('writes strings and numbers as text, and leaves out null, undefined and booleans', () => {
      const node = jsxs('p', { children: ['a', 1, null, undefined, true, false, 'b'] });

      expect(html(node)).toBe('<p>a1b</p>');
      expect(node.childNodes).toHaveLength(3);
    });

    it('flattens nested arrays, in order', () => {
      const node = jsx('ul', { children: [jsx('li', { children: 'a' }), [jsx('li', { children: 'b' }), ['c']]] });

      expect(html(node)).toBe('<ul><li>a</li><li>b</li>c</ul>');
    });

    it('takes the extra arguments of the classic factory before props.children', () => {
      const node = jsx('p', { children: 'ignored' }, 'a', jsx('b', null, 'b'));

      expect(html(node)).toBe('<p>a<b>b</b></p>');
    });

    it('moves the children of a fragment into its parent', () => {
      const fragment = jsxs(Fragment as unknown as string, { children: [jsx('i', null), 'text'] });

      expect(fragment).toBeInstanceOf(DocumentFragment);
      expect(html(jsx('p', null, fragment))).toBe('<p><i></i>text</p>');
    });
  });

  describe('props', () => {
    it('sets the class, className winning over class, trimmed', () => {
      expect(html(jsx('p', { class: ' a b ' }))).toBe('<p class="a b"></p>');
      expect(html(jsx('p', { class: 'a', className: 'b' }))).toBe('<p class="b"></p>');
    });

    it('writes attrs as attributes, their names in kebab case', () => {
      expect(html(jsx('p', { attrs: { ariaLabel: 'name', part: 'base' } }))).toBe(
        '<p aria-label="name" part="base"></p>'
      );
    });

    it('writes a hyphenated prop as an attribute, and any other as a property', () => {
      const node = jsx('input', { 'aria-hidden': 'true', 'data-id': 7, value: 'typed' }) as HTMLInputElement;

      expect(node.getAttribute('data-id')).toBe('7');
      expect(node.getAttribute('aria-hidden')).toBe('true');
      expect(node.value).toBe('typed');
      expect(node.hasAttribute('value')).toBe(false);
    });

    it('skips undefined values and the key', () => {
      const node = jsx('p', {
        'data-id': undefined,
        id: undefined,
        key: 'k',
        title: 'set',
      }) as HTMLParagraphElement;

      expect(html(node)).toBe('<p title="set"></p>');
    });

    it('lets props={…} override a direct prop, applied once', () => {
      const onClick = vi.fn();
      const node = jsx('button', {
        onClick: () => undefined,
        props: { onClick, title: 'explicit' },
        title: 'direct',
      });

      (node as HTMLButtonElement).click();

      expect((node as HTMLButtonElement).title).toBe('explicit');
      expect(onClick).toHaveBeenCalledOnce();
    });

    it("sets a component's useChange input through its handler, and a plain field directly", () => {
      const node = jsx(Labelled, { label: 'Ada', props: { note: 'kept' } } as never) as Labelled;

      expect(node.label.get()).toBe('Ada');
      expect(node.note).toBe('kept');
    });

    it('adds a listener for an on prop of a standard element, its name in lower case', () => {
      const onKeyDown = vi.fn();
      const node = jsx('input', { onKeyDown }) as HTMLInputElement;

      node.dispatchEvent(new KeyboardEvent('keydown'));

      expect(onKeyDown).toHaveBeenCalledOnce();
    });
  });
});
