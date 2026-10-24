import { Box, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FileUploadProgress from '@/Assets/Components/FileUploadProgress/FileUploadProgress';
import { useFilesPage } from '../hooks/useFilesPage';
import { styles } from '../FilesPage.styles';
import FilesToolbar from './FilesToolbar';
import FilesList from './FilesList';
import FileDeleteDialog from './FileDeleteDialog';
import FilePreviewDialog from './FilePreviewDialog/FilePreviewDialog';

export default function FilesWorkspace({ schoolPublicId }: { schoolPublicId: string }) {
  const page = useFilesPage(schoolPublicId);
  return (
    <Box data-testid="files-dropzone" sx={styles.container} onDragEnter={page.handleDrag} onDragOver={page.handleDrag} onDragLeave={page.handleDrag} onDrop={page.handleDrop}>
      <FilesToolbar {...page} />
      {page.dragActive && (
        <Box sx={styles.dropZone}>
          <CloudUploadIcon sx={styles.dropZoneIcon} />
          <Typography variant="body1" sx={styles.dropZoneTitle}>Перетащите файлы сюда для быстрой загрузки</Typography>
        </Box>
      )}
      <FilesList {...page} />
      <FileDeleteDialog {...page} />
      {page.previewFile && (
        <FilePreviewDialog key={page.previewFile.publicId} schoolPublicId={schoolPublicId} file={page.previewFile} onClose={page.handleClosePreview} onDownload={page.handleDownloadFile} />
      )}
      <FileUploadProgress items={page.uploadItems} onCancel={page.handleCancelUpload} />
    </Box>
  );
}
