import { classesFor, elementFor } from '@d2c/generator';
import React from 'react';

const VOID_ELEMENTS = new Set(['input', 'img', 'br', 'hr']);

/**
 * Renders a design IR node with the exact same element + class mapping the code
 * generator uses, so the preview matches the generated component.
 */
export default function IRRenderer({ node, path = '0' }) {
  if (!node) return null;
  const Tag = elementFor(node);
  const className = classesFor(node) || undefined;

  if (VOID_ELEMENTS.has(Tag)) {
    const extra = Tag === 'input' ? { placeholder: node.text?.characters ?? '', readOnly: true } : {};
    return <Tag className={className} {...extra} />;
  }

  if (node.type === 'TEXT') {
    return <Tag className={className}>{node.text?.characters ?? ''}</Tag>;
  }

  const extra = {};
  if (Tag === 'a') extra.href = '#';
  if (Tag === 'button') extra.type = 'button';

  return (
    <Tag className={className} {...extra}>
      {(node.children ?? []).map((child, index) => (
        <IRRenderer key={child.id ?? `${path}.${index}`} node={child} path={`${path}.${index}`} />
      ))}
    </Tag>
  );
}
