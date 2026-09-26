# Figma Design to Code

A working demo of a design-to-code pipeline: a **Figma plugin** reads the selected
frame, flattens it into a small **design IR**, and a shared **generator** turns that
IR into React + Tailwind (JS or TS) or HTML + Tailwind. A **browser playground**
runs the exact same generator so you can iterate on codegen without opening Figma.

```
Figma selection ──► design IR (JSON) ──► generator ──► React / HTML + Tailwind
   (plugin)            (portable)        (shared pkg)        (copy & paste)
```

## Repository layout

| Path | What it is |
| --- | --- |
| `packages/generator` | Framework-agnostic codegen: IR validation, Tailwind token mapping, React/HTML emitters. Zero dependencies. |
| `packages/figma-plugin` | Figma plugin (sandbox code + UI). Bundled with esbuild, ships `manifest.json`. |
| `apps/demo` | Vite + React playground: edit an IR, see a live preview and the generated code side by side. |
| `docs/design-ir.md` | The IR contract shared by plugin and generator. |

## Quick start

```bash
npm install          # workspaces: generator + plugin + demo
npm test             # generator unit tests (node:test, no deps)
npm run dev          # playground on http://localhost:5180
npm run build:plugin # emits packages/figma-plugin/dist/{code.js,ui.html}
```

Requires Node >= 18.17.

### Load the plugin in Figma

1. `npm run build:plugin` (or `npm run watch --workspace @d2c/figma-plugin` while developing).
2. Figma desktop app → menu → **Plugins → Development → Import plugin from manifest…**
3. Pick `packages/figma-plugin/manifest.json`.
4. Select any frame, component or text layer → **Plugins → Development → Design to Code (Tailwind)**.
5. Pick a target, hit **Copy code**, or switch to the **Design IR** tab and copy the JSON
   into the playground textarea to debug the mapping.

The plugin declares `networkAccess: none` — codegen happens entirely inside the
sandbox and no design data leaves Figma.

## What the generator handles

- **Auto layout** → `flex`, `flex-col/row`, `gap-*`, `justify-*`, `items-*`, `flex-wrap`
- **Sizing** → fixed `w-*`/`h-*`, `FILL` → `w-full`, `HUG` → no height class
- **Padding** → collapsed into `p-*` / `px-*` / `py-*` / per-side classes
- **Fills, strokes, radius, drop shadows, opacity** → `bg-[#hex]`, `border`, `rounded-*`, `shadow-*`, `opacity-*`
- **Text** → `text-*` size, `font-*` weight, `leading-*`, colour, alignment
- **Semantic elements** from layer names (`btn …` → `<button>`, `nav …` → `<nav>`,
  `input …` → `<input>`) and heading levels inferred from font size/weight
- **Off-scale values** fall back to arbitrary utilities (`gap-[13px]`, `rounded-[5px]`)
- **Escaping**: HTML output escapes text, JSX output wraps text containing `{`, `}` or `<`
  in a string expression, and the plugin UI only ever writes code via `textContent`

Unsupported on purpose (kept small for a demo): vector export, images/assets,
absolute-positioned children, variants/component props, design-token themes.

## Adding a target

1. Write an emitter in `packages/generator/src/<target>.js` that consumes the IR
   and reuses `classesFor()` / `elementFor()`.
2. Register it in `TARGETS` and the `switch` in `packages/generator/src/index.js`.
3. Add a test in `packages/generator/test/generator.test.js`.

Both the plugin dropdown and the playground tabs are driven by `TARGETS`, so the
new target shows up in both without further changes.

## License

MIT
