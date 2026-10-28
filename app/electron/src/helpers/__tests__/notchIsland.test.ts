import { BrowserWindow, screen } from "electron";
import { createNotchIsland, NotchIslandState } from "../notchIsland";
import { createTrayTitleCoordinator } from "../trayInteractions";

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
  let visible = false;
  const win = {
    isDestroyed: () => false,
    isVisible: () => visible,
    setBounds: jest.fn(),
    setAlwaysOnTop: jest.fn(),
    setVisibleOnAllWorkspaces: jest.fn(),
    setIgnoreMouseEvents: jest.fn(),
    showInactive: jest.fn(() => {
      visible = true;
    }),
    hide: jest.fn(() => {
      visible = false;
    }),
    destroy: jest.fn(),
    on: jest.fn(),
    loadURL: jest.fn(),
    webContents: {
      send: jest.fn(),
      on: jest.fn(),
      once: jest.fn((_event, callback) => {
        loaded = callback;
      }),
    },
  };
  ((BrowserWindow as unknown) as jest.Mock).mockImplementation(
    () => win
  );
  const onClick = jest.fn();
  const onVisibilityChange = jest.fn();
  const overlay = createNotchIsland({
    preload: "preload.js",
    pageUrl: "notch.html",
    onClick,
    onVisibilityChange,
  });
  return {
    overlay,
    win,
    onClick,
    onVisibilityChange,
    loaded: () => loaded(),
  };
}

const originalPlatform = process.platform;

describe("notch timer visibility", () => {
  afterAll(() =>
    Object.defineProperty(process, "platform", {
      value: originalPlatform,
    })
  );
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    Object.defineProperty(process, "platform", { value: "darwin" });
    (screen.getPrimaryDisplay as jest.Mock).mockReturnValue({
      bounds: { x: 0, y: 0, width: 1512, height: 982 },
      workArea: { x: 0, y: 37, width: 1512, height: 920 },
    });
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
  it("only deduplicates after the overlay page is ready, including while paused", () => {
    const { overlay, loaded, onVisibilityChange } = setup();
    expect(overlay.isVisible()).toBe(false);
    overlay.update(running);
    expect(overlay.isVisible()).toBe(false);
    loaded();
    expect(overlay.isVisible()).toBe(true);
    expect(onVisibilityChange).toHaveBeenLastCalledWith(true);
    overlay.update({ ...running, playing: false });
    expect(overlay.isVisible()).toBe(true);
    expect(onVisibilityChange).toHaveBeenCalledTimes(1);
    overlay.update({ ...running, enabled: false });
    expect(overlay.isVisible()).toBe(false);
    expect(onVisibilityChange).toHaveBeenLastCalledWith(false);
    overlay.destroy();
  });

  it("restores visibility on display hotplug and hides on a non-notched primary", () => {
    const { overlay, loaded, onVisibilityChange, win } = setup();
    const flatDisplay = {
      bounds: { x: 0, y: 0, width: 1920, height: 1080 },
      workArea: { x: 0, y: 24, width: 1920, height: 1056 },
    };
    const notchedDisplay = screen.getPrimaryDisplay();
    (screen.getPrimaryDisplay as jest.Mock).mockReturnValue(
      flatDisplay
    );
    overlay.update(running);
    expect(BrowserWindow).not.toHaveBeenCalled();
    const displayChanged = (screen.on as jest.Mock).mock.calls[0][1];
    (screen.getPrimaryDisplay as jest.Mock).mockReturnValue(
      notchedDisplay
    );
    displayChanged();
    loaded();
    expect(overlay.isVisible()).toBe(true);
    (screen.getPrimaryDisplay as jest.Mock).mockReturnValue(
      flatDisplay
    );
    displayChanged();
    expect(overlay.isVisible()).toBe(false);
    expect(onVisibilityChange).toHaveBeenLastCalledWith(false);
    expect(win.webContents.send).toHaveBeenLastCalledWith(
      "NOTCH_ISLAND_STATE",
      expect.objectContaining({ visible: false })
    );
    jest.advanceTimersByTime(450);
    expect(win.hide).toHaveBeenCalledTimes(1);
    overlay.destroy();
  });

  it("restores the title if the overlay renderer crashes or window closes", () => {
    const { overlay, loaded, win, onVisibilityChange } = setup();
    overlay.update(running);
    loaded();
    const crash = win.webContents.on.mock.calls.find(
      ([event]) => event === "render-process-gone"
    )![1];
    crash();
    expect(overlay.isVisible()).toBe(false);
    expect(onVisibilityChange).toHaveBeenLastCalledWith(false);
    loaded();
    expect(overlay.isVisible()).toBe(true);
    const close = win.on.mock.calls.find(
      ([event]) => event === "closed"
    )![1];
    close();
    expect(overlay.isVisible()).toBe(false);
    expect(onVisibilityChange).toHaveBeenLastCalledWith(false);
    overlay.destroy();
  });
  it("coordinates visibility callbacks with the cached tray title across pause and reset", () => {
    const { overlay, loaded, onVisibilityChange } = setup();
    const tray = { setTitle: jest.fn() };
    const titles = createTrayTitleCoordinator({
      tray: () => tray,
      macOS: true,
      islandVisible: overlay.isVisible,
    });
    onVisibilityChange.mockImplementation(() => titles.refresh());
    titles.setTitle("24:59");
    overlay.update(running);
    expect(tray.setTitle).toHaveBeenLastCalledWith("24:59");
    loaded();
    expect(tray.setTitle).toHaveBeenLastCalledWith("");
    overlay.update({ ...running, playing: false });
    titles.setTitle("24:58");
    expect(tray.setTitle).toHaveBeenLastCalledWith("");
    overlay.update({ ...running, active: false, playing: false });
    expect(tray.setTitle).toHaveBeenLastCalledWith("24:58");
    titles.setTitle("");
    expect(tray.setTitle).toHaveBeenLastCalledWith("");
    overlay.destroy();
  });
});
