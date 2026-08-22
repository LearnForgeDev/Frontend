import { Box, Button, LinearProgress, Paper, Typography } from '@mui/material';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { getUploadStatusText } from './FileUploadProgress.utils';
import * as S from './FileUploadProgress.styles';

export interface UploadItemProgress {
  id: string;
  fileName: string;
  sizeBytes?: number;
  progress: number;
  status: 'uploading' | 'completed' | 'error' | 'cancelled';
  errorMessage?: string;
}

interface FileUploadProgressProps {
  items: UploadItemProgress[];
  onCancel: (uploadId: string) => void;
}

export default function FileUploadProgress({
  items,
  onCancel,
}: FileUploadProgressProps) {
  if (items.length === 0) return null;

  return (
    <Box sx={S.rootSx}>
      {items.map((item) => {
        const isComplete = item.status === 'completed';
        const isCancelled = item.status === 'cancelled';

        return (
          <Paper key={item.id} elevation={4} sx={S.getItemSx(item.status)}>
            <Box sx={S.headerSx}>
              <Box sx={S.getIconSx(item.status)}>
                {isComplete && <CheckCircleIcon fontSize="small" />}
                {isCancelled && <CancelRoundedIcon fontSize="small" />}
                {!isComplete && !isCancelled && <CloudUploadIcon fontSize="small" />}
              </Box>

              <Box sx={S.fileInfoSx}>
                <Typography variant="subtitle2" noWrap sx={S.fileNameSx}>
                  {item.fileName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {getUploadStatusText(item)}
                </Typography>
              </Box>

              {item.status === 'uploading' ? (
                <Button
                  size="small"
                  startIcon={<CancelRoundedIcon />}
                  onClick={() => onCancel(item.id)}
                  sx={S.cancelButtonSx}
                >
                  Отменить
                </Button>
              ) : (
                <Typography variant="caption" sx={S.getPercentSx(item.status)}>
                  {item.progress}%
                </Typography>
              )}
            </Box>

            <LinearProgress
              variant="determinate"
              value={item.progress}
              color={item.status === 'error' ? 'error' : isComplete ? 'success' : 'primary'}
              sx={S.progressSx}
            />
          </Paper>
        );
      })}
    </Box>
  );
}
