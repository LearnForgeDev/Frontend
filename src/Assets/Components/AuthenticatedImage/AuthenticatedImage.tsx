import { useState, useEffect } from 'react';
import { Box, Skeleton, type SxProps, type Theme } from '@mui/material';
import BrokenImageIcon from '@mui/icons-material/BrokenImageIcon';
import { filesEndpoints } from '@/Endpoints';
import { styles } from './AuthenticatedImage.styles';

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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    let objectUrl: string | null = null;

    if (!schoolPublicId || !filePublicId) {
      setLoading(false);
      setError(true);
      return;
    }

    setLoading(true);
    setError(false);

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
        console.error('Failed to load authenticated image:', err);
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

  if (loading) {
    return <Skeleton variant="rectangular" sx={{ ...styles.image, ...sx }} />;
  }

  if (error || !imgSrc) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'action.disabledBackground',
          color: 'text.disabled',
          p: 1,
          borderRadius: 1,
          ...sx,
        }}
      >
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
      sx={{ ...styles.image, ...sx }}
    />
  );
}
