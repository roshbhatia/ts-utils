import { describe, expect, test } from "bun:test";
import { actionFor } from "./keys.ts";

describe("actionFor", () => {
  test("maps Vim navigation", () => {
    expect(actionFor({ name: "j", ctrl: false })).toBe("down");
    expect(actionFor({ name: "h", ctrl: true })).toBe("left");
  });

  test("leaves unknown keys unbound", () => {
    expect(actionFor({ name: "x", ctrl: false })).toBeUndefined();
  });
});
