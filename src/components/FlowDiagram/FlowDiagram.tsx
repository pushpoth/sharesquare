"use client";
// Implements: TASK-053 (REQ-018)

import { useId } from "react";
import { formatCurrency } from "@/utils/currency";
import { COLORS } from "@/constants/colors";
import type { DebtFlow } from "./types";

export interface FlowDiagramProps {
  flows: DebtFlow[];
  resolveName: (userId: string) => string;
  className?: string;
}

/**
 * SVG summary of simplified settlements (who pays whom).
 */
export function FlowDiagram({ flows, resolveName, className = "" }: FlowDiagramProps) {
  const markerUid = useId().replace(/:/g, "");

  if (flows.length === 0) {
    return (
      <div
        data-testid="flow-diagram-empty"
        className={`rounded-xl border border-dashed border-border bg-surface-muted/40 px-4 py-6 text-center text-sm text-text-secondary ${className}`}
      >
        When members owe each other, simplified payment flows will appear here.
      </div>
    );
  }

  const rowH = 36;
  const pad = 8;
  const w = 320;
  const h = pad * 2 + flows.length * rowH;

  return (
    <div className={className} data-testid="flow-diagram">
      <svg
        width="100%"
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        className="max-w-full"
        role="img"
        aria-label={`${flows.length} simplified settlement flows`}
      >
        <defs>
          <marker
            id={`flow-arrowhead-${markerUid}`}
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L8,4 L0,8 Z" fill={COLORS.textSecondary} />
          </marker>
        </defs>
        {flows.map((f, i) => {
          const y = pad + i * rowH + rowH / 2;
          const fromName = resolveName(f.fromUserId);
          const toName = resolveName(f.toUserId);
          const label = formatCurrency(f.amountCents);
          return (
            <g key={`${f.fromUserId}-${f.toUserId}-${i}`} data-testid="flow-diagram-row">
              <text x="4" y={y + 4} fill={COLORS.textPrimary} fontSize="12" fontWeight="600">
                {fromName}
              </text>
              <line
                x1="100"
                y1={y}
                x2="220"
                y2={y}
                stroke={COLORS.border}
                strokeWidth="2"
                markerEnd={`url(#flow-arrowhead-${markerUid})`}
              />
              <text x="118" y={y - 6} fill={COLORS.textSecondary} fontSize="10">
                {label}
              </text>
              <text x="228" y={y + 4} fill={COLORS.textPrimary} fontSize="12" fontWeight="600">
                {toName}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
