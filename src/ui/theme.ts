export interface Palette {
  readonly background: string;
  readonly surface: string;
  readonly border: string;
  readonly muted: string;
  readonly text: string;
  readonly accent: string;
  readonly title: string;
  readonly delegate: string;
  readonly success: string;
  readonly warning: string;
  readonly danger: string;
}

export interface TerminalColors {
  readonly palette: ReadonlyArray<string | null>;
  readonly defaultForeground?: string | null;
}

const fallbackAnsi = [
  "#24273a",
  "#ed8796",
  "#a6da95",
  "#eed49f",
  "#8aadf4",
  "#c6a0f6",
  "#8bd5ca",
  "#cad3f5",
  "#8087a2",
] as const;

const colorAt = (colors: TerminalColors | undefined, index: number): string =>
  colors?.palette[index] ?? fallbackAnsi[index] ?? fallbackAnsi[7];

export const resolveTerminalPalette = (colors?: TerminalColors): Palette => ({
  background: "transparent",
  surface: "transparent",
  border: colorAt(colors, 8),
  muted: colorAt(colors, 8),
  text: colors?.defaultForeground ?? colorAt(colors, 7),
  accent: colorAt(colors, 6),
  title: colorAt(colors, 4),
  delegate: colorAt(colors, 5),
  success: colorAt(colors, 2),
  warning: colorAt(colors, 3),
  danger: colorAt(colors, 1),
});

export const defaultPalette: Palette = resolveTerminalPalette();
