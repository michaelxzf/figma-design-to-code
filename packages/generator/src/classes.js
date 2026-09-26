import {
  COUNTER_AXIS,
  PRIMARY_AXIS,
  TEXT_ALIGN,
  colorUtility,
  fontSize,
  fontWeight,
  isNum,
  lineHeight,
  opacity,
  radius,
  shadow,
  spacing,
} from './tokens.js';

/** Layer names that hint at a semantic HTML element. */
const SEMANTIC_HINTS = [
  [/^(btn|button|cta)\b/i, 'button'],
  [/^(link|anchor)\b/i, 'a'],
  [/^(input|field|textbox)\b/i, 'input'],
  [/^(nav|navbar|navigation)\b/i, 'nav'],
  [/^(header|topbar)\b/i, 'header'],
  [/^(footer)\b/i, 'footer'],
  [/^(section)\b/i, 'section'],
  [/^(list|ul)\b/i, 'ul'],
  [/^(badge|tag|chip)\b/i, 'span'],
];

/**
 * Chooses the element for a node from its type and layer name.
 * @param {import('./ir.js').IRNode} node
 */
export function elementFor(node) {
  if (node.type === 'TEXT') return textElementFor(node);
  const name = node.name ?? '';
  for (const [pattern, tag] of SEMANTIC_HINTS) {
    if (pattern.test(name)) return tag;
  }
  return 'div';
}

function textElementFor(node) {
  const size = node.text?.fontSize ?? 16;
  const weight = node.text?.fontWeight ?? 400;
  const name = node.name ?? '';
  if (/^(h1|title|heading)\b/i.test(name) || (size >= 30 && weight >= 600)) return 'h1';
  if (/^h2\b/i.test(name) || (size >= 24 && weight >= 600)) return 'h2';
  if (/^(h3|subtitle)\b/i.test(name) || (size >= 20 && weight >= 500)) return 'h3';
  // "Label"/"Caption" layers are usually inline runs (often inside a button),
  // where a <label> element would be invalid, so emit a <span>.
  if (/^(label|caption|badge|tag|chip)\b/i.test(name)) return 'span';
  return 'p';
}

function paddingClasses(padding) {
  if (!padding) return [];
  const { top, right, bottom, left } = padding;
  const out = [];
  if (isNum(top) && top === bottom && top === right && top === left) {
    return [spacing('p', top)].filter(Boolean);
  }
  if (isNum(top) && top === bottom) out.push(spacing('py', top));
  else {
    out.push(spacing('pt', top));
    out.push(spacing('pb', bottom));
  }
  if (isNum(left) && left === right) out.push(spacing('px', left));
  else {
    out.push(spacing('pl', left));
    out.push(spacing('pr', right));
  }
  return out.filter(Boolean);
}

function sizeClasses(node) {
  const out = [];
  const size = node.size ?? {};
  if (size.fillWidth) out.push('w-full');
  else if (isNum(size.width)) out.push(spacing('w', size.width));
  if (!size.hugHeight && isNum(size.height) && node.type !== 'TEXT') {
    out.push(spacing('h', size.height));
  }
  return out.filter(Boolean);
}

function layoutClasses(node) {
  const layout = node.layout;
  const out = [];
  if (!layout || !layout.mode || layout.mode === 'NONE') {
    if (node.children?.length) out.push('relative');
    return out;
  }
  out.push('flex', layout.mode === 'VERTICAL' ? 'flex-col' : 'flex-row');
  if (layout.wrap) out.push('flex-wrap');
  if (isNum(layout.gap) && layout.gap > 0) out.push(spacing('gap', layout.gap));
  if (layout.primaryAxis && PRIMARY_AXIS[layout.primaryAxis]) out.push(PRIMARY_AXIS[layout.primaryAxis]);
  if (layout.counterAxis && COUNTER_AXIS[layout.counterAxis]) out.push(COUNTER_AXIS[layout.counterAxis]);
  return out.filter(Boolean);
}

function styleClasses(node) {
  const style = node.style ?? {};
  const out = [
    colorUtility('bg', style.background),
    radius(style.radius),
    opacity(style.opacity),
  ];
  if (style.stroke?.color) {
    const width = isNum(style.stroke.width) ? Math.round(style.stroke.width) : 1;
    out.push(width === 1 ? 'border' : `border-[${width}px]`);
    out.push(colorUtility('border', style.stroke.color));
  }
  if (style.shadow && isNum(style.shadow.blur)) out.push(shadow(style.shadow.blur));
  if (node.type === 'ELLIPSE') out.push('rounded-full');
  return out.filter(Boolean);
}

function textClasses(node) {
  const text = node.text;
  if (!text) return [];
  return [
    fontSize(text.fontSize),
    fontWeight(text.fontWeight),
    lineHeight(text.lineHeight, text.fontSize),
    colorUtility('text', text.color),
    text.align && text.align !== 'LEFT' ? TEXT_ALIGN[text.align] : null,
  ].filter(Boolean);
}

/**
 * Full Tailwind class list for a node, de-duplicated and stably ordered.
 * @param {import('./ir.js').IRNode} node
 * @returns {string}
 */
export function classesFor(node) {
  const all = [
    ...layoutClasses(node),
    ...sizeClasses(node),
    ...paddingClasses(node.layout?.padding),
    ...styleClasses(node),
    ...textClasses(node),
  ];
  return [...new Set(all)].join(' ');
}
