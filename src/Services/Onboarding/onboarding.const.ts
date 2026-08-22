export const SCHOOL_REQUEST_STORAGE_KEY = 'learnforge.active-school-request';
export const LEGACY_SCHOOL_REQUEST_STORAGE_KEY = 'activeSchoolRequest';
export const SCHOOL_REQUEST_POLLING_INTERVAL_MS = 5_000;
export const SCHOOLS_POLLING_INTERVAL_MS = 2_000;
export const APPROVAL_REDIRECT_DELAY_MS = 1_000;

export const SCHOOL_REQUEST_PENDING_STATUSES = new Set([
  'Accepted',
  'Pending',
  'Processing',
]);

export const SCHOOL_REQUEST_APPROVED_STATUSES = new Set([
  'Approved',
  'Completed',
  'Created',
]);

export const SCHOOL_REQUEST_REJECTED_STATUSES = new Set([
  'Failed',
  'Rejected',
]);
