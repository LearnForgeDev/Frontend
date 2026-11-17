import { expect, test } from '@playwright/test';
import { openProfile } from './navigation.utils';

for (const layout of ['desktop', 'mobile', 'onboarding']) {
  test(`profile navigation waits for the ${layout} controls to mount`, { tag: '@public' }, async ({ page }) => {
    await page.setContent('<main></main>');
    const opening = openProfile(page);
    await page.evaluate(layout => {
      const addProfile = () => {
        const profile = document.createElement('button');
        profile.dataset.testid = 'profile-open';
        profile.textContent = 'Открыть профиль';
        profile.onclick = () => document.body.setAttribute('data-profile-opened', 'true');
        document.body.append(profile);
      };
      if (layout === 'mobile') {
        const more = document.createElement('button');
        more.dataset.testid = 'nav-mobile-more';
        more.textContent = 'Ещё';
        more.onclick = () => queueMicrotask(addProfile);
        document.body.append(more);
      } else {
        addProfile();
      }
    }, layout);
    await opening;
    await expect(page.locator('body')).toHaveAttribute('data-profile-opened', 'true');
  });
}
