import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Header, SVG } from "components";
import { ConnnectorContext } from "contexts/ConnnectorContext";
import { useWindowSurface } from "hooks/useWindowSurface";
import { useAppSelector } from "hooks/storeHooks";
import { AppLayout } from "store/settings/types";
import { StyledIconButton, StyledTimerHeaderMenu } from "styles";
import { TimerStatus } from "store/timer/types";
import { getTimerPhaseLabelKey } from "./timerPhaseLabel";
import { detectOS } from "utils";

type Props = { timerType?: TimerStatus };

const TimerHeader: React.FC<Props> = ({ timerType }) => {
  const { t } = useTranslation();
  const changeSurface = useWindowSurface();
  const layout = useAppSelector((state) => state.settings.layout);
  const { hudPinned, onHudPin } = useContext(ConnnectorContext);
  const workspaceLabel =
    t("timer.openWorkspace") + (detectOS() === "MacOS" ? " (⌘O)" : "");
  return (
    <Header heading={t(getTimerPhaseLabelKey(timerType))}>
      <StyledTimerHeaderMenu>
        {layout === AppLayout.CLASSIC && onHudPin && (
          <StyledIconButton
            type="button"
            aria-label={t("timer.pinHud")}
            title={t("timer.pinHud")}
            aria-pressed={!!hudPinned}
            onClick={() => onHudPin(!hudPinned)}
          >
            <SVG name="pin" />
          </StyledIconButton>
        )}
        <StyledIconButton
          type="button"
          title={workspaceLabel}
          aria-label={workspaceLabel}
          onClick={() => changeSurface(AppLayout.DASHBOARD)}
        >
          <SVG name="dashboard" />
        </StyledIconButton>
      </StyledTimerHeaderMenu>
    </Header>
  );
};
export default React.memo(TimerHeader);
