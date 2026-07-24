import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { filesEndpoints } from '@/Endpoints';
import type { ApiFile } from '@/Endpoints';

export function useFiles(schoolPublicId: string, bucketType: string = 'files') {
  const queryClient = useQueryClient();

  const { data: files = [], isLoading, isError, refetch } = useQuery<ApiFile[]>({
    queryKey: ['files', schoolPublicId, bucketType],
    queryFn: () => filesEndpoints.listFiles(schoolPublicId, bucketType),
    enabled: !!schoolPublicId,
    staleTime: 60 * 1000,
  });

  const invalidateAndRefetchFiles = async () => {
    await queryClient.invalidateQueries({ queryKey: ['files'] });
    await queryClient.refetchQueries({ queryKey: ['files'] });
  };

  const uploadMutation = useMutation({
    mutationFn: (variables: { file: File; bucket?: string; onProgress?: (percent: number) => void }) =>
      filesEndpoints.uploadFileDirectPipeline(
        schoolPublicId,
        variables.file,
        variables.file.name,
        variables.bucket ?? bucketType,
        undefined,
        undefined,
        variables.onProgress
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
    refetch,
    uploadFile: (file: File, bucket?: string, onProgress?: (percent: number) => void) =>
      uploadMutation.mutateAsync({ file, bucket, onProgress }),
    isUploading: uploadMutation.isPending,
    deleteFile: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
