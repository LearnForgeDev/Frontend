import type { FC } from 'react';

import { Box, Typography } from '@mui/material';

export const LessonsDashboardWidget: FC = () => {
    return (
        <Box className="lessons-widget-inner">
            <Typography variant="h6" component="h4">Статистика уроков</Typography>
            <Typography><Box component="strong" sx={{ fontWeight: 'bold' }}>12</Box> Новых уроков на этой неделе</Typography>
            <Typography><Box component="strong" sx={{ fontWeight: 'bold' }}>540</Box> Всего просмотров</Typography>
        </Box>
    );
};
