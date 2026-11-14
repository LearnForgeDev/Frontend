import type { ElementType } from 'react';

export type SchoolCapabilities = {
  canAccessSchool: boolean;
  canTeach: boolean;
  canManageSchool: boolean;
};

export type AppNavigationItem = {
  id: string;
  label: string;
  path: string;
  icon: ElementType;
  mobilePriority?: boolean;
  requiredCapability?: keyof SchoolCapabilities;
};
