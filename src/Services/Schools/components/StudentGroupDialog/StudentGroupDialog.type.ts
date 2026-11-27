import type { MemberDto } from '@/Endpoints/schools/schools.contract.type';
import type { ManagedStudentGroup } from '@/Endpoints/students/students.contract.type';
import type { StudentGroupChange } from '../../hooks/useStudentGroups.type';

export type StudentGroupAction = StudentGroupChange | { kind: 'delete'; group: ManagedStudentGroup };

export type StudentGroupDialogProps = {
  action: StudentGroupAction;
  members: MemberDto[];
  isWriting: boolean;
  onSave: (change: StudentGroupChange) => Promise<ManagedStudentGroup>;
  onDelete: (publicId: string) => Promise<void>;
  onClose: () => void;
};
