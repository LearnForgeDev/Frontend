import React from 'react';
import { Box, Typography, FormControlLabel, Checkbox, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import './styles.css';

export const LessonsConfig: React.FC = () => {
    return (
        <Box>
            <Typography variant="h6" component="h3">Настройка уроков</Typography>
            <Typography>Настройте редактор и просмотрщик уроков.</Typography>
            {/* Here we would use react-hook-form or similar */}
            <Box component="form" className="lessons-config-form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <FormControlLabel
                    control={<Checkbox defaultChecked />}
                    label="Разрешить публичный доступ"
                />
                <FormControl size="small" sx={{ minWidth: 200, alignSelf: 'flex-start' }}>
                    <InputLabel id="max-video-quality-label">Максимальное качество видео</InputLabel>
                    <Select
                        labelId="max-video-quality-label"
                        defaultValue="1080p"
                        label="Максимальное качество видео"
                    >
                        <MenuItem value="720p">720p</MenuItem>
                        <MenuItem value="1080p">1080p</MenuItem>
                    </Select>
                </FormControl>
            </Box>
        </Box>
    );
};
