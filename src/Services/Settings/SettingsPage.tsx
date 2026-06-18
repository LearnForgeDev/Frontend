import React, { useState } from 'react';
import { Box, Typography, Switch, FormControlLabel, Divider, Paper } from '@mui/material';

const SettingsPage = () => {
  const [blackjackOn, setBlackjackOn] = useState(false);

  const handleBlackjackChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setBlackjackOn(false);
      window.location.href = 'https://youtu.be/ubPWaDWcOLU?si=Mx-ACQDo9Iyv1ezm';
    } else {
      setBlackjackOn(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Common settings
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={blackjackOn}
              onChange={handleBlackjackChange}
              color="primary"
            />
          }
          label="Blackjact"
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Service specific settings
        </Typography>
        <Typography color="text.secondary">
          No service specific settings available yet.
        </Typography>
      </Paper>
    </Box>
  );
};

export default SettingsPage;
