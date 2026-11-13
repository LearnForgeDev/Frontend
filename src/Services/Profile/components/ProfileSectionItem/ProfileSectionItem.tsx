import type { ProfileSectionItemProps } from './ProfileSectionItem.type';

import { Box, Button, Typography } from '@mui/material';

import * as S from './ProfileSectionItem.styles';

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
