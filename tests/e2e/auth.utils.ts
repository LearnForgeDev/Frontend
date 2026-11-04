import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { CI_PASSWORD, SCHOOL_ID } from './core.const';
import type { TestIdentity } from './flows.types';

async function storeIdentity(page: Page, identity: TestIdentity, school: string) {
  const claims = JSON.parse(Buffer.from(identity.jwtToken.split('.')[1], 'base64url').toString());
  await page.evaluate(({ identity, exp, school }) => {
    localStorage.setItem('user_identity', JSON.stringify({ ...identity, exp, activeSchoolPublicId: school }));
  }, { identity, exp: claims.exp * 1000, school });
  return identity;
}

export async function login(page: Page, role = 'owner', school = SCHOOL_ID) {
  await page.goto('/auth/login');
  const response = await page.request.post('/api/ApiAuth/login', {
    data: { name: `ci-${role}`, password: CI_PASSWORD },
  });
  expect(response.ok(), await response.text()).toBe(true);
  return storeIdentity(page, await response.json(), school);
}

export async function register(page: Page) {
  await page.goto('/auth/register');
  const name = `ci-flow-${crypto.randomUUID()}`;
  const response = await page.request.post('/api/ApiAuth/reg', {
    data: { name, password: CI_PASSWORD, confirmPassword: CI_PASSWORD },
  });
  expect(response.ok()).toBe(true);
  return storeIdentity(page, await response.json(), '');
}

export async function expireStoredJwt(page: Page, refreshToken?: string) {
  await page.evaluate((replacementRefreshToken) => {
    const identity: unknown = JSON.parse(localStorage.getItem('user_identity') ?? 'null');
    if (!identity || typeof identity !== 'object' || !('jwtToken' in identity) || typeof identity.jwtToken !== 'string') {
      throw new Error('Expected a stored test session');
    }
    const parts = identity.jwtToken.split('.');
    const claims: unknown = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!claims || typeof claims !== 'object') throw new Error('Expected JWT claims');
    parts[1] = btoa(JSON.stringify({ ...claims, exp: 1 })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    localStorage.setItem('user_identity', JSON.stringify({
      ...identity,
      jwtToken: parts.join('.'),
      exp: Date.now() + 60_000,
      ...(replacementRefreshToken ? { refreshToken: replacementRefreshToken } : {}),
    }));
  }, refreshToken);
}
