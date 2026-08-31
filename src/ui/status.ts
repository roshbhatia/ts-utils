import { Schema } from "effect";

export const StatusSchema = Schema.Literal(
  "idle",
  "working",
  "waiting",
  "blocked",
  "failed",
  "done",
);

export type Status = typeof StatusSchema.Type;

export const spinnerFrames = ["|", "/", "-", "\\"] as const;
