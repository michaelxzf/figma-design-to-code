/**
 * Sample design IRs, shaped exactly like the JSON the Figma plugin exports
 * (Plugin UI -> "Design IR" tab -> Copy).
 */

const loginCard = {
  version: 1,
  name: 'Login Card',
  root: {
    type: 'FRAME',
    name: 'Card',
    layout: {
      mode: 'VERTICAL',
      gap: 20,
      counterAxis: 'STRETCH',
      padding: { top: 32, right: 32, bottom: 32, left: 32 },
    },
    size: { width: 360, hugHeight: true },
    style: { background: '#ffffff', radius: 16, shadow: { blur: 16 }, stroke: { color: '#e2e8f0', width: 1 } },
    children: [
      {
        type: 'TEXT',
        name: 'Title',
        text: { characters: 'Welcome back', fontSize: 24, fontWeight: 600, color: '#0f172a', lineHeight: 30 },
      },
      {
        type: 'TEXT',
        name: 'Subtitle',
        text: { characters: 'Sign in to continue to your workspace.', fontSize: 14, fontWeight: 400, color: '#64748b' },
      },
      {
        type: 'FRAME',
        name: 'input email',
        size: { fillWidth: true, height: 44 },
        style: { background: '#f8fafc', radius: 10, stroke: { color: '#cbd5e1', width: 1 } },
        text: { characters: 'you@company.com' },
      },
      {
        type: 'FRAME',
        name: 'btn primary',
        layout: {
          mode: 'HORIZONTAL',
          primaryAxis: 'CENTER',
          counterAxis: 'CENTER',
          padding: { top: 12, right: 16, bottom: 12, left: 16 },
        },
        size: { fillWidth: true, hugHeight: true },
        style: { background: '#2563eb', radius: 10 },
        children: [
          {
            type: 'TEXT',
            name: 'Label',
            text: { characters: 'Continue', fontSize: 14, fontWeight: 600, color: '#ffffff' },
          },
        ],
      },
      {
        type: 'TEXT',
        name: 'Caption',
        text: { characters: 'By continuing you agree to the Terms & Privacy Policy.', fontSize: 12, color: '#94a3b8', align: 'CENTER' },
      },
    ],
  },
};

const pricingCard = {
  version: 1,
  name: 'Pricing Card',
  root: {
    type: 'FRAME',
    name: 'Plan Pro',
    layout: {
      mode: 'VERTICAL',
      gap: 16,
      counterAxis: 'STRETCH',
      padding: { top: 28, right: 24, bottom: 28, left: 24 },
    },
    size: { width: 300, hugHeight: true },
    style: { background: '#0f172a', radius: 20, shadow: { blur: 24 } },
    children: [
      {
        type: 'FRAME',
        name: 'badge',
        layout: { mode: 'HORIZONTAL', primaryAxis: 'CENTER', counterAxis: 'CENTER', padding: { top: 4, right: 10, bottom: 4, left: 10 } },
        size: { width: 92, hugHeight: true },
        style: { background: '#1d4ed8', radius: 9999 },
        children: [{ type: 'TEXT', name: 'Tag', text: { characters: 'Most popular', fontSize: 12, fontWeight: 500, color: '#dbeafe' } }],
      },
      { type: 'TEXT', name: 'Heading', text: { characters: 'Pro', fontSize: 30, fontWeight: 700, color: '#f8fafc' } },
      { type: 'TEXT', name: 'Price', text: { characters: '$24 / month', fontSize: 18, fontWeight: 500, color: '#93c5fd' } },
      {
        type: 'FRAME',
        name: 'list features',
        layout: { mode: 'VERTICAL', gap: 8, counterAxis: 'STRETCH' },
        size: { fillWidth: true, hugHeight: true },
        children: [
          { type: 'TEXT', name: 'Feature 1', text: { characters: 'Unlimited design imports', fontSize: 14, color: '#cbd5e1' } },
          { type: 'TEXT', name: 'Feature 2', text: { characters: 'React, Vue & HTML targets', fontSize: 14, color: '#cbd5e1' } },
          { type: 'TEXT', name: 'Feature 3', text: { characters: 'Token-aware Tailwind output', fontSize: 14, color: '#cbd5e1' } },
        ],
      },
      {
        type: 'FRAME',
        name: 'btn upgrade',
        layout: { mode: 'HORIZONTAL', primaryAxis: 'CENTER', counterAxis: 'CENTER', padding: { top: 12, right: 16, bottom: 12, left: 16 } },
        size: { fillWidth: true, hugHeight: true },
        style: { background: '#f8fafc', radius: 12 },
        children: [{ type: 'TEXT', name: 'Label', text: { characters: 'Upgrade now', fontSize: 14, fontWeight: 600, color: '#0f172a' } }],
      },
    ],
  },
};

const statsRow = {
  version: 1,
  name: 'Stats Row',
  root: {
    type: 'FRAME',
    name: 'section metrics',
    layout: { mode: 'HORIZONTAL', gap: 16, counterAxis: 'STRETCH', padding: { top: 0, right: 0, bottom: 0, left: 0 } },
    size: { width: 640, hugHeight: true },
    children: [
      metric('Components shipped', '128', '#2563eb'),
      metric('Design drift', '-42%', '#059669'),
      metric('Handoff time', '3h', '#7c3aed'),
    ],
  },
};

function metric(label, value, accent) {
  return {
    type: 'FRAME',
    name: `card ${label}`,
    layout: { mode: 'VERTICAL', gap: 6, counterAxis: 'STRETCH', padding: { top: 20, right: 20, bottom: 20, left: 20 } },
    size: { width: 200, hugHeight: true },
    style: { background: '#ffffff', radius: 14, stroke: { color: '#e2e8f0', width: 1 } },
    children: [
      { type: 'TEXT', name: 'Caption', text: { characters: label, fontSize: 12, fontWeight: 500, color: '#64748b' } },
      { type: 'TEXT', name: 'Heading', text: { characters: value, fontSize: 30, fontWeight: 700, color: accent } },
    ],
  };
}

export const SAMPLES = [
  { id: 'login', label: 'Login card', ir: loginCard },
  { id: 'pricing', label: 'Pricing card', ir: pricingCard },
  { id: 'stats', label: 'Stats row', ir: statsRow },
];
