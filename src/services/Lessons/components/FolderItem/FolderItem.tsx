import { Box, Typography, type SxProps, type Theme } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import type { LessonFolder } from '@/Services/Lessons/components/FileManager/FileManager.types';
import { FILE_MANAGER_CONSTANTS } from '@/Services/Lessons/components/FileManager/FileManager.const';
import { styles } from './FolderItem.styles';

export interface FolderItemProps {
  folder: LessonFolder;
  view: 'grid' | 'list';
  selected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export default function FolderItem({
  folder,
  view,
  selected,
  onClick,
  onDoubleClick,
  onContextMenu,
}: FolderItemProps) {
  const folderColor = folder.color || FILE_MANAGER_CONSTANTS.DEFAULT_FOLDER_COLOR;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onDoubleClick();
    }
  };

  const gridCardStyle = selected
    ? ({ ...styles.gridCard, ...styles.gridCardSelected } as SxProps<Theme>)
    : styles.gridCard;

  const listRowStyle = selected
    ? ({ ...styles.listRow, ...styles.listRowSelected } as SxProps<Theme>)
    : styles.listRow;

  if (view === 'grid') {
    return (
      <Box
        role="button"
        tabIndex={0}
        aria-label={`Папка: ${folder.name}`}
        sx={gridCardStyle}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onContextMenu={onContextMenu}
        onKeyDown={handleKeyDown}
      >
        <FolderIcon
          sx={{
            ...styles.gridIcon,
            color: folderColor,
          }}
        />
        <Typography variant="body2" sx={styles.gridTitle}>
          {folder.name}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={`Папка: ${folder.name}`}
      sx={listRowStyle}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      onKeyDown={handleKeyDown}
    >
      <FolderIcon
        sx={{
          ...styles.listIcon,
          color: folderColor,
        }}
      />
      <Typography variant="body1" sx={styles.listTitle}>
        {folder.name}
      </Typography>
      <Typography variant="caption" sx={styles.listMeta}>
        Папка
      </Typography>
    </Box>
  );
}
