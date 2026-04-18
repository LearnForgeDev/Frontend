import React from 'react';
import { Box, Typography } from '@mui/material';
import './styles.css';

export const LessonsDashboardWidget: React.FC = () => {
    return (
        <Box className="lessons-widget-inner">
            <Typography variant="h6" component="h4">Lessons Stats</Typography>
            <Typography><Box component="strong" sx={{ fontWeight: 'bold' }}>12</Box> New Lessons this week</Typography>
            <Typography><Box component="strong" sx={{ fontWeight: 'bold' }}>540</Box> Total Views</Typography>
        </Box>
    );
};
