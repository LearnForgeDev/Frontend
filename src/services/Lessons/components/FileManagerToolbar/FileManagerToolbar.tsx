import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  useMediaQuery,
  type SelectChangeEvent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useLessonsContext } from '@/Storage/Context/LessonsContext';
import FolderBreadcrumb from '../FolderBreadcrumb/FolderBreadcrumb';
import type { LessonFolder } from '../FileManager/FileManager.types';
import { FILE_MANAGER_CONSTANTS, SORT_OPTIONS } from '../FileManager/FileManager.const';
import { styles } from './FileManagerToolbar.styles';

export interface FileManagerToolbarProps {
  folders: LessonFolder[];
  onNewFolder: () => void;
}

export default function FileManagerToolbar({ folders, onNewFolder }: FileManagerToolbarProps) {
  const {
    folderId,
    setFolderId,
    search,
    setSearch,
    sort,
    setSort,
    order,
    setOrder,
    view,
    setView,
  } = useLessonsContext();

  const isMobile = useMediaQuery('(max-width:768px)');
  const [localSearch, setLocalSearch] = useState(search);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Sync context search changes
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Debounced search logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(localSearch);
    }, FILE_MANAGER_CONSTANTS.DEBOUNCE_DELAY);

    return () => clearTimeout(handler);
  }, [localSearch, setSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
  };

  const handleSortChange = (e: SelectChangeEvent<string>) => {
    setSort(e.target.value);
  };

  const handleOrderToggle = () => {
    setOrder(order === 'asc' ? 'desc' : 'asc');
  };

  const handleViewChange = (
    _e: React.MouseEvent<HTMLElement>,
    nextView: 'grid' | 'list' | null
  ) => {
    if (nextView !== null) {
      setView(nextView);
    }
  };

  const clearSearch = () => {
    setLocalSearch('');
    setIsSearchExpanded(false);
  };

  return (
    <Box sx={styles.root}>
      {/* Breadcrumbs (Left) */}
      <Box sx={styles.leftSection}>
        <FolderBreadcrumb
          folders={folders}
          currentFolderId={folderId}
          onNavigate={setFolderId}
        />
      </Box>

      {/* Center Section: Search */}
      <Box sx={styles.centerSection}>
        {isMobile && !isSearchExpanded ? (
          <IconButton
            aria-label="Открыть поиск"
            onClick={() => setIsSearchExpanded(true)}
          >
            <SearchIcon />
          </IconButton>
        ) : (
          <TextField
            placeholder="Поиск уроков..."
            variant="outlined"
            size="small"
            value={localSearch}
            onChange={handleSearchChange}
            sx={styles.searchField}
            aria-label="Поиск уроков"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: localSearch ? (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Очистить поиск"
                      size="small"
                      onClick={clearSearch}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : isMobile && isSearchExpanded ? (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Закрыть поиск"
                      size="small"
                      onClick={() => setIsSearchExpanded(false)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              },
            }}
          />
        )}
      </Box>

      {/* Right Section: Sort & Controls */}
      <Box sx={styles.rightSection}>
        {/* Sort Select */}
        <Select
          value={sort}
          onChange={handleSortChange}
          size="small"
          displayEmpty
          sx={styles.selectField}
          aria-label="Сортировка"
        >
          {SORT_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>

        <IconButton
          aria-label={order === 'asc' ? 'Сортировка по возрастанию' : 'Сортировка по убыванию'}
          onClick={handleOrderToggle}
          size="small"
        >
          {order === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
        </IconButton>

        {/* View Layout Toggle */}
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={handleViewChange}
          size="small"
          aria-label="Макет отображения"
        >
          <ToggleButton value="grid" aria-label="Сетка">
            <GridViewIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="list" aria-label="Список">
            <ViewListIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>

        {/* New Folder Action Button */}
        <IconButton
          aria-label="Создать новую папку"
          color="primary"
          onClick={onNewFolder}
        >
          <CreateNewFolderIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
