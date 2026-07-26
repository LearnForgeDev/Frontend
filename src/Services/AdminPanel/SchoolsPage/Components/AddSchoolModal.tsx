import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, Typography, Box,
  TextField, Button, Divider, IconButton
} from '@mui/material';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { useJoinSchool } from '../hooks/useJoinSchool';
import { useCreateSchool } from '../hooks/useCreateSchool';
import { useToast } from '@/Storage/useToastStore';

interface AddSchoolModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddSchoolModal({ open, onClose }: AddSchoolModalProps) {
  const [inviteToken, setInviteToken] = useState("");
  const [newSchoolName, setNewSchoolName] = useState("");
  const toast = useToast();

  const { mutate: joinSchool, isPending: isJoining } = useJoinSchool();
  const { mutate: createSchool, isPending: isCreating } = useCreateSchool();

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInviteToken(text);
    } catch {
      toast.error("Не удалось прочитать буфер обмена");
    }
  };

  const handleJoinSchool = () => {
    if (inviteToken.trim().length === 0) {
      toast.warning("Введите корректный токен приглашения");
      return;
    }

    joinSchool(inviteToken.trim(), {
      onSuccess: () => {
        setInviteToken("");
        toast.success("Вы успешно присоединились к школе");
        onClose();
      },
      onError: () => {
        toast.error("Не удалось присоединиться к школе");
      },
    });
  };

  const handleCreateSchool = () => {
    if (newSchoolName.trim().length === 0) {
      toast.warning("Введите название школы");
      return;
    }

    createSchool(newSchoolName.trim(), {
      onSuccess: () => {
        setNewSchoolName("");
        toast.success("Заявка на создание школы отправлена");
        onClose();
      },
      onError: () => {
        toast.error("Не удалось создать школу");
      },
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: '1rem' } } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>Добавить школу</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "var(--admin-muted)" }}>
              Присоединиться по коду
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Введите код приглашения"
                value={inviteToken}
                onChange={e => setInviteToken(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }}
              />
              <IconButton onClick={handlePaste} title="Вставить из буфера" sx={{ border: '1px solid var(--admin-outline)', borderRadius: '0.75rem' }}>
                <ContentPasteIcon fontSize="small" />
              </IconButton>
              <IconButton
                disabled={isJoining}
                onClick={handleJoinSchool}
                title="Присоединиться"
                sx={{
                  borderRadius: '0.75rem',
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': { backgroundColor: 'primary.dark' },
                  '&.Mui-disabled': { backgroundColor: 'action.disabledBackground', color: 'action.disabled' }
                }}
              >
                <ArrowForward fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Divider sx={{ color: 'var(--admin-muted)' }}>или</Divider>

          <Box sx={{ pb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "var(--admin-muted)" }}>
              Создайте новую школу
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Название школы"
                value={newSchoolName}
                onChange={e => setNewSchoolName(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }}
              />
              <Button
                variant="contained"
                disabled={isCreating}
                onClick={handleCreateSchool}
                sx={{ borderRadius: '0.75rem', textTransform: 'none', px: 3, boxShadow: 'none' }}
                disableElevation
              >
                {isCreating ? "..." : "Создать"}
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
