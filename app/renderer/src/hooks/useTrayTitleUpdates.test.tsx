import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import { useTrayTitleUpdates } from "./useTrayTitleUpdates";
import { TrayIconStyle } from "store/settings/types";
import { TRAY_TITLE_UPDATE } from "@pomatez/shareables";

const send = jest.fn();
let host: HTMLDivElement;
let options: Parameters<typeof useTrayTitleUpdates>[0];
const Harness = () => {
  useTrayTitleUpdates(options);
  return null;
};
const render = () =>
  act(() => {
    ReactDOM.render(<Harness />, host);
  });
beforeEach(() => {
  host = document.createElement("div");
  send.mockClear();
  options = {
    send,
    style: TrayIconStyle.CLASSIC,
    showTimer: true,
    active: true,
    time: "24:59",
  };
});
afterEach(() => {
  act(() => {
    ReactDOM.unmountComponentAtNode(host);
  });
});

it("sends configured titles and clears them when an icon-style timer is idle or disabled", () => {
  render();
  expect(send).toHaveBeenLastCalledWith(TRAY_TITLE_UPDATE, {
    title: "24:59",
    textOnly: false,
  });
  options = { ...options, active: false };
  render();
  expect(send).toHaveBeenLastCalledWith(TRAY_TITLE_UPDATE, {
    title: "",
    textOnly: false,
  });
  options = { ...options, active: true, showTimer: false };
  render();
  expect(send).toHaveBeenLastCalledWith(TRAY_TITLE_UPDATE, {
    title: "",
    textOnly: false,
  });
});

it("updates the Text Only flag between text-bearing styles without a timer tick", () => {
  options = {
    ...options,
    style: TrayIconStyle.ICON_TEXT,
    showTimer: false,
    active: false,
  };
  render();
  expect(send).toHaveBeenLastCalledWith(TRAY_TITLE_UPDATE, {
    title: "24:59",
    textOnly: false,
  });
  options = { ...options, style: TrayIconStyle.TEXT_ONLY };
  render();
  expect(send).toHaveBeenLastCalledWith(TRAY_TITLE_UPDATE, {
    title: "24:59",
    textOnly: true,
  });
  options = { ...options, style: TrayIconStyle.ICON_TEXT };
  render();
  expect(send).toHaveBeenLastCalledWith(TRAY_TITLE_UPDATE, {
    title: "24:59",
    textOnly: false,
  });
});

it("sends countdown updates while preserving the Text Only flag", () => {
  options = { ...options, style: TrayIconStyle.TEXT_ONLY };
  render();
  options = { ...options, time: "24:58" };
  render();
  expect(send).toHaveBeenLastCalledWith(TRAY_TITLE_UPDATE, {
    title: "24:58",
    textOnly: true,
  });
});
