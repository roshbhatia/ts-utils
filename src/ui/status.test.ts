import { describe, expect, test } from "bun:test";
import { Schema } from "effect";
import { StatusSchema, spinnerFrames } from "./status.ts";

describe("status", () => {
  test("accepts the shared lifecycle", () => {
    expect(Schema.decodeUnknownSync(StatusSchema)("working")).toBe("working");
  });

  test("rejects unknown values", () => {
    expect(() => Schema.decodeUnknownSync(StatusSchema)("unknown")).toThrow();
  });

  test("defines animation frames", () => {
    expect(spinnerFrames).toEqual(["|", "/", "-", "\\"]);
  });
});
