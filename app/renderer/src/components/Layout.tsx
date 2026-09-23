import React, {
  useEffect,
  useContext,
  useCallback,
  useState,
  useRef,
} from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import {
  StyledClassicPageFrame,
  StyledDashboard,
  StyledDashboardContent,
  StyledLayout,
} from "styles";

import Titlebar from "./Titlebar";
import Navigation from "./Navigation";
import Sidebar from "./Sidebar";
import { ThemeContext } from "contexts";
import { TimerStatus } from "store/timer/types";
import { AppLayout } from "store/settings/types";
import { useAppSelector } from "hooks/storeHooks";
import { dayRoute } from "config";

type Props = {} & RouteComponentProps;

const Layout: React.FC<Props> = ({ history, location, children }) => {
  const timer = useAppSelector((state) => state.timer);

  const settings = useAppSelector((state) => state.settings);

  const { toggleThemeAction } = useContext(ThemeContext);

  const [noTransition, setNoTransition] = useState(false);

  const isDashboard = settings.layout === AppLayout.DASHBOARD;

  const registerKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && e.code === "KeyT") {
        if (toggleThemeAction) toggleThemeAction();
      }
    },
    [toggleThemeAction]
  );

  useEffect(() => {
    document.addEventListener("keydown", registerKey);
    return () => document.removeEventListener("keydown", registerKey);
  }, [registerKey]);

  // On launch and whenever the layout changes, land on a page that exists
  // in that layout: the dashboard opens on Day, classic has no Day page.
  const appliedLayout = useRef<AppLayout | null>(null);
  useEffect(() => {
    if (appliedLayout.current === settings.layout) return;
    appliedLayout.current = settings.layout;
    if (isDashboard && location.pathname === "/") {
      history.replace(dayRoute.path);
    } else if (!isDashboard && location.pathname === dayRoute.path) {
      history.replace("/");
    }
  }, [settings.layout, isDashboard, location.pathname, history]);

  useEffect(() => {
    if (settings.enableFullscreenBreak) {
      if (
        timer.timerType === TimerStatus.SHORT_BREAK ||
        timer.timerType === TimerStatus.LONG_BREAK ||
        timer.timerType === TimerStatus.SPECIAL_BREAK
      ) {
        if (location.pathname !== "/") {
          setNoTransition(true);
          history.push("/");
        }
      } else {
        setNoTransition(false);
      }
    }
  }, [
    timer.timerType,
    location,
    history,
    settings.enableFullscreenBreak,
  ]);

  const isWidePage = location.pathname === dayRoute.path;

  return (
    <StyledLayout noTransition={noTransition}>
      {!settings.useNativeTitlebar && (
        <Titlebar
          darkMode={settings.enableDarkTheme}
          timerType={timer.timerType}
        />
      )}
      {isDashboard ? (
        <StyledDashboard>
          <Sidebar />
          <StyledDashboardContent wide={isWidePage}>
            {isWidePage ? (
              children
            ) : (
              <StyledClassicPageFrame>
                {children}
              </StyledClassicPageFrame>
            )}
          </StyledDashboardContent>
        </StyledDashboard>
      ) : (
        <>
          {settings["compactMode"] ? null : (
            <Navigation timerType={timer.timerType} />
          )}
          {children}
        </>
      )}
    </StyledLayout>
  );
};

export default withRouter(Layout);
