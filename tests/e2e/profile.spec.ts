import { test, expect } from './fixtures';
import { login } from './auth.utils';
import { PROFILE_LAYOUT_PIXEL_TOLERANCE, PROFILE_LAYOUT_WIDTHS, PROFILE_MOBILE_VIEWPORT, PROFILE_STACK_MAX_WIDTH_PX } from './profile.const';

for (const role of ['owner', 'teacher', 'student']) {
  test(`профиль: добавление школы и права на создание занятия для ${role}`, async ({ page }, testInfo) => {
    await login(page, role, null);
    await page.goto('/app/profile');
    const addSchool = page.getByRole('button', { name: 'Добавить школу', exact: true });
    const createLesson = page.getByRole('button', { name: 'Создать занятие', exact: true });
    await expect(addSchool).toBeVisible();
    await expect(page.getByText('CI School', { exact: true }).last()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Выберите школу' })).toBeVisible();
    if (role === 'student') {
      await expect(createLesson).toHaveCount(0);
    } else {
      await expect(createLesson).toBeVisible();
      if (role === 'teacher') {
        await page.screenshot({ path: testInfo.outputPath('profile-desktop.png'), fullPage: true });
        for (const width of PROFILE_LAYOUT_WIDTHS) {
          await page.setViewportSize({ ...PROFILE_MOBILE_VIEWPORT, width });
          const schoolsCard = page.getByRole('region', { name: 'Мои школы', exact: true });
          const lessonCard = page.getByRole('region', { name: 'Ближайшее занятие', exact: true });
          const schools = await schoolsCard.boundingBox();
          const lesson = await lessonCard.boundingBox();
          expect(schools).not.toBeNull();
          expect(lesson).not.toBeNull();
          expect(Math.abs(schools!.height - lesson!.height)).toBeLessThan(PROFILE_LAYOUT_PIXEL_TOLERANCE);
          for (const card of [schoolsCard, lessonCard]) {
            const item = card.getByRole('listitem').first();
            const icon = await item.locator('svg').first().boundingBox();
            const text = await item.locator('h3, p').first().boundingBox();
            expect(icon).not.toBeNull();
            expect(text).not.toBeNull();
            expect(icon!.x + icon!.width).toBeLessThanOrEqual(text!.x);
          }
          if (width > PROFILE_STACK_MAX_WIDTH_PX) {
            expect(Math.abs(schools!.y - lesson!.y)).toBeLessThan(PROFILE_LAYOUT_PIXEL_TOLERANCE);
            expect(lesson!.x).toBeGreaterThan(schools!.x);
          } else {
            expect(lesson!.y).toBeGreaterThanOrEqual(schools!.y + schools!.height);
          }
        }
        await page.setViewportSize(PROFILE_MOBILE_VIEWPORT);
        await page.screenshot({ path: testInfo.outputPath('profile-mobile.png'), fullPage: true });
      }
      await createLesson.click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(dialog.getByLabel(/^Название/i)).toBeEditable();
      if (role === 'teacher') {
        await page.screenshot({ path: testInfo.outputPath('profile-create-lesson-mobile.png'), fullPage: true });
      }
      await dialog.getByRole('button', { name: 'Отмена', exact: true }).click();
      await expect(dialog).toHaveCount(0);
    }
    await addSchool.click();
    await expect(page).toHaveURL(/\/onboarding$/);
    await expect(page.getByRole('heading', { name: 'Создать школу', exact: true })).toBeVisible();
  });
}
