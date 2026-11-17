import type { HomeworkAccessInput, HomeworkDto } from '@/Endpoints/Homework/homework.type';

export interface HomeworkAudienceProps {
  definition: HomeworkDto;
  busy: boolean;
  onSave: (input: HomeworkAccessInput) => Promise<unknown>;
  onDirtyChange?: (dirty: boolean) => void;
}
