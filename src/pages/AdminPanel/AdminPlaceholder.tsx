import type { JSX } from 'react';
import { Box, Typography } from "@mui/material";

export default function AdminPlaceholder(): JSX.Element {
  return (
    <Box className="admin-empty-state">
      <Typography variant="h6" component="h3" className="admin-widget-title">Choose a service</Typography>
      <Typography>Select a service from the sidebar to configure access, limits, and integration settings.</Typography>
    </Box>
  );
}
