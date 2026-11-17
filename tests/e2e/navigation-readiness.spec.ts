import { expect, test } from '@playwright/test';
import { openProfile } from './navigation.utils';

for (const layout of ['desktop', 'mobile', 'onboarding']) {
  test(`profile navigation waits for the ${layout} controls to mount`, { tag: '@public' }, async ({ page }) => {
    await page.setContent('<main></main>');
    const opening = openProfile(page);
    await page.evaluate(layout => {
      const addProfile = (container: HTMLElement = document.body) => {
        const profile = document.createElement('button');
        profile.dataset.testid = 'profile-open';
        profile.textContent = 'Открыть профиль';
        profile.onclick = () => document.body.setAttribute('data-profile-opened', 'true');
        container.append(profile);
      };
      if (layout === 'mobile') {
        const more = document.createElement('button');
        more.dataset.testid = 'nav-mobile-more';
        more.textContent = 'Ещё';
        more.setAttribute('aria-expanded', 'false');
        more.setAttribute('aria-controls', 'mobile-navigation-more-menu');
        more.onclick = () => {
          more.setAttribute('aria-expanded', 'true');
          const drawer = document.createElement('section');
          drawer.id = 'mobile-navigation-more-menu';
          drawer.setAttribute('role', 'dialog');
          drawer.setAttribute('aria-label', 'Разделы');
          document.body.append(drawer);
          queueMicrotask(() => addProfile(drawer));
        };
        document.body.append(more);
      } else {
        addProfile();
      }
    }, layout);
    await opening;
    await expect(page.locator('body')).toHaveAttribute('data-profile-opened', 'true');
  });
}


test('profile navigation reopens More after an exiting drawer detaches its visible profile action', { tag: '@public' }, async ({ page }) => {
  await page.setContent('<button data-testid="nav-mobile-more" aria-expanded="false" aria-controls="mobile-navigation-more-menu">Ещё</button>');
  await page.evaluate(() => {
    const more = document.querySelector<HTMLButtonElement>('[data-testid="nav-mobile-more"]');
    if (!more) {
      throw new Error('Missing More control');
    }
    const backdrop = document.createElement('div');
    backdrop.style.cssText = 'position:fixed;inset:0;z-index:100;';
    const exiting = document.createElement('section');
    exiting.setAttribute('role', 'dialog');
    exiting.setAttribute('aria-label', 'Разделы');
    exiting.style.cssText = 'position:fixed;top:100px;left:0;z-index:101;';
    const staleProfile = document.createElement('button');
    staleProfile.dataset.testid = 'profile-open';
    staleProfile.textContent = 'Открыть профиль';
    staleProfile.onclick = () => document.body.setAttribute('data-profile-opened', 'stale');
    exiting.append(staleProfile);
    document.body.append(backdrop, exiting);
    const exit = staleProfile.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(100px)' }], { duration: 250 });
    void exit.finished.then(() => {
      exiting.remove();
      backdrop.remove();
    });
    more.onclick = () => {
      more.setAttribute('aria-expanded', 'true');
      const drawer = document.createElement('section');
      drawer.id = 'mobile-navigation-more-menu';
      drawer.setAttribute('role', 'dialog');
      drawer.setAttribute('aria-label', 'Разделы');
      const profile = document.createElement('button');
      profile.dataset.testid = 'profile-open';
      profile.textContent = 'Открыть профиль';
      profile.onclick = () => document.body.setAttribute('data-profile-opened', 'fresh');
      drawer.append(profile);
      document.body.append(drawer);
    };
  });
  await openProfile(page);
  await expect(page.locator('body')).toHaveAttribute('data-profile-opened', 'fresh');
  await expect(page.getByTestId('nav-mobile-more')).toHaveAttribute('aria-expanded', 'true');
});
