import { useSchoolSelection } from '@/Services/Schools/hooks/useSchoolSelection';
import { getSchoolCapabilities } from '../utils/getSchoolCapabilities';

export function useCurrentSchool() {
  const selection = useSchoolSelection();
  return { ...selection, capabilities: getSchoolCapabilities(selection.school?.roles ?? []) };
}
