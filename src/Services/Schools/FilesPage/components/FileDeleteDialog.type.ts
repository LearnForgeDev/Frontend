import type { useFilesPage } from '../hooks/useFilesPage';

export type Props = Pick<ReturnType<typeof useFilesPage>, 'deleteConfirmFile' | 'setDeleteConfirmFile' | 'handleDeleteConfirm'>;
