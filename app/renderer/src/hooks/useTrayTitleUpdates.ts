import { useEffect } from "react";
import { TRAY_TITLE_UPDATE } from "@pomatez/shareables";
import { TrayIconStyle } from "store/settings/types";

export function useTrayTitleUpdates({
  send,
  style,
  showTimer,
  active,
  time,
}: {
  send: (
    channel: string,
    payload: { title: string; textOnly: boolean }
  ) => void;
  style: TrayIconStyle;
  showTimer: boolean;
  active: boolean;
  time: string;
}) {
  useEffect(() => {
    const textOnly = style === TrayIconStyle.TEXT_ONLY;
    const textStyle = textOnly || style === TrayIconStyle.ICON_TEXT;
    send(TRAY_TITLE_UPDATE, {
      title:
        (showTimer || textStyle) && (active || textStyle) ? time : "",
      textOnly,
    });
  }, [send, style, showTimer, active, time]);
}
