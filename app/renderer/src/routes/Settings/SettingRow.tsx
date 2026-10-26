import React from "react";
import { Toggler, TogglerProps } from "components";
import { StyledSettingRow, StyledSettingText } from "styles";
import { useSettingsMatch } from "./SettingsFilterContext";

type RowProps = {
  label: string;
  description?: string;
  children: React.ReactNode;
};

/** A non-toggle setting: text on the left, its control on the right. */
export const SettingRow: React.FC<RowProps> = ({
  label,
  description,
  children,
}) => {
  if (!useSettingsMatch(label, description)) return null;

  return (
    <StyledSettingRow className="setting-row">
      <StyledSettingText>
        <span className="label">{label}</span>
        {description && (
          <span className="description">{description}</span>
        )}
      </StyledSettingText>
      <div className="control">{children}</div>
    </StyledSettingRow>
  );
};

/** A toggle row that respects the Settings search. */
export const SettingToggle: React.FC<TogglerProps> = (props) => {
  if (!useSettingsMatch(props.label, props.description)) return null;
  return <Toggler {...props} />;
};

/** Search text for a group card built from toggle/row definitions. */
export const rowSearchText = (
  rows: { label: string; description?: string }[]
) => rows.flatMap(({ label, description }) => [label, description]);
