export type Action =
  | "up"
  | "down"
  | "left"
  | "right"
  | "open"
  | "back"
  | "quit"
  | "toggle-tree";

export interface Key {
  readonly name: string;
  readonly ctrl: boolean;
}

const plainActions: Readonly<Record<string, Action>> = {
  h: "left",
  left: "left",
  j: "down",
  down: "down",
  k: "up",
  up: "up",
  l: "right",
  right: "right",
  enter: "open",
  esc: "back",
  q: "quit",
  e: "toggle-tree",
};

const controlActions: Readonly<Record<string, Action>> = {
  h: "left",
  j: "down",
  k: "up",
  l: "right",
};

export const actionFor = (key: Key): Action | undefined =>
  key.ctrl ? controlActions[key.name] : plainActions[key.name];
