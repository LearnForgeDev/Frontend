import { describe, expect, it } from 'vitest';
import { AxiosError } from 'axios';
import { formatRequestMeta, formatRequestStatus, getProvisioningError, normalizeProvisioningRequests } from '../../src/Services/Developer/DeveloperRequestsPage.utils';

describe('Административные заявки', () => {
  it('читает настоящий контракт backend', () => {
    const [request] = normalizeProvisioningRequests([{
      publicId: 'request-id', requestedSchoolName: 'Школа', requestedByUserName: 'Учитель',
      requestedAtUtc: '2026-10-21T12:00:00Z', status: 'Pending',
    }]);
    expect(request.schoolName).toBe('Школа');
    expect(request.requesterName).toBe('Учитель');
    expect(formatRequestStatus(request.status)).toBe('На рассмотрении');
    expect(formatRequestMeta(request)).toContain('Автор: Учитель');
  });

  it('отличает отсутствие административной сессии от сетевого сбоя', () => {
    for (const status of [401, 403]) {
      const error = new AxiosError();
      error.status = status;
      expect(getProvisioningError(error).requiresLogin).toBe(true);
    }
    expect(getProvisioningError(new Error('network')).requiresLogin).toBe(false);
  });
});
