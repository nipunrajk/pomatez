import React, { useState } from "react";
import {
  StyledCollapse,
  StyledCollapseHeading,
  StyledCollapseContent,
} from "styles";
import { SVG } from "components";

type Props = {
  heading: string;
  children?: React.ReactNode;
};

const Collapse: React.FC<Props> = ({ heading, children }) => {
  const [open, setOpen] = useState(false);

  const toggleCollapse = () => {
    setOpen((prevState) => !prevState);
  };

  return (
    <StyledCollapse>
      <StyledCollapseHeading
        as={"button"}
        open={open}
        onClick={toggleCollapse}
      >
        {heading}
        <SVG name="chevron-down" />
      </StyledCollapseHeading>
      {open && (
        <StyledCollapseContent>{children}</StyledCollapseContent>
      )}
    </StyledCollapse>
  );
};

export default React.memo(Collapse);
