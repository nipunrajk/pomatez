import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import { useTrayIconUpdates } from "./useTrayIconUpdates";
import { TrayIconStyle } from "store/settings/types";

let mockStyle = TrayIconStyle.TEXT_ONLY;
const update = jest.fn();
let host: HTMLDivElement;
const images: { src: string; onload: (() => void) | null }[] = [];
jest.mock("contexts", () => ({
  CounterContext: require("react").createContext({
    count: 30,
    duration: 60,
    timerType: "STAY_FOCUS",
  }),
}));
jest.mock("./storeHooks", () => ({
  useAppSelector: (select: Function) =>
    select({
      timer: { playing: false },
      settings: { trayIconStyle: mockStyle },
    }),
}));
jest.mock("components", () => ({
  TRAY_ICON_RENDERERS: { minimal: () => null },
}));
jest.mock("utils", () => ({
  detectOS: () => "MacOS",
  encodeSvg: () => "data:image/svg+xml,test",
}));
const Harness = () => {
  useTrayIconUpdates(update);
  return null;
};
const render = () => {
  act(() => {
    ReactDOM.render(<Harness />, host);
  });
};
beforeEach(() => {
  host = document.createElement("div");
  mockStyle = TrayIconStyle.TEXT_ONLY;
  update.mockClear();
  images.length = 0;
  jest.spyOn(window, "Image").mockImplementation(() => {
    const img = { src: "", onload: null };
    images.push(img);
    return (img as unknown) as HTMLImageElement;
  });
  jest
    .spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockReturnValue(({
      drawImage: jest.fn(),
    } as unknown) as CanvasRenderingContext2D);
  jest
    .spyOn(HTMLCanvasElement.prototype, "toDataURL")
    .mockReturnValue("data:image/png,test");
});
afterEach(() => {
  act(() => {
    ReactDOM.unmountComponentAtNode(host);
  });
  jest.restoreAllMocks();
});

it("applies Text Only and restores an icon while the timer is paused or idle", () => {
  render();
  expect(update).toHaveBeenLastCalledWith({
    dataUrl: null,
    isTemplate: false,
  });
  mockStyle = TrayIconStyle.MINIMAL;
  render();
  images[0].onload!();
  expect(update).toHaveBeenLastCalledWith({
    dataUrl: "data:image/png,test",
    isTemplate: true,
  });
});

it("ignores a stale asynchronous icon load after switching to Text Only", () => {
  mockStyle = TrayIconStyle.MINIMAL;
  render();
  const oldLoad = images[0].onload!;
  mockStyle = TrayIconStyle.TEXT_ONLY;
  render();
  oldLoad();
  expect(update).toHaveBeenCalledTimes(1);
  expect(update).toHaveBeenLastCalledWith({
    dataUrl: null,
    isTemplate: false,
  });
});
