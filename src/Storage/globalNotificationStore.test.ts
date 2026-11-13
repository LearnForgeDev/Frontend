import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('notification hydration', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.resetModules();
  });

  it('starts empty for deterministic SSR and restores persisted notifications explicitly', async () => {
    localStorage.setItem('high_priority_notifications', JSON.stringify([{ id: 'saved', title: 'Сохранено' }]));
    const { useGlobalNotificationStore, restoreSavedNotifications } = await import('./globalNotificationStore');
    expect(useGlobalNotificationStore.getState().notifications).toEqual([]);
    restoreSavedNotifications();
    expect(useGlobalNotificationStore.getState().notifications).toEqual([{ id: 'saved', title: 'Сохранено' }]);
  });

  it('does not duplicate notifications or replace newer browser state when restored twice', async () => {
    sessionStorage.setItem('low_med_priority_notifications', JSON.stringify([{ id: 'same', title: 'Ранее' }, { id: 'saved', title: 'Сохранено' }]));
    const { useGlobalNotificationStore, restoreSavedNotifications } = await import('./globalNotificationStore');
    useGlobalNotificationStore.getState().pushNotification({ id: 'same', title: 'Сейчас' });
    restoreSavedNotifications();
    restoreSavedNotifications();
    expect(useGlobalNotificationStore.getState().notifications).toEqual([
      { id: 'saved', title: 'Сохранено' },
      { id: 'same', title: 'Сейчас' },
    ]);
  });
});
