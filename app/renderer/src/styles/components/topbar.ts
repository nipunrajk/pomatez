import styled from "styled-components/macro";
import { themes } from "styles/themes";
import { focusRing, typeStyle } from "styles/mixins";

/** layout.dashboard.header, spanning the content column and right rail. */
export const StyledTopBar = styled.header`
  flex: 0 0 var(--layout-dashboard-header-height);

  display: flex;
  align-items: center;
  gap: var(--space-6);

  padding: 0 var(--layout-dashboard-header-padding-x);

  background-color: var(--layout-dashboard-header-bg);
  border-bottom: var(--border-width-hairline) solid
    var(--layout-dashboard-header-border-bottom);

  h2 {
    flex-shrink: 0;
    ${typeStyle("page-title")};
    color: var(--color-text-heading);
    white-space: nowrap;
  }
`;

/** components.input with a docked kbd hint (input.kbdHint). */
export const StyledTopBarSearch = styled.label`
  position: relative;

  flex: 1 1 var(--layout-dashboard-header-search-width);
  min-width: 12rem;
  max-width: var(--layout-dashboard-header-search-width);
  margin: 0 auto;

  & > svg {
    position: absolute;
    top: 50%;
    left: var(--component-input-padding-x);
    transform: translateY(-50%);

    width: var(--icon-size-sm);
    height: var(--icon-size-sm);
    color: var(--color-icon-muted);
    pointer-events: none;
  }

  & > input {
    width: 100%;
    height: var(--component-input-height);
    padding: 0 calc(var(--space-12) + var(--space-4)) 0
      calc(
        var(--component-input-padding-x) + var(--icon-size-sm) +
          var(--space-2)
      );

    ${typeStyle("body")};
    color: var(--component-input-text);
    text-overflow: ellipsis;

    border-radius: var(--component-input-radius);
    border: var(--border-width-hairline) solid
      var(--component-input-border);
    background-color: var(--component-input-bg);

    transition: ${themes.transition};

    &::placeholder {
      color: var(--color-text-placeholder-readable);
    }

    &:focus {
      border-color: var(--color-border-focus);
      box-shadow: 0 0 0 var(--border-width-hairline)
        var(--color-border-focus);
    }
  }

  & > kbd {
    position: absolute;
    top: 50%;
    right: var(--space-3);
    transform: translateY(-50%);

    height: var(--component-input-kbd-hint-height);
    padding: 0 var(--component-input-kbd-hint-padding-x);

    display: flex;
    align-items: center;

    ${typeStyle("kbd")};
    /* kbdHint.text (#A7A7A2) is 1.7:1 on the kbd fill; primary is legible. */
    color: var(--color-text-primary);

    border-radius: var(--component-input-kbd-hint-radius);
    background-color: var(--component-input-kbd-hint-bg);
    pointer-events: none;
  }
`;

export const StyledTopBarActions = styled.div`
  flex-shrink: 0;

  display: flex;
  align-items: center;
  gap: var(--space-3);

  & > button:first-child {
    width: auto;
  }
`;

/** components.button.icon */
export const StyledTopBarIconButton = styled.button`
  position: relative;

  width: var(--component-button-icon-size);
  height: var(--component-button-icon-size);

  display: flex;
  align-items: center;
  justify-content: center;

  color: var(--color-icon-default);
  border-radius: var(--component-button-icon-radius);
  border: var(--border-width-hairline) solid
    var(--component-button-icon-border);
  background-color: var(--component-button-icon-bg);
  cursor: pointer;

  transition: ${themes.transition};

  &:hover {
    background-color: var(--color-background-surface-sunken);
  }

  ${focusRing};

  & > svg {
    width: var(--icon-size-md);
    height: var(--icon-size-md);
  }
`;

/** Unread marker (components.statusDot), ringed so it reads on the icon. */
export const StyledTopBarDot = styled.span`
  position: absolute;
  top: var(--space-1);
  right: var(--space-1);

  width: calc(var(--component-status-dot-size) + var(--space-1));
  height: calc(var(--component-status-dot-size) + var(--space-1));

  border-radius: var(--component-status-dot-radius);
  border: var(--border-width-thick) solid var(--color-background-window);
  background-color: var(--color-status-notification);
`;

export const StyledTopBarAvatar = styled.div`
  width: var(--component-avatar-lg);
  height: var(--component-avatar-lg);

  display: flex;
  align-items: center;
  justify-content: center;

  color: var(--color-text-on-primary);
  border-radius: var(--component-avatar-radius);
  background-color: var(--color-brand-primary-dark);

  & > svg {
    width: var(--icon-size-md);
    height: var(--icon-size-md);
  }
`;
