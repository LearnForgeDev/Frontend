export const ADMIN_LOGIN_PATH = '/SoftAdmin/Login?returnUrl=%2Fdeveloper';
export const REQUESTS_QUERY_KEY = ['developer', 'school-provisioning-requests'];
export const ADMIN_UNAUTHORIZED_STATUS = 401;
export const ADMIN_FORBIDDEN_STATUS = 403;
export const ADMIN_LOADING_SIZE = 32;
export const REQUEST_STATUS_LABELS: Record<string, string> = {
  Pending: 'На рассмотрении',
  Approved: 'Одобрена',
  Rejected: 'Отклонена',
};
