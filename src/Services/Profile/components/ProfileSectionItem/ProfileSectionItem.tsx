import type { ReactNode } from 'react';
import { Box, Button, Typography } from '@mui/material';
import type { ProfileSectionItemData } from './ProfileSectionItem.types';
import * as S from './ProfileSectionItem.styles';

type ProfileSectionItemProps = Omit<ProfileSectionItemData, 'id'> & {
  icon: ReactNode;
  empty?: boolean;
};

export function ProfileSectionItem({ title, details, actionLabel, onAction, icon, empty = false }: ProfileSectionItemProps) {
  return (
    <Box component="li" sx={S.itemSx}>
      <Box sx={S.iconSx}>{icon}</Box>
      <Box sx={S.contentSx}>
        <Typography component={empty ? 'p' : 'h3'} sx={empty ? S.emptyTitleSx : S.titleSx}>
          {title}
        </Typography>
        {details && <Typography sx={S.detailsSx}>{details}</Typography>}
        {onAction && actionLabel && (
          <Button variant="outlined" size="small" sx={S.actionSx} onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </Box>
    </Box>
  );
}
