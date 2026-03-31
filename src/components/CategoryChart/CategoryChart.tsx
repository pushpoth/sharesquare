"use client";
// Implements: TASK-053 (REQ-018)

import { useMemo } from "react";
import type { CategoryAmount } from "./types";
import { CATEGORY_CHART_FILLS } from "./constants";

export interface CategoryChartProps {
  /** Non-empty amounts only; component sums for proportions. */
  segments: CategoryAmount[];
  className?: string;
}

/**
 * Segmented horizontal bar (SVG) for expense share by category.
 */
export function CategoryChart({ segments, className = "" }: CategoryChartProps) {
  const { total, normalized } = useMemo(() => {
    const positive = segments.filter((s) => s.amountCents > 0);
    const totalCents = positive.reduce((sum, s) => sum + s.amountCents, 0);
    return {
      total: totalCents,
      normalized: positive.map((s) => ({
        ...s,
        fraction: totalCents > 0 ? s.amountCents / totalCents : 0,
      })),
    };
  }, [segments]);

  const barWidth = 100;
  const rects = useMemo(() => {
    let x = 0;
    return normalized.map((s, i) => {
      const width = Math.max(0.5, s.fraction * barWidth);
      const r = { x, width, s, i };
      x += width;
      return r;
    });
  }, [normalized]);

  if (total <= 0 || normalized.length === 0) {
    return (
      <div
        data-testid="category-chart-empty"
        className={`rounded-xl border border-dashed border-border bg-surface-muted/40 px-4 py-6 text-center text-sm text-text-secondary ${className}`}
      >
        Add expenses with categories to see a breakdown chart.
      </div>
    );
  }

  return (
    <div className={className} data-testid="category-chart">
      <svg
        width="100%"
        height={32}
        viewBox={`0 0 ${barWidth} 10`}
        preserveAspectRatio="none"
        className="overflow-hidden rounded-md border border-border"
        role="img"
        aria-label={`Expense breakdown by category, ${normalized.length} categories`}
      >
        {rects.map(({ x, width, s, i }) => (
          <rect
            key={s.categoryKey}
            x={x}
            y="1"
            width={width}
            height="8"
            fill={CATEGORY_CHART_FILLS[i % CATEGORY_CHART_FILLS.length]}
            data-testid={`category-chart-segment-${s.categoryKey}`}
          />
        ))}
      </svg>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-text-secondary">
        {normalized.map((s, i) => (
          <li key={s.categoryKey} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: CATEGORY_CHART_FILLS[i % CATEGORY_CHART_FILLS.length] }}
              aria-hidden
            />
            <span className="text-text-primary">{s.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
