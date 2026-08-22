import type { ProvisioningRequest } from './DeveloperRequestsPage.types';

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
      schoolName: readString(record, ['schoolName', 'name']) ?? 'Школа без названия',
      status: readString(record, ['status']) ?? 'Неизвестно',
      requestedAt: readString(record, ['requestedAt', 'createdAt']),
      requesterName: readString(record, ['requesterName', 'userName']),
    }];
  });
}
