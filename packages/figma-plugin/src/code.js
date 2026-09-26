/**
 * Plugin sandbox entry point.
 * Reads the current selection, converts it to the design IR and hands the
 * generated code to the plugin UI. No network calls, no data leaves Figma.
 */
import { TARGETS, generate } from '@d2c/generator';

import { selectionToIR } from './figma-ir.js';

const STORAGE_KEY = 'd2c:target';
let target = 'react';

figma.showUI(__html__, { width: 520, height: 640, themeColors: true });

function emit() {
  const selection = selectionToIR();
  if (!selection.ok) {
    figma.ui.postMessage({ type: 'empty', message: selection.reason });
    return;
  }
  try {
    const result = generate(selection.ir, { target });
    figma.ui.postMessage({
      type: 'code',
      target,
      filename: result.filename,
      language: result.language,
      code: result.code,
      ir: JSON.stringify(selection.ir, null, 2),
      nodeName: selection.ir.name,
    });
  } catch (error) {
    figma.ui.postMessage({ type: 'error', message: String((error && error.message) || error) });
  }
}

figma.on('selectionchange', emit);

figma.ui.onmessage = async (msg) => {
  switch (msg && msg.type) {
    case 'set-target':
      if (TARGETS.some((t) => t.id === msg.target)) {
        target = msg.target;
        await figma.clientStorage.setAsync(STORAGE_KEY, target);
        emit();
      }
      break;
    case 'refresh':
      emit();
      break;
    case 'toast':
      figma.notify(String(msg.message || ''));
      break;
    case 'close':
      figma.closePlugin();
      break;
    default:
      break;
  }
};

(async () => {
  const saved = await figma.clientStorage.getAsync(STORAGE_KEY);
  if (typeof saved === 'string' && TARGETS.some((t) => t.id === saved)) target = saved;
  figma.ui.postMessage({ type: 'init', targets: TARGETS, target });
  emit();
})();
