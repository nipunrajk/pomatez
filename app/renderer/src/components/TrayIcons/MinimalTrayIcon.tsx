import React from "react";
import { TimerStatus } from "store/timer/types";
import { TrayIconProps } from "./TrayIconProps";

/**
 * Pure black/monochrome shapes with alpha only — required for macOS
 * template images, which the OS re-tints itself to match the menu bar's
 * light/dark mode. Rendered as-is (flat black) on platforms where
 * template mode doesn't apply.
 */
export const MinimalTrayIcon: React.FC<TrayIconProps> = ({
  dashOffset,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      style={{
        transform: "rotateY(-180deg) rotateZ(-90deg)",
      }}
    >
      <g transform="translate(-353 -961)">
        <circle
          cx="4"
          cy="4"
          r="4"
          transform="translate(357 965)"
          fill="transparent"
          stroke="rgba(0, 0, 0, 0.35)"
          strokeWidth="2"
        />
        <circle
          cx="4"
          cy="4"
          r="4"
          transform="translate(357 965)"
          fill="transparent"
          strokeWidth="2"
          strokeDasharray="24"
          strokeLinecap="round"
          strokeDashoffset={`${dashOffset}`}
          stroke="#000000"
        />
      </g>
    </svg>
  );
};

//TODO: Remove this
MinimalTrayIcon.defaultProps = {
  dashOffset: 0,
  timerType: TimerStatus.STAY_FOCUS,
};
