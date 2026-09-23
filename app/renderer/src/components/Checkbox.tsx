import React from "react";
import {
  StyledCheckbox,
  StyledCheckboxBox,
  StyledCheckboxLabel,
} from "styles";

export type CheckboxProps = {
  label?: React.ReactNode;
  asPrimary?: boolean;
  hidden?: boolean;
} & Omit<React.HTMLProps<HTMLInputElement>, "label">;

export const Checkbox = React.forwardRef<
  HTMLInputElement,
  CheckboxProps
>(({ id, label, name, disabled, asPrimary, hidden, ...props }, ref) => {
  return (
    <StyledCheckbox htmlFor={id} asPrimary={asPrimary}>
      <input
        type="checkbox"
        name={name}
        id={id}
        ref={ref}
        disabled={disabled}
        {...props}
      />
      <StyledCheckboxBox hidden={hidden} />
      <StyledCheckboxLabel>{hidden ? "" : label}</StyledCheckboxLabel>
    </StyledCheckbox>
  );
});

export default React.memo(Checkbox);
