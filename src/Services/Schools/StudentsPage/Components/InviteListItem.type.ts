import type { SchoolInvite, UpdateInvite } from '@/Endpoints/invites/invites.contract.type';

export type Props = {
  invite: SchoolInvite;
  pending: boolean;
  onSave: (input: UpdateInvite) => void;
  onDelete: () => void;
  onRotate: () => void;
};
