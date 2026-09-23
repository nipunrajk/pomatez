import React, { useMemo } from "react";
import { ChartBucket } from "hooks/useStats";
import { formatMinutes } from "./formatMinutes";

type Props = {
  buckets: ChartBucket[];
};

const VIEW_WIDTH = 300;
const VIEW_HEIGHT = 150;
const LEFT_PAD = 30;
const RIGHT_PAD = 4;
const TOP_PAD = 8;
const BOTTOM_PAD = 18;

const PLOT_WIDTH = VIEW_WIDTH - LEFT_PAD - RIGHT_PAD;
const PLOT_HEIGHT = VIEW_HEIGHT - TOP_PAD - BOTTOM_PAD;

const computeNiceMax = (max: number): number => {
  if (max <= 15) return 15;
  if (max <= 30) return 30;
  if (max <= 45) return 45;
  if (max <= 60) return 60;
  return Math.ceil(max / 30) * 30;
};

const FocusedTimeChart: React.FC<Props> = ({ buckets }) => {
  const { niceMax, ticks } = useMemo(() => {
    const max = Math.max(0, ...buckets.map((b) => b.minutes));
    const niceMax = computeNiceMax(max);
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * niceMax);
    return { niceMax, ticks };
  }, [buckets]);

  const slotWidth = PLOT_WIDTH / Math.max(buckets.length, 1);
  const barWidth = Math.max(slotWidth * 0.55, 1);

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      {ticks.map((tick) => {
        const y =
          TOP_PAD + PLOT_HEIGHT - (tick / niceMax) * PLOT_HEIGHT;
        return (
          <g key={tick}>
            <line
              x1={LEFT_PAD}
              x2={VIEW_WIDTH - RIGHT_PAD}
              y1={y}
              y2={y}
              stroke="var(--color-border-primary)"
              strokeWidth={1}
            />
            <text
              x={LEFT_PAD - 4}
              y={y + 3}
              textAnchor="end"
              fontSize={8}
              fill="var(--color-text-secondary-readable)"
            >
              {formatMinutes(tick)}
            </text>
          </g>
        );
      })}

      {buckets.map((bucket, index) => {
        const barHeight = Math.max(
          (bucket.minutes / niceMax) * PLOT_HEIGHT,
          bucket.minutes > 0 ? 1.5 : 0
        );
        const slotX = LEFT_PAD + index * slotWidth;
        const barX = slotX + (slotWidth - barWidth) / 2;
        const barY = TOP_PAD + PLOT_HEIGHT - barHeight;

        return (
          <g key={index}>
            {bucket.minutes > 0 && (
              <rect
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                rx={1.5}
                fill="var(--color-primary)"
              />
            )}
            {bucket.label && (
              <text
                x={slotX + slotWidth / 2}
                y={VIEW_HEIGHT - 4}
                textAnchor="middle"
                fontSize={8}
                fill="var(--color-text-secondary-readable)"
              >
                {bucket.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

export default React.memo(FocusedTimeChart);
