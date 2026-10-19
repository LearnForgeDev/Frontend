import { expect, test } from './fixtures';
import {
  INVALID_SESSION_CASES,
  PROTECTED_UI_MARKER,
  PROTECTED_UI_SELECTOR,
  SESSION_ENTRY_ROUTES,
} from './session.const';

for (const { name, identity, requiresBackend } of INVALID_SESSION_CASES) {
  for (const route of SESSION_ENTRY_ROUTES) {
    test(`${name}: вход через ${route} возвращает на страницу входа`, { tag: requiresBackend ? '@backend' : '@public' }, async ({ page }) => {
      await page.addInitScript(({ identity, selector, marker }) => {
        localStorage.clear();
        localStorage.setItem('user_identity', identity);
        sessionStorage.removeItem(marker);
        new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
              if (node instanceof Element && (node.matches(selector) || node.querySelector(selector))) {
                sessionStorage.setItem(marker, 'true');
              }
            }
          }
        }).observe(document, { childList: true, subtree: true });
      }, { identity, selector: PROTECTED_UI_SELECTOR, marker: PROTECTED_UI_MARKER });

      await page.goto(route);

      await expect(page).toHaveURL(/\/auth\/login$/);
      await expect(page.getByLabel(/^Имя/i)).toBeVisible();
      await expect(page.getByRole('button', { name: 'Войти', exact: true })).toBeVisible();
      await expect(page.locator(PROTECTED_UI_SELECTOR)).toHaveCount(0);
      expect(await page.evaluate(() => localStorage.getItem('user_identity'))).toBeNull();
      expect(await page.evaluate((marker) => sessionStorage.getItem(marker), PROTECTED_UI_MARKER)).toBeNull();
    });
  }
}
