/**
 * The stylesheet each component class shares between its instances: one per class, so the cache holds no more sheets
 * than the app has components, whatever CSS their instances return.
 */
const classSheets = new WeakMap<object, CSSStyleSheet>();

/** The elements that bring a stylesheet of their own into a template. */
const STYLESHEET_ELEMENTS = 'style, link[rel~="stylesheet"]';

/**
 * Where a shared stylesheet keeps the text it was made from, which a server render writes in the markup. A registered
 * symbol, the same in every copy of this module: each of Jadis's entry points (`@jadis/core`, `@jadis/core/server`)
 * bundles its own, and the server's must read what the component's wrote. A sheet's own rules would not do:
 * happy-dom writes them back expanded and sometimes wrong.
 */
const SHEET_TEXT = Symbol.for('jadis.sheet-text');

type TextSheet = CSSStyleSheet & { [SHEET_TEXT]?: string };

/**
 * Whether a shadow root can adopt a constructed stylesheet. Browsers and happy-dom can; jsdom cannot, and gets a
 * `<style>` instead.
 * @param root The shadow root
 * @returns True when the root takes `adoptedStyleSheets`
 */
export function canAdoptStyleSheets(root: ShadowRoot): boolean {
  return (
    'adoptedStyleSheets' in root && typeof CSSStyleSheet === 'function' && 'replaceSync' in CSSStyleSheet.prototype
  );
}

/**
 * Whether a template brings stylesheets of its own: a `<style>`, a linked stylesheet. A root applies its adopted
 * stylesheets after those, where the template's own rules used to come after the component's CSS.
 * @param template The template, or undefined for none
 * @returns True when the template holds a stylesheet
 */
export function holdsStyleSheets(template: Node | undefined): boolean {
  if (template instanceof Element && template.matches(STYLESHEET_ELEMENTS)) {
    return true;
  }
  return (
    (template instanceof Element || template instanceof DocumentFragment)
    && template.querySelector(STYLESHEET_ELEMENTS) !== null
  );
}

/**
 * The stylesheet of a component's CSS, made once and shared: every instance of the class adopts the same one instead
 * of parsing its own `<style>`. An instance whose CSS is not the shared sheet's gets a sheet of its own, which goes
 * with it.
 * @param owner The component's class
 * @param css The CSS text
 * @returns The class's shared stylesheet, or one of this CSS alone
 */
export function sharedStyleSheet(owner: object, css: string): CSSStyleSheet {
  const shared = classSheets.get(owner);
  if (shared) {
    return styleSheetText(shared) === css ? shared : textStyleSheet(css);
  }
  const sheet = textStyleSheet(css);
  classSheets.set(owner, sheet);
  return sheet;
}

/**
 * The CSS of an adopted stylesheet: the text it was made from, or its rules for a sheet made elsewhere.
 * @param sheet The stylesheet
 * @returns Its CSS text
 */
export function styleSheetText(sheet: CSSStyleSheet): string {
  return (sheet as TextSheet)[SHEET_TEXT] ?? Array.from(sheet.cssRules, (rule) => rule.cssText).join('\n');
}

function textStyleSheet(css: string): CSSStyleSheet {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(css);
  (sheet as TextSheet)[SHEET_TEXT] = css;
  return sheet;
}
