import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { CounterContext } from "contexts";
import { useAppDispatch, useAppSelector } from "hooks/storeHooks";
import { useTimerControls } from "hooks/useTimerControls";
import { setLongBreak, setShorBreak, setStayFocus } from "store";
import { TimerStatus } from "store/timer/types";
import { getTimerPhaseLabelKey } from "routes/Timer/timerPhaseLabel";
import {
  StyledDialActions,
  StyledDialHeader,
  StyledDialReadout,
  StyledDialSvg,
  StyledPomodoroDial,
  StyledRoundButton,
} from "styles";
import { timerColor } from "styles/mixins";
import RoundSetup from "./RoundSetup";
import SVG from "./SVG";

// Dial geometry (SVG units): the top of a disc, flat-clipped at the bottom.
const W = 360;
const H = 124;
const R = 202;
const CX = W / 2;
const CY = 14 + R;
const DEG_PER_MINUTE = 6;
/** Minutes either side of the pointer that can be visible, plus margin. */
const VISIBLE_SPAN = 12;

/** Same limits as the Config sliders. */
const PHASE_SETTING = {
  [TimerStatus.STAY_FOCUS]: {
    key: "stayFocus",
    max: 120,
    set: setStayFocus,
  },
  [TimerStatus.SHORT_BREAK]: {
    key: "shortBreak",
    max: 60,
    set: setShorBreak,
  },
  [TimerStatus.LONG_BREAK]: {
    key: "longBreak",
    max: 60,
    set: setLongBreak,
  },
} as const;

/**
 * Control Panel's Pomodoro widget: -/+ set the current phase's length,
 * the action bar resets, starts/pauses and skips, and the dial shows the
 * time left.
 */
const PomodoroDial: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { count, duration, timerType, resetTimerAction } =
    useContext(CounterContext);
  const playing = useAppSelector((state) => state.timer.playing);
  const config = useAppSelector((state) => state.config);
  const { warn, onPlay, onReset, onSkip } =
    useTimerControls(resetTimerAction);

  const playState = playing
    ? "pause"
    : count < duration
    ? "resume"
    : "start";

  const phase =
    timerType && timerType !== TimerStatus.SPECIAL_BREAK
      ? PHASE_SETTING[timerType]
      : null;
  const setting = phase ? config[phase.key] : null;

  const value = count / 60;
  const minutes = Math.ceil(value);
  const max = phase ? phase.max : Math.max(minutes, 1);

  // Changing a length resets the countdown, so not while it's running.
  const adjust = (delta: number) => {
    if (!phase || setting === null || playing) return;
    const next = Math.min(phase.max, Math.max(1, setting + delta));
    if (next !== setting) dispatch(phase.set(next));
  };

  const first = Math.max(0, Math.floor(value) - VISIBLE_SPAN);
  const last = Math.min(max, Math.ceil(value) + VISIBLE_SPAN);
  const ticks: number[] = [];
  for (let m = first; m <= last; m++) ticks.push(m);

  const phaseLabel = t(getTimerPhaseLabelKey(timerType));

  return (
    <StyledPomodoroDial accent={timerColor(timerType, true)}>
      <StyledDialHeader>
        <div>
          <h3>{t("controlPanel.pomodoroTimer")}</h3>
          <p>{phaseLabel}</p>
        </div>
        <RoundSetup />
      </StyledDialHeader>

      <StyledDialReadout>
        <StyledRoundButton
          aria-label={`${t("controlPanel.decrease")} (${phaseLabel})`}
          disabled={!phase || playing || setting === 1}
          onClick={() => adjust(-1)}
        >
          <SVG name="minus" />
        </StyledRoundButton>
        <p aria-live="polite">
          <strong>{minutes}</strong>
          <span>{t("controlPanel.minutes", { count: minutes })}</span>
        </p>
        <StyledRoundButton
          aria-label={`${t("controlPanel.increase")} (${phaseLabel})`}
          disabled={!phase || playing || setting === max}
          onClick={() => adjust(1)}
        >
          <SVG name="add" />
        </StyledRoundButton>
      </StyledDialReadout>

      <StyledDialActions>
        <StyledRoundButton
          aria-label={t("controlPanel.resetTimer")}
          onClick={onReset}
        >
          <SVG name="reset" />
        </StyledRoundButton>
        <button
          type="button"
          aria-label={t(`controlPanel.${playState}Timer`)}
          onClick={onPlay}
        >
          <SVG name={playing ? "pause" : "play"} />
          {t(`controlPanel.${playState}`)}
        </button>
        <StyledRoundButton
          aria-label={t("controlPanel.skipPhase")}
          onClick={onSkip}
        >
          <SVG name="skip" />
        </StyledRoundButton>
      </StyledDialActions>
      {/* Strict mode refuses pause/reset/skip while running. */}
      <p role="status" className="dial-status">
        {warn ? t("day.strictMode") : ""}
      </p>

      <StyledDialSvg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={t("controlPanel.dialLabel", {
          phase: phaseLabel,
          minutes,
        })}
      >
        <circle cx={CX} cy={CY} r={R} />
        <g
          style={{
            transform: `rotate(${-value * DEG_PER_MINUTE}deg)`,
            transformOrigin: `${CX}px ${CY}px`,
          }}
        >
          {ticks.map((m) => {
            const major = m % 5 === 0;
            const rotate = `rotate(${m * DEG_PER_MINUTE} ${CX} ${CY})`;
            return (
              <React.Fragment key={m}>
                <line
                  x1={CX}
                  y1={CY - R + 2}
                  x2={CX}
                  y2={CY - R + (major ? 22 : 11)}
                  strokeWidth={major ? 2.5 : 1.5}
                  transform={rotate}
                />
                {major && (
                  <text
                    x={CX}
                    y={CY - R + 52}
                    textAnchor="middle"
                    transform={rotate}
                  >
                    {m}
                  </text>
                )}
              </React.Fragment>
            );
          })}
        </g>
        {/* Fixed pointer at the top: the current value. */}
        <line
          x1={CX}
          y1={CY - R + 2}
          x2={CX}
          y2={CY - R + 30}
          strokeWidth={4}
        />
      </StyledDialSvg>
    </StyledPomodoroDial>
  );
};

export default React.memo(PomodoroDial);
