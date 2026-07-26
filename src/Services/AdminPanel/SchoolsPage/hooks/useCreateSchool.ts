import { useMutation } from '@tanstack/react-query';
import { authEndpoints } from '@/Endpoints';
import { useSchoolRequestPolling } from '@/Services/AdminPanel/hooks/useSchoolRequestPolling';

export function useCreateSchool() {
    const { startPolling } = useSchoolRequestPolling();

    return useMutation({
        mutationFn: async (schoolName: string) => {
            return await authEndpoints.requestSchool({ schoolName });
        },
        onSuccess: (result, schoolName) => {
            if (result.requestPublicId) {
                startPolling(result.requestPublicId, schoolName);
            }
        },
    });
}
