import { test, expect } from './fixtures';
import { SCHOOL_ID, SCHOOL_PATH } from './core.const';

for (const role of ['teacher', 'student']) {
  test(`COURSE-01 COURSE-02 COURSE-14: недоступный API курсов не превращается в пустой каталог для ${role}`, async ({ actors }) => {
    const { page } = await actors(role);
    const load = page.waitForResponse(response => response.url().endsWith(`/ApiCourses/${SCHOOL_ID}`));
    await page.goto(`${SCHOOL_PATH}/courses`);
    const response = await load;
    expect(response.ok()).toBe(false);
    await expect(page.getByRole('heading', { name: 'Курсы сейчас недоступны', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Вам пока не назначены курсы', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Создать курс', exact: true })).toHaveCount(0);
    const retry = page.waitForResponse(item => item.url().endsWith(`/ApiCourses/${SCHOOL_ID}`));
    await page.getByRole('alert').getByRole('button', { name: 'Повторить', exact: true }).click();
    expect((await retry).ok()).toBe(false);
    await expect(page.getByRole('heading', { name: 'Курсы сейчас недоступны', exact: true })).toBeVisible();
  });
}
