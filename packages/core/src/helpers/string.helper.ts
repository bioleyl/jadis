/**
 * Converts a string to kebab-case.
 * This function replaces uppercase letters with their lowercase equivalents,
 * prefixing them with a hyphen if they are not at the start of the string.
 * @example
 * toKebabCase('myVariableName'); // 'my-variable-name'
 * toKebabCase('MyVariableName'); // 'my-variable-name'
 * @param str The input string
 * @returns The kebab-cased string
 */
export const toKebabCase = (str: string): string => {
  return str.replace(
    /[A-Z]+(?![a-z])|[A-Z]/g,
    ($, ofs) => (ofs ? '-' : '') + $.toLowerCase()
  );
};
