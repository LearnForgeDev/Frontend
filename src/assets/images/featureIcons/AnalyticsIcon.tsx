import type {JSX} from "react";
import type { IconProps } from "../../../types/commonTypes.ts";
import { IconBackground } from "../IconBackground";

export function AnalyticsIcon({
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
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
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
