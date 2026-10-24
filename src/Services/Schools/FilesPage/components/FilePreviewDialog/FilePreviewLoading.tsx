import { Box, Typography } from '@mui/material';
import { ClipLoader } from 'react-spinners';
import { FILE_PREVIEW_SPINNER_SIZE, FILE_PREVIEW_TEXT } from './FilePreviewDialog.const';
import * as S from './FilePreviewDialog.styles';

export default function FilePreviewLoading() {
  return (
    <Box sx={S.feedback} role="status">
      <ClipLoader size={FILE_PREVIEW_SPINNER_SIZE} color="var(--app-primary)" />
      <Typography>{FILE_PREVIEW_TEXT.loading}</Typography>
    </Box>
  );
}
