/**
 * A helper for creating HTML templates using tagged template literals.
 * It allows for easy creation of HTML structures with interpolation.
 * @example
 * const template = html`
 *   <div class="my-class">
 *     <p>${content}</p>
 *   </div>
 * `;
 * @returns The concatenated HTML string
 */
export const html = litteralTemplate;

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
export const css = litteralTemplate;

function litteralTemplate(
  strings: TemplateStringsArray,
  ...args: Array<string | number | boolean>
): string {
  return strings.reduce(
    (acc, curr, index) => acc + curr + (args[index] ?? ''),
    ''
  );
}
