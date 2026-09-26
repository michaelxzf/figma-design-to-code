/**
 * Mapping from raw design values (px, hex, weights) to Tailwind utilities.
 * Anything that does not land on a Tailwind scale step falls back to an
 * arbitrary value, e.g. `gap-[13px]`.
 */

const RADIUS = {
  0: 'rounded-none',
  2: 'rounded-sm',
  4: 'rounded',
  6: 'rounded-md',
  8: 'rounded-lg',
  12: 'rounded-xl',
  16: 'rounded-2xl',
  24: 'rounded-3xl',
};

const FONT_SIZE = {
  12: 'text-xs',
  14: 'text-sm',
  16: 'text-base',
  18: 'text-lg',
  20: 'text-xl',
  24: 'text-2xl',
  30: 'text-3xl',
  36: 'text-4xl',
  48: 'text-5xl',
};

const FONT_WEIGHT = {
  100: 'font-thin',
  200: 'font-extralight',
  300: 'font-light',
  400: 'font-normal',
  500: 'font-medium',
  600: 'font-semibold',
  700: 'font-bold',
  800: 'font-extrabold',
  900: 'font-black',
};

const SHADOW = {
  0: 'shadow-none',
  1: 'shadow-sm',
  2: 'shadow',
  4: 'shadow-md',
  8: 'shadow-lg',
  16: 'shadow-xl',
  24: 'shadow-2xl',
};

export const PRIMARY_AXIS = {
  MIN: 'justify-start',
  CENTER: 'justify-center',
  MAX: 'justify-end',
  SPACE_BETWEEN: 'justify-between',
};

export const COUNTER_AXIS = {
  MIN: 'items-start',
  CENTER: 'items-center',
  MAX: 'items-end',
  BASELINE: 'items-baseline',
  STRETCH: 'items-stretch',
};

export const TEXT_ALIGN = {
  LEFT: 'text-left',
  CENTER: 'text-center',
  RIGHT: 'text-right',
  JUSTIFIED: 'text-justify',
};

const round = (n) => Math.round(Number(n) * 100) / 100;

/** @returns {boolean} true when the value is a usable, finite number */
export function isNum(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Spacing-like utility (padding, gap, margin, width, height).
 * Tailwind's spacing step is 4px, so 16px -> `4`.
 */
export function spacing(prefix, px) {
  if (!isNum(px)) return null;
  const value = round(px);
  if (value === 0) return `${prefix}-0`;
  if (value % 4 === 0 && value <= 384) return `${prefix}-${value / 4}`;
  if (value === 1) return `${prefix}-px`;
  if (value === 2) return `${prefix}-0.5`;
  if (value === 6) return `${prefix}-1.5`;
  if (value === 10) return `${prefix}-2.5`;
  if (value === 14) return `${prefix}-3.5`;
  return `${prefix}-[${value}px]`;
}

export function radius(px) {
  if (!isNum(px)) return null;
  const value = round(px);
  if (value >= 9999) return 'rounded-full';
  return RADIUS[value] ?? `rounded-[${value}px]`;
}

export function fontSize(px) {
  if (!isNum(px)) return null;
  const value = round(px);
  return FONT_SIZE[value] ?? `text-[${value}px]`;
}

export function fontWeight(weight) {
  if (!isNum(weight)) return null;
  const snapped = Math.min(900, Math.max(100, Math.round(weight / 100) * 100));
  return FONT_WEIGHT[snapped] ?? null;
}

export function lineHeight(px, sizePx) {
  if (!isNum(px)) return null;
  if (isNum(sizePx) && sizePx > 0) {
    const ratio = round(px / sizePx);
    if (ratio === 1) return 'leading-none';
    if (ratio === 1.25) return 'leading-tight';
    if (ratio === 1.5) return 'leading-normal';
    if (ratio === 1.625) return 'leading-relaxed';
    if (ratio === 2) return 'leading-loose';
  }
  return `leading-[${round(px)}px]`;
}

export function shadow(blurPx) {
  if (!isNum(blurPx)) return null;
  const value = Math.round(blurPx);
  if (SHADOW[value]) return SHADOW[value];
  const nearest = Object.keys(SHADOW)
    .map(Number)
    .reduce((best, step) => (Math.abs(step - value) < Math.abs(best - value) ? step : best), 0);
  return SHADOW[nearest];
}

/** Normalises `#abc`, `abcdef`, `rgb(...)` into a lowercase `#rrggbb[aa]`. */
export function color(value) {
  if (typeof value !== 'string') return null;
  const raw = value.trim().toLowerCase();
  const hex = raw.startsWith('#') ? raw.slice(1) : raw;
  if (/^[0-9a-f]{3}$/.test(hex)) {
    return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  }
  if (/^[0-9a-f]{6}$/.test(hex) || /^[0-9a-f]{8}$/.test(hex)) return `#${hex}`;
  return null;
}

/** Arbitrary-value colour utility, e.g. `bg-[#0f172a]`. */
export function colorUtility(prefix, value) {
  const hex = color(value);
  return hex ? `${prefix}-[${hex}]` : null;
}

export function opacity(value) {
  if (!isNum(value) || value >= 1) return null;
  const pct = Math.max(0, Math.round(value * 100));
  return pct % 5 === 0 ? `opacity-${pct}` : `opacity-[${round(value)}]`;
}
