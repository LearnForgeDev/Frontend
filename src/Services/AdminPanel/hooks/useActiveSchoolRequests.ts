import { useState, useEffect, useCallback } from 'react';
import { authEndpoints, type SchoolRequestStatusDto } from '@/Endpoints';
import { useUser } from '@/Storage/UserContext/UserContext.tsx';

export function useActiveSchoolRequests() {
    const { user } = useUser();
    const [requests, setRequests] = useState<SchoolRequestStatusDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRequests = useCallback(async () => {
        if (!user?.jwtToken) {
            setIsLoading(false);
            return;
        }
        try {
            const data = await authEndpoints.getAllSchoolRequests();
            setRequests(data);
        } catch (err) {
            console.error('Failed to fetch school requests:', err);
        } finally {
            setIsLoading(false);
        }
    }, [user?.jwtToken]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchRequests();
        const interval = setInterval(fetchRequests, 15000);
        return () => clearInterval(interval);
    }, [fetchRequests]);

    return { requests, isLoading, refresh: fetchRequests };
}
