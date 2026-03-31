// Implements: TASK-005 (REQ-027, REQ-028)
/** Hex values aligned with `src/styles/globals.css` `@theme` — charts, canvas, or native APIs outside Tailwind classes. */
export const COLORS = {
  primary: "#5B7A5E",
  primaryDark: "#4A5A3C",
  primaryLight: "#E8F0E8",
  accent: "#6B8F71",
  surface: "#FFFFFF",
  surfaceMuted: "#F5F5F5",
  textPrimary: "#2D3436",
  textSecondary: "#717171",
  textOnPrimary: "#FFFFFF",
  border: "#D1D5DB",
  owedBadge: "#7A8B6F",
  owingText: "#C0392B",
} as const;

export type ColorToken = keyof typeof COLORS;
