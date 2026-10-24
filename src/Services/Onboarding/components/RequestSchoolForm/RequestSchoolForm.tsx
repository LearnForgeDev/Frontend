import { Button, TextField, Typography } from '@mui/material';
import { useRequestSchoolForm } from '../../hooks/useRequestSchoolForm';
import * as S from './RequestSchoolForm.styles';

type RequestSchoolFormProps = {
  initialSchoolName?: string;
};

export default function RequestSchoolForm({
  initialSchoolName = '',
}: RequestSchoolFormProps) {
  const { schoolName, validationError, requestSchool, handleSubmit, changeSchoolName } =
    useRequestSchoolForm(initialSchoolName);

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Typography sx={S.helperText}>
        Отправьте заявку — мы сообщим, когда пространство будет готово.
      </Typography>
      <TextField
        fullWidth
        label="Название школы"
        value={schoolName}
        onChange={(event) => changeSchoolName(event.target.value)}
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
        data-testid="onboarding-school-submit"
        type="submit"
        variant="contained"
        fullWidth
        disabled={requestSchool.isPending}
        sx={S.submitButton}
      >
        {requestSchool.isPending ? 'Отправляем…' : 'Создать школу'}
      </Button>
    </form>
  );
}
