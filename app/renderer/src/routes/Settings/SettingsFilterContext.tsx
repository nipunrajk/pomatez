import React, { useContext } from "react";

/** The Settings search query, lower-cased and trimmed ("" = no filter). */
export const SettingsFilterContext = React.createContext("");

export const matchesQuery = (
  query: string,
  ...texts: (string | undefined)[]
) =>
  !query || texts.some((text) => text?.toLowerCase().includes(query));

/** True when the row described by `texts` passes the current search. */
export const useSettingsMatch = (...texts: (string | undefined)[]) =>
  matchesQuery(useContext(SettingsFilterContext), ...texts);
