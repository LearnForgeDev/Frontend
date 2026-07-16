import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { filesEndpoints } from '@/Endpoints';
import type { ApiFile } from '@/Endpoints';

export function useFiles(schoolPublicId: string, bucketType: string = 'files') {
  const queryClient = useQueryClient();

  const { data: files = [], isLoading, isError, refetch } = useQuery<ApiFile[]>({
    queryKey: ['files', schoolPublicId, bucketType],
    queryFn: () => filesEndpoints.listFiles(schoolPublicId),
    enabled: !!schoolPublicId,
    staleTime: 60 * 1000,
  });

  const uploadMutation = useMutation({
    mutationFn: async (variables: { file: File; bucket?: string }) => {
      const targetBucket = variables.bucket || bucketType;
      const { uploadUrl, storageKey } = await filesEndpoints.getPresignedUpload(schoolPublicId, {
        fileName: variables.file.name,
        sizeBytes: variables.file.size,
        bucketType: targetBucket,
      });
      await filesEndpoints.uploadFileDirect(uploadUrl, variables.file);
      return await filesEndpoints.completeUpload(schoolPublicId, {
        storageKey,
        fileName: variables.file.name,
        sizeBytes: variables.file.size,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', schoolPublicId, bucketType] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (fileId: string) => filesEndpoints.deleteFile(schoolPublicId, fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', schoolPublicId, bucketType] });
    },
  });

  return {
    files,
    isLoading,
    isError,
    refetch,
    uploadFile: (file: File, bucket?: string) => uploadMutation.mutateAsync({ file, bucket }),
    isUploading: uploadMutation.isPending,
    deleteFile: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
