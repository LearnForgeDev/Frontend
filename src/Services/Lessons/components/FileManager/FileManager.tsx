import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Skeleton,
  Alert,
  Button,
  Typography,
  TextField,
} from '@mui/material';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import FolderOffIcon from '@mui/icons-material/FolderOff';
import { useLessonsContext } from '@/Storage/LessonsContext/LessonsContext.tsx';
import { useLessons } from '@/Services/Lessons/hooks/useLessons/useLessons';
import { useLessonMutations } from '@/Services/Lessons/hooks/useLessonMutations/useLessonMutations';
import { useCreateLessonFlow } from '@/Services/Lessons/hooks/useCreateLessonFlow/useCreateLessonFlow';
import { filesEndpoints } from '@/Endpoints';
import FileManagerToolbar from '../FileManagerToolbar/FileManagerToolbar';
import FolderItem from '../FolderItem/FolderItem';
import LessonCard from '../LessonCard/LessonCard';
import LessonListItem from '../LessonListItem/LessonListItem';
import { Modal } from '@/Assets/Components/Modal/Modal';
import { styles } from './FileManager.styles';
import { createDebugger, DebugSeverity } from '@/Assets/debugUtils';
const logger = createDebugger('FileManager');


export interface FileManagerProps {
  onOpenLesson?: (id: string, title: string) => void;
}

export default function FileManager({ onOpenLesson }: FileManagerProps) {
  const navigate = useNavigate();
  const {
    view,
    selectedItemId,
    setSelectedItemId,
    selectedItemType,
    setSelectedItemType,
    setSearch,
    setFolderId,
  } = useLessonsContext();

  const { lessons, folders, isLoading, isError, refetch } = useLessons();

  const mutations = useLessonMutations();
  const { handleCreateLesson } = useCreateLessonFlow({
    onSuccess: (id, title) => handleOpenLesson(id, title)
  });

  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { schoolPublicId } = useParams<{ schoolPublicId: string }>();

  const combinedItems = [
    ...(folders || []).map((f) => ({ ...f, type: 'folder' as const })),
    ...(lessons || []).map((l) => ({ ...l, type: 'lesson' as const })),
  ];

  const handleItemClick = (
    e: React.MouseEvent,
    id: string,
    type: 'folder' | 'lesson'
  ) => {
    e.stopPropagation();
    setSelectedItemId(id);
    setSelectedItemType(type);
  };

  const handleOpenLesson = (id: string, title: string) => {
    if (onOpenLesson) {
      onOpenLesson(id, title);
    } else {
      navigate(`/Lessons/${id}?edit=true`, { state: { id, title } });
    }
  };

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    // mutations.createFolder.mutate({
    //   name: newFolderName,
    //   parentId: folderId,
    // });
    logger.logEventForDebug(DebugSeverity.WARNING, 'Folder creation is disabled');
    setNewFolderName('');
    setIsNewFolderOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!selectedItemId || !selectedItemType) return;

    if (selectedItemType === 'folder') {
      // mutations.deleteFolder.mutate({ id: selectedItemId });
      logger.logEventForDebug(DebugSeverity.WARNING, 'Folder deletion is disabled');
    } else {
      mutations.deleteLesson.mutate({ id: selectedItemId });
    }

    setSelectedItemId(null);
    setSelectedItemType(null);
    setIsDeleteConfirmOpen(false);
  };

  const onCreateLessonClick = () => {
    handleCreateLesson();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (!schoolPublicId) return;

    const files = Array.from(e.dataTransfer.files);
    const validExtensions = ['.doc', '.docx', '.xls', '.xlsx', '.pdf', '.png', '.jpeg', '.jpg'];

    const validFiles = files.filter(file => {
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      return validExtensions.includes(ext);
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of validFiles) {
        await filesEndpoints.uploadFileMultipart(schoolPublicId, file, undefined, undefined, 'lessons');
      }
      refetch();
    } catch (err) {
      logger.logEventForDebug(DebugSeverity.DANGER, 'Upload failed', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Keyboard navigation & accessibility handlers
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearch('');
      setSelectedItemId(null);
      setSelectedItemType(null);
      return;
    }

    if (e.key === 'Delete' && selectedItemId) {
      setIsDeleteConfirmOpen(true);
      return;
    }

    if (combinedItems.length === 0) return;

    const currentIndex = combinedItems.findIndex((item) => item.id === selectedItemId);

    let nextIndex = currentIndex;
    const isGrid = view === 'grid';
    const gridColumns = 4; // layout fallback assumption

    switch (e.key) {
      case 'ArrowRight':
        nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % combinedItems.length;
        break;
      case 'ArrowLeft':
        nextIndex =
          currentIndex === -1
            ? combinedItems.length - 1
            : (currentIndex - 1 + combinedItems.length) % combinedItems.length;
        break;
      case 'ArrowDown':
        if (isGrid) {
          nextIndex = currentIndex === -1 ? 0 : (currentIndex + gridColumns) % combinedItems.length;
        } else {
          nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % combinedItems.length;
        }
        break;
      case 'ArrowUp':
        if (isGrid) {
          nextIndex =
            currentIndex === -1
              ? combinedItems.length - 1
              : (currentIndex - gridColumns + combinedItems.length) % combinedItems.length;
        } else {
          nextIndex =
            currentIndex === -1
              ? combinedItems.length - 1
              : (currentIndex - 1 + combinedItems.length) % combinedItems.length;
        }
        break;
      case 'Enter':
        if (currentIndex !== -1) {
          const activeItem = combinedItems[currentIndex];
          if (activeItem.type === 'folder') {
            setFolderId(activeItem.id);
            setSelectedItemId(null);
            setSelectedItemType(null);
          } else {
            handleOpenLesson(activeItem.id, activeItem.title);
          }
        }
        break;
      default:
        return;
    }

    e.preventDefault();
    const targetItem = combinedItems[nextIndex];
    if (targetItem) {
      setSelectedItemId(targetItem.id);
      setSelectedItemType(targetItem.type);
    }
  };

  const handlePageClick = () => {
    setSelectedItemId(null);
    setSelectedItemType(null);
  };

  if (isLoading) {
    return (
      <Box sx={styles.root}>
        <FileManagerToolbar folders={[]} onNewFolder={() => { }} onNewLesson={() => { }} />
        <Box sx={styles.contentGrid}>
          {Array.from({ length: 12 }).map((_, idx) => (
            <Skeleton
              key={idx}
              variant="rectangular"
              height={140}
              sx={{ borderRadius: 2 }}
            />
          ))}
        </Box>
      </Box>
    );
  }

  // Error boundary representation inside hook limits
  if (isError) {
    return (
      <Box sx={styles.root}>
        <Alert
          severity="error"
          sx={styles.errorAlert}
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Повторить
            </Button>
          }
        >
          Не удалось загрузить файлы. Пожалуйста, попробуйте еще раз.
        </Alert>
      </Box>
    );
  }

  const isEmpty = combinedItems.length === 0;

  return (
    <Box sx={styles.root} onClick={handlePageClick} onKeyDown={handleKeyDown} onDrop={handleDrop} onDragOver={handleDragOver}>
      {/* Search and control actions bar */}
      <FileManagerToolbar
        folders={folders || []}
        onNewFolder={() => setIsNewFolderOpen(true)}
        onNewLesson={onCreateLessonClick}
      />
      {isUploading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Загрузка файлов...
        </Alert>
      )}

      {/* Main Files list layout zone */}
      {isEmpty ? (
        <Box sx={styles.emptyState}>
          <FolderOffIcon sx={styles.emptyIcon} />
          <Typography variant="h6" color="text.secondary">
            Папка пуста
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Здесь пока ничего нет. Создайте первую папку, чтобы начать!
          </Typography>
          <Button
            variant="contained"
            startIcon={<CreateNewFolderIcon />}
            onClick={() => setIsNewFolderOpen(true)}
          >
            Создать папку
          </Button>
        </Box>
      ) : (
        <Box
          role="grid"
          aria-label="Список файлов"
          sx={view === 'grid' ? styles.contentGrid : styles.contentList}
        >
          {/* Subfolders mapping list */}
          {(folders || []).map((folder) => (
            <FolderItem
              key={folder.id}
              folder={folder}
              view={view}
              selected={selectedItemId === folder.id}
              onClick={(e) => handleItemClick(e, folder.id, 'folder')}
              onDoubleClick={() => {
                setFolderId(folder.id);
                setSelectedItemId(null);
                setSelectedItemType(null);
              }}
              onContextMenu={(e) => handleItemClick(e, folder.id, 'folder')}
            />
          ))}

          {/* Lessons mapping list */}
          {(lessons || []).map((lesson) => {
            const isSelected = selectedItemId === lesson.id;
            const itemClick = (e: React.MouseEvent) => handleItemClick(e, lesson.id, 'lesson');
            const openAction = () => handleOpenLesson(lesson.id, lesson.title);

            if (view === 'grid') {
              return (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  selected={isSelected}
                  onClick={itemClick}
                  onOpen={openAction}
                  onRename={() => { }} // Placeholder / extend as needed
                  onMove={() => { }}
                  onDelete={() => setIsDeleteConfirmOpen(true)}
                />
              );
            }
            return (
              <LessonListItem
                key={lesson.id}
                lesson={lesson}
                selected={isSelected}
                onClick={itemClick}
                onOpen={openAction}
                onRename={() => { }}
                onMove={() => { }}
                onDelete={() => setIsDeleteConfirmOpen(true)}
              />
            );
          })}
        </Box>
      )}

      {/* Create Folder Modal */}
      {isNewFolderOpen && (
        <Modal onClose={() => setIsNewFolderOpen(false)}>
          <Box component="form" onSubmit={handleCreateFolderSubmit} sx={styles.modalContent}>
            <Typography variant="h6" component="h3" sx={styles.modalTitle}>
              Новая папка
            </Typography>
            <TextField
              autoFocus
              label="Название папки"
              variant="outlined"
              size="small"
              fullWidth
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              aria-label="Имя новой папки"
            />
            <Box sx={styles.modalActions}>
              <Button onClick={() => setIsNewFolderOpen(false)} variant="outlined">
                Отмена
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Создать
              </Button>
            </Box>
          </Box>
        </Modal>
      )}

      {/* Delete Item Confirm Dialog */}
      {isDeleteConfirmOpen && (
        <Modal onClose={() => setIsDeleteConfirmOpen(false)}>
          <Box sx={styles.modalContent}>
            <Typography variant="h6" component="h3" sx={styles.modalTitle}>
              Удалить элемент?
            </Typography>
            <Typography variant="body1">
              Вы уверены, что хотите удалить выбранный элемент? Это действие невозможно отменить.
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
    </Box>
  );
}
