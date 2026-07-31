import React from 'react';
import { Paper, Typography, Box, Button } from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { widgetCardSx, widgetTitleSx } from './LessonCard.styles';

export interface LessonCardProps {
  title: string;
  lessonName: string;
  details: string;
  onActionClick?: () => void;
  actionText?: string;
}

export const LessonCard: React.FC<LessonCardProps> = ({ 
  title, 
  lessonName, 
  details, 
  onActionClick, 
  actionText = 'Перейти к материалам' 
}) => {
  return (
    <Paper elevation={0} sx={widgetCardSx}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <EventNoteIcon color="primary" />
        <Typography sx={widgetTitleSx}>{title}</Typography>
      </Box>
      <Typography variant="body1" sx={{ fontWeight: 600, color: '#111827' }}>
        {lessonName}
      </Typography>
      <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
        {details}
      </Typography>
      <Button variant="outlined" size="small" sx={{ alignSelf: 'flex-start', borderRadius: 2, textTransform: 'none', fontWeight: 600 }} onClick={onActionClick}>
        {actionText}
      </Button>
    </Paper>
  );
};
