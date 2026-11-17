import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

export async function showProfileAction(page: Page) {
  const action = page.getByTestId('profile-open').filter({ visible: true });
  const more = page.getByTestId('nav-mobile-more').filter({ visible: true });
  await expect(action.or(more).first()).toBeVisible();
  if (await more.isVisible()) {
    if (await more.getAttribute('aria-expanded') !== 'true') {
      await more.click();
    }
    await expect(more).toHaveAttribute('aria-expanded', 'true');
    const mobileAction = page.getByRole('dialog', { name: 'Разделы', exact: true }).getByTestId('profile-open');
    await expect(mobileAction).toBeVisible();
    return mobileAction;
  }
  await expect(action).toBeVisible();
  return action;
}

export async function openProfile(page: Page) {
  await (await showProfileAction(page)).click();
}
