import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { JSX } from 'react';
import { containerStyles, titleStyles, subtitleStyles, descriptionStyles } from './NotFoundPage.styles';

const NotFoundPage = (): JSX.Element => {
    const navigate = useNavigate();

    return (
        <Box sx={containerStyles}>
            <Typography variant="h1" color="primary" sx={titleStyles}>
                404
            </Typography>
            <Typography variant="h4" sx={subtitleStyles}>
                Страница не найдена
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={descriptionStyles}>
                Страница, которую вы ищете, могла быть удалена или пермещена
            </Typography>
            <Button variant="contained" color="primary" onClick={() => navigate(-1)}>
                Вернуться назад
            </Button>
        </Box>
    );
};

export default NotFoundPage;
