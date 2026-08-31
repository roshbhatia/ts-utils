import { describe, expect, test } from "bun:test";
import {
  actionFor,
  bindingMatches,
  helpText,
  type KeyBinding,
} from "./keys.ts";

type Action = "down" | "quit";

const downBinding: KeyBinding<Action> = {
  action: "down",
  description: "next",
  help: "j/down",
  keys: [{ name: "j" }, { name: "down" }],
};

const quitBinding: KeyBinding<Action> = {
  action: "quit",
  description: "quit",
  help: "q",
  keys: [{ name: "q" }, { ctrl: true, name: "c" }],
};

const bindings: ReadonlyArray<KeyBinding<Action>> = [downBinding, quitBinding];

describe("key bindings", () => {
  test("maps input through the declared bindings", () => {
    expect(actionFor(bindings, { name: "j" })).toBe("down");
    expect(actionFor(bindings, { ctrl: true, name: "c" })).toBe("quit");
    expect(actionFor(bindings, { name: "x" })).toBeUndefined();
  });

  test("requires every declared modifier", () => {
    expect(bindingMatches(quitBinding, { name: "c" })).toBe(false);
    expect(bindingMatches(quitBinding, { ctrl: true, name: "c" })).toBe(true);
  });

  test("generates help from the same bindings", () => {
    expect(helpText(bindings)).toBe("j/down next  q quit");
  });
});
