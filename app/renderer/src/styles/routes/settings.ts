import styled from "styled-components/macro";
import { themes } from "styles/themes";
import { StyledScrollbar, typeStyle } from "styles/mixins";
import { StyledButtonSecondary } from "styles";

export const StyledSettings = styled.main`
  width: 100%;
  height: 100%;

  padding-left: 2rem;
  padding-right: 1.4rem;
  padding-bottom: 3rem;

  flex: 1 1;

  animation: 320ms ${themes.enterFromRight} ease;

  overflow: hidden scroll;

  ${StyledScrollbar};
`;

export const StyledSettingSection = styled.section`
  width: 100%;
  height: max-content;

  display: grid;
  align-items: center;

  row-gap: var(--space-2);
  margin-top: var(--space-2);

  /* Sections are split by a hairline rule, not boxed. */
  &:not(:first-of-type) {
    margin-top: var(--space-5);
    padding-top: var(--space-5);
    border-top: var(--component-section-header-divider-width) solid
      var(--component-section-header-divider);
  }

  &:last-of-type {
    margin-bottom: var(--space-1);
  }
`;

export const StyledSectionHeading = styled.h4`
  ${typeStyle("eyebrow")};
  color: var(--color-text-secondary-readable);
`;

/**
 * Layout/Language/Tray Icon Style as cards, side by side. It's the first
 * block after the header (so a small top margin, no top rule, like any
 * first StyledSettingSection would get), and carries its own bottom rule
 * to separate it from FeatureSection below — which, now that Layout/
 * Language/TrayIcon's sections live one level deeper in this row, is
 * itself `:first-of-type` among StyledSettings' direct section children
 * and would otherwise render with no separating rule of its own.
 * Each tile's own divider styling is overridden (via !important) since
 * here they're cards in a row, not items in a vertical list.
 */
export const StyledSettingsTileRow = styled.div`
  width: 100%;

  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);

  margin-top: var(--space-2);
  margin-bottom: var(--space-5);
  padding-bottom: var(--space-5);
  border-bottom: var(--component-section-header-divider-width) solid
    var(--component-section-header-divider);

  & > section {
    margin-top: 0 !important;
    padding: var(--space-3) !important;
    border-top: none !important;

    border-radius: var(--component-card-radius);
    background-color: var(--component-card-bg);
    box-shadow: var(--component-card-shadow);
  }
`;

/** Toggle rows split into two columns once there's room for it. */
export const StyledFeatureToggleGrid = styled.div`
  width: 100%;

  display: grid;
  grid-template-columns: repeat(2, 1fr);
  column-gap: var(--space-4);
  row-gap: var(--space-2);
`;

export const StyledStarButton = styled(StyledButtonSecondary)`
  width: auto;
  flex: 1 1 auto;

  & > svg {
    margin-left: -1rem;
  }
`;

export const StyledSectionSticky = styled.div`
  width: 100%;
  min-height: 7.5rem;

  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;

  gap: 1rem;

  background-color: var(--color-background-window);
  border-top: var(--border-width-hairline) solid
    var(--color-border-strong);

  display: flex;
  flex-wrap: wrap;
  grid-template-columns: 1fr;
  align-items: start;

  padding-top: 2rem;
  padding-bottom: 2rem;
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
