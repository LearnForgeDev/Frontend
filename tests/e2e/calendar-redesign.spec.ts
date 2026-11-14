import { devices } from '@playwright/test';
import type { Locator, Page, TestInfo } from '@playwright/test';
import { test, expect } from './fixtures';
import type { Actor, TestEvent } from './flows.types';
import { createEvent, uniqueName } from './flows.utils';
import { SCHOOL_PATH } from './core.const';

async function createCalendarWeek(actor: Actor) {
  await actor.page.clock.setFixedTime(new Date());
  const week = await actor.page.evaluate(() => {
    const today = new Date();
    const todayIndex = (today.getDay() + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - todayIndex);
    const days = Array.from({ length: 7 }, (_, index) => {
      const start = new Date(monday);
      start.setDate(monday.getDate() + index);
      start.setHours(index === 0 ? 6 : index === 6 ? 22 : 9 + index, 0, 0, 0);
      return {
        startUtc: start.toISOString(),
        endUtc: new Date(start.getTime() + 45 * 60000).toISOString(),
        label: start.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
        slotDate: `${start.getFullYear()}-${start.getMonth() + 1}-${start.getDate()}`,
      };
    });
    return { days, todayIndex };
  });
  const events: TestEvent[] = [];
  const titles = ['Раннее занятие', 'Геометрия', 'Разбор задач', 'Повторение', 'Практика', 'Консультация', 'Позднее занятие'];
  for (const [index, day] of week.days.entries()) {
    events.push(await createEvent(actor, {
      title: uniqueName(titles[index]).slice(0, titles[index].length + 9),
      description: 'Описание календарного занятия',
      startUtc: day.startUtc,
      endUtc: day.endUtc,
      attendees: [],
    }));
  }
  return { ...week, events };
}

async function expectControlsToFit(page: Page, width: number) {
  const controls = page.getByRole('group', { name: 'Вид расписания', exact: true });
  for (const name of ['День', 'Неделя', 'События']) {
    const button = controls.getByRole('button', { name, exact: true });
    await expect(button).toBeVisible();
    const bounds = await button.evaluate(element => {
      const textNode = document.createTreeWalker(element, NodeFilter.SHOW_TEXT).nextNode();
      if (!textNode) {
        throw new Error('The calendar view control has no visible label');
      }
      const range = document.createRange();
      range.selectNodeContents(textNode);
      const text = range.getBoundingClientRect();
      const control = element.getBoundingClientRect();
      return { left: control.left, right: control.right, textLeft: text.left, textRight: text.right };
    });
    expect(bounds.left).toBeGreaterThanOrEqual(0);
    expect(bounds.right).toBeLessThanOrEqual(width + 1);
    expect(bounds.textLeft).toBeGreaterThanOrEqual(bounds.left - 1);
    expect(bounds.textRight).toBeLessThanOrEqual(bounds.right + 1);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

async function expectListEvent(calendar: Locator, page: Page, event: TestEvent) {
  const item = calendar.getByRole('listitem').filter({ has: page.getByRole('heading', { name: event.title, exact: true }) });
  await expect(item).toBeVisible();
  return item;
}

async function capture(page: Page, testInfo: TestInfo, name: string) {
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await testInfo.attach(name, {
    body: await page.screenshot({ path: testInfo.outputPath(`${name}.png`), fullPage: true, animations: 'disabled' }),
    contentType: 'image/png',
  });
}

for (const width of [320, 444]) {
  test(`SCHEDULE-15: ${width}px сохраняет все дни недели, подписи и детали занятия`, async ({ actors }, testInfo) => {
    const actor = await actors('teacher', { ...devices['Pixel 5'], viewport: { width, height: 900 } });
    const week = await createCalendarWeek(actor);
    const { page } = actor;
    await page.goto(`${SCHOOL_PATH}/schedule`);
    const controls = page.getByRole('group', { name: 'Вид расписания', exact: true });
    const calendar = page.getByTestId('schedule-calendar');
    await expect(controls.getByRole('button', { name: 'День', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expectControlsToFit(page, width);
    await expectListEvent(calendar, page, week.events[week.todayIndex]);
    await capture(page, testInfo, `calendar-${width}-day`);

    for (const view of ['Неделя', 'События']) {
      await controls.getByRole('button', { name: view, exact: true }).click();
      if (view === 'Неделя') {
        await expect(calendar.getByRole('region')).toHaveCount(7);
        expect(await calendar.getByRole('region').evaluateAll(groups => groups.map(group => group.getAttribute('aria-label')))).toEqual(week.days.map(day => day.label));
        for (const [index, day] of week.days.entries()) {
          const group = calendar.getByRole('region', { name: day.label, exact: true });
          await group.scrollIntoViewIfNeeded();
          await expect(group).toBeVisible();
          await expect(group.getByRole('heading', { name: week.events[index].title, exact: true })).toBeVisible();
          const bounds = await group.boundingBox();
          expect(bounds).not.toBeNull();
          expect(bounds!.x).toBeGreaterThanOrEqual(0);
          expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
        }
      } else {
        for (const event of week.events) {
          await expectListEvent(calendar, page, event);
        }
      }
      await controls.scrollIntoViewIfNeeded();
      await expectControlsToFit(page, width);
      await capture(page, testInfo, `calendar-${width}-${view === 'Неделя' ? 'week' : 'events'}`);
    }

    const late = await expectListEvent(calendar, page, week.events[6]);
    await late.getByRole('button', { name: 'Открыть занятие', exact: true }).click();
    const summary = page.getByTestId('schedule-selected-event');
    await expect(summary).toContainText(week.events[6].title);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await capture(page, testInfo, `calendar-${width}-selected`);
    await summary.getByRole('button', { name: 'Подробнее', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByTestId('schedule-event-title')).toHaveText(week.events[6].title);
    await expect(dialog.getByText('Описание календарного занятия', { exact: true })).toBeVisible();
    await expect(dialog.getByTestId('schedule-event-edit')).toBeVisible();
    await expect(dialog.getByTestId('schedule-event-delete')).toBeVisible();
    await capture(page, testInfo, `calendar-${width}-details`);
    await dialog.getByTestId('schedule-event-close').click();
    await expect(page.getByTestId('schedule-selected-event')).toContainText(week.events[6].title);
    await page.getByTestId('schedule-selected-event').getByRole('button', { name: 'Подробнее', exact: true }).click();
    await expect(page.getByRole('dialog').getByTestId('schedule-event-title')).toHaveText(week.events[6].title);
  });
}

test('SCHEDULE-16: неделя на компьютере сохраняет все 24 часа и открывает ранние и поздние занятия', async ({ actors }, testInfo) => {
  const actor = await actors('teacher', { viewport: { width: 1440, height: 1000 } });
  const week = await createCalendarWeek(actor);
  const { page } = actor;
  await page.goto(`${SCHOOL_PATH}/schedule`);
  const calendar = page.getByTestId('schedule-calendar');
  await page.getByRole('group', { name: 'Вид расписания', exact: true }).getByRole('button', { name: 'Неделя', exact: true }).click();
  await expectControlsToFit(page, 1440);
  await expect(calendar.locator('[data-testid^="schedule-slot-"]')).toHaveCount(7 * 24);
  const expectedSlots = week.days.flatMap(day => Array.from({ length: 24 }, (_, hour) => `schedule-slot-${day.slotDate}-${hour}`));
  expect(await calendar.locator('[data-testid^="schedule-slot-"]').evaluateAll(slots => slots.map(slot => slot.getAttribute('data-testid')))).toEqual(expectedSlots);
  for (const [index, time] of [[0, '06:00'], [6, '22:00']] as const) {
    const event = week.events[index];
    const button = calendar.getByRole('button', { name: new RegExp(`^${event.title} · `) });
    await expect(button).toHaveAccessibleName(new RegExp(time));
    await button.click();
    const summary = page.getByTestId('schedule-selected-event');
    await expect(summary).toContainText(event.title);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await summary.getByRole('button', { name: 'Подробнее', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByTestId('schedule-event-title')).toHaveText(event.title);
    await expect(dialog.getByText('Описание календарного занятия', { exact: true })).toBeVisible();
    await dialog.getByTestId('schedule-event-close').click();
    await expect(page.getByTestId('schedule-selected-event')).toContainText(event.title);
  }
  await calendar.getByTestId(`schedule-slot-${week.days[week.todayIndex].slotDate}-10`).scrollIntoViewIfNeeded();
  await capture(page, testInfo, 'calendar-desktop-week');
  await page.getByRole('group', { name: 'Вид расписания', exact: true }).getByRole('button', { name: 'День', exact: true }).click();
  await expectListEvent(calendar, page, week.events[week.todayIndex]);
  await capture(page, testInfo, 'calendar-desktop-day');
});
