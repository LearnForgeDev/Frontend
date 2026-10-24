import { Box, Button, Chip, Dialog, DialogActions, DialogTitle, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import type { SchoolInvite, UpdateInvite } from '@/Endpoints/invites/types';
import { useInviteEditor } from '../hooks/useInviteEditor';
import { formatInviteDate, getInviteRole, getInviteStatus } from './InviteWidget.utils';
import { MAX_INVITE_USES, MIN_INVITE_USES } from './InviteWidget.const';
import * as S from './InviteWidget.styles';

type Props = {
  invite: SchoolInvite;
  pending: boolean;
  onSave: (input: UpdateInvite) => void;
  onDelete: () => void;
  onRotate: () => void;
};

export default function InviteListItem({ invite, pending, onSave, onDelete, onRotate }: Props) {
  const editor = useInviteEditor(invite, onSave);
  const [confirm, setConfirm] = useState<'delete' | 'rotate' | null>(null);
  return (
    <Box component="article" sx={S.cardSx}>
      <Box sx={S.actionsSx}>
        <Typography component="h3" sx={S.titleSx}>{getInviteRole(invite.role)}</Typography>
        <Chip label={getInviteStatus(invite)} size="small" />
      </Box>
      <Typography>Использовано {invite.usedCount} из {invite.maxUses}</Typography>
      <Typography color="text.secondary">До {formatInviteDate(invite.expiresAt)}</Typography>
      {!invite.revokedAt && <Box component="form" onSubmit={editor.submit} sx={S.editorSx}>
        <TextField label="Лимит использований" type="number" value={editor.maxUses}
          onChange={(event) => editor.setMaxUses(Number(event.target.value))}
          slotProps={{ htmlInput: { min: Math.max(MIN_INVITE_USES, invite.usedCount), max: MAX_INVITE_USES } }} required />
        <TextField label="Действует до" type="datetime-local" value={editor.expiresAt}
          onChange={(event) => editor.setExpiresAt(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} required />
        <Box sx={S.actionsSx}>
          <Button type="submit" disabled={pending}>Сохранить</Button>
          <Button onClick={() => setConfirm('rotate')} disabled={pending}>Заменить ссылку</Button>
          <Button color="error" onClick={() => setConfirm('delete')} disabled={pending}>Удалить</Button>
        </Box>
      </Box>}
      <Box component="details" sx={S.historySx}>
        <Typography component="summary">Вступившие: {invite.uses.length}</Typography>
        {invite.uses.length === 0 && <Typography color="text.secondary">Пока никто не вступил</Typography>}
        {invite.uses.map((use) => <Box key={use.userPublicId} sx={S.historySx}>
          <Typography>{use.userName}</Typography>
          <Typography variant="body2" color="text.secondary">{formatInviteDate(use.joinedAt)}</Typography>
        </Box>)}
        {invite.usedCount > invite.uses.length && <Typography color="text.secondary">История доступна для новых вступлений.</Typography>}
      </Box>
      <Dialog open={confirm !== null} onClose={() => setConfirm(null)}>
        <DialogTitle>{confirm === 'delete' ? 'Удалить приглашение?' : 'Заменить ссылку? Старая перестанет работать.'}</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirm(null)}>Отмена</Button>
          <Button onClick={() => { if (confirm === 'delete') onDelete(); else onRotate(); setConfirm(null); }}>Подтвердить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
