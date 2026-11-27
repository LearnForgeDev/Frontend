import { test, expect } from './fixtures';
import { SCHOOL_ID, SCHOOL_PATH } from './core.const';
import { uniqueName } from './flows.utils';
import type { ManagedStudentGroup } from '@/Endpoints/students/students.contract.type';

test('a teacher creates a group with a member and sees the membership after reload', async ({ actors }) => {
  const teacher = await actors('teacher');
  const student = await actors('student');
  const { page } = teacher;
  const base = `/api/ApiStudentGroups/${SCHOOL_ID}`;
  const groupName = uniqueName('Учебная группа');
  await page.goto(`${SCHOOL_PATH}/students`);
  await page.getByRole('button', { name: 'Создать группу' }).click();
  const dialog = page.getByRole('dialog', { name: 'Новая группа' });
  await dialog.getByLabel('Название группы').fill(groupName);
  await dialog.getByRole('combobox', { name: 'Участники' }).fill(student.identity.userName);
  await page.getByRole('option', { name: student.identity.userName, exact: true }).click();

  const saved = page.waitForResponse(response => new URL(response.url()).pathname.startsWith(`${base}/`) &&
    response.request().method() === 'POST');
  await dialog.getByRole('button', { name: 'Сохранить' }).click();
  const created = await saved;
  expect(created.ok(), await created.text()).toBe(true);
  const group: ManagedStudentGroup = await created.json();
  teacher.cleanup.push(async () => {
    const path = `${base}/${group.publicId}`;
    expect((await page.request.put(path, { data: { name: groupName, memberPublicIds: [] } })).ok()).toBe(true);
    expect((await page.request.delete(path)).ok()).toBe(true);
  });
  await expect(dialog).toBeHidden();
  await page.reload();
  const studentRow = page.getByRole('row').filter({ hasText: student.identity.userName });
  await expect(studentRow).toContainText(groupName);
  await expect(page.getByRole('button', { name: `Изменить группу ${groupName}` })).toBeVisible();
});
