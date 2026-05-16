import { useCallback, useState } from 'react';

import type { PendingSchoolRequest } from '../types/commonTypes';

const storageKey = 'pendingSchoolRequest';

type PendingSchoolRequestState = PendingSchoolRequest | null;

function readStorage(): PendingSchoolRequestState {
    try {
        const stored = localStorage.getItem(storageKey);
        if (!stored) {
            return null;
        }

        const parsed = JSON.parse(stored) as PendingSchoolRequest;
        if (!parsed?.schoolName || parsed.status !== 'pending') {
            return null;
        }

        return parsed;
    } catch {
        return null;
    }
}

function writeStorage(value: PendingSchoolRequestState) {
    try {
        if (!value) {
            localStorage.removeItem(storageKey);
            return;
        }

        localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
        // Ignore storage errors.
    }
}

export function usePendingSchoolRequest() {
    const [pendingRequest, setPendingRequest] = useState<PendingSchoolRequestState>(() => readStorage());

    const savePendingSchoolRequest = useCallback((schoolName: string) => {
        const nextValue: PendingSchoolRequest = {
            schoolName,
            status: 'pending',
        };

        setPendingRequest(nextValue);
        writeStorage(nextValue);
    }, []);

    const clearPendingSchoolRequest = useCallback(() => {
        setPendingRequest(null);
        writeStorage(null);
    }, []);

    return {
        pendingSchoolName: pendingRequest?.schoolName ?? '',
        hasPendingSchoolRequest: Boolean(pendingRequest?.schoolName),
        savePendingSchoolRequest,
        clearPendingSchoolRequest,
    };
}

