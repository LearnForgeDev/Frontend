import {
  LEGACY_SCHOOL_REQUEST_STORAGE_KEY,
  SCHOOL_REQUEST_STORAGE_KEY,
} from '../onboarding.const';
import type { SchoolRequestPointer } from '../types/onboarding.types';

function isSchoolRequestPointer(value: unknown): value is SchoolRequestPointer {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const pointer = value as Partial<SchoolRequestPointer>;
  return (
    typeof pointer.requestPublicId === 'string' &&
    typeof pointer.schoolName === 'string' &&
    Array.isArray(pointer.knownSchoolPublicIds) &&
    pointer.knownSchoolPublicIds.every((id) => typeof id === 'string')
  );
}

export function readSchoolRequestPointer(): SchoolRequestPointer | null {
  try {
    const storedPointer = localStorage.getItem(SCHOOL_REQUEST_STORAGE_KEY);
    if (storedPointer) {
      const parsedPointer: unknown = JSON.parse(storedPointer);
      return isSchoolRequestPointer(parsedPointer) ? parsedPointer : null;
    }

    const legacyPointer = localStorage.getItem(
      LEGACY_SCHOOL_REQUEST_STORAGE_KEY,
    );
    if (!legacyPointer) {
      return null;
    }

    const parsedLegacyPointer = JSON.parse(legacyPointer) as {
      publicId?: unknown;
      schoolName?: unknown;
    };
    return typeof parsedLegacyPointer.publicId === 'string' &&
      typeof parsedLegacyPointer.schoolName === 'string'
      ? {
          requestPublicId: parsedLegacyPointer.publicId,
          schoolName: parsedLegacyPointer.schoolName,
          knownSchoolPublicIds: [],
        }
      : null;
  } catch {
    return null;
  }
}

export function saveSchoolRequestPointer(pointer: SchoolRequestPointer): void {
  try {
    localStorage.setItem(SCHOOL_REQUEST_STORAGE_KEY, JSON.stringify(pointer));
    localStorage.removeItem(LEGACY_SCHOOL_REQUEST_STORAGE_KEY);
  } catch {
    // The current navigation still works when persistent browser storage is unavailable.
  }
}

export function clearSchoolRequestPointer(requestPublicId?: string): void {
  try {
    if (!requestPublicId) {
      localStorage.removeItem(SCHOOL_REQUEST_STORAGE_KEY);
      localStorage.removeItem(LEGACY_SCHOOL_REQUEST_STORAGE_KEY);
      return;
    }

    const pointer = readSchoolRequestPointer();
    if (pointer?.requestPublicId === requestPublicId) {
      localStorage.removeItem(SCHOOL_REQUEST_STORAGE_KEY);
      localStorage.removeItem(LEGACY_SCHOOL_REQUEST_STORAGE_KEY);
    }
  } catch {
    // There is nothing else to clean up when browser storage is unavailable.
  }
}
