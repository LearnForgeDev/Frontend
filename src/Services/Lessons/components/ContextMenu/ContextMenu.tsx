import { useState } from 'react';
import { Menu, MenuItem, ListItemIcon, ListItemText, Typography, Box, Button } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Modal } from '@/Assets/Components/Modal/Modal';
import { styles } from './ContextMenu.styles';

export interface ContextMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onOpen: () => void;
  onRename: () => void;
  onMove: () => void;
  onDelete: () => void;
}

export default function ContextMenu({
  anchorEl,
  onClose,
  onOpen,
  onRename,
  onMove,
  onDelete,
}: ContextMenuProps) {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const isOpen = Boolean(anchorEl);

  const handleOpenClick = () => {
    onOpen();
    onClose();
  };

  const handleRenameClick = () => {
    onRename();
    onClose();
  };

  const handleMoveClick = () => {
    onMove();
    onClose();
  };

  const handleDeleteClick = () => {
    setIsDeleteConfirmOpen(true);
    onClose();
  };

  const handleConfirmDelete = () => {
    onDelete();
    setIsDeleteConfirmOpen(false);
  };

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: { minWidth: 160 },
          },
        }}
      >
        <MenuItem onClick={handleOpenClick}>
          <ListItemIcon>
            <OpenInNewIcon fontSize="small" sx={styles.menuItemIcon} />
          </ListItemIcon>
          <ListItemText>Открыть</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleRenameClick}>
          <ListItemIcon>
            <EditOutlinedIcon fontSize="small" sx={styles.menuItemIcon} />
          </ListItemIcon>
          <ListItemText>Переименовать</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMoveClick}>
          <ListItemIcon>
            <DriveFileMoveOutlinedIcon fontSize="small" sx={styles.menuItemIcon} />
          </ListItemIcon>
          <ListItemText>Переместить</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ ...styles.menuItemIcon, color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>Удалить</ListItemText>
        </MenuItem>
      </Menu>

      {/* Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <Modal onClose={() => setIsDeleteConfirmOpen(false)}>
          <Box sx={styles.modalContent}>
            <Typography variant="h6" component="h3" sx={styles.modalTitle}>
              Подтверждение удаления
            </Typography>
            <Typography variant="body1" sx={styles.modalBody}>
              Вы уверены, что хотите безвозвратно удалить этот элемент? Это действие нельзя отменить.
            </Typography>
            <Box sx={styles.modalActions}>
              <Button onClick={() => setIsDeleteConfirmOpen(false)} variant="outlined">
                Отмена
              </Button>
              <Button onClick={handleConfirmDelete} variant="contained" color="error">
                Удалить
              </Button>
            </Box>
          </Box>
        </Modal>
      )}
    </>
  );
}
