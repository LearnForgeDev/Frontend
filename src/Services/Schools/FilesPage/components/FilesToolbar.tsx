import { Box, Typography, Button, TextField, CircularProgress, FormControl, InputLabel, Select, MenuItem, ToggleButtonGroup, ToggleButton, InputAdornment } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SearchIcon from '@mui/icons-material/Search';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import type { useFilesPage } from '../hooks/useFilesPage';
import { styles } from '../FilesPage.styles';

type Props = Pick<ReturnType<typeof useFilesPage>, 'fileInputRef' | 'cameraInputRef' | 'handleUploadFiles' | 'isMobile' | 'isUploading' | 'search' | 'setSearch' | 'filterType' | 'setFilterType' | 'viewMode' | 'setViewMode'>;

export default function FilesToolbar({ fileInputRef, cameraInputRef, handleUploadFiles, isMobile, isUploading, search, setSearch, filterType, setFilterType, viewMode, setViewMode }: Props) {
  return (
    <>
      <Box sx={styles.header}>
        <Typography variant="h4" component="h1" sx={styles.title}>
          Материалы
        </Typography>
        <Box sx={styles.uploadActions}>
          <input
            type="file"
            multiple
            hidden
            ref={fileInputRef}
            onChange={(e) => handleUploadFiles(e.target.files)}
          />
          <input
            type="file"
            accept="image/*"
            capture="environment"
            hidden
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

          <FormControl size="small" sx={styles.filterControl}>
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


    </>
  );
}
