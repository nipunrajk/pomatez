/** Logical outer-window dimensions, shared by all Electron HUD entry points. */
export const COMPACT_WIDTH = 280;
export const getCompactHeight = (platform = process.platform) =>
  platform === "win32" ? 350 : 340;
