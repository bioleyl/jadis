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
