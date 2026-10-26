import { BrowserWindow, screen } from "electron";
import { createNotchIsland, NotchIslandState } from "../notchIsland";

jest.mock("electron", () => ({
  BrowserWindow: jest.fn(),
  screen: {
    getPrimaryDisplay: jest.fn(() => ({
      bounds: { x: 0, y: 0, width: 1512, height: 982 },
      workArea: { x: 0, y: 37, width: 1512, height: 920 },
    })),
    on: jest.fn(),
    off: jest.fn(),
  },
}));

const running: NotchIslandState = {
  enabled: true,
  active: true,
  playing: true,
  timerType: "STAY_FOCUS",
  time: "24:59",
  progress: 0.1,
  round: 1,
  sessionRounds: 4,
};

function setup() {
  let loaded = () => {};
  const win = {
    isDestroyed: () => false,
    isVisible: () => false,
    setBounds: jest.fn(),
    setAlwaysOnTop: jest.fn(),
    setVisibleOnAllWorkspaces: jest.fn(),
    setIgnoreMouseEvents: jest.fn(),
    showInactive: jest.fn(),
    hide: jest.fn(),
    destroy: jest.fn(),
    on: jest.fn(),
    loadURL: jest.fn(),
    webContents: {
      send: jest.fn(),
      once: jest.fn((_event, callback) => {
        loaded = callback;
      }),
    },
  };
  ((BrowserWindow as unknown) as jest.Mock).mockImplementation(
    () => win
  );
  const onClick = jest.fn();
  const overlay = createNotchIsland({
    preload: "preload.js",
    pageUrl: "notch.html",
    onClick,
  });
  return { overlay, win, onClick, loaded: () => loaded() };
}

describe("notch timer visibility", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });
  afterEach(() => jest.useRealTimers());

  it("does not create an overlay for idle or disabled timers", () => {
    const { overlay } = setup();
    overlay.update({ ...running, active: false, playing: false });
    overlay.update({ ...running, enabled: false });
    expect(BrowserWindow).not.toHaveBeenCalled();
  });

  it("keeps paused timers visible and preserves countdown and progress", () => {
    const { overlay, win, loaded } = setup();
    overlay.update(running);
    loaded();
    overlay.update({ ...running, playing: false });
    jest.advanceTimersByTime(500);
    expect(win.hide).not.toHaveBeenCalled();
    expect(win.webContents.send).toHaveBeenLastCalledWith(
      "NOTCH_ISLAND_STATE",
      expect.objectContaining({
        visible: true,
        playing: false,
        time: "24:59",
        progress: 0.1,
      })
    );
    overlay.destroy();
  });

  it("hides after disabling and cancels a pending hide on resume", () => {
    const { overlay, win, loaded } = setup();
    overlay.update(running);
    loaded();
    overlay.update({ ...running, enabled: false });
    jest.advanceTimersByTime(449);
    expect(win.hide).not.toHaveBeenCalled();
    overlay.update(running);
    jest.advanceTimersByTime(500);
    expect(win.hide).not.toHaveBeenCalled();
    overlay.update({ ...running, active: false, playing: false });
    jest.advanceTimersByTime(450);
    expect(win.hide).toHaveBeenCalledTimes(1);
    overlay.destroy();
  });

  it("recognizes its sender and removes display listeners when destroyed", () => {
    const { overlay, win, onClick } = setup();
    overlay.update(running);
    expect(
      overlay.owns((win.webContents as unknown) as Electron.WebContents)
    ).toBe(true);
    expect(overlay.owns({} as Electron.WebContents)).toBe(false);
    overlay.click();
    expect(onClick).toHaveBeenCalledTimes(1);
    overlay.destroy();
    expect(screen.off).toHaveBeenCalledTimes(3);
    expect(win.destroy).toHaveBeenCalledTimes(1);
  });
});
