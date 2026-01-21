import type {JSX} from "react";
import type { IconProps } from "../../../types/commonTypes.ts";
import { IconBackground } from "../IconBackground";

export function VideoMeetingIcon({
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
      <path d="M23 7l-7 5 7 5V7z" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
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
