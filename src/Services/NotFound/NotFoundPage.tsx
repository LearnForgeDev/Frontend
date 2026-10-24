import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { NOT_FOUND_TEXT } from './NotFoundPage.const';
import { containerStyles, titleStyles, subtitleStyles, descriptionStyles } from './NotFoundPage.styles';

export default function NotFoundPage() {
  return (
    <Box sx={containerStyles}>
      <Typography variant="h1" color="primary" sx={titleStyles}>{NOT_FOUND_TEXT.code}</Typography>
      <Typography variant="h4" sx={subtitleStyles}>{NOT_FOUND_TEXT.title}</Typography>
      <Typography variant="body1" color="text.secondary" sx={descriptionStyles}>
        {NOT_FOUND_TEXT.description}
      </Typography>
      <Button component={Link} to="/app" variant="contained">{NOT_FOUND_TEXT.home}</Button>
    </Box>
  );
}
