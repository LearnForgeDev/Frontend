import type { ApiFile } from '@/Endpoints';

export type Props = {
  schoolPublicId: string;
  file: ApiFile;
  onClose: () => void;
  onDownload: (file: ApiFile) => void;
};
