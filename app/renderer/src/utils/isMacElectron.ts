import isElectron from "is-electron";
import { detectOS } from "./detectOS";

/** Electron's hidden native titlebar is specific to the macOS surfaces. */
export const isMacElectron = () =>
  isElectron() && detectOS() === "MacOS";
