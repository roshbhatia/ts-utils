import { describe, expect, test } from "bun:test";
import { renderTemplate } from "./index.ts";

describe("template", () => {
  test("renders typed data without changing code characters", () => {
    expect(
      renderTemplate("{{name}} uses {{operator}}\n", {
        name: "orc",
        operator: "a && b",
      }),
    ).toBe("orc uses a && b\n");
  });

  test("rejects a missing value", () => {
    expect(() => renderTemplate("{{missing}}", {})).toThrow();
  });

  test("can escape HTML output explicitly", () => {
    expect(
      renderTemplate("{{value}}", { value: "<node>" }, { escapeHtml: true }),
    ).toBe("&lt;node&gt;");
  });
});
