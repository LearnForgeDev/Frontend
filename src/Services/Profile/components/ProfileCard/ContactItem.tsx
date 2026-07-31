import React from 'react';
import { Box, Typography } from '@mui/material';
import { contactItemSx, contactTextSx } from './ProfileCard.styles';

export interface ContactItemProps {
  icon: React.ReactNode;
  text: string;
}

export const ContactItem: React.FC<ContactItemProps> = ({ icon, text }) => {
  return (
    <Box sx={contactItemSx}>
      {icon}
      <Typography sx={contactTextSx}>
        {text}
      </Typography>
    </Box>
  );
};
