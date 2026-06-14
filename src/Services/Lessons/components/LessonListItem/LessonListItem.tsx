import { useState } from 'react';
import { Box, Typography, Chip, IconButton, type SxProps, type Theme } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type { Lesson } from '@/Services/Lessons/components/FileManager/FileManager.types';
import ContextMenu from '@/Services/Lessons/components/ContextMenu/ContextMenu';
import { styles } from './LessonListItem.styles';

export interface LessonListItemProps {
  lesson: Lesson;
  selected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onOpen: () => void;
  onRename: () => void;
  onMove: () => void;
  onDelete: () => void;
}

export default function LessonListItem({
  lesson,
  selected,
  onClick,
  onOpen,
  onRename,
  onMove,
  onDelete,
}: LessonListItemProps) {
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
  const formattedDate = lesson.updatedAt ? new Date(lesson.updatedAt).toLocaleDateString() : '—';
  
  // Calculate mock word count or derived word count from content
  const mockWordCount = lesson.content ? Math.floor(JSON.stringify(lesson.content).length / 12) + 15 : 120;

  const rowStyle = selected
    ? ({ ...styles.row, ...styles.rowSelected } as SxProps<Theme>)
    : styles.row;

  return (
    <>
      <Box
        role="button"
        tabIndex={0}
        aria-label={`Урок: ${lesson.title}, статус: ${lesson.status || 'черновик'}`}
        sx={rowStyle}
        onClick={onClick}
        onDoubleClick={onOpen}
        onContextMenu={handleContextMenu}
        onKeyDown={handleKeyDown}
      >
        <ArticleIcon sx={styles.icon} />
        <Typography variant="body1" sx={styles.title}>
          {lesson.title}
        </Typography>

        <Box sx={styles.metaContainer}>
          <Chip
            label={isPublished ? 'Опубликован' : 'Черновик'}
            size="small"
            color={isPublished ? 'success' : 'default'}
            variant="outlined"
            sx={styles.statusChip}
          />
          <Typography variant="body2" sx={styles.wordCount}>
            Слов: {mockWordCount}
          </Typography>
          <Typography variant="body2" sx={styles.date}>
            {formattedDate}
          </Typography>
          <IconButton
            aria-label="Опции урока"
            size="small"
            onClick={handleKebabClick}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

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
