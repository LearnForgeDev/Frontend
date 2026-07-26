import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authEndpoints } from '@/Endpoints';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext.ts';
import { useUser } from '@/Storage/UserContext/UserContext.tsx';

export function useJoinSchool() {
    const queryClient = useQueryClient();
    const { setUser } = useUser();

    return useMutation({
        mutationFn: async (inviteToken: string) => {
            return await authEndpoints.joinSchool({ inviteToken });
        },
        onSuccess: (result) => {
            useGlobalContext.getState().auth.setUser(result);
            setUser(result);
            queryClient.invalidateQueries({ queryKey: ['my-schools'] });
        },
    });
}
