import { afterEach, describe, expect, it } from 'vitest';
import { LEGACY_SCHOOL_REQUEST_STORAGE_KEY, SCHOOL_REQUEST_STORAGE_KEY } from '../../src/Services/Onboarding/onboarding.const';
import { clearSchoolRequestPointer, readSchoolRequestPointer, saveSchoolRequestPointer } from '../../src/Services/Onboarding/utils/schoolRequestStorage.utils';

const pointer = {
  userPublicId: 'request-owner',
  requestPublicId: 'pending-request',
  schoolName: 'Тестовая школа',
  knownSchoolPublicIds: [],
};

afterEach(() => localStorage.clear());

describe('Заявка текущего аккаунта', () => {
  it('восстанавливает заявку её владельца', () => {
    saveSchoolRequestPointer(pointer.userPublicId, pointer);
    expect(readSchoolRequestPointer(pointer.userPublicId)).toEqual(pointer);
  });

  it('не перенаправляет другой аккаунт на чужую заявку', () => {
    saveSchoolRequestPointer(pointer.userPublicId, pointer);
    expect(readSchoolRequestPointer('another-account')).toBeNull();
    expect(readSchoolRequestPointer(pointer.userPublicId)).toEqual(pointer);
  });

  it('переносит заявку владельца из предыдущей сборки и не восстанавливает её после удаления', () => {
    localStorage.setItem(SCHOOL_REQUEST_STORAGE_KEY, JSON.stringify(pointer));
    expect(readSchoolRequestPointer('another-account')).toBeNull();
    expect(readSchoolRequestPointer(pointer.userPublicId)).toEqual(pointer);
    expect(localStorage.getItem(SCHOOL_REQUEST_STORAGE_KEY)).toBeNull();
    clearSchoolRequestPointer(pointer.userPublicId, pointer.requestPublicId);
    expect(readSchoolRequestPointer(pointer.userPublicId)).toBeNull();
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
