import { Box, Typography } from '@mui/material';

import { usePendingSchoolRequest } from '../../../../hooks/usePendingSchoolRequest';
import * as S from './PendingSchoolRequestWidget.styles';
import ClockIcon from "../../../../assets/images/ClockIcon.tsx";

export default function PendingSchoolRequestWidget() {
    const { pendingSchoolName, hasPendingSchoolRequest } = usePendingSchoolRequest();

    if (!hasPendingSchoolRequest) {
        return null;
    }

    return (
        <Box sx={S.container}>
            <Typography component="h2" sx={S.title}>
                <ClockIcon style={ S.icon } />
                Панель управления
            </Typography>
            <Typography sx={S.description}>
                {pendingSchoolName
                    ? `Заявка на школу "${pendingSchoolName}" отправлена и ожидает подтверждения.`
                    : 'Заявка на школу отправлена и ожидает подтверждения.'}
            </Typography>
        </Box>
    );
}
