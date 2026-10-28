import { BrowserWindow, Menu, Tray } from "electron";
import { setFullscreenBreakHandler } from "../fullScreenBreak";
import {
  activateFullScreenShortcuts,
  deactivateFullScreenShortcuts,
} from "../../helpers";

jest.mock("electron", () => ({
  Menu: { buildFromTemplate: jest.fn(() => ({})) },
}));
jest.mock("../../helpers", () => ({
  activateFullScreenShortcuts: jest.fn(),
  deactivateFullScreenShortcuts: jest.fn(),
}));

describe("Fullscreen break window behavior", () => {
  const setup = (isFullscreen = false) => {
    const win = {
      isDestroyed: jest.fn(() => false),
      show: jest.fn(),
      focus: jest.fn(),
      setAlwaysOnTop: jest.fn(),
      setFullScreen: jest.fn(),
      setFullScreenable: jest.fn(),
      setResizable: jest.fn(),
      setVisibleOnAllWorkspaces: jest.fn(),
    };
    const tray = { setToolTip: jest.fn(), setContextMenu: jest.fn() };
    const args = {
      win: (win as unknown) as BrowserWindow,
      tray: (tray as unknown) as Tray,
      contextMenu: {} as Menu,
      trayTooltip: "Restore Pomatez",
      isFullscreen,
    };
    return { win, tray, args };
  };

  beforeEach(() => jest.clearAllMocks());

  it("does not steal focus or change Spaces on startup or ordinary setting updates", () => {
    const { win, tray, args } = setup();
    for (const alwaysOnTop of [false, true, false]) {
      expect(
        setFullscreenBreakHandler(
          { shouldFullscreen: false, alwaysOnTop },
          args
        )
      ).toBe(false);
      expect(win.setAlwaysOnTop).toHaveBeenLastCalledWith(
        alwaysOnTop,
        "floating"
      );
    }
    expect(win.show).not.toHaveBeenCalled();
    expect(win.focus).not.toHaveBeenCalled();
    expect(win.setFullScreen).not.toHaveBeenCalled();
    expect(win.setVisibleOnAllWorkspaces).not.toHaveBeenCalled();
    expect(tray.setContextMenu).not.toHaveBeenCalled();
  });

  it("focuses only when entering a fullscreen break, including after repeated messages", () => {
    const { win, args } = setup();
    const request = { shouldFullscreen: true, alwaysOnTop: true };
    args.isFullscreen = setFullscreenBreakHandler(request, args);
    args.isFullscreen = setFullscreenBreakHandler(request, args);
    expect(args.isFullscreen).toBe(true);
    expect(win.show).toHaveBeenCalledTimes(1);
    expect(win.focus).toHaveBeenCalledTimes(1);
    expect(win.setFullScreen).toHaveBeenCalledTimes(1);
    expect(win.setFullScreen).toHaveBeenCalledWith(true);
    expect(win.setAlwaysOnTop).toHaveBeenLastCalledWith(
      true,
      "screen-saver"
    );
    expect(win.setVisibleOnAllWorkspaces).toHaveBeenCalledWith(true);
    expect(activateFullScreenShortcuts).toHaveBeenCalledTimes(1);
  });

  it("updates the macOS popup menu without attaching it to the tray", () => {
    const { tray, args } = setup();
    const setTrayContextMenu = jest.fn();
    const options = { ...args, setTrayContextMenu };
    options.isFullscreen = setFullscreenBreakHandler(
      { shouldFullscreen: true, alwaysOnTop: false },
      options
    );
    expect(setTrayContextMenu).toHaveBeenCalledTimes(1);
    options.isFullscreen = setFullscreenBreakHandler(
      { shouldFullscreen: false, alwaysOnTop: false },
      options
    );
    expect(setTrayContextMenu).toHaveBeenLastCalledWith(
      args.contextMenu
    );
    expect(tray.setContextMenu).not.toHaveBeenCalled();
  });

  it.each([false, true])(
    "restores ordinary window priority on exit with pinning %s",
    (alwaysOnTop) => {
      const { win, tray, args } = setup(true);
      args.isFullscreen = setFullscreenBreakHandler(
        { shouldFullscreen: false, alwaysOnTop },
        args
      );
      expect(args.isFullscreen).toBe(false);
      expect(win.setFullScreen).toHaveBeenCalledWith(false);
      expect(win.setAlwaysOnTop).toHaveBeenCalledWith(
        alwaysOnTop,
        "floating"
      );
      expect(win.setVisibleOnAllWorkspaces).toHaveBeenCalledWith(false);
      expect(win.show).not.toHaveBeenCalled();
      expect(win.focus).not.toHaveBeenCalled();
      expect(deactivateFullScreenShortcuts).toHaveBeenCalledTimes(1);
      expect(tray.setToolTip).toHaveBeenCalledWith(args.trayTooltip);
      expect(tray.setContextMenu).toHaveBeenCalledWith(
        args.contextMenu
      );
    }
  );
});
