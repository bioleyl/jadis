import { ATTRIBUTE_BINDINGS } from '../helpers/attribute.helper';
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

type NodeWriter = (node: Node, out: string[]) => void;
type StateHolder = Element & { [ATTRIBUTE_BINDINGS](): readonly AttributeBinding[] };
type TemplateHolder = Element & { [TEMPLATE_START](): Node | null };

const NODE_WRITERS = new Map<number, NodeWriter>([
  [NODE_TYPE.element, (node, out) => writeElement(node as Element, out)],
  [NODE_TYPE.text, (node, out) => writeText(node as Text, out)],
  [NODE_TYPE.comment, (node, out) => out.push(`<!--${(node as Comment).data}-->`)],
  [NODE_TYPE.document, (node, out) => writeChildren(node, out)],
  [NODE_TYPE.documentType, (node, out) => out.push(`<!DOCTYPE ${(node as DocumentType).name}>`)],
  [NODE_TYPE.fragment, (node, out) => writeChildren(node, out)],
]);

/**
 * Writes a node as HTML, like `outerHTML`, with what a server render needs on top: each open shadow root as
 * declarative shadow DOM (`<template shadowrootmode="open">`), which the browser attaches as it parses the page; the
 * values a component's attribute-bound fields were given in code, as those attributes, so its upgrade in the browser
 * starts from them; a mark before the template of a component without shadow root, which its upgrade replaces; and
 * the state of form fields (a value typed or set in code, a checked box, a chosen option) as their attributes. A
 * document or a fragment is written as its children.
 * @param node The node to write
 * @returns The HTML
 * @example
 * document.body.append(card);
 * serializeHtml(card); // '<greeting-card><template shadowrootmode="open"><p>Hello</p></template></greeting-card>'
 */
export function serializeHtml(node: Node): string {
  const out: string[] = [];
  writeNode(node, out);
  return out.join('');
}

function writeNode(node: Node, out: string[]): void {
  NODE_WRITERS.get(node.nodeType)?.(node, out);
}

function writeChildren(parent: Node, out: string[]): void {
  for (const child of parent.childNodes) {
    writeNode(child, out);
  }
}

function writeText(text: Text, out: string[]): void {
  const parent = text.parentNode;
  const isRaw = parent instanceof Element && isHtml(parent) && RAW_TEXT_ELEMENTS.has(parent.localName);
  out.push(isRaw ? text.data : escapeText(text.data));
}

function writeElement(element: Element, out: string[]): void {
  const name = isHtml(element) ? element.localName : element.tagName;
  out.push(`<${name}`);
  for (const [attribute, value] of attributesOf(element)) {
    out.push(value === '' ? ` ${attribute}` : ` ${attribute}="${escapeAttribute(value)}"`);
  }
  out.push('>');
  if (isHtml(element) && VOID_ELEMENTS.has(element.localName)) {
    return;
  }

  writeShadowRoot(element, out);
  writeContent(element, out);
  out.push(`</${name}>`);
}

function writeShadowRoot(element: Element, out: string[]): void {
  const shadow = element.shadowRoot;
  if (!shadow || shadow.mode !== 'open') {
    return;
  }

  out.push('<template shadowrootmode="open"');
  out.push(shadow.delegatesFocus ? ' shadowrootdelegatesfocus' : '');
  out.push(shadow.clonable ? ' shadowrootclonable' : '');
  out.push(shadow.serializable ? ' shadowrootserializable' : '');
  out.push('>');
  writeChildren(shadow, out);
  out.push('</template>');
}

function writeContent(element: Element, out: string[]): void {
  if (element instanceof HTMLTemplateElement) {
    writeChildren(element.content, out);
    return;
  }
  if (element instanceof HTMLTextAreaElement) {
    out.push(escapeText(element.value));
    return;
  }
  writeLightChildren(element, out);
}

/** The children of an element, with a mark before the template of a component without shadow root. */
function writeLightChildren(element: Element, out: string[]): void {
  const templateStart = holdsTemplate(element) ? element[TEMPLATE_START]() : null;
  for (const child of element.childNodes) {
    out.push(child === templateStart ? `<!--${LIGHT_TEMPLATE_MARK}-->` : '');
    writeNode(child, out);
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
