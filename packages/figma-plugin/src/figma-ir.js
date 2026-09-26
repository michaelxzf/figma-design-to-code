/**
 * Figma scene graph -> design IR.
 * Runs inside the Figma plugin sandbox (the only file that touches `figma.*`).
 */

const MAX_DEPTH = 12;
const MAX_NODES = 600;

const FONT_WEIGHTS = [
  [/thin/i, 100],
  [/extra ?light|ultra ?light/i, 200],
  [/light/i, 300],
  [/regular|normal|book/i, 400],
  [/medium/i, 500],
  [/semi ?bold|demi ?bold/i, 600],
  [/extra ?bold|ultra ?bold/i, 800],
  [/black|heavy/i, 900],
  [/bold/i, 700],
];

/** Figma returns `figma.mixed` for properties that differ across a range. */
function plain(value) {
  return value === figma.mixed ? undefined : value;
}

function channel(value) {
  return Math.max(0, Math.min(255, Math.round(value * 255)))
    .toString(16)
    .padStart(2, '0');
}

function toHex(rgb, alpha) {
  const base = `#${channel(rgb.r)}${channel(rgb.g)}${channel(rgb.b)}`;
  if (typeof alpha === 'number' && alpha < 1) return `${base}${channel(alpha)}`;
  return base;
}

/** First visible solid paint as a hex string, or undefined. */
function solidPaint(paints) {
  const list = plain(paints);
  if (!Array.isArray(list)) return undefined;
  for (const paint of list) {
    if (paint.visible === false) continue;
    if (paint.type === 'SOLID') return toHex(paint.color, paint.opacity);
  }
  return undefined;
}

function hasImagePaint(paints) {
  const list = plain(paints);
  return Array.isArray(list) && list.some((p) => p.visible !== false && p.type === 'IMAGE');
}

function fontWeight(fontName) {
  const style = plain(fontName)?.style;
  if (!style) return undefined;
  for (const [pattern, weight] of FONT_WEIGHTS) {
    if (pattern.test(style)) return weight;
  }
  return undefined;
}

function lineHeightPx(node) {
  const lh = plain(node.lineHeight);
  const size = plain(node.fontSize);
  if (!lh || lh.unit === 'AUTO') return undefined;
  if (lh.unit === 'PIXELS') return lh.value;
  if (lh.unit === 'PERCENT' && typeof size === 'number') return (size * lh.value) / 100;
  return undefined;
}

function layoutOf(node) {
  if (!('layoutMode' in node) || node.layoutMode === 'NONE') return undefined;
  return {
    mode: node.layoutMode,
    gap: node.itemSpacing,
    wrap: node.layoutWrap === 'WRAP',
    primaryAxis: node.primaryAxisAlignItems,
    counterAxis: node.counterAxisAlignItems,
    padding: {
      top: node.paddingTop,
      right: node.paddingRight,
      bottom: node.paddingBottom,
      left: node.paddingLeft,
    },
  };
}

function sizeOf(node) {
  const size = {};
  if ('width' in node) size.width = Math.round(node.width);
  if ('height' in node) size.height = Math.round(node.height);
  const horizontal = 'layoutSizingHorizontal' in node ? node.layoutSizingHorizontal : undefined;
  const vertical = 'layoutSizingVertical' in node ? node.layoutSizingVertical : undefined;
  if (horizontal === 'FILL') size.fillWidth = true;
  if (vertical === 'HUG' || vertical === 'FILL') size.hugHeight = true;
  if (!vertical && node.type === 'TEXT') size.hugHeight = true;
  return size;
}

function styleOf(node) {
  const style = {};
  const background = solidPaint(node.fills);
  if (background && node.type !== 'TEXT') style.background = background;

  const radius = plain(node.cornerRadius);
  if (typeof radius === 'number' && radius > 0) style.radius = radius;

  const stroke = solidPaint(node.strokes);
  if (stroke) {
    style.stroke = { color: stroke, width: plain(node.strokeWeight) ?? 1 };
  }

  const effects = plain(node.effects);
  if (Array.isArray(effects)) {
    const dropShadow = effects.find((e) => e.visible !== false && e.type === 'DROP_SHADOW');
    if (dropShadow) style.shadow = { blur: dropShadow.radius };
  }

  if (typeof node.opacity === 'number' && node.opacity < 1) style.opacity = node.opacity;
  return style;
}

function textOf(node) {
  return {
    characters: plain(node.characters) ?? '',
    fontSize: plain(node.fontSize),
    fontWeight: fontWeight(node.fontName),
    lineHeight: lineHeightPx(node),
    color: solidPaint(node.fills),
    align: node.textAlignHorizontal,
  };
}

function irType(node) {
  if (node.type === 'TEXT') return 'TEXT';
  if (hasImagePaint(node.fills)) return 'IMAGE';
  switch (node.type) {
    case 'FRAME':
    case 'COMPONENT':
    case 'COMPONENT_SET':
    case 'INSTANCE':
    case 'GROUP':
    case 'SECTION':
      return 'FRAME';
    case 'ELLIPSE':
      return 'ELLIPSE';
    case 'RECTANGLE':
      return 'RECTANGLE';
    default:
      return 'VECTOR';
  }
}

function prune(value) {
  if (!value || typeof value !== 'object') return value;
  const out = Array.isArray(value) ? [] : {};
  for (const [key, entry] of Object.entries(value)) {
    if (entry === undefined || entry === null) continue;
    if (typeof entry === 'object' && !Array.isArray(entry)) {
      const nested = prune(entry);
      if (Object.keys(nested).length) out[key] = nested;
      continue;
    }
    out[key] = entry;
  }
  return out;
}

/**
 * Converts a Figma node (and its visible subtree) into the design IR.
 * @param {SceneNode} node
 * @param {{ depth?: number, budget?: { count: number } }} [state]
 */
export function nodeToIR(node, state = {}) {
  const depth = state.depth ?? 0;
  const budget = state.budget ?? { count: 0 };
  budget.count += 1;

  const ir = {
    id: node.id,
    name: node.name,
    type: irType(node),
    size: sizeOf(node),
    style: styleOf(node),
  };

  const layout = layoutOf(node);
  if (layout) ir.layout = layout;
  if (node.type === 'TEXT') ir.text = textOf(node);

  if ('children' in node && depth < MAX_DEPTH && budget.count < MAX_NODES) {
    const children = node.children
      .filter((child) => child.visible !== false)
      .map((child) => nodeToIR(child, { depth: depth + 1, budget }));
    if (children.length) ir.children = children;
  }

  return prune(ir);
}

/**
 * Builds a full IR document from the current selection.
 * @returns {{ ok: true, ir: object } | { ok: false, reason: string }}
 */
export function selectionToIR() {
  const selection = figma.currentPage.selection;
  if (selection.length === 0) return { ok: false, reason: 'Select a frame, component or text layer to generate code.' };
  if (selection.length > 1) return { ok: false, reason: 'Select exactly one layer (got ' + selection.length + ').' };

  const node = selection[0];
  return {
    ok: true,
    ir: { version: 1, name: node.name, root: nodeToIR(node) },
  };
}
