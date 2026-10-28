import { BrowserWindow, Display, Rectangle } from "electron";
import { clampBounds, createWindowSurfaces } from "../windowSurfaces";

const primary = {
  bounds: { x: 0, y: 0, width: 1512, height: 982 },
  workArea: { x: 0, y: 37, width: 1512, height: 920 },
} as Display;
const secondary = {
  bounds: { x: -1920, y: 0, width: 1920, height: 1080 },
  workArea: { x: -1920, y: 24, width: 1920, height: 1030 },
} as Display;

function setup(initiallyHidden = false, initialBounds?: Rectangle) {
  let bounds = { x: 100, y: 100, width: 1200, height: 760 };
  let visible = true;
  let focused = true;
  let fullscreen = false;
  let maximized = false;
  let minimized = false;
  let secondaryPresent = true;
  let devToolsOpened = false;
  let blurDuringHide = false;
  const win = {
    isDestroyed: () => false,
    webContents: {
      isDevToolsOpened: () => devToolsOpened,
    },
    isVisible: () => visible,
    isFocused: () => focused,
    isFullScreen: () => fullscreen,
    isMinimized: () => minimized,
    isMaximized: () => maximized,
    restore: jest.fn(() => {
      minimized = false;
    }),
    maximize: jest.fn(() => {
      maximized = true;
    }),
    unmaximize: jest.fn(() => {
      maximized = false;
    }),
    getBounds: () => bounds,
    getNormalBounds: () => bounds,
    setBounds: jest.fn((next: Rectangle) => {
      bounds = next;
    }),
    hide: jest.fn(() => {
      if (blurDuringHide) controller.blur();
      visible = false;
      focused = false;
    }),
    setAlwaysOnTop: jest.fn(),
    setMinimumSize: jest.fn(),
    setResizable: jest.fn(),
    setMaximizable: jest.fn(),
    setWindowButtonVisibility: jest.fn(),
  };
  const show = jest.fn(() => {
    visible = true;
    focused = true;
  });
  const publish = jest.fn();
  const saveBounds = jest.fn();
  const controller = createWindowSurfaces({
    window: () => (win as unknown) as BrowserWindow,
    screen: {
      getPrimaryDisplay: () => primary,
      getDisplayMatching: (rect) =>
        rect.x < 0 && secondaryPresent ? secondary : primary,
    },
    compactHeight: () => 420,
    fullscreen: () => fullscreen,
    show,
    publish,
    layoutChanged: jest.fn(),
    saveBounds,
    initialBounds,
    initiallyHidden,
  });
  const ack = () => controller.ready(controller.getState().revision);
  return {
    controller,
    win,
    show,
    publish,
    saveBounds,
    ack,
    enableNativeHideBlur: () => {
      blurDuringHide = true;
    },
    blur: () => {
      focused = false;
      controller.blur();
    },
    fullscreen: () => {
      fullscreen = true;
    },
    minimize: () => {
      minimized = true;
    },
    maximize: () => {
      maximized = true;
    },
    removeSecondary: () => {
      secondaryPresent = false;
    },
    setDevToolsOpened: (open: boolean) => {
      devToolsOpened = open;
    },
  };
}

describe("macOS window surfaces", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("synchronizes Workspace on startup and waits for the renderer before showing", () => {
    const { controller, publish, show, ack } = setup();
    controller.sync();
    expect(publish).toHaveBeenCalledWith({
      layout: "dashboard",
      pinned: false,
      revision: 0,
    });
    expect(show).not.toHaveBeenCalled();
    ack();
    expect(show).toHaveBeenCalledTimes(1);
  });

  it("switches native traffic lights with the surface and restores them on expansion", () => {
    const { controller, win, ack } = setup();
    controller.sync();
    expect(win.setWindowButtonVisibility).toHaveBeenLastCalledWith(
      true
    );
    controller.open("classic");
    ack();
    expect(win.setWindowButtonVisibility).toHaveBeenLastCalledWith(
      false
    );
    controller.open("dashboard");
    ack();
    expect(win.setWindowButtonVisibility).toHaveBeenLastCalledWith(
      true
    );
  });

  it("keeps traffic lights hidden when recreating a pinned HUD or entering a fullscreen break", () => {
    const { controller, win, ack, fullscreen } = setup();
    controller.open("classic");
    ack();
    controller.pin(true);
    controller.windowRecreated();
    expect(win.setWindowButtonVisibility).toHaveBeenLastCalledWith(
      false
    );
    expect(controller.getState().pinned).toBe(true);
    controller.open("dashboard");
    ack();
    fullscreen();
    controller.fullscreenChanged();
    expect(win.setWindowButtonVisibility).toHaveBeenLastCalledWith(
      false
    );
  });

  it("ignores Escape while pinned, then dismisses after unpinning", () => {
    const { controller, win, ack, blur } = setup();
    controller.open("classic");
    ack();
    controller.pin(true);
    win.hide.mockClear();
    blur();
    controller.dismiss("escape");
    jest.advanceTimersByTime(200);
    expect(win.hide).not.toHaveBeenCalled();
    expect(controller.getState().pinned).toBe(true);
    controller.pin(false);
    controller.dismiss("escape");
    expect(win.hide).toHaveBeenCalledTimes(1);
  });

  it("reopens on the next tray click after native hide emits a blur", () => {
    const {
      controller,
      win,
      ack,
      show,
      enableNativeHideBlur,
    } = setup();
    controller.open("classic");
    ack();
    enableNativeHideBlur();
    show.mockClear();
    controller.dismiss("escape");
    expect(win.isVisible()).toBe(false);
    controller.toggle("tray");
    ack();
    expect(show).toHaveBeenCalledTimes(1);
    expect(win.isVisible()).toBe(true);
  });

  it("keeps login startup hidden until an explicit open request", () => {
    const { controller, show, ack } = setup(true);
    controller.sync();
    ack();
    expect(show).not.toHaveBeenCalled();
    controller.open("dashboard");
    ack();
    expect(show).toHaveBeenCalledTimes(1);
  });

  it("opens from the clicked tray on a display with a negative origin", () => {
    const { controller, win, show, ack } = setup();
    ack();
    show.mockClear();
    controller.toggle("tray", { x: -35, y: 0, width: 25, height: 24 });
    expect(controller.getState().layout).toBe("classic");
    expect(win.setBounds).toHaveBeenLastCalledWith({
      x: -280,
      y: 32,
      width: 280,
      height: 420,
    });
    expect(win.setResizable).toHaveBeenLastCalledWith(false);
    expect(show).not.toHaveBeenCalled();
    ack();
    expect(show).toHaveBeenCalledTimes(1);
  });

  it("places notch HUD below the expanded island on the primary display", () => {
    const { controller, win } = setup();
    controller.toggle("notch");
    expect(win.setBounds).toHaveBeenLastCalledWith({
      x: 616,
      y: 92,
      width: 280,
      height: 420,
    });
  });

  it("ignores stale renderer acknowledgements during rapid surface changes", () => {
    const { controller, show, ack } = setup();
    controller.open("classic");
    const previous = controller.getState().revision;
    controller.open("dashboard");
    controller.ready(previous);
    expect(show).not.toHaveBeenCalled();
    ack();
    expect(show).toHaveBeenCalledTimes(1);
  });

  it("restores Workspace geometry and clears temporary HUD pinning", () => {
    const { controller, win, saveBounds, ack } = setup();
    controller.open("classic");
    ack();
    controller.pin(true);
    expect(win.setAlwaysOnTop).toHaveBeenLastCalledWith(
      true,
      "floating"
    );
    controller.open("dashboard");
    expect(saveBounds).toHaveBeenCalledWith({
      x: 100,
      y: 100,
      width: 1200,
      height: 760,
    });
    expect(win.setBounds).toHaveBeenLastCalledWith({
      x: 100,
      y: 100,
      width: 1200,
      height: 760,
    });
    expect(win.setResizable).toHaveBeenLastCalledWith(true);
    expect(win.setAlwaysOnTop).toHaveBeenLastCalledWith(
      false,
      "floating"
    );
    expect(controller.getState().pinned).toBe(false);
  });

  it("restores a minimized Workspace without resizing it unnecessarily", () => {
    const { controller, win, ack, minimize } = setup();
    ack();
    minimize();
    controller.open("dashboard");
    ack();
    expect(win.restore).toHaveBeenCalledTimes(1);
    expect(win.setBounds).not.toHaveBeenCalled();
  });

  it("restores a maximized Workspace after using HUD", () => {
    const { controller, win, ack, maximize } = setup();
    maximize();
    controller.open("classic");
    ack();
    expect(win.unmaximize).toHaveBeenCalledTimes(1);
    controller.open("dashboard");
    expect(win.maximize).toHaveBeenCalledTimes(1);
  });

  it("auto-hides on blur while leaving Workspace blur alone", () => {
    const { controller, win, ack, blur } = setup();
    ack();
    blur();
    jest.advanceTimersByTime(200);
    expect(win.hide).not.toHaveBeenCalled();
    controller.open("classic");
    ack();
    win.hide.mockClear();
    blur();
    jest.advanceTimersByTime(149);
    expect(win.hide).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(win.hide).toHaveBeenCalledTimes(1);
  });

  it("does not reopen HUD when a surface click first triggers blur", () => {
    const { controller, win, show, ack, blur } = setup();
    controller.open("classic");
    ack();
    show.mockClear();
    win.hide.mockClear();
    blur();
    controller.toggle("tray");
    jest.advanceTimersByTime(200);
    ack();
    expect(win.hide).toHaveBeenCalledTimes(1);
    expect(show).not.toHaveBeenCalled();
  });

  it("reopens from a surface after outside-click dismissal has completed", () => {
    const { controller, show, ack, blur } = setup();
    controller.open("classic");
    ack();
    show.mockClear();
    blur();
    jest.advanceTimersByTime(200);
    controller.toggle("tray");
    ack();
    expect(show).toHaveBeenCalledTimes(1);
  });

  it("moves HUD onto a surviving display after disconnection", () => {
    const { controller, win, ack, removeSecondary } = setup();
    controller.open("classic", "tray", {
      x: -1900,
      y: 0,
      width: 25,
      height: 24,
    });
    ack();
    removeSecondary();
    controller.displayChanged();
    expect(win.setBounds).toHaveBeenLastCalledWith({
      x: 0,
      y: 37,
      width: 280,
      height: 420,
    });
  });

  it("keeps pinned HUD visible on blur, but permits explicit dismissal", () => {
    const { controller, win, ack, blur } = setup();
    controller.open("classic");
    ack();
    controller.pin(true);
    win.hide.mockClear();
    blur();
    jest.advanceTimersByTime(200);
    expect(win.hide).not.toHaveBeenCalled();
    controller.dismiss();
    expect(win.hide).toHaveBeenCalledTimes(1);
    expect(controller.getState().pinned).toBe(false);
  });

  it("keeps HUD visible on blur when developer tools are open", () => {
    const { controller, win, ack, blur, setDevToolsOpened } = setup();
    controller.open("classic");
    ack();
    setDevToolsOpened(true);
    win.hide.mockClear();
    blur();
    jest.advanceTimersByTime(200);
    expect(win.hide).not.toHaveBeenCalled();
  });

  it("dismisses pinned HUD when a tray click blurs it first", () => {
    const { controller, win, ack, blur } = setup();
    controller.open("classic");
    ack();
    controller.pin(true);
    win.hide.mockClear();
    blur();
    controller.toggle("tray");
    expect(win.hide).toHaveBeenCalledTimes(1);
    expect(controller.getState().pinned).toBe(false);
  });

  it("retains pinning when refocusing an already-unfocused HUD", () => {
    const { controller, show, ack, blur } = setup();
    controller.open("classic");
    ack();
    controller.pin(true);
    blur();
    jest.advanceTimersByTime(200);
    show.mockClear();
    controller.toggle("tray");
    ack();
    expect(show).toHaveBeenCalledTimes(1);
    expect(controller.getState().pinned).toBe(true);
  });

  it("restores the ordinary always-on-top preference after HUD dismissal", () => {
    const { controller, win, ack } = setup();
    controller.setAlwaysOnTop(true);
    controller.open("classic");
    ack();
    controller.pin(true);
    controller.dismiss();
    expect(win.setAlwaysOnTop).toHaveBeenLastCalledWith(
      true,
      "floating"
    );
  });

  it("suspends dismissal while a native dialog is open", () => {
    const { controller, win, ack, blur } = setup();
    controller.open("classic");
    ack();
    const resume = controller.suspendDismissal();
    win.hide.mockClear();
    blur();
    controller.dismiss();
    jest.advanceTimersByTime(200);
    expect(win.hide).not.toHaveBeenCalled();
    resume();
    controller.dismiss();
    expect(win.hide).toHaveBeenCalledTimes(1);
  });

  it("does not switch or dismiss during a mandatory fullscreen break", () => {
    const { controller, win, ack, fullscreen, blur } = setup();
    controller.open("classic");
    ack();
    win.hide.mockClear();
    win.setBounds.mockClear();
    blur();
    fullscreen();
    controller.fullscreenChanged();
    controller.open("dashboard");
    controller.dismiss();
    controller.pin(true);
    jest.advanceTimersByTime(200);
    expect(win.hide).not.toHaveBeenCalled();
    expect(win.setBounds).not.toHaveBeenCalled();
    expect(controller.getState().layout).toBe("classic");
  });

  it("cleans pending blur callbacks when destroyed", () => {
    const { controller, win, ack, blur } = setup();
    controller.open("classic");
    ack();
    win.hide.mockClear();
    blur();
    controller.destroy();
    jest.advanceTimersByTime(200);
    expect(win.hide).not.toHaveBeenCalled();
  });

  it("re-acknowledges a recreated window before showing", () => {
    const { controller, show, ack } = setup();
    ack();
    show.mockClear();
    controller.windowRecreated();
    controller.sync();
    ack();
    expect(show).toHaveBeenCalledTimes(1);
  });

  it("clamps oversized and offscreen bounds to the surviving display", () => {
    expect(
      clampBounds(
        { x: 9000, y: -9000, width: 2000, height: 2000 },
        primary.workArea
      )
    ).toEqual(primary.workArea);
  });
});
