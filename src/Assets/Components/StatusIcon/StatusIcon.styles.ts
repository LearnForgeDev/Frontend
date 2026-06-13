import type { SxProps, Theme } from '@mui/material';

export const styles: Record<string, SxProps<Theme>> = {
  icon: (color: string) => ({
    color,
    fontSize: "20px"
  }),
};
