import { useCallback } from 'react';
import { filesEndpoints } from '@/Endpoints';
import { createDebugger, DebugSeverity } from '@/Assets/debugUtils';

const logger = createDebugger('useDownloadChatFile');

export function useDownloadChatFile(schoolPublicId: string) {
  return useCallback((filePublicId: string, fileName?: string) => {
    filesEndpoints
      .downloadFile(schoolPublicId, filePublicId, fileName)
      .catch((err) => logger.logEventForDebug(DebugSeverity.DANGER, 'Failed to download chat file', err));
  }, [schoolPublicId]);
}
