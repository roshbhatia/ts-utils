import { YAML } from "bun";
import { Schema } from "effect";
import { configSchema } from "../config/index.ts";

export const animationVersion = "terminal.animation/v1" as const;

export const PlaybackSchema = Schema.Literals([
  "once",
  "loop",
  "ping_pong",
] as const);
export type Playback = typeof PlaybackSchema.Type;

export const EasingSchema = Schema.Literals([
  "linear",
  "ease_in",
  "ease_out",
  "ease_in_out",
] as const);
export type Easing = typeof EasingSchema.Type;

export const AnimationStyleSchema = Schema.Literals([
  "default",
  "accent",
  "muted",
  "success",
  "warning",
  "danger",
] as const);
export type AnimationStyle = typeof AnimationStyleSchema.Type;

const boundedInteger = (minimum: number, maximum: number) =>
  Schema.Int.check(Schema.isBetween({ minimum, maximum }));

export const DimensionsSchema = Schema.Struct({
  width: boundedInteger(1, 512),
  height: boundedInteger(1, 256),
});
export type Dimensions = typeof DimensionsSchema.Type;

export const AnimationFrameSchema = Schema.Struct({
  content: Schema.String,
  style: AnimationStyleSchema,
  duration_ms: Schema.optionalKey(boundedInteger(1, 10_000)),
});
export type AnimationFrame = typeof AnimationFrameSchema.Type;

export const AnimationSequenceSchema = Schema.Struct({
  dimensions: DimensionsSchema,
  playback: PlaybackSchema,
  easing: EasingSchema,
  fps: Schema.optionalKey(boundedInteger(1, 60)),
  frames: Schema.Array(AnimationFrameSchema).check(
    Schema.isLengthBetween(1, 512),
  ),
});
export type AnimationSequence = typeof AnimationSequenceSchema.Type;

export const AnimationSchema = Schema.Struct({
  full: AnimationSequenceSchema,
  compact: Schema.optionalKey(AnimationSequenceSchema),
  reduced_motion: AnimationSequenceSchema,
});
export type Animation = typeof AnimationSchema.Type;

export const AnimationConfigSchema = Schema.Struct({
  version: Schema.Literal(animationVersion),
  animations: Schema.Record(Schema.String, AnimationSchema),
});
export type AnimationConfig = typeof AnimationConfigSchema.Type;

export interface AnimationPreferences {
  readonly compact?: boolean;
  readonly reducedMotion?: boolean;
}

export interface AnimationSample {
  readonly frameIndex: number;
  readonly progress: number;
}

export interface RenderedAnimationFrame {
  readonly content: string;
  readonly style: AnimationStyle;
  readonly width: number;
  readonly height: number;
}

export const parseAnimationYaml = (source: string): AnimationConfig => {
  const config = Schema.decodeUnknownSync(AnimationConfigSchema)(
    YAML.parse(source),
    { errors: "all", onExcessProperty: "error" },
  );
  validateAnimationConfig(config);
  return config;
};

export const validateAnimationConfig = (config: AnimationConfig): void => {
  const problems: Array<string> = [];
  const entries = Object.entries(config.animations);
  if (entries.length === 0)
    problems.push("animations must contain at least one animation");
  for (const [name, animation] of entries) {
    if (name.trim().length === 0)
      problems.push("animation names must not be empty");
    validateSequence(animation.full, `animations.${name}.full`, problems);
    if (animation.compact)
      validateSequence(
        animation.compact,
        `animations.${name}.compact`,
        problems,
      );
    const path = `animations.${name}.reduced_motion`;
    validateSequence(animation.reduced_motion, path, problems);
    if (
      animation.reduced_motion.frames.length !== 1 ||
      animation.reduced_motion.playback !== "once"
    )
      problems.push(`${path} must contain one frame with playback once`);
  }
  if (problems.length > 0) throw new Error(problems.join("\n"));
};

export const selectAnimationSequence = (
  config: AnimationConfig,
  name: string,
  preferences: AnimationPreferences = {},
): AnimationSequence | undefined => {
  const animation = config.animations[name];
  if (!animation) return undefined;
  if (preferences.reducedMotion) return animation.reduced_motion;
  if (preferences.compact) return animation.compact ?? animation.full;
  return animation.full;
};

export const sampleAnimation = (
  sequence: AnimationSequence,
  elapsedMs: number,
): AnimationSample => {
  if (!Number.isSafeInteger(elapsedMs) || elapsedMs < 0)
    throw new Error("elapsedMs must be a non-negative safe integer");
  const path = playbackPath(sequence);
  const durations = path.map((index) => durationFor(sequence, index));
  const total = durations.reduce((sum, duration) => sum + duration, 0);
  if (sequence.playback === "once" && elapsedMs >= total)
    return { frameIndex: path.at(-1) ?? 0, progress: 1 };
  const position = sequence.playback === "once" ? elapsedMs : elapsedMs % total;
  let start = 0;
  for (const [pathIndex, duration] of durations.entries()) {
    const end = start + duration;
    if (position < end) {
      const raw = (position - start) / duration;
      return {
        frameIndex: path[pathIndex] ?? 0,
        progress: ease(sequence.easing, raw),
      };
    }
    start = end;
  }
  throw new Error("animation position exceeded validated duration");
};

export const renderAnimationFrame = (
  sequence: AnimationSequence,
  elapsedMs: number,
): RenderedAnimationFrame => {
  const sample = sampleAnimation(sequence, elapsedMs);
  const frame = sequence.frames[sample.frameIndex];
  if (!frame) throw new Error("animation sample selected an unknown frame");
  const lines = frame.content
    .split("\n")
    .map(
      (line) =>
        line + " ".repeat(sequence.dimensions.width - Bun.stringWidth(line)),
    );
  const blank = " ".repeat(sequence.dimensions.width);
  while (lines.length < sequence.dimensions.height) lines.push(blank);
  return {
    content: lines.join("\n"),
    style: frame.style,
    width: sequence.dimensions.width,
    height: sequence.dimensions.height,
  };
};

export const animationJsonSchema = (): Readonly<Record<string, unknown>> => ({
  $id: "https://roshbhatia.github.io/schemas/terminal.animation.v1.schema.json",
  ...configSchema(AnimationConfigSchema, "Renderer-neutral terminal animation"),
});

const validateSequence = (
  sequence: AnimationSequence,
  path: string,
  problems: Array<string>,
): void => {
  const usesFps = sequence.fps !== undefined;
  for (const [index, frame] of sequence.frames.entries()) {
    const framePath = `${path}.frames[${index}]`;
    if (usesFps && frame.duration_ms !== undefined)
      problems.push(`${framePath}.duration_ms is forbidden when fps is set`);
    if (!usesFps && frame.duration_ms === undefined)
      problems.push(`${framePath}.duration_ms is required when fps is absent`);
    if (
      frame.content.includes("\r") ||
      frame.content.includes("\t") ||
      frame.content.includes("\u001b")
    )
      problems.push(
        `${framePath}.content must not contain carriage returns, tabs, or ANSI escapes`,
      );
    const lines = frame.content.split("\n");
    if (lines.length > sequence.dimensions.height)
      problems.push(`${framePath}.content exceeds the declared height`);
    if (lines.some((line) => Bun.stringWidth(line) > sequence.dimensions.width))
      problems.push(
        `${framePath}.content exceeds the declared display-cell width`,
      );
  }
};

const playbackPath = (sequence: AnimationSequence): Array<number> => {
  const path = sequence.frames.map((_, index) => index);
  if (sequence.playback === "ping_pong" && path.length > 2)
    path.push(...path.slice(1, -1).reverse());
  return path;
};

const durationFor = (
  sequence: AnimationSequence,
  frameIndex: number,
): number => {
  if (sequence.fps !== undefined) return Math.ceil(1_000 / sequence.fps);
  return sequence.frames[frameIndex]?.duration_ms ?? 0;
};

const ease = (easing: Easing, progress: number): number => {
  switch (easing) {
    case "ease_in":
      return progress * progress;
    case "ease_out":
      return 1 - (1 - progress) * (1 - progress);
    case "ease_in_out":
      return progress < 0.5
        ? 2 * progress * progress
        : 1 - (-2 * progress + 2) ** 2 / 2;
    default:
      return progress;
  }
};
