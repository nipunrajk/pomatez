import styled from "styled-components/macro";
import { themes } from "styles/themes";
import { focusRing, typeStyle } from "styles/mixins";

/** Mutually exclusive options in one sunken track. */
export const StyledSegmentedControl = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 3px;

  border-radius: var(--radius-md);
  background-color: var(--color-background-surface-sunken);

  & > button {
    min-height: var(--component-button-height-sm);
    padding: 0 var(--space-3);

    display: inline-flex;
    align-items: center;
    gap: var(--space-2);

    ${typeStyle("tag")};
    color: var(--color-text-secondary-readable);
    white-space: nowrap;
    cursor: pointer;

    border: none;
    border-radius: calc(var(--radius-md) - 2px);
    background-color: transparent;

    transition: ${themes.transition};

    &:hover:not(:disabled) {
      color: var(--color-text-primary);
    }

    &[aria-checked="true"] {
      color: var(--color-text-primary);
      background-color: var(--component-card-bg);
      box-shadow: var(--component-card-shadow);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    ${focusRing};
  }

  /* Inline previews (tray icons). */
  & > button > .preview {
    display: inline-flex;
    width: 16px;
    height: 16px;
  }
`;
