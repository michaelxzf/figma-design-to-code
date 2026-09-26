export { assertIR, componentName, IR_VERSION } from './ir.js';
export { classesFor, elementFor } from './classes.js';
export { generateReact } from './react.js';
export { generateHtml } from './html.js';

import { generateHtml } from './html.js';
import { generateReact } from './react.js';

/** Code targets supported by the generator. */
export const TARGETS = [
  { id: 'react', label: 'React + Tailwind' },
  { id: 'react-ts', label: 'React + Tailwind (TS)' },
  { id: 'html', label: 'HTML + Tailwind' },
];

/**
 * Single entry point used by both the Figma plugin UI and the demo app.
 *
 * @param {unknown} ir design IR
 * @param {{ target?: 'react'|'react-ts'|'html', dataNames?: boolean }} [options]
 * @returns {{ filename: string, language: string, code: string }}
 */
export function generate(ir, options = {}) {
  const target = options.target ?? 'react';
  switch (target) {
    case 'html':
      return generateHtml(ir);
    case 'react-ts':
      return generateReact(ir, { ...options, typescript: true });
    case 'react':
      return generateReact(ir, { ...options, typescript: false });
    default:
      throw new Error(`Unknown target: ${target}`);
  }
}
