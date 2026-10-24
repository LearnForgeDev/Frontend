import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import type { ApiFile } from '@/Endpoints';
import { useFilePreview } from '../../hooks/useFilePreview';
import ImagePreview from './ImagePreview';
import PdfPreview from './PdfPreview';
import FilePreviewLoading from './FilePreviewLoading';
import { FILE_PREVIEW_TEXT, FILE_PREVIEW_TITLE_ID } from './FilePreviewDialog.const';
import * as S from './FilePreviewDialog.styles';

type Props = {
  schoolPublicId: string;
  file: ApiFile;
  onClose: () => void;
  onDownload: (file: ApiFile) => void;
};

export default function FilePreviewDialog({ schoolPublicId, file, onClose, onDownload }: Props) {
  const preview = useFilePreview(schoolPublicId, file);
  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth aria-labelledby={FILE_PREVIEW_TITLE_ID}>
      <DialogTitle id={FILE_PREVIEW_TITLE_ID} sx={S.title}>{FILE_PREVIEW_TEXT.title}: {file.fileName}</DialogTitle>
      <DialogContent dividers sx={S.content}>
        {!preview.supported ? (
          <Typography sx={S.feedback}>{FILE_PREVIEW_TEXT.unsupported}</Typography>
        ) : preview.isLoading ? (
          <FilePreviewLoading />
        ) : preview.isError ? (
          <Box sx={S.feedback}>
            <Alert severity="error">{FILE_PREVIEW_TEXT.error}</Alert>
            <Button data-testid="file-preview-retry" onClick={preview.retry}>{FILE_PREVIEW_TEXT.retry}</Button>
          </Box>
        ) : preview.data && (
          <>
            {preview.category === 'text' && (
              <Box component="pre" sx={S.text}>{preview.data.text || FILE_PREVIEW_TEXT.empty}</Box>
            )}
            {preview.category === 'image' && (
              <ImagePreview blob={preview.data.blob} name={file.fileName} onError={preview.reportMediaError} />
            )}
            {preview.category === 'pdf' && (
              <PdfPreview blob={preview.data.blob} name={file.fileName} onError={preview.reportMediaError} />
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button data-testid="file-preview-download" onClick={() => onDownload(file)} variant="contained" startIcon={<DownloadIcon />}>{FILE_PREVIEW_TEXT.download}</Button>
        <Button data-testid="file-preview-close" onClick={onClose}>{FILE_PREVIEW_TEXT.close}</Button>
      </DialogActions>
    </Dialog>
  );
}
