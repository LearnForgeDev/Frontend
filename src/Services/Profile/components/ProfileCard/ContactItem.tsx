import type { ContactItemProps } from './ContactItem.type';
export type { ContactItemProps } from './ContactItem.type';
import type { FC } from 'react';

import { Box, Typography } from '@mui/material';
import { contactItemSx, contactTextSx } from './ProfileCard.styles';

export const ContactItem: FC<ContactItemProps> = ({ icon, text }) => {
  return (
    <Box sx={contactItemSx}>
      {icon}
      <Typography sx={contactTextSx}>
        {text}
      </Typography>
    </Box>
  );
};
