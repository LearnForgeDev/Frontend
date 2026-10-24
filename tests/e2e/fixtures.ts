import { expect, test as base, type BrowserContext } from '@playwright/test';
import { login, register } from './auth.utils';
import { BASE_URL } from './flows.const';
import type { Actor, CreateActor } from './flows.types';

function watchProduction(context: BrowserContext) {
  const errors: string[] = [];
  const attach = (page: import('@playwright/test').Page) => {
    page.on('pageerror', error => errors.push(error.message));
    page.on('requestfailed', request => {
      if (request.url().startsWith(BASE_URL + '/') && ['script', 'stylesheet'].includes(request.resourceType())) errors.push(`${request.failure()?.errorText} ${request.url()}`);
    });
    page.on('response', response => {
      if (response.url().startsWith(BASE_URL + '/') && /\.(js|css)(\?|$)/.test(response.url()) && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    });
  };
  context.pages().forEach(attach);
  context.on('page', attach);
  return errors;
}

export const test = base.extend<{ productionErrors: void; actors: CreateActor }>({
  actors: async ({ browser }, provideActors, testInfo) => {
    const actors: Array<{ actor: Actor; errors: string[] }> = [];
    await provideActors(async (role = 'owner', options = {}) => {
      const context = await browser.newContext({ baseURL: BASE_URL, locale: 'ru-RU', timezoneId: 'Europe/Moscow', ...options });
      try {
        const errors = watchProduction(context);
        const page = await context.newPage();
        const actor: Actor = { context, page, identity: role === 'new' ? await register(page) : await login(page, role), cleanup: [] };
        actors.push({ actor, errors });
        return actor;
      } catch (error) {
        await context.close();
        throw error;
      }
    });
    const failures: unknown[] = [];
    for (const { actor, errors } of actors.reverse()) {
      const failed = testInfo.status !== testInfo.expectedStatus;
      try {
        if (failed && !actor.page.isClosed()) {
          await testInfo.attach(`Страница ${actor.identity.userName}`, { body: await actor.page.screenshot({ fullPage: true }), contentType: 'image/png' });
        }
      } catch (error) {
        failures.push(error);
      }
      for (const cleanup of actor.cleanup.reverse()) {
        try { await cleanup(); } catch (error) { failures.push(error); }
      }
      try {
        expect(errors, 'Ошибки production-сборки участника').toEqual([]);
      } catch (error) {
        failures.push(error);
      }
      try {
        await actor.context.close();
      } catch (error) {
        failures.push(error);
      }
    }
    expect(failures.map(String), 'Ошибки проверки или очистки участников').toEqual([]);
  },
  productionErrors: [async ({ context }, provideErrors) => {
    const errors = watchProduction(context);
    await provideErrors();
    expect(errors, 'Ошибки production-сборки').toEqual([]);
  }, { auto: true }],
});

export { expect };
