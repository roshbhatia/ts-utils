import { describe, expect, test } from "bun:test";
import { defaultPalette, resolveTerminalPalette } from "./theme.ts";

describe("terminal palette", () => {
  test("keeps application surfaces transparent", () => {
    expect(defaultPalette.background).toBe("transparent");
    expect(defaultPalette.surface).toBe("transparent");
  });

  test("maps the shared styles to terminal ANSI slots", () => {
    const palette = Array.from({ length: 16 }, (_, index) => `#0000${index}`);
    expect(
      resolveTerminalPalette({
        defaultForeground: "#ffffff",
        palette,
      }),
    ).toMatchObject({
      accent: "#00006",
      border: "#00008",
      danger: "#00001",
      delegate: "#00005",
      success: "#00002",
      text: "#ffffff",
      title: "#00004",
      warning: "#00003",
    });
  });
});
