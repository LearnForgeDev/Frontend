import type { AuthRole } from '@/Assets/Types/commonTypes';

export type InviteUse = { userPublicId: string; userName: string; joinedAt: string };
export type SchoolInvite = {
  id: number;
  role: AuthRole;
  maxUses: number;
  usedCount: number;
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
  uses: InviteUse[];
};
export type UpdateInvite = { maxUses: number; expiresAt: string };
