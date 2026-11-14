import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { filesEndpoints } from '@/Endpoints';
import type { ApiFile } from '@/Endpoints';
import { getRequestErrorMessage } from '@/Endpoints/factory/factory.utils';

export function useFiles(schoolPublicId: string, bucketType: string = 'files') {
  const queryClient = useQueryClient();
  const enabled = Boolean(schoolPublicId);

  const query = useQuery<ApiFile[]>({
    queryKey: ['files', schoolPublicId, bucketType],
    queryFn: () => filesEndpoints.listFiles(schoolPublicId, bucketType),
    enabled,
    staleTime: 60 * 1000,
  });
  const files = enabled ? query.data ?? [] : [];
  const isLoading = enabled && (query.isLoading || (query.isError && query.isFetching));
  const isError = enabled && query.isError && !query.isFetching;

  const invalidateAndRefetchFiles = async () => {
    await queryClient.invalidateQueries({ queryKey: ['files'] });
    await queryClient.refetchQueries({ queryKey: ['files'] });
  };

  const uploadMutation = useMutation({
    mutationFn: (variables: { file: File; bucket?: string; onProgress?: (percent: number) => void; signal?: AbortSignal }) =>
      filesEndpoints.uploadFileDirectPipeline(
        schoolPublicId,
        variables.file,
        variables.file.name,
        variables.bucket ?? bucketType,
        undefined,
        undefined,
        variables.onProgress,
        variables.signal,
      ),
    onSettled: invalidateAndRefetchFiles,
  });

  const deleteMutation = useMutation({
    mutationFn: (fileId: string) => filesEndpoints.deleteFile(schoolPublicId, fileId),
    onSettled: invalidateAndRefetchFiles,
  });

  return {
    files,
    isLoading,
    isError,
    isSuccess: enabled && query.isSuccess,
    errorMessage: isError ? getRequestErrorMessage(query.error) : null,
    retryFiles: () => { void query.refetch(); },
    refetch: query.refetch,
    uploadFile: (file: File, bucket?: string, onProgress?: (percent: number) => void, signal?: AbortSignal) =>
      uploadMutation.mutateAsync({ file, bucket, onProgress, signal }),
    isUploading: uploadMutation.isPending,
    deleteFile: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
