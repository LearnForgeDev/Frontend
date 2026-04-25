import React from 'react';
import { Button, TextField } from '@mui/material';

import * as S from './SchoolNameStep.styles';

type SchoolNameStepProps = {
    schoolName: string;
    onSchoolNameChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

export default function SchoolNameStep({ schoolName, onSchoolNameChange }: SchoolNameStepProps) {
    return (
        <>
            <TextField
                label="Название школы"
                variant="outlined"
                value={schoolName}
                onChange={onSchoolNameChange}
                required
                fullWidth
                autoFocus
                sx={S.schoolInput}
            />

            <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                sx={S.pillButton}
            >
                Далее
            </Button>
        </>
    );
}

