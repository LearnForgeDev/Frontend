import { expect, type Page } from '@playwright/test';
import { API_URL } from './flows.const';
import { createHmac } from 'node:crypto';
import { BASE32_ALPHABET, BASE32_BITS, BYTE_BITS, MILLISECONDS_PER_SECOND, TOTP_COUNTER_BYTES, TOTP_DIGITS, TOTP_OFFSET_MASK, TOTP_PERIOD_SECONDS, TOTP_VALUE_MASK } from './admin.const';

export function createAdminCode() {
  const secret = process.env.CI_ADMIN_TOTP_SECRET;
  if (!secret) throw new Error('Не задан временный ключ изолированного CI');
  const bits = [...secret].map(char => BASE32_ALPHABET.indexOf(char).toString(2).padStart(BASE32_BITS, '0')).join('');
  const bytes = bits.match(new RegExp(`.{${BYTE_BITS}}`, 'g'));
  if (!bytes) throw new Error('Некорректный временный ключ CI');
  const key = Buffer.from(bytes.map(byte => parseInt(byte, 2)));
  const counter = Buffer.alloc(TOTP_COUNTER_BYTES);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / MILLISECONDS_PER_SECOND / TOTP_PERIOD_SECONDS)));
  const hash = createHmac('sha1', key).update(counter).digest();
  const offset = hash[hash.length - 1] & TOTP_OFFSET_MASK;
  const code = (hash.readUInt32BE(offset) & TOTP_VALUE_MASK) % (10 ** TOTP_DIGITS);
  return String(code).padStart(TOTP_DIGITS, '0');
}

export async function loginAdmin(page: Page) {
  const secret = process.env.CI_ADMIN_TOTP_SECRET;
  if (!secret) throw new Error('Не задан CI_ADMIN_TOTP_SECRET для тестового backend');
  const base = process.env.CI_BACKEND_URL ?? API_URL;
  const form = await page.request.get(`${base}/SoftAdmin/Login`);
  expect(form.ok()).toBe(true);
  const token = (await form.text()).match(/name="__RequestVerificationToken"[^>]*value="([^"]+)"/)?.[1];
  expect(token).toBeTruthy();
  const response = await page.request.post(`${base}/SoftAdmin/Login`, {
    form: { Code: createAdminCode(), __RequestVerificationToken: token! }, maxRedirects: 0,
  });
  expect(response.status()).toBe(302);
  expect((await page.request.get('/api/ApiSchool/provisioning-requests')).ok()).toBe(true);
}
