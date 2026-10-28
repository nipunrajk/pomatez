import { useEffect } from "react";
import { HUD_DISMISS, WindowSurfaceState } from "@pomatez/shareables";

/** One listener for app-local surface shortcuts; overlays handle Escape first. */
export function useWindowSurfaceKeys(options: {
  enabled: boolean;
  surface: WindowSurfaceState | null;
  shouldFullscreen?: boolean;
  requestLayout: (layout: "classic" | "dashboard") => void;
  send: (channel: string) => void;
}) {
  const {
    enabled,
    surface,
    shouldFullscreen,
    requestLayout,
    send,
  } = options;
  useEffect(() => {
    if (!enabled) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || shouldFullscreen) return;
      if (
        event.metaKey &&
        !event.altKey &&
        !event.shiftKey &&
        event.code === "KeyO"
      ) {
        event.preventDefault();
        requestLayout("dashboard");
      } else if (
        event.metaKey &&
        event.shiftKey &&
        !event.altKey &&
        event.code === "KeyM"
      ) {
        event.preventDefault();
        requestLayout("classic");
      } else if (
        event.key === "Escape" &&
        surface?.layout === "classic" &&
        !surface.pinned
      ) {
        if (
          document.querySelector(
            '[role="dialog"], [role="menu"], [data-hud-escape-boundary]'
          )
        )
          return;
        send(HUD_DISMISS);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, surface, shouldFullscreen, requestLayout, send]);
}
