import { Alert, Box, Button, Typography } from '@mui/material';
import { ClipLoader } from 'react-spinners';
import { useInviteManagement } from '../hooks/useInviteManagement';
import InviteListItem from './InviteListItem';
import { getInviteUrl } from './InviteWidget.utils';
import * as S from './InviteWidget.styles';

export default function InviteList({ schoolPublicId }: { schoolPublicId: string }) {
  const { invites, update, revoke, rotate, copy } = useInviteManagement(schoolPublicId);
  const pending = update.isPending || revoke.isPending || rotate.isPending;
  return <Box sx={S.listSx}>
    <Typography component="h2" variant="h6">Приглашения</Typography>
    {invites.isPending && <Box role="status" aria-label="Загрузка приглашений"><ClipLoader color="var(--app-text-muted)" /></Box>}
    {invites.isError && <Alert severity="error">Не удалось загрузить приглашения. <Button onClick={() => void invites.refetch()}>Повторить</Button></Alert>}
    {!invites.isError && invites.data?.length === 0 && <Typography color="text.secondary">Приглашений пока нет</Typography>}
    {rotate.data && <Box sx={S.cardSx}>
      <Typography sx={S.tokenSx}>{getInviteUrl(rotate.data.inviteToken)}</Typography>
      <Button onClick={() => void copy(rotate.data.inviteToken)}>Скопировать новую ссылку</Button>
    </Box>}
    {invites.data?.map((invite) => <InviteListItem key={`${invite.id}-${invite.expiresAt}-${invite.maxUses}`} invite={invite} pending={pending}
      onSave={(input) => update.mutate({ id: invite.id, input })}
      onDelete={() => revoke.mutate(invite.id)} onRotate={() => rotate.mutate(invite.id)} />)}
  </Box>;
}
