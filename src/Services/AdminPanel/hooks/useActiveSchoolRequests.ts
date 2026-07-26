import { useQuery } from '@tanstack/react-query';
import { authEndpoints } from '@/Endpoints';
import { useUser } from '@/Storage/UserContext/UserContext.tsx';

export function useActiveSchoolRequests() {
    const { user } = useUser();

    const {
        data: requests = [],
        isLoading,
        refetch: refresh,
    } = useQuery({
        queryKey: ['active-school-requests'],
        queryFn: async () => {
            return await authEndpoints.getAllSchoolRequests();
        },
        enabled: !!user?.jwtToken,
        refetchInterval: 15000,
    });

    return { requests, isLoading, refresh };
}
