export const html = litteralTemplate;

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
