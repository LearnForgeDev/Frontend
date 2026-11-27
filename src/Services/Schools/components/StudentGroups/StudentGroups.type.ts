import type { useStudentGroups } from '../../hooks/useStudentGroups';

export type StudentGroupsProps = {
  directory: ReturnType<typeof useStudentGroups>;
};
