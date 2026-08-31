# ts-utils

Shared TypeScript primitives for Roshan's terminal tools.

The `ui` exports define theme, status, navigation, and layout contracts.
OpenTUI applications can consume them without coupling the contracts to one
renderer.

```ts
import { actionFor, defaultPalette, resolveLayout } from "@roshbhatia/ts-utils";

const action = actionFor({ name: "j", ctrl: false });
const frame = resolveLayout(160, 48, true);
```

## Development

```bash
nix develop
bun install --frozen-lockfile
bun run check
nix flake check
```

Run `bun run nix:lock` after a dependency change.
