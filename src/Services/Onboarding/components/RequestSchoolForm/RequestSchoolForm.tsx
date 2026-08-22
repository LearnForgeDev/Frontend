import { useState, type FormEvent } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { useRequestSchool } from '../../hooks/useRequestSchool';
import { validateSchoolName } from '../../validation/onboarding.validation';
import * as S from './RequestSchoolForm.styles';

type RequestSchoolFormProps = {
  initialSchoolName?: string;
};

export default function RequestSchoolForm({
  initialSchoolName = '',
}: RequestSchoolFormProps) {
  const [schoolName, setSchoolName] = useState(initialSchoolName);
  const [validationError, setValidationError] = useState<string | null>(null);
  const requestSchool = useRequestSchool();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateSchoolName(schoolName);
    setValidationError(validation.error);

    if (validation.error) {
      return;
    }

    requestSchool.mutate(validation.value);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Typography sx={S.helperText}>
        Отправьте заявку — мы сообщим, когда пространство будет готово.
      </Typography>
      <TextField
        fullWidth
        label="Название школы"
        value={schoolName}
        onChange={(event) => {
          setSchoolName(event.target.value);
          setValidationError(null);
        }}
        error={Boolean(validationError)}
        helperText={validationError}
        disabled={requestSchool.isPending}
        autoComplete="organization"
        sx={S.input}
        margin="normal"
      />
      {requestSchool.isError && (
        <Typography color="error" role="alert">
          Не удалось отправить заявку. Попробуйте ещё раз.
        </Typography>
      )}
      <Button
        type="submit"
        variant="outlined"
        fullWidth
        disabled={requestSchool.isPending}
        sx={S.submitButton}
      >
        {requestSchool.isPending ? 'Отправляем…' : 'Создать школу'}
      </Button>
    </form>
  );
}
