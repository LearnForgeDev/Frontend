import { Alert, Button } from '@mui/material';

import * as S from './PendingSchoolRequestWidget.styles';

type PendingSchoolRequestWidgetProps = {
    schoolName: string;
    onDismiss: () => void;
};

export default function PendingSchoolRequestWidget({ schoolName, onDismiss }: PendingSchoolRequestWidgetProps) {
    const message = schoolName
        ? `Заявка на школу "${schoolName}" отправлена и ожидает подтверждения.`
        : 'Заявка на школу отправлена и ожидает подтверждения.';

    return (
        <Alert
            severity="info"
            variant="outlined"
            sx={S.alert}
            action={(
                <Button
                    color="inherit"
                    size="small"
                    onClick={onDismiss}
                    aria-label="Скрыть уведомление о заявке"
                    sx={S.actionButton}
                >
                    Скрыть
                </Button>
            )}
        >
            {message}
        </Alert>
    );
}

