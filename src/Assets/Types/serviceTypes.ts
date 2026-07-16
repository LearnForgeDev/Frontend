import type React from 'react';

export interface ServiceManifest {
  id: string;
  name: string;
  price: number;
  icon: string | React.ReactNode;
  adminRoute: string;
  isBought: boolean;
  isEnabled: boolean;
}

export interface ServiceContext {
  selectedServices: ServiceManifest[];
  selectService: (service: ServiceManifest) => void;
  deselectService: (service: ServiceManifest) => void;
}
