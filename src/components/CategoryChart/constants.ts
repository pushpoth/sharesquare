// Implements: TASK-053 (REQ-018)

import { COLORS } from "@/constants/colors";

/** Distinct fills for stacked segments (hex for SVG). */
export const CATEGORY_CHART_FILLS = [
  COLORS.accent,
  COLORS.primary,
  COLORS.primaryDark,
  COLORS.owedBadge,
  "#8B9DC3",
  "#D4A574",
  "#9B8BB8",
  "#6B9B9B",
  "#C17B7B",
] as const;
