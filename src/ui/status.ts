import { Schema } from "effect";

export const StatusSchema = Schema.Literals([
  "idle",
  "working",
  "waiting",
  "blocked",
  "failed",
  "done",
] as const);

export type Status = typeof StatusSchema.Type;

export const spinnerFrames = ["|", "/", "-", "\\"] as const;
