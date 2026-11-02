import { ATTRIBUTE_BINDINGS } from '../helpers/attribute.helper';
import { styleSheetText } from '../helpers/style.helper';
import { LIGHT_TEMPLATE_MARK, TEMPLATE_START } from '../helpers/template.helper';
import {
  CHECKABLE_TYPES,
  HTML_NAMESPACE,
  NODE_TYPE,
  RAW_TEXT_ELEMENTS,
  UNWRITTEN_VALUE_TYPES,
  VOID_ELEMENTS,
} from './server-constants';
import { stateAttributes } from './state-attributes';

import type { AttributeBinding, StateAttributes } from '../types/jadis.type';

type NodeWriter = (node: Node, writer: Writer) => void;

/** How a server render writes what the DOM holds outside its nodes. */
export interface SerializeOptions {
  /**
   * Where a shadow root's adopted stylesheet goes: the address of a file that holds `css`, written as a `<link>`, so
   * that every root of a page, and every page, shares one cached file; or undefined, the default, to write the CSS
   * inline as a `<style>`.
   */
  styles?: (css: string) => string | undefined;
}

/** The HTML written so far, and how to write it. */
interface Writer {
  out: string[];
  options: SerializeOptions;
}
type StateHolder = Element & { [ATTRIBUTE_BINDINGS](): readonly AttributeBinding[] };
type TemplateHolder = Element & { [TEMPLATE_START](): Node | null };

const NODE_WRITERS = new Map<number, NodeWriter>([
  [NODE_TYPE.element, (node, writer) => writeElement(node as Element, writer)],
  [NODE_TYPE.text, (node, writer) => writeText(node as Text, writer)],
  [NODE_TYPE.comment, (node, writer) => writer.out.push(`<!--${(node as Comment).data}-->`)],
  [NODE_TYPE.document, (node, writer) => writeChildren(node, writer)],
  [NODE_TYPE.documentType, (node, writer) => writer.out.push(`<!DOCTYPE ${(node as DocumentType).name}>`)],
  [NODE_TYPE.fragment, (node, writer) => writeChildren(node, writer)],
]);

/**
 * Writes a node as HTML, like `outerHTML`, with what a server render needs on top: each open shadow root as
 * declarative shadow DOM (`<template shadowrootmode="open">`), which the browser attaches as it parses the page; the
 * values a component's attribute-bound fields were given in code, as those attributes, so its upgrade in the browser
 * starts from them; a mark before the template of a component without shadow root, which its upgrade replaces; and
 * the state of form fields (a value typed or set in code, a checked box, a chosen option) as their attributes; and the
 * stylesheets a shadow root adopted, which hold no node, inline or as links (`options.styles`). A document or a
 * fragment is written as its children.
 * @param node The node to write
 * @param options Where adopted stylesheets go
 * @returns The HTML
 * @example
 * document.body.append(card);
 * serializeHtml(card); // '<greeting-card><template shadowrootmode="open"><p>Hello</p></template></greeting-card>'
 */
export function serializeHtml(node: Node, options: SerializeOptions = {}): string {
  const writer: Writer = { options, out: [] };
  writeNode(node, writer);
  return writer.out.join('');
}

function writeNode(node: Node, writer: Writer): void {
  NODE_WRITERS.get(node.nodeType)?.(node, writer);
}

function writeChildren(parent: Node, writer: Writer): void {
  for (const child of parent.childNodes) {
    writeNode(child, writer);
  }
}

function writeText(text: Text, writer: Writer): void {
  const parent = text.parentNode;
  const isRaw = parent instanceof Element && isHtml(parent) && RAW_TEXT_ELEMENTS.has(parent.localName);
  writer.out.push(isRaw ? text.data : escapeText(text.data));
}

function writeElement(element: Element, writer: Writer): void {
  const name = isHtml(element) ? element.localName : element.tagName;
  writer.out.push(`<${name}`);
  for (const [attribute, value] of attributesOf(element)) {
    writer.out.push(value === '' ? ` ${attribute}` : ` ${attribute}="${escapeAttribute(value)}"`);
  }
  writer.out.push('>');
  if (isHtml(element) && VOID_ELEMENTS.has(element.localName)) {
    return;
  }

  writeShadowRoot(element, writer);
  writeContent(element, writer);
  writer.out.push(`</${name}>`);
}

function writeShadowRoot(element: Element, writer: Writer): void {
  const shadow = element.shadowRoot;
  if (!shadow || shadow.mode !== 'open') {
    return;
  }

  writer.out.push('<template shadowrootmode="open"');
  writer.out.push(shadow.delegatesFocus ? ' shadowrootdelegatesfocus' : '');
  writer.out.push(shadow.clonable ? ' shadowrootclonable' : '');
  writer.out.push(shadow.serializable ? ' shadowrootserializable' : '');
  writer.out.push('>');
  writeAdoptedStyles(shadow, writer);
  writeChildren(shadow, writer);
  writer.out.push('</template>');
}

/** A shadow root's adopted stylesheets: inline, or as links to the files `options.styles` names. jsdom has none. */
function writeAdoptedStyles(shadow: ShadowRoot, writer: Writer): void {
  for (const sheet of shadow.adoptedStyleSheets ?? []) {
    const css = styleSheetText(sheet);
    const href = writer.options.styles?.(css);
    writer.out.push(
      href === undefined ? `<style>${css}</style>` : `<link rel="stylesheet" href="${escapeAttribute(href)}">`
    );
  }
}

function writeContent(element: Element, writer: Writer): void {
  if (element instanceof HTMLTemplateElement) {
    writeChildren(element.content, writer);
    return;
  }
  if (element instanceof HTMLTextAreaElement) {
    writer.out.push(escapeText(element.value));
    return;
  }
  writeLightChildren(element, writer);
}

/** The children of an element, with a mark before the template of a component without shadow root. */
function writeLightChildren(element: Element, writer: Writer): void {
  const templateStart = holdsTemplate(element) ? element[TEMPLATE_START]() : null;
  for (const child of element.childNodes) {
    writer.out.push(child === templateStart ? `<!--${LIGHT_TEMPLATE_MARK}-->` : '');
    writeNode(child, writer);
  }
}

/** The element's attributes, with the live state of a component or a form field written over the ones it has. */
function attributesOf(element: Element): Map<string, string> {
  const attributes = new Map(Array.from(element.attributes, (attribute) => [attribute.name, attribute.value]));
  if (holdsState(element)) {
    writeState(stateAttributes(element, element[ATTRIBUTE_BINDINGS]()), attributes);
  }
  if (element instanceof HTMLInputElement) {
    writeInputState(element, attributes);
  }
  if (element instanceof HTMLOptionElement) {
    toggleAttribute(attributes, 'selected', element.selected);
  }
  return attributes;
}

function holdsTemplate(element: Element): element is TemplateHolder {
  return typeof (element as Partial<TemplateHolder>)[TEMPLATE_START] === 'function';
}

function holdsState(element: Element): element is StateHolder {
  return typeof (element as Partial<StateHolder>)[ATTRIBUTE_BINDINGS] === 'function';
}

function writeState(state: StateAttributes, attributes: Map<string, string>): void {
  for (const [name, value] of state) {
    if (value === null) {
      attributes.delete(name);
      continue;
    }
    attributes.set(name, value);
  }
}

function writeInputState(input: HTMLInputElement, attributes: Map<string, string>): void {
  if (CHECKABLE_TYPES.has(input.type)) {
    toggleAttribute(attributes, 'checked', input.checked);
    return;
  }
  if (UNWRITTEN_VALUE_TYPES.has(input.type)) {
    attributes.delete('value');
    return;
  }
  if (input.value !== (attributes.get('value') ?? '')) {
    attributes.set('value', input.value);
  }
}

function toggleAttribute(attributes: Map<string, string>, name: string, present: boolean): void {
  if (present) {
    attributes.set(name, attributes.get(name) ?? '');
    return;
  }
  attributes.delete(name);
}

function isHtml(element: Element): boolean {
  return element.namespaceURI === HTML_NAMESPACE;
}

function escapeText(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/ /g, '&nbsp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttribute(value: string): string {
  return escapeText(value).replace(/"/g, '&quot;');
}
