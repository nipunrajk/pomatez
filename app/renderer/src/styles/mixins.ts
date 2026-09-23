import { css } from "styled-components/macro";

export const StyledScrollbar = css`
  &:hover::-webkit-scrollbar {
    width: 0.6rem;
  }

  &:hover::-webkit-scrollbar-thumb {
    background-color: var(--color-disabled-text);
  }

  &:hover::-webkit-scrollbar-track {
    background-color: var(--color-bg-tertiary);
  }

  &::-webkit-scrollbar {
    width: 0.6rem;
  }

  &::-webkit-scrollbar-thumb {
    background-color: transparent;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
`;

export type TypeRole =
  | "timer-display"
  | "timer-unit"
  | "page-title"
  | "section-title"
  | "card-title"
  | "list-title"
  | "brand"
  | "body"
  | "nav-item"
  | "button"
  | "meta"
  | "eyebrow"
  | "tag"
  | "kbd";

/** Applies a Modula `typography.scale` role from the generated tokens. */
export const typeStyle = (role: TypeRole) => css`
  font-family: var(--type-${role}-family);
  font-size: var(--type-${role}-size);
  font-weight: var(--type-${role}-weight);
  line-height: var(--type-${role}-line-height);
  letter-spacing: var(--type-${role}-letter-spacing);
  text-transform: var(--type-${role}-transform);
`;
