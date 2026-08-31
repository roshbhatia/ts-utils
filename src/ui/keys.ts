export interface Key {
  readonly name: string;
  readonly ctrl?: boolean;
  readonly shift?: boolean;
  readonly alt?: boolean;
  readonly meta?: boolean;
}

export interface KeyStroke {
  readonly name: string;
  readonly ctrl?: boolean;
  readonly shift?: boolean;
  readonly alt?: boolean;
  readonly meta?: boolean;
}

export interface KeyBinding<Action extends string> {
  readonly action: Action;
  readonly description: string;
  readonly help: string;
  readonly keys: ReadonlyArray<KeyStroke>;
}

const modifierMatches = (
  expected: boolean | undefined,
  actual: boolean | undefined,
): boolean => (expected ?? false) === (actual ?? false);

export const strokeMatches = (stroke: KeyStroke, key: Key): boolean =>
  stroke.name === key.name &&
  modifierMatches(stroke.ctrl, key.ctrl) &&
  modifierMatches(stroke.shift, key.shift) &&
  modifierMatches(stroke.alt, key.alt) &&
  modifierMatches(stroke.meta, key.meta);

export const bindingMatches = <Action extends string>(
  binding: KeyBinding<Action>,
  key: Key,
): boolean => binding.keys.some((stroke) => strokeMatches(stroke, key));

export const actionFor = <Action extends string>(
  bindings: ReadonlyArray<KeyBinding<Action>>,
  key: Key,
): Action | undefined =>
  bindings.find((binding) => bindingMatches(binding, key))?.action;

export const helpText = <Action extends string>(
  bindings: ReadonlyArray<KeyBinding<Action>>,
  separator = "  ",
): string =>
  bindings
    .map((binding) => `${binding.help} ${binding.description}`)
    .join(separator);
