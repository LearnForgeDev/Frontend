import { Avatar, AvatarGroup, Tooltip } from '@mui/material';
import { MAX_VISIBLE_ATTENDEES } from '@/Services/Scheduling/Scheduling.const';
import type { AttendeeAvatarsProps } from './AttendeeAvatars.types';
import { styles } from './AttendeeAvatars.styles';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function AttendeeAvatars({ attendees, max = MAX_VISIBLE_ATTENDEES }: AttendeeAvatarsProps) {
  if (attendees.length === 0) return null;

  return (
    <AvatarGroup max={max} sx={styles.group}>
      {attendees.map((a) => (
        <Tooltip key={a.userPublicId} title={a.displayName}>
          {a.avatarUrl ? (
            <Avatar alt={a.displayName} src={a.avatarUrl} />
          ) : (
            <Avatar alt={a.displayName}>{initials(a.displayName)}</Avatar>
          )}
        </Tooltip>
      ))}
    </AvatarGroup>
  );
}
