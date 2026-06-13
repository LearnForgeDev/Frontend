/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const SUPPORTED_URL_PROTOCOLS = new Set([
  'http:',
  'https:',
  'mailto:',
  'sms:',
  'tel:',
]);

export function sanitizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    if (!SUPPORTED_URL_PROTOCOLS.has(parsedUrl.protocol)) {
      return 'about:blank';
    }
  } catch {
    return url;
  }
  return url;
}

// Source: https://stackoverflow.com/a/8234912/2013580
const urlRegExp = new RegExp(
  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/,
);
export function validateUrl(url: string): boolean {
  // TODO Fix UI for link insertion; it should never default to an invalid URL such as https://.
  // Maybe show a dialog where they user can type the URL before inserting it.
  return url === 'https://' || urlRegExp.test(url);
}

export function isYoutubeUrl (url: string): boolean {
  const serverName = url.split('/')[2];
  return (
    serverName === 'www.youtube.com'
    || serverName === 'youtu.be'
    || serverName === 'youtube.com'
  )
}

// https://www.youtube.com/shorts/TPVMEVw00xg?feature=share
export function parseYoutubeId (url: string): string | null {
  const serverName = url.split('/')[2];

  if (serverName === 'www.youtube.com' || serverName === 'youtube.com') {
    const urlObj = new URL(url);
    const id = urlObj.searchParams.get('v');
    if (id !== null) return id

    const pathParts = urlObj.pathname.split('/');
    if (pathParts[1] === 'shorts' && pathParts[2]) {
      return pathParts[2].split('?')[0];
    }
  } else if (serverName === 'youtu.be') {
    return url.split('/').pop()?.split('?')[0] || null;
  }
  return null;
}

export function isRutubeUrl (url: string): boolean {
  const serverName = url.split('/')[2];
  return serverName === 'rutube.ru'
}

export function parseRutubeId (url: string): string | null {
  const id = url.split('/')[4];
  if (id) return id;
  return null;
}
