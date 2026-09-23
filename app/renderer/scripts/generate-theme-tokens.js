#!/usr/bin/env node
/**
 * Turns /modula-theme.json into CSS custom properties for the renderer.
 *
 * CRA can't import files outside src/, so the JSON at the repo root stays
 * the source of truth and this writes src/styles/tokens.generated.ts.
 * Run `yarn gen:theme` after editing the JSON; `--check` fails if the
 * generated file is stale.
 *
 * References such as "brand.primary" or a component's "radius": "md" are
 * emitted as var(...) so a theme that overrides a token (dark mode) also
 * updates everything that references it.
 */
const fs = require("fs");
const path = require("path");

const SOURCE = path.resolve(__dirname, "../../../modula-theme.json");
const OUTPUT = path.resolve(
  __dirname,
  "../src/styles/tokens.generated.ts"
);

const tokens = JSON.parse(fs.readFileSync(SOURCE, "utf8"));

const kebab = (s) =>
  String(s)
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();

const COLOR_GROUPS = new Set(Object.keys(tokens.color));
const SCALE = tokens.typography.scale;

const colorVar = (dotted) =>
  `--color-${dotted.split(".").map(kebab).join("-")}`;

const getPath = (obj, dotted) =>
  dotted
    .split(".")
    .reduce((o, k) => (o == null ? undefined : o[k]), obj);

/** Resolves a token reference to a var(), or returns null if it isn't one. */
const resolveRef = (key, value) => {
  if (typeof value !== "string") return null;

  if (value.includes(".")) {
    const [group] = value.split(".");
    if (
      COLOR_GROUPS.has(group) &&
      getPath(tokens.color, value) !== undefined
    ) {
      return `var(${colorVar(value)})`;
    }
    if (value === "motion.dragTilt") return "var(--motion-drag-tilt)";
    if (/^[a-z]+\.[A-Za-z.]+$/.test(value)) {
      throw new Error(
        `Unresolved token reference "${value}" (key "${key}")`
      );
    }
  }
  if (/radius$/i.test(key) && value in tokens.radius) {
    return `var(--radius-${kebab(value)})`;
  }
  if (key === "shadow" && value in tokens.shadow) {
    return `var(--shadow-${kebab(value)})`;
  }
  if (/typography$/i.test(key) && value in SCALE) {
    return `var(--type-${kebab(value)}-font)`;
  }
  return null;
};

const lines = [];
const rgbLines = [];
const emit = (name, value) => lines.push(`  ${name}: ${value};`);

const hexToRgb = (hex) => {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.replace(/./g, "$&$&") : h;
  return [0, 2, 4]
    .map((i) => parseInt(full.slice(i, i + 2), 16))
    .join(", ");
};

// color.* -> --color-group-name (+ -rgb triplets for hex values, for rgba()).
const walkColors = (obj, trail) => {
  Object.entries(obj).forEach(([k, v]) => {
    const next = [...trail, k];
    if (v && typeof v === "object") return walkColors(v, next);
    const name = colorVar(next.join("."));
    emit(name, v);
    if (/^#[0-9a-f]{3,6}$/i.test(v))
      rgbLines.push(`  ${name}-rgb: ${hexToRgb(v)};`);
  });
};
lines.push("  /* color */");
walkColors(tokens.color, []);
lines.push(...rgbLines);

lines.push("  /* typography */");
Object.entries(tokens.typography.fontFamily).forEach(([k, v]) =>
  emit(`--font-${kebab(k)}`, v)
);
Object.entries(tokens.typography.fontWeight).forEach(([k, v]) =>
  emit(`--font-weight-${kebab(k)}`, v)
);
Object.entries(SCALE).forEach(([k, s]) => {
  const p = `--type-${kebab(k)}`;
  emit(`${p}-family`, `var(--font-${s.family})`);
  emit(`${p}-size`, s.size);
  emit(`${p}-weight`, s.weight);
  emit(`${p}-line-height`, s.lineHeight);
  emit(`${p}-letter-spacing`, s.letterSpacing || "normal");
  emit(`${p}-transform`, s.textTransform || "none");
  emit(
    `${p}-font`,
    `${s.weight} ${s.size}/${s.lineHeight} var(--font-${s.family})`
  );
});

lines.push("  /* spacing, radius, border width, shadow */");
Object.entries(tokens.spacing).forEach(([k, v]) =>
  emit(`--space-${k}`, v)
);
Object.entries(tokens.radius).forEach(([k, v]) =>
  emit(`--radius-${kebab(k)}`, v)
);
Object.entries(tokens.borderWidth).forEach(([k, v]) =>
  emit(`--border-width-${kebab(k)}`, v)
);
Object.entries(tokens.shadow).forEach(([k, v]) =>
  emit(`--shadow-${kebab(k)}`, v)
);

lines.push("  /* motion */");
Object.entries(tokens.motion.duration).forEach(([k, v]) =>
  emit(`--motion-duration-${kebab(k)}`, v)
);
Object.entries(tokens.motion.easing).forEach(([k, v]) =>
  emit(`--motion-easing-${kebab(k)}`, v)
);
emit("--motion-drag-tilt", tokens.motion.dragTilt);

lines.push("  /* iconography */");
emit("--icon-stroke-width", tokens.iconography.strokeWidth);
Object.entries(tokens.iconography.size).forEach(([k, v]) =>
  emit(`--icon-size-${kebab(k)}`, v)
);

// components.* and layout.* -> --component-... / --layout-...
const walkSpec = (prefix, obj) => {
  Object.entries(obj).forEach(([k, v]) => {
    const name = `${prefix}-${kebab(k)}`;
    if (v && typeof v === "object") return walkSpec(name, v);
    emit(name, resolveRef(k, v) ?? v);
  });
};
lines.push("  /* components */");
walkSpec("--component", tokens.components);
lines.push("  /* layout */");
walkSpec("--layout", tokens.layout);

const output = `// Generated by scripts/generate-theme-tokens.js from modula-theme.json.
// Do not edit by hand: change the JSON and run \`yarn gen:theme\`.

/** Modula ${
  tokens.$meta.version
} design tokens as CSS custom properties. */
export const modulaTokens = \`
${lines.join("\n")}
\`;
`;

if (process.argv.includes("--check")) {
  const current = fs.existsSync(OUTPUT)
    ? fs.readFileSync(OUTPUT, "utf8")
    : "";
  if (current !== output) {
    console.error(
      "tokens.generated.ts is out of date; run `yarn gen:theme`."
    );
    process.exit(1);
  }
  console.log("tokens.generated.ts is up to date.");
} else {
  fs.writeFileSync(OUTPUT, output);
  console.log(
    `Wrote ${path.relative(process.cwd(), OUTPUT)} (${
      lines.length
    } lines).`
  );
}
