import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { filesEndpoints, type ApiFile } from '@/Endpoints';
import { useToast } from '@/Storage/useToastStore';
import { getFileCategory } from '../FilesPage.utils';
import { FILE_PREVIEW_TEXT, FILE_PREVIEW_TYPES, PDF_SIGNATURE, PDF_CONTENT_TYPE } from '../components/FilePreviewDialog/FilePreviewDialog.const';

export function useFilePreview(schoolPublicId: string, file: ApiFile) {
  const category = getFileCategory(file.fileName);
  const supported = FILE_PREVIEW_TYPES.includes(category);
  const [mediaError, setMediaError] = useState(false);
  const { error: showError } = useToast();
  const query = useQuery({
    queryKey: ['file-preview', schoolPublicId, file.publicId, category],
    queryFn: async ({ signal }) => {
      try {
        const blob = await filesEndpoints.getFileBlob(schoolPublicId, file.publicId, signal);
        signal.throwIfAborted();
        if (category === 'pdf' && await blob.slice(0, PDF_SIGNATURE.length).text() !== PDF_SIGNATURE) {
          throw new Error(FILE_PREVIEW_TEXT.error);
        }
        const text = category === 'text' ? await blob.text() : null;
        signal.throwIfAborted();
        return { blob: category === 'pdf' ? new Blob([blob], { type: PDF_CONTENT_TYPE }) : blob, text };
      } catch (error) {
        if (!signal.aborted) showError(FILE_PREVIEW_TEXT.error);
        throw error;
      }
    },
    enabled: supported,
    networkMode: 'always',
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const retry = () => {
    setMediaError(false);
    void query.refetch();
  };

  const reportMediaError = () => {
    setMediaError(true);
    showError(FILE_PREVIEW_TEXT.error);
  };

  return {
    category, supported, data: query.data,
    isLoading: supported && (query.isPending || query.isFetching),
    isError: query.isError || mediaError,
    retry, reportMediaError,
  };
}
