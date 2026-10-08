import { Box, Button, Typography, useTheme } from '@mui/material';
import { CloudOffOutlined, SchoolOutlined } from '@mui/icons-material';
import { ClipLoader } from 'react-spinners';
import { COURSE_SPINNER_SIZE } from './CourseState.const';
import { styles } from './CourseState.styles';

interface CourseStateProps {
  kind: 'loading' | 'error' | 'empty';
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function CourseState({ kind, title, description, actionLabel, onAction }: CourseStateProps) {
  const theme = useTheme();
  return (
    <Box sx={styles.root} role={kind === 'error' ? 'alert' : 'status'}>
      {kind === 'loading' && <ClipLoader size={COURSE_SPINNER_SIZE} color={theme.palette.primary.main} aria-label="Загрузка" />}
      {kind === 'error' && <CloudOffOutlined sx={styles.icon} />}
      {kind === 'empty' && <SchoolOutlined sx={styles.icon} />}
      <Typography component="h2" variant="h6" sx={styles.title}>{title}</Typography>
      {description && <Typography variant="body2" sx={styles.description}>{description}</Typography>}
      {onAction && actionLabel && <Button variant="outlined" onClick={onAction} sx={styles.button}>{actionLabel}</Button>}
    </Box>
  );
}
