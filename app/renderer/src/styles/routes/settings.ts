import styled from "styled-components/macro";
import { themes } from "styles/themes";
import { StyledScrollbar, focusRing, typeStyle } from "styles/mixins";
import { StyledTogglerWrapper } from "styles/components/toggler";
import { StyledShortcutWrapper } from "styles/components/shortcuts";
import { StyledHelpWrapper } from "styles/components/help";

export const StyledSettings = styled.main`
  width: 100%;
  height: 100%;

  flex: 1 1;

  animation: 320ms ${themes.enterFromRight} ease;

  overflow: hidden scroll;

  ${StyledScrollbar};
`;

/** Centered reading column; the scroll container above stays full width. */
export const StyledSettingsColumn = styled.div`
  width: 100%;
  max-width: 840px;
  margin: 0 auto;
  padding: 0 var(--space-4) var(--space-8);

  /* Shown when the search hides every card. */
  & > .settings-empty {
    padding: var(--space-8) 0;
    text-align: center;
    ${typeStyle("body")};
    color: var(--color-text-secondary-readable);
  }
`;

/** Header + filter bar, stuck together to the top of the scroll area. */
export const StyledSettingsTop = styled.div`
  position: sticky;
  top: 0;
  z-index: 3;

  margin-bottom: var(--space-6);
  padding-bottom: var(--space-3);

  background-color: var(--layout-dashboard-header-bg);
  border-bottom: var(--border-width-hairline) solid
    var(--layout-dashboard-header-border-bottom);

  & > header {
    position: static;
    margin: 0;
    border-bottom: none;
  }
`;

export const StyledSettingsFilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2) var(--space-3);

  & > input {
    flex: 1 1 18rem;
    max-width: 28rem;
    height: var(--component-button-height-sm);
  }

  .pills {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
  }

  .pills > button {
    height: var(--component-button-height-sm);
    padding: 0 var(--space-3);

    ${typeStyle("tag")};
    color: var(--color-text-secondary-readable);
    border: var(--border-width-hairline) solid transparent;
    border-radius: var(--radius-pill);
    background-color: transparent;
    cursor: pointer;

    transition: ${themes.transition};

    &:hover {
      color: var(--color-text-primary);
      background-color: var(--color-background-surface-sunken);
    }

    &[aria-current="true"] {
      color: var(--color-text-primary);
      border-color: var(--component-card-border);
      background-color: var(--component-card-bg);
    }

    ${focusRing};
  }
`;

/** One group: eyebrow heading above a surfaced card. */
export const StyledSettingSection = styled.section`
  width: 100%;
  margin-bottom: var(--space-5);
`;

export const StyledSectionHeading = styled.h4`
  ${typeStyle("settings-heading")};
  color: var(--color-text-secondary-readable);

  margin-bottom: var(--space-2);
  padding-left: var(--space-1);
`;

export const StyledSettingsCard = styled.div<{ padded?: boolean }>`
  overflow: hidden;

  border-radius: var(--component-card-radius);
  border: var(--border-width-hairline) solid var(--component-card-border);
  background-color: var(--component-card-bg);
  box-shadow: var(--component-card-shadow);

  ${(p) => p.padded && `padding: var(--space-4);`}

  /* Rows: equal height, hairline between, none after the last. */
  & > ${StyledTogglerWrapper},
  & > ${StyledShortcutWrapper},
  & > ${StyledHelpWrapper},
  & > .setting-row {
    min-height: 5.6rem;
    height: auto;
    padding: var(--space-3) var(--space-4);
    border-bottom: var(--border-width-hairline) solid
      var(--color-border-soft);

    &::after {
      display: none;
    }

    &:last-child {
      border-bottom: none;
    }
  }

  /* Small heading between row groups (Keyboard: local / global). */
  & > .setting-subhead {
    padding: var(--space-3) var(--space-4) var(--space-1);
    ${typeStyle("meta")};
    font-weight: 600;
    color: var(--color-text-secondary-readable);
  }
`;

/** A titled block inside a padded card (Data & Vault). */
export const StyledSettingsSubsection = styled.div`
  & > h5 {
    margin-bottom: var(--space-2);
    font-size: 1.4rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  & + & {
    margin-top: var(--space-5);
    padding-top: var(--space-5);
    border-top: var(--border-width-hairline) solid var(--color-border-soft);
  }
`;

/** Label + helper text on the left, any control on the right. */
export const StyledSettingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);

  .control {
    flex-shrink: 0;
    max-width: 60%;
  }

  @media (max-width: 720px) {
    flex-wrap: wrap;

    .control {
      max-width: none;
      width: 100%;
    }
  }
`;

export const StyledSettingText = styled.div`
  min-width: 0;
  display: grid;

  .label {
    font-size: 1.4rem;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .description {
    margin-top: 2px;
    font-size: 1.2rem;
    line-height: 1.4;
    color: var(--color-text-secondary-readable);
  }
`;

/** Workspace Layout: two selectable preview cards. */
export const StyledLayoutPicker = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);

  @media (max-width: 720px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const StyledLayoutOption = styled.button`
  display: grid;
  gap: var(--space-2);
  padding: var(--space-3);

  text-align: left;
  color: var(--color-text-primary);
  cursor: pointer;

  border-radius: var(--radius-lg);
  border: var(--border-width-thick) solid var(--color-border-soft);
  background-color: transparent;

  transition: ${themes.transition};

  &:hover {
    border-color: var(--color-border-strong);
  }

  &[aria-checked="true"] {
    border-color: var(--color-brand-primary);
    background-color: var(--color-brand-primary-muted);
  }

  ${focusRing};

  svg {
    width: 100%;
    height: auto;
    border-radius: var(--radius-md);
    background-color: var(--color-background-surface-sunken);
  }

  .title {
    font-size: 1.4rem;
    font-weight: 600;
  }

  .subtitle {
    font-size: 1.2rem;
    line-height: 1.4;
    color: var(--color-text-secondary-readable);
  }
`;

/** Settings → About: version line and community links. */
export const StyledAboutCard = styled.div`
  display: grid;
  gap: var(--space-2);

  .version {
    font-size: 1.4rem;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1) var(--space-2);
    ${typeStyle("meta")};
    color: var(--color-text-secondary-readable);
  }

  .links a {
    color: var(--color-text-secondary-readable);
    text-decoration: none;

    &:hover {
      color: var(--color-brand-primary-readable);
    }

    ${focusRing};
  }
`;

/** Settings → Data: export / import a backup file. */
export const StyledDataSection = styled.div`
  display: grid;
  gap: var(--space-3);

  p {
    ${typeStyle("meta")};
    color: var(--color-text-secondary-readable);
  }

  .data-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);

    /* Pills are full-width by default; here they sit side by side. */
    & > button {
      width: auto;
      padding: 0 var(--space-5);
    }
  }

  .data-error {
    ${typeStyle("meta")};
    color: var(--color-status-danger-readable);
  }

  /* Confirmation before an import replaces everything. */
  .data-confirm {
    display: grid;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);

    border-radius: var(--radius-md);
    border: var(--border-width-hairline) solid
      var(--color-border-strong);
    background-color: var(--color-background-surface-sunken);

    p {
      color: var(--color-text-primary);
    }
  }

  input[type="file"] {
    display: none;
  }
`;

/** Settings → Obsidian: vault, folder, note templates and export. */
export const StyledObsidianSection = styled(StyledDataSection)`
  gap: var(--space-4);

  .field {
    display: grid;
    gap: var(--space-2);

    & > span:first-child,
    & > legend {
      ${typeStyle("body")};
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
    }
  }

  fieldset.field {
    border: none;
    padding: 0;
    margin: 0;
  }

  .vault {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2) var(--space-3);

    code {
      flex: 1 1 20rem;
      min-width: 0;
      padding: var(--space-2) var(--space-3);

      font: 1.3rem / 1.4 var(--font-mono);
      color: var(--color-text-primary);
      overflow-wrap: anywhere;

      border-radius: var(--radius-md);
      background-color: var(--color-background-surface-sunken);
    }

    & > button {
      width: auto;
      padding: 0 var(--space-5);
    }
  }

  .hint {
    ${typeStyle("meta")};
    color: var(--color-text-secondary-readable);

    code {
      font-family: var(--font-mono);
    }
  }

  .warn {
    ${typeStyle("meta")};
    color: var(--color-warning-text-readable);
  }

  /* Milestone note / Day note switch. */
  .template-kinds {
    display: flex;
    gap: var(--space-2);

    & > button {
      width: auto;
      padding: 0 var(--space-4);
    }

    & > button[aria-pressed="true"] {
      color: var(--component-button-primary-text);
      border-color: transparent;
      background-color: var(--component-button-primary-bg);
    }
  }

  .template-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-3);

    @media (max-width: 900px) {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  textarea,
  pre {
    height: 30rem;
    margin: 0;
    font: 1.25rem / 1.5 var(--font-mono);
    tab-size: 2;
  }

  textarea {
    resize: vertical;
  }

  pre {
    padding: var(--space-3) var(--component-input-padding-x);
    overflow: auto;
    white-space: pre-wrap;
    overflow-wrap: anywhere;

    color: var(--color-text-primary);
    border-radius: var(--component-input-radius);
    border: var(--border-width-hairline) dashed
      var(--color-border-strong);
    ${StyledScrollbar};
  }

  .template-caption {
    min-height: var(--component-button-height-sm);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);

    & > label,
    & > span {
      white-space: nowrap;
    }

    & > button {
      width: auto;
      height: var(--component-button-height-sm);
      padding: 0;
    }

    ${typeStyle("meta")};
    color: var(--color-text-secondary-readable);

    code {
      font-family: var(--font-mono);
      overflow-wrap: anywhere;
    }
  }

  .data-actions > button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .result {
    ${typeStyle("meta")};
    color: var(--color-text-primary);
  }

  .result[data-tone="error"] {
    color: var(--color-status-danger-readable);
  }
`;
