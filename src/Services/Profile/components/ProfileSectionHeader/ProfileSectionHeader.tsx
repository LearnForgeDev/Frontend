import type { ReactNode } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import * as S from './ProfileSectionHeader.styles';

type ProfileSectionHeaderProps = {
  title: string;
  actionLabel: string;
  onAction?: () => void;
  actionIcon?: ReactNode;
};

export function ProfileSectionHeader({ title, actionLabel, onAction, actionIcon }: ProfileSectionHeaderProps) {
  return (
    <Box sx={S.headerSx}>
      <Typography component="h2" sx={S.titleSx}>{title}</Typography>
      {onAction && (
        <Tooltip title={actionLabel}>
          <IconButton aria-label={actionLabel} onClick={onAction} sx={S.addButtonSx}>
            {actionIcon ?? <AddRoundedIcon />}
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
