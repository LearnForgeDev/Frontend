import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearSchoolRequestPointer, readSchoolRequestPointer, saveSchoolRequestPointer } from './schoolRequestStorage.utils';
import { SCHOOL_REQUEST_STORAGE_KEY } from '../onboarding.const';

const pointer = { requestPublicId: 'request-a', schoolName: 'Школа A', knownSchoolPublicIds: [] };

afterEach(() => localStorage.clear());

describe('Заявки отдельных аккаунтов', () => {
  it('не передаёт заявку другому аккаунту и восстанавливает её у владельца', () => {
    saveSchoolRequestPointer('user-a', pointer);
    expect(readSchoolRequestPointer('user-b')).toBeNull();
    expect(readSchoolRequestPointer()).toBeNull();
    expect(readSchoolRequestPointer('user-a')).toEqual(pointer);
  });

  it('не наследует старые записи без владельца', () => {
    localStorage.setItem(SCHOOL_REQUEST_STORAGE_KEY, JSON.stringify(pointer));
    localStorage.setItem('activeSchoolRequest', JSON.stringify({ publicId: pointer.requestPublicId, schoolName: pointer.schoolName }));
    expect(readSchoolRequestPointer('user-a')).toBeNull();
    expect(readSchoolRequestPointer('user-b')).toBeNull();
  });

  it('удаляет только нужную заявку текущего аккаунта', () => {
    saveSchoolRequestPointer('user-a', pointer);
    saveSchoolRequestPointer('user-b', { ...pointer, requestPublicId: 'request-b' });
    clearSchoolRequestPointer('user-a', 'request-b');
    expect(readSchoolRequestPointer('user-a')).toEqual(pointer);
    clearSchoolRequestPointer('user-b', 'request-b');
    expect(readSchoolRequestPointer('user-b')).toBeNull();
    expect(readSchoolRequestPointer('user-a')).toEqual(pointer);
  });

  it('переживает повреждённое или недоступное хранилище', () => {
    localStorage.setItem(`${SCHOOL_REQUEST_STORAGE_KEY}:user-a`, '{');
    expect(readSchoolRequestPointer('user-a')).toBeNull();
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new Error('storage unavailable'); });
    expect(() => saveSchoolRequestPointer('user-a', pointer)).not.toThrow();
  });
});
