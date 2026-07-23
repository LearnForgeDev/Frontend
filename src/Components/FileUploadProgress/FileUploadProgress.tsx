import { Box, Typography, LinearProgress, Paper } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export interface UploadItemProgress {
  id: string;
  fileName: string;
  sizeBytes?: number;
  progress: number; // 0 to 100
  status: 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}

interface FileUploadProgressProps {
  items: UploadItemProgress[];
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUploadProgress({ items }: FileUploadProgressProps) {
  if (items.length === 0) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1400,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        maxWidth: 380,
        width: 'calc(100vw - 48px)',
      }}
    >
      {items.map((item) => {
        const isComplete = item.status === 'completed';
        const isError = item.status === 'error';

        return (
          <Paper
            key={item.id}
            elevation={4}
            sx={{
              p: 2,
              borderRadius: 2.5,
              backdropFilter: 'blur(12px)',
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(30, 30, 40, 0.9)'
                  : 'rgba(255, 255, 255, 0.9)',
              border: '1px solid',
              borderColor: (theme) =>
                isError
                  ? theme.palette.error.main
                  : isComplete
                  ? theme.palette.success.main
                  : theme.palette.primary.main,
              boxShadow: (theme) =>
                isComplete
                  ? `0 4px 20px ${theme.palette.success.main}33`
                  : `0 4px 20px ${theme.palette.primary.main}22`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: 'fadeInUp 0.3s ease-out forwards',
              '@keyframes fadeInUp': {
                from: { opacity: 0, transform: 'translateY(12px) scale(0.96)' },
                to: { opacity: 1, transform: 'translateY(0) scale(1)' },
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: (theme) =>
                    isError
                      ? `${theme.palette.error.main}15`
                      : isComplete
                      ? `${theme.palette.success.main}15`
                      : `${theme.palette.primary.main}15`,
                  color: (theme) =>
                    isError
                      ? theme.palette.error.main
                      : isComplete
                      ? theme.palette.success.main
                      : theme.palette.primary.main,
                  animation: !isComplete && !isError ? 'pulse 1.5s ease-in-out infinite' : 'none',
                  '@keyframes pulse': {
                    '0%, 100%': { transform: 'scale(1)', opacity: 0.8 },
                    '50%': { transform: 'scale(1.1)', opacity: 1 },
                  },
                }}
              >
                {isComplete ? (
                  <CheckCircleIcon fontSize="small" />
                ) : (
                  <CloudUploadIcon fontSize="small" />
                )}
              </Box>

              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle2"
                  noWrap
                  sx={{ fontWeight: 600, fontSize: '0.875rem' }}
                >
                  {item.fileName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isError
                    ? item.errorMessage || 'Ошибка загрузки'
                    : isComplete
                    ? 'Загружено в S3 облако'
                    : `${formatFileSize(item.sizeBytes)} • ${item.progress}%`}
                </Typography>
              </Box>

              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  color: isError
                    ? 'error.main'
                    : isComplete
                    ? 'success.main'
                    : 'primary.main',
                }}
              >
                {item.progress}%
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={item.progress}
              color={isError ? 'error' : isComplete ? 'success' : 'primary'}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  transition: 'transform 0.2s linear',
                  backgroundImage: !isComplete && !isError
                    ? 'linear-gradient(90deg, #3f51b5 0%, #2196f3 50%, #00bcd4 100%)'
                    : undefined,
                },
              }}
            />
          </Paper>
        );
      })}
    </Box>
  );
}
