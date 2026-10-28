import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import HardwareSection from "./HardwareSection";
import { detectOS } from "utils";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock("utils", () => ({ detectOS: jest.fn(() => "MacOS") }));
jest.mock("utils/isMacElectron", () => ({ isMacElectron: () => true }));
jest.mock("hooks/storeHooks", () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: (select: Function) =>
    select({
      settings: {
        trayIconStyle: "classic",
        showNotchIsland: true,
        showTimerInTrayBar: true,
      },
    }),
}));
jest.mock("store", () => ({}));
jest.mock("components", () => ({
  SegmentedControl: () => null,
  TRAY_ICON_RENDERERS: {},
}));
jest.mock("./SettingSection", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <section>{children}</section>
  ),
}));
// Keep the real toggle and helper text; isolate unrelated Settings search.
jest.mock("./SettingRow", () => {
  const Toggler = require("../../components/Toggler").default;
  return {
    SettingToggle: Toggler,
    SettingRow: () => null,
    rowSearchText: () => [],
  };
});

it.each(["MacOS", "Windows"])(
  "shows the deduplication note only on macOS (%s)",
  (os) => {
    (detectOS as jest.Mock).mockReturnValue(os);
    const host = document.createElement("div");
    act(() => {
      ReactDOM.render(<HardwareSection />, host);
    });
    expect(
      host.textContent?.includes("settings.menuBarCountdownDedupNote")
    ).toBe(os === "MacOS");
    if (os === "MacOS")
      expect(
        host.querySelector(
          'label[for="show-timer-in-tray-bar"] small:last-child'
        )?.textContent
      ).toBe("settings.menuBarCountdownDedupNote");
    act(() => {
      ReactDOM.unmountComponentAtNode(host);
    });
  }
);
