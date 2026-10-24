import { describe, expect, it } from 'vitest';
import { getSchoolCapabilities } from '../../src/Services/AppShell/utils/getSchoolCapabilities';
import { getVisibleNavigationItems } from '../../src/Services/AppShell/utils/getVisibleNavigationItems';
import { validateScheduleEventForm } from '../../src/Services/Scheduling/components/CreateEventModal/CreateEventModal.validation';
import { validateSchoolName } from '../../src/Services/Onboarding/validation/onboarding.validation';
import { splitChatMessageText, parseChatCallInvite } from '../../src/Services/Chat/components/ChatThreadView/ChatThreadView.utils';
import { haveSameNonEmptyIds } from '../../src/Services/Scheduling/utils/audience.utils';
import { persistActiveSchool } from '../../src/Storage/useGlobalContext/useGlobalContext.utils';

describe('Права доступа и формы', () => {
  it('ученик видит школу без преподавательских действий', () => {
    const capabilities = getSchoolCapabilities(['Student']);
    expect(capabilities).toEqual({ canAccessSchool: true, canTeach: false, canManageSchool: false });
    expect(getVisibleNavigationItems(capabilities).some((item) => item.requiredCapability)).toBe(false);
    expect(getSchoolCapabilities([]).canAccessSchool).toBe(false);
  });

  it('преподаватель ведёт занятия, владелец управляет школой', () => {
    expect(getSchoolCapabilities(['Teacher'])).toEqual({ canAccessSchool: true, canTeach: true, canManageSchool: false });
    expect(getSchoolCapabilities(['Owner'])).toEqual({ canAccessSchool: true, canTeach: true, canManageSchool: true });
    expect(getSchoolCapabilities(['Student', 'Teacher']).canTeach).toBe(true);
  });

  it.each([
    { title: ' ', date: '2026-10-18', startTime: '10:00', endTime: '11:00' },
    { title: 'Урок', date: '', startTime: '10:00', endTime: '11:00' },
    { title: 'Урок', date: '2026-10-18', startTime: '', endTime: '11:00' },
    { title: 'Урок', date: '2026-10-18', startTime: '12:00', endTime: '11:00' },
    { title: 'Урок', date: '2026-10-18', startTime: '11:00', endTime: '11:00' },
  ])('отклоняет некорректное занятие %j', (values) => {
    expect(validateScheduleEventForm(values).error).toBeTruthy();
  });

  it('преобразует корректное занятие в UTC', () => {
    const result = validateScheduleEventForm({ title: 'Урок', date: '2026-10-18', startTime: '10:00', endTime: '11:00' });
    expect(result.error).toBeNull();
    expect(new Date(result.endUtc!).getTime() - new Date(result.startUtc!).getTime()).toBe(3_600_000);
  });

  it('проверяет название школы', () => {
    expect(validateSchoolName('  Школа  ')).toEqual({ value: 'Школа', error: null });
    expect(validateSchoolName(' ').error).toBeTruthy();
  });

  it('изменение школы сохраняет токены сессии', () => {
    localStorage.setItem('user_identity', JSON.stringify({ jwtToken: 'jwt', refreshToken: 'refresh', exp: 123 }));
    persistActiveSchool({ userPublicId: 'user', userName: 'Ученик', roles: [], activeSchoolPublicId: 'school' });
    expect(JSON.parse(localStorage.getItem('user_identity')!)).toMatchObject({ jwtToken: 'jwt', refreshToken: 'refresh', exp: 123, activeSchoolPublicId: 'school' });
    localStorage.clear();
  });
});

describe('Чаты и участники', () => {
  it('разделяет текст и ссылки без потери содержимого', () => {
    const text = 'Материал https://example.com/lesson и https://example.org';
    const parts = splitChatMessageText(text);
    expect(parts.map((part) => part.value).join('')).toBe(text);
    expect(parts.filter((part) => part.type === 'link')).toHaveLength(2);
  });

  it('распознаёт приглашение в звонок', () => {
    expect(parseChatCallInvite('Приглашение в звонок: Алгебра\nhttps://example.com/calls?room=math')).toEqual({ title: 'Алгебра', url: 'https://example.com/calls?room=math' });
    expect(parseChatCallInvite('Обычное сообщение')).toBeNull();
  });

  it('сравнивает участников независимо от порядка и повторов', () => {
    expect(haveSameNonEmptyIds(['a', 'b', 'a'], ['b', 'a'])).toBe(true);
    expect(haveSameNonEmptyIds(['a'], ['b'])).toBe(false);
    expect(haveSameNonEmptyIds([], [])).toBe(false);
  });
});
