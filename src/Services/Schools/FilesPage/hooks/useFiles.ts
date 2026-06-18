import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { filesEndpoints } from '@/Endpoints/files.endpoints';
import type { ApiFile } from '@/Endpoints/files.types';

export function useFiles(schoolPublicId: string) {
  const queryClient = useQueryClient();

  const { data: files = [], isLoading, isError, refetch } = useQuery<ApiFile[]>({
    queryKey: ['files', schoolPublicId],
    queryFn: () => filesEndpoints.listFiles(schoolPublicId),
    enabled: !!schoolPublicId,
    staleTime: 60 * 1000,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => filesEndpoints.uploadFileMultipart(schoolPublicId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', schoolPublicId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (fileId: string) => filesEndpoints.deleteFile(schoolPublicId, fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', schoolPublicId] });
    },
  });

  return {
    files,
    isLoading,
    isError,
    refetch,
    uploadFile: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    deleteFile: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
