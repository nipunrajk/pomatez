import React, { SVGProps } from "react";
import {
  Bed,
  CalendarDays,
  ChartNoAxesColumn,
  ChevronDown,
  CircleAlert,
  Clock,
  Coffee,
  Ellipsis,
  EllipsisVertical,
  ExternalLink,
  Laptop,
  LucideIcon,
  Maximize2,
  Pause,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  RotateCw,
  Save,
  Settings,
  SkipForward,
  SquarePen,
  Timer,
  Trash2,
  UtensilsCrossed,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { ProgressSVG } from "assets/icons";

export type SVGTypes = {
  size?: number;
  style?: SVGProps<SVGElement>["style"];
  name:
    | "laptop"
    | "mug"
    | "nap"
    | "config"
    | "option-x"
    | "option-y"
    | "pause"
    | "play"
    | "progress"
    | "reset"
    | "settings"
    | "skip"
    | "task"
    | "timer"
    | "volume-mute"
    | "volume-on"
    | "external"
    | "add"
    | "pencil"
    | "save"
    | "trash"
    | "close"
    | "fast-food"
    | "refresh"
    | "alert"
    | "chevron-down"
    | "expand"
    | "stats"
    | "calendar";
};

const ICONS: Record<
  Exclude<SVGTypes["name"], "progress">,
  LucideIcon
> = {
  laptop: Laptop,
  mug: Coffee,
  nap: Bed,
  config: Clock,
  "option-x": Ellipsis,
  "option-y": EllipsisVertical,
  pause: Pause,
  play: Play,
  reset: RotateCw,
  settings: Settings,
  skip: SkipForward,
  task: SquarePen,
  timer: Timer,
  "volume-mute": VolumeX,
  "volume-on": Volume2,
  external: ExternalLink,
  add: Plus,
  pencil: Pencil,
  save: Save,
  trash: Trash2,
  close: X,
  "fast-food": UtensilsCrossed,
  refresh: RefreshCw,
  alert: CircleAlert,
  "chevron-down": ChevronDown,
  expand: Maximize2,
  stats: ChartNoAxesColumn,
  calendar: CalendarDays,
};

/**
 * Outline icons from Lucide at the Modula 1.5px stroke. The stroke stays
 * 1.5px at any rendered size (absoluteStrokeWidth). Containers size icons
 * with CSS width/height; `size` only sets the default.
 */
const SVG: React.FC<SVGTypes> = ({ name, size = 20, style }) => {
  // The timer ring's shape, not an icon; styled in counter.ts.
  if (name === "progress") return <ProgressSVG />;

  const Icon = ICONS[name];
  return (
    <Icon
      size={size}
      strokeWidth={1.5}
      absoluteStrokeWidth
      style={style}
      aria-hidden="true"
    />
  );
};

export default React.memo(SVG);
