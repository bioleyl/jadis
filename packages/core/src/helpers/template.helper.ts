import { createElement } from './element.helper';
import { HtmlMarkupValue } from './type.helper';

type HtmlMarkupResult = {
  markup: string;
  markers: Record<string, Node>;
};

/**
 * A helper for creating HTML templates using tagged template literals.
 * It allows for easy creation of HTML structures with interpolation.
 * @example
 * const template = html`
 *   <div class="my-class">
 *     <p>${content}</p>
 *   </div>
 * `;
 * @returns A DocumentFragment containing the HTML structure
 * @throws Will throw an error if the template contains invalid HTML.
 */
export function html(
  strings: TemplateStringsArray | string,
  ...values: Array<HtmlMarkupValue>
): DocumentFragment {
  const { markup, markers } = htmlMarkup(strings, ...values);
  const templateEl = createElement('template');
  templateEl.innerHTML = markup;

  const content = templateEl.content;
  const walker = document.createTreeWalker(content, NodeFilter.SHOW_COMMENT);
  const updates: Array<{ target: Node; replacement: Node }> = [];

  while (walker.nextNode()) {
    const node = walker.currentNode;
    const match = markers[node.nodeValue?.trim() ?? ''];
    if (match && node.parentNode) {
      updates.push({ target: node, replacement: match });
    }
  }

  updates.forEach(({ target, replacement }) => {
    target.parentNode?.replaceChild(replacement, target);
  });

  return content;
}

/**
 * A helper for creating CSS styles using tagged template literals.
 * It allows for easy creation of CSS styles with interpolation.
 * @example
 * const styles = css`
 *   .my-class {
 *     color: red;
 *   }
 * `;
 * @returns The concatenated CSS string
 */
export const css = (
  strings: TemplateStringsArray,
  ...args: Array<string | number | boolean>
): string => {
  return strings.reduce(
    (acc, curr, index) => `${acc}${curr}${args[index] ?? ''}`,
    ''
  );
};

function createMarker(node: Node | Array<Node>, k1: number): HtmlMarkupResult {
  const key = `marker-${k1}`;

  return Array.isArray(node)
    ? node.reduce(
        (acc, n, k2) => ({
          markers: { ...acc.markers, [`${key}-${k2}`]: n },
          markup: `${acc.markup}<!--${key}-${k2}-->`,
        }),
        { markup: '', markers: {} }
      )
    : {
        markers: { [key]: node },
        markup: `<!--${key}-->`,
      };
}

function htmlMarkup(
  strings: TemplateStringsArray | string,
  ...values: Array<HtmlMarkupValue>
): HtmlMarkupResult {
  if (typeof strings === 'string') {
    return { markup: strings, markers: {} };
  }

  return strings.reduce(
    (acc: HtmlMarkupResult, str, k1) => {
      const val = values[k1];

      if (val instanceof Node || Array.isArray(val)) {
        const { markers, markup } = createMarker(val, k1);
        return {
          markup: `${acc.markup}${str}${markup}`,
          markers: { ...acc.markers, ...markers },
        };
      }

      return {
        markup: `${acc.markup}${str}${String(val ?? '')}`,
        markers: acc.markers,
      };
    },
    { markup: '', markers: {} }
  );
}
