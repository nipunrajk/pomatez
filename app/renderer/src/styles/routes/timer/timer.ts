import styled from "styled-components/macro";

export const StyledTimer = styled.main`
  width: 100%;
  height: 100%;

  flex: 1 1;

  padding-top: 1.2rem;

  display: flex;
  flex-direction: column;
  align-items: end;

  animation: enterFromBottom 160ms ease;

  @keyframes enterFromBottom {
    0% {
      opacity: 0;
      transform: translateY(1.2rem);
    }

    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

/** StyledTimer has no horizontal padding of its own (Counter/Control pad
 * themselves), so the header needs its own, matching TimerStats' 1.6rem. */
export const StyledTimerHeaderPad = styled.div`
  width: 100%;
  padding: 0 1.6rem;
`;

/** Direct actions for the compact timer surface. */
export const StyledTimerHeaderMenu = styled.div`
  display: flex;
  gap: var(--space-2);
  button[aria-pressed="true"] {
    color: var(--color-brand-primary-readable);
  }
`;

export const StyledTimerMenuItem = styled.li`
  cursor: pointer;

  &:hover {
    color: var(--color-brand-primary-readable);
  }
`;
