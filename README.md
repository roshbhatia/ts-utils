# ts-utils

Shared TypeScript primitives for Roshan's terminal tools.

The `ui` exports define theme, status, navigation, and layout contracts.
OpenTUI applications can consume them without coupling the contracts to one
renderer. The terminal palette resolver maps shared roles to ANSI slots and
keeps application surfaces transparent.

```ts
import {
  resolveLayout,
  resolveTerminalPalette,
} from "@roshbhatia/ts-utils";

const frame = resolveLayout(160, 48, true);
const palette = resolveTerminalPalette(await renderer.getPalette());
```

## Development

```bash
nix develop
bun install --frozen-lockfile
bun run check
nix flake check
```

Run `bun run nix:lock` after a dependency change.
