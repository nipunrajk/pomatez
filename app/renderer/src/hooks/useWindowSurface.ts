import { useCallback, useContext } from "react";
import { ConnnectorContext } from "contexts/ConnnectorContext";
import { useAppDispatch } from "./storeHooks";
import { setLayout } from "store";
import { AppLayout } from "store/settings/types";

export function useWindowSurface() {
  const dispatch = useAppDispatch();
  const { onLayoutChange } = useContext(ConnnectorContext);
  return useCallback(
    (layout: AppLayout) => {
      if (onLayoutChange) onLayoutChange(layout);
      else dispatch(setLayout(layout));
    },
    [dispatch, onLayoutChange]
  );
}
