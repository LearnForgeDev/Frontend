import type { ManagedStudentGroup } from '@/Endpoints/students/students.contract.type';

export type StudentGroupChange = {
  kind: 'create' | 'edit';
  group: ManagedStudentGroup;
};
