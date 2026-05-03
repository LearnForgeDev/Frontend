import { Box, Paper } from '@mui/material';
import { Outlet } from 'react-router-dom';

import PendingSchoolRequestWidget from '../../Components/PendingSchoolRequestWidget';
import { AuthFlowProvider, useAuthFlow } from '../../contexts/AuthFlowContext';
import * as S from './AuthLayout.styles';

function AuthLayoutContent() {
    const { pendingSchoolName, hasPendingSchoolRequest, clearPendingSchoolRequest } = useAuthFlow();

    return (
        <Box sx={S.container}>
            <Paper elevation={3} sx={S.paper}>
                {hasPendingSchoolRequest && (
                    <Box sx={S.widgetContainer}>
                        <PendingSchoolRequestWidget
                            schoolName={pendingSchoolName}
                            onDismiss={clearPendingSchoolRequest}
                        />
                    </Box>
                )}
                <Outlet />
            </Paper>
        </Box>
    );
}

export default function AuthLayout() {
    return (
        <AuthFlowProvider>
            <AuthLayoutContent />
        </AuthFlowProvider>
    );
}
