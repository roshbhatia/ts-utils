import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { animationJsonSchema } from "../src/animation/index.ts";

const output = "schema/terminal.animation.v1.schema.json";
const rendered = `${JSON.stringify(animationJsonSchema(), undefined, 2)}\n`;

if (process.argv.includes("--check")) {
  if (!existsSync(output) || readFileSync(output, "utf8") !== rendered) {
    console.error(`${output} is stale; run bun run schema:animation`);
    process.exit(1);
  }
} else {
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, rendered);
}
