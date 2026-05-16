import { useState, useEffect } from 'react';
import { getAllSchoolRequests, type SchoolRequestStatusDto } from '../endpoints/apiAuth';
import { useUser } from '../contexts/UserContext';

export function useActiveSchoolRequests() {
    const { user } = useUser();
    const [requests, setRequests] = useState<SchoolRequestStatusDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRequests = async () => {
        if (!user?.jwtToken) {
            setIsLoading(false);
            return;
        }
        try {
            const data = await getAllSchoolRequests(user.jwtToken);
            setRequests(data);
        } catch (err) {
            console.error('Failed to fetch school requests:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
        const interval = setInterval(fetchRequests, 15000);
        return () => clearInterval(interval);
    }, [user?.jwtToken]);

    return { requests, isLoading, refresh: fetchRequests };
}
