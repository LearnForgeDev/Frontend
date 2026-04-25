import { Box, Paper } from '@mui/material';
import { Outlet } from 'react-router-dom';
import * as S from './AuthLayout.styles';

export default function AuthLayout() {
    return (
        <Box sx={S.container}>
            <Paper elevation={3} sx={S.paper}>
                <Outlet />
            </Paper>
        </Box>
    );
}
