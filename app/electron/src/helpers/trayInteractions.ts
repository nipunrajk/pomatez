import { Menu, Rectangle, Tray } from "electron";

/** macOS status-item activation and secondary menus must remain independent. */
export function bindTrayInteractions(
  tray: Tray,
  options: {
    macOS: boolean;
    menu: () => Menu;
    toggleHud: (bounds: Rectangle) => void;
    restore: () => void;
    suspendDismissal: () => (() => void) | undefined;
    menuClosed: () => void;
  }
) {
  if (!options.macOS) {
    tray.setContextMenu(options.menu());
    tray.on("click", options.restore);
    return;
  }

  let menuOpen = false;
  const showMenu = () => {
    // Ctrl-click can deliver both click and right-click for one gesture.
    if (menuOpen) return;
    menuOpen = true;
    const menu = options.menu();
    const resume = options.suspendDismissal();
    const close = () => {
      menuOpen = false;
      resume?.();
      options.menuClosed();
    };
    menu.once("menu-will-close", close);
    try {
      tray.popUpContextMenu(menu);
    } catch (error) {
      menu.removeListener("menu-will-close", close);
      close();
      throw error;
    }
  };
  tray.on("click", (event, bounds) => {
    if (event.ctrlKey) showMenu();
    else options.toggleHud(bounds);
  });
  tray.on("right-click", showMenu);
}
