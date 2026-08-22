import { Navigate, Outlet } from 'react-router-dom';
import { useCurrentSchool } from '@/Services/AppShell/hooks/useCurrentSchool';
import type { SchoolCapabilities } from '@/Services/AppShell/AppShell.types';

type SchoolCapabilityGuardProps = {
  capability: keyof SchoolCapabilities;
};

export default function SchoolCapabilityGuard({ capability }: SchoolCapabilityGuardProps) {
  const { schoolPublicId, capabilities } = useCurrentSchool();

  if (!capabilities[capability]) {
    return <Navigate to={`/app/schools/${schoolPublicId}/today`} replace />;
  }

  return <Outlet />;
}
