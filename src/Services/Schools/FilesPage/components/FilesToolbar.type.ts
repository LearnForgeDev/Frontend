import type { useFilesPage } from '../hooks/useFilesPage';

export type Props = Pick<ReturnType<typeof useFilesPage>, 'fileInputRef' | 'cameraInputRef' | 'handleUploadFiles' | 'isMobile' | 'isUploading' | 'search' | 'setSearch' | 'filterType' | 'setFilterType' | 'viewMode' | 'setViewMode'>;
