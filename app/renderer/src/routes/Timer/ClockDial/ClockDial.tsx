import React, {
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { CounterContext } from "contexts/CounterContext";
import { useAppSelector } from "hooks/storeHooks";
import { useTimerControls } from "hooks/useTimerControls";
import { getTimerPresentation } from "@pomatez/shareables";
import SVG from "components/SVG";
import { timerColor } from "styles/mixins";
import { StyledClockDial } from "styles/routes/timer/clockDial";
import { getTimerPhaseLabelKey } from "../timerPhaseLabel";

const RADIUS = 100;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const ClockDial: React.FC = () => {
  const { t } = useTranslation();
  const { count, duration, resetTimerAction, timerType, active } =
    useContext(CounterContext);
  const playing = useAppSelector((state) => state.timer.playing);
  const animate = useAppSelector(
    (state) => state.settings.enableProgressAnimation
  );
  const { warn, onPlay, onReset, onSkip } =
    useTimerControls(resetTimerAction);
  const { time, progress } = getTimerPresentation({
    count,
    duration,
    playing,
    phaseStarted: active,
  });
  const remaining = duration > 0 ? 1 - progress : 0;
  const previous = useRef({ remaining, duration, timerType });
  const [interpolate, setInterpolate] = useState(false);

  // Phase changes and resets snap immediately to avoid sweeping backward
  useLayoutEffect(() => {
    const last = previous.current;
    setInterpolate(
      playing &&
        animate &&
        last.duration === duration &&
        last.timerType === timerType &&
        remaining <= last.remaining
    );
    previous.current = { remaining, duration, timerType };
  }, [remaining, duration, timerType, playing, animate]);

  const phase = t(getTimerPhaseLabelKey(timerType));
  const playState = playing ? "pause" : active ? "resume" : "start";

  const accentColor = timerColor(timerType, false);
  const accentReadable = timerColor(timerType, true);

  return (
    <StyledClockDial
      $accent={accentColor}
      $accentReadable={accentReadable}
      $animate={interpolate && playing && animate}
    >
      <div className="clock-face">
        <svg viewBox="0 0 232 232" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient
              id="orbit-beam-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={accentColor} stopOpacity="0.7" />
              <stop offset="100%" stopColor={accentColor} stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Recessed track groove */}
          <circle
            className="orbit-track"
            cx="116"
            cy="116"
            r={RADIUS}
          />

          {/* Luminous progress arc */}
          <circle
            className="orbit-progress"
            cx="116"
            cy="116"
            r={RADIUS}
            stroke="url(#orbit-beam-gradient)"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - remaining)}
            transform="rotate(-90 116 116)"
          />

          {/* Leading luminous bead */}
          <g
            className="orbit-bead"
            style={{ transform: `rotate(${360 * remaining - 90}deg)` }}
          >
            <circle cx={116 + RADIUS} cy="116" r="5.5" />
          </g>
        </svg>

        <div className="dial-readout">
          <p
            className="countdown"
            role="timer"
            aria-label={`${phase}: ${time}`}
          >
            {time}
          </p>
        </div>

        <div
          className="clock-controls"
          role="group"
          aria-label={t("controlPanel.pomodoroTimer")}
        >
          <button
            type="button"
            aria-label={t("controlPanel.resetTimer")}
            title={t("controlPanel.resetTimer")}
            onClick={onReset}
          >
            <SVG name="reset" />
          </button>
          <button
            type="button"
            className="clock-play"
            aria-label={t(`controlPanel.${playState}Timer`)}
            title={t(`controlPanel.${playState}Timer`)}
            onClick={onPlay}
          >
            <SVG name={playing ? "pause" : "play"} />
          </button>
          <button
            type="button"
            aria-label={t("controlPanel.skipPhase")}
            title={t("controlPanel.skipPhase")}
            onClick={onSkip}
          >
            <SVG name="skip" />
          </button>
        </div>
      </div>

      <p
        className="clock-status"
        role="status"
        title={warn ? t("day.strictMode") : undefined}
      >
        {warn ? t("day.strictMode") : ""}
      </p>
    </StyledClockDial>
  );
};

export default React.memo(ClockDial);
