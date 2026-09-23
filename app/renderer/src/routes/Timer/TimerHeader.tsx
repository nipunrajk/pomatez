import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Header, SVG } from "components";
import { useAppDispatch } from "hooks/storeHooks";
import { useTargetOutside } from "hooks";
import { setLayout } from "store";
import { AppLayout } from "store/settings/types";
import {
  StyledIconButton,
  StyledOptionList,
  StyledPopperContent,
  StyledPopperHeader,
  StyledTimerHeaderMenu,
  StyledTimerMenuItem,
} from "styles";
import { TimerStatus } from "store/timer/types";
import { getTimerPhaseLabelKey } from "./timerPhaseLabel";

type Props = {
  timerType?: TimerStatus;
};

/**
 * Replaces the old tab bar in the classic (single-purpose timer popup)
 * layout: the current phase as a page title, and a menu to switch to the
 * dashboard, since the tabs to every other page live there now.
 */
const TimerHeader: React.FC<Props> = ({ timerType }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const menuRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useTargetOutside({ ref: menuRef });

  const openDashboard = () => {
    setShowMenu(false);
    dispatch(setLayout(AppLayout.DASHBOARD));
  };

  return (
    <Header heading={t(getTimerPhaseLabelKey(timerType))}>
      <StyledTimerHeaderMenu ref={menuRef}>
        <StyledIconButton
          type="button"
          title={t("timer.openDashboard")}
          onClick={() => setShowMenu(!showMenu)}
        >
          <SVG name="option-y" />
        </StyledIconButton>

        {showMenu && (
          <StyledPopperContent
            style={{ top: "100%", right: 0, marginTop: "4px" }}
          >
            <StyledPopperHeader>
              <h4>{t("tasks.actions")}</h4>
              <button type="button" onClick={() => setShowMenu(false)}>
                <SVG name="close" />
              </button>
            </StyledPopperHeader>

            <StyledOptionList>
              <StyledTimerMenuItem onClick={openDashboard}>
                {t("timer.openDashboard")}
              </StyledTimerMenuItem>
            </StyledOptionList>
          </StyledPopperContent>
        )}
      </StyledTimerHeaderMenu>
    </Header>
  );
};

export default React.memo(TimerHeader);
