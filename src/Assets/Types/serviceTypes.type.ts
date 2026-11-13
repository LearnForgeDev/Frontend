import type { ReactNode } from 'react';

export type ServiceManifest = {
  id: string;
  name: string;
  price?: number;
  icon: string | ReactNode;
  adminRoute: string;
  isBought: boolean;
  isEnabled: boolean;
};

export type ServiceContext = {
  selectedServices: ServiceManifest[];
  selectService: (service: ServiceManifest) => void;
  deselectService: (service: ServiceManifest) => void;
};
