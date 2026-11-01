export const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';

/** `Node.nodeType` values, named here so the module loads before a server DOM sets `Node` as a global. */
export const NODE_TYPE = {
  comment: 8,
  document: 9,
  documentType: 10,
  element: 1,
  fragment: 11,
  text: 3,
} as const;

/** Elements written without content or end tag. */
export const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'basefont',
  'bgsound',
  'br',
  'col',
  'embed',
  'frame',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

/** Elements whose text the parser reads as it is: escaping it would show the entities. */
export const RAW_TEXT_ELEMENTS = new Set([
  'iframe',
  'noembed',
  'noframes',
  'noscript',
  'plaintext',
  'script',
  'style',
  'xmp',
]);

/** Input types whose value never goes in the markup: a password, or a file the server cannot give back. */
export const UNWRITTEN_VALUE_TYPES = new Set(['file', 'password']);

/** Input types that hold a checked state rather than a typed value. */
export const CHECKABLE_TYPES = new Set(['checkbox', 'radio']);

/**
 * The tasks a render waits for: `onConnect` runs a task after the connection, and the first task after it lets
 * what `onConnect` started (a slot change, a timer of zero) draw.
 */
export const SETTLE_TASKS = 2;
