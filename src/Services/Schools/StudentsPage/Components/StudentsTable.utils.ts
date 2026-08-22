import type { StudentDto } from '@/Endpoints';
import {
  FALLBACK_STUDENT_NAME,
  INITIALS_LENGTH,
  MAX_STUDENT_DATA_DEPTH,
  STUDENT_FIRST_NAME_KEYS,
  STUDENT_IDENTITY_KEYS,
  STUDENT_LAST_NAME_KEYS,
  STUDENT_NAME_KEYS,
} from './StudentsTable.const';

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const readString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  return value.trim() || undefined;
};

const findNameField = (record: Record<string, unknown>): string | undefined => {
  const entries = Object.entries(record);

  for (const candidateKey of STUDENT_NAME_KEYS) {
    const entry = entries.find(([key]) => key.toLowerCase() === candidateKey.toLowerCase());
    const value = readString(entry?.[1]);
    if (value) {
      return value;
    }
  }

  const readEntryByKeys = (keys: readonly string[]): string | undefined => {
    for (const candidateKey of keys) {
      const entry = entries.find(([key]) => key.toLowerCase() === candidateKey.toLowerCase());
      const value = readString(entry?.[1]);
      if (value) {
        return value;
      }
    }
    return undefined;
  };

  const firstName = readEntryByKeys(STUDENT_FIRST_NAME_KEYS);
  const lastName = readEntryByKeys(STUDENT_LAST_NAME_KEYS);
  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  if (fullName) {
    return fullName;
  }

  return undefined;
};

const findNestedStudentName = (
  record: Record<string, unknown>,
  depth = 0,
): string | undefined => {
  const directName = findNameField(record);
  if (directName || depth >= MAX_STUDENT_DATA_DEPTH) {
    return directName;
  }

  for (const identityKey of STUDENT_IDENTITY_KEYS) {
    const nestedEntry = Object.entries(record).find(
      ([key]) => key.toLowerCase() === identityKey.toLowerCase(),
    );
    if (isRecord(nestedEntry?.[1])) {
      const nestedName = findNestedStudentName(nestedEntry[1], depth + 1);
      if (nestedName) {
        return nestedName;
      }
    }
  }

  for (const value of Object.values(record)) {
    if (isRecord(value)) {
      const nestedName = findNestedStudentName(value, depth + 1);
      if (nestedName) {
        return nestedName;
      }
    }
  }

  return undefined;
};

export const getStudentDisplayName = (student: StudentDto): string => (
  findNestedStudentName(student)
  || student.email?.trim()
  || FALLBACK_STUDENT_NAME
);

export const getStudentInitials = (displayName: string): string => (
  displayName.slice(0, INITIALS_LENGTH).toUpperCase()
);

export const getStudentPublicId = (student: StudentDto): string | undefined => (
  student.publicId || student.userPublicId
);
