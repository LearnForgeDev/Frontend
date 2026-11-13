import type { Member } from '../../Scheduling.type';

export interface EventAttendeePickerProps {
  options: Member[];
  selected: Member[];
  disabled: boolean;
  hasStudents: boolean;
  withoutAttendees: boolean;
  onChange: (ids: string[]) => void;
  onSelectAll: () => void;
  onWithoutAttendeesChange: (value: boolean) => void;
}
