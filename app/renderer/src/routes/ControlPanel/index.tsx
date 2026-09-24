import React from "react";
import { StyledControlPanel } from "styles";
import ProjectBoard from "./ProjectBoard";
import TaskBreakdown from "./TaskBreakdown";

export default function ControlPanel() {
  return (
    <StyledControlPanel>
      <ProjectBoard />
      <TaskBreakdown />
    </StyledControlPanel>
  );
}
