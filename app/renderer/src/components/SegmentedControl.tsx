import React, { useCallback, useRef } from "react";
import { StyledSegmentedControl } from "styles";

export type SegmentedOption<T extends string> = {
  value: T;
  label: React.ReactNode;
  disabled?: boolean;
  title?: string;
};

type Props<T extends string> = {
  ariaLabel: string;
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
};

/** A radio group drawn as segments; arrow keys move between options. */
function SegmentedControl<T extends string>({
  ariaLabel,
  value,
  options,
  onChange,
}: Props<T>) {
  const ref = useRef<HTMLDivElement>(null);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const step =
        e.key === "ArrowRight" || e.key === "ArrowDown"
          ? 1
          : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? -1
          : 0;
      if (!step) return;
      e.preventDefault();

      const enabled = options.filter((o) => !o.disabled);
      const index = enabled.findIndex((o) => o.value === value);
      const next =
        enabled[(index + step + enabled.length) % enabled.length];
      if (!next) return;
      onChange(next.value);
      ref.current
        ?.querySelector<HTMLButtonElement>(
          `[data-value="${next.value}"]`
        )
        ?.focus();
    },
    [options, value, onChange]
  );

  return (
    <StyledSegmentedControl
      ref={ref}
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
    >
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            data-value={option.value}
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            disabled={option.disabled}
            title={option.title}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </StyledSegmentedControl>
  );
}

export default SegmentedControl;
