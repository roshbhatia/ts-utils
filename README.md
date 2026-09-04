# ts-utils

Shared TypeScript primitives for Roshan's terminal tools.

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
