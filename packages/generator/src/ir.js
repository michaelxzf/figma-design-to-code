/**
 * Design IR (intermediate representation).
 *
 * The Figma plugin flattens a selected frame into this shape, and the code
 * generators only ever read the IR. That keeps codegen testable in plain Node
 * without the Figma runtime.
 *
 * @typedef {Object} IRPadding
 * @property {number} [top]
 * @property {number} [right]
 * @property {number} [bottom]
 * @property {number} [left]
 *
 * @typedef {Object} IRLayout
 * @property {'VERTICAL'|'HORIZONTAL'|'NONE'} [mode]
 * @property {number} [gap]
 * @property {IRPadding} [padding]
 * @property {'MIN'|'CENTER'|'MAX'|'SPACE_BETWEEN'} [primaryAxis]
 * @property {'MIN'|'CENTER'|'MAX'|'BASELINE'|'STRETCH'} [counterAxis]
 * @property {boolean} [wrap]
 *
 * @typedef {Object} IRSize
 * @property {number} [width]
 * @property {number} [height]
 * @property {boolean} [fillWidth]   - stretch horizontally instead of a fixed width
 * @property {boolean} [hugHeight]   - height driven by content
 *
 * @typedef {Object} IRStroke
 * @property {string} [color]
 * @property {number} [width]
 *
 * @typedef {Object} IRShadow
 * @property {number} [blur]
 *
 * @typedef {Object} IRStyle
 * @property {string} [background]
 * @property {number} [radius]
 * @property {IRStroke} [stroke]
 * @property {IRShadow} [shadow]
 * @property {number} [opacity]
 *
 * @typedef {Object} IRText
 * @property {string} characters
 * @property {number} [fontSize]
 * @property {number} [fontWeight]
 * @property {number} [lineHeight]
 * @property {string} [color]
 * @property {'LEFT'|'CENTER'|'RIGHT'|'JUSTIFIED'} [align]
 *
 * @typedef {Object} IRNode
 * @property {string} [id]
 * @property {string} [name]
 * @property {'FRAME'|'GROUP'|'TEXT'|'RECTANGLE'|'ELLIPSE'|'VECTOR'|'IMAGE'|'COMPONENT'|'INSTANCE'} type
 * @property {IRLayout} [layout]
 * @property {IRSize} [size]
 * @property {IRStyle} [style]
 * @property {IRText} [text]
 * @property {IRNode[]} [children]
 *
 * @typedef {Object} DesignIR
 * @property {number} version
 * @property {string} name
 * @property {IRNode} root
 */

export const IR_VERSION = 1;

/**
 * Validates an untrusted IR object (e.g. pasted JSON in the demo app).
 * Throws with a readable message instead of failing deep inside codegen.
 *
 * @param {unknown} input
 * @returns {DesignIR}
 */
export function assertIR(input) {
  if (!input || typeof input !== 'object') throw new TypeError('IR must be an object');
  const ir = /** @type {DesignIR} */ (input);
  if (!ir.root || typeof ir.root !== 'object') throw new TypeError('IR.root is required');
  assertNode(ir.root, 'root');
  return {
    version: typeof ir.version === 'number' ? ir.version : IR_VERSION,
    name: typeof ir.name === 'string' && ir.name.trim() ? ir.name : ir.root.name || 'Component',
    root: ir.root,
  };
}

function assertNode(node, path) {
  if (!node || typeof node !== 'object') throw new TypeError(`${path}: node must be an object`);
  if (typeof node.type !== 'string') throw new TypeError(`${path}: node.type must be a string`);
  if (node.children !== undefined) {
    if (!Array.isArray(node.children)) throw new TypeError(`${path}: children must be an array`);
    node.children.forEach((child, i) => assertNode(child, `${path}.children[${i}]`));
  }
  if (node.text !== undefined && typeof node.text.characters !== 'string') {
    throw new TypeError(`${path}: text.characters must be a string`);
  }
}

/** PascalCase component name derived from a layer name. */
export function componentName(name, fallback = 'Component') {
  const parts = String(name ?? '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return fallback;
  const pascal = parts.map((p) => p[0].toUpperCase() + p.slice(1)).join('');
  return /^[0-9]/.test(pascal) ? `${fallback}${pascal}` : pascal;
}
