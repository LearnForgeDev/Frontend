import type { MemberDto } from '@/Endpoints/schools/schools.contract.type';

export interface CallsInviteDialogProps {
  open: boolean;
  recipients: MemberDto[];
  isPending: boolean;
  onClose: () => void;
  onInvite: (recipientUserPublicIds: string[]) => void;
}
