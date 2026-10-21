import { Box } from '@mui/material';
import { usePreviewMedia } from '../../hooks/usePreviewMedia';
import FilePreviewLoading from './FilePreviewLoading';
import * as S from './FilePreviewDialog.styles';

export default function PdfPreview({ blob, name, onError }: { blob: Blob; name: string; onError: () => void }) {
  const { mediaRef, isLoading, onLoad } = usePreviewMedia<HTMLIFrameElement>(blob);
  return (
    <Box sx={S.media}>
      {isLoading && <FilePreviewLoading />}
      <Box component="iframe" ref={mediaRef} title={name} onLoad={onLoad} onError={onError} sx={S.pdf} />
    </Box>
  );
}
