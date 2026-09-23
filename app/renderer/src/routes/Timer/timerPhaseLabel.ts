import { TimerStatus } from "store/timer/types";

/** i18n key for the current timer phase, shared by the header and the ring label. */
export const getTimerPhaseLabelKey = (
  timerType?: TimerStatus
): string => {
  switch (timerType) {
    case TimerStatus.SHORT_BREAK:
      return "timer.shortBreak";
    case TimerStatus.LONG_BREAK:
      return "timer.longBreak";
    case TimerStatus.SPECIAL_BREAK:
      return "timer.specialBreak";
    default:
      return "timer.stayFocused";
  }
};
