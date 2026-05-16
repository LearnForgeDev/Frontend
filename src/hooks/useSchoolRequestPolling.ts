import { useCallback, useEffect, useState, useRef } from 'react';
import { getSchoolRequestStatus } from '../endpoints/apiAuth';
import { useUser } from '../contexts/UserContext';

const STORAGE_KEY = 'activeSchoolRequest';

export type ActiveSchoolRequest = {
    publicId: string;
    schoolName: string;
    status: string;
};

export function useSchoolRequestPolling() {
    const { user } = useUser();
    const [activeRequest, setActiveRequest] = useState<ActiveSchoolRequest | null>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    });
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const stopPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    }, []);

    const clearRequest = useCallback(() => {
        stopPolling();
        localStorage.removeItem(STORAGE_KEY);
        setActiveRequest(null);
    }, [stopPolling]);

    const startPolling = useCallback((publicId: string, schoolName: string) => {
        const initialRequest = { publicId, schoolName, status: 'Accepted' };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialRequest));
        setActiveRequest(initialRequest);
    }, []);

    useEffect(() => {
        if (!activeRequest || !user?.jwtToken || pollingIntervalRef.current) return;

        pollingIntervalRef.current = setInterval(async () => {
            try {
                const statusData = await getSchoolRequestStatus(activeRequest.publicId, user.jwtToken);

                const updatedRequest = { ...activeRequest, status: statusData.status };
                setActiveRequest(updatedRequest);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRequest));

                if (statusData.status === 'Created' || statusData.status === 'Completed') {
                    // Success!
                    clearRequest();
                    // We might want to trigger a global event or refresh schools here
                    window.dispatchEvent(new CustomEvent('school-created'));
                } else if (statusData.status === 'Failed') {
                    // We can keep it to show error or clear it
                    // Let's clear after some time or let user dismiss
                }
            } catch (err) {
                console.error('Polling error:', err);
            }
        }, 5000);

        return () => stopPolling();
    }, [activeRequest, user?.jwtToken, clearRequest, stopPolling]);

    return {
        activeRequest,
        startPolling,
        clearRequest,
        hasActiveRequest: Boolean(activeRequest),
    };
}
