import { describe, it, expect } from 'vitest';
import { appErrorMessage } from '../appErrorMessage';
import type { AppError } from '@/Endpoints/factory';

const err = (code: string, message = ''): AppError => ({ code, message });

describe('appErrorMessage', () => {
  it('maps FORBIDDEN', () => {
    expect(appErrorMessage(err('FORBIDDEN'), 'fb')).toContain('permission');
  });
  it('maps NOT_FOUND', () => {
    expect(appErrorMessage(err('NOT_FOUND'), 'fb')).toContain('no longer exists');
  });
  it('uses the server message when present for unknown codes', () => {
    expect(appErrorMessage(err('UNKNOWN', 'boom'), 'fb')).toBe('boom');
  });
  it('falls back when no message', () => {
    expect(appErrorMessage(err('UNKNOWN'), 'fb')).toBe('fb');
  });
});
