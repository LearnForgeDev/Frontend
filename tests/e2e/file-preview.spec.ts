import { test, expect } from './fixtures';
import { login } from './auth.utils';
import { BACKEND_TIMEOUT_MS, SCHOOL_ID, SCHOOL_PATH } from './core.const';

for (const extension of ['txt', 'png', 'pdf']) {
  test(`предпросмотр ${extension} показывает содержимое или ошибку с повтором`, async ({ page }) => {
    await login(page);
    const fileName = `ci-preview-${Date.now()}.${extension}`;
    await page.goto(`${SCHOOL_PATH}/files`);
    const completed = page.waitForResponse((response) =>
      response.url().includes(`/api/ApiFiles/${SCHOOL_ID}/direct-upload/complete`) && response.request().method() === 'POST');
    await page.getByTestId('files-input').setInputFiles({
      name: fileName, mimeType: 'application/octet-stream', buffer: Buffer.from('Текст для предпросмотра'),
    });
    expect((await completed).ok()).toBe(true);
    await page.getByPlaceholder('Поиск файлов...').fill(fileName);
    await expect(page.getByText(fileName, { exact: true }).first()).toBeVisible({ timeout: BACKEND_TIMEOUT_MS });
    const list = await page.request.get(`/api/ApiFiles/${SCHOOL_ID}`);
    const uploaded = (await list.json()).find((file: { fileName: string }) => file.fileName === fileName);
    expect(uploaded).toBeTruthy();
    try {
      await page.getByTestId('file-preview').click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      if (extension === 'txt') {
        await expect(dialog.getByText('Текст для предпросмотра', { exact: true })).toBeVisible();
        await dialog.getByRole('button', { name: 'Закрыть', exact: true }).click();
        await page.getByTestId('file-preview').click();
        await expect(dialog.getByText('Текст для предпросмотра', { exact: true })).toBeVisible();
      } else {
        await expect(dialog.getByRole('alert')).toHaveText('Не удалось открыть файл.');
        const retried = page.waitForResponse((response) =>
          response.url().includes(`/api/ApiFiles/${SCHOOL_ID}/${uploaded.publicId}/content`));
        await dialog.getByRole('button', { name: 'Повторить', exact: true }).click();
        expect((await retried).ok()).toBe(true);
        await expect(dialog.getByRole('alert')).toHaveText('Не удалось открыть файл.');
      }
      await dialog.getByRole('button', { name: 'Закрыть', exact: true }).click();
      await expect(dialog).toHaveCount(0);
    } finally {
      expect((await page.request.delete(`/api/ApiFiles/${SCHOOL_ID}/${uploaded.publicId}`)).ok()).toBe(true);
    }
  });
}
