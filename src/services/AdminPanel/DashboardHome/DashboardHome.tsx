import React from 'react';
import { Box, Typography } from '@mui/material';

import PendingSchoolRequestWidget from './Components/PendingSchoolRequestWidget';
import { useActiveSchoolRequests } from '@/Services/AdminPanel/hooks/useActiveSchoolRequests';

const DashboardHome: React.FC = () => {
  const { requests, isLoading: isLoadingRequests } = useActiveSchoolRequests();

  const hasAnyContent = requests.length > 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography
            component="h1"
            sx={{
              margin: 0,
              color: "var(--admin-text)",
              fontFamily: "Manrope, sans-serif",
              fontSize: "1.9rem",
              fontWeight: 800,
              lineHeight: 1.2,
            }}
          >
            Dashboard
          </Typography>
          <Typography
            sx={{
              margin: "0.35rem 0 0",
              color: "var(--admin-muted)",
              maxWidth: "680px",
            }}
          >
            Live status of services, users, and platform health.
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1rem",
        }}
      >
        {/* Always try to render the widget, it handles its own empty state internally */}
        <PendingSchoolRequestWidget />

        {/* Placeholder - only if no services AND no school requests (and not loading) */}
        {!hasAnyContent && !isLoadingRequests && <WidgetsPlaceholder />}
      </Box>
    </Box>
  );
};

export default DashboardHome;

const WidgetsPlaceholder = () => {
  return (
    <Box
      sx={{
        border: "1px dashed var(--admin-outline)",
        borderRadius: "1.5rem",
        background: "var(--admin-surface)",
        padding: "1.75rem",
        color: "var(--admin-muted)",
      }}
    >
      <Typography
        component="h3"
        sx={{
          margin: 0,
          color: "var(--admin-text)",
          fontFamily: "Manrope, sans-serif",
        }}
      >
        No service widgets yet
      </Typography>
      <Typography sx={{ marginTop: "0.35rem" }}>
        Install and activate services in Marketplace to display operational
        metrics here.
      </Typography>
    </Box>
  );
};