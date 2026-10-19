import { useState } from 'react';
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
import { useInviteCreationForm } from '@/Services/Schools/StudentsPage/hooks/useInviteCreationForm';
import { QRCodeSVG } from 'qrcode.react';
import { AuthRole } from '@/Assets/Types/commonTypes';
import { useCurrentSchool } from '@/Services/AppShell/hooks/useCurrentSchool';
import {
  MAX_INVITE_EXPIRATION_HOURS,
  MAX_INVITE_USES,
  MIN_INVITE_EXPIRATION_HOURS,
  MIN_INVITE_USES,
} from '@/Services/Schools/StudentsPage/Components/InviteWidget.const';
import * as S from '@/Services/Schools/StudentsPage/Components/InviteWidget.styles';

type InviteTokenWidgetProps = {
  schoolPublicId: string;
};

export function InviteTokenWidget({ schoolPublicId }: InviteTokenWidgetProps) {
  const { capabilities } = useCurrentSchool();
  const [isOpen, setIsOpen] = useState(false);
  const { fields, change, submit, createInvite, copy, inviteUrl } = useInviteCreationForm(schoolPublicId);
  const { role, maxUses, expirationHours } = fields;
  const token = createInvite.data;

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

            <Box component="form" onSubmit={submit} sx={S.fieldsSx}>
              <TextField
                select
                label="Роль"
                value={role}
                onChange={(event) => change({ role: Number(event.target.value) as AuthRole })}
              >
                <MenuItem value={AuthRole.STUDENT}>Ученик</MenuItem>
                {capabilities.canManageSchool && <MenuItem value={AuthRole.TEACHER}>Преподаватель</MenuItem>}
              </TextField>
              <TextField
                type="number"
                required
                label="Лимит использований"
                value={maxUses}
                onChange={(event) => change({ maxUses: Number(event.target.value) })}
                slotProps={{ htmlInput: { min: MIN_INVITE_USES, max: MAX_INVITE_USES } }}
              />
              <TextField
                type="number"
                required
                label="Срок, часов"
                value={expirationHours}
                onChange={(event) => change({ expirationHours: Number(event.target.value) })}
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
                  <Typography sx={S.tokenSx}>{inviteUrl}</Typography>
                  <Button startIcon={<ContentCopyRoundedIcon />} onClick={() => token && void copy(token)} sx={S.copyButtonSx}>
                    Скопировать ссылку
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
