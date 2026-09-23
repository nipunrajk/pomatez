import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "hooks/storeHooks";
import { setLayout } from "store";
import { Radio } from "components";
import { AppLayout } from "store/settings/types";

import SettingSection from "./SettingSection";

const LAYOUT_OPTIONS: { value: AppLayout; labelKey: string }[] = [
  { value: AppLayout.CLASSIC, labelKey: "layoutClassic" },
  { value: AppLayout.DASHBOARD, labelKey: "layoutDashboard" },
];

const LayoutSection: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const layout = useAppSelector((state) => state.settings.layout);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(setLayout(e.target.value as AppLayout));
    },
    [dispatch]
  );

  return (
    <SettingSection heading={t("settings.layout")}>
      {LAYOUT_OPTIONS.map(({ value, labelKey }) => (
        <Radio
          key={value}
          id={`layout-${value}`}
          name="layout"
          value={value}
          checked={layout === value}
          onChange={onChange}
          label={t(`settings.${labelKey}`)}
        />
      ))}
    </SettingSection>
  );
};

export default LayoutSection;
