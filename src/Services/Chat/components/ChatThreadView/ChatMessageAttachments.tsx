import { Box, Button, Typography } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AuthenticatedImage from '@/Assets/Components/AuthenticatedImage';
import type { ChatFileDto } from '../../Chat.types';
import { isImageFile } from './ChatThreadView.utils';
import { styles } from './ChatMessageAttachments.styles';

interface ChatMessageAttachmentsProps {
  files?: ChatFileDto[];
  schoolPublicId: string;
  compact?: boolean;
  onPreview: (filePublicId: string) => void;
  onDownload: (filePublicId: string, fileName?: string) => void;
}

export default function ChatMessageAttachments({ files, schoolPublicId, compact = false, onPreview, onDownload }: ChatMessageAttachmentsProps) {
  if (!files?.length) return null;
  return <Box sx={styles.root}>
    {files.map(file => <Box key={file.publicId} sx={styles.item}>
      {isImageFile(file.fileName) ? <AuthenticatedImage schoolPublicId={schoolPublicId} filePublicId={file.publicId || ''} alt={file.fileName}
        onClick={() => file.publicId && onPreview(file.publicId)} sx={styles.image(compact)} /> :
        <Button sx={styles.download} onClick={() => file.publicId && onDownload(file.publicId, file.fileName)}>
          <AttachFileIcon sx={styles.icon} /><Typography variant="caption" sx={styles.label}>{file.fileName || 'Вложенный файл'}</Typography>
        </Button>}
    </Box>)}
  </Box>;
}
