import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "hooks/storeHooks";
import { useTargetOutside } from "hooks";
import { setRound, setSessionRounds } from "store";
import {
  StyledRoundBadge,
  StyledRoundButton,
  StyledRoundPopover,
  StyledRoundSetup,
  StyledRoundStepper,
} from "styles";
import SVG from "./SVG";

/** Same upper limit as the Config page's "Session rounds" slider. */
const MAX_ROUNDS = 10;

/**
 * "Round 1/4" badge that opens a popover to set the current round and the
 * rounds per cycle. Closes on outside click or Escape.
 */
const RoundSetup: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const round = useAppSelector((state) => state.timer.round);
  const total = useAppSelector((state) => state.config.sessionRounds);

  const wrapRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useTargetOutside({
    ref: wrapRef,
    eventType: "mousedown",
  });
  const wasOpen = useRef(false);
  const lastPressed = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (open) {
      popoverRef.current
        ?.querySelector<HTMLButtonElement>("button:not(:disabled)")
        ?.focus();
    } else if (wasOpen.current) {
      // Escape (or closing from inside) returns focus to the badge; an
      // outside click leaves focus where the user clicked.
      const active = document.activeElement;
      if (
        !active ||
        active === document.body ||
        wrapRef.current?.contains(active)
      ) {
        badgeRef.current?.focus();
      }
    }
    wasOpen.current = !!open;
  }, [open]);

  // A stepper that just hit its limit disables itself, which would drop
  // keyboard focus to the page; keep it on the other button in the row.
  useEffect(() => {
    const pressed = lastPressed.current;
    if (!pressed?.disabled) return;
    pressed.parentElement
      ?.querySelector<HTMLButtonElement>("button:not(:disabled)")
      ?.focus();
  }, [round, total]);

  const changeRound = (
    e: React.MouseEvent<HTMLButtonElement>,
    delta: number
  ) => {
    lastPressed.current = e.currentTarget;
    dispatch(setRound(Math.min(total, Math.max(1, round + delta))));
  };

  const changeTotal = (
    e: React.MouseEvent<HTMLButtonElement>,
    delta: number
  ) => {
    lastPressed.current = e.currentTarget;
    const next = Math.min(MAX_ROUNDS, Math.max(1, total + delta));
    dispatch(setSessionRounds(next));
    if (round > next) dispatch(setRound(next));
  };

  return (
    <StyledRoundSetup ref={wrapRef}>
      <StyledRoundBadge
        ref={badgeRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={!!open}
        title={t("controlPanel.configureRounds")}
        onClick={() => setOpen(!open)}
      >
        {t("controlPanel.round", { round, total })}
      </StyledRoundBadge>

      {open && (
        <StyledRoundPopover
          ref={popoverRef}
          role="dialog"
          aria-labelledby="round-setup-title"
        >
          <h4 id="round-setup-title">{t("controlPanel.roundSetup")}</h4>

          <StyledRoundStepper
            role="group"
            aria-labelledby="round-current"
          >
            <span id="round-current">
              {t("controlPanel.currentRound")}
            </span>
            <div>
              <StyledRoundButton
                size="sm"
                aria-label={t("controlPanel.previousRound")}
                disabled={round <= 1}
                onClick={(e) => changeRound(e, -1)}
              >
                <SVG name="minus" />
              </StyledRoundButton>
              <output aria-live="polite">{round}</output>
              <StyledRoundButton
                size="sm"
                aria-label={t("controlPanel.nextRound")}
                disabled={round >= total}
                onClick={(e) => changeRound(e, 1)}
              >
                <SVG name="add" />
              </StyledRoundButton>
            </div>
          </StyledRoundStepper>

          <StyledRoundStepper
            role="group"
            aria-labelledby="round-total"
          >
            <span id="round-total">
              {t("controlPanel.roundsPerCycle")}
            </span>
            <div>
              <StyledRoundButton
                size="sm"
                aria-label={t("controlPanel.fewerRounds")}
                disabled={total <= 1}
                onClick={(e) => changeTotal(e, -1)}
              >
                <SVG name="minus" />
              </StyledRoundButton>
              <output aria-live="polite">{total}</output>
              <StyledRoundButton
                size="sm"
                aria-label={t("controlPanel.moreRounds")}
                disabled={total >= MAX_ROUNDS}
                onClick={(e) => changeTotal(e, 1)}
              >
                <SVG name="add" />
              </StyledRoundButton>
            </div>
          </StyledRoundStepper>
        </StyledRoundPopover>
      )}
    </StyledRoundSetup>
  );
};

export default RoundSetup;
