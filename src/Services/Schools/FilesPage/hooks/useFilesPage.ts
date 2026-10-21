import { useState, useRef } from 'react';
import type { DragEvent } from 'react';
import { filesEndpoints, type ApiFile } from '@/Endpoints';
import type { UploadItemProgress } from '@/Assets/Components/FileUploadProgress/FileUploadProgress';
import { useGlobalNotificationStore } from '@/Storage/globalNotificationStore';
import { getIsMobileDevice } from '@/Assets/device.utils';
import { CANCELLED_UPLOAD_VISIBILITY_MS } from '@/Assets/Components/FileUploadProgress/FileUploadProgress.const';
import { isUploadAbortError } from '@/Assets/Components/FileUploadProgress/FileUploadProgress.utils';
import { createDebugger, DebugSeverity } from '@/Assets/debugUtils';
import { useFiles } from './useFiles';
import { getFileCategory } from '../FilesPage.utils';
import { FILE_FEEDBACK_DURATION_MS, FILE_FAILURE_DURATION_MS, FILE_ERROR_DURATION_MS, UPLOAD_COMPLETE_PERCENT } from './useFilesPage.const';

const logger = createDebugger('useFilesPage');

export function useFilesPage(schoolPublicId: string) {
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

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [previewFileId, setPreviewFileId] = useState<string | null>(null);
  const deleteConfirmFile = files.find((file) => file.publicId === deleteConfirmId) ?? null;
  const previewFile = files.find((file) => file.publicId === previewFileId) ?? null;
  const setDeleteConfirmFile = (file: ApiFile | null) => setDeleteConfirmId(file?.publicId ?? null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadItems, setUploadItems] = useState<UploadItemProgress[]>([]);

  const filteredFiles = files.filter((file) => {
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
            item.id === uploadId ? { ...item, progress: UPLOAD_COMPLETE_PERCENT, status: 'completed' } : item
          )
        );
        successCount++;

        setTimeout(() => {
          setUploadItems((prev) => prev.filter((item) => item.id !== uploadId));
        }, FILE_FEEDBACK_DURATION_MS);
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
              ? { ...item, status: 'error', errorMessage: 'Не удалось загрузить файл.' }
              : item
          )
        );
        setTimeout(() => {
          setUploadItems((prev) => prev.filter((item) => item.id !== uploadId));
        }, FILE_FAILURE_DURATION_MS);
      }
    }

    if (successCount > 0) {
      await refetch();
      showNotification({
        id: `upload-success-${Date.now()}`,
        title: 'Загрузка успешна',
        subtitle: `Загружено файлов: ${successCount}` + (failCount > 0 ? `, не удалось загрузить: ${failCount}` : ''),
        priority: 'low',
        time: FILE_FEEDBACK_DURATION_MS,
      });
    } else if (failCount > 0) {
      showNotification({
        id: `upload-failed-${Date.now()}`,
        title: 'Ошибка загрузки',
        subtitle: 'Не удалось загрузить выбранные файлы.',
        priority: 'high',
        time: FILE_ERROR_DURATION_MS,
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
        time: FILE_FEEDBACK_DURATION_MS,
      });
    } catch (err) {
      logger.logEventForDebug(DebugSeverity.DANGER, 'Log:', err);
      showNotification({
        id: `delete-failed-${Date.now()}`,
        title: 'Ошибка удаления',
        subtitle: 'Не удалось удалить файл со службы хранения.',
        priority: 'high',
        time: FILE_ERROR_DURATION_MS,
      });
    } finally {
      setDeleteConfirmFile(null);
    }
  };

  const handleOpenPreview = (file: ApiFile) => setPreviewFileId(file.publicId);
  const handleClosePreview = () => setPreviewFileId(null);

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
        time: FILE_ERROR_DURATION_MS,
      });
    }
  };

  const handleDrag = (e: DragEvent) => {
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

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  return {
    files: filteredFiles, isLoading, isError, search, setSearch, filterType, setFilterType, viewMode, setViewMode,
    deleteConfirmFile, setDeleteConfirmFile, previewFile, dragActive, uploadItems, fileInputRef, cameraInputRef,
    isMobile, isUploading, handleUploadFiles, handleCancelUpload, handleDeleteConfirm,
    handleOpenPreview, handleClosePreview, handleDownloadFile, handleDrag, handleDrop,
  };
}
