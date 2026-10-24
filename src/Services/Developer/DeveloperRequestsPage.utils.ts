import type { ProvisioningRequest } from './DeveloperRequestsPage.types';
import { isAxiosError } from 'axios';
import config from '@/config';
import { ADMIN_FORBIDDEN_STATUS, ADMIN_LOGIN_PATH, ADMIN_UNAUTHORIZED_STATUS, REQUEST_STATUS_LABELS } from './DeveloperRequestsPage.const';

function readString(record: Record<string, unknown>, keys: string[]) {
  const value = keys.map((key) => record[key]).find((item) => typeof item === 'string');
  return typeof value === 'string' ? value : undefined;
}

export function normalizeProvisioningRequests(data: unknown[]): ProvisioningRequest[] {
  return data.flatMap((item) => {
    if (!item || typeof item !== 'object') {
      return [];
    }

    const record = item as Record<string, unknown>;
    const publicId = readString(record, ['publicId', 'requestPublicId', 'id']);
    if (!publicId) {
      return [];
    }

    return [{
      publicId,
      schoolName: readString(record, ['requestedSchoolName', 'schoolName', 'name']) ?? 'Школа без названия',
      status: readString(record, ['status']) ?? 'Неизвестно',
      requestedAt: readString(record, ['requestedAtUtc', 'requestedAt', 'createdAt']),
      requesterName: readString(record, ['requestedByUserName', 'requesterName', 'userName']),
    }];
  });
}

export function getAdminLoginUrl() {
  return `${config.endpointUrl.replace(/\/$/, '')}${ADMIN_LOGIN_PATH}`;
}

export function getProvisioningError(error: unknown) {
  const status = isAxiosError(error) ? error.response?.status ?? error.status : undefined;
  const requiresLogin = status === ADMIN_UNAUTHORIZED_STATUS || status === ADMIN_FORBIDDEN_STATUS;
  return {
    requiresLogin,
    message: requiresLogin
      ? 'Войдите как администратор, чтобы просмотреть заявки.'
      : 'Не удалось загрузить заявки. Попробуйте ещё раз.',
  };
}

export function formatRequestStatus(status: string) {
  return REQUEST_STATUS_LABELS[status] ?? 'Неизвестный статус';
}

export function formatRequestMeta(request: ProvisioningRequest) {
  const date = request.requestedAt ? new Date(request.requestedAt) : undefined;
  const requestedAt = date && Number.isFinite(date.getTime()) ? date.toLocaleString('ru-RU') : request.publicId;
  return [request.requesterName ? `Автор: ${request.requesterName}` : undefined, requestedAt].filter(Boolean).join(' · ');
}
