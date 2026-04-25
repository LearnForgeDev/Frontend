import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';

export default function PasswordField(props: TextFieldProps) {
    return (
        <TextField
            type="password"
            variant="outlined"
            required
            fullWidth
            {...props}
        />
    );
}

