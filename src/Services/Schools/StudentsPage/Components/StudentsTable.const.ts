export const FALLBACK_STUDENT_NAME = 'Ученик';
export const STUDENT_NAME_KEYS = [
  'name',
  'userName',
  'username',
  'fullName',
  'displayName',
  'studentName',
  'login',
  'userLogin',
] as const;
export const STUDENT_IDENTITY_KEYS = ['user', 'identity', 'profile', 'student', 'account'] as const;
export const STUDENT_FIRST_NAME_KEYS = ['firstName', 'givenName'] as const;
export const STUDENT_LAST_NAME_KEYS = ['lastName', 'surname', 'familyName'] as const;
export const MAX_STUDENT_DATA_DEPTH = 3;
export const INITIALS_LENGTH = 2;
