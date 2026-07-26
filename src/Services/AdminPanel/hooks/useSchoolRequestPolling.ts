import { useCallback, useEffect, useState, useRef } from 'react';
import { authEndpoints } from '@/Endpoints';
import { useUser } from '@/Storage/UserContext/UserContext.tsx';
import { useQueryClient } from '@tanstack/react-query';
import { createDebugger, DebugSeverity } from '@/Assets/debugUtils';
const logger = createDebugger('useSchoolRequestPolling');


const STORAGE_KEY = 'activeSchoolRequest';

export type ActiveSchoolRequest = {
    publicId: string;
    schoolName: string;
    status: string;
};

export function useSchoolRequestPolling() {
    const { user } = useUser();
    const queryClient = useQueryClient();
    const [activeRequest, setActiveRequest] = useState<ActiveSchoolRequest | null>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    });
    const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
                const statusData = await authEndpoints.getSchoolRequestStatus(activeRequest.publicId);

                const updatedRequest = { ...activeRequest, status: statusData.status };
                setActiveRequest(updatedRequest);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRequest));

                if (statusData.status === 'Created' || statusData.status === 'Completed') {
                    // Success!
                    clearRequest();
                    queryClient.invalidateQueries({ queryKey: ['my-schools'] });
                } else if (statusData.status === 'Failed') {
                    // We can keep it to show error or clear it
                    // Let's clear after some time or let user dismiss
                }
            } catch (err) {
                logger.logEventForDebug(DebugSeverity.DANGER, 'Polling error:', err);
            }
        }, 5000);

        return () => stopPolling();
    }, [activeRequest, user?.jwtToken, clearRequest, stopPolling, queryClient]);

    return {
        activeRequest,
        startPolling,
        clearRequest,
        hasActiveRequest: Boolean(activeRequest),
    };
}
