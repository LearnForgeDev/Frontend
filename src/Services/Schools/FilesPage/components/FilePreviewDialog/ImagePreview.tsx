import { Box } from '@mui/material';
import { usePreviewMedia } from '../../hooks/usePreviewMedia';
import FilePreviewLoading from './FilePreviewLoading';
import * as S from './FilePreviewDialog.styles';

export default function ImagePreview({ blob, name, onError }: { blob: Blob; name: string; onError: () => void }) {
  const { mediaRef, isLoading, onLoad } = usePreviewMedia<HTMLImageElement>(blob);
  return (
    <Box sx={S.media}>
      {isLoading && <FilePreviewLoading />}
      <Box component="img" ref={mediaRef} alt={name} onLoad={onLoad} onError={onError} sx={S.image} />
    </Box>
  );
}
