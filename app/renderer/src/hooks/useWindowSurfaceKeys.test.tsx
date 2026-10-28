import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import { useWindowSurfaceKeys } from "./useWindowSurfaceKeys";
import { HUD_DISMISS, WindowSurfaceState } from "@pomatez/shareables";

let host: HTMLDivElement;
const send = jest.fn();
const requestLayout = jest.fn();
let options: Parameters<typeof useWindowSurfaceKeys>[0];
const Harness = () => {
  useWindowSurfaceKeys(options);
  return null;
};
const render = () =>
  act(() => {
    ReactDOM.render(<Harness />, host);
  });
const press = (init: KeyboardEventInit) =>
  act(() => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        ...init,
      })
    );
  });
beforeEach(() => {
  host = document.createElement("div");
  document.body.appendChild(host);
  send.mockClear();
  requestLayout.mockClear();
  options = {
    enabled: true,
    surface: {
      layout: "classic",
      pinned: false,
      revision: 1,
    } as WindowSurfaceState,
    send,
    requestLayout,
  };
});
afterEach(() => {
  act(() => {
    ReactDOM.unmountComponentAtNode(host);
  });
  host.remove();
});

it("dismisses unpinned HUD with one Escape and ignores Escape while pinned", () => {
  render();
  press({ key: "Escape" });
  expect(send).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledWith(HUD_DISMISS);
  options = {
    ...options,
    surface: { ...options.surface!, pinned: true },
  };
  render();
  press({ key: "Escape" });
  expect(send).toHaveBeenCalledTimes(1);
  options = {
    ...options,
    surface: { ...options.surface!, pinned: false },
  };
  render();
  press({ key: "Escape" });
  expect(send).toHaveBeenCalledTimes(2);
});
it("leaves Workspace and mandatory fullscreen breaks alone", () => {
  options.surface = { layout: "dashboard", pinned: false, revision: 1 };
  render();
  press({ key: "Escape" });
  options = {
    ...options,
    surface: { layout: "classic", pinned: false, revision: 2 },
    shouldFullscreen: true,
  };
  render();
  press({ key: "Escape" });
  press({ metaKey: true, code: "KeyO" });
  expect(send).not.toHaveBeenCalled();
  expect(requestLayout).not.toHaveBeenCalled();
});
it("lets open overlays and handled key events consume Escape first", () => {
  render();
  const dialog = document.createElement("div");
  dialog.setAttribute("role", "dialog");
  document.body.appendChild(dialog);
  press({ key: "Escape" });
  expect(send).not.toHaveBeenCalled();
  dialog.remove();
  act(() => {
    const event = new KeyboardEvent("keydown", {
      key: "Escape",
      cancelable: true,
    });
    event.preventDefault();
    window.dispatchEvent(event);
  });
  expect(send).not.toHaveBeenCalled();
});
it("preserves Workspace and HUD shortcuts without accumulating listeners", () => {
  render();
  render();
  press({ metaKey: true, code: "KeyO" });
  press({ metaKey: true, shiftKey: true, code: "KeyM" });
  expect(requestLayout.mock.calls).toEqual([
    ["dashboard"],
    ["classic"],
  ]);
  act(() => {
    ReactDOM.unmountComponentAtNode(host);
  });
  press({ key: "Escape" });
  expect(send).not.toHaveBeenCalled();
});
it("does not install macOS shortcuts for other backends", () => {
  options.enabled = false;
  render();
  press({ key: "Escape" });
  press({ metaKey: true, code: "KeyO" });
  expect(send).not.toHaveBeenCalled();
  expect(requestLayout).not.toHaveBeenCalled();
});
