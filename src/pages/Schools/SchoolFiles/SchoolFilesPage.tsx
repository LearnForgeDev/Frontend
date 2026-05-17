import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ApiError,
  completeDirectUpload,
  deleteSchoolFile,
  downloadSchoolFileContent,
  getSchoolFiles,
  requestDirectUpload,
  uploadSchoolFile,
  uploadToPresignedUrl,
} from '../../../endpoints/files';
import type { SchoolFileItem } from '../../../types/schoolTypes';
import { useUser } from '../../../contexts/UserContext';
import {
  cardHeaderSx,
  cardSx,
  fileActionsSx,
  fileListSx,
  fileMetaSx,
  fileNameSx,
  fileRowSx,
  headerRowSx,
  helperTextSx,
  pageSx,
  progressRowSx,
  statusChipSx,
  uploadActionsSx,
  uploadFormSx,
  uploadInputSx,
  uploadRowSx,
} from './SchoolFilesPage.styles';

type UploadMode = 'api' | 'direct';

type UploadState = {
  status: 'idle' | 'uploading' | 'success' | 'error' | 'canceled';
  progress: number;
  message?: string;
};

const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024;

const SchoolFilesPage = () => {
  const { schoolPublicId } = useParams();
  const navigate = useNavigate();
  const { clearUser } = useUser();
  const [files, setFiles] = useState<SchoolFileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<UploadMode>('api');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [allowedUsers, setAllowedUsers] = useState('');
  const [allowedGroups, setAllowedGroups] = useState('');
  const [contentMd5, setContentMd5] = useState('');
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
  });
  const uploadAbortRef = useRef<() => void>(() => undefined);

  const accessPayload = useMemo(() => ({
    allowedUserPublicIds: parseCommaList(allowedUsers),
    allowedGroupIds: parseCommaList(allowedGroups),
  }), [allowedGroups, allowedUsers]);

  const handleApiError = useCallback((err: unknown) => {
    if (err instanceof ApiError) {
      setError(err.message);
      if (err.status === 401) {
        clearUser();
        navigate('/auth/login');
      }
      return;
    }

    setError(err instanceof Error ? err.message : 'Не удалось получить файлы.');
  }, [clearUser, navigate]);

  const loadFiles = useCallback(async () => {
    if (!schoolPublicId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getSchoolFiles(schoolPublicId);
      setFiles(response);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, [handleApiError, schoolPublicId]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleDownload = async (file: SchoolFileItem) => {
    if (!schoolPublicId) {
      return;
    }

    try {
      const blob = await downloadSchoolFileContent(schoolPublicId, file.filePublicId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleDelete = async (file: SchoolFileItem) => {
    if (!schoolPublicId) {
      return;
    }

    try {
      await deleteSchoolFile(schoolPublicId, file.filePublicId);
      setFiles((prev) => prev.filter((item) => item.filePublicId !== file.filePublicId));
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleUpload = async () => {
    if (!schoolPublicId) {
      return;
    }

    if (!selectedFile) {
      setUploadState({ status: 'error', progress: 0, message: 'Выберите файл для загрузки.' });
      return;
    }

    if (selectedFile.size === 0 || selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setUploadState({ status: 'error', progress: 0, message: 'Некорректный размер файла.' });
      return;
    }

    setUploadState({ status: 'uploading', progress: 0 });

    if (uploadMode === 'api') {
      const task = uploadSchoolFile(schoolPublicId, {
        file: selectedFile,
        fileName: fileName.trim() || undefined,
        access: accessPayload,
        onProgress: (progress) => setUploadState((prev) => ({ ...prev, progress })),
      });

      uploadAbortRef.current = () => task.abort();

      try {
        const result = await task.promise;
        setFiles((prev) => [result, ...prev]);
        setUploadState({ status: 'success', progress: 100, message: 'Файл загружен.' });
        resetUploadForm();
      } catch (err) {
        handleUploadError(err);
      }
      return;
    }

    const controller = new AbortController();
    uploadAbortRef.current = () => controller.abort();

    try {
      const presign = await requestDirectUpload(
        schoolPublicId,
        {
          fileName: selectedFile.name,
          contentMd5: contentMd5.trim() || undefined,
        },
        controller.signal,
      );

      const uploadTask = uploadToPresignedUrl(
        presign.uploadUrl,
        selectedFile,
        presign.headers ?? { 'Content-Type': selectedFile.type || 'application/octet-stream' },
        (progress) => setUploadState((prev) => ({ ...prev, progress })),
        controller.signal,
      );

      uploadAbortRef.current = () => {
        uploadTask.abort();
        controller.abort();
      };

      await uploadTask.promise;
      const completeResponse = await completeDirectUpload(
        schoolPublicId,
        {
          storageKey: presign.storageKey,
          fileName: fileName.trim() || selectedFile.name,
          sizeBytes: selectedFile.size,
          mimeType: selectedFile.type || 'application/octet-stream',
          allowedUserPublicIds: accessPayload.allowedUserPublicIds,
          allowedGroupIds: accessPayload.allowedGroupIds,
        },
        controller.signal,
      );

      setFiles((prev) => [completeResponse, ...prev]);
      setUploadState({ status: 'success', progress: 100, message: 'Файл загружен.' });
      resetUploadForm();
    } catch (err) {
      handleUploadError(err);
    }
  };

  const handleUploadError = (err: unknown) => {
    if (err instanceof ApiError && err.status === 499) {
      setUploadState({ status: 'canceled', progress: 0, message: 'Загрузка отменена.' });
      return;
    }

    if (err instanceof ApiError) {
      setUploadState({ status: 'error', progress: 0, message: err.message });
      if (err.status === 401) {
        clearUser();
        navigate('/auth/login');
      }
      return;
    }

    setUploadState({ status: 'error', progress: 0, message: 'Не удалось загрузить файл.' });
  };

  const resetUploadForm = () => {
    setSelectedFile(null);
    setFileName('');
    setAllowedUsers('');
    setAllowedGroups('');
    setContentMd5('');
  };

  const handleCancelUpload = () => {
    uploadAbortRef.current?.();
    setUploadState({ status: 'canceled', progress: 0, message: 'Загрузка отменена.' });
  };

  return (
    <Box sx={pageSx} className="admin-page">
      <Box sx={headerRowSx}>
        <Box>
          <Typography component="h1" className="admin-page-title">
            Файлы школы
          </Typography>
          <Typography className="admin-page-description">
            Каталог материалов, загрузка и управление доступом.
          </Typography>
        </Box>
        <Button className="admin-button" onClick={loadFiles}>
          Обновить
        </Button>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <Box className="admin-card" sx={cardSx}>
            <Box sx={cardHeaderSx}>
              <Typography component="h2" sx={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700 }}>
                Каталог
              </Typography>
              <Chip
                label={`${files.length} файлов`}
                size="small"
                sx={statusChipSx}
              />
            </Box>
            <Divider />
            {error && (
              <Alert severity="error">{error}</Alert>
            )}
            {isLoading && (
              <LinearProgress />
            )}
            {!isLoading && files.length === 0 && (
              <Box className="admin-empty-state">
                <Typography>Файлы пока не загружены.</Typography>
              </Box>
            )}
            <Box sx={fileListSx}>
              {files.map((file) => (
                <Box key={file.filePublicId} sx={fileRowSx}>
                  <Box sx={fileMetaSx}>
                    <Typography sx={fileNameSx}>{file.fileName}</Typography>
                    <Typography sx={helperTextSx}>
                      {formatFileSize(file.sizeBytes)} · {file.mimeType || 'unknown'}
                    </Typography>
                  </Box>
                  <Box sx={fileActionsSx}>
                    <IconButton aria-label="Скачать файл" onClick={() => handleDownload(file)}>
                      <Box component="span" className="material-symbols-outlined">download</Box>
                    </IconButton>
                    <IconButton aria-label="Удалить файл" onClick={() => handleDelete(file)}>
                      <Box component="span" className="material-symbols-outlined">delete</Box>
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} lg={5}>
          <Box className="admin-card" sx={cardSx}>
            <Box sx={cardHeaderSx}>
              <Typography component="h2" sx={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700 }}>
                Загрузка
              </Typography>
              <Chip
                label={uploadMode === 'api' ? 'API' : 'Direct Upload'}
                size="small"
                className="admin-chip"
                sx={statusChipSx}
              />
            </Box>
            <Divider />
            <Box sx={uploadFormSx}>
              <Box sx={uploadRowSx}>
                <TextField
                  label="Режим загрузки"
                  value={uploadMode === 'api' ? 'Через API' : 'Через storage'}
                  size="small"
                  select
                  SelectProps={{ native: true }}
                  onChange={(event) => setUploadMode(event.target.value as UploadMode)}
                  sx={uploadInputSx}
                >
                  <option value="api">Через API</option>
                  <option value="direct">Через storage</option>
                </TextField>
                <Button
                  variant="outlined"
                  component="label"
                  sx={{ textTransform: 'none', borderRadius: '0.7rem' }}
                >
                  {selectedFile ? 'Файл выбран' : 'Выбрать файл'}
                  <Box
                    component="input"
                    type="file"
                    hidden
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      setSelectedFile(file);
                    }}
                  />
                </Button>
              </Box>

              <TextField
                label="Имя файла (опционально)"
                value={fileName}
                onChange={(event) => setFileName(event.target.value)}
                size="small"
              />
              <TextField
                label="Allowed user IDs (через запятую)"
                value={allowedUsers}
                onChange={(event) => setAllowedUsers(event.target.value)}
                size="small"
              />
              <TextField
                label="Allowed group IDs (через запятую)"
                value={allowedGroups}
                onChange={(event) => setAllowedGroups(event.target.value)}
                size="small"
              />
              {uploadMode === 'direct' && (
                <TextField
                  label="Content-MD5 (base64, опционально)"
                  value={contentMd5}
                  onChange={(event) => setContentMd5(event.target.value)}
                  size="small"
                />
              )}
              <Typography sx={helperTextSx}>
                Максимальный размер: {formatFileSize(MAX_FILE_SIZE_BYTES)}.
              </Typography>
              <Box sx={uploadActionsSx}>
                <Button
                  variant="contained"
                  onClick={handleUpload}
                  disabled={uploadState.status === 'uploading'}
                  sx={{ borderRadius: '0.7rem', textTransform: 'none' }}
                >
                  Загрузить
                </Button>
                <Button
                  variant="text"
                  onClick={handleCancelUpload}
                  disabled={uploadState.status !== 'uploading'}
                  sx={{ textTransform: 'none' }}
                >
                  Отменить
                </Button>
              </Box>
              {uploadState.status !== 'idle' && (
                <Box sx={progressRowSx}>
                  <LinearProgress
                    variant="determinate"
                    value={uploadState.progress}
                    sx={{ flex: 1, borderRadius: '999px' }}
                  />
                  <Typography sx={helperTextSx}>{uploadState.progress}%</Typography>
                </Box>
              )}
              {uploadState.message && (
                <Alert
                  severity={uploadState.status === 'success' ? 'success' : uploadState.status === 'canceled' ? 'info' : 'error'}
                >
                  {uploadState.message}
                </Alert>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

function parseCommaList(value: string): string[] | undefined {
  const items = value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  return items.length > 0 ? items : undefined;
}

function formatFileSize(size: number): string {
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  }
  return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

export default SchoolFilesPage;
