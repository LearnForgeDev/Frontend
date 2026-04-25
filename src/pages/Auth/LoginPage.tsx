import { useState } from 'react';
import { Box } from '@mui/material';

import type { AuthRole } from '../../types/commonTypes';

import LoginForm from './Components/LoginForm';
import * as S from './LoginPage.styles';
import PillButtonGroup from '../../assets/CommonComponents/PillButtonGroup';

const roleEnToRu = new Map([
    ['student', 'студента'],
    ['teacher', 'учителя'],
]);

export default function LoginPage() {
    const [role, setRole] = useState<AuthRole>('student');

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <PillButtonGroup
                value={role}
                onChange={setRole}
                options={[
                    { label: 'Студент', value: 'student' },
                    { label: 'Преподаватель', value: 'teacher' }
                ]}
                aria-label="Роль"
                sx={S.toggleGroup}
            />

            <LoginForm title="Войти" nameLabel={`Имя ${roleEnToRu.get(role)}`} />
        </Box>
    );
}
