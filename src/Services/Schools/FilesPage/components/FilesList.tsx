import type { Props } from './FilesList.type';
import { Box, Button, Typography, CircularProgress, Alert, Paper, Card, CardActions, IconButton, Table, TableHead, TableRow, TableCell, TableBody, TableContainer } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import type { ApiFile } from '@/Endpoints';

import { formatFileSize, formatFileDate } from '../FilesPage.utils';
import FileIcon from './FileIcon';
import { styles } from '../FilesPage.styles';

export default function FilesList({ files: filteredFiles, isLoading, isError, isSuccess, errorMessage, retryFiles, search, viewMode, handleOpenPreview, handleDownloadFile, setDeleteConfirmFile }: Props) {
  return (
    <>
      {isLoading && (
        <Box sx={styles.loading} role="status" aria-label="Загружаем файлы">
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Alert severity="error" action={<Button color="inherit" onClick={retryFiles}>Повторить</Button>}>
          {errorMessage}
        </Alert>
      )}

      {isSuccess && !isLoading && !isError && filteredFiles.length === 0 && (
        <Paper sx={styles.empty}>
          <InsertDriveFileIcon sx={styles.emptyIcon} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Файлы не найдены
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {search ? 'Попробуйте изменить поисковый запрос' : 'Загрузите файлы для этой школы с помощью панели выше'}
          </Typography>
        </Paper>
      )}

      {isSuccess && !isLoading && !isError && filteredFiles.length > 0 && (
        viewMode === 'grid' ? (
          <Box sx={styles.fileGrid}>
            {filteredFiles.map((file: ApiFile) => {
              const fileKey = file.publicId;
              return (
                <Card key={fileKey} data-testid={`file-${file.publicId}`} sx={styles.fileCard} variant="outlined">
                  <Box sx={styles.fileCardHeader}>
                    <Box sx={styles.iconWrapper}>
                      <FileIcon filename={file.fileName} />
                    </Box>
                    <Box sx={styles.fileInfo}>
                      <Typography variant="body2" sx={styles.fileName} noWrap title={file.fileName || ''}>
                        {file.fileName || 'Без названия'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={styles.metadata}>
                        Размер: {formatFileSize(file.sizeBytes)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={styles.metadata}>
                        Загружен: {formatFileDate(file.uploadedAt)}
                      </Typography>
                    </Box>
                  </Box>
                  <CardActions sx={styles.cardActions}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenPreview(file)}
                      data-testid="file-preview" title="Просмотреть"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => { void handleDownloadFile(file); }}
                      data-testid="file-download" title="Скачать"
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteConfirmFile(file)}
                      data-testid="file-delete" title="Удалить"
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
                    <TableRow key={fileKey} data-testid={`file-${file.publicId}`} hover>
                      <TableCell sx={styles.fileCell}>
                        <Box sx={styles.fileRow}>
                          <FileIcon filename={file.fileName} />
                          <span title={file.fileName || ''}>{file.fileName || 'Без названия'}</span>
                        </Box>
                      </TableCell>
                      <TableCell>{(file.fileName || '').split('.').pop()?.toUpperCase() || 'Неизвестно'}</TableCell>
                      <TableCell align="right">{formatFileSize(file.sizeBytes)}</TableCell>
                      <TableCell>{formatFileDate(file.uploadedAt)}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenPreview(file)}
                          data-testid="file-preview" title="Просмотреть"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => { void handleDownloadFile(file); }}
                          data-testid="file-download" title="Скачать"
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteConfirmFile(file)}
                          data-testid="file-delete" title="Удалить"
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

    </>
  );
}
