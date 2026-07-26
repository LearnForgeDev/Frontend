import { useState, useEffect } from 'react';
import { Box, Skeleton, type SxProps, type Theme } from '@mui/material';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import { filesEndpoints } from '@/Endpoints';
import { styles } from './AuthenticatedImage.styles';
import { createDebugger, DebugSeverity } from '@/Assets/debugUtils';
const logger = createDebugger('AuthenticatedImage');


interface AuthenticatedImageProps {
  schoolPublicId: string;
  filePublicId: string;
  alt?: string;
  sx?: SxProps<Theme>;
  onClick?: () => void;
}

export default function AuthenticatedImage({
  schoolPublicId,
  filePublicId,
  alt = '',
  sx,
  onClick,
}: AuthenticatedImageProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(schoolPublicId && filePublicId));
  const [error, setError] = useState<boolean>(!schoolPublicId || !filePublicId);

  useEffect(() => {
    if (!schoolPublicId || !filePublicId) {
      return;
    }

    let isMounted = true;
    let objectUrl: string | null = null;

    filesEndpoints
      .getFileBlob(schoolPublicId, filePublicId)
      .then((blob) => {
        if (!isMounted) return;
        objectUrl = URL.createObjectURL(blob);
        setImgSrc(objectUrl);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        logger.logEventForDebug(DebugSeverity.DANGER, 'Failed to load authenticated image:', err);
        setError(true);
        setLoading(false);
      });

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [schoolPublicId, filePublicId]);

  const combinedImageSx: SxProps<Theme> = Array.isArray(sx)
    ? [styles.image, ...sx]
    : [styles.image, sx];

  const combinedErrorSx: SxProps<Theme> = Array.isArray(sx)
    ? [
        {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'action.disabledBackground',
          color: 'text.disabled',
          p: 1,
          borderRadius: 1,
        },
        ...sx,
      ]
    : [
        {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'action.disabledBackground',
          color: 'text.disabled',
          p: 1,
          borderRadius: 1,
        },
        sx,
      ];

  if (loading) {
    return <Skeleton variant="rectangular" sx={combinedImageSx} />;
  }

  if (error || !imgSrc) {
    return (
      <Box sx={combinedErrorSx}>
        <BrokenImageIcon fontSize="small" />
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={imgSrc}
      alt={alt}
      onClick={onClick}
      sx={combinedImageSx}
    />
  );
}
