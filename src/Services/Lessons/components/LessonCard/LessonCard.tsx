import { useState } from 'react';
import { Card, CardContent, Typography, Box, IconButton, type SxProps, type Theme } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArticleIcon from '@mui/icons-material/Article';
import type { Lesson } from '@/Services/Lessons/components/FileManager/FileManager.types';
import ContextMenu from '@/Services/Lessons/components/ContextMenu/ContextMenu';
import { styles } from './LessonCard.styles';

export interface LessonCardProps {
  lesson: Lesson;
  selected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onOpen: () => void;
  onRename: () => void;
  onMove: () => void;
  onDelete: () => void;
  canManage?: boolean;
}

export default function LessonCard({
  lesson,
  selected,
  onClick,
  onOpen,
  onRename,
  onMove,
  onDelete,
  canManage = false,
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

  const cardStyle = selected
    ? ({ ...styles.card, ...styles.cardSelected } as SxProps<Theme>)
    : styles.card;

  return (
    <>
      <Card
        role="button"
        tabIndex={0}
        aria-label={`Урок: ${lesson.title}`}
        sx={cardStyle}
        onClick={onClick}
        onDoubleClick={onOpen}
        onContextMenu={canManage ? handleContextMenu : undefined}
        onKeyDown={handleKeyDown}
      >
        <Box sx={styles.thumbnail}>
          <ArticleIcon sx={{ fontSize: '3rem', opacity: 0.7 }} />
          {canManage && (
            <IconButton
              aria-label="Опции урока"
              size="small"
              sx={styles.kebabButton}
              onClick={handleKebabClick}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
        <CardContent sx={styles.content}>
          <Typography variant="subtitle2" component="h3" sx={styles.title}>
            {lesson.title}
          </Typography>
        </CardContent>
      </Card>

      {canManage && (
        <ContextMenu
          anchorEl={menuAnchor}
          onClose={handleCloseMenu}
          onOpen={onOpen}
          onRename={onRename}
          onMove={onMove}
          onDelete={onDelete}
        />
      )}
    </>
  );
}
