import { useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Card,
  CardActions,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
} from '@mui/material';

import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import ArticleIcon from '@mui/icons-material/Article';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SearchIcon from '@mui/icons-material/Search';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';

import { useFiles } from './hooks/useFiles';
import { filesEndpoints } from '@/Endpoints';
import type { ApiFile } from '@/Endpoints';
import FileUploadProgress, { type UploadItemProgress } from '@/Assets/Components/FileUploadProgress/FileUploadProgress';
import { useGlobalNotificationStore } from '@/Storage/globalNotificationStore';
import { styles } from './FilesPage.styles';
import { createDebugger, DebugSeverity } from '@/Assets/debugUtils';
import { getIsMobileDevice } from '@/Assets/device.utils';
import { CANCELLED_UPLOAD_VISIBILITY_MS } from '@/Assets/Components/FileUploadProgress/FileUploadProgress.const';
import { isUploadAbortError } from '@/Assets/Components/FileUploadProgress/FileUploadProgress.utils';
const logger = createDebugger('FilesPage');


export default function FilesPage() {
  const { schoolPublicId = '' } = useParams<{ schoolPublicId: string }>();
  const showNotification = useGlobalNotificationStore((s) => s.pushNotification);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadControllersRef = useRef(new Map<string, AbortController>());
  const isMobile = getIsMobileDevice();

  const {
    files,
    isLoading,
    isError,
    refetch,
    uploadFile,
    isUploading,
    deleteFile,
  } = useFiles(schoolPublicId);

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [deleteConfirmFile, setDeleteConfirmFile] = useState<ApiFile | null>(null);
  const [previewFile, setPreviewFile] = useState<ApiFile | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadItems, setUploadItems] = useState<UploadItemProgress[]>([]);

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
      default: return <InsertDriveFileIcon />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Б';
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
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
  }, [files, search, filterType]);

  const handleUploadFiles = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const uploadId = `upload-${Date.now()}-${i}`;

      const newItem: UploadItemProgress = {
        id: uploadId,
        fileName: file.name,
        sizeBytes: file.size,
        progress: 0,
        status: 'uploading',
      };
      const uploadController = new AbortController();
      uploadControllersRef.current.set(uploadId, uploadController);

      setUploadItems((prev) => [...prev, newItem]);

      try {
        await uploadFile(file, undefined, (percent) => {
          setUploadItems((prev) =>
            prev.map((item) =>
              item.id === uploadId ? { ...item, progress: percent } : item
            )
          );
        }, uploadController.signal);

        uploadControllersRef.current.delete(uploadId);

        setUploadItems((prev) =>
          prev.map((item) =>
            item.id === uploadId ? { ...item, progress: 100, status: 'completed' } : item
          )
        );
        successCount++;

        setTimeout(() => {
          setUploadItems((prev) => prev.filter((item) => item.id !== uploadId));
        }, 3000);
      } catch (err) {
        uploadControllersRef.current.delete(uploadId);
        if (isUploadAbortError(err)) {
          setUploadItems((prev) => prev.map((item) => (
            item.id === uploadId ? { ...item, status: 'cancelled' } : item
          )));
          window.setTimeout(() => {
            setUploadItems((prev) => prev.filter((item) => item.id !== uploadId));
          }, CANCELLED_UPLOAD_VISIBILITY_MS);
          continue;
        }

        logger.logEventForDebug(DebugSeverity.DANGER, 'Log:', err);
        failCount++;
        setUploadItems((prev) =>
          prev.map((item) =>
            item.id === uploadId
              ? { ...item, status: 'error', errorMessage: 'Ошибка загрузки в S3 облако' }
              : item
          )
        );
        setTimeout(() => {
          setUploadItems((prev) => prev.filter((item) => item.id !== uploadId));
        }, 5000);
      }
    }

    if (successCount > 0) {
      await refetch();
      showNotification({
        id: `upload-success-${Date.now()}`,
        title: 'Загрузка успешна',
        subtitle: `Загружено файлов: ${successCount}` + (failCount > 0 ? `, не удалось загрузить: ${failCount}` : ''),
        priority: 'low',
        time: 3000,
      });
    } else if (failCount > 0) {
      showNotification({
        id: `upload-failed-${Date.now()}`,
        title: 'Ошибка загрузки',
        subtitle: 'Не удалось загрузить выбранные файлы.',
        priority: 'high',
        time: 4000,
      });
    }
  };

  const handleCancelUpload = (uploadId: string) => {
    uploadControllersRef.current.get(uploadId)?.abort();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmFile) return;

    try {
      await deleteFile(deleteConfirmFile.publicId);
      await refetch();
      showNotification({
        id: `delete-success-${Date.now()}`,
        title: 'Файл удален',
        subtitle: `Файл ${deleteConfirmFile.fileName || ''} успешно удален.`,
        priority: 'low',
        time: 3000,
      });
    } catch (err) {
      logger.logEventForDebug(DebugSeverity.DANGER, 'Log:', err);
      showNotification({
        id: `delete-failed-${Date.now()}`,
        title: 'Ошибка удаления',
        subtitle: 'Не удалось удалить файл со службы хранения.',
        priority: 'high',
        time: 4000,
      });
    } finally {
      setDeleteConfirmFile(null);
    }
  };

  const handleOpenPreview = async (file: ApiFile) => {
    setPreviewFile(file);
    const category = getFileCategory(file.fileName || '');
    
    setIsPreviewLoading(true);
    setPreviewContent(null);
    setPreviewUrl(null);
    try {
      const blob = await filesEndpoints.getFileBlob(schoolPublicId, file.publicId);
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
      
      if (category === 'text') {
        const text = await blob.text();
        setPreviewContent(text);
      }
    } catch (err) {
      logger.logEventForDebug(DebugSeverity.DANGER, 'Log:', err);
      setPreviewContent('Не удалось прочитать содержимое файла. Возможно, это бинарный или пустой файл.');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleClosePreview = () => {
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
    }
    setPreviewFile(null);
    setPreviewContent(null);
    setPreviewUrl(null);
  };

  const handleDownloadFile = async (file: ApiFile) => {
    try {
      const blob = await filesEndpoints.getFileBlob(schoolPublicId, file.publicId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.fileName || 'file';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      logger.logEventForDebug(DebugSeverity.DANGER, 'Log:', err);
      showNotification({
        id: `download-failed-${Date.now()}`,
        title: 'Ошибка скачивания',
        subtitle: 'Не удалось скачать файл с сервера.',
        priority: 'high',
        time: 4000,
      });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.dataTransfer.types.includes('Files')) {
      return;
    }

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (
      e.type === 'dragleave'
      && !e.currentTarget.contains(e.relatedTarget as Node | null)
    ) {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  return (
    <Box
      sx={styles.container}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <Box sx={styles.header}>
        <Typography variant="h4" component="h1" sx={styles.title}>
          Материалы
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <input
            type="file"
            multiple
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={(e) => handleUploadFiles(e.target.files)}
          />
          <input
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            ref={cameraInputRef}
            onChange={(event) => handleUploadFiles(event.target.files)}
          />
          {isMobile && (
            <Button
              variant="outlined"
              startIcon={<PhotoCameraRoundedIcon />}
              onClick={() => cameraInputRef.current?.click()}
              disabled={isUploading}
            >
              Снять
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? 'Загрузка...' : 'Загрузить файл'}
          </Button>
        </Box>
      </Box>

      <Box sx={styles.toolbar}>
        <Box sx={styles.searchAndFilter}>
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

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="filter-type-label">Тип файла</InputLabel>
            <Select
              labelId="filter-type-label"
              value={filterType}
              label="Тип файла"
              onChange={(e) => setFilterType(e.target.value)}
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

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, nextView) => nextView && setViewMode(nextView)}
          size="small"
          aria-label="Режим отображения"
        >
          <ToggleButton value="grid" aria-label="Сетка">
            <GridViewIcon />
          </ToggleButton>
          <ToggleButton value="list" aria-label="Список">
            <ViewListIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {dragActive && (
        <Box sx={styles.dropZone}>
          <CloudUploadIcon sx={styles.dropZoneIcon} />
          <Typography variant="body1" sx={styles.dropZoneTitle}>
            Перетащите файлы сюда для быстрой загрузки
          </Typography>
        </Box>
      )}

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Alert severity="error">
          Не удалось получить список файлов школы. Проверьте соединение.
        </Alert>
      )}

      {!isLoading && !isError && filteredFiles.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center', backgroundColor: 'background.paper' }}>
          <InsertDriveFileIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Файлы не найдены
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {search ? 'Попробуйте изменить поисковый запрос' : 'Загрузите файлы для этой школы с помощью панели выше'}
          </Typography>
        </Paper>
      )}

      {!isLoading && !isError && filteredFiles.length > 0 && (
        viewMode === 'grid' ? (
          <Box sx={styles.fileGrid}>
            {filteredFiles.map((file: ApiFile) => {
              const fileKey = file.publicId;
              return (
                <Card key={fileKey} sx={styles.fileCard} variant="outlined">
                  <Box sx={styles.fileCardHeader}>
                    <Box sx={styles.iconWrapper}>
                      {getFileIcon(file.fileName || '')}
                    </Box>
                    <Box sx={styles.fileInfo}>
                      <Typography variant="body2" sx={styles.fileName} noWrap title={file.fileName || ''}>
                        {file.fileName || 'Без названия'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Размер: {formatFileSize(file.sizeBytes)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Загружен: {new Date(file.uploadedAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  <CardActions sx={styles.cardActions}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenPreview(file)}
                      title="Просмотреть"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDownloadFile(file)}
                      title="Скачать"
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteConfirmFile(file)}
                      title="Удалить"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              );
            })}
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table aria-label="Таблица файлов">
              <TableHead>
                <TableRow>
                  <TableCell>Название</TableCell>
                  <TableCell>Формат</TableCell>
                  <TableCell align="right">Размер</TableCell>
                  <TableCell>Дата загрузки</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFiles.map((file: ApiFile) => {
                  const fileKey = file.publicId;
                  return (
                    <TableRow key={fileKey} hover>
                      <TableCell sx={{ fontWeight: 500, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          {getFileIcon(file.fileName || '')}
                          <span title={file.fileName || ''}>{file.fileName || 'Без названия'}</span>
                        </Box>
                      </TableCell>
                      <TableCell>{(file.fileName || '').split('.').pop()?.toUpperCase() || 'Неизвестно'}</TableCell>
                      <TableCell align="right">{formatFileSize(file.sizeBytes)}</TableCell>
                      <TableCell>{new Date(file.uploadedAt).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenPreview(file)}
                          title="Просмотреть"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDownloadFile(file)}
                          title="Скачать"
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteConfirmFile(file)}
                          title="Удалить"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )
      )}

      <Dialog
        open={!!deleteConfirmFile}
        onClose={() => setDeleteConfirmFile(null)}
      >
        <DialogTitle>Удаление файла</DialogTitle>
        <DialogContent>
          <Typography>
            Вы действительно хотите удалить файл <strong>{deleteConfirmFile?.fileName || ''}</strong>?
            Это действие нельзя будет отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmFile(null)}>Отмена</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!previewFile}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pr: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          Просмотр: {previewFile?.fileName || ''}
        </DialogTitle>
        <DialogContent dividers sx={styles.previewDialogContent}>
          {previewFile && getFileCategory(previewFile.fileName || '') === 'image' && previewUrl && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box
                component="img"
                src={previewUrl}
                alt={previewFile.fileName || ''}
                sx={styles.previewImage}
              />
            </Box>
          )}

          {previewFile && getFileCategory(previewFile.fileName || '') === 'text' && (
            <Box>
              {isPreviewLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : (
                <Box component="pre" sx={styles.previewText}>
                  {previewContent}
                </Box>
              )}
            </Box>
          )}

          {previewFile && getFileCategory(previewFile.fileName || '') === 'pdf' && previewUrl && (
            <Box sx={{ height: '500px', width: '100%' }}>
              <Box
                component="iframe"
                src={previewUrl}
                width="100%"
                height="100%"
                sx={{ border: 'none', borderRadius: 1 }}
              />
            </Box>
          )}

          {previewFile && !['image', 'text', 'pdf'].includes(getFileCategory(previewFile.fileName || '')) && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <InsertDriveFileIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" gutterBottom>
                Предварительный просмотр недоступен для этого формата файлов.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Вы можете скачать файл на свое устройство для просмотра.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => previewFile && handleDownloadFile(previewFile)}
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
          >
            Скачать
          </Button>
          <Button onClick={handleClosePreview}>
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>

      <FileUploadProgress items={uploadItems} onCancel={handleCancelUpload} />
    </Box>
  );
}
