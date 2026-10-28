import { EventEmitter } from "events";
import { Menu, Tray } from "electron";
import {
  bindTrayInteractions,
  createTrayTitleCoordinator,
} from "../trayInteractions";

function setup(macOS = true) {
  const tray = Object.assign(new EventEmitter(), {
    setContextMenu: jest.fn(),
    popUpContextMenu: jest.fn(),
  });
  const originalMenu = new EventEmitter();
  let menu = originalMenu;
  const toggleHud = jest.fn();
  const restore = jest.fn();
  const resume = jest.fn();
  const menuClosed = jest.fn();
  const suspendDismissal = jest.fn(() => resume);
  bindTrayInteractions((tray as unknown) as Tray, {
    macOS,
    menu: () => (menu as unknown) as Menu,
    toggleHud,
    restore,
    suspendDismissal,
    menuClosed,
  });
  const bounds = { x: 1300, y: 0, width: 45, height: 24 };
  return {
    tray,
    originalMenu,
    toggleHud,
    restore,
    resume,
    suspendDismissal,
    menuClosed,
    bounds,
    changeMenu: (next: EventEmitter) => {
      menu = next;
    },
  };
}

describe("status-item gestures", () => {
  it("uses macOS left click exclusively for HUD toggling", () => {
    const { tray, toggleHud, restore, bounds } = setup();
    tray.emit("click", { ctrlKey: false }, bounds);
    expect(toggleHud).toHaveBeenCalledWith(bounds);
    expect(restore).not.toHaveBeenCalled();
    expect(tray.setContextMenu).not.toHaveBeenCalled();
    expect(tray.popUpContextMenu).not.toHaveBeenCalled();
  });

  it("uses right click for a native popup and suspends blur dismissal while it is open", () => {
    const {
      tray,
      originalMenu,
      toggleHud,
      resume,
      suspendDismissal,
      menuClosed,
    } = setup();
    tray.emit("right-click");
    expect(tray.popUpContextMenu).toHaveBeenCalledWith(originalMenu);
    expect(suspendDismissal).toHaveBeenCalledTimes(1);
    expect(toggleHud).not.toHaveBeenCalled();
    expect(resume).not.toHaveBeenCalled();
    originalMenu.emit("menu-will-close");
    expect(resume).toHaveBeenCalledTimes(1);
    expect(menuClosed).toHaveBeenCalledTimes(1);
  });

  it("handles Ctrl-click without toggling HUD or opening a duplicate menu", () => {
    const { tray, originalMenu, toggleHud, bounds } = setup();
    tray.emit("click", { ctrlKey: true }, bounds);
    tray.emit("right-click");
    expect(tray.popUpContextMenu).toHaveBeenCalledTimes(1);
    expect(toggleHud).not.toHaveBeenCalled();
    originalMenu.emit("menu-will-close");
    tray.emit("right-click");
    expect(tray.popUpContextMenu).toHaveBeenCalledTimes(2);
  });

  it("uses the current fullscreen-break menu rather than a stale menu", () => {
    const { tray, originalMenu, changeMenu } = setup();
    const breakMenu = new EventEmitter();
    changeMenu(breakMenu);
    tray.emit("right-click");
    expect(tray.popUpContextMenu).toHaveBeenLastCalledWith(breakMenu);
    breakMenu.emit("menu-will-close");
    changeMenu(originalMenu);
    tray.emit("right-click");
    expect(tray.popUpContextMenu).toHaveBeenLastCalledWith(
      originalMenu
    );
  });

  it("retains standard menu binding and restoration outside macOS", () => {
    const { tray, originalMenu, restore, toggleHud, bounds } = setup(
      false
    );
    expect(tray.setContextMenu).toHaveBeenCalledWith(originalMenu);
    tray.emit("click", { ctrlKey: false }, bounds);
    expect(restore).toHaveBeenCalledTimes(1);
    expect(toggleHud).not.toHaveBeenCalled();
    expect(tray.listenerCount("right-click")).toBe(0);
  });
});

describe("tray countdown deduplication", () => {
  function titleSetup(macOS = true) {
    const tray = { setTitle: jest.fn() };
    let visible = false;
    const manager = createTrayTitleCoordinator({
      tray: () => tray,
      macOS,
      islandVisible: () => visible,
    });
    return {
      tray,
      manager,
      visibility(next: boolean) {
        visible = next;
        manager.refresh();
      },
    };
  }
  it("suppresses only while visible and restores the latest cached countdown immediately", () => {
    const { tray, manager, visibility } = titleSetup();
    manager.setTitle("24:59");
    expect(tray.setTitle).toHaveBeenLastCalledWith("24:59");
    visibility(true);
    expect(tray.setTitle).toHaveBeenLastCalledWith("");
    manager.setTitle("24:58");
    expect(tray.setTitle).toHaveBeenLastCalledWith("");
    visibility(false);
    expect(tray.setTitle).toHaveBeenLastCalledWith("24:58");
  });
  it("never suppresses Text Only and supports switching back to icon styles", () => {
    const { tray, manager, visibility } = titleSetup();
    visibility(true);
    manager.setTitle("24:59", true);
    expect(tray.setTitle).toHaveBeenLastCalledWith("24:59");
    manager.setTitle("24:59", false);
    expect(tray.setTitle).toHaveBeenLastCalledWith("");
  });
  it("keeps an icon-less tray clickable between separate icon and title updates", () => {
    const { tray, manager, visibility } = titleSetup();
    visibility(true);
    manager.setIconAvailable(false);
    expect(tray.setTitle).toHaveBeenLastCalledWith("Pomatez");
    manager.setTitle("24:59"); // Legacy string payload cannot defeat the empty-icon guard.
    expect(tray.setTitle).toHaveBeenLastCalledWith("24:59");
    manager.setIconAvailable(true);
    expect(tray.setTitle).toHaveBeenLastCalledWith("");
  });
  it("retains configured idle/disabled titles and does not deduplicate outside macOS", () => {
    const { tray, manager, visibility } = titleSetup(false);
    visibility(true);
    manager.setTitle("25:00");
    expect(tray.setTitle).toHaveBeenLastCalledWith("25:00");
    manager.setTitle("");
    expect(tray.setTitle).toHaveBeenLastCalledWith("");
  });
});
