import { createGlobalStyle } from "styled-components/macro";
import { darkTheme, modulaTheme } from "./themes";
import { modulaTokens } from "./tokens.generated";

type GlobalTypes = {
  isDarkMode?: boolean;
  useNativeTitlebar?: boolean;
};

export const GlobalStyles = createGlobalStyle<GlobalTypes>`

  :root {
    ${modulaTokens}
    ${(p) => (p.isDarkMode ? darkTheme : modulaTheme)}
  }

  *,
  *::before,
  *::after {
    margin: 0;
    padding:0;
    box-sizing: border-box;
    outline: none;
    font-family: inherit;
    font-size: inherit;
    color: currentColor;
  }

  html {
    width: 100%;
    height: 100%;

    /* 1rem = 10px at a 16px default; keep user text preferences scalable. */
    font-size: 62.5%;
    font-family: var(--font-body);
    font-weight: normal;
    font-optical-sizing: auto;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  html,
  body {
    overflow: hidden;
    box-sizing: inherit;

    background-color: var(--color-bg-primary);
  }

  #app {
    height: 100%;
  }

  body {
    font-size: var(--type-body-size);
    font-weight: var(--type-body-weight);
    line-height: var(--type-body-line-height);
    color: var(--color-body-text);

    width: 100%;
    height: 100%;
    border: ${(p) =>
      !p.useNativeTitlebar
        ? "1px solid var(--color-border-window)"
        : "none"} ;
    box-shadow: ${(p) =>
      !p.useNativeTitlebar && "var(--shadow-floating)"};
    box-sizing: border-box;
  }

  /*
   * Lucide icons are outline-only. Older styles set svg { fill: currentColor }
   * for the previous filled icon set; don't let that fill Lucide shapes.
   */
  svg.lucide,
  svg.lucide * {
    fill: none !important;
  }

  a {
    text-decoration: none;
    color: currentColor;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 500;
    color: var(--color-heading-text);
  }

  /* One UI family; semantic roles carry the heading hierarchy. */
  h1, h2, h3 {
    font-family: var(--font-display);
  }

  .ripple-hook {
    position: absolute;

    width: .5rem;
    height: .5rem;

    opacity: 0;

    border-radius: 50%;
    background-color: var(--color-bg-ripple-primary);

    animation: rippleEffect 1s;

    @keyframes rippleEffect {
      0% {
        transform: scale(1);
        opacity: 0.4;
      }
      100% {
        transform: scale(100);
        opacity: 0;
      }
    }
  }
`;
