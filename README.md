# ts-utils

Shared TypeScript primitives for Roshan's terminal tools.

The `animation` exports implement the renderer-neutral
`terminal.animation/v1` YAML contract. Each sequence uses either `fps` or a
`duration_ms` on every frame. Frames contain full text and a semantic style
role. Rendering pads frames to stable display-cell dimensions. Compact variants
are optional. Each animation has one static reduced-motion frame.

FPS timing uses `ceil(1000 / fps)` milliseconds per frame. Per-frame timing
requires `duration_ms` on every frame. `ping_pong` does not repeat endpoints.
Easing changes the reported progress within a frame, not frame selection.

```ts
const config = parseAnimationYaml(source);
const sequence = selectAnimationSequence(config, "loading", {
  compact: terminalWidth < 60,
  reducedMotion: accessibility.reduceMotion,
});
const frame = sequence && renderAnimationFrame(sequence, elapsedMs);
```

Run `bun run schema:animation` to generate the checked JSON Schema at
`schema/terminal.animation.v1.schema.json`.

The `config` exports load typed YAML, apply environment overrides, validate with
Effect Schema, and emit Draft 2020-12 JSON Schema from the same definition.

The `ui` exports define theme, status, navigation, and layout contracts.
OpenTUI applications can consume them without coupling the contracts to one
renderer. The terminal palette resolver maps shared roles to ANSI slots and
keeps application surfaces transparent.

The `template` export renders typed data with a private, strict Handlebars
engine. It keeps code characters literal unless the caller requests HTML
escaping.

```ts
import {
  renderTemplate,
  resolveLayout,
  resolveTerminalPalette,
} from "@roshbhatia/ts-utils";

const frame = resolveLayout(160, 48, true);
const palette = resolveTerminalPalette(await renderer.getPalette());

const provider = renderTemplate("{{name}} uses {{command}}", {
  name: "ask",
  command: "claude -p",
});
```

## Development

```bash
nix develop
bun install --frozen-lockfile
bun run check
nix flake check
```

Run `bun run nix:lock` after a dependency change.
