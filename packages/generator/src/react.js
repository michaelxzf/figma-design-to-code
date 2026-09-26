import { classesFor, elementFor } from './classes.js';
import { assertIR, componentName } from './ir.js';

const VOID_ELEMENTS = new Set(['input', 'img', 'br', 'hr']);
const INDENT = '  ';

/** JSX text children must not contain raw `{`, `}` or `<`. */
function jsxText(value) {
  const text = String(value);
  if (/[{}<>]/.test(text)) return `{${JSON.stringify(text)}}`;
  return text;
}

function renderNode(node, depth, options) {
  const pad = INDENT.repeat(depth);
  const tag = elementFor(node);
  const className = classesFor(node);
  const attrs = [className ? `className="${className}"` : null];

  if (tag === 'a') attrs.push('href="#"');
  if (tag === 'button') attrs.push('type="button"');
  if (tag === 'input') attrs.push(`placeholder="${(node.text?.characters ?? '').replace(/"/g, '&quot;')}"`);
  if (options.dataNames && node.name) attrs.push(`data-layer="${node.name.replace(/"/g, '')}"`);

  const attrString = attrs.filter(Boolean).join(' ');
  const open = attrString ? `<${tag} ${attrString}>` : `<${tag}>`;

  if (VOID_ELEMENTS.has(tag)) {
    return `${pad}${attrString ? `<${tag} ${attrString} />` : `<${tag} />`}`;
  }

  if (node.type === 'TEXT') {
    return `${pad}${open}${jsxText(node.text?.characters ?? '')}</${tag}>`;
  }

  const children = (node.children ?? []).filter(Boolean);
  if (!children.length) return `${pad}${open}</${tag}>`;

  const inner = children.map((child) => renderNode(child, depth + 1, options)).join('\n');
  return `${pad}${open}\n${inner}\n${pad}</${tag}>`;
}

/**
 * Generates a React function component styled with Tailwind utilities.
 *
 * @param {unknown} input design IR
 * @param {{ typescript?: boolean, dataNames?: boolean }} [options]
 * @returns {{ filename: string, language: string, code: string }}
 */
export function generateReact(input, options = {}) {
  const ir = assertIR(input);
  const name = componentName(ir.name);
  const body = renderNode(ir.root, 2, options);
  const ext = options.typescript ? 'tsx' : 'jsx';
  const signature = options.typescript
    ? `export default function ${name}(): JSX.Element {`
    : `export default function ${name}() {`;

  const code = `// Generated from Figma layer "${ir.name}" by figma-design-to-code.
// Tweak freely - regenerate to pick up design changes.
${signature}
  return (
${body}
  );
}
`;
  return { filename: `${name}.${ext}`, language: ext, code };
}
