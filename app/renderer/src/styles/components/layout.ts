import styled, { css } from "styled-components/macro";

type LayoutProps = { noTransition?: boolean; $macPopover?: boolean };

export const StyledLayout = styled.div<LayoutProps>`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-items: center;
  background-color: var(--color-bg-primary);

  .native-workspace-titlebar {
    flex: 0 0 44px;
    -webkit-app-region: drag;
    -webkit-user-select: none;
  }

  ${(p) =>
    p.$macPopover &&
    css`
      border-radius: 12px;
      overflow: hidden;
    `}

  & > main {
    height: 41.2rem;
    animation: ${(p) => p.noTransition && "none"};
    &.compact {
      height: unset;
    }
  }
`;
