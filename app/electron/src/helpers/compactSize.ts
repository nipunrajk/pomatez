/** Logical outer-window dimensions, shared by all Electron HUD entry points. */
export const COMPACT_WIDTH = 340;
export const getCompactHeight = (platform = process.platform) =>
  platform === "win32" ? 360 : 350;
