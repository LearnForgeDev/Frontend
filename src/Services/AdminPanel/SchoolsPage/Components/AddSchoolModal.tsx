import { Dialog, DialogTitle, DialogContent, Typography } from '@mui/material';
import RequestSchoolForm from '@/Services/Onboarding/components/RequestSchoolForm/RequestSchoolForm';
import * as S from './AddSchoolModal.styles';

type AddSchoolModalProps = { open: boolean; onClose: () => void };

export default function AddSchoolModal({ open, onClose }: AddSchoolModalProps) {
  return <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Добавить школу</DialogTitle>
    <DialogContent>
      <Typography sx={S.hintSx}>Чтобы вступить в школу, откройте ссылку приглашения.</Typography>
      <RequestSchoolForm />
    </DialogContent>
  </Dialog>;
}
