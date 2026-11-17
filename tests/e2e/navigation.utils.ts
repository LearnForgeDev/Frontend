import type { Page } from '@playwright/test';

export async function showProfileAction(page: Page) {
  const action = page.getByTestId('profile-open').filter({ visible: true });
  if (!await action.isVisible()) {
    await page.getByTestId('nav-mobile-more').click();
  }
  return action;
}

export async function openProfile(page: Page) {
  await (await showProfileAction(page)).click();
}
