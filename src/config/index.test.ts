import { describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Schema } from "effect";
import { configPath, configSchema, loadConfig } from "./index.ts";

const TestConfig = Schema.Struct({
  color: Schema.Literals(["auto", "always", "never"]),
  enabled: Schema.Boolean,
  providers: Schema.Struct({ diff: Schema.Array(Schema.String) }),
});

describe("config", () => {
  test("applies defaults, YAML, and environment in order", async () => {
    const root = await mkdtemp(join(tmpdir(), "ts-utils-config-"));
    const directory = join(root, "test-tool");
    await mkdir(directory);
    await writeFile(
      join(directory, "config.yaml"),
      "color: always\nenabled: true\nproviders:\n  diff: [git]\n",
    );
    const got = loadConfig(TestConfig, {
      defaults: { color: "auto", enabled: false, providers: { diff: [] } },
      environment: {
        HOME: root,
        TEST_TOOL_COLOR: "never",
        TEST_TOOL_PROVIDERS_DIFF: "[delta, difftastic]",
        XDG_CONFIG_HOME: root,
      },
      name: "test-tool",
      prefix: "TEST_TOOL",
    });
    expect(got).toEqual({
      color: "never",
      enabled: true,
      providers: { diff: ["delta", "difftastic"] },
    });
  });

  test("supports a config path environment override", () => {
    expect(
      configPath({
        environment: { TEST_TOOL_CONFIG: "/tmp/custom.yaml" },
        name: "test-tool",
        prefix: "TEST_TOOL",
      }),
    ).toBe("/tmp/custom.yaml");
  });

  test("emits Draft 2020-12 JSON Schema", () => {
    expect(configSchema(TestConfig, "Test configuration")).toMatchObject({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      title: "Test configuration",
      type: "object",
    });
  });
});
