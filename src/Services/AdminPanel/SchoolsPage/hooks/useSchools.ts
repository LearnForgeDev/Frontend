import { useQuery } from '@tanstack/react-query';
import { schoolsEndpoints } from '@/Endpoints';
import { useUser } from '@/Services/Auth/hooks/useUser';

export function useSchools() {
    const { user } = useUser();

    return useQuery({
        queryKey: ['my-schools'],
        queryFn: async () => {
            return await schoolsEndpoints.getMySchools();
        },
        enabled: !!user?.jwtToken,
    });
}
