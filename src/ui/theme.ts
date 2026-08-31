export interface Palette {
  readonly background: string;
  readonly surface: string;
  readonly border: string;
  readonly muted: string;
  readonly text: string;
  readonly accent: string;
  readonly success: string;
  readonly warning: string;
  readonly danger: string;
}

export const defaultPalette: Palette = {
  background: "#1e2030",
  surface: "#24273a",
  border: "#5b6078",
  muted: "#8087a2",
  text: "#cad3f5",
  accent: "#8aadf4",
  success: "#a6da95",
  warning: "#eed49f",
  danger: "#ed8796",
};
