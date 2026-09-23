import styled from "styled-components/macro";
import { focusRing, typeStyle } from "styles/mixins";

export const StyledAlert = styled.div`
  width: 100%;
  min-height: 4rem;

  margin-bottom: var(--space-4);
  padding: var(--space-4);
  padding-right: var(--space-10);

  border-radius: var(--component-card-radius);
  border: none;
  background-color: var(--component-card-bg);
  box-shadow: var(--component-card-shadow);

  position: relative;

  header {
    h3 {
      ${typeStyle("card-title")};
      color: var(--color-text-heading);
      margin-bottom: var(--space-1);
    }

    p {
      color: var(--color-text-primary);
    }

    a {
      font-weight: var(--font-weight-medium);
      color: var(--color-brand-primary-readable);
      text-decoration: underline;
      text-underline-offset: 2px;
    }
  }
`;

export const StyledAlertCloseButton = styled.button`
  position: absolute;
  top: 0.4rem;
  right: 0.4rem;

  width: 2.4rem;
  height: 2.4rem;

  color: var(--color-icon-muted);

  border: none;
  border-radius: var(--radius-circle);
  background: transparent;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: var(--color-icon-default);
    background-color: var(--color-background-surface-sunken);
  }

  ${focusRing};

  & > svg {
    width: var(--icon-size-sm);
    height: var(--icon-size-sm);
  }
`;
