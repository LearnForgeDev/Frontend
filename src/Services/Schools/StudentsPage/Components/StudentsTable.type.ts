

import type { ManagedStudentGroup } from '@/Endpoints/students/students.contract.type';

export type StudentsTableProps = {
  schoolPublicId: string;
  groups?: ManagedStudentGroup[];
  onOpenChat: (studentPublicId: string) => void;
};
