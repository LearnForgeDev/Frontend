import { useState, useRef, type ChangeEvent } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  CircularProgress,
  Typography,
  Box,
} from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useFiles } from '@/Services/Schools/FilesPage/hooks/useFiles';
import { styles } from './FileSelectorModal.styles';

interface FileSelectorModalProps {
  open: boolean;
  onClose: () => void;
  schoolPublicId: string;
  onSelectFiles: (selectedFiles: Array<{ publicId: string; fileName: string }>) => void;
}

export default function FileSelectorModal({
  open,
  onClose,
  schoolPublicId,
  onSelectFiles,
}: FileSelectorModalProps) {
  const { files, uploadFile, isUploading, isLoading } = useFiles(schoolPublicId, 'files');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLocalUploading, setIsLocalUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    setIsLocalUploading(true);
    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const completed = await uploadFile(file, 'chats');
        if (completed && completed.publicId) {
          setSelectedIds((prev) => [...prev, completed.publicId]);
        }
      }
    } catch (err) {
      console.error('File upload failed in modal', err);
    } finally {
      setIsLocalUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirm = () => {
    const matched = files
      .filter((f) => selectedIds.includes(f.publicId))
      .map((f) => ({ publicId: f.publicId, fileName: f.fileName }));
    onSelectFiles(matched);
    setSelectedIds([]);
    onClose();
  };

  const handleClose = () => {
    setSelectedIds([]);
    onClose();
  };

  const showLoading = isLoading || isUploading || isLocalUploading;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Выберите файлы для отправки</DialogTitle>
      <DialogContent sx={styles.dialogContent}>
        <Box sx={styles.uploadArea}>
          <Typography variant="body2" color="text.secondary">
            Загрузить новый файл с устройства:
          </Typography>
          <input
            type="file"
            multiple
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleUpload}
            disabled={showLoading}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={showLoading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
            onClick={() => fileInputRef.current?.click()}
            disabled={showLoading}
            aria-label="Загрузить файл с устройства"
          >
            {showLoading ? 'Загрузка...' : 'Загрузить'}
          </Button>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : files.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Файлы еще не загружены.
            </Typography>
          </Box>
        ) : (
          <List sx={styles.listContainer}>
            {files.map((file) => {
              const labelId = `checkbox-list-label-${file.publicId}`;
              const isChecked = selectedIds.includes(file.publicId);

              return (
                <ListItem key={file.publicId} disablePadding>
                  <ListItemButton onClick={() => handleToggle(file.publicId)} dense>
                    <ListItemIcon>
                      <Checkbox
                        checked={isChecked}
                        tabIndex={-1}
                      />
                    </ListItemIcon>
                    <ListItemIcon sx={styles.fileIcon}>
                      <InsertDriveFileIcon color="action" />
                    </ListItemIcon>
                    <ListItemText
                      id={labelId}
                      primary={file.fileName}
                      secondary={`${(file.sizeBytes / 1024).toFixed(1)} KB`}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Отмена</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={selectedIds.length === 0 || showLoading}
        >
          Прикрепить ({selectedIds.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
}
