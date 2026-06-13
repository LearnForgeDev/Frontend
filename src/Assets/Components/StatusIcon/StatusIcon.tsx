import { Box, CircularProgress } from '@mui/material';
import type { StatusIconProps } from './StatusIcon.types';
import { STATUS_ICONS, STATUS_COLORS } from './StatusIcon.const';
import { styles } from './StatusIcon.styles';

export default function StatusIcon({ status }: StatusIconProps) {
  const icon = STATUS_ICONS[status];
  const color = STATUS_COLORS[status] || "warning.main";

  if (!icon) {
    return <CircularProgress size={16} color="warning" />;
  }

  return (
    <Box
      component="span"
      className="material-symbols-outlined"
      sx={styles.icon(color)}
    >
      {icon}
    </Box>
  );
}
