import type { ServiceManifest } from '@/Assets/Types/serviceTypes.type';

export type AdminPanelDrawerContentProps = {
  services: ServiceManifest[];
  pathname: string;
  onCloseMenu: () => void;
};
