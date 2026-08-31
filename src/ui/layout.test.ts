import { describe, expect, test } from "bun:test";
import { resolveLayout } from "./layout.ts";

describe("resolveLayout", () => {
  test("resolves the full frame", () => {
    expect(resolveLayout(160, 48, true)).toEqual({
      width: 160,
      height: 48,
      treeWidth: 32,
      mainWidth: 128,
      mainRows: 34,
      detailRows: 14,
    });
  });

  test("hides the tree in narrow frames", () => {
    expect(resolveLayout(60, 20, true).treeWidth).toBe(0);
  });
});
