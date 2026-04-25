import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';

export default function LoginField(props: TextFieldProps) {
    return (
        <TextField
            variant="outlined"
            required
            fullWidth
            {...props}
        />
    );
}

