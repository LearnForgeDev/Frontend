import { expect, test as base } from '@playwright/test';

export const test = base.extend<{ productionErrors: void }>({
  productionErrors: [async ({ page }, use) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('requestfailed', (request) => {
      if (['script', 'stylesheet'].includes(request.resourceType())) {
        errors.push(`${request.failure()?.errorText} ${request.url()}`);
      }
    });
    page.on('response', (response) => {
      if (/\.(js|css)(\?|$)/.test(response.url()) && response.status() >= 400) {
        errors.push(`${response.status()} ${response.url()}`);
      }
    });
    await use();
    expect(errors, 'Ошибки production-сборки').toEqual([]);
  }, { auto: true }],
});

export { expect };
