import { afterEach, describe, expect, it } from 'vitest';
import { LEGACY_SCHOOL_REQUEST_STORAGE_KEY, SCHOOL_REQUEST_STORAGE_KEY } from '../../src/Services/Onboarding/onboarding.const';
import { readSchoolRequestPointer, saveSchoolRequestPointer } from '../../src/Services/Onboarding/utils/schoolRequestStorage.utils';

const pointer = {
  userPublicId: 'request-owner',
  requestPublicId: 'pending-request',
  schoolName: 'Тестовая школа',
  knownSchoolPublicIds: [],
};

afterEach(() => localStorage.clear());

describe('Заявка текущего аккаунта', () => {
  it('восстанавливает заявку её владельца', () => {
    saveSchoolRequestPointer(pointer);
    expect(readSchoolRequestPointer(pointer.userPublicId)).toEqual(pointer);
  });

  it('не перенаправляет другой аккаунт на чужую заявку', () => {
    saveSchoolRequestPointer(pointer);
    expect(readSchoolRequestPointer('another-account')).toBeNull();
    expect(readSchoolRequestPointer(pointer.userPublicId)).toEqual(pointer);
  });

  it('не доверяет заявке без владельца из старой сборки', () => {
    localStorage.setItem(SCHOOL_REQUEST_STORAGE_KEY, JSON.stringify({
      requestPublicId: pointer.requestPublicId,
      schoolName: pointer.schoolName,
      knownSchoolPublicIds: [],
    }));
    expect(readSchoolRequestPointer(pointer.userPublicId)).toBeNull();
  });

  it('не присваивает текущему аккаунту старую заявку из legacy-хранилища', () => {
    localStorage.setItem(LEGACY_SCHOOL_REQUEST_STORAGE_KEY, JSON.stringify({
      publicId: pointer.requestPublicId, schoolName: pointer.schoolName,
    }));
    expect(readSchoolRequestPointer(pointer.userPublicId)).toBeNull();
  });
});
