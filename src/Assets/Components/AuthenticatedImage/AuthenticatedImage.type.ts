import type { SxProps, Theme } from '@mui/material';

export interface AuthenticatedImageProps {
  schoolPublicId: string;
  filePublicId: string;
  alt?: string;
  sx?: SxProps<Theme>;
  onClick?: () => void;
}
