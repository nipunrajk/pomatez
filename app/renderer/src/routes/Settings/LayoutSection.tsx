import React, { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "hooks/storeHooks";
import { setLayout } from "store";
import { AppLayout } from "store/settings/types";
import { StyledLayoutOption, StyledLayoutPicker } from "styles";

import SettingSection from "./SettingSection";

/** Single dial in a narrow popover. */
const ClassicPreview = () => (
  <svg viewBox="0 0 160 90" aria-hidden>
    <rect
      x="58"
      y="10"
      width="44"
      height="70"
      rx="6"
      fill="var(--component-card-bg)"
      stroke="var(--color-border-strong)"
    />
    <circle
      cx="80"
      cy="40"
      r="13"
      fill="none"
      stroke="var(--color-border-soft)"
      strokeWidth="4"
    />
    <path
      d="M80 27 a13 13 0 0 1 12.4 17"
      fill="none"
      stroke="var(--color-brand-primary)"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <rect
      x="70"
      y="64"
      width="20"
      height="5"
      rx="2.5"
      fill="var(--color-border-strong)"
    />
  </svg>
);

/** Sidebar + board columns + rail. */
const DashboardPreview = () => (
  <svg viewBox="0 0 160 90" aria-hidden>
    <rect
      x="10"
      y="10"
      width="140"
      height="70"
      rx="6"
      fill="var(--component-card-bg)"
      stroke="var(--color-border-strong)"
    />
    <rect
      x="16"
      y="16"
      width="20"
      height="58"
      rx="3"
      fill="var(--color-border-soft)"
    />
    {[42, 72, 102].map((x) => (
      <g key={x}>
        <rect
          x={x}
          y="16"
          width="26"
          height="6"
          rx="2"
          fill="var(--color-border-strong)"
        />
        <rect
          x={x}
          y="26"
          width="26"
          height="14"
          rx="2"
          fill="var(--color-border-soft)"
        />
        <rect
          x={x}
          y="44"
          width="26"
          height="14"
          rx="2"
          fill="var(--color-border-soft)"
        />
      </g>
    ))}
    <rect
      x="132"
      y="16"
      width="12"
      height="58"
      rx="3"
      fill="var(--color-brand-primary-muted)"
    />
  </svg>
);

const OPTIONS = [
  {
    value: AppLayout.CLASSIC,
    titleKey: "layoutClassic",
    descKey: "layoutClassicDesc",
    Preview: ClassicPreview,
  },
  {
    value: AppLayout.DASHBOARD,
    titleKey: "layoutDashboard",
    descKey: "layoutDashboardDesc",
    Preview: DashboardPreview,
  },
];

const LayoutSection: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const layout = useAppSelector((state) => state.settings.layout);
  const groupRef = useRef<HTMLDivElement>(null);

  const select = useCallback(
    (value: AppLayout) => dispatch(setLayout(value)),
    [dispatch]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key))
        return;
      e.preventDefault();
      const next = OPTIONS.find((option) => option.value !== layout);
      if (!next) return;
      select(next.value);
      groupRef.current
        ?.querySelector<HTMLButtonElement>(`[data-value="${next.value}"]`)
        ?.focus();
    },
    [layout, select]
  );

  const texts = OPTIONS.flatMap(({ titleKey, descKey }) => [
    t(`settings.${titleKey}`),
    t(`settings.${descKey}`),
  ]);

  return (
    <SettingSection
      id="settings-layout"
      heading={t("settings.layout")}
      searchText={texts}
      padded
    >
      <StyledLayoutPicker
        ref={groupRef}
        role="radiogroup"
        aria-label={t("settings.layout")}
        onKeyDown={onKeyDown}
      >
        {OPTIONS.map(({ value, titleKey, descKey, Preview }) => {
          const checked = layout === value;
          return (
            <StyledLayoutOption
              key={value}
              type="button"
              role="radio"
              data-value={value}
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              onClick={() => select(value)}
            >
              <Preview />
              <span className="title">{t(`settings.${titleKey}`)}</span>
              <span className="subtitle">{t(`settings.${descKey}`)}</span>
            </StyledLayoutOption>
          );
        })}
      </StyledLayoutPicker>
    </SettingSection>
  );
};

export default LayoutSection;
