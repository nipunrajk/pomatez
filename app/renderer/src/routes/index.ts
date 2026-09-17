import { lazy } from "react";

export * from "./Config";

export { default as Timer } from "./Timer";
export { default as Config } from "./Config";
export { default as Settings } from "./Settings";
export { default as Stats } from "./Stats";

export const TaskList = lazy(() => import("./Tasks"));
