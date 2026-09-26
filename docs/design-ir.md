# Design IR

The IR is the contract between the Figma plugin and the code generators. It is
plain JSON: you can copy it out of the plugin, commit it as a fixture, or paste
it into the playground.

```json
{
  "version": 1,
  "name": "Login Card",
  "root": {
    "id": "12:34",
    "name": "Card",
    "type": "FRAME",
    "layout": {
      "mode": "VERTICAL",
      "gap": 20,
      "wrap": false,
      "primaryAxis": "MIN",
      "counterAxis": "STRETCH",
      "padding": { "top": 32, "right": 32, "bottom": 32, "left": 32 }
    },
    "size": { "width": 360, "height": 280, "fillWidth": false, "hugHeight": true },
    "style": {
      "background": "#ffffff",
      "radius": 16,
      "stroke": { "color": "#e2e8f0", "width": 1 },
      "shadow": { "blur": 16 },
      "opacity": 1
    },
    "children": []
  }
}
```

## Node fields

| Field | Notes |
| --- | --- |
| `type` | `FRAME`, `TEXT`, `RECTANGLE`, `ELLIPSE`, `IMAGE`, `VECTOR`. Figma groups/components/instances collapse to `FRAME`. |
| `name` | Original layer name. Drives semantic element and component naming, so `btn primary` → `<button>` and the root name → `PascalCase` component. |
| `layout` | Only present when the node has auto layout. `mode: "NONE"` and missing layout both render as a plain block. |
| `size.fillWidth` | Figma `layoutSizingHorizontal === "FILL"` → `w-full`. |
| `size.hugHeight` | Content-driven height → no `h-*` class emitted. |
| `style.*` | Colours are `#rrggbb` or `#rrggbbaa` (fill opacity folded into alpha). |
| `text` | `characters`, `fontSize`, `fontWeight` (100–900, parsed from the Figma font style name), `lineHeight` in px, `color`, `align`. |
| `children` | Visible children only, depth-capped at 12 and 600 nodes to keep huge frames from hanging the plugin. |

Unset properties are omitted rather than set to `null`, so an IR stays readable.

## Validation

`assertIR(input)` (exported from `@d2c/generator`) validates untrusted input —
the playground feeds pasted JSON straight through it — and throws a message that
names the failing path, e.g. `root.children[1]: children must be an array`.
