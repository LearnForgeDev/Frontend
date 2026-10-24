import { Button, Typography } from '@mui/material';
import { useAcceptInvite } from '../../hooks/useAcceptInvite';
import * as S from './JoinSchoolForm.styles';

type JoinSchoolFormProps = { knownSchoolPublicIds: string[]; initialInviteToken?: string; disabled?: boolean };

export default function JoinSchoolForm({ knownSchoolPublicIds, initialInviteToken = '', disabled = false }: JoinSchoolFormProps) {
  const join = useAcceptInvite(initialInviteToken, knownSchoolPublicIds);
  if (!initialInviteToken) return <Typography sx={S.helperText}>Откройте ссылку приглашения от преподавателя или владельца школы.</Typography>;
  return <form onSubmit={join.submit}>
    <Typography sx={S.helperText}>Вас пригласили в школу.</Typography>
    {join.isError && <Typography color="error" role="alert">Не удалось вступить. Ссылка могла истечь, быть удалена или исчерпать лимит.</Typography>}
    <Button type="submit" variant="contained" fullWidth disabled={disabled || join.isPending} sx={S.submitButton}>
      {join.isPending ? 'Присоединяем…' : 'Вступить в школу'}
    </Button>
  </form>;
}
