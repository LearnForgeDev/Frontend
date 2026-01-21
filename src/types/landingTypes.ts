import type { ComponentType, SVGProps } from 'react';

export type FeatureItem = {
  name: string;
  description: string;
  icon: ComponentType<IconProps>;
  backgroundColor: string;
};

export type IconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  color?: string;
  title?: string;
  backgroundColor?: string;
};
