/**
 * A helper for creating CSS styles using tagged template literals.
 * It allows for easy creation of CSS styles with interpolation.
 * @example
 * const styles = css`
 *   .my-class {
 *     color: ${color};
 *   }
 * `;
 * @returns The concatenated CSS string
 */
export const css = (strings: TemplateStringsArray, ...args: Array<string | number | boolean>): string => {
  return strings.reduce((acc, curr, index) => `${acc}${curr}${args[index] ?? ''}`, '');
};

/** The method a server render asks a component without shadow root for the first node of its template. */
export const TEMPLATE_START = Symbol('jadis.templateStart');

/** The comment a server render writes before the template of a component without shadow root. */
export const LIGHT_TEMPLATE_MARK = 'jadis-template';

const isMark = (node: Node): boolean =>
  node.nodeType === Node.COMMENT_NODE && (node as Comment).data === LIGHT_TEMPLATE_MARK;

/**
 * Removes the template a server render wrote in a component without shadow root: its mark and every node after it.
 * The children the page gave the component come before the mark, and stay.
 * @param host The component, about to render its own template
 */
export function removeServerTemplate(host: Element): void {
  const mark = Array.from(host.childNodes).find(isMark);
  while (mark?.nextSibling) {
    mark.nextSibling.remove();
  }
  mark?.remove();
}
