import assert from 'node:assert/strict';
import { test } from 'node:test';

import { classesFor, componentName, generate } from '../src/index.js';

const cardIR = {
  version: 1,
  name: 'Login Card',
  root: {
    type: 'FRAME',
    name: 'Card',
    layout: {
      mode: 'VERTICAL',
      gap: 16,
      padding: { top: 24, right: 24, bottom: 24, left: 24 },
      counterAxis: 'CENTER',
      primaryAxis: 'MIN',
    },
    size: { width: 320, hugHeight: true },
    style: { background: '#ffffff', radius: 12, shadow: { blur: 16 } },
    children: [
      {
        type: 'TEXT',
        name: 'Title',
        text: { characters: 'Sign in', fontSize: 24, fontWeight: 600, color: '#111827', align: 'CENTER' },
      },
      {
        type: 'FRAME',
        name: 'btn primary',
        layout: { mode: 'HORIZONTAL', primaryAxis: 'CENTER', counterAxis: 'CENTER', padding: { top: 10, bottom: 10, left: 16, right: 16 } },
        size: { fillWidth: true },
        style: { background: '#2563eb', radius: 8 },
        children: [
          { type: 'TEXT', name: 'Label', text: { characters: 'Continue', fontSize: 14, fontWeight: 500, color: '#ffffff' } },
        ],
      },
    ],
  },
};

test('componentName converts layer names to PascalCase', () => {
  assert.equal(componentName('Login Card'), 'LoginCard');
  assert.equal(componentName('btn/primary 2'), 'BtnPrimary2');
  assert.equal(componentName(''), 'Component');
});

test('classesFor maps auto-layout and style tokens to Tailwind', () => {
  const classes = classesFor(cardIR.root).split(' ');
  for (const expected of ['flex', 'flex-col', 'gap-4', 'p-6', 'w-80', 'bg-[#ffffff]', 'rounded-xl', 'shadow-xl', 'items-center']) {
    assert.ok(classes.includes(expected), `expected class ${expected} in ${classes.join(' ')}`);
  }
  assert.ok(!classes.includes('h-0'), 'hugHeight nodes must not emit a fixed height');
});

test('classesFor falls back to arbitrary values off the scale', () => {
  const classes = classesFor({ type: 'FRAME', layout: { mode: 'HORIZONTAL', gap: 13 }, style: { radius: 5 } });
  assert.ok(classes.includes('gap-[13px]'));
  assert.ok(classes.includes('rounded-[5px]'));
});

test('generate produces a React component with semantic elements', () => {
  const { filename, code } = generate(cardIR, { target: 'react' });
  assert.equal(filename, 'LoginCard.jsx');
  assert.match(code, /export default function LoginCard\(\) \{/);
  assert.match(code, /<h1 className="[^"]*text-2xl[^"]*">Sign in<\/h1>/);
  assert.match(code, /<button className="[^"]*bg-\[#2563eb\][^"]*" type="button">/);
  assert.match(code, /<span className="[^"]*font-medium[^"]*">Continue<\/span>/);
});

test('generate supports a TypeScript React target', () => {
  const { filename, code } = generate(cardIR, { target: 'react-ts' });
  assert.equal(filename, 'LoginCard.tsx');
  assert.match(code, /: JSX\.Element \{/);
});

test('generate produces HTML with escaped text', () => {
  const { code } = generate(
    { name: 'Note', root: { type: 'TEXT', name: 'Body', text: { characters: '5 < 6 & "safe"' } } },
    { target: 'html' },
  );
  assert.match(code, /5 &lt; 6 &amp; &quot;safe&quot;/);
});

test('react target escapes braces in text via a JSX expression', () => {
  const { code } = generate(
    { name: 'Note', root: { type: 'TEXT', name: 'Body', text: { characters: 'use {value} here' } } },
    { target: 'react' },
  );
  assert.match(code, /\{"use \{value\} here"\}/);
});

test('invalid IR is rejected with a readable error', () => {
  assert.throws(() => generate({}, { target: 'react' }), /IR\.root is required/);
  assert.throws(() => generate({ root: { type: 'FRAME', children: {} } }), /children must be an array/);
  assert.throws(() => generate(cardIR, { target: 'vue' }), /Unknown target: vue/);
});
