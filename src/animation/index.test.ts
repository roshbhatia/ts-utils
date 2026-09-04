import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import {
  parseAnimationYaml,
  renderAnimationFrame,
  sampleAnimation,
  selectAnimationSequence,
} from "./index.ts";

const source = readFileSync("testdata/terminal-animation.yaml", "utf8");

describe("terminal animation", () => {
  test("selects full, compact, and reduced-motion variants", () => {
    const config = parseAnimationYaml(source);
    expect(selectAnimationSequence(config, "loading")?.dimensions.width).toBe(
      4,
    );
    expect(
      selectAnimationSequence(config, "loading", { compact: true })?.dimensions
        .width,
    ).toBe(1);
    expect(
      selectAnimationSequence(config, "loading", {
        compact: true,
        reducedMotion: true,
      })?.frames[0]?.content,
    ).toBe("done");
  });

  test("matches the cross-language golden timing", () => {
    const sequence = selectAnimationSequence(
      parseAnimationYaml(source),
      "loading",
    );
    if (!sequence) throw new Error("missing loading animation");
    const cases = [
      [0, 0, 0],
      [99, 0, 0.9801],
      [100, 1, 0],
      [300, 1, 0],
      [400, 0, 0],
      [600, 2, 0],
    ] as const;
    for (const [elapsed, frameIndex, progress] of cases) {
      const sample = sampleAnimation(sequence, elapsed);
      expect(sample.frameIndex).toBe(frameIndex);
      expect(sample.progress).toBeCloseTo(progress, 6);
    }

    const compact = selectAnimationSequence(
      parseAnimationYaml(source),
      "loading",
      {
        compact: true,
      },
    );
    if (!compact) throw new Error("missing compact animation");
    const variableCases = [
      [0, 0, 0],
      [79, 0, 0.9875],
      [80, 1, 0],
      [199, 1, 119 / 120],
      [200, 0, 0],
    ] as const;
    for (const [elapsed, frameIndex, progress] of variableCases) {
      const sample = sampleAnimation(compact, elapsed);
      expect(sample.frameIndex).toBe(frameIndex);
      expect(sample.progress).toBeCloseTo(progress, 6);
    }

    const reduced = selectAnimationSequence(
      parseAnimationYaml(source),
      "loading",
      {
        reducedMotion: true,
      },
    );
    if (!reduced) throw new Error("missing reduced-motion animation");
    expect(sampleAnimation(reduced, 999).progress).toBe(0.999);
    expect(sampleAnimation(reduced, 1_000).progress).toBe(1);
  });

  test("pads frames to stable display-cell dimensions", () => {
    const sequence = selectAnimationSequence(
      parseAnimationYaml(source),
      "loading",
    );
    if (!sequence) throw new Error("missing loading animation");
    expect(renderAnimationFrame(sequence, 0)).toEqual({
      content: "a   \n    ",
      style: "accent",
      width: 4,
      height: 2,
    });
  });

  test("rejects mixed timing modes", () => {
    const invalid = source.replace(
      "        - content: a",
      "        - content: a\n          duration_ms: 100",
    );
    expect(() => parseAnimationYaml(invalid)).toThrow(
      "duration_ms is forbidden",
    );
  });

  test("rejects invalid elapsed time", () => {
    const sequence = selectAnimationSequence(
      parseAnimationYaml(source),
      "loading",
    );
    if (!sequence) throw new Error("missing loading animation");
    expect(() => sampleAnimation(sequence, -1)).toThrow(
      "elapsedMs must be a non-negative safe integer",
    );
  });
});
