import type { Page } from '@playwright/test';
import { expect } from './fixtures';
import { CI_PASSWORD, SCHOOL_ID } from './core.const';

export async function login(page: Page, role = 'owner') {
  await page.goto('/auth/login');
  const response = await page.request.post('/api/ApiAuth/login', {
    data: { name: `ci-${role}`, password: CI_PASSWORD },
  });
  expect(response.ok(), await response.text()).toBe(true);
  const identity = await response.json();
  const claims = JSON.parse(Buffer.from(identity.jwtToken.split('.')[1], 'base64url').toString());
  await page.evaluate(({ identity, exp, school }) => {
    localStorage.setItem('user_identity', JSON.stringify({ ...identity, exp, activeSchoolPublicId: school }));
  }, { identity, exp: claims.exp * 1000, school: SCHOOL_ID });
  return identity;
}
