import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studentsEndpoints } from '@/Endpoints/students';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import type { ManagedStudentGroup, StudentGroupDirectory } from '@/Endpoints/students/students.contract.type';
import type { StudentGroupChange } from './useStudentGroups.type';

export function useStudentGroups(schoolPublicId: string) {
  const accountId = useGlobalContext(state => state.auth.user?.userPublicId);
  const client = useQueryClient();
  const queryKey = ['managed-student-groups', schoolPublicId, accountId];
  const query = useQuery({
    queryKey,
    queryFn: () => studentsEndpoints.getManagedGroups(schoolPublicId),
    enabled: Boolean(schoolPublicId && accountId),
  });
  const save = useMutation({
    mutationFn: ({ kind, group }: StudentGroupChange) => kind === 'create'
      ? studentsEndpoints.createGroup(schoolPublicId, group)
      : studentsEndpoints.updateGroup(schoolPublicId, group),
    onSuccess: async (group: ManagedStudentGroup) => {
      await client.cancelQueries({ queryKey });
      client.setQueryData<StudentGroupDirectory>(queryKey, directory => directory && ({
        ...directory,
        groups: [...directory.groups.filter(item => item.publicId !== group.publicId), group],
      }));
    },
  });
  const remove = useMutation({
    mutationFn: (publicId: string) => studentsEndpoints.deleteGroup(schoolPublicId, publicId),
    onSuccess: async (_, removedId) => {
      await client.cancelQueries({ queryKey });
      client.setQueryData<StudentGroupDirectory>(queryKey, directory => directory && ({
        ...directory,
        groups: directory.groups.filter(group => group.publicId !== removedId),
      }));
    },
  });
  return { ...query, save: save.mutateAsync, remove: remove.mutateAsync, isWriting: save.isPending || remove.isPending };
}
