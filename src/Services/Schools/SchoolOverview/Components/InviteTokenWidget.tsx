import { useState, type FormEvent } from 'react';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Dialog,
  IconButton,
  MenuItem,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import { QRCodeSVG } from 'qrcode.react';
import { AuthRole } from '@/Assets/Types/commonTypes';
import { useCurrentSchool } from '@/Services/AppShell/hooks/useCurrentSchool';
import { useCreateInvite } from '@/Services/Schools/StudentsPage/hooks/useCreateInvite';
import {
  COPY_FEEDBACK_DURATION_MS,
  DEFAULT_INVITE_EXPIRATION_HOURS,
  DEFAULT_INVITE_MAX_USES,
  MAX_INVITE_EXPIRATION_HOURS,
  MAX_INVITE_USES,
  MIN_INVITE_EXPIRATION_HOURS,
  MIN_INVITE_USES,
  MINUTES_IN_HOUR,
} from '@/Services/Schools/StudentsPage/Components/InviteWidget.const';
import * as S from '@/Services/Schools/StudentsPage/Components/InviteWidget.styles';

type InviteTokenWidgetProps = {
  schoolPublicId: string;
};

export function InviteTokenWidget({ schoolPublicId }: InviteTokenWidgetProps) {
  const { capabilities } = useCurrentSchool();
  const createInvite = useCreateInvite();
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState<AuthRole>(AuthRole.STUDENT);
  const [maxUses, setMaxUses] = useState(DEFAULT_INVITE_MAX_USES);
  const [expirationHours, setExpirationHours] = useState(DEFAULT_INVITE_EXPIRATION_HOURS);
  const [isCopied, setIsCopied] = useState(false);
  const token = createInvite.data;
  const inviteUrl = token
    ? `${window.location.origin}/onboarding?invite=${encodeURIComponent(token)}`
    : '';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createInvite.mutate({
      schoolPublicId,
      role,
      maxUses,
      expiresInMinutes: expirationHours * MINUTES_IN_HOUR,
    });
  };

  const handleCopy = async () => {
    if (!inviteUrl) {
      return;
    }

    await navigator.clipboard.writeText(inviteUrl);
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), COPY_FEEDBACK_DURATION_MS);
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<AddRoundedIcon />}
        onClick={() => setIsOpen(true)}
      >
        Пригласить в школу
      </Button>

      <Dialog fullScreen open={isOpen} onClose={() => setIsOpen(false)}>
        <AppBar position="sticky" color="inherit" elevation={0} sx={S.appBarSx}>
          <Toolbar sx={S.toolbarSx}>
            <IconButton edge="start" onClick={() => setIsOpen(false)} aria-label="Закрыть">
              <CloseRoundedIcon />
            </IconButton>
            <Typography component="h2" sx={S.dialogTitleSx}>Пригласить в школу</Typography>
          </Toolbar>
        </AppBar>

        <Box sx={S.dialogContentSx}>
          <Box component="section" sx={S.cardSx}>
            <Box sx={S.headerSx}>
              <Typography sx={S.subtitleSx}>
                Создайте ссылку или покажите QR-код. Срок и лимит помогут контролировать доступ.
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={S.fieldsSx}>
              <TextField
                select
                label="Роль"
                value={role}
                onChange={(event) => setRole(Number(event.target.value) as AuthRole)}
              >
                <MenuItem value={AuthRole.STUDENT}>Ученик</MenuItem>
                {capabilities.canManageSchool && <MenuItem value={AuthRole.TEACHER}>Преподаватель</MenuItem>}
              </TextField>
              <TextField
                type="number"
                label="Количество входов"
                value={maxUses}
                onChange={(event) => setMaxUses(Number(event.target.value))}
                slotProps={{ htmlInput: { min: MIN_INVITE_USES, max: MAX_INVITE_USES } }}
              />
              <TextField
                type="number"
                label="Срок, часов"
                value={expirationHours}
                onChange={(event) => setExpirationHours(Number(event.target.value))}
                slotProps={{ htmlInput: { min: MIN_INVITE_EXPIRATION_HOURS, max: MAX_INVITE_EXPIRATION_HOURS } }}
              />
              <Button
                type="submit"
                variant="contained"
                startIcon={<LinkRoundedIcon />}
                disabled={createInvite.isPending}
                sx={S.submitButtonSx}
              >
                {createInvite.isPending ? 'Создаём приглашение…' : 'Создать приглашение'}
              </Button>
            </Box>

            {createInvite.isError && (
              <Alert severity="error" sx={S.errorSx}>
                Не удалось создать приглашение. Попробуйте ещё раз.
              </Alert>
            )}

            {token && (
              <Box sx={S.resultSx}>
                <Box sx={S.qrSx}>
                  <QRCodeSVG value={inviteUrl} size={136} level="M" title="QR-код приглашения" />
                </Box>
                <Box>
                  <Typography sx={S.resultTitleSx}>Приглашение готово</Typography>
                  <Typography sx={S.tokenSx}>{token}</Typography>
                  <Button startIcon={<ContentCopyRoundedIcon />} onClick={handleCopy} sx={S.copyButtonSx}>
                    {isCopied ? 'Ссылка скопирована' : 'Скопировать ссылку'}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Dialog>
    </>
  );
}
