import type { HomeworkDto, HomeworkMetadataInput } from '@/Endpoints/Homework/homework.type';

export interface HomeworkMetadataProps {
  definition?: HomeworkDto;
  busy: boolean;
  onSave: (input: HomeworkMetadataInput) => Promise<unknown>;
  onDirtyChange?: (dirty: boolean) => void;
}
