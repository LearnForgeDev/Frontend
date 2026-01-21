import type {JSX} from "react";
import type { IconProps } from "../../../types/commonTypes.ts";
import { IconBackground } from "../IconBackground";

export function LessonsIcon({
  size = 24,
  color = 'currentColor',
  title,
  className,
  backgroundColor,
  ...props
}: IconProps): JSX.Element {
  const ariaAttrs = title ? { role: 'img' } : { 'aria-hidden': true };

  const svg = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...ariaAttrs}
      {...props}
      style={{margin: 0, padding: 0}}
    >
      {title && <title>{title}</title>}
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
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
