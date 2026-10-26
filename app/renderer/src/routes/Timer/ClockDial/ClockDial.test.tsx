import React from "react";
import ReactDOM from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import { Provider, useSelector } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { CounterContext } from "contexts/CounterContext";
import timerReducer, {
  setPlay,
  setRound,
  setTimerType,
} from "store/timer";
import configReducer, { setSessionRounds } from "store/config";
import settingsReducer, { setEnableStrictMode } from "store/settings";
import entriesReducer from "store/entries";
import { TimerStatus } from "store/timer/types";
import ClockDial from "./ClockDial";
import CozyFooter from "../CozyFooter";
import "i18n";

jest.mock("use-stay-awake", () => jest.fn());

const RADIUS = 100;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

if (!window.matchMedia) {
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
}

const reset = jest.fn();
const reducers = {
  timer: timerReducer,
  config: configReducer,
  settings: settingsReducer,
  entries: entriesReducer,
};
const makeStore = () => configureStore({ reducer: reducers });
let host: HTMLDivElement;
let store: ReturnType<typeof makeStore>;
let counter = { count: 1500, duration: 1500, active: false };
const Harness = () => {
  const timer = useSelector(
    (state: ReturnType<typeof store.getState>) => state.timer
  );
  return (
    <CounterContext.Provider
      value={{
        ...counter,
        timerType: timer.timerType,
        resetTimerAction: reset,
      }}
    >
      <ClockDial />
      <CozyFooter />
    </CounterContext.Provider>
  );
};
const render = () =>
  act(() => {
    ReactDOM.render(
      <Provider store={store}>
        <Harness />
      </Provider>,
      host
    );
  });
const button = (label: string) =>
  host.querySelector<HTMLButtonElement>(
    `button[aria-label="${label}"]`
  )!;

beforeEach(() => {
  host = document.createElement("div");
  document.body.appendChild(host);
  store = makeStore();
  counter = { count: 1500, duration: 1500, active: false };
  reset.mockClear();
  jest
    .spyOn(HTMLMediaElement.prototype, "play")
    .mockResolvedValue(undefined);
});
afterEach(() => {
  act(() => {
    ReactDOM.unmountComponentAtNode(host);
  });
  host.remove();
  jest.restoreAllMocks();
});

it("uses shared controls for start, pause, phase reset and skip", () => {
  render();
  act(() => {
    Simulate.click(button("Start timer"));
  });
  expect(store.getState().timer.playing).toBe(true);
  act(() => {
    Simulate.click(button("Pause timer"));
  });
  expect(store.getState().timer.playing).toBe(false);
  act(() => {
    Simulate.click(button("Reset timer"));
  });
  expect(reset).toHaveBeenCalledTimes(1);
  act(() => {
    Simulate.click(button("Skip phase"));
  });
  expect(store.getState().timer.timerType).toBe(
    TimerStatus.SHORT_BREAK
  );
  expect(store.getState().timer.playing).toBe(true);
});

it("keeps strict-mode restrictions and presents their warning", () => {
  store.dispatch(setPlay(true));
  store.dispatch(setEnableStrictMode(true));
  render();
  act(() => {
    Simulate.click(button("Pause timer"));
    Simulate.click(button("Reset timer"));
    Simulate.click(button("Skip phase"));
  });
  expect(store.getState().timer.playing).toBe(true);
  expect(store.getState().timer.timerType).toBe(TimerStatus.STAY_FOCUS);
  expect(reset).not.toHaveBeenCalled();
  expect(host.querySelector(".clock-status")!.textContent).toBeTruthy();
});

it("advances rounds through short and long breaks", () => {
  store.dispatch(setSessionRounds(3));
  store.dispatch(setRound(2));
  store.dispatch(setTimerType(TimerStatus.SHORT_BREAK));
  render();
  act(() => {
    Simulate.click(button("Skip phase"));
  });
  expect(store.getState().timer.round).toBe(3);
  act(() => {
    Simulate.click(button("Skip phase"));
  });
  expect(store.getState().timer.timerType).toBe(TimerStatus.LONG_BREAK);
  act(() => {
    Simulate.click(button("Skip phase"));
  });
  expect(store.getState().timer.round).toBe(1);
  expect(host.querySelector(".cozy-round")!.textContent).toBe(
    "Round 1 of 3"
  );
});

it("aligns bead and ring through countdown, pause, reset and zero duration", () => {
  for (const [count, angle, elapsed] of [
    [1500, 270, 0],
    [1125, 180, 0.25],
    [750, 90, 0.5],
    [375, 0, 0.75],
    [0, -90, 1],
  ]) {
    counter = { count, duration: 1500, active: true };
    render();
    expect(
      ((host.querySelector(".orbit-bead") as unknown) as SVGGElement)
        .style.transform
    ).toBe(`rotate(${angle}deg)`);
    expect(
      Number(
        host
          .querySelector(".orbit-progress")!
          .getAttribute("stroke-dashoffset")
      )
    ).toBeCloseTo(CIRCUMFERENCE * elapsed);
  }
  counter = { count: 1500, duration: 1500, active: false };
  render();
  expect(host.querySelector(".countdown")!.textContent).toBe("25:00");
  counter = { count: 0, duration: 0, active: false };
  render();
  expect(
    Number(
      host
        .querySelector(".orbit-progress")!
        .getAttribute("stroke-dashoffset")
    )
  ).toBeCloseTo(CIRCUMFERENCE);
});

it("renders session round progress cleanly in the footer", () => {
  render();
  expect(host.querySelector(".cozy-round")!.textContent).toBe(
    "Round 1 of 4"
  );
  expect(host.querySelector(".cozy-cat")).toBeNull();
});
