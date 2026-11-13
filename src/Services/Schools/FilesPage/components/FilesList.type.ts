import type { useFilesPage } from '../hooks/useFilesPage';

export type Props = Pick<ReturnType<typeof useFilesPage>, 'files' | 'isLoading' | 'isError' | 'isSuccess' | 'errorMessage' | 'retryFiles' | 'search' | 'viewMode' | 'handleOpenPreview' | 'handleDownloadFile' | 'setDeleteConfirmFile'>;
