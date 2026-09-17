import { useState } from 'react';
import {
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import type { MemberDto } from '@/Endpoints/schools/types';
import {
  CALLS_INVITE_DIALOG_ALL_TEXT,
  CALLS_INVITE_DIALOG_CANCEL_TEXT,
  CALLS_INVITE_DIALOG_EMPTY_TEXT,
  CALLS_INVITE_DIALOG_SUBMIT_TEXT,
  CALLS_INVITE_DIALOG_TITLE,
} from './CallsInviteDialog.const';
import { styles } from './CallsInviteDialog.styles';

interface CallsInviteDialogProps {
  open: boolean;
  recipients: MemberDto[];
  isPending: boolean;
  onClose: () => void;
  onInvite: (recipientUserPublicIds: string[]) => void;
}

export default function CallsInviteDialog({
  open,
  recipients,
  isPending,
  onClose,
  onInvite,
}: CallsInviteDialogProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const isAllSelected = recipients.length > 0 && selectedIds.length === recipients.length;

  const toggleRecipient = (userPublicId: string) => {
    setSelectedIds((prev) => (
      prev.includes(userPublicId)
        ? prev.filter((selectedId) => selectedId !== userPublicId)
        : [...prev, userPublicId]
    ));
  };

  const toggleAll = () => {
    setSelectedIds(isAllSelected ? [] : recipients.map((recipient) => recipient.userPublicId));
  };

  const handleInvite = () => {
    onInvite(selectedIds);
  };

  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{CALLS_INVITE_DIALOG_TITLE}</DialogTitle>
      <DialogContent sx={styles.content}>
        {recipients.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={styles.emptyText}>
            {CALLS_INVITE_DIALOG_EMPTY_TEXT}
          </Typography>
        ) : (
          <List sx={styles.list} disablePadding>
            <ListItemButton onClick={toggleAll} disabled={isPending}>
              <ListItemIcon>
                <Checkbox edge="start" checked={isAllSelected} indeterminate={selectedIds.length > 0 && !isAllSelected} tabIndex={-1} />
              </ListItemIcon>
              <ListItemText primary={CALLS_INVITE_DIALOG_ALL_TEXT} />
            </ListItemButton>
            {recipients.map((recipient) => (
              <ListItemButton key={recipient.userPublicId} onClick={() => toggleRecipient(recipient.userPublicId)} disabled={isPending}>
                <ListItemIcon>
                  <Checkbox edge="start" checked={selectedIds.includes(recipient.userPublicId)} tabIndex={-1} />
                </ListItemIcon>
                <ListItemText primary={recipient.displayName} />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          {CALLS_INVITE_DIALOG_CANCEL_TEXT}
        </Button>
        <Button
          variant="contained"
          onClick={handleInvite}
          disabled={isPending || selectedIds.length === 0}
          startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {CALLS_INVITE_DIALOG_SUBMIT_TEXT}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
