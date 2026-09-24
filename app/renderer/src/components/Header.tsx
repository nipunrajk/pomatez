import React from "react";
import { StyledHeader, StyledHeaderHeading } from "styles";

type Props = {
  heading: string;
  /** Dashboard page header (sticky, page-title size) vs. the classic default. */
  wide?: boolean;
  children?: React.ReactNode;
};

const Header: React.FC<Props> = ({ heading, wide, children }) => {
  return (
    <StyledHeader wide={wide}>
      <StyledHeaderHeading wide={wide}>{heading}</StyledHeaderHeading>
      {children}
    </StyledHeader>
  );
};

export default React.memo(Header);
