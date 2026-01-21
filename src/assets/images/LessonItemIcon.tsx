import type { JSX } from "react";
import type { IconProps } from "../../types/commonTypes.ts";
import { IconBackground } from "./IconBackground";

export default function LessonItemIcon({
  size = 48,
  color = 'currentColor',
  title = 'Lessons Logo',
  className,
  backgroundColor,
  ...props
}: IconProps): JSX.Element {
  const svg = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      {...props}
    >
      <title>{title}</title>
      <path
        d="M8 39A5 5 0 0 1 13 34H40"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 4H40v40H13A5 5 0 0 1 8 39V9A5 5 0 0 1 13 4z"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="16"
        y1="14"
        x2="32"
        y2="14"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <line
        x1="16"
        y1="20"
        x2="30"
        y2="20"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <line
        x1="16"
        y1="26"
        x2="28"
        y2="26"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );

  if (backgroundColor) {
    return (
      <IconBackground backgroundColor={backgroundColor} size={size}>
        {svg}
      </IconBackground>
    );
  }

  return svg;
}