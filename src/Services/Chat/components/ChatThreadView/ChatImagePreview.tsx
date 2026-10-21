import { Dialog } from '@mui/material';
import AuthenticatedImage from '@/Assets/Components/AuthenticatedImage';
import { styles } from './ChatImagePreview.styles';

interface ChatImagePreviewProps {
  schoolPublicId: string;
  filePublicId: string | null;
  onClose: () => void;
}

export default function ChatImagePreview({ schoolPublicId, filePublicId, onClose }: ChatImagePreviewProps) {
  return <Dialog open={Boolean(filePublicId)} onClose={onClose} maxWidth="md" fullWidth slotProps={{ paper: { sx: styles.paper } }}>
    {filePublicId && <AuthenticatedImage schoolPublicId={schoolPublicId} filePublicId={filePublicId} alt="Предпросмотр изображения" sx={styles.image} onClick={onClose} />}
  </Dialog>;
}
