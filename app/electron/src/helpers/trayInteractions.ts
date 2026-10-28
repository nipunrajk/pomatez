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

/** Cache the renderer title so hiding the island restores it immediately. */
export function createTrayTitleCoordinator(options: {
  tray: () => Pick<Tray, "setTitle"> | null;
  macOS: boolean;
  islandVisible: () => boolean;
}) {
  let title = "";
  let textOnly = false;
  let iconAvailable = true;
  const refresh = () => {
    const iconless = textOnly || !iconAvailable;
    const deduplicate =
      options.macOS && !iconless && options.islandVisible();
    options
      .tray()
      ?.setTitle(
        deduplicate ? "" : title || (iconless ? "Pomatez" : "")
      );
  };
  return {
    refresh,
    setTitle(next: string, nextTextOnly = false) {
      title = next;
      textOnly = nextTextOnly;
      refresh();
    },
    // Icon and title IPCs arrive separately. Keep an icon-less status item
    // clickable even between style updates or with an older renderer.
    setIconAvailable(available: boolean) {
      iconAvailable = available;
      refresh();
    },
  };
}
