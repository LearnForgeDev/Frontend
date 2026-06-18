import { type JSX } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import art403 from '@/Assets/Art/403-art.jpg';

import { containerStyles, titleStyles, imageStyles } from './ForbiddenPage.styles.ts';

const ForbiddenPage = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <Box sx={containerStyles}>
      <Typography variant="h1" sx={titleStyles}>
        Доступ ограничен
      </Typography>
      <Box
        component="img"
        src={art403}
        alt="403 Access Denied"
        sx={imageStyles}
      />
      <Button variant="contained" onClick={() => navigate('/')}>
        На главную
      </Button>
    </Box>
  );
};

export default ForbiddenPage;
