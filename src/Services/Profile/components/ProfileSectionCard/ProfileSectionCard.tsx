import type { ReactNode } from 'react';
import { Alert, Box, Paper } from '@mui/material';
import { ClipLoader } from 'react-spinners';
import { ProfileSectionHeader } from '../ProfileSectionHeader/ProfileSectionHeader';
import { ProfileSectionItem } from '../ProfileSectionItem/ProfileSectionItem';
import type { ProfileSectionItemData } from '../ProfileSectionItem/ProfileSectionItem.types';
import { PROFILE_SECTION_LOADER_SIZE } from './ProfileSectionCard.const';
import * as S from './ProfileSectionCard.styles';

type ProfileSectionCardProps = {
  title: string;
  actionLabel: string;
  actionIcon?: ReactNode;
  onAction?: () => void;
  itemIcon: ReactNode;
  items: ProfileSectionItemData[];
  isLoading: boolean;
  isError: boolean;
  errorText: string;
  emptyText: string;
};

export function ProfileSectionCard({
  title,
  actionLabel,
  actionIcon,
  onAction,
  itemIcon,
  items,
  isLoading,
  isError,
  errorText,
  emptyText,
}: ProfileSectionCardProps) {
  return (
    <Paper component="section" aria-label={title} elevation={0} sx={S.cardSx}>
      <ProfileSectionHeader title={title} actionLabel={actionLabel} actionIcon={actionIcon} onAction={onAction} />
      <Box sx={S.bodySx}>
        {isError ? (
          <Alert severity="error">{errorText}</Alert>
        ) : isLoading ? (
          <Box sx={S.loadingSx} role="status">
            <ClipLoader size={PROFILE_SECTION_LOADER_SIZE} color="var(--admin-primary)" />
          </Box>
        ) : (
          <Box component="ul" sx={S.listSx}>
            {items.length ? items.map((item) => (
              <ProfileSectionItem key={item.id} {...item} icon={itemIcon} />
            )) : (
              <ProfileSectionItem title={emptyText} icon={itemIcon} empty />
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
}
