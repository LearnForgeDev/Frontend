import { SCHOOL_ID, SCHOOL_PATH } from './core.const';

const INVALID_REFRESH_TOKEN = 'ci-invalid-refresh-token';
const EXPIRED_TOKEN_SECONDS = 1;
const FUTURE_TOKEN_SECONDS = 4_102_444_800;

function createIdentity(exp: number) {
  const claims = Buffer.from(JSON.stringify({ exp, userId: SCHOOL_ID })).toString('base64url');
  return JSON.stringify({
    userPublicId: SCHOOL_ID,
    userName: 'Несуществующий пользователь',
    jwtToken: `eyJhbGciOiJIUzI1NiJ9.${claims}.invalid-signature`,
    refreshToken: INVALID_REFRESH_TOKEN,
    exp: exp * 1000,
    userRoles: [],
    activeSchoolPublicId: SCHOOL_ID,
  });
}

export const INVALID_SESSION_CASES = [
  { name: 'повреждённый JSON', identity: '{invalid-json', requiresBackend: false },
  {
    name: 'пользователь без токенов',
    requiresBackend: false,
    identity: JSON.stringify({ userPublicId: SCHOOL_ID, userName: 'Несуществующий пользователь' }),
  },
  { name: 'поддельный JWT с будущим сроком', identity: createIdentity(FUTURE_TOKEN_SECONDS), requiresBackend: true },
  { name: 'просроченный JWT', identity: createIdentity(EXPIRED_TOKEN_SECONDS), requiresBackend: true },
];

export const SESSION_ENTRY_ROUTES = ['/', `${SCHOOL_PATH}/lessons`];
export const PROTECTED_UI_SELECTOR = 'nav[aria-label="Разделы школы"], .editor-input';
export const PROTECTED_UI_MARKER = 'ci-protected-ui-mounted';
