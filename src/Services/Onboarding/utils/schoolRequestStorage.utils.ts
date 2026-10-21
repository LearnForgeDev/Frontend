import { SCHOOL_REQUEST_STORAGE_KEY } from '../onboarding.const';
import type { SchoolRequestPointer } from '../types/onboarding.types';

function isSchoolRequestPointer(value: unknown): value is SchoolRequestPointer {
  if (!value || typeof value !== 'object') return false;
  const pointer = value as Partial<SchoolRequestPointer>;
  return typeof pointer.requestPublicId === 'string' &&
    typeof pointer.schoolName === 'string' &&
    Array.isArray(pointer.knownSchoolPublicIds) &&
    pointer.knownSchoolPublicIds.every((id) => typeof id === 'string');
}

function getStorageKey(userPublicId: string): string {
  return `${SCHOOL_REQUEST_STORAGE_KEY}:${userPublicId}`;
}

export function readSchoolRequestPointer(userPublicId?: string): SchoolRequestPointer | null {
  if (!userPublicId) return null;
  try {
    const stored = localStorage.getItem(getStorageKey(userPublicId));
    const pointer: unknown = stored ? JSON.parse(stored) : null;
    return isSchoolRequestPointer(pointer) ? pointer : null;
  } catch {
    return null;
  }
}

export function saveSchoolRequestPointer(userPublicId: string, pointer: SchoolRequestPointer): void {
  if (!userPublicId) return;
  try {
    localStorage.setItem(getStorageKey(userPublicId), JSON.stringify(pointer));
  } catch {
    return;
  }
}

export function clearSchoolRequestPointer(userPublicId?: string, requestPublicId?: string): void {
  if (!userPublicId) return;
  try {
    const pointer = readSchoolRequestPointer(userPublicId);
    if (!requestPublicId || pointer?.requestPublicId === requestPublicId) {
      localStorage.removeItem(getStorageKey(userPublicId));
    }
  } catch {
    return;
  }
}
