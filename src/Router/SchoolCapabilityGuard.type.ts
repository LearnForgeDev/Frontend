import type { SchoolCapabilities } from '@/Services/AppShell/AppShell.type';

export type SchoolCapabilityGuardProps = {
  capability: keyof SchoolCapabilities;
};
