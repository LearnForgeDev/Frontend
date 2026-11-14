import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authEndpoints } from '@/Endpoints';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext.ts';
import { useUser } from '@/Services/Auth/hooks/useUser';

export function useJoinSchool() {
    const queryClient = useQueryClient();
    const { setUser } = useUser();

    return useMutation({
        mutationFn: async (inviteToken: string) => {
            return await authEndpoints.joinSchool({ inviteToken });
        },
        onSuccess: async (result) => {
            useGlobalContext.getState().auth.setUser(result);
            setUser(result);
            await queryClient.invalidateQueries({ queryKey: ['my-schools'] });
        },
    });
}
