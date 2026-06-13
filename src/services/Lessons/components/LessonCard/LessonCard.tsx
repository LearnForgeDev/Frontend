import { useState } from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton, type SxProps, type Theme } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArticleIcon from '@mui/icons-material/Article';
import type { Lesson } from '@/Services/Lessons/components/FileManager/FileManager.types';
import ContextMenu from '@/Services/Lessons/components/ContextMenu/ContextMenu';
import { formatRelativeTime } from './utils';
import { styles } from './LessonCard.styles';

export interface LessonCardProps {
  lesson: Lesson;
  selected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onOpen: () => void;
  onRename: () => void;
  onMove: () => void;
  onDelete: () => void;
}

export default function LessonCard({
  lesson,
  selected,
  onClick,
  onOpen,
  onRename,
  onMove,
  onDelete,
}: LessonCardProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const handleKebabClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget as HTMLElement);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuAnchor(e.currentTarget as HTMLElement);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onOpen();
    }
  };

  const isPublished = lesson.status === 'published';
  const lastEdited = lesson.updatedAt ? formatRelativeTime(lesson.updatedAt) : 'just now';

  const cardStyle = selected
    ? ({ ...styles.card, ...styles.cardSelected } as SxProps<Theme>)
    : styles.card;

  return (
    <>
      <Card
        role="button"
        tabIndex={0}
        aria-label={`Урок: ${lesson.title}, статус: ${lesson.status || 'черновик'}`}
        sx={cardStyle}
        onClick={onClick}
        onDoubleClick={onOpen}
        onContextMenu={handleContextMenu}
        onKeyDown={handleKeyDown}
      >
        <Box sx={styles.thumbnail}>
          <ArticleIcon sx={{ fontSize: '3rem', opacity: 0.7 }} />
          <IconButton
            aria-label="Опции урока"
            size="small"
            sx={styles.kebabButton}
            onClick={handleKebabClick}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
        <CardContent sx={styles.content}>
          <Typography variant="subtitle2" component="h3" sx={styles.title}>
            {lesson.title}
          </Typography>
          <Box sx={styles.meta}>
            <Chip
              label={isPublished ? 'Опубликован' : 'Черновик'}
              size="small"
              color={isPublished ? 'success' : 'default'}
              variant="outlined"
            />
            <Typography variant="caption" sx={styles.time}>
              {lastEdited}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <ContextMenu
        anchorEl={menuAnchor}
        onClose={handleCloseMenu}
        onOpen={onOpen}
        onRename={onRename}
        onMove={onMove}
        onDelete={onDelete}
      />
    </>
  );
}
