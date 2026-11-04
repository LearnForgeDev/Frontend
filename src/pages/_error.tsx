import { Box, Button, Typography } from '@mui/material';
import { ERROR_BOUNDARY_DEFAULTS } from '@/Assets/Components/ErrorBoundary/ErrorBoundary.const';
import { styles } from '@/Assets/Components/ErrorBoundary/ErrorBoundary.styles';

export default function ServerErrorPage() {
  return <Box component="main" role="alert" sx={styles.container}>
    <Typography component="h1" variant="h5" sx={styles.title}>{ERROR_BOUNDARY_DEFAULTS.defaultTitle}</Typography>
    <Typography sx={styles.message}>{ERROR_BOUNDARY_DEFAULTS.defaultMessage}</Typography>
    <Button variant="contained" onClick={() => window.location.reload()} sx={styles.button}>{ERROR_BOUNDARY_DEFAULTS.retryButtonText}</Button>
  </Box>;
}
