import { getTimerPresentation } from "@pomatez/shareables";

describe("ambient timer presentation", () => {
  const initial = {
    count: 1500,
    duration: 1500,
    playing: false,
    phaseStarted: false,
  };
  it("starts idle and becomes active immediately when started", () => {
    expect(getTimerPresentation(initial)).toEqual({
      active: false,
      time: "25:00",
      progress: 0,
    });
    expect(
      getTimerPresentation({ ...initial, playing: true }).active
    ).toBe(true);
  });
  it("retains the same countdown and progress when paused and resumed", () => {
    const paused = { ...initial, count: 1499, phaseStarted: true };
    expect(getTimerPresentation(paused)).toEqual(
      getTimerPresentation({ ...paused, playing: true })
    );
    expect(getTimerPresentation(paused).time).toBe("24:59");
    expect(getTimerPresentation(paused).active).toBe(true);
  });
  it("can display an immediate pause before the first second elapses", () => {
    expect(
      getTimerPresentation({ ...initial, phaseStarted: true })
    ).toEqual({ active: true, time: "25:00", progress: 0 });
  });
  it("returns to idle for a reset or a fresh paused phase", () => {
    expect(getTimerPresentation(initial).active).toBe(false);
    expect(
      getTimerPresentation({ ...initial, duration: 300, count: 300 })
    ).toEqual({ active: false, time: "05:00", progress: 0 });
  });
  it("clamps end-of-phase time and progress, and handles zero duration", () => {
    expect(getTimerPresentation({ ...initial, count: -1 })).toEqual({
      active: false,
      time: "00:00",
      progress: 1,
    });
    expect(
      getTimerPresentation({ ...initial, count: 1600 }).progress
    ).toBe(0);
    expect(
      getTimerPresentation({ ...initial, duration: 0 }).progress
    ).toBe(0);
    expect(getTimerPresentation({ ...initial, count: 59.2 }).time).toBe(
      "01:00"
    );
  });
});
