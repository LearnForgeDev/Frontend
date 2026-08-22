import { Typography, Box, Button } from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { LESSON_CARD_DEFAULT_ACTION } from './LessonCard.const';
import {
  actionSx,
  detailsSx,
  headerSx,
  lessonNameSx,
  widgetCardSx,
  widgetTitleSx,
} from './LessonCard.styles';

export interface LessonCardProps {
  title: string;
  lessonName: string;
  details: string;
  onActionClick?: () => void;
  actionText?: string;
}

export const LessonCard = ({
  title,
  lessonName,
  details,
  onActionClick,
  actionText = LESSON_CARD_DEFAULT_ACTION,
}: LessonCardProps) => {
  return (
    <Box sx={widgetCardSx}>
      <Box sx={headerSx}>
        <EventNoteIcon color="primary" />
        <Typography sx={widgetTitleSx}>{title}</Typography>
      </Box>
      <Typography variant="body1" sx={lessonNameSx}>
        {lessonName}
      </Typography>
      <Typography variant="body2" sx={detailsSx}>
        {details}
      </Typography>
      <Button variant="outlined" size="small" sx={actionSx} onClick={onActionClick}>
        {actionText}
      </Button>
    </Box>
  );
};
