import type { UpdateInvite } from '@/Endpoints/invites/types';
import { MAX_INVITE_USES, MIN_INVITE_USES, MAX_INVITE_EXPIRATION_HOURS, MILLISECONDS_IN_HOUR } from '../Components/InviteWidget.const';

export function validateInviteUpdate(maxUses: number, expiresAt: string, usedCount: number): UpdateInvite | null {
  const timestamp = Date.parse(expiresAt);
  if (!Number.isInteger(maxUses) || maxUses < Math.max(MIN_INVITE_USES, usedCount) || maxUses > MAX_INVITE_USES ||
    !Number.isFinite(timestamp) || timestamp <= Date.now() || timestamp > Date.now() + MAX_INVITE_EXPIRATION_HOURS * MILLISECONDS_IN_HOUR) return null;
  return { maxUses, expiresAt: new Date(timestamp).toISOString() };
}
