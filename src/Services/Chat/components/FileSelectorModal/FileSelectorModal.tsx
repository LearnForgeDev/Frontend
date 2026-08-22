import { useState, useRef, useMemo, type ChangeEvent } from 'react';
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
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
} from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SearchIcon from '@mui/icons-material/Search';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArticleIcon from '@mui/icons-material/Article';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import VideoFileIcon from '@mui/icons-material/VideoFile';

import { useFiles } from '@/Services/Schools/FilesPage/hooks/useFiles';
import { filesEndpoints, type ApiFile } from '@/Endpoints';
import FileUploadProgress, { type UploadItemProgress } from '@/Assets/Components/FileUploadProgress/FileUploadProgress';
import { CANCELLED_UPLOAD_VISIBILITY_MS } from '@/Assets/Components/FileUploadProgress/FileUploadProgress.const';
import { isUploadAbortError } from '@/Assets/Components/FileUploadProgress/FileUploadProgress.utils';
import { styles } from './FileSelectorModal.styles';
import { createDebugger, DebugSeverity } from '@/Assets/debugUtils';
const logger = createDebugger('FileSelectorModal');


interface FileSelectorModalProps {
  open: boolean;
  onClose: () => void;
  schoolPublicId: string;
  onSelectFiles: (selectedFiles: Array<{ publicId: string; fileName: string }>) => void;
}

const getFileCategory = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
  if (ext === 'pdf') return 'pdf';
  if (['txt', 'md', 'json', 'js', 'ts', 'html', 'css'].includes(ext)) return 'text';
  if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) return 'document';
  if (['zip', 'rar', 'tar', 'gz', '7z'].includes(ext)) return 'archive';
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return 'audio';
  if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) return 'video';
  return 'other';
};

const getFileIcon = (filename: string) => {
  const category = getFileCategory(filename);
  switch (category) {
    case 'image': return <ImageIcon color="primary" />;
    case 'pdf': return <PictureAsPdfIcon color="error" />;
    case 'text':
    case 'document': return <ArticleIcon color="info" />;
    case 'archive': return <FolderZipIcon color="warning" />;
    case 'audio': return <AudioFileIcon color="secondary" />;
    case 'video': return <VideoFileIcon color="secondary" />;
    default: return <InsertDriveFileIcon color="action" />;
  }
};

const formatFileSize = (bytes: number) => {
  if (!bytes || bytes === 0) return '0 Б';
  const k = 1024;
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default function FileSelectorModal({
  open,
  onClose,
  schoolPublicId,
  onSelectFiles,
}: FileSelectorModalProps) {
  const { files, isLoading } = useFiles(schoolPublicId, 'files,chats');
  const [localUploadedFiles, setLocalUploadedFiles] = useState<ApiFile[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLocalUploading, setIsLocalUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadControllersRef = useRef(new Map<string, AbortController>());

  const [uploadItems, setUploadItems] = useState<UploadItemProgress[]>([]);

  const allAvailableFiles = useMemo<ApiFile[]>(() => {
    const map = new Map<string, ApiFile>();
    files.forEach((f: ApiFile) => map.set(f.publicId, f));
    localUploadedFiles.forEach((f: ApiFile) => map.set(f.publicId, f));
    return Array.from(map.values());
  }, [files, localUploadedFiles]);

  const filteredFiles = useMemo<ApiFile[]>(() => {
    return allAvailableFiles.filter((file) => {
      const fileName = file.fileName || '';
      const matchesSearch = fileName.toLowerCase().includes(search.toLowerCase());
      const category = getFileCategory(fileName);

      let matchesFilter = true;
      if (filterType !== 'all') {
        if (filterType === 'document') {
          matchesFilter = ['document', 'pdf', 'text'].includes(category);
        } else {
          matchesFilter = category === filterType;
        }
      }

      return matchesSearch && matchesFilter;
    });
  }, [allAvailableFiles, search, filterType]);

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
        const uploadId = `chat-upload-${Date.now()}-${i}`;
        const uploadController = new AbortController();
        uploadControllersRef.current.set(uploadId, uploadController);

        setUploadItems((prev) => [
          ...prev,
          {
            id: uploadId,
            fileName: file.name,
            sizeBytes: file.size,
            progress: 0,
            status: 'uploading',
          },
        ]);

        try {
          const completed = await filesEndpoints.uploadFileDirectPipeline(
            schoolPublicId,
            file,
            file.name,
            'chats',
            undefined,
            undefined,
            (percent) => {
              setUploadItems((prev) =>
                prev.map((item) =>
                  item.id === uploadId ? { ...item, progress: percent } : item
                )
              );
            },
            uploadController.signal,
          );

          uploadControllersRef.current.delete(uploadId);

          setUploadItems((prev) =>
            prev.map((item) =>
              item.id === uploadId ? { ...item, progress: 100, status: 'completed' } : item
            )
          );

          if (completed && completed.publicId) {
            setLocalUploadedFiles((prev) => [...prev, completed]);
            setSelectedIds((prev) => [...prev, completed.publicId]);
          }

          setTimeout(() => {
            setUploadItems((prev) => prev.filter((item) => item.id !== uploadId));
          }, 3000);
        } catch (fileErr) {
          uploadControllersRef.current.delete(uploadId);
          if (isUploadAbortError(fileErr)) {
            setUploadItems((prev) => prev.map((item) => (
              item.id === uploadId ? { ...item, status: 'cancelled' } : item
            )));
            window.setTimeout(() => {
              setUploadItems((prev) => prev.filter((item) => item.id !== uploadId));
            }, CANCELLED_UPLOAD_VISIBILITY_MS);
            continue;
          }

          logger.logEventForDebug(DebugSeverity.DANGER, 'Individual file upload error', fileErr);
          setUploadItems((prev) =>
            prev.map((item) =>
              item.id === uploadId
                ? { ...item, status: 'error', errorMessage: 'Ошибка загрузки файла' }
                : item
            )
          );
          setTimeout(() => {
            setUploadItems((prev) => prev.filter((item) => item.id !== uploadId));
          }, 4000);
        }
      }
    } catch (err) {
      logger.logEventForDebug(DebugSeverity.DANGER, 'File upload failed in modal', err);
    } finally {
      setIsLocalUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCancelUpload = (uploadId: string) => {
    uploadControllersRef.current.get(uploadId)?.abort();
  };

  const handleConfirm = () => {
    const matched = allAvailableFiles
      .filter((f: ApiFile) => selectedIds.includes(f.publicId))
      .map((f: ApiFile) => ({ publicId: f.publicId, fileName: f.fileName }));
    onSelectFiles(matched);
    setSelectedIds([]);
    setLocalUploadedFiles([]);
    setSearch('');
    setFilterType('all');
    onClose();
  };

  const handleClose = () => {
    uploadControllersRef.current.forEach((controller) => controller.abort());
    uploadControllersRef.current.clear();
    setSelectedIds([]);
    setLocalUploadedFiles([]);
    setSearch('');
    setFilterType('all');
    onClose();
  };

  const showLoading = isLoading || isLocalUploading;

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

        <Box sx={styles.toolbar}>
          <TextField
            size="small"
            placeholder="Поиск файлов..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={styles.searchInput}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="file-selector-filter-label">Тип файла</InputLabel>
            <Select
              labelId="file-selector-filter-label"
              value={filterType}
              label="Тип файла"
              onChange={(e: SelectChangeEvent) => setFilterType(e.target.value)}
            >
              <MenuItem value="all">Все форматы</MenuItem>
              <MenuItem value="document">Документы</MenuItem>
              <MenuItem value="image">Изображения</MenuItem>
              <MenuItem value="archive">Архивы</MenuItem>
              <MenuItem value="audio">Аудио</MenuItem>
              <MenuItem value="video">Видео</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : allAvailableFiles.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Файлы еще не загружены.
            </Typography>
          </Box>
        ) : filteredFiles.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Файлы по вашему запросу не найдены.
            </Typography>
          </Box>
        ) : (
          <List sx={styles.listContainer}>
            {filteredFiles.map((file: ApiFile) => {
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
                      {getFileIcon(file.fileName)}
                    </ListItemIcon>
                    <ListItemText
                      id={labelId}
                      primary={file.fileName}
                      secondary={formatFileSize(file.sizeBytes)}
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
      <FileUploadProgress items={uploadItems} onCancel={handleCancelUpload} />
    </Dialog>
  );
}
