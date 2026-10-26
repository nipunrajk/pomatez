/** Shared presentation values; the counter remains the sole timer clock. */
export function getTimerPresentation({
  count,
  duration,
  playing,
  phaseStarted,
}: {
  count: number;
  duration: number;
  playing: boolean;
  phaseStarted: boolean;
}) {
  const seconds = Math.max(0, Math.ceil(count));
  const pad = (value: number) => (value < 10 ? "0" : "") + value;
  return {
    active: playing || phaseStarted,
    time: `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`,
    progress:
      duration > 0
        ? Math.max(0, Math.min(1, (duration - count) / duration))
        : 0,
  };
}
