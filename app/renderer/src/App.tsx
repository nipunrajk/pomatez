import React, { Suspense, useEffect } from "react";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import {
  ThemeProvider,
  CounterProvider,
  ConnectorProvider,
} from "contexts";
import { Layout, Preloader } from "components";
import { compactRoutes, dashboardRoutes, routes } from "config";
import { useEntryPomodoroSync, useLanguageSync } from "hooks";
import { useAppSelector } from "hooks/storeHooks";
import { AppLayout } from "store/settings/types";

export default function App() {
  const settings = useAppSelector((state) => state.settings);
  useLanguageSync();
  useEntryPomodoroSync();

  const activeRoutes = settings.compactMode
    ? compactRoutes
    : settings.layout === AppLayout.DASHBOARD
    ? dashboardRoutes()
    : routes();

  useEffect(() => {
    const contextEvent = (event: MouseEvent) => {
      if (event.target) {
        let target = event.target as HTMLElement;
        if (
          target.tagName === "TEXTAREA" ||
          (target.tagName === "INPUT" &&
            (target as HTMLInputElement).type === "text")
        ) {
          return true;
        }
      }
      event.preventDefault();
      return false;
    };
    document.addEventListener("contextmenu", contextEvent);
    return () =>
      document.removeEventListener("contextmenu", contextEvent);
  }, []);

  useEffect(() => {
    const middleMouseEvent = (event: MouseEvent) => {
      if (event.button === 1) event.preventDefault();
    };
    window.addEventListener("auxclick", middleMouseEvent);

    return () =>
      window.removeEventListener("auxclick", middleMouseEvent);
  }, []);

  return (
    <ThemeProvider>
      <CounterProvider>
        <ConnectorProvider>
          <Router>
            <Layout>
              <Suspense fallback={<Preloader />}>
                <Switch>
                  {activeRoutes.map(
                    ({ exact, path, component }, index) => (
                      <Route
                        exact={exact}
                        path={path}
                        component={component}
                        key={index}
                      />
                    )
                  )}
                </Switch>
              </Suspense>
            </Layout>
          </Router>
        </ConnectorProvider>
      </CounterProvider>
    </ThemeProvider>
  );
}
