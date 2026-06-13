import { Box, CircularProgress } from '@mui/material';

const STATUS_ICONS: Record<string, string> = {
  Approved: "check_circle",
  Created: "check_circle",
  Completed: "check_circle",
  Rejected: "cancel",
  Failed: "cancel",
};

const STATUS_COLORS: Record<string, string> = {
  Approved: "success.main",
  Created: "success.main",
  Completed: "success.main",
  Rejected: "error.main",
  Failed: "error.main",
};

type StatusIconProps = {
  status: string;
};

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
      sx={{ color, fontSize: "20px" }}
    >
      {icon}
    </Box>
  );
}
