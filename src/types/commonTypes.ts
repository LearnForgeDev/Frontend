import * as React from "react";

export type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number | string;
  color?: string;
  title?: string;
  backgroundColor?: string;
};

export type NotificationProps = {
  success?: boolean
  title?: string,
  message: string,
  durationMS?: number,
}