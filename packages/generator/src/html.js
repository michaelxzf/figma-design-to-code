import { classesFor, elementFor } from './classes.js';
import { assertIR, componentName } from './ir.js';

const VOID_ELEMENTS = new Set(['input', 'img', 'br', 'hr']);
const INDENT = '  ';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderNode(node, depth) {
  const pad = INDENT.repeat(depth);
  const tag = elementFor(node);
  const className = classesFor(node);
  const attrs = [className ? `class="${className}"` : null];

  if (tag === 'a') attrs.push('href="#"');
  if (tag === 'button') attrs.push('type="button"');
  if (tag === 'input') attrs.push(`placeholder="${escapeHtml(node.text?.characters ?? '')}"`);

  const attrString = attrs.filter(Boolean).join(' ');
  if (VOID_ELEMENTS.has(tag)) return `${pad}<${tag}${attrString ? ` ${attrString}` : ''} />`;

  const open = `<${tag}${attrString ? ` ${attrString}` : ''}>`;
  if (node.type === 'TEXT') return `${pad}${open}${escapeHtml(node.text?.characters ?? '')}</${tag}>`;

  const children = (node.children ?? []).filter(Boolean);
  if (!children.length) return `${pad}${open}</${tag}>`;

  const inner = children.map((child) => renderNode(child, depth + 1)).join('\n');
  return `${pad}${open}\n${inner}\n${pad}</${tag}>`;
}

/**
 * Generates a standalone HTML fragment styled with Tailwind utilities.
 *
 * @param {unknown} input design IR
 * @returns {{ filename: string, language: string, code: string }}
 */
export function generateHtml(input) {
  const ir = assertIR(input);
  const name = componentName(ir.name);
  const code = `<!-- Generated from Figma layer "${ir.name}" by figma-design-to-code. -->\n${renderNode(ir.root, 0)}\n`;
  return { filename: `${name}.html`, language: 'html', code };
}
