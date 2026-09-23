import { CounterContext } from "contexts";
import { useEffect, useContext } from "react";
import { useAppSelector } from "./storeHooks";
import { TRAY_ICON_RENDERERS } from "components";
import { TrayIconStyle } from "store/settings/types";
import { detectOS, encodeSvg } from "utils";

export type TrayIconUpdate = {
  dataUrl: string | null;
  isTemplate: boolean;
};

export const useTrayIconUpdates = (
  onNewIcon: (icon: TrayIconUpdate) => void
) => {
  const timer = useAppSelector((state) => state.timer);
  const trayIconStyle = useAppSelector(
    (state) => state.settings.trayIconStyle
  );

  const { count, duration, timerType } = useContext(CounterContext);
  const dashOffset = (duration - count) * (24 / duration);

  useEffect(() => {
    if (!timer.playing) return;

    // Text-only relies on the OS rendering a title next to a removed
    // icon, which only macOS reliably supports. Elsewhere, fall back to
    // the Minimal icon so the tray never goes blank.
    const effectiveStyle =
      trayIconStyle === TrayIconStyle.TEXT_ONLY &&
      detectOS() !== "MacOS"
        ? TrayIconStyle.MINIMAL
        : trayIconStyle;

    const Renderer = TRAY_ICON_RENDERERS[effectiveStyle];
    const isTemplate = effectiveStyle === TrayIconStyle.MINIMAL;

    if (!Renderer) {
      // Text-only style on macOS: no icon graphic at all.
      onNewIcon({ dataUrl: null, isTemplate: false });
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 16;
    canvas.height = 16;

    let svgXML = encodeSvg(
      <Renderer timerType={timerType} dashOffset={dashOffset} />
    );

    const img = new Image();
    img.src = svgXML;

    img.onload = function () {
      ctx?.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");

      onNewIcon({ dataUrl, isTemplate });
    };
  }, [onNewIcon, timer.playing, timerType, dashOffset, trayIconStyle]);
};
