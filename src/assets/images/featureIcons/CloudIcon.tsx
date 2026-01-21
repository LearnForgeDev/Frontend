import type {JSX} from "react";
import type { IconProps } from "../../../types/commonTypes.ts";
import { IconBackground } from "../IconBackground";

export function CloudIcon({
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
      <path d="M7.5 17h9.5c2.21 0 4-1.79 4-4 0-1.9-1.28-3.46-3.14-3.69A4.5 4.5 0 0 0 9 7.5 4.6 4.6 0 0 0 5.64 9.01 4.2 4.2 0 0 0 2.5 12.7C2.5 14.92 4.58 17 7.5 17z" />
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